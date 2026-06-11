#!/usr/bin/env bash
set -e

echo "Bootstrapping CIC OS repository structure..."

mkdir -p helm/cic-os/templates
mkdir -p manifests/{cic-governance,cic-lifecycle,cic-eval,cic-safety,cic-stress,cic-telemetry,cic-evolution,cic-release}
mkdir -p docs/overrides/stylesheets
mkdir -p .github/workflows
mkdir -p scripts

echo "Repository structure created."
