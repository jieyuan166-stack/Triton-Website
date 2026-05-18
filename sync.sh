#!/usr/bin/env bash
# ==================================================================
# Triton Website - Sync local ↔ GitHub ↔ NAS
# Usage:
#   ./sync.sh              # interactive: shows status, prompts for commit msg
#   ./sync.sh "msg here"   # commit with given message and sync
#   ./sync.sh --pull       # just pull both local & NAS from GitHub
# ==================================================================

set -e

LOCAL="/Users/jeffreymacmini/TRITON WEBSITE"
NAS="/Volumes/docker/TRITON WEBSITE"

C_GREEN="\033[1;32m"; C_YELLOW="\033[1;33m"; C_RED="\033[1;31m"; C_BLUE="\033[1;36m"; C_OFF="\033[0m"

log() { printf "${C_BLUE}▸${C_OFF} %s\n" "$1"; }
ok()  { printf "${C_GREEN}✓${C_OFF} %s\n" "$1"; }
warn(){ printf "${C_YELLOW}!${C_OFF} %s\n" "$1"; }
err() { printf "${C_RED}✗${C_OFF} %s\n" "$1"; }

# --- Check NAS mounted ---
if [ ! -d "$NAS/.git" ]; then
  err "NAS not mounted at $NAS"
  exit 1
fi

# --- Pull-only mode ---
if [ "$1" = "--pull" ]; then
  log "Pulling local from GitHub…"
  git -C "$LOCAL" pull --rebase
  log "Pulling NAS from GitHub…"
  git -C "$NAS" pull --rebase
  ok "Both sides pulled from GitHub"
  exit 0
fi

# --- Detect which side has changes ---
LOCAL_DIRTY=$(git -C "$LOCAL" status --porcelain | wc -l | tr -d ' ')
NAS_DIRTY=$(git -C "$NAS" status --porcelain | wc -l | tr -d ' ')

log "Local changes: $LOCAL_DIRTY file(s)"
log "NAS changes:   $NAS_DIRTY file(s)"

if [ "$LOCAL_DIRTY" -gt 0 ] && [ "$NAS_DIRTY" -gt 0 ]; then
  err "Both sides have uncommitted changes. Resolve manually:"
  echo "  git -C \"$LOCAL\" status"
  echo "  git -C \"$NAS\" status"
  exit 1
fi

# --- Pick the dirty side ---
if [ "$LOCAL_DIRTY" -gt 0 ]; then
  SRC="$LOCAL"; OTHER="$NAS"; SRC_NAME="local"; OTHER_NAME="NAS"
elif [ "$NAS_DIRTY" -gt 0 ]; then
  SRC="$NAS";   OTHER="$LOCAL"; SRC_NAME="NAS";  OTHER_NAME="local"
else
  log "Nothing to commit. Running pull on both sides to ensure sync…"
  git -C "$LOCAL" pull --rebase --quiet
  git -C "$NAS"   pull --rebase --quiet
  ok "Already in sync"
  exit 0
fi

log "Changes detected on ${SRC_NAME}"
git -C "$SRC" status --short | head -20
echo ""

# --- Commit message ---
MSG="$1"
if [ -z "$MSG" ]; then
  read -p "Commit message: " MSG
fi
if [ -z "$MSG" ]; then
  err "Empty commit message, aborting."
  exit 1
fi

# --- Pull first to avoid push conflicts ---
log "Pulling ${SRC_NAME} from GitHub first…"
git -C "$SRC" pull --rebase --autostash

# --- Commit + push ---
log "Committing on ${SRC_NAME}…"
git -C "$SRC" add -A
git -C "$SRC" -c user.email="jieyuan166-stack@users.noreply.github.com" \
              -c user.name="Jeff Yuan" \
              commit -m "$MSG"

log "Pushing to GitHub…"
git -C "$SRC" push origin main

# --- Sync the other side ---
log "Pulling ${OTHER_NAME} from GitHub…"
git -C "$OTHER" pull --rebase

# --- Verify ---
L=$(git -C "$LOCAL" rev-parse HEAD)
N=$(git -C "$NAS"   rev-parse HEAD)
if [ "$L" = "$N" ]; then
  ok "All three in sync at $(echo $L | cut -c1-8)"
else
  err "Mismatch: local=$L nas=$N"
  exit 1
fi
