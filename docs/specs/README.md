# CIC Specs Index

Versioned, immutable specifications for CIC architecture, integrations, and pipelines.

## Active Specs

| Spec | Version | Status | Description |
|------|---------|--------|-------------|
| CLOAKBROWSER_INTEGRATION | v1.0.0 | Complete | Consolidated PRD + abstraction + vertical map + telemetry for CloakBrowser integration |
| CLOAKBROWSER_INTEGRATION_STATUS | v1.0.0 | In Progress | Phase 1 complete; OBS-005 blocked on dashboard rewrite |

## Versioning Rules

- **UPPER_SNAKE_CASE** for spec names
- **Semantic versioning** appended: `.vMAJOR.MINOR.PATCH.md`
- **Never overwrite** — create new version in root, move old to `archive/`
- **One spec = one file** unless consolidated (as in CLOAKBROWSER_INTEGRATION)

## Archive

Deprecated and prior versions live in `archive/` to preserve lineage.

---

**Last Updated:** 2026-06-19
