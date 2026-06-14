-- Phase 29.0: Knowledge Graph schema initialization

CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  labels TEXT,
  properties TEXT
);

CREATE TABLE IF NOT EXISTS edges (
  id TEXT PRIMARY KEY,
  src_id TEXT NOT NULL,
  dst_id TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  properties TEXT,
  FOREIGN KEY (src_id) REFERENCES nodes(id),
  FOREIGN KEY (dst_id) REFERENCES nodes(id)
);

CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_nodes_created_at ON nodes(created_at);
CREATE INDEX idx_edges_src_id ON edges(src_id);
CREATE INDEX idx_edges_dst_id ON edges(dst_id);
CREATE INDEX idx_edges_type ON edges(type);
CREATE INDEX idx_edges_created_at ON edges(created_at);
