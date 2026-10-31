"""GLOBÍN · guía del Módulo de Maratones (reconstruido a partir de su hoja de concepto).

Cabeza de globo rojo con brillo y cejas, ojos grandes y blancos, buzo oscuro cuya capucha abraza el
globo, cordones amarillos, la «L» de Goslint, manos rojas, jean azul y tenis verdes.
Especial: «¡A inflar y despegar!» (sopla, se infla y despega con confeti).

    python3 mascotas/globin.py salida/globin
"""
from __future__ import annotations
import math, os, sys
from dataclasses import dataclass, replace

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
from pixel import Buf, OX, OY, arm

PAL = {
    'red': '#E0362C', 'redD': '#A82A24', 'redL': '#FF8A80',
    'eye': '#141018', 'white': '#FFFFFF',
    'hood': '#2B3550', 'hoodD': '#1E2640', 'hoodL': '#4A5A86',
    'cord': '#F2B21C', 'jean': '#2F6FD6', 'jeanD': '#2456A8', 'jeanL': '#8FB8FF',
    'green': '#00C063', 'greenD': '#00864A',
}


@dataclass
class Pose:
    upF: float = 12; loF: float = 6; upB: float = 12; loB: float = 6
    eyes: str = 'open'      # open · happy · wide · closed · wink
    mouth: str = 'smile'    # smile · grin · o · flat
    brows: str = 'focus'    # focus · up
    headDy: int = 0
    bodyDy: int = 0
    t: float = 0.0
    prop: str | None = None # bulb · cloud
    special: float = 0.0


def draw(p: Pose) -> Buf:
    b = Buf()
    by = OY + p.bodyDy
    s = p.special
    inflate = min(1.0, s * 1.6)                # el globo crece en la primera parte
    lift = round(max(0.0, s - 0.6) * 15)       # y despega al final
    by -= lift
    hx, hy = OX, by - 23 + p.headDy - round(inflate * 2)
    shF, shB = (OX + 4, by - 12), (OX - 5, by - 12)

    arm(b, shB, p.upB, p.loB, -1, PAL['hood'], PAL['hood'], PAL['red'])

    # piernas: jean + tenis verdes
    for x in (OX - 4, OX + 1):
        b.rect(x, by - 6, 3, 5, PAL['jean'])
        b.rect(x + 2, by - 6, 1, 5, PAL['jeanD'])
        b.rect(x - (1 if x < OX else 0), by - 1, 4, 1, PAL['green'])
    b.rect(OX - 4, by - 7, 8, 2, PAL['jean'])
    b.set(OX - 3, by - 7, PAL['jeanL'])          # bolsillo

    # torso: buzo con cordones y la «L»
    b.rect(OX - 4, by - 14, 8, 7, PAL['hood'])
    b.rect(OX - 5, by - 13, 10, 4, PAL['hood'])
    b.rect(OX + 3, by - 13, 1, 6, PAL['hoodD'])
    b.rect(OX - 3, by - 13, 1, 2, PAL['cord']); b.rect(OX + 2, by - 13, 1, 2, PAL['cord'])
    b.rect(OX - 1, by - 11, 1, 3, PAL['green']); b.rect(OX - 1, by - 9, 3, 1, PAL['green'])

    # cabeza: globo rojo (se infla con el especial)
    rx, ry = 7.2 + inflate * 1.6, 6.8 + inflate * 1.6
    b.ellipse(hx, hy, rx, ry, PAL['red'])
    for y in range(int(hy - ry), int(hy + ry) + 1):  # sombra a la derecha
        for x in range(int(hx + rx * 0.55), int(hx + rx) + 1):
            if b.get(x, y) == PAL['red'] and b.get(x + 1, y) is None:
                b.set(x, y, PAL['redD'])
    b.set(hx - 4, hy - 5, PAL['redL']); b.set(hx - 5, hy - 4, PAL['redL'])
    # capucha que abraza el globo por abajo
    cy = hy + round(ry) - 1                      # la capucha sigue al globo cuando se infla
    b.rect(hx - 7, cy - 3, 2, 3, PAL['hood']); b.rect(hx + 5, cy - 3, 2, 3, PAL['hood'])
    b.rect(hx - 5, cy, 10, by - 13 - cy, PAL['hood']); b.set(hx - 7, cy - 3, PAL['hoodL']); b.set(hx + 6, cy - 3, PAL['hoodL'])

    # cejas, ojos y boca
    bdy = -1 if p.brows == 'up' else 0
    b.rect(hx - 5, hy - 4 + bdy, 3, 1, PAL['eye']); b.rect(hx + 2, hy - 4 + bdy, 3, 1, PAL['eye'])

    def eye(x, which):
        e = p.eyes
        if e == 'wink':
            e = 'closed' if which else 'open'
        if e in ('open', 'wide'):
            h = 4 if e == 'wide' else 3
            b.rect(x, hy - 2, 3, h, PAL['white']); b.rect(x + 1, hy - 1, 1, h - 1, PAL['eye'])
        elif e == 'happy':
            b.set(x, hy, PAL['white']); b.rect(x, hy - 1, 3, 1, PAL['white']); b.set(x + 2, hy, PAL['white'])
        else:
            b.rect(x, hy, 3, 1, PAL['eye'])
    eye(hx - 5, 0)
    eye(hx + 2, 1)
    mx, my = hx - 1, hy + 3
    if p.mouth == 'smile':
        b.set(mx - 1, my, PAL['eye']); b.set(mx + 2, my, PAL['eye']); b.rect(mx, my + 1, 2, 1, PAL['eye'])
    elif p.mouth == 'grin':
        b.rect(mx - 1, my, 4, 1, PAL['white']); b.rect(mx - 1, my + 1, 4, 1, PAL['eye'])
    elif p.mouth == 'o':
        b.rect(mx, my, 2, 2, PAL['eye'])
    else:
        b.rect(mx, my + 1, 2, 1, PAL['eye'])

    hd = arm(b, shF, p.upF, p.loF, 1, PAL['hood'], PAL['hood'], PAL['red'])

    if p.prop == 'bulb':  # bombilla de idea encima de la cabeza
        x, y = hx + 6, hy - 11
        b.ellipse(x, y, 2.4, 2.4, PAL['cord']); b.rect(x - 1, y + 2, 2, 2, '#BFC5CD'); b.set(x - 1, y - 1, PAL['white'])
        for a in range(0, 360, 60):
            b.set(x + math.cos(math.radians(a)) * 4.5, y + math.sin(math.radians(a)) * 4.5, PAL['cord'])
    if p.prop == 'cloud':  # nube de pensamiento
        x, y = hx - 13, hy - 9
        b.ellipse(x, y, 4, 2.4, '#3E73D8'); b.ellipse(x + 2, y - 1, 2.5, 2.2, '#3E73D8')
        for i in range(3):
            b.set(x - 2 + i * 2, y, PAL['white'])
        b.set(x + 5, y + 3, '#3E73D8'); b.set(x + 7, y + 5, '#3E73D8')

    if s > 0:
        if s < 0.6:  # sopla: bocanada de aire a la derecha
            for i in range(3):
                b.set(hx + rx + 2 + i * 2, hy + 3 - (i % 2), '#8FA8C6')
        else:        # despega: confeti alrededor y nubecitas debajo
            for i, c in enumerate(('#F2B21C', PAL['green'], '#3E73D8', PAL['red'], PAL['white'])):
                a = math.radians(i * 72 + 20)
                b.set(hx + math.cos(a) * (rx + 4), hy + math.sin(a) * (ry + 3), c)
            for x in range(OX - 5, OX + 5, 3):
                b.rect(x, OY + 1, 2, 1, '#8FA8C6')
    return b


POSES = {
    'idle':  Pose(),
    'wave':  Pose(upF=115, loF=170, eyes='happy', mouth='grin', brows='up'),
    'point': Pose(upF=90, loF=90, mouth='o'),
    'think': Pose(upF=30, loF=-150, mouth='flat', prop='cloud'),
    'prop':  Pose(upF=30, loF=-150, eyes='wide', prop='bulb', brows='up'),
    'cheer': Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', mouth='grin', bodyDy=-1, brows='up'),
    'wow':   Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', mouth='o', brows='up', prop='bulb'),
    'wink':  Pose(upF=90, loF=130, eyes='wink', mouth='grin'),
}


def exportar(carpeta: str):
    os.makedirs(carpeta, exist_ok=True)
    for n, p in POSES.items():
        draw(p).sprite().save(f'{carpeta}/p_{n}.png')
    # respira y parpadea
    for i, (dy, e) in enumerate([(0, 'open'), (-1, 'open'), (0, 'closed'), (1, 'open')]):
        draw(replace(POSES['idle'], bodyDy=dy, eyes=e)).sprite().save(f'{carpeta}/p_anim{i}.png')
    esp = Pose(upF=150, loF=175, upB=150, loB=175, eyes='closed', mouth='o')
    for i, s in enumerate([0.3, 0.6, 1.0]):
        q = esp if i == 0 else replace(esp, eyes='wide' if i == 1 else 'happy', mouth='grin')
        draw(replace(q, special=s)).sprite().save(f'{carpeta}/p_esp{i}.png')
    print('sprites en', carpeta)


if __name__ == '__main__':
    exportar(sys.argv[1] if len(sys.argv) > 1 else 'salida/globin')
