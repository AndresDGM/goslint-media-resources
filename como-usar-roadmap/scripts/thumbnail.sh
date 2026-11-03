#!/usr/bin/env bash
# Miniatura para YouTube: miniatura/miniatura.jpg (1280×720) y portadas de los reels miniatura/PortadaFaseN.jpg (1080×1920)
set -euo pipefail
cd "$(dirname "$0")/.."
node ../commons/scripts/sync-public.mjs   # recursos comunes -> public/
mkdir -p out miniatura
pnpm exec remotion still src/index.ts Miniatura out/miniatura.png --gl=${REMOTION_GL:-swangle}
ffmpeg -v error -y -i out/miniatura.png -vf scale=1280:720:flags=lanczos -q:v 2 miniatura/miniatura.jpg
for n in 1 2 3 4 5 6 7; do
  pnpm exec remotion still src/index.ts "PortadaFase$n" "out/PortadaFase$n.png" --gl=${REMOTION_GL:-swangle}
  ffmpeg -v error -y -i "out/PortadaFase$n.png" -q:v 2 "miniatura/PortadaFase$n.jpg"
done
ls -la miniatura/
