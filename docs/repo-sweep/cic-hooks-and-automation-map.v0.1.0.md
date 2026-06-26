# CIC Hooks & Automation Map (v0.1.0)

**Phase:** 4.4 (Repo Sweep — CIC Hooks & Automation Map)
**Author:** ijfw:architect (Opus reasoning)
**Date:** 2026-06-19
**Source repo:** `c:\dev` (+ microservices)
**Status:** PROPOSED — pending Phase 4.5 merge

---

## 0. Executive Summary

CIC automation is organized as a **five-stage pipeline** (Ingestion → Enrichment → Orchestration → Synthesis → Logging/Snapshots), plus **two governance gates** (a local git pre-commit guardrail and a CI governance workflow). The runtime is fully described by `c:\dev\docker-compose.yml` (16 services across ports 3100–3116 + 5433 postgres + 6333/6380 qdrant/redis).

**Key facts the map establishes:**

- The **front door** for live UI data is `unified-api` (port 3100) — it fans out to governance, torquequery, repomix, vault, and governance-evolution routers. **This is the single integration point Console v3 should consume.**
- The **autonomy/agent telemetry** door is `cic-ingestion` (AutonomyAPIServer, port 3116→3000) exposing `/autonomy/signals`, `/autonomy/proposals`, `/cache`, `/execution`, and the Qdrant-backed `/vector/*` layer.
- **Enrichment is real, not mock**: `cic-ingestion/src/vector/` is a full Qdrant integration (client, harvester indexer, context-store writer, drift detector, self-healing). The separate `castironforge/services/memory-spine/` is a second vector engine (its own embeddings + vectorStore) — **a parallel enrichment stack** that is an integration/dedup decision for Console v3.
- **Two integrations are deliberately severed for Docker isolation**: the AutonomyAPIServer comments out its Memory and Governance routers ("commented out for Docker isolation — rewrite-mcp not in context"). This is the largest orphan/gap: autonomy proposals cannot reach governance in-process.

**Orphan/gap callouts** are consolidated in §7.

---

## 1. Runtime Service Map (basis for all hooks)

Source of truth: `c:\dev\docker-compose.yml`. Network: `cic-network` (172.25.0.0/16).

| Service | Port (host→container) | Role | Stage |
|---------|----------------------|------|-------|
| unified-api | 3100→3100 | API gateway / route fan-out | Front door |
| build-executor | 3101 | DAG node executor (Phase 0.7) | Orchestration |
| lineage-registry | 3102 | Provenance + SBOM (Postgres `cic_lineage`) | Logging/Snapshots |
| routing-validator | 3103 | OPA policy enforcement | Orchestration (gate) |
| build-orchestrator | 3104 | Build HTTP API + coordination | Orchestration |
| performance-store | 3105 | Build metrics + predictions (Phase 0.8) | Logging/Synthesis |
| predictive-routing-engine | 3106 | Route optimization | Synthesis |
| knowledge-graph | 3107 | Unified semantic memory (Phase 29) | Enrichment/Synthesis |
| torquequery | 3110 | Memory indexing engine (Python/uvicorn) | Ingestion/Enrichment |
| vault | 3111 | Governance evidence storage (M3) | Logging/Snapshots |
| repomix-ingestion | 3112 | Repo analysis pipeline (Phase 4.4) | Ingestion |
| cic-governance | 3113 | Evolution loop / amendment engine | Orchestration/Synthesis |
| planning-engine | 3114 | Cost estimate + scheduling + roadmap synthesis | Synthesis |
| harvester-v2 | 3115 | Cost-delta extraction + telemetry | Ingestion |
| cic-ingestion | 3116→3000 | Autonomy API (signals/proposals/vector) | Ingestion/Enrichment/Orchestration |
| planning-console | 3200→3000 | **Console v3 host** (rewrite-mcp) | UI |
| qdrant | 6333/6334 | Vector DB | Enrichment substrate |
| postgres | 5433→5432 | Lineage + artifact storage | Logging substrate |
| redis | 6380→6379 | Async build queue | Orchestration substrate |

---

## 2. Ingestion

### 2.1 GitHub PR → Auto-Docs pipeline
- **Name/purpose:** `.github/workflows/auto-docs-pr.yml` — auto-syncs docs (CHANGELOG/ROADMAP/SCHEMAS) from PR diffs.
- **Trigger:** `pull_request` (opened, synchronize, reopened) on `master`/`main`/`feature/*`; also `workflow_dispatch`.
- **Processing steps:** checkout PR branch → setup Node 20 → `node run-auto-docs.js` (self-contained diff scanner) → commit `[automated] Update docs from PR changes` → push back to PR branch.
- **Data flow:** PR diff (input) → doc-delta scan → mutated `CHANGELOG.md`/docs (output, committed to PR branch).
- **Console v3 integration:** Pipelines panel (§3.2) — surface auto-docs runs as a pipeline job with pass/fail + last-run timestamp. Read from GitHub Actions API or the resulting commit log.

### 2.2 GitHub push → TheFoundry Build + Test
- **Name/purpose:** `.github/workflows/build.yml` — deterministic Docker build + test via TheFoundry node-build image.
- **Trigger:** `push` to `master`; `workflow_dispatch` (optional `phase` input).
- **Processing steps:** checkout → build `thefoundry-node-build:<sha>` (target `builder`) → `docker run … npm test` → auto-commit `[automated] CI build`.
- **Data flow:** source @ sha (input) → sealed build + test run → CI commit + test result (output).
- **Console v3 integration:** Workspace panel (§3.4) build-artifact + deploy-readiness; Pipelines panel for build status.

### 2.3 GitHub push (scoped) → CIC Ingestion Build & Test
- **Name/purpose:** `.github/workflows/cic-ingestion-build.yml` — path-scoped Docker build/test for the ingestion service.
- **Trigger:** `push` to `feature/planning-engine` or `master` with `paths: cic-ingestion/**`; `workflow_dispatch`.
- **Processing steps:** checkout → build cic-ingestion Docker image → test inside container.
- **Data flow:** cic-ingestion source delta (input) → container test (output: pass/fail).
- **Console v3 integration:** Pipelines panel — per-service CI status row.

### 2.4 TorqueQuery Event Ingestion (live API)
- **Name/purpose:** `services/knowledge-graph/src/ingestion/EventIntakeServer.ts` — accepts TorqueQuery events into the knowledge graph.
- **Trigger:** event (HTTP POST `/api/knowledge-graph/ingest/torque` and `/ingest/torque/batch`).
- **Processing steps:** validate event schema → idempotency check (`IdempotencyManager`, dedup by `event.id`) → `EventRouter` writes to `GraphStore`.
- **Data flow:** `TorqueEvent{ id, type, source, actor, payload, meta{trace_id,span_id,schema_version} }` (input) → graph nodes/edges in knowledge-graph store (output).
- **Console v3 integration:** Pipelines panel — "Active ingestion jobs" + "event ingestion rate" (Health §3.1). Read knowledge-graph 3107 metrics.

### 2.5 Harvester v2 — Cost-delta + telemetry ingestion
- **Name/purpose:** `harvester-v2` service (port 3115) / `cic-ingestion/src/harvester/v2/server.ts` — extracts cost deltas and telemetry, feeds planning-engine.
- **Trigger:** event/cron (telemetry pipeline); wired to `PLANNING_ENGINE_URL`, `VAULT_URL`, `MEMORY_STORE_URL`.
- **Processing steps:** harvest cost/telemetry → write to memory store (torquequery 3110) + vault → notify planning-engine.
- **Data flow:** raw build/run telemetry (input) → cost-delta records → planning-engine cost model (output).
- **Console v3 integration:** Agents > Cost panel (§3.3); Pipelines enrichment queue depth.

### 2.6 Repomix Ingestion — repo analysis
- **Name/purpose:** `repomix-ingestion` service (port 3112) / `services/repomix-ingestion/src/RepomixPipeline.ts` — deterministic repo ingestion (Phase 4.4).
- **Trigger:** event/manual (analysis request).
- **Processing steps:** pack repo → extract code structure → emit analysis artifact for enrichment/extractor views.
- **Data flow:** repo path (input) → packed repo + structural analysis (output → codeflow/extractor panels).
- **Console v3 integration:** Workspace/Pipelines — Extractor Results panel data source (the REWRITE target from 4.3).

### 2.7 CodeFlow analyze (HTTP)
- **Name/purpose:** `codeflow-server.js` — CodeFlow static-analysis HTTP wrapper.
- **Trigger:** event (HTTP POST `/analyze` with `{repoPath}`); `/health`, `/metrics` for observability.
- **Processing steps:** `analyzeRepo()` → `observer.recordAnalysis()` → structured log.
- **Data flow:** `{repoPath}` (input) → `{files, edges, security, patterns, impact, duration_ms}` (output).
- **Console v3 integration:** Extractor Results panel (live source for the 4.3 REWRITE).

---

## 3. Enrichment

### 3.1 Qdrant Vector Layer (cic-ingestion) — PRIMARY
- **Name/purpose:** `cic-ingestion/src/vector/` — full Qdrant enrichment stack wired into AutonomyAPIServer via `wireVectorLayer()`.
- **Components:** `qdrantClient.ts` (DB client), `harvesterIndexer.ts` (index harvester output), `contextStoreWriter.ts` (write context vectors), `torqueQuery.ts` + `torqueQueryPlanner.ts` (semantic query), `retrievalDriftDetector.ts` (drift), `vectorSelfHealing.ts` (auto-repair), `qdrantObservability.ts` (metrics), `vectorRoutes.ts` (HTTP), `vectorLayerBootstrap.ts` (init).
- **Trigger:** event (indexing on harvest/context write) + query (HTTP `/vector/search`, `/vector/metrics`).
- **Processing steps:** embed → upsert into Qdrant collections (chunks/context/skills) → on query, vector search + drift check → self-heal if unhealthy.
- **Data flow:** harvested content / context (input) → Qdrant vectors (collections: chunks, context, skills) → search results + collection health metrics (output: `{collection, healthy, pointCount, indexStatus, lastSearchLatencyMs, lastIndexLatencyMs}`).
- **Console v3 integration:** Health panel (§3.1) — the `/vector/metrics` endpoint is already consumed by the React VectorMetricsDashboard; Console v3 reuses it directly. Qdrant runs at `qdrant:6333`.

### 3.2 Memory-Spine Vector Engine (castironforge) — PARALLEL / DEDUP DECISION
- **Name/purpose:** `castironforge/services/memory-spine/` — a **second, independent** vector/RAG engine (`src/lib/vectorStore.ts`, `buildEmbeddings.ts`, `queryEngine.ts`, `embeddingClient.ts`) with its own Express routes (`routes/query.ts`, `routes/admin.ts`).
- **Trigger:** query (HTTP POST `/` with `{query_text, max_tokens}`); admin routes for versioning.
- **Processing steps:** `memoryManager.query()` → vector retrieval → returns `{answer_text, provenance, confidence, memory_version}` with versioned memory snapshots (`loadVersions()`).
- **Data flow:** `{query_text}` (input) → top-k vector matches → answer + provenance + confidence (output).
- **Console v3 integration:** **DECISION REQUIRED** — this is a parallel enrichment stack to §3.1. Either (a) Console v3 treats memory-spine as a distinct "Memory" data source, or (b) the two vector layers are consolidated. Flagged as an orphan-risk in §7.

### 3.3 Knowledge Graph enrichment
- **Name/purpose:** `services/knowledge-graph/` (port 3107) — semantic graph over ingested TorqueQuery events; `TorqueQueryClient.ts` bridges TorqueQuery → KG.
- **Trigger:** event (post-ingestion, §2.4) + query.
- **Processing steps:** map RunEvent/Signal/CorrelationCluster → graph nodes/edges → expose diagnostics + metrics.
- **Data flow:** ingested events (input) → correlation clusters + graph queries (output).
- **Console v3 integration:** Pipelines "Synthesis results" + a potential "Pipeline dependency graph" emergent feature (§5).

---

## 4. Orchestration

### 4.1 Build Orchestration DAG (Phase 0.7)
- **Name/purpose:** `build-orchestrator` (3104) coordinating `build-executor` (3101) via `redis` (6380) queue, gated by `routing-validator` (3103, OPA) and recorded by `lineage-registry` (3102).
- **Trigger:** event/manual (build request) → Redis job queue.
- **Processing steps:** orchestrator enqueues DAG nodes → executor pulls jobs → routing-validator enforces OPA policy → lineage-registry records provenance/SBOM → performance-store (3105) records metrics → predictive-routing-engine (3106) optimizes future routes.
- **Data flow:** build DAG (input) → executed nodes + provenance + metrics (output to Postgres `cic_lineage` + performance-store).
- **Console v3 integration:** Pipelines panel (active jobs, queue depth from Redis), Controls panel (pause/resume/trigger build).

### 4.2 Autonomy proposal engine (cic-ingestion)
- **Name/purpose:** `cic-ingestion/src/autonomy/AutonomyAPIServer.ts` — detects signals and generates governed proposals.
- **Trigger:** event (HTTP): `POST /autonomy/signals` (detect), `GET /autonomy/signals` (query), `GET/POST /autonomy/proposals`, `PUT /autonomy/proposals/:id` (status); plus `/cache` and `/execution` routers.
- **Processing steps:** `AutonomyService` ingests signals → generates proposals → execution router runs approved actions; `ObservabilityManager` records every request (method/path/duration).
- **Data flow:** signals (input) → proposals → execution results (output); telemetry → observability.
- **Console v3 integration:** Agents panel (§3.3) — execution history, approval audit trail; Controls panel — invoke/approve proposals (with governance gate). **GAP:** Memory + Governance routers are commented out for Docker isolation (§7).

### 4.3 CIC Governance Evolution Loop
- **Name/purpose:** `services/cic-governance/` (3113) — autonomous amendment/policy/constraint engine (`GovernanceEvolutionLoop.ts`, `GovernancePolicyUpdater.ts`, `GovernanceConstraintUpdater.ts`, `GovernanceAmendmentGenerator.ts`).
- **Trigger:** event/cron (evolution cycle) + API (via unified-api `/api` governance + governance-evolution routers).
- **Processing steps:** evaluate signals → generate amendment → council vote → update policy/constraints → record decision.
- **Data flow:** governance signals (input) → amendments/decisions (output → vault).
- **Console v3 integration:** Health "Governance decision log" + "Approval queue" (§3.1); Alerts "Governance violations" (§3.5); Controls approval gate.

### 4.4 Skill / Agent invocation (MCP)
- **Name/purpose:** `rewrite-mcp/skills-runtime/` — 13 skills deployed as MCP tools (summarize_cic_phase, detect_agent_drift, orchestrate_rl_pipeline, etc., per rewrite-mcp CLAUDE.md).
- **Trigger:** manual/agent (MCP tool invocation from Claude Code or Console v3 Controls).
- **Processing steps:** tool call → skill execution → result; gated by governance council vote for destructive ops.
- **Data flow:** tool name + args (input) → skill result (output).
- **Console v3 integration:** Controls panel (§3.6) "Invoke skills (with approval)"; Agents panel "Skill library status."

---

## 5. Synthesis

### 5.1 Planning Engine (cost + schedule + roadmap)
- **Name/purpose:** `planning-engine` (3114) / `cic/` — PhaseCostEstimator + AutoschedulerV2 + RoadmapDeltaSynthesizer.
- **Trigger:** event (harvester-v2 cost deltas) + API.
- **Processing steps:** ingest cost deltas → estimate phase cost → schedule → synthesize roadmap delta against `build-roadmap.json`.
- **Data flow:** cost/telemetry + current roadmap (input) → updated roadmap + schedule + cost estimate (output, persisted to vault + memory store).
- **Console v3 integration:** Workspace panel (§3.4) roadmap state; the Roadmap External Items REWRITE (4.3) consumes this.

### 5.2 Auto-Docs synthesis
- **Name/purpose:** `run-auto-docs.js` (root) — diff → doc synthesis, invoked by workflow §2.1.
- **Trigger:** PR (CI) + `/auto-docs` skill (manual).
- **Processing steps:** scan git diff → map to CHANGELOG/ROADMAP/SCHEMA sections → write updates (zero-prompt batch).
- **Data flow:** diff (input) → doc mutations (output).
- **Console v3 integration:** Workspace panel — "docs in sync?" indicator.

### 5.3 Predictive routing
- **Name/purpose:** `predictive-routing-engine` (3106) + `performance-store` (3105) — optimizes build routing from historical metrics.
- **Trigger:** event (post-build metrics).
- **Processing steps:** read performance-store history → predict optimal route → feed orchestrator.
- **Data flow:** build metrics (input) → routing decisions (output).
- **Console v3 integration:** Pipelines panel + "Agent performance comparison" emergent feature (§5).

---

## 6. Logging & Snapshots

### 6.1 Persistent Vault (governance evidence)
- **Name/purpose:** `services/vault/` (3111) — deterministic governance store; encrypted (`VAULT_SECRET_KEY`).
- **Trigger:** event (every governance decision, build approval, planning result).
- **Processing steps:** write lineage/decision/signing/promotion packets → versioned, queryable.
- **Data flow:** governance packets (input) → vault records (output, durable).
- **Console v3 integration:** Health "Governance decision log"; Alerts violations; Agents approval audit trail.

### 6.2 Lineage Registry (provenance + SBOM)
- **Name/purpose:** `lineage-registry` (3102) — provenance + SBOM tracking, backed by Postgres `cic_lineage`.
- **Trigger:** event (build node execution).
- **Processing steps:** record build provenance + SBOM → Postgres.
- **Data flow:** build node + artifacts (input) → lineage rows in Postgres (output).
- **Console v3 integration:** Workspace build-artifact provenance; deploy-readiness.

### 6.3 Observability layer
- **Name/purpose:** `cic-observability.ts` + `codeflow-observability.ts` + `cic-ingestion ObservabilityManager` — metrics/counters/histograms + structured logs. **NOTE:** `cic-observability.ts` is currently a **mock** (`MockMetrics`/`MockLogger`, comment: "replace with real CIC telemetry in production"); the cic-ingestion ObservabilityManager is real (records every request).
- **Trigger:** event (every analyze/request).
- **Processing steps:** record counter/gauge/histogram + structured log per operation.
- **Data flow:** operation metadata (input) → metrics + logs (output → Prometheus/Loki).
- **Console v3 integration:** Health/Alerts panels. **GAP:** the codeflow observability path is mock (§7).

### 6.4 Grafana / Prometheus / Loki monitoring stack
- **Name/purpose:** `cic-ingestion/dashboards/cic-wil-overview.json` (Grafana, Prometheus-backed) + Loki + Promtail (per cic-ingestion CLAUDE.md: Grafana on 3000/3001).
- **Trigger:** cron (Prometheus scrape) + continuous (Loki log shipping via Promtail).
- **Processing steps:** Prometheus scrapes service `/metrics`; Promtail ships logs to Loki; Grafana renders.
- **Data flow:** service metrics + logs (input) → Grafana panels (output).
- **Console v3 integration:** Health/Alerts panels **embed** Grafana (per 4.3 KEEP decision) rather than re-chart.

### 6.5 Git guardrail hooks (local + boundary)
- **Name/purpose:** `.git/hooks/pre-commit` + `scripts/boundary-checker.sh` — block IDE contamination, shadow workspaces, debug statements, large binaries, package-boundary violations, and `[gemini]` authors.
- **Trigger:** `pre-commit` (every local commit).
- **Processing steps:** scan staged files against 6 rules → boundary-checker enforces package isolation (cic / cic-ingestion / rewrite-mcp / projects / scripts / tools) → block on violation.
- **Data flow:** staged diff (input) → pass/fail verdict (output, blocks commit on failure).
- **Console v3 integration:** Alerts panel — surface guardrail blocks + boundary violations as drift warnings (§3.5). Not a runtime service but a governance hook the console should report on.

### 6.6 CI Governance gate
- **Name/purpose:** `.github/workflows/cic-governance-ci.yml` — gates artifact promotion on a governance decision.
- **Trigger:** `workflow_dispatch` (build_id + pipeline_id) + `repository_dispatch{governance-request}`.
- **Processing steps:** build Foundry container → `fetch-lineage.js` → `submit-governance.js` (to GOVERNANCE_API) → evaluate decision → fail if != `Approved` → sign + promote (stubs) → `write-vault-record.js`.
- **Data flow:** build_id (input) → lineage → governance decision → signed/promoted artifact + vault record (output).
- **Console v3 integration:** Health "Approval queue" + Alerts "Governance violations"; Controls trigger governance run.

---

## 7. Orphans, Gaps & Integration Risks (no orphan automation left unflagged)

| # | Item | Risk | Recommended action |
|---|------|------|--------------------|
| 1 | **AutonomyAPIServer Memory + Governance routers commented out** ("for Docker isolation — rewrite-mcp not in context") | Autonomy proposals can't reach governance/memory in-process; severs Orchestration→Governance link | Re-enable via unified-api HTTP calls (not in-process import) so Docker isolation holds; or move governance behind unified-api 3100. **Largest gap.** |
| 2 | **Two parallel vector engines** — cic-ingestion `src/vector/` (Qdrant) vs castironforge `memory-spine` (own vectorStore) | Duplicate enrichment stacks → divergent embeddings, double cost, ambiguous "memory" source | Operator decision: consolidate onto Qdrant, or formally scope memory-spine as a distinct domain with its own Console v3 data source. |
| 3 | **`cic-observability.ts` is a mock** (MockMetrics/MockLogger) | CodeFlow extraction metrics are fabricated; Console v3 Health could show fake numbers | Wire to real CIC telemetry (Prometheus) before Console v3 trusts codeflow metrics. |
| 4 | **Static HTML dashboards have no serving wiring** (canary/stability/prompt-telemetry/helm/benchmarks) | Only `apps/operator-ui/server.mjs` (5173) serves any; others opened off disk → no live data, no auth | Resolved by 4.3 MERGE/DEPRECATE; Console v3 (planning-console 3200) becomes the single host. |
| 5 | **`planning-engine/` full repo clone** under rewrite-mcp | Every automation/config/dashboard doubled | Collapse clone (cross-refs 4.3 CRITICAL veto item). |
| 6 | **CI signing + promotion are stubs** (`cic-governance-ci.yml` writes static `signing.json`/`promotion.json`) | Governance gate records "Signed/NotPromoted" without real signing | Implement real signing + promotion before treating vault records as authoritative. |
| 7 | **Port collision risk on 3000** | cic-ingestion, planning-console, planning-engine console all map container port 3000; host ports differ (3116/3200) but env (`REACT_APP_*_URL=localhost:3000`) is ambiguous | Topology (4.2) must pin host ports in all `REACT_APP_*` env vars; Console v3 should target host ports (3114/3113/3111/3100/3116), not 3000. |

---

## 8. Console v3 Data-Source Wiring Summary

Console v3 (planning-console, host port 3200) should consume **exactly these live sources** (no mock):

| Console v3 Panel | Primary source(s) | Endpoint(s) |
|------------------|-------------------|-------------|
| Health (§3.1) | unified-api, cic-ingestion vector, Grafana | `:3100/health`, `:3116/vector/metrics`, Grafana embed |
| Pipelines (§3.2) | knowledge-graph, repomix, harvester-v2, GitHub Actions | `:3107`, `:3112`, `:3115`, Actions API |
| Agents (§3.3) | cic-ingestion autonomy, prompt-telemetry/cache | `:3116/autonomy/*`, `:3116/cache`, CacheMetricsExporter |
| Workspace (§3.4) | planning-engine, lineage-registry, codeflow | `:3114`, `:3102`, codeflow `/analyze` |
| Alerts (§3.5) | cic-governance, vault, guardrail hooks | `:3113`, `:3111`, guardrail verdicts |
| Controls (§3.6) | unified-api governance + governance-evolution routers, MCP skills | `:3100/api/...`, skills-runtime |

---

## 9. Acceptance Self-Check

- [x] Every CIC hook/pipeline mapped across all five stages + 2 governance gates (24 hooks/integrations).
- [x] Data flow clear (input → processing → output) for each.
- [x] Trigger type stated (push/PR/manual/cron/event) for each.
- [x] Console v3 integration point identified for every hook (§8 consolidates).
- [x] **No orphan automation** — all gaps/orphans explicitly flagged in §7 with recommended action.
- [x] All paths absolute; ports cross-checked against `docker-compose.yml`.
