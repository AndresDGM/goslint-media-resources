"""GLOBÍN · animaciones: reposo flotante, «¡A inflar y despegar!» y el gag «¡Pinchazo!».

    python3 mascotas/animar_mascotas.py globin
"""
from __future__ import annotations
import math
from dataclasses import replace

from globin import Pose, draw, PAL
from pixel import OX, OY
from animar import (Clip, MS, FX, keys, step, seg, osc, back, ease_in, ease_out, smooth, blink,
                    stretch, shift, squash, lean, sparkle, bang, sweat, stars, dust, speed_lines,
                    puff, burst, ring, text, float_text, shadow)

CUT = OY - 7          # cintura: lo de arriba respira, los pies no se mueven
CONF = ('#F2C230', '#00C063', '#3E73D8', '#E0362C', '#FFFFFF')


def head(p: Pose):
    """Centro aproximado del globo para colocar efectos."""
    inf = p.inflate
    return OX + p.headDx, OY + p.bodyDy - 23 + p.headDy - round(inf * 2) - p.lift, 7.2 + inf * 1.6


def confetti(b, cx, cy, k, n=10, spread=14):
    """Confeti que estalla y cae girando (k 0..1)."""
    if k <= 0 or k >= 1:
        return
    for i in range(n):
        a = -math.pi / 2 + (i / (n - 1) - 0.5) * 2.6
        v = 6 + (i * 7 % 5)
        x = cx + math.cos(a) * v * ease_out(k) * spread / 10
        y = cy + math.sin(a) * v * ease_out(k) + k * k * 14
        c = CONF[i % len(CONF)]
        b.set(round(x), round(y), c)
        if (i + int(k * 12)) % 2:
            b.set(round(x) + 1, round(y), c)


def reposo() -> Clip:
    """Flota: el globo va un poco detrás del cuerpo (se mece con retraso), respira y parpadea."""
    c = Clip('reposo', 'flota en su sitio: el globo se mece con retraso, respira y parpadea', bucle=True)
    N = 36
    for f in range(N):
        breath = 1 if osc(f, N) > 0.35 else 0
        p = Pose(headDy=round(osc(f, N, 1.3, -0.18)), headDx=round(osc(f, N / 2 * 2, 1.0, 0.25)),
                 upF=12 + osc(f, N, 8, -0.1), upB=12 + osc(f, N, 8, 0.4),
                 eyes='closed' if blink(f, N, 22, 2) else 'open',
                 brows='up' if 22 <= f < 28 else 'focus')
        b = stretch(draw(p), breath, CUT)
        c.add(b)
    return c


def especial() -> Clip:
    """Se agacha, sopla tres veces (cada soplo infla el globo con rebote), abre los ojos, despega con
    confeti y nubecitas, flota y aterriza con un aplastón."""
    c = Clip('especial', '¡A inflar y despegar!: anticipa, sopla 3 veces, se infla, despega y aterriza', bucle=False)
    N = 60
    for f in range(N):
        # inflado por escalones con rebote: 3 soplos (f 8, 14, 20)
        inf = 0.0
        for i, t0 in enumerate((8, 14, 20)):
            inf += 0.36 * back(seg(f, t0, t0 + 4), 3.0)
        inf = min(inf, 1.25) - 0.15 * seg(f, 24, 28)          # se pasa un poco y se asienta
        lift = round(keys(f, [(28, 0), (32, 4), (40, 15), (46, 17), (54, 0)], smooth)) if f >= 28 else 0
        crouch = round(keys(f, [(0, 0), (4, -2), (7, -2), (9, 0)])) if f < 10 else 0
        land = f in (54, 55)
        blowing = any(t0 <= f < t0 + 3 for t0 in (8, 14, 20))
        if f < 8:
            eyes, mouth, arms = 'closed', 'flat', (keys(f, [(0, 12), (6, 60)]), 20)
        elif f < 24:
            eyes, mouth, arms = ('closed' if blowing else 'open'), ('o' if blowing else 'flat'), (60, 20)
        elif f < 28:
            eyes, mouth, arms = 'wide', 'o', (keys(f, [(24, 60), (27, 118)], back), 150)
        elif f < 54:
            eyes, mouth, arms = 'happy', 'grin', (118 + osc(f, 8, 10), 150 + osc(f, 8, 15))
        else:
            eyes, mouth, arms = 'happy', 'grin', (125, 170)
        p = Pose(upF=arms[0], loF=arms[1], upB=arms[0], loB=arms[1], eyes=eyes, mouth=mouth,
                 brows='up' if f >= 24 else 'focus', inflate=inf, lift=lift,
                 headDy=round(osc(f, 10, 1)) if 30 <= f < 52 else 0)
        b = draw(p)
        if crouch:
            b = stretch(b, crouch, CUT)
        if land:
            b = squash(b, 1.15, 0.86)
        hx, hy, rx = head(p)
        if blowing:
            for t0 in (8, 14, 20):
                puff(b, hx + rx + 3 + (f - t0) * 2, hy + 4, seg(f, t0, t0 + 5), FX['white'], '#8FA8C6')
        if 28 <= f < 54:
            shadow(b, OX, OY, 10 - lift // 3)
        dust(b, OX, OY, seg(f, 28, 36))
        dust(b, OX, OY, seg(f, 54, 61))
        if 30 <= f < 40:
            speed_lines(b, OX - 3, OY - lift + 1, 6, side=1, ln=3, col='#8FA8C6', gap=2)
        confetti(b, hx, hy - rx - 4, seg(f, 28, 50), 12, spread=20)
        if 24 <= f < 30:
            bang(b, hx + 10, hy - 12 - round(back(seg(f, 24, 27)) * 2), FX['yellow'])
        sparkle(b, hx - 11, hy - 8, seg(f, 40, 50))
        sparkle(b, hx + 12, hy - 2, seg(f, 44, 54))
        c.add(b)
    c.hold(500)
    return c


def pinchazo() -> Clip:
    """Gag: un «WA» rojo llega volando y pincha el globo. Globín sale disparado dando vueltas mientras
    se desinfla, cae mareado, se infla soplando por el pulgar y queda como nuevo (guiño)."""
    c = Clip('pinchazo', 'gag: un «WA» pincha el globo, sale disparado desinflándose, cae mareado y se vuelve a inflar', bucle=False)
    N = 84
    path = [(16, 0, 0), (20, 6, -6), (24, -6, -12), (28, -8, -2), (32, 7, -9), (36, 0, -14), (40, -4, 0)]
    for f in range(N):
        inf = 0.0
        dx = dy = 0
        lean_k = 0
        eyes, mouth, brows, arms = 'open', 'smile', 'focus', (12, 6, 12, 6)
        if f < 12:                               # el «WA» se acerca; lo ve venir
            eyes = 'open' if f < 8 else 'wide'
            mouth = 'smile' if f < 8 else 'o'
            brows = 'focus' if f < 8 else 'up'
        elif f < 16:                             # ¡PSSST!
            eyes, mouth, brows = 'wide', 'o', 'up'
            arms = (60, 160, 60, 160)
            inf = -0.05 * (f - 12)
        elif f < 40:                             # sale disparado desinflándose
            k = seg(f, 16, 40)
            inf = -0.2 - 0.45 * k
            dx = round(keys(f, [(t, x) for t, x, _ in path]))
            dy = round(keys(f, [(t, y) for t, _, y in path]))
            lean_k = round(osc(f, 6, 3))
            eyes, mouth, brows = 'wide', 'o', 'up'
            arms = (110 + osc(f, 4, 40), 170, 110 + osc(f, 4, 40, 0.5), 170)
        elif f < 58:                             # aterriza desinflado y mareado
            inf = -0.65
            eyes, mouth, brows = 'closed', 'flat', 'up'
            arms = (12, 6, 12, 6)
        elif f < 72:                             # sopla por el pulgar y se reinfla
            k = seg(f, 60, 70)
            inf = -0.65 + 0.8 * back(k, 2.5)
            eyes = 'closed' if f < 68 else 'wide'
            mouth = 'o'
            arms = (30, -150, 12, 6)
        else:                                    # como nuevo: guiño
            inf = 0.15 - 0.15 * seg(f, 72, 76)
            eyes, mouth, brows = 'wink', 'grin', 'up'
            arms = (90, 130, 12, 6)
        p = Pose(upF=arms[0], loF=arms[1], upB=arms[2], loB=arms[3], eyes=eyes, mouth=mouth, brows=brows, inflate=inf)
        b = draw(p)
        if 40 <= f < 44:
            b = squash(b, 1.18, 0.82)
        if lean_k:
            b = lean(b, lean_k)
        if 40 <= f < 58:
            b = stretch(b, -1, CUT)
        b = shift(b, dx, dy)
        hx, hy, rx = head(p)
        hx, hy = hx + dx, hy + dy
        # el «WA» que llega volando desde la derecha
        if f < 14:
            wx = round(keys(f, [(0, OX + 24), (12, hx + rx - 1)], ease_in))
            wy = hy - 4 + round(osc(f, 6, 1))
            text(b, 'WA', wx, wy, FX['red'])
            if f >= 12:
                burst(b, hx + rx, hy - 2, seg(f, 12, 16), 2, 6, 6, FX['white'])
        if 12 <= f < 40:                         # chorro de aire por el agujero
            for i in range(3):
                x = hx + rx + 1 + i * 2 + (f % 2)
                b.set(x, hy - 2 - i % 2, '#8FA8C6')
            if f >= 16:
                speed_lines(b, hx - rx - 2, hy - 4, 9, side=-1, ln=4, col='#8FA8C6', gap=3)
            sweat(b, hx - rx - 1, hy - 4, seg(f % 8, 0, 8))
        if 40 <= f < 46:
            dust(b, OX, OY, seg(f, 40, 47))
            burst(b, hx, hy, seg(f, 40, 46), 6, 11, 8, FX['yellow'])
        if 44 <= f < 60:
            stars(b, hx, hy - rx - 2, f, r=7)
        if 60 <= f < 70:
            puff(b, hx + 6, hy + 8, seg(f, 60, 64), FX['white'], '#8FA8C6')
            puff(b, hx + 6, hy + 8, seg(f, 64, 68), FX['white'], '#8FA8C6')
        if 70 <= f < 76:
            ring(b, hx, hy, seg(f, 70, 76), 12, FX['white'])
        sparkle(b, hx + 11, hy - 8, seg(f, 72, 80))
        c.add(b, MS if not (40 <= f < 58) else MS)
    c.hold(600)
    return c



# ---------------------------------------------------------------- acciones generales (hablar, explicar, saludar…)

from acciones import Mascota, OJOS, BOCAS, MANOS, todas, scuba  # noqa: E402


def _dibujar(brazo=None, brazoB=None, gesto='puño', ojos='abiertos', boca='cerrada', cejas=None, cabeza=0, f=0):
    up, lo = brazo or (12, 6)
    ub, lb = brazoB or (12, 6)
    return draw(Pose(upF=up, loF=lo, upB=ub, loB=lb, eyes=OJOS[ojos], mouth=BOCAS[boca],
                     brows='up' if cejas == 'arriba' else 'focus', headDy=cabeza, headDx=round(osc(f, 36, 1))))


MASCOTA = Mascota('globin', _dibujar, cabeza=(OX, OY - 23), hombro=(OX + 4, OY - 12), cintura=CUT,
                  entrada='flotar', acento='#F2C230', manita=(PAL['red'], PAL['hoodL']))


def clips():
    return [reposo(), especial(), pinchazo()] + todas(MASCOTA) + [scuba(MASCOTA)]
