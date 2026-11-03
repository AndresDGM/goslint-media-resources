"""DIEGO · animaciones: reposo de coach, «¡Orden de ataque!» y el gag «¡Uno más!».

    python3 mascotas/animar_mascotas.py diego
"""
from __future__ import annotations
import math

from diego import Pose, draw, PAL, draw_card, draw_clipboard, draw_hand, draw_watch, CARDS_IN, CARDS_OK
from pixel import OX, OY, dirv
from animar import (Clip, MS, FX, keys, seg, osc, back, ease_in, ease_out, smooth, blink,
                    shift, lean, squash, stretch, sparkle, bang, sweat, dust, puff, burst, ring,
                    text, text_w, float_text, motion_arc)

HX, HY = OX, OY - 22
HIPS = dict(upF=40, loF=-55, upB=40, loB=-55)


def hand_pos(up, lo, by=OY):
    sh = (OX + 6, by - 12)
    hanging = math.cos(math.radians(up)) > 0.8 and math.cos(math.radians(lo)) > 0.8
    L1, L2 = (3, 2.5) if hanging else (4, 4)
    ex, ey = dirv(up, 1)
    el = (sh[0] + ex * L1, sh[1] + ey * L1)
    ux, uy = dirv(lo, 1)
    return el[0] + ux * L2, el[1] + uy * L2


def reposo() -> Clip:
    c = Clip('reposo', 'manos en la cintura: respira, se balancea con seguridad y levanta las cejas («¿listo?»)', bucle=True)
    N = 48
    for f in range(N):
        ready = 28 <= f < 38
        p = Pose(**HIPS, bodyDy=-1 if osc(f, 24) > 0.3 else 0,
                 eyes='closed' if blink(f, N, 8, 2) else 'open',
                 brows='up' if ready else 'flat', mouth='smile' if ready else 'smirk',
                 headDy=1 if f in (30, 31) else 0)
        b = lean(draw(p), osc(f, N, 1.2))
        c.add(b)
    return c


def especial() -> Clip:
    """Saca la tabla, los problemas salen volando desordenados, los lee, los ordena de fácil a difícil
    con un barrido de la mano y ataca el más fácil: la tarjeta se vuelve verde y sale «AC»."""
    c = Clip('especial', '¡Orden de ataque!: lee los problemas, los ordena de fácil a difícil y el más fácil cae en «AC»', bucle=False)
    N = 84
    ok_by_level = {lv: (dx, dy) for dx, dy, lv in CARDS_OK}
    for f in range(N):
        handF, handB = 'fist', 'fist'
        if f < 30:
            up, lo = keys(f, [(0, 40), (5, 50)], back), keys(f, [(0, -55), (5, -80)], back)
            upB, loB = 40, -55
            eyes, brows, mouth = ('focus' if f >= 12 else 'open'), 'focus', 'flat'
        elif f < 48:                                   # barrido para ordenar
            k = seg(f, 30, 44)
            up, lo = lerp_ang(50, 120, ease_out(k)), lerp_ang(-80, 170, ease_out(k))
            upB, loB = 40, -55
            eyes, brows, mouth, handF = 'open', 'focus', 'smirk', 'open'
        elif f < 62:                                   # señala el más fácil
            up, lo = 40, -55
            upB, loB = keys(f, [(48, 40), (52, 140)], back), keys(f, [(48, -55), (52, 170)], back)
            eyes, brows, mouth, handB = 'focus', 'focus', 'grin', 'point'
        else:
            up, lo = keys(f, [(62, 40), (66, 90)], back), keys(f, [(62, -55), (66, 178)], back)
            upB, loB = keys(f, [(62, 140), (66, 90)], back), keys(f, [(62, 170), (66, 178)], back)
            eyes, brows, mouth = 'happy', 'up', 'grin'
        p = Pose(upF=up, loF=lo, upB=upB, loB=loB, eyes=eyes, brows=brows, mouth=mouth, hand=handF, handB=handB,
                 bodyDy=-1 if 62 <= f < 66 or 72 <= f < 75 else 0)
        b = draw(p)
        if 62 <= f < 64:
            b = squash(b, 0.94, 1.06)
        hd = hand_pos(up, lo, OY + p.bodyDy)
        if f < 30:
            draw_clipboard(b, hd)
            draw_hand(b, hd, 'fist', 1)
        # tarjetas: salen de la tabla (2-14), flotan desordenadas, se ordenan (32-46) y la 1 se resuelve (54)
        for i, (dx, dy, lv) in enumerate(CARDS_IN):
            t0 = 2 + i * 3
            k_in = seg(f, t0, t0 + 6)
            if k_in <= 0:
                continue
            sx, sy = hd[0] - 2, hd[1] - 8
            x = sx + (HX + dx - sx) * back(k_in, 1.6)
            y = sy + (HY + dy - sy) * back(k_in, 1.6) + (osc(f + i * 3, 10, 1) if f < 30 else 0)
            ox, oy = ok_by_level[lv]
            k_ok = seg(f, 32 + i * 2, 40 + i * 2)
            x = lerp(x, HX + ox, ease_out(k_ok))
            y = lerp(y, HY + oy, ease_out(k_ok)) - math.sin(k_ok * math.pi) * 3
            if 18 <= f < 28 and (f // 2 + i) % 4 == 0:
                y -= 1                                     # los va leyendo uno por uno
            solved = lv == 1 and f >= 56
            draw_card(b, x, y, lv, solved=solved)
        if 30 <= f < 44:
            motion_arc(b, OX + 6, OY - 18, 9, math.radians(-10), math.radians(-10 - 150 * seg(f, 30, 44)), FX['white'])
        if 44 <= f < 56:                                   # flechitas del orden
            for dx in (-9, -2, 5):
                b.set(HX + dx, HY - 15, PAL['green'])
        x1, y1 = HX + CARDS_OK[0][0] + 2, HY + CARDS_OK[0][1] + 3
        if 54 <= f < 62:
            burst(b, x1, y1, seg(f, 54, 62), 4, 9, 8, FX['yellow'])
        if 56 <= f < 68:
            ring(b, x1, y1, seg(f, 56, 68), 10, PAL['green'])
        float_text(b, 'AC', x1, y1 - 8, seg(f, 56, 84), PAL['green'], rise=5)
        sparkle(b, HX + 12, HY - 12, seg(f, 64, 74), '#7CFFB3')
        sparkle(b, HX - 13, HY - 6, seg(f, 68, 78), FX['yellow'])
        c.add(b)
    c.hold(500)
    return c


def lerp_ang(a, b_, k):
    return a + (b_ - a) * k


def uno_mas() -> Clip:
    """Gag: hace tres flexiones de bíceps contando (+1 · +2 · +3), mira el cronómetro, que pita,
    y te señala: «¡UNO MÁS!»."""
    c = Clip('uno_mas', 'gag: hace flexiones de bíceps contando, mira el cronómetro y te señala: «¡UNO MÁS!»', bucle=False)
    N = 96
    for f in range(N):
        hand, prop = 'fist', None
        upB, loB = 40, -55
        if f < 42:                                      # tres repeticiones
            rep = f // 14
            k = (f % 14) / 14
            up = 90
            lo = 95 + 80 * math.sin(k * math.pi) ** 0.8
            eyes, brows, mouth = ('closed' if math.sin(k * math.pi) > 0.7 else 'focus'), 'focus', 'flat' if k < 0.5 else 'grin'
        elif f < 66:                                    # mira el reloj
            up, lo = keys(f, [(42, 90), (46, 60)], back), keys(f, [(42, 95), (46, 150)], back)
            prop = 'watch'
            eyes, brows, mouth = ('focus' if f < 54 else 'wide'), ('focus' if f < 54 else 'up'), ('flat' if f < 54 else 'o')
        else:                                           # te señala
            up, lo = keys(f, [(66, 60), (70, 80)], back), keys(f, [(66, 150), (70, 95)], back)
            hand = 'point'
            eyes, brows, mouth = 'open', 'focus', 'grin'
        p = Pose(upF=up, loF=lo, upB=upB, loB=loB, eyes=eyes, brows=brows, mouth=mouth, hand=hand, prop=prop,
                 bodyDy=-1 if (f < 42 and math.sin(((f % 14) / 14) * math.pi) > 0.7) else 0)
        b = draw(p)
        if 66 <= f < 69:
            b = lean(b, 2)
        if f < 42:
            k = (f % 14) / 14
            hd = hand_pos(up, lo)
            if 0.4 < k < 0.7:
                sparkle(b, round(hd[0]) + 3, round(hd[1]) + 2, seg(k, 0.4, 0.7), FX['white'])
                sweat(b, HX - 8, HY - 5, seg(k, 0.4, 0.7))
            rep = f // 14
            float_text(b, f'+{rep + 1}', HX + 13, HY - 6, seg(f % 14, 6, 14), PAL['green'], rise=6)
        if 54 <= f < 66:                                # el cronómetro pita
            hd = hand_pos(up, lo)
            if f % 4 < 2:
                burst(b, round(hd[0]), round(hd[1]) - 6, 0.4, 4, 6, 6, FX['yellow'])
            bang(b, HX + 13, HY - 14, FX['yellow'])
        if f >= 70:
            k = seg(f, 70, 74)
            if k > 0.2:
                s = '¡UNO MÁS!'
                text(b, s, OX - text_w(s) // 2, HY - 19 - round((back(k, 3) - 1) * 3), FX['white'])
            if 70 <= f < 78:
                burst(b, OX + 16, HY + 10, seg(f, 70, 78), 3, 8, 8, FX['yellow'])
        c.add(b)
    c.hold(600)
    return c


def lerp(a, b_, t):
    return a + (b_ - a) * t


def clips():
    return [reposo(), especial(), uno_mas()]
