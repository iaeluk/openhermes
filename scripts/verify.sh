#!/usr/bin/env bash
# openhermes verify: static checks proving the port is in place and healthy.
# Usage: scripts/verify.sh [REPO_DIR]
set -euo pipefail

OH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="${1:-${HERMES_REPO:-$HOME/.hermes/hermes-agent}}"
HOME_DIR="${HERMES_HOME:-$HOME/.hermes}"

cd "$REPO" || { echo "openhermes: cannot enter $REPO" >&2; exit 1; }
git rev-parse --git-dir >/dev/null 2>&1 || { echo "openhermes: not a git repo: $REPO" >&2; exit 1; }
echo "openhermes verify: markers..."
for m in \
  "ui-tui/src/components/opencodePalette.tsx:openOpencodePalette" \
  "ui-tui/src/components/opencode.tsx:OpencodeStatusBar" \
  "ui-tui/src/app/uiStore.ts:readBootLayout" \
  "tui_gateway/methods_config.py:skin.resolve_tui" \
  "tui_gateway/methods_config_set.py:_set_tui_skin" \
  "hermes_cli/config_defaults.py:tui_skin"; do
  f="${m%%:*}"
  pat="${m##*:}"
  grep -q "$pat" "$f" || { echo "MISSING: $pat in $f" >&2; exit 1; }
done
echo "  markers ok"

echo "openhermes verify: python syntax..."
python3 -m py_compile \
  tui_gateway/change_watcher.py \
  tui_gateway/methods_config.py \
  tui_gateway/methods_config_set.py \
  hermes_cli/config_defaults.py
echo "  python ok"

echo "openhermes verify: node..."
[ -x "$REPO/node_modules/.bin/tsc" ] || {
  echo "openhermes: node deps missing — run 'npm install' at the repo root first." >&2
  exit 1
}
cd ui-tui
npx tsc --noEmit -p tsconfig.json
echo "  typecheck ok"
npx vitest run 2>&1 | tail -3

echo "openhermes verify: skins..."
n="$(ls "$HOME_DIR/skins"/oh-*.yaml 2>/dev/null | wc -l)"
[ "$n" -ge 66 ] || { echo "expected 66+ oh-* skins in $HOME_DIR/skins, found $n" >&2; exit 1; }
python3 "$OH_DIR/scripts/validate_skins.py" "$HOME_DIR/skins" | tail -1
echo "openhermes verify: ALL GREEN"
