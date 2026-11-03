"""PYPO · animaciones: reposo serpenteante, «La vía del @ optimizado» y el gag «La mosca».

    python3 mascotas/animar_mascotas.py pypo
"""
from __future__ import annotations
import math

from pypo import Pose, draw, PAL
from pixel import OX, OY
from animar import (Clip, MS, FX, keys, seg, osc, back, ease_in, ease_out, smooth, blink,
                    shift, lean, squash, stretch, sparkle, bang, question, sweat, dust, puff, burst, ring,
                    text, text_w, float_text, heart, speed_lines)

CUT = OY - 6
HX, HY = OX, OY - 23


def reposo() -> Clip:
    c = Clip('reposo', 'se mece como serpiente, menea la cola en «@», saca la lengüita y parpadea', bucle=True)
    N = 40
    for f in range(N):
        tongue = 22 <= f < 28 and f % 2 == 0
        p = Pose(tail=round(osc(f, 20, 1.2)), mouth='tongue' if tongue else 'smile',
                 eyes='closed' if blink(f, N, 8, 2) else 'open')
        b = stretch(draw(p), 1 if osc(f, 20, 1, 0.25) > 0.4 else 0, CUT)
        b = lean(b, round(osc(f, N, 2)), base=OY - 6)
        c.add(b)
    return c


def especial() -> Clip:
    """Se enrosca para tomar impulso, lanza la cola como gancho «@» al borde del muro, salta en arco por
    encima (el camino corto) y aterriza junto a la bandera, que se pone verde: «AC»."""
    c = Clip('especial', 'La vía del @ optimizado: toma impulso, engancha el muro con la cola, salta en arco y aterriza en «AC»', bucle=False)
    N = 72
    for f in range(N):
        if f < 10:                                     # mira el muro y toma impulso
            s = 0.001
            p = Pose(upF=60, loF=90, mouth='flat', eyes='open', special=s)
        elif f < 16:                                   # lanza el gancho
            s = keys(f, [(10, 0.02), (16, 0.15)])
            p = Pose(upF=60, loF=90, mouth='grin', eyes='open', special=s)
        elif f < 40:                                   # salto en arco
            s = keys(f, [(16, 0.15), (40, 0.999)], smooth)
            p = Pose(upF=60, loF=90, upB=60, loB=90, mouth='grin', eyes='wide', special=s)
        else:
            s = 1.0
            p = Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', mouth='grin', special=s,
                     tail=round(osc(f, 6, 1)))
        b = draw(p)
        if 4 <= f < 10:
            b = stretch(b, -2, CUT)                    # se enrosca
        if f in (40, 41):
            b = squash(b, 1.15, 0.85, OX + 30, OY)     # aterriza
        k = max(0.0, s - 0.15) / 0.85
        cx = OX + round(k * 30)
        hop = round(math.sin(k * math.pi) * 14)
        if 12 <= f < 36:                               # la cola-gancho «@» agarrada al borde del muro
            ax, ay = OX + 13, OY - 16
            reach = seg(f, 12, 15)
            sx, sy = cx + 6, OY - hop - 4
            ex, ey = sx + (ax - sx) * reach, sy + (ay - sy) * reach
            b.line(sx, sy, ex, ey, PAL['g'])
            b.line(sx + 1, sy, ex + 1, ey, PAL['gD'], th=1)
            if reach >= 1:
                for dx, dy in ((0, -2), (1, -3), (2, -3), (3, -2), (3, -1), (2, 0)):
                    b.set(ax + dx, ay + dy, PAL['g'])
        if 18 <= f < 38:
            speed_lines(b, cx - 12, OY - hop - 18, 12, side=-1, ln=4, col=FX['white'], gap=3)
        if 10 <= f < 16:
            burst(b, OX + 13, OY - 15, seg(f, 12, 16), 2, 5, 6, FX['white'])
        if 40 <= f < 48:
            dust(b, OX + 30, OY, seg(f, 40, 48))
            ring(b, OX + 47, OY - 12, seg(f, 40, 50), 10, PAL['green'])
        sparkle(b, OX + 54, OY - 20, seg(f, 44, 54), PAL['yellow'])
        sparkle(b, OX + 20, OY - 32, seg(f, 48, 58), PAL['green'])
        c.add(b)
    c.hold(500)
    return c


def fly(b, x, y, f):
    x, y = round(x), round(y)
    b.set(x, y, FX['ink']); b.set(x + 1, y, FX['ink'])
    b.set(x, y - 1 - (f % 2), '#C9D3DC'); b.set(x + 1, y - 1 - ((f + 1) % 2), '#C9D3DC')


def mosca() -> Clip:
    """Gag: una mosca zumba alrededor de su cabeza; Pypo la sigue meciéndose cada vez más… se
    concentra, ¡lengüetazo!, se la traga y el bulto baja por todo su cuerpo hasta la cola. Satisfecho."""
    c = Clip('mosca', 'gag: sigue a una mosca meciéndose, la atrapa con un lengüetazo y el bulto baja por su cuerpo', bucle=False)
    N = 96
    for f in range(N):
        a = f * 0.35
        fx = HX + math.cos(a) * 12
        fy = HY - 8 + math.sin(a * 2) * 4
        lk = 0
        eyes, mouth = 'open', 'smile'
        if f < 36:
            lk = round(max(-3, min(3, (fx - HX) / 4)))   # se mece siguiendo la mosca
        elif f < 44:
            eyes, mouth = 'closed', 'flat'              # se concentra
            fx, fy = HX + 10, HY - 10
        elif f < 50:
            eyes, mouth = 'wide', 'o'
            fx, fy = HX + 10, HY - 10
        elif f < 62:
            eyes, mouth = 'happy', 'flat'
        else:
            eyes, mouth = ('happy' if f < 84 else 'wink'), 'grin'
        p = Pose(eyes=eyes, mouth=mouth, tail=round(osc(f, 12, 1)) if f >= 62 else 0)
        b = draw(p)
        if 44 <= f < 46:
            b = squash(b, 0.92, 1.08)
        if 62 <= f < 84:                                # el bulto baja por el cuerpo
            k = seg(f, 62, 84)
            y = round(HY + 6 + k * 20)
            w = 5 if y < OY - 9 else 10
            for d in (0, 1):
                b.rect(HX - w - 1 - d, y, 1, 3 - d, PAL['gL']); b.rect(HX + w + d, y, 1, 3 - d, PAL['gL'])
            b.rect(HX - w - 1, y + 2, 1, 1, PAL['gD']); b.rect(HX + w, y + 2, 1, 1, PAL['gD'])
        b = lean(b, lk, base=OY - 6)
        if f < 46:
            fly(b, fx, fy, f)
            if f < 36 and f % 8 < 4:
                text(b, 'BZZ', fx - 5, fy - 9, '#C9D3DC')
        if 46 <= f < 50:                                # lengüetazo
            mx, my = HX, HY + 3
            ln = [5, 11, 11, 6][f - 46]
            for i in range(ln):
                b.set(mx + 1 + i, my - i * 13 // 11, PAL['tongue'])
            if f < 48:
                fly(b, mx + ln, my - ln * 13 // 11, f)
        if 50 <= f < 58:
            text(b, 'GLUP', HX - 22, HY - 10, FX['white'])
        if 84 <= f < 96:
            heart(b, HX + 9, HY - 13 - (f - 84) // 3)
        if f >= 86:
            sparkle(b, HX - 10, HY - 8, seg(f, 86, 96), PAL['yellow'])
        c.add(b)
    c.hold(500)
    return c


def clips():
    return [reposo(), especial(), mosca()]
