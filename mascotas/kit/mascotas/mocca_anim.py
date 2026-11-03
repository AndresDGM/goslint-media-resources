"""MOCCA · animaciones: reposo inquieto, «¡Garbage collector!» y el gag «Sobrecafeinado».

    python3 mascotas/animar_mascotas.py mocca
"""
from __future__ import annotations
import math

from mocca import Pose, draw, PAL
from pixel import OX, OY, dirv
from animar import (Clip, MS, FX, keys, seg, osc, back, ease_in, ease_out, smooth, blink, clamp,
                    shift, lean, squash, stretch, sparkle, bang, question, sweat, dust, puff, burst, ring,
                    text, text_w, float_text, speed_lines, note, motion_arc)

CUT = OY - 5
HX, HY = OX, OY - 21


def hand_pos(up, lo, by=OY):
    sh = (OX + 4, by - 12)
    ex, ey = dirv(up, 1)
    el = (sh[0] + ex * 4, sh[1] + ey * 4)
    ux, uy = dirv(lo, 1)
    return el[0] + ux * 4, el[1] + uy * 4


def reposo() -> Clip:
    """No se queda quieto: cabecea al ritmo, se balancea, el vapor y el mechón no paran, y da un sorbo."""
    c = Clip('reposo', 'inquieto: cabecea al ritmo, se balancea, el vapor sube y da un sorbo de café', bucle=True)
    N = 48
    for f in range(N):
        sip = 30 <= f < 40
        beat = f % 6 < 2
        if sip:
            p = Pose(upF=keys(f, [(30, 40), (33, 140)], back), loF=keys(f, [(30, 95), (33, -170)], back),
                     prop='cup', eyes='happy', mouth='o', t=f * 0.12)
        else:
            p = Pose(upF=40, loF=95, prop='cup', t=f * 0.12, headDy=1 if beat else 0,
                     eyes='closed' if blink(f, N, 18, 2) else 'open', mouth='smile')
        b = stretch(draw(p), 1 if osc(f, 12) > 0.4 else 0, CUT)
        b = lean(b, round(osc(f, 24, 1.4)))
        if not sip and f % 12 < 8:
            note(b, HX - 12 - (f % 12) // 3, HY - 10 - (f % 12) // 2, FX['white'] if f % 24 < 12 else PAL['steam'])
        c.add(b)
    return c


TRASH = [(47, 48), (50, 44), (53, 49), (56, 46), (59, 48), (62, 43), (64, 49), (61, 40)]


def especial() -> Clip:
    """Ve los píxeles basura, saca la escoba de 8 bits y barre de ida y vuelta avanzando; cada píxel
    que toca sale volando y se convierte en memoria libre (verde)."""
    c = Clip('especial', '¡Garbage collector!: saca la escoba y barre los píxeles basura avanzando; se vuelven memoria libre', bucle=False)
    N = 78
    gone = {}
    for f in range(N):
        walk = round(keys(f, [(14, 0), (54, 16)], smooth))
        sw = 0.5 + 0.9 * math.sin((f - 14) * 2 * math.pi / 12) if 14 <= f < 54 else 0.0
        if f < 10:
            p = Pose(upF=40, loF=95, prop='cup', eyes='wide', mouth='o', t=f * 0.12)
        elif f < 14:
            p = Pose(upF=30, loF=20, prop='broom', sweep=0.0, trash=False, eyes='wide', mouth='grin')
        elif f < 54:
            p = Pose(upF=30 + sw * 10, loF=20, prop='broom', sweep=sw, trash=False, eyes='open', mouth='grin',
                     t=f * 0.2)
        else:
            p = Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', mouth='grin', t=f * 0.2)
        b = draw(p)
        if 14 <= f < 54:
            b = lean(b, round(-sw * 1.5))
            b = shift(b, walk, -1 if f % 6 < 3 else 0)
        elif f >= 54:
            b = shift(b, 16, -1 if 54 <= f < 58 else 0)
        # dónde está la cabeza de la escoba
        hd = hand_pos(p.upF, p.loF)
        head_x = round(hd[0]) + round((1 - sw) * 6) - 3 + walk
        for i, (tx, ty) in enumerate(TRASH):
            if i not in gone and 14 <= f < 54 and abs(head_x - tx) <= 2 and ty >= 45:
                gone[i] = f
            if i not in gone and 14 <= f < 54 and ty < 45 and abs(head_x - tx) <= 2 and sw > 1.0:
                gone[i] = f
            if i not in gone and f >= 50:              # el último barrido se lleva lo que quedaba
                gone[i] = f + (len(gone) % 3)
            if i in gone:
                k = seg(f, gone[i], gone[i] + 8)
                if k < 1:
                    x = tx + 6 * ease_out(k) + 2
                    y = ty - 10 * math.sin(k * math.pi)
                    b.set(x, y, PAL['trash'] if k < 0.5 else PAL['green'])
                    if k > 0.6:
                        sparkle(b, round(x), round(y), seg(k, 0.6, 1.0), PAL['green'])
            else:
                bob = round(osc(f + i * 3, 10, 0.6)) if ty < 46 else 0
                b.set(tx, ty + bob, PAL['trash'])
                b.set(tx + 1, ty + bob, '#4A4E57')
        if 10 <= f < 14:
            puff(b, hd[0] + 2, hd[1], seg(f, 10, 14), FX['white'], PAL['steam'])
        if 14 <= f < 54 and abs(math.cos((f - 14) * 2 * math.pi / 12)) > 0.6:
            dust(b, head_x, OY, 0.4, side=1 if math.cos((f - 14) * 2 * math.pi / 12) < 0 else -1)
        if f < 10:
            bang(b, HX + 9, HY - 12 - round(back(seg(f, 0, 4)) * 2), FX['yellow'])
        if f >= 56:
            k = seg(f, 56, 60)
            if k > 0.2:
                s = 'LIBRE'
                text(b, s, OX + 16 - text_w(s) // 2, HY - 17 - round((back(k, 3) - 1) * 3), PAL['green'])
            sparkle(b, OX + 6, HY - 8, seg(f, 58, 68), PAL['green'])
            sparkle(b, OX + 28, HY - 4, seg(f, 62, 72), PAL['steam'])
        c.add(b)
    c.hold(500)
    return c


def cafe() -> Clip:
    """Gag: tres sorbos rápidos… los ojos se le abren, vibra entero, le sale vapor por las orejas, el
    mechón se pone de punta y sale disparado. Vuelve derrapando y mira la taza vacía: «?»."""
    c = Clip('cafe', 'gag: tres sorbos de café, vibra, le sale vapor por las orejas, sale disparado, vuelve derrapando y mira la taza vacía', bucle=False)
    N = 100
    for f in range(N):
        dx = 0
        lk = 0
        if f < 24:                                          # tres sorbos
            k = (f % 8) / 8
            up = 40 + 100 * math.sin(k * math.pi)
            lo = 95 - 265 * math.sin(k * math.pi)
            p = Pose(upF=up, loF=lo, prop='cup', eyes='happy' if k > 0.3 else 'open', mouth='o', t=f * 0.15)
        elif f < 46:                                        # ¡cafeína!
            p = Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', mouth='grin', t=f * 1.2,
                     headDy=-1 if f % 2 else 0)
            dx = 1 if f % 2 else -1
        elif f < 52:                                        # sale disparado a la izquierda
            p = Pose(upF=30, loF=20, upB=30, loB=20, eyes='wide', mouth='grin', t=f * 1.2)
            dx = -round(ease_in(seg(f, 46, 52)) * 50)
            lk = -3
        elif f < 60:
            p = Pose()
            dx = -80                                        # fuera de cuadro
        elif f < 68:                                        # vuelve por la derecha derrapando
            p = Pose(upF=60, loF=160, upB=60, loB=160, eyes='wide', mouth='grin', t=f)
            dx = round((1 - ease_out(seg(f, 60, 68))) * 44)
            lk = 3
        else:                                               # mira la taza vacía
            p = Pose(upF=60, loF=95, prop='cup', eyes='open' if f < 84 else 'happy', mouth='flat' if f < 84 else 'grin', t=f * 0.12)
        b = draw(p)
        if lk:
            b = lean(b, lk)
        if 24 <= f < 28:
            b = squash(b, 0.88, 1.12)
        b = shift(b, dx, 0)
        hx = HX + dx
        if f < 24 and (f % 8) in (3, 4):
            text(b, 'GLUP', hx - 22, HY - 12, FX['white'])
        if 24 <= f < 46:
            puff(b, hx - 9, HY - 1, seg(f % 8, 0, 8), FX['white'], PAL['steam'])
            puff(b, hx + 9, HY - 1, seg((f + 4) % 8, 0, 8), FX['white'], PAL['steam'])
            bang(b, hx + 12, HY - 14, FX['yellow'])
            bang(b, hx - 13, HY - 12, FX['yellow'])
            if f < 30:
                burst(b, hx, HY - 2, seg(f, 24, 30), 8, 13, 10, FX['yellow'])
        if 46 <= f < 52:
            speed_lines(b, hx + 10, HY - 6, 22, side=1, ln=8, col=FX['white'], gap=3)
            dust(b, hx + 6, OY, seg(f, 46, 54), side=1)
        if 60 <= f < 70:
            speed_lines(b, hx - 8, HY - 6, 22, side=-1, ln=6, col=FX['white'], gap=3)
            dust(b, hx - 4, OY, seg(f, 64, 72), side=-1)
        if 70 <= f < 84:
            hd = hand_pos(60, 95)
            for i in range(3):                              # gotitas: ya no queda café
                if f % 6 == i * 2:
                    b.set(round(hd[0]) + 2, round(hd[1]) + 1 + i, PAL['steam'])
            question(b, HX + 10, HY - 15)
        if f >= 86:
            sparkle(b, HX + 11, HY - 9, seg(f, 86, 96), PAL['steam'])
        c.add(b)
    c.hold(500)
    return c



# ---------------------------------------------------------------- acciones generales (hablar, explicar, saludar…)

from acciones import Mascota, OJOS, BOCAS, MANOS, todas  # noqa: E402


def _dibujar(brazo=None, brazoB=None, gesto='puño', ojos='abiertos', boca='cerrada', cejas=None, cabeza=0, f=0):
    up, lo = brazo or (12, 6)
    ub, lb = brazoB or (12, 6)
    return draw(Pose(upF=up, loF=lo, upB=ub, loB=lb, eyes=OJOS[ojos], mouth=BOCAS[boca], headDy=cabeza, t=f * 0.12))


MASCOTA = Mascota('mocca', _dibujar, cabeza=(HX, HY), hombro=(OX + 4, OY - 12), cintura=CUT,
                  entrada='disparado', acento=PAL['steam'])


def clips():
    return [reposo(), especial(), cafe()] + todas(MASCOTA)
