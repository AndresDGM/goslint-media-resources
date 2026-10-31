"""DIEGO · mascota de Goslint basada en Diego, coach del semillero. Fase 7 · Modo maratón.

Rasgos tomados de las fotos (caricatura amable): pelo muy oscuro con fade a los lados y flequillo corto,
barba corta que enmarca la mandíbula, un arete pequeño, cuello ancho y espalda grande. Lleva la camiseta
blanca de la maratón: los tres bloques azul, amarillo y rojo del logo del ICPC y el texto oscuro de
«MARATÓN 2026» en el pecho, más una muñequera verde de Goslint en cada brazo. Jeans claros y tenis oscuros. Pose característica: manos en la cintura.

Para que se vea fuerte sin romper la escala del universo:
  · mide lo mismo que Lint, Vee y DaRu (31 px de cuerpo, cabeza de 14 de ancho)
  · hombros de 12 px en vez de 10, cintura de 8 (forma de V) y cuello ancho
  · brazos de 2 px con arm(), como todas; solo la manga corta es un poco más ancha

    python3 mascotas/diego.py salida/diego
"""
from __future__ import annotations
import os, sys
from dataclasses import dataclass, replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _aqui)
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
from pixel import Buf, OX, OY, arm, dirv

# paleta: 15 colores
PAL = {
    'skin': '#E0A47E', 'skinD': '#BB7E5C',
    'beard': '#8C624C',                    # barba corta
    'hair': '#17110F', 'hairL': '#3A2C26',  # pelo casi negro; el brillo lo despega del fondo
    'fade': '#4E3C34',                     # rapado de los lados
    'shirt': '#F2F2EC', 'shirtD': '#BFC5CD',
    'ink': '#2B3550',                      # texto impreso de la camiseta
    'blue': '#3E73D8', 'yellow': '#F2C230', 'red': '#E2463E',   # bloques del logo del ICPC
    'jean': '#8FA8C6', 'jeanD': '#6984A8',
    'shoe': '#4A4A56',
    'green': '#00C063',
}
PAL['mouth'] = '#8E2A35'


@dataclass
class Pose:
    upF: float = 12; loF: float = 6; upB: float = 12; loB: float = 6   # brazos (ver dirv en pixel.py)
    eyes: str = 'open'      # open · happy · wide · closed · wink · focus
    brows: str = 'flat'     # flat · focus · up
    mouth: str = 'smirk'    # smirk · smile · grin · o · flat
    hand: str = 'fist'      # mano delantera: fist · open · point · thumb
    handB: str = 'fist'
    headDy: int = 0
    bodyDy: int = 0
    prop: str | None = None # watch
    special: int = 0        # 0 nada · 1 lee · 2 ordena · 3 ¡ataca!


# ---------------------------------------------------------------- brazos

def sleeve_arm(b: Buf, sh, up, lo, side):
    """arm() del motor (2 px, igual que las demás mascotas): manga blanca, brazo de piel y una
    muñequera verde de Goslint."""
    hd = arm(b, sh, up, lo, side, PAL['shirt'], PAL['skin'], PAL['skin'])
    hanging = abs(up) < 37 and abs(lo) < 37
    L1, L2 = (3, 2.5) if hanging else (4, 4)
    ex, ey = dirv(up, side)
    el = (sh[0] + ex * L1, sh[1] + ey * L1)
    k = 0.55
    b.line(el[0] + (hd[0] - el[0]) * k, el[1] + (hd[1] - el[1]) * k,
           el[0] + (hd[0] - el[0]) * k, el[1] + (hd[1] - el[1]) * k, PAL['green'])
    return hd


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
    S, SD, BE = PAL['skin'], PAL['skinD'], PAL['beard']
    # rostro y mandíbula cuadrada
    b.rect(hx - 6, hy - 5, 12, 10, S)
    b.rect(hx - 5, hy + 5, 10, 1, BE)
    b.rect(hx - 3, hy + 6, 6, 1, BE)
    b.rect(hx + 5, hy - 4, 1, 5, SD)
    # orejas y arete
    b.rect(hx - 7, hy - 2, 1, 3, S); b.set(hx - 7, hy + 1, PAL['shirt'])
    b.rect(hx + 6, hy - 2, 1, 3, SD)
    # barba corta: patillas, mandíbula, mentón y bigote suave
    for y in range(hy - 2, hy + 5):
        b.set(hx - 6, y, BE); b.set(hx + 5, y, BE)
    b.rect(hx - 6, hy + 4, 3, 1, BE); b.rect(hx + 3, hy + 4, 3, 1, BE)
    b.set(hx - 5, hy + 3, BE); b.set(hx + 4, hy + 3, BE)
    b.rect(hx - 1, hy + 4, 2, 1, BE)
    b.rect(hx - 2, hy + 2, 4, 1, SD)
    # pelo: volumen arriba, flequillo corto y fade a los lados
    H, HL = PAL['hair'], PAL['hairL']
    b.rect(hx - 4, hy - 9, 8, 1, H)
    b.rect(hx - 6, hy - 8, 12, 1, H)
    b.rect(hx - 7, hy - 7, 14, 2, H)
    b.rect(hx - 6, hy - 5, 12, 1, H)
    b.set(hx - 5, hy - 4, H); b.set(hx - 1, hy - 4, H); b.set(hx, hy - 4, H)   # puntas del flequillo
    b.set(hx + 3, hy - 4, H)
    b.rect(hx - 3, hy - 9, 3, 1, HL); b.rect(hx - 5, hy - 8, 2, 1, HL); b.set(hx + 1, hy - 8, HL)
    b.set(hx + 3, hy - 9, HL)
    for y in range(hy - 5, hy - 2):                   # fade
        b.set(hx - 7, y, PAL['fade']); b.set(hx + 6, y, PAL['fade'])
    b.set(hx - 6, hy - 4, PAL['fade']); b.set(hx + 5, hy - 4, PAL['fade'])
    b.set(hx - 6, hy - 3, PAL['fade']); b.set(hx + 5, hy - 3, PAL['fade'])

    # cejas gruesas
    E = PAL['hair']
    ey = hy - 1
    if p.brows == 'focus':
        b.rect(hx - 5, ey - 3, 2, 1, E); b.set(hx - 3, ey - 2, E)
        b.rect(hx + 3, ey - 3, 2, 1, E); b.set(hx + 2, ey - 2, E)
    elif p.brows == 'up':
        b.rect(hx - 5, ey - 3, 3, 1, E); b.rect(hx + 2, ey - 3, 3, 1, E)
    else:
        b.rect(hx - 5, ey - 2, 3, 1, E); b.rect(hx + 2, ey - 2, 3, 1, E)

    def eye(x, which):
        e = p.eyes
        if e == 'wink':
            e = 'closed' if which else 'open'
        if e == 'open':
            b.rect(x, ey, 2, 2, E); b.set(x + which, ey, PAL['shirt'])
        elif e == 'focus':
            b.rect(x, ey + 1, 2, 1, E); b.set(x + which, ey + 1, PAL['shirt'])
        elif e == 'wide':
            b.rect(x, ey - 1, 2, 3, E); b.set(x + which, ey - 1, PAL['shirt'])
        elif e == 'happy':
            b.set(x - 1, ey + 1, E); b.rect(x, ey, 2, 1, E); b.set(x + 2, ey + 1, E)
        else:                                           # closed: línea recta corta
            b.rect(x - (1 - which), ey + 1, 3, 1, E)
    eye(hx - 4, 0)
    eye(hx + 2, 1)
    b.set(hx - 1, hy + 1, SD)                          # nariz

    M, W = PAL['mouth'], PAL['shirt']
    mx, my = hx - 2, hy + 3
    m = p.mouth
    if m == 'smirk':          # media sonrisa segura
        b.rect(mx, my, 3, 1, M); b.set(mx + 3, my - 1, M)
    elif m == 'smile':
        b.set(mx, my - 1, M); b.rect(mx + 1, my, 2, 1, M); b.set(mx + 3, my - 1, M)
    elif m == 'grin':
        b.rect(mx, my - 1, 4, 1, W); b.rect(mx, my, 4, 1, M)
    elif m == 'o':
        b.rect(mx + 1, my - 1, 2, 2, M)
    else:                     # flat: serio
        b.rect(mx, my, 4, 1, M)


# ---------------------------------------------------------------- accesorios

def draw_watch(b: Buf, hd):
    """Cronómetro de maratón: cuerpo blanco, pantalla oscura con dígitos verdes."""
    x, y = round(hd[0]) - 3, round(hd[1]) - 8
    b.rect(x + 2, y - 2, 2, 1, PAL['shirtD'])
    b.rect(x + 1, y - 1, 4, 1, PAL['shirt'])
    b.rect(x, y, 6, 5, PAL['shirt'])
    b.rect(x + 1, y + 5, 4, 1, PAL['shirtD'])
    b.rect(x + 1, y + 1, 4, 3, PAL['hair'])
    b.set(x + 1, y + 2, PAL['green']); b.set(x + 2, y + 2, PAL['green'])
    b.set(x + 4, y + 1, PAL['green']); b.set(x + 4, y + 3, PAL['green'])


def draw_clipboard(b: Buf, hd):
    """Tabla del coach con la hoja de problemas."""
    x, y = round(hd[0]) - 2, round(hd[1]) - 7
    b.rect(x, y, 5, 7, PAL['beard'])
    b.rect(x + 1, y + 1, 3, 5, PAL['shirt'])
    b.rect(x + 1, y - 1, 3, 1, PAL['shirtD'])
    for j in (2, 4):
        b.rect(x + 1, y + j, 2 if j == 4 else 3, 1, PAL['ink'])


def draw_card(b: Buf, x, y, level, solved=False):
    """Tarjeta de problema de 5 × 6. La barra oscura de adentro marca la dificultad (1 a 4).
    Resuelta: se vuelve verde con un chulo."""
    x, y = round(x), round(y)
    if solved:
        b.rect(x, y, 5, 6, PAL['green'])
        D = '#0B2418'
        for px, py in ((0, 2), (1, 3), (2, 4), (3, 3), (4, 2), (4, 1)):
            b.set(x + px, y + py, D)
        return
    b.rect(x, y, 5, 6, PAL['shirt'])
    b.rect(x, y + 5, 5, 1, PAL['shirtD'])
    b.rect(x + 1, y + 5 - level, 3, level, PAL['ink'])


# orden de los problemas: tal como llegan (desordenados) y ya ordenados de fácil a difícil
CARDS_IN = [(-15, -18, 3), (-7, -21, 1), (2, -17, 4), (10, -20, 2)]
CARDS_OK = [(-14, -18, 1), (-7, -18, 2), (0, -18, 3), (7, -18, 4)]


# ---------------------------------------------------------------- personaje completo

def draw(p: Pose, facing: int = 1) -> Buf:
    b = Buf()
    by = OY + p.bodyDy
    hx, hy = OX, by - 22 + p.headDy
    shF = (OX + 6 * facing, by - 12)
    shB = (OX - 7 * facing, by - 12)

    hb = sleeve_arm(b, shB, p.upB, p.loB, -facing)

    # piernas (fijas en OY: la respiración no mueve los pies)
    for x in (OX - 4, OX + 1):
        b.rect(x, OY - 5, 3, 4, PAL['jean'])
        b.rect(x + (2 if x > OX else 0), OY - 5, 1, 4, PAL['jeanD'])
        b.rect(x - (1 if x < OX else 0), OY - 1, 4, 1, PAL['shoe'])
        b.set(x + (2 if x > OX else -1), OY - 1, PAL['shirt'])     # puntera blanca
    b.rect(OX - 4, by - 6, 8, 2, PAL['jean'])
    b.rect(OX + 3, by - 6, 1, 2, PAL['jeanD'])

    # torso en V: hombros de 12, cintura de 8, toda la camiseta blanca
    S, SD = PAL['shirt'], PAL['shirtD']
    b.rect(OX - 5, by - 14, 10, 1, S)
    b.rect(OX - 6, by - 13, 12, 3, S)
    b.rect(OX - 5, by - 10, 10, 1, S)
    b.rect(OX - 4, by - 9, 8, 3, S)
    b.rect(OX + 5, by - 13, 1, 3, SD); b.set(OX + 4, by - 10, SD)
    b.rect(OX + 3, by - 9, 1, 3, SD)
    b.rect(OX - 6, by - 13, 1, 3, SD)                              # sisas: separan manga y torso
    # cuello redondo y cuello ancho
    b.set(OX - 3, by - 14, SD); b.set(OX + 2, by - 14, SD)
    b.rect(OX - 2, by - 13, 4, 1, SD)
    b.rect(OX - 2, by - 14, 4, 1, PAL['skinD'])
    b.rect(OX - 3, by - 15, 6, 1, PAL['skinD'])
    # estampado de la maratón: los tres bloques del logo del ICPC y debajo «MARATÓN 2026»
    b.rect(OX - 3, by - 12, 2, 2, PAL['blue'])
    b.rect(OX - 1, by - 12, 2, 2, PAL['yellow'])
    b.rect(OX + 1, by - 12, 2, 2, PAL['red'])
    b.rect(OX - 3, by - 9, 4, 1, PAL['ink']); b.rect(OX + 2, by - 9, 1, 1, PAL['ink'])
    b.rect(OX - 2, by - 8, 4, 1, SD)

    draw_head(b, p, hx, hy)

    hd = sleeve_arm(b, shF, p.upF, p.loF, facing)
    draw_hand(b, hb, p.handB, -facing)
    draw_hand(b, hd, p.hand, facing)
    if p.prop == 'watch':
        draw_watch(b, hd)

    if p.special == 1:          # lee: los problemas llegan desordenados
        draw_clipboard(b, hd)
        draw_hand(b, hd, 'fist', facing)
        for dx, dy, lv in CARDS_IN:
            draw_card(b, hx + dx, hy + dy, lv)
    elif p.special >= 2:        # ordena de fácil a difícil (y en 3 ataca el más fácil)
        for i, (dx, dy, lv) in enumerate(CARDS_OK):
            draw_card(b, hx + dx, hy + dy, lv, solved=(p.special == 3 and i == 0))
        if p.special == 2:
            for dx in (-9, -2, 5):                  # flechitas entre tarjetas: el orden
                b.set(hx + dx, hy - 15, PAL['green'])
        else:
            for dx, dy in ((-16, -20), (-8, -20), (-16, -11), (-12, -21)):
                b.set(hx + dx, hy + dy, '#7CFFB3')
    return b


# ---------------------------------------------------------------- poses y exportación

POSES = {
    'idle':  Pose(upF=40, loF=-55, upB=40, loB=-55),             # manos en la cintura
    'wave':  Pose(upF=120, loF=170, upB=40, loB=-55, eyes='happy', brows='up', mouth='grin', hand='open'),
    'point': Pose(upF=80, loF=95, upB=40, loB=-55, mouth='grin', brows='focus', hand='point'),
    'think': Pose(upF=30, loF=-150, upB=40, loB=-55, eyes='focus', brows='focus', mouth='flat'),
    'prop':  Pose(upF=60, loF=150, upB=40, loB=-55, mouth='smirk', brows='focus', prop='watch'),
    'cheer': Pose(upF=90, loF=178, upB=90, loB=178, eyes='happy', brows='up', mouth='grin', bodyDy=-1),
    'wow':   Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', brows='up', mouth='o', hand='open', handB='open'),
    'wink':  Pose(upF=40, loF=175, upB=40, loB=-55, eyes='wink', mouth='grin', hand='thumb'),
}

# ciclo de reposo de 4 tiempos: respira de 1 px con las manos en la cintura y parpadea
ANIM = [
    dict(bodyDy=0),
    dict(bodyDy=-1),
    dict(bodyDy=0, eyes='closed'),
    dict(bodyDy=1, mouth='smile'),
]

# movimiento especial «¡Orden de ataque!»: lee · ordena · ataca el más fácil
ESPECIAL = [
    Pose(upF=50, loF=-80, upB=40, loB=-55, eyes='focus', brows='focus', mouth='flat', special=1),
    Pose(upF=120, loF=170, upB=40, loB=-55, brows='focus', mouth='smirk', hand='open', special=2),
    Pose(upF=40, loF=-55, upB=140, loB=170, eyes='happy', brows='up', mouth='grin', handB='point', special=3, bodyDy=-1),
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
    gif(_crop_group(anim), f'{carpeta}/diego_reposo.gif', [320, 320, 200, 320])
    gif(_crop_group(esp), f'{carpeta}/diego_ataque.gif', [500, 600, 900])
    print('sprites en', carpeta)


def medir():
    from PIL import Image
    ref = os.path.join(os.path.dirname(_aqui), 'referencias', 'sprites')
    for n in ('lint', 'vee', 'marco'):
        im = Image.open(os.path.join(ref, f'{n}_idle.png'))
        print(f'{n:6s} {im.width:2d} × {im.height:2d}')
    im = draw(POSES['idle']).image()
    x0, y0, x1, y1 = im.getbbox()
    print(f'diego  {x1 - x0:2d} × {y1 - y0:2d}  pies en y = {y1 - 1}')


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--medir':
        medir()
    else:
        exportar(sys.argv[1] if len(sys.argv) > 1 else 'salida/diego')
