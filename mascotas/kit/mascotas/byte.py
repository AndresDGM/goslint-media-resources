"""BYTE · guía de la Fase 5 · Competitiva II · Python (reconstruido a partir de su hoja de concepto).

El pionero pixelado: una serpiente retro hecha de bloques, como las de los primeros juegos.
Cabeza de bloque con ojos grandes, cuerpo de bloques verdes y amarillos, camiseta con la «L» de
Goslint y una franja enroscada por la que corre código de Python, un carácter por paso.
Especial: «Desenrollado de recursión» (se divide en copias cada vez más pequeñas que caen por el
agujero de recursión y emergen juntas como una sola, sin desbordar la pila).

    python3 mascotas/byte.py salida/byte
"""
from __future__ import annotations
import os, sys
from dataclasses import dataclass, replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
from pixel import Buf, OX, OY, SW, SH, arm

PAL = {
    'g': '#4CD04C', 'gD': '#2E9E3A', 'gL': '#9BEA7A',
    'y': '#F2C230', 'yD': '#C8962A',
    'green': '#00C063', 'screen': '#0B1F12',
    'eye': '#141018', 'white': '#FFFFFF', 'pit': '#2E2350', 'pitD': '#1C1636',
}

# letras de 3×5 para el código que corre por el cuerpo
FONT = {
    'A': '010101111101101', 'C': '011100100100011', 'E': '111100110100111', 'F': '111100110100100',
    'G': '011100101101011', 'H': '101101111101101', 'I': '111010010010111', 'L': '100100100100111',
    'M': '101111111101101', 'N': '101111111111101', 'O': '010101101101010', 'P': '110101110100100',
    'R': '110101110101101', 'S': '011100010001110', 'T': '111010010010010', 'U': '101101101101111',
    'W': '101101101111101', 'X': '101101010101101', 'Y': '101101010010010', ' ': '000000000000000',
}


def text(b, s, x, y, c):
    for ch in s:
        g = FONT[ch]
        for j in range(5):
            for i in range(3):
                if g[j * 3 + i] == '1':
                    b.set(x + i, y + j, c)
        x += 4


@dataclass
class Pose:
    upF: float = 20; loF: float = 10; upB: float = 20; loB: float = 10
    eyes: str = 'open'
    mouth: str = 'smile'      # smile · grin · o · flat
    bodyDy: int = 0
    code: str = 'WHILE'       # lo que se lee en la franja (6 caracteres como máximo)
    prop: str | None = None   # laptop
    special: float = 0.0


def byte_mini(b, x, y, k):
    """Copia pequeña de Byte (cabeza de bloque + franja) para el especial; k = tamaño de la cabeza."""
    b.rect(x, y, k, k, PAL['g']); b.rect(x + k - 1, y, 1, k, PAL['gD'])
    b.set(x + 1, y + 1, PAL['eye']); b.set(x + k - 2, y + 1, PAL['eye'])
    b.rect(x - 1, y + k, k + 2, 2, PAL['y']); b.rect(x, y + k + 1, k, 1, PAL['g'])


def draw(p: Pose) -> Buf:
    b = Buf(SW + 40, SH)   # más ancho: el especial tiene el agujero y la bandera a la derecha (se recorta al exportar)
    s = p.special
    by = OY + p.bodyDy
    hx, hy = OX, by - 34
    shF, shB = (OX + 5, by - 16), (OX - 6, by - 16)

    arm(b, shB, p.upB, p.loB, -1, PAL['g'], PAL['g'], PAL['g'])

    # cola de bloques que sube a la izquierda
    for i, y in enumerate(range(by - 10, by - 20, -2)):
        b.rect(OX - 15, y - 1, 3, 2, PAL['y'] if i % 2 else PAL['g'])
    b.rect(OX - 14, by - 21, 2, 2, PAL['y'])
    # franja enroscada: borde a cuadros verde y amarillo, código amarillo sobre fondo oscuro
    b.rect(OX - 13, by - 9, 27, 9, PAL['screen'])
    for i in range(27):
        c = PAL['y'] if (i // 3) % 2 else PAL['g']
        b.set(OX - 13 + i, by - 9, c); b.set(OX - 13 + i, by - 1, c)
    b.rect(OX - 13, by - 8, 1, 7, PAL['g']); b.rect(OX + 13, by - 8, 1, 7, PAL['y'])
    text(b, p.code[:6], OX - 11, by - 7, PAL['y'])

    # torso: camiseta amarilla con la «L»
    b.rect(OX - 5, by - 17, 10, 8, PAL['y'])
    b.rect(OX - 5, by - 17, 1, 8, PAL['yD']); b.rect(OX + 4, by - 17, 1, 8, PAL['yD'])
    b.rect(OX - 1, by - 15, 1, 4, PAL['green']); b.rect(OX - 1, by - 12, 3, 1, PAL['green'])
    b.rect(OX - 2, by - 20, 4, 3, PAL['g'])          # cuello

    # cabeza de bloque: lado derecho en sombra, hocico claro y dos bloques amarillos arriba
    b.rect(hx - 7, hy, 14, 14, PAL['g'])
    b.rect(hx + 5, hy, 2, 14, PAL['gD'])
    b.rect(hx - 6, hy + 8, 11, 5, PAL['gL'])
    b.rect(hx - 6, hy, 3, 1, PAL['y']); b.rect(hx + 2, hy, 3, 1, PAL['y'])

    def eye(x, which):
        e = p.eyes
        if e == 'wink':
            e = 'closed' if which else 'open'
        if e in ('open', 'wide'):
            h = 4 if e == 'wide' else 3
            b.rect(x, hy + 7 - h, 2, h, PAL['eye']); b.set(x, hy + 7 - h, PAL['white'])
        elif e == 'happy':
            b.rect(x, hy + 4, 2, 1, PAL['eye']); b.set(x - 1, hy + 5, PAL['eye']); b.set(x + 2, hy + 5, PAL['eye'])
        else:
            b.rect(x - 1, hy + 5, 3, 1, PAL['eye'])
    eye(hx - 4, 0)
    eye(hx + 2, 1)
    mx, my = hx - 1, hy + 10
    b.set(mx - 1, my - 1, PAL['gD']); b.set(mx + 2, my - 1, PAL['gD'])
    if p.mouth == 'smile':
        b.rect(mx, my, 2, 1, PAL['gD'])
    elif p.mouth == 'grin':
        b.rect(mx - 1, my, 4, 1, PAL['gD']); b.rect(mx, my + 1, 2, 1, '#E2465A')
    elif p.mouth == 'o':
        b.rect(mx, my, 2, 2, PAL['eye'])
    else:
        b.set(mx, my, PAL['gD'])

    hd = arm(b, shF, p.upF, p.loF, 1, PAL['g'], PAL['g'], PAL['g'])

    if p.prop == 'laptop':
        x, y = round(hd[0]) - 2, round(hd[1])
        b.rect(x, y - 1, 10, 2, '#7F8D99'); b.rect(x + 1, y - 7, 8, 6, '#C9D3DC'); b.rect(x + 2, y - 6, 6, 4, PAL['screen'])
        b.rect(x + 3, y - 5, 3, 1, PAL['green']); b.rect(x + 3, y - 3, 2, 1, PAL['y'])

    if s > 0:  # agujero de recursión a la derecha
        px = OX + 18
        b.rect(px, OY - 1, 14, 2, PAL['y']); b.rect(px, OY - 1, 14, 1, PAL['g'])
        b.rect(px + 1, OY + 1, 12, 12, PAL['pit']); b.rect(px + 4, OY + 4, 6, 9, PAL['pitD'])
        if s < 1:   # copias cada vez más pequeñas cayendo por el pozo
            for i, k in enumerate((6, 4, 3)):
                byte_mini(b, px + 2 + i * 3, OY - 9 + i * 6, k)
        else:       # el pozo se cerró: todas emergieron como una sola y aparece el «AC»
            b.rect(px + 1, OY + 1, 12, 2, PAL['y'])
            b.rect(px + 7, OY - 16, 1, 15, '#BFC5CD')
            b.rect(px + 8, OY - 16, 10, 7, PAL['green'])
            text(b, 'AC', px + 9, OY - 15, PAL['white'])
    return b


POSES = {
    'idle':  Pose(),
    'wave':  Pose(upF=115, loF=170, eyes='happy', mouth='grin', code='IMPORT'),
    'point': Pose(upF=90, loF=90, mouth='o', code='GRAPH'),
    'think': Pose(upF=30, loF=-150, mouth='flat', code='FOR X'),
    'prop':  Pose(upF=70, loF=95, prop='laptop', eyes='happy', code='GRAPH'),
    'cheer': Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', mouth='grin', bodyDy=-1),
    'wow':   Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', mouth='o', code='FALSE'),
    'wink':  Pose(upF=90, loF=130, eyes='wink', mouth='grin', code='IMPORT'),
}

STREAM = 'WHILE TLE: '   # el código avanza un carácter por paso


def exportar(carpeta: str):
    os.makedirs(carpeta, exist_ok=True)
    for n, p in POSES.items():
        draw(p).sprite().save(f'{carpeta}/p_{n}.png')
    for i in range(4):
        code = (STREAM * 2)[i:i + 6]
        draw(replace(POSES['idle'], code=code, bodyDy=[0, -1, 0, 0][i])).sprite().save(f'{carpeta}/p_anim{i}.png')
    for i, (s, q) in enumerate([(0.01, Pose(upF=90, loF=90, eyes='wide', mouth='o', code='TLE')),
                                (0.5, Pose(upF=90, loF=90, mouth='flat', code='GRAPH')),
                                (1.0, POSES['cheer'])]):
        draw(replace(q, special=s)).sprite().save(f'{carpeta}/p_esp{i}.png')
    print('sprites en', carpeta)


if __name__ == '__main__':
    exportar(sys.argv[1] if len(sys.argv) > 1 else 'salida/byte')
