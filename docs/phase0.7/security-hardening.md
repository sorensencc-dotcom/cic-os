# Phase 0.7 Security & Policy Hardening Guide
**CIC Governance + Rewrite Labs + Nemotron/NIM + Runtime Security**

Phase 0.7 introduces a unified, deterministic, multi-agent system.
This guide defines the **security posture**, **policy boundaries**, and **hardening requirements** for all agents, runtimes, and pipelines.

---

## 1. Security Principles

Phase 0.7 enforces:

- **Deterministic builds**
- **Zero-trust routing**
- **Immutable lineage**
- **Strict policy enforcement**
- **Runtime isolation**
- **GPU boundary protection**
- **Model integrity guarantees**
- **No cross-phase leakage**

Every agent, every message, every build, every inference call is governed.

---

## 2. Build-Time Hardening

### 2.1 No network after dependency stage
All Dockerfiles must:

- Install dependencies in a dedicated stage
- Disable network access in build stages
- Use pinned versions only

### 2.2 SBOM + provenance required
Every build must produce:

- `sbom.json`
- `provenance.json`
- `dockerfile_hash`
- `dependency_hash`

### 2.3 Base image pinning
No `latest`.
No floating tags.
No implicit upgrades.

---

## 3. Runtime Hardening

### 3.1 Mandatory Healthchecks
Every agent must expose:

```
/health
```

CIC refuses to route messages to unhealthy agents.

### 3.2 Mandatory Telemetry
Every agent must expose:

```
/telemetry
```

Telemetry includes:

- CPU/GPU usage
- Memory usage
- Error counts
- Routing stats
- Drift signatures

### 3.3 Read-only root filesystem
All runtime containers must run with:

```
--read-only
```

### 3.4 No shell access
Containers must not include:

- bash
- sh
- curl
- wget

Unless explicitly required by policy.

---

## 4. Routing Hardening

### 4.1 Zero-trust routing
All routing is validated by:

- `cic.routing.rego`
- `cic.agent.rego`
- `cic.lineage.rego`

No agent can send a message unless:

- The route is explicitly allowed
- The channel is explicitly allowed
- The phase is `"0.7"`
- The agent is registered

### 4.2 No wildcard fan-out
Except telemetry mirroring.

### 4.3 No cross-phase communication
Agents in Phase 0.7 cannot talk to:

- Phase 0.6
- Phase 0.8
- Experimental agents

---

## 5. Inference Hardening

### 5.1 Only redesign GPU may call inference
OPA enforces:

```
deny if input.from != "labs.redesign.gpu"
```

### 5.2 Model integrity
Nemotron/NIM must provide:

- Weight hash
- Tokenizer hash
- Config hash

CIC verifies these on registration.

### 5.3 GPU isolation
Nemotron runs in a dedicated GPU namespace:

- No shared memory
- No cross-container GPU access
- No host-level CUDA access

### 5.4 Prompt sanitization
Redesign GPU must sanitize:

- HTML
- JavaScript
- CSS
- URLs

before sending to inference.

---

## 6. Lineage Hardening

### 6.1 Immutable lineage
Once submitted, lineage cannot be modified.

### 6.2 Required fields
OPA enforces:

- `artifact_id`
- `build_id`
- `provenance.git_sha`
- `provenance.sbom_ref`
- `drift_signature`

### 6.3 Parent/child chain enforcement
Lineage must form a complete chain:

- extractor → redesign → outreach
- redesign → inference
- ingestion → evolution

### 6.4 Drift enforcement
Hard drift blocks builds:

- Dockerfile drift
- Dependency drift
- Model drift
- Policy drift

---

## 7. Summary

Phase 0.7 security posture:

- Deterministic
- Immutable
- Governed
- Zero-trust
- Drift-aware
- Fully observable

This is the security baseline for all future phases.
