"""Importa la narración de ElevenLabs y calcula la sincronía.

Entrada : public/audio/vo/raw/sNN.mp3   (una generación de ElevenLabs por segmento, sin tocar)
          scripts/asr/sNN.json          (Whisper con marcas por palabra; ver README)
          scripts/narration.txt         (guion maestro con cortes de subtítulo y marcas de sincronía)
Salida  : public/audio/vo/sNN.wav       (48 kHz mono, silencios recortados, compresor suave, pico −1,5 dBFS)
          src/narration.json            (duración, subtítulos con tiempos, marcas {nombre: segundos} y
                                         envolvente por fotograma para la boca de la mascota)

Cada palabra del guion se alinea con las palabras que reconoció Whisper (difflib); las palabras
que no casan (cifras, «low», «ZAS»…) se interpolan entre sus vecinas y las marcas se ajustan al
arranque de energía más cercano. Un segmento sin audio se marca «missing»: el video conserva sus
subtítulos y su duración estimada, y se sabe exactamente qué falta.

Uso: python3 scripts/import_vo.py
"""
import difflib, json, os, re, subprocess, sys, unicodedata, wave
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narration import ROOT, captions, segments, spoken_text  # noqa: E402

SR, FPS = 48000, 30
RAW = os.path.join(ROOT, "public", "audio", "vo", "raw")
OUT = os.path.join(ROOT, "public", "audio", "vo")
ASR = os.path.join(ROOT, "scripts", "asr")

NUM = {"0": "cero", "1": "uno", "2": "dos", "4": "cuatro", "7": "siete", "8": "ocho", "9": "nueve", "10": "diez", "11": "once", "12": "doce",
       "13": "trece", "15": "quince", "16": "dieciseis", "20": "veinte", "23": "veintitres", "31": "treinta", "39": "treinta", "42": "cuarenta",
       "43": "cuarenta", "47": "cuarenta", "75": "setenta", "80": "ochenta", "769": "setecientos", "1024": "mil"}


def norm(w):
    s = unicodedata.normalize("NFD", w.lower())
    s = "".join(c for c in s if c.isalnum())
    return NUM.get(s, s)


def load_mp3(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


def rms(x, win):
    n = len(x) // win
    return np.sqrt((x[: n * win].reshape(n, win) ** 2).mean(1) + 1e-12)


VOICE_LUFS = -17.5   # sonoridad objetivo de cada segmento (todas las tomas quedan al mismo nivel)


def lufs(path):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", err)[-1])


def master_voice(x, out_path):
    """Compresor suave (umbral −22 dB, 3:1, ataque 4 ms, relajación 90 ms), ganancia hasta VOICE_LUFS
    y limitador a −1,5 dBFS. Se hace con FFmpeg; no cambia la duración ni el timbre."""
    tmp = out_path + ".tmp.wav"
    with wave.open(tmp, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    comp = "highpass=f=70,acompressor=threshold=-22dB:ratio=3:attack=4:release=90:makeup=1"
    tmp2 = out_path + ".tmp2.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", comp, tmp2], check=True)
    gain = VOICE_LUFS - lufs(tmp2)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp2, "-af", f"volume={gain:.2f}dB,alimiter=limit=0.841:attack=5:release=60:level=false", "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", out_path], check=True)
    os.remove(tmp); os.remove(tmp2)
    return load_mp3(out_path), gain


def script_tokens(raw):
    """[(palabra, [marcas previas], corte_previo)] en el orden en que se pronuncian."""
    toks, marks, brk = [], [], True
    for piece in re.findall(r"\[[^\]]*\]|\{\w+\}|\||[^\s\[\]{}|]+", raw):
        if piece.startswith("["):
            continue
        if piece.startswith("{"):
            marks.append(piece[1:-1])
        elif piece == "|":
            brk = True
        else:
            if not norm(piece):  # signos sueltos
                continue
            toks.append([piece, marks, brk]); marks, brk = [], False
    return toks


def main():
    segs = segments(); out = {}; report = []
    for sid, raw in segs.items():
        toks = script_tokens(raw); caps = captions(raw)
        mp3 = os.path.join(RAW, sid + ".mp3")
        if not os.path.exists(mp3):
            # segmento pendiente: duración estimada a 12,5 caracteres/s y reparto proporcional
            total = len(spoken_text(raw)) / 12.5; pos = 0; n = sum(len(t[0]) + 1 for t in toks); times = []
            for t in toks:
                times.append((pos / n * total, (pos + len(t[0])) / n * total)); pos += len(t[0]) + 1
            seconds, missing, env = total, True, "0" * int(total * FPS)
        else:
            x = load_mp3(mp3)
            r = rms(x, SR // 100); thr = r.max() * 0.03; idx = np.where(r > thr)[0]
            lead = max(0, idx[0] / 100 - 0.02); tail = min(len(x) / SR, (idx[-1] + 1) / 100 + 0.12)
            x = x[int(lead * SR): int(tail * SR)]
            x = x / np.abs(x).max() * 0.7
            fade = int(0.005 * SR); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
            n_in = len(x)
            x, gain = master_voice(x, os.path.join(OUT, sid + ".wav"))
            x = x[:n_in] if len(x) >= n_in else np.pad(x, (0, n_in - len(x)))
            seconds, missing = len(x) / SR, False
            asr = json.load(open(os.path.join(ASR, sid + ".json"), encoding="utf-8"))
            words = [w for s in asr["segments"] for w in s.get("words", [])]
            a = [norm(t[0]) for t in toks]; b = [norm(w["word"]) for w in words]
            times = [None] * len(toks); matched = 0
            for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
                if tag == "equal":
                    for k in range(i2 - i1):
                        times[i1 + k] = (words[j1 + k]["start"] - lead, words[j1 + k]["end"] - lead); matched += 1
                elif tag == "replace" and j2 > j1:
                    # mismo tramo dicho con otras palabras (cifras, anglicismos): reparto dentro del tramo de Whisper
                    t0, t1 = words[j1]["start"] - lead, words[j2 - 1]["end"] - lead; n = i2 - i1
                    for k in range(n):
                        times[i1 + k] = (t0 + (t1 - t0) * k / n, t0 + (t1 - t0) * (k + 1) / n)
            # huecos: interpolar entre vecinos
            i = 0
            while i < len(times):
                if times[i] is None:
                    j = i
                    while j < len(times) and times[j] is None:
                        j += 1
                    t0 = times[i - 1][1] if i > 0 else 0.0; t1 = times[j][0] if j < len(times) else seconds
                    for k in range(i, j):
                        times[k] = (t0 + (t1 - t0) * (k - i) / (j - i), t0 + (t1 - t0) * (k - i + 1) / (j - i))
                    i = j
                else:
                    i += 1
            times = [(max(0.0, min(seconds, s)), max(0.0, min(seconds, e))) for s, e in times]
            # envolvente por fotograma (0..3) para la boca
            fr = rms(x, SR // FPS); lv = fr / (np.percentile(fr, 95) + 1e-9)
            env = "".join(str(int(0 if v < 0.12 else 1 if v < 0.45 else 2 if v < 0.9 else 3)) for v in lv)
            report.append((sid, seconds, matched, len(toks), spoken_text(raw), asr["text"].strip()))
            r10 = rms(x, SR // 100)
        # marcas (ajustadas al arranque de energía más cercano) y subtítulos
        marks = {}; cues = []; cur = None
        for (word, mk, brk), (t0, t1) in zip(toks, times):
            for m in mk:
                t = t0
                if not missing:
                    c = int(t0 * 100); lo, hi = max(1, c - 14), min(len(r10) - 1, c + 14); th = r10.max() * 0.06
                    on = [k for k in range(lo, hi) if r10[k] > th and r10[k - 1] <= th]
                    if on:
                        t = min(on, key=lambda k: abs(k - c)) / 100
                    else:
                        # sin silencio previo (p. ej. «así que… ¡ZAS!»): ajustar al salto de intensidad más cercano
                        lo2, hi2, th2 = max(1, c - 25), min(len(r10) - 1, c + 12), r10.max() * 0.25
                        up = [k for k in range(lo2, hi2) if r10[k] > th2 and r10[k - 1] <= th2 and r10[max(0, k - 6):k].max() <= th2]
                        if up:
                            t = min(up, key=lambda k: abs(k - c)) / 100
                if m in marks:
                    raise SystemExit(f"marca duplicada {m} en {sid}")
                marks[m] = round(t, 3)
            if brk:
                cur = [t0, t1]; cues.append(cur)
            else:
                cur[1] = t1
        assert len(cues) == len(caps), (sid, len(cues), len(caps))
        out[sid] = {"file": None if missing else f"audio/vo/{sid}.wav", "seconds": round(seconds, 3), "missing": missing,
                    "cues": [{"t0": round(c[0], 3), "t1": round(c[1], 3), "text": t} for c, t in zip(cues, caps)], "marks": marks, "env": env}
    with open(os.path.join(ROOT, "src", "narration.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print("segmento  seg.   palabras casadas")
    for sid, sec, m, n, script, heard in report:
        print(f"{sid}  {sec:6.2f}  {m}/{n}")
    with open(os.path.join(ROOT, "scripts", "asr", "comparacion.txt"), "w", encoding="utf-8") as fh:
        for sid, sec, m, n, script, heard in report:
            fh.write(f"== {sid}  ({m}/{n} palabras casadas)\nGUION  : {script}\nWHISPER: {heard}\n\n")
    total = sum(v["seconds"] for v in out.values()); miss = [k for k, v in out.items() if v["missing"]]
    print(f"total narración: {total:.1f} s; pendientes: {miss or 'ninguno'}")


if __name__ == "__main__":
    main()
