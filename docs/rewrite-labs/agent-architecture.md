# Rewrite Labs Agent Architecture
*(Stage-by-stage pipeline mapping and execution models)*

This document details how the **CIC Agent Design Guide** principles are implemented across the core stages of the **Rewrite Labs** website modernization platform.

---

## 1. Pipeline Overview

The Rewrite Labs pipeline is an autonomous, deterministic, and audited sequence of stages:

```
[Discovery] ──▶ [Extraction] ──▶ [Redesign] ──▶ [Outreach] ──▶ [Optimization]
```

Each stage is executed by a dedicated, sandboxed agent that conforms to the Section 11 specifications.

---

## 2. Pipeline Agents

### 2.1 Discovery Agent (`cic.agents.labs.discovery`)
- **Purpose:** Crawls, maps, and analyzes a target website to build a structured page graph.
- **Forge Field Alignment:**
  - *Field Awareness:* Monitors crawling depth and page count limits.
  - *Bounded Authority:* Allowed to make outgoing HTTP requests only to the target domain. Forbidden from writing to external databases.
- **Harness & Phases:**
  - `validate`: Enforces target URL format and scanning scope.
  - `execute`: Crawls target site, parses sitemaps, extracts page metadata.
  - `emit`: Outputs a JSON page graph mapping sitemaps and page relationships.

### 2.2 Extractor Agent (`cic.agents.labs.extractor`)
- **Purpose:** Ingests raw HTML/CSS/JS from crawled pages and extracts structured semantic assets (copy, branding guidelines, images, color palettes).
- **Forge Field Alignment:**
  - *Minimal Footprint:* Operates entirely offline inside a local file sandbox. Releases files immediately after extraction.
  - *Signal Fidelity:* Must extract verbatim text and actual CSS values. No paraphrasing or embellishments allowed during this phase.
- **Harness & Phases:**
  - `validate`: Enforces that raw page content is present and fits within context limits.
  - `execute`: Leverages specialized LLM parsers to extract semantic content.
  - `emit`: Outputs structured JSON assets (e.g., brand guidelines, text content).

### 2.3 Redesign Agent (`cic.agents.labs.redesign`)
- **Purpose:** Leverages GPU inference models to generate modern layout options based on extracted brand assets.
- **Forge Field Alignment:**
  - *Brain vs. Hands:* The brain (harness) plans the layouts, while the hands (GPU renderer) generate and compile the assets.
  - *Checkpoint Integrity:* Writes checkpoints after rendering each layout variant to prevent GPU resources from being wasted on full restarts.
- **Harness & Phases:**
  - `validate`: Enforces input brand guidelines and content assets.
  - `plan`: Sequences variant generation (e.g., Variant A: Modern Minimalist, Variant B: Bento Grid).
  - `execute`: Generates layout markup (HTML/CSS) and invokes styling pipelines.
  - `review`: Validates that layout conforms to responsive CSS requirements and color contrast standards.
  - `emit`: Outputs multiple design variants.

### 2.4 Outreach Agent (`cic.agents.labs.outreach`)
- **Purpose:** Automatically drafts personalized outreach campaigns for target prospects showing their redesigned site variants.
- **Forge Field Alignment:**
  - *Signal Fidelity:* Personalization details (names, company facts) must be strictly verified against discovery outputs.
  - *Failure Transparency:* Fails gracefully if prospect contact info cannot be verified, logging it as a recoverable validation issue.
- **Harness & Phases:**
  - `validate`: Verifies prospect contact data and redesign links.
  - `execute`: Drafts personalized copy and matches it with generated image/video walk-through assets.
  - `emit`: Prepares the email payload for the orchestrator email service.

### 2.5 Optimization Agent / CLOE (`cic.agents.labs.optimization`)
- **Purpose:** Monitors A/B testing campaign analytics (open rates, click-through rates, conversion metrics) and tunes generation parameters for subsequent redesign runs.
- **Forge Field Alignment:**
  - *One Metric:* Evaluates long-term success metrics to determine which design variants convert best.
  - *Dreaming:* Conducts weekly analyses of campaign metrics to rewrite prompt optimization strategies.
- **Harness & Phases:**
  - `validate`: Ingests telemetry data from the campaign database.
  - `execute`: Correlates layout styles with conversion rates.
  - `emit`: Publishes updated generation parameters (e.g., temperature adjustments, component weights) to the registry config.

---

## 3. Communication and Governance

All interactions between these agents are governed by the **CIC Orchestrator**. No stage may pass data to another stage directly. All intermediate outputs are written to the immutable **Lineage Registry** and checked against each stage's declared `output.v1.schema.json`.
