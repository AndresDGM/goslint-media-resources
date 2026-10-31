"""Personaje de humo azul — bosquejo para Goslint.

Misma gramática que Lint y Vee: lienzo lógico 72×64, pies en OY = 50, centro OX = 36, cabeza grande,
cuerpo pequeño, brazos de 2 px, paleta plana y contorno blanco de 1 px alrededor de la silueta.
Diferencia: no tiene piernas ni cara. La cabeza es una nube de humo azul con dos ojos amarillos
que brillan, y de la cintura para abajo el cuerpo se deshace en una cola de humo. Lleva un buzo
con capucha de programador.
El humo se mueve con ruido determinista (parámetro t), así que se puede animar fotograma a fotograma.
"""
from __future__ import annotations
import math
from dataclasses import dataclass
from PIL import Image

SW, SH, OX, OY = 72, 64, 36, 50
PAL = {
    'outline': '#FFFFFF',
    'smk0': '#0B1233', 'smk1': '#16267A', 'smk2': '#2C55D6', 'smk3': '#5E95FF', 'smk4': '#B7D6FF',
    'face': '#070B20',
    'eye': '#FFE14D', 'eyeHot': '#FFFBE0', 'glow': '#4A3A0A',
    'hood': '#1C2333', 'hoodD': '#121826', 'hoodL': '#2C3650',
    'green': '#00C063', 'greenD': '#00864A',
    'laptop': '#C9D3DC', 'laptopD': '#7F8D99', 'screen': '#0A1A12',
}


def h(x, y, s=0):
    v = math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453
    return v - math.floor(v)


def noise(x, y, s=0):
    xi, yi = math.floor(x), math.floor(y)
    xf, yf = x - xi, y - yi
    u, v = xf * xf * (3 - 2 * xf), yf * yf * (3 - 2 * yf)
    a, b = h(xi, yi, s), h(xi + 1, yi, s)
    c, d = h(xi, yi + 1, s), h(xi + 1, yi + 1, s)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v


def fbm(x, y, s=0):
    return 0.6 * noise(x, y, s) + 0.3 * noise(x * 2.1, y * 2.1, s + 3) + 0.1 * noise(x * 4.3, y * 4.3, s + 7)


class Buf:
    def __init__(self):
        self.px = [[None] * SW for _ in range(SH)]

    def set(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < SW and 0 <= y < SH:
            self.px[y][x] = c

    def get(self, x, y):
        return self.px[y][x] if 0 <= x < SW and 0 <= y < SH else None

    def rect(self, x, y, w, hh, c):
        for yy in range(y, y + hh):
            for xx in range(x, x + w):
                self.set(xx, yy, c)

    def line(self, x0, y0, x1, y1, c, th=2):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
        for i in range(n + 1):
            t = i / n
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            col = c(t) if callable(c) else c
            for dy in range(th):
                for dx in range(th):
                    self.set(math.floor(x + dx - th / 2 + 0.5), math.floor(y + dy - th / 2 + 0.5), col)

    def outline(self, color, skip=()):
        # solo contorno EXTERIOR: los huecos del humo dentro de la silueta no se delinean
        ext = [[False] * SW for _ in range(SH)]
        stack = [(x, y) for x in range(SW) for y in (0, SH - 1)] + [(x, y) for y in range(SH) for x in (0, SW - 1)]
        while stack:
            x, y = stack.pop()
            if 0 <= x < SW and 0 <= y < SH and not ext[y][x] and self.px[y][x] is None:
                ext[y][x] = True
                stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
        add = []
        for y in range(SH):
            for x in range(SW):
                if ext[y][x] and any(self.get(x + dx, y + dy) is not None for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    add.append((x, y))
        # los huecos interiores se rellenan con el tono más oscuro del humo
        for y in range(SH):
            for x in range(SW):
                if self.px[y][x] is None and not ext[y][x]:
                    self.px[y][x] = PAL['smk0']
        for x, y in add:
            self.px[y][x] = color

    def image(self, scale=1):
        im = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
        for y in range(SH):
            for x in range(SW):
                c = self.px[y][x]
                if c:
                    im.putpixel((x, y), tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
        return im if scale == 1 else im.resize((SW * scale, SH * scale), Image.NEAREST)


@dataclass
class Pose:
    upF: float = 12; loF: float = 6; upB: float = 12; loB: float = 6
    eyes: str = 'open'   # open · happy · wide · squint · blink · angry
    t: float = 0.0       # tiempo del humo (anima volutas y cola)
    float_: int = 0      # flotación vertical
    prop: str | None = None   # laptop · braces
    burst: float = 0.0   # 0..1 · «se deshace en humo» (movimiento especial)


def dirv(a, side):
    r = math.radians(a)
    return math.sin(r) * side, math.cos(r)


OUTLINE = True
KEEP_WHITE = set()
SMOKE = ['smk0', 'smk1', 'smk2', 'smk3', 'smk4']


def smoke_col(v):
    return PAL[SMOKE[max(0, min(4, int(v * 5)))]]


def draw(p: Pose, facing=1) -> Buf:
    b = Buf()
    by = OY - 3 + p.float_          # flota: la «cintura» queda 3 px más arriba que los pies de Lint
    hx, hy = OX, by - 20
    t = p.t
    puff = []  # volutas sueltas (sin contorno)

    # --- cola de humo (en vez de piernas): se afina hacia abajo y ondula
    for y in range(by - 6, OY + 1):
        k = (y - (by - 6)) / max(1, OY - (by - 6))
        half = 4.5 * (1 - k) + 0.6
        cx = OX + math.sin(k * 3.2 + t * 2.0) * 2.2 * k
        for x in range(int(cx - half - 1), int(cx + half + 2)):
            d = abs(x + 0.5 - cx) / max(0.6, half)
            n = fbm(x * 0.35, y * 0.35 - t * 1.6, 1)
            if d < 1 - 0.35 * n:
                b.set(x, y, smoke_col(0.25 + 0.55 * n * (1 - d) + 0.15 * (1 - k)))

    # --- brazo trasero
    shF = (OX + 5 * facing - (1 if facing == 1 else 0), by - 12)
    shB = (OX - 5 * facing - (1 if facing == -1 else 0), by - 12)

    def arm(sh, up, lo, side):
        hanging = math.cos(math.radians(up)) > 0.8 and math.cos(math.radians(lo)) > 0.8
        L1, L2 = (3, 2.5) if hanging else (4, 4)
        ex, ey = dirv(up, side)
        el = (sh[0] + ex * L1, sh[1] + ey * L1)
        ux, uy = dirv(lo, side)
        hd = (el[0] + ux * L2, el[1] + uy * L2)
        b.line(sh[0], sh[1], el[0], el[1], PAL['hood'])
        b.line(el[0], el[1], hd[0], hd[1], lambda tt: PAL['hood'] if tt < 0.5 else PAL['hoodL'])
        # mano de humo
        b.rect(round(hd[0] - 1), round(hd[1] - 1), 2, 2, PAL['smk3'])
        b.set(round(hd[0] - 1), round(hd[1] - 1), PAL['smk4'])
        return hd

    arm(shB, p.upB, p.loB, -facing)

    # --- torso: buzo con capucha, bolsillo canguro y la «L» verde de Goslint
    b.rect(OX - 4, by - 13, 8, 8, PAL['hood'])
    b.rect(OX - 5, by - 12, 10, 3, PAL['hood'])
    b.rect(OX + 3, by - 12, 1, 7, PAL['hoodD'])
    b.rect(OX + 4, by - 12, 1, 3, PAL['hoodD'])
    b.rect(OX - 3, by - 8, 6, 2, PAL['hoodD'])      # bolsillo
    b.rect(OX - 2, by - 12, 1, 3, PAL['green'])     # «L» de Goslint
    b.rect(OX - 2, by - 10, 3, 1, PAL['green'])
    b.set(OX - 1, by - 13, PAL['hoodL']); b.set(OX, by - 13, PAL['hoodL'])  # cordones
    b.set(OX - 1, by - 12, PAL['laptop']); b.set(OX + 1, by - 12, PAL['laptop'])

    # --- cabeza: nube de humo con borde irregular
    R = 9.0
    for y in range(hy - 13, hy + 9):
        for x in range(hx - 12, hx + 12):
            dx, dy = (x + 0.5 - hx) / R, (y + 0.5 - hy) / (R * 0.82)
            r = math.hypot(dx, dy)
            n = fbm(x * 0.28 + 5, y * 0.28 - t * 1.2, 2)
            edge = 1 + (n - 0.5) * 0.85
            if r < edge:
                core = max(0.0, 1 - r / edge)
                if core < 0.35 and fbm(x * 0.6, y * 0.6 - t * 2, 6) < 0.32:
                    continue  # huecos en el borde: el humo se deshilacha
                b.set(x, y, smoke_col(0.12 + 0.45 * n + 0.3 * (1 - core) * (y < hy + 2)))
    # una sola llama de humo arriba, que se mece de lado a lado con el tiempo
    sway = math.sin(t * 2.2)
    for i in range(34):
        k = i / 33                               # 0 = base (hundida en la cabeza), 1 = punta
        y = hy - 4 - k * 17
        cx = hx - 0.5 + sway * 3.2 * k ** 1.6 + math.sin(k * 4 + t * 3) * 0.6 * k
        # perfil cóncavo: nace ancho, siguiendo la curva de la cabeza, y se afina suave hacia la punta
        w = 0.5 + 7.5 * (1 - k) ** 2.4
        for xx in range(int(math.floor(cx - w)), int(math.ceil(cx + w)) + 1):
            d = abs(xx + 0.5 - cx) / w
            if d > 1:
                continue
            n = fbm(xx * 0.5, y * 0.5 - t * 1.5, 4)
            if k > 0.55 and n < 0.25 + 0.3 * (k - 0.55):
                continue                         # la punta se deshilacha
            b.set(xx, y, smoke_col(0.3 + 0.55 * k * (1 - d * 0.5) + 0.15 * n))
    # capucha: borde del buzo que envuelve la parte baja de la nube
    for x in range(hx - 8, hx + 8):
        yb = hy + 7 - int(abs(x + 0.5 - hx) / 8 * 4)
        b.set(x, yb, PAL['hoodL'])
        b.set(x, yb + 1, PAL['hood'])
    b.rect(hx - 9, hy + 1, 2, 7, PAL['hood']); b.rect(hx + 7, hy + 1, 2, 7, PAL['hoodD'])
    # rostro: zona más oscura donde «miran» los ojos
    for y in range(hy - 4, hy + 4):
        for x in range(hx - 6, hx + 6):
            if (x + 0.5 - hx) ** 2 / 36 + (y + 0.5 - hy) ** 2 / 14 < 1:
                b.set(x, y, PAL['face'] if (x + y) % 7 else PAL['smk0'])

    # ojos amarillos inclinados (mirada de concentración) con halo
    def eye(cx, side):
        e = p.eyes
        pts = []
        if e in ('open', 'angry'):
            # rendija afilada en V: baja hacia la nariz y sube hacia afuera (mirada intensa)
            pts = [(cx, hy), (cx + side, hy), (cx + 2 * side, hy - 1), (cx + 3 * side, hy - 1), 
                   (cx + side, hy - 1), (cx + 2 * side, hy - 2), (cx + 3 * side, hy - 2)]
        elif e == 'happy':
            pts = [(cx, hy), (cx + side, hy - 1), (cx + 2 * side, hy - 1), (cx + 3 * side, hy)]
        elif e == 'wide':
            pts = [(cx + i * side, hy - 2 + j) for i in range(3) for j in range(3)]
        elif e in ('blink', 'squint'):
            pts = [(cx + i * side, hy) for i in range(4)]
        for x, y in pts:  # brillo tenue solo debajo de la rendija
            if b.get(x, y + 1) in (PAL['face'], PAL['smk0'], PAL['smk1']):
                b.set(x, y + 1, PAL['glow'])
        for i, (x, y) in enumerate(pts):
            b.set(x, y, PAL['eyeHot'] if i in (0, 1, 5) and e in ('open', 'angry', 'wide') else PAL['eye'])
    eye(hx - 2, -1)
    eye(hx + 1, 1)

    # --- brazo delantero y accesorio
    hd = arm(shF, p.upF, p.loF, facing)
    hX, hY = round(hd[0]), round(hd[1])
    if p.prop == 'laptop':
        cx = hX - (2 if facing == 1 else 9)
        b.rect(cx, hY - 1, 11, 2, PAL['laptopD'])
        b.rect(cx + 1, hY - 8, 9, 7, PAL['laptop'])
        b.rect(cx + 2, hY - 7, 7, 5, PAL['screen'])
        b.rect(cx + 3, hY - 6, 3, 1, PAL['green']); b.rect(cx + 3, hY - 4, 5, 1, PAL['greenD'])
    elif p.prop == 'braces':
        # llaves de código hechas de humo flotando sobre la mano
        for i, (dx, dy) in enumerate([(0, -6), (-1, -5), (0, -4), (-1, -3), (0, -2)]):
            b.set(hX + dx - 2, hY + dy - 2, PAL['smk4'])
            b.set(hX - dx + 3, hY + dy - 2, PAL['smk4'])

    # partículas sueltas de humo alrededor (sin contorno, para que se vean etéreas)
    for i in range(10):
        a = h(i, 3, 9) * 6.283 + t * 0.7
        rr = 11 + h(i, 5, 2) * 5
        x = hx + math.cos(a) * rr
        y = hy - 2 + math.sin(a) * rr * 0.8 - ((t * 6 + i * 3) % 8)
        if b.get(round(x), round(y)) is None:
            puff.append((round(x), round(y), PAL['smk3'] if i % 3 else PAL['smk4']))

    # movimiento especial: se deshace en humo (los píxeles se dispersan hacia arriba)
    if p.burst > 0:
        nb = Buf()
        for y in range(SH):
            for x in range(SW):
                c = b.px[y][x]
                if c and h(x, y, 11) > p.burst * 0.95:
                    nb.set(x, y, c)
                elif c and h(x, y, 13) < 0.5:
                    off = p.burst * (6 + h(x, y, 17) * 10)
                    nb.set(x + (h(x, y, 19) - 0.5) * off, y - off, PAL['smk3'] if h(x, y, 23) > 0.5 else PAL['smk4'])
        b = nb

    b.outline(PAL['outline'])
    if not OUTLINE:  # variante sin contorno blanco: se borra el borde y se dejan los huecos rellenos
        for y in range(SH):
            for x in range(SW):
                if b.px[y][x] == PAL['outline'] and not ((x, y) in KEEP_WHITE):
                    b.px[y][x] = None
    for x, y, c in puff:
        b.set(x, y, c)
    return b


POSES = {
    'idle':     Pose(upF=14, loF=8, upB=14, loB=8),
    'type':     Pose(upF=70, loF=95, upB=70, loB=95, prop='laptop', eyes='open'),
    'point':    Pose(upF=90, loF=90, eyes='open'),
    'think':    Pose(upF=30, loF=-150, upB=40, loB=-55, eyes='squint'),
    'cheer':    Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', float_=-2),
    'wow':      Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide'),
    'braces':   Pose(upF=100, loF=150, eyes='open', prop='braces'),
    'shrug':    Pose(upF=70, loF=150, upB=70, loB=150, eyes='blink'),
}
