# CIC Substrate Service

This is the Postgres-backed HTTP service for chunk storage and hybrid retrieval, built exactly to the blueprint.

## Features
- Complete Postgres Schema with `pgvector` for vector embeddings and `tsvector` for BM25.
- Governance Module enforcing type validation, namespaces, TTL, importance clamping, and size limits.
- Ingestion Pipeline implementing capture, normalize, classify, enrich, and persist stages.
- Hybrid Retrieval using BM25 (`ts_rank_cd`), vector cosine similarity, and Reciprocal Rank Fusion (RRF).
- Context endpoint `get_context_for_task` to query and greedy-pack chunks based on a token budget and type preferences.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Database:**
   Ensure you have a Postgres database with the `pgvector` extension installed.
   Set the connection string in your `.env` file (or let it default to `postgresql://postgres:postgres@localhost:5432/postgres`):
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   PORT=3000
   ```

3. **Apply Migrations:**
   Run the `schema.sql` script against your database to set up the necessary tables, types, indexes, and triggers.

   ```bash
   psql -d dbname -f schema.sql
   ```

## Running the Service

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## API Endpoints

- `POST /chunks` → Store a new chunk
- `PUT /chunks/:id` → Update an existing chunk
- `DELETE /chunks/:id` → Soft-delete a chunk
- `GET /chunks/:id` → Get a chunk by ID
- `POST /chunks/list` → List chunks optionally filtered by namespace
- `POST /search/hybrid` → Hybrid BM25 + Vector search
- `POST /context/task` → Get context tailored for a task (hybrid search + RRF + greedy packing)
- `GET /stats` → Get usage statistics
