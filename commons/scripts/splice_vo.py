"""Sustituye un tramo de una toma por otra generación (corrección puntual de pronunciación).

Uso: python3 scripts/splice_vo.py ORIGINAL PARCHE SALIDA CORTE_A CORTE_B [PRE] [POST]
  Conserva ORIGINAL[0:CORTE_A] + PARCHE (sin silencios de los extremos, con PRE/POST segundos de
  silencio) + ORIGINAL[CORTE_B:]. Los cortes deben caer en silencios; se aplican fundidos de 5 ms.
Ejemplo (s02, «creatividad»): ver README, sección Narración."""
import subprocess, sys
import numpy as np

SR = 48000


def load(p):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)


def fade(x):
    n = int(0.005 * SR); x = x.copy(); x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n); return x


orig, patch = load(sys.argv[1]), load(sys.argv[2])
a, b = float(sys.argv[4]), float(sys.argv[5])
pre = float(sys.argv[6]) if len(sys.argv) > 6 else 0.1
post = float(sys.argv[7]) if len(sys.argv) > 7 else 0.1
r = np.sqrt((patch[: len(patch) // 480 * 480].reshape(-1, 480) ** 2).mean(1)); idx = np.where(r > r.max() * 0.03)[0]
patch = patch[max(0, idx[0] * 480 - 480): min(len(patch), (idx[-1] + 2) * 480)]
z = lambda s: np.zeros(int(s * SR))
y = np.concatenate([fade(orig[: int(a * SR)]), z(pre), fade(patch), z(post), fade(orig[int(b * SR):])])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "192k", sys.argv[3]], input=y.astype(np.float64).tobytes(), check=True)
print(f"{sys.argv[3]}: {len(y) / SR:.2f} s (antes {len(orig) / SR:.2f} s)")
