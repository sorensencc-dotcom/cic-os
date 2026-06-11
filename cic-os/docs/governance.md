# Governance

CIC OS is governed by a constitutional framework that ensures determinism, safety, and autonomy boundaries.

## Constitutional Documents

### Governance Manifest
Defines operational rules:
- Determinism principle
- Safety principle
- Transparency principle
- Autonomy boundaries
- Rollback-first policy
- Immutability constraints

### Autonomy Boundary
Specifies what CIC can do without operator approval:

**Allowed:**
- Run evaluation harnesses
- Detect drift
- Execute replay tests
- Enforce sandbox
- Run safety fuzzer
- Transition through lifecycle stages
- Auto-rollback on drift/regression

**Forbidden:**
- Modify Governance Manifest
- Modify Autonomy Boundary
- Modify Drift Thresholds
- Modify Safety Sandbox rules
- Access external networks
- Modify operator data

### Constitutional Court
An agent whose sole job is interpreting governance rules.

Responds with: \{"decision": "allow | deny | escalate", "reason": "...", "governanceArticles": [...]}\

### Governance Ledger
Immutable, append-only record of all CIC decisions:
- Constitutional Court rulings
- Lifecycle transitions
- Rollback events
- Promotion events
- Sandbox violations
- Drift threshold violations

## Amendment Process

Only operators can amend governance documents.

1. Operator drafts amendment text
2. Constitutional Court provides advisory opinion
3. Operators vote (unanimous approval required)
4. Amendment ratified
5. All agents reload governance state

## Operator Authority

Operators retain ultimate authority:
- Force rollback
- Freeze autonomy
- Override drift thresholds
- Manually promote models
- Amend constitution

## Enforcement

Violations are handled by:
- Safety Sandbox (blocks forbidden tool calls)
- Drift Engine (detects behavioral drift)
- Constitutional Court (interprets rules)
- Governance Ledger (records all decisions)

Severe violations trigger:
- Quarantine
- Rollback
- Operator notification
