# Phase 27.3 — Service Level Objectives (SLO)

## Overview

Phase 27.3 establishes formal SLOs for the CIC Runtime adapter execution layer. These targets drive operational decisions, error budgeting, and on-call escalation policies.

---

## SLO Targets

### 1. Availability SLI (Monthly)

**Target:** 99.5% uptime  
**Monthly Downtime Budget:** 21.6 minutes  
**Metric:** `sum(rate(cic_adapter_calls_total{status="success"}[5m])) / sum(rate(cic_adapter_calls_total[5m]))`

**Rationale:**  
- 99.5% means 1 expected failure per 200 calls
- Adapters are mission-critical; any deviation requires alert
- Monthly reset boundary aligns with billing cycle

**Calculation Example:**
```
Success Rate = Successful Calls / Total Calls
99.5% = 9,950 successes / 10,000 total calls
0.5% = 50 failures allowed per month
```

**Alert Trigger:**
- If hourly availability < 99.5% for 10m → WARNING
- If sustained < 99% → CRITICAL

---

### 2. Latency SLI (Monthly)

**Target:** P95 latency < 500ms  
**Monthly Budget:** 99.5% of calls must complete in <500ms  
**Metric:** `histogram_quantile(0.95, cic_adapter_duration_ms)`

**Rationale:**
- 500ms allows time for user feedback + downstream processing
- P95 captures tail latency without outlier bias
- Applies to all adapters equally

**Percentile Breakdown:**
- **P50:** < 100ms (median fast path)
- **P95:** < 500ms (tail acceptable)
- **P99:** < 1000ms (extreme outliers)

**Alert Trigger:**
- If P95 > 500ms for 10m → WARNING
- If P95 > 1000ms for 2m → CRITICAL

---

## Error Budget Tracking

### Monthly Budget Allocation

| Component | Budget | Calculation |
|-----------|--------|-------------|
| **Availability** | 21.6 min | (1 - 0.995) × 30 × 24 × 60 |
| **Latency** | (included in Availability) | Latency failures count as errors |
| **Total** | **21.6 min** | Shared across both SLIs |

### Budget Debit Rules

1. **Availability Violation:** Each minute below 99.5% success rate = 1 min debited
2. **Latency Violation:** Each minute P95 > 500ms = 0.5 min debited (reduced weight)
3. **Cascading Failures:** Puppeteer crashes = 5 min debited (high impact)

### Budget Thresholds

| Remaining | Action |
|-----------|--------|
| **> 10 min** | Normal operations; feature deployments allowed |
| **5-10 min** | Caution mode; prioritize reliability fixes; code reviews stricter |
| **< 5 min** | **FREEZE** all non-critical deployments; rollback any recent changes; on-call escalation |

---

## Monthly Reset & Reconciliation

**Reset Date:** 1st of each month at 00:00 UTC

### Process

1. **T+00:00:** Prometheus stores final metrics for previous month
2. **T+06:00:** Automated dashboard shows month-end status
3. **T+24:00:** Incident review if SLO missed (post-mortem if < 99.5%)
4. **T+72:00:** Budget allocation approved for next month

### Non-Compliant Months

If month ends with < 99.5% availability:

1. **Mandatory Post-Mortem:** Root cause analysis within 48h
2. **Blameless Review:** Focus on systemic improvements
3. **Action Items:** Owners assigned, tracked in issue tracker
4. **Stakeholder Notification:** Alert PagerDuty + ops channel

---

## On-Call Escalation

### Escalation Policy

**Tier 1 (Warnings):**
- Alert fires for > 10m
- On-call receives Slack notification
- Incident severity: Low (yellow)

**Tier 2 (Criticals):**
- Alert fires for > 2m
- PagerDuty page sent immediately
- Incident severity: High (red)
- On-call must acknowledge within 5m

**Tier 3 (Cascading):**
- Multiple adapters failing OR Puppeteer crashed
- Engineering lead + on-call engaged
- Incident severity: Critical
- Escalation to platform team if unresolved in 15m

### On-Call Rotation

- **Weekly** rotation (Sunday 00:00 UTC)
- **24h** shift (covers all timezones)
- Escalation chain: On-Call → Lead → Platform Team

---

## Monitoring & Dashboards

### Real-Time Dashboards

1. **Adapter Health** (`adapter-health.json`)
   - Success rate gauge
   - Latency trends (p50, p95)
   - Error rate by adapter

2. **Adapter Details** (`adapter-details.json`)
   - Call volume (5m rate)
   - Latency distribution (p50/p95/p99)
   - Error breakdown by code

3. **Runtime SLI/SLO** (`runtime-sli.json`)
   - Availability SLI (99.5% target)
   - Latency SLI (< 500ms p95)
   - Error budget remaining
   - Crash incidents (30d)

### Alert Rules

See `prometheus/alert-rules.yml` for full rule definitions.

**Key Alerts:**
- `AdapterLatencySpike` (p95 > 1s for 2m)
- `AdapterErrorSpike` (error rate > 10% for 2m)
- `PuppeteerCrashed` (any crash markers detected)
- `AvailabilitySLOAtRisk` (hourly < 99.5% for 10m)
- `LatencySLOAtRisk` (p95 > 500ms for 10m)

---

## SLO Review Cadence

| Interval | Review | Owner |
|----------|--------|-------|
| **Daily** | Dashboard health; alert trends | On-Call |
| **Weekly** | SLO trend analysis; budget tracking | Lead Engineer |
| **Monthly** | SLO reconciliation; post-mortem (if missed) | Engineering + Ops |
| **Quarterly** | SLO threshold reassessment | Platform Team |

---

## Future Improvements

### Phase 28 SLO Enhancements

1. **Predictive Alerting:** ML model to predict SLO miss before it occurs
2. **Adaptive Targets:** Adjust SLO targets per adapter (e.g., Puppeteer more lenient)
3. **Cost-Based SLO:** Factor Anthropic API spend into error budget
4. **User-Facing SLA:** Public SLA derived from SLO (SLA = SLO - margin of safety)

---

## Links & References

- Metrics: `src/metrics/MetricsExporter.ts`
- Server: `src/server/MetricsServer.ts`
- Dashboards: `dashboards/`
- Alert Rules: `prometheus/alert-rules.yml`
- Prometheus Config: `prometheus.yml` (scrape at 5s interval, retention 7d)

---

**Last Updated:** 2026-06-20  
**Status:** LOCKED (Phase 27.3 Ready for Merge)
