"""MOCCA · guía de la Fase 6 · Competitiva III, estructuras y POO (reconstruido a partir de su hoja de concepto).

Estudiante con peinado alto y ondulado (un mechón que sube como el vapor de Java), gafas cuadradas
de marco café, hoodie gris carbón con la «L» de Goslint, pantalón oscuro, zapatos marrones y su taza.
Especial: «¡Garbage collector!» (barre con su escoba de 8 bits los píxeles basura).

    python3 mascotas/mocca.py salida/mocca
"""
from __future__ import annotations
import math, os, sys
from dataclasses import dataclass, replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
from pixel import Buf, OX, OY, arm, fbm

PAL = {
    'skin': '#E7B08A', 'skinD': '#C88B68',
    'hair': '#8A5A32', 'hairD': '#5E3A1E', 'hairL': '#B07440',
    'frame': '#3A2416', 'eye': '#141018', 'white': '#FFFFFF', 'mouth': '#B23B4A',
    'hood': '#4A4E57', 'hoodD': '#35383F', 'hoodL': '#6A707C',
    'pants': '#2B3550', 'shoe': '#7A4A2A',
    'cup': '#F2EEE4', 'band': '#3E73D8', 'steam': '#F2B04A',
    'green': '#00C063', 'trash': '#6A707C',
}


@dataclass
class Pose:
    upF: float = 12; loF: float = 6; upB: float = 12; loB: float = 6
    eyes: str = 'open'
    mouth: str = 'smile'
    headDy: int = 0
    bodyDy: int = 0
    t: float = 0.0
    prop: str | None = None   # cup · broom
    special: float = 0.0


def draw(p: Pose) -> Buf:
    b = Buf()
    by = OY + p.bodyDy
    hx, hy = OX, by - 21 + p.headDy
    shF, shB = (OX + 4, by - 12), (OX - 5, by - 12)

    arm(b, shB, p.upB, p.loB, -1, PAL['hood'], PAL['hood'], PAL['skin'])

    # piernas y zapatos
    for x in (OX - 4, OX + 1):
        b.rect(x, by - 5, 3, 4, PAL['pants'])
        b.rect(x - (1 if x < OX else 0), by - 1, 4, 1, PAL['shoe'])
    # hoodie holgado
    b.rect(OX - 5, by - 13, 10, 8, PAL['hood'])
    b.rect(OX - 5, by - 13, 10, 1, PAL['hoodL'])
    b.rect(OX + 4, by - 12, 1, 7, PAL['hoodD']); b.rect(OX - 5, by - 6, 10, 1, PAL['hoodD'])
    b.rect(OX - 2, by - 11, 1, 4, PAL['green']); b.rect(OX - 2, by - 8, 3, 1, PAL['green'])
    b.rect(OX - 1, by - 14, 2, 1, PAL['skinD'])  # cuello

    # cabeza
    b.ellipse(hx, hy, 6.6, 6.0, PAL['skin'])
    b.rect(hx + 5, hy - 2, 1, 5, PAL['skinD'])
    # pelo: casco ondulado + patillas + un solo mechón alto que se mece (vapor de Java)
    for y in range(hy - 8, hy - 2):
        for x in range(hx - 8, hx + 8):
            dx, dy = (x + 0.5 - hx) / 7.6, (y + 0.5 - hy + 1) / 7.0
            if dx * dx + dy * dy < 1:
                wave = fbm(x * 0.5, y * 0.5 - p.t, 2)
                b.set(x, y, PAL['hairL'] if wave > 0.64 else (PAL['hairD'] if wave < 0.32 else PAL['hair']))
    b.rect(hx - 7, hy - 3, 2, 3, PAL['hair']); b.rect(hx + 5, hy - 3, 2, 4, PAL['hairD'])
    for i, w in enumerate((5, 4, 3, 3, 2, 2, 1)):  # mechón: nace ancho y se afina en curva hacia la punta
        sway = (fbm(i * 0.4, p.t * 0.8, 5) - 0.5) * i * 0.6
        b.rect(round(hx - 2 + math.sin(i * 0.8) * 1.5 + sway), hy - 7 - i, w, 1, PAL['hairD'] if i % 3 == 2 else PAL['hair'])

    # gafas cuadradas gruesas
    b.rect(hx - 6, hy - 1, 12, 1, PAL['frame']); b.rect(hx - 6, hy + 2, 12, 1, PAL['frame'])
    for x in (hx - 6, hx - 1, hx, hx + 5):
        b.rect(x, hy - 1, 1, 4, PAL['frame'])

    def eye(x, which):
        e = p.eyes
        if e == 'wink':
            e = 'closed' if which else 'open'
        if e in ('open', 'wide'):
            b.rect(x, hy, 2, 2, PAL['eye']); b.set(x, hy, PAL['white'])
        elif e == 'happy':
            b.rect(x, hy, 2, 1, PAL['eye'])
        else:
            b.rect(x, hy + 1, 2, 1, PAL['eye'])
        if e == 'wide':
            b.rect(x - 1, hy - 3, 3, 1, PAL['hairD'])  # cejas arriba
    eye(hx - 4, 0)
    eye(hx + 2, 1)
    mx, my = hx - 1, hy + 4
    if p.mouth == 'smile':
        b.set(mx - 1, my, PAL['mouth']); b.set(mx + 2, my, PAL['mouth']); b.rect(mx, my + 1, 2, 1, PAL['mouth'])
    elif p.mouth == 'grin':
        b.rect(mx - 1, my, 4, 1, PAL['white']); b.rect(mx - 1, my + 1, 4, 1, PAL['mouth'])
    elif p.mouth == 'o':
        b.rect(mx, my, 2, 2, PAL['mouth'])
    else:
        b.rect(mx, my + 1, 2, 1, PAL['mouth'])

    hd = arm(b, shF, p.upF, p.loF, 1, PAL['hood'], PAL['hood'], PAL['skin'])
    x, y = round(hd[0]), round(hd[1])

    if p.prop == 'cup':  # taza con vapor que sube en zigzag
        b.rect(x, y - 3, 5, 4, PAL['cup']); b.rect(x, y - 2, 5, 1, PAL['band']); b.rect(x + 5, y - 2, 1, 2, PAL['cup'])
        for i in range(4):
            off = round(math.sin(i * 1.6 + p.t * 2))
            b.set(x + 2 + off, y - 5 - i, PAL['steam'])
    if p.prop == 'broom' or p.special > 0:  # escoba de 8 bits y los píxeles basura
        sw = round((1 - p.special) * 6)   # la escoba barre de derecha a izquierda
        bx = x + sw - 3
        b.line(x, y, bx, by - 1, PAL['shoe'], th=1)
        b.rect(bx - 2, by - 2, 5, 2, PAL['steam']); b.rect(bx - 2, by - 1, 5, 1, '#C8902E')
        for i in range(5):
            tx, ty = OX + 8 + i * 3, by - 1 - (i % 3) * 3
            if tx > bx + 3:
                b.set(tx, ty, PAL['trash'] if p.special < 1 else PAL['green'])
        if p.special >= 1:
            for i in range(3):
                b.set(OX + 10 + i * 4, by - 8 - (i % 2) * 2, PAL['green'])
    return b


POSES = {
    'idle':  Pose(upF=40, loF=95, prop='cup'),
    'wave':  Pose(upF=115, loF=170, eyes='happy', mouth='grin'),
    'point': Pose(upF=90, loF=90, mouth='o'),
    'think': Pose(upF=30, loF=-150, mouth='flat'),
    'prop':  Pose(upF=60, loF=95, prop='cup', eyes='happy'),
    'cheer': Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', mouth='grin', bodyDy=-1),
    'wow':   Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', mouth='o'),
    'wink':  Pose(upF=140, loF=-170, eyes='happy', mouth='o', prop='cup'),  # ¡un sorbo!
}


def exportar(carpeta: str):
    os.makedirs(carpeta, exist_ok=True)
    for n, p in POSES.items():
        draw(p).sprite().save(f'{carpeta}/p_{n}.png')
    for i, t in enumerate([0, 0.7, 1.4, 2.1]):  # sorbo de café: respira, el vapor y el mechón se mueven
        draw(replace(POSES['idle'], t=t, bodyDy=[0, -1, 0, 1][i])).sprite().save(f'{carpeta}/p_anim{i}.png')
    for i, s in enumerate([0.01, 0.5, 1.0]):
        draw(Pose(upF=30, loF=20, special=s, mouth='grin' if s >= 1 else 'flat')).sprite().save(f'{carpeta}/p_esp{i}.png')
    print('sprites en', carpeta)


if __name__ == '__main__':
    exportar(sys.argv[1] if len(sys.argv) > 1 else 'salida/mocca')
