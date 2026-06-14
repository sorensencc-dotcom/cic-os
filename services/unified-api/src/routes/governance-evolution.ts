/**
 * Governance Evolution Routes (Phase 24.2)
 * Exposes autonomous evolution engine via HTTP
 *
 * Routes:
 * - POST /governance/evolution/run — run full evolution cycle
 * - POST /governance/evolution/amendments — generate amendments
 * - POST /governance/evolution/constraints — generate constraint updates
 * - POST /governance/evolution/policies — generate policy updates
 */

import { Router, Request, Response, NextFunction } from 'express';
import { GovernanceEvolutionLoop } from '../../cic-governance/src/services/GovernanceEvolutionLoop';
import { GovernanceAmendmentGenerator } from '../../cic-governance/src/services/GovernanceAmendmentGenerator';
import { GovernanceConstraintUpdater } from '../../cic-governance/src/services/GovernanceConstraintUpdater';
import { GovernancePolicyUpdater } from '../../cic-governance/src/services/GovernancePolicyUpdater';

export function createGovernanceEvolutionRouter(): Router {
  const router = Router();

  const loop = new GovernanceEvolutionLoop();
  const amendmentGen = new GovernanceAmendmentGenerator();
  const constraintGen = new GovernanceConstraintUpdater();
  const policyGen = new GovernancePolicyUpdater();

  /**
   * POST /governance/evolution/run
   * Run full evolution cycle (amendments + constraints + policies)
   *
   * Response: EvolutionPacket[]
   */
  router.post('/governance/evolution/run', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await loop.run();
      res.status(201).json({ results, count: results.length });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /governance/evolution/amendments
   * Generate amendment proposals from drift signals
   *
   * Response: AmendmentPacket
   */
  router.post(
    '/governance/evolution/amendments',
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const packet = await amendmentGen.generate();
        res.status(201).json(packet);
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * POST /governance/evolution/constraints
   * Generate constraint update proposals
   *
   * Response: ConstraintUpdatePacket
   */
  router.post(
    '/governance/evolution/constraints',
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const packet = await constraintGen.generate();
        res.status(201).json(packet);
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * POST /governance/evolution/policies
   * Generate policy change proposals
   *
   * Response: PolicyUpdatePacket
   */
  router.post(
    '/governance/evolution/policies',
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const packet = await policyGen.generate();
        res.status(201).json(packet);
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
