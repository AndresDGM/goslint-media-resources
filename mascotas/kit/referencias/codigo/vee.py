"""VEE — mascota pixel art de Goslint para la fase de Lógica.

Se construye con la misma gramática que Lint (src/mascot.tsx del proyecto de búsqueda binaria):
lienzo lógico de 72×64, pies en OY=50, centro en OX=36, cabeza grande y cuerpo pequeño, brazos de
2 px que salen de los hombros y paleta plana con una sombra por color. Sin contorno exterior (Lint
lleva el «borde de sticker» blanco; Vee ya no).

Rasgos tomados de la profe Vivian Orejuela (fotos de referencia): cabello castaño largo con raya
al medio, gafas, sonrisa amplia, camiseta gris de «Regionals» con los tres bloques azul-amarillo-rojo,
jeans, y su pose de manos en la cintura.
"""
from __future__ import annotations
import math
from dataclasses import dataclass, field, replace
from PIL import Image

SW, SH, OX, OY = 72, 64, 36, 50

PAL = {
    'outline': '#FFFFFF',
    'hair': '#5B3521', 'hairD': '#3E2316', 'hairL': '#8A5434',
    'skin': '#E7B08A', 'skinD': '#C88B68', 'blush': '#E2856F',
    'frame': '#2E211B', 'eye': '#1E130C', 'shine': '#FFFFFF',
    'lip': '#B23B4A', 'teeth': '#FFFFFF',
    'shirt': '#767C82', 'shirtD': '#585D63',
    'blue': '#3E73D8', 'yellow': '#F2C230', 'red': '#E2463E',
    'jean': '#3C5F8E', 'jeanD': '#2B476D',
    'shoe': '#2A2522',
    'green': '#00C063', 'greenD': '#00864A',
    'card': '#F4F7F5', 'cardD': '#B4C0B8',
}


class Buf:
    def __init__(self, w=SW, h=SH):
        self.w, self.h = w, h
        self.px: list[list[str | None]] = [[None] * w for _ in range(h)]

    def set(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[y][x] = c

    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.px[y][x]
        return None

    def rect(self, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.set(xx, yy, c)

    def ellipse(self, cx, cy, rx, ry, c):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((x + 0.5 - cx - 0.5) / rx) ** 2 + ((y + 0.5 - cy - 0.5) / ry) ** 2 <= 1:
                    self.set(x, y, c)

    def line(self, x0, y0, x1, y1, c, th=2):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
        for i in range(n + 1):
            t = i / n
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            col = c(t) if callable(c) else c
            for dy in range(th):
                for dx in range(th):
                    self.set(math.floor(x + dx - th / 2 + 0.5), math.floor(y + dy - th / 2 + 0.5), col)

    def outline(self, color=PAL['outline']):
        add = []
        for y in range(self.h):
            for x in range(self.w):
                if self.px[y][x] is None and any(self.get(x + dx, y + dy) not in (None,) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    add.append((x, y))
        for x, y in add:
            self.px[y][x] = color

    def image(self, scale=1):
        im = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))
        for y in range(self.h):
            for x in range(self.w):
                c = self.px[y][x]
                if c:
                    im.putpixel((x, y), tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
        return im.resize((self.w * scale, self.h * scale), Image.NEAREST) if scale != 1 else im


@dataclass
class Pose:
    # ángulos: 0 = colgando, 90 = hacia afuera (lado del brazo), 180 = arriba; negativo = hacia adentro
    upF: float = 12
    loF: float = 6
    upB: float = 12
    loB: float = 6
    eyes: str = 'open'      # open · blink · happy · wide · wink · closed
    mouth: str = 'smile'    # smile · grin · open · o · flat · wobble
    look: int = 0
    headDy: int = 0
    bodyDy: int = 0
    legs: int = 0           # 0 de pie · 1–4 ciclo de caminar
    prop: str | None = None  # marker · card · pointer · mug · book
    blush: bool = True
    view: str = 'front'     # front · back


def dirv(a, side):
    r = math.radians(a)
    return math.sin(r) * side, math.cos(r)


def draw_vee(p: Pose, facing: int = 1) -> Buf:
    b = Buf()
    by = OY + p.bodyDy
    hx = OX
    hy = by - 22 + p.headDy

    shF = (OX + 5 * facing - (1 if facing == 1 else 0) + 0.0, by - 12)
    shB = (OX - 5 * facing - (1 if facing == -1 else 0) + 0.0, by - 12)

    def arm(sh, up, lo, side):
        # brazo colgando: más corto, para que no llegue a las rodillas
        hanging = math.cos(math.radians(up)) > 0.8 and math.cos(math.radians(lo)) > 0.8
        L1, L2 = (3, 2.5) if hanging else (4, 4)
        ex, ey = dirv(up, side)
        el = (sh[0] + ex * L1, sh[1] + ey * L1)
        hx_, hy_ = dirv(lo, side)
        hd = (el[0] + hx_ * L2, el[1] + hy_ * L2)
        b.line(sh[0], sh[1], el[0], el[1], lambda t: PAL['shirt'] if t < 0.6 else PAL['skin'])
        b.line(el[0], el[1], hd[0], hd[1], PAL['skin'])
        b.rect(round(hd[0] - 1), round(hd[1] - 1), 2, 2, PAL['skin'])
        return hd

    # --- cabello trasero (largo, cae hasta el pecho por detrás)
    for y in range(hy - 4, by - 9):
        k = y - (hy - 4)
        half = 8 if k < 10 else 8 - (k - 10) // 2
        b.rect(hx - half, y, half * 2, 1, PAL['hairD'])

    # --- brazo trasero
    handB = arm(shB, p.upB, p.loB, -facing)

    # --- piernas (jeans) y zapatos
    cyc = [(0, 0, 0, 0), (1, 1, 0, -1), (0, 0, 0, 0), (0, -1, 1, 1), (0, 0, 0, 0)][max(0, min(4, p.legs))]
    for side, lift, shift in ((-1, cyc[0], cyc[1]), (1, cyc[2], cyc[3])):
        x = OX + (-4 if side == -1 else 1) + shift * facing
        b.rect(x, OY - 5 - lift, 3, 4, PAL['jean'])
        b.rect(x + (2 if side == 1 else 0), OY - 5 - lift, 1, 4, PAL['jeanD'])
        b.rect(x - (1 if facing == -1 else 0), OY - 1 - lift, 4, 1, PAL['shoe'])

    # --- cadera (jeans)
    b.rect(OX - 4, by - 6, 8, 2, PAL['jean'])
    b.rect(OX + 3, by - 6, 1, 2, PAL['jeanD'])

    # --- torso: camiseta gris de «Regionals»
    b.rect(OX - 4, by - 13, 8, 7, PAL['shirt'])
    b.rect(OX - 5, by - 12, 10, 3, PAL['shirt'])   # hombros / mangas cortas
    b.rect(OX + 3, by - 12, 1, 6, PAL['shirtD'])
    b.rect(OX + 4, by - 12, 1, 3, PAL['shirtD'])
    if p.view == 'front':
        b.rect(OX - 1, by - 13, 2, 1, PAL['skin'])  # cuello en V
        # los tres bloques de color de su camiseta (y de los globos de las maratones)
        b.rect(OX - 3, by - 10, 2, 2, PAL['blue'])
        b.rect(OX - 1, by - 10, 2, 2, PAL['yellow'])
        b.rect(OX + 1, by - 10, 2, 2, PAL['red'])

    # --- cabeza
    if p.view == 'back':
        b.rect(hx - 8, hy - 7, 16, 20, PAL['hair'])
        for y in range(hy - 7, hy + 13):
            b.set(hx - 1 + (y % 2), y, PAL['hairD'])
            b.set(hx - 6, y, PAL['hairL'])
    else:
        # rostro
        b.rect(hx - 6, hy - 4, 12, 10, PAL['skin'])  # frente 2 px más baja: cabeza más corta
        b.rect(hx - 5, hy + 6, 10, 1, PAL['skin'])
        b.rect(hx - 3, hy + 7, 6, 1, PAL['skin'])
        b.rect(hx - 3, hy + 8, 6, 1, PAL['skinD'])  # cuello en sombra
        b.rect(hx - 1, hy + 9, 2, 1, PAL['skin'])
        b.rect(hx + 5, hy - 4, 1, 9, PAL['skinD'])
        # cabello: casquete con raya al medio
        b.rect(hx - 7, hy - 7, 14, 3, PAL['hair'])
        b.rect(hx - 6, hy - 8, 12, 1, PAL['hair'])
        b.rect(hx - 4, hy - 9, 8, 1, PAL['hair'])
        b.rect(hx - 1, hy - 9, 1, 3, PAL['hairD'])         # raya al medio
        b.rect(hx - 1, hy - 6, 1, 1, PAL['skin'])          # la raya abre la frente
        b.rect(hx - 5, hy - 8, 2, 1, PAL['hairL'])          # brillo
        b.rect(hx - 6, hy - 7, 1, 1, PAL['hairL'])
        b.rect(hx + 2, hy - 8, 2, 1, PAL['hairL'])
        # flequillo que se abre hacia los lados
        b.rect(hx - 7, hy - 4, 2, 2, PAL['hair'])
        b.rect(hx - 7, hy - 2, 1, 2, PAL['hair'])
        b.rect(hx + 5, hy - 4, 2, 2, PAL['hair'])
        b.rect(hx + 6, hy - 2, 1, 2, PAL['hair'])
        # mechones largos a los lados del rostro, caen sobre los hombros
        for y in range(hy - 5, by - 10):
            b.rect(hx - 8, y, 2, 1, PAL['hair'])
            b.rect(hx + 6, y, 2, 1, PAL['hair'])
            b.set(hx - 8, y, PAL['hairL'] if y % 4 == 0 else PAL['hair'])
            b.set(hx + 7, y, PAL['hairD'])
        b.rect(hx - 8, by - 10, 1, 1, PAL['hair'])
        b.rect(hx + 7, by - 10, 1, 1, PAL['hairD'])

        lk = p.look * facing

        def eye(cx, which):
            x = cx + lk
            e = p.eyes
            if e == 'wink':
                e = 'closed' if which == 1 else 'open'   # guiño: un ojo abierto y el otro cerrado en línea recta
            if e == 'open':
                b.rect(x, hy - 2, 2, 2, PAL['eye'])
                b.set(x, hy - 2, PAL['shine'])
            elif e == 'wide':
                b.rect(x, hy - 3, 2, 3, PAL['eye'])
                b.set(x, hy - 3, PAL['shine'])
            elif e in ('blink', 'closed'):
                b.rect(x - 1, hy - 1, 3, 1, PAL['eye'])
            elif e == 'happy':
                b.set(x - 1, hy - 1, PAL['eye'])
                b.set(x, hy - 2, PAL['eye'])
                b.set(x + 1, hy - 2, PAL['eye'])
                b.set(x + 2, hy - 1, PAL['eye'])
            # ceja
            b.rect(x - (1 if which == 0 else 0), hy - 4, 3, 1, PAL['hairD'])
        eye(hx - 4, 0)
        eye(hx + 2, 1)

        if p.blush:
            b.set(hx - 5, hy + 2, PAL['blush'])
            b.set(hx + 4, hy + 2, PAL['blush'])
        b.set(hx, hy + 1, PAL['skinD'])  # nariz

        mx, my = hx - 2 + lk, hy + 3
        m = p.mouth
        if m == 'smile':
            b.set(mx, my, PAL['lip']); b.set(mx + 3, my, PAL['lip'])
            b.rect(mx + 1, my + 1, 2, 1, PAL['lip'])
        elif m in ('grin', 'open'):
            b.rect(mx, my, 4, 1, PAL['teeth'])
            b.rect(mx, my + 1, 4, 1, PAL['lip'])
            if m == 'open':
                b.rect(mx + 1, my + 2, 2, 1, PAL['lip'])
        elif m == 'o':
            b.rect(mx + 1, my, 2, 2, PAL['lip'])
        elif m == 'flat':
            b.rect(mx + 1, my + 1, 2, 1, PAL['lip'])
        elif m == 'wobble':
            b.set(mx, my + 1, PAL['lip']); b.set(mx + 1, my, PAL['lip'])
            b.set(mx + 2, my + 1, PAL['lip']); b.set(mx + 3, my, PAL['lip'])

    # --- brazo delantero y accesorio
    handF = arm(shF, p.upF, p.loF, facing)
    hx_, hy_ = round(handF[0]), round(handF[1])
    if p.prop == 'marker':
        b.rect(hx_ - 0, hy_ - 5, 1, 4, PAL['green'])
        b.rect(hx_ - 0, hy_ - 6, 1, 1, PAL['card'])
    elif p.prop == 'pointer':
        b.line(hx_, hy_ - 1, hx_ + 9 * facing, hy_ - 7, PAL['cardD'], 1)
        b.set(hx_ + 9 * facing, hy_ - 7, PAL['green'])
    elif p.prop == 'card':
        cx = hx_ - (1 if facing == 1 else 8)
        b.rect(cx, hy_ - 9, 9, 8, PAL['card'])
        b.rect(cx, hy_ - 2, 9, 1, PAL['cardD'])
        # mini diagrama de flujo: inicio → rombo → fin
        b.rect(cx + 3, hy_ - 8, 3, 1, PAL['greenD'])
        b.set(cx + 4, hy_ - 7, PAL['greenD'])
        b.set(cx + 4, hy_ - 6, PAL['green']); b.set(cx + 3, hy_ - 5, PAL['green'])
        b.set(cx + 5, hy_ - 5, PAL['green']); b.set(cx + 4, hy_ - 4, PAL['green'])
        b.set(cx + 4, hy_ - 3, PAL['greenD'])
    elif p.prop == 'mug':
        b.rect(hx_ - 1, hy_ - 4, 3, 3, PAL['card'])
        b.set(hx_ + 2, hy_ - 3, PAL['card'])
        b.rect(hx_ - 1, hy_ - 4, 3, 1, PAL['green'])

    return b


POSES = {
    'idle':      Pose(upF=40, loF=-55, upB=40, loB=-55),             # manos en la cintura (de la foto)
    'wave':      Pose(upF=115, loF=170, upB=12, loB=6, eyes='happy', mouth='grin'),
    'point':     Pose(upF=90, loF=90, upB=12, loB=6, mouth='open'),
    'pointUp':   Pose(upF=120, loF=175, upB=12, loB=6, mouth='open', look=1),
    'think':     Pose(upF=30, loF=-150, upB=50, loB=-60, eyes='open', mouth='flat', look=1),
    'explain':   Pose(upF=60, loF=110, upB=40, loB=-55, prop='card', mouth='open'),
    'draw':      Pose(upF=100, loF=140, upB=12, loB=6, prop='marker', mouth='smile', look=1),
    'teach':     Pose(upF=95, loF=120, upB=40, loB=-55, prop='pointer', mouth='open'),
    'cheer':     Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', mouth='grin', headDy=-1, bodyDy=-1),
    'shrug':     Pose(upF=70, loF=150, upB=70, loB=150, eyes='open', mouth='flat'),
    'wow':       Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', mouth='o'),
    'oops':      Pose(upF=20, loF=-160, upB=12, loB=6, eyes='closed', mouth='wobble'),
    'tired':     Pose(upF=5, loF=0, upB=5, loB=0, eyes='blink', mouth='flat', headDy=1),
    'coffee':    Pose(upF=40, loF=-120, upB=40, loB=-55, prop='mug', eyes='happy', mouth='smile'),
    'wink':      Pose(upF=90, loF=130, upB=40, loB=-55, eyes='wink', mouth='grin'),
    'back':      Pose(upF=8, loF=4, upB=8, loB=4, view='back'),
    'walk1':     Pose(upF=-20, loF=-10, upB=30, loB=20, legs=1),
    'walk2':     Pose(upF=10, loF=5, upB=10, loB=5, legs=2),
    'walk3':     Pose(upF=30, loF=20, upB=-20, loB=-10, legs=3),
    'walk4':     Pose(upF=10, loF=5, upB=10, loB=5, legs=4),
}


if __name__ == '__main__':
    import os, sys
    out = sys.argv[1] if len(sys.argv) > 1 else 'out'
    os.makedirs(out, exist_ok=True)
    for name, pose in POSES.items():
        b = draw_vee(pose)
        im = b.image()
        bbox = im.getbbox()
        im.save(f'{out}/{name}.png')
        print(name, bbox)
