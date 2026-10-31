#!/usr/bin/env bash
# Renderiza fotogramas sueltos de la composición para inspección visual.
# Uso: scripts/stills.sh 2603 3161 ...   -> out/stills/f02603.png ...
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out/stills
BUNDLE=out/bundle
pnpm exec remotion bundle src/index.ts --out-dir "$BUNDLE" >/dev/null 2>&1
printf '%s\n' "$@" | xargs -P 6 -I{} sh -c 'pnpm exec remotion still "'"$BUNDLE"'" "${COMP:-BusquedaBinaria}" "out/stills/f$(printf %05d {}).png" --frame={} --gl=${REMOTION_GL:-vulkan} >/dev/null 2>&1 || echo "fallo {}"'
ls out/stills | wc -l
