# CIC OS Architecture

## High-Level Overview

CIC OS is a layered intelligence runtime with strict separation of concerns:

```text
[Operators]
    ↓
[Governance Layer]
    ↓
[Lifecycle & Deployment]
    ↓
[Evaluation & Drift]
    ↓
[Safety & Mutation]
    ↓
[Execution & Agents]
    ↓
[Telemetry & Bundles]
```

## Core Subsystems

### 1. Governance Layer
- Governance Manifest — Operational rules
- Autonomy Boundary — What CIC can/cannot do
- Constitutional Court — Interprets governance
- Governance Ledger — Immutable audit chain
- Agent Oath — Binding preamble for all agents

### 2. Lifecycle & Deployment
- Model Lifecycle — Five stages (dev → eval → canary → prod → archive)
- Lifecycle Controller — Automates transitions
- Canary Strategy — Phased rollout
- Promotion Gate — Blocks unsafe promotions
- Rollback Protocol — Triggered on drift/regression

### 3. Evaluation & Drift
- Model Evaluation Harness — Validates new models
- Autonomous Model Evaluator — Agents evaluating agents
- Replay Harness — Deterministic test suite
- Drift Rules Engine v2 — Behavioral drift detection
- Drift Profiles v2 — Per-agent drift tolerances

### 4. Safety & Mutation
- Safety Sandbox — Tool-call isolation
- Safety Fuzzer — Adversarial testing
- Fuzzer Corpus — Malformed/adversarial inputs
- Mutation Framework — Test robustness

### 5. Execution & Agents
- North Terminal Agent — Command execution
- North Repo Agent — Code editing
- North System Map Agent — Architecture mapping
- Claude Architect Agent — Reasoning
- Gemini Frontend Agent — UI logic

### 6. Telemetry & Bundles
- Canary Telemetry Schema — Metrics during rollout
- Telemetry Collector — Ingests all signals
- Replay Bundle — Traces + baselines + diffs
- Governance Ledger — All decisions recorded

## Data Flow

1. Task submission → Classifier (determines kind)
2. Router → Selects appropriate agent
3. Evaluation → Model Evaluation Harness runs
4. Drift computation → Drift Engine compares to baseline
5. Promotion decision → Promotion Gate (drift < 0.35?)
6. Canary deployment → Canary Strategy phases
7. Telemetry collection → All metrics logged
8. Ledger recording → Immutable record

## Key Properties

- Deterministic — temp=0, topK=1, reproducible
- Safe — All tool calls sandboxed
- Auditable — Complete trace history
- Governed — Constitutional constraints
- Self-Healing — Autonomous rollback
- Evolvable — Can improve itself within bounds
