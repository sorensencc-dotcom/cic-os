# visx Charting Framework for CIC (v1.0.0)

**Status:** Specification locked  
**Technology:** visx (Visx from Airbnb)  
**Date:** 2026-06-21

## Overview

Token-driven charting framework for CIC dashboards.

Chart types:
- Line (drift over time)
- Bar (agent stats)
- Area (ingestion throughput)
- Scatter (memory distribution)
- Heat (token usage coverage)

## Architecture

```
/src/charts
  /components
    LineChart.tsx
    BarChart.tsx
    AreaChart.tsx
    ScatterChart.tsx
    HeatMap.tsx
  /hooks
    useChartData.ts
    useChartDimensions.ts
  /tokens
    chart-colors.css
    chart-scales.ts
```

## Token Integration

Chart colors use CIC tokens:
```typescript
const colors = {
  primary: "var(--cic-color-accent)",
  secondary: "var(--cic-color-surface)",
  neutral: "var(--cic-color-border)",
};
```

## Dashboard Charts

| Panel | Chart | Metric |
|-------|-------|--------|
| Agents | Bar | throughput per agent |
| Ingestion | Line | queue depth over time |
| Drift | Area | event rate over time |
| Memory | Scatter | cluster distribution |
| Pipelines | Line | run duration trends |

## visx Advantages

- Composition-based (React)
- No CSS-in-JS (uses CIC tokens)
- Deterministic rendering
- Tooltip integration
- Axis labeling
- Grid overlay

## Responsive Design

Charts use `useChartDimensions()` hook:
```typescript
const { width, height, ref } = useChartDimensions();
```

## Testing

- Unit: chart data transformations
- Integration: query → chart rendering
- Visual: Playwright snapshots
- Accessibility: axis labels, legends

## Rollout

- Week 1: LineChart + BarChart
- Week 2: AreaChart + ScatterChart
- Week 3: HeatMap + Legends
- Week 4: Dashboard integration

---

**Next:** Implement visx chart components.
