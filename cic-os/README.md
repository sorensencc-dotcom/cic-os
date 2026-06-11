# CIC OS v1.0

Governed, deterministic, multi-agent intelligence runtime built on Foundry.

## What is CIC OS?

CIC OS is a self-maintaining intelligence operating system with:

- **Governance** — Constitutional rules, autonomy boundaries, immutable audit chain
- **Lifecycle** — Model evaluation, canary deployment, rollback protocol
- **Safety** — Sandboxed tool calls, mutation testing, fuzzer corpus
- **Drift Detection** — Behavioral drift engine, replay harness, baseline tracking
- **Self-Healing** — Autonomous rollback on drift/regression, stability-based promotion
- **Evolution** — Governed self-improvement loop, constitutional court oversight
- **Telemetry** — Canary metrics, governance events, immutable ledger

## Getting Started

### Prerequisites
- Kubernetes cluster (k3d, kind, AKS, EKS, GKE, etc.)
- `kubectl` configured
- `helm` v3+
- Foundry CRDs installed

### Installation
```
helm install cic-os ./helm/cic-os -n cic-system --create-namespace
```

### Verification
```
kubectl get pods -n cic-system
kubectl get crds | grep cic
```

## Repository Structure

```
cic-os/
├── helm/cic-os/          # Helm chart
├── manifests/            # Kubernetes manifests
│   ├── cic-governance/
│   ├── cic-lifecycle/
│   ├── cic-eval/
│   ├── cic-safety/
│   ├── cic-telemetry/
│   ├── cic-evolution/
│   └── cic-release/
├── docs/                 # MkDocs documentation
├── .github/workflows/    # CI/CD pipeline
├── scripts/              # Utility scripts
├── CHANGELOG.md
└── CONTRIBUTING.md
```

## Governance

CIC OS is governed by:

- **Constitutional Articles** — Formal law of CIC OS
- **Governance Manifest** — Operational governance rules
- **Autonomy Boundary** — What CIC can/cannot do
- **Constitutional Court** — Agent that interprets governance
- **Governance Ledger** — Immutable audit chain

See `manifests/cic-governance/` for details.

## Documentation

Build docs locally:
```
mkdocs serve
```

Open: `http://localhost:8000`

## Release Notes

See `CHANGELOG.md` for version history.

## License

Internal use only unless explicitly licensed.

## Contact

Chris Sorensen (sorensencc@gmail.com)
