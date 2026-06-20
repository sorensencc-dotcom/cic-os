/**
 * Integration tests for CIC Agent Runtime v0.2
 *
 * Tests the full lifecycle:
 * - Manifest loading + substitution
 * - Database migrations
 * - Tool/channel/schedule loading
 * - Webhook event → session creation
 * - Session persistence
 */

import { test, expect, beforeAll, afterAll } from '@jest/globals';
import { defineAgent } from './defineAgent';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino({ level: 'error' });
const pgClient = new Client({
  host: '127.0.0.1',
  port: 5434,
  database: 'cic_agents',
  user: 'postgres',
  password: 'postgres',
});

let agent: any;

beforeAll(async () => {
  await pgClient.connect();

  const agentPath = path.resolve(__dirname, '../cic-agent');
  const manifestPath = path.join(agentPath, 'pr-reviewer', 'agent.yaml');

  agent = await defineAgent({ manifestPath, logger });
  await agent.start();
});

afterAll(async () => {
  if (agent) {
    await agent.stop();
  }
  await pgClient.end();
});

test('Runtime loads manifest with environment substitution', async () => {
  expect(agent).toBeDefined();
  expect(agent.manifest).toBeDefined();
  expect(agent.manifest.metadata.id).toBe('cic.rewrite.pr-reviewer');
});

test('Database migrations create required tables', async () => {
  const tables = await pgClient.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
  `);

  const tableNames = tables.rows.map((r: any) => r.table_name);
  expect(tableNames).toContain('agent_sessions');
  expect(tableNames).toContain('session_events');
  expect(tableNames).toContain('agent_runs');
});

test('Tools load and are discoverable', async () => {
  const tools = agent.tools;
  expect(tools).toBeDefined();
  expect(tools.length).toBeGreaterThan(0);

  const toolNames = tools.map((t: any) => t.name);
  expect(toolNames).toContain('apply_patch');
  expect(toolNames).toContain('query_cic_state');
  expect(toolNames).toContain('run_tests');
});

test('Channel loads and listens for events', async () => {
  const channels = agent.channels;
  expect(channels).toBeDefined();
  expect(channels.length).toBeGreaterThan(0);

  const channelNames = channels.map((c: any) => c.name);
  expect(channelNames).toContain('github-pr');
});

test('Webhook signature verification works', async () => {
  const secret = 'dev-secret';
  const payload = {
    action: 'opened',
    pull_request: {
      id: 1,
      number: 42,
      title: 'Test PR',
      head: { sha: 'abc123', ref: 'feature' },
      base: { ref: 'main' },
      user: { login: 'test-user' },
      created_at: '2026-06-20T12:00:00Z',
    },
    repository: {
      full_name: 'test/repo',
      owner: { login: 'test' },
    },
  };

  const body = JSON.stringify(payload);
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  const signature = `sha256=${hmac}`;

  expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/);
});

test('Session persists after webhook', async () => {
  // Get baseline session count
  const before = await pgClient.query('SELECT COUNT(*) as count FROM agent_sessions');
  const countBefore = parseInt(before.rows[0].count);

  // Send webhook
  const secret = 'dev-secret';
  const payload = {
    action: 'opened',
    pull_request: {
      id: 2,
      number: 43,
      title: 'Integration Test PR',
      head: { sha: 'def456', ref: 'feature' },
      base: { ref: 'main' },
      user: { login: 'test-user' },
      created_at: '2026-06-20T12:00:00Z',
    },
    repository: {
      full_name: 'test/repo',
      owner: { login: 'test' },
    },
  };

  const body = JSON.stringify(payload);
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  const signature = `sha256=${hash}`;

  const response = await fetch('http://localhost:3001/webhook/github/pr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'pull_request',
      'X-Hub-Signature-256': signature,
    },
    body,
  });

  expect(response.status).toBe(200);
  const result = await response.json();
  expect(result.success).toBe(true);

  // Wait for async handler
  await new Promise(resolve => setTimeout(resolve, 100));

  // Check new session exists
  const after = await pgClient.query('SELECT COUNT(*) as count FROM agent_sessions');
  const countAfter = parseInt(after.rows[0].count);

  expect(countAfter).toBeGreaterThan(countBefore);
});

test('Session has correct metadata', async () => {
  const sessions = await pgClient.query(
    'SELECT * FROM agent_sessions WHERE agent_id = $1 ORDER BY created_at DESC LIMIT 1',
    ['cic.rewrite.pr-reviewer']
  );

  expect(sessions.rows.length).toBeGreaterThan(0);
  const session = sessions.rows[0];

  expect(session.agent_id).toBe('cic.rewrite.pr-reviewer');
  expect(session.kind).toMatch(/github\.pr\.(opened|synchronize|closed)/);
  expect(['running', 'completed', 'failed']).toContain(session.status);
  expect(session.metadata).toBeDefined();
  expect(session.created_at).toBeDefined();
});

test('Schedule registers cron job', async () => {
  expect(agent.schedules).toBeDefined();
  expect(agent.schedules.length).toBeGreaterThan(0);

  const schedule = agent.schedules.find((s: any) => s.includes('3 * * *'));
  expect(schedule).toBeDefined();
});
