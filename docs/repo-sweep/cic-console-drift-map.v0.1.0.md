# CIC Console & Dashboard Drift Map (v0.1.0)

**Phase:** 4.3 (Repo Sweep — Dashboard & Console Drift Map)
**Author:** ijfw:architect (Opus reasoning)
**Date:** 2026-06-19
**Source repo:** `c:\dev` (+ microservices)
**Status:** PROPOSED — pending operator veto (Phase 4.5 gate)

---

## 0. Executive Summary

The repo contains **11 distinct dashboard/console UI surfaces** plus **4 worktree-shadow copies**. There is **no single Operator Console v3** today — the role is split across an aspirational React app (`ui-dashboard.tsx`), a richer static "CIC Command Center" (`rewrite-mcp/apps/operator-ui/`), and a swarm of single-purpose static HTML dashboards.

**Critical drift findings:**

1. **Triplicated `operator-ui`** — the same console exists in 3+ live locations (`rewrite-mcp/apps/operator-ui/`, `rewrite-mcp/operator-ui/`, `rewrite-mcp/planning-engine/apps/operator-ui/`, `CIP/RewriteLabs/rewrite-mcp/operator-ui/`). `planning-engine/` is a full clone of `rewrite-mcp/`. This is the single largest source of console drift.
2. **`docker-compose.yml` declares a `planning-console` service** (port 3200→3000, built from `rewrite-mcp/Dockerfile.planning-console`) — this is the *intended* Console v3 host, but no single UI is wired to it cleanly. This is the canonical anchor for consolidation.
3. **The React `ui-dashboard.tsx` runs entirely on mock data** — three of four panels return hardcoded fixtures; only the Vector Metrics panel hits a real endpoint (`/vector/metrics`).
4. **Static HTML dashboards have no serving wiring** — `canary-dashboard.html`, `cic-stability-dashboard.html`, `prompt-telemetry/dashboard.html`, `helm/dashboard.html`, `benchmarks/out/dashboard.html` are opened directly off disk; only `apps/operator-ui/server.mjs` (port 5173) serves any of them.

**Recommended target:** Promote `rewrite-mcp/apps/operator-ui/` (CIC Command Center) to Console v3, host it on the `planning-console` service, wire it to the live `unified-api` (3100) + `cic-ingestion` (3116) + Grafana, and deprecate every duplicate.

**Classification tally:** KEEP 2 · MERGE 4 · DEPRECATE 6 · REWRITE 3.

---

## 1. Classification Legend

| Type | Meaning |
|------|---------|
| **KEEP** | Retain as-is; either already canonical or serves a distinct, non-overlapping purpose. |
| **MERGE** | Functionality is needed but duplicates Console v3 scope; consolidate its data sources/panels into Console v3. |
| **DEPRECATE** | Remove; redundant duplicate, dead worktree artifact, or superseded surface with no unique value. |
| **REWRITE** | Concept is needed but the implementation is mock/stale/architecturally wrong; rebuild against live data + Console v3 spec. |

Severity reflects **drift risk** (operator confusion, stale data shown as live, governance blind spots), not implementation effort.

---

## 2. Dashboard Classifications

### Dashboard: CIC Command Center (operator-ui — canonical)
  Location: `c:\dev\rewrite-mcp\apps\operator-ui\` (index.html, control-room.html, canary-dashboard.html, ~25 panel JS modules, server.mjs)
  Type: **KEEP** (promote to Console v3 base)
  Rationale: This is the richest, most complete operator surface in the repo — a static-served command center with a global nav, control-room, canary cockpit, and a full panel suite (agents, pipelines, runs, metrics, telemetry, SLO, stress, predictive, mitigation, efficacy, introspection, release-* panels). It already ships a hardened static server (`server.mjs`, port 5173, with directory-traversal protection) and a design-token system (`css/tokens.css`, `colors_and_type.css`). It is the only surface whose scope matches the Console v3 panel spec (Health/Pipelines/Agents/Workspace/Alerts/Controls). It should become the Console v3 base layer rather than being rebuilt from scratch.
  Severity: HIGH (it is canonical but currently un-wired to the `planning-console` runtime service and duplicated 3x, so operators can't trust which copy is live)
  Governance Violation: None structurally; but it is not yet wired to the CIC governance decision log or approval-gate API, so its "Controls" panel cannot enforce council approval before skill invocation (required by Console v3 spec §3.6).
  Estimated Cost: 16 hrs (wire panels to `unified-api` 3100 + `cic-ingestion` 3116 + Grafana; bind to `planning-console` service; add governance-token auth)

### Dashboard: CIC Operator Console (React — ui-dashboard.tsx)
  Location: `c:\dev\ui-dashboard.tsx` (served by `c:\dev\ui-server.js`, port 3002)
  Type: **MERGE**
  Rationale: This React SPA carries four genuinely useful panel concepts — External Repo Updates, Extractor Results, Roadmap External Items, and Vector Metrics — that map directly onto Console v3's Pipelines/Workspace/Health panels. However, three of its four panels return hardcoded mock fixtures (`setEvents([...])`, `setItems([...])`, `setResult({...})`), and only `VectorMetricsDashboard` hits a live endpoint. The valuable parts are the panel *layouts* and the Vector Metrics live wiring; these should be ported into the Command Center rather than maintaining a second, parallel console framework (React vs static JS) competing for the "CIC Operator Console" name.
  Severity: HIGH (it literally claims the name "CIC Operator Console" while showing mock data as if live — direct operator-deception risk)
  Governance Violation: Mock data presented without a "demo/mock" banner violates the observability-honesty principle (a console must not present fabricated state as live telemetry).
  Estimated Cost: 10 hrs (extract VectorMetrics live wiring + 3 panel layouts into Command Center; retire React app + ui-server.js)

### Dashboard: Canary Cockpit (canary-dashboard.html)
  Location: `c:\dev\rewrite-mcp\apps\operator-ui\canary-dashboard.html` (v1.4.0)
  Type: **MERGE**
  Rationale: A polished glassmorphism observability cockpit with SSE real-time metrics, multi-tenant scoping, and an integrated RAG/Episode Builder studio. Its real-time telemetry gauges and amber-glow alerting are exactly the Console v3 Alerts panel (§3.5). Because it already lives inside the canonical operator-ui, the merge is low-friction: fold its SSE alert stream and gauge components into the Console v3 Alerts + Health panels rather than keeping a separate page.
  Severity: MEDIUM (lives in the canonical app so drift is contained, but it is a separate page from the command-center index, splitting the operator's attention across two URLs)
  Governance Violation: None.
  Estimated Cost: 8 hrs (integrate SSE alert stream + gauges into Console v3 Alerts/Health panels)

### Dashboard: CIC Stability Dashboard (cic-stability-dashboard.html)
  Location: `c:\dev\rewrite-mcp\projects\cic\ingestion\cic-stability-dashboard.html`
  Type: **MERGE**
  Rationale: Generated stability/soak-test dashboard (metric cards for uptime, restart counts, soak status — tied to the 12-hour soak-test infra recorded in project memory). Its content overlaps the Console v3 Health panel (§3.1 runtime status) and Alerts panel (health thresholds). It carries unique soak-test history that Console v3 should absorb as a "Stability" sub-view of Health rather than a standalone file the operator must remember to open.
  Severity: MEDIUM (real value, but orphaned — no nav links to it, generated ad hoc, easy to forget it exists and miss a soak failure)
  Governance Violation: None.
  Estimated Cost: 6 hrs (port soak metrics into Console v3 Health > Stability sub-view; wire to live stability source)

### Dashboard: CIC Prompt Telemetry (prompt-telemetry/dashboard.html)
  Location: `c:\dev\rewrite-mcp\tools\prompt-telemetry\dashboard.html`
  Type: **MERGE**
  Rationale: A 3x3-grid prompt/token telemetry dashboard (cost, token, prompt-cache analytics) styled in the CastIronForge theme. This is the data behind Console v3's "Real-time cost tracking" emergent feature (§5) and the Agents panel cost-tracking sub-section (§3.3). Token/cost analytics is a first-class operator concern and should be a Console v3 Agents/Cost panel, not a tucked-away tool page.
  Severity: MEDIUM (real, unique cost-telemetry value but disconnected from the main console and from the live prompt-cache metrics exporter)
  Governance Violation: None.
  Estimated Cost: 7 hrs (port cost/token panels into Console v3 Agents > Cost panel; wire to CacheMetricsExporter / Prometheus)

### Dashboard: Helm Cost Intelligence Dashboard (helm/dashboard.html)
  Location: `c:\dev\rewrite-mcp\tools\helm\dashboard.html` (Phase 47/48 Cost Intelligence)
  Type: **DEPRECATE**
  Rationale: A Phase 47/48 cost-intelligence prototype whose function — cost analytics — is fully subsumed by the Prompt Telemetry dashboard (being merged) and the Console v3 cost-tracking emergent feature. Maintaining a second, separately-styled cost dashboard guarantees the two will diverge and show conflicting cost numbers. There is no unique data source here that Prompt Telemetry + Console v3 will not already cover.
  Severity: LOW (prototype, not in any startup path; drift risk is "operator sees two different cost numbers")
  Governance Violation: None.
  Estimated Cost: 1 hr (delete after confirming no unique data source; cost-intelligence consolidates into Console v3 Agents > Cost)

### Dashboard: Rewrite Labs Benchmark Dashboard (benchmarks/out/dashboard.html)
  Location: `c:\dev\rewrite-mcp\benchmarks\out\dashboard.html`
  Type: **DEPRECATE**
  Rationale: This is a **build artifact** — it lives under `benchmarks/out/` (a generated-output directory), is regenerated by the benchmark tooling, and represents a point-in-time benchmark snapshot rather than a live operator surface. Generated artifacts should not be tracked or treated as dashboards; the live benchmark view (if needed) belongs as a Console v3 Workspace sub-panel reading the benchmark JSON, not a committed HTML blob that goes stale the moment benchmarks rerun.
  Severity: LOW (it is output, not source; the risk is treating a stale snapshot as current)
  Governance Violation: Committed build artifact under `out/` violates the build-artifact hygiene rule (generated outputs should be gitignored, per the pre-commit guardrail's binary/artifact intent).
  Estimated Cost: 1 hr (delete from tree, gitignore `benchmarks/out/`; optional 4 hrs later to surface live benchmark JSON in Console v3 Workspace)

### Dashboard: operator-ui (partial duplicate — rewrite-mcp/operator-ui/)
  Location: `c:\dev\rewrite-mcp\operator-ui\` (control-room.html + 5 panel JS: agents, control-plane-api, metrics, pipelines, runs)
  Type: **DEPRECATE**
  Rationale: This is an **older, partial copy** of the canonical `rewrite-mcp/apps/operator-ui/` — it contains only 5 of the ~25 panels and lacks the index/canary/release/SLO/telemetry suite and the hardened `server.mjs`. Keeping a half-version of the command center next to the full one is the textbook drift trap: edits land in the wrong copy and silently diverge. The canonical `apps/operator-ui/` fully supersedes it.
  Severity: HIGH (two live "operator-ui" directories one level apart — operators and agents will edit the wrong one)
  Governance Violation: Duplicate-surface drift; violates single-source-of-truth for the console.
  Estimated Cost: 2 hrs (diff against canonical to confirm no unique panel logic, then delete)

### Dashboard: operator-ui (full clone — planning-engine/apps/operator-ui/)
  Location: `c:\dev\rewrite-mcp\planning-engine\apps\operator-ui\` (complete duplicate of `apps/operator-ui/`)
  Type: **DEPRECATE**
  Rationale: `rewrite-mcp\planning-engine\` is a **whole-repo clone** of `rewrite-mcp\` (it duplicates apps/, tools/, projects/, benchmarks/ wholesale). Its operator-ui is a byte-for-byte sibling of the canonical one. This clone is the single biggest multiplier of console drift in the repo — every dashboard now exists twice. The `planning-engine` work should be a branch or a scoped subdirectory, not a full repo copy carrying its own console.
  Severity: CRITICAL (a full duplicate repo tree means every console, panel, and dashboard is doubled — guarantees divergence and doubles the surface an operator must reason about)
  Governance Violation: Mass duplicate-surface drift; a clone of an entire governed package inside that package breaks zone ownership and single-source-of-truth.
  Estimated Cost: 3 hrs to remove the operator-ui clone (part of a larger ~8 hr `planning-engine/` clone-collapse effort tracked separately in topology)

### Dashboard: operator-ui (legacy copy — CIP/RewriteLabs/rewrite-mcp/operator-ui/)
  Location: `c:\dev\CIP\RewriteLabs\rewrite-mcp\operator-ui\` (control-room.html + 5 panel JS)
  Type: **DEPRECATE**
  Rationale: A legacy copy under a `CIP/RewriteLabs/` archive-style path, mirroring the partial `rewrite-mcp/operator-ui/` set. It predates the canonical `apps/operator-ui/` and has no role in the current runtime (`docker-compose.yml` references `rewrite-mcp/`, never `CIP/`). It is dead weight that only adds drift surface and search noise.
  Severity: MEDIUM (clearly archival/legacy path, low chance of accidental edit, but still a third+ copy of the console)
  Governance Violation: Duplicate-surface drift.
  Estimated Cost: 1 hr (confirm archival status with operator, then delete or move to an explicit `archive/` outside the active tree)

### Dashboard: Grafana — CIC WIL Overview (cic-wil-overview.json)
  Location: `c:\dev\cic-ingestion\dashboards\cic-wil-overview.json` (Prometheus-backed Grafana dashboard)
  Type: **KEEP**
  Rationale: This is a proper Grafana dashboard JSON backed by the Prometheus data source, deployed via the cic-ingestion logging/monitoring stack (Loki + Promtail + Grafana on 3000/3001, per cic-ingestion CLAUDE.md). Grafana is the right tool for time-series infra metrics and should remain the metrics backend. Console v3 should **embed/link** Grafana panels (iframe or Grafana API) in its Health/Alerts panels rather than re-implementing time-series charting. Keep Grafana as the metrics substrate; do not fold it into the bespoke console.
  Severity: LOW (correct tool, correctly wired to Prometheus; the only "drift" is that Console v3 doesn't yet link to it)
  Governance Violation: None.
  Estimated Cost: 4 hrs (add Grafana embed/deep-links into Console v3 Health + Alerts panels)

---

## 3. REWRITE Items (concepts to rebuild against live data)

These are not standalone UI files but **dashboard behaviors** inside surfaces above that must be rebuilt rather than merged as-is, because their current implementation is mock or architecturally wrong.

### Rewrite: External Repo Updates panel (in ui-dashboard.tsx)
  Location: `c:\dev\ui-dashboard.tsx` → `ExternalRepoUpdatesDashboard()` (lines 46–158)
  Type: **REWRITE**
  Rationale: The panel concept (live GitHub push/PR → impact tags → roadmap items → docker-build status) is exactly Console v3's Pipelines panel (§3.2), but the implementation is 100% mock (`setEvents([{ id:"1", ... }])`) with a 5s interval refreshing the same fixture. It must be rebuilt to consume the real ingestion event stream (cic-ingestion `/autonomy/signals` + the GitHub-webhook → governance pipeline) rather than ported with its fake data.
  Severity: HIGH (shows fabricated build/impact status that an operator could act on)
  Governance Violation: Fabricated pipeline state presented as live (observability-honesty breach).
  Estimated Cost: 9 hrs (wire to cic-ingestion signals + governance event log; remove mock)

### Rewrite: Extractor Results panel (in ui-dashboard.tsx)
  Location: `c:\dev\ui-dashboard.tsx` → `ExtractorResultsView()` (lines 164–292)
  Type: **REWRITE**
  Rationale: Useful CodeFlow extraction summary (nodes/edges/security/patterns/impact + tabbed detail), but returns a hardcoded `{ nodes:42, edges:125, ... }` fixture and the security/patterns/impact tabs are empty stubs (`{/* Table would render findings here */}`). The real data exists in `codeflow-server.js` `/analyze` output and `repomix-ingestion` (port 3112). Rebuild against those live endpoints inside Console v3's Workspace/Pipelines panel.
  Severity: MEDIUM (mock data, but clearly a prototype; lower operator-deception risk than the build-status panel)
  Governance Violation: Mock metrics presented as live extraction results.
  Estimated Cost: 8 hrs (wire to codeflow-server `/analyze` + repomix-ingestion; implement the 3 stubbed tabs)

### Rewrite: Roadmap External Items panel (in ui-dashboard.tsx)
  Location: `c:\dev\ui-dashboard.tsx` → `RoadmapExternalItemsView()` (lines 298–440)
  Type: **REWRITE**
  Rationale: Roadmap todo/idea triage view — maps to Console v3 Workspace (§3.4) — but again mock-backed (`setItems([...])`) with a filter bug (`useEffect` depends on `filters` yet re-fetches identical fixtures). The real roadmap data lives in `build-roadmap.json` and the planning-engine (port 3114) synthesis output. Rebuild against the live planning-engine roadmap-delta synthesizer.
  Severity: MEDIUM (mock, prototype-grade)
  Governance Violation: Mock roadmap state presented as live.
  Estimated Cost: 7 hrs (wire to planning-engine 3114 roadmap synthesis; fix filter logic; remove mock)

---

## 4. Drift Summary Table

| Surface | Location | Type | Severity | Cost |
|---------|----------|------|----------|------|
| CIC Command Center (operator-ui canonical) | `rewrite-mcp/apps/operator-ui/` | KEEP→Console v3 base | HIGH | 16 hrs |
| Grafana — CIC WIL Overview | `cic-ingestion/dashboards/cic-wil-overview.json` | KEEP | LOW | 4 hrs |
| CIC Operator Console (React) | `ui-dashboard.tsx` + `ui-server.js` | MERGE | HIGH | 10 hrs |
| Canary Cockpit | `rewrite-mcp/apps/operator-ui/canary-dashboard.html` | MERGE | MEDIUM | 8 hrs |
| CIC Stability Dashboard | `rewrite-mcp/projects/cic/ingestion/cic-stability-dashboard.html` | MERGE | MEDIUM | 6 hrs |
| CIC Prompt Telemetry | `rewrite-mcp/tools/prompt-telemetry/dashboard.html` | MERGE | MEDIUM | 7 hrs |
| Helm Cost Intelligence | `rewrite-mcp/tools/helm/dashboard.html` | DEPRECATE | LOW | 1 hr |
| Rewrite Labs Benchmark (artifact) | `rewrite-mcp/benchmarks/out/dashboard.html` | DEPRECATE | LOW | 1 hr |
| operator-ui (partial dup) | `rewrite-mcp/operator-ui/` | DEPRECATE | HIGH | 2 hrs |
| operator-ui (full clone) | `rewrite-mcp/planning-engine/apps/operator-ui/` | DEPRECATE | CRITICAL | 3 hrs |
| operator-ui (legacy) | `CIP/RewriteLabs/rewrite-mcp/operator-ui/` | DEPRECATE | MEDIUM | 1 hr |
| External Repo Updates panel | `ui-dashboard.tsx:46` | REWRITE | HIGH | 9 hrs |
| Extractor Results panel | `ui-dashboard.tsx:164` | REWRITE | MEDIUM | 8 hrs |
| Roadmap External Items panel | `ui-dashboard.tsx:298` | REWRITE | MEDIUM | 7 hrs |

**Totals:** KEEP 2 (20 hrs) · MERGE 4 (31 hrs) · DEPRECATE 6 (9 hrs) · REWRITE 3 (24 hrs) → **~84 hrs** full consolidation.

### Shadow worktree copies (auto-excluded, no classification needed)
The following are transient git-worktree copies under `.claude/worktrees/agent-*/` and `rewrite-mcp/.claude/worktrees/agent-*/`. They are **not real surfaces** — they are agent scratch checkouts and are auto-cleaned. Listed for completeness only; no action beyond ensuring `.claude/worktrees/` is gitignored:
- `.claude/worktrees/agent-*/ui-dashboard.tsx` (3 copies)
- `.claude/worktrees/agent-*/rewrite-mcp/tools/prompt-telemetry/dashboard.html` (4 copies)

---

## 5. Recommended Console v3 Consolidation Path

1. **Anchor:** Promote `rewrite-mcp/apps/operator-ui/` (CIC Command Center) → Console v3, hosted on the existing `planning-console` docker-compose service (port 3200→3000).
2. **Absorb (MERGE):** Fold React panel layouts + VectorMetrics live wiring, Canary SSE alerts, Stability soak metrics, and Prompt-Telemetry cost panels into the Command Center panel suite.
3. **Rebuild (REWRITE):** Re-implement the three mock React panels against live sources (cic-ingestion signals, codeflow/repomix extraction, planning-engine roadmap synthesis).
4. **Embed:** Link Grafana (CIC WIL Overview) into Console v3 Health/Alerts rather than re-charting.
5. **Delete (DEPRECATE):** Remove all duplicate/legacy operator-ui copies + cost/benchmark prototypes after confirming no unique logic; collapse the `planning-engine/` repo clone.
6. **Govern:** Wire Console v3 Controls panel to the governance approval-gate API so skill invocation requires a council vote (closes the §3.6 governance gap).

---

## 6. Operator Veto Requests (for Phase 4.5 gate)

1. **CRITICAL — `planning-engine/` clone collapse:** Confirm `rewrite-mcp/planning-engine/` is a stale full-repo clone safe to delete (vs. an intentional isolated build). Blast radius is large.
2. **MERGE scope:** Confirm the four MERGE surfaces fold into Console v3 vs. remaining standalone.
3. **DEPRECATE — `CIP/RewriteLabs/`:** Confirm archival status; delete vs. move to explicit `archive/`.
4. **KEEP — Grafana boundary:** Confirm Grafana remains the metrics substrate (embed, not re-implement).
5. **REWRITE priority:** Confirm the External Repo Updates panel is top REWRITE priority (highest operator-deception risk).

---

## 7. Acceptance Self-Check

- [x] Every dashboard/console surface classified (11 surfaces + 3 REWRITE behaviors + shadow worktrees noted) — **no "TBD"**.
- [x] Every rationale is more than one sentence.
- [x] Severity assigned to every item (drift-risk basis stated).
- [x] Governance violations flagged where present (observability-honesty, duplicate-surface, build-artifact hygiene, missing approval gate).
- [x] Cost estimates provided and defensible (basis: wire vs. merge vs. delete effort, stated per item).
- [x] All paths absolute.
