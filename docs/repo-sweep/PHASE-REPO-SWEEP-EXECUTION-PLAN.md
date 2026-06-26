# PHASE: Repo Sweep Execution Plan (v0.1.0)

## Objective
Full-stack discovery sweep across entire repo (c:\dev + all microservices) to map dashboards, servers, ports, scripts, hooks, and CIC touchpoints. Output: unified Operator Console v3 blueprint + runtime integration plan.

**Timeline:** 1–2 days (aggressive).  
**Scope:** Discovery-driven. Whole repo. Parallel phases.  
**Success:** Every dashboard/server/script inventoried, drift classified, Console v3 blueprint locked.

---

## 1. Wave Structure

### Wave 1: Parallel Inventory & Analysis (6–8 hours)
**Goal:** Discover what exists. Map topology. Classify drift. Find hooks.

**Parallel Tasks:**

| Phase | Agent | Deliverable | Acceptance |
|-------|-------|------------|-----------|
| 4.1 | Claude | `cic-repo-inventory.v0.1.0.json` | Every server/CLI/script/dashboard listed; ports, entry points, env vars |
| 4.2 | Claude | `cic-runtime-topology.v0.1.0.md` | Port map, startup order, overlaps, orphan processes identified |
| 4.3 | ijfw:architect | `cic-console-drift-map.v0.1.0.md` | All dashboards/consoles classified (keep/merge/deprecate/rewrite) + drift severity |
| 4.4 | ijfw:architect | `cic-hooks-and-automation-map.v0.1.0.md` | All CIC hooks, pipelines, ingestion points mapped to Console v3 data sources |

**Dependencies:** None. Run all four in parallel.

**Handoff to Wave 2:** Merge outputs → single unified view.

---

### Wave 2: Synthesis & Blueprinting (4–6 hours)
**Goal:** Lock Console v3 blueprint. Define unified runtime.

**Sequential Tasks:**

| Phase | Agent | Deliverable | Acceptance |
|-------|-------|------------|-----------|
| 4.5 | CIC | Merge report | All four Wave 1 artifacts consolidated; conflicts logged; veto points flagged |
| 4.6 | Claude | `operator-console-v3-blueprint.v0.1.0.md` | Panels defined, data sources wired, emergent features specified, runtime entry point locked |
| 4.6b | Antigravity | `cic-os-runtime.v0.1.0.yml` | Docker Compose or supervisor config; `cic-os start` as canonical entry; all services included |

**Dependencies:** 4.5 complete → 4.6 + 4.6b in parallel.

**Gate:** Operator review + veto on classifications before 4.6 final.

---

## 2. Task Breakdown

### Phase 4.1: Inventory (Claude)

**Input:** `/c:/dev` full tree.

**Search for:**
- `server.js`, `server.ts`, `index.js`, `index.ts`, `main.js`, `app.js`, `app.ts`
- `package.json` (all `scripts` sections)
- `Dockerfile`, `docker-compose.*`, `Makefile`, `*.sh`, `*.bat`
- `*dashboard*`, `*console*`, `*ui*`, `*panel*` (files/dirs)
- CIC-related modules: `cic-*`, `governance`, `vault`, `memory`, `skill`, `agent`

**Output:** `cic-repo-inventory.v0.1.0.json`

**Schema:**
```json
{
  "servers": [
    {
      "name": "string",
      "port": "number | null",
      "path": "string",
      "entry": "string",
      "type": "express | cli | batch | other",
      "env_vars": ["string"]
    }
  ],
  "dashboards": [
    {
      "name": "string",
      "path": "string",
      "framework": "react | vue | static | other",
      "routes": ["string"],
      "data_sources": ["string"]
    }
  ],
  "scripts": [
    {
      "name": "string",
      "path": "string",
      "purpose": "string",
      "trigger": "manual | cron | event | other"
    }
  ],
  "hooks": [
    {
      "name": "string",
      "path": "string",
      "trigger": "pre-commit | post-commit | other",
      "cic_related": "boolean"
    }
  ]
}
```

**Acceptance:**
- ✓ Every `.js`/`.ts` server found  
- ✓ All `package.json` scripts enumerated  
- ✓ All Dockerfiles + compose files listed  
- ✓ No duplicates; paths absolute  

---

### Phase 4.2: Runtime Topology (Claude)

**Input:** `cic-repo-inventory.v0.1.0.json`

**Analyze:**
- Port bindings (conflicts, orphans)
- Startup order (dependencies, bootstrap sequence)
- Environment variables (required, optional, secrets)
- Health checks and readiness probes

**Output:** `cic-runtime-topology.v0.1.0.md`

**Structure:**
```markdown
## Ports
| Port | Service | Status |

## Startup Order
1. PostgreSQL
2. Redis
3. CIC Governance API
...

## Environment Variables
| Var | Required | Source |

## Overlaps & Orphans
- Port 3000: dashboard + codeflow (conflict) → resolve
- cic-obsolete-monitor: unreferenced
```

**Acceptance:**
- ✓ All ports mapped  
- ✓ Overlaps identified + action recommended  
- ✓ Startup order testable  
- ✓ No missing env vars  

---

### Phase 4.3: Dashboard & Console Drift Map (ijfw:architect)

**Input:** Inventory + topology.

**Classify each dashboard/console:**

```
Dashboard Name:
  Location: /path
  Type: keep | merge | deprecate | rewrite
  Rationale: [why]
  Severity: critical | high | medium | low
  Governance Violation: [if any]
  Estimated Cost: [if action taken]
```

**Output:** `cic-console-drift-map.v0.1.0.md`

**Examples:**
```
## Dashboard: CIC Health Monitor
  Location: /dashboards/health-monitor
  Type: REWRITE
  Rationale: Uses deprecated Redux; not wired to CIC governance logs; panel layout doesn't match Console v3 spec.
  Severity: HIGH
  Governance Violation: Missing CIC observability layer
  Cost: 20 hrs (rewrite + wire)

## Dashboard: Codeflow Analyzer
  Location: /apps/codeflow-analyzer/ui
  Type: MERGE
  Rationale: Core functionality needed but duplicate with Operator Console v3 panels. Consolidate into Console v3.
  Severity: MEDIUM
  Cost: 12 hrs (extract data sources, remap to Console v3 layout)
```

**Acceptance:**
- ✓ Every dashboard classified  
- ✓ Rationale > 1 sentence  
- ✓ No "TBD" classifications  
- ✓ Cost estimates defensible  

---

### Phase 4.4: CIC Hooks & Automation Map (ijfw:architect)

**Input:** Inventory + topology.

**Find all CIC integrations:**
- Ingestion pipelines (GitHub, events, logs)
- Enrichment (Qdrant, vector DB queries)
- Orchestration (Skill graph, agent invocation)
- Synthesis (Planning, roadmap generation)
- Logging & snapshots (Observability modules)

**Output:** `cic-hooks-and-automation-map.v0.1.0.md`

**Structure:**
```markdown
## Ingestion
- GitHub webhook → cic-ingestion (port 3100)
  - Triggers: push, PR, workflow
  - Processing: code analysis, governance audit
  - Output: CIC event log

## Enrichment
- Qdrant queries from codeflow-analyzer
  - Vectors: code semantics, diffs
  - Source: Repomix extraction

## Orchestration
- Skill invocation from Console v3
  - Skills: claude-skills/ library
  - Approval gate: governance council vote

## Logging & Snapshots
- CIC observability module writes to PostgreSQL
  - Tables: events, packets, decisions
  - Snapshots exported to /data/snapshots
```

**Acceptance:**
- ✓ Every CIC hook mapped  
- ✓ Data flow clear (input → processing → output)  
- ✓ Console v3 integration points identified  
- ✓ No orphan automation  

---

### Phase 4.5: Merge & Veto Gate (CIC)

**Input:** All four Wave 1 artifacts.

**Actions:**
- Consolidate into unified view  
- Flag conflicts (port overlaps, duplicate functionality, governance gaps)  
- Highlight veto points for operator review  
- Generate synthesis briefing  

**Output:** Merge report (internal, not published).

**Veto Points Operator Reviews:**
1. All "REWRITE" classifications → approve or re-classify  
2. All "MERGE" targets → confirm integration scope  
3. Any "DEPRECATE" → confirm no hidden dependencies  
4. High-severity drift items → final call on priority  

**Acceptance:**
- ✓ All 4 inputs merged without loss  
- ✓ Conflicts logged + actions proposed  
- ✓ Operator veto requests clear  

---

### Phase 4.6: Operator Console v3 Blueprint (Claude)

**Input:** Wave 1 + merged synthesis. Operator feedback from 4.5 veto.

**Write:** `operator-console-v3-blueprint.v0.1.0.md`

**Sections:**

```markdown
## 1. Console Overview
- Purpose: Unified operator control center for CIC runtime
- Scope: Governance, pipelines, agents, workspace health, alerts, controls

## 2. Data Sources
- CIC event log (PostgreSQL)
- Snapshots (filesystem)
- Health model (Redis)
- Pipeline state (TorqueQuery)
- Agent telemetry (cic-ingestion)

## 3. Panels
### 3.1 CIC Health
- Runtime status (services, ports)
- Event ingestion rate
- Governance decision log
- Approval queue

### 3.2 Pipelines
- Active ingestion jobs
- Enrichment queue depth
- Synthesis results
- Failure alerts

### 3.3 Agents
- Skill library status
- Execution history
- Cost tracking
- Approval audit trail

### 3.4 Workspace
- Repo state (branch, uncommitted changes)
- Test coverage
- Build artifacts
- Deploy readiness

### 3.5 Alerts
- CIC health thresholds
- Drift warnings
- Governance violations
- Cost overruns

### 3.6 Controls
- Pause/resume pipelines
- Trigger ingestion
- Invoke skills (with approval)
- Snapshot export
- Runtime restart

## 4. Runtime Integration
- Console v3 runs on port [TBD]
- Data sync: every 5 seconds
- Authentication: CIC governance token
- Operator override mechanism

## 5. Emergent Features
[From 4.3 + 4.4 discovery; features that make sense]
- Real-time cost tracking
- Governance decision analytics
- Pipeline dependency graph
- Agent performance comparison
```

**Acceptance:**
- ✓ All panels defined  
- ✓ Data sources wired  
- ✓ Controls are actionable  
- ✓ No "TBD" fields (or logged as future work)  

---

### Phase 4.6b: Unified Runtime Config (Antigravity)

**Input:** Inventory + topology + blueprint.

**Define:** `cic-os-runtime.v0.1.0.yml` (Docker Compose or equivalent).

**Must include:**
- All services from inventory (reuse existing Dockerfiles where possible)
- Port binding for each service
- Environment variables per 4.2 topology
- Health checks
- Volume mounts (data, logs)
- Dependency order (depends_on)
- Network config (unified cic-network)

**Entry point:** `docker-compose -f cic-os-runtime.v0.1.0.yml up`  
Or: `cic-os start` (wrapper script).

**Acceptance:**
- ✓ Single `docker-compose up` starts entire runtime  
- ✓ All services healthy (health checks pass)  
- ✓ Console v3 available at defined port  
- ✓ No manual bootstrapping required  

---

## 3. Success Criteria

Repo sweep is **DONE** when:

- [ ] `cic-repo-inventory.v0.1.0.json` complete (all servers/scripts/dashboards found)
- [ ] `cic-runtime-topology.v0.1.0.md` complete (ports, startup order, overlaps mapped)
- [ ] `cic-console-drift-map.v0.1.0.md` complete (all UIs classified, no veto holds)
- [ ] `cic-hooks-and-automation-map.v0.1.0.md` complete (all CIC hooks mapped)
- [ ] Operator veto gate passed (all "REWRITE" / "MERGE" / "DEPRECATE" approved)
- [ ] `operator-console-v3-blueprint.v0.1.0.md` locked (all panels + data sources defined)
- [ ] `cic-os-runtime.v0.1.0.yml` locked (`docker-compose up` fully functional)
- [ ] All artifacts versioned, logged, committed per CIC governance

---

## 4. Roles & Responsibilities

| Role | Phase | Artifact | Decision Authority |
|------|-------|----------|-------------------|
| Claude | 4.1, 4.2, 4.6 | Inventory, topology, blueprint | Proposes; operator vetos |
| ijfw:architect | 4.3, 4.4 | Drift map, hooks map | Proposes; operator vetos |
| CIC | 4.5 | Merge report | Merges; flags conflicts |
| Antigravity | 4.6b | Runtime config | Implements per blueprint |
| **Operator (you)** | 4.5 veto gate | Final approval | Vetos all decisions |

---

## 5. Timeline

```
Hour 0-6:   Wave 1 (4.1-4.4) in parallel
Hour 6-6.5: CIC merge + veto briefing (4.5)
Hour 6.5-7: Operator veto review
Hour 7-9:   Wave 2 (4.6 + 4.6b) in parallel
Hour 9+:    Artifacts ready; commit + snapshot
```

**Total:** 9–10 hours elapsed time (assuming no re-work from vetos).

---

## 6. Artifacts Location

All outputs written to:
- `/workspace/specs/` (design docs)
- `/workspace/artifacts/` (generated inventories, maps)

Committed under CIC governance per existing workflow.

---

## 7. Next Action

Operator confirms plan locked.  
Then: Spawn agents for Wave 1 (Claude + ijfw:architect in parallel).
