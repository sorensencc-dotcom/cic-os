# Phase 30 Integration Checklist
## Launch Vertical-Specific Outreach Campaigns

**Phase:** 30  
**Status:** Ready for Execution  
**Timeline:** 2026-06-29 through 2026-07-13  
**Owner:** Rewrite Labs + CIC Outreach  
**Generated:** 2026-06-13

---

## Pre-Launch Integration (Days 1–3)

### Template Library & Component Registry
- [ ] **Load manifests** — Ingest all 5 vertical manifests (dental, legal, fitness, landscaping, salon_spa) into template library
  - Verify manifest schema compliance
  - Confirm color clusters parsed correctly
  - Test typography overrides per vertical
- [ ] **Register components** — All 25 components (5 universal + 20 vertical) in component store
  - Validate JSON schema refs
  - Test component instantiation for each vertical
  - Confirm CRO attributes populated
- [ ] **Import HTML skeletons** — Load 4 skeleton templates into Redesign Engine
  - Homepage template instantiation
  - Service page template instantiation
  - Contact form template instantiation
  - Mobile shell responsive behavior

### Outreach Pipeline Wiring
- [ ] **Email sequences loaded** — All 5 vertical sequences (3–5 emails each) in email service
  - Dental sequence (5 emails, Day 0 → Day 14)
  - Legal sequence (5 emails, Day 0 → Day 14)
  - Fitness sequence (5 emails, Day 0 → Day 14)
  - Landscaping sequence (5 emails, Day 0 → Day 14)
  - Salon/Spa sequence (5 emails, Day 0 → Day 14)
  - Confirm template variables recognized (`{{business_name}}`, `{{vertical}}`, etc.)
- [ ] **Segments created** — Audience segments for each vertical in marketing automation platform
  - Segment query validation (business type, geography, industry)
  - Opt-in status verification
  - Test email send to internal addresses

### SEO & Schema Integration
- [ ] **AEO metadata** — All 5 vertical AEO packs integrated into CMS/site infrastructure
  - Schema markup validation (JSON-LD format)
  - Google Rich Results Test passes for each vertical
  - Local Business schema for each practice area
- [ ] **Expert signals** — Credentials, attorney bar numbers, certified trainers populated
  - Bar associations linked (legal vertical)
  - Dentist credentials verified (dental vertical)
  - Trainer certifications displayed (fitness vertical)

---

## Vertical Integration Testing (Days 4–7)

### Dental Vertical
- [ ] Template generation produces valid HTML for all pages
- [ ] Booking widget integrates with scheduling system (if applicable)
- [ ] Before/after gallery loads and displays correctly
- [ ] Insurance badges render per insurance provider
- [ ] Email sequence flows without errors
- [ ] Outreach landing page converts at baseline ≥5%

### Legal Vertical
- [ ] Case results module displays with proper formatting
- [ ] Attorney profile cards render with headshots and bios
- [ ] Practice area grid links to relevant service pages
- [ ] Consultation form collects leads correctly
- [ ] Email sequence flows without errors
- [ ] Outreach landing page converts at baseline ≥12%

### Fitness Vertical
- [ ] Class schedule displays with times, instructors, capacity
- [ ] Membership tier pricing displays and is selectable
- [ ] Trainer profiles render with photos and credentials
- [ ] Mobile responsiveness verified (class cards stack correctly)
- [ ] Email sequence flows without errors
- [ ] Outreach landing page converts at baseline ≥18%

### Landscaping Vertical
- [ ] Project gallery loads images (lazy load tested)
- [ ] Service grid categorizes by service type
- [ ] Quote form collects project details correctly
- [ ] Mobile responsiveness verified (gallery responsive grid)
- [ ] Email sequence flows without errors
- [ ] Outreach landing page converts at baseline ≥12%

### Salon/Spa Vertical
- [ ] Service menu displays with pricing and duration
- [ ] Stylist/therapist profiles render with photos and bios
- [ ] Booking widget integrates with appointment system
- [ ] Image gallery quality verified (high-res beauty photography)
- [ ] Email sequence flows without errors
- [ ] Outreach landing page converts at baseline ≥20%

---

## CIC Ingestion Integration (Days 8–10)

### Data Flow
- [ ] **Metadata ingestion** — All vertical metadata flows from CIC to Rewrite Labs pipeline
  - Business discovery data arrives at Labs discovery agent
  - Vertical classification applied (auto-detect or manual override)
  - Color cluster + typography applied during redesign phase
- [ ] **Lead ingestion** — Outreach leads flow from email service → CIC memory → dashboard
  - Email opens tracked
  - Link clicks attributed to campaign
  - Form submissions logged
- [ ] **Performance data** — Metrics from each vertical flow to observability layer
  - Open rates per vertical per day
  - Click rates per email in sequence
  - Conversion rates per vertical
  - Cost per lead tracked

### Observability & Monitoring
- [ ] **Grafana dashboards** wired for Phase 30 metrics
  - Outreach performance by vertical (5 charts)
  - Email sequence performance (5 sequences)
  - Landing page conversion funnel
  - Lead quality score distribution
- [ ] **Loki logs** aggregating email service, form handler, API calls
  - Email send logs searchable
  - Form submission logs with context
  - API error logs captured
- [ ] **Prometheus metrics** exposed for Phase 30 events
  - Email sent counter
  - Form submission counter
  - Landing page visit counter
  - Conversion event counter

---

## Deployment & Go-Live (Days 11–14)

### Staging Validation (Days 11–12)
- [ ] **End-to-end test** — Manually test each vertical in staging
  - Generate sample site for each vertical
  - Load sample business data
  - Send test email sequences
  - Verify landing pages load and convert
  - Check mobile responsiveness
- [ ] **Load test** — 100 concurrent users per vertical
  - Email sending latency < 500ms per email
  - Landing page load time < 2s (90th percentile)
  - Form submission latency < 1s
- [ ] **Accessibility audit** — Verify WCAG 2.1 AA compliance
  - Screen reader test for each vertical
  - Keyboard navigation verified
  - Color contrast validated
  - Form labels and ARIA attributes present

### Production Deployment (Day 13)
- [ ] **DNS/traffic routing** — Vertical landing pages available at public URLs
- [ ] **Email infrastructure** — Sender reputation verified (SPF, DKIM, DMARC)
- [ ] **Analytics wired** — Conversion tracking pixel fired correctly
- [ ] **CRM integration** — Leads flowing to CRM system
- [ ] **Monitoring alerts** — Grafana alerts active for anomalies
  - Email delivery rate drop > 5% triggers alert
  - Landing page 500 error rate > 1% triggers alert
  - Form submission rate drop > 20% triggers alert

### Launch Announcement (Day 13)
- [ ] **Internal comms** — Team notified of go-live
- [ ] **Stakeholder comms** — Leadership notified with expected metrics
- [ ] **Metrics baseline** — Capture Day 1 performance as baseline for comparison

---

## Post-Launch Monitoring (Day 14 onwards)

### Week 1 (Days 14–20)
- [ ] **Daily stand-ups** — Review outreach performance by vertical
- [ ] **Email performance** — Monitor open rates, click rates, unsubscribe rates
  - Flag sequences underperforming baseline
  - Pause underperforming emails if >5% unsubscribe rate
- [ ] **Lead quality** — Monitor conversion rate, lead-to-customer rate
- [ ] **System health** — Confirm no errors in logs, no performance degradation

### Week 2+ (Days 21–28)
- [ ] **Comparative analysis** — Compare vertical performance vs. benchmarks
- [ ] **Optimization recommendations** — Identify best-performing copy, designs, CTAs
- [ ] **A/B test candidates** — Identify high-impact tests to run
- [ ] **Reporting** — Weekly summary to stakeholders

---

## Success Criteria

**Minimum Thresholds for Launch:**
- ✅ All 5 vertical templates render without errors
- ✅ Email sequences send without errors (100% delivery rate)
- ✅ Landing pages load in < 3 seconds
- ✅ Forms accept and process submissions
- ✅ Monitoring dashboards operational
- ✅ No critical accessibility violations (WCAG AA)

**Target Metrics (Week 1):**
| Metric | Dental | Legal | Fitness | Landscaping | Salon/Spa |
|--------|--------|-------|---------|-------------|-----------|
| Email Open Rate | 35–45% | 32–42% | 38–48% | 31–41% | 35–45% |
| Click Rate | 8–12% | 7–11% | 10–14% | 8–12% | 9–13% |
| Landing Page Conv. | ≥5% | ≥12% | ≥18% | ≥12% | ≥20% |

---

## Rollback Plan

**Conditions for Rollback:**
- Email delivery rate < 90% for > 2 hours
- Landing page availability < 99.5%
- Conversion rate drops > 50% vs. baseline in 24-hour window

**Rollback Steps:**
1. Pause all outreach email sends (< 5 min)
2. Disable landing page traffic routing to Phase 30 infrastructure
3. Investigate logs in Loki for root cause
4. Fix issues in staging
5. Validate fix in staging
6. Gradual re-enable: 10% → 25% → 50% → 100% traffic over 2 hours

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Phase Lead | — | — | — |
| QA Lead | — | — | — |
| Ops Lead | — | — | — |
| Stakeholder | — | — | — |

---

**Questions?** See `CIC_MASTER_ROADMAP.md` Phase 30 specification.
