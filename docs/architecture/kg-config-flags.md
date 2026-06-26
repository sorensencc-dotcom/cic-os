# KG Storage Configuration Flags (Phase 29–31)

## Overview

KG storage backend is selected via `KG_STORE_MODE` environment variable. Supports:

- **sqlite** (Phase 29–30): Single-file, embedded, append-only
- **postgres** (Phase 31+): Multi-writer, high-throughput
- **dual** (Phase 31): Dual-write audit + live (migration mode)

## Environment Variables

### Primary Flag: `KG_STORE_MODE`

```bash
KG_STORE_MODE=sqlite    # Phase 29 (default)
KG_STORE_MODE=postgres  # Phase 31+
KG_STORE_MODE=dual      # Phase 31 (migration)
```

### SQLite Configuration

```bash
KG_SQLITE_PATH=/app/data/kg.sqlite
# Default: /app/data/kg.sqlite
# Absolute path to SQLite database file
```

### Postgres Configuration

```bash
KG_POSTGRES_HOST=localhost
# Default: localhost

KG_POSTGRES_PORT=5432
# Default: 5432

KG_POSTGRES_DB=knowledge_graph
# Default: knowledge_graph

KG_POSTGRES_USER=postgres
# Default: postgres

KG_POSTGRES_PASSWORD=<your-password>
# No default — must be set if KG_STORE_MODE=postgres or dual

KG_POSTGRES_POOL_MIN=2
# Default: 2
# Minimum connections in pool

KG_POSTGRES_POOL_MAX=10
# Default: 10
# Maximum connections in pool
```

### Runtime Flags

```bash
KG_READ_ONLY=true
# Default: false
# Enable read-only mode (Phase 33+ for audit/replay)
```

## Usage Examples

### Phase 29: SQLite (default)

```bash
# Environment
export KG_STORE_MODE=sqlite
export KG_SQLITE_PATH=/data/kg.sqlite

# Code
import { createKGStore, getDefaultConfig } from './config/kg-store.config';
const config = getDefaultConfig();
const store = await createKGStore(config);
```

### Phase 31: Dual-write (migration)

```bash
# Environment
export KG_STORE_MODE=dual
export KG_SQLITE_PATH=/data/kg.sqlite
export KG_POSTGRES_HOST=postgres.example.com
export KG_POSTGRES_PORT=5432
export KG_POSTGRES_DB=kg_prod
export KG_POSTGRES_USER=kg_app
export KG_POSTGRES_PASSWORD=<secret>

# Both stores get identical writes
# Reads come from Postgres (live)
# Digests come from SQLite (audit)
```

### Phase 31: Pure Postgres (post-migration)

```bash
# Environment
export KG_STORE_MODE=postgres
export KG_POSTGRES_HOST=postgres.prod.internal
export KG_POSTGRES_PORT=5432
export KG_POSTGRES_DB=kg_prod
export KG_POSTGRES_USER=kg_app
export KG_POSTGRES_PASSWORD=<secret>
export KG_POSTGRES_POOL_MAX=20

# All reads/writes go to Postgres
```

### Phase 33: Read-only audit mode

```bash
# Environment
export KG_STORE_MODE=sqlite
export KG_SQLITE_PATH=/archive/kg.sqlite
export KG_READ_ONLY=true

# Requests to append/mutate will error
# Only getNode, getEdge, getDigests, etc. allowed
```

## Docker Compose Integration

```yaml
services:
  knowledge-graph:
    build:
      context: services/knowledge-graph
      dockerfile: Dockerfile
    environment:
      # Phase 29 (default)
      - KG_STORE_MODE=sqlite
      - KG_SQLITE_PATH=/app/data/kg.sqlite
      
      # Phase 31+ (uncomment when ready)
      # - KG_STORE_MODE=dual
      # - KG_POSTGRES_HOST=postgres
      # - KG_POSTGRES_DB=knowledge_graph
      # - KG_POSTGRES_USER=kg_app
      # - KG_POSTGRES_PASSWORD=${KG_POSTGRES_PASSWORD}
    
    volumes:
      - kg-data:/app/data

volumes:
  kg-data:
```

## Configuration Priority

Environment variables override defaults:

```
Environment (highest priority)
         ↓
         Default config
         ↓
Code defaults (lowest priority)
```

Example:
```ts
const config = getDefaultConfig(); // Reads env vars
config.sqlite.path = '/custom/path'; // Override in code
const store = await createKGStore(config);
```

## Validation

`createKGStore()` validates configuration before creating backend:

- **SQLITE mode**: Requires `sqlite.path`
- **POSTGRES mode**: Requires all Postgres config (host, port, db, user, password)
- **DUAL mode**: Requires both SQLite and Postgres config
- **READ_ONLY mode**: Only allows read operations

Throws error if config incomplete or invalid.

## Phase Migration Checklist

### Phase 29→30 (no action)
- [ ] Config framework in place
- [ ] Default: `KG_STORE_MODE=sqlite`

### Phase 30→31 (add Postgres, enable dual-write)
- [ ] Deploy Postgres service
- [ ] Implement `PostgresKGStore` class
- [ ] Implement `DualKGStore` adapter
- [ ] Test: set `KG_STORE_MODE=dual` in staging
- [ ] Verify dual-write integrity (same data in both stores)
- [ ] Switch production to dual-write
- [ ] Archive old SQLite (keep for replay)

### Phase 31→32 (pure Postgres)
- [ ] Switch `KG_STORE_MODE=postgres` (deprecate SQLite for live)
- [ ] SQLite moved to audit/archive system
- [ ] Qdrant vector sidecar deployed separately

### Phase 32→33 (federated)
- [ ] TorqueQuery federation integrated
- [ ] `KG_READ_ONLY=true` for archive instances
- [ ] Query engine routes to appropriate backend

## Troubleshooting

**Error: "KG_STORE_MODE=postgres requires postgres config"**
→ Set all `KG_POSTGRES_*` env vars

**Error: "PostgresKGStore not yet implemented"**
→ Currently Phase 29 only. Upgrade to Phase 31+ when ready.

**SQLite file not found**
→ Check `KG_SQLITE_PATH`, ensure directory writable

**Postgres connection refused**
→ Verify `KG_POSTGRES_HOST`, `KG_POSTGRES_PORT`, firewall
