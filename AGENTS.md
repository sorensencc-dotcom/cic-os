---
ijfw_version: 1.3.2
ijfw_schema: 1
type: mixed
primary_type: mixed
secondary_types:
  - software
  - design
confidence: 0.843
detected_at: 2026-06-11T05:33:26.420Z
signals:
  - kind: manifest
    weight: 0.9
    manifests: [Makefile, package.json, package.json, package.json, pyproject.toml, Makefile]
  - kind: dir_business
    weight: 0.4
    name: finance
  - kind: dir_business
    weight: 0.4
    name: finance
  - kind: dir_business
    weight: 0.4
    name: finance
  - kind: dir_design
    weight: 0.4
    name: design
  - kind: dir_design
    weight: 0.4
    name: assets
  - kind: dir_design
    weight: 0.4
    name: assets
  - kind: file_extension_ratio
    weight: 0.7
    domain: software
    ratio: 0.989
    count: 2100
  - kind: filename_pattern
    weight: 0.3
    domain: design
    name: wireframes.txt
  - kind: filename_pattern
    weight: 0.3
    domain: design
    name: wireframes.txt
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: post-applypatch
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: post-checkout
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: post-commit
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: post-merge
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: post-rewrite
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo-checklist.md
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: post-templates.md
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo_checker.py
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo_health_scorer.py
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo-audit-reference.md
  - kind: filename_pattern
    weight: 0.4
    domain: content
    name: brand_voice_analyzer.py
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo_optimizer.py
  - kind: filename_pattern
    weight: 0.4
    domain: content
    name: brand_voice_analysis_example.md
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo_optimization_example.md
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo-audit.md
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo-auditor.md
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo-auditor.md
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo-audit
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: post-mortem
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo-audit
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: post-mortem
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: post-mortem
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo-audit
  - kind: filename_pattern
    weight: 0.2
    domain: content
    name: seo-auditor.md
  - kind: filename_pattern
    weight: 0.3
    domain: design
    name: wireframes.txt
---
# AGENTS.md

This file follows the open AGENTS.md spec (https://agents.md/) and is the
canonical agent-instructions surface for this project. Platform-specific
files (CLAUDE.md, GEMINI.md, WAYLAND.md, codex/AGENTS.md, .cursorrules,
.windsurfrules, copilot-instructions.md) are thin adapters that point here.

Five IJFW-managed regions live in this file. Content outside the markers is
yours -- IJFW will never touch it.

| Region | Purpose |
|---|---|
| MEMORY | Project memory recalled from `.ijfw/memory/` |
| ROUTING | Platform skill-routing rules |
| AGENTS | Registered agent roster |
| BLACKBOARD | Multi-CLI orchestration scratchpad (Pillar B) |
| DISCIPLINE | Per-domain discipline rules (code \| narrative \| business \| design \| research) |

<!-- IJFW-MEMORY-START -->
Project memory at .ijfw/memory/. Call `ijfw_memory_prelude` for full context.
<!-- IJFW-MEMORY-END -->

<!-- IJFW-ROUTING-START -->
<!-- IJFW-ROUTING-END -->

<!-- IJFW-AGENTS-START -->
No project agents yet. Run `ijfw team` to set them up.
<!-- IJFW-AGENTS-END -->

<!-- IJFW-BLACKBOARD-START -->
<!-- Reserved for Pillar B multi-CLI orchestration. Empty in alpha. -->
<!-- IJFW-BLACKBOARD-END -->

<!-- IJFW-DISCIPLINE-START -->
<!-- IJFW-DISCIPLINE-END -->
