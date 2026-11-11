"""Hoja de contacto de un tramo de un bloque, para revisar el movimiento sin renderizar video.

Renderiza un fotograma de cada `paso` con la entrada de desarrollo del bloque (src/dev/<Bloque>.tsx:
solo ese bloque, con HUD y subtítulos, sin audio) y los junta en una imagen con el tiempo de cada uno.

Uso (desde la carpeta del proyecto):
    python3 scripts/hoja.py B4 3900 4500            # fotogramas 3900–4500, uno de cada 15
    python3 scripts/hoja.py B4 3900 4020 4          # uno de cada 4 (para mirar una transición)
    python3 scripts/hoja.py B4 4210                 # un solo fotograma a media resolución
Salida: out/hoja-<Bloque>-<desde>-<hasta>.png (o out/<Bloque>-<fotograma>.png). Ábrela con la herramienta de lectura.
`Video` en lugar de un bloque usa el video completo (src/index.ts, composición QueEsUnAlgoritmo).
"""
import glob, os, shutil, subprocess, sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def browser():
    if os.environ.get("REMOTION_BROWSER"):
        return os.environ["REMOTION_BROWSER"]
    c = sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell"))
    return c[0] if c else None


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    block, a = sys.argv[1], int(sys.argv[2])
    entry, comp = ("src/index.ts", "QueEsUnAlgoritmo") if block == "Video" else (f"src/dev/{block}.tsx", "Bloque")
    env = dict(os.environ)
    if browser():
        env["REMOTION_BROWSER"] = browser()
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    if len(sys.argv) == 3:
        out = os.path.join(ROOT, "out", f"{block}-{a}.png")
        subprocess.run(["pnpm", "exec", "remotion", "still", entry, comp, out, f"--frame={a}", "--scale=0.5", "--log=error"], cwd=ROOT, env=env, check=True)
        print(out)
        return
    b = int(sys.argv[3])
    step = int(sys.argv[4]) if len(sys.argv) > 4 else 15
    scale = float(sys.argv[5]) if len(sys.argv) > 5 else 0.25
    tmp = os.path.join(ROOT, "out", f"_seq-{block}-{a}-{b}")
    shutil.rmtree(tmp, ignore_errors=True)
    subprocess.run(["pnpm", "exec", "remotion", "render", entry, comp, tmp, "--sequence", "--image-format=jpeg", f"--frames={a}-{b}", f"--every-nth-frame={step}", f"--scale={scale}", "--concurrency=1", "--muted", "--log=error"], cwd=ROOT, env=env, check=True)
    files = sorted(glob.glob(os.path.join(tmp, "*.jpeg")))
    if not files:
        sys.exit("No se renderizó ningún fotograma")
    w, h = Image.open(files[0]).size
    cols = min(len(files), max(1, 1920 // w))
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * h))
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(files):
        x, y = (i % cols) * w, (i // cols) * h
        sheet.paste(Image.open(f), (x, y))
        fr = a + i * step
        s = fr / 30
        label = f"{int(s // 60)}:{s % 60:04.1f}  f{fr}"
        d.rectangle([x, y, x + 6 * len(label) + 6, y + 13], fill=(0, 0, 0))
        d.text((x + 3, y + 1), label, fill=(255, 255, 0))
    out = os.path.join(ROOT, "out", f"hoja-{block}-{a}-{b}.png")
    sheet.save(out)
    shutil.rmtree(tmp, ignore_errors=True)
    print(out, f"({len(files)} fotogramas, {cols}×{rows})")


if __name__ == "__main__":
    main()
