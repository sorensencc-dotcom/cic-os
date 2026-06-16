import Database from "better-sqlite3";
import * as crypto from "crypto";

export interface Node {
  id?: number;
  externalId: string;
  type: string;
  createdAt: number;
  createdByEventId: string;
  isDeleted: boolean;
  validFrom: number;
  validTo?: number;
  payloadJson: Record<string, unknown>;
  version: number;
  digestId: number;
}

export interface Edge {
  id?: number;
  srcNodeId: number;
  dstNodeId: number;
  type: string;
  createdAt: number;
  createdByEventId: string;
  isDeleted: boolean;
  validFrom: number;
  validTo?: number;
  payloadJson: Record<string, unknown>;
  version: number;
  digestId: number;
}

export interface DigestEntry {
  id?: number;
  chainId: string;
  prevDigestId?: number;
  mutationType: "create" | "update" | "soft_delete";
  entityType: "node" | "edge";
  entityId: number;
  eventId: string;
  timestamp: number;
  digestHex: string;
  payloadHashHex: string;
  metaJson: Record<string, unknown>;
}

export class GraphStore {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.initializeMigrations();
  }

  private initializeMigrations(): void {
    // Run migrations inline (better-sqlite3 doesn't have native migration support)
    const schema = `
      CREATE TABLE IF NOT EXISTS kg_node (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        external_id TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        created_by_event_id TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        valid_from INTEGER NOT NULL,
        valid_to INTEGER,
        payload_json TEXT NOT NULL,
        version INTEGER NOT NULL,
        digest_id INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS kg_edge (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        src_node_id INTEGER NOT NULL,
        dst_node_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        created_by_event_id TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        valid_from INTEGER NOT NULL,
        valid_to INTEGER,
        payload_json TEXT NOT NULL,
        version INTEGER NOT NULL,
        digest_id INTEGER NOT NULL,
        FOREIGN KEY (src_node_id) REFERENCES kg_node(id),
        FOREIGN KEY (dst_node_id) REFERENCES kg_node(id)
      );

      CREATE TABLE IF NOT EXISTS kg_digest (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chain_id TEXT NOT NULL,
        prev_digest_id INTEGER,
        mutation_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        event_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        digest_hex TEXT NOT NULL,
        payload_hash_hex TEXT NOT NULL,
        meta_json TEXT NOT NULL,
        UNIQUE(chain_id, digest_hex)
      );

      CREATE TABLE IF NOT EXISTS kg_event_cursor (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL UNIQUE,
        last_event_id TEXT NOT NULL,
        last_event_timestamp INTEGER NOT NULL,
        meta_json TEXT NOT NULL
      );
    `;

    const indexSchema = `
      CREATE INDEX IF NOT EXISTS idx_kg_node_external_type ON kg_node(external_id, type);
      CREATE INDEX IF NOT EXISTS idx_kg_node_valid_range ON kg_node(type, valid_from, valid_to);
      CREATE INDEX IF NOT EXISTS idx_kg_node_digest ON kg_node(digest_id);
      CREATE INDEX IF NOT EXISTS idx_kg_node_created_event ON kg_node(created_by_event_id);

      CREATE INDEX IF NOT EXISTS idx_kg_edge_src_type ON kg_edge(src_node_id, type);
      CREATE INDEX IF NOT EXISTS idx_kg_edge_dst_type ON kg_edge(dst_node_id, type);
      CREATE INDEX IF NOT EXISTS idx_kg_edge_valid_range ON kg_edge(type, valid_from, valid_to);
      CREATE INDEX IF NOT EXISTS idx_kg_edge_digest ON kg_edge(digest_id);
      CREATE INDEX IF NOT EXISTS idx_kg_edge_created_event ON kg_edge(created_by_event_id);

      CREATE INDEX IF NOT EXISTS idx_kg_digest_chain ON kg_digest(chain_id, id);
      CREATE INDEX IF NOT EXISTS idx_kg_digest_entity ON kg_digest(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_kg_digest_event ON kg_digest(event_id);

      CREATE INDEX IF NOT EXISTS idx_kg_event_cursor_source ON kg_event_cursor(source);
    `;

    this.db.exec(schema);
    this.db.exec(indexSchema);
  }

  // === Digest Computation ===

  private computePayloadHash(payload: Record<string, unknown>): string {
    const canonical = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto.createHash("sha256").update(canonical).digest("hex");
  }

  private computeDigest(input: string): string {
    return crypto.createHash("sha256").update(input).digest("hex");
  }

  private buildDigestInput(
    chainId: string,
    prevDigestHex: string | undefined,
    mutationType: string,
    entityType: string,
    entityId: number,
    eventId: string,
    timestamp: number,
    payloadHashHex: string
  ): string {
    return [
      chainId,
      prevDigestHex || "",
      mutationType,
      entityType,
      entityId,
      eventId,
      timestamp,
      payloadHashHex,
    ].join("|");
  }

  // === Node Operations ===

  async createNode(node: Node): Promise<number> {
    const now = Date.now();
    const payloadHashHex = this.computePayloadHash(node.payloadJson);

    return this.db.transaction(() => {
      // Get previous digest for chain
      const prevDigest = this.db
        .prepare(
          `SELECT digest_hex FROM kg_digest
         WHERE chain_id = ?
         ORDER BY id DESC LIMIT 1`
        )
        .get(`kg_node:${node.externalId}`) as
        | { digest_hex: string }
        | undefined;

      const digestInput = this.buildDigestInput(
        `kg_node:${node.externalId}`,
        prevDigest?.digest_hex,
        "create",
        "node",
        0,
        node.createdByEventId,
        now,
        payloadHashHex
      );

      const digestHex = this.computeDigest(digestInput);

      // Insert digest
      const digestStmt = this.db.prepare(`
        INSERT INTO kg_digest
        (chain_id, prev_digest_id, mutation_type, entity_type, entity_id,
         event_id, timestamp, digest_hex, payload_hash_hex, meta_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const digestResult = digestStmt.run(
        `kg_node:${node.externalId}`,
        prevDigest ? undefined : null,
        "create",
        "node",
        0,
        node.createdByEventId,
        now,
        digestHex,
        payloadHashHex,
        JSON.stringify({})
      ) as any;

      const digestId = digestResult.lastInsertRowid;

      // Insert node
      const nodeStmt = this.db.prepare(`
        INSERT INTO kg_node
        (external_id, type, created_at, created_by_event_id, is_deleted,
         valid_from, valid_to, payload_json, version, digest_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const nodeResult = nodeStmt.run(
        node.externalId,
        node.type,
        now,
        node.createdByEventId,
        node.isDeleted ? 1 : 0,
        node.validFrom,
        node.validTo || null,
        JSON.stringify(node.payloadJson),
        node.version,
        digestId
      ) as any;

      return nodeResult.lastInsertRowid as number;
    })();
  }

  async getNode(id: number): Promise<Node | null> {
    const row = this.db
      .prepare(
        `SELECT * FROM kg_node WHERE id = ? AND is_deleted = 0 LIMIT 1`
      )
      .get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      externalId: row.external_id,
      type: row.type,
      createdAt: row.created_at,
      createdByEventId: row.created_by_event_id,
      isDeleted: row.is_deleted === 1,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      payloadJson: JSON.parse(row.payload_json),
      version: row.version,
      digestId: row.digest_id,
    };
  }

  async findNodes(
    filter: Partial<{ type: string; externalId: string }>
  ): Promise<Node[]> {
    let query =
      "SELECT * FROM kg_node WHERE is_deleted = 0";
    const params: any[] = [];

    if (filter.type) {
      query += " AND type = ?";
      params.push(filter.type);
    }

    if (filter.externalId) {
      query += " AND external_id = ?";
      params.push(filter.externalId);
    }

    const rows = this.db.prepare(query).all(...params) as any[];

    return rows.map((row) => ({
      id: row.id,
      externalId: row.external_id,
      type: row.type,
      createdAt: row.created_at,
      createdByEventId: row.created_by_event_id,
      isDeleted: row.is_deleted === 1,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      payloadJson: JSON.parse(row.payload_json),
      version: row.version,
      digestId: row.digest_id,
    }));
  }

  // === Edge Operations ===

  async createEdge(edge: Edge): Promise<number> {
    const now = Date.now();
    const payloadHashHex = this.computePayloadHash(edge.payloadJson);

    return this.db.transaction(() => {
      // Get previous digest for chain
      const chainId = `kg_edge:${edge.srcNodeId}-${edge.type}-${edge.dstNodeId}`;
      const prevDigest = this.db
        .prepare(
          `SELECT digest_hex FROM kg_digest
         WHERE chain_id = ?
         ORDER BY id DESC LIMIT 1`
        )
        .get(chainId) as { digest_hex: string } | undefined;

      const digestInput = this.buildDigestInput(
        chainId,
        prevDigest?.digest_hex,
        "create",
        "edge",
        0,
        edge.createdByEventId,
        now,
        payloadHashHex
      );

      const digestHex = this.computeDigest(digestInput);

      // Insert digest
      const digestStmt = this.db.prepare(`
        INSERT INTO kg_digest
        (chain_id, prev_digest_id, mutation_type, entity_type, entity_id,
         event_id, timestamp, digest_hex, payload_hash_hex, meta_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const digestResult = digestStmt.run(
        chainId,
        prevDigest ? undefined : null,
        "create",
        "edge",
        0,
        edge.createdByEventId,
        now,
        digestHex,
        payloadHashHex,
        JSON.stringify({})
      ) as any;

      const digestId = digestResult.lastInsertRowid;

      // Insert edge
      const edgeStmt = this.db.prepare(`
        INSERT INTO kg_edge
        (src_node_id, dst_node_id, type, created_at, created_by_event_id,
         is_deleted, valid_from, valid_to, payload_json, version, digest_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const edgeResult = edgeStmt.run(
        edge.srcNodeId,
        edge.dstNodeId,
        edge.type,
        now,
        edge.createdByEventId,
        edge.isDeleted ? 1 : 0,
        edge.validFrom,
        edge.validTo || null,
        JSON.stringify(edge.payloadJson),
        edge.version,
        digestId
      ) as any;

      return edgeResult.lastInsertRowid as number;
    })();
  }

  async getEdge(id: number): Promise<Edge | null> {
    const row = this.db
      .prepare(
        `SELECT * FROM kg_edge WHERE id = ? AND is_deleted = 0 LIMIT 1`
      )
      .get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      srcNodeId: row.src_node_id,
      dstNodeId: row.dst_node_id,
      type: row.type,
      createdAt: row.created_at,
      createdByEventId: row.created_by_event_id,
      isDeleted: row.is_deleted === 1,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      payloadJson: JSON.parse(row.payload_json),
      version: row.version,
      digestId: row.digest_id,
    };
  }

  async findEdges(
    filter: Partial<{ srcNodeId: number; dstNodeId: number; type: string }>
  ): Promise<Edge[]> {
    let query = "SELECT * FROM kg_edge WHERE is_deleted = 0";
    const params: any[] = [];

    if (filter.srcNodeId) {
      query += " AND src_node_id = ?";
      params.push(filter.srcNodeId);
    }

    if (filter.dstNodeId) {
      query += " AND dst_node_id = ?";
      params.push(filter.dstNodeId);
    }

    if (filter.type) {
      query += " AND type = ?";
      params.push(filter.type);
    }

    const rows = this.db.prepare(query).all(...params) as any[];

    return rows.map((row) => ({
      id: row.id,
      srcNodeId: row.src_node_id,
      dstNodeId: row.dst_node_id,
      type: row.type,
      createdAt: row.created_at,
      createdByEventId: row.created_by_event_id,
      isDeleted: row.is_deleted === 1,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      payloadJson: JSON.parse(row.payload_json),
      version: row.version,
      digestId: row.digest_id,
    }));
  }

  // === Temporal Queries ===

  async getNodeAsOf(
    externalId: string,
    timestamp: number
  ): Promise<Node | null> {
    const row = this.db
      .prepare(
        `SELECT * FROM kg_node
       WHERE external_id = ?
       AND is_deleted = 0
       AND valid_from <= ?
       AND (valid_to IS NULL OR valid_to > ?)
       ORDER BY version DESC LIMIT 1`
      )
      .get(externalId, timestamp, timestamp) as any;

    if (!row) return null;

    return {
      id: row.id,
      externalId: row.external_id,
      type: row.type,
      createdAt: row.created_at,
      createdByEventId: row.created_by_event_id,
      isDeleted: row.is_deleted === 1,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      payloadJson: JSON.parse(row.payload_json),
      version: row.version,
      digestId: row.digest_id,
    };
  }

  async getEdgeAsOf(
    srcNodeId: number,
    dstNodeId: number,
    edgeType: string,
    timestamp: number
  ): Promise<Edge | null> {
    const row = this.db
      .prepare(
        `SELECT * FROM kg_edge
       WHERE src_node_id = ?
       AND dst_node_id = ?
       AND type = ?
       AND is_deleted = 0
       AND valid_from <= ?
       AND (valid_to IS NULL OR valid_to > ?)
       ORDER BY version DESC LIMIT 1`
      )
      .get(srcNodeId, dstNodeId, edgeType, timestamp, timestamp) as any;

    if (!row) return null;

    return {
      id: row.id,
      srcNodeId: row.src_node_id,
      dstNodeId: row.dst_node_id,
      type: row.type,
      createdAt: row.created_at,
      createdByEventId: row.created_by_event_id,
      isDeleted: row.is_deleted === 1,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      payloadJson: JSON.parse(row.payload_json),
      version: row.version,
      digestId: row.digest_id,
    };
  }

  async findNodesInTimeRange(
    type: string,
    validFromMin: number,
    validToMax: number
  ): Promise<Node[]> {
    const rows = this.db
      .prepare(
        `SELECT * FROM kg_node
       WHERE type = ?
       AND valid_from <= ?
       AND (valid_to IS NULL OR valid_to >= ?)
       AND is_deleted = 0
       ORDER BY valid_from ASC`
      )
      .all(type, validToMax, validFromMin) as any[];

    return rows.map((row) => ({
      id: row.id,
      externalId: row.external_id,
      type: row.type,
      createdAt: row.created_at,
      createdByEventId: row.created_by_event_id,
      isDeleted: row.is_deleted === 1,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      payloadJson: JSON.parse(row.payload_json),
      version: row.version,
      digestId: row.digest_id,
    }));
  }

  // === Stats ===

  async getStats(): Promise<{
    nodeCount: number;
    edgeCount: number;
    digestCount: number;
    lastIngestionAt: number | null;
  }> {
    const nodeCountRow = this.db
      .prepare(`SELECT COUNT(*) as count FROM kg_node WHERE is_deleted = 0`)
      .get() as any;

    const edgeCountRow = this.db
      .prepare(`SELECT COUNT(*) as count FROM kg_edge WHERE is_deleted = 0`)
      .get() as any;

    const digestCountRow = this.db
      .prepare(`SELECT COUNT(*) as count FROM kg_digest`)
      .get() as any;

    const lastIngestionRow = this.db
      .prepare(
        `SELECT MAX(timestamp) as timestamp FROM kg_digest ORDER BY timestamp DESC LIMIT 1`
      )
      .get() as any;

    return {
      nodeCount: nodeCountRow.count,
      edgeCount: edgeCountRow.count,
      digestCount: digestCountRow.count,
      lastIngestionAt: lastIngestionRow?.timestamp || null,
    };
  }

  close(): void {
    this.db.close();
  }
}
