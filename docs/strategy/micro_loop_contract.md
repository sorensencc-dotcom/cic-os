# Micro-Loop Delegation Contract

## Definitions

- **Micro-loop:** Short, UI-adjacent iterative task (retry small edit, tweak formatting, minor fix).
- **Macro-loop:** Multi-phase CIC pipeline (ingest → enrich → orchestrate → synthesize → audit).

## Principle

- **Micro-loops:** run **client-side** (VS Code extension host).
- **Macro-loops:** run **server-side** (CIC orchestrator).

## Client (VS Code Extension Host) Responsibilities

- Owns:
  - Autopilot micro-loops (≤ 3 iterations).
  - Local edit application (text buffer changes).
  - Small retries on agent suggestions.
- Must:
  - Not spam CIC with each micro-iteration.
  - Only send **finalized intent** to CIC.

### Client → Server Contract

- Client sends **macro-task** requests:

```json
{
  "jsonrpc": "2.0",
  "id": "sess-1234",
  "method": "session/create",
  "params": {
    "kind": "macro",
    "task": "refactor-module",
    "source": "vscode",
    "context": {},
    "microLoopSummary": {
      "appliedEdits": 3,
      "finalStateHash": "<hash>"
    }
  }
}
```

- Client may send **micro-loop summary** but not each step.

## Server (CIC Orchestrator) Responsibilities

- Owns:
  - Multi-phase orchestration.
  - Self-healing loops.
  - State recovery.
  - Durable session timelines.
- Must:
  - Treat micro-loop summaries as **context**, not as events.
  - Not attempt to drive VS Code’s Autopilot.

### Server → Client Contract

- Server sends **macro-level updates** only:

```json
{
  "jsonrpc": "2.0",
  "method": "notification/session/update",
  "params": {
    "sessionId": "sess-1234",
    "phase": "ORCHESTRATE",
    "status": "running",
    "checkpoint": "tests-executed",
    "progress": 0.6
  }
}
```

- Server does **not** send “retry micro-edit” instructions.

## Boundary

- Any task that:
  - touches **editor buffer directly**, or
  - requires **sub-second UI responsiveness**
- → stays **client-side**.

- Any task that:
  - spans **multiple CIC phases**, or
  - requires **durable state / audit**
- → goes **server-side**.
