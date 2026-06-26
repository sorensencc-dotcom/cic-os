# Operator Veto Brief: Console v3 Feature Priorities

**Date:** 2026-06-19  
**Authority:** Operator (Chris Sorensen)  
**Scope:** Wave 2 gate (Phase 4.5 merge + veto review)  

---

## Feature Priorities (Ranked by Importance)

### Tier 1: Must-Have (Blocks "Live" Status)

#### 1. **Control Surface** (Rank 1)
**Why:** You're done being the human orchestrator. This is the OS layer you actually use.

**Must include:**
- Pause/resume pipelines
- Invoke skills (with approval)
- Snapshot export
- Runtime restart

**Rationale:** Without hard controls, everything else is just telemetry. You need active operator levers.

---

#### 2. **Real-time CIC Health** (Rank 2)
**Why:** Primary instrument cluster. If CIC is alive, degraded, or failing, you need to know before you touch anything.

**Must include:**
- Service status (all ports, health checks)
- Event ingestion rate
- Governance decision log (recent votes/approvals)
- Approval queue (pending items)

**Rationale:** Health is the first thing you read. Everything else assumes a baseline system state.

---

#### 3. **Pipeline Visibility** (Rank 3)
**Why:** See ingestion, enrichment, synthesis actually flowing. Makes "self-healing" observable, not opaque.

**Must include:**
- Active ingestion jobs (status, throughput)
- Enrichment queue depth
- Synthesis results (latest plans, decisions)
- Failure detection (what broke, when)

**Rationale:** Failure detection and recovery plans only work if visible.

---

### Tier 2: Important (Improves Operations)

#### 4. **Alerts** (Rank 4)
**Why:** "Pay attention now" channels—health thresholds, drift, governance violations, cost overruns.

**Must include:**
- Health threshold violations (service down, event rate > 2σ)
- Drift warnings (new uncategorized code patterns)
- Governance violations (approval denials, council deadlock)
- Cost overruns (budget alerts per agent/phase)

**Rationale:** Ties directly to silent breakage and invisible dashboards frustration.

---

#### 5. **Agent Execution History** (Rank 5)
**Why:** See what the crew is doing: cost, approvals, failures, patterns.

**Must include:**
- Agent invocation history (timestamp, skill, cost, outcome)
- Approval audit trail (who voted, reasoning, decision)
- Failure patterns (which agents, error codes, recovery)
- Cost per agent (daily/weekly rollup)

**Rationale:** Critical for trust and governance, but secondary to core runtime and control.

---

### Tier 3: Supporting (Nice-to-Have, Post-v3)

#### 6. **Workspace State** (Rank 6)
**Why:** Supporting telemetry—branch, tests, builds, deploy readiness.

**Can defer to v3.1:**
- Repo branch + commit state
- Test coverage (% passing)
- Build artifacts (status, size)
- Deploy readiness (checklist, gates)

**Rationale:** Useful once OS is stable. Not the first thing operator reaches for.

---

## Summary: Three Words

**Control surface + CIC health + pipelines = Tier 1.**  
**Alerts + agents = Tier 2.**  
**Workspace = Tier 3.**

---

## Application to Wave 2 Veto (Phase 4.5)

When agents produce drift map + hooks map, operator veto review will:

1. **Tier 1 features:** Veto any "MERGE" or "KEEP" decision that drops Tier 1 data or controls.
2. **Tier 2 features:** Approve "MERGE" only if Tier 2 functionality is explicitly wired into Console v3 blueprint.
3. **Tier 3 features:** Flag as post-v3 or defer to v3.1 roadmap.

Any feature classified as "DEPRECATE" or "REWRITE" must justify why Tier 1 doesn't break.

---

## Operator Signature

Locked by: Chris Sorensen  
Date: 2026-06-19  
Valid for: Phase Repo Sweep execution + Console v3 v0.1.0 blueprint lock
