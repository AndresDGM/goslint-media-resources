#!/usr/bin/env bash
# Quality checks for a rendered video.
# Usage: scripts/qa.sh out/goslint-promo.mp4 [out/qa]
set -euo pipefail
VID="${1:-out/goslint-promo.mp4}"
OUT="${2:-out/qa}"
mkdir -p "$OUT/frames"

echo "== container / streams"
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels -of default=nw=1 "$VID"

echo "== decode check (any error is printed)"
ffmpeg -v error -i "$VID" -f null - && echo "decode OK"

echo "== black frames (>=0.1 s)"
ffmpeg -hide_banner -i "$VID" -vf "blackdetect=d=0.1:pix_th=0.06" -an -f null - 2>&1 | grep -E "black_start" || echo "none"

echo "== frozen frames (>=1.5 s)"
ffmpeg -hide_banner -i "$VID" -vf "freezedetect=n=0.003:d=1.5" -an -f null - 2>&1 | grep -E "freeze_(start|duration)" || echo "none"

echo "== loudness (EBU R128) and true peak"
ffmpeg -hide_banner -i "$VID" -vn -af "ebur128=peak=true" -f null - 2>&1 | grep -A12 "Summary" | grep -E "I:|LRA:|Peak:"

echo "== clipped samples"
ffmpeg -hide_banner -i "$VID" -vn -af "astats=metadata=0:reset=0" -f null - 2>&1 | grep -E "Peak level dB|Number of clipped|Flat factor" | tail -3

echo "== contact sheets (one frame per second)"
ffmpeg -v error -y -i "$VID" -vf "fps=1,scale=480:-1,tile=6x2" "$OUT/sheet_%02d.jpg"
ls "$OUT"/sheet_*.jpg
