"""Prepara la narración para el montaje: mide cada toma y escribe src/narration.json.

Para cada línea de scripts/guion.json (toma en public/audio/vo/raw/<id>.mp3):
  - ventana de habla [t0, t1] (recorta el silencio inicial y final de la toma),
  - marcas por palabra (de scripts/asr/<id>.json, generado con ../commons/scripts/asr.py),
  - niveles de voz 0–3 por fotograma de video (boca de Vee), ya con la velocidad `rate` aplicada,
  - ganancia para igualar la sonoridad entre tomas.

Uso (desde la carpeta del proyecto):
    python3 ../commons/scripts/asr.py public/audio/vo/raw/*.mp3     # solo si hay tomas nuevas
    python3 scripts/build_vo.py
    node scripts/dump_timeline.mjs                                   # marcas.txt y out/timeline.json
"""
import json, os, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 16000
FPS = 30


def load(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32)


def rms(x, win):
    n = len(x) // win
    return np.sqrt((x[: n * win].reshape(n, win) ** 2).mean(axis=1) + 1e-12)


def main():
    g = json.load(open(os.path.join(ROOT, "scripts", "guion.json"), encoding="utf-8"))
    rate = g["rate"]
    out, speech = {}, []
    for ln in g["lineas"]:
        i = ln["id"]
        path = os.path.join(ROOT, "public", "audio", "vo", "raw", i + ".mp3")
        if not os.path.exists(path):
            sys.exit(f"Falta la toma {path}")
        x = load(path)
        dur = len(x) / SR
        env = rms(x, SR // 100)  # 100 Hz
        thr = max(0.012, 0.06 * np.percentile(env, 95))
        on = np.where(env > thr)[0]
        t0 = max(0.0, on[0] / 100 - 0.05)
        t1 = min(dur, on[-1] / 100 + 0.16)
        asr = os.path.join(ROOT, "scripts", "asr", i + ".json")
        if not os.path.exists(asr):
            sys.exit(f"Falta {asr}: ejecuta ../commons/scripts/asr.py sobre la toma")
        words = [[w["word"], round(w["start"], 3), round(w["end"], 3)] for s in json.load(open(asr, encoding="utf-8"))["segments"] for w in s["words"]]
        # niveles por fotograma de video: cada fotograma cubre rate/FPS segundos de la toma, desde t0
        step = rate / FPS
        nfr = int(np.ceil((t1 - t0) / step))
        ref = np.percentile(env[on[0] : on[-1] + 1], 90)
        lv = []
        for k in range(nfr):
            a = int((t0 + k * step) * 100)
            b = max(a + 1, int((t0 + (k + 1) * step) * 100))
            e = float(env[a:b].max()) / ref if a < len(env) else 0.0
            lv.append(0 if e < 0.12 else 1 if e < 0.42 else 2 if e < 0.85 else 3)
        loud = float(np.sqrt((x[int(t0 * SR) : int(t1 * SR)] ** 2).mean()))
        speech.append(loud)
        out[i] = {"file": f"audio/vo/raw/{i}.mp3", "dur": round(dur, 3), "t0": round(t0, 3), "t1": round(t1, 3), "words": words, "levels": "".join(map(str, lv)), "loud": loud}
    target = float(np.median(speech))
    for i, o in out.items():
        o["gain"] = round(min(1.25, max(0.8, (target / o.pop("loud")) ** 0.5)), 3)  # iguala a medias: conserva la intención de cada toma
    json.dump(out, open(os.path.join(ROOT, "src", "narration.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

    print(f"{len(out)} tomas en src/narration.json. Ahora: node scripts/dump_timeline.mjs (escribe scripts/marcas.txt y out/timeline.json)")


def fmt(s):
    return f"{int(s // 60)}:{s % 60:04.1f}"


if __name__ == "__main__":
    main()
