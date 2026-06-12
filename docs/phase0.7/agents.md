# Phase 0.7 Unified Agents
**CIC + Rewrite Labs + Nemotron/NIM**

Phase 0.7 formalizes every build target as a **CIC-registered agent**.
Agents are first-class participants in the CIC ecosystem, each with:

- Deterministic Dockerfile
- SBOM + provenance
- CIC lineage record
- Health endpoint
- Telemetry endpoint
- Policy pack
- Dependency graph entry
- Execution mode (CPU/GPU)

---

## 1. Agent Index

| Agent ID | Subsystem | Runtime | Description |
|----------|-----------|---------|-------------|
| `cic.ingestion` | CIC | CPU | Ingests external data into CIC |
| `cic.evolution` | CIC | CPU | Evolves CIC internal structures |
| `labs.discovery` | Rewrite Labs | CPU | Finds candidate websites |
| `labs.extractor` | Rewrite Labs | CPU | Extracts structure + content |
| `labs.redesign.gpu` | Rewrite Labs | GPU | Generates redesigns using Nemotron |
| `labs.outreach` | Rewrite Labs | CPU | Generates outreach packets |
| `inference.nemotron` | Inference | GPU | Nemotron Nano 30B runtime |
| `nim.gateway` | Inference | CPU | NIM microservice interface |

---

## 2. CIC Agents

### 2.1 cic.ingestion
Ingests external data into CIC. Validates and normalizes input.

**Runtime:** CPU
**Dockerfile:** `build-system/docker/cic/Dockerfile.ingestion`
**Depends on:** code
**Capabilities:** ingest, normalize, validate

### 2.2 cic.evolution
Evolves CIC internal structures. Transforms and optimizes state.

**Runtime:** CPU
**Dockerfile:** `build-system/docker/cic/Dockerfile.evolution`
**Depends on:** code
**Capabilities:** evolve, transform, optimize

---

## 3. Rewrite Labs Agents

### 3.1 labs.discovery
Finds candidate websites. Crawls, classifies, scores.

**Runtime:** CPU
**Dockerfile:** `build-system/docker/labs/Dockerfile.discovery`
**Depends on:** code
**Capabilities:** crawl, classify, score

### 3.2 labs.extractor
Extracts structure and content from websites.

**Runtime:** CPU
**Dockerfile:** `build-system/docker/labs/Dockerfile.extractor`
**Depends on:** labs.discovery
**Capabilities:** parse, extract, structure

### 3.3 labs.redesign.gpu
Generates redesigns using Nemotron inference.

**Runtime:** GPU
**Dockerfile:** `build-system/docker/labs/Dockerfile.redesign.gpu`
**Depends on:** labs.extractor, inference.nemotron
**Capabilities:** redesign, inference, layout

### 3.4 labs.outreach
Generates outreach packets for redesigned sites.

**Runtime:** CPU
**Dockerfile:** `build-system/docker/labs/Dockerfile.outreach`
**Depends on:** labs.redesign.gpu
**Capabilities:** generate, personalize, deliver

---

## 4. Inference Agents

### 4.1 inference.nemotron
Nemotron Nano 30B runtime for inference.

**Runtime:** GPU
**Dockerfile:** `build-system/docker/inference/Dockerfile.nemotron-nano-30b`
**Depends on:** code
**Capabilities:** inference, tokenize, quantize

### 4.2 nim.gateway
NIM microservice gateway for inference.

**Runtime:** CPU
**Dockerfile:** `build-system/docker/inference/Dockerfile.nim-gateway`
**Depends on:** inference.nemotron
**Capabilities:** route, batch, serve

---

## 5. Agent Registration

Each agent registers itself on startup:

1. POST `/cic/registry/agents`
2. Include: agent spec, version, lineage schema, capabilities
3. CIC adds to Observability
4. CIC tracks lineage
5. CIC monitors drift
6. CIC enforces policies

---

## Summary

Every agent in Phase 0.7 is a first-class citizen in CIC.
Fully traceable, fully governed, fully observable.
