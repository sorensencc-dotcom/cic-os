---
title: CLOAKBROWSER_INTEGRATION
version: 1.0.0
status: Stable
owner: CIC / Sweeper
created: 2026-06-19
updated: 2026-06-19
---

# Changelog

## v1.0.0 — Initial Release
- Consolidated PRD, Browser Engine Abstraction Spec, Vertical Prioritization Map, and Telemetry Projections into a single master document.
- Defined `IBrowserEngine` interface and adapter requirements for CloakBrowser.
- Added vertical-aware routing strategy for Sweeper.
- Included ingestion telemetry projections and expected pipeline-level impact.
- Added implementation plan (6–8 hrs) with deterministic steps.

---

# 0. Overview

CIC Sweeper's ingestion reliability on JS-heavy SMB sites is currently constrained by Puppeteer's detectability and incomplete DOM hydration. CloakBrowser passes 30/30 bot detection tests and provides a drop-in Playwright-compatible API with stealth fingerprinting.

This consolidated spec defines:

1. **PRD** — Why we're integrating CloakBrowser and what success looks like
2. **Browser Engine Abstraction Spec** — The CIC interface CloakBrowser must implement
3. **Sweeper Vertical Prioritization Map** — Where CloakBrowser matters most
4. **Telemetry Projections** — Expected ingestion improvements

This is the **master artifact** for the sprint.

---

# 1. Product Requirements Document (PRD)

## 1.1 Problem Statement

Sweeper fails on 30–40% of JS-heavy SMB websites due to:
- Cloudflare Bot Fight Mode
- WAF fingerprinting
- SPA hydration failures
- Puppeteer detectability

This blocks ingestion for high-value verticals (Dental, MedSpa, Agencies).

## 1.2 Goals

- Achieve **90–95% ingestion success** on JS-heavy verticals
- Reduce Cloudflare/WAF blocks to **<1%**
- Maintain CIC's deterministic ingestion envelope
- Preserve HTML-first fast path

## 1.3 Non-Goals

- No enterprise-grade behavioral simulation
- No multi-browser orchestration
- No custom fingerprint patching beyond CloakBrowser defaults

## 1.4 Requirements

### Functional
- Implement `CloakBrowserAdapter` conforming to CIC's `IBrowserEngine`
- Support:
  - `goto(url)`
  - DOM hydration
  - `content()`
  - `screenshot()`
  - 5s/10s timeout envelope
- Integrate into Sweeper fallback router
- Add vertical-aware routing (Dental/MedSpa → CloakBrowser first)

### Non-Functional
- Deterministic JSON logs
- Structured error codes
- Observability dashboard integration
- DLQ routing for browser-level failures

## 1.5 Success Metrics

| Metric | Target |
|--------|--------|
| JS-heavy ingestion success | **90–95%** |
| Cloudflare/WAF block rate | **<1%** |
| SPA DOM completeness | **Full hydration** |
| Median load time | **<3.5s** |
| DLQ reduction | **40–60%** |

---

# 2. CIC Browser Engine Abstraction Spec

## 2.1 Purpose

Provide a stable, deterministic interface for browser-based extractors inside CIC, enabling plug-and-play engines (CloakBrowser, Playwright, future engines).

## 2.2 Interface: `IBrowserEngine`

### Methods

```typescript
open(url: string, opts: BrowserOptions): Promise<BrowserSession>
waitForLoad(session: BrowserSession): Promise<void>
getHTML(session: BrowserSession): Promise<string>
getScreenshot(session: BrowserSession): Promise<Buffer>
close(session: BrowserSession): Promise<void>
```

### Session Object

```typescript
interface BrowserSession {
  id: string
  engine: 'cloak' | 'playwright' | 'mock'
  startedAt: number
  metadata: Record<string, any>
}
```

### Constraints

- Must respect CIC's global timeout envelope
- Must emit structured logs:
  - `browser.open.start`
  - `browser.open.success`
  - `browser.open.error`
- Must produce deterministic error codes:
  - `BROWSER_TIMEOUT`
  - `BROWSER_NAV_FAIL`
  - `BROWSER_JS_FAIL`

### Adapter Requirements

- No global state
- No nondeterministic retries
- Must integrate with CIC event bus
- Must support screenshot capture for redesign pipeline

---

# 3. Sweeper Vertical Prioritization Map

## 3.1 Tier 1 — High JS, High Revenue Impact (P0)

These verticals **require** CloakBrowser for reliable ingestion.

| Vertical | Stack Patterns | Bot Detection | Priority |
|---------|----------------|---------------|----------|
| Dental | Next.js, Wix Studio, Cloudflare | High | P0 |
| MedSpa | React SPAs, Fluid Engine | High | P0 |
| Medical | Custom SPAs, WAF | High | P0 |
| Agencies | Framer/Webflow/Next.js | Very High | P0 |

**Rationale:**
These verticals produce the highest-value redesigns and have the highest ingestion failure rate today.

## 3.2 Tier 2 — Medium JS, Medium Revenue Impact (P1)

| Vertical | Stack Patterns | Bot Detection | Priority |
|---------|----------------|---------------|----------|
| Real Estate | IDX/MLS embeds | Medium | P1 |
| Local Retail | Shopify + JS | Medium | P1 |

## 3.3 Tier 3 — Low JS, Low Revenue Impact (P2)

| Vertical | Stack Patterns | Bot Detection | Priority |
|---------|----------------|---------------|----------|
| Restaurants | WordPress, GoDaddy | Low | P2 |
| Trades | WordPress, Wix Classic | Low | P2 |

**Rationale:**
HTML-first path already covers 80–90% of these.

---

# 4. Before/After Ingestion Telemetry Projections

## 4.1 Baseline (Current)

| Vertical | Success Rate | Notes |
|---------|--------------|-------|
| Dental | 55–65% | Cloudflare, SPAs |
| MedSpa | 50–60% | Heavy JS |
| Agencies | 40–50% | Framer/Webflow |
| Restaurants | 85–90% | Mostly static |
| Trades | 80–90% | Mostly static |

## 4.2 Projected After CloakBrowser

| Vertical | Success Rate | Delta | Notes |
|---------|--------------|--------|-------|
| Dental | **90–95%** | +30–40% | JS hydration + stealth |
| MedSpa | **90–95%** | +35–45% | WAF bypass |
| Agencies | **85–90%** | +35–45% | SPA hydration |
| Restaurants | 90–95% | +5–10% | Minor gains |
| Trades | 90–95% | +5–10% | Minor gains |

## 4.3 Pipeline-Level Impact

- Overall Sweeper ingestion success: **+18–25%**
- DLQ rate reduction: **−40–60%**
- Average redesign throughput: **+22–30%**
- Vertical intelligence completeness: **+35–50%**

---

# 5. Implementation Plan (6–8 hrs)

1. **Env + API validation** — 0.5–1 hr
2. **Adapter implementation** — 1.5–2 hrs
3. **Sweeper fallback integration** — 1–1.5 hrs
4. **Performance + stealth validation** — 1–1.5 hrs
5. **Observability + CIC integration** — 1 hr

---

# 6. Versioning

- **v1.0.0** — Initial consolidated spec
- Next bump:
  - **Patch** for implementation notes
  - **Minor** for new browser engines
  - **Major** for ingestion architecture changes
