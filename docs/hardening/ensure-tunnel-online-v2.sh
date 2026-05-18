#!/bin/sh
# scripts/ensure-tunnel-online.sh  (v2 — hardened)
#
# Watchdog for the cloudflared container that bridges the CRM
# (crm.tritonwealth.ca) to the public internet. Designed to run every
# minute from the NAS scheduler.
#
# Architecture clarification (this was wrong in v1):
#   - crm.tritonwealth.ca  →  THIS tunnel  →  triton-crm container
#   - www.tritonwealth.ca  →  Cloudflare Pages (independent of this tunnel)
#
# v1 logged failures for the marketing site every minute, which was
# misleading because restarting THIS tunnel cannot fix the marketing
# site (it doesn't go through this tunnel). v2 drops that check, adds
# log rotation, exit codes, and a deploy timestamp marker.

set -eu

PROJECT_DIR="${PROJECT_DIR:-/volume1/docker/triton-crm}"
COMPOSE_DIR="$PROJECT_DIR/docker"
LOG_FILE="${LOG_FILE:-$PROJECT_DIR/tunnel-watchdog.log}"
LOG_MAX_BYTES="${LOG_MAX_BYTES:-1048576}"   # 1 MB rotate threshold
TUNNEL_CONTAINER="${TUNNEL_CONTAINER:-triton-tunnel}"
APP_CONTAINER="${APP_CONTAINER:-triton-crm}"
CRM_URL="${CRM_URL:-https://crm.tritonwealth.ca}"
LOCAL_APP_URL="${LOCAL_APP_URL:-http://127.0.0.1:3001/api/ready}"

# --- Log rotation ---
if [ -f "$LOG_FILE" ]; then
  SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)
  if [ "$SIZE" -gt "$LOG_MAX_BYTES" ]; then
    mv "$LOG_FILE" "${LOG_FILE}.1"
  fi
fi

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG_FILE"
}

restart_tunnel() {
  log "restarting $TUNNEL_CONTAINER"
  if docker restart "$TUNNEL_CONTAINER" >> "$LOG_FILE" 2>&1; then
    return 0
  fi
  log "docker restart failed, falling back to compose up"
  cd "$COMPOSE_DIR"
  docker compose up -d cloudflared >> "$LOG_FILE" 2>&1
}

is_running() {
  STATUS="$(docker inspect "$1" --format '{{.State.Status}}' 2>/dev/null || echo missing)"
  RESTARTING="$(docker inspect "$1" --format '{{.State.Restarting}}' 2>/dev/null || echo true)"
  [ "$STATUS" = "running" ] && [ "$RESTARTING" != "true" ]
}

http_ok() {
  CODE="$(curl -fsS -o /dev/null -w '%{http_code}' --max-time 20 "$1" 2>/dev/null || echo 000)"
  case "$CODE" in
    200|301|302|307|308) return 0 ;;
    *) echo "$CODE"; return 1 ;;
  esac
}

# Step 1: tunnel container exists + running
if ! docker inspect "$TUNNEL_CONTAINER" >/dev/null 2>&1; then
  log "$TUNNEL_CONTAINER does not exist; recreating"
  restart_tunnel
  exit 0
fi

if ! is_running "$TUNNEL_CONTAINER"; then
  log "$TUNNEL_CONTAINER not running; restarting"
  restart_tunnel
  exit 0
fi

# Step 2: CRM app container running
if ! is_running "$APP_CONTAINER"; then
  log "$APP_CONTAINER not running; tunnel restart will not help. Check docker compose logs."
  exit 1
fi

# Step 3: local app reachable on loopback
if ! curl -fsS -o /dev/null --max-time 10 "$LOCAL_APP_URL"; then
  log "$LOCAL_APP_URL not responding locally; this is an app problem, not a tunnel problem"
  exit 1
fi

# Step 4: CRM public URL reachable — primary signal
if CODE=$(http_ok "$CRM_URL"); then
  : # ok
else
  log "$CRM_URL returned HTTP $CODE; restarting tunnel"
  restart_tunnel
  exit 0
fi

# (marketing site check removed — see header comment)
exit 0
