"""Offline approximation of the Remotion mix (music ducking + narration + SFX) to tune levels
before a full render. Parses the cue sheet from src/AudioLayer.tsx and src/timeline.ts.
Usage: python3 scripts/simulate_mix.py [music_gain] [ducked_gain] -> out/sim_mix.wav"""
import json, re, sys, wave, os
import numpy as np
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SR, FPS = 48000, 30
def read(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
        ch, sr = w.getnchannels(), w.getframerate()
    a = a.reshape(-1, ch)
    if ch == 1: a = np.repeat(a, 2, 1)
    if sr != SR:
        idx = np.arange(0, len(a), sr / SR); a = a[idx.astype(int)]
    return a
tl = open(f"{R}/src/timeline.ts").read(); al = open(f"{R}/src/AudioLayer.tsx").read()
vo = json.load(open(f"{R}/src/vo-manifest.json"))
sync = {k: int(v) for k, v in re.findall(r"(\w+): (\d+),", tl.split("export const SYNC")[1])}
cues = [(i, int(f)) for i, f in re.findall(r"id: '(l\d+)', from: (\d+)", tl)]
MUSIC = float(sys.argv[1]) if len(sys.argv) > 1 else float(re.search(r"const MUSIC = ([\d.]+)", al).group(1))
DUCK = float(sys.argv[2]) if len(sys.argv) > 2 else float(re.search(r"const DUCKED = ([\d.]+)", al).group(1))
VOICE = float(re.search(r"const VOICE = ([\d.]+)", al).group(1))
music = read(f"{R}/public/audio/music.wav"); N = len(music)
fr = np.arange(N) / SR * FPS
duck = np.zeros(N)
for i, f0 in cues:
    a = f0 - 6; b = f0 + int(np.ceil(vo[i]["seconds"] * FPS)) + 4
    d = np.minimum(np.clip((fr - (a - 6)) / 6, 0, 1), np.clip(1 - (fr - b) / 10, 0, 1))
    duck = np.maximum(duck, d)
mix = music * (MUSIC - (MUSIC - DUCK) * duck)[:, None]
for i, f0 in cues:
    v = read(f"{R}/public/{vo[i]['file']}") * VOICE; s = int(f0 / FPS * SR); mix[s:s + len(v)] += v[: N - s]
# simple SFX entries: {at: X, file: 'y', vol: z}
for at, fn, vol in re.findall(r"\{at: ([^,]+), file: '(\w+)', vol: ([\d.]+)", al):
    try: f0 = eval(at, {}, {"SYNC": type("S", (), sync)})
    except Exception: continue
    x = read(f"{R}/public/audio/sfx/{fn}.wav") * float(vol); s = int(f0 / FPS * SR)
    if s < N: mix[s:s + len(x)] += x[: N - s]
os.makedirs(f"{R}/out", exist_ok=True)
print("peak dBFS", round(20 * np.log10(np.abs(mix).max()), 2))
with wave.open(f"{R}/out/sim_mix.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
