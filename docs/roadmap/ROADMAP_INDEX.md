# Roadmap Index (v3.0)

**Date:** 2026-06-13  
**Repo:** `c:\dev` (root) + `rewrite-mcp/` (monorepo)

This directory is the authoritative roadmap set for the CIC + Rewrite Labs platform.

---

## Files in this directory

| File | Purpose |
|---|---|
| [MASTER_ROADMAP_v3.0.md](MASTER_ROADMAP_v3.0.md) | Shared systems authority (IR Toolkit, Agents, TorqueQuery, Governance, Delivery) |
| [CIC_SUBROADMAP_v3.0.md](CIC_SUBROADMAP_v3.0.md) | CIC-specific phases: documentary, ARL, autonomy stack 23–28a |
| [REWRITE_LABS_SUBROADMAP_v3.0.md](REWRITE_LABS_SUBROADMAP_v3.0.md) | Rewrite Labs product pipeline: RL-4.0 through RL-4.6 |
| [MIGRATION_GUIDE_v2_to_v3.md](MIGRATION_GUIDE_v2_to_v3.md) | Diff from legacy CIC master, where-to-find-what, recommended source patches |
| [ROADMAP_INDEX.md](ROADMAP_INDEX.md) | This file |

---

## Where to find what

| Question | File |
|---|---|
| What shared systems exist and what's their status? | `MASTER_ROADMAP_v3.0.md` §1 |
| How do CIC and Rewrite Labs depend on each other? | `MASTER_ROADMAP_v3.0.md` §2 |
| What's the current CIC build order? | `CIC_SUBROADMAP_v3.0.md` |
| Full detail on any CIC phase | `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` (archived; ARPS markers) |
| What's the Rewrite Labs build order? | `REWRITE_LABS_SUBROADMAP_v3.0.md` §2 |
| Phase specs, success gates, timelines for RL-4.x | `REWRITE_LABS_SUBROADMAP_v3.0.md` §3 |
| Competitive positioning vs Repaint | `REWRITE_LABS_SUBROADMAP_v3.0.md` §5 |
| Full teardown + schema specs + test matrix | `docs/strategy/REWRITE_LABS_TEARDOWN_AND_BUILD_PLAN_v1.0.md` |
| What changed from v2.x? | `MIGRATION_GUIDE_v2_to_v3.md` |

---

## Rules

1. No subsystem defined in more than one file.
2. Changes to shared systems: update `MASTER_ROADMAP_v3.0.md` + notify both tracks.
3. Changes to CIC phases: update `CIC_SUBROADMAP_v3.0.md` summary + detail in source roadmap.
4. Changes to RL phases: update `REWRITE_LABS_SUBROADMAP_v3.0.md`.
5. All roadmap changes: bump version field + add row to version history table.
6. ARPS markers remain in `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` only.
