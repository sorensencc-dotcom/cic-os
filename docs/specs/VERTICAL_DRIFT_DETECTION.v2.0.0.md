# Vertical Drift Detection Algorithm v2.0.0

**Status:** Locked  
**Phase:** 2 (Ingestion Hardening)  
**Purpose:** Detect when ingestion reliability drops, indicating regressions or WAF changes

---

## 0. Overview

Phase 2 requires detecting when ingestion success rate for a vertical drops significantly, indicating regressions, WAF changes, or template shifts.

Self-monitoring enables early incident detection and automated alerting.

---

## 1. Inputs

- Success rate per vertical (rolling 24h window)
- Historical baseline (rolling 7d average)
- Error distribution (by class: TIMEOUT, NAV_FAIL, JS_FAIL, WAF_BLOCK, etc.)
- Retry distribution (attempts 1, 2, permanent failure)
- Hydration scores (per vertical)

---

## 2. Drift Formula

### 2.1 Drift %

```
drift = (baselineSuccess - currentSuccess) / baselineSuccess
```

**Example:**
- Baseline success: 92%
- Current success: 75%
- Drift: (0.92 - 0.75) / 0.92 = 0.1847 = **18.47%**

### 2.2 Threshold

- Drift ≥ **10%** → warning alert
- Drift ≥ **20%** → critical alert
- Drift ≤ **-5%** → improvement (no alert)

---

## 3. Drift Classification

### 3.1 Hydration Drift
- Hydration score drop ≥ 15 points
- Example: 75 → 58

### 3.2 Transient Error Drift
- TIMEOUT spike: (currentTimeout - baselineTimeout) / baselineTimeout ≥ 20%
- NAV_FAIL spike: same threshold
- Combined transient errors ≥ 25%

### 3.3 WAF Drift
- WAF_BLOCK rate > 0.5%
- Indicates rate limit or signature-based blocks

### 3.4 Structural Drift
- Node count delta ≥ 25%
- Text density delta ≥ 20%
- Indicates template or framework change

---

## 4. Drift Event Schema

```json
{
  "event": "vertical.drift",
  "vertical": "dental",
  "drift_percent": 0.1847,
  "baseline_success": 0.92,
  "current_success": 0.75,
  "classification": "hydration",
  "details": {
    "hydration_baseline": 78,
    "hydration_current": 61,
    "delta": -17
  },
  "severity": "critical",
  "timestamp": 1718840000,
  "recommendation": "Check for React version changes or SPA framework updates"
}
```

---

## 5. Severity Mapping

| Drift % | Classification | Severity |
|---------|----------------|----------|
| ≥ 20% | any | critical |
| 10–20% | hydration or WAF | warning |
| 10–20% | transient | info |
| < 10% | any | none |

---

## 6. Dashboard Integration

Drift panel displays:
- Drift sparkline per vertical (24h)
- Current drift % vs. baseline
- Classification badge (hydration, transient, WAF, structural)
- Error distribution delta histogram
- Hydration score delta
- Recommended action (e.g., "Investigate SPA framework changes")

---

## 7. Alerting

Emit to observability pipeline:
- Critical drift: page alert to team
- Warning drift: log entry, dashboard highlight
- Improvement: log entry (no alert)

---

## 8. Integration Points

- **WarmPoolManager:** Tracks pool health per vertical
- **RetryPolicy:** Transient error metrics feed drift calculation
- **SpaHydrationDetector:** Hydration scores per vertical
- **DomSampler:** DOM structural metrics per vertical
- **Dashboard:** Real-time drift panel
- **Alerting:** Page/Slack integration for critical drifts

---

## 9. Success Criteria

- Drift detection latency: ≤ 5min from event occurrence
- False positive rate: < 2% (drift alerts that resolve without action)
- Detection accuracy: ≥90% for actual regressions (human audit)
- Actionability: Recommended actions are followed up within 4h for 80% of alerts
