# Multi-URL Sampling Algorithm v2.0.0

**Status:** Locked  
**Phase:** 2 (Ingestion Hardening)  
**Purpose:** Sample multiple URLs and select the richest DOM for Sweeper

---

## 0. Overview

Many SMB sites have multiple viable entrypoints. Phase 2 requires sampling multiple URLs and selecting the best DOM for Sweeper ingestion.

---

## 1. Candidate URLs

In order:
1. `/`
2. `/home`
3. `/services`

Fallback to `/` if all fail.

---

## 2. Sampling Algorithm

### 2.1 Load each candidate URL

Use:
- WarmPool session (checkout/checkin)
- RetryPolicy (exponential backoff, max 2 retries)
- SPA heuristics (hydration detection + screenshot timing)

### 2.2 Extract DOM metadata

For each DOM:
- Node count
- Text density (words / visible area)
- Image count
- Link count
- Hydration score (0–100)
- Error count (JS errors during load)

---

## 3. DOM Completeness Score (0–100)

| Metric | Weight |
|--------|--------|
| Node count | 25 |
| Text density | 25 |
| Hydration score | 25 |
| Image count | 15 |
| Link count | 10 |

**Node count normalization:**
- Min: 50, Max: 5000
- Score = (count - 50) / (5000 - 50) × 100, clamped to [0, 100]

**Text density normalization:**
- Min: 0.05, Max: 0.5 (words per pixel)
- Score = density / 0.5 × 100, clamped to [0, 100]

**Threshold:**
- Score ≥ 70 → viable
- Score < 40 → discard

---

## 4. Selection Logic

```ts
const candidates = await Promise.all([
  sample('/'),
  sample('/home'),
  sample('/services')
])

const viable = candidates
  .filter(c => c.score >= 40)
  .sort((a, b) => b.score - a.score)

const best = viable.length > 0 ? viable[0] : candidates[0]
return best.dom
```

Fallback: If all scores < 40, use `/` despite low score.

---

## 5. Logging

Emit:
- `sampling.start` — {url}
- `sampling.candidate` — {url, nodeCount, textDensity, hydrationScore, errorCount}
- `sampling.score` — {url, completenessScore}
- `sampling.selected` — {url, score}

---

## 6. Integration Points

- **WarmPoolManager:** Uses warm pool for each load, checks back in post-sample
- **RetryPolicy:** Retries transient failures (TIMEOUT, NAV_FAIL)
- **SpaHydrationDetector:** Uses hydration score in completeness calculation
- **CloakBrowserAdapter:** Calls DomSampler before Sweeper ingestion
- **Dashboard:** Sampling distribution + selected URL tracking

---

## 7. Performance Targets

- Total sampling time: < 5s for all three URLs
- Per-URL load time: < 2s (including retries)
- Memory: < 50MB per sampled DOM

---

## 8. Success Criteria

- Best URL selection accuracy: ≥95% (human audit)
- Completeness score correlation with Sweeper success: ≥0.85
- False discards (score < 40 but viable): < 5%
