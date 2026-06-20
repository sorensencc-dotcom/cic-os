#!/usr/bin/env bash
set -e
docker compose -f "$(dirname "$0")/docker-compose.cic-os.yml" "$@"
