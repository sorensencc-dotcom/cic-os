import fs from 'fs-extra';
import path from 'path';

export interface DaemonConfig {
  mailpit: {
    baseUrl: string;
    timeout_ms: number;
    maxConnections: number;
    maxRetries: number;
    retryBackoffMs: number;
    healthCheckIntervalMs: number;
    circuitBreakerThreshold: number;
    circuitBreakerResetMs: number;
    pollIntervalMs: number;
    maxMessagesPerPoll: number;
  };
  validation: {
    requireAttachments: boolean;
    maxAttachments: number;
    maxTotalSizeMb: number;
    maxAttachmentSizeMb: number;
    blockedMimeTypes: string[];
    blockedFilePatterns: string[];
    stagingRoot: string;
  };
  classification: {
    tier1Patterns: string[];
    tier2Patterns: string[];
    tier3Patterns: string[];
  };
  watcher: {
    watchDir: string;
    debounceMs: number;
    enablePolling: boolean;
    pollingIntervalMs: number;
    ignorePatterns: string[];
  };
  routing: {
    tier1: any;
    tier2: any;
    tier3: any;
    unmappedTier: any;
  };
  drive: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    maxConcurrentUploads: number;
    chunkSizeMb: number;
    timeoutMs: number;
  };
  monitoring: {
    checkStuckIntervalMinutes: number;
    stuckThresholdMinutes: number;
    archiveRotationDays: number;
  };
}

export function loadConfig(): DaemonConfig {
  const configPath = process.env.CONFIG_PATH || './config.json';

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const config = fs.readJsonSync(configPath) as DaemonConfig;
  return config;
}
