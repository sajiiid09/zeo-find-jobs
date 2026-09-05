#!/usr/bin/env bash
# Stop the local demo stack started by scripts/local-start.sh.
# Postgres is left running; pass --all (or STOP_DB=1) to stop the db container too.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib-stack.sh"

STOP_DB="${STOP_DB:-0}"
[ "${1:-}" = "--all" ] && STOP_DB=1

stop_stack "$STOP_DB"
log "Local demo stopped"
