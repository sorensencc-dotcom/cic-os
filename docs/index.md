# CIC Build Automation Documentation

Complete guide to building, testing, and deploying CIC phases using automated skills.

## Quick Navigation

**New to build automation?** → Start with [Build Automation Guide](automation/guide.md)

**Need skill details?** → See [Skills Reference](automation/skills.md)

---

## The Three Automation Skills

Build faster. Choose your method:

### 🏃 Quick Local Builds
**[Build Queue Executor](automation/skills.md#1-build-queue-executor)**

Run builds locally in sequence. Tests & commits inline. Perfect for quick validation.

```bash
/build-queue-executor '{ "builds": [{"name": "Phase 28a"}] }'
```

### ☁️ Cloud CI/CD
**[GitHub Actions Setup](automation/skills.md#2-github-actions-setup)**

Automated pipelines with full audit trail. Recommended for production and governance.

```bash
/github-actions-setup
gh workflow run build.yml -f phase="Phase 28a"
```

### 📋 Complex Roadmaps
**[Roadmap Queue Manager](automation/skills.md#3-roadmap-queue-manager)**

Multi-phase projects with dependencies. Auto-updates state, respects blockers.

```bash
/roadmap-queue-manager process
```

---

## Typical Workflows

### Single Phase (Development)

1. Edit code
2. Run `/build-queue-executor` (local test)
3. Push to main

**Duration:** 2-5 minutes

### Release (Production)

1. Setup `/github-actions-setup` (once)
2. Trigger `gh workflow run build.yml -f phase="28a"`
3. Wait for pass
4. Deploy with `gh workflow run deploy.yml`

**Duration:** 10-30 minutes (full test suite)

### Multi-Phase Project

1. Create roadmap with `/roadmap-queue-manager init`
2. Run `/roadmap-queue-manager process`
3. Skill handles dependencies, priorities, blockers

**Duration:** Depends on phase count (minutes to hours)

---

## Why Three Skills?

| Skill | Speed | Audit Trail | Complexity | Governance |
|-------|-------|------------|-----------|-----------|
| Queue Executor | ⚡⚡⚡ Fast | Git commits | Low | ✓ Basic |
| GitHub Actions | ⚡⚡ Medium | Immutable history | Medium | ✅ Full |
| Roadmap Manager | ⚡ Slow | JSON + git | High | ✓ Full |

**For production builds:** Use GitHub Actions (immutable audit trail for Phase 24).

**For local dev:** Use Build Queue Executor (instant feedback).

**For 5+ phases:** Use Roadmap Queue Manager (dependency tracking).

---

## Getting Started

1. **Review the [Build Automation Guide](automation/guide.md)** (10 min read)
2. **Pick your method** (Queue, Actions, or Roadmap)
3. **Follow the examples** in [Skills Reference](automation/skills.md)
4. **Run your first build** (2 min)

---

## Key Concepts

### Skill = Reusable Tool

- Invoke from any project: `/build-queue-executor`
- Stored globally: `~/.claude/skills/`
- No per-project setup
- Available in every Claude Code session

### Audit Trail (Governance)

Every build is tracked:
- Git commits with timestamps
- GitHub Actions run history (immutable)
- Roadmap state changes (JSON diffs)

### Error Handling

All skills are **non-fatal**:
- Failure on Phase 1 doesn't block Phase 2 (with stopOnFail=false)
- Dependency checks prevent invalid queues
- Explicit blocker reasons (Phase X blocked because Y)

---

## Common Questions

**Q: Can I run builds in parallel?**

A: Yes, with GitHub Actions. Each workflow job runs in parallel. Roadmap Queue Manager is sequential (respects dependencies).

**Q: What if a build fails?**

A: All skills stop or skip the failed phase (depending on config). Git history remains clean — only successful commits are pushed.

**Q: How do I add a new phase?**

A: Edit your build queue (Queue Executor), GitHub Actions input, or roadmap.json (Roadmap Manager). Same invocation, different config.

**Q: Is this compatible with Phase 24 governance?**

A: Yes. GitHub Actions provides the immutable audit trail Phase 24 requires. Build Queue Executor provides git-based audit. Roadmap Manager tracks state changes.

---

## Reference

- [Build Automation Guide](automation/guide.md) — Decision matrix, workflows, troubleshooting
- [Skills Reference](automation/skills.md) — Full API docs for each skill
- [About](about.md) — How this documentation was built

---

Last updated: 2026-06-11  
Built with [MkDocs](https://www.mkdocs.org/) + Material theme
