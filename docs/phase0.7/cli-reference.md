# Phase 0.7 CIC CLI Command Reference
**Roadmap Manager + Build Executor + Lineage + Drift + Routing + Observability**

This reference defines every operator-facing CLI command available in Phase 0.7.
These commands are deterministic, idempotent, and aligned with CIC governance.

---

## 1. Roadmap Queue Manager (RQM)

The **roadmap-queue-manager** orchestrates the Phase 0.7 build graph.

### 1.1 Validate Graph
```
roadmap-queue-manager validate
```
Checks: graph integrity, routing table, policy packs, node definitions, graph hash.

### 1.2 Process Full Roadmap
```
roadmap-queue-manager process
```
Executes entire Phase 0.7 DAG.

### 1.3 Resume Execution
```
roadmap-queue-manager resume
```
Resumes from last known state in `state.json`.

### 1.4 Reset Node
```
roadmap-queue-manager reset labs.redesign.gpu
```

### 1.5 Explain Node
```
roadmap-queue-manager explain labs.redesign.gpu
```
Shows: dependencies, downstream, capabilities, policies.

### 1.6 View Logs
```
roadmap-queue-manager logs labs.extractor
```

---

## 2. Build Queue Executor (BQX)

### 2.1 Single Agent Build
```bash
/build-queue-executor '{"builds":[{"name":"labs.redesign.gpu"}]}'
```

### 2.2 Multiple Agents
```bash
/build-queue-executor '{
  "builds":[
    {"name":"labs.discovery"},
    {"name":"labs.extractor"}
  ]
}'
```

### 2.3 Build Without Push
```bash
/build-queue-executor '{"builds":[{"name":"cic.evolution"}],"pushOnComplete":false}'
```

---

## 3. CIC Lineage CLI

### 3.1 View Lineage
```
cic lineage show labs.redesign.gpu
```

### 3.2 View Specific Build
```
cic lineage show --build build-20260611-230200
```

### 3.3 Diff Builds
```
cic lineage diff labs.extractor --from build-20260610-112300 --to build-20260611-230200
```

### 3.4 Roll Back
```
cic lineage rollback labs.redesign.gpu --to build-20260610-112300
```

---

## 4. CIC Drift CLI

### 4.1 Inspect Drift
```
cic drift inspect labs.redesign.gpu
```

### 4.2 View Drift Diff
```
cic drift diff labs.redesign.gpu --dockerfile
```

### 4.3 Approve Drift
```
cic drift approve labs.redesign.gpu
```

### 4.4 Reset Drift
```
cic drift reset labs.redesign.gpu
```

---

## 5. CIC Routing CLI

### 5.1 Show Routing Table
```
cic routing show
```

### 5.2 Validate Routing
```
cic routing validate
```

### 5.3 Show Violations
```
cic routing violations
```

---

## 6. CIC Observability CLI

### 6.1 Agent Health
```
cic obs health
```

### 6.2 Inference Metrics
```
cic obs inference
```

### 6.3 Routing Events
```
cic obs routing
```

### 6.4 Drift Summary
```
cic obs drift
```

---

## 7. CIC Agent Registry CLI

### 7.1 List Agents
```
cic registry list
```

### 7.2 Show Agent Details
```
cic registry show labs.extractor
```

### 7.3 Validate Registration
```
cic registry validate labs.redesign.gpu
```

---

## Summary Table

| Category | Command | Purpose |
|----------|---------|---------|
| Roadmap | `validate` | Validate graph |
| Roadmap | `process` | Run full DAG |
| Roadmap | `resume` | Resume DAG |
| Build | `/build-queue-executor` | Deterministic builds |
| Lineage | `lineage show` | View ancestry |
| Lineage | `lineage diff` | Compare builds |
| Drift | `drift inspect` | Inspect drift |
| Routing | `routing show` | View routing |
| Obs | `obs health` | Agent health |
| Registry | `registry list` | Registered agents |
