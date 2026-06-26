# Rewrite Labs: Competitive Teardown & Build Plan v1.0

**Version:** 1.0.0  
**Date:** 2026-06-13  
**Status:** Implementation-Ready  
**Scope:** Repaint vs Rewrite Labs — full-stack analysis, corrected v2 (3 BLOCK / 5 FLAG / 3 NIT resolved)

---

## 1. Repo Capability Audit (Verified)

| Subsystem | Status | Location | Notes |
|---|---|---|---|
| IR Schema (IRPacket v1.0) | **Shipped** | `ir-toolkit/src/schemas/ir.types.ts` | Verified |
| Lead Scoring Engine | **Shipped** | `ir-toolkit/src/lead-scorer/score.ts` | Verified |
| Preview Generator | **Shipped** | `ir-toolkit/src/preview-generator/generator.ts` | Text narratives only — no HTML render |
| Pricing Engine | **Shipped (agency model)** | `ir-toolkit/src/pricing-engine/generator.ts` | Outputs $75k–$150k+ project quotes, NOT SaaS entitlements |
| CrawlerEngine | **Missing** | — | No code, no stub, no spec |
| Extractors Agent | **Stub** | `agents/src/extractors/index.mjs` | Exports version string only |
| Redesign Agent | **Stub** | `agents/src/redesign/index.mjs` | Exports version string only |
| Outreach Agent | **Stub** | `agents/src/outreach/index.mjs` | Exports version string only |
| Discovery | **Spec only (no code)** | PRD 4.1 | No crawler code anywhere in repo |
| Delivery Pipeline | **Not started** | Phase 2.0 vision | No code |
| Chat-based editing | **Not started** | Not in PRD | No design spec |
| Style matching engine | **Not started** | Not in PRD | No design spec |
| SaaS Pricing / Entitlements | **Not started** | — | Existing PricingEngine is agency model; incompatible |

**Critical finding — Pricing Model Mismatch:** `PricingEngine.generate()` outputs $75k–$150k+ project quotes (`baseCosts.development = $25,000`, `hourlyRate = $200`). This is an agency retainer quote engine. Repaint operates at $30/month SaaS. `EntitlementSet` requires a net-new `SaaSPricingGate` — not a refactor of the existing engine, which serves a valid and separate agency sales purpose.

---

## 2. Capability Gap Matrix

| Capability | Repaint | Rewrite Labs | Gap Severity |
|---|---|---|---|
| URL → AI rebuild workflow | **Yes** | No | CRITICAL |
| Chat-based editing UI | **Yes** | No | CRITICAL |
| Style matching (visual fidelity) | **Yes** | No extractor impl | CRITICAL |
| Interactive components in preview | **Yes** | Static text analysis only | HIGH |
| Publishing + custom domain | **Yes** | No | HIGH |
| Freemium onboarding | **Yes** | No | HIGH |
| Flat monthly SaaS pricing | **Yes** | No — agency quote model only | HIGH |
| Automated discovery (outbound) | No | **Spec only (no code)** | — |
| Automated outreach pipeline | No | **Stub** | — |
| Zero-touch delivery | No | **Stub** | — |
| Lead scoring | No | **Shipped** | — |
| Agency pricing quotes | No | **Shipped** | — |
| Governance / CIC layer | No | **Shipped** | — |

---

## 3. Architecture Diffs

### Repaint — Estimated Architecture

> ⚠ Inferred from public launch report. Repaint is closed-source. Internal architecture may differ; treat as hypothesis, not ground truth.

```
User → Paste URL
         ↓
     Web Scraper + DOM Capture [estimated: Puppeteer or headless Chrome]
         ↓
     Style Token Extractor [estimated: CSS computed styles → design tokens]
         ↓
     LLM Rebuild Engine [estimated: prompt + token-constrained HTML/CSS generation]
         ↓
     Chat Edit Loop [LLM ↔ DOM diff, real-time]
         ↓
     Repaint Hosting → Custom Domain CNAME
```

### Rewrite Labs — Actual Architecture (Repo-Verified)

```
[NOT BUILT] CrawlerEngine → seed URLs
                   ↓
[NOT BUILT] SiteExtractor → IRPacket [schema exists, no impl]
                   ↓
[Shipped]   LeadScoringEngine → tier A/B/C/D
                   ↓
[Shipped]   PreviewGenerator → PreviewGallery [text narratives, no render]
                   ↓
[Shipped]   PricingEngine → PricingQuote [$75k-$150k agency model]
                   ↓
[Stub]      OutreachAgent → [nothing wired]
                   ↓
[Stub]      RedesignAgent → [nothing]
```

**Architecture delta:**

- Repaint: `Scrape → Style Match → LLM Rebuild → Chat Loop → Publish`
- Rewrite Labs: `Score → Text Summary → Agency Quote`
- Rewrite Labs has zero rendering, zero delivery, zero interactive editing.

---

## 4. Unit Economics (Gate Before Pricing)

LLM cost floor estimate per site at Claude Haiku:

| Step | Est. tokens (in+out) | Est. cost |
|---|---|---|
| DOM extraction prompt | ~8k | ~$0.003 |
| Style analysis + IRPacket | ~12k | ~$0.005 |
| Redesign generation (3 variants) | ~45k | ~$0.018 |
| Chat edit session (10 turns) | ~30k | ~$0.012 |
| **Total per site** | **~95k** | **~$0.038** |

At $29/month with 10 active sites per customer: LLM cost ~$0.38. Infrastructure (Cloudflare, R2, storage) ~$1–3/month. Margin viable at $29/month **only with a 50-turn free cap**. Pricing must not be committed until RL-4.3 production token logs are available. ≥60% gross margin at 100 active customers is the gate.

---

## 5. Missing Primitives

| Primitive | Needed For | Status |
|---|---|---|
| **CrawlerEngine** | Seed URLs for all downstream | Missing — prerequisite to all |
| SiteExtractor | DOM + CSS capture → IRPacket | Missing |
| StyleMatchEngine | Style fidelity | Missing |
| DesignVariantRenderer | Actual HTML/CSS output | Missing |
| ChatEditSession | Interactive editing | Missing |
| DOMPatch applicator | Chat edits | Missing |
| SiteBundle serializer | Delivery | Missing |
| DeploymentAdapter (Cloudflare) | Publishing | Missing |
| SaaSPricingGate + EntitlementSet | Freemium model | Missing — additive to existing PricingEngine |

Existing `PricingEngine` is not deprecated — it serves the agency quote flow and is retained as-is.

---

## 6. Build Order and Dependency Graph

```
CrawlerEngine (P0 — unblocks everything)
    ↓
SiteExtractor + StyleMatchEngine (P1 — parallel, both blocked on Crawler)
    ↓
RedesignAgent + DesignVariantRenderer (P2 — blocked on Extractor)
    ↓
SiteBundle + DeploymentAdapter (P3 — blocked on Redesign output)
    ↓
ChatEditSession + DOMPatch (P4 — blocked on SiteBundle; requires HTML to edit)
    ↓
SaaSPricingGate + EntitlementSet (P5 — blocked on Delivery; nothing to gate without it)
    ↓
OutreachAgent wire-up (P6 — blocked on Preview URL from Delivery)
```

---

## 7. Roadmap — Phases RL-4.0 through RL-4.6

**Owner: Unassigned — resourcing out of scope for this document. Owner assignment required before sprint planning.**

---

### Phase RL-4.6 — CrawlerEngine v1 (Week 1, parallel to RL-4.0)

Extracted as standalone phase. Unblocks all other phases; can start independently.

**Path:** `packages/agents/src/crawler/index.ts` [NEW]

- [ ] Playwright headless Chromium
- [ ] robots.txt fetch + parse (respect Disallow)
- [ ] Politeness: 1 req / 2s / domain
- [ ] URL dedup: in-memory bloom filter or Redis set
- [ ] Output: `CrawlQueue` prioritized by LeadScore (A-tier first)
- [ ] Error handling: timeout 30s, retry 2x, dead-letter to `failed_crawls`

**Success gates:**
- Crawler respects robots.txt on 10 test domains (verified with mock server)
- Zero duplicate URLs in 1000-URL seed set
- Timeout + retry fires correctly (integration test with mock slow server)

---

### Phase RL-4.0 — Extraction Engine v1 (Week 1–3)

**Paths:**
- `packages/agents/src/extractors/index.mjs` [REPLACE stub]
- `packages/ir-toolkit/src/style-matcher/index.ts` [NEW]

- [ ] SiteExtractor — Playwright DOM capture
  - DOM parse → `RouteInfo[]`
  - CSS computed styles → `DesignTokens` (colors, spacing, typography)
  - SPA detection (`spaDetected` flag in IRPacket v1.1)
  - Screenshot per route → R2/S3 blob key
  - Output: `IRPacket v1.1` with real data
- [ ] StyleMatchEngine — token extraction with confidence scoring
  - Input: CSS computed styles
  - Output: `StyleMatchResult { sourceTokens, confidence, gaps }`
- [ ] IRPacket v1.1 schema patch (see Section 9)
- [ ] 10 real SMB site fixtures (static snapshots for deterministic tests)
- [ ] Tests: extractor unit + style-match unit + integration

**Success gates:**
- `IRPacket.designTokens.colors` non-empty on all 10 fixtures
- Ground truth: human-labeled color tokens per fixture; extractor matches ≥8/10 primary colors (hex within 5% HSL delta)
- `StyleMatchResult.confidence ≥ 0.8` on 8/10 fixtures
- All tests pass

---

### Phase RL-4.1 — Redesign Engine v1 (Week 3–5)

**Paths:**
- `packages/agents/src/redesign/index.mjs` [REPLACE stub]
- `packages/ir-toolkit/src/design-variant-renderer/index.ts` [NEW]

- [ ] RedesignAgent — multi-stage LLM chain
  - Input: `IRPacket + StyleMatchResult`
  - Pass 1: structure (route layout, nav, section order)
  - Pass 2: layout (grid, spacing, breakpoints)
  - Pass 3: component-by-component (inject extracted DesignTokens as CSS custom properties into every prompt; no hallucinated styles)
  - Output: `DesignVariant { html, css, variantId }`
- [ ] DesignVariantRenderer — validate HTML + CSS, enforce token fidelity
  - Replaces PreviewGenerator text output for delivery path
  - PreviewGenerator retained for lead scoring/outreach context
- [ ] Generate 3 variants minimum per site
- [ ] Integration test: SiteExtractor → RedesignAgent → DesignVariantRenderer

**Success gates:**
- Rendered HTML passes W3C HTML validator (0 errors, warnings allowed)
- CSS custom properties match extracted DesignTokens — token drift ≤15% (HSL delta mean across all color tokens)
- 3 variants produced per test site

---

### Phase RL-4.2 — Delivery Pipeline MVP (Week 5–7)

*Blocked on RL-4.1 completing Week 5.*

**Paths:**
- `packages/ir-toolkit/src/site-bundle/index.ts` [NEW]
- `packages/agents/src/delivery/cloudflare-adapter.ts` [NEW]

- [ ] SiteBundle serializer — `DesignVariant[] + assets → SiteBundle { slug, htmlFiles, cssFiles, assetManifest }`
- [ ] Rewrite Labs subdomain hosting (`[slug].rewritelabs.io`) — Cloudflare Workers + R2
- [ ] Custom domain CNAME flow via Cloudflare API
- [ ] Badge injection (`<!-- rl:badge -->` marker) + removal toggle
- [ ] ClaimFlow — SMB receives URL, clicks claim, sets password, gains edit access
  - **Never auto-publish without claim step — legal and trust requirement**

**Success gates:**
- Site live at `[slug].rewritelabs.io` within 60s of bundle upload
- Custom domain resolves within 5min (verified via `dig`)
- Badge present on free tier; absent on claimed + premium

---

### Phase RL-4.3 — Chat Edit Loop (Week 7–9)

*Blocked on RL-4.1 (HTML output) + RL-4.2 (delivery URL). Corrected from v1 which incorrectly started this at Week 3.*

**Paths:**
- `packages/agents/src/chat-editor/index.ts` [NEW]
- `packages/ir-toolkit/src/instruction-parser/index.ts` [NEW]
- `packages/ir-toolkit/src/dom-patch/index.ts` [NEW]

- [ ] ChatEditSession — turn-based editing with history and turn cap
- [ ] DOMPatch applicator — instruction → structured op → deterministic HTML mutation
- [ ] Instruction parser — NL → typed edit op: `ColorChange | TextReplace | LayoutShift | ComponentAdd | ComponentRemove`
- [ ] Turn cap enforcer (free: 50 turns/month, premium: unlimited)
- [ ] Patch cache — `hash(instruction + DOM[:512]) → EditResult` (reduces LLM calls for repeated ops)
- [ ] Preview refresh target: <2s P95

**Success gates:**
- 10 canonical NL instructions produce deterministic `DOMPatch` in regression suite
- Turn counter increments and throws `TURN_CAP_EXCEEDED` at limit
- P95 refresh <2s under load (verify with k6 or autocannon)

---

### Phase RL-4.4 — SaaS Pricing Gate (Week 8–9)

**Path:** `packages/ir-toolkit/src/saas-pricing-gate/index.ts` [NEW]

- [ ] `SaaSPricingGate` — separate from existing `PricingEngine`
  - `EntitlementSet { tier, customDomain, badgeRemoval, editTurnsPerMonth, variantCount, prioritySupport }`
- [ ] Stripe subscription integration (monthly billing)
- [ ] Feature gates: custom domain (premium), badge removal (premium), edit turns (free=50, premium=∞)
- [ ] Stripe webhook handler — idempotent; handles: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

**Unit economics gate (must pass before setting price):**
- Compute actual LLM cost per active customer at 50 free turns from RL-4.3 production token logs
- Compute infrastructure cost from RL-4.2 Cloudflare billing
- Price must yield ≥60% gross margin at 100 active customers

**Success gates:**
- Free → premium conversion flow end-to-end in staging
- Stripe webhook idempotent on duplicate payload delivery
- `EntitlementSet` enforced at API layer for all gated features

---

### Phase RL-4.5 — Outreach Agent v1 (Week 9–11)

**Path:** `packages/agents/src/outreach/index.mjs` [REPLACE stub]

- [ ] Wire to Postmark or SendGrid (choose on deliverability benchmarks; do not default without testing)
- [ ] Outreach sequence: `CrawlResult → LeadScore (tier A/B) → PreviewURL (from RL-4.2) → email`
- [ ] A/B subject line test framework (2 variants minimum, p-value gate before full rollout)
- [ ] CAN-SPAM compliance: unsubscribe link, physical address, opt-out suppression list
- [ ] GDPR compliance: restrict outreach to non-EU domains for MVP (detect via TLD + geo IP); EU expansion requires Article 6(1)(f) legitimate interest assessment documented and approved before enabling

**Success gates:**
- 100 test outreach emails delivered (webhook confirmation), tracked (open/click), suppressed on opt-out
- Zero EU domains in seed set for MVP run

---

## 8. Corrected Timeline (Dependency-Aware)

```
Week    1    2    3    4    5    6    7    8    9    10   11
        |----|----|----|----|----|----|----|----|----|----|
RL-4.6  [CrawlerEngine    ]
RL-4.0  [Extractor + StyleMatch          ]
RL-4.1                    [Redesign Engine          ]
RL-4.2                                   [Delivery MVP    ]
RL-4.3                                              [Chat Edit   ]
RL-4.4                                         [SaaS Gate  ]
RL-4.5                                                   [Outreach   ]
```

---

## 9. File Tree — All New Files

```
packages/
├── agents/
│   ├── src/
│   │   ├── crawler/
│   │   │   └── index.ts                    [NEW — RL-4.6]
│   │   ├── extractors/
│   │   │   └── index.mjs                   [REPLACE stub — RL-4.0]
│   │   ├── redesign/
│   │   │   └── index.mjs                   [REPLACE stub — RL-4.1]
│   │   ├── outreach/
│   │   │   └── index.mjs                   [REPLACE stub — RL-4.5]
│   │   ├── delivery/
│   │   │   └── cloudflare-adapter.ts       [NEW — RL-4.2]
│   │   └── chat-editor/
│   │       └── index.ts                    [NEW — RL-4.3]
│   └── package.json                        [UPDATE — add exports]
│
└── ir-toolkit/
    └── src/
        ├── schemas/
        │   ├── ir.types.ts                 [UPDATE — v1.1 patch]
        │   ├── crawler.types.ts            [NEW]
        │   ├── style-match.types.ts        [NEW]
        │   ├── design-variant.types.ts     [NEW]
        │   ├── site-bundle.types.ts        [NEW]
        │   ├── chat-edit.types.ts          [NEW]
        │   └── saas-pricing.types.ts       [NEW]
        ├── style-matcher/
        │   └── index.ts                    [NEW — RL-4.0]
        ├── design-variant-renderer/
        │   └── index.ts                    [NEW — RL-4.1]
        ├── site-bundle/
        │   └── index.ts                    [NEW — RL-4.2]
        ├── instruction-parser/
        │   └── index.ts                    [NEW — RL-4.3]
        ├── dom-patch/
        │   └── index.ts                    [NEW — RL-4.3]
        └── saas-pricing-gate/
            └── index.ts                    [NEW — RL-4.4]
```

---

## 10. Schema Specifications

### IRPacket v1.1 Patch

Add to existing `ir-toolkit/src/schemas/ir.types.ts`. Backward-compatible; all new fields optional.

```typescript
// Additions to IRPacket.meta:
meta: {
  url: string;
  captureDate: string;
  toolVersion: string;
  spaDetected?: boolean;       // v1.1: true if React/Vue/Angular detected in DOM
  screenshotKeys?: string[];   // v1.1: R2/S3 blob keys, one per route
};

// Addition to IRPacket root:
raw?: unknown;  // v1.1: escape hatch for SPA content or unstructured extraction data
```

### crawler.types.ts

```typescript
export interface CrawlResult {
  url: string;
  status: number;
  redirectChain: string[];
  robotsAllowed: boolean;
  capturedAt: string;
  errorCode?: 'TIMEOUT' | 'ROBOTS_BLOCKED' | 'NETWORK_ERROR' | 'STATUS_ERROR';
}

export interface CrawlQueueItem {
  url: string;
  leadTier?: 'A' | 'B' | 'C' | 'D';
  priority: number;
  enqueuedAt: string;
  attempts: number;
}

export interface CrawlerConfig {
  politenesDelayMs: number;    // default: 2000
  timeoutMs: number;           // default: 30000
  maxRetries: number;          // default: 2
  userAgent: string;
  dedupBackend: 'memory' | 'redis';
  redisUrl?: string;
}
```

### style-match.types.ts

```typescript
import type { DesignTokens } from './ir.types.js';

export type StyleGapReason = 'ambiguous' | 'missing' | 'conflict';

export interface StyleGap {
  token: string;
  reason: StyleGapReason;
  rawValue?: string;
}

export interface StyleMatchResult {
  sourceTokens: DesignTokens;
  confidence: number;          // 0.0–1.0; gate: ≥0.8 required for redesign
  gaps: StyleGap[];
  spaWarning?: boolean;        // true if SPA detected; tokens may be incomplete
}

export interface StyleMatchConfig {
  confidenceThreshold?: number; // default: 0.8
  includeRawValues?: boolean;
}
```

### design-variant.types.ts

```typescript
export interface DesignVariant {
  variantId: string;
  siteId: string;
  generatedAt: string;
  html: string;
  css: string;
  tokenDriftScore: number;     // 0.0–1.0; gate: ≤0.15 required
  w3cValid: boolean;
  w3cErrors: W3CError[];
}

export interface W3CError {
  line: number;
  col: number;
  message: string;
  type: 'error' | 'warning';
}

export interface RenderResult {
  variant: DesignVariant;
  passed: boolean;
  failures: string[];
}
```

### site-bundle.types.ts

```typescript
export interface SiteBundle {
  slug: string;
  siteId: string;
  createdAt: string;
  htmlFiles: Record<string, string>;    // path → HTML; '/' → index.html
  cssFiles: Record<string, string>;
  assetManifest: AssetManifestEntry[];
  badgeInjected: boolean;
}

export interface AssetManifestEntry {
  originalUrl: string;
  blobKey: string;
  contentType: string;
  sizeBytes: number;
}

export interface DeployResult {
  slug: string;
  liveUrl: string;
  deployedAt: string;
  ttlSeconds: number;          // 0 = permanent
}

export interface ClaimFlowState {
  siteId: string;
  slug: string;
  claimed: boolean;
  claimedAt?: string;
  customDomain?: string;
  entitlementTier: 'free' | 'premium';
}
```

### chat-edit.types.ts

```typescript
export type EditOpType =
  | 'ColorChange'
  | 'TextReplace'
  | 'LayoutShift'
  | 'ComponentAdd'
  | 'ComponentRemove';

export interface EditOp {
  type: EditOpType;
  selector?: string;
  property?: string;
  value?: string;
  content?: string;
  componentHtml?: string;
}

export interface DOMDiff {
  selector: string;
  before: string;
  after: string;
  op: EditOpType;
}

export interface EditResult {
  success: boolean;
  updatedDOM: string;
  diff: DOMDiff;
  tokensUsed: number;
  errorMessage?: string;
}

export interface EditTurn {
  instruction: string;
  parsedOp: EditOp;
  diffApplied: DOMDiff;
  timestamp: string;
  tokensUsed: number;
}

export interface ChatEditConfig {
  freeTurnCap: number;         // default: 50
  patchCacheEnabled?: boolean; // default: true
}
```

### saas-pricing.types.ts

```typescript
export type EntitlementTier = 'free' | 'premium';

export interface EntitlementSet {
  tier: EntitlementTier;
  customDomain: boolean;
  badgeRemoval: boolean;
  editTurnsPerMonth: number;   // free: 50, premium: Infinity
  variantCount: number;        // free: 1, premium: 3
  prioritySupport: boolean;
}

export interface SubscriptionRecord {
  customerId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  tier: EntitlementTier;
  createdAt: string;
  currentPeriodEnd?: string;
}

export interface PricingGateConfig {
  freeEditTurns: number;
  premiumPriceMonthly: number; // cents; set after RL-4.4 unit economics gate
  stripePriceId: string;
}

export const FREE_ENTITLEMENTS: EntitlementSet = {
  tier: 'free',
  customDomain: false,
  badgeRemoval: false,
  editTurnsPerMonth: 50,
  variantCount: 1,
  prioritySupport: false,
};

export const PREMIUM_ENTITLEMENTS: EntitlementSet = {
  tier: 'premium',
  customDomain: true,
  badgeRemoval: true,
  editTurnsPerMonth: Infinity,
  variantCount: 3,
  prioritySupport: true,
};
```

---

## 11. `@cic/agents` package.json Update

```json
{
  "name": "@cic/agents",
  "version": "1.1.0",
  "type": "module",
  "main": "./index.mjs",
  "exports": {
    ".": "./index.mjs",
    "./extractors": "./src/extractors/index.mjs",
    "./redesign": "./src/redesign/index.mjs",
    "./outreach": "./src/outreach/index.mjs",
    "./crawler": "./src/crawler/index.js",
    "./delivery": "./src/delivery/cloudflare-adapter.js",
    "./chat-editor": "./src/chat-editor/index.js"
  }
}
```

---

## 12. Test Matrix

| Phase | File | Test Type | Gate Condition |
|---|---|---|---|
| RL-4.6 | `crawler/index.ts` | Unit | robots.txt blocked on 10 mock domains; 0 dups in 1000-URL seed; retry fires on 503 |
| RL-4.0 | `extractors/index.mjs` | Integration | `IRPacket.designTokens.colors` non-empty on 10 SMB fixtures; `spaDetected` correct on 3 SPA fixtures |
| RL-4.0 | `style-matcher/index.ts` | Unit | `confidence ≥ 0.8` on 8/10 fixtures; HSL delta ≤0.05 for primary color match |
| RL-4.1 | `redesign/index.mjs` | Integration | 3 variants; HTML W3C-valid; `tokenDriftScore ≤ 0.15` |
| RL-4.2 | `cloudflare-adapter.ts` | E2E | Site live <60s; CNAME propagation via `dig` |
| RL-4.3 | `chat-editor/index.ts` | Regression | 10 canonical NL instructions → deterministic DOMPatch; turn cap throws at limit |
| RL-4.3 | `dom-patch/index.ts` | Unit | Each `EditOpType` correct on 5 HTML fixtures |
| RL-4.4 | `saas-pricing-gate/index.ts` | Unit | Stripe webhook idempotent on duplicate payload; `assertFeatureAllowed` throws on free tier |
| RL-4.5 | `outreach/index.mjs` | Integration | 100 emails delivered + tracked; opt-out suppression fires; zero EU domains |

---

## 13. Risks and Mitigations

| Risk | P | Impact | Mitigation |
|---|---|---|---|
| Style extraction fidelity <80% on SPAs (React/Vue) | HIGH | Repaint beats on core UX | Detect SPA in extractor; add `raw` escape hatch in IRPacket v1.1; do not ship RL-4.1 until RL-4.0 gate passes on SPA fixtures |
| Chat edit LLM cost exceeds pricing floor | MEDIUM | Margin collapse | 50-turn free cap enforced by `EntitlementSet`; cache identical DOMPatch ops (`hash(instruction + DOM[:512])`) |
| Repaint adds outbound discovery before RL-4.5 ships | MEDIUM | Moat collapses | Repaint already has delivery infra; RL must ship extraction + delivery (RL-4.0–4.2) before Repaint pivots — these phases are the race |
| CAN-SPAM / GDPR violation in outreach | MEDIUM | Legal liability | Opt-out required every email; EU excluded from MVP; Article 6(1)(f) assessment required before EU expansion |
| IRPacket v1.0 schema too rigid for real-world sites | MEDIUM | Extractor fails on edge cases | Ship IRPacket v1.1 with `raw?: unknown` escape hatch before RL-4.0 merges |
| Zero-touch delivery auto-publishes without consent | HIGH | Trust + legal | ClaimFlow is mandatory — SMB must claim before site goes live; no silent publish |
| Existing PricingEngine misread as SaaS-compatible | RESOLVED | Sprint wasted | Agency engine retained as-is; `SaaSPricingGate` built separately in RL-4.4 |

---

## 14. Competitive Positioning Delta

| Dimension | Repaint | Rewrite Labs (post RL-4.0–4.6) |
|---|---|---|
| Customer acquisition | Inbound only | Outbound automated |
| Time to first site | User initiates, ~5 min | System initiates, 0 user time |
| Editing model | Chat UI (live today) | Chat UI (ships RL-4.3) |
| Hosting | Repaint cloud | `*.rewritelabs.io` + custom domain |
| Pricing | $30/month SaaS | TBD — set after RL-4.4 unit economics gate |
| Lead scoring | None | LeadScoringEngine: tier A/B/C/D (shipped) |
| Governance | None | CIC layer (shipped) |
| SMB segment reached | Active seekers only | Active seekers + latent demand |
| Moat defense | Inbound UX + delivery | Outbound scale + scoring + CIC governance |

**Critical path:** RL-4.0 (extraction) → RL-4.1 (redesign) → RL-4.2 (delivery). These three phases constitute the competitive race. Everything after is product differentiation, not survival.

**Build order:** `CrawlerEngine → Extractor → StyleMatch → Redesign → Delivery → Chat → SaaS Pricing → Outreach`. Each phase independently shippable. Nothing ships before its blocker is complete.
