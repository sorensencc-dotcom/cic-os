// TorqueQuery HTTP Server (Phase 26)

import express from 'express';
import { getTorqueQueryServer } from './server/TorqueQueryServer';

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3110;

  // Middleware
  app.use(express.json());

  // Initialize TorqueQuery
  const torqueQuery = await getTorqueQueryServer();

  // Routes
  app.get('/torquequery/memory/by-type/:type', (req, res) => {
    try {
      const events = torqueQuery.getQueries().byType(req.params.type);
      res.json({ events, count: events.length });
    } catch (err) {
      res.status(500).json({ error: (err as any).message });
    }
  });

  app.get('/torquequery/memory/by-agent/:agentId', (req, res) => {
    try {
      const events = torqueQuery.getQueries().byAgent(req.params.agentId);
      res.json({ events, count: events.length });
    } catch (err) {
      res.status(500).json({ error: (err as any).message });
    }
  });

  app.get('/torquequery/memory/by-correlation/:correlationId', (req, res) => {
    try {
      const events = torqueQuery.getQueries().byCorrelation(req.params.correlationId);
      res.json({ events, count: events.length });
    } catch (err) {
      res.status(500).json({ error: (err as any).message });
    }
  });

  app.get('/torquequery/memory/by-signal/:signalType', (req, res) => {
    try {
      const signals = torqueQuery.getQueries().bySignal(req.params.signalType);
      res.json({ signals, count: signals.length });
    } catch (err) {
      res.status(500).json({ error: (err as any).message });
    }
  });

  app.get('/torquequery/agent/:agentId/timeline', (req, res) => {
    try {
      const timeline = torqueQuery.getQueries().agentTimeline(req.params.agentId);
      res.json({ timeline, count: timeline.length });
    } catch (err) {
      res.status(500).json({ error: (err as any).message });
    }
  });

  app.get('/torquequery/governance/history/:proposalId', (req, res) => {
    try {
      const history = torqueQuery.getQueries().governanceHistory(req.params.proposalId);
      res.json({ history, count: history.length });
    } catch (err) {
      res.status(500).json({ error: (err as any).message });
    }
  });

  // Health check
  app.get('/health', (req, res) => {
    try {
      const healthy = torqueQuery.isHealthy();
      res.json({ status: healthy ? 'ok' : 'unhealthy', timestamp: new Date().toISOString() });
    } catch (err) {
      res.status(503).json({ status: 'error', message: (err as any).message });
    }
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  });

  // Start
  app.listen(port, () => {
    console.log(`TorqueQuery server listening on port ${port}`);
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
