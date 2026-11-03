"""Copia las animaciones (clips) de las mascotas del kit a commons.

Entrada : mascotas/kit/salida/<id>/clips/{clips.json, *.png}   (python3 mascotas/kit/mascotas/animar_mascotas.py)
Salida  : commons/public/mascotas/clips/<id>/<clip>.png       (tiras horizontales, una celda por fotograma)
          commons/src/mascotas-clips.json                      (celda, ancla de los pies, duración de cada fotograma, bocas)

Uso (desde la raíz): python3 commons/scripts/import_clips.py
"""
import json, os, shutil

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
SRC = os.path.join(ROOT, "mascotas", "kit", "salida")
DST = os.path.join(ROOT, "commons", "public", "mascotas", "clips")
out = {}
for m in sorted(os.listdir(SRC)):
    cj = os.path.join(SRC, m, "clips", "clips.json")
    if not os.path.exists(cj):
        continue
    d = json.load(open(cj, encoding="utf-8"))
    os.makedirs(os.path.join(DST, m), exist_ok=True)
    out[m] = {}
    for name, c in d["clips"].items():
        shutil.copy(os.path.join(SRC, m, "clips", c["tira"]), os.path.join(DST, m, name + ".png"))
        out[m][name] = {"w": c["celda"][0], "h": c["celda"][1], "n": c["fotogramas"], "ms": c["ms"],
                        "ax": c["ancla_pies_en_celda"]["x"], "ay": c["ancla_pies_en_celda"]["y"], "loop": c["bucle"]}
        if name == "bocas":
            out[m][name]["etiquetas"] = c["etiquetas"]
    print(m, ", ".join(out[m]))
json.dump(out, open(os.path.join(ROOT, "commons", "src", "mascotas-clips.json"), "w", encoding="utf-8"), separators=(",", ":"))
