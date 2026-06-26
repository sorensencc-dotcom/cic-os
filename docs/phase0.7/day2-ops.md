# Phase 0.7 Day-2 Ops Guide
**Running CIC + Rewrite Labs + Nemotron/NIM in Production**

Phase 0.7 introduces a deterministic, multi-agent, GPU-accelerated pipeline.
Day-2 Ops is everything that happens *after* deployment.

---

## 1. Daily Operator Checklist

### 1.1 Agent Health
```
cic obs health
```
All agents should be ONLINE.

### 1.2 Inference Latency
```
cic obs inference
```
p99 latency should remain stable.

### 1.3 Drift Summary
```
cic obs drift
```
No hard drift should appear unexpectedly.

### 1.4 Routing Violations
```
cic routing violations
```
Should be empty.

### 1.5 Lineage Completeness
```
cic lineage show labs.redesign.gpu
```

---

## 2. Weekly Operator Checklist

### 2.1 Rebuild Agents with Fresh Provenance
```
roadmap-queue-manager process
```

### 2.2 Validate Policies
```
conftest test .
```

### 2.3 Validate Graph Integrity
```
roadmap-queue-manager validate
```

### 2.4 GPU Health Check
- Temperature
- Memory fragmentation
- Utilization patterns

---

## 3. Monthly Operator Checklist

### 3.1 Model Integrity Verification
```
sha256sum model.bin
```

Compare against:

- Previous month
- CIC registry
- NIM Gateway metadata

### 3.2 Policy Pack Rotation
Policies should be version-bumped monthly.

### 3.3 Drift Baseline Refresh
```
cic drift approve labs.redesign.gpu
```

### 3.4 Lineage Archive Rotation
Archive lineage older than 90 days (but never delete).

---

## 4. Scaling Procedures

| Agent | Bound By | When to Scale |
|-------|----------|---------------|
| Discovery | CPU | Load > 80% |
| Extractor | CPU + Memory | Queue > 5 |
| Redesign GPU | GPU | Utilization > 85% |
| Nemotron | GPU | Batch queue > 8 |
| NIM Gateway | CPU | Throughput > 500/s |

---

## 5. Drift Management

### Expected Drift
- OS patch updates
- CUDA minor bumps
- Dependency updates
- SBOM changes

Approve:
```
cic drift approve <agent>
```

### Unexpected Drift
Block builds until resolved.

---

## 6. Incident Response (Quick Reference)

| Issue | Command |
|-------|---------|
| Hard drift | `cic drift inspect <agent>` |
| Routing violation | `cic routing violations` |
| Inference timeout | Restart NIM Gateway |
| Lineage failure | `roadmap-queue-manager reset <agent>` |
| GPU saturation | Scale Nemotron or increase batch size |

---

## Summary

Keep agents healthy. Keep inference fast. Keep lineage complete.
This is the operational backbone of Phase 0.7.
