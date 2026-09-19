#!/usr/bin/env bash
# PreToolUse hook (matcher: Bash): si el comando que Claude Code va a correr
# es un "git commit", corre primero la suite de tests. Si fallan, exit 2
# bloquea el commit y devuelve stderr a Claude en vez de dejarlo pasar.
#
# <!-- TODO: ajustar TEST_CMD al comando real del repo -->
set -uo pipefail

TEST_CMD="pytest -q"   # o: "npm test -- --run"

input="$(cat)"
command_run="$(echo "$input" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | sed -E 's/.*"([^"]+)"$/\1/' || true)"

case "$command_run" in
  *"git commit"*)
    if ! eval "$TEST_CMD" 1>&2; then
      echo "guard-commit: los tests fallan — commit bloqueado hasta que pasen." >&2
      exit 2
    fi
    ;;
esac

exit 0
