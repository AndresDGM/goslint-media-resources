"""Herramientas del guion maestro (scripts/narration.txt).

  python3 scripts/narration.py count        -> caracteres (= créditos de ElevenLabs) por segmento y total
  python3 scripts/narration.py tts <id>     -> texto exacto que se envía a ElevenLabs para ese segmento
  python3 scripts/narration.py captions     -> subtítulos por segmento
"""
import os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

# Ortografía en pantalla de lo que la voz dice con palabras (los subtítulos conservan lo pronunciado).
DISPLAY = [
    ("O de logaritmo de n", "O(log n)"),
    ("O de n", "O(n)"),
    ("O de 1", "O(1)"),
    ("responde menos uno", "responde −1"),
    ("devuelvo menos uno", "devuelvo −1"),
    ("mid más uno", "mid + 1"),
    ("mid menos uno", "mid − 1"),
    ("Ese más uno y ese menos uno", "Ese + 1 y ese − 1"),
    ("logaritmo de n más una", "log₂ n + 1"),
    ("logaritmo en base 2 de n", "logaritmo en base 2 de n"),
    ("1024", "1.024"),
    ("75 por ciento", "75 %"),
]


def segments():
    segs, cur = {}, None
    for line in open(os.path.join(ROOT, "scripts", "narration.txt"), encoding="utf-8"):
        line = line.rstrip("\n")
        if line.startswith("#") or not line.strip():
            continue
        if line.startswith("== "):
            cur = line[3:].strip(); segs[cur] = ""
        else:
            segs[cur] += (" " if segs[cur] else "") + line.strip()
    return segs


def tts_text(raw):
    s = re.sub(r"\{\w+\}", "", raw).replace("|", " ")
    return re.sub(r"\s+", " ", s).strip()


def spoken_text(raw):
    """Sin etiquetas ni marcas: las palabras que realmente se pronuncian."""
    return re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", "", tts_text(raw))).strip()


def captions(raw):
    out = []
    for part in re.sub(r"\[[^\]]*\]|\{\w+\}", "", raw).split("|"):
        c = re.sub(r"\s+", " ", part).strip()
        for a, b in DISPLAY:
            c = c.replace(a, b)
        if c:
            out.append(c)
    return out


if __name__ == "__main__":
    segs = segments()
    cmd = sys.argv[1] if len(sys.argv) > 1 else "count"
    if cmd == "count":
        total = 0
        for k, v in segs.items():
            n = len(tts_text(v)); total += n
            print(f"{k}: {n:5d} caracteres  ({len(spoken_text(v))} sin etiquetas, {len(captions(v))} subtítulos, máx {max(map(len, captions(v)))})")
        print(f"TOTAL: {total} caracteres = créditos de ElevenLabs (1 crédito por carácter, etiquetas incluidas)")
    elif cmd == "tts":
        print(tts_text(segs[sys.argv[2]]))
    elif cmd == "captions":
        for k, v in segs.items():
            print(k); [print("   ", c) for c in captions(v)]
