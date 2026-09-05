#!/usr/bin/env bash
# Stop the demo stack started by scripts/tunnel-start.sh (tunnel included).
# Postgres is left running; pass --all (or STOP_DB=1) to stop the db container too.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib-stack.sh"

STOP_DB="${STOP_DB:-0}"
[ "${1:-}" = "--all" ] && STOP_DB=1

stop_stack "$STOP_DB"
log "Demo stopped"
