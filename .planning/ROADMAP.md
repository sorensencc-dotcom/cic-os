# CIC Runtime Roadmap

## Milestones

- [x] **v0.8.0** — Deploy → Heal → Optimize (shipped 2026-06-23). See `.planning/_archive/v0.8.0/SUMMARY.md`.

---

### v0.9.0 — Adaptive Memory + Semantic Caching
**Status:** [ ] Next (2026-06-24)

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
