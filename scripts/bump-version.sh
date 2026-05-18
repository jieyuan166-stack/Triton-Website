#!/usr/bin/env bash
# Auto-bump cache-busting version on CSS/JS based on file content hash.
# Run before each sync. If CSS/JS unchanged → hash unchanged → no rewrite.

set -e
cd "$(dirname "$0")/.."

# Compute 8-char content hash of style.css and main.js
CSS_HASH=$(md5 -q assets/css/style.css | cut -c1-8)
JS_HASH=$(md5 -q assets/js/main.js | cut -c1-8)

echo "  style.css hash: $CSS_HASH"
echo "  main.js   hash: $JS_HASH"

# Update all .html files
# Pattern matches: style.css with or without existing ?v=...
# Also matches: /assets/css/style.css and assets/css/style.css and ../../assets/css/style.css

updated=0
for f in $(find . -name "*.html" -not -path "./.git/*" -not -path "./backups/*"); do
  before=$(md5 -q "$f" 2>/dev/null || md5sum "$f" | cut -d' ' -f1)

  # CSS: insert or replace ?v=XXX after style.css
  perl -i -pe "s{(assets/css/style\.css)(\?v=[^\"']*)?}{\$1?v=$CSS_HASH}g" "$f"

  # JS: same for main.js
  perl -i -pe "s{(assets/js/main\.js)(\?v=[^\"']*)?}{\$1?v=$JS_HASH}g" "$f"

  after=$(md5 -q "$f" 2>/dev/null || md5sum "$f" | cut -d' ' -f1)
  if [ "$before" != "$after" ]; then
    updated=$((updated + 1))
  fi
done

echo "  Updated $updated HTML file(s)"
