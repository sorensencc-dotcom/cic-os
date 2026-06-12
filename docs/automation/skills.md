# Build Automation Skills Reference

Three reusable Claude skills for build automation. Available globally at `~/.claude/skills/`.

---

## 1. Build Queue Executor

**Location:** `~/.claude/skills/build-queue-executor.md`

Execute local Docker builds in sequence. Each build: compile → test → commit → next.

### Invocation

```
/build-queue-executor [JSON input]
```

### Input Schema

```json
{
  "builds": [
    {
      "name": "Phase 28a",
      "tests": true,
      "commit": true
    }
  ],
  "stopOnFail": true,
  "pushOnComplete": true
}
```

### Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `builds` | array | required | List of build targets |
| `builds[].name` | string | required | Phase name or identifier |
| `builds[].tests` | bool | true | Run npm test for this build |
| `builds[].commit` | bool | true | Git commit on pass |
| `stopOnFail` | bool | true | Halt queue if any build fails |
| `pushOnComplete` | bool | true | Git push after all builds pass |

### Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
[QUEUE] Phase 28a
━━━━━━━━━━━━━━━━━━━━━━━━━━
[BUILD] Docker build...
[START] Bringing up services...
[TEST] Running npm test...
[COMMIT] Staging changes...
[COMMIT] ✅ Phase 28a
━━━━━━━━━━━━━━━━━━━━━━━━━━
[PUSH] Pushing to origin/main...
[PUSH] ✅ Complete
```

### Examples

**Single build, local only (no push)**
```json
{
  "builds": [
    { "name": "Phase 28a", "tests": true, "commit": true }
  ],
  "pushOnComplete": false
}
```

**Skip tests for speed**
```json
{
  "builds": [
    { "name": "Phase 28a", "tests": false, "commit": true },
    { "name": "Phase 24.5", "tests": false, "commit": true }
  ]
}
```

**Fail on first error**
```json
{
  "builds": [
    { "name": "Phase 28a", "tests": true },
    { "name": "Phase 24.5", "tests": true }
  ],
  "stopOnFail": true
}
```

---

## 2. GitHub Actions Setup

**Location:** `~/.claude/skills/github-actions-setup.md`

Create and manage CI/CD workflows. Triggers: manual + on-push. Full audit trail.

### Invocation

```
/github-actions-setup [config]
```

### Generated Workflows

Creates two files in `.github/workflows/`:

1. **build.yml** — Compile + test on push or manual trigger
2. **deploy.yml** — Deploy to staging/production with environment selection

### Manual Triggers

```bash
# Trigger build for specific phase
gh workflow run build.yml -f phase="Phase 28a"

# Deploy to staging
gh workflow run deploy.yml \
  -f environment="staging" \
  -f phase="Phase 28a"

# List all runs
gh run list

# View specific run logs
gh run view <run-id> --log

# Cancel running workflow
gh run cancel <run-id>
```

### Workflow Inputs

**build.yml:**
```
- phase (optional): Target phase (default: all)
```

**deploy.yml:**
```
- environment (required): staging | production
- phase (required): Phase to deploy
```

### GitHub UI Usage

1. Go to **Actions** tab
2. Select workflow (**Build** or **Deploy**)
3. Click **Run workflow**
4. Enter inputs
5. Monitor status

### Features

- ✅ Auto-trigger on push to main
- ✅ Manual trigger with phase selection
- ✅ Environment-specific secrets support
- ✅ Full audit trail (immutable run history)
- ✅ Status checks (pass/fail blocks PR merge)
- ✅ Rollback support (redeploy previous version)

---

## 3. Roadmap Queue Manager

**Location:** `~/.claude/skills/roadmap-queue-manager.md`

Execute phases in priority order, respecting dependencies. Auto-update project state.

### Invocation

```
/roadmap-queue-manager [command] [args]
```

### Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `init` | — | Create build-roadmap.json template |
| `process` | — | Execute all queued phases |
| `status` | — | Display roadmap state |
| `set` | `<phase> <status> [reason]` | Update phase status |

### Input Schema (build-roadmap.json)

```json
{
  "roadmap": [
    {
      "phase": "Phase 28a",
      "status": "complete",
      "priority": 1,
      "dependencies": [],
      "tests": true,
      "commit": true
    },
    {
      "phase": "Phase 24.5",
      "status": "queued",
      "priority": 2,
      "dependencies": ["Phase 28a"],
      "tests": true,
      "commit": true
    }
  ]
}
```

### Phase Statuses

| Status | Meaning |
|--------|---------|
| `queued` | Ready to build, dependencies satisfied |
| `in-progress` | Currently building |
| `complete` | Build + tests + commit done |
| `failed` | Build or test failed |
| `blocked` | Awaiting blocker resolution |
| `skipped` | Intentionally skipped |

### Examples

**Initialize roadmap**
```bash
/roadmap-queue-manager init
# Creates build-roadmap.json with template
```

**Process queued builds**
```bash
/roadmap-queue-manager process
# Checks dependencies
# Builds in priority order
# Auto-updates statuses
# Commits on pass
# Skips blocked/failed phases
```

**Check status**
```bash
/roadmap-queue-manager status
# Displays:
# COMPLETE | Phase 28a | Priority: 1
# IN-PROGRESS | Phase 24.5 | Priority: 2
# QUEUED | Phase 23.2 | Priority: 3
# BLOCKED | Phase 26 | Priority: 4 | Reason: Waiting for Phase 24
```

**Mark phase as blocked**
```bash
/roadmap-queue-manager set "Phase 23.2" blocked "Waiting for code review"
# Stops processing Phase 23.2
# Updates build-roadmap.json
# Continues with next available phase
```

### Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROADMAP QUEUE MANAGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶️  Building Phase 28a...
[BUILD] Docker build...
[TEST] npm test...
[COMMIT] ✅ Phase 28a complete

▶️  Building Phase 24.5...
[BUILD] Docker build...
[TEST] npm test...
[COMMIT] ✅ Phase 24.5 complete

🚫 Phase 23.2 — BLOCKED: Waiting for code review

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROADMAP STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE | Phase 28a | Priority: 1
COMPLETE | Phase 24.5 | Priority: 2
BLOCKED | Phase 23.2 | Priority: 3
QUEUED | Phase 26 | Priority: 4
```

---

## Skill Management

### Install (Already Done)

Skills are pre-installed at `~/.claude/skills/`:

```bash
ls ~/.claude/skills/
  build-queue-executor.md
  github-actions-setup.md
  roadmap-queue-manager.md
```

### Use From Any Project

```bash
cd ~/project-x
/build-queue-executor '{"builds":[...]}'

cd ~/project-y
/github-actions-setup

cd ~/project-z
/roadmap-queue-manager process
```

No per-project setup. Skills are globally available.

### Update Skills

Edit the skill file directly:

```bash
vim ~/.claude/skills/build-queue-executor.md
# Changes apply immediately to all projects
```

---

## Comparison: Which Skill to Use?

| Scenario | Skill | Why |
|----------|-------|-----|
| Test one phase locally | build-queue-executor | Fast, local, no CI overhead |
| Quick validation before push | build-queue-executor | Runs in seconds |
| Multi-phase release with audit | github-actions-setup | Immutable history, governance-ready |
| Complex roadmap (5+ phases) | roadmap-queue-manager | Dependency tracking, auto-updates |
| Parallel builds (faster) | github-actions-setup | Runs jobs concurrently |
| Manual scheduling needed | roadmap-queue-manager | Control priorities & blockers |

---

## Integration with Governance (Phase 24)

All three skills produce audit trails:

### build-queue-executor
- Git commits with `[automated]` tag
- Full local history in git log

### github-actions-setup
- GitHub Actions run history (immutable, timestamped)
- User attribution (who triggered)
- Environment audit (staging vs prod)
- Deploy history with rollback

### roadmap-queue-manager
- build-roadmap.json in git (all status changes)
- Per-phase timestamps (start, complete, fail)
- Blocker reasons documented
- Full dependency graph

**For Phase 24 governance:** Use github-actions-setup for production. It provides full immutable audit trail required by policy.
