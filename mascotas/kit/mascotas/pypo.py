"""PYPO · guía de la Fase 5 · Competitiva II · Python (reconstruido a partir de su hoja de concepto).

Serpiente verde con hocico claro y ojos grandes, camiseta azul Python con la «L» de Goslint.
No tiene piernas: descansa sobre su cola enroscada, que termina en un gancho «@».
Especial: «La vía del @ optimizado» (se agarra al muro con la cola y salta hasta la bandera AC).

    python3 mascotas/pypo.py salida/pypo
"""
from __future__ import annotations
import math, os, sys
from dataclasses import dataclass, replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
from pixel import Buf, OX, OY, SW, SH, arm

PAL = {
    'g': '#4CD04C', 'gD': '#2E9E3A', 'gL': '#9BEA7A', 'belly': '#EAF5A8',
    'eye': '#141018', 'white': '#FFFFFF', 'tongue': '#E2465A',
    'shirt': '#3E6FB0', 'shirtD': '#2A4F86', 'yellow': '#F2C230',
    'green': '#00C063', 'brick': '#C8483E', 'brickD': '#8E2E28',
}

# letras de 3×5 para la bandera
FONT = {'A': ['010', '101', '111', '101', '101'], 'C': ['011', '100', '100', '100', '011']}


def text(b, s, x, y, c):
    for ch in s:
        for j, row in enumerate(FONT[ch]):
            for i, v in enumerate(row):
                if v == '1':
                    b.set(x + i, y + j, c)
        x += 4


@dataclass
class Pose:
    upF: float = 20; loF: float = 10; upB: float = 20; loB: float = 10
    eyes: str = 'open'
    mouth: str = 'smile'    # smile · grin · o · flat · tongue
    headDy: int = 0
    bodyDy: int = 0
    tail: float = 0.0       # meneo de la cola (−1..1)
    prop: str | None = None # laptop
    special: float = 0.0


def draw(p: Pose) -> Buf:
    b = Buf(SW + 40, SH)                       # más ancho: en el especial salta el muro hasta la bandera (se recorta al exportar)
    s = p.special
    k = max(0.0, s - 0.15) / 0.85
    hop = round(math.sin(k * math.pi) * 14)
    dx = round(k * 30)
    cx = OX + dx
    by = OY + p.bodyDy - hop
    hx, hy = cx, by - 23 + p.headDy
    shF, shB = (cx + 4, by - 15), (cx - 5, by - 15)

    arm(b, shB, p.upB, p.loB, -1, PAL['g'], PAL['g'], PAL['g'])

    # cola enroscada como base y gancho «@» a la izquierda
    b.ellipse(cx, by - 3, 10, 3.6, PAL['g'])
    b.rect(cx - 5, by - 3, 10, 1, PAL['belly']); b.rect(cx - 4, by - 1, 8, 1, PAL['belly'])
    b.rect(cx - 9, by - 5, 2, 1, PAL['gD'])
    if s > 0 and s < 1:   # la cola se estira como gancho hasta el borde del muro
        b.line(cx - 8, by - 4, OX + 13, OY - 15, PAL['g'])            # gancho en el borde del muro
        b.rect(OX + 12, OY - 16, 3, 1, PAL['gD'])
    else:
        w = round(p.tail)
        b.line(cx - 9, by - 4, cx - 11 + w, by - 9, PAL['g'])          # cola que sube
        b.line(cx - 11 + w, by - 9, cx - 9 + w, by - 12, PAL['g'])
        b.line(cx - 9 + w, by - 12, cx - 7 + w, by - 10, PAL['g'])     # se enrosca en «@»
        b.set(cx - 9 + w, by - 10, None)
        b.set(cx - 12 + w, by - 8, PAL['gD'])
    # cuerpo: cuello y camiseta azul con la «L»
    b.rect(cx - 4, by - 9, 8, 3, PAL['g'])
    b.rect(cx - 5, by - 16, 10, 8, PAL['shirt'])
    b.rect(cx + 4, by - 15, 1, 7, PAL['shirtD']); b.rect(cx - 5, by - 9, 10, 1, PAL['shirtD'])
    b.set(cx - 3, by - 16, PAL['yellow']); b.set(cx + 2, by - 16, PAL['yellow'])
    b.rect(cx - 1, by - 14, 1, 4, PAL['green']); b.rect(cx - 1, by - 11, 3, 1, PAL['green'])
    b.rect(cx - 1, by - 18, 2, 2, PAL['g'])

    # cabeza: verde con hocico claro
    b.ellipse(hx, hy - 1, 6.6, 5.8, PAL['g'])
    b.rect(hx + 5, hy - 3, 1, 5, PAL['gD'])
    b.ellipse(hx, hy + 3, 4.6, 2.6, PAL['belly'])
    b.set(hx, hy - 8, PAL['g']); b.rect(hx - 2, hy - 7, 2, 1, PAL['gL'])  # cresta

    def eye(x, which):
        e = p.eyes
        if e == 'wink':
            e = 'closed' if which else 'open'
        if e in ('open', 'wide'):
            h = 4 if e == 'wide' else 3
            b.rect(x, hy - 1 - h + 1, 2, h, PAL['eye']); b.set(x, hy - 1 - h + 1, PAL['white'])
        elif e == 'happy':
            b.rect(x, hy - 2, 2, 1, PAL['eye']); b.set(x - 1, hy - 1, PAL['eye']); b.set(x + 2, hy - 1, PAL['eye'])
        else:
            b.rect(x - 1, hy - 1, 3, 1, PAL['eye'])
    eye(hx - 4, 0)
    eye(hx + 2, 1)
    mx, my = hx - 1, hy + 2
    b.set(mx - 1, my - 1, PAL['gD']); b.set(mx + 2, my - 1, PAL['gD'])   # fosas
    if p.mouth == 'smile':
        b.rect(mx, my + 1, 2, 1, PAL['gD'])
    elif p.mouth == 'grin':
        b.rect(mx - 1, my + 1, 4, 1, PAL['gD'])
    elif p.mouth == 'o':
        b.rect(mx, my + 1, 2, 2, PAL['eye'])
    elif p.mouth == 'tongue':  # lengüita bífida
        b.rect(mx, my + 1, 2, 1, PAL['gD']); b.rect(mx, my + 2, 1, 2, PAL['tongue']); b.set(mx - 1, my + 4, PAL['tongue']); b.set(mx + 1, my + 4, PAL['tongue'])
    else:
        b.set(mx, my + 1, PAL['gD'])

    hd = arm(b, shF, p.upF, p.loF, 1, PAL['g'], PAL['g'], PAL['g'])

    if p.prop == 'laptop':
        x, y = round(hd[0]) - 2, round(hd[1])
        b.rect(x, y - 1, 10, 2, '#7F8D99'); b.rect(x + 1, y - 7, 8, 6, '#C9D3DC'); b.rect(x + 2, y - 6, 6, 4, '#0A1A12')
        b.rect(x + 3, y - 5, 3, 1, PAL['green']); b.rect(x + 3, y - 3, 2, 1, PAL['yellow'])

    if s > 0:  # muro de bucle ineficiente y bandera AC
        wx = OX + 12
        for row in range(5):
            for col in range(2):
                y0 = OY - 2 - row * 3
                b.rect(wx + col * 3 + (row % 2), y0, 2, 2, PAL['brick'] if (row + col) % 2 else PAL['brickD'])
        fx = OX + 42
        b.rect(fx, OY - 16, 1, 16, '#BFC5CD')
        b.rect(fx + 1, OY - 16, 10, 7, PAL['green'] if s >= 1 else PAL['gD'])
        text(b, 'AC', fx + 2, OY - 15, PAL['white'])
    return b


POSES = {
    'idle':  Pose(),
    'wave':  Pose(upF=115, loF=170, eyes='happy', mouth='grin'),
    'point': Pose(upF=90, loF=90, mouth='o'),
    'think': Pose(upF=30, loF=-150, mouth='flat'),
    'prop':  Pose(upF=70, loF=95, upB=70, loB=95, prop='laptop', eyes='happy'),
    'cheer': Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', mouth='grin', bodyDy=-1),
    'wow':   Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', mouth='o'),
    'wink':  Pose(upF=90, loF=130, eyes='wink', mouth='tongue'),
}


def exportar(carpeta: str):
    os.makedirs(carpeta, exist_ok=True)
    for n, p in POSES.items():
        draw(p).sprite().save(f'{carpeta}/p_{n}.png')
    for i in range(4):  # respira y menea la cola
        draw(replace(POSES['idle'], tail=[0, 1, 0, -1][i], bodyDy=[0, -1, 0, 1][i])).sprite().save(f'{carpeta}/p_anim{i}.png')
    for i, s in enumerate([0.15, 0.5, 1.0]):
        q = Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', mouth='grin') if s >= 1 else Pose(upF=60, loF=90, mouth='flat')
        draw(replace(q, special=s)).sprite().save(f'{carpeta}/p_esp{i}.png')
    print('sprites en', carpeta)


if __name__ == '__main__':
    exportar(sys.argv[1] if len(sys.argv) > 1 else 'salida/pypo')
