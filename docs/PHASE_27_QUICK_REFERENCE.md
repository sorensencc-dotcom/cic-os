# Phase 27: Aperture — Quick Reference Card

## What It Does
Deterministic, policy-governed execution layer for CRO. Runs shell, file, HTTP, browser, model operations safely.

## Key Components
| Component | What | Where |
|-----------|------|-------|
| **Registry** | Adapter inventory | `registry/AdapterRegistry.ts` |
| **Policy** | Authorization + limits | `policy/PolicyEngine.ts` |
| **Orchestrator** | Execution loop | `orchestrator/ExecutionOrchestrator.ts` |
| **Sandbox** | Isolation + cleanup | `sandbox/SandboxRuntime.ts` |
| **Adapters** | Operation impls | `adapters/` |

## Execution Flow
```
Input → Registry ✓ → Policy ✓ → Sandbox → Adapter → Receipt → Event Bus
```

## V1 Adapters
| ID | What | Required | Status |
|----|------|----------|--------|
| `shell.exec` | Run command | ✓ | Skeleton |
| `file.read` | Read file | ✓ | Skeleton |
| `file.write` | Write file | ✓ | Skeleton |
| `http.get` | GET request | ✓ | Skeleton |
| `http.post` | POST request | ✓ | Skeleton |
| `file.list` | List dir | — | Optional |
| `http.head` | HEAD request | — | Optional |
| `browser.*` | Browser ops | — | Optional |
| `model.*` | LLM ops | — | Optional |

## Execution Receipt
```json
{
  "id": "uuid",
  "adapter": "http.get",
  "agent": "harvester",
  "status": "success",
  "latency_ms": 142,
  "policy_check": { "authorized": true },
  "sandbox": { "cleanup_status": "success" }
}
```

## Policy Example
```yaml
agent: harvester
allow: [http.get, file.write, model.generate]
deny: [shell.exec]
limits:
  max_calls: 50
  max_bytes: 5242880
  rate_limit_qps: 10
safety:
  no_destructive: true
  require_approval_for: [file.write, model.generate]
```

## Integration Checklist
- [ ] Phase 24 ApprovalGate bridge (done in M2)
- [ ] Phase 26 TorqueQuery ingestion (M4)
- [ ] Phase 28 CKG receipt consumption (M5)
- [ ] CRO task routing (M5)

## Testing Requirements
| Category | Count | Status |
|----------|-------|--------|
| Unit | 135+ | In progress |
| Integration | 65+ | In progress |
| E2E | 13+ | In progress |
| **Total** | **213+** | **Target: 200+ passing** |

## Key Files
- **Spec:** `docs/PHASE_27_APERTURE_EXECUTION_LAYER.md`
- **Checklist:** `docs/PHASE_27_KICKOFF_CHECKLIST.md`
- **Summary:** `docs/PHASE_27_EXECUTION_SUMMARY.md`
- **Skeletons:** `cic-ingestion/src/aperture/`

## Success Metrics
- ✓ Registry deterministic (lookup: O(1))
- ✓ Policy deterministic (authorize: O(1))
- ✓ Orchestrator deterministic (same receipt structure per input)
- ✓ Sandbox 100% cleanup success
- ✓ Adapter schema 100% compliance
- ✓ Receipt correctness 100% (audit-verified)

## Fast Facts
- **Lines of Code (Skeletons):** ~1,750
- **Components:** 5 major
- **V1 Adapters:** 5 mandatory + 4 optional
- **Tests:** 213+ target
- **Duration:** 14 days
- **Entry:** Phase 24 + 26 completed
- **Exit:** Phase 28 ready

## Common Tasks
| Task | How |
|------|-----|
| Register adapter | `registry.register(definition)` |
| Check policy | `policyEngine.authorize(agent, adapterId)` |
| Execute op | `orchestrator.execute(adapterId, input, context)` |
| Create sandbox | `sandboxRuntime.create(spec)` |
| Add policy | `policyEngine.load(definition)` |

## Exit Criteria (TL;DR)
- All adapters implemented
- 200+ tests passing
- Determinism + security audits passed
- CRO wired + Phase 28 ready
- Documentation complete

---

**Refer to full spec for details. This is the executive summary.**
