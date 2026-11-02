#!/usr/bin/env bash
# Miniatura para YouTube: out/miniatura.png (1920×1080) y miniatura/miniatura.jpg (1280×720, < 2 MB)
set -euo pipefail
cd "$(dirname "$0")/.."
node ../commons/scripts/sync-public.mjs   # recursos comunes -> public/
mkdir -p out miniatura
pnpm exec remotion still src/index.ts Miniatura out/miniatura.png --gl=${REMOTION_GL:-swangle}
ffmpeg -v error -y -i out/miniatura.png -vf scale=1280:720:flags=lanczos -q:v 2 miniatura/miniatura.jpg
ls -la miniatura/miniatura.jpg
# Portadas de los reels (1080×1920)
for id in Portada1QueEs Portada2Jueces Portada3Icpc Portada4Colombia Portada5Uceva; do
  pnpm exec remotion still src/index.ts "$id" "out/$id.png" --gl=${REMOTION_GL:-swangle}
  ffmpeg -v error -y -i "out/$id.png" -q:v 2 "miniatura/$id.jpg"
done
ls -la miniatura/
