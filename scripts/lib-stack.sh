#!/usr/bin/env bash
# Shared plumbing for the ZEO Find Work demo stack (Postgres + FastAPI + Next.js).
# Sourced by scripts/local-start.sh, scripts/tunnel-start.sh and the stop scripts.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$ROOT/.demo"
API_PORT="${API_PORT:-8000}"
WEB_PORT="${WEB_PORT:-3000}"
SEED="${SEED:-0}"

mkdir -p "$RUN_DIR"

log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!!\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31mxx\033[0m %s\n' "$*" >&2; exit 1; }

port_busy() { lsof -iTCP:"$1" -sTCP:LISTEN -n -P >/dev/null 2>&1; }

wait_for() { # wait_for <seconds> <description> <command...>
  local timeout="$1" what="$2"; shift 2
  local i=0
  until "$@" >/dev/null 2>&1; do
    i=$((i + 1))
    [ "$i" -ge "$timeout" ] && return 1
    sleep 1
  done
  log "$what ready"
}

require_bins() {
  local bin
  for bin in "$@"; do
    command -v "$bin" >/dev/null 2>&1 || die "$bin not found in PATH"
  done
  [ -x "$ROOT/api/.venv/bin/python" ] || die "api/.venv missing — run the API setup in README.md first"
}

start_db() {
  if ! docker info >/dev/null 2>&1; then
    log "Docker daemon not running — starting Docker Desktop"
    open -a Docker >/dev/null 2>&1 || die "could not launch Docker Desktop; start it manually"
    wait_for 120 "Docker daemon" docker info || die "Docker daemon did not come up in 120s"
  fi

  log "Starting Postgres (docker compose db)"
  (cd "$ROOT" && docker compose up -d db >/dev/null)
  wait_for 60 "Postgres" docker exec zeo_db pg_isready -U zeo -d zeo_find_work \
    || die "Postgres did not become ready"
}

start_api() {
  log "Applying migrations"
  (cd "$ROOT/api" && "$ROOT/api/.venv/bin/alembic" upgrade head >>"$RUN_DIR/api.log" 2>&1)

  if [ "$SEED" = "1" ]; then
    log "Reseeding demo data (SEED=1)"
    (cd "$ROOT/api" && "$ROOT/api/.venv/bin/python" -m app.seed >>"$RUN_DIR/api.log" 2>&1)
  fi

  if port_busy "$API_PORT"; then
    warn "Port $API_PORT already in use — reusing whatever is listening there"
  else
    log "Starting API on :$API_PORT"
    nohup bash -c "cd '$ROOT/api' && exec '$ROOT/api/.venv/bin/uvicorn' app.main:app \
        --host 127.0.0.1 --port '$API_PORT'" >>"$RUN_DIR/api.log" 2>&1 </dev/null &
    echo $! > "$RUN_DIR/api.pid"
    disown
  fi
  wait_for 60 "API" curl -fsS "http://127.0.0.1:$API_PORT/api/health" \
    || die "API did not answer /api/health — see $RUN_DIR/api.log"
}

start_web() {
  if port_busy "$WEB_PORT"; then
    warn "Port $WEB_PORT already in use — reusing whatever is listening there"
  else
    log "Starting Next.js on :$WEB_PORT"
    # The browser calls /api on its own origin; next.config.mjs rewrites that to
    # the FastAPI process, so a single host serves both halves.
    API_PROXY_ORIGIN="http://127.0.0.1:$API_PORT" \
      nohup bash -c "cd '$ROOT/web' && exec node_modules/.bin/next dev --port '$WEB_PORT'" \
      >>"$RUN_DIR/web.log" 2>&1 </dev/null &
    echo $! > "$RUN_DIR/web.pid"
    disown
  fi
  wait_for 120 "Web" curl -fsS -o /dev/null "http://127.0.0.1:$WEB_PORT/" \
    || die "Next.js did not come up — see $RUN_DIR/web.log"
}

stop_pidfile() { # stop_pidfile <name> <file>
  local name="$1" file="$2" pid
  [ -f "$file" ] || return 0
  pid="$(cat "$file")"
  if kill -0 "$pid" >/dev/null 2>&1; then
    log "Stopping $name (pid $pid)"
    pkill -TERM -P "$pid" >/dev/null 2>&1 || true
    kill -TERM "$pid" >/dev/null 2>&1 || true
    for _ in $(seq 1 10); do
      kill -0 "$pid" >/dev/null 2>&1 || break
      sleep 1
    done
    if kill -0 "$pid" >/dev/null 2>&1; then
      log "$name still alive — sending SIGKILL"
      pkill -KILL -P "$pid" >/dev/null 2>&1 || true
      kill -KILL "$pid" >/dev/null 2>&1 || true
    fi
  else
    log "$name already stopped"
  fi
  rm -f "$file"
}

stop_stack() { # stop_stack <stop_db: 0|1>
  local stop_db="${1:-0}"

  stop_pidfile "tunnel" "$RUN_DIR/tunnel.pid"
  stop_pidfile "web"    "$RUN_DIR/web.pid"
  stop_pidfile "api"    "$RUN_DIR/api.pid"
  rm -f "$RUN_DIR/tunnel-url.txt"

  # Sweep anything the pid files missed, matched strictly against this checkout.
  sweep() { pkill -f "$1" >/dev/null 2>&1 && log "Swept stray process: $1" || true; }
  sweep "$ROOT/api/.venv/bin/uvicorn app.main:app"
  sweep "$ROOT/web/node_modules/.bin/next dev"

  if [ "$stop_db" = "1" ]; then
    log "Stopping Postgres container"
    (cd "$ROOT" && docker compose stop db >/dev/null 2>&1) || true
  else
    log "Postgres left running (use --all to stop it)"
  fi
}
