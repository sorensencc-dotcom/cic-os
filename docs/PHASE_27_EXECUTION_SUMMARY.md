# Phase 27: Aperture — Execution Summary

**Date:** 2026-06-20  
**Status:** Specification Locked + Code Skeletons Ready  
**Timeline:** 2 weeks (2026-06-20 through 2026-07-04)

---

## 1. What Is Phase 27 Aperture?

Phase 27 is the **CRO Execution Substrate** — a deterministic, policy-governed execution layer that allows CRO (Runtime Orchestrator) to safely run controlled operations across shell, file, HTTP, browser, and model backends.

Every operation is:
- **Validated** against registry
- **Authorized** via policy engine
- **Executed** in sandbox isolation
- **Audited** with execution receipts
- **Telemetered** to event bus + Prometheus

---

## 2. Deliverables (Ready Now)

### 2.1 Specification
📄 **`docs/PHASE_27_APERTURE_EXECUTION_LAYER.md`** (RFC-locked)
- 6 core components (Registry, Policy, Orchestrator, Sandbox, Adapters, Observability)
- Complete type definitions
- v1 adapter specs
- Exit criteria + success metrics

### 2.2 Code Skeletons (Mutation-Ready)
```
cic-ingestion/src/aperture/
├── types/
│   └── index.ts (400 lines: all Phase 27 types)
├── registry/
│   └── AdapterRegistry.ts (230 lines: adapter inventory)
├── policy/
│   └── PolicyEngine.ts (290 lines: authorization engine)
├── orchestrator/
│   └── ExecutionOrchestrator.ts (360 lines: execution loop)
├── sandbox/
│   └── SandboxRuntime.ts (110 lines: isolation runtime)
├── adapters/
│   ├── BaseAdapter.ts (60 lines: abstract base)
│   ├── shell/
│   │   └── ShellExecAdapter.ts (70 lines: shell.exec)
│   ├── file/
│   │   └── FileReadAdapter.ts (70 lines: file.read)
│   └── http/
│       └── HttpGetAdapter.ts (70 lines: http.get)
└── index.ts (50 lines: factory + exports)
```

**Total:** ~1,750 lines of mutation-ready TypeScript.

### 2.3 Kickoff Plan
📋 **`docs/PHASE_27_KICKOFF_CHECKLIST.md`**
- 5 milestones (M1–M5, 14 days)
- 213+ tests matrix
- Hard exit criteria
- Daily standup template
- Commit strategy
- Risk mitigation

---

## 3. Architecture (5 Minutes)

### Execution Flow
```
Agent calls: orchestrator.execute(adapterId, input, context)
    ↓
1. Registry lookup: adapter exists?
2. Policy check: agent allowed? Within limits?
3. Pre-approval: needs governance gate? (Phase 24 bridge)
4. Sandbox create: ephemeral environment
5. Adapter invoke: run within sandbox
6. Output normalize: match outputSchema
7. Receipt emit: {adapter, status, latency, bytes, ...}
8. Event bus: log to CIC Event Bus
9. Sandbox teardown: cleanup
    ↓
Return: { receipt, output }
```

### Components

| Component | Purpose | Lines | Tests |
|-----------|---------|-------|-------|
| **Registry** | Adapter inventory | 230 | 25+ |
| **Policy** | Authorization + limits | 290 | 35+ |
| **Orchestrator** | Execution loop | 360 | 40+ |
| **Sandbox** | Isolation runtime | 110 | 20+ |
| **Adapters** | Operation implementations | 210 | 65+ |

---

## 4. V1 Adapters (Implementation Priority)

### Mandatory (M3)
- ✅ `shell.exec` — Execute command (restricted)
- ✅ `file.read` — Read file
- ✅ `file.write` — Write file
- ✅ `http.get` — HTTP GET
- ✅ `http.post` — HTTP POST

### Optional (M4)
- `file.list` — List directory
- `http.head` — HTTP HEAD
- `browser.navigate` — Navigate URL
- `browser.extract` — Extract HTML
- `model.generate` — Call LLM

---

## 5. Integration Points

### Phase 24 Governance
- ApprovalGate bridge: operations requiring approval route through Phase 24
- Audit trail: all denials + approvals logged
- Approval status in receipt

### Phase 26 TorqueQuery
- Adapters can ingest results into TorqueQuery
- Query results linked to execution receipts

### Phase 28 CKG (Knowledge Graph)
- CKG consumes execution receipts
- CKG indexes adapter operations for auditability

---

## 6. Quality Bar

### Determinism
- Same input → same receipt structure (same flow)
- All RNG/timestamps frozen in sandbox
- No nondeterministic behavior

### Testing
- **213+ tests** (unit + integration + e2e)
- **≥90% code coverage**
- All error paths tested
- Determinism audit passed
- Security audit passed (sandbox isolation)

### Documentation
- API reference (orchestrator, registry, policy, sandbox)
- Adapter developer guide
- Policy writing guide
- Troubleshooting guide

---

## 7. Timeline (14 Days)

| Milestone | Days | Focus |
|-----------|------|-------|
| **M1** | 2 | Registry + Policy Engine |
| **M2** | 3 | Orchestrator + Sandbox |
| **M3** | 4 | v1 Adapter Implementations |
| **M4** | 3 | Integration Testing + Observability |
| **M5** | 2 | CRO Wiring + Phase 28 Readiness |
| **Total** | **14** | |

**Start:** 2026-06-20  
**Target Completion:** 2026-07-04  
**Merge to Main:** 2026-07-04

---

## 8. Next Steps (Immediate)

### For You (Chris)
1. Review spec: `PHASE_27_APERTURE_EXECUTION_LAYER.md`
2. Review skeletons: `cic-ingestion/src/aperture/`
3. Review checklist: `PHASE_27_KICKOFF_CHECKLIST.md`
4. Confirm approach + timeline
5. Assign ownership (self, team, or delegation)

### Day 1 (2026-06-20)
- [ ] Read spec (30 min)
- [ ] Read checklist (20 min)
- [ ] Code review skeletons (30 min)
- [ ] Kickoff meeting (if team-based)

### Day 2–14
- Execute M1–M5 per checklist
- Daily standup
- Commit atomically per component

---

## 9. Why This Matters

Aperture unlocks:
- **Multi-agent orchestration** (Phase 29)
- **CIC-native agent skills** (Phase 30)
- **OpenSharing model/skill publishing** (Phase 31)
- **TorqueQuery integration** (Phase 26 extension)
- **Rewrite Labs agent ecosystem** compatibility

After Phase 27, CIC stops being "a powerful ingestion engine" and becomes a **fully agent-addressable, policy-governed, multi-adapter execution substrate**.

---

## 10. Artifacts Summary

| Artifact | Location | Purpose |
|----------|----------|---------|
| Spec | `docs/PHASE_27_APERTURE_EXECUTION_LAYER.md` | RFC + architecture |
| Skeletons | `cic-ingestion/src/aperture/` | Mutation-ready code |
| Checklist | `docs/PHASE_27_KICKOFF_CHECKLIST.md` | Execution plan |
| This Doc | `docs/PHASE_27_EXECUTION_SUMMARY.md` | Quick reference |

---

## 11. Success Criteria

Phase 27 is **complete** when:
- [ ] All 13 v1 adapters implemented
- [ ] 200+ tests passing
- [ ] Determinism audit passed
- [ ] Security audit passed (sandbox isolation)
- [ ] Event bus + Prometheus integrated
- [ ] CRO wired to Aperture
- [ ] Phase 28 entry criteria met
- [ ] Documentation complete
- [ ] Code reviewed + merged

---

**Ready to execute. Let me know if you want clarification on any component or if you're ready to start M1.**

