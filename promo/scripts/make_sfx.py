"""Synthesised sound effects for the Goslint promo (no samples, free to use).
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
