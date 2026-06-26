# Model Lifecycle

CIC OS manages models through five stages:

## 1. Development
- Local testing
- Schema compliance
- Tool compatibility

### Transition to Evaluation
✅ Smoke tests pass
✅ Schema compliant
✅ Tool calls compatible

## 2. Evaluation
- Full Model Evaluation Harness
- Replay Harness (deterministic testing)
- Drift Engine analysis
- Baseline comparison

### Transition to Canary
✅ Golden tasks pass
✅ Replay tests pass
✅ Drift score < 0.35
✅ No regressions

## 3. Canary
### Phase 1: Shadow Mode
- Model runs in parallel
- No traffic routed
- Metrics collected for 24h
- Drift score < 0.35?

### Phase 2: 1% Traffic
- 1% of tasks routed to new model
- Metrics tracked for 24h
- Drift score < 0.35?
- No regressions?

### Phase 3: 10% Traffic
- 10% of tasks routed to new model
- Metrics tracked for 24h
- Drift score < 0.40?
- No golden task failures?

### Phase 4: Full Rollout
- 100% traffic to new model
- Promotion Gate approval required

## 4. Production
- Model fully promoted
- Stable for 24h
- Drift score < 0.35
- Monitoring active

## 5. Archive
- Model retired/replaced
- Traces preserved
- Baselines stored
- Available for replay

## Rollback Triggers

Auto-rollback if:
- Drift score > 0.50
- Regressions detected
- Golden task failures
- Replay harness failures
- Canary phase failure

## Promotion Gate

Blocks promotion if:
- Regressions detected
- Golden tasks failed
- Replay failures
- High drift (score > 0.50)

Warns if:
- Medium drift (0.35 < score < 0.50)
