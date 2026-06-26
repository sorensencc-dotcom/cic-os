#!/usr/bin/env bash
set -e

echo "Running CIC OS repository integrity audit..."

echo "1. Checking for nested .git directories..."
NESTED=$(find . -type d -name ".git" -not -path "./.git")
if [ -n "$NESTED" ]; then
  echo "FAIL: Nested .git directories found:"
  echo "$NESTED"
  exit 1
else
  echo "OK"
fi

echo "2. Validating YAML..."
find manifests -name '*.yaml' -print0 | xargs -0 yamllint -d relaxed

echo "3. Validating Helm chart..."
helm lint helm/cic-os

echo "4. Rendering Helm templates..."
helm template cic-os helm/cic-os > /dev/null

echo "All integrity checks passed."
