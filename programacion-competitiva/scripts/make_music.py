"""Música original del video «Búsqueda binaria», sintetizada desde cero (sin muestras: uso libre).

Convenciones de Goslint v1: 120 BPM, la menor, 4/4, progresión i–VI–III–VII (Am F C G) y, en las
partes tranquilas, Fmaj7–C–G–Am. Un tiempo = 15 fotogramas y un compás = 60, así que cada cambio
de escena del montaje (que cae en compás) coincide con un cambio de sección de la música.
Adaptación para este video: timbres de 8 bits (pulso al 25 %, triángulo) acordes con el pixel art.

La estructura NO está escrita a mano: se lee de out/timeline.json (node scripts/dump_timeline.mjs),
de modo que la música siempre mide lo mismo que el video y cambia de energía con cada capítulo.

Uso: python3 scripts/make_music.py   ->  public/audio/music.mp3  (y out/music.wav)
"""
import json, os, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
TL = json.load(open(os.path.join(ROOT, "out", "timeline.json"), encoding="utf-8"))
SR, FPS = 48000, 30
BEAT, BAR = 0.5, 2.0
TOTAL = TL["duration"] / FPS
NB = int(np.ceil(TOTAL / BAR))
N = int(SR * (TOTAL + 1.0))
rng = np.random.default_rng(7)

# energía por escena: 1 = pads y campana · 2 = + arpegio, bajo y hats · 3 = + bombo y palmas
ENERGY = {"intro": 2, "que": 2, "problema": 1, "juez": 3, "icpc": 3, "camino": 2, "colombia": 2, "uceva": 2, "cierre": 3, "final": 3}
scene_of_bar, energy = [], []
for b in range(NB):
    f = b * BAR * FPS
    sc = next((k for k, (a, e) in TL["scenes"].items() if a <= f < e), "final")
    scene_of_bar.append(sc); energy.append(ENERGY[sc])
LOGO_BAR = 2                                              # el logotipo golpea en el compás 2 (fotograma 120)
for b in range(NB):
    if b < LOGO_BAR: energy[b] = 0
# el logotipo final golpea 30 fotogramas antes de «¿Te gusta programar?» (ver scenes/D.tsx, Final)
gos_cue = {"from": TL["voices"]["s10"]["start"] - 30}
END_BAR = int(np.ceil(TL["voices"]["s10"]["end"] / FPS / BAR))   # acorde final sostenido desde aquí
for b in range(END_BAR, NB): energy[b] = 0

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def lp(x, fc, order=2): return sosfilt(butter(order, min(max(fc, 40), SR * 0.47), "low", fs=SR, output="sos"), x)
def hp(x, fc, order=2): return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)
def tt(sec): return np.arange(int(sec * SR)) / SR

class Bus:
    def __init__(self): self.x = np.zeros((N, 2))
    def add(self, sig, t, gain=1.0, pan=0.0):
        i = int(t * SR)
        if i >= N or i < 0: return
        l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
        j = min(i + len(sig), N)
        self.x[i:j, 0] += sig[: j - i] * gain * l; self.x[i:j, 1] += sig[: j - i] * gain * r

pads, arp, bass, bell, drums, fx = (Bus() for _ in range(6))

# acordes (notas MIDI): Am F C G  /  Fmaj7 C G Am
MAIN = [[57, 60, 64], [53, 57, 60], [48, 52, 55, 60], [55, 59, 62]]
CALM = [[53, 57, 60, 64], [48, 52, 55], [55, 59, 62], [57, 60, 64]]
ROOTS_MAIN, ROOTS_CALM = [45, 41, 36, 43], [41, 36, 43, 45]

def chord(b):
    calm = energy[b] == 1
    return (CALM if calm else MAIN)[b % 4], (ROOTS_CALM if calm else ROOTS_MAIN)[b % 4]

def pulse(f, dur, duty=0.25, dec=0.09):
    t = tt(dur); ph = (f * t) % 1.0
    return np.where(ph < duty, 1.0, -1.0) * np.exp(-t / dec) * np.minimum(1, t / 0.003)

def triangle(f, dur, dec=0.25):
    t = tt(dur); ph = (f * t) % 1.0
    return (4 * np.abs(ph - 0.5) - 1) * np.exp(-t / dec) * np.minimum(1, t / 0.004) * np.minimum(1, (dur - t) / 0.02)

def fmbell(f, dur=1.6, dec=0.5):
    t = tt(dur)
    return np.sin(2 * np.pi * f * t + 1.4 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / 0.25)) * np.exp(-t / dec)

def pad(notes, dur):
    t = tt(dur); out = np.zeros(len(t))
    for n in notes:
        for det in (-0.07, 0.0, 0.08):
            f = midi(n + det); out += 2 * ((f * t + rng.random()) % 1.0) - 1
    out = lp(out / (3 * len(notes)), 850)
    a, r = int(0.5 * SR), int(0.7 * SR)
    env = np.ones(len(t)); env[:a] = np.linspace(0, 1, a); env[-r:] = np.linspace(1, 0, r)
    return out * env

def kick():
    t = tt(0.32); f = 45 + 110 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13)

def hat(dec=0.02):
    t = tt(0.08); return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t / dec)

def clap():
    t = tt(0.16); x = sosfilt(butter(2, [900, 3500], "band", fs=SR, output="sos"), rng.standard_normal(len(t)))
    return x * (np.exp(-t / 0.03) + 0.5 * np.exp(-np.abs(t - 0.02) / 0.006))

def crash(dur=1.6):
    t = tt(dur); return hp(rng.standard_normal(len(t)), 3500) * np.exp(-t / 0.45)

def riser(dur=1.0):
    t = tt(dur); x = sosfilt(butter(2, [800, 6000], "band", fs=SR, output="sos"), rng.standard_normal(len(t)))
    return x * (t / dur) ** 2.5

def impact():
    t = tt(2.2); f = 34 + 70 * np.exp(-t / 0.07)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7) * 2.2)

ARP = [0, 1, 2, 1, 2, 1, 0, 1]
for b in range(NB):
    t0 = b * BAR; e = energy[b]; notes, root = chord(b)
    first = b == 0 or scene_of_bar[b] != scene_of_bar[b - 1]
    if b < LOGO_BAR:                                      # apertura: zumbido grave y tic-tac
        pads.add(pad([33, 45], BAR + 0.6), t0, 0.5)
        for k in range(4):
            g = tt(0.03); fx.add(np.sin(2 * np.pi * (3200 if k % 2 == 0 else 2400) * g) * np.exp(-g / 0.006), t0 + k * BEAT, 0.16, 0.3 if k % 2 else -0.3)
        continue
    if b >= END_BAR:                                      # cierre: acorde de la menor sostenido
        if b == END_BAR: pads.add(pad([45, 57, 60, 64, 69], (NB - END_BAR) * BAR + 0.5), t0, 0.9)
        continue
    pads.add(pad(notes, BAR + 0.7), t0, 0.62 if e == 1 else 0.5)
    if first and b > LOGO_BAR:                            # cambio de capítulo: redoble de ruido y platillo
        fx.add(riser(1.0), t0 - 1.0, 0.16); fx.add(crash(), t0, 0.14)
        bell.add(fmbell(midi(notes[0] + 24)), t0, 0.16, -0.2)
    if e == 1:                                            # código: campana lenta sobre los acordes
        for k, d in enumerate([0, 2, 1, 2]):
            bell.add(fmbell(midi(notes[d % len(notes)] + 12), 1.4, 0.42), t0 + k * BEAT, 0.13, 0.35 * (-1) ** k)
        if b % 2 == 0: bass.add(triangle(midi(root), 1.6, 0.9), t0, 0.3)
    if e >= 2:
        for k in range(8):                                # arpegio de pulso en corcheas, con eco
            n = notes[ARP[(k + b) % 8] % len(notes)] + (12 if e == 2 else 12 + 12 * (k % 4 == 3))
            s = pulse(midi(n), 0.22, 0.25, 0.07)
            arp.add(s, t0 + k * 0.25, 0.085, -0.35 if k % 2 == 0 else 0.35)
            arp.add(s, t0 + k * 0.25 + 0.375, 0.03, 0.35 if k % 2 == 0 else -0.35)
        for k in range(8):                                # bajo de triángulo
            if e == 2 and k % 2 == 1: continue
            bass.add(triangle(midi(root + (12 if k in (3, 6) else 0)), 0.24, 0.2), t0 + k * 0.25, 0.34)
        for k in range(4): drums.add(hat(0.018), t0 + k * BEAT + 0.25, 0.05, 0.25)
        if e == 2: drums.add(kick(), t0, 0.3)
    if e >= 3:
        for k in range(4):
            drums.add(kick(), t0 + k * BEAT, 0.42)
            drums.add(hat(0.012), t0 + k * BEAT, 0.03, -0.25)
        drums.add(clap(), t0 + BEAT, 0.07); drums.add(clap(), t0 + 3 * BEAT, 0.07)
        if b % 4 == 3: [drums.add(hat(0.03), t0 + 1.5 + k * 0.125, 0.045, 0.1) for k in range(4)]

# impactos: logotipo de apertura y logotipo final
fx.add(riser(1.6), LOGO_BAR * BAR - 1.6, 0.3); fx.add(impact(), LOGO_BAR * BAR, 0.75); fx.add(crash(2.2), LOGO_BAR * BAR, 0.24)
pads.add(pad([45, 52, 57, 64], 4.4), LOGO_BAR * BAR, 0.85)
t_gos = gos_cue["from"] / FPS
fx.add(riser(1.2), t_gos - 1.2, 0.26); fx.add(impact(), t_gos, 0.6); fx.add(crash(2.4), t_gos, 0.2)
for k, n in enumerate([69, 72, 76, 81]): bell.add(fmbell(midi(n), 2.4, 0.9), t_gos + k * 0.18, 0.2, 0.3 * (-1) ** k)

# reverberación corta por convolución con ruido
ir_t = tt(1.1); ir = rng.standard_normal((len(ir_t), 2)) * np.exp(-ir_t / 0.28)[:, None] * 0.02
wet_src = pads.x * 0.6 + bell.x + arp.x * 0.5 + fx.x * 0.4
wet = np.stack([fftconvolve(wet_src[:, c], ir[:, c])[:N] for c in range(2)], 1)
mix = pads.x + arp.x + bass.x + bell.x + drums.x + fx.x + wet * 0.5
mix = hp(mix.T, 30).T
mix = np.tanh(mix * 1.5) / 1.5
n_end = int(TOTAL * SR); mix = mix[:n_end]
fade = int(3.0 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix = mix / np.abs(mix).max() * 10 ** (-1.0 / 20)
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
wav = os.path.join(ROOT, "out", "music.wav")
with wave.open(wav, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
mp3 = os.path.join(ROOT, "public", "audio", "music.mp3")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-c:a", "libmp3lame", "-b:a", "192k", mp3], check=True)
print(f"música: {TOTAL:.1f} s, {NB} compases -> public/audio/music.mp3 ({os.path.getsize(mp3) / 1e6:.1f} MB)")
print("energía por compás:", "".join(str(e) for e in energy))
