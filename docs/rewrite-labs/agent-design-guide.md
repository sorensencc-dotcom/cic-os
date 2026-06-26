# CIC Agent Design Guide
*(Operator-grade, deterministic, reproducible, Phase-aligned)*

This guide translates the general **Forge Field** agentic design principles into the deterministic **CIC (Conversational Intelligence Core)** architecture, constraints, and primitives.

---

## 1. CIC's One Metric: Agent Time Horizon

In CIC, the agent's **Time Horizon** is a measurable, logged, and eval-driven metric:
> **"How long can an agent maintain coherent state across Phase boundaries without drift?"**

We track this horizon via three mechanisms:
- **State-Drift Logs:** Periodic diffing of state snapshots across runs.
- **Coherence Tests:** Deterministic evals executed inside the **Verification Sandbox**.
- **Phase-Boundary Regression:** Automated checks confirming the agent survives infrastructure and model upgrades.

This metric is integrated into the CIC Observability Dashboard to monitor agent health over time.

---

## 2. CIC Operating Principles

### 2.1 Build for the Next Model, Not the Current One
- Keep **agent harnesses thin** and focused on planning, sequencing, and rubric verification.
- Keep **model adapters swappable** via a clean adapter layer.
- Keep **Phase evolution deterministic** to isolate model logic from orchestration logic.
- *Rule:* Never bake model-specific prompts or idiosyncrasies into agent core code. Use **Model Adapter Layers**.

### 2.2 Write Evals for What Doesn't Work Yet
Extend the CIC Verification Sandbox with:
- **Failure-First Evals:** Tests that fail today for capabilities planned for future phases.
- **Phase-Gated Evals:** Evals that unlock new agent behaviors only when passed.
- **Long-Horizon Evals:** Multi-step, multi-file, multi-run test suites.
When failure-first evals pass, the *CIC Evolution Agent* is triggered to hot-swap the registry and integrate the updated capabilities.

### 2.3 Treat Upgrades as Config Changes
In the CIC ecosystem, all changes must be configuration-driven:
- Model versions = **config**
- Agent skill sets = **config**
- Memory schemas = **config**
- Sandbox capabilities = **config**
Upgrades should never require refactoring agent logic.

### 2.4 Brain vs. Hands (Harness vs. Sandbox)
Forge's "brain decides, hands execute" principle maps directly to CIC:
- **Brain:** The CIC Agent Harness (decision policy, outcome rubric, planning).
- **Hands:** The CIC Sandbox (execution, file ops, API calls, and local tooling).

---

## 3. CIC Agent Ingredients

### 3.1 Harness (CIC Brain Layer)
Defines the outcome rubric, decision policy, skill invocation graph, and phase-aware planning. The harness code must be deterministic, audit-logged, and fully reproducible.

### 3.2 Context (CIC Memory + Disk + Skills)
- **Disk-Backed Memory Files:** Persistent memory snapshots stored per agent.
- **Self-Authored Skills:** Skills generated/optimized by the Evolution Agent.
- **Dreaming:** Phase-boundary retrospectives where agents review their own runs and propose skill updates.
- **Long Context:** Multi-file ingestion via the CIC Harvester.

### 3.3 Infrastructure (CIC Execution Layer)
- **CIC Sandboxes:** Sealed Docker containers running isolated workloads.
- **CIC Agent Fleets:** Fan-out and execution via a robust queue system.
- **CIC Schedulers:** Cron-driven triggers for nightly and weekly maintenance cycles.
- **CIC Secret Vault:** Safe storage of credentials and access tokens.

---

## 4. CIC Cross-Domain Moves

### 4.1 Rubric (Define "Good" Once)
Every agent registry must contain a `rubric.json` declaring the criteria for successful execution. The Verification Sandbox validates the output against this rubric, and the Evolution Agent rewrites agent code iteratively until the rubric is satisfied.

### 4.2 Memory File (Persistent Voice / Brand / Decisions)
Memory lives in `/memory/<agent_id>/` and is snapshotted per phase. The Evolution Agent diffs these snapshots to detect state drift and suggest improvements.

### 4.3 Dreaming (Monthly Retrospective)
At Phase boundaries, agents execute self-review sequences. They rewrite their own briefs, identify bottlenecks, and propose new skills for the next cycle.

### 4.4 Fan-Out (Fleet Execution)
For batch operations, we use a producer-consumer fleet pattern:
1. **Producer** splits and sends $N$ jobs to the execution queue.
2. **Fleet** executes the jobs in parallel.
3. **Verifier Fleet** checks outcomes against `rubric.json`.
4. **Aggregator** synthesizes final results.
5. **Evolution Agent** updates skill graphs.

### 4.5 Scheduled Runs
Nightly Harvester runs, weekly evolution cycles, and monthly dreaming cycles keep the system optimized.

### 4.6 Brain vs. Hands (Expensive Thinking, Cheap Doing)
- **Brain:** High-capability LLMs (Fable/Opus) process planning and validation.
- **Hands:** Lightweight models or deterministic scripts process file reads, database writes, and simple format conversions.

---

## 5. CIC Watch-Outs

- **Reroute Tax:** Minimize costs by falling back to cheaper models for routine tasks, routing to expensive models only when complexity thresholds are crossed.
- **Overfitting:** Avoid optimizing prompts for a single model's syntax. Use generic, structured instructions.
- **Lock-in Risk:** Keep primitives portable and abstract all API calls behind service interfaces.
- **Demo vs. Production:** Never ship agents validated only in ad-hoc environments. Execution must succeed inside the sealed **Verification Sandbox**.
- **Verification Bottleneck:** The rubric is your core asset; agents themselves are transient and replaceable.

---

## 6. CIC Model Strategy

| Model Class | Use Case | Implementation |
|---|---|---|
| **Fable-Equivalent (Agentic Work)** | Long-horizon planning, multi-file reasoning, Evolution Agent, Harvester | Advanced reasoning models |
| **Mythos-Equivalent (Safeguards Lifted)** | Offline sandboxed experiments, code rewriting, refactoring | Models with relaxed filtering for engineering tasks |
| **Opus-Equivalent (Sensitive Domains)** | Safety-critical tasks, PII redactors, policy-checking, reroute validation | High-compliance, heavily aligned models |
