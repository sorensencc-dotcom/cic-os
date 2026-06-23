# CIC Runtime Roadmap

## Milestones

### v0.8.0 — Deploy → Heal → Optimize
**Status:** Complete (2026-06-23)

First fully integrated control-plane slice of CIC. Captures Phase 6 (Skill Deployer), Phase 7 (Autonomous Self-Healing), and Phase 8 (Cost Optimization + Dynamic Model Selection).

- [x] Phase 6: Skill Deployer — deterministic packaging + registration
- [x] Phase 7: Autonomous Self-Healing + Drift Control — SLA monitors, circuit breakers, 6-state machine, recovery loop
- [x] Phase 8: Cost Optimization + Dynamic Model Selection — cost telemetry, forecast engine, budget policy, dynamic routing

**Artifacts:**
- PHASE_8_SPEC.md (8k+ LOC spec)
- PHASE_8_TEST_MATRICES.md (45+ test cases)
- 56 test suites, 679/699 passing
- Memory: [[phase-8-cost-optimization-locked]]

**Tag:** v0.8.0

---

### v0.9.0 — Adaptive Memory + Semantic Caching
**Status:** Planned (2026-06-24)

Make CIC economically intelligent about memory. Reuse past reasoning when safe, cache semantic work products, avoid recomputation under stable drift, auto-invalidate memory when cost or SLA pressure rises.

- [ ] Phase 9: Adaptive Memory + Semantic Caching (10 files, 3 days)
  - Semantic cache engine (embedding-based keys, multi-tier cache)
  - Memory reuse evaluator (drift-aware, cost-aware)
  - Memory delta tracker (world-state changes)
  - Adaptive retrieval router (full/partial/no reuse)
  - Cache write policy engine
  - CIC integration adapter
  - 7 Prometheus memory metrics
  - 5 audit event types

**Estimated:** 20% — 40% cost reduction across planning + analysis agents.

---

## Next Steps

Run `/ijfw-workflow` to plan Phase 9, or use `/ijfw-complete-milestone v0.8.0` to archive v0.8.0 and seed v0.9.0.

---

## Archive

Shipped milestones: `.planning/_archive/`
