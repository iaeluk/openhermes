#!/usr/bin/env bash
# openhermes revert: undo scripts/apply.sh (patch + new files). Skins stay
# (additive, harmless). Usage: scripts/revert.sh [REPO_DIR]
set -euo pipefail

OH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="${1:-${HERMES_REPO:-$HOME/.hermes/hermes-agent}}"

cd "$REPO" || { echo "openhermes: cannot enter $REPO" >&2; exit 1; }
git rev-parse --git-dir >/dev/null 2>&1 || { echo "openhermes: not a git repo: $REPO" >&2; exit 1; }
git apply -R --check "$OH_DIR/patches/001-fases-1-4.patch" && \
  git apply -R "$OH_DIR/patches/001-fases-1-4.patch" && \
  echo "openhermes: patch reverted." || \
  echo "openhermes: patch did not reverse cleanly — review by hand."

cd "$OH_DIR/files" && find . -type f | sed 's|^\./||' | while IFS= read -r f; do
  rm -f "$REPO/$f"
done
echo "openhermes: new files removed."
