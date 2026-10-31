"""VELASCO · mascota de Goslint basada en el profe Andrés Velasco. Fase 3 · Estructuras y algoritmos.

El profe que enseña análisis de algoritmos (Big O, programación dinámica, greedy) y que, en las
primeras maratones, revisaba a mano el código de cada equipo.

Rasgos tomados de las fotos (caricatura amable): pelo muy corto con canas a los lados, cara redonda
y sonrisa tranquila. Camisa de rayas lila y blanca de manga corta con el celular en el
bolsillo, jeans oscuros y zapatos cafés. Un poco más ancho de la panza que las otras mascotas, sin
exagerar. Pose característica: las manos juntas al frente, como en la foto.

Misma escala que Lint, Vee y Diego: 31 px de cuerpo, cabeza de 14 de ancho, brazos de 2 px con arm().

    python3 mascotas/velasco.py salida/velasco
"""
from __future__ import annotations
import os, sys
from dataclasses import dataclass, replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _aqui)
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
from pixel import Buf, OX, OY, arm

# paleta: 14 colores
PAL = {
    'skin': '#C98B62', 'skinD': '#A36B48',
    'hair': '#221B19', 'gray': '#8E8782',   # pelo rapado y canas
    'lilac': '#9C8FD8', 'lilacD': '#7468B4', # rayas de la camisa
    'white': '#F3F1F6', 'whiteD': '#C6C2D2',
    'jean': '#34496F', 'jeanD': '#24344F',
    'shoe': '#6A4430',
    'gold': '#CDB27A',                       # el celular del bolsillo
    'green': '#00C063',
    'mouth': '#8E2A35',
}


@dataclass
class Pose:
    upF: float = 0; loF: float = -90; upB: float = 0; loB: float = -90   # brazos (ver dirv en pixel.py)
    clasp: bool = False     # manos juntas al frente (su pose de la foto)
    eyes: str = 'open'      # open · happy · wide · closed · wink · focus
    brows: str = 'flat'     # flat · up · focus
    mouth: str = 'smile'    # smile · grin · o · flat
    hand: str = 'fist'      # mano delantera: fist · open · point · thumb
    handB: str = 'fist'
    headDy: int = 0
    bodyDy: int = 0
    prop: str | None = None # sheet · bigo
    special: int = 0        # 0 nada · 1 lee · 2 corrige · 3 ¡AC!


# ---------------------------------------------------------------- letra de 3 × 5 (para «O(n)»)

FONT = {
    'O': ['111', '101', '101', '101', '111'],
    '(': ['01', '10', '10', '10', '01'],
    ')': ['10', '01', '01', '01', '10'],
    'n': ['000', '110', '101', '101', '101'],
}


def text(b: Buf, x, y, s, col):
    for ch in s:
        g = FONT[ch]
        for j, row in enumerate(g):
            for i, v in enumerate(row):
                if v == '1':
                    b.set(x + i, y + j, col)
        x += len(g[0]) + 1


# ---------------------------------------------------------------- manos

def draw_hand(b: Buf, hd, kind, side):
    hx_, hy_ = round(hd[0] - 1), round(hd[1] - 1)
    b.rect(hx_, hy_, 2, 2, PAL['skin'])
    b.set(hx_ + (0 if side == 1 else 1), hy_ + 1, PAL['skinD'])
    if kind == 'point':
        b.set(hx_ + (2 if side == 1 else -1), hy_, PAL['skin'])
    elif kind == 'thumb':
        b.set(hx_ + (1 if side == 1 else 0), hy_ - 1, PAL['skin'])
        b.set(hx_ + (1 if side == 1 else 0), hy_ - 2, PAL['skin'])
    elif kind == 'open':
        b.set(hx_ - 1 if side == 1 else hx_ + 2, hy_, PAL['skin'])
        b.set(hx_ + (1 if side == 1 else 0), hy_ - 1, PAL['skin'])


# ---------------------------------------------------------------- cabeza

def draw_head(b: Buf, p: Pose, hx, hy):
    S, SD, H, G = PAL['skin'], PAL['skinD'], PAL['hair'], PAL['gray']
    # cara redonda: más ancha en los cachetes
    rows = {-8: (-4, 3), -7: (-6, 5)}
    for y in range(-6, 5):
        rows[y] = (-6, 5)
    rows.update({5: (-5, 4), 6: (-3, 2)})
    for dy, (x0, x1) in rows.items():
        b.rect(hx + x0, hy + dy, x1 - x0 + 1, 1, S)
    for y in range(hy - 4, hy + 5):
        b.set(hx + 5, y, SD)
    b.rect(hx + 3, hy + 5, 2, 1, SD); b.rect(hx + 1, hy + 6, 2, 1, SD)
    # orejas
    b.rect(hx - 7, hy - 2, 1, 3, S); b.rect(hx + 6, hy - 2, 1, 3, SD)
    # pelo rapado, con canas en las sienes
    b.rect(hx - 3, hy - 9, 6, 1, H)
    b.rect(hx - 5, hy - 8, 10, 1, H)
    b.rect(hx - 6, hy - 7, 12, 1, H)
    b.rect(hx - 4, hy - 6, 8, 1, H)
    b.rect(hx - 6, hy - 6, 2, 1, G); b.rect(hx + 4, hy - 6, 2, 1, G)
    for y in range(hy - 5, hy - 2):                      # sienes canosas
        b.set(hx - 6, y, G); b.set(hx + 5, y, G)
    b.set(hx - 5, hy - 5, G); b.set(hx + 4, hy - 5, G)

    # cejas (sobre los ojos, que van un poco juntos: mirada al frente)
    ey = hy - 2
    if p.brows == 'up':
        b.rect(hx - 4, ey - 3, 3, 1, H); b.rect(hx + 1, ey - 3, 3, 1, H)
    elif p.brows == 'focus':
        b.rect(hx - 4, ey - 2, 2, 1, H); b.set(hx - 2, ey - 1, H)
        b.rect(hx + 2, ey - 2, 2, 1, H); b.set(hx + 1, ey - 1, H)
    else:
        b.rect(hx - 4, ey - 2, 3, 1, H); b.rect(hx + 1, ey - 2, 3, 1, H)

    def eye(x, which):
        # el brillo va del mismo lado en los dos ojos (arriba a la izquierda)
        e = p.eyes
        if e == 'wink':
            e = 'closed' if which else 'open'
        if e == 'open':
            b.rect(x, ey, 2, 2, H); b.set(x, ey, PAL['white'])
        elif e == 'focus':
            b.rect(x, ey + 1, 2, 1, H); b.set(x, ey + 1, PAL['white'])
        elif e == 'wide':
            b.rect(x, ey - 1, 2, 3, H); b.set(x, ey - 1, PAL['white'])
        elif e == 'happy':
            b.set(x - 1, ey + 1, H); b.rect(x, ey, 2, 1, H); b.set(x + 2, ey + 1, H)
        else:                                            # closed: línea recta corta
            b.rect(x - (1 - which), ey + 1, 3, 1, H)
    eye(hx - 3, 0)
    eye(hx + 1, 1)
    b.set(hx - 1, hy, SD)                                # nariz

    M, W = PAL['mouth'], PAL['white']
    mx, my = hx - 2, hy + 3
    m = p.mouth
    if m == 'smile':
        b.set(mx, my, M); b.rect(mx + 1, my + 1, 2, 1, M); b.set(mx + 3, my, M)
    elif m == 'grin':
        b.rect(mx, my, 4, 1, W); b.rect(mx, my + 1, 4, 1, M)
    elif m == 'o':
        b.rect(mx + 1, my, 2, 2, M)
    else:
        b.rect(mx, my + 1, 4, 1, M)


# ---------------------------------------------------------------- accesorios

def draw_sheet(b: Buf, hd, stage=0):
    """Hoja impresa con código. stage 1: marcas rojas de corrección · stage 2: chulo verde de «AC»."""
    x, y = round(hd[0]) - 1, round(hd[1]) - 11
    b.rect(x, y, 8, 10, PAL['white'])
    b.rect(x + 7, y + 1, 1, 9, PAL['whiteD']); b.rect(x + 1, y + 9, 7, 1, PAL['whiteD'])
    for j, (ind, ln) in enumerate([(0, 5), (1, 4), (1, 3), (0, 2)]):
        b.rect(x + 1 + ind, y + 2 + j * 2, ln, 1, PAL['hair'] if stage < 2 else PAL['whiteD'])
    if stage == 1:            # el profe marca la línea que hay que revisar
        b.rect(x + 2, y + 5, 4, 1, PAL['mouth'])
        b.set(x + 6, y + 3, PAL['mouth']); b.set(x + 6, y + 5, PAL['mouth'])
    elif stage == 2:          # chulo verde grande: aceptado
        for px, py in ((1, 5), (2, 6), (3, 7), (4, 6), (5, 5), (6, 4), (6, 3), (2, 5), (3, 6), (4, 5), (5, 4)):
            b.set(x + px, y + py, PAL['green'])


def draw_pocket(b: Buf, by):
    """Bolsillo con el celular dorado y un bolígrafo verde (el de revisar código)."""
    b.rect(OX + 1, by - 11, 3, 1, PAL['whiteD'])
    b.rect(OX + 2, by - 13, 2, 2, PAL['gold'])
    b.set(OX + 2, by - 13, PAL['hair'])                 # cámara del celular
    b.set(OX + 1, by - 12, PAL['green'])                # tapa del bolígrafo


# ---------------------------------------------------------------- personaje completo

def stripe(x, y):
    """Rayas verticales lila y blanca, con la sombra a la derecha del torso."""
    dark = x >= OX + 4
    if (x - OX) % 2 == 0:
        return PAL['lilacD'] if dark else PAL['lilac']
    return PAL['whiteD'] if dark else PAL['white']


def draw(p: Pose, facing: int = 1) -> Buf:
    b = Buf()
    by = OY + p.bodyDy
    hx, hy = OX, by - 22 + p.headDy
    shF = (OX + 5 * facing - (1 if facing == 1 else 0), by - 12)
    shB = (OX - 5 * facing - (1 if facing == -1 else 0), by - 12)

    hb = arm(b, shB, p.upB, p.loB, -facing, PAL['lilacD'], PAL['skinD'], PAL['skinD'])

    # piernas (fijas en OY: la respiración no mueve los pies)
    for x in (OX - 4, OX + 1):
        b.rect(x, OY - 5, 3, 4, PAL['jean'])
        b.rect(x + (2 if x > OX else 0), OY - 5, 1, 4, PAL['jeanD'])
        b.rect(x - (1 if x < OX else 0), OY - 1, 4, 1, PAL['shoe'])
    b.rect(OX - 5, by - 6, 10, 2, PAL['jean'])
    b.rect(OX + 3, by - 6, 2, 2, PAL['jeanD'])

    # torso con un poco de panza: hombros de 10, panza de 12 y redondeada
    shape = {-13: (-4, 3), -12: (-5, 4), -11: (-6, 5), -10: (-6, 5), -9: (-7, 6), -8: (-7, 6), -7: (-6, 5)}
    for dy, (x0, x1) in shape.items():
        for x in range(OX + x0, OX + x1 + 1):
            b.set(x, by + dy, stripe(x, by + dy))
        b.set(OX + x0, by + dy, PAL['lilac']); b.set(OX + x1, by + dy, PAL['lilacD'])   # bordes definidos
    # cuello de la camisa con botón y la tapeta
    b.rect(OX - 3, by - 15, 6, 1, PAL['skinD'])
    b.rect(OX - 2, by - 14, 4, 1, PAL['skinD'])
    b.rect(OX - 1, by - 13, 2, 1, PAL['skin'])
    b.set(OX - 3, by - 14, PAL['white']); b.set(OX + 2, by - 14, PAL['white'])
    b.set(OX - 2, by - 13, PAL['white']); b.set(OX + 1, by - 13, PAL['white'])
    for y in range(by - 12, by - 6):
        b.set(OX - 1, y, PAL['white'])
    b.set(OX - 1, by - 10, PAL['whiteD']); b.set(OX - 1, by - 8, PAL['whiteD'])   # botones
    draw_pocket(b, by)

    draw_head(b, p, hx, hy)

    hd = arm(b, shF, p.upF, p.loF, facing, PAL['lilac'], PAL['skin'], PAL['skin'])
    if p.clasp:                 # manos juntas sobre la panza
        b.rect(OX - 3, by - 9, 5, 2, PAL['skin'])
        b.set(OX - 1, by - 9, PAL['skinD']); b.set(OX - 1, by - 8, PAL['skinD'])
    else:
        draw_hand(b, hb, p.handB, -facing)
        draw_hand(b, hd, p.hand, facing)

    if p.prop == 'sheet':
        draw_sheet(b, hd, 0)
        draw_hand(b, hd, 'fist', facing)
    elif p.prop == 'bigo':      # piensa en la complejidad: «O(n)»
        b.set(hx + 7, hy - 6, PAL['gray']); b.set(hx + 8, hy - 8, PAL['gray'])
        text(b, hx + 6, hy - 16, 'O(n)', PAL['green'])
    if p.special:
        draw_sheet(b, hd, p.special - 1)
        draw_hand(b, hd, 'fist', facing)
        if p.special == 3:
            for dx, dy in ((10, -14), (17, -12), (18, -3), (8, -8)):
                b.set(hx + dx, hy + dy, '#7CFFB3')
    return b


# ---------------------------------------------------------------- poses y exportación

POSES = {
    'idle':  Pose(clasp=True),
    'wave':  Pose(upF=120, loF=170, upB=12, loB=6, eyes='happy', brows='up', mouth='grin', hand='open'),
    'point': Pose(upF=80, loF=95, upB=12, loB=6, mouth='o', hand='point'),
    'think': Pose(upF=30, loF=-150, upB=12, loB=6, eyes='focus', brows='focus', mouth='flat', prop='bigo'),
    'prop':  Pose(upF=60, loF=150, upB=12, loB=6, eyes='focus', mouth='flat', prop='sheet'),
    'cheer': Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', brows='up', mouth='grin', bodyDy=-1),
    'wow':   Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', brows='up', mouth='o', hand='open', handB='open'),
    'wink':  Pose(upF=40, loF=175, upB=12, loB=6, eyes='wink', mouth='grin', hand='thumb'),
}

# ciclo de reposo de 4 tiempos: respira de 1 px con las manos juntas y parpadea
ANIM = [
    dict(bodyDy=0),
    dict(bodyDy=-1),
    dict(bodyDy=0, eyes='closed'),
    dict(bodyDy=1, mouth='grin'),
]

# movimiento especial «Juez a mano»: lee · corrige · ¡AC!
ESPECIAL = [
    Pose(upF=60, loF=150, upB=12, loB=6, eyes='focus', mouth='flat', special=1),
    Pose(upF=60, loF=150, upB=12, loB=6, eyes='focus', brows='focus', mouth='o', special=2),
    Pose(upF=60, loF=150, upB=40, loB=175, eyes='happy', brows='up', mouth='grin', handB='thumb', special=3, bodyDy=-1),
]


def _crop_group(bufs):
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

    def gif(frames, path, ms):
        big = [f.resize((f.width * 8, f.height * 8), Image.NEAREST) for f in frames]
        bg = [Image.new('RGBA', big[0].size, (7, 8, 7, 255)) for _ in big]
        out = [Image.alpha_composite(g, f).convert('P', palette=Image.ADAPTIVE) for g, f in zip(bg, big)]
        out[0].save(path, save_all=True, append_images=out[1:], duration=ms, loop=0, disposal=2)
    gif(_crop_group(anim), f'{carpeta}/velasco_reposo.gif', [320, 320, 200, 320])
    gif(_crop_group(esp), f'{carpeta}/velasco_juez.gif', [600, 700, 900])
    print('sprites en', carpeta)


def medir():
    from PIL import Image
    ref = os.path.join(os.path.dirname(_aqui), 'referencias', 'sprites')
    for n in ('lint', 'vee', 'marco'):
        im = Image.open(os.path.join(ref, f'{n}_idle.png'))
        print(f'{n:6s} {im.width:2d} × {im.height:2d}')
    im = draw(POSES['idle']).image()
    x0, y0, x1, y1 = im.getbbox()
    print(f'velasco {x1 - x0:2d} × {y1 - y0:2d}  pies en y = {y1 - 1}')


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--medir':
        medir()
    else:
        exportar(sys.argv[1] if len(sys.argv) > 1 else 'salida/velasco')
