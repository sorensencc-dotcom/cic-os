# SPA-Aware Screenshot Heuristics Spec v2.0.0

**Status:** Locked  
**Phase:** 2 (Ingestion Hardening)  
**Purpose:** Deterministic screenshot timing for SPA sites post-hydration

---

## 0. Overview

SPA sites (React, Next.js, Webflow, Framer, Wix Studio) render incomplete DOMs for 200–800ms after navigation. Phase 2 requires deterministic screenshot timing based on hydration signals, not arbitrary delays.

This spec defines the hydration detection algorithm, stability checks, scoring, and fallback behavior.

---

## 1. Hydration Detection Signals

### 1.1 React / Next.js
- Presence of `__NEXT_DATA__` script tag
- Presence of React root nodes:
  - `[data-reactroot]`
  - `#__next`
  - `#root`

### 1.2 Webflow
- `window.Webflow` defined
- DOM mutation burst ends

### 1.3 Framer
- `<framer-canvas>` nodes
- `window.framer` defined

### 1.4 Wix Studio
- `window.wixDevelopersAnalytics`
- `data-aid="site-root"`

---

## 2. DOM Stability Algorithm

### 2.1 Mutation Observer Window
Observe DOM mutations for **300ms**.

### 2.2 Stability Condition
DOM is considered stable when:
- No mutations for **100ms**, AND
- Node count delta < **5%**, AND
- Hydration markers present

### 2.3 Timeout
If stability not reached within **1500ms**, fallback to best-effort hydration score.

---

## 3. Hydration Score (0–100)

| Signal | Weight |
|--------|--------|
| React/Next.js markers | 40 |
| DOM stability | 30 |
| Node count threshold | 20 |
| Script execution success | 10 |

**Threshold:**
- Score ≥ 70 → "Hydrated"
- Score < 40 → Mark session unhealthy (WarmPool recycles)

---

## 4. Screenshot Timing Logic

```ts
if (hydrationScore >= 70) {
  captureScreenshot()
} else if (timeoutReached) {
  captureScreenshot() // fallback
} else {
  waitForStability()
}
```

---

## 5. Logging

Emit:
- `spa.hydration.start`
- `spa.hydration.stable`
- `spa.hydration.timeout`
- `spa.hydration.score`

---

## 6. Integration Points

- **WarmPoolManager:** Session marked unhealthy if hydration score < 40
- **RetryPolicy:** Retry on hydration timeout (HYDRATION_TIMEOUT)
- **DomSampler:** Uses hydration score to rank candidate URLs
- **Dashboard:** Hydration score histogram + SPA framework breakdown

---

## 7. Success Criteria

- Screenshot delay variance < 200ms within framework
- Zero screenshots captured during active mutations
- Hydration score distribution: ≥70 for 95% of SPA loads
