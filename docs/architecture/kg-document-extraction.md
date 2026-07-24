# Phase 34: Document Knowledge Extraction — Scope

Status: **Proposed, not started.** No code exists for this yet. This document scopes the work; it does not implement it.

## 1. What this closes

`services/knowledge-graph` (Phase 29–33) graphs CIC's own *structured system events* — agents, skills, repos, commits, governance records — via `EventRouter` mappings. It has no path for turning *unstructured documents* (the ~150 `PHASE_*.md`, roadmap, and architecture files scattered across `cic-os` and `cic-ingestion`) into graph nodes/edges. Today, answering "which phases touched the KG storage decision and who authored the related governance record" requires a human to grep and cross-reference by hand.

This phase adds that path: extract entities/relations from documents with Claude, resolve surface-form variants to canonical nodes, write them into the existing KG store as a new event domain, and answer multi-hop questions with edge-level citations. It follows the extract → resolve → assemble → query pipeline from Anthropic's knowledge-graph cookbook, adapted to CIC's existing event-sourced architecture instead of building a parallel graph library.

## 2. Non-goals

- Not replacing TorqueQuery/`docs-rag` (chunked semantic RAG). RAG and KG stay complementary per the source material: RAG for single-hop retrieval, KG for chaining facts across documents.
- Not implementing Qdrant. Entity resolution here is LLM-clustering-based (per the cookbook), not embedding-based — no vector index required for v1.
- Not building the full Phase 29.2/33 federated query engine. This phase adds the minimum traversal needed for k-hop subgraph serialization against the existing `SQLiteKGStore`, nothing more.
- Not migrating storage. Runs entirely on the current SQLite `GraphStore`.

## 3. Prerequisite fixes (small, blocking)

These surfaced while scoping this and should land before or alongside 34.0 — they're pre-existing gaps, not new work this phase invents:

| Fix | Where | Why it blocks this |
|---|---|---|
| Declare `@anthropic-ai/sdk` in `package.json` | `cic-ingestion/package.json` | `AnthropicClient.ts` imports it but it's absent from `dependencies` and `package-lock.json` — a clean install breaks the only existing Claude client in either repo. |
| Update `ALLOWED_MODELS` | `cic-ingestion/src/aperture/engines/anthropic/AnthropicClient.ts` | Hardcoded to `claude-3-opus-20240229`/`-sonnet-20240229`/`-haiku-20240307` — all deprecated snapshots. Extraction needs `claude-haiku-4-5-20251001`; resolution/summarization/query need `claude-sonnet-5`. |
| Add structured-output support | same file | `generate()` only returns raw `text`. Extraction needs a JSON-schema-constrained response (tool-use forced JSON, since the TS SDK path used here predates `messages.parse`). Add `generateStructured<T>(input, schema)` alongside the existing method — don't touch `generate()`, other callers (`ModelGenerateAdapter`) depend on its current shape. |
| Resolve dead `Node`/`Edge` model files | `cic-os/services/knowledge-graph/src/core/models/{Node,Edge}.ts` | These define a *different*, simpler schema (`id`/`labels`/`properties`, no digest chain, no temporal fields) than the one `GraphStore.ts` actually uses (`externalId`/`payloadJson`/`validFrom`/`digestId`). Nothing imports them — orphaned from an earlier iteration. Either delete them or this phase will get built against the wrong types by accident. Recommend deleting; `mappers.ts` should be checked for silent reliance first. |
| Note (non-blocking): `/ingest/vault`, `/ingest/repos`, `/ingest/evolution` are documented in the README's API list but not implemented in `EventIntakeServer.ts` — only `/ingest/torque` and `/ingest/torque/batch` exist. This phase reuses the existing generic `/ingest/torque/batch` route (its schema is domain-agnostic; the name is just legacy) rather than waiting on those. |

## 4. Where the pipeline lives

Split across the two repos along existing ownership lines — extraction logic where the Claude client and cost-ledger already live, storage where the graph already lives:

```
cic-ingestion/src/kg-extraction/          (NEW — this phase)
  extract.ts       Haiku: document -> {entities, relations}
  resolve.ts        Sonnet: raw entities (by type) -> canonical clusters
  summarize.ts       Sonnet: hub nodes -> profile (summary, key_facts, time_range)
  query.ts       Sonnet: question -> k-hop subgraph -> grounded answer
  evaluate.ts       gold-set scorer (precision/recall)
  publish.ts       translates pipeline output -> TorqueEvent[], POSTs to KG
  corpus.ts        walks target docs, chunks long files
  fixtures/gold/       hand-labeled gold set (2-3 docs to start)

cic-os/services/knowledge-graph/          (existing service, minor additions)
  src/ingestion/EventRouter.ts             + handleDocumentEvent() for domain "document"
  src/query/subgraph.ts (NEW)              k-hop BFS over SQLiteKGStore for serialization
```

Data flow:

```
docs (cic-os/docs/**.md, PHASE_*.md, cic-ingestion/docs/**.md)
   |
   v
[cic-ingestion] extract.ts  --Haiku-->  per-doc {entities[], relations[]}
   |
   v
[cic-ingestion] resolve.ts  --Sonnet--> alias map (canonical <- surface forms), per entity type
   |
   v
[cic-ingestion] publish.ts  -->  TorqueEvent[] {type: "document.entity.upserted" | "document.relation.upserted"}
   |
   v  POST /api/knowledge-graph/ingest/torque/batch
[cic-os] EventRouter.handleDocumentEvent()  -->  GraphStore.createNode/createEdge  (existing digest chain, existing temporal fields)
   |
   v
[cic-ingestion] summarize.ts (nodes with degree >= 3, queried back via KG API)  --Sonnet-->  profile written back as document.entity.summarized event
   |
   v
[cic-os] query/subgraph.ts k-hop BFS  -->  serialized triples  -->  [cic-ingestion] query.ts --Sonnet--> grounded answer + edge citations
```

## 5. Event domain and schema

New `EventRouter` domain, following the existing `memory`/`agent`/`governance`/`correlation` pattern exactly:

- `document.entity.upserted` — payload: `{ external_id, entity_type, name, description, source_doc, aliases[] }` → `Node` with `type: entity_type` (e.g. `Concept`, `Decision`, `Phase`, `ServiceComponent` — CIC-specific types, not the cookbook's PERSON/ORG/LOCATION)
- `document.relation.upserted` — payload: `{ src_external_id, dst_external_id, predicate, source_doc }` → `Edge` with `type: predicate`, `payloadJson: { source_doc, extracted_at }`
- `document.entity.summarized` — payload: `{ external_id, summary, key_facts[], time_range }` → updates existing node's `payloadJson` (new version, same `externalId`, digest-chained like any other mutation)

Entity types for the CIC domain (replacing the cookbook's PERSON/ORG/LOCATION/EVENT/ARTIFACT): `Phase`, `Service`, `Decision`, `Concept`, `Component`, `Person` (doc authors, where named). Kept small deliberately — the extraction prompt's "central only" instruction matters more than type coverage.

Resolution note: unlike the cookbook's Wikipedia corpus, CIC's own nodes (`Agent`, `Repo`, `Policy`, etc.) already exist in the graph from the structured-event mappers. The resolver must check new document-extracted entities against *existing* KG nodes by name/type before minting a new node — otherwise "TorqueQuery" extracted from a doc and the `Repo` node for TorqueQuery from the Repomix mapper become two disconnected entities, which defeats the point.

## 6. Phased delivery

- **34.0 — Prereqs.** The four fixes in §3. No pipeline code yet.
- **34.1 — Extraction only.** `extract.ts` + Haiku, run over a 5-10 doc pilot corpus (the `kg-*.md` architecture docs are a good pilot — small, information-dense, already familiar). Output written to a local JSON file, not yet published to KG. Deliverable: raw entity/relation counts, spot-checked manually.
- **34.2 — Resolution + gold-set evaluation.** `resolve.ts` + Sonnet, plus `evaluate.ts` against a 2-3 doc hand-labeled gold set (mirrors the cookbook's precision/recall harness). This is the checkpoint where prompt tuning happens — don't proceed to publishing until F1 is inspected and the "central only" extraction instruction is calibrated for this corpus.
- **34.3 — Publish + EventRouter wiring.** `publish.ts`, `EventRouter.handleDocumentEvent()`. Pilot corpus lands in the real KG. Verify: single connected component (or a defensible reason for islands), no orphaned edges, existing `Repo`/`Agent` nodes correctly cross-linked rather than duplicated.
- **34.4 — Summarization + grounded query.** `summarize.ts` for degree >= 3 nodes, `query/subgraph.ts` k-hop BFS, `query.ts` grounded Q&A with citations. Deliverable: a CLI command that takes a question and returns an answer with edge citations, runnable against the pilot corpus.

Expanding beyond the pilot corpus to the full ~150-doc set is explicitly deferred past 34.4 — do it once the pipeline's cost and quality are known from the pilot, not before.

## 7. Cost / model selection

| Stage | Model | Rationale |
|---|---|---|
| Extraction | `claude-haiku-4-5-20251001` | High volume, schema-constrained, cost dominates |
| Resolution | `claude-sonnet-5` | Judgment calls on ambiguous surface forms |
| Summarization | `claude-sonnet-5` | Cross-document synthesis, contradiction resolution |
| Query | `claude-sonnet-5` | Multi-hop reasoning over serialized triples |

`UsageLedger` (already wired into `AnthropicClient`) gives per-stage cost tracking for free once `ALLOWED_MODELS` is updated — no new cost-tracking code needed.

## 8. Open decisions

1. **Pilot corpus scope** — proposing the `docs/architecture/kg-*.md` + `services/knowledge-graph/*.md` set (~10 files, already read closely, easy to hand-verify). Confirm or pick a different starting set.
2. **Gold set ownership** — hand-labeling 2-3 docs takes an hour or so; needs a human, not an agent, to avoid grading its own homework.
3. **Run mode for 34.1+** — on-demand CLI invocation vs. a scheduled job. Recommend CLI-only through 34.4; scheduling is a distinct follow-up once the pipeline is trusted.

## 9. Explicitly out of scope for this phase

Qdrant/embedding-based resolution (Phase 32 territory), the full federated query engine (Phase 33), corpus-wide rollout, and any change to TorqueQuery/`docs-rag`.
