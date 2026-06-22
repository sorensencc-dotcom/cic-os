# Dark Mode v2.0 Motion Rules (v1.0.0)

**Status:** Specification locked  
**Scope:** Elevation, motion, contrast rules for dark theme  
**Date:** 2026-06-21

## Overview

Dark mode v2.0 extends surface layering with motion-aware, elevation-aware rules.

Three key pillars:
1. Surface elevation (raised layers)
2. Motion degradation (reduced motion in dark)
3. Contrast safeguards (WCAG AA maintained)

## Surface Layering

```css
--cic-surface-layer-0: #0a0a0a  /* Base */
--cic-surface-layer-1: #1a1a1a  /* Panels */
--cic-surface-layer-2: #262626  /* Modals */
--cic-surface-layer-3: #323232  /* Dropdowns */
```

## Motion Rules

- Fade: 120ms (preserved)
- Slide: 200ms (reduced from 300ms)
- Scale: 150ms (reduced from 250ms)
- Easing: ease (no change)

Rationale: Dark backgrounds reduce perceived motion; shorter durations prevent lag.

## Contrast Validation

All text on dark backgrounds must pass:
- `--cic-color-text` on `--cic-surface-layer-*`
- WCAG AA minimum (4.5:1)

## Dark Mode Panel Defaults

- Sidebar: layer-1
- Main content: layer-0
- Modal: layer-2
- Dropdown: layer-3
- Focus ring: brighter accent

## Testing Strategy

- Contrast checker tests
- Motion timing assertions
- Visual regression (dark mode suite)
- WCAG AA accessibility audits

---

**Next:** Implement dark mode token overrides + motion rules.
