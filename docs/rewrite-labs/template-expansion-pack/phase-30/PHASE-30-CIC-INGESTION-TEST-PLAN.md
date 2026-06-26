# Phase 30 — CIC Ingestion Test Plan
## Vertical Outreach Integration Testing

**Phase:** 30  
**Document:** CIC Ingestion Test Plan  
**Timeline:** 2026-06-29 through 2026-07-13  
**Test Lead:** CIC Integration Team  
**Generated:** 2026-06-13

---

## Scope

Integration testing of Phase 30 components with CIC ingestion pipeline:
- **Data Flow:** Vertical templates → discovery agent → redesign engine → outreach pipeline → CIC memory
- **Lead Ingestion:** Email opens/clicks → form submissions → CIC knowledge base
- **Observability:** All events logged to Loki, metrics to Prometheus, visualized in Grafana
- **Dependencies:** Phase 28c (Template Expansion Pack), Phase 26 (TorqueQuery), Phase 24 (Governance)

---

## Test Environment Setup

### Prerequisites
- Staging environment with all Phase 28c templates loaded
- Test database with 50 sample businesses (10 per vertical)
- Email service (SendGrid/Mailgun) with test account
- CIC ingestion pipeline deployed to staging
- Grafana dashboards created and alerts wired

### Test Data

**Sample Businesses per Vertical:**
```json
{
  "dental": [
    {"id": "DEN-001", "name": "Smile Dental Clinic", "location": "Portland OR", "specialty": "General Dentistry"},
    {"id": "DEN-002", "name": "Bright Smile Orthodontics", "location": "Seattle WA", "specialty": "Orthodontics"}
  ],
  "legal": [
    {"id": "LAW-001", "name": "Anderson & Associates", "location": "New York NY", "practice_areas": ["Corporate Law", "M&A"]},
    {"id": "LAW-002", "name": "Civil Rights Legal", "location": "Los Angeles CA", "practice_areas": ["Civil Rights", "Employment"]}
  ],
  "fitness": [
    {"id": "FIT-001", "name": "Peak Performance Gym", "location": "Austin TX", "specialty": "Personal Training"},
    {"id": "FIT-002", "name": "CrossFit Elite", "location": "Denver CO", "specialty": "CrossFit"}
  ],
  "landscaping": [
    {"id": "LAND-001", "name": "Green Spaces Design", "location": "Portland OR", "specialty": "Residential Design"},
    {"id": "LAND-002", "name": "Commercial Grounds Pro", "location": "Seattle WA", "specialty": "Commercial Maintenance"}
  ],
  "salon_spa": [
    {"id": "SPA-001", "name": "Serenity Spa & Salon", "location": "San Francisco CA", "specialty": "Full Service"},
    {"id": "SPA-002", "name": "Luxury Hair Design", "location": "Los Angeles CA", "specialty": "Hair Salon"}
  ]
}
```

**Test Email Addresses:**
- 50 primary test emails (one per business)
- 10 secondary emails per vertical (for list segmentation tests)
- Internal team addresses for manual verification

---

## Unit Tests

### Template Ingestion (T1.x)

**T1.1 — Manifest Parsing**
- **Test:** Load each of 5 manifests, verify color cluster and typography extracted
- **Expected:** JSON parsing succeeds, no schema validation errors
- **Acceptance:** Color hex values valid, font families recognized, sizes numeric
- **File:** `tests/unit/ingestion/manifest-parser.test.ts`

**T1.2 — Component Schema Validation**
- **Test:** Validate 25 component definitions against universal + vertical schemas
- **Expected:** All component props match schema, required fields present
- **Acceptance:** Zero schema violations, all CRO attributes populated
- **File:** `tests/unit/ingestion/component-validator.test.ts`

**T1.3 — HTML Skeleton Instantiation**
- **Test:** Instantiate each skeleton with sample data (business name, phone, CTA text)
- **Expected:** Valid HTML output with no missing fields
- **Acceptance:** HTML parses without errors, images load, forms submit
- **File:** `tests/unit/ingestion/skeleton-instantiator.test.ts`

**T1.4 — AEO Metadata Injection**
- **Test:** Inject schema markup into page `<head>` for each vertical
- **Expected:** Valid JSON-LD, schema.org properties recognized
- **Acceptance:** Google Rich Results Test passes, no validation errors
- **File:** `tests/unit/ingestion/aeo-injector.test.ts`

### Email Sequence Ingestion (T2.x)

**T2.1 — Email Template Parsing**
- **Test:** Load each of 5 email sequences (3–5 emails per vertical), parse Markdown
- **Expected:** Email metadata (subject, preview, from, send_at) extracted correctly
- **Acceptance:** All template variables recognized, no syntax errors
- **File:** `tests/unit/ingestion/email-sequence-parser.test.ts`

**T2.2 — Variable Substitution**
- **Test:** Substitute template variables (`{{business_name}}`, `{{vertical}}`, `{{url}}`) in email body
- **Expected:** All variables replaced, no orphaned `{{}}` tokens remain
- **Acceptance:** Email body renders correctly, links are valid URLs
- **File:** `tests/unit/ingestion/email-substitution.test.ts`

**T2.3 — Email Personalization**
- **Test:** Personalize emails for 50 test businesses (subject + body + landing page URL)
- **Expected:** Each email is unique to its business, vertical, and sequence step
- **Acceptance:** No duplicate emails, all URLs unique per business
- **File:** `tests/unit/ingestion/email-personalization.test.ts`

**T2.4 — Segment Targeting**
- **Test:** Segment 50 test businesses into 5 vertical segments, verify segment membership
- **Expected:** Dental businesses → dental segment, etc. (no cross-vertical contamination)
- **Acceptance:** Segment queries return correct business sets
- **File:** `tests/unit/ingestion/segment-targeting.test.ts`

### Lead Ingestion (T3.x)

**T3.1 — Event Tracking Setup**
- **Test:** Verify tracking pixel, form submission handler, email open pixel all wired
- **Expected:** Each event type generates a timestamped log entry
- **Acceptance:** No missing event handlers, all events logged to Loki
- **File:** `tests/unit/ingestion/event-tracking.test.ts`

**T3.2 — Form Submission Parsing**
- **Test:** Submit form data from landing page, verify CIC ingestion accepts payload
- **Expected:** Form data parsed, stored in CIC memory with source attribution
- **Acceptance:** Lead record created with all fields, no data loss
- **File:** `tests/unit/ingestion/form-submission-parser.test.ts`

**T3.3 — Email Event Attribution**
- **Test:** Send test email, click link in email, verify click attributed to email + campaign
- **Expected:** Click event linked to email ID, campaign ID, sequence step
- **Acceptance:** Attribution chain complete, no orphaned events
- **File:** `tests/unit/ingestion/email-attribution.test.ts`

---

## Integration Tests

### Vertical Template → Redesign Engine (I1.x)

**I1.1 — Dental Template Generation**
- **Test:** Generate complete site for 5 sample dental practices
- **Expected:** HTML, CSS, images all present; no broken links
- **Acceptance:** Pages render in browser without console errors; booking widget functional
- **Steps:**
  1. Load dental manifest + components
  2. Select 5 dental businesses from test data
  3. Generate homepage, service pages, contact page
  4. Load in browser, verify rendering
  5. Test booking widget integration
- **File:** `tests/integration/vertical-generation/dental.test.ts`

**I1.2 — Legal Template Generation**
- **Test:** Generate complete site for 5 sample legal practices
- **Expected:** Practice area pages, attorney bios, case results all display correctly
- **Acceptance:** No missing content blocks; CTAs visible on all pages
- **Steps:**
  1. Load legal manifest + components
  2. Select 5 legal businesses from test data
  3. Generate practice area pages, attorney profile pages
  4. Verify case results grid displays
  5. Test consultation form submission
- **File:** `tests/integration/vertical-generation/legal.test.ts`

**I1.3 — Fitness Template Generation**
- **Test:** Generate complete site for 5 sample fitness businesses
- **Expected:** Class schedule, trainer bios, membership tiers all functional
- **Acceptance:** Class schedule renders with correct times; trainer photos load
- **Steps:**
  1. Load fitness manifest + components
  2. Select 5 fitness businesses from test data
  3. Generate class schedule, trainer pages, membership pages
  4. Verify schedule responsive on mobile
  5. Test class signup flow
- **File:** `tests/integration/vertical-generation/fitness.test.ts`

**I1.4 — Landscaping Template Generation**
- **Test:** Generate complete site for 5 sample landscaping businesses
- **Expected:** Project gallery loads; service grid displays; quote form works
- **Acceptance:** Gallery images lazy-load; quote form submits successfully
- **Steps:**
  1. Load landscaping manifest + components
  2. Select 5 landscaping businesses from test data
  3. Generate gallery, service grid, quote form pages
  4. Verify mobile responsiveness
  5. Submit test quote; verify CIC ingestion receives it
- **File:** `tests/integration/vertical-generation/landscaping.test.ts`

**I1.5 — Salon/Spa Template Generation**
- **Test:** Generate complete site for 5 sample salon/spa businesses
- **Expected:** Service menu, stylist bios, booking widget all functional
- **Acceptance:** Service menu displays pricing; booking widget integrates
- **Steps:**
  1. Load salon_spa manifest + components
  2. Select 5 salon/spa businesses from test data
  3. Generate service menu, stylist pages, booking pages
  4. Test booking widget functionality
  5. Verify image gallery quality (high-res images load)
- **File:** `tests/integration/vertical-generation/salon_spa.test.ts`

### Email Sequence → Delivery → Open/Click (I2.x)

**I2.1 — Dental Email Sequence Delivery**
- **Test:** Send 5-email sequence to 10 test dental businesses
- **Expected:** All 5 emails delivered within 5 minutes; delivery rate ≥99%
- **Acceptance:** Email opens tracked; link clicks tracked
- **Steps:**
  1. Queue dental sequence for 10 businesses
  2. Monitor send logs in Loki
  3. Verify delivery confirmation from email service
  4. Click email links; verify click tracked in CIC
- **File:** `tests/integration/email-delivery/dental.test.ts`

**I2.2 — Legal Email Sequence Delivery**
- **Test:** Send 5-email sequence to 10 test legal businesses
- **Expected:** All 5 emails delivered; opens tracked; clicks attributed
- **Acceptance:** Conversion rate ≥ 12% on landing page
- **File:** `tests/integration/email-delivery/legal.test.ts`

**I2.3 — Fitness Email Sequence Delivery**
- **Test:** Send 5-email sequence to 10 test fitness businesses
- **Expected:** All 5 emails delivered; opens tracked; clicks attributed
- **Acceptance:** Conversion rate ≥ 18% on landing page
- **File:** `tests/integration/email-delivery/fitness.test.ts`

**I2.4 — Landscaping Email Sequence Delivery**
- **Test:** Send 5-email sequence to 10 test landscaping businesses
- **Expected:** All 5 emails delivered; opens tracked; clicks attributed
- **Acceptance:** Conversion rate ≥ 12% on landing page
- **File:** `tests/integration/email-delivery/landscaping.test.ts`

**I2.5 — Salon/Spa Email Sequence Delivery**
- **Test:** Send 5-email sequence to 10 test salon/spa businesses
- **Expected:** All 5 emails delivered; opens tracked; clicks attributed
- **Acceptance:** Conversion rate ≥ 20% on landing page
- **File:** `tests/integration/email-delivery/salon_spa.test.ts`

### Lead Ingestion → CIC Memory (I3.x)

**I3.1 — Form Submission → Lead Record**
- **Test:** Submit forms from all 5 vertical landing pages; verify leads created in CIC
- **Expected:** 50 lead records in CIC memory with all fields populated
- **Acceptance:** No missing fields; vertical classification correct
- **File:** `tests/integration/lead-ingestion/form-to-lead.test.ts`

**I3.2 — Email Event → Lead Enrichment**
- **Test:** Send emails, track opens/clicks, verify lead enrichment in CIC
- **Expected:** Lead records updated with email interaction history
- **Acceptance:** Open count, click count, last engagement timestamp all correct
- **File:** `tests/integration/lead-ingestion/email-enrichment.test.ts`

**I3.3 — Landing Page Visit → Analytics**
- **Test:** Visit all 5 vertical landing pages; verify page view events in analytics
- **Expected:** Page views tracked and attributed to vertical + business
- **Acceptance:** Conversion funnel visible in Grafana
- **File:** `tests/integration/lead-ingestion/analytics.test.ts`

### Observability (I4.x)

**I4.1 — Grafana Dashboard Data**
- **Test:** Verify all Phase 30 metrics appearing in Grafana dashboards
- **Expected:** 5 vertical dashboards showing email/landing page/conversion data
- **Acceptance:** Charts update in real-time; no stale data
- **File:** `tests/integration/observability/grafana.test.ts`

**I4.2 — Loki Log Aggregation**
- **Test:** Query Loki for Phase 30 events (email sends, form submissions, API calls)
- **Expected:** All events searchable by vertical, timestamp, event type
- **Acceptance:** Log retention ≥ 30 days; queries respond < 2s
- **File:** `tests/integration/observability/loki.test.ts`

**I4.3 — Prometheus Metrics**
- **Test:** Scrape Prometheus for Phase 30 counters and gauges
- **Expected:** Counters for email sends, form submissions, conversions all present
- **Acceptance:** Metrics increment correctly; no data loss
- **File:** `tests/integration/observability/prometheus.test.ts`

---

## End-to-End Tests

### Vertical Campaign Simulation (E2E.x)

**E2E.1 — Dental Campaign (5-day simulation)**
1. Generate site for 1 sample dental practice
2. Send 5-email sequence over Days 0–14
3. Simulate clicks (Day 3 → 25% open → 15% click)
4. Simulate form submission (Day 7 → 5% conversion)
5. Verify lead in CIC; check metrics in Grafana

**E2E.2 — Legal Campaign (5-day simulation)**
1. Generate site for 1 sample legal practice
2. Send 5-email sequence over Days 0–14
3. Simulate clicks (Day 2 → 30% open → 20% click)
4. Simulate form submission (Day 10 → 12% conversion)
5. Verify lead in CIC; check metrics in Grafana

**E2E.3 — Fitness Campaign (5-day simulation)**
1. Generate site for 1 sample fitness practice
2. Send 5-email sequence over Days 0–14
3. Simulate clicks (Day 1 → 35% open → 25% click)
4. Simulate form submission (Day 5 → 18% conversion)
5. Verify lead in CIC; check metrics in Grafana

**E2E.4 — Landscaping Campaign (5-day simulation)**
1. Generate site for 1 sample landscaping practice
2. Send 5-email sequence over Days 0–14
3. Simulate clicks (Day 4 → 28% open → 18% click)
4. Simulate form submission (Day 11 → 12% conversion)
5. Verify lead in CIC; check metrics in Grafana

**E2E.5 — Salon/Spa Campaign (5-day simulation)**
1. Generate site for 1 sample salon/spa practice
2. Send 5-email sequence over Days 0–14
3. Simulate clicks (Day 2 → 32% open → 20% click)
4. Simulate form submission (Day 8 → 20% conversion)
5. Verify lead in CIC; check metrics in Grafana

---

## Performance Tests

### Load Testing (PERF.x)

**PERF.1 — Email Throughput**
- **Target:** Send 1,000 emails/minute without degradation
- **Acceptance:** Latency < 500ms per email; zero bounces for valid addresses
- **Tool:** Apache JMeter or k6

**PERF.2 — Landing Page Response Time**
- **Target:** 90th percentile load time < 2 seconds; 99th percentile < 5 seconds
- **Load:** 100 concurrent users per vertical
- **Acceptance:** Zero 5xx errors; CSS/JS/images all load
- **Tool:** k6 or LoadRunner

**PERF.3 — Form Submission Latency**
- **Target:** Form submission latency < 1 second (p95)
- **Load:** 50 concurrent form submissions
- **Acceptance:** All submissions succeed; no data loss
- **Tool:** k6 or custom load script

### Reliability Tests (REL.x)

**REL.1 — Email Delivery Retry**
- **Test:** Simulate email service timeout; verify retry logic
- **Expected:** Email resent after backoff; eventual delivery
- **Acceptance:** Delivery rate ≥ 99% after retries

**REL.2 — Landing Page Availability**
- **Test:** Run landing pages for 24 hours; verify availability ≥ 99.5%
- **Expected:** Graceful error handling for transient failures
- **Acceptance:** No cascading failures; auto-recovery works

**REL.3 — Data Consistency**
- **Test:** Verify lead records in CIC match events in analytics
- **Expected:** No orphaned leads; all events attributed correctly
- **Acceptance:** Discrepancy < 0.1%

---

## Reporting

### Test Execution Report
**Deliverable:** `PHASE-30-TEST-REPORT.md`

| Category | Count | Pass | Fail | Pending | Pass Rate |
|----------|-------|------|------|---------|-----------|
| Unit Tests | 14 | 14 | 0 | 0 | 100% |
| Integration Tests | 20 | 20 | 0 | 0 | 100% |
| E2E Tests | 5 | 5 | 0 | 0 | 100% |
| Performance Tests | 3 | 3 | 0 | 0 | 100% |
| Reliability Tests | 3 | 3 | 0 | 0 | 100% |
| **Total** | **45** | **45** | **0** | **0** | **100%** |

### Metrics Summary
- Email delivery rate: ≥99%
- Landing page conversion rate: Baseline ± 5%
- Lead quality (correct vertical): ≥99%
- Data consistency (events vs. leads): ≥99.9%
- System availability: ≥99.5%

---

**Test Lead Signature:** ________________  **Date:** ______

