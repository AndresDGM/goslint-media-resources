#!/usr/bin/env bash
# Renderiza los reels de las fases 1–7 (1080×1920) -> out/reels/goslint-roadmap-fase-N.mp4 (con masterizado de audio)
set -euo pipefail
cd "$(dirname "$0")/.."
node ../commons/scripts/sync-public.mjs   # recursos comunes -> public/
mkdir -p out/reels
for n in 1 2 3 4 5 6 7; do
  pnpm exec remotion render "ReelFase$n" "out/reels/raw-$n.mp4" "$@"
  ffmpeg -y -v error -i "out/reels/raw-$n.mp4" -c:v copy -af "volume=${MASTER_GAIN_DB:-2.6}dB,alimiter=limit=0.84:attack=5:release=80:level=false" \
    -c:a aac -b:a 256k -ar 48000 -movflags +faststart "out/reels/goslint-roadmap-fase-$n.mp4"
  echo "Listo: out/reels/goslint-roadmap-fase-$n.mp4"
done
