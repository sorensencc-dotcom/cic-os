# CIC + Rewrite Labs Unified Master Roadmap v3.0

**Version:** 3.0.0  
**Date:** 2026-06-13  
**Status:** Active  
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

### 1.5 Delivery Infrastructure

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
Delivery Infrastructure (RL-4.2)
    ↓ Cloudflare Workers + R2 + subdomain
    ↓
    ┌──────────────────────┬────────────────────────┐
    │ CIC                  │ Rewrite Labs           │
    │ corpus ingestion     │ SMB site delivery      │
    │ research engine      │ outreach pipeline      │
    │ knowledge graph      │ chat editing           │
    └──────────────────────┴────────────────────────┘
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
| 3.0.0 | 2026-06-13 | Initial unified roadmap; extracted from CIC_MASTER_ROADMAP.md after Repaint competitive teardown |
