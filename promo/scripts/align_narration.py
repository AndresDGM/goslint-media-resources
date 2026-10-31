"""Word-level timing of the final Reel narration (public/audio/vo/audio.mp3).

Forced alignment: the transcript below is fixed (it was checked against two independent
Whisper transcriptions of the MP3, `turbo` and `large-v3`) and torchaudio's multilingual CTC
aligner (MMS_FA) finds where each word is spoken. The result is the single source of timing
for the captions and the animation sync points of src/reel-v2/timeline.ts.

Usage (needs torch + torchaudio and ffmpeg; the Chatterbox venv of this project has them):
  .venv-chatterbox/bin/python scripts/align_narration.py
    -> src/reel-v2/narration-words.json   [{word, start, end, score}], seconds
"""
import json
import os
import subprocess
import sys
import tempfile
import unicodedata

import torch
import torchaudio
from torchaudio.pipelines import MMS_FA as bundle

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "public", "audio", "vo", "audio.mp3")
OUT = os.path.join(ROOT, "src", "reel-v2", "narration-words.json")

# Exactly what the voice says, with the spelling shown on screen.
TEXT = """Cinco horas, tres personas, un solo computador y un reloj que no se detiene.
Esto es Goslint, el semillero de Ingeniería de Sistemas de la UCEVA.
Aquí aprendemos a diseñar algoritmos, trabajar con estructuras de datos y resolver problemas usando C++, Python y Java.
Organizamos nuestras propias maratones y salimos a competir en Pereira, Cali y Bogotá, en la Regional ICPC.
Pero lo más valioso no está solo en el código.
Está en pensar en equipo, equivocarnos juntos y celebrar cada problema resuelto.
También investigamos y construimos nuestro propio juez en línea.
No necesitas experiencia previa, solo curiosidad y ganas de practicar.
Tu primer problema ya te está esperando.
Ven, únete a Goslint."""

# The aligner works on plain a-z letters: these words are given as they sound.
SPOKEN = {"C++": "cemasmas", "ICPC": "icepece", "Python": "paiton", "Java": "yava", "UCEVA": "uceba", "Goslint": "goslin"}


def spoken(word):
    bare = word.strip(".,")
    if bare in SPOKEN:
        return SPOKEN[bare]
    s = unicodedata.normalize("NFD", bare.lower())
    return "".join(c for c in s if "a" <= c <= "z")


def main():
    words = TEXT.split()
    with tempfile.TemporaryDirectory() as tmp:
        wav_path = os.path.join(tmp, "narration16k.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-ac", "1", "-ar", str(bundle.sample_rate), wav_path], check=True)
        wav, sr = torchaudio.load(wav_path)
    model = bundle.get_model()
    with torch.inference_mode():
        emission, _ = model(wav)
        spans = bundle.get_aligner()(emission[0], bundle.get_tokenizer()([spoken(w) for w in words]))
    sec = wav.shape[1] / emission.shape[1] / sr  # seconds per emission frame
    out = []
    for w, sp in zip(words, spans):
        score = sum(s.score * len(s) for s in sp) / sum(len(s) for s in sp)
        out.append({"word": w, "start": round(sp[0].start * sec, 3), "end": round(sp[-1].end * sec, 3), "score": round(score, 2)})
        print(f"{out[-1]['start']:7.3f} {out[-1]['end']:7.3f}  f{round(out[-1]['start'] * 30):5d}  {out[-1]['score']:.2f}  {w}")
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("[\n" + ",\n".join("  " + json.dumps(o, ensure_ascii=False) for o in out) + "\n]\n")
    print("wrote", os.path.relpath(OUT, ROOT), f"({len(out)} words, audio {wav.shape[1] / sr:.2f} s)")


if __name__ == "__main__":
    sys.exit(main())
