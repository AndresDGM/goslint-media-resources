"""Original soundtrack for the Goslint promo, synthesised from scratch.

120 BPM, A minor, 4/4. One beat = 0.5 s = 15 frames at 30 fps, one bar = 60 frames,
so every section boundary below lands exactly on a video frame used in src/timeline.ts.

Sections (bar numbers, 0-based):
  0-3   intro: dark drone, clock ticks, heartbeat, riser into bar 4
  4-5   logo: impact + open chords, arp fades in
  6-10  groove A: kick, offbeat hats, rolling bass, pumping pads, filtered arp
  11-18 groove B: + clap, 16th hats, brighter arp; fill on bar 18
  19-23 breakdown: no drums, warm pads, pluck melody
  24-27 build: kick returns, snare roll + riser, one-beat gap before 28
  28-31 drop: everything + lead
  32-34 outro: final impact, held A minor chord, decaying arp, fade

No samples are used; every sound is generated here, so the track is free to use.
Usage: python3 scripts/make_music.py  ->  public/audio/music.wav
"""
import os
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
TOTAL = 70.0
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
# Intro 0-3
drone = supersaw([45, 52, 57], 4 * BAR, 500, a=2.5, r=1.0, voices=4, detune=0.08)
pads.add(drone, 0, 0.9)
for b in range(0, 4):
    for q in range(4):
        drums.add(tick(q % 2 == 0), t_of(b, q), 0.55 if b < 3 else 0.7)
    if b >= 1:
        drums.add(kick(0.55), t_of(b, 0), 0.8)
        drums.add(kick(0.4), t_of(b, 0.5), 0.8)
for b in [2, 3]:  # ticks double in bar 3 (clock speeding up)
    for e in range(8):
        drums.add(tick(e % 2 == 0), t_of(b, e * 0.5 + 0.25), 0.25 if b == 2 else 0.45)
fx.add(riser(BAR * 1.0), t_of(3), 0.55)

# Logo 4-5
fx.add(impact(1.0), t_of(4), 0.8)
for b in [4, 5]:
    ch, root = chord_of(b)
    pads.add(supersaw([n + 12 for n in ch] + [ch[0]], BAR, 1400, a=0.05, r=1.2), t_of(b), 1.0)
    bass.add(bass_note(root + 12, BAR * 0.95, 300), t_of(b), 0.8)
keys.add(bell(81, 1.0, 1.5), t_of(4), 0.6)
keys.add(bell(76, 0.8, 1.5), t_of(4, 1.5), 0.5)
keys.add(bell(72, 0.7, 1.5), t_of(5, 0), 0.45)

def arp_bar(b, cutoff, gain, octave=12, pattern=(0, 1, 2, 1, 0, 2, 1, 2)):
    ch, _ = chord_of(b)
    notes = ch + [ch[0] + 12]
    for i in range(16):
        m = notes[pattern[i % len(pattern)] if pattern else i % 4] + octave
        arp.add(pluck(m, 0.12, cutoff, gain), t_of(b, i * 0.25), 1.0, pan=0.35 if i % 2 else -0.35)

arp_bar(5, 900, 0.35)

def groove_bar(b, level="A", arp_cut=1500):
    ch, root = chord_of(b)
    for q in range(4):
        put_kick(t_of(b, q))
        drums.add(hat(), t_of(b, q + 0.5), 0.7)
        if level in ("B", "D"):
            drums.add(hat(), t_of(b, q + 0.25), 0.3)
            drums.add(hat(), t_of(b, q + 0.75), 0.3)
            if q in (1, 3):
                drums.add(clap(), t_of(b, q), 0.8)
        # rolling offbeat bass: 3 sixteenths per beat
        for s in (1, 2, 3):
            bass.add(bass_note(root + (12 if s == 2 else 0), 0.11, 500 if level == "A" else 700), t_of(b, q + s * 0.25), 0.9)
    pads.add(supersaw([n + 12 for n in ch], BAR, 2200 if level != "A" else 1600, a=0.02, r=0.4), t_of(b), 0.55)
    arp_bar(b, arp_cut, 0.42 if level == "A" else 0.5)

for i, b in enumerate(range(6, 11)):
    groove_bar(b, "A", 900 + i * 350)
for i, b in enumerate(range(11, 19)):
    groove_bar(b, "B", 2600 + i * 150)
# fill at end of bar 18
for k in range(8):
    drums.add(snare(0.5 + k * 0.07), t_of(18, 2 + k * 0.25), 0.7)
fx.add(riser(BEAT * 2, 0.6), t_of(18, 2), 0.5)

# Breakdown 19-23
fx.add(impact(0.6), t_of(19), 0.45)
for b in range(19, 24):
    ch, root = chord_of(b, True)
    pads.add(supersaw(ch, BAR, 1100, a=0.6, r=1.5, voices=5, detune=0.1), t_of(b), 0.85)
    bass.add(bass_note(root, BAR * 0.95, 180), t_of(b), 0.75)
melody = [  # (bar, beat, midi, gain)
    (19, 0, 76, 1.0), (19, 1.5, 74, 0.8), (19, 2.5, 72, 0.8),
    (20, 0, 72, 1.0), (20, 1.5, 74, 0.8), (20, 2.5, 76, 0.9),
    (21, 0, 74, 1.0), (21, 1.5, 71, 0.8), (21, 3, 67, 0.7),
    (22, 0, 69, 1.0), (22, 1.5, 72, 0.9), (22, 2.5, 76, 1.0),
    (23, 0, 79, 1.0), (23, 2, 76, 0.8),
]
for b, q, m, g in melody:
    keys.add(bell(m, g, 1.0), t_of(b, q), 0.55, pan=-0.15)
    keys.add(bell(m + 12, g * 0.3, 0.6), t_of(b, q), 0.35, pan=0.25)
for q in range(4):
    drums.add(tick(True), t_of(23, q), 0.35)

# Build 24-27
for i, b in enumerate(range(24, 28)):
    ch, root = chord_of(b)
    for q in range(4):
        if not (b == 27 and q == 3):
            put_kick(t_of(b, q), 0.7 + 0.08 * i)
            drums.add(hat(), t_of(b, q + 0.5), 0.5 + 0.1 * i)
            for s in (1, 2, 3):
                bass.add(bass_note(root + (12 if s == 2 else 0), 0.11, 400 + i * 120), t_of(b, q + s * 0.25), 0.8)
    pads.add(supersaw([n + 12 for n in ch], BAR, 900 + i * 500, a=0.05, r=0.3), t_of(b), 0.5)
    if b < 27:
        arp_bar(b, 1200 + i * 700, 0.4)
    else:
        for i16 in range(12):
            ch_n = (ch + [ch[0] + 12])[i16 % 4] + 12
            arp.add(pluck(ch_n, 0.12, 3500, 0.45), t_of(b, i16 * 0.25), 1.0, pan=0.35 if i16 % 2 else -0.35)
# snare roll bars 26-27 (accelerating), stops on beat 3 of bar 27
for k in range(8):
    drums.add(snare(0.35 + k * 0.03), t_of(26, k * 0.5), 0.6)
for k in range(12):
    drums.add(snare(0.6 + k * 0.03), t_of(27, k * 0.25), 0.65)
fx.add(riser(BAR * 1.75, 0.8), t_of(26, 1), 0.6)

# Drop 28-31
fx.add(impact(1.0), t_of(28), 0.75)
lead_line = [
    (28, 0, 76, 1.5), (28, 1.5, 79, 0.5), (28, 2, 81, 1.5), (28, 3.5, 79, 0.5),
    (29, 0, 77, 1.5), (29, 1.5, 76, 0.5), (29, 2, 72, 2),
    (30, 0, 72, 1.5), (30, 1.5, 74, 0.5), (30, 2, 76, 1.5), (30, 3.5, 79, 0.5),
    (31, 0, 79, 1.0), (31, 1, 81, 1.0), (31, 2, 83, 2.0),
]
for b in range(28, 32):
    groove_bar(b, "D", 4200)
for b, q, m, d in lead_line:
    s = supersaw([m], d * BEAT, 4200, a=0.01, r=0.25, voices=3, detune=0.06)
    lead.add(s, t_of(b, q), 0.6)

# Outro 32-34: final hit + held chord
fx.add(impact(1.0), t_of(32), 0.8)
put_kick(t_of(32), 1.0)
pads.add(supersaw([57, 60, 64, 69, 72], BAR * 2.6, 2600, a=0.01, r=1.6), t_of(32), 0.8)
bass.add(bass_note(33, BAR * 2.4, 250), t_of(32), 0.9)
for k, m in enumerate([81, 76, 72, 69, 64]):
    keys.add(bell(m, 0.9 - k * 0.12, 1.4), t_of(32, k * 0.5), 0.5, pan=(-1) ** k * 0.3)
for i in range(16):
    m = [69, 72, 76, 81][i % 4] + 12
    arp.add(pluck(m, 0.12, 3000, 0.4 * (1 - i / 16)), t_of(32, 2 + i * 0.25), 1.0, pan=0.35 if i % 2 else -0.35)

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
fo_start = int((TOTAL - 3.2) * SR)
mix[fo_start:] *= np.linspace(1, 0, len(mix) - fo_start)[:, None] ** 1.5
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.3) / np.tanh(1.3)
mix *= 10 ** (-1.0 / 20)  # -1 dBFS peak

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "audio", "music.wav")
os.makedirs(os.path.dirname(out), exist_ok=True)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
import wave
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out, f"{len(mix) / SR:.2f}s")
