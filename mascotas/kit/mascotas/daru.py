"""DaRu · mascota de Goslint (arquetipo «Master Hacker»). Fase del roadmap: sin decidir.

Una entidad digital que se puso la apariencia de un programador: la cabeza está hecha de columnas
de código verde que caen por dentro de su silueta, con dos ojos luminosos y una boca pixelada muy
expresiva. Viste traje carbón, camisa blanca, corbata roja y una «L» verde en la solapa.
Personalidad (inspiración conceptual: un hacker brillante, informal y bromista): se proclama
«súper hacker», hace chistes técnicos, exagera sus reacciones y siempre acaba resolviendo el bug.

Se construye con el motor del kit (motor/pixel.py) a partir de motor/plantilla_mascota.py:
lienzo 72×64, pies en OY = 50, centro OX = 36, cabeza de 14 × 14, torso de 10 px en los hombros,
brazos de 2 px con arm(), sin contorno blanco (luz de contorno solo en el traje) y todo determinista:
la lluvia de código depende de `t` y el movimiento especial de `special`.

    python3 mascotas/daru.py salida/daru
"""
from __future__ import annotations
import math, os, sys
from dataclasses import dataclass, replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _aqui)
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
from pixel import Buf, OX, OY, arm, rnd

# paleta: 12 colores
PAL = {
    'code0': '#0B2418',   # fondo de la cabeza y cuencas de los ojos
    'greenD': '#00864A',  # código apagado
    'green': '#00C063',   # verde Goslint
    'glow': '#7CFFB3',    # ojos, boca y código encendido
    'white': '#FFFFFF',   # camisa y brillos
    'suit': '#3A3A46',    # traje
    'suitD': '#24242C',   # sombra del traje y zapatos
    'suitL': '#6A6A7A',   # luz de contorno del traje
    'red': '#D62B2B', 'redD': '#93191C',  # corbata
    'skin': '#E7B08A', 'skinD': '#C88B68',  # manos
}

RIM = True


@dataclass
class Pose:
    upF: float = 12; loF: float = 6; upB: float = 12; loB: float = 6   # brazos (ver dirv en pixel.py)
    eyes: str = 'open'      # open · happy · wide · half · focus · wink · closed
    brows: str = 'smug'     # smug · up · focus · worried · none
    mouth: str = 'smirk'    # smirk · smile · grin · o · flat · frown
    hand: str = 'fist'      # mano delantera: fist · open · point · thumb
    headDy: int = 0
    bodyDy: int = 0
    t: float = 0.0          # tiempo de la lluvia de código (ciclo de 4)
    bits: int = 4           # caracteres que flotan alrededor de la cabeza
    prop: str | None = None # laptop · code · dots
    special: float = 0.0    # 0..1 · «Compilando la solución»
    shine: int = 0          # 0/1: el brillo de los ojos cambia de lado (mirada viva)


# ---------------------------------------------------------------- cabeza de código

def _head_mask(x, y, hx, hy):
    """Cabeza cuadrada de 14 × 14 con esquinas recortadas (x: hx-7..hx+6, y: hy-8..hy+5)."""
    if not (hx - 7 <= x <= hx + 6 and hy - 8 <= y <= hy + 5):
        return False
    dx = min(x - (hx - 7), (hx + 6) - x)
    dy = min(y - (hy - 8), (hy + 5) - y)
    return not ((dx == 0 and dy <= 1) or (dx == 1 and dy == 0))


def _face_mask(x, y, hx, hy):
    """Zona oscura del rostro: un óvalo irregular, no una pantalla rectangular."""
    ex, ey = (x + 0.5 - (hx - 0.5)) / 6.1, (y + 0.5 - (hy - 0.8)) / 5.0
    return ex * ex + ey * ey < 1.0 + 0.25 * (rnd(x, y, 5) - 0.5)


def _glyph(x, k):
    """Color del carácter número k de la columna x: caracteres de 2 px separados por 1 px de hueco."""
    if k % 3 == 2:
        return None
    v = rnd(x, k // 3, 7)
    return PAL['glow'] if v > 0.88 else PAL['green'] if v > 0.42 else PAL['greenD']


def draw_head(b: Buf, p: Pose, hx, hy):
    phase = int(round(p.t)) % 4
    for x in range(hx - 7, hx + 7):
        speed = 1 + int(rnd(x, 1, 3) * 2)           # cada columna cae a su ritmo
        edge_x = x in (hx - 7, hx + 6)
        for y in range(hy - 9, hy + 6):
            if y == hy - 9:
                # puntas de algunas columnas asoman por arriba: la silueta tiene «pelo» de código
                if x in (hx - 5, hx - 1, hx + 3):
                    b.set(x, y, PAL['green'])
                continue
            if not _head_mask(x, y, hx, hy):
                continue
            g = _glyph(x, y - hy + 30 - phase * speed * 3 // 2)
            if (x - hx) % 2 == 0:                    # columna con caracteres
                c = g or PAL['code0']
            else:                                    # hueco entre columnas
                c = PAL['greenD'] if g == PAL['glow'] else PAL['code0']
            if edge_x or y in (hy - 8, hy + 5):     # el borde siempre se lee contra el negro
                c = c if c in (PAL['green'], PAL['glow']) else PAL['greenD'] if (x + y) % 3 else PAL['green']
            b.set(x, y, c)
    # rasgos en un búfer aparte: alrededor de ellos se deja 1 px de aire oscuro
    f = Buf()
    draw_face(f, p, hx, hy)
    near = lambda x, y: any(f.get(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1))
    for y in range(hy - 7, hy + 5):
        for x in range(hx - 6, hx + 6):
            if _head_mask(x, y, hx, hy) and _face_mask(x, y, hx, hy):
                c = PAL['code0']
                # el código sigue cayendo por la cara, más apagado: es una cabeza de código, no una pantalla
                if (x - hx) % 2 == 0 and not near(x, y):
                    g = _glyph(x, y - hy + 30 - phase * (1 + int(rnd(x, 1, 3) * 2)) * 3 // 2)
                    c = PAL['greenD'] if g in (PAL['green'], PAL['glow']) or (g and rnd(x, y, 4) > 0.5) else PAL['code0']
                b.set(x, y, c)
    merge(b, f)


def draw_face(b: Buf, p: Pose, hx, hy):
    G, W, D = PAL['glow'], PAL['white'], PAL['code0']
    ey = hy - 2

    def eye(x, which):          # which: 0 izquierda, 1 derecha (en pantalla)
        e = p.eyes
        if e == 'wink':
            e = 'closed' if which else 'open'
        sx = x + ((1 - which) if p.shine else which)   # brillo: lado exterior, o interior si shine
        if e == 'open':
            b.rect(x, ey, 2, 2, G); b.set(sx, ey, W)
        elif e == 'focus':      # párpado bajado: mirada concentrada
            b.rect(x, ey + 1, 2, 1, G); b.set(sx, ey + 1, W)
            b.rect(x, ey, 2, 1, PAL['greenD'])
        elif e == 'half':
            b.rect(x, ey + 1, 2, 1, G)
        elif e == 'wide':
            b.rect(x, ey - 1, 2, 3, G); b.set(sx, ey - 1, W)
        elif e == 'happy':      # arco ^
            b.set(x - 1, ey + 1, G); b.rect(x, ey, 2, 1, G); b.set(x + 2, ey + 1, G)
        else:                   # closed: línea recta corta (el guiño nunca borra el ojo)
            b.rect(x - (1 - which), ey + 1, 3, 1, G)

    eye(hx - 4, 0)
    eye(hx + 2, 1)

    # cejas de código: dan casi toda la actitud
    by_ = ey - 3                # fila de cejas (con un píxel de aire sobre el ojo)
    if p.brows == 'smug':       # una ceja arqueada, la otra tranquila: «sé algo que tú no»
        b.rect(hx - 5, by_ + 1, 3, 1, PAL['green'])
        b.set(hx + 2, by_ + 1, PAL['green']); b.set(hx + 3, by_, PAL['green']); b.set(hx + 4, by_, PAL['green'])
    elif p.brows == 'focus':    # inclinadas hacia el centro: determinación
        b.set(hx - 5, by_, PAL['green']); b.set(hx - 4, by_ + 1, PAL['green']); b.set(hx - 3, by_ + 1, PAL['green'])
        b.set(hx + 4, by_, PAL['green']); b.set(hx + 3, by_ + 1, PAL['green']); b.set(hx + 2, by_ + 1, PAL['green'])
    elif p.brows == 'up':       # sorpresa / alegría
        b.rect(hx - 5, by_, 3, 1, PAL['green']); b.rect(hx + 2, by_, 3, 1, PAL['green'])
        if p.eyes == 'wide':
            b.rect(hx - 5, by_ - 1, 3, 1, PAL['green']); b.rect(hx + 2, by_ - 1, 3, 1, PAL['green'])
            b.rect(hx - 5, by_, 3, 1, D); b.rect(hx + 2, by_, 3, 1, D)
    elif p.brows == 'worried':  # hacia arriba en el centro: frustración
        b.set(hx - 5, by_ + 1, PAL['green']); b.set(hx - 4, by_, PAL['green']); b.set(hx - 3, by_, PAL['green'])
        b.set(hx + 4, by_ + 1, PAL['green']); b.set(hx + 3, by_, PAL['green']); b.set(hx + 2, by_, PAL['green'])

    mx, my = hx - 2, hy + 2
    m = p.mouth
    if m == 'smirk':            # media sonrisa ladeada
        b.rect(mx, my + 1, 3, 1, G); b.set(mx + 3, my, G)
    elif m == 'smile':
        b.set(mx - 1, my, G); b.rect(mx, my + 1, 4, 1, G); b.set(mx + 4, my, G)
    elif m == 'grin':           # sonrisa abierta con dientes
        b.rect(mx - 1, my, 6, 1, W); b.rect(mx, my + 1, 4, 1, G)
    elif m == 'o':
        b.rect(mx + 1, my, 2, 1, G); b.set(mx, my + 1, G); b.set(mx + 3, my + 1, G); b.rect(mx + 1, my + 2, 2, 1, G)
    elif m == 'frown':
        b.set(mx - 1, my + 1, G); b.rect(mx, my, 4, 1, G); b.set(mx + 4, my + 1, G)
    else:                       # flat
        b.rect(mx, my + 1, 4, 1, G)


def draw_bits(b: Buf, p: Pose, hx, hy, spread=0):
    """Caracteres que flotan cerca de la cabeza: gotas verticales de 1 × 2 / 1 × 3 (como lluvia de código).
    Su posición es cíclica en t (periodo 4), así el ciclo de reposo cierra sin saltos."""
    spots = [(-10, -6, 3), (9, -3, 2), (-9, 2, 2), (10, -9, 2), (-12, -10, 2), (12, 1, 2)]
    phase = p.t % 4
    for i, (dx, dy, ln) in enumerate(spots[:p.bits]):
        x = hx + dx + (spread * (1 if dx > 0 else -1))
        y0 = hy + dy - int((phase + i) % 4 * 0.5) - spread
        for k in range(ln):
            c = PAL['glow'] if k == ln - 1 else PAL['greenD'] if k == 0 else PAL['green']
            if b.get(x, y0 + k) is None:
                b.set(x, y0 + k, c)


# ---------------------------------------------------------------- cuerpo

def draw_hand(b: Buf, hd, kind, side, up=False):
    hx_, hy_ = round(hd[0] - 1), round(hd[1] - 1)
    b.rect(hx_, hy_, 2, 2, PAL['skin'])
    b.set(hx_ + (0 if side == 1 else 1), hy_ + 1, PAL['skinD'])
    if kind == 'point':                         # índice estirado
        b.set(hx_ + (2 if side == 1 else -1), hy_, PAL['skin'])
    elif kind == 'thumb':                       # pulgar arriba
        b.set(hx_ + (1 if side == 1 else 0), hy_ - 1, PAL['skin'])
        b.set(hx_ + (1 if side == 1 else 0), hy_ - 2, PAL['skin'])
    elif kind == 'open':                        # palma abierta: dedos separados
        b.set(hx_ - 1 if side == 1 else hx_ + 2, hy_, PAL['skin'])
        b.set(hx_ + (1 if side == 1 else 0), hy_ - 1, PAL['skin'])


def draw_body(p: Pose, facing=1) -> tuple[Buf, tuple]:
    """Traje, camisa, corbata y manos, en su propio búfer: así fill_holes() y rim_light() actúan solo
    sobre el traje y no tocan la cabeza de código ni el cuello blanco."""
    b = Buf()
    by = OY + p.bodyDy
    shF = (OX + 5 * facing - (1 if facing == 1 else 0), by - 12)
    shB = (OX - 5 * facing - (1 if facing == -1 else 0), by - 12)

    hb = arm(b, shB, p.upB, p.loB, -facing, PAL['suitD'], PAL['suitD'], PAL['suitD'])

    # piernas cortas y zapatos (fijas en OY: la respiración no mueve los pies)
    for x in (OX - 4, OX + 1):
        b.rect(x, OY - 5, 3, 4, PAL['suit'])
        b.rect(x + (2 if x > OX else 0), OY - 5, 1, 4, PAL['suitD'])
        b.rect(x - (1 if x < OX else 0), OY - 1, 4, 1, PAL['suitD'])
    b.rect(OX - 4, by - 6, 8, 2, PAL['suit'])

    # chaqueta (10 px en los hombros, 8 de alto)
    b.rect(OX - 4, by - 14, 8, 8, PAL['suit'])
    b.rect(OX - 5, by - 12, 10, 3, PAL['suit'])
    b.rect(OX + 3, by - 12, 1, 6, PAL['suitD'])

    fa = Buf()                                   # brazo delantero aparte: va encima de la camisa
    hd = arm(fa, shF, p.upF, p.loF, facing, PAL['suit'], PAL['suit'], PAL['suit'])
    merge(b, fa)
    b.fill_holes(PAL['suitD'])
    if RIM:
        b.rim_light(PAL['suitL'], (1, -1))

    def put(x, y, c):                            # detalle del pecho, solo si no lo tapa el brazo
        if fa.get(x, y) is None:
            b.set(x, y, c)
    # cuello: una columna de código que une la cabeza con el traje
    for x in range(OX - 2, OX + 2):
        put(x, by - 16, PAL['code0']); put(x, by - 15, PAL['greenD'] if x % 2 == 0 else PAL['code0'])
    # camisa en V, cuello blanco y corbata roja
    for x in range(OX - 3, OX + 3):
        put(x, by - 14, PAL['white'])
    put(OX - 3, by - 15, PAL['white']); put(OX + 2, by - 15, PAL['white'])     # puntas del cuello
    for x in range(OX - 2, OX + 2):
        put(x, by - 13, PAL['white']); put(x, by - 12, PAL['white'])
    put(OX - 1, by - 11, PAL['white']); put(OX, by - 11, PAL['white'])
    put(OX - 1, by - 14, PAL['redD']); put(OX, by - 14, PAL['redD'])           # nudo
    for y in range(by - 13, by - 9):
        put(OX - 1, y, PAL['red']); put(OX, y, PAL['red'] if y != by - 12 else PAL['redD'])
    put(OX - 1, by - 9, PAL['red'])                                             # punta
    put(OX - 3, by - 12, PAL['suitL']); put(OX + 2, by - 12, PAL['suitL'])     # solapas
    put(OX - 1, by - 7, PAL['suitD'])                                           # botón
    # la «L» de Goslint en la solapa
    for y in range(by - 10, by - 7):
        put(OX + 1, y, PAL['green'])
    put(OX + 2, by - 8, PAL['green'])
    # punteras con brillo
    put(OX - 5, OY - 1, PAL['suitL']); put(OX + 4, OY - 1, PAL['suitL'])

    # manos (encima de la luz de contorno, para conservar el tono de piel)
    draw_hand(b, hb, 'fist', -facing)
    draw_hand(b, hd, p.hand, facing)
    return b, hd


def merge(dst: Buf, src: Buf):
    for y in range(src.h):
        for x in range(src.w):
            if src.px[y][x]:
                dst.px[y][x] = src.px[y][x]


# ---------------------------------------------------------------- accesorios y movimiento especial

def draw_window(b: Buf, x, y):
    """Ventanita de código flotante (pose «señalar»): marco verde y líneas de distinta longitud."""
    b.rect(x, y, 10, 8, PAL['code0'])
    for i in range(10):
        b.set(x + i, y, PAL['green']); b.set(x + i, y + 7, PAL['greenD'])
    for j in range(8):
        b.set(x, y + j, PAL['green']); b.set(x + 9, y + j, PAL['greenD'])
    for j, (ind, ln) in enumerate([(0, 5), (2, 4), (2, 3)]):
        b.rect(x + 2 + ind, y + 2 + j * 2 - (1 if j else 0) * 0, ln, 1, PAL['glow'] if j == 0 else PAL['green'])


def draw_laptop(b: Buf, hd):
    """Portátil oscuro, de perfil a tres cuartos, con la «L» verde en la tapa."""
    x, y = round(hd[0]) - 2, round(hd[1])
    b.rect(x, y - 1, 11, 2, PAL['suitL'])          # base
    b.rect(x, y, 11, 1, PAL['suitD'])
    b.rect(x + 2, y - 8, 9, 7, PAL['suitD'])       # pantalla vista desde el teclado
    b.rect(x + 3, y - 7, 7, 5, PAL['code0'])
    b.rect(x + 4, y - 6, 3, 1, PAL['glow'])
    b.rect(x + 5, y - 4, 4, 1, PAL['green'])
    b.rect(x + 4, y - 5, 1, 1, PAL['greenD'])


def _smooth(a, b_, s):
    k = max(0.0, min(1.0, (s - a) / (b_ - a)))
    return k * k * (3 - 2 * k)


# geometría del símbolo final: marco de 11 × 11 con una marca de verificación
CHK_X, CHK_W = 11, 11   # relativo a OX
CHK_Y = -33             # relativo a by


def _targets():
    """Píxeles finales (marco + marca) y su orden. Cada píxel tiene tres estados:
    disperso (s = 0), línea de código (s = 0.5) y símbolo (s = 1)."""
    fin = []
    W = CHK_W
    for i in range(W):
        fin.append((i, 0)); fin.append((i, W - 1))
    for j in range(1, W - 1):
        fin.append((0, j)); fin.append((W - 1, j))
    check = [(2, 5), (3, 6), (4, 7), (5, 6), (6, 5), (7, 4), (8, 3), (3, 5), (4, 6), (5, 5), (6, 4), (7, 3)]
    n_frame = len(fin)
    fin += check
    # estado intermedio: el mismo número de píxeles ordenados como un bloque de código indentado
    lines = []
    lens = [(0, 10), (2, 8), (2, 9), (4, 6), (2, 9), (0, 10)]   # 52 px, igual que marco + marca
    for row, (ind, ln) in enumerate(lens):
        for k in range(ln):
            lines.append((ind + k, row * 2))
    while len(lines) < len(fin):
        lines.append(lines[len(lines) % len(lens)])
    lines = lines[:len(fin)]
    return fin, lines, n_frame


def draw_special(b: Buf, p: Pose, hd, by):
    s = p.special
    fin, lines, n_frame = _targets()
    bx, byy = OX + CHK_X, by + CHK_Y
    k1 = _smooth(0.0, 0.5, s)     # invocar → organizar
    k2 = _smooth(0.5, 1.0, s)     # organizar → resolver
    hx_, hy_ = hd
    for i, ((fx, fy), (lx, ly)) in enumerate(zip(fin, lines)):
        # posición dispersa: fragmentos de 3 px alrededor de la mano, deterministas
        frag = i // 3
        ang = rnd(frag, 1, 21) * 2.6 - 2.1           # abanico hacia arriba y a la derecha
        rad = 4 + rnd(frag, 2, 22) * 9
        sx = hx_ + math.cos(ang) * rad + (i % 3)
        sy = hy_ - 4 + math.sin(ang) * rad * 0.8
        x = sx + (bx + lx - sx) * k1
        y = sy + (byy + ly - sy) * k1
        x += (bx + fx - (bx + lx)) * k2
        y += (byy + fy - (byy + ly)) * k2
        if s < 0.25:
            c = PAL['green'] if i % 3 == 2 else PAL['greenD']
        elif s < 0.75:
            c = PAL['glow'] if i % 7 == 0 else PAL['green'] if (i // 4) % 2 else PAL['greenD']
        else:
            c = PAL['glow'] if i >= n_frame else PAL['green']
        b.set(round(x), round(y), c)
    if s >= 0.75:               # destellos discretos en las esquinas del símbolo
        for cx, cy in ((-2, -2), (CHK_W + 1, -2), (CHK_W + 1, CHK_W + 1), (-2, CHK_W + 1)):
            b.set(bx + cx, byy + cy, PAL['glow'])
    if s < 0.25:                # la mano «convoca»: chispas pegadas a la palma
        for dx, dy in ((2, -2), (0, -3), (3, 0)):
            b.set(round(hx_) + dx, round(hy_) + dy, PAL['glow'])


# ---------------------------------------------------------------- personaje completo

def draw(p: Pose, facing: int = 1) -> Buf:
    by = OY + p.bodyDy
    hx, hy = OX, by - 22 + p.headDy
    b = Buf()
    draw_head(b, p, hx, hy)
    body, hd = draw_body(p, facing)
    merge(b, body)                  # el cuerpo va encima: un brazo levantado pasa por delante de la cara
    b.fill_holes(PAL['suitD'])      # hueco entre brazo levantado, hombro y cabeza
    draw_bits(b, p, hx, hy, spread=1 if p.eyes == 'wide' else 0)

    if p.prop == 'laptop':
        draw_laptop(b, hd)
        draw_hand(b, hd, 'fist', facing)        # la mano queda sobre el teclado
    elif p.prop == 'code':
        draw_window(b, round(hd[0]) + 3, round(hd[1]) - 10)
    elif p.prop == 'spark':     # destello de «¡listo!» junto al pulgar
        x, y = round(hd[0]) + 4, round(hd[1]) - 4
        for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)):
            b.set(x + dx, y + dy, PAL['glow'] if (dx, dy) == (0, 0) else PAL['green'])
    elif p.prop == 'dots':                      # tres puntos de «pensando…» que suben
        for i in range(3):
            b.set(hx + 8 + i * 2, hy - 9 - i * 2, PAL['green'] if i < 2 else PAL['glow'])
    if p.special > 0:
        draw_special(b, p, hd, by)
    return b


# ---------------------------------------------------------------- poses y exportación

POSES = {
    'idle':  Pose(upF=8, loF=4, upB=8, loB=4),
    'wave':  Pose(upF=120, loF=170, eyes='happy', brows='up', mouth='grin', hand='open'),
    'point': Pose(upF=80, loF=95, eyes='open', brows='smug', mouth='smirk', hand='point', prop='code'),
    'think': Pose(upF=118, loF=-112, eyes='focus', brows='focus', mouth='flat', hand='fist', prop='dots', shine=1),
    'prop':  Pose(upF=60, loF=100, eyes='focus', brows='focus', mouth='smirk', prop='laptop'),
    'cheer': Pose(upF=40, loF=175, eyes='happy', brows='up', mouth='grin', hand='thumb', prop='spark', bodyDy=-1),
    'wow':   Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', brows='up', mouth='o', hand='open', bits=6),
    'wink':  Pose(upF=85, loF=120, eyes='wink', brows='smug', mouth='grin', hand='point'),
}

# expresiones sueltas (para la hoja: solo la cabeza)
EXPRESIONES = {
    'neutral':   dict(eyes='open', brows='none', mouth='flat'),
    'feliz':     dict(eyes='happy', brows='up', mouth='grin'),
    'sorpresa':  dict(eyes='wide', brows='up', mouth='o'),
    'pensativo': dict(eyes='focus', brows='focus', mouth='flat', shine=1),
    'frustrado': dict(eyes='half', brows='worried', mouth='frown'),
    'decidido':  dict(eyes='focus', brows='focus', mouth='smirk'),
}

# ciclo de reposo de 4 tiempos: respiración de 1 px, mirada viva y lluvia de código
ANIM = [
    dict(t=0, bodyDy=0),
    dict(t=1, bodyDy=-1, mouth='smile', shine=1),
    dict(t=2, bodyDy=0, eyes='half'),
    dict(t=3, bodyDy=1),
]

# movimiento especial «Compilando la solución»: invocar · organizar · resolver
ESPECIAL = [
    Pose(upF=105, loF=150, eyes='focus', brows='focus', mouth='smirk', hand='open', special=0.05, bits=0),
    Pose(upF=88, loF=100, eyes='focus', brows='focus', mouth='flat', hand='open', special=0.5, bits=0),
    Pose(upF=135, loF=170, upB=40, loB=-60, eyes='happy', brows='up', mouth='grin', hand='thumb', special=1.0, bits=0, bodyDy=-1),
]


def _crop_group(bufs):
    """Recorta un grupo de fotogramas con la MISMA caja (la unión), para que al montarlos en la hoja
    el personaje no se desplace de un tiempo a otro por culpa de un carácter flotante."""
    ims = [b.image() for b in bufs]
    boxes = [im.getbbox() for im in ims]
    box = (min(x[0] for x in boxes), min(x[1] for x in boxes), max(x[2] for x in boxes), max(x[3] for x in boxes))
    return [im.crop(box) for im in ims]


def exportar(carpeta: str):
    from PIL import Image
    os.makedirs(carpeta, exist_ok=True)
    for n, p in POSES.items():
        draw(p).sprite().save(f'{carpeta}/p_{n}.png')
    anim = [draw(replace(POSES['idle'], **kw)) for kw in ANIM]
    for i, im in enumerate(_crop_group(anim)):
        im.save(f'{carpeta}/p_anim{i}.png')
    esp = [draw(p) for p in ESPECIAL]
    for i, im in enumerate(_crop_group(esp)):
        im.save(f'{carpeta}/p_esp{i}.png')

    # expresiones (cabeza recortada) y detalles de identidad para la hoja
    hy = OY - 22
    for n, kw in EXPRESIONES.items():
        im = draw(replace(POSES['idle'], bits=0, **kw)).image()
        im.crop((OX - 8, hy - 10, OX + 8, hy + 7)).save(f'{carpeta}/x_{n}.png')
    # tres rostros juntos (feliz · sorpresa · frustrado), 1 px de separación
    caras = [Image.open(f'{carpeta}/x_{n}.png') for n in ('feliz', 'sorpresa', 'frustrado')]
    tira = Image.new('RGBA', (sum(c.width for c in caras) + 2, caras[0].height), (0, 0, 0, 0))
    for i, c in enumerate(caras):
        tira.paste(c, (i * (c.width + 1), 0))
    tira.save(f'{carpeta}/d_rostros.png')
    idle = draw(replace(POSES['idle'], bits=0)).image()
    idle.crop((OX - 4, OY - 16, OX + 3, OY - 8)).save(f'{carpeta}/d_corbata.png')
    idle.crop((OX - 1, OY - 12, OX + 4, OY - 6)).save(f'{carpeta}/d_l.png')
    # silueta a tamaño pequeño: la figura entera en un solo tono
    sil = draw(replace(POSES['idle'], bits=0)).sprite()
    px = sil.load()
    for y in range(sil.height):
        for x in range(sil.width):
            if px[x, y][3]:
                px[x, y] = (0x00, 0xC0, 0x63, 255)
    sil.save(f'{carpeta}/d_silueta.png')
    # GIF animados (extra): reposo y movimiento especial, a 8x
    def gif(frames, path, ms):
        big = [f.resize((f.width * 8, f.height * 8), Image.NEAREST) for f in frames]
        bg = [Image.new('RGBA', big[0].size, (7, 8, 7, 255)) for _ in big]
        out = [Image.alpha_composite(g, f).convert('P', palette=Image.ADAPTIVE) for g, f in zip(bg, big)]
        out[0].save(path, save_all=True, append_images=out[1:], duration=ms, loop=0, disposal=2)
    gif(_crop_group(anim), f'{carpeta}/daru_reposo.gif', [320, 320, 320, 320])
    gif(_crop_group(esp), f'{carpeta}/daru_compilando.gif', [500, 500, 900])
    print('sprites en', carpeta)


def medir():
    """Medidas reales a 1x (sin caracteres flotantes) frente a Lint, Vee y Marco."""
    from PIL import Image
    ref = os.path.join(os.path.dirname(_aqui), 'referencias', 'sprites')
    for n in ('lint', 'vee', 'marco'):
        im = Image.open(os.path.join(ref, f'{n}_idle.png'))
        print(f'{n:6s} {im.width:2d} × {im.height:2d}  (con contorno de 1 px en Lint y Vee)')
    im = draw(replace(POSES['idle'], bits=0)).image()
    x0, y0, x1, y1 = im.getbbox()
    print(f'daru   {x1 - x0:2d} × {y1 - y0:2d}  pies en y = {y1 - 1} (OY = {OY}, la fila OY-1 es la suela)')


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--medir':
        medir()
    else:
        exportar(sys.argv[1] if len(sys.argv) > 1 else 'salida/daru')
