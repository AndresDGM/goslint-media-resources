"""Música original del video «¿Qué es un algoritmo?», sintetizada desde cero (sin muestras: uso libre).

Convenciones de Goslint v1: 120 BPM, la menor (y su relativo, do mayor), 4/4, timbres de 8 bits
(pulso al 12,5/25 %, triángulo, campanas FM). Un tiempo = 15 fotogramas y un compás = 60.
Más ligera y juguetona que la de programación competitiva: sin impactos épicos, y la instrumentación
cambia con cada bloque para que no canse en ~6:42.

La estructura NO está escrita a mano: se lee de out/timeline.json (node scripts/dump_timeline.mjs).
Cada bloque (b1..b7) empieza en el compás más cercano a su inicio real.

  b1 gancho        media-alta · Am F C G · arpegio de pulso, bajo, bombo suave y palmas
  b2 definición    media      · Fmaj7 C G Am · pads, campanas y bajo; solo hi-hats
  b3 cotidiano     alegre     · C G Am F · melodía staccato, bajo «oom-pah» y pandereta
  b4 el café       media, tensión juguetona · Am Dm E Am · bajo cromático staccato y pizzicato
  b5 2.º intento   media-alta, constructiva · F G Am C · se va llenando compás a compás
  b6 la compu      calmada y limpia · Fmaj7 C G Am · caja de música y pad, sin batería
  b7 cierre/reto   alta y luminosa · C G Am F · todo, y acorde final sostenido con cola de 5 s

Empieza con una entrada suave (pad y campana, sin golpes) y mide exactamente lo que el video.
Salida: public/audio/music.mp3 (estéreo, 48 kHz, 192 kbps, ≈ -20 LUFS integrados) y out/music.wav.

Uso: python3 scripts/make_music.py
"""
import json, os, re, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
TL = json.load(open(os.path.join(ROOT, "out", "timeline.json"), encoding="utf-8"))
SR, FPS = 48000, TL.get("fps", 30)
BEAT, BAR = 0.5, 2.0
TOTAL = TL["duration"] / FPS
NB = int(np.ceil(TOTAL / BAR))
N = int(SR * (TOTAL + 1.0))
TARGET_LUFS = -20.0
rng = np.random.default_rng(42)

# --------------------------------------------------------------------------- estructura
BLOCKS = sorted(((int(round(a / (BAR * FPS))), k) for k, (a, _) in TL["blocks"].items()))
starts = {k: b for b, k in BLOCKS}
block_of_bar = []
for b in range(NB):
    cur = [k for bb, k in BLOCKS if bb <= b][-1]
    block_of_bar.append(cur)
pos_in_block = [b - starts[block_of_bar[b]] for b in range(NB)]
len_block = {k: (starts[nxt] if nxt else NB) - starts[k]
             for k, nxt in zip([k for _, k in BLOCKS], [k for _, k in BLOCKS][1:] + [None])}
END_BAR = int((TOTAL - 6.0) // BAR)            # desde aquí: acorde final sostenido (cola ≈ 6 s)

# --------------------------------------------------------------------------- utilidades
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

pads, arp, bass, bell, mel, drums, fx = (Bus() for _ in range(7))

def pulse(f, dur, duty=0.25, dec=0.09):
    t = tt(dur); ph = (f * t) % 1.0
    return np.where(ph < duty, 1.0, -1.0) * np.exp(-t / dec) * np.minimum(1, t / 0.003) * np.minimum(1, (dur - t) / 0.01)

def triangle(f, dur, dec=0.25):
    t = tt(dur); ph = (f * t) % 1.0
    return (4 * np.abs(ph - 0.5) - 1) * np.exp(-t / dec) * np.minimum(1, t / 0.004) * np.minimum(1, (dur - t) / 0.02)

def fmbell(f, dur=1.6, dec=0.5, idx=1.4):
    t = tt(dur)
    return np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / 0.25)) * np.exp(-t / dec)

def musicbox(f, dur=1.2, dec=0.35):
    t = tt(dur)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4.01 * t) * np.exp(-t / 0.05)) * np.exp(-t / dec) * np.minimum(1, t / 0.002)

def pad(notes, dur, bright=850, fade_in=0.5, fade_out=0.7):
    t = tt(dur); out = np.zeros(len(t))
    for n in notes:
        for det in (-0.07, 0.0, 0.08):
            f = midi(n + det); out += 2 * ((f * t + rng.random()) % 1.0) - 1
    out = lp(out / (3 * len(notes)), bright)
    a, r = int(fade_in * SR), int(fade_out * SR)
    env = np.ones(len(t)); env[:a] = np.linspace(0, 1, a); env[-r:] = np.linspace(1, 0, r)
    return out * env

def kick(vol=1.0):
    t = tt(0.26); f = 48 + 90 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.1) * vol

def hat(dec=0.018):
    t = tt(0.07); return hp(rng.standard_normal(len(t)), 7500) * np.exp(-t / dec)

def clap():
    t = tt(0.14); x = sosfilt(butter(2, [900, 3500], "band", fs=SR, output="sos"), rng.standard_normal(len(t)))
    return x * (np.exp(-t / 0.025) + 0.5 * np.exp(-np.abs(t - 0.018) / 0.005))

def tambourine():
    t = tt(0.12); return hp(rng.standard_normal(len(t)), 5000) * np.exp(-t / 0.04) * (1 + 0.6 * np.sin(2 * np.pi * 70 * t))

def woodblock(f=900):
    t = tt(0.07); return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012) + hp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.004) * 0.3

def swell(dur=1.0, lo=1200, hi=7000):
    t = tt(dur); x = sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), rng.standard_normal(len(t)))
    return x * (t / dur) ** 2 * np.minimum(1, (dur - t) / 0.02)

def shimmer(dur=1.6):
    t = tt(dur); return hp(rng.standard_normal(len(t)), 5000) * np.exp(-t / 0.5) * 0.6

# --------------------------------------------------------------------------- armonía por bloque
# (acorde = notas MIDI, raíz del bajo)
AM, F, C, G = ([57, 60, 64], 45), ([53, 57, 60], 41), ([48, 52, 55, 60], 36), ([55, 59, 62], 43)
FMAJ7, C_, G_, AM_ = ([53, 57, 60, 64], 41), ([48, 52, 55], 36), ([55, 59, 62], 43), ([57, 60, 64], 45)
CM, GM, AMm, FM = ([60, 64, 67], 36), ([55, 59, 62, 67], 43), ([57, 60, 64], 45), ([53, 57, 60, 65], 41)
DM, E7 = ([50, 53, 57], 38), ([52, 56, 59, 62], 40)
F5, G5, A5, C5 = ([53, 57, 60], 41), ([55, 59, 62], 43), ([57, 60, 64], 45), ([48, 52, 55, 60], 36)
PROG = {
    "b1": [AM, F, C, G],
    "b2": [FMAJ7, C_, G_, AM_],
    "b3": [CM, GM, AMm, FM],
    "b4": [AM, DM, E7, AM],
    "b5": [F5, G5, A5, C5],
    "b6": [FMAJ7, C_, G_, AM_],
    "b7": [CM, GM, AMm, FM],
}
PENT = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84]      # pentatónica de la menor / do mayor

def melody_bar(b, t0, pat, vol, duty=0.125, octave=0, last=[8]):
    """Melodía staccato en pentatónica: paseo por la escala con apoyo en notas del acorde."""
    notes, _ = PROG[block_of_bar[b]][pos_in_block[b] % 4]
    i = last[0]
    for k in range(8):
        if not pat[k]: continue
        i = int(np.clip(i + rng.choice([-2, -1, -1, 0, 1, 1, 2]), 2, len(PENT) - 3))
        n = PENT[i]
        if k == 0:                                         # el primer tiempo cae en nota del acorde
            n = min((m + 12 * j for m in notes for j in (0, 1)), key=lambda m: abs(m - n)); i = int(np.argmin([abs(p - n) for p in PENT]))
        mel.add(pulse(midi(n + octave), 0.2, duty, 0.07), t0 + k * 0.25, vol, 0.25 * (-1) ** k)
    last[0] = i

MEL_PATS = [
    [1, 0, 1, 1, 0, 1, 0, 1], [1, 0, 0, 1, 1, 0, 1, 0], [1, 1, 0, 1, 0, 0, 1, 1], [1, 0, 1, 0, 1, 1, 0, 0],
]

# --------------------------------------------------------------------------- composición
for b in range(NB):
    t0 = b * BAR; blk = block_of_bar[b]; p = pos_in_block[b]
    notes, root = PROG[blk][p % 4]
    first = p == 0
    if b >= END_BAR:                                       # cierre: acorde final sostenido (do mayor con novena)
        if b == END_BAR:
            tail = (NB - END_BAR) * BAR + 0.5
            pads.add(pad([36, 48, 55, 60, 64, 67, 74], tail, 1400, 0.25, 4.5), t0, 0.9)
            for k, n in enumerate([72, 76, 79, 84, 88]):
                bell.add(fmbell(midi(n), 3.2, 1.2), t0 + k * 0.12, 0.17, 0.35 * (-1) ** k)
            bass.add(triangle(midi(36), 3.5, 1.6), t0, 0.35)
            drums.add(shimmer(2.4), t0, 0.1)
        continue
    # entrada suave: primer compás solo pad y campana
    if b == 0:
        pads.add(pad(notes, BAR + 0.7, 700, 1.2, 0.7), t0, 0.5)
        bell.add(fmbell(midi(notes[0] + 24), 1.8, 0.5), t0 + 0.5, 0.1, -0.2)
        bell.add(fmbell(midi(notes[2] + 24), 1.8, 0.5), t0 + 1.0, 0.1, 0.2)
        continue
    # transición entre bloques: oleaje suave antes y centelleo al entrar
    if first:
        fx.add(swell(1.0), t0 - 1.0, 0.1)
        for k, n in enumerate([notes[0] + 24, notes[1] + 24, notes[2] + 24]):
            bell.add(fmbell(midi(n), 1.4, 0.45), t0 + k * 0.08, 0.1, 0.3 * (-1) ** k)

    if blk == "b1":                                        # media-alta: arpegio, bajo, bombo suave
        pads.add(pad(notes, BAR + 0.7), t0, 0.45)
        for k in range(8):
            n = notes[[0, 1, 2, 1, 2, 1, 0, 1][(k + b) % 8] % len(notes)] + 12
            s = pulse(midi(n), 0.22, 0.25, 0.07)
            arp.add(s, t0 + k * 0.25, 0.08, -0.35 if k % 2 == 0 else 0.35)
            arp.add(s, t0 + k * 0.25 + 0.375, 0.026, 0.35 if k % 2 == 0 else -0.35)
            bass.add(triangle(midi(root + (12 if k in (3, 6) else 0)), 0.24, 0.2), t0 + k * 0.25, 0.32)
        for k in range(4):
            drums.add(kick(0.7), t0 + k * BEAT, 0.3); drums.add(hat(0.012), t0 + k * BEAT + 0.25, 0.04, 0.25)
        drums.add(clap(), t0 + BEAT, 0.05); drums.add(clap(), t0 + 3 * BEAT, 0.05)

    elif blk == "b2":                                      # media: pads, campanas, bajo y hats
        pads.add(pad(notes, BAR + 0.7), t0, 0.58)
        for k, d in enumerate([0, 2, 1, 2]):
            bell.add(fmbell(midi(notes[d % len(notes)] + 12), 1.4, 0.42), t0 + k * BEAT, 0.12, 0.35 * (-1) ** k)
        bass.add(triangle(midi(root), 0.9, 0.5), t0, 0.32); bass.add(triangle(midi(root + 7), 0.45, 0.3), t0 + 1.0, 0.26)
        for k in range(4): drums.add(hat(0.016), t0 + k * BEAT + 0.25, 0.035, 0.25)
        if p % 2 == 1: drums.add(woodblock(1100), t0 + 1.5, 0.05)

    elif blk == "b3":                                      # alegre: oom-pah, melodía, pandereta
        pads.add(pad(notes, BAR + 0.5, 1100), t0, 0.28)
        for k in range(4):
            if k % 2 == 0:
                bass.add(triangle(midi(root + (12 if k == 2 else 0)), 0.4, 0.2), t0 + k * BEAT, 0.38)
            else:
                for n in notes[:3]:
                    arp.add(pulse(midi(n + 12), 0.16, 0.25, 0.06), t0 + k * BEAT, 0.045, -0.3)
            drums.add(tambourine(), t0 + k * BEAT + 0.25, 0.05, 0.3)
        drums.add(kick(0.55), t0, 0.26); drums.add(kick(0.55), t0 + BEAT * 2, 0.22)
        drums.add(clap(), t0 + BEAT, 0.045); drums.add(clap(), t0 + 3 * BEAT, 0.045)
        melody_bar(b, t0, MEL_PATS[(b * 3 + 1) % 4], 0.075, 0.125, 12)

    elif blk == "b4":                                      # tensión juguetona: cromático y pizzicato
        pads.add(pad(notes, BAR + 0.5, 600), t0, 0.3)
        walk = [root, root + 1, root + 2, root + 3] if p % 2 == 0 else [root, root + 7, root + 5, root + 6]
        for k in range(8):
            if k % 2 == 0:
                bass.add(triangle(midi(walk[k // 2] + (12 if k >= 4 else 0)), 0.2, 0.12), t0 + k * 0.25, 0.36)
        for k in (1, 3, 4, 6, 7):
            n = notes[(k + p) % len(notes)] + 12 + 12 * (k == 6)
            arp.add(pulse(midi(n), 0.1, 0.125, 0.04), t0 + k * 0.25, 0.07, 0.4 * (-1) ** k)
        for k in range(4): drums.add(woodblock(780 if k % 2 == 0 else 1050), t0 + k * BEAT, 0.05, 0.2 * (-1) ** k)
        drums.add(hat(0.02), t0 + 0.75, 0.04); drums.add(hat(0.02), t0 + 1.75, 0.04)
        if p % 4 == 3:                                     # pregunta sin resolver
            bell.add(fmbell(midi(81), 1.2, 0.3), t0 + 1.5, 0.1, 0.3)

    elif blk == "b5":                                      # constructiva: se llena compás a compás
        lvl = min(3, 1 + p // 3)
        pads.add(pad(notes, BAR + 0.7), t0, 0.45)
        for k in range(8):
            n = notes[[0, 2, 1, 2, 0, 2, 1, 2][(k + b) % 8] % len(notes)] + (12 if k % 4 != 3 else 24)
            arp.add(pulse(midi(n), 0.2, 0.25, 0.07), t0 + k * 0.25, 0.07 if lvl > 1 else 0.05, 0.35 * (-1) ** k)
        for k in range(4):
            bass.add(triangle(midi(root), 0.45, 0.25), t0 + k * BEAT, 0.34)
        if lvl >= 2:
            for k in range(4): drums.add(hat(0.014), t0 + k * BEAT + 0.25, 0.04, 0.25)
            drums.add(kick(0.7), t0, 0.28); drums.add(kick(0.7), t0 + BEAT * 2, 0.24)
        if lvl >= 3:
            for k in range(4): drums.add(kick(0.7), t0 + k * BEAT, 0.12)
            drums.add(clap(), t0 + BEAT, 0.055); drums.add(clap(), t0 + 3 * BEAT, 0.055)
            melody_bar(b, t0, MEL_PATS[(b + 2) % 4], 0.06, 0.25, 12)
        if p % 4 == 3 and lvl >= 2:
            for k in range(4): drums.add(hat(0.03), t0 + 1.5 + k * 0.125, 0.045, 0.1)

    elif blk == "b6":                                      # calmada y limpia: caja de música y pad
        pads.add(pad(notes, BAR + 0.9, 900, 0.7, 0.9), t0, 0.55)
        order = [0, 2, 1, 2, 3 % len(notes), 2, 1, 2]
        for k in range(8):
            n = notes[order[k] % len(notes)] + 12 + (12 if k in (0, 4) else 0)
            bell.add(musicbox(midi(n), 1.0, 0.3), t0 + k * 0.25, 0.1 if k % 2 == 0 else 0.07, 0.4 * (-1) ** k)
        bass.add(triangle(midi(root), 1.8, 0.9), t0, 0.3)

    elif blk == "b7":                                      # alta y luminosa
        pads.add(pad(notes, BAR + 0.7, 1300), t0, 0.5)
        for k in range(8):
            n = notes[[0, 1, 2, 1, 2, 1, 0, 2][(k + b) % 8] % len(notes)] + (12 if k % 4 != 3 else 24)
            s = pulse(midi(n), 0.2, 0.25, 0.07)
            arp.add(s, t0 + k * 0.25, 0.075, -0.35 if k % 2 == 0 else 0.35)
            arp.add(s, t0 + k * 0.25 + 0.375, 0.028, 0.35 if k % 2 == 0 else -0.35)
            bass.add(triangle(midi(root + (12 if k in (3, 6) else 0)), 0.24, 0.2), t0 + k * 0.25, 0.33)
        for k in range(4):
            drums.add(kick(0.8), t0 + k * BEAT, 0.34); drums.add(hat(0.012), t0 + k * BEAT + 0.25, 0.04, 0.25)
            drums.add(tambourine(), t0 + k * BEAT, 0.035, -0.2)
        drums.add(clap(), t0 + BEAT, 0.06); drums.add(clap(), t0 + 3 * BEAT, 0.06)
        melody_bar(b, t0, MEL_PATS[(b * 5 + 3) % 4], 0.07, 0.125, 12)
        if p % 4 == 3:
            for k in range(4): drums.add(hat(0.03), t0 + 1.5 + k * 0.125, 0.045, 0.1)
        if first: drums.add(shimmer(2.0), t0, 0.12)

# --------------------------------------------------------------------------- mezcla
ir_t = tt(0.9); ir = rng.standard_normal((len(ir_t), 2)) * np.exp(-ir_t / 0.24)[:, None] * 0.02
wet_src = pads.x * 0.6 + bell.x + arp.x * 0.5 + mel.x * 0.6 + fx.x * 0.4
wet = np.stack([fftconvolve(wet_src[:, c], ir[:, c])[:N] for c in range(2)], 1)
mix = pads.x + arp.x + bass.x + bell.x + mel.x + drums.x + fx.x + wet * 0.5
mix = hp(mix.T, 30).T
mix = np.tanh(mix * 1.3) / 1.3
n_end = int(round(TL["duration"] / FPS * SR)); mix = mix[:n_end]
# entrada breve (sin golpe en el fotograma 0) y cola de 5 s al final
fi = int(0.35 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fade = int(5.0 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.6

def write_wav(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

def integrated_lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])

os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
wav = os.path.join(ROOT, "out", "music.wav")
mix = mix / np.abs(mix).max() * 0.5
write_wav(wav, mix)
gain = 10 ** ((TARGET_LUFS - integrated_lufs(wav)) / 20)       # normaliza a ≈ -20 LUFS
mix = mix * gain
peak = np.abs(mix).max()
if peak > 10 ** (-1.5 / 20): mix *= 10 ** (-1.5 / 20) / peak   # nunca más de -1,5 dBFS
write_wav(wav, mix)
mp3 = os.path.join(ROOT, "public", "audio", "music.mp3")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-c:a", "libmp3lame", "-b:a", "192k", "-ar", "48000", mp3], check=True)
print(f"música: {TOTAL:.2f} s, {NB} compases -> public/audio/music.mp3 ({os.path.getsize(mp3) / 1e6:.1f} MB)")
print("bloques (compás de inicio):", {k: starts[k] for k in starts}, "· acorde final desde el compás", END_BAR)
