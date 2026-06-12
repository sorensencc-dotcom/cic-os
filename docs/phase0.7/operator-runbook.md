# Phase 0.7 Operator Runbook
**Unified CIC + Rewrite Labs + Nemotron/NIM**

This runbook provides operational procedures, workflows, and troubleshooting steps for running Phase 0.7 end-to-end.

---

## 1. System Overview

Phase 0.7 consists of:

- **CIC Agents**: ingestion, evolution
- **Rewrite Labs Agents**: discovery, extractor, redesign (GPU), outreach
- **Inference Agents**: Nemotron Nano 30B, NIM Gateway
- **Automation Skills**: build-queue-executor, github-actions-setup, roadmap-queue-manager
- **Governance Layer**: OPA policies, CIC lineage, CIC observability

---

## 2. Daily Operator Tasks

### 2.1 Validate graph integrity
```
roadmap-queue-manager validate
```

### 2.2 Run local builds (fast path)
```
/build-queue-executor '{"builds":[{"name":"labs.redesign.gpu"}]}'
```

### 2.3 Run governed builds (audit path)
```
gh workflow run build.yml -f target="labs.redesign.gpu"
```

### 2.4 Process full roadmap
```
/roadmap-queue-manager process
```

---

## 3. Build Execution Flow

1. Load graph from `phase0.7.json`
2. Resolve dependencies (topological sort)
3. Select execution mode (local or governed)
4. Execute each node
5. Update state
6. Register with CIC

---

## 4. Troubleshooting

### 4.1 Node stuck in "pending"
```
roadmap-queue-manager explain labs.redesign.gpu
```

### 4.2 Node stuck in "running"
```
roadmap-queue-manager logs labs.redesign.gpu
```

### 4.3 Build fails locally
```
/build-queue-executor '{"builds":[{"name":"labs.redesign.gpu"}]}'
```

### 4.4 Inference failures
Check NIM Gateway, Nemotron, prompt schema, routing policies.

---

## 5. CIC Observability

### Metrics tracked
- Build latency
- Inference latency
- Token usage
- Drift signatures
- Health status
- Routing violations
- Lineage completeness

### Dashboards
```
Agents → cic.ingestion
Agents → labs.redesign.gpu
Agents → inference.nemotron
```

---

## 6. CIC Lineage

Every build produces:

- `sbom.json`
- `provenance.json`
- `lineage.json`

Lineage links full ancestry.

---

## 7. Policy Enforcement

OPA policies enforce:

- Allowed routes
- Allowed channels
- Allowed base images
- Phase isolation
- Deterministic builds

Run policy checks:

```
conftest test .
```

---

## 8. Recovery Procedures

### 8.1 Resume failed roadmap
```
/roadmap-queue-manager resume
```

### 8.2 Reset a single node
```
/roadmap-queue-manager reset labs.redesign.gpu
```

### 8.3 Full reset
```
/roadmap-queue-manager reset --all
```

### 8.4 Roll back to previous build
```
cic lineage rollback labs.redesign.gpu --to build-20260610-112300
```

---

## Summary

Phase 0.7 operations are:
- Deterministic
- Governed
- Observable
- Recoverable
- Reproducible

Follow these procedures and Phase 0.7 runs clean.
