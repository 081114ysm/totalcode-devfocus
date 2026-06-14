#!/usr/bin/env bash
set -euo pipefail

MARKER="DevFocus Codex Harness verification hook"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"

if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' "verify: Node.js is required but was not found in PATH." >&2
  exit 1
fi

run_scripts() {
  local app_name="$1"
  local app_dir="$2"
  shift 2

  if [[ ! -f "$app_dir/package.json" ]]; then
    printf 'verify: %s package.json not found at %s.\n' "$app_name" "$app_dir" >&2
    return 1
  fi

  if [[ ! -d "$app_dir/node_modules" ]]; then
    if [[ -f "$app_dir/package-lock.json" ]]; then
      printf 'verify: %s dependencies are missing; run (cd "%s" && npm ci).\n' "$app_name" "$app_dir" >&2
    else
      printf 'verify: %s dependencies are missing; run (cd "%s" && npm install).\n' "$app_name" "$app_dir" >&2
    fi
    return 1
  fi

  printf '\n==> %s\n' "$app_name"
  local script_name
  for script_name in "$@"; do
    if (cd "$app_dir" && node -e 'const p=require("./package.json"); process.exit(p.scripts?.[process.argv[1]] ? 0 : 1)' "$script_name"); then
      printf '%s\n' "Running npm run $script_name"
      (cd "$app_dir" && CI=1 npm run "$script_name")
    else
      printf 'verify: skipping missing %s script %q.\n' "$app_name" "$script_name"
    fi
  done
}

status=0
run_scripts "frontend" "$repo_root/P2_코드/frontend" lint test build || status=1
run_scripts "backend" "$repo_root/P2_코드/backend" lint test build || status=1

if git -C "$repo_root" rev-parse --git-dir >/dev/null 2>&1; then
  local_hook="$repo_root/.git/hooks/pre-push.local"
  if [[ -x "$local_hook" ]]; then
    "$local_hook" "$@"
  fi
fi

exit "$status"
