# Density System (v1.0.0)

**Status:** Specification locked  
**Scope:** Compact, cozy, comfortable modes  
**Date:** 2026-06-21

## Overview

Three density modes for different use cases:

1. **Compact** — Dense tables, agent lists, high-churn dashboards
2. **Cozy** — Default, balanced
3. **Comfortable** — Touch-friendly, accessibility mode

## Spacing Adjustments

### Padding

| Element | Compact | Cozy | Comfortable |
|---------|---------|------|-------------|
| Button | 8px 12px | 12px 16px | 16px 20px |
| Input | 6px 10px | 10px 14px | 14px 18px |
| Panel | 8px | 12px | 16px |
| Row | 4px 0 | 8px 0 | 12px 0 |

### Line Height (Tables)

| Density | Row Height | Padding |
|---------|-----------|---------|
| Compact | 32px | 4px 8px |
| Cozy | 40px | 8px 12px |
| Comfortable | 48px | 12px 16px |

## Implementation

CSS custom properties:
```css
--cic-density-factor: 1.0;  /* compact: 0.8, comfortable: 1.4 */
--cic-spacing-density: calc(12px * var(--cic-density-factor));
```

Zustand store:
```typescript
useDensityStore: { density: "cozy", setDensity() }
```

## Component Behavior

- Button: padding adjusts
- Input: height adjusts
- Table: row height adjusts
- Panel: padding adjusts
- Scrollbar: thumb size adjusts

## Testing

- Compact table rendering (small rows)
- Cozy default layout
- Comfortable accessibility mode
- No layout shifts on toggle

---

**Next:** Implement density CSS variables + Zustand wiring.
