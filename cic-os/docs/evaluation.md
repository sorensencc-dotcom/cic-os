# Evaluation & Drift

CIC OS evaluates models through multiple mechanisms:

## Model Evaluation Harness

Runs:
1. **Normalize Traces** — Standardize inputs
2. **Run Golden Tasks** — Test on canonical tasks
3. **Run Replay** — Deterministic test suite
4. **Compute Drift** — Compare to baseline
5. **Compare Baseline** — Performance metrics
6. **Generate Diffs** — Visual comparison

Output: evaluation_report.json + summary

## Replay Harness

Deterministic testing:
- Loads historical traces
- Replays them through current agent stack
- Compares results to baseline
- Emits regression report

Compares:
- Latency
- Token usage
- Tool-call count
- Output structure

## Drift Engine v2

Weighted drift scoring:

driftScore = 
  (0.25 * latencyDrift) +
  (0.15 * tokensInDrift) +
  (0.15 * tokensOutDrift) +
  (0.20 * toolCallDrift) +
  (0.25 * semanticDrift)

Thresholds:
- drift > 0.35 → flag
- drift > 0.50 → quarantine
- drift > 0.70 → block

## Drift Profiles v2

Per-agent drift tolerances:

### Terminal Agent
- Latency: 25%
- Tokens Out: 30%
- Tool Calls: 20%
- Quarantine: 0.50

### Repo Agent
- Latency: 20%
- Tokens Out: 35%
- Tool Calls: 25%
- Quarantine: 0.45

### System Map Agent
- Latency: 30%
- Tokens Out: 40%
- Tool Calls: 10%
- Quarantine: 0.55

## Baseline Tracking

Maintained baseline:

Latency (ms):
  p50: 180, p90: 260, p99: 350

Tokens In:
  p50: 2200, p90: 6000, p99: 12000

Tokens Out:
  p50: 350, p90: 900, p99: 1500

Tool Calls:
  p50: 3, p90: 6, p99: 10
