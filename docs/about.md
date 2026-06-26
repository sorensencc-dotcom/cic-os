# About This Documentation

## Purpose

Guide for CIC project build automation. Three reusable Claude skills for orchestrating builds, tests, and deployments across multiple phases.

## Documentation Structure

```
docs/
├── index.md                    # Home page
├── automation/
│   ├── guide.md               # Decision matrix, workflows, examples
│   └── skills.md              # API reference for 3 skills
└── about.md                   # This file

~/.claude/skills/
├── build-queue-executor.md    # Local sequential builds
├── github-actions-setup.md    # GitHub Actions CI/CD
└── roadmap-queue-manager.md   # Dependency-aware roadmap queue
```

## The Three Skills

### 1. Build Queue Executor
- **Purpose:** Run Docker builds locally in sequence
- **Use case:** Development, quick validation
- **Audit trail:** Git commits with timestamps
- **Location:** `~/.claude/skills/build-queue-executor.md`

### 2. GitHub Actions Setup
- **Purpose:** CI/CD pipelines with full audit trail
- **Use case:** Production releases, governance compliance
- **Audit trail:** Immutable GitHub Actions run history
- **Location:** `~/.claude/skills/github-actions-setup.md`

### 3. Roadmap Queue Manager
- **Purpose:** Multi-phase execution with dependency tracking
- **Use case:** Complex projects, 5+ phases
- **Audit trail:** JSON state changes in git
- **Location:** `~/.claude/skills/roadmap-queue-manager.md`

## How to Use

### Read First
1. Start with [Build Automation Guide](automation/guide.md) (decision matrix)
2. Reference [Skills Reference](automation/skills.md) for API details

### Use Immediately
```bash
# Local test (fastest)
/build-queue-executor

# Cloud pipeline (governance-ready)
/github-actions-setup
gh workflow run build.yml

# Multi-phase project
/roadmap-queue-manager process
```

## For Phase 24 Governance

All three skills produce audit trails:

- **Queue Executor:** Git commits (basic audit)
- **GitHub Actions:** Immutable run history (recommended for production)
- **Roadmap Manager:** JSON state + git diffs (full traceability)

**Recommendation:** Use GitHub Actions for production builds to satisfy Phase 24 governance requirements.

## For Project Maintainers

### Updating Skills
Edit directly at `~/.claude/skills/*.md`. Changes apply immediately to all projects.

### Adding New Skills
Create new `.md` file at `~/.claude/skills/` with:
- Clear purpose statement
- Input/output schema
- Examples
- Integration instructions

### Documentation
Update MkDocs files in `docs/` directory. Build locally:

```bash
pip install mkdocs mkdocs-material
mkdocs serve
# Open http://localhost:8000
```

## Integration Points

### With Phase 28a (Skill Contribution Pipeline)
- Skills can trigger SCP workflows
- Skill PRs can be queued via roadmap manager

### With Phase 24 (Autonomous Governance)
- All skills log audit trails and require **TheFoundry** for execution
- GitHub Actions + **TheFoundry** provides the immutable governance audit and sealed build environment required by policy

### With Phase 0.9 (TheFoundry Docker)
- All skills use deterministic, containerized builds via **TheFoundry**
- Reproducible output across all machines

## Status

- ✅ Skills created (3/3)
- ✅ Documentation written
- ✅ MkDocs configured
- ✅ Ready for production use

## Next Steps

1. Deploy MkDocs: `mkdocs gh-deploy` (optional, for hosting docs online)
2. Share skills link with team: Point to `~/.claude/skills/`
3. Run first build: Follow examples in [Guide](automation/guide.md)
4. Integrate with Phase 24: Use GitHub Actions for full governance

---

**Created:** 2026-06-11  
**Status:** Production-ready
