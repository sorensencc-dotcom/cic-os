# Getting Started

## Prerequisites

- Kubernetes cluster (k3d, kind, AKS, EKS, GKE, etc.)
- kubectl installed and configured
- helm v3+ installed
- Foundry CRDs pre-installed on cluster

## Installation

### 1. Clone the repo
\\\
git clone <cic-os-repo>
cd cic-os
\\\

### 2. Create namespace
\\\
kubectl create namespace cic-system
\\\

### 3. Install via Helm
\\\
helm install cic-os ./helm/cic-os \
  --namespace cic-system \
  --values helm/cic-os/values.yaml
\\\

### 4. Verify installation
\\\
kubectl get pods -n cic-system
kubectl get crds | grep cic
\\\

All pods should be running.

## First Steps

### 1. Check governance
\\\
kubectl get governancemanifest -n cic-system
\\\

### 2. Run smoke tests
\\\
kubectl apply -f manifests/cic-stress/governance-stress-tests.yaml -n cic-system
\\\

### 3. Monitor telemetry
\\\
kubectl logs -f cic-telemetry-collector -n cic-system
\\\

## Configuration

Edit helm/cic-os/values.yaml:

\\\yaml
namespace: cic-system

foundry:
  installCrds: true
  installControllers: true

cic:
  enableStressHarness: true
  enableLoadGenerator: true
\\\

## Uninstallation

\\\
helm uninstall cic-os -n cic-system
kubectl delete namespace cic-system
\\\

## Next Steps

- Read the Architecture guide
- Review Governance rules
- Understand Lifecycle stages
- Study Evaluation mechanisms
- Learn Safety enforcement
- Explore Telemetry collection
- Understand Evolution loop
