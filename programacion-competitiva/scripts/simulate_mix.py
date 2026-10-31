"""Aproximación fuera de línea de la mezcla de Remotion (música con ducking + narración + efectos)
para ajustar niveles sin renderizar. Lee out/timeline.json y los niveles de src/AudioLayer.tsx.
Uso: python3 scripts/simulate_mix.py   ->  out/sim_mix.wav  (+ sonoridad y picos)"""
import json, os, re, subprocess, wave
import numpy as np
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SR, FPS = 48000, 30
def read(p):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).reshape(-1, 2).astype(np.float64)
tl = json.load(open(f"{R}/out/timeline.json")); al = open(f"{R}/src/AudioLayer.tsx").read()
MUSIC, DUCK, VOICE, SFXG = (float(re.search(rf"const {k} = ([\d.]+)", al).group(1)) for k in ("MUSIC", "DUCKED", "VOICE", "SFX_GAIN"))
N = int(tl["duration"] / FPS * SR); music = read(f"{R}/public/audio/music.mp3")[:N]
music = np.pad(music, ((0, N - len(music)), (0, 0))); fr = np.arange(N) / SR * FPS; duck = np.zeros(N)
for v in tl["voices"].values():
    a, b = v["start"] - 6, v["end"] + 4
    duck = np.maximum(duck, np.minimum(np.clip((fr - (a - 8)) / 8, 0, 1), np.clip(1 - (fr - b) / 14, 0, 1)))
mix = music * (MUSIC - (MUSIC - DUCK) * duck)[:, None]; voice_only = np.zeros((N, 2))
for v in tl["voices"].values():
    if not v["file"]: continue
    x = read(f"{R}/public/{v['file']}") * VOICE; s = int(v["start"] / FPS * SR); voice_only[s:s + len(x)] += x[: N - s]
cache = {}
for e in tl["sfx"]:
    x = cache.setdefault(e["file"], read(f"{R}/public/audio/sfx/{e['file']}.wav"))
    if e.get("dur"): x = x[: int(e["dur"] / FPS * SR)]
    s = int(e["at"] / FPS * SR)
    if s < N: mix[s:s + len(x)] += x[: N - s] * e["vol"] * SFXG
bed = mix.copy(); mix += voice_only
def db(x): return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)
sp = duck > 0.99
print(f"MUSIC={MUSIC} DUCKED={DUCK} VOICE={VOICE}")
print(f"pico de la mezcla: {20 * np.log10(np.abs(mix).max()):.2f} dBFS")
print(f"durante la voz -> voz {db(voice_only[sp]):.1f} dB RMS · música+efectos {db(bed[sp]):.1f} dB RMS · diferencia {db(voice_only[sp]) - db(bed[sp]):.1f} dB")
os.makedirs(f"{R}/out", exist_ok=True)
with wave.open(f"{R}/out/sim_mix.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"{R}/out/sim_mix.wav", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print("\n".join(l.strip() for l in out.split("Summary:")[-1].splitlines() if re.search(r"I:|LRA:|Peak:", l)))
