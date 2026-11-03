"""VELASCO · animaciones: reposo «ajá», «¡Juez a mano!» y el gag «O(n²)».

    python3 mascotas/animar_mascotas.py velasco
"""
from __future__ import annotations
import math

from velasco import Pose, draw, PAL, draw_sheet
from pixel import OX, OY, dirv
from animar import (Clip, MS, FX, keys, seg, osc, back, ease_in, ease_out, smooth, blink,
                    shift, lean, squash, stretch, sparkle, bang, sweat, dust, puff, burst, ring,
                    text, text_w, question, float_text)

HX, HY = OX, OY - 22


def hand_pos(up, lo, by=OY):
    """Dónde queda la mano delantera (misma cuenta que arm() con el brazo levantado)."""
    sh = (OX + 4, by - 12)
    ex, ey = dirv(up, 1)
    el = (sh[0] + ex * 4, sh[1] + ey * 4)
    ux, uy = dirv(lo, 1)
    return el[0] + ux * 4, el[1] + uy * 4


def reposo() -> Clip:
    c = Clip('reposo', 'manos juntas: respira, parpadea y asiente dos veces («ajá»)', bucle=True)
    N = 48
    for f in range(N):
        nod = 1 if f in (26, 27, 32, 33) else 0
        p = Pose(clasp=True, bodyDy=-1 if osc(f, 24) > 0.3 else 0, headDy=nod,
                 eyes='closed' if blink(f, N, 10, 2) or nod else 'open',
                 mouth='grin' if 26 <= f < 38 else 'smile', brows='up' if 26 <= f < 38 else 'flat')
        c.add(draw(p))
    return c


CHECK = [(1, 5), (2, 6), (3, 7), (2, 5), (3, 6), (4, 6), (4, 5), (5, 5), (5, 4), (6, 4), (6, 3)]


def especial() -> Clip:
    c = Clip('especial', '¡Juez a mano!: recibe la hoja, la lee línea por línea, marca en rojo, corrige y pone el chulo verde', bucle=False)
    N = 78
    for f in range(N):
        up = keys(f, [(0, 0), (6, 60)], back)
        lo = keys(f, [(0, -90), (6, 150)], back)
        by = OY
        stage = 0
        eyes, brows, mouth, handB, upB, loB = 'focus', 'flat', 'flat', 'fist', 12, 6
        if f < 8:
            eyes = 'open'
        elif f < 30:
            eyes = 'focus'
        elif f < 44:
            stage, eyes, brows, mouth = 1, 'focus', 'focus', 'o'
        elif f < 58:
            eyes, brows, mouth = 'focus', 'flat', 'smile'
        else:
            eyes, brows, mouth, handB, upB, loB = 'happy', 'up', 'grin', 'thumb', keys(f, [(58, 12), (62, 40)], back), keys(f, [(58, 6), (62, 175)])
        line = int(seg(f, 10, 30) * 4) if 10 <= f < 30 else -1
        p = Pose(upF=up, loF=lo, upB=upB, loB=loB, eyes=eyes, brows=brows, mouth=mouth, handB=handB,
                 headDy=1 if line >= 0 and f % 5 < 2 else 0, bodyDy=-1 if 58 <= f < 62 else 0)
        b = draw(p)
        hd = hand_pos(up, lo, OY + p.bodyDy)
        if f >= 6:
            draw_sheet(b, hd, 1 if 30 <= f < 44 else 0)
            sx, sy = round(hd[0]) - 1, round(hd[1]) - 11
            if line >= 0:                                    # cursor de lectura: subraya la línea que va leyendo
                b.rect(sx + 1, sy + 3 + line * 2, 6, 1, PAL['lilac'])
            if 30 <= f < 36:
                bang(b, sx + 10, sy - 3, FX['red'])
            if 44 <= f < 50:                                 # borra el error: las marcas rojas se van
                b.rect(sx + 1, sy + 5, 6, 1, PAL['white'])
            if f >= 48:                                      # traza el chulo verde, píxel a píxel
                n = int(seg(f, 48, 56) * len(CHECK))
                for px, py in CHECK[:n]:
                    b.set(sx + px, sy + py, PAL['green'])
            if 56 <= f < 66:
                ring(b, sx + 4, sy + 5, seg(f, 56, 66), 11, PAL['green'])
            sparkle(b, sx + 11, sy - 2, seg(f, 58, 68), '#7CFFB3')
            sparkle(b, sx - 3, sy + 1, seg(f, 62, 72), FX['yellow'])
        if f >= 6:
            from velasco import draw_hand
            draw_hand(b, hd, 'fist', 1)
        c.add(b)
    c.hold(600)
    return c


def complejidad() -> Clip:
    """Gag: piensa en su algoritmo y aparece «O(n²)» en rojo. Tiembla, sale «TLE», el profe suda…
    piensa, se le prende la idea, tacha el O(n²) y queda «O(n)» en verde. Guiño y pulgar arriba."""
    c = Clip('complejidad', 'gag: aparece «O(n²)», sale «TLE», suda, piensa y lo cambia por «O(n)»; guiño y pulgar arriba', bucle=False)
    N = 96
    tx, ty = HX - 9, HY - 20
    for f in range(N):
        eyes, brows, mouth, hand = 'focus', 'focus', 'flat', 'fist'
        up, lo, upB, loB = 30, -150, 12, 6
        if 12 <= f < 36:
            eyes, brows, mouth = 'wide', 'up', 'o'
        elif 36 <= f < 50:
            eyes, brows, mouth = 'focus', 'focus', 'flat'
        elif 50 <= f < 58:
            eyes, brows, mouth = 'wide', 'up', 'grin'
        elif f >= 70:
            eyes, brows, mouth, hand = 'wink', 'up', 'grin', 'thumb'
            up, lo = keys(f, [(70, 30), (74, 40)], back), keys(f, [(70, -150), (74, 175)], back)
        p = Pose(upF=up, loF=lo, upB=upB, loB=loB, eyes=eyes, brows=brows, mouth=mouth, hand=hand,
                 bodyDy=-1 if 50 <= f < 54 or 70 <= f < 73 else 0)
        b = draw(p)
        if 12 <= f < 16:
            b = squash(b, 1.08, 0.92)                         # respingo
        if 20 <= f < 36:
            b = shift(b, round(osc(f, 2, 1)), 0)
        shake = round(osc(f, 2, 1)) if 16 <= f < 36 else 0
        if 10 <= f < 60:                                      # «O(n²)» en rojo
            k = seg(f, 10, 14)
            if k > 0.2:
                text(b, 'O(n²)', tx + shake, ty - round((back(k, 3) - 1) * 3), FX['red'])
        if 22 <= f < 36:                                      # sello «TLE»
            text(b, 'TLE', HX + 9, HY - 10 - round((1 - back(seg(f, 22, 26), 3)) * 3), FX['yellow'])
            sweat(b, HX - 8, HY - 6, seg(f, 22, 30))
            sweat(b, HX + 8, HY - 5, seg(f, 27, 35))
        if 36 <= f < 50:
            text(b, '...', HX + 8, HY - 9, FX['white'])
        if 50 <= f < 56:
            bang(b, HX + 9, HY - 14, FX['yellow'])
            burst(b, HX + 9, HY - 11, seg(f, 50, 56), 3, 7, 6, FX['yellow'])
        if 54 <= f < 60:                                      # lo tacha
            n = int(seg(f, 54, 58) * 20)
            for i in range(n):
                b.set(tx - 1 + i, ty + 2, PAL['white'])
        if 60 <= f < 64:
            burst(b, tx + 9, ty + 2, seg(f, 60, 64), 4, 10, 10, FX['red'])
        if f >= 62:                                           # «O(n)» en verde
            k = seg(f, 62, 66)
            if k > 0.2:
                text(b, 'O(n)', tx + 2, ty - round((back(k, 3) - 1) * 3), PAL['green'])
            sparkle(b, tx - 2, ty - 1, seg(f, 64, 74), '#7CFFB3')
            sparkle(b, tx + 18, ty + 4, seg(f, 68, 78), FX['yellow'])
        c.add(b)
    c.hold(500)
    return c


def clips():
    return [reposo(), especial(), complejidad()]
