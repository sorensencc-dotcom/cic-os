# Merge Scope Constraints: Phase 4.3 (Dashboard & Console Drift Map)

**Date:** 2026-06-19  
**Authority:** Operator (Chris Sorensen)  
**Scope:** Phase 4.3 classification rules for "MERGE" decisions  
**Applies to:** All dashboards/consoles classified as "MERGE into Console v3"

---

## Constraint 1: Data Schema (Must Be Explicit)

**Rule:** Exact fields to extract. No silent field drops. No renames without justification.

**What this means:**

When agent classifies dashboard X as "MERGE," agent must:

1. Document existing dashboard data schema (fields, types, refresh rate)
2. Map each field to Console v3 panel schema
3. Flag any field that's dropped and explain why (e.g., "unused for Tier 1 features," "deprecated field")
4. Preserve field names unless there's a semantic reason to rename

**Example:**

```
Dashboard: Codeflow Analysis
  Existing fields: [repo_name, commit_hash, analysis_score, timestamp, agent_cost]
  Console v3 mapping:
    - repo_name → [Pipelines panel, "repo"]
    - commit_hash → [Pipeline visibility, "commit"]
    - analysis_score → [Keep, but deprecate] (reason: not part of Tier 1 CIC health)
    - timestamp → [Pipelines panel, "updated_at"]
    - agent_cost → [Agent execution history panel, "cost"]
  Dropped fields: analysis_score (post-v3 feature, not Tier 1)
  Justification: analysis_score is nice-to-have but doesn't impact operator control or CIC health
```

**Acceptance:** Agent must document the mapping. Operator veto can challenge any field drop.

---

## Constraint 2: UI Layout (Console v3 Owns Grid, Merges Adapt)

**Rule:** Panel grid constraints. Existing dashboards do NOT dictate layout.

**What this means:**

When agent merges dashboard X into Console v3:

1. Console v3 defines the panel grid (layout, dimensions, breakpoints)
2. Merged functionality must fit into Console v3 design system
3. If original dashboard layout is incompatible, function survives but layout changes
4. No bespoke CSS, no off-grid panels, no layout exceptions

**Example:**

```
Dashboard: Agent Metrics (merging into Console v3)
  Original: Full-page dashboard with 6 custom panels (non-standard sizes)
  Console v3 rule: 4-column grid, standard panel dimensions
  Resolution: 
    - Panel 1 (cost tracking) → fits in Console v3 grid, 2 cols
    - Panel 2 (execution history) → fits, 2 cols
    - Panel 3–4 (custom analytics) → Tier 3 features, defer to v3.1
  Result: 2 of 4 original panels merge; 2 defer. Function preserved, layout conforms.
```

**Acceptance:** Agent must justify layout changes. Operator veto can require panel reordering or defer to future release if layout breaks design.

---

## Constraint 3: Performance SLAs (Baseline Required, Not Hyper-Strict First Pass)

**Rule:** Refresh rate + latency declared. Tuning comes after v3 launch.

**What this means:**

Agent must declare (but not necessarily perfect):

1. Target refresh rate (e.g., "5–10 seconds" for CIC health, "30 seconds" for agent history)
2. Acceptable latency (e.g., "< 500ms" for health panel, "< 2s" for pipeline queries)
3. Any known performance gaps (e.g., "agent history query is O(n) on first load")

Agent does NOT block merge if performance isn't perfect, but must document the gap so operator knows it's a post-launch tuning task.

**Example:**

```
Merged Panel: Pipeline Visibility
  Refresh target: 5 seconds
  Actual latency: ~300ms (median), 1.2s (p95)
  Known gap: First-time agent query loads all 30 days history (slow on v0.1)
  Tuning plan: Implement pagination + caching in v3.1
  SLA status: ACCEPTABLE FOR V3.0 (but flagged for optimization)
```

**Acceptance:** Agent declares SLAs and gaps. Operator can veto if gap is unacceptable (e.g., "health panel must be < 100ms").

---

## Constraint 4: Auth Model (Reuse CIC Governance, No Bespoke Auth)

**Rule:** All merged dashboards use CIC governance token. No new auth stacks. Single gatekeeper.

**What this means:**

1. All merged panels must authenticate via CIC governance token (inherited from Console v3)
2. No per-dashboard secrets, no additional auth layers
3. All dashboard data access must respect CIC RBAC (role-based access control)
4. Console v3 is the single auth boundary

**Example:**

```
Dashboard: Workspace State (merging into Console v3)
  Original auth: Custom JWT + OAuth
  Console v3 auth: CIC governance token
  Resolution:
    - Remove custom JWT  
    - Remap OAuth → CIC RBAC  
    - All workspace queries inherit Console v3 permissions
  Result: Single auth surface, no per-dashboard secrets
```

**Acceptance:** Agent must strip bespoke auth. Operator veto if any auth exception is proposed.

---

## Constraint 5: Agent Discretion (Constrained, Not Absolute)

**Rule:** Agents have discretion on HOW, but not on WHAT-DROPS.

**What agents CAN decide:**
- Technical implementation (React vs Vue, fetch vs GraphQL, caching strategy)
- Component reuse or new components
- Data fetching patterns (lazy load vs. batch)
- UI details (colors, icons, fonts) per Console v3 design system

**What agents CANNOT decide:**
- Whether data fields are dropped (Constraint 1)
- Whether layout breaks Console v3 design (Constraint 2)
- Whether auth bypasses CIC governance (Constraint 4)
- Whether performance gaps are left undocumented (Constraint 3)

**Example:**

```
Agent decision: "We'll use React hooks + TanStack Query for the agent history panel"
✓ ALLOWED (technical choice)

Agent decision: "We'll drop the 'approval_reason' field because the original schema doesn't have it"
✗ NOT ALLOWED (silent field drop, violates Constraint 1)

Agent decision: "We'll put agent history panel in a separate modal, outside Console v3 grid"
✗ NOT ALLOWED (breaks layout constraint, violates Constraint 2)
```

---

## Summary: Four Words

**Function migrates. Layout conforms. Data is explicit. Auth is unified.**

---

## Checklist for Agent (Phase 4.3 Review)

For every "MERGE" classification:

- [ ] Data schema mapping documented (Constraint 1)
- [ ] Layout conforms to Console v3 grid (Constraint 2)
- [ ] Performance SLAs declared (Constraint 3)
- [ ] Auth model is CIC governance (Constraint 4)
- [ ] Discretionary decisions are technical, not structural (Constraint 5)

---

## Operator Veto Points (Phase 4.5 Gate)

Operator will flag any "MERGE" that violates:

1. **Data:** Any field drop without justification → veto, require reclass as "REWRITE"
2. **Layout:** Any layout exception → veto, require redesign or defer to v3.1
3. **Perf:** Any undocumented latency gap → flag, but allow (post-launch tuning task)
4. **Auth:** Any bespoke auth → veto, require CIC governance
5. **Discretion:** Any structural bypass of constraints → veto, require redesign

---

## Operator Signature

Locked by: Chris Sorensen  
Date: 2026-06-19  
Valid for: Phase 4.3 (Drift Map) + Wave 2 veto gate (Phase 4.5)
