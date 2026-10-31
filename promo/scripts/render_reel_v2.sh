#!/usr/bin/env bash
# Renders the second Instagram Reel cut (1080x1920, 30 fps, 50 s, final narration) and masters its audio.
#   out/reel-v2-raw.mp4                 straight out of Remotion
#   out/goslint-instagram-reel-v2.mp4   final file: same video stream, audio at about -14 LUFS, peaks under -1 dBFS
#
# Usage: bash scripts/render_reel_v2.sh        (or: pnpm run render:reel:v2 / npm run render:reel:v2)
#   REEL_GL=swangle       CPU rendering, for machines without a working Vulkan driver (default: vulkan)
#   REEL_CONCURRENCY=6    browser tabs rendering in parallel
set -euo pipefail
cd "$(dirname "$0")/.."
GL="${REEL_GL:-vulkan}"
CONC="${REEL_CONCURRENCY:-6}"
RAW=out/reel-v2-raw.mp4
OUT=out/goslint-instagram-reel-v2.mp4
mkdir -p out

t0=$(date +%s.%N)
node_modules/.bin/remotion render GoslintInstagramReelV2 "$RAW" --gl="$GL" --concurrency="$CONC"
t1=$(date +%s.%N)

# The narration is almost continuous, so the music stays ducked and the raw mix sits near
# -18.1 LUFS. Raise it to Instagram's playback level and catch the few peaks with a limiter.
# Only gain and peak limiting: the voice is not re-timed, cut or pitched.
ffmpeg -v error -y -i "$RAW" -c:v copy \
	-af "volume=4.1dB,alimiter=limit=0.841:attack=5:release=50:level=false:latency=true" \
	-c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT"
t2=$(date +%s.%N)

LC_ALL=C printf 'render %.1f s (gl=%s, concurrency=%s) + master %.1f s -> %s\n' \
	"$(echo "$t1 - $t0" | bc)" "$GL" "$CONC" "$(echo "$t2 - $t1" | bc)" "$OUT"
