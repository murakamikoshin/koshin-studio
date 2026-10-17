#!/usr/bin/env bash
# 配備：.assetsignore に並べたものを除いた写しを作って、その写しを Pages に上げる。
# （`wrangler pages deploy .` は .assetsignore を見ないので、README・下書き・道具まで上がってしまう）
#   使い方：tools/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
grep -v '^\s*#' .assetsignore | grep -v '^\s*$' | sed 's#^/##' > "$STAGE/.excl"
rsync -a --exclude-from="$STAGE/.excl" --exclude='.excl' --exclude='node_modules' --exclude='.wrangler' ./ "$STAGE/site/" 2>/dev/null || {
  mkdir -p "$STAGE/site"; rsync -a --exclude-from="$STAGE/.excl" --exclude='node_modules' --exclude='.wrangler' ./ "$STAGE/site/"
}
echo "▶ 配る写し：$(find "$STAGE/site" -type f | wc -l | tr -d ' ') ファイル"
npx wrangler pages deploy "$STAGE/site" --project-name koshin-studio --branch koshin-studio
