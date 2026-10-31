"""Generate narration with Kokoro (open-weights TTS, runs offline).
Usage: python make_vo.py <kokoro.onnx> <voices.bin> <out_dir>"""
import json, sys, os
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
here = os.path.dirname(os.path.abspath(__file__))
model, voices, out = sys.argv[1:4]
k = Kokoro(model, voices)


def compress(x, sr, thr_db=-18.0, ratio=3.0, att=0.004, rel=0.09, peak_db=-1.5):
    """Gentle broadcast-style compressor so the voice sits clearly over the music."""
    x = x / (np.abs(x).max() + 1e-9)
    a_att, a_rel = np.exp(-1 / (att * sr)), np.exp(-1 / (rel * sr))
    env = np.zeros_like(x)
    e = 0.0
    for i, v in enumerate(np.abs(x)):
        e = a_att * e + (1 - a_att) * v if v > e else a_rel * e + (1 - a_rel) * v
        env[i] = e
    thr = 10 ** (thr_db / 20)
    gain = np.where(env > thr, (env / thr) ** (1 / ratio - 1), 1.0)
    y = x * gain
    return y / np.abs(y).max() * 10 ** (peak_db / 20)
lines = json.load(open(os.path.join(here, "narration.json"), encoding="utf-8"))
manifest = {}
for ln in lines:
    s, sr = k.create(ln["text"], voice=ln.get("voice", "em_alex"), speed=ln.get("speed", 1.0), lang="es")
    s = np.asarray(s, dtype=np.float32)
    # trim leading/trailing silence
    thr = 0.01 * np.abs(s).max()
    idx = np.where(np.abs(s) > thr)[0]
    s = s[max(idx[0] - int(0.02 * sr), 0): idx[-1] + int(0.12 * sr)]
    s = compress(s, sr)
    fn = f"{ln['id']}.wav"
    sf.write(os.path.join(out, fn), s, sr, subtype="PCM_16")
    manifest[ln["id"]] = {"file": f"audio/vo/{fn}", "seconds": round(len(s) / sr, 3)}
    print(ln["id"], manifest[ln["id"]]["seconds"])
json.dump(manifest, open(os.path.join(here, "..", "src", "vo-manifest.json"), "w"), indent=2)
