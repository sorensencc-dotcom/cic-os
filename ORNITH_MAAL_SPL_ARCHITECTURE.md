# Deterministic Agentic Orchestration with Learned Routing

## ORNITH → MAAL → SPL Integration Architecture

**Version:** 1.0  
**Status:** Formal Specification (Ready for Implementation Review)  
**Date:** 2026-06-26  
**Repo Focus:** MAAL routing plane, governance, ledgers, and audit

**See also:** [cic-ingestion/ORNITH_MAAL_SPL_ARCHITECTURE.md](https://github.com/sorensencc-dotcom/cic-ingestion/blob/claude/ornith-cic-maal-mapping-wr9724/ORNITH_MAAL_SPL_ARCHITECTURE.md) for SPL details and BridgeOrchestrator integration.

---

## 1. Executive Summary

This document specifies the **governance and routing plane** layer of a 5-layer deterministic agentic orchestration architecture that fuses:

- **Ornith's self-scaffolding RL training loop** (learned routing policies)
- **MAAL's deterministic routing plane** (local-first, cost-aware, safety-aware) — *this repo's focus*
- **CIC's multi-agent execution substrate** (deterministic, auditable, evidence-sealed)

This layer sits between cic-ingestion's pipeline execution and the learned routing policies, providing:
- Deterministic task fingerprinting
- Routing regime selection
- Cost/latency/safety constraint enforcement
- Fallback graph validation
- Ledger interface for learning loop integration

---

## 2. Formal Learning Loop

```
S_t → A_t → V_t → X_t → R_t → U_t

Where:
- S_t = SPLState (fingerprint + context + history + audit)
- A_t = Scaffold (proposed routing plan from SPL)
- V_t = MAAL validation (hard safety: acyclicity, tool surface, model whitelist, cost/latency bounds) ← THIS LAYER
- X_t = CIC execution (deterministic multi-agent pipeline in cic-ingestion)
- R_t = Reward (correctness + efficiency - drift - fallback_overuse)
- U_t = SPLPolicy update (GRPO, staleness-weighted, governance-gated) ← THIS LAYER (approval gate)
```

Key properties:
1. Safety-preserving: No policy update without audit + no trust-boundary violation
2. Deterministic substrate: All execution replayable and auditable
3. Adaptive routing: SPL learns better routing over time

---

## 3. Strategic Architectural Refinements

### 3.1 Async Event Ledgers (Decouple ledger I/O from hot path)

**Problem:** Synchronous writes to PostgreSQL during routing decisions add latency.

**Solution:** Event streaming + background ledger writer with backpressure awareness.

```
MAAL routing decisions (hot path)
    ↓
Emit RoutingDecisionEvent (fingerprint, regime, constraints, accepted/overridden count)
    ↓
In-process ring buffer (Phase 1, <1000 events/sec)
    - Monitor high-water mark (80% capacity)
    - Set LEDGER_DEGRADED flag if buffer saturates
    - Drop non-critical metrics if overflow imminent
    ↓
Background process drains buffer into PostgreSQL (~1s lag)
    ↓
PostgreSQL ledgers (eventual consistency OK for governance)
```

**Ledgers written asynchronously:**
- `routing_history` — all decisions + outcomes
- `drift_ledger` — audit drift signals
- `model_performance_ledger` — per-model performance
- `cost_ledger` — cost tracking

**Backpressure guardrail:**
- When buffer crosses 80%, set LEDGER_DEGRADED flag
- EvolutionLoop ignores training data from degraded window
- SPLTrainingLoop down-weights trajectories from degraded periods
- Prevents silent training on partial or biased data

**Constraint:** EvolutionLoop operates on "last N minutes" of data; real-time is not required.

**Benefit:** MAAL routing latency not blocked by I/O.

---

### 3.2 Discrete S_t Feature Space (Stabilize downstream GRPO)

**Problem:** High-dimensional context fed to SPL causes GRPO instability.

**Solution:** MAAL's task fingerprinting feeds into discrete, versioned feature encoding for SPL.

```
MAAL input (raw context)
    ↓
TaskFingerprinting outputs:
  - task_class (enum: code_fix, spec_gen, data_enrich, ...)
  - complexity_bucket (enum: low, medium, high, very_high)
  - modality (enum: code, code+image, text, multi_modal)
  - schema_signature (hash(tool_surface + MCP_version) → enum: single_file, multi_file, multi_repo, ...)
  - token_count_bucket (enum: <1K, 1-10K, 10-100K, >100K)
  - S_t_schema_version (int, bumped when feature schema changes)
    ↓
SPL receives compact S_t = [task_class, complexity_bucket, modality, schema_signature, token_count_bucket, S_t_schema_version]
```

**Feature evolution (versioning):**
- Maintain S_t_schema_version to track feature schema changes
- When bucket boundaries change or features are added/removed, bump version
- SPLTrainingLoop can:
  - Train per-version (isolated policy versions)
  - Explicitly map old versions to new (cross-version compatibility)
- Keeps discrete state space evolution-aware, not frozen
- MCP/tool version changes tracked via schema_signature hash

**Benefit:** Small, discrete state space for SPL; fast GRPO convergence; interpretable policy behavior; feature evolution traceable.

---

### 3.3 Offline Simulation Harness (Validate GRPO before live integration)

**Problem:** Reward-shaping bugs discovered in live CIC are expensive. SPL inference latency could break MAAL routing.

**Solution:** Validate GRPO offline with synthetic trajectories. Bound SPL inference with deterministic fallback.

**Harness (Phase 2):**
- Generate ~10,000 synthetic trajectories matching real MAAL/CIC distributions
- Each: (S_t, A_t, V_t, X_t, R_t) with controlled correctness/cost/drift/override rates
- Train SPLPolicy offline with validation assertions:
  - assert policy_converges_within_10k_steps()
  - assert drift_score_decreases_monotonically()
  - assert cost_constraints_respected()
  - assert policy_remains_stable_when_reward_weights_shift_10_percent()
- Check convergence, stability, sensitivity to weight changes
- Validate policy learns task_class-specific strategies
- Measure SPL.proposeScaffold() latency (target: <50ms)

**SPL inference latency guardrail (Phase 1/2):**
- Optional in early phases (can disable SPL entirely; MAAL routes statically)
- Hard cap: 50ms per scaffold proposal
- If inference exceeds cap, MAAL deterministically falls back to static routing
- Prevents latency cascade; always has escape hatch

**Reward weight sensitivity check (Phase 2):**
- assert policy_remains_stable_when_reward_weights_shift_10_percent()
- Ensures policy isn't hypersensitive to small α, β, γ, δ, ε changes
- Validates robustness for production deployment

**Outcome:** Ship SPL with proven-stable training loop, bounded latency, weight robustness; white-paper-grade validation.

---

## 4. MAAL Routing Plane (cic-os/src/core/maal/)

### 3.1 TaskFingerprinting.ts

**Purpose:** Deterministic task hashing. Same input → same fingerprint, always.

**Inputs:**
- task_class (e.g., "code_fix", "spec_gen", "data_enrich")
- complexity (estimated, e.g., 0.3–0.9)
- modality (e.g., "code", "code+image", "text")
- optional context hash (task-specific content digest)

**Output:** Deterministic fingerprint (string or bytes)

**Responsibility:**
- Must be deterministic (no randomness, no timestamps)
- Must be stable (fingerprint for task T today = fingerprint for task T next week)
- Can include optional context hash for fine-grained routing decisions

---

### 3.2 RoutingRegimeSelector.ts

**Purpose:** Decide routing constraints based on fingerprint + context.

**Inputs:**
- TaskFingerprint
- constraints (cost_budget, latency_budget, locality_mode, model_whitelist, model_blacklist)

**Output:** RoutingRegime (local-only, hybrid, remote-allowed)

**Responsibility:**
- Map fingerprint → regime
- Apply constraints (enforce cost/latency budgets, locality rules)
- Return allowed model list for next layer

---

### 3.3 ConstraintEngine.ts

**Purpose:** Enforce cost, latency, safety, and locality bounds.

**Inputs:**
- RoutingRegime
- proposed routing plan (from SPL)
- cost/latency/safety/locality constraints

**Output:** Validated constraints or rejection with reason

**Responsibility:**
- Cost ceiling enforcement
- Latency ceiling enforcement
- Safety rules (no forbidden tools, no disallowed agents)
- Locality rules (local-only vs. hybrid vs. remote)

---

### 3.4 FallbackGraphValidator.ts

**Purpose:** Ensure fallback graphs are safe (acyclic, no infinite loops).

**Inputs:**
- fallback_graph (list of FallbackEdge: failure_code → next_action)
- agents in agents_plan

**Output:** Valid acyclic graph or rejection with reason

**Responsibility:**
- Detect and reject cycles (A → B → A)
- Cap retry depth (max 3 retries per edge)
- Validate that all next_actions refer to valid agents/phases

---

### 3.5 MAAL Interface (index.ts)

```typescript
class MAAL {
  static fingerprintTask(context): TaskFingerprint
  static selectRoutingRegime(fingerprint, constraints): RoutingRegime
  static validateScaffold(scaffold): ValidationResult
}
```

---

## 4. Layer 0: Trust & Governance (cic-os/services/cic-governance)

### 4.1 Components

- **GovernanceEvolutionLoop.ts** (existing, Phase 24.2)
  - Runs daily, approves policy amendments/constraints/updates
  - New responsibility: accept PolicyDiff from SPL, vote, apply if approved

- **AuditAgent.ts** (existing)
  - Dual-model cross-verification (primary + fallback)
  - Returns AuditResult (correctness, drift, hallucination markers)

- **PolicyRegistry.ts** (new)
  - Version and store SPL/MAAL policies
  - Immutable audit trail (when policy changed, who approved, why)
  - Rollback support (restore previous policy version)

- **LedgerService.ts** (new)
  - PostgreSQL interface
  - CRUD for routing_history, drift_ledger, model_performance_ledger, cost_ledger
  - Query interface for training loop (ReplayBuffer.ts in cic-ingestion)

### 4.2 Ledgers (PostgreSQL)

All ledgers are source-of-truth for governance and learning.

**routing_history**
- task_id, fingerprint, regime, constraints, metadata (accepted/overridden actions)
- outcome (success/failure), cost, latency
- timestamp, audit signals

**drift_ledger**
- task_id, drift_score, issues (semantic drift, hallucination, length mismatch)
- timestamp, related_audit_id

**model_performance_ledger**
- task_class, model_id, performance metrics (success_rate, avg_latency, cost)
- condition (e.g., "under_cost_pressure", "high_latency_budget")
- timestamp

**cost_ledger**
- task_id, agent_cost, model_cost, fallback_cost, total_cost
- timestamp

**audit_log** (existing)
- component, action, actor, severity, created_at
- governance decisions, policy changes, violations

### 4.3 Responsibilities

- Review SPL PolicyDiff objects before application
- Emit governance decisions to PostgreSQL (immutable)
- Maintain ledger integrity (no updates without governance decision)
- Enforce global safety constraints (policy can't violate audit thresholds, trust boundaries)
- Provide query interface for cic-ingestion's ReplayBuffer

---

## 5. MAALProtocol.md (to be created)

**Location:** `cic-os/src/core/maal/MAALProtocol.md`

**Contents:**
- Input/output types (TypeScript interfaces)
- Error semantics (how MAAL reports validation failures)
- Ledger contract (what data MAAL writes, when, in what schema)
- Fallback discipline (max retries, escalation rules)
- Acyclicity rules (graph validation details)

**Purpose:** Lock in the interface before integration begins; prevents mid-implementation surprises.

---

## 6. Integration with cic-ingestion

### 6.1 BridgeOrchestrator → MAAL

In cic-ingestion/src/autonomy/bridges/MAQLIntegration.ts:

```
signal → MAAL.fingerprintTask(context)
       → MAAL.selectRoutingRegime(fingerprint, constraints)
       → receive RoutingRegime + allowed_models
       → pass to ModelRouter
```

### 6.2 CIC Audit → Ledgers

In cic-ingestion AUDIT stage:

```
AuditResult → LedgerService.routing_history.insert(...)
           → LedgerService.drift_ledger.insert(...)
           → LedgerService.audit_log.insert(...)
```

### 6.3 SPL Training → Governance

In cic-ingestion/src/spl/SPLTrainingLoop.ts:

```
Policy update detected
    → emit PolicyDiff to GovernanceEvolutionLoop
    → GovernanceEvolutionLoop.processAmendments()
    → council.vote(PolicyDiff)
    → if approved: PolicyRegistry.apply(PolicyDiff)
                   LedgerService.audit_log.insert(decision)
```

---

## 7. Reward Function (Reference)

See cic-ingestion/ORNITH_MAAL_SPL_ARCHITECTURE.md § 6 for full details.

```
R_t = α·C_t + β·E_t + γ·A_t - δ·D_t - ε·F_t

Where:
- C_t = correctness * evidence_integrity
- E_t = 1 - norm(cost) - norm(latency)
- A_t = MAAL acceptance rate
- D_t = drift_score
- F_t = fallback_overuse

Weights (per task_class):
- α = 0.4, β = 0.3, γ = 0.15, δ = 0.1, ε = 0.05
```

---

## 8. Implementation Phasing

### Phase 1: MAAL Core (2 weeks)

**Files:**
- `src/core/maal/TaskFingerprinting.ts`
- `src/core/maal/RoutingRegimeSelector.ts`
- `src/core/maal/ConstraintEngine.ts`
- `src/core/maal/FallbackGraphValidator.ts`
- `src/core/maal/MAALProtocol.md` (interface spec)
- `src/core/maal/index.ts`

**Tests:**
- TaskFingerprinting determinism (same input → same fingerprint)
- RoutingRegimeSelector correctness
- ConstraintEngine enforcement
- FallbackGraphValidator acyclicity

**Deliverable:** MAAL can fingerprint tasks, select regimes, validate constraints, and reject unsafe scaffolds.

### Phase 2: Ledgers + LedgerService (1 week, parallel with Phase 1)

**Files:**
- `services/cic-governance/src/services/LedgerService.ts`
- `scripts/init-db.sql` (new tables)

**Deliverable:** PostgreSQL ledgers created, LedgerService provides CRUD + query interface.

### Phase 3: SPL Integration (cic-ingestion, 3 weeks)

See cic-ingestion spec.

### Phase 4: PolicyRegistry + Governance Integration (2 weeks)

**Files:**
- `services/cic-governance/src/services/PolicyRegistry.ts`
- Modify `GovernanceEvolutionLoop.ts` to accept PolicyDiff

**Deliverable:** Governance can vote on and apply SPL policy diffs; audit trail maintained.

---

## 9. Differentiators

1. **Deterministic Routing Brain:** MAAL provides fingerprinting + regime selection + constraint enforcement (no other system does this)
2. **Trust-Bounded Learning:** PolicyRegistry + ledgers ensure policies only learn from safe, auditable runs
3. **Governance-Gated Evolution:** Policy updates require explicit council approval (not autonomous)
4. **Cost-Aware:** Ledgers track and enforce cost + latency constraints
5. **Formally Specified:** Protocol locked in before implementation

---

## 10. File Checklist

### New Files
- [ ] `src/core/maal/TaskFingerprinting.ts`
- [ ] `src/core/maal/RoutingRegimeSelector.ts`
- [ ] `src/core/maal/ConstraintEngine.ts`
- [ ] `src/core/maal/FallbackGraphValidator.ts`
- [ ] `src/core/maal/MAALProtocol.md`
- [ ] `src/core/maal/index.ts`
- [ ] `services/cic-governance/src/services/PolicyRegistry.ts`
- [ ] `services/cic-governance/src/services/LedgerService.ts`

### Modified Files
- [ ] `services/cic-governance/src/services/GovernanceEvolutionLoop.ts` (accept PolicyDiff)
- [ ] `scripts/init-db.sql` (add ledger tables)

---

**End of Specification**

Cross-reference: [cic-ingestion/ORNITH_MAAL_SPL_ARCHITECTURE.md](../cic-ingestion/ORNITH_MAAL_SPL_ARCHITECTURE.md)
