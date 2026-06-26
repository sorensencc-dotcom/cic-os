# CIC Agent Template Guide
*(Reusable python templates, schemas, and test suites)*

This guide describes how to use the drop-in agent template to quickly create new deterministic, phase-based agents for the CIC and Rewrite Labs ecosystem.

---

## 1. Directory Layout

A compliant CIC agent has the following layout in the repository:

```
agents/<domain>/<agent_name>/
├── agent.manifest.yaml          ← identity, phases, permissions, SLOs
├── agent.py                     ← Router + phase implementations
├── schemas/
│   ├── input.v1.schema.json     ← strict input envelope schema
│   └── output.v1.schema.json    ← strict output envelope schema
└── tests/
    └── test_agent.py            ← unit, integration, failure, and determinism tests
```

---

## 2. Template Files

The template files are maintained under the [claude-skills/templates/cic-agent/](file:///c:/dev/claude-skills/templates/cic-agent/) directory:

- **[agent.manifest.yaml](file:///c:/dev/claude-skills/templates/cic-agent/agent.manifest.yaml):** Specifies the metadata, phase read/write key permissions, tools, and error modes.
- **[agent.py](file:///c:/dev/claude-skills/templates/cic-agent/agent.py):** Implements `CICAgentTemplate` (core phases `validate`, `execute`, `emit`) and `AgentRouter` (deserialization, plan selection, phase sequencing).
- **[input.v1.schema.json](file:///c:/dev/claude-skills/templates/cic-agent/schemas/input.v1.schema.json):** Standard, strict schema for input envelopes.
- **[output.v1.schema.json](file:///c:/dev/claude-skills/templates/cic-agent/schemas/output.v1.schema.json):** Standard, strict schema for output envelopes.
- **[test_agent.py](file:///c:/dev/claude-skills/templates/cic-agent/tests/test_agent.py):** Pytest suite covering all 7 test categories required by Section 11 of `AGENTS.md`.

---

## 3. Customization Guide

To create a new agent (e.g. a `semantic_search` agent in the `retrieval` domain):

1. **Copy the Template:** Copy the files from `claude-skills/templates/cic-agent/` to your target directory:
   ```bash
   mkdir -p agents/retrieval/semantic_search/schemas
   mkdir -p agents/retrieval/semantic_search/tests
   cp claude-skills/templates/cic-agent/agent.manifest.yaml agents/retrieval/semantic_search/
   cp claude-skills/templates/cic-agent/agent.py agents/retrieval/semantic_search/
   cp claude-skills/templates/cic-agent/schemas/*.json agents/retrieval/semantic_search/schemas/
   cp claude-skills/templates/cic-agent/tests/test_agent.py agents/retrieval/semantic_search/tests/
   ```

2. **Customize the Manifest:** Update the following fields in `agent.manifest.yaml`:
   - `id`: Set to `cic.agents.retrieval.semantic_search`.
   - `display_name`, `description`, `author`.
   - `permissions.call`: Declare all tools your agent is permitted to execute.
   - `slo`: Set `latency_p99_ms` and `timeout_ms` bounds.

3. **Define Custom Schemas:**
   - In `schemas/input.v1.schema.json`, add domain-specific input parameters (e.g., `depth`, `algorithm`).
   - In `schemas/output.v1.schema.json`, describe the exact properties returned in the `result` field.

4. **Implement Core Logic:** Update `agent.py`:
   - Extend `ValidatedInput` and `CandidateOutput` data classes.
   - Customize `validate()` to check your domain-specific input fields.
   - Implement `_execute_core()` with your business logic. Use `self._call_tool()` for tool invocations.

5. **Write Tests:** Add test cases in `tests/test_agent.py` to cover custom validation bounds and mock tool behaviors.

---

## 4. Verification and Registration

| Operation | Command |
|---|---|
| Run Pytest suite | `pytest tests/ -v` |
| Verify coverage | `pytest tests/ --cov=agent --cov-report=term-missing` |
| Validate manifest format | `cic agent validate ./agent.manifest.yaml` |
| Register with Registry | `cic agent register ./agent.manifest.yaml` |
