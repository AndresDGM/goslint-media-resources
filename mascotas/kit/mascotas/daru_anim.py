"""DaRu · animaciones: reposo con lluvia de código, «Compilando la solución» y el gag «¡Bug!».

    python3 mascotas/animar_mascotas.py daru
"""
from __future__ import annotations
import math

from daru import Pose, draw, PAL, CHK_X, CHK_W, CHK_Y
from pixel import OX, OY, dirv
from animar import (Clip, MS, FX, keys, seg, osc, back, ease_in, ease_out, smooth, blink,
                    shift, lean, squash, stretch, glitch, flash, sparkle, bang, question, sweat, dust,
                    puff, burst, ring, text, text_w, float_text, speed_lines)

HX, HY = OX, OY - 22


def hand_pos(up, lo, by=OY):
    sh = (OX + 4, by - 12)
    ex, ey = dirv(up, 1)
    el = (sh[0] + ex * 4, sh[1] + ey * 4)
    ux, uy = dirv(lo, 1)
    return el[0] + ux * 4, el[1] + uy * 4


def reposo() -> Clip:
    c = Clip('reposo', 'la lluvia de código no para: respira, mira de lado a lado con su ceja de «sé algo que tú no»', bucle=True)
    N = 32
    for f in range(N):
        p = Pose(upF=8, loF=4, upB=8, loB=4, t=f / 2, bodyDy=-1 if osc(f, 16) > 0.3 else 0,
                 shine=1 if 8 <= f < 24 else 0, eyes='closed' if blink(f, N, 26, 2) else 'open',
                 mouth='smile' if 8 <= f < 24 else 'smirk')
        c.add(draw(p))
    return c


def especial() -> Clip:
    c = Clip('especial', 'Compilando la solución: invoca fragmentos de código, los ordena en líneas y los compila en un chulo', bucle=False)
    N = 64
    for f in range(N):
        s = keys(f, [(0, 0.02), (10, 0.2), (26, 0.5), (34, 0.5), (44, 1.0)], smooth)
        if f < 10:
            up, lo, eyes, brows, mouth, hand = keys(f, [(0, 8), (6, 105)], back), keys(f, [(0, 4), (6, 150)], back), 'focus', 'focus', 'smirk', 'open'
        elif f < 44:
            up, lo, eyes, brows, mouth, hand = 88, 100, 'focus', 'focus', 'flat', 'open'
        else:
            up, lo, eyes, brows, mouth, hand = keys(f, [(44, 88), (48, 135)], back), keys(f, [(44, 100), (48, 170)], back), 'happy', 'up', 'grin', 'thumb'
        p = Pose(upF=up, loF=lo, upB=40 if f >= 44 else 8, loB=-60 if f >= 44 else 4, eyes=eyes, brows=brows,
                 mouth=mouth, hand=hand, special=s, bits=0, t=f / 2, bodyDy=-1 if 44 <= f < 48 else 0)
        b = draw(p)
        if 6 <= f < 30:                                    # tiembla la mano: está «invocando»
            b = shift(b, round(osc(f, 3, 0.6)), 0) if f % 6 == 0 else b
        bx, by = OX + CHK_X + CHK_W // 2, OY + p.bodyDy + CHK_Y + CHK_W // 2
        if 34 <= f < 44:                                   # barra de compilación
            n = int(seg(f, 34, 43) * CHK_W)
            b.rect(OX + CHK_X, OY + CHK_Y + CHK_W + 2, n, 1, PAL['glow'])
        if f == 44:
            b = flash(b, PAL['glow'])
        if 44 <= f < 54:
            ring(b, bx, by, seg(f, 44, 54), 11, PAL['glow'])
        sparkle(b, bx - 8, by - 7, seg(f, 46, 56), PAL['glow'])
        sparkle(b, bx + 8, by + 6, seg(f, 50, 60), FX['yellow'])
        c.add(b)
    c.hold(600)
    return c


def screen(b, hd, mode, f):
    """Pinta la pantalla del portátil (mismo sitio que draw_laptop): código, error o «AC»."""
    x, y = round(hd[0]) - 2, round(hd[1])
    sx, sy = x + 3, y - 7
    b.rect(sx, sy, 7, 5, PAL['code0'])
    if mode == 'code':
        for j in range(3):
            ln = 2 + (f * 3 + j * 5) % 5
            b.rect(sx + 1, sy + 1 + j * 1 + j // 2, ln, 1, PAL['glow'] if j == (f // 2) % 3 else PAL['green'])
    elif mode == 'err':
        col = FX['red'] if f % 4 < 2 else '#93191C'
        b.rect(sx, sy, 7, 5, col)
        b.set(sx + 2, sy + 1, FX['white']); b.set(sx + 4, sy + 1, FX['white']); b.rect(sx + 2, sy + 3, 3, 1, FX['white'])
    elif mode == 'ac':
        for px, py in ((1, 2), (2, 3), (3, 2), (4, 1), (5, 0)):
            b.set(sx + px, sy + py + 1, PAL['glow'])


def bug() -> Clip:
    """Gag: «súper hacker» teclea presumiendo… aparece un bug, la pantalla se pone roja, le da un
    glitch dramático en la cara. Respira, se pone serio, teclea a toda velocidad y lo arregla."""
    c = Clip('bug', 'gag: presume tecleando, sale un «¡BUG!», le da un glitch dramático, se pone serio y lo arregla', bucle=False)
    N = 108
    for f in range(N):
        up, lo, hand, prop = 60, 100, 'fist', 'laptop'
        mode = 'code'
        dramatic = 0
        if f < 26:                                         # presume
            eyes, brows, mouth = 'open' if f < 14 else 'happy', 'smug', 'smirk' if f < 14 else 'grin'
            up += osc(f, 2, 4)
        elif f < 52:                                       # ¡bug!
            mode = 'err'
            eyes, brows, mouth = ('wide', 'up', 'o') if f < 38 else ('half', 'worried', 'frown')
            dramatic = 1
        elif f < 60:                                       # respira hondo
            mode = 'err'
            eyes, brows, mouth = 'closed', 'none', 'flat'
        elif f < 84:                                       # modo serio: teclea a toda velocidad
            eyes, brows, mouth = 'focus', 'focus', 'flat'
            up += osc(f, 2, 6)
        else:                                              # resuelto
            mode = 'ac'
            eyes, brows, mouth, prop = 'happy', 'up', 'grin', None if f >= 90 else 'laptop'
            if f >= 90:
                up, lo, hand = keys(f, [(90, 60), (94, 40)], back), keys(f, [(90, 100), (94, 175)], back), 'thumb'
        p = Pose(upF=up, loF=lo, upB=40 if f >= 90 else 8, loB=-60 if f >= 90 else 4, eyes=eyes, brows=brows, mouth=mouth,
                 hand=hand, prop=prop, t=f / (1 if 60 <= f < 84 else 2), bits=6 if 26 <= f < 52 else 3,
                 bodyDy=-1 if 52 <= f < 58 or 90 <= f < 93 else 0, shine=f % 2 if 60 <= f < 84 else 0)
        b = draw(p)
        hd = hand_pos(up, lo, OY + p.bodyDy)
        if prop == 'laptop':
            screen(b, hd, mode, f)
        if 26 <= f < 30:
            b = squash(b, 0.9, 1.12)                       # respingo
        if dramatic:
            b = lean(b, -3 if f < 40 else -2)
            if f % 6 < 3:                                  # glitch de la cabeza
                y0 = HY - 8 + (f * 5) % 10
                b = glitch(b, [(y0, y0 + 2, 2 if f % 2 else -2), (y0 + 5, y0 + 6, -1)])
        if 26 <= f < 52:
            k = seg(f, 26, 30)
            s = '¡BUG!'
            text(b, s, OX - text_w(s) // 2 + round(osc(f, 2, 1)), HY - 21 - round((back(k, 3) - 1) * 3), FX['red'])
            sweat(b, HX - 8, HY - 6, seg(f % 10, 0, 10))
        if 38 <= f < 52:
            question(b, HX + 10, HY - 14, FX['white'])
        if 60 <= f < 84:
            speed_lines(b, HX - 10, HY - 4, 10, side=-1, ln=4, col=PAL['greenD'], gap=3)
            if f % 3 == 0:
                puff(b, hd[0] + 4, hd[1] - 9, 0.4, PAL['glow'], PAL['green'])
        if f < 26:
            float_text(b, 'SÚPER', HX - 1, HY - 14, seg(f, 4, 26), PAL['glow'], rise=4)
        if 84 <= f < 94:
            ring(b, hd[0] + 2, hd[1] - 5, seg(f, 84, 94), 10, PAL['glow'])
        float_text(b, 'AC', OX + 14, HY - 10, seg(f, 86, 108), PAL['green'], rise=5)
        sparkle(b, HX - 11, HY - 9, seg(f, 92, 102), FX['yellow'])
        c.add(b)
    c.hold(500)
    return c



# ---------------------------------------------------------------- acciones generales (hablar, explicar, saludar…)

from acciones import Mascota, OJOS, BOCAS, MANOS, todas  # noqa: E402


def _dibujar(brazo=None, brazoB=None, gesto='puño', ojos='abiertos', boca='cerrada', cejas=None, cabeza=0, f=0):
    up, lo = brazo or (8, 4)
    ub, lb = brazoB or (8, 4)
    ojo = {'concentrado': 'focus'}.get(ojos, OJOS[ojos])
    boc = {'cerrada': 'smirk'}.get(boca, BOCAS[boca])
    ceja = {'arriba': 'up', 'concentrado': 'focus'}.get(cejas, 'smug')
    return draw(Pose(upF=up, loF=lo, upB=ub, loB=lb, eyes=ojo, mouth=boc, brows=ceja, hand=MANOS[gesto],
                     headDy=cabeza, t=f / 2, shine=(f // 16) % 2))


MASCOTA = Mascota('daru', _dibujar, cabeza=(HX, HY), hombro=(OX + 4, OY - 12), cintura=OY - 6,
                  entrada='materializar', acento=PAL['glow'])


def clips():
    return [reposo(), especial(), bug()] + todas(MASCOTA)
