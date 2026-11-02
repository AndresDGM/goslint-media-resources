#!/usr/bin/env bash
# Miniatura para YouTube: out/miniatura.png (1920×1080) y miniatura/miniatura.jpg (1280×720, < 2 MB)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out miniatura
pnpm exec remotion still src/index.ts Miniatura out/miniatura.png --gl=${REMOTION_GL:-swangle}
ffmpeg -v error -y -i out/miniatura.png -vf scale=1280:720:flags=lanczos -q:v 2 miniatura/miniatura.jpg
ls -la miniatura/miniatura.jpg
