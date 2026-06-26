# Build Automation Guide

Complete reference for queuing, scheduling, and executing builds using Claude Skills.

## Overview

Three skills manage build automation:

| Skill | Use Case | Complexity |
|-------|----------|-----------|
| **build-queue-executor** | Quick local builds in sequence | Low |
| **github-actions-setup** | CI/CD pipelines, cloud builds | Medium |
| **roadmap-queue-manager** | Multi-phase projects with dependencies | High |

## Quick Start

### Option 1: Local Queue (Fastest)

Run builds locally, one after another. Tests & commits inline.

```bash
/build-queue-executor '{
  "builds": [
    { "name": "Phase 28a", "tests": true, "commit": true },
    { "name": "Phase 24.5", "tests": true, "commit": true }
  ],
  "stopOnFail": true,
  "pushOnComplete": true
}'
```

**When to use:** Quick validation, <5 phases, no cloud resources needed.

---

### Option 2: GitHub Actions (Recommended)

Automated pipelines triggered manually or on push. Audit trail for governance.

```bash
# Setup workflows once
/github-actions-setup

# Trigger from CLI anytime
gh workflow run build.yml -f phase="Phase 28a"

# Or use GitHub UI: Actions tab → Run workflow
```

**When to use:** Production builds, governance audit needed, want parallel execution.

---

### Option 3: Roadmap Queue (Complex Projects)

Dependency-aware queuing. Phases wait for blockers. Auto-updates project state.

```bash
# Initialize roadmap
/roadmap-queue-manager init

# Process all queued phases (respects dependencies)
/roadmap-queue-manager process

# Check status anytime
/roadmap-queue-manager status
```

**When to use:** 5+ phases, dependencies between phases, long-running projects.

---

## Detailed Workflows

### Workflow A: Single Build (Local)

**Goal:** Test one phase locally before pushing.

```bash
# 1. Edit code
vim src/governance/services/status-tracker.ts

# 2. Queue local build
/build-queue-executor '{
  "builds": [
    { "name": "Phase 28a.5 Status Tracker", "tests": true, "commit": false }
  ]
}'

# 3. Check results
git status

# 4. Manual commit if happy
git add . && git commit -m "Fix: Status tracker governance integration"
git push origin main
```

### Workflow B: Multi-Phase Release (GitHub Actions)

**Goal:** Release 3 phases, each tested before moving to next.

```bash
# 1. Ensure workflows exist
/github-actions-setup

# 2. Trigger Phase 1
gh workflow run build.yml -f phase="Phase 28a"
# ... wait for pass ...

# 3. Trigger Phase 2
gh workflow run build.yml -f phase="Phase 24.5"
# ... wait for pass ...

# 4. Trigger Phase 3
gh workflow run build.yml -f phase="Phase 23.2"

# 5. Monitor all runs
gh run list

# 6. Deploy on success
gh workflow run deploy.yml -f environment="staging" -f phase="Phase 28a"
```

### Workflow C: Project Build (Roadmap Queue)

**Goal:** Build entire roadmap, respecting dependencies.

```bash
# 1. Create roadmap.json
/roadmap-queue-manager init

# 2. Edit priorities & dependencies
vim build-roadmap.json
# Ensure Phase 28a has priority 1 (no deps)
# Ensure Phase 24.5 has priority 2 (depends on 28a)
# etc.

# 3. Process queue
/roadmap-queue-manager process
# Automatically:
# - Checks dependencies
# - Builds Phase 28a → tests → commits
# - Waits for completion
# - Builds Phase 24.5 → tests → commits
# - Skips blocked phases with reasons

# 4. Review status
/roadmap-queue-manager status

# 5. Manual intervention if needed
/roadmap-queue-manager set "Phase 23.2" blocked "Waiting for code review"
```

---

## Decision Matrix

**Pick your automation method:**

```
Is this a single build?
├─ YES → /build-queue-executor
└─ NO → Do you have a roadmap with dependencies?
    ├─ YES → /roadmap-queue-manager
    └─ NO → /github-actions-setup
```

---

## Advanced: Combining Skills

### Scenario: Staged Release

1. **Local validation** → `/build-queue-executor` (2 phases, quick test)
2. **Code review** → (manual PR review)
3. **Production build** → `/github-actions-setup` (full test suite, deploy)

```bash
# Dev machine: quick local test
/build-queue-executor '{ "builds": [{"name": "Phase 28a", "tests": true, "commit": false}] }'

# PR reviewer approves

# CI/CD pipeline: full test
gh workflow run build.yml -f phase="Phase 28a"

# On pass: deploy
gh workflow run deploy.yml -f environment="production" -f phase="Phase 28a"
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails locally | Check Docker: `docker-compose logs cic-wil` |
| Tests timeout | Increase jest timeout in jest.config.js |
| Workflow doesn't trigger | Verify .github/workflows/ exists with correct syntax |
| Roadmap stuck (blocked) | Run `roadmap-queue-manager set Phase blocked "reason"` then `process` |
| Push fails | Pull latest: `git pull origin main` |

---

## Audit & Governance

All automation logs are trackable:

| Method | Audit Trail |
|--------|------------|
| build-queue-executor | Git commits with "[automated]" tag |
| github-actions-setup | GitHub Actions run history (immutable, timestamped) |
| roadmap-queue-manager | build-roadmap.json status changes (git history) |

For Phase 24 governance, GitHub Actions provides full audit trail:
- Who triggered the workflow
- When it ran
- What code was tested
- Pass/fail results
- Who deployed where

---

## Reference

- [Build Queue Executor Skill](../skills/build-queue-executor.md)
- [GitHub Actions Setup Skill](../skills/github-actions-setup.md)
- [Roadmap Queue Manager Skill](../skills/roadmap-queue-manager.md)
- [Build Architecture](../architecture/build-system.md)
