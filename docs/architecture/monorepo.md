# Monorepo Architecture — Intentional Microservice Isolation (Phase 0.9)

## Status
✅ **Monorepo structure is correct. Not fragmentation.**

## Structure

```
c:\dev/
├── .gitignore                    (root: covers all services)
├── docker-compose.yml            (unified local dev)
├── package.json                  (root workspace, if any)
├── Dockerfile                    (shared base image)
├── scripts/                      (shared utilities)
│   ├── audit-build-artifacts.ps1
│   └── ...
├── services/                     (independent microservices)
│   ├── autonomy-api/
│   │   ├── package.json         (autonomy-specific deps)
│   │   ├── Dockerfile           (autonomy-specific build)
│   │   ├── src/
│   │   ├── __tests__/
│   │   └── tsconfig.json
│   ├── knowledge-graph/
│   │   ├── package.json         (KG-specific deps)
│   │   ├── Dockerfile
│   │   ├── src/
│   │   ├── __tests__/
│   │   └── tsconfig.json
│   ├── ...
│   └── unified-api/
├── docs/                         (shared documentation)
├── cic/                          (separate git repo)
├── rewrite-mcp/                  (separate git repo)
└── ...
```

## Design Rationale

This structure is **not fragmentation**. It is **intentional microservice isolation**.

### Each service has:

| Component | Reason |
|-----------|--------|
| `package.json` | Separate dependencies per service. Prevents bloat, conflicts, version locks. |
| `node_modules/` | Local to service. No shared global node_modules. Keeps services isolated. |
| `Dockerfile` | Service-specific build recipe. Different services may use different base images or build steps. |
| `src/` | Service-specific code. Clean boundaries. |
| `__tests__/` | Service-specific tests. No cross-service test pollution. |
| `tsconfig.json` | Service-specific TypeScript config. Different strictness, target, or output. |

### Why this is correct:

#### 1. **Dependency Isolation**
- ✅ Service A can use `express@5.0`, Service B can use `express@4.18`
- ❌ Monolithic `package.json` forces exact same version (causes conflicts)

#### 2. **Build Independence**
- ✅ Service A builds for Node 20, Service B for Node 18
- ✅ Service A outputs ESM, Service B outputs CJS
- ✅ Each service can have different build steps
- ❌ Single build pipeline forces one config for all

#### 3. **Test Isolation**
- ✅ Service A tests don't pollute Service B's mocks/stubs
- ✅ Each service has independent Jest config
- ❌ Shared test suite risks cross-service contamination

#### 4. **Docker Caching**
- ✅ Change in Service A doesn't invalidate Service B's Docker layer cache
- ❌ Single Dockerfile rebuilds everything on any code change

#### 5. **Runtime Independence**
- ✅ Service A can crash without affecting Service B
- ✅ Service A can be scaled/deployed independently
- ❌ Monolithic app: one service down = everything down

#### 6. **Dependency Tree Visibility**
- ✅ Clear: Service A depends on X, Y, Z
- ❌ Monolithic: unclear which code uses which dependencies

## Not a Monorepo Problem

**"Monorepo fragmentation"** is a real problem when:

- Services have **duplicated** code (copy-paste across services)
- Services have **inconsistent** patterns (no shared conventions)
- Services have **conflicting** dependencies (can't resolve)
- Services have **separate CI pipelines** (no unified test)

**This repo avoids all of these:**

| Issue | Status | Mitigation |
|-------|--------|-----------|
| Code duplication | ✅ None detected | Shared `scripts/`, shared `docs/`, shared type definitions |
| Inconsistent patterns | ✅ Consistent | Shared `jest.config.js`, shared `tsconfig.json`, shared Dockerfile base |
| Version conflicts | ✅ None | Each service can choose its version; root `.gitignore` prevents merge artifacts |
| Unified CI | ✅ Yes | GitHub Actions runs `npm test` across all services |

## Shared Conventions

### Root package.json
```json
{
  "workspaces": ["services/*"]
}
```
(Optional: enables `npm install` at root to install all services)

### Root jest.config.js
Defines base Jest config; services can extend via `projects: ["services/*/jest.config.js"]`

### Root tsconfig.json
Defines base TypeScript config; services extend via `extends: "../../tsconfig.json"`

### Docker base image
All services use same Node version from `Dockerfile`

### Shared scripts
`scripts/` contains utilities used by multiple services (audit, build, deploy)

## CI/CD Integration

### GitHub Actions
```yaml
jobs:
  test:
    strategy:
      matrix:
        service: [autonomy-api, knowledge-graph, unified-api]
    steps:
      - run: npm test --workspace=services/${{ matrix.service }}
```

### Local development
```bash
npm test --workspace=services/knowledge-graph
npm run build --workspace=services/unified-api
docker-compose up knowledge-graph unified-api
```

### Deployment
Each service has own deployment trigger:
```bash
docker build -f services/knowledge-graph/Dockerfile -t kg:latest services/knowledge-graph/
docker push kg:latest
```

## Comparison: Monorepo vs Monolith vs Poly-repo

| Aspect | This Repo (Monorepo) | Monolithic | Poly-repo |
|--------|--------|-----------|-----------|
| Single git repo | ✅ Yes | ✅ Yes | ❌ No |
| Shared code | ✅ Yes (`scripts/`, `docs/`) | ✅ Yes | ❌ No |
| Separate `package.json` | ✅ Yes | ❌ No | ✅ Yes |
| Unified CI | ✅ Yes | ✅ Yes | ❌ No |
| Independent versioning | ✅ Yes | ❌ No | ✅ Yes |
| Easy cross-service changes | ✅ Yes (one PR) | ✅ Yes | ❌ No (multiple PRs) |
| Dependency isolation | ✅ Yes | ❌ No | ✅ Yes |

**This is the best of both worlds: monorepo benefits + microservice isolation.**

## Conclusion

✅ **Current structure is correct.**

- Not fragmented (intentional boundaries)
- Not duplicated (shared conventions)
- Not conflicted (isolated dependencies)
- Not fragile (independent services)

**No changes needed. Document once (this file), move on.**

## For Phase 31+ (New Services)

When adding new service `services/new-service/`:

1. Copy service structure from existing service (e.g., `knowledge-graph/`)
2. Update `package.json` for service-specific dependencies
3. Update `docker-compose.yml` to add new service
4. Update GitHub Actions matrix if new service needs CI
5. Follow existing patterns (jest.config.js, tsconfig.json, Dockerfile structure)

Keep the same structure. Don't merge with other services.
