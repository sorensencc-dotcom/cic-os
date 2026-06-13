# CIC Sub-Roadmap v3.0

**Version:** 3.0.0  
**Date:** 2026-06-13  
**Parent:** [MASTER_ROADMAP_v3.0.md](MASTER_ROADMAP_v3.0.md)  
**Source of record:** `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` (canonical detail; this doc is the summary index)

---

## 0. Scope

CIC owns: documentary production pipeline, archival research corpus, ARL reasoning engine, autonomy stack (Memory → Skill Graph → Planner → Orchestrator → Knowledge Graph), and governance.

Shared systems (IR Toolkit, Agents, TorqueQuery, Delivery) are defined in MASTER_ROADMAP_v3.0.md.

---

## 1. Documentary Production Phases

| Phase | Name | Status |
|---|---|---|
| Phase 1 | Archival Research | In Progress |
| Phase 2 | Narrative Development | Pending |
| Phase 3 | Pre-Production | Pending |
| Phase 4 | Production | Pending |
| Phase 5 | Post-Production | Pending |
| Phase 6 | Distribution | Pending |

Detail: `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` Phases 1–6.

---

## 2. CIC OS — Infrastructure

### Phase 0.7 — Unified Build System
**Status:** Queued  
**Timeline:** 2026-06-09 through 2026-06-29

7-agent build DAG (CIC ingestion, CIC evolution, Labs discovery, Labs extractor, Labs redesign GPU, Labs outreach, Nemotron/NIM inference). Multi-stage Docker, OPA/Conftest policy, lineage tracking, Prometheus/Grafana/Loki observability.

Deliverables: Build graph spec, Dockerfile templates, lineage schema, policy pack, routing maps, agent registration spec, CI/CD templates, operator docs.

### Phase 0.9 — TheFoundry (Deterministic Build Environment)
**Status:** In Progress (M1 complete)  
**Timeline:** 2026-06-08 through 2026-06-22

Milestones:
- M1 ✅ Core node-build + node-runtime images built, reproducibility tested
- M2 ⏳ CI integration + Phase 24 adoption (Week 2 Jun 15–21)
- M3 ⏳ Deployment + scaling (Week 3 Jun 22–28)
- M4 ⏳ Documentation + knowledge transfer (Week 4 Jun 29–Jul 5)

---

## 3. Advanced Reasoning Layer (ARL) — Phase 7

### Completed (7.1–7.16)

| Phase | Name | Status |
|---|---|---|
| 7.1–7.10 | ARL Foundation (coherence, semantic, temporal, causal, narrative subsystems) | ✅ |
| 7.11 | Weighting Model (deterministic weighted aggregation, 0.8 approval threshold) | ✅ |
| 7.12 | Threshold Model (hard thresholds, E001-E005 codes, BOB governance signals) | ✅ |
| 7.13 | Governance Hooks (BOB rule triggers, escalation routing, operator override audit) | ✅ |
| 7.14 | ARL Self-Diagnostics (health checks, anomaly detection, Reasoning Integrity Score) | ✅ |
| 7.15 | Memory Consistency Engine (temporal checks, contradiction detection, IMemoryStore) | ✅ |
| 7.16 | Multi-Run Aggregator (rolling drift, IMPROVING/DEGRADING/STABLE trend analysis) | ✅ |

### Pending (7.17–7.25)

| Phase | Name | Status |
|---|---|---|
| 7.17 | Adversarial Resistance Layer | Pending |
| 7.18 | Operator Feedback Loop | Pending |
| 7.19 | Model Introspection Layer | Pending |
| 7.20 | Stability Plane v2 | Pending |
| 7.21 | Runtime Optimization | Pending |
| 7.22 | ARL v2 Spec Draft | Pending |
| 7.23 | ARL v2 Implementation | Pending |
| 7.24 | Distributed Reasoning | Pending |
| 7.25 | Autonomous Mode | Pending |

---

## 4. Evolutionary Roadmap — Phases 9–20

| Phase | Name | Status |
|---|---|---|
| 9 | Reproductive Autonomy (RIN replication, federation) | ✅ |
| 10 | Autonomous Global Optimization (O1→O5 loop, CML, FR, TS) | ✅ |
| 11 | Reflexive Meta-Evolution (MAE, MSE, strategy mutation) | ✅ |
| 12 | Predictive Evolution (coherence modeling, counterfactual simulation) | Pending |
| 13 | Autogenous Evolutionary Governance (objectives, constraints, arbitration) | Pending |
| 14 | Distributed Evolutionary Sovereignty (regional autonomy, negotiation) | Pending |
| 15 | Emergent Evolutionary Intelligence (novel heuristics, self-invented rules) | Pending |
| 16 | Evolutionary Memory & Lineage Intelligence | Pending |
| 17 | Evolutionary Intent Formation | Pending |
| 18 | Evolutionary Negotiation with External Systems | Pending |
| 19 | Evolutionary Self-Representation | Pending |
| 20 | Evolutionary Autopoiesis | Pending |

---

## 5. Autonomy Stack — Phases 22–28a

### Phase 22 — ARPS (Autonomous Roadmap & Prompt Sandbox)
**Status:** ✅ Completed  
Registry-backed prompt sandbox, roadmap harvester/synthesizer, CLI pipeline, Git-first environment.

### Phase 23 — CIC Memory Layer (MLA)
**Status:** 23.1–23.5 Complete | 23.6–23.7 In Progress  
**Timeline:** 2026-06-07 through ongoing

| Sub-phase | Name | Status |
|---|---|---|
| 23.1 | Memory Substrate Spec (MLA-Spec) | ✅ |
| 23.2 | Memory Harvester (JSON append-only, POST /memory/ingest) | ✅ |
| 23.3 | Memory Synthesizer (weekly/monthly summaries) | ✅ |
| 23.4 | Memory-Aware Agents Integration | ✅ |
| 23.5 | Memory Query API | ✅ |
| 23.6 | Memory Visualization (Explorer panel) | In Progress |
| 23.7 | Memory-Driven Autonomy (pattern detection, proposals) | In Progress |

### Phase 24 — Autonomous Governance (AG)
**Status:** 24.1–24.5 Complete  
**Timeline:** 2026-06-15 through 2026-06-29

| Sub-phase | Name | Status |
|---|---|---|
| 24.1 | Governance Model (council voting, rail precedence, decay) | ✅ |
| 24.2 | Evidence Vault Schema (packet types, JSON schemas, validators) | ✅ |
| 24.3 | MemoryStore Tier 2 (collections, indexes, snapshot rollback) | ✅ |
| 24.4 | Phase API Contracts (RunContext, 7 phase contracts, gate/council) | ✅ |
| 24.5 | Build Governance Integration (LineagePacket, BuildValidator, BuildApprovalGate) | ✅ |
| 24.6 | Governance API Specification | Planned |
| 24.7 | Safety Envelope Specification | Planned |

### Phase 25 — Skill Graph & Cross-System Doctrine (SGD)
**Status:** Queued (depends on Phase 24)

Sub-phases 25.1–25.7: Spec → Store → Harvester → Synthesizer → API → UI → Cross-system sync.

### Phase 26 — TorqueQuery: Ingestion & Search Engine (TQ)
**Status:** Queued (parallel track)  
**Timeline:** 2026-06-15 through 2026-06-29  
**Note:** Platform-level shared system — see MASTER_ROADMAP_v3.0.md §1.3 for shared status. CIC-specific adapter: `packages/adapters/cic/`.

Sub-phases 26.1–26.8: Architecture → API Specs → Core implementation (Crawler/Scraper/Mapper/Parser/Proxy/Indexer/Search) → Actor Runtime → Adapters → Infra+Docs.

### Phase 27 — Autonomous Planner & Multi-Agent Reasoning (APR)
**Status:** Queued (depends on Phases 24, 25)

Goal → Plan → Task DAG → Agent routing via Skill Graph → Multi-agent consensus loop.

### Phase 27 (CRO) — CIC Runtime Orchestrator
**Status:** Queued (depends on APR)  
**Note:** Numbering conflict in source roadmap (two Phase 27s). CRO is the execution engine for APR plans.

Execute tasks, manage parallelism, handle failures, provide telemetry, power resumable long-running flows.

### Phase 28 — CIC Knowledge Graph (CKG)
**Status:** Queued (depends on Phases 23–27)

Unifies Memory + Skill Graph + APR plans + CRO runs + ARPS deltas into semantic world model.

### Phase 28a — Skill Contribution Pipeline (SCP)
**Status:** Design Spec (2026-06-11)  
**Timeline:** Start 2026-06-18, 15 days

Skills manifest → change detection → upstream PR generation → status tracking → Slack notifications.

---

## 6. Known Issues in Source Roadmap

- Two distinct phases both labeled "Phase 27" (APR and CRO) — to be resolved in next version
- Phase 26 deliverable numbering uses `26.x` but Phase 27/APR uses `26.x` in sub-phase IDs (copy error in source)
- ARPS `<!-- ARPS:PHASE_27:BEGIN -->` opens but `<!-- ARPS:PHASE_26:END -->` closes — tag mismatch
- Rewrite Labs product phases (RL-4.x) not represented in source roadmap at all

These are tracked here for resolution; source roadmap patch recommended in next ARPS cycle.
