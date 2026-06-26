# CIC ↔ VS Code Session State Machine

## States

- **INIT**
- **QUEUED**
- **RUNNING**
- **PAUSED**
- **COMPLETED**
- **FAILED**
- **CANCELLED**

## Transitions

- **INIT → QUEUED**
  - *Trigger:* `session/create` accepted by CIC.
- **QUEUED → RUNNING**
  - *Trigger:* CIC starts processing (orchestrator assigns agents).
- **RUNNING → PAUSED**
  - *Trigger:* user pause, approval gate, missing input.
- **PAUSED → RUNNING**
  - *Trigger:* user resume, approval granted.
- **RUNNING → COMPLETED**
  - *Trigger:* CIC marks task done (macro-loop finished).
- **RUNNING → FAILED**
  - *Trigger:* unrecoverable error, exceeded retries.
- **ANY → CANCELLED**
  - *Trigger:* user cancels session.

## VS Code UI Mapping

- **INIT:** input form active, no spinner.
- **QUEUED:** spinner + “Queued” badge.
- **RUNNING:** spinner + phase indicator (INGEST / ENRICH / ORCHESTRATE / SYNTHESIZE / AUDIT).
- **PAUSED:** pause icon + reason (approval gate, missing data).
- **COMPLETED:** checkmark + summary.
- **FAILED:** error icon + message.
- **CANCELLED:** strike-through + “Cancelled”.

## RPC Events

- `notification/session/update`:

```json
{
  "jsonrpc": "2.0",
  "method": "notification/session/update",
  "params": {
    "sessionId": "sess-1234",
    "state": "RUNNING",
    "phase": "ORCHESTRATE",
    "progress": 0.4,
    "checkpoint": "tests-executed"
  }
}
```

- `notification/session/complete`:

```json
{
  "jsonrpc": "2.0",
  "method": "notification/session/complete",
  "params": {
    "sessionId": "sess-1234",
    "state": "COMPLETED",
    "summary": {}
  }
}
```
