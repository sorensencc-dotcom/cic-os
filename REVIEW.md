# Review: Docker Infrastructure + CI/CD Fixes

Reviewed: 2026-06-11T12:00:00Z
Reviewer: ijfw-review
Domain: software

## Summary

Docker infrastructure is well-architected with multi-stage builds, security hardening, and comprehensive smoke tests. CI/CD fixes correctly resolve ESM/CommonJS mismatch and Node.js 20 deprecation. Most issues are robustness edge cases (pid validation, error handling on utility failures) rather than logic bugs. One risky default (CLAUDE_SKIP_PERMISSIONS=true) needs documentation.

## BLOCK findings

(none)

## FLAG findings

- `cic-docker-entrypoint.sh:101`: Numeric pid validation missing. Corrupted lock file with non-numeric pid causes `[[ "$old_pid" -gt 0 ]]` to fail silently. Add `[[ "$old_pid" =~ ^[0-9]+$ ]] ||` before numeric comparison.

- `cic-docker-entrypoint.sh:115-116`: lsof unavailable fallback missing. Port check via `lsof -iTCP` has no fallback if lsof not in PATH. Add `command -v lsof &>/dev/null ||` early validation in startup.

- `cic-docker-entrypoint.sh:92-95`: is_process_alive lacks pid validation. Non-numeric pid passed to `ps -p` may cause unexpected behavior. Validate pid is numeric: `[[ "$pid" =~ ^[0-9]+$ ]] ||`.

- `cic-smoke-test.sh:100`: stat -c portable issue. GNU `stat -c '%a'` fails on BSD/macOS. Use `ls -ld "$file" | awk '{print $1}'` for cross-platform compatibility.

- `cic-docker-recovery.sh:68`: SIGTERM/SIGKILL sequence unprotected. No delay between kill -TERM and kill -9; process may not have exited. Add `sleep 1` between attempts.

- `cic-docker-recovery.sh:58-61`: Config backup restore unvalidated. Restoring corrupted backup masks original corruption. Validate backup with `jq empty` before restore.

- `cic-log-archival.sh:42`: Gzip failure silently ignored. Command fails but `archived_count` and loop continue anyway. Check gzip exit code explicitly: `gzip -f "$logfile" || { err "gzip failed"; continue; }`.

- `docker-compose.yml:19`: CLAUDE_SKIP_PERMISSIONS=true risky default. Bypasses security prompts in production if env var isn't overridden. Document in DOCKER.md that this is dev-only and must be explicitly set to false in production.

- `docker-compose.yml:25-30`: No resource limits. Container can exhaust host memory/CPU. Add `deploy: resources: limits: memory: 2G` and `cpus: 2` to docker-compose.

## NIT findings

- `cic-docker-entrypoint.sh:177`: API retry attempts hardcoded to 3. Consider externalizing as `CIC_API_MAX_RETRIES` env var for flexibility.

- `cic-docker-entrypoint.sh:192-208`: Log rotation on every startup inefficient. If startup runs frequently, archival runs redundantly. Consider cron job instead of startup hook.

- `cic-docker-recovery.sh:25-32`: Code duplication. `is_process_alive()` duplicates entrypoint.sh version. Extract to shared function or source common library.

- `cic-log-archival.sh:35`: Day-based archival boundary. `-mtime +30` is coarse (30-day window); if script runs twice in one day, logs near boundary may be archived on second run. Document this behavior.

- `docker-compose.yml:37`: SSH key volume marked ro (read-only). If key rotation needed, container restart required. Consider using secrets manager instead of volume mount.

---

## Verification

- [x] Security boundaries: CLAUDE_SKIP_PERMISSIONS default risky; pid validation missing; no resource limits
- [x] Error paths: gzip failure ignored; config backup unvalidated; lsof unavailable unhandled
- [x] Backward compatibility: Node 22 is forward-only; tsconfig ESM compatible with both ESM and CommonJS
- [x] Test coverage: Smoke suite covers 10 paths; no negative cases tested
- [x] Concurrency: Lock acquisition includes stale detection; process detection safer than kill -0

## Recommendations Priority

1. **Critical**: Add numeric pid validation before arithmetic
2. **Important**: Document CLAUDE_SKIP_PERMISSIONS=true is dev-only
3. **Important**: Add gzip error handling
4. **Nice**: Add resource limits to docker-compose
5. **Nice**: Extract shared utility functions

## Assets Reviewed

- Dockerfile (78 lines)
- docker-compose.yml (62 lines)
- cic-docker-entrypoint.sh (350 lines)
- cic-smoke-test.sh (150 lines)
- cic-docker-recovery.sh (200 lines)
- cic-log-archival.sh (100 lines)
- tsconfig.json (ESM config)
- package.json (tsx migration)
- 5 GitHub workflows (Node version updates)

Total: 1,250+ lines reviewed, 9 FLAG findings, 5 NIT findings
