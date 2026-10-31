"""POLO · mascota pixel art de Goslint · guía de la Fase 2 (Programación básica)

Zorro ártico de peluche en postura cuadrúpeda, con una gorra con la «L» verde de Goslint.
Misma gramática que Lint, Vee y Marco: lienzo 72×64, pies en OY = 50, centro OX = 36, ~33 px de alto,
cabeza grande y cuerpo pequeño, patas delanteras de 2 px con arm(), paleta plana, SIN contorno blanco.

Cómo conserva la escala siendo cuadrúpedo:
  · el cuerpo es un óvalo corto y bajo; la cabeza va levantada sobre el pecho y fija la altura
    (cabeza + orejas + gorra: de y = 17 a y = 49, o sea 33 px, igual que Lint y Vee)
  · la cola esponjosa sube pegada al cuerpo para no ensanchar de más la silueta (29 px de ancho)

Uso:
    python3 mascotas/polo.py salida/polo
"""
from __future__ import annotations
import math, os, sys
from dataclasses import dataclass, replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _aqui)
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
from pixel import Buf, OX, OY, arm, fbm, rnd  # noqa: E402
from PIL import Image  # noqa: E402

PAL = {
    # pelaje de peluche (base #D6D6D6): luz, sombra y sombra profunda (patas del fondo)
    'fur': '#D6D6D6', 'furL': '#EEEEF0', 'furD': '#AEB0BA', 'furDD': '#8C8E9A',
    'ink': '#1C2027', 'pink': '#E9A8B4',                  # ojos y nariz · interior de orejas y mejillas
    'cap': '#33423B', 'capD': '#222C27',                   # gorra
    'green': '#00C063', 'greenD': '#00864A',               # guiño a Goslint: la «L» y el botón de la gorra
    'ice': '#A8E6FF', 'iceD': '#4FB3E6',                   # aliento gélido
}
# colores extra solo para accesorios y efectos (los mismos del kit)
EXTRA = {
    'laptop': '#C9D3DC', 'laptopD': '#7F8D99', 'screen': '#0A1A12',
    'hot': '#E2463E', 'hotL': '#F2C230',
}
C = {**PAL, **EXTRA}


@dataclass
class Pose:
    upF: float = 12; loF: float = 6      # pata delantera cercana (hace de brazo)
    upB: float = 12; loB: float = 6      # pata delantera lejana
    sy: int = 44                         # altura del hombro (más arriba para levantar la pata)
    sxo: int = 0                         # desplazamiento horizontal del hombro cercano
    eyes: str = 'sleepy'                 # sleepy · closed · happy · wide · wink
    mouth: str = 'smile'                 # smile · open · o · flat
    look: float = 0.0                    # 0 de frente · 1 con la cara girada hacia la derecha
    headDy: int = 0
    bodyDy: int = 0
    capDy: int = 0                       # la gorra se despega de la cabeza (sorpresa)
    puff: int = 0                        # mejillas infladas (toma aire)
    tail: float = 0.0                    # balanceo de la cola -1..1
    tailUp: float = 0.0                  # 0..1 cola más estirada hacia arriba
    prop: str | None = None              # laptop · bug
    fx: str | None = None                # zzz · bang · spark · think
    special: float = -1.0                # -1 sin movimiento especial · 0..1 avance


# ------------------------------------------------------------------ utilidades

def inside(x, y, cx, cy, rx, ry, n=2.0):
    return abs((x + 0.5 - cx) / rx) ** n + abs((y + 0.5 - cy) / ry) ** n <= 1


def shaded_ellipse(b: Buf, cx, cy, rx, ry, dx=1.3, dy=-1.1, light=True, n=2.0):
    """Elipse de peluche en 3 tonos planos: luz arriba-derecha, base, sombra abajo-izquierda."""
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            if not inside(x, y, cx, cy, rx, ry, n):
                continue
            if light and not inside(x, y, cx - dx, cy - dy, rx, ry, n):
                col = C['furL']
            elif not inside(x, y, cx + dx, cy + dy, rx, ry, n):
                col = C['furD']
            else:
                col = C['fur']
            b.set(x, y, col)


def glyph(b: Buf, x, y, rows, col):
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch == 'X':
                b.set(x + i, y + j, col)


Z_S = ['XXX', '..X', '.X.', 'XXX']
Z_B = ['XXXX', '...X', '..X.', '.X..', 'XXXX']
SPARK = ['.X.', 'XXX', '.X.']
INF = ['..XX...XX..',
       '.X..X.X..X.',
       'X....X....X',
       '.X..X.X..X.',
       '..XX...XX..']                         # ∞ (bucle infinito), 11×5
BUG = ['X.X', 'XXX', 'XXX', 'X.X']


def draw_tail(b: Buf, bx, bcy, p: Pose):
    """Cola esponjosa: círculos que engordan y se afinan, con la punta más clara."""
    N = 16
    lift = 10 + 4 * p.tailUp
    stamps = []
    for i in range(N + 1):
        k = i / N
        x = bx - 9 - 2.4 * math.sin(k * 1.55) + p.tail * 2.0 * k * k
        y = bcy - 1 - lift * k
        r = 1.8 + 1.9 * math.sin(math.pi * min(1, k * 1.05)) ** 0.7
        stamps.append((x, y, r, k))

    def cover(x, y, dx=0.0, dy=0.0):
        best = None
        for cx, cy, r, k in stamps:
            if (x + 0.5 - dx - cx) ** 2 + (y + 0.5 - dy - cy) ** 2 <= r * r:
                best = k if best is None else max(best, k)
        return best

    for y in range(int(bcy - lift - 8), int(bcy + 4)):
        for x in range(bx - 20, bx - 2):
            k = cover(x, y)
            if k is None:
                continue
            if k > 0.9:
                col = C['furL']
            elif cover(x, y, 1.2, -1.2) is None:
                col = C['furD']
            else:
                col = C['fur']
            b.set(x, y, col)


def fluff(b: Buf, oy=0, ymin=33, ymax=43, xmin=0, xmax=99):
    """Mechoncitos de peluche en el lomo (deterministas: dependen de la posición relativa al cuerpo)."""
    furs = {C['fur'], C['furL'], C['furD']}
    add = []
    for y in range(max(0, ymin + oy), min(b.h, ymax + oy)):
        for x in range(max(0, xmin), min(b.w, xmax)):
            if b.px[y][x] is not None:
                continue
            ns = [b.get(x + 1, y), b.get(x - 1, y), b.get(x, y - 1), b.get(x, y + 1)]
            fc = [c for c in ns if c in furs]
            if len(fc) == 1 and rnd(x, y - oy, 5) > 0.86:
                add.append((x, y, fc[0]))
    for x, y, c in add:
        b.px[y][x] = c


# ------------------------------------------------------------------ efectos

def draw_inf(b: Buf, x, y, s: float):
    """∞ = bucle infinito. Empieza al rojo vivo y se congela de izquierda a derecha, por donde llega el aliento."""
    W = len(INF[0])
    for j, row in enumerate(INF):
        for i, ch in enumerate(row):
            if ch != 'X':
                continue
            frozen = (i + 1) / W <= s + 1e-6
            b.set(x + i, y + j, C['ice'] if frozen else C['hot'])
    for i, dx in enumerate((2, 4, 6, 8)):          # llamitas de calor sobre lo que aún está caliente
        if (dx + 1) / W > s + 1e-6:
            b.set(x + dx, y - 1 - (i % 2), C['hotL'] if i % 2 else C['hot'])
    if s > 0.2:                                    # escarcha
        b.set(x + 5, y - 1, C['furL']); b.set(x + 1, y + 5, C['iceD']); b.set(x + 9, y + 5, C['iceD'])
    if s >= 1.0:
        b.set(x + 5, y + 2, C['furL']); b.set(x + 2, y + 1, C['furL']); b.set(x + 8, y + 3, C['furL'])


def draw_breath(b: Buf, mx, my, tx, ty, reach: float):
    """Aliento gélido: nube de bolitas de hielo que sale del hocico y avanza hacia (tx, ty)."""
    if reach < 0.12:
        return
    n = 5 + int(10 * reach)
    blobs = []
    for i in range(n):
        k = i / max(1, n - 1) * reach
        x = mx + (tx - mx) * k + (rnd(i, 1, 4) - 0.5) * 2.2
        y = my + (ty - my) * k + (rnd(i, 2, 4) - 0.5) * 3.4
        r = 1.2 + 2.6 * k + rnd(i, 3, 4) * 1.3
        blobs.append((x, y, r))
    for y in range(int(my - 12), int(my + 8)):
        for x in range(int(mx - 2), int(mx + 22)):
            d = min(math.hypot(x + 0.5 - bx, y + 0.5 - by) / br for bx, by, br in blobs)
            if d <= 1.0:
                col = C['furL'] if d < 0.40 else (C['ice'] if d < 0.78 else C['iceD'])
                b.set(x, y, col)
    for j in range(7):                              # copitos sueltos
        ang = rnd(j, 5, 4) * 6.283
        rr = 4 + rnd(j, 6, 4) * 5 * (0.4 + reach)
        px, py = mx + (tx - mx) * reach * 0.8 + math.cos(ang) * rr, my + (ty - my) * reach * 0.8 + math.sin(ang) * rr
        if b.get(round(px), round(py)) is None:
            b.set(px, py, C['furL'] if j % 2 else C['ice'])


def draw_fx(b: Buf, p: Pose, hx, hy, cx, cy):
    if p.fx == 'think':
        b.set(hx + 9, hy - 1, C['furL'])
        b.rect(hx + 10, hy - 5, 2, 2, C['furL'])
        glyph(b, hx + 10, hy - 13, ['.XXXXX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.'], C['furL'])
        for dx in (12, 14, 16):
            b.set(hx + dx - 1, hy - 11, C['ink'])
    elif p.fx == 'spark':
        for (dx, dy) in ((-12, -6), (12, -9), (14, 0)):
            glyph(b, hx + dx - 1, hy + dy - 1, SPARK, C['ice'])
            b.set(hx + dx, hy + dy, C['furL'])
    elif p.fx == 'bang':
        b.rect(hx + 11, hy - 12, 1, 4, C['hotL']); b.set(hx + 11, hy - 7, C['hotL'])
        b.rect(hx - 12, hy - 11, 1, 3, C['hotL']); b.set(hx - 12, hy - 7, C['hotL'])
    elif p.fx == 'zzz':
        glyph(b, hx + 11, hy - 9, Z_S, C['ice'])
        glyph(b, hx + 14, hy - 16, Z_B, C['furL'])


# ------------------------------------------------------------------ el dibujo

def draw(p: Pose, facing: int = 1) -> Buf:
    b = Buf()
    G = OY
    by = p.bodyDy
    bx, bcy = OX - 1, G - 10.6 + by               # centro del cuerpo
    hx, hy = OX + 4, G - 23 + by + p.headDy       # centro de la cabeza
    sxN = hx + 3 + p.sxo                          # hombro cercano: siempre DENTRO del torso
    sy = p.sy + by

    # --- patas de pie: 3 px de ancho, nacen DENTRO del cuerpo (se dibujan antes que él) y llegan al suelo
    def leg(x, col, shade, paw, toe=False, w=3):
        top = int(bcy) + 1
        b.rect(x, top, w, G - top, col)
        if w > 2:
            b.rect(x, top, 1, G - top, shade)
        b.rect(x, G - 1, w, 1, paw)                # patita más clara
        if toe:
            b.set(x + w, G - 1, paw)

    hanging = math.cos(math.radians(p.upF)) > 0.8 and math.cos(math.radians(p.loF)) > 0.8
    leg(bx - 3, C['furDD'], C['furDD'], C['furD'], w=2)        # trasera lejana
    leg(bx + 1, C['fur'], C['furD'], C['furL'], toe=True)      # delantera izquierda: de frente, igual que la cercana
    leg(bx - 8, C['fur'], C['furD'], C['furL'], toe=True)      # trasera cercana (bien separada de la lejana)
    if hanging:
        leg(hx + 1, C['fur'], C['furD'], C['furL'], toe=True)  # delantera cercana (si no, hace de brazo)

    # --- cola
    draw_tail(b, bx, bcy, p)

    # --- cuerpo (óvalo corto) + pata trasera cercana
    shaded_ellipse(b, bx, bcy, 8.6, 5.5, n=2.4)
    fluff(b, oy=by, xmin=bx - 8, xmax=hx - 7)
    for (dx, dy) in ((-4, 1), (1, -3), (4, 2)):   # vetas de pelo (textura de peluche)
        b.set(bx + dx, bcy + dy, C['furD']); b.set(bx + dx + 1, bcy + dy + 1, C['furD']); b.set(bx + dx + 2, bcy + dy, C['furD'])

    # --- pecho esponjoso (une la cabeza con el cuerpo)
    shaded_ellipse(b, hx - 1, hy + 8.2, 6.0, 4.4, light=False)

    # --- cabeza
    shaded_ellipse(b, hx, hy, 7.6, 7.0)
    # mejillas esponjosas: la cabeza se ensancha un píxel abajo
    pf = p.puff
    for sgn, col in ((-1, C['furD']), (1, C['fur'])):
        xe = hx - 8 - pf if sgn == -1 else hx + 7 + pf
        b.rect(xe, hy + 2 - pf, 1, 3 + pf, col)
        b.set(xe + (-1 if sgn == -1 else 1), hy + 5, col)
        if pf:
            b.rect(xe + (1 if sgn == -1 else -1), hy + 2 - pf, 1, 3 + pf, col)

    # --- orejas (asoman a los lados de la gorra)
    for sgn in (-1, 1):
        ex = hx + sgn * 6.7
        b.ellipse(ex, hy - 6.7, 2.5, 3.3, C['fur'])
        b.ellipse(ex, hy - 6.3, 1.2, 2.0, C['pink'])

    # --- cara
    fx = hx + round(3 * p.look)
    ey = hy + 1
    lx = fx - 4 + (1 if p.look > 0.5 else 0)
    rx_ = fx + 2
    b.ellipse(fx, hy + 4.2, 3.6, 2.4, C['furL'])  # hocico corto
    b.rect(fx - 6 + (1 if p.look > 0.5 else 0), hy + 3, 2, 1, C['pink'])
    b.rect(min(fx + 4, hx + 5), hy + 3, 2, 1, C['pink'])

    def eye(x, which):
        e = p.eyes
        if e == 'wink':
            e = 'closed' if which else 'sleepy'
        if e == 'sleepy':
            b.rect(x - 1, ey - 1, 4, 1, C['furD'])    # párpado
            b.rect(x, ey, 2, 1, C['ink'])
        elif e == 'closed':
            b.rect(x - 1, ey, 4, 1, C['ink'])
        elif e == 'happy':
            b.set(x - 1, ey + 1, C['ink']); b.rect(x, ey, 2, 1, C['ink']); b.set(x + 2, ey + 1, C['ink'])
        elif e == 'wide':
            b.rect(x, ey - 1, 2, 3, C['ink']); b.set(x, ey - 1, '#FFFFFF')
    eye(lx, 0)
    eye(rx_, 1)
    nz = 1 if p.look > 0.5 else 0
    b.rect(fx - 1 + nz, hy + 3, 2, 1, C['ink'])  # nariz
    mx, my = fx - 1 + nz, hy + 5
    if p.mouth == 'smile':
        b.set(mx - 1, my, C['furDD']); b.set(mx + 2, my, C['furDD']); b.rect(mx, my + 1, 2, 1, C['furDD'])
    elif p.mouth in ('open', 'o'):
        b.rect(mx, my, 2, 2, C['ink'])
    else:
        b.rect(mx, my, 2, 1, C['furDD'])

    # --- gorra con la «L» de Goslint
    cx = hx + round(1.5 * p.look)
    cy = hy - 4 + p.capDy
    for y in range(cy - 8, cy):
        for x in range(cx - 9, cx + 9):
            if inside(x, y, cx, cy, 7.2, 5.4):
                b.set(x, y, C['cap'])
    b.rect(cx - 7, cy, 14, 1, C['capD'])          # banda
    b.rect(cx - 4, cy + 1, 9, 1, C['capD'])       # visera
    b.rect(cx - 1, cy - 4, 1, 4, C['green'])      # «L»
    b.rect(cx - 1, cy - 1, 4, 1, C['green'])
    b.rect(cx - 1, cy - 6, 2, 1, C['greenD'])     # botón
    if p.prop == 'bug':                           # un bug paseando por la gorra... y Polo ni se entera
        glyph(b, cx + 2, cy - 6, BUG, C['hot'])
        b.set(cx + 3, cy - 5, C['hotL'])

    # --- accesorio: portátil en el suelo, a la derecha
    if p.prop == 'laptop':
        lxp = hx + 4
        b.rect(lxp, G - 2, 11, 2, C['laptopD'])
        b.rect(lxp + 1, G - 10, 9, 8, C['laptop'])
        b.rect(lxp + 2, G - 9, 7, 6, C['screen'])
        b.rect(lxp + 3, G - 8, 3, 1, C['green']); b.rect(lxp + 3, G - 6, 5, 1, C['greenD'])
        b.rect(lxp + 3, G - 4, 2, 1, C['green'])

    # --- pata delantera cercana (encima de todo)
    hd = (sxN, sy)
    if not hanging:
        hd = arm(b, (sxN, sy), p.upF, p.loF, 1, C['furD'], C['fur'], C['furL'])
        if hd[1] < G - 4:                         # almohadilla rosa si la pata está en el aire
            b.set(round(hd[0]), round(hd[1]), C['pink'])

    b.fill_holes(C['furDD'])                      # huecos internos del peluche (antes de los efectos)

    # --- movimiento especial: aliento gélido que congela el bucle infinito
    if p.special >= 0:
        sp = p.special
        ix, iy = fx + 8, hy - 9
        draw_breath(b, fx + 4, hy + 5.5, ix + 5, iy + 8, min(1.0, sp * 1.15))
        draw_inf(b, ix, iy, sp)                   # el ∞ va encima de la nube, para que se vea
        if sp >= 0.5:
            for (dx, dy, col) in ((12, 2, C['ice']), (11, 14, C['furL'])):
                glyph(b, ix + dx - 1, iy + dy - 1, SPARK, col)

    draw_fx(b, p, hx, hy, cx, cy)
    return b


# ------------------------------------------------------------------ poses de la hoja

POSES = {
    'idle':    Pose(),
    'wave':    Pose(sy=39, sxo=0, upF=100, loF=160, eyes='happy', mouth='smile', tail=0.8),
    'point':   Pose(sy=40, sxo=0, upF=100, loF=95, look=1.0, mouth='flat'),
    'think':   Pose(mouth='flat', headDy=1, fx='think'),
    'prog':    Pose(look=1.0, prop='laptop'),
    'cheer':   Pose(eyes='happy', mouth='open', bodyDy=-1,
                    tailUp=1.0, tail=1.0, fx='spark'),
    'wow':     Pose(eyes='wide', mouth='o', bodyDy=-1, capDy=-3, tailUp=1.0, fx='bang'),
    'tranqui': Pose(eyes='closed', mouth='smile', headDy=1, prop='bug', fx='zzz'),
}

IDLE = [  # 4 tiempos: respira (el cuerpo sube y baja 1 px), la cola se mece y parpadea lento
    Pose(bodyDy=0, tail=-1.0),
    Pose(bodyDy=-1, tail=0.0),
    Pose(bodyDy=0, tail=1.0, eyes='closed'),
    Pose(bodyDy=1, tail=0.0),
]

ESPECIAL = [  # 3 fotogramas: toma aire · sopla · el bucle queda congelado
    Pose(special=0.0, look=1.0, eyes='closed', mouth='flat', puff=1, bodyDy=-1, tailUp=0.5),
    Pose(special=0.5, look=1.0, eyes='closed', mouth='o', tailUp=0.3),
    Pose(special=1.0, look=1.0, eyes='happy', mouth='smile', tail=0.5),
]


def _union_bbox(bufs):
    boxes = [b.image().getbbox() for b in bufs]
    return (min(x[0] for x in boxes), min(x[1] for x in boxes), max(x[2] for x in boxes), max(x[3] for x in boxes))


def exportar(carpeta: str):
    os.makedirs(carpeta, exist_ok=True)
    for n, p in POSES.items():
        draw(p).sprite().save(f'{carpeta}/p_{n}.png')
    for nombre, grupo in (('anim', IDLE), ('esp', ESPECIAL)):
        bufs = [draw(p) for p in grupo]
        box = _union_bbox(bufs)               # mismo recorte en todos: Polo no «salta» entre fotogramas
        for i, bf in enumerate(bufs):
            bf.image().crop(box).save(f'{carpeta}/p_{nombre}{i}.png')
    print('sprites en', carpeta)


if __name__ == '__main__':
    exportar(sys.argv[1] if len(sys.argv) > 1 else 'salida/polo')
