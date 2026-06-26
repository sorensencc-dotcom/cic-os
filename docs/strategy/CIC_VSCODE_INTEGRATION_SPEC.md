# CIC ↔ VS Code Integration Specification v1.0

This specification defines the integration architecture, communication protocol, and UX flows for connecting the **Conversational Intelligence Core (CIC)** system-level brain with **VS Code** as the developer cockpit.

---

## 1. Architectural Overview

The integration follows a strict **Split-Brain Cockpit** model. CIC remains the sovereign system-level execution engine (managing state, tools, pipeline coordination, and safety rails), while VS Code acts as an interactive client interface.

```mermaid
graph TD
    subgraph VS Code (Cockpit)
        UI[Agents Panel / Editor View] <--> VSC_Ext[VS Code CIC Extension]
        VSC_Ext <--> Client_Session[Session / UI State Manager]
    end

    subgraph Transport (CIC-VSC-RPC)
        IPC[JSON-RPC over IPC / WebSocket]
    end

    subgraph CIC Engine (Brain)
        Server[CIC Integration Daemon] <--> Registry[Agent Registry]
        Server <--> Orchestrator[Orchestrator / Router]
        Orchestrator <--> State[State Manager & Checkpoints]
        Orchestrator <--> AgentInstances[Agent Instances]
    end

    Client_Session <--> IPC
    IPC <--> Server
```

---

## 2. Adapter Layer Specification

The Adapter Layer exposes CIC agents dynamically into VS Code's native agent runtime. It abstracts CIC's phase-based execution into standard agent provider interfaces.

### 2.1 Interface Mapping

In VS Code's extension host, we declare a `CICAgentProvider` that implements the standard agent interface:

```typescript
interface CICAgentProvider {
  id: string; // e.g., 'cic-harvester'
  displayName: string;
  description: string;
  supportedModels: string[];
  
  // Initiates execution session in CIC
  createSession(options: SessionOptions): Promise<CICSession>;
}

interface CICSession {
  sessionId: string;
  
  // Sends message/prompt into the CIC pipeline
  submitPrompt(prompt: string, progress: ProgressCallback): Promise<ExecutionResult>;
  
  // Cancel current execution phase
  cancel(): Promise<void>;
  
  // Cleans up session and informs daemon
  dispose(): void;
}
```

### 2.2 Daemon Registration
Upon startup, the VS Code extension spawns or connects to the `cic-daemon`. The daemon query exposes available agents registered in the CIC ecosystem:

1. VS Code queries `GET /registry/agents` or sends JSON-RPC `agent/list`.
2. VS Code registers a custom agent provider for each agent returned.
3. User interactions in the Agents window are forwarded directly to the daemon.

---

## 3. Communication Protocol (CIC-VSC-RPC)

The communication uses JSON-RPC 2.0 over WebSocket (port 8520) or local IPC.

### 3.1 Session Creation (`session/create`)

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "session/create",
  "params": {
    "agentId": "cic.agents.retrieval.harvester",
    "workspaceRoot": "c:/dev",
    "env": {
      "MODEL_PREFERENCE": "gemini-3.5-flash"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "sessionId": "sess_8f3a1d9c_2b4e",
    "status": "idle"
  }
}
```

### 3.2 Task Dispatch / Prompt Submit (`session/submit`)

Used when a user submits a prompt, or triggers background dispatch via `Alt+Enter`.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "session/submit",
  "params": {
    "sessionId": "sess_8f3a1d9c_2b4e",
    "prompt": "Harvest the last 10 session logs and extract any pipeline failure reasons.",
    "context": {
      "activeFile": "c:/dev/docs/roadmap/CIC_SUBROADMAP_v3.0.md",
      "cursorLine": 12
    }
  }
}
```

**Response (Immediate Ack):**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "invocationId": "inv_4c7d9a1e_7f0b",
    "initialPhase": "validate"
  }
}
```

### 3.3 Event Notifications (Server → Client)

#### Phase Transition (`notification/phase/transition`)
Sent when CIC transitions from one phase to another.
```json
{
  "jsonrpc": "2.0",
  "method": "notification/phase/transition",
  "params": {
    "sessionId": "sess_8f3a1d9c_2b4e",
    "invocationId": "inv_4c7d9a1e_7f0b",
    "previousPhase": "validate",
    "currentPhase": "execute",
    "timestamp": "2026-06-13T21:40:02Z"
  }
}
```

#### Log Streaming (`notification/log/stream`)
Real-time logs or markdown output chunks streamed to the panel.
```json
{
  "jsonrpc": "2.0",
  "method": "notification/log/stream",
  "params": {
    "sessionId": "sess_8f3a1d9c_2b4e",
    "invocationId": "inv_4c7d9a1e_7f0b",
    "stream": "stdout",
    "chunk": "### [execute] Running ripgrep search for pipeline errors...\nFound 3 occurrences."
  }
}
```

#### Verification Gate Request (`notification/gate/approval`)
Sent when a high-stakes action requires operator confirmation (e.g. executing code, modifying config files).
```json
{
  "jsonrpc": "2.0",
  "method": "notification/gate/approval",
  "params": {
    "sessionId": "sess_8f3a1d9c_2b4e",
    "invocationId": "inv_4c7d9a1e_7f0b",
    "gateId": "gate_file_write_098",
    "message": "Write to c:/dev/package.json?",
    "diff": {
      "file": "c:/dev/package.json",
      "changes": [
        {
          "type": "modify",
          "line": 4,
          "old": "  \"version\": \"1.6.1\",",
          "new": "  \"version\": \"1.6.2\","
        }
      ]
    }
  }
}
```

**VS Code Response (Approve / Reject):**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "gate/resolve",
  "params": {
    "invocationId": "inv_4c7d9a1e_7f0b",
    "gateId": "gate_file_write_098",
    "approved": true
  }
}
```

---

## 4. Session Mapping Model

Because CIC is a deterministic, phase-based execution engine, its lifetime events must map perfectly to the VS Code UI timeline.

| CIC State / Event | VS Code UI Equivalent | Description |
|---|---|---|
| Router initialized | Session Start | Panel opens, showing active agent details. |
| `validate` Phase | Input Verification | Spinner with "Validating schemas and inputs..." |
| `plan` Phase | Thinking Step | Shows planned steps, file locks, and resource budgets. |
| `execute` Phase | Progress Stream | Active task steps tick off. Logs stream to Output channel. |
| Checkpoint written | Savepoint Tick | Timeline shows a savepoint marker (user can roll back to this step). |
| `review` Phase | Self-Audit | Shown as "Auditing output against rules..." |
| `emit` Phase | Output Render | Panel populates with the final markdown or artifact view. |
| Router finished | Session Completed | Interactive console inputs re-enable. |

```
CIC Pipeline Timeline:
[validate] ──▶ [plan] ──▶ [execute] (checkpoint A) ──▶ [review] ──▶ [emit] (checkpoint B)
    │             │            │                         │            │
VS Code Timeline UI:
 Spinner ──▶ Plan Tree ──▶ Active Steps / Diff ────────▶ Audit Check ──▶ Finished Output
```

---

## 5. UI/UX Flow & Gestures

### 5.1 Keyboard Shortcuts
- `Alt+Enter` (in editor): **Background Dispatch**. Sends the selected code block or prompt directly to the active CIC agent session without interrupting focus.
- `Ctrl+R` (global): **CIC Session Picker**. A QuickPick input listing active, pending, or archived CIC sessions. Shows state (`Running`, `Waiting Approval`, `Completed`).
- `Ctrl+Shift+U` ➔ select "CIC Output": Switches directly to the streaming log console of the current phase.

### 5.2 Interface Panels

#### The Cockpit Interface
1. **Agents Sidebar**: Lists registered CIC agents (e.g. `CIC Harvester`, `Outreach Redesigner`).
2. **Session Timeline View**: Displays execution phases visually. High-stakes checkpoints can be clicked to inspect local variables/states at that exact time.
3. **Approval overlay**: Intercepts high-risk tasks. Displays a clean, side-by-side Git diff directly in the editor window, asking the operator to `Approve` or `Reject` before CIC proceeds.

---

## 6. Agent Registration Schema

CIC exposes its agent manifests using JSON Schema, allowing VS Code to validate inputs locally before transmitting the payload to the daemon.

### 6.1 Unified Registration Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://cic.internal/schemas/agent-registration.json",
  "title": "AgentRegistration",
  "type": "object",
  "properties": {
    "agentId": {
      "type": "string",
      "pattern": "^cic\\.agents\\.[a-z_\\.]+$"
    },
    "displayName": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "version": {
      "type": "string"
    },
    "inputSchema": {
      "type": "object",
      "description": "JSON Schema governing input structure"
    },
    "outputSchema": {
      "type": "object",
      "description": "JSON Schema governing output structure"
    },
    "slo": {
      "type": "object",
      "properties": {
        "max_retries": { "type": "integer" },
        "timeout_ms": { "type": "integer" }
      }
    },
    "permissions": {
      "type": "object",
      "properties": {
        "read": { "type": "array", "items": { "type": "string" } },
        "write": { "type": "array", "items": { "type": "string" } },
        "forbidden": { "type": "array", "items": { "type": "string" } }
      }
    }
  },
  "required": ["agentId", "displayName", "description", "version", "inputSchema", "outputSchema"]
}
```

---
*Maintained by the CIC-VSC Working Group.*
