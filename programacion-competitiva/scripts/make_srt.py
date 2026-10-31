"""Exporta los subtítulos del video a SubRip (.srt) y WebVTT (.vtt) con los mismos tiempos que se ven en pantalla.
Uso: node scripts/dump_timeline.mjs && python3 scripts/make_srt.py  ->  subtitulos/programacion-competitiva.es.{srt,vtt}"""
import json, os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
tl = json.load(open(f"{R}/out/timeline.json", encoding="utf-8")); os.makedirs(f"{R}/subtitulos", exist_ok=True)
def ts(fr, sep):
    ms = round(fr / tl["fps"] * 1000); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}"
with open(f"{R}/subtitulos/programacion-competitiva.es.srt", "w", encoding="utf-8") as f:
    for i, c in enumerate(tl["cues"], 1):
        f.write(f"{i}\n{ts(c['from'], ',')} --> {ts(c['to'], ',')}\n{c['text']}\n\n")
with open(f"{R}/subtitulos/programacion-competitiva.es.vtt", "w", encoding="utf-8") as f:
    f.write("WEBVTT\n\n")
    for c in tl["cues"]:
        f.write(f"{ts(c['from'], '.')} --> {ts(c['to'], '.')}\n{c['text']}\n\n")
print(len(tl["cues"]), "subtítulos -> subtitulos/programacion-competitiva.es.srt y .vtt")
