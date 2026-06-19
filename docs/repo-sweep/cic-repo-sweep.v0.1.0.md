# CIC Repo Sweep — Operator Console v3 Foundation (v0.1.0)

## 1. Objective

Perform a full‑stack sweep of the repo to:

- discover all dashboards, servers, ports, scripts, hooks, and CIC touchpoints  
- map drift, duplication, and fragmentation  
- produce a single integration blueprint for Operator Console v3 and the unified runtime.

---

## 2. Scope

**Included:**

- all `apps/`, `services/`, `packages/`, `dashboards/`, `ui/`, `console/` directories  
- all Node/TS/JS servers, CLIs, batch scripts, Dockerfiles, compose files  
- all CIC‑related specs, hooks, pipelines, and automation scripts  
- all existing "console", "dashboard", "panel", "telemetry", "monitoring" code paths.

**Excluded (for now):**

- third‑party vendored code  
- binary artifacts  
- generated build outputs.

---

## 3. Agents & Roles

- **CIC:** Orchestrator, logger, snapshotter, plan generator.  
- **Claude:** Deep repo analysis, pattern detection, drift mapping, consolidation suggestions.  
- **Copilot:** Governance enforcement, routing decisions, OS‑layer architecture.  
- **Antigravity:** Implementation of refactors, consolidation, and wiring into the unified console.  
- **Local LLMs:** Deterministic transforms (JSON, config normalization, schema extraction).

---

## 4. Sweep Phases

### 4.1 Inventory Phase

- **Goal:** Enumerate every dashboard, server, CLI, script, and port.  
- **Actions:**
  - scan repo for `server.*`, `index.*`, `main.*`, `app.*`, `dashboard`, `console`, `ui`  
  - collect all `package.json` scripts, `Makefile`, `*.bat`, `*.sh`, `Dockerfile`, `docker-compose.*`  
  - build a raw inventory: `cic-repo-inventory.v0.1.0.json`.

---

### 4.2 Topology & Runtime Map

- **Goal:** Understand how everything starts, binds, and talks.  
- **Actions:**
  - map all ports, env vars, and runtime entrypoints  
  - identify overlapping ports, duplicate servers, orphan processes  
  - produce `cic-runtime-topology.v0.1.0.md`.

---

### 4.3 Dashboard & Console Drift Map

- **Goal:** Capture all UI/console fragments and their drift from CIC governance.  
- **Actions:**
  - list all dashboards/console apps, their routes, and data sources  
  - compare against CIC design/governance specs  
  - classify: **keep**, **merge**, **deprecate**, **rewrite**  
  - output `cic-console-drift-map.v0.1.0.md`.

---

### 4.4 CIC Hook & Automation Map

- **Goal:** Find all CIC hooks, pipelines, and automation that should power the console.  
- **Actions:**
  - scan for CIC‑related modules, specs, and scripts  
  - map ingestion, enrichment, orchestration, synthesis, logging, snapshots  
  - output `cic-hooks-and-automation-map.v0.1.0.md`.

---

### 4.5 Unified Runtime & One‑Command Start Plan

- **Goal:** Design a single "OS‑grade" runtime: one command, all systems.  
- **Actions:**
  - define Docker/Compose or supervisor‑style orchestration for all required services  
  - specify `cic-os-runtime.yml` (or `docker-compose.cic-os.v0.1.0.yml`)  
  - define `cic-os start` as the canonical entrypoint.

---

### 4.6 Operator Console v3 Integration Blueprint

- **Goal:** Define exactly how Operator Console v3 plugs into everything.  
- **Actions:**
  - specify data sources (CIC logs, snapshots, health model, pipelines, agents)  
  - define panels: CIC health, pipelines, agents, workspace, alerts, controls  
  - output `operator-console-v3-blueprint.v0.1.0.md`.

---

## 5. Outputs

All written under `/workspace/specs/` and `/workspace/artifacts/`:

- `cic-repo-inventory.v0.1.0.json`  
- `cic-runtime-topology.v0.1.0.md`  
- `cic-console-drift-map.v0.1.0.md`  
- `cic-hooks-and-automation-map.v0.1.0.md`  
- `cic-os-runtime.v0.1.0.yml` (or equivalent)  
- `operator-console-v3-blueprint.v0.1.0.md`.

---

## 6. Acceptance Criteria

Repo sweep is **done** when:

- every dashboard/console/server/script is inventoried and mapped  
- all drift is classified and documented  
- CIC hooks and automation are fully mapped  
- a single one‑command runtime plan exists  
- Operator Console v3 has a concrete integration blueprint  
- all artifacts are versioned, logged, and snapshotted per CIC governance.

---

## 7. Next Steps

- Anchor this plan to Phase roadmap  
- Dispatch as multi‑agent task (Claude + Antigravity parallel)  
- Produce versioned artifacts per CIC spec  
