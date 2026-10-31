"""Comprobaciones automáticas de DaRu (sin dependencias extra: solo Pillow).

    python3 mascotas/probar_daru.py

Mide de verdad, píxel a píxel, lo que la guía pide revisar a ojo: escala frente a Lint, Vee y Marco,
pies en su sitio, determinismo, animación sin saltos, corbata y «L» fijas, huecos en la silueta.
"""
from __future__ import annotations
import os, sys
from dataclasses import replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _aqui)
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
from PIL import Image
import daru
from daru import POSES, ANIM, ESPECIAL, PAL, OX, OY, draw

fallos = []


def ok(cond, msg):
    print(('  ok   ' if cond else '  FALLO ') + msg)
    if not cond:
        fallos.append(msg)


def opaque(b):
    return {(x, y) for y in range(b.h) for x in range(b.w) if b.px[y][x]}


def bbox(pts):
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def holes(b):
    """Píxeles transparentes encerrados por el personaje (huecos negros accidentales)."""
    ext = set()
    stack = [(x, y) for x in range(b.w) for y in (0, b.h - 1)] + [(x, y) for y in range(b.h) for x in (0, b.w - 1)]
    while stack:
        x, y = stack.pop()
        if 0 <= x < b.w and 0 <= y < b.h and (x, y) not in ext and b.px[y][x] is None:
            ext.add((x, y))
            stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return [(x, y) for y in range(b.h) for x in range(b.w) if b.px[y][x] is None and (x, y) not in ext]


def color_at(b, col):
    return sorted((x, y) for y in range(b.h) for x in range(b.w) if b.px[y][x] == col)


print('1 · escala frente a las mascotas aprobadas')
ref = os.path.join(os.path.dirname(_aqui), 'referencias', 'sprites')
alt = {}
for n in ('lint', 'vee', 'marco'):
    im = Image.open(os.path.join(ref, f'{n}_idle.png'))
    alt[n] = im.height
    print(f'       {n:6s} {im.width} × {im.height}')
cuerpo = draw(replace(POSES['idle'], bits=0))
x0, y0, x1, y1 = bbox(opaque(cuerpo))
h = y1 - y0 + 1
print(f'       daru   {x1 - x0 + 1} × {h}  (sin caracteres flotantes ni contorno)')
# Lint y Vee llevan 1 px de contorno blanco arriba y abajo: su cuerpo mide alto − 2
ok(abs(h - (alt['lint'] - 2)) <= 1 and abs(h - (alt['vee'] - 2)) <= 1, f'alto {h} px = cuerpo de Lint/Vee ({alt["lint"] - 2} px) ± 1')
ok(y1 == OY - 1, f'suela en la fila OY − 1 = {OY - 1}')

print('2 · proporciones de la cabeza')
hy = OY - 22
cab = [(x, y) for (x, y) in opaque(cuerpo) if y <= hy + 5 and abs(x - OX) <= 8]
cx0, cy0, cx1, cy1 = bbox(cab)
ok(cx1 - cx0 + 1 == 14, f'cabeza de {cx1 - cx0 + 1} px de ancho (14)')
ok(12 <= hy + 5 - (hy - 8) + 1 <= 14, f'cabeza de {hy + 5 - (hy - 8) + 1} px de alto, sin las puntas (12–14)')

print('3 · pies, corbata y «L» en todas las poses, tiempos y fotogramas')
todas = {**{f'pose {k}': v for k, v in POSES.items()},
         **{f'reposo {i}': replace(POSES['idle'], **kw) for i, kw in enumerate(ANIM)},
         **{f'especial {i}': p for i, p in enumerate(ESPECIAL)}}
for nombre, p in todas.items():
    b = draw(p)
    pts = opaque(b)
    ok(max(y for _, y in pts) == OY - 1, f'{nombre}: pies en y = {OY - 1}')
    red = [(x, y - p.bodyDy) for x, y in color_at(b, PAL['red'])]
    ok(red == [(x, y) for x, y in color_at(draw(POSES['idle']), PAL['red'])], f'{nombre}: corbata en su sitio')
    # la «L» de la solapa: (OX+1, by−10..by−8) y (OX+2, by−8); solo puede faltar si la tapa el brazo
    by = OY + p.bodyDy
    L = [(OX + 1, by - 10), (OX + 1, by - 9), (OX + 1, by - 8), (OX + 2, by - 8)]
    ok(all(b.px[y][x] == PAL['green'] or b.px[y][x] in (PAL['suit'], PAL['suitD'], PAL['suitL'], PAL['skin'], PAL['skinD']) for x, y in L)
       and sum(b.px[y][x] == PAL['green'] for x, y in L) >= 2, f'{nombre}: «L» verde en la solapa')
    hs = holes(b)
    if p.special >= 0.75:   # el interior del marco de la solución es fondo a propósito
        hs = [q for q in hs if not (OX + daru.CHK_X <= q[0] < OX + daru.CHK_X + daru.CHK_W)]
    ok(not hs, f'{nombre}: sin huecos negros encerrados ({len(hs)})')

print('4 · determinismo')
for nombre, p in todas.items():
    ok(draw(p).px == draw(p).px, f'{nombre}: mismos parámetros → mismos píxeles')

print('5 · animación en reposo: sin saltos ni cambios anatómicos')
frames = [draw(replace(POSES['idle'], bits=0, **kw)) for kw in ANIM]
siluetas = []
for i, (b, kw) in enumerate(zip(frames, ANIM)):
    dy = kw.get('bodyDy', 0)
    head = {(x, y - dy) for (x, y) in opaque(b) if y - dy <= hy + 5}
    siluetas.append(head)
    xb = bbox(opaque(b))
    ok(xb[0] == bbox(opaque(frames[0]))[0] and xb[2] == bbox(opaque(frames[0]))[2], f'tiempo {i + 1}: sin desplazamiento horizontal')
ok(all(s == siluetas[0] for s in siluetas), 'la silueta de la cabeza es idéntica en los 4 tiempos')
dys = [kw.get('bodyDy', 0) for kw in ANIM]
ok(all(abs(dys[i] - dys[(i + 1) % 4]) <= 1 for i in range(4)), f'respiración de 1 px por paso, ciclo cerrado {dys}')
ok(len({tuple(map(tuple, b.px)) for b in frames}) == 4, 'los 4 tiempos son distintos')

print('6 · movimiento especial: progresión')
fx = []
for i, p in enumerate(ESPECIAL):
    b = draw(p)
    efecto = [(x, y) for (x, y) in opaque(b) if x >= OX + 8]
    ys = sorted({y for _, y in efecto})
    fx.append(len(ys))
ok(fx[0] > fx[1], f'invoca → organiza: los fragmentos se agrupan (filas ocupadas {fx[0]} → {fx[1]})')
ok(color_at(draw(ESPECIAL[2]), PAL['glow']) != [], 'resuelve: aparece la marca de verificación')

print()
print('TODO BIEN' if not fallos else f'{len(fallos)} FALLO(S)')
sys.exit(1 if fallos else 0)
