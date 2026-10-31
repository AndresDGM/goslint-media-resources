"""Reconocimiento de voz local con marcas por palabra (sherpa-onnx + NVIDIA Parakeet TDT 0.6B v3, multilingüe).

Sustituye a Whisper (sus modelos no se pueden descargar en el entorno de producción) y escribe el
mismo formato que espera import_vo.py: {"text": ..., "segments": [{"words": [{"word", "start", "end"}]}]}.

Uso: ~/tts/venv/bin/python scripts/asr.py public/audio/vo/raw/s01.mp3 [...]  -> scripts/asr/s01.json
Modelo: https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2
(descomprimido en ~/tts/, o en la ruta de la variable PARAKEET_DIR)
"""
import json, os, subprocess, sys
import numpy as np
import sherpa_onnx

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
MD = os.environ.get("PARAKEET_DIR", os.path.expanduser("~/tts/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"))
SR = 16000


def load(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32)


def recognizer():
    return sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=f"{MD}/encoder.int8.onnx", decoder=f"{MD}/decoder.int8.onnx", joiner=f"{MD}/joiner.int8.onnx",
        tokens=f"{MD}/tokens.txt", model_type="nemo_transducer", num_threads=4)


def words_of(res, dur):
    toks, ts = res.tokens, list(res.timestamps)
    words = []
    for i, (t, s) in enumerate(zip(toks, ts)):
        if t.startswith("▁") or t.startswith(" ") or not words:
            words.append({"word": t.lstrip("▁ "), "start": s, "end": s})
        else:
            words[-1]["word"] += t
        nxt = ts[i + 1] if i + 1 < len(ts) else min(dur, s + 0.4)
        words[-1]["end"] = min(nxt, s + 0.6)
    return [w for w in words if w["word"]]


def main():
    rec = recognizer()
    os.makedirs(os.path.join(ROOT, "scripts", "asr"), exist_ok=True)
    for path in sys.argv[1:]:
        x = load(path)
        st = rec.create_stream(); st.accept_waveform(SR, x); rec.decode_stream(st)
        r = st.result
        out = {"text": r.text, "segments": [{"words": words_of(r, len(x) / SR)}]}
        name = os.path.splitext(os.path.basename(path))[0]
        json.dump(out, open(os.path.join(ROOT, "scripts", "asr", name + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(name, ":", r.text)


if __name__ == "__main__":
    main()
