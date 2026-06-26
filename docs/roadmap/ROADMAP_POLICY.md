# Roadmap Policy and Enforcement Spec

**Version:** 1.0.0  
**Date:** 2026-06-13  
**Authority:** This document governs all files in `docs/roadmap/` and `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md`.

---

## 1. Ownership Model

| File | Owner | Track |
|---|---|---|
| `MASTER_ROADMAP_v3.0.md` | Platform — both tracks | Shared |
| `CIC_SUBROADMAP_v3.0.md` | CIC lead | CIC |
| `REWRITE_LABS_SUBROADMAP_v3.0.md` | Rewrite Labs lead | RL |
| `MIGRATION_GUIDE_v2_to_v3.md` | Platform — either track | Shared |
| `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` | CIC lead (archived) | CIC |

**Platform lead** = any contributor with context on both tracks. Either track contributor may open PRs against platform files; approval requires at least one cross-track sign-off.

---

## 2. Change Rules

### R1 — No cross-file subsystem duplication

Each subsystem (IR Toolkit component, agent, shared service) is defined in exactly one file. If a subsystem appears in `MASTER_ROADMAP_v3.0.md §1`, it must not appear in either sub-roadmap with status detail.

**Violation:** Subsystem row in `REWRITE_LABS_SUBROADMAP_v3.0.md` that duplicates a row already in `MASTER_ROADMAP_v3.0.md §1`.

**Fix:** Remove from sub-roadmap; link to master with `→ [MASTER §1.x]`.

### R2 — Shared system changes notify both tracks

Any change to `MASTER_ROADMAP_v3.0.md §1` (Shared Systems) or `§2` (Dependency Map) must include a comment in both CIC and RL sub-roadmap version history rows citing the master version bump.

**Enforcement:** PR description must include `MASTER: bumped to X.Y.Z` and list impacted subsystem(s).

### R3 — CIC phase changes in the right file

CIC phase changes go in `CIC_SUBROADMAP_v3.0.md`. Detail-level CIC phase content (ARPS markers, per-step specs, test gates) goes in `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md` (archived; ARPS authority).

**Violation:** CIC phase test gates written into `CIC_SUBROADMAP_v3.0.md` instead of source roadmap.

### R4 — RL phase changes in the right file

RL phase changes go in `REWRITE_LABS_SUBROADMAP_v3.0.md`. Phase specs, success gates, TypeScript interface definitions belong in `docs/strategy/REWRITE_LABS_TEARDOWN_AND_BUILD_PLAN_v1.0.md` or inline in the sub-roadmap's phase section — not duplicated across both.

### R5 — Every change requires version bump + history row

All four v3.0 roadmap files carry a `**Version:**` header field and a `## Version History` table. Any PR modifying a roadmap file must:
1. Increment the patch or minor version in the header.
2. Add a row to that file's version history with date + 1-line change description.

**Semver guidance:**  
- Patch bump (`x.y.Z`): status changes, date corrections, wording fixes.  
- Minor bump (`x.Y.0`): new phase added, subsystem added, dependency map changed.  
- Major bump (`X.0.0`): restructure (new files, files retired, ownership transfer).

### R6 — ARPS markers confined to source roadmap

`ARPS:PHASE_X:BEGIN/END` comment blocks must not appear in any file under `docs/roadmap/`. They exist only in `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md`.

**Enforcement:** Grep check on PR diff: `ARPS:` must not appear in `docs/roadmap/**`.

---

## 3. Enforcement Mechanisms

### 3.1 Pre-commit checks (manual until CI is wired)

Run before committing any file matching `docs/roadmap/**` or `rewrite-mcp/docs/cic/CIC_MASTER_ROADMAP.md`:

```sh
# R6 — no ARPS in docs/roadmap/
grep -rn "ARPS:" docs/roadmap/ && echo "VIOLATION R6" || echo "R6 OK"

# R5 — version header present in all four files
for f in docs/roadmap/MASTER_ROADMAP_v3.0.md \
          docs/roadmap/CIC_SUBROADMAP_v3.0.md \
          docs/roadmap/REWRITE_LABS_SUBROADMAP_v3.0.md \
          docs/roadmap/MIGRATION_GUIDE_v2_to_v3.md; do
  grep -q "^\*\*Version:\*\*" "$f" && echo "$f OK" || echo "$f MISSING VERSION"
done
```

### 3.2 PR review checklist

PR touching any roadmap file must pass all items before merge:

- [ ] Version header bumped in every modified file
- [ ] Version history row added with date + description
- [ ] No subsystem defined in more than one file (spot-check diff for duplicates)
- [ ] No `ARPS:` strings in `docs/roadmap/**`
- [ ] Shared system change → both sub-roadmaps have cross-reference note
- [ ] PR description names which rule(s) triggered the change (R1–R6)

### 3.3 CI (future — wire when CI pipeline exists)

Target: `.github/workflows/roadmap-lint.yml` or equivalent.

Checks to automate:
1. `grep -rn "ARPS:" docs/roadmap/` → fail if match
2. Version header format validation (`**Version:** X.Y.Z`)
3. Version history table row count increases on modified files
4. Duplicate subsystem detection (parse `| ` table rows across master + sub-roadmaps, flag identical `Subsystem` cell values)

---

## 4. Violation Classification

| Severity | Description | Resolution |
|---|---|---|
| **BLOCK** | R6 (ARPS in wrong file), R1 (duplicate subsystem definition) | Fix before merge |
| **FLAG** | R5 (missing version bump or history row), R2 (shared change missing cross-reference) | Fix or document exception |
| **NIT** | R3/R4 (detail in wrong file but not duplicated) | Fix in follow-up PR |

---

## 5. Exception Process

If a rule must be violated temporarily (e.g., porting a phase before a clean cut):

1. Add inline comment in the file using ASCII only — no em-dashes:  
   `<!-- POLICY-EXCEPTION: R<N> | <reason> | remove-by: <YYYY-MM-DD> -->`
2. Track in version history row as `[exception-RN]` with same date.
3. File a follow-up PR to resolve within 14 calendar days. If no CI: open a GitHub issue and link it in the comment.

Format example:

```html
<!-- POLICY-EXCEPTION: R1 | SiteExtractor temporarily in both files during RL-4.0 port | remove-by: 2026-06-27 -->
```

No permanent exceptions without updating this policy document and bumping its version.

---

## 6. Roadmap File Lifecycle

### Adding a new roadmap file

- Add file under `docs/roadmap/`.
- Add row to `ROADMAP_INDEX.md` navigation table.
- Assign ownership in §1 of this document.
- Bump `ROADMAP_INDEX.md` version.

### Retiring a roadmap file

- Add superseded notice at top: `> **SUPERSEDED** by [replacement] as of vX.Y.Z (YYYY-MM-DD). Archived for reference only.`
- Remove from `ROADMAP_INDEX.md` active table; add to an `## Archived` section.
- Bump version of this policy document.

### Forking a sub-roadmap (new track)

- Create `<TRACK>_SUBROADMAP_v3.0.md`.
- Update `MASTER_ROADMAP_v3.0.md §2` dependency map.
- Add ownership row in §1 of this document.

---

## 7. Version History

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-06-13 | Initial policy spec; 6 rules + enforcement + lifecycle |
