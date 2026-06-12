# Phase 0.7 Inference Routing Specification
**Nemotron Nano 30B + NIM Gateway + Rewrite Labs Redesign GPU**

Phase 0.7 introduces a unified inference layer that connects:

- **Rewrite Labs Redesign GPU agent**
- **Nemotron Nano 30B runtime**
- **NIM Gateway microservice**
- **CIC Observability + Lineage**

This document defines routing, schemas, and policies governing all inference traffic.

---

## 1. Inference Architecture

```
[labs.redesign.gpu]
        │
        │  inference.requests
        ▼
[inference.nemotron]  ◄────►  [nim.gateway]
        │
        │  cic.telemetry (mirrored)
        ▼
[CIC Observability]
```

### Key principles

- Only `labs.redesign.gpu` may call inference
- All traffic flows through `inference.requests`
- All responses mirrored to `cic.telemetry`
- All calls generate CIC lineage entries
- NIM Gateway handles batching, retries, model selection

---

## 2. Channels

### 2.1 inference.requests
Primary request channel.

| Field | Value |
|-------|--------|
| Encoding | JSON |
| Visibility | internal |
| Retention | 24h |
| Policy | cic.routing, cic.agent |

### 2.2 cic.telemetry
Mirrors all inference for observability.

---

## 3. Request Schema

```json
{
  "id": "uuid",
  "timestamp": "2026-06-11T23:02:00Z",
  "agent_id": "labs.redesign.gpu",
  "phase": "0.7",
  "payload": {
    "prompt": "Generate a modern redesign...",
    "context": {
      "site_id": "example.com",
      "blocks": ["header", "nav", "hero"],
      "layout": "grid"
    }
  }
}
```

---

## 4. Response Schema

```json
{
  "id": "uuid",
  "timestamp": "2026-06-11T23:02:00Z",
  "model": "nemotron-nano-30b",
  "output": {
    "text": "redesign text",
    "tokens": 512
  },
  "lineage": {
    "request_id": "uuid",
    "agent_id": "labs.redesign.gpu"
  }
}
```

---

## 5. NIM Gateway

### 5.1 Endpoint
```
POST /v1/inference
```

### 5.2 Responsibilities
- Batch requests
- Retry transient failures
- Enforce rate limits
- Select model variant
- Normalize responses
- Emit telemetry

### 5.3 Example request
```json
{
  "model": "nemotron-nano-30b",
  "prompt": "Generate a redesign...",
  "max_tokens": 2048,
  "temperature": 0.2
}
```

---

## 6. Policy Enforcement

Only redesign GPU may call inference:

```rego
deny {
  input.channel == "inference.requests"
  input.from != "labs.redesign.gpu"
}
```

---

## 7. Observability

Every inference call generates:

- Latency metrics
- Token usage
- Model version
- Prompt hash
- Response hash
- Drift signature

---

## Summary

Phase 0.7 inference routing is:
- Zero-trust
- Policy-governed
- Fully traceable
- Lineage-aware
- Observable

Only redesign GPU can call inference.
All traffic is mirrored and auditable.
