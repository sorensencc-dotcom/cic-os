# Phase 0.7 Routing Architecture
**CIC ↔ Rewrite Labs ↔ Nemotron/NIM**

Routing defines how agents communicate across CIC, Rewrite Labs, and the inference subsystem.
Phase 0.7 standardizes routing into a **deterministic, observable, policy-governed message fabric**.

---

## 1. Routing Overview

Phase 0.7 uses a **channel-based routing model**:

- Each agent publishes to one or more channels
- Downstream agents subscribe to those channels
- CIC Observability mirrors all channels
- CIC Lineage records all message flows

This creates a fully traceable, auditable, deterministic execution graph.

---

## 2. Logical Routing

```
[CIC Ingestion] ──cic.events──────────────► [CIC Evolution]
[CIC Evolution] ──labs.discovery.requests► [Labs Discovery]
[Labs Discovery] ──labs.extractor.requests► [Labs Extractor]
[Labs Extractor] ──labs.redesign.requests► [Labs Redesign GPU]
[Labs Redesign GPU] ──labs.outreach.requests► [Labs Outreach]

[Labs Redesign GPU] ──inference.requests──► [Nemotron/NIM]

[*] ──cic.telemetry──────────────────────► [CIC Observability]
```

---

## 3. Machine-Readable Routing

Location: `phase0.7/build-system/routing/phase0.7-routing.yaml`

Defines:

- From agent
- To agent
- Channel name
- Encoding (JSON, Protobuf)
- Retention policy
- Visibility

---

## 4. Routing Rules

### 4.1 Deterministic Ordering
Messages processed in order. No reordering unless explicitly allowed.

### 4.2 No Cross-Phase Leakage
Agents only publish to Phase 0.7 channels.

### 4.3 Policy Enforcement
Validated by `cic.routing.rego`.

### 4.4 Observability Mirroring
Every message mirrored to `cic.telemetry`.

---

## 5. Channel Specification

| Channel | From | To | Encoding | Retention |
|---------|------|----|-----------|-----------| 
| cic.events | ingestion | evolution | JSON | 24h |
| labs.discovery.requests | evolution | discovery | JSON | 24h |
| labs.extractor.requests | discovery | extractor | JSON | 24h |
| labs.redesign.requests | extractor | redesign.gpu | JSON | 24h |
| labs.outreach.requests | redesign.gpu | outreach | JSON | 24h |
| inference.requests | redesign.gpu | nemotron | JSON | 24h |
| cic.telemetry | * | observability | JSON | 7d |

---

## 6. Message Format

All messages use the CIC envelope:

```json
{
  "id": "uuid",
  "timestamp": "2026-06-11T23:02:00Z",
  "agent_id": "labs.extractor",
  "phase": "0.7",
  "payload": { },
  "lineage": {
    "build_id": "build-20260611-230200",
    "artifact_id": "labs.extractor:0.7.0-20260611-01"
  }
}
```

---

## Summary

Phase 0.7 routing is:
- Deterministic
- Policy-governed
- Zero-trust
- Fully observable
- Lineage-aware

Every message is traceable from source to sink.
