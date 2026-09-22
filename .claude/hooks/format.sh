#!/usr/bin/env bash
# PostToolUse hook: autoformatea el/los archivo(s) que Write/Edit acaba de tocar.
# Claude Code pasa el input del hook como JSON por stdin; extraemos el/los
# path(s) tocados. Si no se puede parsear, no hace nada (nunca bloquea).
set -euo pipefail

input="$(cat)"
paths="$(echo "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed -E 's/.*"([^"]+)"$/\1/' || true)"

[ -z "$paths" ] && exit 0

for f in $paths; do
  case "$f" in
    *.py)
      command -v ruff >/dev/null 2>&1 && ruff format "$f" || true
      ;;
    *.ts|*.tsx|*.js|*.jsx|*.json|*.css)
      command -v pnpm >/dev/null 2>&1 && pnpm dlx prettier --write "$f" >/dev/null 2>&1 || true
      ;;
  esac
done

exit 0
