#!/usr/bin/env bash
# Verify Cloudflare 301 redirects are live, then offer to delete flat .html files.
# Run AFTER you've configured the Bulk Redirect Rule in Cloudflare.

set -e
C_OK="\033[1;32m"; C_FAIL="\033[1;31m"; C_DIM="\033[2m"; C_OFF="\033[0m"

declare -a TESTS=(
  "/about.html|/about/"
  "/services.html|/services/"
  "/partners.html|/partners/"
  "/workshops.html|/workshops/"
  "/contact.html|/contact/"
  "/legal-disclaimers.html|/legal-disclaimers/"
  "/terms.html|/terms/"
  "/parners|/partners/"
  "/parners.html|/partners/"
  "/copy-of-privary-policy|/legal-disclaimers/"
  "/copy-of-legal-disclaimers|/terms/"
)

pass=0; fail=0
echo "Testing Cloudflare 301 redirects on https://www.tritonwealth.ca …"
echo ""

for pair in "${TESTS[@]}"; do
  src="${pair%|*}"; want="${pair#*|}"
  resp=$(curl -sI "https://www.tritonwealth.ca${src}")
  code=$(echo "$resp" | head -1 | awk '{print $2}')
  loc=$(echo "$resp" | grep -i '^location:' | awk '{print $2}' | tr -d '\r' | sed 's|^https\?://www.tritonwealth.ca||')

  if [ "$code" = "301" ] && [ "$loc" = "$want" ]; then
    printf "  ${C_OK}✓${C_OFF}  %-35s → %s\n" "$src" "$loc"
    pass=$((pass+1))
  else
    printf "  ${C_FAIL}✗${C_OFF}  %-35s → got %s %s ${C_DIM}(want 301 → %s)${C_OFF}\n" "$src" "$code" "$loc" "$want"
    fail=$((fail+1))
  fi
done

echo ""
echo "Passed: $pass  Failed: $fail"

if [ "$fail" -gt 0 ]; then
  echo ""
  echo -e "${C_FAIL}Some redirects not working yet.${C_OFF}"
  echo "Either: (a) Cloudflare rules not deployed, (b) cache not flushed, or (c) CSV not fully imported."
  echo "Wait 1-2 minutes after deployment, then re-run."
  exit 1
fi

echo ""
echo -e "${C_OK}All redirects working! Safe to delete flat .html files.${C_OFF}"
echo ""
read -p "Delete the 7 flat .html files now? (y/N) " yn
if [ "$yn" = "y" ] || [ "$yn" = "Y" ]; then
  cd "$(dirname "$0")/.."
  git rm about.html services.html partners.html workshops.html contact.html legal-disclaimers.html terms.html
  echo "✓ Deleted. Run: ./sync.sh \"Remove flat .html files (now redirected by Cloudflare 301)\""
fi
