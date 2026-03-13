#!/usr/bin/env bash
set -eu

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

git config core.hooksPath .githooks

if command -v chmod >/dev/null 2>&1; then
  chmod +x .githooks/commit-msg
fi

echo "Configured git hooks path: .githooks"
echo "Done. Commit messages will now be validated by .githooks/commit-msg"
