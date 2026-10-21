#!/usr/bin/env bash
# openhermes one-shot apply: new files + patch + checks + TUI build + skins.
# Usage: scripts/apply.sh [--force] [REPO_DIR]
#   REPO_DIR defaults to $HERMES_REPO or ~/.hermes/hermes-agent.
#   --force skips the base-version check (try at your own risk).
set -euo pipefail

FORCE=0
REPO=""
for a in "$@"; do
  case "$a" in
    --force) FORCE=1 ;;
    *) REPO="$a" ;;
  esac
done

OH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="${REPO:-${HERMES_REPO:-$HOME/.hermes/hermes-agent}}"
HOME_DIR="${HERMES_HOME:-$HOME/.hermes}"
BASE="d923a5eb48"

cd "$REPO" || { echo "openhermes: cannot enter $REPO" >&2; exit 1; }
git rev-parse --git-dir >/dev/null 2>&1 || { echo "openhermes: not a git repo: $REPO" >&2; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "openhermes: dirty tree — commit or stash first, then re-run." >&2; exit 1; }

HEAD="$(git rev-parse HEAD)"
if [[ "$HEAD" != "$BASE"* ]]; then
  echo "openhermes: HEAD $HEAD is not the pinned base $BASE (Hermes 0.22.2)."
  if [ "$FORCE" != "1" ]; then
    echo "openhermes: re-run with --force to try anyway, or follow SKILL.md for a guided build." >&2
    exit 1
  fi
fi

echo "openhermes: 1/5 copying new files..."
cd "$OH_DIR/files" && find . -type f | sed 's|^\./||' | while IFS= read -r f; do
  mkdir -p "$REPO/$(dirname "$f")"
  cp "$OH_DIR/files/$f" "$REPO/$f"
done
cd "$REPO"

echo "openhermes: 2/5 applying patch..."
git apply --check "$OH_DIR/patches/001-fases-1-4.patch" || {
  echo "openhermes: patch does not apply to this checkout — follow SKILL.md instead." >&2
  exit 1
}
git apply "$OH_DIR/patches/001-fases-1-4.patch"

echo "openhermes: 3/5 python syntax..."
python3 -m py_compile \
  tui_gateway/change_watcher.py \
  tui_gateway/methods_config.py \
  tui_gateway/methods_config_set.py \
  hermes_cli/config_defaults.py

echo "openhermes: 4/5 node checks + tests + TUI build..."
[ -x "$REPO/node_modules/.bin/tsc" ] || {
  echo "openhermes: node deps missing — run 'npm install' at the repo root first (workspaces), then re-run." >&2
  exit 1
}
cd ui-tui
npx tsc --noEmit -p tsconfig.json
npx eslint \
  src/components/opencode.tsx src/components/opencodePalette.tsx src/components/pixelFont.ts \
  src/components/appLayout.tsx src/components/appOverlays.tsx src/components/appChrome.tsx \
  src/components/messageLine.tsx src/app/uiStore.ts src/app/useConfigSync.ts \
  src/app/useInputHandlers.ts src/app/useSubmission.ts src/app/interfaces.ts \
  src/app/overlayStore.ts src/app/createGatewayEventHandler.ts src/gatewayTypes.ts
npx vitest run
npm run build
cd ..

echo "openhermes: 5/5 skins..."
mkdir -p "$HOME_DIR/skins"
cp "$OH_DIR/themes/"*.yaml "$HOME_DIR/skins/"
python3 "$OH_DIR/scripts/validate_skins.py" "$HOME_DIR/skins"

echo
echo "openhermes: applied. Next:"
echo "  hermes config set display.layout opencode"
echo "  hermes config set display.skin oh-opencode   # optional; TUI keeps its own theme after that"
echo "  hermes --tui"
echo "Rollback any time: bash $OH_DIR/scripts/revert.sh [$REPO]"
