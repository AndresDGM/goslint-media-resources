#!/usr/bin/env bash
# Renders the 16:9 promo cut for YouTube (1920x1080, 30 fps, 50 s, final narration) and masters its audio.
#   out/promo-v2-raw.mp4                 straight out of Remotion
#   out/goslint-promo-v2.mp4         final file: same video stream, audio at about -14 LUFS, peaks under -1 dBFS
#
# Usage: bash scripts/render_promo_v2.sh        (or: pnpm run render:promo:v2 / npm run render:promo:v2)
#   PROMO_GL=swangle       CPU rendering, for machines without a working Vulkan driver (default: vulkan)
#   PROMO_CONCURRENCY=6    browser tabs rendering in parallel
set -euo pipefail
cd "$(dirname "$0")/.."
GL="${PROMO_GL:-vulkan}"
CONC="${PROMO_CONCURRENCY:-6}"
RAW=out/promo-v2-raw.mp4
OUT=out/goslint-promo-v2.mp4
mkdir -p out

t0=$(date +%s.%N)
node_modules/.bin/remotion render GoslintPromoV2 "$RAW" --gl="$GL" --concurrency="$CONC"
t1=$(date +%s.%N)

# The narration is almost continuous, so the music stays ducked and the raw mix sits near
# -18.1 LUFS. Raise it to the -14 LUFS that YouTube (and Instagram) play back at and catch the few peaks with a limiter.
# Only gain and peak limiting: the voice is not re-timed, cut or pitched.
ffmpeg -v error -y -i "$RAW" -c:v copy \
	-af "volume=4.1dB,alimiter=limit=0.841:attack=5:release=50:level=false:latency=true" \
	-c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT"
t2=$(date +%s.%N)

LC_ALL=C printf 'render %.1f s (gl=%s, concurrency=%s) + master %.1f s -> %s\n' \
	"$(echo "$t1 - $t0" | bc)" "$GL" "$CONC" "$(echo "$t2 - $t1" | bc)" "$OUT"
