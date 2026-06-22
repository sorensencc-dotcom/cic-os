# CIC Component Library Roadmap (Q3–Q4 2026)

**Status:** Specification locked  
**Scope:** Component delivery pipeline  
**Date:** 2026-06-21

## Overview

Phased component delivery via CIC Component Generator.

Target: 25+ components by Q4 2026.

## Q3 Components (Weeks 1-12)

### Tier 1: Core (Weeks 1-4)
- Button (6 variants)
- Input (text, email, password)
- Checkbox
- Radio
- Toggle
- Label

### Tier 2: Container (Weeks 5-8)
- Panel
- Card
- Row
- Grid
- Modal
- Popover

### Tier 3: Data (Weeks 9-12)
- Table (sortable, filterable)
- Badge
- Pill
- Stat
- Progress bar
- Skeleton

## Q4 Components (Weeks 13-24)

### Tier 4: Form (Weeks 13-16)
- Select (dropdown)
- ComboBox (searchable select)
- DatePicker
- TimePicker
- MultiSelect
- Textarea

### Tier 5: Feedback (Weeks 17-20)
- Alert
- Toast
- Tooltip
- Popover (advanced)
- Dialog
- Drawer

### Tier 6: Specialized (Weeks 21-24)
- CodeBlock (with syntax highlighting)
- Tabs
- Breadcrumb
- Stepper
- Timeline
- Autocomplete

## Per-Component Deliverables

Each component includes:
1. TSX component (deterministic)
2. CSS module (token-driven)
3. Storybook story
4. Jest unit tests
5. Playwright visual tests
6. Token map documentation
7. Accessibility checklist

## Automation

- Generator: `npm run cic-ui add <component>`
- Tests: `npm test`
- Visual regression: `npm run visual:test`
- Drift detection: automated on commit

## Success Criteria

- 25+ components by Q4
- 100% token coverage
- 100% ESLint compliance
- 95%+ test coverage
- Zero visual drift
- WCAG AA accessibility

---

**Next:** Execute Q3 Week 1 (Tier 1 Core components).
