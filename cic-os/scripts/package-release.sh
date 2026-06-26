#!/usr/bin/env bash
set -e

VERSION="v1.0.0"
OUT="cic-os-\$VERSION.tar.gz"

echo "Validating Helm chart..."
helm lint helm/cic-os

echo "Rendering Helm templates..."
helm template cic-os helm/cic-os > /dev/null

echo "Building release tarball..."
tar -czf "\$OUT" helm/ manifests/ docs/ README.md CHANGELOG.md CONTRIBUTING.md Makefile

echo "Generating SHA-256 signature..."
shasum -a 256 "\$OUT" > "\$OUT.sha256"

echo "Release bundle created:"
echo "  \$OUT"
echo "  \$OUT.sha256"
