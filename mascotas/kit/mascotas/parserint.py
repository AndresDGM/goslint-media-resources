"""PARSERINT · guía de la Fase 2 · Programación básica (reconstruido a partir de su hoja de concepto).

Cabrita de pelaje crema con sombrero de mago verde (los cuernitos salen por él), orejas caídas,
gafas verdes redondas solo de marco, túnica verde con el logo de Goslint en negro y pezuñas.
Especial: «¡Recomendación!» (abre su libro, crece la llama verde y aparece la tarjeta con ✓).

    python3 mascotas/parserint.py salida/parserint
"""
from __future__ import annotations
import math, os, sys
from dataclasses import dataclass, replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
from pixel import Buf, OX, OY, arm, fbm

PAL = {
    'fur': '#FBF0D9', 'furD': '#E2CFA6', 'pink': '#E8968C',
    'horn': '#B39B74', 'hoof': '#7A5A3A',
    'robe': '#14B864', 'robeD': '#0B8A48', 'robeL': '#7CFFB8',
    'eye': '#141018', 'white': '#FFFFFF', 'black': '#0A120D',
    'book': '#7A4A2A', 'page': '#F4EEDC',
}


@dataclass
class Pose:
    upF: float = 20; loF: float = 10; upB: float = 20; loB: float = 10
    eyes: str = 'open'
    mouth: str = 'smile'
    headDy: int = 0
    bodyDy: int = 0
    t: float = 0.0
    prop: str | None = None   # book
    special: float = 0.0


def draw(p: Pose) -> Buf:
    b = Buf()
    by = OY + p.bodyDy
    hx, hy = OX, by - 20 + p.headDy
    shF, shB = (OX + 4, by - 13), (OX - 5, by - 13)

    arm(b, shB, p.upB, p.loB, -1, PAL['robeD'], PAL['robeD'], PAL['fur'])

    # patitas con pezuñas
    for x in (OX - 3, OX + 1):
        b.rect(x, by - 4, 2, 3, PAL['fur']); b.rect(x + 1, by - 4, 1, 3, PAL['furD'])
        b.rect(x - (1 if x < OX else 0), by - 1, 3, 1, PAL['hoof'])

    # túnica: se abre hacia abajo, ribete claro y logo negro con la «L»
    for i, y in enumerate(range(by - 14, by - 4)):
        w = 8 + (i * 4) // 9
        b.rect(OX - w // 2, y, w, 1, PAL['robe']); b.set(OX - w // 2 + w - 1, y, PAL['robeD'])
    b.rect(OX - 6, by - 5, 12, 1, PAL['robeL'])
    b.ellipse(OX, by - 10, 2.6, 3, PAL['black'])
    b.rect(OX - 1, by - 12, 1, 4, PAL['robe']); b.rect(OX - 1, by - 9, 3, 1, PAL['robe'])
    b.rect(OX - 1, by - 15, 2, 1, PAL['furD'])                  # cuello

    # cabeza crema
    b.ellipse(hx, hy, 6.4, 5.6, PAL['fur'])
    b.rect(hx + 5, hy - 2, 1, 5, PAL['furD'])
    # orejas caídas con el interior rosado
    for sd in (-1, 1):
        x = hx + (-9 if sd < 0 else 6)
        b.rect(x, hy - 1, 3, 2, PAL['fur']); b.set(x + (1 if sd < 0 else 1), hy - 1, PAL['pink'])
        b.set(x + (0 if sd < 0 else 2), hy + 1, PAL['furD'])
    # gafas verdes redondas (solo marco)
    for x in (hx - 5, hx + 1):
        b.rect(x, hy - 2, 4, 1, PAL['robe']); b.rect(x, hy + 2, 4, 1, PAL['robe'])
        b.rect(x, hy - 1, 1, 3, PAL['robe']); b.rect(x + 3, hy - 1, 1, 3, PAL['robe'])
    b.rect(hx - 1, hy - 1, 2, 1, PAL['robe'])

    def eye(x, which):
        e = p.eyes
        if e == 'wink':
            e = 'closed' if which else 'open'
        if e in ('open', 'wide'):
            b.rect(x, hy - (1 if e == 'wide' else 0), 2, 2 if e == 'open' else 3, PAL['eye']); b.set(x, hy - (1 if e == 'wide' else 0), PAL['white'])
        elif e == 'happy':
            b.set(x - 1 + 1, hy + 1, PAL['eye']); b.rect(x, hy, 2, 1, PAL['eye'])
        else:
            b.rect(x, hy + 1, 2, 1, PAL['eye'])
    eye(hx - 4, 0)
    eye(hx + 2, 1)
    b.set(hx - 6, hy + 3, PAL['pink']); b.set(hx + 5, hy + 3, PAL['pink'])  # mejillas
    b.rect(hx - 1, hy + 3, 2, 1, PAL['pink'])                                # nariz
    if p.mouth == 'smile':
        b.set(hx - 1, hy + 4, PAL['eye']); b.set(hx, hy + 4, PAL['eye'])
    elif p.mouth == 'grin':
        b.rect(hx - 2, hy + 4, 4, 1, PAL['eye'])
    elif p.mouth == 'o':
        b.rect(hx - 1, hy + 4, 2, 2, PAL['eye'])
    else:
        b.set(hx, hy + 4, PAL['eye'])

    # sombrero de mago: ala ancha, banda clara, cono con la punta doblada y cuernitos
    hy0 = hy - 6
    b.rect(hx - 8, hy0, 16, 1, PAL['robe']); b.rect(hx - 7, hy0 + 1, 14, 1, PAL['robeD'])
    b.rect(hx - 5, hy0 - 2, 10, 2, PAL['robeL'])
    for i in range(7):
        w = max(1, 9 - i * 1.3)
        sway = round(fbm(i * 0.3, p.t, 4) * 2 - 1) if i > 4 else 0
        b.rect(round(hx - w / 2) + (i > 4) + sway, hy0 - 3 - i, round(w), 1, PAL['robe'])
    b.rect(hx + 1, hy0 - 6, 1, 3, PAL['robeD'])
    b.set(hx + 2 + round(fbm(0, p.t, 4)), hy0 - 10, PAL['robeD'])
    for sd in (-1, 1):  # cuernitos curvos
        x = hx + sd * 5
        b.rect(x - (1 if sd < 0 else 0), hy0 - 3, 2, 2, PAL['horn'])
        b.set(x + sd * 2, hy0 - 4, PAL['horn']); b.set(x + sd * 2, hy0 - 5, PAL['horn'])

    hd = arm(b, shF, p.upF, p.loF, 1, PAL['robeD'], PAL['robeD'], PAL['fur'])

    if p.prop == 'book' or p.special > 0:  # libro mágico con fuego verde
        x, y = round(hd[0]) + 1, round(hd[1]) - 2
        b.rect(x, y, 6, 4, PAL['book']); b.rect(x + 1, y - 1, 4, 1, PAL['page']); b.set(x + 3, y, PAL['robeL'])
        h = 2 + round(p.special * 5)
        for i in range(h):
            w = max(1, 3 - i // 2)
            b.rect(x + 3 - w // 2 + round(fbm(i * 0.4, p.t, 9) * 2 - 1), y - 2 - i, w, 1, PAL['robeL'] if i % 2 else PAL['robe'])
        if p.special >= 0.5:  # tarjeta de sugerencias
            cx, cy = x + 8, y - 10
            b.rect(cx, cy, 8, 6, PAL['black']); b.rect(cx, cy, 8, 1, PAL['robe']); b.rect(cx, cy + 5, 8, 1, PAL['robe'])
            b.rect(cx, cy, 1, 6, PAL['robe']); b.rect(cx + 7, cy, 1, 6, PAL['robe'])
            b.rect(cx + 2, cy + 2, 4, 1, PAL['robeD']); b.rect(cx + 2, cy + 3, 3, 1, PAL['robeD'])
            if p.special >= 1:  # ✓
                b.set(cx + 3, cy + 3, PAL['robeL']); b.set(cx + 4, cy + 4, PAL['robeL']); b.set(cx + 5, cy + 3, PAL['robeL']); b.set(cx + 6, cy + 2, PAL['robeL'])
                b.set(cx - 2, cy - 2, PAL['white']); b.set(cx + 9, cy - 1, PAL['robeL'])
    return b


POSES = {
    'idle':  Pose(),
    'wave':  Pose(upF=115, loF=170, eyes='happy', mouth='grin'),
    'point': Pose(upF=90, loF=90, mouth='o'),
    'think': Pose(upF=30, loF=-150, mouth='flat'),
    'prop':  Pose(upF=60, loF=90, prop='book'),
    'cheer': Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', mouth='grin', bodyDy=-1),
    'wow':   Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', mouth='o'),
    'wink':  Pose(upF=90, loF=130, eyes='wink', mouth='grin'),
}


def exportar(carpeta: str):
    os.makedirs(carpeta, exist_ok=True)
    for n, p in POSES.items():
        draw(p).sprite().save(f'{carpeta}/p_{n}.png')
    for i, t in enumerate([0, 0.7, 1.4, 2.1]):  # respira y la punta del sombrero se mece
        draw(replace(POSES['idle'], t=t, bodyDy=[0, -1, 0, 1][i])).sprite().save(f'{carpeta}/p_anim{i}.png')
    for i, s in enumerate([0.01, 0.5, 1.0]):
        draw(replace(POSES['prop'], special=s, mouth='grin' if s >= 1 else 'smile')).sprite().save(f'{carpeta}/p_esp{i}.png')
    print('sprites en', carpeta)


if __name__ == '__main__':
    exportar(sys.argv[1] if len(sys.argv) > 1 else 'salida/parserint')
