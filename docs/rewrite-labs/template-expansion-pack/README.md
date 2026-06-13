# Rewrite Labs Template Expansion Pack v1.0.0

**Generated:** 2026-06-13  
**Phase:** 28c — Vertical Template Expansion (VTE)  
**Status:** Ready for Redesign Engine Integration

---

## 📦 Package Contents

### 5 Vertical Templates
Manifests for dental, legal, fitness, landscaping, and salon/spa practices.

- [Dental Manifest](manifests/dental-manifest.json)
- [Legal Manifest](manifests/legal-manifest.json)
- [Fitness Manifest](manifests/fitness-manifest.json)
- [Landscaping Manifest](manifests/landscaping-manifest.json)
- [Salon/Spa Manifest](manifests/salon_spa-manifest.json)

### 4 HTML/CSS Skeletons
Universal responsive templates for homepage, service page, contact page, and mobile shell.

- [Homepage Skeleton](skeletons/homepage.html)
- [Service Page Skeleton](skeletons/service-page.html)
- [Contact Page Skeleton](skeletons/contact.html)
- [Mobile Shell](skeletons/mobile-shell.html)

### 6 Component Schemas
Universal and vertical-specific component definitions with validation rules.

- [Universal Components](schemas/components-universal.json) — Header, hero, CTA, footer, form
- [Dental Components](schemas/components-dental.json) — Insurance badges, before/after gallery, booking widget
- [Legal Components](schemas/components-legal.json) — Practice area grid, case results, attorney profiles
- [Fitness Components](schemas/components-fitness.json) — Class schedule, membership tiers, trainer profiles
- [Landscaping Components](schemas/components-landscaping.json) — Project gallery, service grid, quote form
- [Salon/Spa Components](schemas/components-salon_spa.json) — Service menu, pricing table, booking widget

### 5 Outreach Email Sequences
3–5 email sequences per vertical, optimized for high conversion.

- [Dental Outreach](outreach/dental-sequence.md) — Discovery → Value Prop → Social Proof → Objection → Close
- [Legal Outreach](outreach/legal-sequence.md) — Authority → Consultation Lift → Proof → Objection → Final
- [Fitness Outreach](outreach/fitness-sequence.md) — Energy → Membership Lift → Transformation → Proof → Urgency
- [Landscaping Outreach](outreach/landscaping-sequence.md) — Portfolio → Quote Lift → Seasonal → Seasons → Close
- [Salon/Spa Outreach](outreach/salon_spa-sequence.md) — Luxury → Booking Lift → Social Proof → Objection → Urgency

### 5 AEO Metadata Packs
Schema markup, expertise signals, and SEO implementation checklists.

- [Dental AEO](aeo/dental.json) — Dentist schema, service schema, FAQ, credentials
- [Legal AEO](aeo/legal.json) — Attorney schema, practice area schema, bar credentials
- [Fitness AEO](aeo/fitness.json) — HealthAndBeautyBusiness schema, class events, membership offers
- [Landscaping AEO](aeo/landscaping.json) — LocalBusiness schema, service schema, project gallery
- [Salon/Spa AEO](aeo/salon_spa.json) — BeautyBusiness schema, stylist person schema, service schema

---

## 🚀 Usage

### For Redesign Engine
1. Select vertical: `dental`, `legal`, `fitness`, `landscaping`, or `salon_spa`
2. Load manifest: `manifests/{vertical}-manifest.json`
3. Apply color cluster + typography from manifest
4. Instantiate components from `schemas/components-{vertical}.json`
5. Populate with template skeleton from `skeletons/`
6. Inject AEO metadata from `aeo/{vertical}.json`

### For Outreach
1. Select vertical sequence: `outreach/{vertical}-sequence.md`
2. Customize email copy with `{{variable}}` substitution
3. Schedule emails: Day 0, Day 3, Day 7, Day 10, Day 14
4. Track metrics vs. benchmarks in each sequence

### For SEO
1. Implement schema markup from `aeo/{vertical}.json`
2. Follow expertise signals checklist
3. Validate with Google Rich Results Test
4. Monitor local search rankings

---

## 📊 Key Metrics

### Outreach Performance
| Vertical | Open Rate | Click Rate | Conversion |
|----------|-----------|-----------|-----------|
| Dental | 35-45% | 8-12% | 5-8% |
| Legal | 32-42% | 7-11% | 12-18% |
| Fitness | 38-48% | 10-14% | 18-25% |
| Landscaping | 31-41% | 8-12% | 12-18% |
| Salon/Spa | 35-45% | 9-13% | 20-28% |

### Expected Lift
- **Reply Rate:** 2–3× vs. generic outreach
- **Booking Rate:** 25–40% improvement in first 30 days
- **Consultation Rate:** 22–35% lift (legal, dental)

---

## 🎨 Design Palette

### Color Clusters
- **Dental:** Blue (#0A6FFF) + Light (#E8F3FF) + Dark (#1A1A1A)
- **Legal:** Charcoal (#1B1B1B) + Navy (#2E3A59) + Gold (#D4C7A1)
- **Fitness:** Red (#FF3B30) + Black (#111111) + Green (#00D084)
- **Landscaping:** Green (#2E7D32) + Light Green (#A5D6A7) + Brown (#795548)
- **Salon/Spa:** Blush (#F7E7E7) + Mauve (#C49BB4) + Dark (#333333)

### Typography
- **Dental:** Clean sans-serif, 16px body, 48px H1
- **Legal:** Serif headers + sans-serif body, 16px body, 48px H1
- **Fitness:** Bold sans-serif, 16px body (500 weight), 56px H1 (900 weight)
- **Landscaping:** Clean sans-serif, 16px body, 48px H1
- **Salon/Spa:** Serif headers + light sans-serif body, 16px body (300 weight), 48px H1 (400 weight)

---

## 🔧 Integration Checklist

- [ ] Load all 5 manifests into template library
- [ ] Register all 25 component definitions in component store
- [ ] Import HTML skeletons into Redesign Engine
- [ ] Wire outreach sequences to email service
- [ ] Implement AEO schema markup validation
- [ ] Test template generation for each vertical
- [ ] Validate mobile responsiveness
- [ ] Measure outreach performance vs. baselines
- [ ] Document customization points per vertical

---

## 📝 Dependencies

- **Phase 0.7:** Rewrite Labs pipeline (discovery → extractor → redesign → outreach)
- **Phase 24:** Governance integration (for template approval workflows)
- **Phase 26:** Search engine (CRO for rank tracking)

---

## 🎯 Next Steps

1. **Phase 28c Execution:** Implement template generation engine
2. **Phase 29:** Deploy to production (2026-06-29)
3. **Phase 30:** Launch vertical-specific outreach campaigns
4. **Measure:** 2–3× reply rate lift within 30 days

---

**Questions?** See full Phase 28c specification in `CIC_MASTER_ROADMAP.md`.
