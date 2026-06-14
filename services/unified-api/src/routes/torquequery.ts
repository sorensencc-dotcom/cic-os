/**
 * TorqueQuery Routes (Phase 26)
 * Exposes memory indexing & semantic search via HTTP
 *
 * Routes:
 * - GET /torquequery/memory/by-type/:type — find events by type
 * - GET /torquequery/memory/by-agent/:agentId — find events by agent
 * - GET /torquequery/memory/by-correlation/:correlationId — find events by correlation
 * - GET /torquequery/memory/by-signal/:signalType — find signals by type
 * - GET /torquequery/agent/:agentId/timeline — fetch agent timeline
 * - GET /torquequery/governance/history/:proposalId — fetch governance history
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getTorqueQueryServer } from '../../torquequery/src/server/TorqueQueryServer';

export async function createTorqueQueryRouter(): Promise<Router> {
  const router = Router();
  const server = await getTorqueQueryServer();
  const queries = server.getQueries();

  /**
   * GET /torquequery/memory/by-type/:type
   * Find events by type
   */
  router.get(
    '/torquequery/memory/by-type/:type',
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const { type } = req.params;
        const events = queries.byType(type);
        res.json({ events, count: events.length });
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * GET /torquequery/memory/by-agent/:agentId
   * Find events by agent
   */
  router.get(
    '/torquequery/memory/by-agent/:agentId',
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const { agentId } = req.params;
        const events = queries.byAgent(agentId);
        const count = queries.countByAgent(agentId);
        res.json({ events, count });
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * GET /torquequery/memory/by-correlation/:correlationId
   * Find events by correlation
   */
  router.get(
    '/torquequery/memory/by-correlation/:correlationId',
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const { correlationId } = req.params;
        const events = queries.byCorrelation(correlationId);
        res.json({ events, count: events.length });
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * GET /torquequery/memory/by-signal/:signalType
   * Find signals by type
   */
  router.get(
    '/torquequery/memory/by-signal/:signalType',
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const { signalType } = req.params;
        const signals = queries.bySignal(signalType);
        res.json({ signals, count: signals.length });
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * GET /torquequery/agent/:agentId/timeline
   * Fetch agent timeline
   */
  router.get(
    '/torquequery/agent/:agentId/timeline',
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const { agentId } = req.params;
        const timeline = queries.agentTimeline(agentId);
        res.json({ timeline, count: timeline.length });
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * GET /torquequery/governance/history/:proposalId
   * Fetch governance history
   */
  router.get(
    '/torquequery/governance/history/:proposalId',
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const { proposalId } = req.params;
        const history = queries.governanceHistory(proposalId);
        res.json({ history, count: history.length });
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
