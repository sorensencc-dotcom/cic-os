# Phase 0.7 Unified Build Graph
**CIC + Rewrite Labs + Nemotron/NIM**

Phase 0.7 introduces a unified build graph that merges CIC agents, Rewrite Labs subsystems, and the Nemotron/NIM inference runtime into a single deterministic execution model. This graph is consumed by:

- **build-queue-executor** (local deterministic builds)
- **github-actions-setup** (governance + audit)
- **roadmap-queue-manager** (multi-phase orchestration)

---

## 1. Overview

The unified build graph is a **directed acyclic graph (DAG)** representing all Phase 0.7 agents:

- CIC ingestion
- CIC evolution
- Labs discovery
- Labs extractor
- Labs redesign (GPU)
- Labs outreach
- Nemotron/NIM inference

Each node produces:

- A deterministic Docker image
- SBOM + provenance
- CIC lineage record
- Structured logs

---

## 2. Graph Diagram

```
[code] 
  ├─> [cic.ingestion]
  ├─> [cic.evolution]
  ├─> [labs.discovery]
  ├─> [inference.nemotron]
        │
        └──────────────┐
                         ▼
                 [labs.extractor]
                         ▼
                 [labs.redesign.gpu]
                         ▼
                 [labs.outreach]

All nodes ──> CIC Lineage Registry
All nodes ──> CIC Observability
```

---

## 3. Machine-Readable Graph

Graph location: `phase0.7/build-system/graph/phase0.7.json`

This JSON file defines:

- Node definitions
- Dependencies
- Capabilities
- Policies
- Sinks (lineage, observability)

The file is consumed by:

- roadmap-queue-manager
- github-actions-setup
- build-queue-executor
- CIC Agent Registry

---

## 4. How Automation Skills Use the Graph

### 4.1 build-queue-executor
Reads the graph, selects nodes, executes Docker builds in dependency order.

### 4.2 github-actions-setup
Converts graph nodes into GitHub workflow jobs with immutable audit trail.

### 4.3 roadmap-queue-manager
Loads graph, maps nodes to phases, tracks completion state, ensures dependency ordering.

---

## 5. Node Specification

Each node defines:

| Field | Description |
|-------|-------------|
| `id` | Unique agent identifier |
| `depends_on` | Upstream nodes |
| `dockerfile` | Deterministic Dockerfile path |
| `runtime` | CPU or GPU |
| `capabilities` | Agent capabilities |
| `policies` | OPA policy packs |

---

## 6. Execution Flow

1. Roadmap Manager loads graph from `phase0.7.json`
2. Dependencies resolved via topological sort
3. Execution mode selected (local or governed)
4. Each node builds → produces artifacts → registers with CIC
5. CIC records lineage, observability, drift signals

---

## 7. Integration Points

### CIC
- Lineage
- Observability
- Drift detection
- Agent registry

### Rewrite Labs
- Discovery → Extractor → Redesign → Outreach pipeline

### Nemotron/NIM
- Model runtime
- Tokenizer
- Inference endpoints

---

## Summary

The unified build graph is the source of truth for Phase 0.7 execution.
Every build, every agent, every dependency flows through this graph.
