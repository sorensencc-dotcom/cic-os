/**
 * Vault Routes (M3)
 * Exposes persistent vault and secrets management via HTTP
 *
 * Routes:
 * - POST /vault/records — write a vault record
 * - GET /vault/records/:id — read a vault record
 * - GET /vault/records?kind=X — list records by kind
 * - DELETE /vault/records/:id — delete a record
 * - POST /vault/secrets — write a secret
 * - GET /vault/secrets/:id — read a secret
 * - POST /vault/secrets/:id/rotate — rotate a secret
 * - GET /vault/audit-log — fetch audit log
 */

import { Router, Request, Response, NextFunction } from 'express';
import { VaultServiceClient } from '../clients/VaultServiceClient';

export async function createVaultRouter(): Promise<Router> {
  const router = Router();

  const vaultClient = new VaultServiceClient(process.env.VAULT_URL || 'http://localhost:3111');

  /**
   * POST /vault/records
   * Write a vault record
   *
   * Body: { kind: string, payload: unknown }
   * Response: VaultRecord
   */
  router.post('/vault/records', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { kind, payload } = req.body;
      if (!kind) return res.status(400).json({ error: 'kind required' });

      const record = await vaultClient.writeRecord(kind, payload);
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /vault/records/:id
   * Read a vault record
   *
   * Response: VaultRecord | { error: string }
   */
  router.get('/vault/records/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const record = await vaultClient.readRecord(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'record not found or corrupted' });
      }
      res.json(record);
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /vault/records?kind=X
   * List records by kind
   *
   * Query: kind (required)
   * Response: VaultRecord[]
   */
  router.get('/vault/records', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { kind } = req.query;
      if (!kind) return res.status(400).json({ error: 'kind query param required' });

      const records = await vaultClient.listRecordsByKind(String(kind));
      res.json({ records, count: records.length });
    } catch (err) {
      next(err);
    }
  });

  /**
   * DELETE /vault/records/:id
   * Delete a record
   *
   * Response: { deleted: boolean }
   */
  router.delete(
    '/vault/records/:id',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const deleted = await vaultClient.deleteRecord(req.params.id);
        res.json({ deleted });
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * POST /vault/secrets
   * Write a secret
   *
   * Body: { value: string }
   * Response: { id: string }
   */
  router.post('/vault/secrets', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value } = req.body;
      if (!value) return res.status(400).json({ error: 'value required' });

      const id = await vaultClient.writeSecret(value);
      res.status(201).json({ id });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /vault/secrets/:id
   * Read a secret
   *
   * Response: { value: string } | { error: string }
   */
  router.get('/vault/secrets/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = await vaultClient.readSecret(req.params.id);
      if (value == null) return res.status(404).json({ error: 'secret not found' });
      res.json({ value });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /vault/secrets/:id/rotate
   * Rotate a secret
   *
   * Body: { newValue: string }
   * Response: { rotated: boolean }
   */
  router.post(
    '/vault/secrets/:id/rotate',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { newValue } = req.body;
        if (!newValue) return res.status(400).json({ error: 'newValue required' });

        const rotated = await vaultClient.rotateSecret(req.params.id, newValue);
        if (!rotated) return res.status(404).json({ error: 'secret not found' });

        res.json({ rotated });
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * GET /vault/audit-log
   * Fetch audit log
   *
   * Query: limit (default 100)
   * Response: { log: any[], count: number }
   */
  router.get('/vault/audit-log', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(String(req.query.limit)) || 100;
      const log = await vaultClient.getAuditLog(limit);
      res.json({ log, count: log.length });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
