---
title: CLOAKBROWSER_DASHBOARD_UI_COMPONENTS
version: 0.1.0
status: Draft
owner: CIC Observability
created: 2026-06-19
updated: 2026-06-19
---

# 0. Overview

React/TSX components for CloakBrowser metrics and ingestion observability.  
Consume JSON schema payload from ingestion pipeline.

---

# 1. Components

## 1.1 `<CloakEnginePanel />`

**Props:**
```ts
type CloakEngineProps = {
  successRate: number
  avgLoadTimeMs: number
  timeoutRate: number
  wafBlockRate: number
  domHydrationScore: number
  engineStatus: 'ONLINE' | 'DEGRADED' | 'DOWN'
}
```

**Behavior:**
- Render status badge (color-coded by `engineStatus`)
- Big number + sparkline for `successRate`
- Display metrics: `avgLoadTimeMs`, `timeoutRate`, `wafBlockRate`, `domHydrationScore`
- Optional histogram child for load times

---

## 1.2 `<VerticalRoutingPanel />`

**Props:**
```ts
type VerticalRoutingProps = {
  routingDistribution: { cloakbrowser: number; htmlFirst: number }
  verticalSuccessRates: Record<string, number>
  failureHotspots: Array<{ domain: string; vertical: string; errorCode: string }>
}
```

**Behavior:**
- Pie chart: Cloak vs HTML-first
- Bar chart: success rate by vertical
- Table: failure hotspots

---

## 1.3 `<ErrorCodesPanel />`

**Props:**
```ts
type ErrorCodesProps = {
  errorCounts: Record<string, number> // by error code
}
```

**Behavior:**
- List error codes with counts
- Stacked bar chart over time (if time-series provided)

---

## 1.4 `<DlqDriftPanel />`

**Props:**
```ts
type DlqDriftProps = {
  dlqVolume: number
  autoRecoverySuccessRate: number
  permanentFailures: number
  driftAlerts: Array<{ vertical: string; dropPercent: number; timestamp: number }>
}
```

**Behavior:**
- DLQ stats (numbers + sparkline)
- Drift alerts list with severity based on `dropPercent`

---

# 2. Container Component

## 2.1 `<IngestionDashboard />`

**Props:**
```ts
type IngestionDashboardProps = {
  metrics: CicDashboardMetrics // JSON schema object
}
```

**Behavior:**
- Decompose `metrics` into props for child panels
- Layout:
  - Left: `<CloakEnginePanel />`, `<ErrorCodesPanel />`
  - Right: `<VerticalRoutingPanel />`, `<DlqDriftPanel />`

---

# 3. Acceptance Criteria

- Components render with mock data matching JSON schema
- No runtime type errors (TS strict mode)
- Layout matches wireframe (two-column HUD)
- Easy to extend with new metrics
