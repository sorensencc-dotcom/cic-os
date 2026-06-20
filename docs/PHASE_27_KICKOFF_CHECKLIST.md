# Phase 27: Aperture — Kickoff Checklist

**Phase Duration:** ~14 days  
**Start Date:** 2026-06-20  
**Target Completion:** 2026-07-04  
**Status:** Ready to Execute

---

## M1: Registry + Policy Engine (2 days)

- [x] Spec locked (`PHASE_27_APERTURE_EXECUTION_LAYER.md`)
- [x] Types defined (`src/aperture/types/index.ts`)
- [x] Registry skeleton (`src/aperture/registry/AdapterRegistry.ts`)
- [x] Policy engine skeleton (`src/aperture/policy/PolicyEngine.ts`)
- [ ] **Registry implementation**
  - [ ] JSON Schema validation (integrate `ajv` or similar)
  - [ ] Test all registry lookups
  - [ ] Test v1 adapter registration
  - [ ] Tests: 20+ unit tests for registry + policy
- [ ] **Policy engine implementation**
  - [ ] Policy loading from YAML
  - [ ] Authorization decision logic
  - [ ] Limit tracking + enforcement
  - [ ] Approval gate integration (Phase 24 bridge)
  - [ ] Tests: 30+ unit tests for policy engine
- [ ] **M1 Acceptance**
  - [ ] Registry + policy engine 100% tested
  - [ ] No nondeterministic behavior
  - [ ] Documentation complete

---

## M2: Orchestrator + Sandbox (3 days)

- [x] Orchestrator skeleton (`src/aperture/orchestrator/ExecutionOrchestrator.ts`)
- [x] Sandbox skeleton (`src/aperture/sandbox/SandboxRuntime.ts`)
- [ ] **Orchestrator implementation**
  - [ ] Execution flow: validate → authorize → sandbox → execute → receipt
  - [ ] Receipt creation (deterministic ID, timestamps, metrics)
  - [ ] Error handling (timeout, validation, policy failures)
  - [ ] Event bus integration (emit to CIC Event Bus)
  - [ ] Approval gate routing (Phase 24 integration)
  - [ ] Retry logic with exponential backoff
  - [ ] Tests: 25+ unit + integration tests
- [ ] **Sandbox implementation**
  - [ ] Ephemeral tmpdir creation/cleanup
  - [ ] Environment isolation
  - [ ] Resource quotas (memory, CPU)
  - [ ] Credential scoping (from policy)
  - [ ] Deterministic cleanup
  - [ ] Tests: 15+ unit tests for sandbox lifecycle
- [ ] **M2 Acceptance**
  - [ ] Orchestrator deterministic (same input → same receipt ID, flow)
  - [ ] Sandbox isolation verified (no cross-agent leakage)
  - [ ] All error paths tested
  - [ ] Receipt format locked

---

## M3: Adapter Implementations (4 days)

- [x] Base adapter class (`src/aperture/adapters/BaseAdapter.ts`)
- [x] Shell exec adapter stub (`src/aperture/adapters/shell/ShellExecAdapter.ts`)
- [x] File read adapter stub (`src/aperture/adapters/file/FileReadAdapter.ts`)
- [x] HTTP GET adapter stub (`src/aperture/adapters/http/HttpGetAdapter.ts`)
- [ ] **Complete remaining adapters**
  - [ ] `file.write` adapter
    - [ ] Write to file in sandbox
    - [ ] Append vs. overwrite modes
    - [ ] Tests: 5+ unit tests
  - [ ] `file.list` adapter
    - [ ] List directory contents
    - [ ] Path validation (no traversal)
    - [ ] Tests: 5+ unit tests
  - [ ] `http.post` adapter
    - [ ] POST with JSON/form body
    - [ ] Header + credential scoping
    - [ ] Tests: 5+ unit tests
  - [ ] `http.head` adapter
    - [ ] HEAD request
    - [ ] Tests: 3+ unit tests
  - [ ] `browser.navigate` adapter (optional for M3)
    - [ ] Navigate to URL
    - [ ] Wait for selector
    - [ ] Screenshot capability
    - [ ] Tests: 5+ unit tests
  - [ ] `browser.extract` adapter (optional for M3)
    - [ ] Extract HTML/text from page
    - [ ] Tests: 3+ unit tests
  - [ ] `model.generate` adapter (optional for M3)
    - [ ] Call model API
    - [ ] Token counting
    - [ ] Tests: 5+ unit tests
- [ ] **Adapter hardening**
  - [ ] All adapters validate input against schema
  - [ ] All adapters normalize output to schema
  - [ ] All adapters handle errors gracefully
  - [ ] All adapters have deterministic contracts
  - [ ] Tests: 60+ total adapter tests (15+ per mandatory adapter)
- [ ] **M3 Acceptance**
  - [ ] 5+ mandatory v1 adapters (shell.exec, file.read, file.write, http.get, http.post)
  - [ ] 100% input/output schema compliance
  - [ ] All adapters pass schema validation
  - [ ] Optional adapters (browser, model) stubbed for M4

---

## M4: Integration Testing + Observability (3 days)

- [ ] **Orchestrator end-to-end tests**
  - [ ] Success path: execute → receipt → cleanup
  - [ ] Policy denial path
  - [ ] Approval gate path (Phase 24 sync)
  - [ ] Timeout path
  - [ ] Retry path
  - [ ] Sandbox isolation (parallel executions)
  - [ ] Tests: 20+ integration tests
- [ ] **Event bus integration**
  - [ ] Orchestrator emits ExecutionReceipt to event bus
  - [ ] Policy denials logged
  - [ ] Sandbox errors logged
  - [ ] Metrics emitted (latency, errors, throughput)
  - [ ] Tests: 10+ observability tests
- [ ] **Prometheus metrics**
  - [ ] `aperture_adapter_invocations_total{adapter, status, agent}`
  - [ ] `aperture_adapter_latency_seconds{adapter, quantile}`
  - [ ] `aperture_policy_denials_total{agent, reason}`
  - [ ] `aperture_sandbox_teardown_failures_total`
  - [ ] Tests: 5+ metrics validation tests
- [ ] **Documentation**
  - [ ] API documentation (orchestrator, registry, policy, sandbox)
  - [ ] Adapter developer guide (BaseAdapter + example adapters)
  - [ ] Policy writing guide (YAML format, example policies)
  - [ ] Troubleshooting guide (common errors, debugging)
- [ ] **M4 Acceptance**
  - [ ] 60+ total tests passing (unit + integration + e2e)
  - [ ] All error scenarios tested
  - [ ] Observability dashboard shows metrics
  - [ ] Documentation complete + examples working

---

## M5: CRO Wiring + Phase 28 Readiness (2 days)

- [ ] **CRO integration**
  - [ ] CRO (Runtime Orchestrator) uses Aperture for task execution
  - [ ] CRO routes tasks → appropriate adapters
  - [ ] CRO handles execution receipts
  - [ ] Tests: 10+ integration tests (CRO + Aperture)
- [ ] **Phase 24 governance bridge**
  - [ ] ApprovalGate integration (if approval required, wait for Phase 24 approval)
  - [ ] Audit trail: all denials + approvals logged
  - [ ] Tests: 5+ tests for governance sync
- [ ] **Phase 26 (TorqueQuery) bridge**
  - [ ] Adapters can ingest results into TorqueQuery
  - [ ] Query results linked to execution receipts
  - [ ] Tests: 3+ integration tests
- [ ] **Phase 28 readiness**
  - [ ] CKG (Knowledge Graph) can consume execution receipts
  - [ ] CKG indexes adapter operations (for auditability)
  - [ ] Tests: 3+ Phase 27→28 readiness tests
- [ ] **Release prep**
  - [ ] Clean commit history
  - [ ] All tests passing (60+)
  - [ ] Code review passed
  - [ ] Documentation complete
  - [ ] No nondeterministic behavior
- [ ] **M5 Acceptance**
  - [ ] CRO fully wired to Aperture
  - [ ] All Phase 28 entry criteria met
  - [ ] Ready to merge to main

---

## Testing Matrix

| Component | Unit Tests | Integration Tests | E2E Tests | Total |
|-----------|-----------|------------------|----------|-------|
| Registry | 20 | 5 | — | 25 |
| Policy Engine | 30 | 5 | — | 35 |
| Orchestrator | 15 | 20 | 5 | 40 |
| Sandbox | 15 | 5 | — | 20 |
| Adapters (v1) | 50 | 10 | 5 | 65 |
| Observability | 5 | 10 | — | 15 |
| CRO Integration | — | 10 | 3 | 13 |
| **TOTAL** | **135** | **65** | **13** | **213** |

**Target:** ≥200 tests passing by Phase 27 completion.

---

## Exit Criteria (Hard Requirements)

- [ ] All 13 v1 adapters implemented & tested
- [ ] Registry covers 100% of defined adapters
- [ ] Policy engine authorizes/denies 100% correctly
- [ ] Orchestrator deterministic (determinism audit passed)
- [ ] Sandbox isolation verified (security audit passed)
- [ ] 200+ tests passing (60+ per major component)
- [ ] All adapters comply with input/output schema
- [ ] Event bus integration live
- [ ] Prometheus metrics exported
- [ ] Zero nondeterministic behavior
- [ ] Documentation complete (RFC + API + guides)
- [ ] Code reviewed + approved
- [ ] Ready to merge to main

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Policy explosion | High | Sealed defaults; whitelist-only override |
| Sandbox overhead | Medium | Sandbox pool + lazy init; benchmark latency |
| Approval bottleneck (Phase 24) | Medium | Async approval; operation queue until approved |
| Determinism loss | High | Freeze env at sandbox create; deterministic clock |
| Schema validation perf | Low | Cache validation results; benchmark against 100K ops |

---

## Daily Standup Template

```
Status: [On Track / At Risk / Blocked]
Completed: [Tasks finished]
In Progress: [Current tasks]
Blockers: [Any impediments]
Next: [What's next]
```

---

## Commit Strategy

- **Atomic commits per component:** Registry, Policy, Orchestrator, Sandbox, Adapters, Tests, Docs
- **Format:** `feat(phase-27): [Component] [Brief description]`
- **Examples:**
  - `feat(phase-27): Registry: implement adapter lookup + v1 registration`
  - `feat(phase-27): Policy: deterministic authorization engine`
  - `feat(phase-27): Orchestrator: execution flow + receipt generation`
  - `feat(phase-27): Sandbox: ephemeral isolation + cleanup`
  - `feat(phase-27): Adapters: v1 implementations (shell, file, http)`
  - `test(phase-27): 65+ tests for adapters + orchestrator`
  - `docs(phase-27): API docs + policy writing guide`

---

## Success Metrics (Observability)

- **Adapter success rate:** >99.5% (policy-enforced ops)
- **Median adapter latency:** <500ms (excluding I/O)
- **Receipt correctness:** 100% (audit-verified via determinism audit)
- **Policy denial precision:** 0 false negatives (all violations caught)
- **Sandbox cleanup:** 100% success
- **Test coverage:** >90% (unit + integration)
- **Nondeterminism:** 0 instances detected

---

## Notes

- This is Phase 27's *execution* checklist, not the specification.
- The specification is locked in `PHASE_27_APERTURE_EXECUTION_LAYER.md`.
- Code skeletons are ready in `cic-ingestion/src/aperture/`.
- Refer to CLAUDE.md for test patterns (Jest + ts-jest + batch approval).
- After Phase 27, proceed to Phase 28 (CKG) which consumes Aperture execution receipts.

