"""RINGO · animaciones: reposo zen, «¡Relax!» y el gag «Mandarina y pajarito».

    python3 mascotas/animar_mascotas.py ringo
"""
from __future__ import annotations
import math

from ringo import Pose, draw, PAL
from pixel import OX, OY
from animar import (Clip, MS, FX, keys, seg, osc, back, bounce, ease_in, ease_out, smooth, blink,
                    stretch, shift, squash, sparkle, bang, sweat, dust, puff, burst, ring, text, text_w,
                    glyph, note, float_text)

CUT = OY - 6
HX, HY = OX + 3, OY - 21           # centro de la cabeza en reposo
CX, CY = OX + 15, OY - 5           # coco
ORANGE, ORANGE_D, LEAF = '#F28A1C', '#C8641A', '#00C063'
BIRD, BIRD_D, BEAK = '#3E73D8', '#2A4F86', '#F2C230'


def bubbles(b, f, k=1.0):
    """Burbujitas en el coco mientras sorbe."""
    for i in range(3):
        ph = (f * 0.5 + i * 1.7) % 4
        if ph < 3 * k:
            b.set(CX - 2 + i * 2, CY - 6 - round(ph), FX['white'] if i % 2 else PAL['straw'])


def breathe(b, f, N):
    return stretch(b, 1 if osc(f, N) > 0.2 else 0, CUT)


def reposo() -> Clip:
    c = Clip('reposo', 'zen: respira muy despacio, la sombrilla se mece y de vez en cuando da un sorbo', bucle=True)
    N = 48
    for f in range(N):
        sip = 30 <= f < 40
        p = Pose(t=f / N * math.pi, mouth='sip' if sip else 'smile')
        b = breathe(draw(p), f, N)
        if sip:
            bubbles(b, f)
        c.add(b, MS + 20)
    return c


def verdict(b, s, x, y, k_in, shake=0):
    """«WA» rojo que cae y tiembla (s < 0.5), se deshace en píxeles verdes y se arma «AC» (s → 1)."""
    if s < 0.45:
        dy = round((1 - bounce(k_in)) * -14)
        text(b, 'WA', x + shake, y + dy, PAL['red'])
    elif s < 0.75:
        k = seg(s, 0.45, 0.75)
        for i, (gx, gy) in enumerate(((0, 0), (2, 1), (4, 3), (1, 4), (5, 2), (6, 0), (7, 4), (3, 2))):
            ang = i * 0.8 + k * 3
            r = k * 4
            col = PAL['red'] if k < 0.35 and i % 2 else PAL['green']
            b.set(x + gx + round(math.cos(ang) * r), y + gy + round(math.sin(ang) * r) - round(k * 2), col)
    else:
        k = seg(s, 0.75, 0.85)
        if k > 0.2:
            text(b, 'AC', x, y - round((back(k, 3) - 1) * 4), PAL['green'])


def especial() -> Clip:
    c = Clip('especial', '¡Relax!: cae un «WA» temblando, Ringo ni se inmuta, sorbe y el veredicto pasa a «AC»', bucle=False)
    N = 66
    vx, vy = HX - 6, HY - 18
    for f in range(N):
        s = keys(f, [(0, 0), (22, 0.44), (30, 0.6), (40, 0.8), (66, 1)], smooth)
        sip = 22 <= f < 38
        eyes = 'line' if 10 <= f < 16 else 'calm'          # abre un ojo… y lo vuelve a cerrar
        mouth = 'sip' if sip else ('grin' if f >= 44 else 'smile')
        up, lo = (80, 170) if f >= 46 else (0, 0)
        p = Pose(t=f / 30, eyes=eyes, mouth=mouth, up=up, lo=lo)
        b = draw(p)
        b = stretch(b, 1 if 44 <= f < 48 else 0, CUT)
        shake = round(osc(f, 2, 1)) if 6 <= f < 22 else 0
        verdict(b, s, vx, vy, seg(f, 0, 8), shake)
        if 6 <= f < 22 and f % 4 < 2:                      # alarma roja alrededor del «WA»
            burst(b, vx + 3, vy + 2, seg(f % 4, 0, 2), 5, 8, 6, PAL['red'])
        if 10 <= f < 16:
            text(b, '...', HX - 14, HY - 9, FX['white'])
        if sip:
            bubbles(b, f)
        if 40 <= f < 50:
            ring(b, vx + 3, vy + 2, seg(f, 40, 50), 10, PAL['green'])
        sparkle(b, vx - 3, vy - 2, seg(f, 42, 52), PAL['green'])
        sparkle(b, vx + 10, vy + 5, seg(f, 46, 56), PAL['yellow'])
        sparkle(b, HX - 10, HY - 6, seg(f, 50, 60), PAL['yellow'])
        c.add(b)
    c.hold(600)
    return c


def tangerine(b, x, y):
    b.ellipse(x, y, 2.6, 2.4, ORANGE)
    b.set(x + 1, y + 1, ORANGE_D); b.set(x, y + 1, ORANGE_D); b.set(x - 1, y - 1, '#FFC27A')
    b.set(x, y - 3, LEAF); b.set(x + 1, y - 3, LEAF)


def bird(b, x, y, flap):
    """Pajarito de 5 × 4: ala arriba o abajo."""
    x, y = round(x), round(y)
    b.rect(x, y, 4, 3, BIRD); b.rect(x + 1, y + 2, 3, 1, BIRD_D)
    b.set(x + 3, y, FX['ink']); b.set(x + 4, y + 1, BEAK)
    if flap:
        b.rect(x, y - 2, 2, 2, BIRD_D)
    else:
        b.rect(x + 1, y + 1, 2, 1, BIRD_D)
    b.set(x + 1, y + 3, BEAK); b.set(x + 2, y + 3, BEAK)


def mandarina() -> Clip:
    """Gag: cae una mandarina, rebota en la cabeza y se queda ahí. Ringo, tranquilo. Llega un pajarito,
    se posa encima de la mandarina y canta. Ringo sonríe más."""
    c = Clip('mandarina', 'gag: le cae una mandarina en la cabeza y un pajarito se posa encima; Ringo ni se mueve', bucle=False)
    N = 90
    top = HY - 10                                         # dónde queda la mandarina
    for f in range(N):
        # la mandarina: cae (0-8), rebota (8-18) y se queda
        if f < 8:
            ty = keys(f, [(0, top - 26), (8, top)], ease_in)
        elif f < 18:
            ty = top - math.sin(seg(f, 8, 18) * math.pi) * 6
        else:
            ty = top
        hit = f in (8, 9)
        bx_ = keys(f, [(40, OX + 30), (54, HX + 1)], ease_out)
        by_ = keys(f, [(40, top - 22), (48, top - 16), (54, top - 6)], smooth) if f < 54 else top - 6
        mouth = 'grin' if f >= 66 else 'smile'
        eyes = 'line' if 20 <= f < 26 else 'calm'
        p = Pose(t=f / 30, eyes=eyes, mouth=mouth)
        b = draw(p)
        if hit:
            b = stretch(b, -1, CUT)
        tx = HX + (1 if f >= 8 else 0)
        tangerine(b, tx, round(ty) - (1 if hit else 0))
        if 8 <= f < 13:
            burst(b, tx, top, seg(f, 8, 13), 3, 7, 6, FX['white'])
        if 20 <= f < 30:
            text(b, '...', HX - 15, HY - 9, FX['white'])
        if f >= 40:
            fl = f < 54 and f % 4 < 2
            if f >= 54 and 60 <= f < 76:
                fl = (f // 3) % 2 == 0 and f < 62
            bird(b, bx_, by_ - 3 + (1 if 56 <= f < 58 else 0), fl)
        if 62 <= f < 84:                                  # canta
            note(b, HX + 8 + (f - 62) // 4, HY - 20 - (f - 62) // 3, FX['white'] if (f // 4) % 2 else PAL['yellow'])
        sparkle(b, HX - 9, HY - 5, seg(f, 70, 80), PAL['yellow'])
        c.add(b)
    c.hold(700)
    return c


def clips():
    return [reposo(), especial(), mandarina()]
