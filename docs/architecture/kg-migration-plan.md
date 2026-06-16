# KG Storage Migration Plan: SQLite → Postgres → Qdrant (Phase 29–33)

## Phase 29–30: SQLite as primary KG store

**Role:** Primary structural KG + temporal replay + digest chain.

**Actions:**
- Keep current `better-sqlite3` implementation.
- Introduce **storage abstraction** (`IKGStore`) so all KG code depends on interface, not concrete SQLite.
- Add **read‑only mode** flag for future migration safety.

## Phase 31: Add Postgres as structural backend

**Role:** Primary online KG for multi‑writer, high‑volume mutations.

**Actions:**
- Implement `PostgresKGStore` that satisfies `IKGStore`.
- Add **dual‑write mode**:
  - Writes go to both SQLite (audit) and Postgres (live).
  - Reads for online operations come from Postgres; replay/audit from SQLite.
- Add migration job:
  - Bulk copy nodes/edges/digests from SQLite → Postgres.
  - Verify counts, checksums, digest chain integrity.

## Phase 32: Add Qdrant as semantic sidecar

**Role:** Vector index for semantic similarity over KG nodes/edges.

**Actions:**
- Implement `QdrantVectorIndex` (separate interface, not part of `IKGStore`).
- On KG mutations:
  - Generate embeddings for selected nodes.
  - Upsert into Qdrant.
- Add hybrid query layer:
  - Structural filter via Postgres.
  - Semantic ranking via Qdrant.
  - Merge results.

## Phase 33: Federated KG (Postgres + Qdrant + TorqueQuery)

**Role:** Unified query layer over events, structure, and semantics.

**Actions:**
- Implement `FederatedKGQueryEngine`:
  - Structural: Postgres.
  - Semantic: Qdrant.
  - Temporal/events: TorqueQuery.
- SQLite becomes **audit + replay only**:
  - No live writes except digest chain.
- Document storage roles:
  - Postgres: authoritative structural KG.
  - Qdrant: semantic overlay.
  - SQLite: audit/replay.
  - TorqueQuery: event index.
