#!/usr/bin/env bash
set -euo pipefail

# Sync this fork with upstream mattpocock/skills.
# - fetches upstream
# - rebases local main onto upstream/main
# - validates marketplace.json
# - pushes to origin/main

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

if ! git remote get-url upstream >/dev/null 2>&1; then
  echo "configuring upstream remote..."
  git remote add upstream https://github.com/mattpocock/skills.git
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "switching to main (currently on $CURRENT_BRANCH)..."
  git checkout main
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "error: working tree not clean. commit or stash first." >&2
  git status --short
  exit 1
fi

echo "fetching upstream..."
git fetch upstream

echo "rebasing onto upstream/main..."
git rebase upstream/main

echo "validating marketplace..."
node scripts/validate-marketplace.js

echo "pushing to origin/main..."
git push origin main

echo "done."
