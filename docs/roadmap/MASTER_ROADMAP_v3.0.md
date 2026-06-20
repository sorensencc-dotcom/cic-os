# CIC + Rewrite Labs Unified Master Roadmap v3.1

**Version:** 3.1.0  
**Date:** 2026-06-17  
**Status:** Active — Phase 6 locked  
**Replaces:** `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` as cross-platform authority

---

## 0. Purpose

CIC and Rewrite Labs share agents, IR Toolkit primitives, pipelines, governance, TorqueQuery infrastructure, and delivery infrastructure. Maintaining a CIC-only master roadmap created drift and omission — Rewrite Labs phases had no canonical home.

This document is the **cross-platform authority** for shared systems only. CIC-specific and Rewrite Labs-specific phases live in their sub-roadmaps, which inherit from this master.

**Read order:**
1. This file — shared systems + dependencies
2. [CIC_SUBROADMAP_v3.0.md](CIC_SUBROADMAP_v3.0.md) — CIC documentary + autonomy stack
3. [REWRITE_LABS_SUBROADMAP_v3.0.md](REWRITE_LABS_SUBROADMAP_v3.0.md) — RL product pipeline

---

## 1. Shared Systems (Platform Layer)

Subsystems listed here are owned jointly. Changes require coordination between CIC and Rewrite Labs tracks.

### 1.1 IR Toolkit (`packages/ir-toolkit/`)

| Subsystem | Status | Path |
|---|---|---|
| IRPacket v1.0 schema | Shipped | `src/schemas/ir.types.ts` |
| IRPacket v1.1 patch (raw, spaDetected, screenshotKeys) | Planned — RL-4.0 | `src/schemas/ir.types.ts` |
| DesignTokens schema | Shipped | `src/schemas/ir.types.ts` |
| LeadScoringEngine | Shipped | `src/lead-scorer/score.ts` |
| PreviewGenerator | Shipped (text only) | `src/preview-generator/generator.ts` |
| PricingEngine (agency quotes) | Shipped | `src/pricing-engine/generator.ts` |
| StyleMatchEngine | Missing — RL-4.0 | `src/style-matcher/index.ts` |
| DesignVariantRenderer | Missing — RL-4.1 | `src/design-variant-renderer/index.ts` |
| SiteBundle serializer | Missing — RL-4.2 | `src/site-bundle/index.ts` |
| InstructionParser | Missing — RL-4.3 | `src/instruction-parser/index.ts` |
| DOMPatch applicator | Missing — RL-4.3 | `src/dom-patch/index.ts` |
| SaaSPricingGate + EntitlementSet | Missing — RL-4.4 | `src/saas-pricing-gate/index.ts` |

### 1.2 Agents (`packages/agents/`)

| Subsystem | Status | Path |
|---|---|---|
| CrawlerEngine | Missing — RL-4.6 | `src/crawler/index.ts` |
| SiteExtractor | Stub — RL-4.0 | `src/extractors/index.mjs` |
| RedesignAgent | Stub — RL-4.1 | `src/redesign/index.mjs` |
| OutreachAgent | Stub — RL-4.5 | `src/outreach/index.mjs` |
| ChatEditSession | Missing — RL-4.3 | `src/chat-editor/index.ts` |
| DeploymentAdapter (Cloudflare) | Missing — RL-4.2 | `src/delivery/cloudflare-adapter.ts` |

### 1.3 TorqueQuery (Phase 26 — Ingestion & Search Engine)

Canonical location: `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` Phase 26.  
This is **shared infrastructure** used by both CIC corpus ingestion and Rewrite Labs site capture.

| Subsystem | Status |
|---|---|
| Crawler + Scraper + Mapper | Planned |
| Parser + Proxy Layer | Planned |
| Indexer + Search Engine (hybrid BM25 + vector) | Planned |
| Actor Runtime | Planned |
| HTTP/GRPC API | Planned |
| CIC adapter (`packages/adapters/cic/`) | Planned |
| Rewrite Labs adapter (`packages/adapters/rewritelabs/`) | Planned |

Note: TorqueQuery's CrawlerEngine and RL-4.6's CrawlerEngine are related but serve different scopes. TorqueQuery is the production-scale shared backbone; RL-4.6 is the MVP single-site crawler for RL-4.0 fixture extraction. TorqueQuery replaces RL-4.6 in production at Phase 26 completion.

### 1.4 CIC Governance Layer (Shipped)

Covers Phases 23–24 from CIC master roadmap. Rewrite Labs inherits governance via CIC integration.

| Subsystem | Status |
|---|---|
| MemoryStore + Harvester + Query API + Retention | Shipped (Phase 23.1–23.5) |
| Autonomous Governance Model + Evidence Vault | Shipped (Phase 24.1–24.5) |
| Council voting + Policy rails + Decay logic | Shipped (Phase 24.1) |

### 1.5 Phase 6: Autonomous Cross-Orchestrated Operation (Locked 2026-06-17)

Unified orchestration layer enabling CIC + Labs + Collab to run autonomously with GLM-5 as shared brain and unified router as control plane.

| Subsystem | Status | Phase | Details |
|---|---|---|---|
| Config framework (scheduler, collab-task, workflows, registry) | Scaffolding | 6.0 | YAML-based, deterministic |
| Redis-backed queue + durability | In progress | 6.A | Prod-critical; no task loss |
| Graceful shutdown handler (SIGTERM drain) | In progress | 6.B | Prod-critical; Docker/K8s safe |
| Unified router + GLM-5 model routing | Scaffolding | 6.0 | Rules-driven, glm-5.1/5.2 selection |
| Context builder (CIC + Labs merge) | Scaffolding | 6.0 | Unified frame for GLM-5 |
| Joint report generator (ROI metrics) | Scaffolding | 6.0 | Combines CIC + Labs metrics |
| Collab orchestrator (multi-phase workflows) | Scaffolding | 6.0 | Calls CIC + Labs in sequence |
| Scheduler runtime (cron + task intake) | Scaffolding | 6.0 | Deterministic autonomous scheduling |
| Worker pool + parallel execution | Scaffolding | 6.0 | Horizontal scaling ready |
| Telemetry + GLM-5 tracing | Scaffolding | 6.0 | Full observability |
| Retry engine + exponential backoff | Planned | 6.D | 5 max attempts, post-merge 2026-06-27 |
| Auth/authz middleware | Deferred | 6.E | Only if external API exposure |

**Execution plan:** [`PLAN_PHASE_6.md`](../../PLAN_PHASE_6.md)  
**Merge target:** 2026-06-22  
**Stability soak:** 2026-06-22 through 2026-06-24  
**Locked decisions:** Redis queue backend | Prod-critical scope (6.A + 6.B only for merge)

### 1.6 Delivery Infrastructure

Planned for RL-4.2. Owned by Rewrite Labs but available to CIC for hosted artifact delivery.

| Subsystem | Status |
|---|---|
| Cloudflare Workers + R2 hosting | Planned — RL-4.2 |
| `[slug].rewritelabs.io` subdomain | Planned — RL-4.2 |
| Custom domain CNAME flow | Planned — RL-4.2 |
| Badge injection / removal toggle | Planned — RL-4.2 |

---

## 2. Cross-System Dependency Map

```
CIC Governance (Phase 23-24)
    ↓ provides audit trail + policy rails
    ↓
Shared Agents (packages/agents/)
    ↓ CrawlerEngine → SiteExtractor → RedesignAgent → OutreachAgent
    ↓
IR Toolkit (packages/ir-toolkit/)
    ↓ IRPacket → LeadScore → PreviewGallery → StyleMatch → DesignVariant → SiteBundle
    ↓
TorqueQuery (Phase 26)
    ↓ production-scale crawl/scrape/index/search backbone
    ↓
Phase 6: Autonomous Cross-Orchestration (Redis queue + Graceful shutdown)
    ↓ unifies CIC + Labs + Collab task execution
    ↓ feeds telemetry + metrics to GLM-5 strategist
    ↓
Delivery Infrastructure (RL-4.2)
    ↓ Cloudflare Workers + R2 + subdomain
    ↓
    ┌──────────────────────┬────────────────────────┬────────────────────┐
    │ CIC                  │ Rewrite Labs           │ Collab (Phase 6)   │
    │ corpus ingestion     │ SMB site delivery      │ joint experiments  │
    │ research engine      │ outreach pipeline      │ cross-orch workflows│
    │ knowledge graph      │ chat editing           │ shared telemetry   │
    └──────────────────────┴────────────────────────┴────────────────────┘
```

---

## 3. Versioning Rules

- This document is authoritative for shared system status.
- Sub-roadmaps are authoritative for platform-specific phase sequencing.
- No subsystem may be defined in both this document and a sub-roadmap.
- All changes: version bump + archive prior version + migration note.
- ARPS comment markers (`ARPS:PHASE_X:BEGIN/END`) apply only in `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md`.

---

## 4. Version History

| Version | Date | Change |
|---|---|---|
| 3.1.0 | 2026-06-17 | Phase 6 locked: Autonomous cross-orchestration; Redis queue + graceful shutdown prod-critical; merge gate 2026-06-22 |
| 3.0.0 | 2026-06-13 | Initial unified roadmap; extracted from CIC_MASTER_ROADMAP.md after Repaint competitive teardown |
