#!/usr/bin/env bash
# Publica dist/ en la rama gh-pages (GitHub Pages, "deploy from branch").
set -euo pipefail
# BASE_PATH=/subcontrata.online ./scripts/publicar-gh-pages.sh  → para la URL usuario.github.io/subcontrata.online/
# Sin BASE_PATH → para el dominio propio.
cd "$(dirname "$0")/.."
BASE_PATH="${BASE_PATH:-}" npm run check
REMOTE=$(git remote get-url origin)
rm -rf /tmp/sc-gh-pages && mkdir -p /tmp/sc-gh-pages
cp -R dist/. /tmp/sc-gh-pages/
cd /tmp/sc-gh-pages
git init -q -b gh-pages
git add -A
git -c user.name="${GIT_AUTHOR_NAME:-deploy}" -c user.email="${GIT_AUTHOR_EMAIL:-deploy@subcontrata.online}" commit -q -m "Publicación $(date -u +%Y-%m-%dT%H:%MZ)"
git push -f "$REMOTE" gh-pages:gh-pages
echo "✔ publicado en gh-pages"
