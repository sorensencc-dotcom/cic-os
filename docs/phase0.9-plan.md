# Phase 0.9: Autonomous Self-Healing Infrastructure (TheFoundry)

**Deterministic, Self-Repairing Build System**

## Overview

Phase 0.9 makes the build system autonomous by adding self-healing capabilities:

1. **Auto-Restart:** Detect failures, restart failed nodes automatically
2. **Auto-Rebuild:** Rebuild from last known-good state on cascading failures
3. **Auto-Repair:** Fix common failure modes without human intervention
4. **Self-Validate:** Detect drift, trigger remediation
5. **Sealed Builds:** Deterministic Docker-based execution for reproducibility

Result: Zero-human-intervention build orchestration.

## Core Components

### 1. FailureDetector
Monitors build execution for anomalies:

**Detection Types:**
- **Timeout:** Node takes >2x historical average
- **Crash:** Node returns non-zero exit code
- **Drift:** Output signature doesn't match lineage
- **Resource:** CPU/memory spike beyond threshold
- **Cascade:** Failure in upstream node affecting downstream

**Metrics:**
- Anomaly score (0-100)
- Confidence (80%+ required for action)
- Remediation recommendation

**Latency:** <100ms detection, <1s action

### 2. AutoRestartEngine
Restarts failed nodes with exponential backoff:

**Strategy:**
1. Immediate restart (same config)
2. Restart with reduced parameters (lower parallelism, temp)
3. Restart with fallback agent (if available)
4. Escalate to AutoRepairEngine

**Limits:**
- Max 3 retries per node
- Max 5 total retries per build
- Time limit: 10 minutes total

**Success Criteria:**
- Node succeeds and produces expected outputs
- Drift signature matches lineage record
- Downstream nodes accept outputs

### 3. AutoRepairEngine
Fixes common build failures:

**Repair Strategies:**

| Failure | Cause | Repair |
|---------|-------|--------|
| OOM error | Too much memory | Reduce batch size, restart |
| GPU OOM | Model too large | Use smaller model, fall back to CPU |
| Timeout | Slow network | Retry with local cache |
| Semantic error | Bad extraction | Re-extract with different parser |
| Output mismatch | Stale cache | Clear cache, rebuild |
| Dependency missing | Version conflict | Use pinned version, restart |

**Execution:**
1. Parse error message
2. Look up repair strategy
3. Apply repair (modify config, clear cache, etc.)
4. Restart node
5. Validate repair worked

**Logging:** Every repair recorded for learning

### 4. StateRecoveryManager
Implements cascading rollback:

**Levels:**
- **Level 1:** Rollback single node to last checkpoint
- **Level 2:** Rollback subtree (node + dependents) to last known-good
- **Level 3:** Rollback entire build to parent build state
- **Level 4:** Escalate to manual intervention

**Checkpoints:**
- After every successful node
- After every successful layer (execution round)
- After every build phase

**Storage:** PostgreSQL checkpoints table, S3 artifacts bucket

**Restore Time:** <30 seconds from Level 1-2, <2 minutes from Level 3

### 5. DriftAutomation
Extends Phase 0.7 DriftDetector with auto-remediation:

**Detection → Remediation Loop:**
```
Detect Drift → Classify Severity → Apply Remedy → Validate → Update Lineage
```

**Severities:**
- **Low** (info): Log, continue
- **Medium** (warning): Restart node with parameters adjustment
- **High** (error): Rollback to parent, escalate
- **Critical** (failure): Quarantine build, manual review

**Remediation Examples:**
- Semantic drift: Re-parse inputs
- Temporal drift: Regenerate with fresh timestamp
- Causal drift: Rebuild affected subtree
- Signature drift: Validate inputs, retry

### 6. SelfHealingOrchestrator
Coordinates all self-healing components:

**State Machine:**
```
RUNNING
  ├→ [anomaly detected]
  ├→ DETECTING
  ├→ CLASSIFYING
  ├→ ATTEMPTING_REPAIR
  ├→ [repair succeeds]
  ├→ VALIDATING
  └→ [validation passes]
  └→ RUNNING

  [repair fails] → ESCALATING
  [escalation fails] → MANUAL_INTERVENTION
```

**Decision Logic:**
```
if (failure_critical) {
  rollback(parent_build);
} else if (repair_available && confidence > 80%) {
  apply_repair();
  restart();
} else if (retries_remaining) {
  retry_with_backoff();
} else {
  escalate_to_human();
}
```

## Data Structures

### FailureEvent
```typescript
{
  build_id: string;
  node_id: string;
  failure_type: 'timeout' | 'crash' | 'drift' | 'resource' | 'cascade';
  anomaly_score: 0-100;
  confidence: 0-100;
  error_message: string;
  recommended_repair: string;
  timestamp: ISO8601;
}
```

### RepairAction
```typescript
{
  repair_id: string;
  failure_event_id: string;
  repair_type: string;
  params_before: {};
  params_after: {};
  success: boolean;
  duration_ms: number;
  timestamp: ISO8601;
}
```

### Checkpoint
```typescript
{
  checkpoint_id: string;
  build_id: string;
  node_id: string;
  layer: number;
  artifact_state: {};
  lineage_snapshot: {};
  timestamp: ISO8601;
}
```

## Sealed Build Environment (TheFoundry)

**Deterministic Execution:**
- Node 20.x LTS pinned in Dockerfile
- All dependencies pinned to exact versions
- Reproducible OS layer (Alpine + apk checksums)
- Sealed artifact registry (read-only after build)

**Isolation:**
- Docker container per build (no shared state)
- Mounted tmpfs for ephemeral data
- Read-only code volumes
- No outbound network access (except approved APIs)

**Reproducibility Guarantee:**
- Same input → Same output (byte-for-byte)
- Verified via SBOM comparison
- Content-addressed artifact storage
- Diff detection on any divergence

## Implementation Phases

### Phase 0.9.1: FailureDetector
- Implement detection logic (15 anomaly types)
- Metrics pipeline (100ms latency)
- Unit tests (30+ scenarios)
- 2 days

### Phase 0.9.2: AutoRestartEngine
- Retry logic with exponential backoff
- Fallback routing
- Integration with Phase 0.8 PRE
- 2 days

### Phase 0.9.3: AutoRepairEngine
- 6 core repair strategies
- Error message parsing
- Config mutation + validation
- 3 days

### Phase 0.9.4: StateRecoveryManager
- Checkpoint creation + storage
- Cascading rollback logic
- Recovery time validation (<30s)
- 2 days

### Phase 0.9.5: DriftAutomation
- Severity classification
- Auto-remediation for each level
- Integration with Phase 0.7 DriftDetector
- 2 days

### Phase 0.9.6: SelfHealingOrchestrator
- State machine implementation
- Coordination logic
- Decision tree + scoring
- 2 days

### Phase 0.9.7: TheFoundry Docker
- Sealed build environment
- Deterministic Dockerfile
- SBOM verification
- Reproducibility tests
- 3 days

### Phase 0.9.8: Integration + Testing
- End-to-end chaos testing (100+ failure scenarios)
- Recovery time SLA validation
- Production readiness checklist
- 3 days

## Success Criteria

1. **MTTR (Mean Time To Recovery):** <5 minutes for 95% of failures
2. **Success Rate:** 99%+ of builds complete without human intervention
3. **Repair Accuracy:** 90%+ repair actions succeed
4. **Reproducibility:** 100% of builds deterministic (SBOM matches)
5. **No Data Loss:** All checkpoints restore successfully
6. **Zero Escalations:** <1% of builds require manual intervention

## Timeline

- **Start:** 2026-06-22 (after Phase 0.7/0.8 integration)
- **Completion:** 2026-07-06 (15 days)
- **Parallel:** Phase 24 autonomy stack, Phase 26 TorqueQuery

## Dependencies

- Phase 0.7: Complete ✓
- Phase 0.8: Complete (routing foundation)
- Phase 24.3: MemoryStore (checkpoint storage)
- Phase 24.5: Build governance (validation)

## Architecture Diagram

```
Build Execution
      ↓
┌─────────────────────────────────────────────┐
│ SelfHealingOrchestrator (state machine)     │
└─────────────────────────────────────────────┘
      ↓
[Node Running]
      ↓
┌─────────────────────────────────────────────┐
│ FailureDetector (anomaly scoring)           │
└─────────────────────────────────────────────┘
      ↓ [failure detected]
┌─────────────────────────────────────────────┐
│ Decision Logic (escalation path)            │
├─────────────────────────────────────────────┤
│ ├→ AutoRestartEngine (exponential backoff)  │
│ ├→ AutoRepairEngine (fix common issues)     │
│ ├→ StateRecoveryManager (rollback)          │
│ └→ DriftAutomation (validate + remediate)   │
└─────────────────────────────────────────────┘
      ↓ [resolved]
[Resume Build]
      ↓
TheFoundry (sealed Docker execution)
      ↓
[Build Complete]
```

## Monitoring + Observability

**Metrics:**
- Failure detection latency (p50, p99)
- Repair success rate by type
- MTTR by failure class
- Escalation rate
- Checkpoint size + restore time

**Alerts:**
- Escalation rate > 5%
- MTTR > 5 minutes
- Repair accuracy < 85%
- Checkpoint restore failure

**Dashboard:**
- Real-time failure heatmap (failure type vs. node)
- MTTR trends (weekly)
- Repair effectiveness (success rate by strategy)
- Build reliability (success rate over time)

## Risks + Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Auto-repair makes things worse | Critical | Dry-run before applying repair, rollback on failure |
| Cascading restarts exhaust resources | High | Restart limit + circuit breaker |
| Checkpoints consume too much disk | Medium | Compress + archive old checkpoints weekly |
| Race condition in concurrent repairs | High | Build-level lock, no parallel repairs |
| False positives cause unnecessary restarts | Medium | Anomaly score threshold 80%+ |

## Deliverables

1. `cic/src/build-system/failure-detector.ts` (250 lines)
2. `cic/src/build-system/auto-restart-engine.ts` (200 lines)
3. `cic/src/build-system/auto-repair-engine.ts` (350 lines)
4. `cic/src/build-system/state-recovery-manager.ts` (300 lines)
5. `cic/src/build-system/drift-automation.ts` (200 lines)
6. `cic/src/build-system/self-healing-orchestrator.ts` (400 lines)
7. `build-system/docker/Dockerfile.theFoundry` (sealed build image)
8. `cic/src/build-system/__tests__/self-healing-*.test.ts` (800+ lines, 100+ tests)
9. `docs/phase0.9/*.md` (5 docs)
10. PostgreSQL checkpoints schema + migration

## Version

- Phase: 0.9
- Status: Specification Locked
- Created: 2026-06-12
- Execution Start: 2026-06-22
