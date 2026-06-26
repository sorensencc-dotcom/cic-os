# Rewrite Labs Sub-Roadmap v3.0

**Version:** 3.1.0  
**Date:** 2026-06-13  
**Parent:** [MASTER_ROADMAP_v3.0.md](MASTER_ROADMAP_v3.0.md)  
**Source:** [docs/strategy/REWRITE_LABS_TEARDOWN_AND_BUILD_PLAN_v1.0.md](../strategy/REWRITE_LABS_TEARDOWN_AND_BUILD_PLAN_v1.0.md)

---

## 0. Scope

Rewrite Labs is the outbound web rebuild product built on top of CIC shared infrastructure. This sub-roadmap covers phases RL-4.0 through RL-4.6 — the critical path from zero delivery capacity to a functioning outbound SMB rebuild pipeline.

Shared systems (IR Toolkit, Agents shell, TorqueQuery) are defined in MASTER_ROADMAP_v3.0.md.

---

## 1. Current State (Repo-Verified 2026-06-13)

**What's shipped:**
- IR Schema (IRPacket v1.0) — `ir-toolkit/src/schemas/ir.types.ts`
- LeadScoringEngine — `ir-toolkit/src/lead-scorer/score.ts`
- PreviewGenerator (text narratives only) — `ir-toolkit/src/preview-generator/generator.ts`
- PricingEngine (agency quote model, $75k–$150k+ tiers) — `ir-toolkit/src/pricing-engine/generator.ts`
- **RL-4.6 ✅** CrawlerEngine v1 — `agents/src/crawler/index.ts`; robots.txt, bloom-filter dedup, dead-letter, 13 tests (commit `c1fd489`)
- **RL-4.0 ✅** Extraction Engine v1 — `agents/src/extractors/dom.ts` (DomExtractor, node-html-parser), `agents/src/extractors/style-engine.ts` (StyleMatchEngine), `agents/src/orchestrator.ts` (RewriteLabsOrchestrator), IRPacket v1.1 (`cssMetrics` field), CrawlerEngine v1.1 (`rawHtml`/`contentType`); 56 tests (commit `bcc7289`)
- **RL-4.1 🟡 SCAFFOLDED** Browser extraction layer — `PlaywrightExtractor` (stub, `extract()` returns null pending real Playwright wiring), `ComputedStylesAnalyzer`, `IRPacketV12Builder`, `WcagValidator`, `AccessibilityAuditor`; foundry Docker image `rl-agents:latest` (368MB, Chromium included) (commit `8e0c7c5`)

**What's stubs:**
- `PlaywrightExtractor.extract()` — returns null; interfaces + container ready, real browser wiring is RL-4.1 remaining work
- RedesignAgent — `agents/src/redesign/index.mjs` (version string only)
- OutreachAgent — `agents/src/outreach/index.mjs` (version string only)

**What's missing entirely:**
- DesignVariantRenderer, SiteBundle, DeploymentAdapter, ChatEditSession, DOMPatch, SaaSPricingGate

**Critical pricing model note:** Existing PricingEngine is an **agency quote engine**, not SaaS. It outputs $75k–$150k+ project estimates. Do not refactor it. Build `SaaSPricingGate` as a separate system in RL-4.4.

---

## 2. Build Order (Strict Dependency Chain)

```
RL-4.6 CrawlerEngine (Week 1) — unblocks all below
    ↓
RL-4.0 SiteExtractor + StyleMatchEngine (Week 1–3)
    ↓
RL-4.1 RedesignAgent + DesignVariantRenderer (Week 3–5)
    ↓
RL-4.2 SiteBundle + DeploymentAdapter + Delivery (Week 5–7)
    ↓                     ↓
RL-4.3 ChatEditSession   RL-4.4 SaaSPricingGate
        (Week 7–9)               (Week 8–9)
    ↓
RL-4.5 OutreachAgent (Week 9–11)
```

---

## 3. Phase Details

### Phase RL-4.6 — CrawlerEngine v1 (Week 1, parallel)

**Owner:** TBD  
**Path:** `packages/agents/src/crawler/index.ts` [NEW]

Deliverables:
- Playwright headless Chromium
- robots.txt fetch + parse (respect Disallow)
- Politeness: 1 req / 2s / domain
- URL dedup: bloom filter (memory) or Redis (production)
- `CrawlResult { url, status, redirectChain, robotsAllowed, capturedAt, errorCode? }`
- `CrawlQueue` prioritized by LeadScore tier
- Error handling: timeout 30s, retry 2x, dead-letter to `failed_crawls`

Success gates:
- robots.txt blocked on 10 mock domains (mock server test)
- Zero duplicates in 1000-URL seed set
- Timeout + retry fires on simulated 503

Note: RL-4.6 is the MVP single-site crawler for fixture extraction. TorqueQuery (Phase 26) replaces it at scale. Design for easy swap.

---

### Phase RL-4.0 — Extraction Engine v1 (Week 1–3)

**Owner:** TBD  
**Paths:**
- `packages/agents/src/extractors/index.mjs` [REPLACE stub]
- `packages/ir-toolkit/src/style-matcher/index.ts` [NEW]
- `packages/ir-toolkit/src/schemas/ir.types.ts` [UPDATE — v1.1 patch]
- `packages/ir-toolkit/src/schemas/style-match.types.ts` [NEW]

Deliverables:
- SiteExtractor — Playwright DOM capture
  - DOM parse → `RouteInfo[]`
  - CSS computed styles → `DesignTokens`
  - SPA detection (`spaDetected` flag)
  - Screenshot per route → R2/S3 blob key (`screenshotKeys[]`)
  - Output: IRPacket v1.1
- StyleMatchEngine
  - Input: CSS computed styles
  - Output: `StyleMatchResult { sourceTokens, confidence, gaps, spaWarning? }`
  - `confidence: number` — 0.0–1.0; gate threshold: ≥0.8
- IRPacket v1.1 patch (backward-compatible, all new fields optional):
  - `meta.spaDetected?: boolean`
  - `meta.screenshotKeys?: string[]`
  - `raw?: unknown` (SPA escape hatch)
- 10 real SMB site static snapshots as test fixtures

Success gates:
- `IRPacket.designTokens.colors` non-empty on all 10 fixtures
- ≥8/10 primary colors matched (HSL delta ≤0.05 vs human-labeled ground truth)
- `StyleMatchResult.confidence ≥ 0.8` on 8/10 fixtures
- All extractor unit + integration tests pass

---

### Phase RL-4.1 — Redesign Engine v1 (Week 3–5)

**Owner:** TBD  
**Paths:**
- `packages/agents/src/redesign/index.mjs` [REPLACE stub]
- `packages/ir-toolkit/src/design-variant-renderer/index.ts` [NEW]
- `packages/ir-toolkit/src/schemas/design-variant.types.ts` [NEW]

Deliverables:
- RedesignAgent — 3-pass LLM chain
  - Pass 1: structure (route layout, section order)
  - Pass 2: layout (grid, spacing, breakpoints)
  - Pass 3: component-by-component (inject extracted DesignTokens as CSS custom properties; no hallucinated styles)
  - Output: `DesignVariant { variantId, siteId, html, css, tokenDriftScore, w3cValid, w3cErrors }`
- DesignVariantRenderer — validate output
  - W3C HTML validator (0 errors; warnings allowed)
  - Token drift check (HSL delta mean ≤0.15 across all color tokens)
  - Replaces PreviewGenerator for delivery path; PreviewGenerator retained for lead scoring/outreach
- 3 variants minimum per site

Success gates:
- Rendered HTML passes W3C validator (0 errors)
- Token drift ≤0.15
- 3 variants produced per test site
- Integration test: SiteExtractor → RedesignAgent → DesignVariantRenderer pipeline passes

---

### Phase RL-4.2 — Delivery Pipeline MVP (Week 5–7)

**Owner:** TBD  
**Paths:**
- `packages/ir-toolkit/src/site-bundle/index.ts` [NEW]
- `packages/ir-toolkit/src/schemas/site-bundle.types.ts` [NEW]
- `packages/agents/src/delivery/cloudflare-adapter.ts` [NEW]

Deliverables:
- SiteBundle serializer
  - Input: `DesignVariant[] + assets`
  - Output: `SiteBundle { slug, siteId, htmlFiles, cssFiles, assetManifest, badgeInjected }`
- Cloudflare Workers + R2 hosting (`[slug].rewritelabs.io`)
- Custom domain CNAME flow via Cloudflare API
- Badge injection (`<!-- rl:badge -->` marker) + removal toggle
- ClaimFlow — SMB receives URL, clicks claim, sets password, gains edit access
  - **No auto-publish without claim step — legal and trust requirement**
  - `ClaimFlowState { siteId, slug, claimed, claimedAt?, customDomain?, entitlementTier }`

Success gates:
- Site live at `[slug].rewritelabs.io` within 60s of bundle upload
- Custom domain resolves within 5min (tested via `dig`)
- Badge present on free tier; absent on claimed + premium

---

### Phase RL-4.3 — Chat Edit Loop (Week 7–9)

**Owner:** TBD  
**Paths:**
- `packages/agents/src/chat-editor/index.ts` [NEW]
- `packages/ir-toolkit/src/instruction-parser/index.ts` [NEW]
- `packages/ir-toolkit/src/dom-patch/index.ts` [NEW]
- `packages/ir-toolkit/src/schemas/chat-edit.types.ts` [NEW]

Deliverables:
- ChatEditSession — turn-based editor
  - `apply(instruction: string): Promise<EditResult>`
  - `diff(): DOMDiff[]`
  - `history: EditTurn[]` (each turn stores `tokensUsed` for cost tracking)
  - Patch cache: `hash(instruction + DOM[:512]) → EditResult` (reduces LLM calls)
- DOMPatch applicator: instruction → `EditOp` → deterministic HTML mutation
- InstructionParser: NL → typed edit op (`ColorChange | TextReplace | LayoutShift | ComponentAdd | ComponentRemove`)
- Turn cap enforcer: free = 50 turns/month, premium = unlimited; throws `TURN_CAP_EXCEEDED`
- Preview refresh target: <2s P95

Success gates:
- 10 canonical NL instructions produce deterministic `DOMPatch` in regression suite
- Turn counter increments; throws at cap
- P95 refresh <2s under load (k6 or autocannon)

---

### Phase RL-4.4 — SaaS Pricing Gate (Week 8–9)

**Owner:** TBD  
**Path:** `packages/ir-toolkit/src/saas-pricing-gate/index.ts` [NEW]

Deliverables:
- `SaaSPricingGate` — separate from existing `PricingEngine`
  - `entitlementsFor(tier): EntitlementSet`
  - `createCheckoutSession(customerId, successUrl, cancelUrl): Promise<string>`
  - `handleWebhook(rawBody, signature): Promise<SubscriptionRecord | null>` — idempotent
  - `assertFeatureAllowed(entitlements, feature): void` — throws `ENTITLEMENT_DENIED`
- `EntitlementSet`: free = `{ editTurnsPerMonth: 50, variantCount: 1, customDomain: false, badgeRemoval: false }`; premium = `{ editTurnsPerMonth: Infinity, variantCount: 3, customDomain: true, badgeRemoval: true }`
- Stripe subscription (monthly billing)
- Feature gates enforced at API layer

**Unit economics gate (must pass before setting price):**
- Compute actual LLM cost per active customer at 50 free turns from RL-4.3 production token logs
- Compute infrastructure cost per site from RL-4.2 Cloudflare billing
- Price must yield ≥60% gross margin at 100 active customers

Success gates:
- Free → premium conversion flow end-to-end in staging
- Stripe webhook idempotent on duplicate payload delivery
- `EntitlementSet` enforced at API layer for all gated features

---

### Phase RL-4.5 — Outreach Agent v1 (Week 9–11)

**Owner:** TBD  
**Path:** `packages/agents/src/outreach/index.mjs` [REPLACE stub]

Deliverables:
- Email provider integration (Postmark or SendGrid — choose on deliverability benchmarks; do not default without testing)
- Outreach sequence: `CrawlResult → LeadScore (tier A/B) → PreviewURL (from RL-4.2) → email`
- A/B subject line framework (2 variants minimum; p-value gate before full rollout)
- CAN-SPAM compliance: unsubscribe link, physical address, opt-out suppression list
- GDPR compliance: EU domains excluded from MVP; EU expansion requires Article 6(1)(f) legitimate interest assessment documented before enabling (detect EU by TLD + geo IP)

Success gates:
- 100 test outreach emails delivered (webhook confirmation), tracked (open/click), suppressed on opt-out
- Zero EU domains in MVP seed set

---

## 4. Corrected Timeline

```
Week    1    2    3    4    5    6    7    8    9    10   11
        |----|----|----|----|----|----|----|----|----|----|
RL-4.6  [CrawlerEngine    ]
RL-4.0  [Extractor + StyleMatch          ]
RL-4.1                    [Redesign Engine          ]
RL-4.2                                   [Delivery MVP    ]
RL-4.3                                              [Chat Edit   ]
RL-4.4                                         [SaaS Gate  ]
RL-4.5                                                   [Outreach    ]
```

---

## 5. Competitive Positioning

**Repaint owns:** Inbound motivated SMBs. URL → rebuilt site in ~5 min. Chat editing (live today). Flat $30/month SaaS.

**Rewrite Labs' defensible ground:** Outbound latent-demand SMBs. Zero-touch prospecting. Lead scoring. CIC governance. Scale without inbound spend.

**The race:** RL-4.0 (extraction) → RL-4.1 (redesign) → RL-4.2 (delivery). Repaint already has delivery infrastructure. If Repaint adds outbound discovery before RL-4.2 ships, Rewrite Labs' moat collapses. These three phases are the competitive survival path.

**Build priority:** CrawlerEngine → Extractor → StyleMatch → Redesign → Delivery → Chat → SaaS Pricing → Outreach. Nothing ships before its blocker completes.
