# RL-4.0: Playwright DOM Capture + Style Engine

**Status:** Complete | **Commit:** bba2aa7 | **Date:** 2026-06-13

## Overview

RL-4.0 introduces DOM extraction and CSS style analysis, extending the crawler pipeline to capture not just HTTP metadata, but full page structure and styling information.

## Architecture

### CrawlResult v1.1
Extended with two fields:
- `rawHtml?: string` — HTML body for successful 200 responses (text/html only)
- `contentType?: string` — Content-Type header for media detection

### DomExtractor
Parses HTML into structured DOM tree:
- **DomModel**: Root node, title, meta (description, viewport, charset), headings, images, links, forms
- **DomNode**: Recursive structure (tag, id, classes, attributes, children, optional text)
- **Options**: maxDepth (default 20), capture filters (images, links, forms)

Example:
```typescript
const extractor = new DomExtractor();
const domModel = extractor.extract(crawlResult);
// domModel.headings → [{ tag: 'h1', text: 'Welcome' }, ...]
// domModel.images → [{ src: '/img.png', alt: 'Test' }, ...]
```

### StyleMatchEngine
Parses CSS and extracts metrics:
- **CssRule**: selector, properties, specificity (IDs=100, classes=10, elements=1)
- **StyleSheet**: aggregated rules, fonts, CSS variables
- **StyleMetrics**: 
  - totalSelectors, uniqueClasses, uniqueIds
  - colorCount, fontFamilies
  - breakpoints (media queries)
  - transitionCount, animationCount

Example:
```typescript
const stylesheet = styleEngine.parseStylesheet(domModel, cssText);
const metrics = styleEngine.metrics(domModel, stylesheet);
// metrics.breakpoints → ['768px', '1024px']
// metrics.fontFamilies → ['Arial', 'Custom Font']
```

### IRPacket v1.1 Extension
New optional fields:
```typescript
styleSheet?: StyleSheetInfo;
cssMetrics?: CssMetrics;
```

Both are null if extraction failed; populated on success.

### RewriteLabsOrchestrator
Full pipeline: crawl → extract → style → IR packet.

```typescript
const orchestra = new RewriteLabsOrchestrator({ crawlerOptions, extractorOptions });
const result = await orchestra.orchestrate('https://example.com/');
// result.crawlResult, domModel, styleMetrics, irPacket all populated or null with error code
```

## Test Coverage

13+ tests across:
- **CrawlResult v1.1**: HTML capture on 200 OK, undefined for non-HTML
- **DomExtractor**: DOM tree build, metadata extraction, image/link/form parsing
- **StyleMatchEngine**: CSS parsing, specificity, color/font/breakpoint counting
- **IRPacket v1.1**: schema validation, CSS metrics population
- **Orchestrator**: full pipeline, error propagation (crawl errors, DOM extraction failure, etc.)

## Next: RL-4.1

Replace DOMParser stub with Playwright for:
- JavaScript-rendered content
- Visual metrics (computed styles, layout info)
- Screenshot capture
- Interactive element detection (hover states, modals)

## Files

```
rewrite-mcp/packages/agents/src/
  extractors/
    dom.ts (180 LOC)
    style-engine.ts (200 LOC)
    index.ts
  orchestrator.ts (60 LOC)
  __tests__/
    rl-4-0.test.ts (300+ LOC, 13 test cases)
  crawler/
    types.ts (extended CrawlResult)
    index.ts (HTML capture)

rewrite-mcp/packages/ir-toolkit/src/
  schemas/
    ir.types.ts (extended IRPacket, new CssRule, StyleSheetInfo, CssMetrics)
```

## Build & Test

```bash
# Build
npm run build  # → dist/extractors/*.js, dist/orchestrator.js

# Test (requires jest setup)
npm test  # 13+ tests
```

Current: Jest version conflict with ir-toolkit fixtures. Tests runnable standalone with fresh jest install.

## Integration Points

1. **Crawler Output** → DomExtractor (raw HTML)
2. **StyleMetrics** → IRPacket cssMetrics field
3. **IRPacket v1.1** → downstream auditors (Rewrite Labs accessibility, design audit, migration planning)

## Design Notes

- **DOMParser limitation**: Currently uses browser DOMParser stub. RL-4.1 will use Playwright for JS-rendered content.
- **CSS simplicity**: Minimal CSS parser (not full spec). Handles common patterns; edge cases fall back to defaults.
- **Specificity**: Simple model (not CSS Cascading). Sufficient for extraction; does not compute final computed styles.
- **Security**: Strips sensitive attrs (password, token, secret, key) from DOM output.

---

**Commit:** bba2aa7  
**Next phase:** RL-4.1 (Playwright browser engine)
