# Workstream C: Adapter Gateway Caching

L1 in-memory cache with LRU eviction, L2 distributed cache (Redis), invalidation rules, and hit-rate optimization.

**Issue:** [#4](https://github.com/sorensencc-dotcom/cic-os/issues/4)  
**Gate Target:** 2026-06-22 18:00 UTC  
**Status:** 🟡 Staged (starts after WS-A canary passes)

## Acceptance Criteria

| Criterion | Threshold | Type |
|---|---|---|
| Test Pass Rate | ≥98% | Critical |
| Cache Hit-Rate | ≥85% | Critical |
| Load Test P99 Latency | <40ms | Critical |
| Cache Stampede Prevention | 0 incidents | Critical |
| Stale Data Rate | 0% (no data beyond TTL) | Critical |
| Open Blockers | 0 | Critical |

## Implementation Checklist

### 1. L1 In-Memory Cache (`src/adapter-gateway/cache.ts`)
- [ ] Implement cache with TTL + LRU eviction
- [ ] `get(key)` → value or null (check expiry)
- [ ] `set(key, value)` → void (update LRU, evict if full)
- [ ] `invalidate(key)` → void
- [ ] Track hit/miss/eviction metrics
- [ ] Unit tests ≥15

### 2. L2 Distributed Cache (Redis)
- [ ] Initialize Redis client (host/port configurable)
- [ ] `get(key)` → async fetch from Redis
- [ ] `set(key, value, ttl)` → async store in Redis
- [ ] `invalidate(key)` → async delete from Redis
- [ ] Connection pooling for performance
- [ ] Unit tests ≥10

### 3. Unified Cache Hierarchy
- [ ] L1 hit → return immediately
- [ ] L1 miss → check L2
- [ ] L2 hit → populate L1 + return
- [ ] L2 miss → caller fetches from origin
- [ ] Invalidation cascades (both L1 + L2)
- [ ] Integration tests ≥8

### 4. Cache Invalidation Rules
- [ ] Invalidate on ledger updates (WS-A dependency)
- [ ] Invalidate on SLO violations (WS-B dependency)
- [ ] TTL-based expiry (automatic)
- [ ] Manual invalidation API
- [ ] Tests ≥5

### 5. Cache Stampede Prevention
- [ ] Detect concurrent misses for same key
- [ ] Deduplicate: first request fetches, others wait
- [ ] Return cached result to all waiters
- [ ] No N parallel origin calls for same miss
- [ ] Tests ≥5

### 6. Metrics Collection
- [ ] Track hit/miss/eviction counts
- [ ] Calculate hit-rate percentage
- [ ] Measure latency (L1, L2, origin)
- [ ] Export to Prometheus (via WS-B)
- [ ] Metrics tests ≥5

### 7. Load Testing
- [ ] Test hit-rate under normal load (baseline)
- [ ] Test hit-rate under 3x spike
- [ ] Test hit-rate under 5x spike
- [ ] Measure p95/p99 latency
- [ ] Validate no stale data beyond TTL
- [ ] Load tests ≥3

## Canary Gate Command

```bash
npm run canary-gates:C
```

**Output example:**
```
✅ Test Pass Rate: 98.8% >= 98%
✅ Cache Hit-Rate: 87.3% >= 85%
✅ Load Test P99 (Cache): 38ms <= 40ms
✅ Cache Stampede Prevention: 0 stampedes detected
✅ Stale Data Rate: 0% == 0%
✅ Open Blockers: 0 == 0

Decision: 🟢 GATE PASSES - Ready for promotion
```

## Skeleton File

Use as starting point:

- `src/adapter-gateway/cache.ts` — L1Cache, L2Cache, unified AdapterGatewayCache (TODO stubs)

## Testing Strategy

### Unit Tests (≥25)
- L1 cache: get, set, invalidate, eviction, TTL
- L2 cache: async operations, connection handling
- Unified cache: hierarchy logic, cascading invalidation
- Stampede prevention: concurrent miss deduplication

### Integration Tests (≥8)
- End-to-end: cache miss → origin fetch → L1/L2 populate
- Invalidation cascades
- L1 miss → L2 hit flow
- L1 full → LRU eviction + new set

### Load Tests (≥3)
- Normal load (baseline hit-rate)
- 3x spike (hit-rate under sustained load)
- 5x spike (burst, memory pressure)

**Commands:**
```bash
npm test -- --testNamePattern="cache"
npm test -- --testNamePattern="stampede"
```

## Deployment Checklist

Before marking WS-C complete:

- [ ] All tests passing (≥98%)
- [ ] Hit-rate ≥85% (normal load)
- [ ] P99 latency <40ms
- [ ] No cache stampedes detected
- [ ] No stale data (TTL enforced)
- [ ] No open blockers
- [ ] Canary gate returns PASS
- [ ] Code reviewed

## Parallel Execution

WS-C runs **in parallel** with WS-B after WS-A passes.

**Timeline:**
- WS-A completes → WS-B/C begin simultaneously
- Both should complete by gate target (2026-06-22 18:00 UTC)

## Configuration

Cache config in `src/adapter-gateway/cache.ts` or via environment:

```typescript
const config: CacheConfig = {
  l1MaxSize: 10000,        // max entries in L1
  l1TTL: 300,              // 5 minutes
  l2Enabled: true,
  l2Host: 'localhost',
  l2Port: 6379,
  stampedePrevention: true,
};
```

## Dependencies

### WS-A (Budget Ledger)
- Listen to ledger write events
- Invalidate affected cache entries on budget changes

### WS-B (SLO Controller)
- Listen to SLO violation events
- Invalidate cache on SLO breaches (optional, depends on semantics)

## References

- **Main Framework:** [M2_FRAMEWORK.md](M2_FRAMEWORK.md)
- **Canary Gates:** `npm run canary-gates:C`
- **Configuration:** `canary-gates-config.json` (WS-C section)
- **Detailed Docs:** [CANARY_GATES.md](../../CANARY_GATES.md)
