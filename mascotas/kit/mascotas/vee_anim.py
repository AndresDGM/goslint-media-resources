"""VEE · animaciones: reposo, «¡Decisión!», el gag «Bucle infinito» y las acciones generales.

El código de Vee está en referencias/codigo/vee.py (no se modifica).

    python3 mascotas/animar_mascotas.py vee
"""
from __future__ import annotations
import math, os, sys

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'referencias', 'codigo'))
import vee  # noqa: E402
from vee import Pose, PAL  # noqa: E402
from pixel import Buf, OX, OY  # noqa: E402
from animar import (Clip, MS, FX, keys, seg, osc, back, ease_in, ease_out, smooth, blink,  # noqa: E402
                    shift, lean, squash, stretch, sparkle, bang, sweat, stars, dust, puff, burst, ring,
                    text, text_w, float_text)

HX, HY = OX, OY - 22
HIPS = dict(upF=40, loF=-55, upB=40, loB=-55)


def draw(p: Pose) -> Buf:
    """El lienzo de vee.py tiene su propia clase; se pasa al Buf del motor para poder transformarlo."""
    src = vee.draw_vee(p)
    b = Buf(src.w, src.h)
    b.px = [row[:] for row in src.px]
    return b


def reposo() -> Clip:
    c = Clip('reposo', 'manos en la cintura: respira, mira a un lado y al otro y parpadea', bucle=True)
    N = 48
    for f in range(N):
        look = 1 if 14 <= f < 24 else (-1 if 30 <= f < 40 else 0)
        p = Pose(**HIPS, look=look, bodyDy=-1 if osc(f, 24) > 0.3 else 0,
                 eyes='closed' if blink(f, N, 26, 2) else 'open', mouth='grin' if 14 <= f < 24 else 'smile')
        c.add(draw(p))
    return c


# diagrama de flujo que dibuja en el aire: (trazo, color)
X0, Y0 = OX + 11, OY - 40


def _diagrama():
    W, Y, G, R, D = PAL['card'], PAL['yellow'], PAL['green'], PAL['red'], PAL['cardD']
    trazos = []
    caja = [(X0 + 4 + i, Y0) for i in range(7)] + [(X0 + 10, Y0 + 1), (X0 + 10, Y0 + 2)] + \
           [(X0 + 10 - i, Y0 + 3) for i in range(7)] + [(X0 + 4, Y0 + 2), (X0 + 4, Y0 + 1)]
    trazos.append((caja, W))
    trazos.append(([(X0 + 7, Y0 + 4 + i) for i in range(3)], D))
    rombo = []
    cx, cy, r = X0 + 7, Y0 + 11, 4
    for i in range(r + 1):
        rombo.append((cx + i, cy - r + i))
    for i in range(1, r + 1):
        rombo.append((cx + r - i, cy + i))
    for i in range(1, r + 1):
        rombo.append((cx - i, cy + r - i))
    for i in range(1, r):
        rombo.append((cx - r + i, cy - i))
    trazos.append((rombo, Y))
    trazos.append(([(cx, cy)], Y))                                        # «?» de la decisión
    si = [(cx + r + 1 + i, cy) for i in range(4)] + [(cx + r + 4, cy + 1 + i) for i in range(3)]
    trazos.append((si, D))
    chk = [(cx + r + 2, cy + 6), (cx + r + 3, cy + 7), (cx + r + 4, cy + 8), (cx + r + 5, cy + 7), (cx + r + 6, cy + 6), (cx + r + 7, cy + 5)]
    trazos.append((chk, G))
    no = [(cx, cy + r + 1 + i) for i in range(3)]
    trazos.append((no, D))
    x_ = [(cx - 1, cy + r + 4), (cx + 1, cy + r + 4), (cx, cy + r + 5), (cx - 1, cy + r + 6), (cx + 1, cy + r + 6)]
    trazos.append((x_, R))
    return [(x, y, col) for pts, col in trazos for x, y in pts]


def especial() -> Clip:
    """¡Decisión!: levanta el marcador y dibuja en el aire un diagrama de flujo (inicio → rombo de
    decisión → sí ✓ / no ✗), trazo a trazo; al terminar se ilumina y Vee guiña el ojo."""
    c = Clip('especial', '¡Decisión!: dibuja en el aire un diagrama de flujo trazo a trazo (inicio, decisión, sí ✓ y no ✗)', bucle=False)
    N = 84
    pix = _diagrama()
    for f in range(N):
        if f < 52:
            up = keys(f, [(0, 40), (6, 100)], back) + (osc(f, 4, 4) if f >= 8 else 0)
            lo = keys(f, [(0, -55), (6, 140)], back)
            p = Pose(upF=up, loF=lo, upB=40, loB=-55, prop='marker', look=1, eyes='open', mouth='smile' if f < 8 else 'o')
        else:
            p = Pose(upF=keys(f, [(52, 100), (56, 125)], back), loF=170, upB=40, loB=-55, prop='marker',
                     eyes='wink', mouth='grin', bodyDy=-1 if 52 <= f < 55 else 0)
        b = draw(p)
        n = int(seg(f, 8, 46) * len(pix)) if f < 52 else len(pix)
        lit = 50 <= f < 58
        for x, y, col in pix[:n]:
            b.set(x, y, FX['white'] if lit and f % 2 else col)
        if 8 <= f < 46 and n:
            x, y, _ = pix[min(n, len(pix)) - 1]
            b.set(x, y, FX['white'])
            sparkle(b, x, y, (f % 4) / 4 + 0.1, PAL['green'])
        if 50 <= f < 60:
            ring(b, X0 + 9, Y0 + 11, seg(f, 50, 60), 14, PAL['green'])
        sparkle(b, X0 + 18, Y0, seg(f, 56, 66), PAL['yellow'])
        sparkle(b, HX - 11, HY - 8, seg(f, 60, 70), PAL['green'])
        c.add(b)
    c.hold(500)
    return c


def bucle() -> Clip:
    """Gag: dibuja un bucle; la flecha empieza a dar vueltas cada vez más rápido y Vee la sigue con
    los ojos hasta marearse. Se recompone, escribe «BREAK» y el bucle se rompe. Guiño."""
    c = Clip('bucle', 'gag: sigue con la mirada una flecha que da vueltas en un bucle hasta marearse; lo corta con «BREAK»', bucle=False)
    N = 104
    cx, cy, r = OX + 17, OY - 32, 5
    ang = 0.0
    for f in range(N):
        vel = 0.25 + 0.9 * seg(f, 10, 52)
        if f < 60:
            ang += vel
        mareo = 50 <= f < 74
        if f < 10:
            p = Pose(upF=keys(f, [(0, 40), (5, 100)], back), loF=140, upB=40, loB=-55, prop='marker', look=1, mouth='smile')
        elif f < 50:
            look = 1 if math.cos(ang) > 0.3 else (-1 if math.cos(ang) < -0.3 else 0)
            p = Pose(**HIPS, look=look, eyes='wide' if f > 36 else 'open', mouth='o' if f > 36 else 'smile',
                     headDy=1 if math.sin(ang) > 0.5 else 0)
        elif mareo:
            p = Pose(upF=20, loF=-160, upB=40, loB=-55, eyes='closed', mouth='wobble')
        elif f < 86:
            p = Pose(upF=keys(f, [(74, 20), (78, 100)], back), loF=140, upB=40, loB=-55, prop='marker',
                     look=1, eyes='open', mouth='flat')
        else:
            p = Pose(upF=90, loF=130, upB=40, loB=-55, eyes='wink', mouth='grin')
        b = draw(p)
        if mareo:
            b = lean(b, round(osc(f, 8, 2)))
            stars(b, HX, HY - 12, f, r=8)
        # el bucle: círculo con la flecha que gira
        roto = f >= 82
        n = int(seg(f, 2, 9) * 24)
        for i in range(n):
            a = i / 24 * 2 * math.pi
            if roto and abs(math.sin((a - 1.2) / 2)) < 0.22:
                continue                                  # el hueco por donde se rompe
            b.set(round(cx + math.cos(a) * r), round(cy + math.sin(a) * r), PAL['cardD'])
        if 9 <= f < 82:
            ax, ay = cx + math.cos(ang) * r, cy + math.sin(ang) * r
            b.rect(round(ax) - 1, round(ay) - 1, 2, 2, PAL['green'])
            if vel > 0.6:                                 # estela
                for k in range(1, 4):
                    a = ang - k * 0.35
                    b.set(round(cx + math.cos(a) * r), round(cy + math.sin(a) * r), PAL['greenD'])
        if roto:                                          # la flecha sale disparada por el hueco
            k = seg(f, 82, 94)
            if k < 1:
                b.rect(round(cx + r + 2 + k * 18), round(cy - 4 - k * 6), 2, 2, PAL['green'])
        if 78 <= f < 90:
            k = seg(f, 78, 82)
            s = 'BREAK'
            text(b, s, cx - text_w(s) // 2, cy - r - 8 - round((back(k, 3) - 1) * 3), PAL['red'])
        if 82 <= f < 88:
            burst(b, cx + r, cy - 1, seg(f, 82, 88), 2, 7, 6, FX['white'])
        if 60 <= f < 74:
            sweat(b, HX - 8, HY - 5, seg(f, 60, 72))
        sparkle(b, HX - 11, HY - 8, seg(f, 90, 100), PAL['green'])
        c.add(b)
    c.hold(500)
    return c


# ---------------------------------------------------------------- acciones generales

from acciones import Mascota, OJOS, todas  # noqa: E402

VEE_BOCAS = {'cerrada': 'smile', 'media': 'grin', 'abierta': 'open', 'sonrisa': 'grin', 'plana': 'flat'}


def _dibujar(brazo=None, brazoB=None, gesto='puño', ojos='abiertos', boca='cerrada', cejas=None, cabeza=0, f=0):
    up, lo = brazo or (40, -55)                     # en reposo, manos en la cintura
    ub, lb = brazoB or (40, -55)
    return draw(Pose(upF=up, loF=lo, upB=ub, loB=lb, eyes=OJOS[ojos], mouth=VEE_BOCAS[boca], headDy=cabeza))


MASCOTA = Mascota('vee', _dibujar, cabeza=(HX, HY), hombro=(OX + 4, OY - 12), cintura=OY - 6,
                  entrada='caminar', acento=PAL['green'])


def clips():
    return [reposo(), especial(), bucle()] + todas(MASCOTA)
