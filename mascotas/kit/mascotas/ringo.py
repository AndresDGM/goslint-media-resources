"""RINGO · mascota de la Fase 4 · Competitiva I (reconstruido a partir de su hoja de concepto).

El capibara que no se altera: sentado de perfil, pelaje marrón, ojos cerrados y sonrisa tranquila,
con su coco, la pajilla azul y la sombrilla. A diferencia de las demás, lleva contorno azul oscuro
de 1 px (así se decidió en su hoja), y nada de borde blanco.
Especial: «¡Relax!» (sale «WA», sorbe de su coco y el veredicto pasa a «AC»).

    python3 mascotas/ringo.py salida/ringo
"""
from __future__ import annotations
import math, os, sys
from dataclasses import dataclass, replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
from pixel import Buf, OX, OY, arm

PAL = {
    'fur': '#C98A4E', 'furL': '#D99B5E', 'furD': '#A86E3C', 'snout': '#9C6438',
    'line': '#2A2350', 'eye': '#2A2350',
    'coco': '#7A4A2A', 'cocoD': '#5A341C', 'cream': '#F2E6C8', 'straw': '#8ED3F0',
    'red': '#E0453A', 'yellow': '#F2C230', 'green': '#00C063', 'white': '#FFFFFF',
}

FONT = {'A': ['010', '101', '111', '101', '101'], 'C': ['011', '100', '100', '100', '011'],
        'W': ['101', '101', '101', '111', '101']}


def text(b, s, x, y, c):
    for ch in s:
        for j, row in enumerate(FONT[ch]):
            for i, v in enumerate(row):
                if v == '1':
                    b.set(x + i, y + j, c)
        x += 4


def outline(b, c):
    """Contorno de 1 px por fuera de la silueta (Ringo sí lo lleva, oscuro, nunca blanco)."""
    edge = [(x, y) for y in range(b.h) for x in range(b.w) if b.px[y][x] is None and
            any(b.get(x + dx, y + dy) not in (None, c) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    for x, y in edge:
        b.px[y][x] = c


@dataclass
class Pose:
    up: float = 0; lo: float = 0      # pata delantera (0 = apoyada en el suelo)
    eyes: str = 'calm'                # calm (cerrados, tranquilo) · open · wide · line
    mouth: str = 'smile'              # smile · grin · o · sip
    bodyDy: int = 0
    t: float = 0.0
    prop: str | None = None           # card · dots · sparkle · bang
    special: float = -1.0             # −1 sin especial · 0..1 de «WA» a «AC»


def draw(p: Pose) -> Buf:
    b = Buf()
    by = OY + p.bodyDy
    hx, hy = OX + 3, by - 21

    # coco con la sombrilla (a la derecha, no se mueve al respirar)
    cx, cy = OX + 15, OY - 5
    sway = round(math.sin(p.t * 2))
    b.rect(cx + 4, OY - 27, 1, 20, PAL['cream'])
    for i, w in enumerate((3, 7, 11)):
        for j in range(w):
            x = cx + 4 - w // 2 + j + sway
            b.set(x, OY - 30 + i, PAL['red'] if (j * 3 // w + i) % 2 else PAL['yellow'])
    b.ellipse(cx, cy, 5, 4.6, PAL['coco'])
    b.rect(cx + 2, cy - 1, 2, 4, PAL['cocoD']); b.set(cx - 3, cy - 1, PAL['furL'])
    b.ellipse(cx, cy - 4, 4, 1.6, PAL['cream'])

    # cuerpo sentado: lomo grande, anca más oscura y panza clara
    b.ellipse(OX - 5, by - 12, 13, 11.5, PAL['fur'])
    b.ellipse(OX - 8, by - 4, 9, 4.6, PAL['furD'])
    b.ellipse(OX - 3, by - 14, 7, 5, PAL['furL'])
    # cabeza y hocico
    b.ellipse(hx, hy, 8, 6.6, PAL['fur'])
    b.ellipse(hx + 6, hy + 2, 4.6, 4.4, PAL['snout'])
    b.rect(hx - 4, hy - 8, 3, 2, PAL['fur']); b.rect(hx + 2, hy - 8, 3, 2, PAL['fur'])   # orejas
    b.set(hx - 3, hy - 7, PAL['furD']); b.set(hx + 3, hy - 7, PAL['furD'])
    b.set(hx + 7, hy, PAL['eye']); b.set(hx + 9, hy, PAL['eye'])                          # fosas

    # ojo
    ex, ey = hx + 1, hy - 1
    if p.eyes == 'calm':
        b.set(ex - 1, ey + 1, PAL['eye']); b.rect(ex, ey, 2, 1, PAL['eye']); b.set(ex + 2, ey + 1, PAL['eye'])
    elif p.eyes in ('open', 'wide'):
        b.rect(ex, ey - (1 if p.eyes == 'wide' else 0), 2, 2 if p.eyes == 'open' else 3, PAL['eye'])
        b.set(ex, ey - (1 if p.eyes == 'wide' else 0), PAL['white'])
    else:
        b.rect(ex - 1, ey + 1, 3, 1, PAL['eye'])
    # boca
    mx, my = hx + 5, hy + 4
    if p.mouth == 'smile':
        b.set(mx, my, PAL['eye']); b.rect(mx + 1, my + 1, 3, 1, PAL['eye']); b.set(mx + 4, my, PAL['eye'])
    elif p.mouth == 'grin':
        b.rect(mx, my, 5, 1, PAL['eye']); b.rect(mx + 1, my + 1, 3, 1, PAL['red'])
    elif p.mouth in ('o', 'sip'):
        b.rect(mx + 2, my, 2, 2, PAL['eye'])

    # pata delantera: apoyada o levantada (saludo, señalar…)
    if p.up == 0 and p.lo == 0:
        b.rect(OX + 3, by - 9, 4, 9, PAL['fur']); b.rect(OX + 6, by - 9, 1, 9, PAL['furD'])
        b.rect(OX + 3, by - 1, 5, 1, PAL['furD'])
    else:
        b.rect(OX + 3, by - 4, 4, 4, PAL['furD'])
        arm(b, (OX + 7, by - 9), p.up, p.lo, 1, PAL['furD'], PAL['furD'], PAL['snout'])

    outline(b, PAL['line'])

    # pajilla al coco (después del contorno, para que se vea fina)
    if p.mouth == 'sip' or p.up == 0:
        b.line(mx + 3, my + 2, cx - 1, cy - 4, PAL['straw'], th=1)

    if p.prop == 'card':     # explica con una tarjeta y su ✓
        x, y = OX + 12, OY - 30
        b.rect(x, y, 7, 6, PAL['cream']); b.rect(x + 1, y + 1, 5, 4, PAL['white'])
        for i, (dx, dy) in enumerate(((1, 2), (2, 3), (3, 2), (4, 1))):
            b.set(x + dx + 1, y + dy + 1, PAL['green'])
    if p.prop == 'dots':     # piensa
        for i in range(3):
            b.set(hx + 6 + i * 2, hy - 10 - i * 2, PAL['white'])
    if p.prop == 'sparkle':  # ¡bien!
        for x, y in ((hx - 9, hy - 9), (hx + 9, hy - 11), (hx - 3, hy - 13)):
            b.set(x, y, PAL['yellow']); b.set(x - 1, y, PAL['yellow']); b.set(x + 1, y, PAL['yellow']); b.set(x, y - 1, PAL['yellow']); b.set(x, y + 1, PAL['yellow'])
    if p.prop == 'bang':     # sorpresa
        b.rect(hx + 1, hy - 15, 1, 4, PAL['yellow']); b.set(hx + 1, hy - 10, PAL['yellow'])

    if p.special >= 0:       # veredicto encima: «WA» rojo → se apaga → «AC» verde
        s = p.special
        x, y = hx - 6, hy - 18
        if s < 0.4:
            text(b, 'WA', x, y, PAL['red'])
        elif s < 1:
            for i in range(6):  # rastro de píxeles verdes hacia el texto
                b.set(x + 2 + i * 2, y + 6 - (i % 2) * 2, PAL['green'])
        else:
            text(b, 'AC', x, y, PAL['green']); b.set(x - 2, y, PAL['green']); b.set(x + 9, y + 1, PAL['green'])
    return b


POSES = {
    'idle':  Pose(),
    'wave':  Pose(up=70, lo=150, mouth='grin'),
    'point': Pose(up=90, lo=90, eyes='open'),
    'think': Pose(prop='dots', mouth='o'),
    'prop':  Pose(up=80, lo=160, prop='card', mouth='grin'),
    'cheer': Pose(up=80, lo=170, prop='sparkle', mouth='grin', bodyDy=-1),
    'wow':   Pose(eyes='wide', mouth='o', prop='bang'),
    'wink':  Pose(up=70, lo=150, eyes='line', mouth='grin'),
}


def exportar(carpeta: str):
    os.makedirs(carpeta, exist_ok=True)
    for n, p in POSES.items():
        draw(p).sprite().save(f'{carpeta}/p_{n}.png')
    for i, t in enumerate([0, 0.8, 1.6, 2.4]):  # respira y la sombrilla se mece
        draw(replace(POSES['idle'], t=t, bodyDy=[0, -1, 0, 0][i])).sprite().save(f'{carpeta}/p_anim{i}.png')
    for i, s in enumerate([0.0, 0.6, 1.0]):
        draw(Pose(special=s, mouth='sip' if i == 1 else 'smile')).sprite().save(f'{carpeta}/p_esp{i}.png')
    print('sprites en', carpeta)


if __name__ == '__main__':
    exportar(sys.argv[1] if len(sys.argv) > 1 else 'salida/ringo')
