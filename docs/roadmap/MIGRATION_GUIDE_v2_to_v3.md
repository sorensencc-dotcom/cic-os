# Roadmap Migration Guide: v2 → v3.0

**Date:** 2026-06-13  
**Applies to:** `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` (v2.x) → unified v3.0 structure

---

## 1. What Changed

### Before (v2.x)
- Single file: `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` (3932 lines)
- Covers: documentary phases + CIC OS + ARL + Autonomy stack (23–28a)
- Rewrite Labs phases: absent entirely (RL-4.x had no canonical home)
- Pricing engine: mischaracterized as SaaS-compatible in ad-hoc docs
- CrawlerEngine: no stub, no spec in any roadmap document
- TorqueQuery (Phase 26): present in CIC master but not identified as shared infra
- Phase numbering: two distinct phases both labeled "Phase 27"; ARPS tag mismatch

### After (v3.0)
- Four files under `docs/roadmap/`:
  - `MASTER_ROADMAP_v3.0.md` — shared systems only (IR Toolkit, Agents, TorqueQuery, Governance, Delivery)
  - `CIC_SUBROADMAP_v3.0.md` — CIC-specific phases (documentary, ARL, autonomy stack 23–28a)
  - `REWRITE_LABS_SUBROADMAP_v3.0.md` — RL-4.0 through RL-4.6 product pipeline
  - `MIGRATION_GUIDE_v2_to_v3.md` — this file
- `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` remains the **canonical detail source** for CIC phases (ARPS markers intact); the new sub-roadmap is a summary index pointing to it
- Rewrite Labs phases now have a canonical home
- Pricing model mismatch documented and corrected
- CrawlerEngine added as P0 prerequisite
- TorqueQuery explicitly marked as shared infrastructure in master
- Known phase numbering issues in source doc cataloged

---

## 2. Diff Against CIC_MASTER_ROADMAP.md

### Issues in source (v2.x) that v3.0 corrects

| Issue | Location in source | v3.0 treatment |
|---|---|---|
| Rewrite Labs RL-4.x phases entirely absent | — | Added in REWRITE_LABS_SUBROADMAP_v3.0.md |
| CrawlerEngine not listed anywhere | — | Added as P0 blocker in master + RL subroadmap |
| PricingEngine implied as SaaS-compatible | Ad-hoc docs | Explicitly flagged: agency model, $75k+ quotes; SaaSPricingGate is separate |
| TorqueQuery (Phase 26) not identified as shared | Phase 26 section | Marked shared in MASTER_ROADMAP_v3.0.md §1.3 |
| Two phases labeled "Phase 27" (APR + CRO) | Phases 27 sections | Documented as known issue in CIC subroadmap §6 |
| ARPS tag mismatch (`PHASE_27:BEGIN` / `PHASE_26:END`) | Lines ~1370, ~1470 | Documented as known issue; patch recommended in next ARPS cycle |
| Sub-phase numbering error (Phase 27/APR uses `26.x` IDs) | Phase 27 deliverables | Documented as known issue |
| No cross-system dependency map | — | Added in MASTER_ROADMAP_v3.0.md §2 |
| No versioning rules for roadmap changes | — | Added in MASTER_ROADMAP_v3.0.md §3 |

### What stays in `CIC_MASTER_ROADMAP.md`

Everything. That file is not deleted or superseded — it remains the canonical detail source with ARPS markers for auto-update. The v3.0 documents are the **architecture layer above it**: summary indexes + cross-platform view.

---

## 3. Where to Find What

| Question | File |
|---|---|
| What shared systems exist? | `MASTER_ROADMAP_v3.0.md` §1 |
| How do CIC and Rewrite Labs depend on each other? | `MASTER_ROADMAP_v3.0.md` §2 |
| What's the CIC documentary timeline? | `CIC_SUBROADMAP_v3.0.md` §1 |
| What's the CIC ARL phase status? | `CIC_SUBROADMAP_v3.0.md` §3 |
| What's the CIC autonomy stack status (23–28a)? | `CIC_SUBROADMAP_v3.0.md` §5 |
| Full detail on any CIC phase | `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` |
| What's the Rewrite Labs build order? | `REWRITE_LABS_SUBROADMAP_v3.0.md` §2 |
| Rewrite Labs phase specs + success gates | `REWRITE_LABS_SUBROADMAP_v3.0.md` §3 |
| Competitive positioning vs Repaint | `REWRITE_LABS_SUBROADMAP_v3.0.md` §5 |
| Full teardown + schema specs + test matrix | `docs/strategy/REWRITE_LABS_TEARDOWN_AND_BUILD_PLAN_v1.0.md` |

---

## 4. Planning Work Under v3.0

**Shared system work** (IR Toolkit, Agents, TorqueQuery):
- Plan against `MASTER_ROADMAP_v3.0.md` §1
- Coordinate: any change to shared schemas (`ir.types.ts`, `agents/package.json`) affects both tracks

**CIC-specific work** (ARL, autonomy stack, documentary):
- Plan against `CIC_SUBROADMAP_v3.0.md`
- Detail: `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md`
- ARPS auto-updates continue to target the source file, not the subroadmap summary

**Rewrite Labs product work** (RL-4.0 through RL-4.6):
- Plan against `REWRITE_LABS_SUBROADMAP_v3.0.md`
- Detail: `docs/strategy/REWRITE_LABS_TEARDOWN_AND_BUILD_PLAN_v1.0.md`

---

## 5. Rules for Future Roadmap Changes

1. No subsystem defined in more than one file.
2. Changes to shared systems: update `MASTER_ROADMAP_v3.0.md` + notify both tracks.
3. Changes to CIC phases: update `CIC_SUBROADMAP_v3.0.md` summary + full detail in source roadmap.
4. Changes to RL phases: update `REWRITE_LABS_SUBROADMAP_v3.0.md`.
5. All roadmap changes: bump version field + add row to version history table.
6. ARPS markers remain in source file only; do not add them to v3.0 summary docs.

---

## 6. Recommended Source File Patches (Next ARPS Cycle)

These issues exist in `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` and should be patched:

- Resolve Phase 27 naming conflict: rename one to "Phase 27A — APR" and "Phase 27B — CRO" or assign distinct numbers
- Fix ARPS tag mismatch: `<!-- ARPS:PHASE_27:BEGIN -->` at line ~1370 closes with `<!-- ARPS:PHASE_26:END -->` at line ~1470
- Fix sub-phase numbering in Phase 27/APR: deliverables use `26.x` IDs instead of `27.x`
- Add RL-4.0 through RL-4.6 section (stub + reference to REWRITE_LABS_SUBROADMAP_v3.0.md)
- Add CrawlerEngine to Phase 26 TorqueQuery + note MVP variant in RL-4.6
