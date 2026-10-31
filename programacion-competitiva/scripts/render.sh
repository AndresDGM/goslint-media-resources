#!/usr/bin/env bash
# Render completo + masterizado de audio.
#   bash scripts/render.sh                      (CPU, funciona en cualquier equipo)
#   REMOTION_GL=vulkan REMOTION_CONCURRENCY=6 bash scripts/render.sh   (GPU con Vulkan)
set -euo pipefail
cd "$(dirname "$0")/.."
if command -v pnpm >/dev/null 2>&1; then RUN="pnpm exec"; else RUN="npx"; fi
mkdir -p out
$RUN remotion render ProgramacionCompetitiva out/render-raw.mp4 "$@"
# Masterizado: ganancia + limitador hasta ≈ −15 LUFS con pico ≤ −1 dBFS. El video se copia sin recodificar.
ffmpeg -y -v error -i out/render-raw.mp4 -c:v copy \
  -af "volume=${MASTER_GAIN_DB:-2.6}dB,alimiter=limit=0.84:attack=5:release=80:level=false" \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart out/goslint-programacion-competitiva.mp4
echo "Listo: out/goslint-programacion-competitiva.mp4"
