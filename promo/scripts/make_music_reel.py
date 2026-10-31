"""Soundtrack for the Instagram Reel cut (45 s), re-arranged from the original promo track.

Same instruments, key, tempo and mix chain as scripts/make_music.py (120 BPM, A minor);
only the arrangement is shorter so that every section change still lands on a cut of the
vertical edit (src/reel/timeline.ts). One beat = 0.5 s = 15 frames at 30 fps.

Sections (beats):
   0-8    intro: drone, clock ticks, heartbeat, riser            (hook)
   8-14   logo: impact + open chords, arp fades in               (logo)
  14-32   groove A: kick, offbeat hats, rolling bass, arp        (problem card + training)
  32-47   groove B: + clap, 16th hats, brighter arp, fill        (maratones)
  47-63   breakdown: no drums, warm pads, bell melody            (equipo)
  63-72   build: kick returns, snare roll + riser, one-beat gap  (investigación + Goslint Judge)
  72-82   drop: everything + lead                                (requisitos)
  82-90   outro: final impact, held A minor chord, fade          (llamado final)

Usage: python3 scripts/make_music_reel.py  ->  public/audio/music-reel.wav
"""
import os
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
TOTAL = 45.0
N = int(SR * (TOTAL + 2))
rng = np.random.default_rng(7)

def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT

def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)

def lp(x, fc, order=2):
    fc = min(max(fc, 40), SR / 2 * 0.95)
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)

def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)

def env_adsr(n, a, d, s, r, sus_len):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sus = max(int(sus_len * SR) - a - d, 0)
    e = np.concatenate([
        np.linspace(0, 1, max(a, 1)),
        np.linspace(1, s, max(d, 1)),
        np.full(sus, s),
        np.linspace(s, 0, max(r, 1)),
    ])
    if len(e) < n:
        e = np.pad(e, (0, n - len(e)))
    return e[:n]

def saw(f, n, phase=0.0):
    t = np.arange(n) / SR
    return 2 * ((f * t + phase) % 1.0) - 1

class Bus:
    def __init__(self):
        self.x = np.zeros((N, 2))

    def add(self, sig, t, gain=1.0, pan=0.0):
        i = int(t * SR)
        if i >= N:
            return
        if sig.ndim == 1:
            l = np.cos((pan + 1) * np.pi / 4)
            r = np.sin((pan + 1) * np.pi / 4)
            sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
        j = min(i + len(sig), N)
        self.x[i:j] += sig[: j - i] * gain

drums, bass, pads, arp, lead, fx, keys = (Bus() for _ in range(7))

# ---------------------------------------------------------------- instruments
def kick(gain=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.28)
    click = hp(rng.standard_normal(n), 2000) * np.exp(-t / 0.004) * 0.25
    return np.tanh((body + click) * 1.6) * gain

def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 7000, 4) * np.exp(-t / (0.07 if open_ else 0.012))
    return x * 0.5

def clap():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    e = np.zeros(n)
    for k, off in enumerate([0, 0.009, 0.018, 0.027]):
        i = int(off * SR)
        e[i:] += np.exp(-(t[: n - i]) / (0.006 if k < 3 else 0.11))
    return bp(rng.standard_normal(n), 900, 5000) * e * 0.55

def snare(gain=1.0):
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04) * 0.5
    noise = bp(rng.standard_normal(n), 1500, 9000) * np.exp(-t / 0.06)
    return (tone + noise) * 0.5 * gain

def tick(high=True):
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    f = 3200 if high else 2400
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.004) * 0.35

def supersaw(notes, dur, cutoff, a=0.4, r=0.8, voices=5, detune=0.12):
    n = int((dur + r) * SR)
    out = np.zeros((n, 2))
    for m in notes:
        f0 = midi(m)
        for v in range(voices):
            cents = (v - (voices - 1) / 2) * detune / (voices - 1) * 100 * 2
            f = f0 * 2 ** (cents / 1200)
            s = saw(f, n, rng.random())
            pan = (v / (voices - 1)) * 2 - 1
            out[:, 0] += s * (1 - pan) / 2
            out[:, 1] += s * (1 + pan) / 2
    out = np.stack([lp(out[:, 0], cutoff, 2), lp(out[:, 1], cutoff, 2)], 1)
    e = env_adsr(n, a, 0.3, 0.8, r, dur)
    return out * e[:, None] / (len(notes) * voices) * 1.4

def bass_note(m, dur, cutoff=420, gain=1.0):
    n = int((dur + 0.05) * SR)
    t = np.arange(n) / SR
    f = midi(m)
    s = saw(f, n) * 0.6 + np.sin(2 * np.pi * f * t) * 0.8
    s = lp(s, cutoff, 2)
    return s * env_adsr(n, 0.004, 0.08, 0.7, 0.04, dur) * gain

def pluck(m, dur=0.5, cutoff=3000, gain=1.0):
    n = int((dur + 0.4) * SR)
    t = np.arange(n) / SR
    f = midi(m)
    s = (2 * np.abs(2 * ((f * t) % 1) - 1) - 1) * 0.6 + (np.sign(np.sin(2 * np.pi * f * t))) * 0.25
    s = lp(s, cutoff, 2)
    return s * np.exp(-t / 0.22) * gain

def bell(m, gain=1.0, decay=1.2):
    n = int(decay * 3 * SR)
    t = np.arange(n) / SR
    f = midi(m)
    s = np.sin(2 * np.pi * f * t + 1.8 * np.sin(2 * np.pi * f * 3.5 * t) * np.exp(-t / 0.4))
    return s * np.exp(-t / decay) * gain * 0.4

def riser(dur, gain=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    k = t / dur
    noise = rng.standard_normal(n)
    # sweep a band upward in 32 chunks
    out = np.zeros(n)
    chunks = 32
    for c in range(chunks):
        a, b = c * n // chunks, (c + 1) * n // chunks
        fc = 300 * (40 ** (c / chunks))
        out[a:b] = bp(noise, fc * 0.7, min(fc * 1.6, 20000))[a:b]
    tone = saw(1, n) * 0
    ph = 2 * np.pi * np.cumsum(110 * 2 ** (3 * k)) / SR
    tone = np.sin(ph) * 0.3 + np.sign(np.sin(ph * 1.005)) * 0.08
    return (out * 0.6 + tone) * (k ** 2) * gain

def impact(gain=1.0):
    n = int(3.0 * SR)
    t = np.arange(n) / SR
    f = 35 + 60 * np.exp(-t / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9)
    crash = hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.7) * 0.25
    return np.tanh((boom + crash) * 1.5) * gain

# ---------------------------------------------------------------- harmony
# i-VI-III-VII in A minor: Am, F, C, G   (MIDI notes)
CHORDS = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]]
ROOTS = [33, 29, 36, 31]                       # A1, F1, C2, G1
BREAK_CHORDS = [[53, 57, 60, 64], [55, 60, 64, 67], [55, 59, 62, 67], [57, 60, 64, 69]]  # Fmaj7 C G Am
BREAK_ROOTS = [29, 36, 31, 33]

def chord_of(bar, breakdown=False):
    return (BREAK_CHORDS if breakdown else CHORDS)[bar % 4], (BREAK_ROOTS if breakdown else ROOTS)[bar % 4]

kick_times = []

def put_kick(t, g=1.0):
    drums.add(kick(g), t, 0.9)
    kick_times.append(t)

# ---------------------------------------------------------------- arrangement
def tb(beat):
    return beat * BEAT

def arp_beats(q0, n16, ch, cutoff, gain, octave=12, pattern=(0, 1, 2, 1, 0, 2, 1, 2), i0=0):
    notes = ch + [ch[0] + 12]
    for i in range(n16):
        m = notes[pattern[(i0 + i) % len(pattern)]] + octave
        arp.add(pluck(m, 0.12, cutoff, gain), tb(q0 + i * 0.25), 1.0, pan=0.35 if (i0 + i) % 2 else -0.35)

def groove(q0, q1, ch, root, level="A", arp_cut=1500, kick_gain=1.0, i0=0):
    """Four-on-the-floor groove from beat q0 to q1 over one chord."""
    for k, q in enumerate(range(q0, q1)):
        put_kick(tb(q), kick_gain)
        drums.add(hat(), tb(q + 0.5), 0.7)
        if level in ("B", "D"):
            drums.add(hat(), tb(q + 0.25), 0.3)
            drums.add(hat(), tb(q + 0.75), 0.3)
            if (i0 // 4 + k) % 2 == 1:
                drums.add(clap(), tb(q), 0.8)
        for s in (1, 2, 3):
            bass.add(bass_note(root + (12 if s == 2 else 0), 0.11, 500 if level == "A" else 700), tb(q + s * 0.25), 0.9)
    dur = (q1 - q0) * BEAT
    pads.add(supersaw([n + 12 for n in ch], dur, 2200 if level != "A" else 1600, a=0.02, r=0.4), tb(q0), 0.55)
    arp_beats(q0, (q1 - q0) * 4, ch, arp_cut, 0.42 if level == "A" else 0.5, i0=i0)

# Intro 0-8: the contest clock
drone = supersaw([45, 52, 57], 8 * BEAT, 500, a=1.0, r=1.0, voices=4, detune=0.08)
pads.add(drone, 0, 0.9)
for q in range(8):
    drums.add(tick(q % 2 == 0), tb(q), 0.55 if q < 4 else 0.7)
for q in (0, 4):  # heartbeat
    drums.add(kick(0.55), tb(q), 0.8)
    drums.add(kick(0.4), tb(q + 0.5), 0.8)
for e in range(8):  # ticks double as the clock speeds up
    drums.add(tick(e % 2 == 0), tb(4 + e * 0.5 + 0.25), 0.45)
for e in range(8):
    drums.add(tick(e % 2 == 1), tb(6 + e * 0.25 + 0.125), 0.3)
fx.add(riser(BAR * 1.0), tb(4), 0.55)

# Logo 8-14: Am (4 beats) + F (2 beats)
fx.add(impact(1.0), tb(8), 0.8)
ch, root = CHORDS[0], ROOTS[0]
pads.add(supersaw([n + 12 for n in ch] + [ch[0]], BAR, 1400, a=0.05, r=1.2), tb(8), 1.0)
bass.add(bass_note(root + 12, BAR * 0.95, 300), tb(8), 0.8)
ch, root = CHORDS[1], ROOTS[1]
pads.add(supersaw([n + 12 for n in ch] + [ch[0]], BEAT * 2, 1400, a=0.05, r=0.6), tb(12), 1.0)
bass.add(bass_note(root + 12, BEAT * 1.9, 300), tb(12), 0.8)
keys.add(bell(81, 1.0, 1.5), tb(8), 0.6)
keys.add(bell(76, 0.8, 1.5), tb(9.5), 0.5)
keys.add(bell(72, 0.7, 1.5), tb(12), 0.45)
arp_beats(12, 8, ch, 900, 0.35)

# Groove A 14-32 (2-beat pickup on F, then C G Am F)
segs_a = [(14, 16, 1), (16, 20, 2), (20, 24, 3), (24, 28, 0), (28, 32, 1)]
for i, (q0, q1, c) in enumerate(segs_a):
    groove(q0, q1, CHORDS[c], ROOTS[c], "A", 900 + i * 350, i0=(q0 % 4) * 4)

# Groove B 32-47 (C G Am, then a 3-beat bar on F with the fill)
segs_b = [(32, 36, 2), (36, 40, 3), (40, 44, 0), (44, 47, 1)]
for i, (q0, q1, c) in enumerate(segs_b):
    groove(q0, q1, CHORDS[c], ROOTS[c], "B", 2600 + i * 300, i0=0)
for k in range(8):
    drums.add(snare(0.5 + k * 0.07), tb(45 + k * 0.25), 0.7)
fx.add(riser(BEAT * 2, 0.6), tb(45), 0.5)

# Breakdown 47-63: Am Fmaj7 C G
BD = 47
fx.add(impact(0.6), tb(BD), 0.45)
for j, c in enumerate([3, 0, 1, 2]):
    pads.add(supersaw(BREAK_CHORDS[c], BAR, 1100, a=0.6, r=1.5, voices=5, detune=0.1), tb(BD + 4 * j), 0.85)
    bass.add(bass_note(BREAK_ROOTS[c], BAR * 0.95, 180), tb(BD + 4 * j), 0.75)
melody = [  # (bar, beat, midi, gain)
    (0, 0, 76, 1.0), (0, 1.5, 74, 0.8), (0, 2.5, 72, 0.8),
    (1, 0, 72, 1.0), (1, 1.5, 74, 0.8), (1, 2.5, 76, 0.9),
    (2, 0, 74, 1.0), (2, 1.5, 71, 0.8), (2, 3, 67, 0.7),
    (3, 0, 69, 1.0), (3, 1.5, 72, 0.9), (3, 2.5, 76, 1.0),
]
for b, q, m, g in melody:
    keys.add(bell(m, g, 1.0), tb(BD + 4 * b + q), 0.55, pan=-0.15)
    keys.add(bell(m + 12, g * 0.3, 0.6), tb(BD + 4 * b + q), 0.35, pan=0.25)
for q in range(4):
    drums.add(tick(True), tb(BD + 12 + q), 0.35)

# Build 63-72: Am (4 beats), F (4 beats), one-beat gap
BU = 63
for i, (q0, q1, c) in enumerate([(BU, BU + 4, 0), (BU + 4, BU + 8, 1)]):
    ch, root = CHORDS[c], ROOTS[c]
    for q in range(q0, q1):
        put_kick(tb(q), 0.75 + 0.1 * i)
        drums.add(hat(), tb(q + 0.5), 0.55 + 0.15 * i)
        for s in (1, 2, 3):
            bass.add(bass_note(root + (12 if s == 2 else 0), 0.11, 450 + i * 250), tb(q + s * 0.25), 0.8)
    pads.add(supersaw([n + 12 for n in ch], BAR, 1100 + i * 900, a=0.05, r=0.3), tb(q0), 0.5)
    arp_beats(q0, 16, ch, 1500 + i * 1500, 0.42)
for k in range(8):   # snare roll accelerates, stops one beat before the drop
    drums.add(snare(0.35 + k * 0.03), tb(BU + 2 + k * 0.5), 0.6)
for k in range(8):
    drums.add(snare(0.6 + k * 0.04), tb(BU + 6 + k * 0.25), 0.65)
fx.add(riser(BEAT * 7, 0.8), tb(BU + 2), 0.6)

# Drop 72-82: Am F, half bar on G
DR = 72
fx.add(impact(1.0), tb(DR), 0.75)
for q0, q1, c in [(DR, DR + 4, 0), (DR + 4, DR + 8, 1), (DR + 8, DR + 10, 3)]:
    groove(q0, q1, CHORDS[c], ROOTS[c], "D", 4200, i0=0)
lead_line = [  # (beat, midi, beats)
    (0, 76, 1.5), (1.5, 79, 0.5), (2, 81, 1.5), (3.5, 79, 0.5),
    (4, 77, 1.5), (5.5, 76, 0.5), (6, 72, 2),
    (8, 79, 1.0), (9, 83, 1.0),
]
for q, m, d in lead_line:
    s = supersaw([m], d * BEAT, 4200, a=0.01, r=0.25, voices=3, detune=0.06)
    lead.add(s, tb(DR + q), 0.6)

# Outro 82-90: final hit + held chord
OU = 82
fx.add(impact(1.0), tb(OU), 0.8)
put_kick(tb(OU), 1.0)
pads.add(supersaw([57, 60, 64, 69, 72], BEAT * 5, 2600, a=0.01, r=1.6), tb(OU), 0.8)
bass.add(bass_note(33, BEAT * 5, 250), tb(OU), 0.9)
for k, m in enumerate([81, 76, 72, 69, 64]):
    keys.add(bell(m, 0.9 - k * 0.12, 1.4), tb(OU + k * 0.5), 0.5, pan=(-1) ** k * 0.3)
for i in range(16):
    m = [69, 72, 76, 81][i % 4] + 12
    arp.add(pluck(m, 0.12, 3000, 0.4 * (1 - i / 16)), tb(OU + 2 + i * 0.25), 1.0, pan=0.35 if i % 2 else -0.35)

# ---------------------------------------------------------------- mix
def sidechain(length, depth=0.55, rel=0.16):
    g = np.ones(length)
    tt = np.arange(int(0.4 * SR)) / SR
    shape = 1 - depth * np.exp(-tt / rel)
    for kt in kick_times:
        i = int(kt * SR)
        j = min(i + len(shape), length)
        g[i:j] = np.minimum(g[i:j], shape[: j - i])
    return g[:, None]

sc = sidechain(N)

def stereo_delay(x, t, fb=0.35, mix=0.3):
    d = int(t * SR)
    y = x.copy()
    for k in range(1, 6):
        echo = np.zeros_like(x)
        echo[k * d:] = x[: len(x) - k * d]
        if k % 2:
            echo = echo[:, ::-1]  # ping-pong
        y += echo * mix * fb ** (k - 1)
    return y

def make_ir(sec=2.4):
    n = int(sec * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t / (sec / 5))[:, None]
    ir[:, 0] = lp(ir[:, 0], 7000)
    ir[:, 1] = lp(ir[:, 1], 7000)
    return ir / np.sqrt((ir ** 2).sum(0))

IR = make_ir()

def reverb(x):
    return np.stack([fftconvolve(x[:, c], IR[:, c])[: len(x)] for c in range(2)], 1)

arp_wet = stereo_delay(arp.x, BEAT * 0.75, fb=0.35, mix=0.35)
send = pads.x * 0.25 + arp_wet * 0.3 + keys.x * 0.6 + lead.x * 0.3 + fx.x * 0.3 + drums.x * 0.04
mix = (
    drums.x * 1.0
    + bass.x * sc * 0.85
    + pads.x * sc * 0.75
    + arp_wet * sc * 0.55
    + lead.x * 0.55
    + keys.x * 0.8
    + fx.x * 0.9
    + reverb(send) * 0.55
)
# gentle master: high-pass rumble, soft clip, fades
mix = np.stack([hp(mix[:, c], 28) for c in range(2)], 1)
mix = mix[: int(TOTAL * SR)]
fade_in = int(0.05 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
fo_start = int((TOTAL - 2.4) * SR)
mix[fo_start:] *= np.linspace(1, 0, len(mix) - fo_start)[:, None] ** 1.5
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.3) / np.tanh(1.3)
mix *= 10 ** (-1.0 / 20)  # -1 dBFS peak

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "audio", "music-reel.wav")
os.makedirs(os.path.dirname(out), exist_ok=True)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
import wave
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out, f"{len(mix) / SR:.2f}s")
