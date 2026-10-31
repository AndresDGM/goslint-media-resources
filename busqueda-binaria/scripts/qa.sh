#!/usr/bin/env bash
# Comprobaciones objetivas sobre el video renderizado.
# Uso: scripts/qa.sh [out/goslint-busqueda-binaria.mp4] [out/qa]
set -euo pipefail
cd "$(dirname "$0")/.."
VID="${1:-out/goslint-busqueda-binaria.mp4}"
OUT="${2:-out/qa}"
mkdir -p "$OUT"

echo "== contenedor y flujos"
ffprobe -v error -show_entries format=format_name,duration,size,bit_rate:stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,color_space,sample_rate,channels -of default=nw=1 "$VID"

echo "== decodificación completa (se imprime cualquier error)"
ffmpeg -v error -i "$VID" -f null - && echo "decodifica sin errores"

echo "== fotogramas negros (>= 0,1 s)"
ffmpeg -hide_banner -nostats -i "$VID" -vf "blackdetect=d=0.1:pix_th=0.06" -an -f null - 2>&1 | grep -oE "black_start.*" || echo "ninguno"

echo "== imagen congelada (>= 1,5 s)"
ffmpeg -hide_banner -i "$VID" -vf "freezedetect=n=0.003:d=1.5" -an -f null - 2>&1 | grep -E "freeze_(start|duration)" || echo "ninguna"

echo "== sonoridad (EBU R128) y pico real"
ffmpeg -hide_banner -i "$VID" -vn -af "ebur128=peak=true" -f null - 2>&1 | grep -A14 "Summary" | grep -E "I:|LRA:|Peak:"

echo "== muestras recortadas"
ffmpeg -hide_banner -i "$VID" -vn -af "astats=metadata=0:reset=0" -f null - 2>&1 | grep -E "Peak level dB|Number of clipped|Flat factor" | tail -3

echo "== silencios de audio (>= 2 s)"
ffmpeg -hide_banner -i "$VID" -vn -af "silencedetect=noise=-50dB:d=2" -f null - 2>&1 | grep -E "silence_(start|duration)" || echo "ninguno"

echo "== hojas de contacto (un fotograma cada 3 s)"
rm -f "$OUT"/sheet_*.jpg
ffmpeg -v error -y -i "$VID" -vf "fps=1/3,scale=480:-1,tile=6x5" -q:v 3 "$OUT/sheet_%02d.jpg"
ls "$OUT"/sheet_*.jpg
