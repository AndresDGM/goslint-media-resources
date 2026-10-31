"""PLANTILLA DE MASCOTA · Goslint
Copia este archivo (p. ej. a mascotas/<nombre>.py), cambia la paleta y las secciones marcadas con
«✎ CAMBIAR» y ejecútalo:

    python3 motor/plantilla_mascota.py salida/<nombre>

Genera en esa carpeta los sprites que usa la hoja de concepto:
    p_<pose>.png        una por pose de POSES
    p_anim0..3.png      cuatro tiempos de su animación en reposo (respirar, flotar, humo, pelo…)
    p_esp0..2.png       tres fotogramas de su movimiento especial

Reglas (ver GUIA-MASCOTAS.md):
  · lienzo 72×64, pies en OY = 50, centro OX = 36, ~33 px de alto, cabeza grande y cuerpo pequeño
  · brazos de 2 px con la función arm(); los que cuelgan se acortan solos
  · paleta plana: un color base + una sombra (+ una luz si hace falta) por material
  · SIN contorno blanco: la silueta se separa del fondo negro con luz de contorno (rim_light)
    y con colores que contrasten con #070807
  · un guiño a Goslint (verde #00C063, la «L», el buzo, el portátil…)
"""
from __future__ import annotations
import math, os, sys
from dataclasses import dataclass, replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _aqui)                                   # si está en motor/
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))  # si está en mascotas/
from pixel import Buf, OX, OY, arm, fbm

# ✎ CAMBIAR: paleta del personaje (máx. ~12 colores; nombres libres)
PAL = {
    'skin': '#E7B08A', 'skinD': '#C88B68',
    'hair': '#2B2B38', 'hairL': '#4A4A5E',
    'eye': '#141018', 'shine': '#FFFFFF', 'mouth': '#B23B4A',
    'shirt': '#2E3440', 'shirtD': '#1F242C',
    'pants': '#3C5F8E', 'pantsD': '#2B476D', 'shoe': '#1B1B1F',
    'green': '#00C063', 'greenD': '#00864A',
    'rim': '#9CFFCF',        # luz de contorno (reemplaza al contorno blanco)
}


RIM = False  # luz de contorno arriba-derecha (alternativa al contorno blanco, que ya no se usa)


@dataclass
class Pose:
    upF: float = 12; loF: float = 6; upB: float = 12; loB: float = 6   # brazos (ver dirv en pixel.py)
    eyes: str = 'open'      # open · happy · wide · closed · wink
    mouth: str = 'smile'    # smile · grin · o · flat
    headDy: int = 0
    bodyDy: int = 0
    legs: int = 0           # 0 de pie · 1–4 ciclo de caminar
    t: float = 0.0          # tiempo, para animaciones con ruido (pelo, humo, fuego…)
    prop: str | None = None # accesorio: ✎ define los tuyos
    special: float = 0.0    # 0..1 avance del movimiento especial


def draw(p: Pose, facing: int = 1) -> Buf:
    b = Buf()
    by = OY + p.bodyDy
    hx, hy = OX, by - 22 + p.headDy
    shF = (OX + 5 * facing - (1 if facing == 1 else 0), by - 12)
    shB = (OX - 5 * facing - (1 if facing == -1 else 0), by - 12)

    # brazo trasero (queda detrás del cuerpo)
    arm(b, shB, p.upB, p.loB, -facing, PAL['shirt'], PAL['skin'], PAL['skin'])

    # ✎ CAMBIAR: piernas (o cola, ruedas, humo… lo que tenga el personaje)
    cyc = [(0, 0, 0, 0), (1, 1, 0, -1), (0, 0, 0, 0), (0, -1, 1, 1), (0, 0, 0, 0)][max(0, min(4, p.legs))]
    for side, lift, shift in ((-1, cyc[0], cyc[1]), (1, cyc[2], cyc[3])):
        x = OX + (-4 if side == -1 else 1) + shift * facing
        b.rect(x, OY - 5 - lift, 3, 4, PAL['pants'])
        b.rect(x + (2 if side == 1 else 0), OY - 5 - lift, 1, 4, PAL['pantsD'])
        b.rect(x - (1 if facing == -1 else 0), OY - 1 - lift, 4, 1, PAL['shoe'])
    b.rect(OX - 4, by - 6, 8, 2, PAL['pants'])

    # ✎ CAMBIAR: torso (10 px de ancho en los hombros, 8 de alto)
    b.rect(OX - 4, by - 13, 8, 7, PAL['shirt'])
    b.rect(OX - 5, by - 12, 10, 3, PAL['shirt'])
    b.rect(OX + 3, by - 12, 1, 6, PAL['shirtD'])
    b.rect(OX - 2, by - 11, 1, 3, PAL['green'])     # «L» de Goslint
    b.rect(OX - 2, by - 9, 3, 1, PAL['green'])

    # ✎ CAMBIAR: cabeza (≈ 14 px de ancho × 12–14 de alto; grande respecto al cuerpo)
    b.ellipse(hx - 0.5, hy - 0.5, 7.2, 6.8, PAL['skin'])
    b.rect(hx + 4, hy - 3, 1, 7, PAL['skinD'])
    b.rect(hx - 1, hy + 6, 2, 2, PAL['skinD'])      # cuello
    # pelo animado con ruido (ejemplo de cómo usar p.t)
    for y in range(hy - 9, hy - 2):
        for x in range(hx - 8, hx + 8):
            dx, dy = (x + 0.5 - hx + 0.5) / 8.2, (y + 0.5 - hy + 1) / 7.6
            if dx * dx + dy * dy < 1 and (y < hy - 4 or abs(x + 0.5 - hx) > 5):
                b.set(x, y, PAL['hairL'] if fbm(x * 0.4, y * 0.4 - p.t, 1) > 0.62 else PAL['hair'])

    # ojos y boca
    def eye(x, which):
        e = p.eyes
        if e == 'wink':
            e = 'closed' if which else 'open'
        if e == 'open':
            b.rect(x, hy - 1, 2, 2, PAL['eye']); b.set(x, hy - 1, PAL['shine'])
        elif e == 'wide':
            b.rect(x, hy - 2, 2, 3, PAL['eye']); b.set(x, hy - 2, PAL['shine'])
        elif e == 'happy':
            b.set(x - 1, hy, PAL['eye']); b.rect(x, hy - 1, 2, 1, PAL['eye']); b.set(x + 2, hy, PAL['eye'])
        else:
            b.rect(x - 1, hy, 3, 1, PAL['eye'])
    eye(hx - 4, 0)
    eye(hx + 2, 1)
    mx, my = hx - 2, hy + 3
    if p.mouth == 'smile':
        b.set(mx, my, PAL['mouth']); b.set(mx + 3, my, PAL['mouth']); b.rect(mx + 1, my + 1, 2, 1, PAL['mouth'])
    elif p.mouth == 'grin':
        b.rect(mx, my, 4, 1, PAL['shine']); b.rect(mx, my + 1, 4, 1, PAL['mouth'])
    elif p.mouth == 'o':
        b.rect(mx + 1, my, 2, 2, PAL['mouth'])
    else:
        b.rect(mx + 1, my + 1, 2, 1, PAL['mouth'])

    # brazo delantero y accesorio
    hd = arm(b, shF, p.upF, p.loF, facing, PAL['shirt'], PAL['skin'], PAL['skin'])
    if p.prop == 'laptop':  # ✎ ejemplo de accesorio
        x, y = round(hd[0]) - 2, round(hd[1])
        b.rect(x, y - 1, 10, 2, '#7F8D99'); b.rect(x + 1, y - 7, 8, 6, '#C9D3DC'); b.rect(x + 2, y - 6, 6, 4, '#0A1A12')
        b.rect(x + 3, y - 5, 3, 1, PAL['green'])

    # ✎ CAMBIAR: movimiento especial (aquí: un destello verde que crece)
    if p.special > 0:
        r = 2 + p.special * 9
        for a in range(0, 360, 20):
            x = hd[0] + math.cos(math.radians(a)) * r
            y = hd[1] + math.sin(math.radians(a)) * r
            b.set(x, y, PAL['green'] if a % 40 else PAL['shine'])

    # SIN contorno blanco: luz de contorno arriba-derecha para separar la silueta del fondo negro
    if RIM:  # ✎ actívala si el personaje se pierde en el fondo negro
        b.rim_light(PAL['rim'], (1, -1))
    return b


# ✎ CAMBIAR: poses de la hoja (8 recomendadas; nombre interno → etiqueta en la hoja va en el JSON)
POSES = {
    'idle':  Pose(),
    'wave':  Pose(upF=115, loF=170, eyes='happy', mouth='grin'),
    'point': Pose(upF=90, loF=90, mouth='o'),
    'think': Pose(upF=30, loF=-150, mouth='flat'),
    'cheer': Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', mouth='grin', bodyDy=-1),
    'wow':   Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', mouth='o'),
    'prop':  Pose(upF=70, loF=95, upB=70, loB=95, prop='laptop'),
    'wink':  Pose(upF=90, loF=130, eyes='wink', mouth='grin'),
}


def exportar(carpeta: str):
    os.makedirs(carpeta, exist_ok=True)
    for n, p in POSES.items():
        draw(p).sprite().save(f'{carpeta}/p_{n}.png')
    for i, t in enumerate([0, 0.7, 1.4, 2.1]):  # ✎ animación en reposo
        draw(replace(POSES['idle'], t=t, bodyDy=[0, -1, 0, 1][i])).sprite().save(f'{carpeta}/p_anim{i}.png')
    for i, s in enumerate([0.0, 0.5, 1.0]):     # ✎ movimiento especial
        draw(replace(POSES['point'], special=s)).sprite().save(f'{carpeta}/p_esp{i}.png')
    print('sprites en', carpeta)


if __name__ == '__main__':
    exportar(sys.argv[1] if len(sys.argv) > 1 else 'salida/plantilla')
