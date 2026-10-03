#!/usr/bin/env bash
# Gera o site estático e publica no branch gh-pages (GitHub Pages).
set -euo pipefail
cd "$(dirname "$0")/.."

REMOTE_URL="$(git remote get-url origin)"
REPO="$(basename -s .git "$REMOTE_URL")"

rm -rf out
NEXT_PUBLIC_BASE_PATH="/$REPO" npm run build
touch out/.nojekyll

cd out
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -q -f "$REMOTE_URL" gh-pages
rm -rf .git
echo "Publicado em https://$(git -C .. remote get-url origin | sed -E 's#.*github.com[:/]([^/]+)/.*#\1#').github.io/$REPO/"
