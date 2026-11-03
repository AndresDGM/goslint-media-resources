"""PARSERINT · animaciones: reposo con saltito, «¡Recomendación!» y el gag «Ñam, una página».

    python3 mascotas/animar_mascotas.py parserint
"""
from __future__ import annotations
import math

from parserint import Pose, draw, PAL
from pixel import OX, OY, dirv
from animar import (Clip, MS, FX, keys, seg, osc, back, ease_in, ease_out, smooth, blink,
                    shift, lean, squash, stretch, sparkle, bang, question, sweat, dust, puff, burst, ring,
                    text, text_w, float_text, heart)

CUT = OY - 4
HX, HY = OX, OY - 20


def hand_pos(up, lo, by=OY):
    sh = (OX + 4, by - 13)
    ex, ey = dirv(up, 1)
    el = (sh[0] + ex * 4, sh[1] + ey * 4)
    ux, uy = dirv(lo, 1)
    return el[0] + ux * 4, el[1] + uy * 4


def hop(f, t0, h=3):
    """Saltito de cabra: anticipa (aplasta), sube, cae y aplasta. Devuelve (dy, aplastón)."""
    k = f - t0
    if k < 0 or k > 10:
        return 0, 0
    if k < 2:
        return 0, -1
    if k < 8:
        return -round(math.sin(seg(k, 2, 8) * math.pi) * h), 0
    return 0, -1 if k < 10 else 0


def reposo() -> Clip:
    c = Clip('reposo', 'respira, la punta del sombrero se mece, parpadea tras las gafas y da un saltito de cabra', bucle=True)
    N = 48
    for f in range(N):
        dy, sq = hop(f, 30)
        p = Pose(t=f / N * 2 * math.pi / 2, eyes='closed' if blink(f, N, 14, 2) else ('happy' if 32 <= f < 40 else 'open'),
                 mouth='grin' if 32 <= f < 40 else 'smile',
                 upF=20 + (60 if 32 <= f < 38 else 0), loF=10 + (100 if 32 <= f < 38 else 0),
                 upB=20 + (60 if 32 <= f < 38 else 0), loB=10 + (100 if 32 <= f < 38 else 0))
        b = draw(p)
        b = stretch(b, sq if sq else (1 if osc(f, 24) > 0.4 else 0), CUT)
        b = shift(b, 0, dy)
        if f == 40:
            dust(b, OX, OY, 0.3)
        c.add(b)
    return c


def especial() -> Clip:
    c = Clip('especial', '¡Recomendación!: abre el libro, crece la llama verde, aparece la tarjeta de sugerencias y su ✓', bucle=False)
    N = 70
    for f in range(N):
        s = keys(f, [(0, 0.01), (6, 0.05), (22, 0.45), (26, 0.55), (42, 0.8), (46, 1.0)], smooth)
        up, lo = keys(f, [(0, 20), (5, 60)], back), keys(f, [(0, 10), (5, 90)], back)
        eyes = 'open' if f < 22 else ('wide' if f < 30 else ('open' if f < 46 else 'happy'))
        mouth = 'o' if 22 <= f < 30 else ('grin' if f >= 46 else 'smile')
        dy, sq = hop(f, 48, 3)
        p = Pose(upF=up, loF=lo, prop='book', special=s, t=f * 0.6, eyes=eyes, mouth=mouth)
        b = draw(p)
        if sq:
            b = stretch(b, sq, CUT)
        b = shift(b, 0, dy)
        hd = hand_pos(up, lo)
        bx, by = round(hd[0]) + 1, round(hd[1]) - 2
        cx, cy = bx + 8, by - 10                             # tarjeta
        if f < 6:
            sparkle(b, bx + 3, by - 2, seg(f, 0, 6), PAL['robeL'], FX['white'])
        if 6 <= f < 24 and f % 3 == 0:                       # chispas que suben de la llama
            for i in range(2):
                b.set(bx + 2 + i * 2, by - 6 - (f % 9) - i * 2, PAL['robeL'])
        if 24 <= f < 32:
            burst(b, cx + 4, cy + 3, seg(f, 24, 32), 5, 10, 8, PAL['robeL'])
        if 46 <= f < 56:
            ring(b, cx + 4, cy + 3, seg(f, 46, 56), 10, PAL['robeL'])
        sparkle(b, cx + 11, cy - 2, seg(f, 48, 58), FX['yellow'])
        sparkle(b, HX - 10, HY - 10, seg(f, 52, 62), PAL['robeL'])
        c.add(b)
    c.hold(500)
    return c


def nam() -> Clip:
    """Gag: lee su libro muy concentrada… arranca una página sin darse cuenta y se la come («ÑAM ÑAM»).
    Cuando se da cuenta, abre los ojos, suda, mira el libro… y sonríe con un guiño y un corazón."""
    c = Clip('nam', 'gag: lee, arranca una página sin darse cuenta y se la come («ÑAM ÑAM»); se da cuenta y sonríe con un guiño', bucle=False)
    N = 100
    up, lo = 60, 90
    hd = hand_pos(up, lo)
    bx, by = round(hd[0]) + 1, round(hd[1]) - 2
    mx, my = HX - 1, HY + 4
    for f in range(N):
        chew = 26 <= f < 56
        eyes, mouth, upB, loB = 'open', 'smile', 20, 10
        if f < 16:
            eyes, mouth = 'open', 'flat'
        elif f < 26:                                         # la página va a la boca
            eyes, mouth = 'open', 'o'
            upB, loB = keys(f, [(16, 20), (20, 60)]), keys(f, [(16, 10), (20, -120)])
        elif chew:
            eyes = 'happy'
            mouth = 'o' if (f // 3) % 2 else 'flat'
        elif f < 74:                                         # ¡ups!
            eyes, mouth = 'wide', 'o'
        else:
            eyes, mouth = 'wink', 'grin'
        p = Pose(upF=up, loF=lo, upB=upB, loB=loB, prop='book', t=f * 0.3, eyes=eyes, mouth=mouth,
                 headDy=1 if chew and (f // 3) % 2 else 0)
        b = draw(p)
        if 56 <= f < 60:
            b = squash(b, 1.08, 0.92)
        # la página: se arranca (14-16), viaja a la boca (16-26) y se encoge mientras mastica
        if 14 <= f < 56:
            if f < 26:
                k = ease_out(seg(f, 16, 26))
                px, py = bx + 1 + (mx - 3 - bx - 1) * k, by - 2 + (my - by + 2) * k - math.sin(k * math.pi) * 4
                w = 4
            else:
                px, py = mx - 3, my
                w = max(0, 4 - (f - 26) // 7)
            if w:
                b.rect(round(px) - 1, round(py), w, 3, FX['white'])
                b.rect(round(px) - 1, round(py) + 1, max(1, w - 1), 1, '#7F8D99')
        if 14 <= f < 18:
            burst(b, bx + 3, by - 1, seg(f, 14, 18), 2, 5, 6, FX['white'])
        if chew:
            k = (f - 26) % 15
            if k < 10:
                text(b, 'ÑAM', HX - 22, HY - 12 - k // 4 + (0 if (f - 26) < 15 else -6), FX['white'])
            if f % 5 == 0:                                   # migajas
                b.set(mx + 2, my + 3 + (f % 3), FX['white'])
        if 56 <= f < 74:
            bang(b, HX + 10, HY - 16, FX['yellow'])
            sweat(b, HX - 7, HY - 5, seg(f, 58, 68))
            # el libro tiene un hueco donde estaba la página
            b.rect(bx + 1, by - 1, 4, 1, PAL['book'])
        if f >= 74:
            b.rect(bx + 1, by - 1, 4, 1, PAL['book'])
            k = seg(f, 76, 96)
            if 0 < k < 1:
                heart(b, HX + 9, HY - 12 - round(k * 5), FX['pink'])
        c.add(b)
    c.hold(500)
    return c



# ---------------------------------------------------------------- acciones generales (hablar, explicar, saludar…)

from acciones import Mascota, OJOS, BOCAS, MANOS, todas, gatito  # noqa: E402


def _dibujar(brazo=None, brazoB=None, gesto='puño', ojos='abiertos', boca='cerrada', cejas=None, cabeza=0, f=0):
    up, lo = brazo or (20, 10)
    ub, lb = brazoB or (20, 10)
    return draw(Pose(upF=up, loF=lo, upB=ub, loB=lb, eyes=OJOS[ojos], mouth=BOCAS[boca], headDy=cabeza, t=f * 0.13))


MASCOTA = Mascota('parserint', _dibujar, cabeza=(HX, HY), hombro=(OX + 4, OY - 13), cintura=CUT,
                  entrada='saltos', acento=PAL['robeL'], manita=(PAL['fur'], PAL['robeD'], PAL['hoof']))


def clips():
    return [reposo(), especial(), nam()] + todas(MASCOTA) + [gatito(MASCOTA)]
