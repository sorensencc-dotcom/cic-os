# Phase 1.0 Full System Diagrams
**Multi-Page • Layered • Narrative**

---

## Executive Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                CIC CORE                                  │
│  Governance • Drift • Lineage • Routing • Self-Healing • Observability   │
└───────────────┬──────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           REWRITE LABS PIPELINE                          │
│  Discovery → Extractor → Redesign Engine 2.0 → Outreach Engine 2.0       │
└───────────────┬──────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           INFERENCE LAYER                                │
│      Nemotron Nano 30B • NIM Gateway • Multi-Model Hot-Swap              │
└───────────────┬──────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                  CLOSED-LOOP OPTIMIZATION ENGINE (CLOE)                  │
│   Variant Scoring • Prompt Tuning • Extractor Tuning • Outreach Scoring  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Rewrite Labs Pipeline (Detailed)

```
Discovery → Extractor → Redesign Engine 2.0 → Outreach Engine 2.0
   │          │              │                      │
   ├─ Crawl   ├─ Parse       ├─ Multi-variant      ├─ Personalize
   ├─ Score   ├─ Semantics   ├─ Layout             ├─ Multi-touch
   └─ Class   └─ Structure   ├─ Industry           └─ A/B test
                              └─ Scoring
```

---

## Inference Layer

```
Redesign Engine 2.0
        │ prompt
        ▼
NIM Gateway (batch, normalize, telemetry)
        │
        ▼
Nemotron Nano 30B (multi-model, hot-swap)
        │ output
        ▼
Redesign Engine 2.0
```

---

## CLOE Feedback Loop

```
Outreach Performance (opens, clicks, replies)
        │
        ▼
CLOE Scoring Engine
  - Variant scoring
  - Prompt tuning
  - Extractor tuning
  - Routing recommendations
        │
        ▼
Redesign Engine 2.0 (next iteration)
```

---

## CIC Governance Spine

```
Drift Engine → Lineage Registry → Routing Engine (PRE) → Self-Healing Engine
```

---

## Summary

Phase 1.0 is self-improving, self-healing, fully autonomous.
CIC governs. Rewrite Labs executes. Nemotron generates. CLOE optimizes.
