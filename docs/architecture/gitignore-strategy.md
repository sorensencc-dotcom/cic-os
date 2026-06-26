# .gitignore Strategy — Build Artifacts Prevention (Phase 0.9)

## Status
✅ **No committed build artifacts detected** (audit: 2026-06-16)

## Risk
Build artifacts in VCS cause:
- Merge conflicts
- Bloated repository
- Nondeterministic builds
- Broken Docker caching
- Polluted CI artifacts
- Confusing git history

## Current Coverage

### Root .gitignore
Located: `c:\dev\.gitignore`

**Covered patterns:**
- `node_modules/` (all levels)
- `dist/`, `build/`, `.tsbuildinfo`
- `coverage/`, `.nyc_output/`
- `*.sqlite`, `*.sqlite3`, `*.db`
- `.env` files
- IDE settings (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`)

**Status:** ✅ Comprehensive

### Per-Service .gitignore
Most services rely on root `.gitignore`. No per-service overrides needed currently.

**If a service needs custom ignores:**
- Create `services/SERVICE_NAME/.gitignore`
- Use template: `docs/templates/.gitignore-service`
- Example: KG service might ignore local SQLite snapshots

## Audit Script
Run to detect any regressions:

```bash
# Linux/Mac
./scripts/audit-build-artifacts.sh

# Windows PowerShell
.\scripts\audit-build-artifacts.ps1
```

**Output:**
- ✅ No committed artifacts: exit 0
- ❌ Artifacts found: exit 1 + list paths

**Usage in CI:**
```yaml
# GitHub Actions
- name: Audit build artifacts
  run: ./scripts/audit-build-artifacts.sh
  working-directory: .
```

## Patterns Protected

### Dependencies
```
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lockb
```

### Build outputs
```
dist/
build/
.tsbuildinfo
.cache/
out/
```

### Test & coverage
```
coverage/
.nyc_output/
.lcov.info
```

### Database files
```
*.sqlite
*.sqlite3
*.db
```

### IDE/Editor
```
.vscode/
.idea/
*.swp
*.swo
*~
```

### Environment
```
.env
.env.local
.env.*.local
```

## Future: Per-Service .gitignore (Phase 31+)

When new services are added:

1. Copy `docs/templates/.gitignore-service` to `services/NEW_SERVICE/.gitignore`
2. Customize for service type
3. Test: `./scripts/audit-build-artifacts.ps1`
4. Commit both service files and .gitignore

Example:
```
services/my-analyzer/
  ├── .gitignore          (service-specific)
  ├── package.json
  ├── src/
  └── __tests__/
```

## Monorepo .gitignore Pattern

**Root .gitignore** covers all services via:

```gitignore
# Dependencies (recursive)
node_modules/
package-lock.json
yarn.lock

# Build (recursive)
dist/
build/
.tsbuildinfo

# Coverage (recursive)
coverage/
.nyc_output/
```

Git ignores these patterns at **all directory levels**, so:
- `services/knowledge-graph/node_modules/` ignored ✅
- `services/autonomy-api/dist/` ignored ✅
- `cic-ingestion/coverage/` ignored ✅

**No need for per-service .gitignore unless service has unique artifacts** (e.g., compiled shared objects, database snapshots, language-specific build dirs).

## Compliance Check

### Before committing code:
```bash
git status
# Verify only .ts, .json, .md, etc. are staged
# No dist/, node_modules/, *.sqlite, etc.
```

### Before merging PR:
```bash
./scripts/audit-build-artifacts.ps1
# Exit 0 = safe
```

### Before release:
```bash
git ls-files | grep -E "(node_modules|dist|\.sqlite)" | wc -l
# Should output: 0
```

## Templates

**Global template:** `docs/templates/.gitignore-global`
**Service template:** `docs/templates/.gitignore-service`

Use templates to document intent and patterns for future repos.

## No Action Needed (Phase 29–30)

Root `.gitignore` is comprehensive and current.
Audit script confirms zero regressions.

**Next review:** Phase 31 (when new services added).
