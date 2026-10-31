"""Efectos de sonido sintetizados (sin muestras, uso libre). Base: Goslint v1; al final, los de este video.
Usage: python3 scripts/make_sfx.py  ->  public/audio/sfx/*.wav"""
import os, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(11)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "audio", "sfx")
os.makedirs(OUT, exist_ok=True)

def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)

def save(name, x, peak_db=-3.0):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)
    pcm = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(name, f"{len(x) / SR:.2f}s")

def t(sec):
    return np.arange(int(sec * SR)) / SR

# mechanical key click
def key(seed):
    r = np.random.default_rng(seed)
    tt = t(0.06)
    click = filt(r.standard_normal(len(tt)), "band", [1800, 7000]) * np.exp(-tt / 0.006)
    thock = np.sin(2 * np.pi * (180 + r.random() * 60) * tt) * np.exp(-tt / 0.015) * 0.6
    return click + thock

# a 2.4 s typing burst with natural rhythm
typing = np.zeros(int(2.4 * SR))
pos = 0.0
k = 0
while pos < 2.3:
    s = key(k)
    i = int(pos * SR)
    typing[i:i + len(s)] += s * (0.6 + 0.4 * rng.random())
    pos += 0.045 + rng.random() * 0.06 + (0.12 if rng.random() < 0.08 else 0)
    k += 1
save("typing", typing, -6)
save("key", key(3), -6)
save("enter", key(99) * 1.0 + np.pad(key(5), (int(0.012 * SR), 0))[: len(key(99))] * 0.7, -4)

# whoosh: band-passed noise sweep with swell
tt = t(0.7)
n = rng.standard_normal(len(tt))
out = np.zeros(len(tt))
for c in range(20):
    a, b = c * len(tt) // 20, (c + 1) * len(tt) // 20
    fc = 400 * 12 ** (np.sin(np.pi * c / 20))
    out[a:b] = filt(n, "band", [fc * 0.6, min(fc * 1.8, 20000)])[a:b]
env = np.sin(np.pi * np.clip(tt / 0.7, 0, 1)) ** 2
wl = out * env
wr = np.roll(wl, int(0.008 * SR))
save("whoosh", np.stack([wl, wr], 1), -5)

# glitch: bit-crushed, stuttered noise + tone
tt = t(0.35)
g = np.sign(np.sin(2 * np.pi * 220 * tt)) * 0.4 + rng.standard_normal(len(tt)) * 0.5
g = np.round(g * 4) / 4
gate = (np.floor(tt * 40) % 3 != 1).astype(float)
g = filt(g * gate, "high", 300) * np.exp(-tt / 0.15)
save("glitch", g, -8)

# UI blip
tt = t(0.12)
save("blip", np.sin(2 * np.pi * 1320 * tt) * np.exp(-tt / 0.03) + np.sin(2 * np.pi * 2640 * tt) * np.exp(-tt / 0.015) * 0.3, -9)

# Accepted chime: rising major third + fifth, FM bell
def bell(f, dur, dec):
    tt = t(dur)
    return np.sin(2 * np.pi * f * tt + 1.2 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt / 0.2)) * np.exp(-tt / dec)
ac = np.zeros(int(1.2 * SR))
for i, f in enumerate([1046.5, 1318.5, 1568.0]):
    s = bell(f, 1.0, 0.35)
    j = int(i * 0.07 * SR)
    ac[j:j + len(s)] += s * (0.8 if i < 2 else 1.0)
save("ac", ac, -6)

# Wrong answer buzz: short detuned low square
tt = t(0.22)
wa = (np.sign(np.sin(2 * np.pi * 110 * tt)) + np.sign(np.sin(2 * np.pi * 116 * tt))) * 0.5
wa = filt(wa, "low", 1800) * np.minimum(1, (0.22 - tt) / 0.05)
save("wa", wa, -10)

# camera-ish flash tick for photo cuts
tt = t(0.18)
fl = filt(rng.standard_normal(len(tt)), "high", 4000) * np.exp(-tt / 0.02) + np.sin(2 * np.pi * 900 * tt) * np.exp(-tt / 0.01) * 0.4
save("flash", fl, -10)

# deep hit used under big title cards
tt = t(1.6)
f = 40 + 80 * np.exp(-tt / 0.06)
hit = np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.5) * 2)
hit += filt(rng.standard_normal(len(tt)), "band", [200, 3000]) * np.exp(-tt / 0.05) * 0.3
save("hit", hit, -3)

# ------------------------------------------------------------------ efectos añadidos para «Búsqueda binaria»
# (pixel art: ondas cuadradas y triangulares de 8 bits, todo sintetizado aquí, sin muestras)

def sq(f, tt, duty=0.5):
    ph = (np.cumsum(np.broadcast_to(f, tt.shape)) / SR) % 1.0
    return np.where(ph < duty, 1.0, -1.0)

def tri(f, tt):
    ph = (np.cumsum(np.broadcast_to(f, tt.shape)) / SR) % 1.0
    return 4 * np.abs(ph - 0.5) - 1

# silbido de la hoja: ruido filtrado que barre de agudo a grave, muy corto
tt = t(0.2)
n = rng.standard_normal(len(tt)); out = np.zeros(len(tt))
for c in range(16):
    a, b = c * len(tt) // 16, (c + 1) * len(tt) // 16
    fc = 9000 * (0.16 ** (c / 15))
    out[a:b] = filt(n, "band", [fc * 0.7, min(fc * 1.5, 20000)])[a:b]
save("slash", out * np.sin(np.pi * tt / 0.2) ** 0.7, -6)

# golpe cómico del machete: «tchac» metálico + golpe grave + rebote de 8 bits
tt = t(0.42)
thunk = np.tanh(np.sin(2 * np.pi * np.cumsum(60 + 170 * np.exp(-tt / 0.03)) / SR) * np.exp(-tt / 0.11) * 2.2)
clack = filt(rng.standard_normal(len(tt)), "band", [1400, 6500]) * np.exp(-tt / 0.012)
ring = (np.sin(2 * np.pi * 2350 * tt) + 0.6 * np.sin(2 * np.pi * 3710 * tt)) * np.exp(-tt / 0.05) * 0.25
bw = sq(520 * np.exp(-tt / 0.09) + 150, tt, 0.25) * np.exp(-tt / 0.08) * 0.28
save("chop", thunk + clack * 0.9 + ring + bw, -3)

# astillas: granos de ruido que caen
tt = t(0.5); d = np.zeros(len(tt))
for k in range(9):
    i = int(rng.random() * 0.3 * SR); g = t(0.05)
    d[i:i + len(g)] += filt(rng.standard_normal(len(g)), "high", 2500 + rng.random() * 3000) * np.exp(-g / 0.012) * (0.4 + rng.random() * 0.6)
save("debris", d, -10)

# desenvainar: «shing» metálico ascendente
tt = t(0.6)
f = 1800 + 3800 * (tt / 0.6) ** 0.5
sh = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + np.sin(2 * np.pi * np.cumsum(f * 1.503) / SR) * 0.3
sh += filt(rng.standard_normal(len(tt)), "high", 6000) * 0.25
save("draw", sh * np.minimum(1, tt / 0.01) * np.exp(-tt / 0.22), -7)

# las mitades se separan: arrastre grave
tt = t(0.35)
save("slide", filt(rng.standard_normal(len(tt)), "band", [90, 420]) * np.sin(np.pi * tt / 0.35) ** 1.5, -9)

# burbuja / aparición de un indicador
tt = t(0.11)
save("pop", sq(420 + 900 * (tt / 0.11), tt, 0.5) * np.exp(-tt / 0.04), -11)

# aterrizaje de la mascota
tt = t(0.16)
save("land", tri(190 * np.exp(-tt / 0.05) + 70, tt) * np.exp(-tt / 0.05) + filt(rng.standard_normal(len(tt)), "low", 900) * np.exp(-tt / 0.02) * 0.4, -8)

# «no»: dos notas descendentes de 8 bits
tt = t(0.2)
save("no", np.where(tt < 0.09, sq(311, tt, 0.25), sq(233, tt, 0.25)) * np.minimum(1, (0.2 - tt) / 0.04) * 0.9, -13)

# escala ascendente (datos ordenados / aparición de una fila)
r = np.zeros(int(0.62 * SR))
for i, m in enumerate([60, 62, 64, 67, 69, 72, 76, 79]):
    g = t(0.11); fq = 440 * 2 ** ((m - 69) / 12)
    x = sq(fq, g, 0.25) * np.exp(-g / 0.045); j = int(i * 0.062 * SR); r[j:j + len(x)] += x
save("rise", r, -13)

# tensión creciente (la barra del millón, la carrera de 1.024)
tt = t(2.4)
rz = sq(110 * 2 ** (tt / 2.4 * 2), tt, 0.25) * 0.3 + filt(rng.standard_normal(len(tt)), "band", [600, 5000]) * (tt / 2.4) ** 2 * 0.5
gate = (np.floor(tt * (8 + 16 * tt / 2.4)) % 2 == 0).astype(float)
save("riser", rz * (0.25 + 0.75 * tt / 2.4) * (0.5 + 0.5 * gate) * np.minimum(1, (2.4 - tt) / 0.03), -12)

# tic-tic de contador (se recorta con `dur` en la hoja de efectos)
tk = np.zeros(int(3.2 * SR))
for i in range(64):
    g = t(0.025); x = np.sin(2 * np.pi * (2400 + 30 * i) * g) * np.exp(-g / 0.006); j = int(i * 0.05 * SR); tk[j:j + len(x)] += x
save("ticks", tk, -14)

# pila de llamadas: apilar y desapilar
tt = t(0.14)
save("stack", sq(330 + 400 * tt / 0.14, tt, 0.5) * np.exp(-tt / 0.05) + filt(rng.standard_normal(len(tt)), "low", 700) * np.exp(-tt / 0.02) * 0.5, -11)
save("unstack", sq(730 - 400 * tt / 0.14, tt, 0.5) * np.exp(-tt / 0.05), -12)

# rebote cómico tras el remate
tt = t(0.5)
save("boing", tri(180 + 260 * np.abs(np.sin(2 * np.pi * 7 * tt)) * np.exp(-tt / 0.2), tt) * np.exp(-tt / 0.22), -9)
