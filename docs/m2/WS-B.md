# Workstream B: SLO Controller + Prometheus Integration

SLO rule evaluation, burn-rate calculation, Prometheus metrics export, and canary integration.

**Issue:** [#3](https://github.com/sorensencc-dotcom/cic-os/issues/3)  
**Gate Target:** 2026-06-22 18:00 UTC  
**Status:** 🟡 Staged (starts after WS-A canary passes)

## Acceptance Criteria

| Criterion | Threshold | Type |
|---|---|---|
| Test Pass Rate | ≥98% | Critical |
| Prometheus Scrape Success | 100% | Critical |
| Burn-Rate Accuracy | ±1% | Critical |
| Canary Abort Latency | <200ms | Critical |
| Open Blockers | 0 | Critical |

## Implementation Checklist

### 1. SLO Controller Core (`src/slo-controller/`)
- [ ] Load SLO rules from config
- [ ] Collect metrics (latency, error-rate, saturation)
- [ ] Calculate burn rates: `(1 - target) / window`
- [ ] Detect violations (burn-rate > threshold × 2)
- [ ] Emit violation events to canary gates
- [ ] Unit tests ≥20

### 2. Metrics Endpoint (`src/observability/metrics-endpoint.ts`)
- [ ] Implement `/metrics` HTTP endpoint (Prometheus format)
- [ ] Register Prometheus client library
- [ ] Export ledger metrics (writes, failures, latency)
- [ ] Export SLO metrics (violations, burn-rate, thresholds)
- [ ] Export canary metrics (aborts, gate decisions)
- [ ] Add structured logging for all events
- [ ] Unit tests ≥10

### 3. Burn-Rate Evaluator
- [ ] Calculate current burn rate for each SLO
- [ ] Track remaining error budget
- [ ] Estimate budget exhaustion time
- [ ] Compare against threshold (default 2×)
- [ ] Accuracy ±1% (verify against manual calculations)
- [ ] Tests ≥8

### 4. Canary Gate Integration
- [ ] Wire SLO violations → canary gate `onViolation()` callback
- [ ] Trigger abort if burn-rate > 2× threshold
- [ ] Abort completes within 200ms
- [ ] No data loss during abort
- [ ] Integration tests ≥10

### 5. Alerting Hooks
- [ ] Fire alerts on SLO violations
- [ ] Alert on burn-rate > 2× threshold
- [ ] Include metrics snapshot in alert payload
- [ ] Tests ≥5

### 6. Load Testing
- [ ] Test metrics collection under normal load
- [ ] Test burn-rate calculation under spike load
- [ ] Verify scrape success 100%
- [ ] Measure `/metrics` endpoint latency
- [ ] Tests ≥3

## Canary Gate Command

```bash
npm run canary-gates:B
```

**Output example:**
```
✅ Test Pass Rate: 99.2% >= 98%
✅ Prometheus Scrape Success: 100%
✅ Burn-Rate Accuracy: ±0.8% accuracy
✅ Canary Abort Latency: 145ms <= 200ms
✅ Open Blockers: 0 == 0

Decision: 🟢 GATE PASSES - Ready for promotion
```

## Skeleton Files

Use these as starting points:

- `src/slo-controller/types.ts` — SLO types, interfaces
- `src/slo-controller/slo-controller.ts` — Main controller (TODO stubs)
- `src/observability/metrics-endpoint.ts` — Prometheus exporter (TODO stubs)

## Testing Strategy

### Unit Tests (≥30)
- Burn-rate calculation (various targets, windows)
- Violation detection
- Event emission
- Metrics formatting (Prometheus text)

### Integration Tests (≥10)
- End-to-end: SLO rule → burn-rate → canary abort
- Metrics collection from actual operations
- Canary gate integration
- Alert firing

### Prometheus Tests (≥5)
- Scrape endpoint returns valid Prometheus format
- Metrics labels correct
- No missing metrics
- Scrape latency acceptable

**Commands:**
```bash
npm test -- --testNamePattern="slo"
npm test -- --testNamePattern="prometheus"
```

## Deployment Checklist

Before marking WS-B complete:

- [ ] All tests passing (≥98%)
- [ ] Prometheus `/metrics` endpoint reachable
- [ ] Scrape success 100%
- [ ] Burn-rate accuracy ±1%
- [ ] Canary aborts within 200ms
- [ ] No open blockers
- [ ] Canary gate returns PASS
- [ ] Code reviewed

## Parallel Execution

WS-B runs **in parallel** with WS-C after WS-A passes.

**Timeline:**
- WS-A completes → WS-B/C begin simultaneously
- Both should complete by gate target (2026-06-22 18:00 UTC)

## Integration with WS-A

WS-B depends on metrics from WS-A:
- Ledger write latency
- Write success rate
- Governance hook latency

**Dependency:** WS-A canary gate must PASS before WS-B can be validated.

## References

- **Main Framework:** [M2_FRAMEWORK.md](M2_FRAMEWORK.md)
- **Canary Gates:** `npm run canary-gates:B`
- **Configuration:** `canary-gates-config.json` (WS-B section)
- **Detailed Docs:** [CANARY_GATES.md](../../CANARY_GATES.md)
