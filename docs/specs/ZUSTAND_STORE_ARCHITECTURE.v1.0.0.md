# Zustand Store Architecture (v1.0.0)

**Status:** Specification locked  
**Scope:** Multi-slice UI state management  
**Date:** 2026-06-21

## Overview

Multi-slice, token-aware, query-aligned, drift-proof UI state layer.

Four categories:
1. Global UI State (theme, density, sidebar)
2. Panel State (per-panel logic)
3. Component State (reusable primitives)
4. Ephemeral Interaction State (local React only)

## Directory Structure

```
/src/state
  /ui
    useThemeStore.ts
    useDensityStore.ts
    useSidebarStore.ts
  /panels
    useAgentsPanelStore.ts
    useIngestionPanelStore.ts
    useDriftPanelStore.ts
    useMemoryPanelStore.ts
  /components
    useTableStore.ts
    usePanelStore.ts
```

## Global Stores

### useThemeStore
- `theme: "light" | "dark"`
- `setTheme(theme)`

### useDensityStore
- `density: "compact" | "cozy" | "comfortable"`
- `setDensity(density)`

### useSidebarStore
- `open: boolean`
- `toggle()`

## Panel Stores

### useAgentsPanelStore
- `selectedAgentId: string | null`
- `filter: string`
- `sort: string`

### useIngestionPanelStore
- `selectedQueueItem: string | null`
- `showDLQ: boolean`

### useDriftPanelStore
- `selectedCluster: string | null`
- `timeRange: "1h" | "6h" | "24h"`

### useMemoryPanelStore
- `selectedNode: string | null`
- `view: "graph" | "table"`

## Component Stores

### useTableStore
- `sortKey: string | null`
- `sortDir: "asc" | "desc"`
- `selectedRows: string[]`

### usePanelStore
- `expanded: boolean`
- `toggle()`

## Integration with TanStack Query

```typescript
const { selectedAgentId } = useAgentsPanelStore();
const { data } = useQuery({
  queryKey: ["agent", selectedAgentId],
  queryFn: () => fetchAgent(selectedAgentId),
  enabled: !!selectedAgentId,
});
```

## Rollout

- Week 1: Global stores
- Week 2: Agents + Ingestion panel stores
- Week 3: Drift + Memory panel stores
- Week 4: Component stores

---

**Next:** Implement store definitions with TypeScript types.
