# Telemetry

CIC OS collects comprehensive telemetry for all agent actions.

## Agent Trace Schema

Every agent outputs:

{
  "agent": {"name", "kind", "model", "version"},
  "task": {"id", "description", "repoRoot", "constraints"},
  "timestamps": {"start", "end", "durationMs"},
  "llm": {"tokensIn", "tokensOut", "latencyMs"},
  "toolCalls": [
    {"tool", "arguments", "result", "latencyMs", "success"}
  ],
  "output": {},
  "errors": [],
  "meta": {"cicVersion", "orchestrator", "routerPath"}
}

## Canary Telemetry

Tracks model behavior during rollout:

- Model name + version
- Canary phase (shadow, 1%, 10%, full)
- Timestamps
- Drift score
- Regressions
- Golden task failures
- Replay failures
- Latency metrics
- Token usage
- Tool call counts
- Traffic percent routed

## Governance Ledger

Immutable record of:
- Constitutional Court decisions
- Evolution Loop decisions
- Lifecycle transitions
- Rollback events
- Promotion events
- Sandbox violations
- Drift threshold violations

Each entry includes:
- Timestamp
- Actor (agent or operator)
- Action taken
- Decision (allow/deny/escalate)
- Reasoning
- Governance articles cited
- SHA256 hash
- Previous hash (chain integrity)

## Telemetry Collector

Aggregates signals every 60 seconds:
- Drift scores
- Regression counts
- Golden task failures
- Latency percentiles
- Token usage percentiles
- Tool call counts
- Traffic routed
- Alerts

Writes to Replay Bundle + Drift Engine + Promotion Gate
