# Phase 0.7 — Unified CIC + Rewrite Labs + Nemotron/NIM

Phase 0.7 introduces a unified, deterministic, multi-agent build and execution model
that merges CIC, Rewrite Labs, and the Nemotron/NIM inference subsystem into a single
governed pipeline.

## Quick Navigation

- [Build Graph](build-graph.md) — What exists
- [Agents](agents.md) — Who exists
- [Routing](routing.md) — How they communicate
- [Inference Routing](inference-routing.md) — How inference flows
- [Security Hardening](security-hardening.md) — How to lock it down
- [CLI Reference](cli-reference.md) — Command palette
- [Operator Runbook](operator-runbook.md) — How to run it

## Core Concepts

### Deterministic Build Graph
Every agent, every dependency, every relationship is declared in `phase0.7.json`.
No dynamic execution. No implicit ordering. No surprises.

### Zero-Trust Routing
All message routing is governed by OPA policies. No agent can send a message unless
the route is explicitly allowed by `cic.routing.rego`.

### Immutable Lineage
Every build produces an immutable lineage record linking inputs → outputs → inference → artifacts.
Full traceability from source code to redesign packets.

### Runtime Isolation
GPU, CPU, and inference boundaries are strictly enforced.
Only redesign GPU calls inference. No cross-agent GPU access.

### Policy-Driven Execution
Build time, routing, and governance are all controlled by Conftest policies.
No manual overrides. No operator exceptions.

## Three Automation Skills

Phase 0.7 is orchestrated by three reusable skills:

- **build-queue-executor** — Local deterministic builds
- **github-actions-setup** — Governed cloud builds with audit
- **roadmap-queue-manager** — Multi-phase orchestration with dependencies

See [Build Automation Guide](../automation/guide.md) for details.

## Status

- ✅ Unified graph defined
- ✅ Agent specs locked
- ✅ Routing policies enforced
- ✅ Lineage schemas validated
- ✅ Security hardening complete
- ✅ CLI command palette ready
- ✅ Operator runbook written
- ✅ Ready for production

---

**Created:** 2026-06-11  
**Last Updated:** 2026-06-11  
**Version:** 0.7.0
