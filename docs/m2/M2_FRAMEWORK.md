# M2 Execution Framework

Complete validation framework for M2 workstreams (A, B, C) with canary gates and fire drills.

**Gate Target:** 2026-06-22 18:00 UTC  
**Status:** Live and operational

## Quick Start

### Run Canary Gates

```bash
# Validate individual workstreams
npm run canary-gates:A    # Budget Ledger DB Wiring
npm run canary-gates:B    # SLO Controller + Prometheus
npm run canary-gates:C    # Adapter Gateway Caching
```

### Run Fire Drills

```bash
# Execute resilience scenarios (run AFTER all gates pass)
npm run fire-drills
```

## Framework Architecture

### Canary Gates (`scripts/canary-gates.ts`)

Validates workstream completion against acceptance criteria.

**Configuration:** `canary-gates-config.json`

**Output:** JSON reports + CLI pass/fail decision

**Gate Decision Logic:**
- ✅ PASS if all critical criteria met
- ❌ FAIL if any critical criterion fails
- ⚠️ WARN if non-critical data missing (expected during development)

### Fire Drills (`scripts/fire-drills.ts`)

Validates system resilience under failure conditions.

**Scenarios (serial execution):**
1. **Budget Exhaustion** — Ledger at 100% capacity, write rejection, rollback
2. **SLO Burn-Rate Spike** — 5x load increase, detection, canary abort
3. **Adapter Degradation** — 50% error rate, caching fallback, availability
4. **Canary Rollback** — Version restore, data integrity, <300ms

**Prerequisites:** All canary gates (A, B, C) must PASS before running fire drills.

## Workstream Overview

| WS | Name | Gate | Status | Issue |
|---|---|---|---|---|
| **A** | Budget Ledger DB Wiring | ≥98% tests, <15ms p95, <50ms hooks | 🔴 Kickoff | [#2](https://github.com/sorensencc-dotcom/cic-os/issues/2) |
| **B** | SLO Controller + Prometheus | 100% scrape, ±1% accuracy, <200ms abort | 🟡 Staged | [#3](https://github.com/sorensencc-dotcom/cic-os/issues/3) |
| **C** | Adapter Gateway Caching | ≥85% hit-rate, <40ms p99, no stampedes | 🟡 Staged | [#4](https://github.com/sorensencc-dotcom/cic-os/issues/4) |

## M2 Gate Decision Matrix

### Pass Conditions
- ✅ All three workstream canary gates PASS
- ✅ All fire drill scenarios PASS
- ✅ No critical blockers open
- ✅ No unresolved test failures

### Fail Conditions
- ❌ Any canary gate FAILS
- ❌ Any fire drill FAILS
- ❌ Open blocker issues exist
- ❌ Test pass rate < 98%

## Execution Timeline

```
Today (WS-A Kickoff)
├─ WS-A team begins (DB schema, write path)
├─ Run canary gates daily: npm run canary-gates:A
└─ When A passes → B/C activate (parallel)

When A/B/C Complete
├─ Final gate validation (all three must pass)
├─ Fire drill execution (4 scenarios, serial)
└─ M2 gate decision (pass/fail for promotion)

Target: 2026-06-22 18:00 UTC
```

## File Structure

```
/c/dev/
├── scripts/
│   ├── canary-gates.ts       # Main validation harness
│   └── fire-drills.ts        # Resilience testing harness
├── canary-gates-config.json  # Gate thresholds & scenarios
├── CANARY_GATES.md           # Detailed usage & troubleshooting
├── docs/m2/
│   ├── M2_FRAMEWORK.md       # This file
│   ├── WS-A.md               # Budget Ledger specifications
│   ├── WS-B.md               # SLO Controller specifications
│   └── WS-C.md               # Cache Gateway specifications
└── package.json              # npm scripts (canary-gates:*, fire-drills)
```

## Integration Points

### With CI/CD
Add to GitHub Actions before promotion:

```yaml
- name: Canary Gates — All Workstreams
  run: |
    npm run canary-gates:A
    npm run canary-gates:B
    npm run canary-gates:C

- name: Fire Drills
  run: npm run fire-drills

- name: M2 Gate Decision
  if: success()
  run: echo "✅ M2 PASS — Ready for production"
```

### With Monitoring
Gates export JSON reports with timestamps, metrics, and decisions:

```json
{
  "timestamp": "2026-06-23T03:52:30.662Z",
  "workstream": "A",
  "overallStatus": "pass",
  "gates": [...],
  "summary": { "passed": 7, "failed": 0, "warnings": 0 }
}
```

## References

- **WS-A:** [Budget Ledger DB Wiring](WS-A.md) — Database schema, write API, governance hooks
- **WS-B:** [SLO Controller + Prometheus](WS-B.md) — Metrics, burn-rate, SLO enforcement
- **WS-C:** [Adapter Gateway Caching](WS-C.md) — L1/L2 cache, hit-rate, load testing
- **Configuration:** `canary-gates-config.json` — Editable thresholds per workstream
- **Detailed Docs:** `CANARY_GATES.md` — Troubleshooting, debugging, edge cases
- **GitHub Issues:** #2 (WS-A), #3 (WS-B), #4 (WS-C)
