# TanStack Query Integration Plan (v1.0.0)

**Status:** Specification locked  
**Scope:** Per-panel query architecture  
**Date:** 2026-06-21

## Overview

Unified reactive data layer for CIC's high-frequency polling:
- Agents (5s)
- Ingestion queue (3s)
- Drift events (2s)
- Memory clusters (10s)
- Pipeline runs (5s)
- Settings (30s)

## Query Client Setup

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5000,
      gcTime: 60000,
    },
  },
});
```

## Panel Integration

| Panel | Query | Interval | Purpose |
|-------|-------|----------|---------|
| Agents | agents.list | 5s | Primary control surface |
| Agents | agents.health | 3s | Health status |
| Ingestion | ingestion.queue | 3s | Queue depth tracking |
| Ingestion | ingestion.dlq | 10s | Dead letter queue |
| Drift | drift.events | 2s | Time-sensitive |
| Drift | drift.stats | 5s | Aggregates |
| Memory | memory.clusters | 10s | Slower changes |
| Pipelines | pipelines.runs | 5s | High-churn |
| Settings | settings.config | 30s | Rarely changed |

## WebSocket → Query Invalidation

```typescript
socket.on("agent:update", () => {
  queryClient.invalidateQueries(["agents"]);
});
```

## Advanced Patterns

- Dependent queries (enable/disable based on ID)
- Parallel queries (useQueries)
- Infinite queries (logs, streaming)
- Background refetching

## Rollout

- Week 1: Agents + Ingestion
- Week 2: Drift + Memory
- Week 3: Pipelines + Settings
- Week 4: WebSocket invalidation

---

**Next:** Implement per-panel query hooks.
