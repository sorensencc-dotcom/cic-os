# CIC Runtime Topology v0.1.0

**Generated:** 2026-06-19  
**Source:** Full repo scan of `/c/dev`  
**Canvas:** Entire c:\dev monorepo including cic, cic-ingestion, rewrite-mcp, services, castironforge

---

## 1. Port Bindings & Service Map

| Port | Service | Status | Type | Health Check | Dependencies |
|------|---------|--------|------|--------------|--------------|
| 3100 | Unified API (Router) | PRIMARY | Express | GET /health | torquequery, vault, repomix, governance, planning-engine, harvester-v2 |
| 3101 | Build Executor | PHASE-0.7 | Service | GET /health | redis, lineage-registry, routing-validator |
| 3102 | Lineage Registry | PHASE-0.7 | Service | GET /health | postgres |
| 3103 | Routing Validator (OPA) | PHASE-0.7 | Service | GET /health | none |
| 3104 | Build Orchestrator | PHASE-0.7 | Service | GET /health | lineage-registry, routing-validator, build-executor, redis, performance-store |
| 3105 | Performance Store | PHASE-0.8 | Service | GET /health | none |
| 3106 | Predictive Routing | PHASE-0.8 | Service | GET /health | performance-store |
| 3107 | Knowledge Graph | PHASE-29 | Express | GET /health | none |
| 3110 | TorqueQuery (Memory) | PHASE-26 | Python/FastAPI | GET /health | (Ollama via host.docker.internal:11434) |
| 3111 | Vault (Governance) | M3 | Express | GET /health | none |
| 3112 | Repomix Ingestion | PHASE-4.4 | Express | GET /health | none |
| 3113 | CIC Governance | PHASE-24 | Express | GET /health | none |
| 3114 | Planning Engine | PHASE-2 | Express | GET /health | vault (3111), torquequery (3110) |
| 3115 | Harvester v2 | PHASE-2 | Express | GET /health | vault (3111), torquequery (3110), planning-engine (3114) |
| 3116 | CIC Ingestion (Autonomy API) | PHASE-2.5 | Express | GET /health | vault (3111), torquequery (3110), qdrant (6333) |
| 3200 | Planning Console (React UI) | PRIMARY | React | GET /health | planning-engine (3114), cic-governance (3113), vault (3111) |
| 5433 | PostgreSQL | INFRA | Database | pg_isready | none |
| 6333 | Qdrant | INFRA | Vector DB | GET /health | none |
| 6380 | Redis | INFRA | Cache/Queue | redis-cli PING | none |

### Port Analysis

**Range:** 3100–3116 (services), 3200 (UI), 5433 (DB), 6333 (vector), 6380 (cache)

**Conflicts:** None detected. All ports are unique.

**Open Ports:** None from docker-compose config are unbound.

**Orphans:** None detected. All ports in use.

---

## 2. Startup Order & Dependencies

### Startup Sequence (Critical Path)

```
Wave 1 (Infrastructure)
├── PostgreSQL (port 5433)                [blocks: lineage-registry]
├── Redis (port 6380)                     [blocks: build-executor, build-orchestrator]
└── Qdrant (port 6333)                    [blocks: cic-ingestion]

Wave 2 (Core Governance & Memory)
├── Vault (port 3111)                     [blocks: planning-engine, harvester-v2, cic-ingestion]
└── TorqueQuery (port 3110)               [blocks: planning-engine, harvester-v2, cic-ingestion, unified-api]

Wave 3 (Lineage & Build Infrastructure)
├── Lineage Registry (port 3102)          [depends: postgres; blocks: build-executor, build-orchestrator]
├── Routing Validator (port 3103)         [independent; blocks: build-executor, build-orchestrator]
└── Performance Store (port 3105)         [independent; blocks: build-orchestrator, predictive-routing]

Wave 4 (Build System)
├── Build Executor (port 3101)            [depends: redis, lineage-registry, routing-validator]
└── Build Orchestrator (port 3104)        [depends: lineage-registry, routing-validator, build-executor, redis, performance-store]

Wave 5 (Predictive Routing)
└── Predictive Routing Engine (port 3106) [depends: performance-store]

Wave 6 (CIC Core Services)
├── Repomix Ingestion (port 3112)         [independent]
├── CIC Governance (port 3113)            [independent]
├── Knowledge Graph (port 3107)           [independent]
├── Planning Engine (port 3114)           [depends: vault, torquequery]
└── Harvester v2 (port 3115)              [depends: vault, torquequery, planning-engine]

Wave 7 (Autonomy & Integration)
├── CIC Ingestion (port 3116)             [depends: vault, torquequery, qdrant]
└── Planning Console (port 3200)          [depends: planning-engine, cic-governance, vault]

Wave 8 (API Gateway)
└── Unified API (port 3100)               [depends: all Wave 6+7 services]
```

### Recommended Startup Script Order

1. `docker-compose up -d postgres redis qdrant`
2. Wait 10s for health checks
3. `docker-compose up -d vault torquequery`
4. Wait 10s for health checks
5. `docker-compose up -d lineage-registry routing-validator performance-store`
6. Wait 10s
7. `docker-compose up -d build-executor build-orchestrator`
8. Wait 10s
9. `docker-compose up -d predictive-routing-engine`
10. `docker-compose up -d repomix-ingestion cic-governance knowledge-graph planning-engine harvester-v2`
11. Wait 10s
12. `docker-compose up -d cic-ingestion planning-console`
13. Wait 15s
14. `docker-compose up -d unified-api`
15. Final health check: `curl -s http://localhost:3100/health`

**Total startup time:** ~60–90 seconds (assuming all containers build and start cleanly)

---

## 3. Environment Variables

### Critical Environment Variables

| Variable | Required | Source | Default | Scope | Notes |
|----------|----------|--------|---------|-------|-------|
| NODE_ENV | YES | .env | development | Global | Controls logging verbosity, security headers |
| LOG_LEVEL | YES | .env | info | Global | debug, info, warn, error |
| PORT | YES | Service | 3000 | Per-service | Each service binds to unique port |
| VAULT_URL | YES | .env | http://vault:3111 | Planner, Harvester, Ingestion | Must be reachable from containers |
| MEMORY_STORE_URL | YES | .env | http://torquequery:3110 | Planner, Harvester, Ingestion | TorqueQuery endpoint |
| QDRANT_URL | YES | .env | http://qdrant:6333 | CIC Ingestion | Vector DB for memory |
| POSTGRES_* | YES | .env | cic/cic_dev_pass | Lineage Registry | DB credentials |
| REDIS_URL | YES | .env | redis://redis:6379 | Build Orchestrator, Executor | Message queue |
| REACT_APP_PLANNING_ENGINE_URL | YES | .env | http://localhost:3114 | Planning Console | Frontend config |
| REACT_APP_GOVERNANCE_URL | YES | .env | http://localhost:3113 | Planning Console | Frontend config |
| REACT_APP_VAULT_URL | YES | .env | http://localhost:3111 | Planning Console | Frontend config |
| OPA_ENABLED | NO | .env | true | Routing Validator | Enable OPA policy enforcement |
| OLLAMA_HOST | NO | .env | http://host.docker.internal:11434 | TorqueQuery | External LLM (local dev only) |
| VAULT_SECRET_KEY | YES | .env | dev-key-32-chars-minimum-xxx | Vault | Encryption key (min 32 chars) |
| QDRANT_API_KEY | NO | .env | dev-key-unsafe | Qdrant | API key for vector DB |
| GIT_SHA | NO | docker-compose.yml | dev | Build Orchestrator | Current commit SHA |

### Optional Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| BUILD_PHASE | Versioning/feature gates | 0.7, 0.8, 0.9, etc. |
| HF_HUB_DISABLE_SYMLINKS_WARNING | TorqueQuery | 1 |
| HF_HUB_OFFLINE | TorqueQuery | 1 |
| TRANSFORMERS_OFFLINE | TorqueQuery | 1 |
| CUDA_VISIBLE_DEVICES | GPU selection | (empty = CPU) |

### Environment Variable Sources

```
Primary sources:
1. docker-compose.yml (inline)
2. .env file (at /c/dev/.env)
3. .env.example (reference template)
4. Service package.json scripts
```

---

## 4. Health Checks

All services implement HTTP health checks at **GET /health**

```bash
# Quick health check for all services
for port in 3100 3101 3102 3103 3104 3105 3106 3107 3110 3111 3112 3113 3114 3115 3116 3200; do
  echo -n "Port $port: "
  curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health || echo "DOWN"
done
```

**Non-HTTP Health Checks:**
- PostgreSQL: `pg_isready -U cic` (port 5433)
- Redis: `redis-cli PING` (port 6380)
- Qdrant: `curl http://localhost:6333/health` (port 6333)

---

## 5. Service Dependencies Graph

```
PostgreSQL (5433)
    ↓
Lineage Registry (3102)
    ↓
Build Executor (3101) ← Redis (6380)
    ↓
Build Orchestrator (3104) ← Performance Store (3105)
    ↓
Predictive Routing (3106)

Vault (3111)
    ↓
Planning Engine (3114) ← TorqueQuery (3110)
    ↓
Harvester v2 (3115)
    ↓
CIC Ingestion (3116) ← Qdrant (6333)
    ↓
Unified API (3100)
    ↓
Planning Console (3200)
```

---

## 6. Data Flow

### Ingestion Pipeline

```
cic-ingestion (3116)
    ↓
TorqueQuery (3110) [memory indexing]
    ↓
Vault (3111) [governance storage]
    ↓
Qdrant (6333) [vector embeddings]
```

### Planning Pipeline

```
Harvester v2 (3115) [cost/telemetry extraction]
    ↓
Planning Engine (3114) [estimation + scheduling]
    ↓
Vault (3111) [decision storage]
    ↓
Planning Console (3200) [UI visualization]
```

### Governance Pipeline

```
CIC Governance (3113) [decision tracking]
    ↓
Vault (3111) [immutable audit log]
    ↓
Lineage Registry (3102) [build lineage]
    ↓
Build Orchestrator (3104) [DAG execution]
```

---

## 7. Overlaps & Conflicts

### Critical Overlaps

**None detected** — All port bindings are unique. No service collision.

### Potential Issues

| Issue | Severity | Service | Action |
|-------|----------|---------|--------|
| TorqueQuery requires Ollama | MEDIUM | TorqueQuery (3110) | Must have Ollama running at `host.docker.internal:11434` or update OLLAMA_HOST env var |
| Qdrant initialization | LOW | Qdrant (6333) | First-run may take 5–10s; health check handles this |
| PostgreSQL initialization | MEDIUM | PostgreSQL (5433) | `docker-init-db.sql` runs on first start; ensure file exists |
| Planning Console port (3200) | LOW | Planning Console | Maps 3200:3000 internally; ensure host port 3200 is free |

### Orphan Processes

**None detected** — All services are referenced in docker-compose.yml and have clear purpose.

---

## 8. Database Schema & Initialization

### PostgreSQL (port 5433)

```sql
Database: cic_lineage
User: cic
Password: cic_dev_pass

Initialized from: docker-init-db.sql (auto-loads on first run)

Tables expected:
- lineage_packets (build provenance)
- artifacts (generated files)
- sbom (software bill of materials)
```

### Qdrant (port 6333)

```
Vector DB for semantic memory indexing
API Key: dev-key-unsafe (unsafe for dev only; change for production)
Collections: (auto-created by cic-ingestion)
```

### TorqueQuery (port 3110)

```
Python FastAPI service
Storage: ./cic/torquequery/storage (volume mount)
Config: ./cic/torquequery/config (volume mount)
```

---

## 9. Volume Mounts

| Service | Volume | Path | Mode | Purpose |
|---------|--------|------|------|---------|
| PostgreSQL | postgres-data | /var/lib/postgresql/data | rw | DB persistence |
| Qdrant | qdrant-storage | /qdrant/storage | rw | Vector DB persistence |
| TorqueQuery | ./cic/torquequery/storage | /app/storage | rw | Memory index storage |
| TorqueQuery | ./cic/torquequery/config | /app/config | ro | Configuration |
| TorqueQuery | ./docs | /docs | ro | Documentation |
| TorqueQuery | C:\Users\soren\.cache\huggingface | /root/.cache/huggingface | ro | HF model cache |
| Build Orchestrator | ./ | /app | ro | Repo read-only |
| CIC Ingestion | ./cic-ingestion/dist | /app/dist | rw | Distribution binaries |

---

## 10. Network Configuration

All services run on unified network: **cic-network**

```yaml
cic-network:
  driver: bridge
  subnet: 172.25.0.0/16
  
Service IPs (auto-assigned):
  postgres: 172.25.0.2
  redis: 172.25.0.3
  qdrant: 172.25.0.4
  vault: 172.25.0.5
  torquequery: 172.25.0.6
  ... etc
```

**Cross-service communication:** Use service name (e.g., `http://vault:3111`)  
**Host access:** Use localhost (e.g., `http://localhost:3111`)

---

## 11. Restart Policies

All services configured with:

```yaml
restart: unless-stopped
```

This means:
- Automatic restart if container crashes
- Manual stop via `docker-compose down` (survives)
- System reboot: containers auto-restart

---

## 12. Health Check Probes

### Interval & Timeout Strategy

```
interval: 10s       (check every 10 seconds)
timeout: 5s         (wait max 5 seconds for response)
retries: 3          (fail after 3 consecutive failures)
start_period: 10s   (grace period before first check)
```

**Example:** Service marked unhealthy after 3 × 10s = ~30s of failed checks

---

## 13. Readiness & Liveness

Services export two readiness states:

| State | HTTP Status | Meaning |
|-------|-------------|---------|
| Healthy | 200 OK | Ready for traffic |
| Unhealthy | 503 Service Unavailable | Degraded; retry |

**Unified API** waits for all dependencies to be healthy before reporting 200.

---

## 14. Startup Validation Checklist

```bash
# 1. Infrastructure layer
[ ] PostgreSQL: curl http://localhost:5433 (should timeout gracefully)
[ ] Redis: redis-cli -p 6380 ping → PONG
[ ] Qdrant: curl http://localhost:6333/health → 200

# 2. Core services
[ ] Vault: curl http://localhost:3111/health → 200
[ ] TorqueQuery: curl http://localhost:3110/health → 200

# 3. Build system
[ ] Lineage Registry: curl http://localhost:3102/health → 200
[ ] Build Orchestrator: curl http://localhost:3104/health → 200

# 4. CIC services
[ ] Planning Engine: curl http://localhost:3114/health → 200
[ ] CIC Governance: curl http://localhost:3113/health → 200
[ ] CIC Ingestion: curl http://localhost:3116/health → 200

# 5. API & UI
[ ] Unified API: curl http://localhost:3100/health → 200
[ ] Planning Console: curl http://localhost:3200/health → 200
```

---

## 15. Shutdown Sequence (Graceful)

**Forward order (opposite of startup):**

```bash
docker-compose down
```

Automatic behavior:
1. Signal SIGTERM to all containers (30s grace period)
2. SIGKILL any remaining processes
3. Remove containers & networks
4. Preserve volumes (data persists)

---

## 16. Summary

| Metric | Value |
|--------|-------|
| Total services | 16 |
| Infrastructure components | 3 (postgres, redis, qdrant) |
| Express.js servers | 10 |
| React UI frontends | 1 |
| Python/FastAPI services | 1 |
| Other services | 5 |
| Port range | 3100–3116, 3200, 5433, 6333, 6380 |
| Startup waves | 8 |
| Est. startup time | 60–90s |
| Health check cadence | Every 10s |
| Network | 1 unified bridge (cic-network) |
| Data volumes | 2 persistent (postgres, qdrant) |
| Orphan services | 0 |
| Port conflicts | 0 |

---

## 17. Next Steps

**Phase 4.2 Complete.** Proceed to:

- Phase 4.3: Dashboard & Console Drift Map (ijfw:architect)
- Phase 4.4: CIC Hooks & Automation Map (ijfw:architect)
- Phase 4.5: Merge & Veto Gate (CIC)
- Phase 4.6: Operator Console v3 Blueprint (Claude)
- Phase 4.6b: Unified Runtime Config (Antigravity)
