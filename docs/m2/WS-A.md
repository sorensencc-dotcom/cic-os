# Workstream A: Budget Ledger DB Wiring

Budget ledger database integration, write path implementation, and governance hook wiring.

**Issue:** [#2](https://github.com/sorensencc-dotcom/cic-os/issues/2)  
**Gate Target:** 2026-06-22 18:00 UTC  
**Status:** 🔴 Kickoff

## Acceptance Criteria

| Criterion | Threshold | Type |
|---|---|---|
| Test Pass Rate | ≥98% | Critical |
| Schema Validation | budget_ledger_v3 exists + valid | Critical |
| Ledger Write Latency (p95) | <15ms | Critical |
| Governance Hook Latency | <50ms | Critical |
| Write Success Rate | ≥99.5% | Critical |
| Open Blockers | 0 | Critical |

## Implementation Checklist

### 1. Database Schema
- [ ] Create `budget_ledger_v3` schema
- [ ] Define ledger entry structure (id, budget_id, operation, amount, timestamp, etc.)
- [ ] Add indexes for performance (budget_id, timestamp)
- [ ] Write schema validation tests
- [ ] Run `npm run canary-gates:A` → Schema check passes

### 2. DB Client Module
- [ ] Create TypeScript client (deterministic retries, pooling)
- [ ] Implement `writeLedgerEntry(entry)` → Promise<boolean>
- [ ] Implement `readLedgerEntries(budget_id, window)` → Promise<Entry[]>
- [ ] Add structured logging (JSON, op_id, ledger_id)
- [ ] Unit tests ≥20 (write success/failure, latency, retries)

### 3. Write Path Integration
- [ ] Wire ingestion → ledger write on budget operations
- [ ] Implement read-after-write consistency checks
- [ ] Add rollback hooks for failed writes
- [ ] Integration tests ≥12 (end-to-end write flow, consistency)

### 4. Governance Hook Wiring
- [ ] Expose governance callback interface
- [ ] Wire ledger writes → governance events
- [ ] Measure hook latency (<50ms)
- [ ] Fire events within 50ms (p95)
- [ ] Governance tests ≥8

### 5. Load Testing
- [ ] Write 3 load scenarios (normal, spike 3x, spike 5x)
- [ ] Measure p95/p99 latency
- [ ] Validate ledger survives 3x load
- [ ] p95 must be <15ms under normal load
- [ ] Load tests ≥3

### 6. Metrics Registration
- [ ] Register ledger metrics (writes/sec, failures/sec, drift)
- [ ] Export to Prometheus (via observability module)
- [ ] Add health check for ledger connectivity
- [ ] Metrics tests ≥5

## Canary Gate Command

```bash
npm run canary-gates:A
```

**Output example:**
```
✅ Test Pass Rate: 98.45% >= 98%
✅ Schema Validation: budget_ledger_v3 found
✅ Load Test P95 (Ledger): 12ms <= 15ms
✅ Governance Hook Latency: 38ms <= 50ms
✅ Open Blockers: 0 == 0

Decision: 🟢 GATE PASSES - Ready for promotion
```

## Testing Strategy

### Unit Tests (≥20)
- DB client write/read operations
- Retry logic
- Connection pooling
- Error handling

### Integration Tests (≥12)
- End-to-end write flow
- Read-after-write consistency
- Rollback on write failure
- Governance event firing

### Load Tests (≥3)
- Normal load (baseline)
- 3x spike (sustained)
- 5x spike (burst)

**Command:**
```bash
npm test -- --testNamePattern="ledger"
```

## Deployment Checklist

Before marking WS-A complete:

- [ ] All tests passing (≥98%)
- [ ] No schema drift (migrations applied)
- [ ] Load tests stable (p95 <15ms)
- [ ] Governance hooks firing consistently (<50ms)
- [ ] No open blockers
- [ ] Canary gate returns PASS
- [ ] Code reviewed

## Next Phase

After WS-A passes canary gate → WS-B/C activate in parallel.

## References

- **Main Framework:** [M2_FRAMEWORK.md](M2_FRAMEWORK.md)
- **Canary Gates:** `npm run canary-gates:A`
- **Configuration:** `canary-gates-config.json` (WS-A section)
- **Detailed Docs:** [CANARY_GATES.md](../../CANARY_GATES.md)
