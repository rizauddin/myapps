
#!/usr/bin/env bash
set -euo pipefail

# Deployment configuration
BRANCH="main"
DEPLOY_BRANCH="gh-pages"
BUILD_DIR="dist/myapps/browser"
DOMAIN="app.rizauddin.com"

# Move to the project directory
cd "$(dirname "$0")"

echo "================================"
echo "  myapps Deployment"
echo "================================"

# Step 1: Check prerequisites
echo ""
echo "[1/5] Checking prerequisites..."

command -v git >/dev/null || {
  echo "Error: Git is not installed."
  exit 1
}

command -v npm >/dev/null || {
  echo "Error: npm is not installed."
  exit 1
}

CURRENT_BRANCH=$(git branch --show-current)

if [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
  echo "Error: You are on '$CURRENT_BRANCH', not '$BRANCH'."
  exit 1
fi

# Avoid accidentally publishing over remote changes
if [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  echo "Local changes detected."
fi

git fetch origin "$BRANCH"

if [[ "$(git rev-parse HEAD)" != \
      "$(git rev-parse "origin/$BRANCH")" ]]; then
  echo "Error: Local and remote main differ."
  echo "Resolve the differences before deploying."
  exit 1
fi

# Step 2: Build
echo ""
echo "[2/5] Building Angular application..."

npx ng build \
  --configuration production \
  --base-href /

test -f "$BUILD_DIR/index.html" || {
  echo "Error: Build output missing."
  exit 1
}

# Step 3: Commit
echo ""
echo "[3/5] Committing source changes..."

git add -A

if ! git diff --cached --quiet; then
  git commit -m "${1:-Update myapps}"
else
  echo "No changes to commit."
fi

# Step 4: Push
echo ""
echo "[4/5] Pushing to GitHub..."

git push origin "$BRANCH"

# Step 5: Deploy
echo ""
echo "[5/5] Deploying to GitHub Pages..."

npx --no-install angular-cli-ghpages \
  --dir="$BUILD_DIR" \
  --branch="$DEPLOY_BRANCH" \
  --cname="$DOMAIN"

echo ""
echo "================================"
echo "  Deployment completed"
echo "================================"
echo "https://$DOMAIN/luluske"
echo "https://$DOMAIN/batchweight"
