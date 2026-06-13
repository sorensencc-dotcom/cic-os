# Phase 30 Telemetry Dashboard Specification
## Grafana Dashboards for Vertical Outreach Campaigns

**Phase:** 30  
**Document:** Telemetry Dashboard Specification  
**Timeline:** 2026-06-29 through 2026-07-13  
**Dashboard Owner:** CIC Observability Team  
**Generated:** 2026-06-13

---

## Overview

Phase 30 telemetry dashboards provide real-time visibility into outreach campaign performance across 5 verticals. Six dashboards track:
1. **Phase 30 Overview** (unified metrics)
2. **Dental Campaign** (vertical-specific)
3. **Legal Campaign** (vertical-specific)
4. **Fitness Campaign** (vertical-specific)
5. **Landscaping Campaign** (vertical-specific)
6. **Salon/Spa Campaign** (vertical-specific)

**Dashboard URLs:**
- Overview: `grafana.internal/d/phase-30-overview`
- Dental: `grafana.internal/d/phase-30-dental`
- Legal: `grafana.internal/d/phase-30-legal`
- Fitness: `grafana.internal/d/phase-30-fitness`
- Landscaping: `grafana.internal/d/phase-30-landscaping`
- Salon/Spa: `grafana.internal/d/phase-30-salon-spa`

---

## Dashboard 1: Phase 30 Overview

### Purpose
Unified view of all Phase 30 metrics across 5 verticals. High-level health check and campaign summary.

### Layout (8 rows × 2 columns)

#### Row 1: Campaign Status & KPIs

**Panel 1.1: Campaign Status (Text/Stat)**
- **Metric:** Deployment status
- **Query:**
  ```promql
  phase30_deployment_status{phase="30"}
  ```
- **Thresholds:**
  - 0 = OFFLINE
  - 1 = STAGING
  - 2 = LIVE (10%)
  - 3 = LIVE (50%)
  - 4 = LIVE (100%)
- **Threshold Color:** Red (0–1), Yellow (2–3), Green (4)

**Panel 1.2: Total Leads (Gauge)**
- **Metric:** Total leads ingested into CIC (all verticals, cumulative)
- **Query:**
  ```promql
  increase(phase30_leads_ingested_total[24h])
  ```
- **Unit:** Short
- **Min:** 0, Max: 1000
- **Threshold:** Green (0–500), Yellow (500–800), Red (800+)

#### Row 2: Email Performance (All Verticals)

**Panel 2.1: Email Delivery Rate by Vertical (Bar Chart)**
- **Metrics:** Email delivery rate per vertical (last 24h)
- **Queries:**
  ```promql
  (phase30_email_delivered_total / phase30_email_sent_total) * 100
  ```
- **Unit:** Percent (0–100)
- **Legend:** Dental, Legal, Fitness, Landscaping, Salon/Spa
- **Threshold:** Green ≥98%, Red <95%

**Panel 2.2: Email Open Rate by Vertical (Line Chart)**
- **Metrics:** Email open rate % by vertical (over 7 days, rolling)
- **Queries:**
  ```promql
  (phase30_email_opened_total / phase30_email_delivered_total) * 100
  ```
- **Unit:** Percent
- **Legend:** Dental (35–45%), Legal (32–42%), Fitness (38–48%), Landscaping (31–41%), Salon/Spa (35–45%)
- **Shaded Region:** Expected range per vertical

#### Row 3: Landing Page Performance

**Panel 3.1: Landing Page Traffic by Vertical (Stacked Bar)**
- **Metrics:** Landing page visits per vertical (per day, last 7 days)
- **Queries:**
  ```promql
  sum(rate(phase30_landing_page_visits_total{vertical=~"dental|legal|fitness|landscaping|salon_spa"}[1d])) by (vertical)
  ```
- **Unit:** Short (count)
- **Legend:** Dental, Legal, Fitness, Landscaping, Salon/Spa

**Panel 3.2: Conversion Rate by Vertical (Gauge)**
- **Metrics:** Conversion rate % per vertical (last 24h)
- **Queries:**
  ```promql
  (phase30_form_submissions_total / phase30_landing_page_visits_total) * 100
  ```
- **Unit:** Percent
- **Gauge per vertical:** Dial gauges, 0–25% range
- **Thresholds per vertical:** Green (target + 5%), Red (target - 50%)

#### Row 4: CIC Lead Ingestion

**Panel 4.1: Lead Ingestion Rate (Graph)**
- **Metric:** Leads ingested into CIC per minute (last 24h)
- **Queries:**
  ```promql
  rate(phase30_leads_ingested_total[1m])
  ```
- **Unit:** Ops/sec
- **Threshold:** Green ≥1/min, Red <0.1/min

**Panel 4.2: Lead Ingestion Latency (Heatmap)**
- **Metric:** Time from form submission to CIC ingestion (histogram buckets)
- **Queries:**
  ```promql
  histogram_quantile(0.95, phase30_lead_ingestion_duration_seconds)
  ```
- **Unit:** Seconds
- **Threshold:** Green <5s, Red >30s

#### Row 5: Email Events (Detailed)

**Panel 5.1: Email Sent & Delivered (Time Series)**
- **Metrics:** Emails sent, delivered, bounced (last 7 days)
- **Queries:**
  ```promql
  sum(rate(phase30_email_sent_total[1d])) by (status)
  sum(rate(phase30_email_delivered_total[1d])) by (status)
  sum(rate(phase30_email_bounced_total[1d])) by (status)
  ```
- **Unit:** Events/day
- **Legend:** Sent, Delivered, Bounced
- **Stacking:** Normal

**Panel 5.2: Unsubscribe Rate (Stat)**
- **Metric:** Unsubscribe rate % (all verticals, last 7d)
- **Queries:**
  ```promql
  (phase30_email_unsubscribed_total / phase30_email_delivered_total) * 100
  ```
- **Unit:** Percent
- **Threshold:** Green <1%, Yellow 1–2%, Red >2%

#### Row 6: Form Submissions

**Panel 6.1: Form Submissions by Vertical (Pie)**
- **Metrics:** Form submissions per vertical (last 24h)
- **Queries:**
  ```promql
  phase30_form_submissions_total
  ```
- **Unit:** Short
- **Legend:** Show labels, values, percentages

**Panel 6.2: Form Field Error Rate (Graph)**
- **Metrics:** Form validation errors per field (last 7 days)
- **Queries:**
  ```promql
  sum(rate(phase30_form_validation_errors_total{field=~".*"}[1d])) by (field)
  ```
- **Unit:** Errors/day
- **Threshold:** Green <1 error/day, Red >10 errors/day

#### Row 7: System Health

**Panel 7.1: Landing Page Response Time (Heatmap)**
- **Metric:** Landing page response time distribution (last 24h)
- **Queries:**
  ```promql
  histogram_quantile(0.95, rate(phase30_landing_page_duration_seconds_bucket[5m]))
  ```
- **Unit:** Seconds (0–5s range)
- **Buckets:** <1s, 1–2s, 2–3s, 3–5s, 5s+
- **Threshold:** Green <3s p95, Red >5s p95

**Panel 7.2: Email Service Error Rate (Gauge)**
- **Metric:** Email service API error rate % (last 24h)
- **Queries:**
  ```promql
  (phase30_email_api_errors_total / phase30_email_api_calls_total) * 100
  ```
- **Unit:** Percent
- **Threshold:** Green <1%, Red >5%

#### Row 8: Alerts & Anomalies

**Panel 8.1: Active Alerts (Table)**
- **Query:**
  ```promql
  ALERTS{job="phase30"}
  ```
- **Columns:** Alert Name, Severity, State, Duration
- **Color Coding:** Critical (Red), Warning (Yellow), Resolved (Green)

**Panel 8.2: Anomaly Detection (Status)**
- **Metric:** Conversion rate anomaly detected?
- **Queries:**
  ```promql
  phase30_conversion_rate_anomaly{severity="critical"}
  ```
- **Threshold:** Green (no anomalies), Red (anomalies detected)

---

## Dashboard 2–6: Vertical Dashboards (Dental, Legal, Fitness, Landscaping, Salon/Spa)

### Purpose (per vertical)
Deep-dive performance dashboard for a single vertical with vertical-specific KPIs.

### Template Variables (for each dashboard)
- `vertical`: Selected vertical (e.g., "dental", "legal")
- `date_range`: Last 7 days (default)

### Layout (6 rows × 2 columns)

#### Row 1: Vertical Summary & Target

**Panel 1.1: Vertical Name & Target Conversion (Stat)**
- **Label:** e.g., "Dental Vertical"
- **Metric:** Target conversion rate for vertical
- **Value:** e.g., "≥ 5%"
- **Color:** Green if on target, Red if below

**Panel 1.2: Leads Generated This Week (Gauge)**
- **Metric:** Form submissions (week-to-date)
- **Queries:**
  ```promql
  increase(phase30_form_submissions_total{vertical="$vertical"}[7d])
  ```
- **Unit:** Short
- **Min:** 0, Max: 200
- **Threshold:** Green (target), Red (50% of target)

#### Row 2: Email Performance (Vertical-Specific)

**Panel 2.1: Email Sequence Performance (Table)**
- **Columns:** Email #, Subject, Sent, Delivered, Opened, Clicked, % Open, % Click
- **Rows:** 5 emails (Email 1–5 of sequence)
- **Queries (per row):**
  ```promql
  sum(phase30_email_sent_total{vertical="$vertical", sequence_step=N})
  sum(phase30_email_delivered_total{vertical="$vertical", sequence_step=N})
  sum(phase30_email_opened_total{vertical="$vertical", sequence_step=N})
  sum(phase30_email_clicked_total{vertical="$vertical", sequence_step=N})
  ```
- **Format:** Numbers, no decimals

**Panel 2.2: Email Open Rate Trend (Line Chart)**
- **Metric:** Open rate % over 7 days, per email step
- **Queries:**
  ```promql
  (phase30_email_opened_total{vertical="$vertical", sequence_step=~"1|2|3|4|5"} / 
   phase30_email_delivered_total{vertical="$vertical", sequence_step=~"1|2|3|4|5"}) * 100
  ```
- **Unit:** Percent
- **Legend:** Email 1, Email 2, Email 3, Email 4, Email 5
- **Expected range:** [Vertical-specific benchmark]

#### Row 3: Landing Page Conversion Funnel

**Panel 3.1: Conversion Funnel (Funnel Chart)**
- **Stages (top to bottom):**
  1. Landing Page Visits (100%)
  2. Scroll to Form (e.g., 70%)
  3. Form Interactions (e.g., 40%)
  4. Form Submissions (e.g., 5%)
- **Queries:**
  ```promql
  sum(phase30_landing_page_visits_total{vertical="$vertical"})
  sum(phase30_landing_page_scroll_events_total{vertical="$vertical", scroll_pct="50"})
  sum(phase30_landing_page_form_focuses_total{vertical="$vertical"})
  sum(phase30_form_submissions_total{vertical="$vertical"})
  ```
- **Threshold Color:** Green (above baseline), Red (below baseline)

**Panel 3.2: Form Field Drop-off (Bar Chart)**
- **Metric:** Form field error rate (which field causes most abandonment?)
- **Queries:**
  ```promql
  sum(phase30_form_field_errors_total{vertical="$vertical"}) by (field)
  ```
- **Unit:** Errors (count)
- **Legend:** Field names (name, email, phone, message, etc.)
- **Sort:** Descending

#### Row 4: Vertical-Specific Metrics

**[Dental] Panel 4.1: Booking Widget Performance (Stat)**
- **Metric:** Booking widget submissions (last 24h)
- **Queries:**
  ```promql
  sum(phase30_booking_widget_submissions_total{vertical="dental"})
  ```
- **Unit:** Short

**[Legal] Panel 4.1: Consultation Requests (Stat)**
- **Metric:** Consultation form submissions (last 24h)
- **Queries:**
  ```promql
  sum(phase30_consultation_requests_total{vertical="legal"})
  ```
- **Unit:** Short

**[Fitness] Panel 4.1: Class Registrations (Stat)**
- **Metric:** Class registration via landing page (last 24h)
- **Queries:**
  ```promql
  sum(phase30_class_registrations_total{vertical="fitness"})
  ```
- **Unit:** Short

**[Landscaping] Panel 4.1: Quote Requests (Stat)**
- **Metric:** Quote form submissions (last 24h)
- **Queries:**
  ```promql
  sum(phase30_quote_requests_total{vertical="landscaping"})
  ```
- **Unit:** Short

**[Salon/Spa] Panel 4.1: Appointment Bookings (Stat)**
- **Metric:** Appointment bookings via widget (last 24h)
- **Queries:**
  ```promql
  sum(phase30_appointment_bookings_total{vertical="salon_spa"})
  ```
- **Unit:** Short

#### Row 5: Traffic & Device Breakdown

**Panel 5.1: Landing Page Traffic by Device (Pie)**
- **Metrics:** Visits by device type (last 24h)
- **Queries:**
  ```promql
  sum(phase30_landing_page_visits_total{vertical="$vertical"}) by (device)
  ```
- **Slices:** Desktop, Mobile, Tablet
- **Legend:** Show values and percentages

**Panel 5.2: Conversion Rate by Device (Stat)**
- **Metrics:** Conversion rate per device (last 24h)
- **Queries:**
  ```promql
  (sum(phase30_form_submissions_total{vertical="$vertical", device="mobile"}) / 
   sum(phase30_landing_page_visits_total{vertical="$vertical", device="mobile"})) * 100
  ```
- **Unit:** Percent
- **Display:** 3 stats (Desktop, Mobile, Tablet)
- **Threshold:** Green (mobile ≥80% of desktop), Red (mobile <50% of desktop)

#### Row 6: Alerts & Recommendations

**Panel 6.1: Vertical-Specific Alerts (Table)**
- **Query:**
  ```promql
  ALERTS{vertical="$vertical"}
  ```
- **Columns:** Alert, Severity, Triggered, Duration
- **Critical Alerts:** Conversion rate drop >50%, Email delivery <95%, Form errors >50/day

**Panel 6.2: Optimization Recommendations (Text)**
- **Static Text Box (populated manually):**
  ```
  Based on this week's performance:
  - Recommendation 1: [Based on highest drop-off field]
  - Recommendation 2: [Based on lowest CTR email]
  - Recommendation 3: [Based on device conversion diff]
  
  Next A/B test candidates: [Subject line, CTA button color, form length]
  ```

---

## Alerts & Thresholds

### Critical Alerts

**ALERT: EmailDeliveryRateLow**
- **Condition:** Email delivery rate < 90% for 30+ minutes
- **Action:** Page on-call engineer
- **Query:**
  ```promql
  (phase30_email_delivered_total / phase30_email_sent_total) < 0.90
  ```

**ALERT: LandingPageAvailabilityLow**
- **Condition:** Landing page HTTP 5xx error rate > 5% for 15+ minutes
- **Action:** Page on-call engineer
- **Query:**
  ```promql
  (phase30_landing_page_errors_5xx / phase30_landing_page_requests) > 0.05
  ```

**ALERT: ConversionRateAnomaly**
- **Condition:** Conversion rate drops >50% vs. rolling 7-day average
- **Action:** Alert engineering + product for investigation
- **Query:**
  ```promql
  phase30_conversion_rate < (avg_over_time(phase30_conversion_rate[7d]) * 0.5)
  ```

**ALERT: LeadIngestionFailure**
- **Condition:** Lead ingestion errors > 10% for 15+ minutes
- **Action:** Page CIC team
- **Query:**
  ```promql
  (phase30_lead_ingestion_errors / phase30_lead_ingestion_attempts) > 0.10
  ```

### Warning Alerts

**ALERT: EmailOpenRateLow**
- **Condition:** Open rate < vertical baseline - 10% for 1+ hours
- **Action:** Investigation log (no page)

**ALERT: FormValidationErrors**
- **Condition:** Form validation errors > 50/hour
- **Action:** Slack notification to engineering

---

## Data Sources & Retention

### Metrics (Prometheus)
- **Data Source:** Prometheus (prometheus.internal:9090)
- **Scrape Interval:** 15 seconds
- **Retention:** 30 days
- **Labels:** `vertical`, `sequence_step`, `device`, `event_type`, `status`

### Logs (Loki)
- **Data Source:** Loki (loki.internal:3100)
- **Log Levels:** info, warn, error
- **Retention:** 30 days
- **Labels:** `job=phase30`, `vertical`, `event_type`

### Query Examples

**Email Send Events (Loki):**
```
{job="phase30", event_type="email_sent"} | json | vertical=~"dental|legal|fitness|landscaping|salon_spa"
```

**Form Submission Events (Prometheus):**
```
phase30_form_submissions_total{vertical=~"dental|legal|fitness|landscaping|salon_spa"}
```

---

## Dashboard Access & Permissions

### Access Levels
- **View:** All stakeholders (product, sales, marketing)
- **Edit:** CIC observability team + phase lead
- **Delete:** Phase lead approval required

### User Groups
- `phase-30-viewer`: View-only access
- `phase-30-editor`: Edit dashboards
- `phase-30-admin`: Admin access

---

## Dashboard Refresh Intervals

| Dashboard | Refresh Interval | Auto-Refresh |
|-----------|------------------|--------------|
| Overview | 30 seconds | Yes (default 1 min) |
| Dental | 1 minute | Yes (default 5 min) |
| Legal | 1 minute | Yes (default 5 min) |
| Fitness | 1 minute | Yes (default 5 min) |
| Landscaping | 1 minute | Yes (default 5 min) |
| Salon/Spa | 1 minute | Yes (default 5 min) |

---

## Dashboard Maintenance

### Weekly Review
- Verify all panels loading data
- Check for stale alerts
- Update recommendations based on weekly performance

### Monthly Review (post-launch)
- Archive old dashboard versions
- Document new alerts discovered
- Recommend dashboard improvements

---

## Grafana JSON Export

**Dashboard JSON templates** for all 6 dashboards available at:
```
docs/rewrite-labs/template-expansion-pack/phase-30/grafana-dashboards/
```

**Import via:**
1. Grafana UI → Dashboards → New → Import
2. Paste JSON or upload file
3. Select Prometheus/Loki data sources
4. Save

---

## Contact & Support

| Role | Slack Channel | On-Call |
|------|---------------|---------|
| CIC Observability | #cic-observability | @cic-oncall |
| Phase 30 Lead | #phase-30 | @phase-30-lead |
| Engineering | #engineering | @eng-oncall |

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-13  
**Next Review:** 2026-07-13 (post-launch)

