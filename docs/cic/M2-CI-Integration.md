# Phase 0.9 M2 — CI Integration + Phase 24 Governance Wiring

**Status:** ✅ COMPLETED  
**Date:** 2026-06-13  
**Timeline:** Targeted 2026-06-15 through 2026-06-21 (ahead of schedule)

## Overview

M2 wires TheFoundry deterministic Docker builds through GitHub Actions CI to the Phase 24.5 governance vault. Every build produces a governance packet (lineage + decision + vault record) for audit, approval, and reversibility.

## Architecture

Build (TheFoundry) 
  → lineage packet
Governance API (policy gates, council vote)
  → decision packet
Vault Write (deterministic digest, signed record)
  → Governance Vault (Phase 24.5 MemoryStore Tier 2)

## Components

### Three Governance Scripts

1. **fetch-lineage.js** — Query FOUNDRY_LINEAGE_ENDPOINT with build-id, fetch artifact lineage packet (sbom, provenance, determinism hash, test summary)

2. **evaluate-decision.js** — Parse governance decision JSON, extract verdict (Approved/Blocked/NeedsRevision) and reason, set GitHub Actions output variables

3. **write-vault-record.js** — Merge lineage + decision + signing + promotion into GovernanceVaultRecord24_5, compute deterministic SHA256 digest, POST to VAULT_API_ENDPOINT

### GitHub Actions Workflow

File: `.github/workflows/cic-governance-ci.yml`

Triggers:
- `workflow_dispatch` with build_id + cic_pipeline_id inputs
- `repository_dispatch` with governance-request type

Flow:
1. Build TheFoundry node-build container (deterministic)
2. fetch-lineage.js → lineage.json
3. submit-governance.js → decision.json
4. Evaluate decision verdict
5. If Approved: sign, promote, write vault record
6. Output: Vault record ID + digest

### Environment Variables (GitHub Secrets)

FOUNDRY_LINEAGE_ENDPOINT - TheFoundry lineage API
FOUNDRY_API_KEY - API key for lineage
GOVERNANCE_API_ENDPOINT - Policy gates + council
GOVERNANCE_API_KEY - Governance API auth
VAULT_API_ENDPOINT - Vault write endpoint
VAULT_API_KEY - Vault API auth

## Integration with Phase 24.5

Governance Vault Record Schema (24.5):
- Extends 10+ metadata categories
- Zod-validated via GovernanceVaultRecord24_5Schema
- Deterministic canonicalization (sorted JSON keys)
- SHA256 digest for immutability
- Indexable by packet_type, run_id, phase, policy_context

Vault Collections:
- `packets` — Stores complete GovernanceVaultRecord24_5 objects
- `snapshots` — Pre-build state for rollback

## Testing

Mock Data Provided:
- test-lineage.json
- test-decision.json
- test-signing.json
- test-promotion.json

Local Validation:
node scripts/evaluate-decision.js --decision-file test-decision.json

## Success Criteria

✅ fetch-lineage.js created + functional
✅ evaluate-decision.js created + functional
✅ write-vault-record.js created + functional
✅ Scripts integrated into TheFoundry Dockerfile
✅ GitHub Actions workflow updated
✅ End-to-end packet flow designed
✅ Mock test data created
✅ Vault record structure validated

## Files Modified

- scripts/fetch-lineage.js — NEW
- scripts/evaluate-decision.js — NEW
- scripts/write-vault-record.js — NEW
- .github/workflows/cic-governance-ci.yml — Updated
- rewrite-mcp/thefoundry/images/node-build/Dockerfile — Updated
