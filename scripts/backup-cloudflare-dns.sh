#!/usr/bin/env bash
# Backup all Cloudflare DNS records for tritonwealth.ca to a JSON snapshot.
# Run weekly via cron, or manually before any DNS change.
#
# Setup (one-time):
#   1. Create a CF API token: https://dash.cloudflare.com/profile/api-tokens
#      Use template "Read all resources" OR custom with Zone:Read for tritonwealth.ca
#   2. Save the token to ~/.cloudflare-token (chmod 600)
#      echo "your-token-here" > ~/.cloudflare-token && chmod 600 ~/.cloudflare-token
#
# Output: backups/dns-snapshots/YYYY-MM-DD-HH-MM.json
# To restore: see scripts/restore-cloudflare-dns.sh (write when needed)

set -eu

ZONE_NAME="tritonwealth.ca"
TOKEN_FILE="${TOKEN_FILE:-$HOME/.cloudflare-token}"
OUT_DIR="$(dirname "$0")/../backups/dns-snapshots"

if [ ! -f "$TOKEN_FILE" ]; then
  echo "ERROR: $TOKEN_FILE not found. Create a CF API token first:"
  echo "  https://dash.cloudflare.com/profile/api-tokens"
  echo "  Then: echo 'YOUR_TOKEN' > $TOKEN_FILE && chmod 600 $TOKEN_FILE"
  exit 1
fi

TOKEN=$(cat "$TOKEN_FILE")
mkdir -p "$OUT_DIR"

# Find zone ID
ZONE_ID=$(curl -fsS -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/zones?name=$ZONE_NAME" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['result'][0]['id'])")

if [ -z "$ZONE_ID" ]; then
  echo "ERROR: could not resolve zone ID for $ZONE_NAME"
  exit 1
fi

# Fetch all DNS records (per_page=200 covers any reasonable zone)
STAMP=$(date '+%Y-%m-%d-%H-%M')
OUT_FILE="$OUT_DIR/$STAMP.json"
curl -fsS -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?per_page=200" \
  | python3 -m json.tool > "$OUT_FILE"

# Quick summary
COUNT=$(python3 -c "
import json
d = json.load(open('$OUT_FILE'))
print(len(d['result']))
")

echo "✓ Backed up $COUNT DNS records to $OUT_FILE"

# Keep only last 30 snapshots
cd "$OUT_DIR"
ls -t *.json 2>/dev/null | tail -n +31 | xargs -r rm
