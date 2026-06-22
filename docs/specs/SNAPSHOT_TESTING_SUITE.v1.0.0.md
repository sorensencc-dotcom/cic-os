# CIC Snapshot Testing Suite (v1.0.0)

**Status:** Specification locked  
**Technology:** Jest + Playwright  
**Date:** 2026-06-21

## Overview

Pixel-perfect, token-driven, deterministic visual integrity layer.

Ensures:
- No visual regressions
- No token drift
- No layout shifts
- No density inconsistencies
- No dark-mode regressions
- No accidental CSS overrides

## Directory Structure

```
/tests/snapshots
  /components
    CicButton.spec.ts
    CicInput.spec.ts
    CicTable.spec.ts
    CicPanel.spec.ts
    CicAlert.spec.ts
    CicStat.spec.ts
  /pages
    AgentsPanel.spec.ts
    IngestionPanel.spec.ts
    DriftPanel.spec.ts
    MemoryPanel.spec.ts
    SettingsPanel.spec.ts
/playwright.config.ts
```

## Playwright Config

```typescript
use: {
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
  deviceScaleFactor: 1,
  ignoreHTTPSErrors: true,
}
expect: {
  toMatchSnapshot: { maxDiffPixels: 50 }
}
```

## Component Snapshot Template

```typescript
test.describe("CicButton Snapshots", () => {
  test("default", async ({ page }) => {
    await page.goto("/storybook/?path=/story/cic-button--default");
    expect(await page.screenshot()).toMatchSnapshot("button-default.png");
  });

  test("hover", async ({ page }) => {
    await page.hover(".cic-button");
    expect(await page.screenshot()).toMatchSnapshot("button-hover.png");
  });

  test("disabled", async ({ page }) => {
    await page.goto("/storybook/?path=/story/cic-button--disabled");
    expect(await page.screenshot()).toMatchSnapshot("button-disabled.png");
  });
});
```

## Naming Convention

`<component>-<state>.png` or `<panel>-<scenario>.png`

Examples:
- `button-hover.png`
- `table-zebra.png`
- `agents-selected.png`
- `drift-1h.png`

## States Covered

- default
- hover
- pressed
- disabled
- loading
- focus ring

## Dark Mode Snapshots

```typescript
test.use({ colorScheme: "dark" });
```

## Density Snapshots

```typescript
await page.evaluate(() => {
  window.__CIC_SET_DENSITY__("compact");
});
```

## Token Drift Detection

```typescript
await page.goto("/design-system/dashboard/tokens");
expect(await page.screenshot()).toMatchSnapshot("tokens.png");
```

If any token changes (color, spacing, typography, interaction), snapshot fails.

## Rollout

- Week 1: Components (Button, Input, Panel)
- Week 2: Tables, Alerts, Stats
- Week 3: Agents, Ingestion, Drift panels
- Week 4: Memory, Settings, Dashboard
- Week 5: Dark mode + density
- Week 6: Token inspector + drift integration

---

**Next:** Implement component snapshot suite.
