#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node .github/scripts/split-languages.cjs --action=split --theme=ludoo
