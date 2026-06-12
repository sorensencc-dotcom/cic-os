# Phase 0.8: Adaptive Routing Engine (PRE)

**Predictive Routing Engine for Rewrite Labs**

## Overview

Phase 0.8 extends Phase 0.7 deterministic builds with adaptive routing. The system learns from build results, variant performance, and inference metrics to dynamically adjust:

1. Agent routing decisions (which nodes execute, in what order)
2. Inference parameters (model selection, temperature, context size)
3. Channel prioritization (fast vs. thorough paths)
4. Fallback strategies (when main route fails)

## Core Components

### 1. PerformanceStore
Tracks metrics from every build execution:
- Execution time per node
- Inference quality scores
- Variant performance (clicks, conversions)
- Error rates by route
- Resource usage (CPU, memory, GPU)

**Storage:** PostgreSQL time-series table
**Retention:** 90 days rolling window
**Queries:** By agent, by route, by time window

### 2. PredictiveRoutingEngine (PRE)
Analyzes performance data to generate routing recommendations:

**Inputs:**
- Current build context (complexity, size, model)
- Historical performance for similar builds
- Resource availability

**Outputs:**
- Best route for current build (with confidence score)
- Fallback routes (ordered by likelihood of success)
- Estimated execution time
- Estimated cost (GPU hours, tokens)

**Algorithm:** Weighted scoring based on:
- Historical success rate for this route + context
- Execution time trend (improving/degrading)
- Resource availability
- Recency bias (recent data weighted higher)

### 3. RouteOptimizer
Dynamically adjusts routing based on real-time feedback:

**Decision Points:**
- Pre-execution: Choose route based on context + history
- Mid-execution: Switch route if current node slow/failing
- Post-execution: Record results, update model

**Learning Loop:**
```
Build → Execute → Measure → Update Model → Next Build
```

### 4. InferenceParameterTuner
Learns optimal inference settings per build type:

**Adjustable Parameters:**
- Model (Nemotron base vs. fine-tuned variants)
- Temperature (creativity: 0.0-1.0)
- Max tokens (context size: 256-8192)
- Top-k, top-p (sampling strategy)
- Beam search (exploration vs. exploitation)

**Tuning Strategy:**
- A/B test different parameters on variant generation
- Track quality metrics (semantic coherence, layout validity, conversion)
- Converge to optimal settings per build type
- Periodically explore new parameters (10% exploration)

## Data Structures

### BuildMetrics
```typescript
{
  build_id: string;
  agent_id: string;
  execution_time_ms: number;
  success: boolean;
  quality_score: 0-100;
  resource_usage: {
    cpu_percent: number;
    memory_mb: number;
    gpu_hours: number;
    tokens_used: number;
  };
  inference_params: {
    model: string;
    temperature: number;
    max_tokens: number;
  };
  route: string;
  timestamp: ISO8601;
}
```

### VariantMetrics
```typescript
{
  variant_id: string;
  build_id: string;
  model: string;
  inference_params: {};
  quality_score: 0-100;
  outreach_metrics: {
    open_rate: 0-100;
    click_rate: 0-100;
    reply_rate: 0-100;
    conversion_rate: 0-100;
  };
  timestamp: ISO8601;
}
```

## Implementation Phases

### Phase 0.8.1: PerformanceStore + Data Collection
- Extend LineageRegistry to track metrics
- Add PostgreSQL schema for time-series
- Wire metrics collection into BuildExecutor
- 2 days

### Phase 0.8.2: PredictiveRoutingEngine Core
- Implement scoring algorithm
- Add route recommendation API
- Create unit tests (15+ scenarios)
- 3 days

### Phase 0.8.3: RouteOptimizer
- Mid-execution route switching logic
- Fallback mechanism
- Integration tests with Phase 0.7 DAG
- 2 days

### Phase 0.8.4: InferenceParameterTuner
- A/B testing framework
- Parameter convergence algorithm
- Model selection logic
- 3 days

### Phase 0.8.5: Learning Dashboard + Monitoring
- Grafana dashboards (execution time trend, quality trend)
- Alerts (route degradation, model drift)
- CLI commands (`cic build metrics`, `cic build recommend`)
- 2 days

### Phase 0.8.6: Integration + Testing
- End-to-end tests (50+ builds, verify learning)
- Performance validation (10% faster than Phase 0.7)
- 2 days

## Success Criteria

1. **Routing Accuracy:** PRE recommendations match best historical route 85%+ of the time
2. **Performance:** Builds run 10% faster than Phase 0.7 via adaptive routing
3. **Quality:** Variant quality scores improve 15% via parameter tuning
4. **Reliability:** No degradation in success rate; fallback routes work 95%+ of the time
5. **Monitoring:** All 4 components tracked in Grafana with alerts

## Timeline

- **Start:** 2026-06-15 (Week 1, parallel to Phase 24 governance)
- **Completion:** 2026-06-29 (15 days)
- **Parallel tracks:** Skill contribution pipeline (Phase 28a), TorqueQuery (Phase 26)

## Dependencies

- Phase 0.7: Complete ✓
- Phase 24.3: MemoryStore (for storing metrics)
- Phase 24.5: Build governance (lineage integration)

## Risks + Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Parameter tuning causes worse performance | High | A/B test on 10% traffic, rollback circuit breaker |
| Route switching mid-execution fails | High | Ensure fallback routes always available |
| Metrics collection overhead slows builds | Medium | Async metric writes, batch inserts |
| Model drift (old data no longer valid) | Medium | Weekly recompute of scoring model |

## Deliverables

1. `cic/src/build-system/performance-store.ts` (150 lines)
2. `cic/src/build-system/predictive-routing-engine.ts` (300 lines)
3. `cic/src/build-system/route-optimizer.ts` (250 lines)
4. `cic/src/build-system/inference-parameter-tuner.ts` (280 lines)
5. `cic/src/build-system/__tests__/pre-*.test.ts` (600+ lines, 50+ tests)
6. `docs/phase0.8/*.md` (4 docs: overview, API, metrics, dashboard)
7. Grafana dashboard (JSON)
8. PostgreSQL migrations (metrics tables)

## Version

- Phase: 0.8
- Status: Specification Locked
- Created: 2026-06-12
- Execution Start: 2026-06-15
