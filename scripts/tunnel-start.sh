#!/usr/bin/env bash
# Start the whole ZEO Find Work demo (Postgres + FastAPI + Next.js) and expose it
# through a fresh Cloudflare quick tunnel. The public URL is new on every run.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib-stack.sh"

require_bins cloudflared node npm docker
start_db
start_api
start_web

: > "$RUN_DIR/tunnel.log"
log "Opening Cloudflare tunnel"
nohup cloudflared tunnel --no-autoupdate --url "http://127.0.0.1:$WEB_PORT" \
  >>"$RUN_DIR/tunnel.log" 2>&1 </dev/null &
echo $! > "$RUN_DIR/tunnel.pid"
disown

URL=""
for _ in $(seq 1 60); do
  URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$RUN_DIR/tunnel.log" | head -1 || true)"
  [ -n "$URL" ] && break
  sleep 1
done
[ -n "$URL" ] || die "tunnel URL never appeared — see $RUN_DIR/tunnel.log"
echo "$URL" > "$RUN_DIR/tunnel-url.txt"

# Probe over DNS-over-HTTPS, not the system resolver: a fresh quick-tunnel name
# can take a minute to appear locally, and one early NXDOMAIN gets cached by
# macOS long enough to break the link in the browser too.
if ! wait_for 90 "Public URL" curl -fsS -o /dev/null --max-time 10 \
     --doh-url https://1.1.1.1/dns-query "$URL/api/health"; then
  warn "Tunnel is registered but $URL did not answer within 90s."
  warn "Check $RUN_DIR/tunnel.log; if the browser says the host is unknown, wait a"
  warn "minute for DNS to propagate or run: sudo dscacheutil -flushcache"
fi

cat <<BANNER

  ZEO Find Work demo is live
  ──────────────────────────────────────────────
  Public URL : $URL
  API docs   : $URL/docs
  Local web  : http://localhost:$WEB_PORT
  Logs       : $RUN_DIR/{api,web,tunnel}.log
  Stop with  : scripts/tunnel-stop.sh

BANNER
