#!/usr/bin/env bash
# Auto-bump cache-busting version on CSS/JS/banner images based on content hash.
# Run before each sync. If file unchanged → hash unchanged → no rewrite.

set -e
cd "$(dirname "$0")/.."

# --- Step 1: Version-bump banner images inside style.css (each by its own hash) ---
for banner in about services partners workshops contact; do
  img="assets/images/banners/${banner}.webp"
  if [ -f "$img" ]; then
    IMG_HASH=$(md5 -q "$img" | cut -c1-8)
    # Replace ?v=XXX after banners/{name}.webp (or add if missing)
    perl -i -pe "s{(banners/${banner}\.webp)(\?v=[a-z0-9]+)?}{\$1?v=${IMG_HASH}}g" assets/css/style.css
  fi
done

# --- Step 2: Compute hash of CSS/JS (which now includes the updated image versions) ---
CSS_HASH=$(md5 -q assets/css/style.css | cut -c1-8)
JS_HASH=$(md5 -q assets/js/main.js | cut -c1-8)

# Hash favicons (root-level) so HTML refs auto-refresh
FAV_HASH=$(md5 -q favicon.ico | cut -c1-8)
ICON_HASH=$(md5 -q icon.png | cut -c1-8)
APPLE_HASH=$(md5 -q apple-icon.png | cut -c1-8)

echo "  style.css   hash: $CSS_HASH"
echo "  main.js     hash: $JS_HASH"
echo "  favicon.ico hash: $FAV_HASH"

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

  # Favicon / icon / apple-icon (root-level absolute or relative)
  perl -i -pe "s{(/?favicon\.ico)(\?v=[^\"']*)?}{\$1?v=$FAV_HASH}g" "$f"
  perl -i -pe "s{(/?icon\.png)(\?v=[^\"']*)?}{\$1?v=$ICON_HASH}g" "$f"
  perl -i -pe "s{(/?apple-icon\.png)(\?v=[^\"']*)?}{\$1?v=$APPLE_HASH}g" "$f"

  after=$(md5 -q "$f" 2>/dev/null || md5sum "$f" | cut -d' ' -f1)
  if [ "$before" != "$after" ]; then
    updated=$((updated + 1))
  fi
done

echo "  Updated $updated HTML file(s)"
