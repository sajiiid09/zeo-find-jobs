#!/usr/bin/env bash
# Run the whole ZEO Find Work demo locally (Postgres + FastAPI + Next.js).
# No tunnel, nothing public — everything stays on 127.0.0.1.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib-stack.sh"

require_bins node npm docker
start_db
start_api
start_web

cat <<BANNER

  ZEO Find Work demo is running locally
  ──────────────────────────────────────────────
  Web       : http://localhost:$WEB_PORT
  API docs  : http://localhost:$WEB_PORT/docs  (also http://localhost:$API_PORT/docs)
  Logs      : $RUN_DIR/{api,web}.log
  Stop with : scripts/local-stop.sh

BANNER
