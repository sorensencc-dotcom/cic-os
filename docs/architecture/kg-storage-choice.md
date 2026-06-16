# Knowledge Graph Storage Choice — SQLite Justification (Phase 29)
## *Why CIC uses SQLite for the Knowledge Graph instead of Postgres or Qdrant*

## 1. Requirements for Phase 29

The Knowledge Graph in Phase 29 must provide:

- **Append‑only writes**
- **Temporal snapshots** (`getNodesAsOf`, `getEdgesAsOf`)
- **Digest‑chain integrity**
- **Deterministic replay**
- **Single‑file portability**
- **Zero external dependencies**
- **Fast local development**
- **Predictable Docker behavior**

SQLite satisfies all of these with minimal operational overhead.

## 2. Why SQLite (current choice)

### Pros
- ACID, WAL‑mode, deterministic
- Single‑file DB → perfect for snapshotting, replay, and audit
- Zero network hops → extremely low latency
- Perfect for append‑only workloads
- Works identically on host + Docker
- No external service dependency
- Easy to bundle with ingestion and KG services
- Deterministic for Phase 29 tests and CI

### Cons
- Single‑writer bottleneck
- Not horizontally scalable
- Not ideal for multi‑agent concurrent mutations
- No built‑in vector search
- No distributed query federation

These cons do **not** affect Phase 29.

## 3. Why not Postgres (yet)

Postgres is the correct choice for:

- Multi‑writer concurrency
- Distributed ingestion
- High‑volume mutations
- Cross‑service KG access
- Long‑term scaling

But it introduces:

- A new service dependency
- Migrations
- Schema drift risk
- Non‑deterministic CI unless containerized
- Operational overhead (backups, tuning, WAL retention)

Phase 29 explicitly avoids these to keep the KG **deterministic and portable**.

## 4. Why not Qdrant

Qdrant is a **vector similarity engine**, not a property graph store.

KG queries in Phase 29 are:

- Exact match
- Temporal
- Structural
- Lineage‑based
- Digest‑chain verified

Qdrant is irrelevant until Phase 31–33 when you add:

- Semantic overlays
- Embedding‑based node similarity
- Hybrid search (TorqueQuery + KG vectors)

At that point, Qdrant becomes a **secondary index**, not the primary store.

## 5. Future Migration Path

This is the key part for Phase 30+.

### Phase 29–30
SQLite remains the authoritative KG store.

### Phase 31
Add Qdrant as a **vector sidecar** for semantic similarity.

### Phase 32
Introduce Postgres as the **multi‑writer transactional backend**.

### Phase 33
Federate:

- Postgres (structural KG)
- Qdrant (semantic KG)
- TorqueQuery (event index)

SQLite becomes the **replay + audit store**, not the live store.

## 6. Final Decision

**SQLite is the correct choice for Phase 29** because it maximizes determinism, simplicity, auditability, and developer velocity.

A migration to Postgres + Qdrant is expected in Phase 31–33, but not before.

## Conclusion

Yes — this choice is justified. Future phases do not need to accidentally break the KG. SQLite will scale to Phase 30; Postgres + Qdrant enter at Phase 31–33 per this migration plan.
