---
title: CLOAKBROWSER_INGESTION_HARDENING
version: 2.0.0
status: Draft
owner: CIC / Sweeper
created: 2026-06-19
updated: 2026-06-19
---

# 0. Overview

Phase 1 integrated CloakBrowser, raised JS-heavy success to 92% with 0% WAF blocks.  
Phase 2 hardens ingestion: retries, warm pool, SPA heuristics, vertical expansion, DLQ auto-recovery, drift detection, full dashboard metrics.

Master spec for Phase 2.

---

# 1. Objectives

- JS-heavy success ≥95%
- Median load time ≤2000ms
- DLQ reduction ≥50%
- Vertical drift detection operational
- Dashboard metrics complete for CloakBrowser

---

# 2. Scope

## In-Scope
- Deterministic retry layer
- CloakBrowser warm pool
- SPA-aware screenshot heuristics
- New verticals: Legal, Accounting, Home Improvement
- Multi-URL sampling
- DLQ auto-recovery
- Vertical drift detection
- Dashboard rewrite (Cloak metrics)

## Out-of-Scope
- Multi-browser orchestration
- Behavioral simulation
- HTML-first path redesign

---

# 3. Functional Requirements

## FR-1: Deterministic Retry Layer (P0)
- Max 2 retries
- Backoff: 250ms, 500ms
- Retry only on nav/JS transient failures
- Structured retry logs

## FR-2: CloakBrowser Warm Pool (P0)
- Maintain 2–4 warm sessions
- Health checks per session
- Auto-recycle on failure

## FR-3: SPA-Aware Screenshot Heuristics (P1)
- Detect hydration markers (`__NEXT_DATA__`, React roots)
- Wait for DOM stability or timeout
- Hydration scoring (0–100)

## FR-4: Vertical Expansion (P1)
- Add classifiers for Legal, Accounting, Home Improvement
- Update Sweeper routing and vertical map

## FR-5: Multi-URL Sampling (P1)
- Try `/`, `/home`, `/services`
- Select best DOM via completeness score

## FR-6: DLQ Auto-Recovery (P0)
- Auto-retry DLQ entries via CloakBrowser
- Mark permanent failures deterministically
- DLQ metrics emitted

## FR-7: Vertical Drift Detection (P1)
- Detect >10% drop in vertical success rate
- Emit drift alerts
- Feed dashboard drift panel

## FR-8: Dashboard Rewrite (P0)
- Implement JSON schema for CloakBrowser metrics
- Add engine, routing, error, DLQ, drift panels

---

# 4. Non-Functional Requirements

- Deterministic behavior under CIC timeouts
- No nondeterministic retries
- Structured JSON logs for all new behaviors
- Test coverage for all new components

---

# 5. Success Metrics

| Metric                      | Target   |
|-----------------------------|----------|
| JS-heavy success            | ≥95%     |
| Median load time            | ≤2000ms  |
| DLQ reduction               | ≥50%     |
| Drift detection             | Operational |
| Dashboard completeness      | 100% Cloak metrics |

---

# 6. Dependencies

- Phase 1 CloakBrowser integration (complete)
- OBS-005 dashboard rewrite (in progress)

---

# 7. Deliverables

- Updated ingestion engine (adapter + router + retries + warm pool)
- Updated vertical map + classifiers
- Updated DLQ handling
- Updated dashboard implementation
- Updated specs and tests

---

# 8. Versioning

v2.0.0: Major ingestion behavior changes + new verticals + observability.
