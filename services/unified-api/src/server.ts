/**
 * Unified API Server
 * Main entry point that wires all routes together
 */

import express = require('express');
const { createGovernanceRouter } = require('./routes/governance');
const { createTorqueQueryRouter } = require('./routes/torquequery');
const { createRepomixRouter } = require('./routes/repomix');
const { createVaultRouter } = require('./routes/vault');
const { createGovernanceEvolutionRouter } = require('./routes/governance-evolution');

async function startServer() {
  const app = express();
  const port = process.env.UNIFIED_API_PORT || 3100;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api', createGovernanceRouter());
  app.use('/api', await createTorqueQueryRouter());
  app.use('/api', createRepomixRouter());
  app.use('/api', await createVaultRouter());
  app.use('/api', createGovernanceEvolutionRouter());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling
  app.use(
    (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Error:', err);

      const isServiceUnavailable = ['ECONNREFUSED', 'EHOSTUNREACH', 'ETIMEDOUT', 'ENOTFOUND'].includes(err.code);
      const status = isServiceUnavailable ? 502 : (err.status || 500);

      res.status(status).json({
        error: err.message || (status === 502 ? 'Bad Gateway' : 'Internal Server Error'),
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      });
    }
  );

  // Start server
  app.listen(port, () => {
    console.log(`Unified API listening on port ${port}`);
  });
}

// Start if run directly
if (require.main === module) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export { startServer };
