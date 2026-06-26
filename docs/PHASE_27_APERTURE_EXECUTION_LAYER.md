# Phase 27: Aperture — CRO Execution Substrate

**Version:** 1.0.0 (RFC)  
**Date:** 2026-06-20  
**Status:** Specification Locked  
**Parent Phase:** Phase 27 (CRO Runtime Orchestrator)  
**Depends on:** Phase 24 (Governance), Phase 26 (TorqueQuery)

---

## 1. Scope

Aperture is the deterministic, policy-governed execution substrate that enables CRO (Runtime Orchestrator) to run controlled operations across multiple backends (shell, file, HTTP, browser, model LLMs).

Every operation is:
- **Validated** against registry
- **Authorized** via policy engine
- **Executed** in sandbox isolation
- **Audited** with execution receipts
- **Telemetered** to event bus

---

## 2. Core Components

### 2.1 Adapter Registry (AR)

**Purpose:** Single source of truth for all executable operations.

**Definition:**
```typescript
interface AdapterDefinition {
  // Unique identifier: {category}.{operation}
  id: string;                    // e.g., "shell.exec", "http.get"
  
  // Descriptive metadata
  name: string;
  description: string;
  category: "shell" | "file" | "http" | "browser" | "model";
  
  // I/O contracts
  inputSchema: JSONSchema;       // Validated against this
  outputSchema: JSONSchema;      // Adapter returns this shape
  
  // Resource & safety constraints
  policy: {
    cost: number;                // Credits/energy cost
    maxExecutionMs: number;       // Timeout
    maxRetries: number;           // Retry budget
    deterministic: boolean;       // Is output reproducible?
  };
  
  // Which agents can use this?
  accessControl: {
    allowedAgents?: string[];    // Whitelist (if empty = public)
    requiresApproval?: boolean;  // Needs governance gate
  };
  
  // Adapter runtime
  implementation: {
    module: string;              // e.g., "adapters/shell.js"
    version: string;             // Semantic version
    environment?: Record<string, string>;
  };
}
```

**Registry Operations:**
- `register(def: AdapterDefinition)` — add/update adapter
- `lookup(id: string)` → `AdapterDefinition | null`
- `listByCategory(cat: string)` → `AdapterDefinition[]`
- `validate(id: string, input: any)` → `{ valid: boolean; errors?: string[] }`

**v1 Registry Adapters:**
- `shell.exec` (restricted)
- `shell.spawn` (optional)
- `file.read`
- `file.write`
- `file.list`
- `http.get`
- `http.post`
- `http.head`
- `browser.navigate`
- `browser.extract`
- `browser.screenshot`
- `model.generate`
- `model.embed`

---

### 2.2 Policy Engine (PE)

**Purpose:** Declarative authorization layer. Enforces what agents can do, how much they can do it, under which constraints.

**Definition:**
```yaml
# Phase 27 policy format
policy:
  name: agent-policy-name
  agent: harvester
  version: "1.0.0"
  
  # Allowed operations (whitelist)
  allow:
    - http.get
    - file.write
    - model.generate
  
  # Explicitly forbidden (blacklist)
  deny:
    - shell.exec
    - browser.navigate
  
  # Execution constraints
  limits:
    max_calls: 50              # Max operations per invocation
    max_bytes: 5242880         # 5MB output cap
    max_concurrent: 3          # Parallelism limit
    max_depth: 4               # Nested adapter calls
    rate_limit_qps: 10         # Queries per second
  
  # Credential scoping
  credentials:
    http_headers:              # Allowed HTTP headers (e.g., auth)
      - Authorization
      - User-Agent
    allowed_domains:           # Whitelist for HTTP adapters
      - api.example.com
      - cdn.example.com
  
  # Safety rules
  safety:
    no_destructive: true       # Disallow rm, delete, etc.
    require_approval_for:
      - file.write
      - model.generate
    min_approval_confidence: 0.8  # Governance gate threshold
  
  # Audit trail
  audit:
    log_all: true
    sample_rate: 1.0           # 100% logging
    redact_fields:
      - Authorization
      - api_key
```

**Policy Engine Interface:**
```typescript
interface PolicyEngine {
  load(policyYaml: string): void;
  
  authorize(
    agent: string,
    adapterId: string,
    input: any
  ): {
    allowed: boolean;
    reason?: string;           // Why denied
    cost?: number;             // Estimated credit cost
  };
  
  checkLimits(
    agent: string,
    stat: "calls" | "bytes" | "depth" | "qps"
  ): {
    ok: boolean;
    current: number;
    limit: number;
  };
  
  preApproval(
    agent: string,
    adapterId: string
  ): boolean;                  // Does this op need governance approval?
}
```

---

### 2.3 Execution Orchestrator (EO)

**Purpose:** Validates, executes, and receipts every operation.

**Execution Flow:**
```
1. Agent calls: orchestrator.execute(adapterId, input, context)
2. Registry lookup: adapter exists?
3. Policy check: agent allowed? Within limits?
4. Pre-approval: needs governance gate? (Phase 24 integration)
5. Sandbox create: ephemeral environment
6. Adapter invoke: run within sandbox
7. Output normalize: match outputSchema
8. Receipt emit: {adapter, status, latency, bytes, ...}
9. Event bus: log to CIC Event Bus (observability)
10. Sandbox teardown: cleanup
```

**Execution Receipt:**
```typescript
interface ExecutionReceipt {
  // Identity
  id: string;                        // UUID
  timestamp: ISO8601;
  traceId: string;                   // Links to parent invocation
  
  // Execution context
  adapter: {
    id: string;                      // e.g., "http.get"
    version: string;
  };
  agent: string;                     // Which agent ran this?
  policy: string;                    // Which policy governed it?
  
  // Input & output
  input: {
    params: any;
    size_bytes: number;
  };
  output: {
    result: any;
    size_bytes: number;
    schema_valid: boolean;
  };
  
  // Execution metrics
  status: "success" | "failed" | "timeout" | "denied";
  latency_ms: number;
  retries: number;
  
  // Error context
  error?: {
    code: string;                    // E.g., "POLICY_VIOLATION", "TIMEOUT"
    message: string;
    stack?: string;
  };
  
  // Policy enforcement
  policy_check: {
    authorized: boolean;
    reason?: string;
    approval_required: boolean;
    approval_status?: "pending" | "approved" | "rejected";
  };
  
  // Audit trail
  sandbox: {
    id: string;
    isolation_level: "ephemeral" | "shared";
    cleanup_status: "success" | "failed";
  };
}
```

**Orchestrator Interface:**
```typescript
interface ExecutionOrchestrator {
  execute(
    adapterId: string,
    input: any,
    context: {
      agent: string;
      traceId?: string;
      approvalGate?: ApprovalGate;  // From Phase 24
    }
  ): Promise<{
    receipt: ExecutionReceipt;
    output: any;
  }>;
  
  bulkExecute(
    operations: ExecutionRequest[],
    context: ExecutionContext
  ): Promise<ExecutionReceipt[]>;
}
```

---

### 2.4 Adapter Sandbox Runtime (ASR)

**Purpose:** Isolated execution environment. Prevents agent interference & host leakage.

**Sandbox Lifecycle:**
```
1. Create: ephemeral tmpdir, env vars, fd limits, memory/cpu quotas
2. Populate: copy credentials (scoped by policy), mount volumes (read-only)
3. Execute: run adapter with constraints
4. Capture: stdout/stderr, exit code, resource usage
5. Teardown: rm -rf tmpdir, revoke creds, close fds
```

**Sandbox Contract:**
```typescript
interface SandboxRuntime {
  create(spec: {
    agent: string;
    policy: PolicyDefinition;
    memoryQuotaMb: number;
    cpuQuotaPercent: number;
    ephemeralOnly: boolean;        // No persistent storage
  }): Promise<SandboxHandle>;
  
  execute<T>(
    handle: SandboxHandle,
    fn: () => Promise<T>
  ): Promise<T>;
  
  teardown(handle: SandboxHandle): Promise<void>;
}
```

**Isolation Guarantees:**
- No cross-agent process visibility
- No shared temp dirs
- Scoped credential injection (no overpermissioning)
- Read-only mounts for safe assets
- Resource hard limits (OOM/CPU throttle)
- Deterministic cleanup (sync on teardown)

---

### 2.5 Adapter Interface (v1)

**All adapters implement:**
```typescript
interface Adapter {
  // Static metadata
  metadata(): {
    id: string;
    name: string;
    version: string;
  };
  
  // Validation
  validate(input: any): {
    valid: boolean;
    errors?: string[];
  };
  
  // Execution (runs in sandbox)
  execute(
    input: any,
    sandbox: SandboxHandle,
    options?: ExecutionOptions
  ): Promise<any>;
  
  // Schema for this adapter
  schema(): {
    input: JSONSchema;
    output: JSONSchema;
  };
}
```

**v1 Adapters:**

#### shell.exec
- Input: `{ command: string; args: string[]; timeout?: number }`
- Output: `{ stdout: string; stderr: string; exitCode: number }`
- Policy: Restricted by default. Requires explicit allow.

#### file.read
- Input: `{ path: string; encoding?: "utf8" | "binary" }`
- Output: `{ data: string; size: number; mtime: ISO8601 }`

#### file.write
- Input: `{ path: string; data: string; mode?: "w" | "a" }`
- Output: `{ path: string; size: number; success: boolean }`

#### http.get / http.post
- Input: `{ url: string; headers?: Record<string, string>; timeout?: number }`
- Output: `{ status: number; headers: Record<string, string>; body: string; size: number }`

#### browser.navigate / browser.screenshot
- Input: `{ url: string; waitSelector?: string; timeout?: number }`
- Output: `{ html: string; screenshot?: base64 }`

#### model.generate
- Input: `{ prompt: string; model?: string; maxTokens?: number }`
- Output: `{ text: string; tokens: number; model: string }`

---

## 3. Integration Points

### 3.1 Phase 24 Governance

**Approval gates:**
- Adapters marked `requiresApproval: true` route through `ApprovalGate.request()`
- Policy engine checks `preApproval()` before execution
- Receipt includes `approval_status: "pending" | "approved" | "rejected"`

### 3.2 Event Bus & Observability

**All receipts emit to CIC Event Bus:**
```json
{
  "event_type": "adapter_execution",
  "adapter": "http.get",
  "agent": "harvester",
  "status": "success",
  "latency_ms": 142,
  "timestamp": "2026-06-20T13:02:11Z"
}
```

Prometheus metrics:
- `aperture_adapter_invocations_total{adapter, status}`
- `aperture_adapter_latency_seconds{adapter, quantile}`
- `aperture_policy_denials_total{agent, reason}`
- `aperture_sandbox_teardown_failures_total`

---

## 4. Phase 27 Milestones

| Milestone | Deliverable | Owner | Duration |
|-----------|-------------|-------|----------|
| M1 | Registry + Policy Engine spec locked | Arc | 2d |
| M2 | Orchestrator + Sandbox runtime (stubs) | Arc | 3d |
| M3 | Adapter implementations (v1) | Arc | 4d |
| M4 | Integration tests + observability | Arc | 3d |
| M5 | CRO wiring + Phase 28 readiness | Arc | 2d |
| **Total** | **~14 days** | | |

---

## 5. Exit Criteria

- [ ] Registry covers all 13 v1 adapters
- [ ] Policy engine validates 100% of operations
- [ ] Orchestrator deterministic (same input = same receipt)
- [ ] Sandbox isolation verified (no cross-agent leakage)
- [ ] 60+ integration tests passing
- [ ] All adapters comply with schema validation
- [ ] Event bus integration live
- [ ] Zero nondeterministic behavior
- [ ] Observability dashboard shows adapter metrics
- [ ] Documentation complete (RFC + API docs)

---

## 6. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Policy explosion (too many configs) | Sealed default policies per agent type; override via whitelist only |
| Sandbox overhead (slow execution) | Reuse sandbox pool; lazy init |
| Approval bottleneck (Phase 24 sync) | Async approval; operations queue until approved |
| Determinism loss (env vars, timestamps) | Freeze env at sandbox create; deterministic clock |

---

## 7. Success Metrics

- **Adapter success rate:** >99.5% (policy-enforced ops only)
- **Median adapter latency:** <500ms (excluding I/O)
- **Receipt correctness:** 100% (audit-verified)
- **Policy denial precision:** 0 false negatives (all violations caught)
- **Sandbox cleanup:** 100% success
- **Test coverage:** >90% (unit + integration)

