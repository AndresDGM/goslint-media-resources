#!/usr/bin/env bash
# Renderiza los 5 reels verticales (1080×1920) -> out/reels/goslint-reel-0N.mp4 (con masterizado de audio)
set -euo pipefail
cd "$(dirname "$0")/.."
node ../commons/scripts/sync-public.mjs   # recursos comunes -> public/
mkdir -p out/reels
i=0
for id in Reel1QueEs Reel2Jueces Reel3Icpc Reel4Colombia Reel5Uceva; do
  i=$((i+1))
  pnpm exec remotion render "$id" "out/reels/raw-$i.mp4" "$@"
  ffmpeg -y -v error -i "out/reels/raw-$i.mp4" -c:v copy -af "volume=${MASTER_GAIN_DB:-2.6}dB,alimiter=limit=0.84:attack=5:release=80:level=false" \
    -c:a aac -b:a 256k -ar 48000 -movflags +faststart "out/reels/goslint-reel-0$i.mp4"
  echo "Listo: out/reels/goslint-reel-0$i.mp4"
done
