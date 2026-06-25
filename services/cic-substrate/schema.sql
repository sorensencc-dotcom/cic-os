CREATE EXTENSION IF NOT EXISTS vector;

DO $$ BEGIN
    CREATE TYPE chunk_type AS ENUM ('SYSTEM', 'STATE', 'LIVING', 'SCRATCH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS tq_chunks (
    id UUID PRIMARY KEY,
    namespace TEXT NOT NULL,
    type chunk_type NOT NULL,
    title TEXT,
    body TEXT,
    tags TEXT[],
    importance REAL CHECK (importance >= 0.0 AND importance <= 1.0),
    ttl_days INT,
    provenance JSONB,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    body_tsv TSVECTOR
);

CREATE TABLE IF NOT EXISTS tq_vectors (
    chunk_id UUID PRIMARY KEY REFERENCES tq_chunks(id) ON DELETE CASCADE,
    embedding vector(1536)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tq_chunks_tags ON tq_chunks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_tq_chunks_body_tsv ON tq_chunks USING GIN (body_tsv);
CREATE INDEX IF NOT EXISTS idx_tq_vectors_embedding ON tq_vectors USING IVFFLAT (embedding vector_cosine_ops);

-- Triggers for body_tsv
CREATE OR REPLACE FUNCTION tq_chunks_tsvector_trigger() RETURNS trigger AS $$
begin
  new.body_tsv :=
    setweight(to_tsvector('pg_catalog.english', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('pg_catalog.english', coalesce(new.body,'')), 'B');
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON tq_chunks;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
    ON tq_chunks FOR EACH ROW EXECUTE PROCEDURE tq_chunks_tsvector_trigger();
