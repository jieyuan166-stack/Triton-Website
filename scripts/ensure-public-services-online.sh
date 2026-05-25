#!/bin/sh
# Unified public-service watchdog for Triton NAS deployment.
# Intended to run from NAS cron every 5 minutes.

set -eu

LOG_FILE="${LOG_FILE:-/volume1/docker/triton-public-watchdog.log}"
LOG_MAX_BYTES="${LOG_MAX_BYTES:-1048576}"

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG_FILE"
}

rotate_log() {
  if [ -f "$LOG_FILE" ]; then
    size="$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)"
    if [ "$size" -gt "$LOG_MAX_BYTES" ]; then
      mv "$LOG_FILE" "${LOG_FILE}.1"
    fi
  fi
}

is_running() {
  status="$(docker inspect "$1" --format '{{.State.Status}}' 2>/dev/null || echo missing)"
  restarting="$(docker inspect "$1" --format '{{.State.Restarting}}' 2>/dev/null || echo true)"
  [ "$status" = "running" ] && [ "$restarting" != "true" ]
}

restart_container() {
  name="$1"
  if docker inspect "$name" >/dev/null 2>&1; then
    log "restarting container: $name"
    docker restart "$name" >> "$LOG_FILE" 2>&1 || log "FAILED restarting container: $name"
  else
    log "container missing: $name"
  fi
}

ensure_running() {
  name="$1"
  if ! is_running "$name"; then
    log "$name is not running"
    restart_container "$name"
  fi
}

http_code() {
  curl -fsS -o /dev/null -w '%{http_code}' --max-time 20 "$1" 2>/dev/null || echo 000
}

http_ok() {
  code="$(http_code "$1")"
  case "$code" in
    200|204|301|302|307|308) return 0 ;;
    *) printf '%s' "$code"; return 1 ;;
  esac
}

dns_resolves() {
  getent hosts "$1" >/dev/null 2>&1 || nslookup "$1" >/dev/null 2>&1
}

rotate_log

# Local containers that must survive NAS reboots.
for container in \
  triton-website \
  triton-crm \
  triton-tunnel \
  triton-tunnel-backup \
  triton-fund-proposal \
  triton-fund-proposal-tunnel \
  triton-fund-proposal-tunnel-backup \
  triton-kyc-app \
  triton-kyc-tunnel \
  triton-kyc-tunnel-backup
do
  ensure_running "$container"
done

# Public checks. Restart the relevant app and both tunnel connectors if a URL fails.
if code="$(http_ok https://www.tritonwealth.ca/)"; then
  :
else
  log "www.tritonwealth.ca failed with HTTP $code"
  restart_container triton-website
  restart_container triton-tunnel
  restart_container triton-tunnel-backup
fi

if code="$(http_ok https://crm.tritonwealth.ca/api/ready)"; then
  :
else
  log "crm.tritonwealth.ca failed with HTTP $code"
  restart_container triton-crm
  restart_container triton-tunnel
  restart_container triton-tunnel-backup
fi

if code="$(http_ok https://proposal.tritonwealth.ca/)"; then
  :
else
  log "proposal.tritonwealth.ca failed with HTTP $code"
  restart_container triton-fund-proposal
  restart_container triton-fund-proposal-tunnel
  restart_container triton-fund-proposal-tunnel-backup
fi

# KYC DNS may not be enabled yet. If it resolves, treat it as a public service.
if dns_resolves kyc.tritonwealth.ca; then
  if code="$(http_ok https://kyc.tritonwealth.ca/)"; then
    :
  else
    log "kyc.tritonwealth.ca failed with HTTP $code"
    restart_container triton-kyc-app
    restart_container triton-kyc-tunnel
    restart_container triton-kyc-tunnel-backup
  fi
fi

exit 0
