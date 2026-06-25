/**
 * Bootstrap: CIC MAAL Test Server
 * Minimal HTTP server for MAAL endpoint testing
 * (Does not require agent definitions)
 */

import express from "express";
import pino from "pino";
import { EnrichmentAgent } from "../src/agents/enrichmentAgent.js";
import { OrchestratorAgent } from "../src/agents/orchestratorAgent.js";
import { SynthesisAgent } from "../src/agents/synthesisAgent.js";
import { AuditAgent } from "../src/agents/auditAgent.js";

const app = express();
const port = process.env.PORT || 3000;
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true
    }
  }
});

app.use(express.json());

// Agent instances
const enrichmentAgent = new EnrichmentAgent();
const orchestratorAgent = new OrchestratorAgent();
const synthesisAgent = new SynthesisAgent();
const auditAgent = new AuditAgent();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Enrichment endpoint
app.post("/enrich", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Missing content" });
    }

    const result = await enrichmentAgent.enrich(content);
    res.json({ status: "ok", enriched: result });
  } catch (error: any) {
    logger.error(error, "Enrichment failed");
    res.status(500).json({ error: error.message });
  }
});

// Orchestration endpoint
app.post("/orchestrate", async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan) {
      return res.status(400).json({ error: "Missing plan" });
    }

    const result = await orchestratorAgent.runPlan(plan);
    res.json({ status: "ok", orchestrated: result });
  } catch (error: any) {
    logger.error(error, "Orchestration failed");
    res.status(500).json({ error: error.message });
  }
});

// Synthesis endpoint
app.post("/synthesize", async (req, res) => {
  try {
    const { chunks } = req.body;
    if (!Array.isArray(chunks)) {
      return res.status(400).json({ error: "Missing or invalid chunks" });
    }

    const result = await synthesisAgent.synthesize(chunks);
    res.json({ status: "ok", synthesized: result });
  } catch (error: any) {
    logger.error(error, "Synthesis failed");
    res.status(500).json({ error: error.message });
  }
});

// Audit endpoint
app.post("/audit", async (req, res) => {
  try {
    const { result } = req.body;
    if (!result) {
      return res.status(400).json({ error: "Missing result" });
    }

    const auditResult = await auditAgent.audit(result);
    res.json({ status: "ok", audit: auditResult });
  } catch (error: any) {
    logger.error(error, "Audit failed");
    res.status(500).json({ error: error.message });
  }
});

// Full pipeline endpoint
app.post("/pipeline/full", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Missing content" });
    }

    logger.info("Starting full pipeline");

    // Stage 1: Enrich
    const enriched = await enrichmentAgent.enrich(content);
    logger.info("Enrichment complete");

    // Stage 2: Orchestrate
    const orchestrated = await orchestratorAgent.runPlan(enriched);
    logger.info("Orchestration complete");

    // Stage 3: Synthesize
    const synthesized = await synthesisAgent.synthesize([orchestrated]);
    logger.info("Synthesis complete");

    // Stage 4: Audit
    const auditResult = await auditAgent.audit(synthesized);
    logger.info("Audit complete", { score: auditResult.score });

    res.json({
      status: "ok",
      pipeline: {
        enriched,
        orchestrated,
        synthesized,
        audit: auditResult
      }
    });
  } catch (error: any) {
    logger.error(error, "Full pipeline failed");
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  logger.info(`CIC MAAL Bootstrap running on http://localhost:${port}`);
  logger.info("Endpoints: /health, /enrich, /orchestrate, /synthesize, /audit, /pipeline/full");
});

// Graceful shutdown
const signals = ["SIGTERM", "SIGINT"];
for (const signal of signals) {
  process.on(signal, () => {
    logger.info(`Received ${signal}, shutting down`);
    process.exit(0);
  });
}
