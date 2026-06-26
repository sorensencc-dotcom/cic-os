# Phase 30 — Vertical QA Matrix
## Quality Assurance Verification by Vertical

**Phase:** 30  
**Document:** Vertical QA Matrix  
**Timeline:** 2026-06-29 through 2026-07-13  
**QA Lead:** Rewrite Labs Quality  
**Generated:** 2026-06-13

---

## Purpose

Standardized QA checklist for each of 5 verticals, ensuring consistent quality across template generation, email campaigns, landing pages, and conversion flows.

---

## QA Checklist Template

### VERTICAL: [Name]

**Vertical ID:** [ID]  
**Template:** `[vertical]-manifest.json`  
**Components:** [Count] (universal + vertical-specific)  
**Email Sequences:** [Count] emails × [# sequences]  
**Landing Pages:** [# pages]  
**Success Criteria:** See **Acceptance Thresholds** below

---

#### A. Template Generation & Rendering

| Item | Acceptance Criteria | Owner | Status | Notes |
|------|-------------------|-------|--------|-------|
| **A1. Manifest loads** | No schema errors; color/font values valid | QA | [ ] | |
| **A2. Components instantiate** | All components render with sample data | QA | [ ] | |
| **A3. Homepage renders** | Valid HTML; all sections visible; images load | QA | [ ] | |
| **A4. Service pages render** | Service description + CTA visible per page | QA | [ ] | |
| **A5. Contact page renders** | Form fields present; submit button visible | QA | [ ] | |
| **A6. Mobile responsive** | Pages readable on 320px (mobile), 768px (tablet), 1024px+ (desktop) | QA | [ ] | |
| **A7. Images optimized** | Images load in < 1s; lazy loading works | QA | [ ] | |
| **A8. CSS specificity** | No style conflicts; cascading correct | QA | [ ] | |
| **A9. Vertical-specific elements** | Dental (booking widget), Legal (case results), Fitness (schedule), Landscaping (gallery), Spa (service menu) all present | QA | [ ] | |

---

#### B. SEO & Schema Markup

| Item | Acceptance Criteria | Owner | Status | Notes |
|------|-------------------|-------|--------|-------|
| **B1. Meta tags** | Title, description, canonical URL present and unique per page | QA | [ ] | |
| **B2. Schema.org markup** | [Vertical-specific schema] (e.g., LocalBusiness, Attorney, HealthAndBeautyBusiness) valid JSON-LD | QA | [ ] | |
| **B3. Open Graph tags** | og:title, og:description, og:image present | QA | [ ] | |
| **B4. Rich Results Test** | Google Rich Results Test passes; no warnings | QA | [ ] | |
| **B5. Structured data** | Expertise signals present (credentials, licenses, certifications) | QA | [ ] | |
| **B6. XML Sitemap** | Sitemap includes all pages; proper priority/frequency | QA | [ ] | |
| **B7. Robots.txt** | Robots.txt allows crawling; no unintended blocks | QA | [ ] | |

---

#### C. Email Campaigns

| Item | Acceptance Criteria | Owner | Status | Notes |
|------|-------------------|-------|--------|-------|
| **C1. Subject lines** | Personalized with business name; compelling for vertical | QA | [ ] | |
| **C2. Preview text** | First line of email visible in inbox preview | QA | [ ] | |
| **C3. Email template** | Template renders in Gmail, Outlook, Apple Mail without layout breaks | QA | [ ] | |
| **C4. Personalization** | {{business_name}}, {{vertical}}, {{url}} all substituted; no orphaned tokens | QA | [ ] | |
| **C5. CTA clarity** | Primary CTA button visible; secondary CTA present | QA | [ ] | |
| **C6. CTA tracking** | UTM parameters in all links; unique per campaign | QA | [ ] | |
| **C7. Unsubscribe** | Unsubscribe link visible and functional | QA | [ ] | |
| **C8. Plain text** | Plain text version renders correctly for non-HTML clients | QA | [ ] | |
| **C9. Sequence timing** | Days between emails correct (Day 0, Day 3, Day 7, Day 10, Day 14) | QA | [ ] | |
| **C10. Sequence copy** | Email copy matches vertical tone (e.g., formal for legal, energetic for fitness) | QA | [ ] | |

---

#### D. Landing Pages

| Item | Acceptance Criteria | Owner | Status | Notes |
|------|-------------------|-------|--------|-------|
| **D1. Page load speed** | Load time < 3 seconds on 4G; < 1 second on broadband | QA | [ ] | |
| **D2. Headline clarity** | Headline immediately communicates value prop | QA | [ ] | |
| **D3. Form fields** | Form requests only essential info (name, email, phone for most verticals) | QA | [ ] | |
| **D4. Form submission** | Form submits without errors; thank-you page loads | QA | [ ] | |
| **D5. CTA button** | Button contrasts with background; copy is action-oriented | QA | [ ] | |
| **D6. Mobile conversion** | Form fields stack vertically; tap targets ≥48px | QA | [ ] | |
| **D7. Trust signals** | Testimonials, certifications, guarantees visible | QA | [ ] | |
| **D8. Multimedia** | Images/videos load correctly; YouTube embeds work | QA | [ ] | |
| **D9. Redirect URL** | After form submission, user redirected to correct thank-you URL | QA | [ ] | |

---

#### E. Conversion Flow

| Item | Acceptance Criteria | Owner | Status | Notes |
|------|-------------------|-------|--------|-------|
| **E1. Email → Landing page** | Email CTA link correct; landing page loads with no 404/500 | QA | [ ] | |
| **E2. Landing page → Form** | Form appears above fold; user doesn't need to scroll to see it | QA | [ ] | |
| **E3. Form → CIC** | Form submission data reaches CIC ingestion within 5 seconds | QA | [ ] | |
| **E4. Data accuracy** | CIC lead record matches form data (no truncation, correct vertical) | QA | [ ] | |
| **E5. Attribution** | Lead record linked to email campaign, sequence step, and business | QA | [ ] | |

---

#### F. Accessibility (WCAG 2.1 AA)

| Item | Acceptance Criteria | Owner | Status | Notes |
|------|-------------------|-------|--------|-------|
| **F1. Color contrast** | Text contrast ≥ 4.5:1 (normal text), ≥ 3:1 (large text) | QA | [ ] | |
| **F2. Form labels** | All form fields have associated `<label>` tags | QA | [ ] | |
| **F3. ARIA attributes** | ARIA labels present for icons, buttons without text | QA | [ ] | |
| **F4. Keyboard navigation** | All interactive elements reachable via Tab key | QA | [ ] | |
| **F5. Focus indicators** | Focus outline visible on all focusable elements | QA | [ ] | |
| **F6. Screen reader** | Page structure readable in screen reader (NVDA, JAWS); no content hidden | QA | [ ] | |
| **F7. Image alt text** | All images have descriptive alt text; decorative images marked with alt="" | QA | [ ] | |
| **F8. Link text** | Links have meaningful text (not "Click here"); skip link present | QA | [ ] | |

---

#### G. Browser & Device Compatibility

| Item | Acceptance Criteria | Owner | Status | Notes |
|------|-------------------|-------|--------|-------|
| **G1. Chrome latest** | Page renders and functions in latest Chrome | QA | [ ] | |
| **G2. Firefox latest** | Page renders and functions in latest Firefox | QA | [ ] | |
| **G3. Safari latest** | Page renders and functions in latest Safari (macOS + iOS) | QA | [ ] | |
| **G4. Edge latest** | Page renders and functions in latest Edge | QA | [ ] | |
| **G5. Mobile Safari** | Page renders and functions in iOS Safari (iPhone 12+) | QA | [ ] | |
| **G6. Android Chrome** | Page renders and functions in Android Chrome | QA | [ ] | |
| **G7. Tablet (iPad)** | Page layout adapts to iPad (768px) | QA | [ ] | |

---

#### H. Analytics & Tracking

| Item | Acceptance Criteria | Owner | Status | Notes |
|------|-------------------|-------|--------|-------|
| **H1. GA4 pixel** | Google Analytics 4 tracking pixel fires on page load | QA | [ ] | |
| **H2. Event tracking** | Form submission event fires with correct event name and parameters | QA | [ ] | |
| **H3. UTM parameters** | UTM campaign, source, medium, content correct in analytics | QA | [ ] | |
| **H4. Conversion tracking** | Conversion event tracked when form submitted | QA | [ ] | |
| **H5. Custom events** | Custom events for video play, scroll depth, CTA clicks tracked | QA | [ ] | |

---

#### I. Security

| Item | Acceptance Criteria | Owner | Status | Notes |
|------|-------------------|-------|--------|-------|
| **I1. HTTPS** | All pages served over HTTPS; no mixed content warnings | QA | [ ] | |
| **I2. CSP headers** | Content Security Policy header set correctly | QA | [ ] | |
| **I3. Form validation** | Form inputs validated client-side and server-side; XSS protection | QA | [ ] | |
| **I4. CORS** | CORS headers set correctly (if API calls made) | QA | [ ] | |
| **I5. No sensitive data** | Passwords, tokens, API keys not exposed in HTML/JS | QA | [ ] | |

---

## Vertical-Specific Sections

### DENTAL VERTICAL

**Dental ID:** DEN  
**Template:** `dental-manifest.json`  
**Components:** 10 (5 universal + 5 dental-specific)  
**Email Sequences:** 5 emails × 1 sequence  
**Landing Pages:** 3 (homepage, services, contact)  

**Vertical-Specific QA:**

| Item | Acceptance Criteria | Owner | Status |
|------|-------------------|-------|--------|
| **Booking Widget** | Booking widget embedded; shows available appointment slots; submits to scheduling system | QA | [ ] |
| **Insurance Badges** | Insurance logos display for common providers (Delta, Cigna, United, Aetna) | QA | [ ] |
| **Before/After Gallery** | Before/after images display in grid; no broken image links | QA | [ ] |
| **Credentials** | Dentist name, DDS/DMD degree, state license visible | QA | [ ] |
| **Conversion Target** | Landing page conversion rate ≥ 5% | QA | [ ] |

---

### LEGAL VERTICAL

**Legal ID:** LAW  
**Template:** `legal-manifest.json`  
**Components:** 10 (5 universal + 5 legal-specific)  
**Email Sequences:** 5 emails × 1 sequence  
**Landing Pages:** 4 (homepage, practice areas, case results, contact)  

**Vertical-Specific QA:**

| Item | Acceptance Criteria | Owner | Status |
|------|-------------------|-------|--------|
| **Practice Area Grid** | Each practice area links to dedicated page; description visible | QA | [ ] |
| **Case Results** | Case outcome, practice area, settlement amount displayed; no confidential info leaked | QA | [ ] |
| **Attorney Profiles** | Name, headshot, bio, bar license number visible; license links to state bar | QA | [ ] |
| **Testimonials** | Client testimonials displayed (anonymized or with permission); star rating visible | QA | [ ] |
| **Conversion Target** | Landing page conversion rate ≥ 12% | QA | [ ] |

---

### FITNESS VERTICAL

**Fitness ID:** FIT  
**Template:** `fitness-manifest.json`  
**Components:** 10 (5 universal + 5 fitness-specific)  
**Email Sequences:** 5 emails × 1 sequence  
**Landing Pages:** 4 (homepage, classes, membership, trainers)  

**Vertical-Specific QA:**

| Item | Acceptance Criteria | Owner | Status |
|------|-------------------|-------|--------|
| **Class Schedule** | Class names, times, instructors, capacity displayed; schedule updates dynamically | QA | [ ] |
| **Membership Tiers** | Pricing, benefits, commitment period clear for each tier; comparison table visible | QA | [ ] |
| **Trainer Profiles** | Trainer name, photo, certifications (NASM, ISSA, AFAA), specialties visible | QA | [ ] |
| **Transformation Gallery** | Before/after fitness photos displayed; no unrealistic claims | QA | [ ] |
| **Conversion Target** | Landing page conversion rate ≥ 18% | QA | [ ] |

---

### LANDSCAPING VERTICAL

**Landscaping ID:** LAND  
**Template:** `landscaping-manifest.json`  
**Components:** 10 (5 universal + 5 landscaping-specific)  
**Email Sequences:** 5 emails × 1 sequence  
**Landing Pages:** 4 (homepage, portfolio, services, quote form)  

**Vertical-Specific QA:**

| Item | Acceptance Criteria | Owner | Status |
|------|-------------------|-------|--------|
| **Project Gallery** | Project images load with lazy loading; before/after sliders work; categories filter correctly | QA | [ ] |
| **Service Grid** | Services categorized (design, maintenance, hardscape, etc.); descriptions clear | QA | [ ] |
| **Quote Form** | Form collects property address, service type, budget, timeline; submits to CRM | QA | [ ] |
| **Service Area Map** | Service area map displays; ZIP code selector shows served areas | QA | [ ] |
| **Conversion Target** | Landing page conversion rate ≥ 12% | QA | [ ] |

---

### SALON/SPA VERTICAL

**Salon/Spa ID:** SPA  
**Template:** `salon_spa-manifest.json`  
**Components:** 10 (5 universal + 5 salon/spa-specific)  
**Email Sequences:** 5 emails × 1 sequence  
**Landing Pages:** 4 (homepage, services, stylists, booking)  

**Vertical-Specific QA:**

| Item | Acceptance Criteria | Owner | Status |
|------|-------------------|-------|--------|
| **Service Menu** | Service names, descriptions, duration, pricing displayed in clear table | QA | [ ] |
| **Stylist/Therapist Profiles** | Photos, bio, specializations (color, extensions, massage, etc.) visible | QA | [ ] |
| **Beauty Gallery** | High-quality images of services rendered; no pixelation; mobile-optimized | QA | [ ] |
| **Booking Widget** | Booking widget shows available time slots; integrates with booking system | QA | [ ] |
| **Conversion Target** | Landing page conversion rate ≥ 20% | QA | [ ] |

---

## Test Execution Summary

### Completion Tracking

| Vertical | A | B | C | D | E | F | G | H | I | Vertical-Specific | Status |
|----------|---|---|---|---|---|---|---|---|---|-------------------|--------|
| Dental | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| Legal | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| Fitness | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| Landscaping | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |
| Salon/Spa | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |

---

## Defect Tracking

### Critical Issues (Blocking Release)
- [ ] None identified

### Major Issues (Must Fix Before Launch)
- [ ] None identified

### Minor Issues (Can Fix in v1.1)
- [ ] None identified

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | — | — | — |
| Engineering Lead | — | — | — |
| Product Lead | — | — | — |

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-13  

