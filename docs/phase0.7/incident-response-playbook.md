# Phase 0.7 Incident Response Playbook
**CIC + Rewrite Labs + Nemotron/NIM**

This playbook defines the **exact operator actions** required when Phase 0.7 enters a degraded or failed state.
Designed for high-pressure, time-sensitive situations where clarity matters.

---

## 1. Incident Classification

| Severity | Description | Fix Time |
|----------|-------------|----------|
| **SEV-1** | System down | < 5 min |
| **SEV-2** | Major degradation | < 30 min |
| **SEV-3** | Minor degradation | < 2 hrs |
| **SEV-4** | Cosmetic | No deadline |

---

## 2. SEV-1 Procedures

### 2.1 Nemotron Offline
**Symptoms**: No inference responses, Redesign GPU stuck

**Actions**
```
cic obs inference
docker restart nemotron
```

### 2.2 Routing Failure
**Symptoms**: Messages dropped, "Unauthorized route" alerts

**Actions**
```
cic routing violations
cic registry validate <agent>
```

### 2.3 Lineage Corruption
**Symptoms**: Missing parent build, lineage reject

**Actions**
```
cic lineage repair <agent>
```

---

## 3. SEV-2 Procedures

### 3.1 GPU Saturation
Reduce batch size, scale Nemotron, restart redesign GPU.

### 3.2 Extractor Crash Loop
Patch parser, rebuild extractor, reset node.

---

## 4. SEV-3 Procedures

### 4.1 Drift Warnings
```
cic drift inspect <agent>
cic drift approve <agent>
```

### 4.2 Routing Intermittency
Validate agent registration, validate routing table, restart agent.

---

## 5. Post-Incident

- Root cause analysis
- Lineage verification
- Drift verification
- Policy validation
- Update incident log
