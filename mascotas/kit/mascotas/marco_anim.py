"""MARCO · animaciones: reposo de humo, «¡Compilando!», el gag «Detector de humo» y las acciones generales.

El código de Marco está en referencias/codigo/marco.py (no se modifica). Se dibuja SIN contorno
blanco (OUTLINE = False), como su sprite aprobado.

Marco no tiene boca: cuando habla se enciende bajo sus ojos una rendija de luz tenue, del mismo
amarillo de los ojos, que crece con la voz (boca media / abierta).

    python3 mascotas/animar_mascotas.py marco
"""
from __future__ import annotations
import math, os, sys

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'referencias', 'codigo'))
import marco  # noqa: E402
from marco import Pose, PAL  # noqa: E402
from pixel import Buf, OX, OY  # noqa: E402
from animar import (Clip, MS, FX, keys, seg, osc, back, ease_in, ease_out, smooth, blink,  # noqa: E402
                    shift, lean, squash, stretch, sparkle, bang, sweat, dust, puff, burst, ring,
                    text, text_w, float_text, speed_lines)

marco.OUTLINE = False
HX, HY = OX, OY - 23


def draw(p: Pose, voz: str | None = None) -> Buf:
    src = marco.draw(p)
    b = Buf()
    b.px = [row[:] for row in src.px]
    if voz in ('media', 'abierta'):                  # rendija de luz al hablar
        hy = HY + p.float_
        w = 2 if voz == 'media' else 4
        b.rect(HX - w // 2, hy + 2, w, 1, PAL['glow'])
        b.rect(HX - w // 2 + (1 if w == 4 else 0), hy + 2, w - (2 if w == 4 else 0), 1, PAL['eye'])
        if voz == 'abierta':
            b.rect(HX - 1, hy + 3, 2, 1, PAL['glow'])
    return b


def reposo() -> Clip:
    c = Clip('reposo', 'flota: el humo y la llama se mecen, sube y baja despacio y parpadea', bucle=True)
    N = 48
    for f in range(N):
        p = Pose(t=f / N * 2 * math.pi / 2.2 * 2, float_=round(osc(f, N, 1.4)),
                 eyes='blink' if blink(f, N, 30, 2) else 'open')
        c.add(draw(p))
    return c


def especial() -> Clip:
    """¡Compilando!: entrecierra los ojos, invoca llaves de código, se deshace en humo, el humo viaja
    y se rearma unos píxeles a la derecha. Ojos felices y destellos."""
    c = Clip('especial', '¡Compilando!: se deshace en humo, viaja y se rearma en otro lugar', bucle=False)
    N = 72
    for f in range(N):
        t = f * 0.15
        if f < 8:
            p = Pose(upF=keys(f, [(0, 14), (5, 100)], back), loF=150, eyes='angry', prop='braces', t=t)
            dx = 0
        elif f < 26:
            p = Pose(upF=100, loF=150, eyes='angry', prop='braces', t=t, burst=ease_in(seg(f, 8, 24)))
            dx = 0
        elif f < 36:
            p = None
            dx = 18
        elif f < 54:
            p = Pose(upF=14, loF=8, eyes='open', t=t, burst=1 - ease_out(seg(f, 36, 52)))
            dx = 18
        else:
            p = Pose(upF=125, loF=170, upB=125, loB=170, eyes='happy', t=t, float_=-2 if f < 58 else 0)
            dx = 18
        b = draw(p) if p else Buf()
        b = shift(b, dx, 0)
        if 22 <= f < 40:                                 # el humo viaja de un sitio al otro
            k = seg(f, 22, 40)
            for i in range(8):
                x = OX + 18 * smooth(k) + math.sin(i * 1.7 + f * 0.4) * 5
                y = HY - 2 + math.cos(i * 2.3 + f * 0.3) * 6 - math.sin(k * math.pi) * 6
                b.set(round(x), round(y), PAL['smk3'] if i % 2 else PAL['smk4'])
            speed_lines(b, round(OX + 18 * smooth(k)) - 9, HY - 6, 12, side=-1, ln=4, col=PAL['smk3'], gap=3)
        if 52 <= f < 62:
            ring(b, HX + dx, HY, seg(f, 52, 62), 13, PAL['eye'])
        sparkle(b, HX + dx - 12, HY - 8, seg(f, 56, 66), PAL['eye'])
        sparkle(b, HX + dx + 12, HY - 2, seg(f, 60, 70), PAL['smk4'])
        c.add(b)
    c.hold(500)
    return c


def alarma(b, x, y, f, sonando):
    b.ellipse(x, y, 3.2, 1.6, '#E8ECEF')
    b.rect(round(x) - 3, round(y) + 1, 6, 1, '#AEB6BF')
    led = (FX['red'] if f % 4 < 2 else '#7A1E1A') if sonando else FX['green']
    b.set(round(x), round(y), led)
    if sonando and f % 4 < 2:
        for i, dx in enumerate((-6, 5)):
            b.set(round(x) + dx, round(y) - 1, FX['red']); b.set(round(x) + dx + (1 if dx > 0 else -1), round(y), FX['red'])
        text(b, 'BIP', round(x) - 13, round(y) + 3, FX['red'])


def detector() -> Clip:
    """Gag: Marco flota hacia arriba y el detector de humo del techo empieza a pitar. Se apura y
    abanica el humo con los brazos hasta que se calla. Respira aliviado… estornuda una nube de humo y
    el detector vuelve a pitar. Se tapa la cara."""
    c = Clip('detector', 'gag: el detector de humo pita por su culpa; abanica, se calla, estornuda humo y vuelve a pitar', bucle=False)
    N = 104
    ax, ay = OX - 14, 6
    for f in range(N):
        t = f * 0.15
        sonando = (12 <= f < 50) or (70 <= f < 104)
        fl = round(keys(f, [(0, 0), (10, -4), (50, -4), (58, 0)]))
        if f < 12:
            p = Pose(t=t, float_=fl, eyes='open')
        elif f < 20:
            p = Pose(upF=60, loF=160, upB=60, loB=160, t=t, float_=fl, eyes='wide')
        elif f < 50:                                     # abanica
            a = 90 + osc(f, 6, 40)
            p = Pose(upF=a, loF=150, upB=180 - a + 40, loB=150, t=t * 2, float_=fl, eyes='wide')
        elif f < 64:
            p = Pose(t=t, float_=fl, eyes='happy')
        elif f < 70:                                     # estornudo
            p = Pose(t=t, float_=fl, eyes='blink', burst=0.18 if f in (66, 67) else 0)
        elif f < 84:
            p = Pose(upF=60, loF=160, upB=60, loB=160, t=t, float_=fl, eyes='wide')
        else:                                            # se tapa la cara
            p = Pose(upF=keys(f, [(84, 60), (88, 30)], back), loF=keys(f, [(84, 160), (88, -150)], back),
                     t=t, float_=fl, eyes='blink')
        b = draw(p)
        if f in (66, 67):
            b = shift(b, -2, 0)
        alarma(b, ax, ay, f, sonando)
        if 20 <= f < 50 and f % 3 == 0:                  # el humo sale empujado por el abanico
            puff(b, HX + 12 + (f % 9), HY - 6 - (f % 7), 0.5, PAL['smk3'], PAL['smk2'])
        if 50 <= f < 56:
            puff(b, HX + 6, HY + 2, seg(f, 50, 56), PAL['smk4'], PAL['smk3'])     # suspiro
        if 66 <= f < 76:
            puff(b, HX + 8, HY + 2, seg(f, 66, 74), PAL['smk4'], PAL['smk3'])
            puff(b, HX + 4, HY - 2, seg(f, 67, 76), PAL['smk3'], PAL['smk2'])
            text(b, '¡ACHÚ!', HX + 4, HY - 18, FX['white'])
        if 12 <= f < 20 or 70 <= f < 78:
            bang(b, HX - 11, HY - 14, FX['yellow'])
        if f >= 88:
            sweat(b, HX + 9, HY - 6, seg(f, 88, 100))
        c.add(b)
    c.hold(500)
    return c


# ---------------------------------------------------------------- acciones generales

from acciones import Mascota, todas  # noqa: E402

MARCO_OJOS = {'abiertos': 'open', 'cerrados': 'blink', 'felices': 'happy', 'sorpresa': 'wide', 'guiño': 'squint',
              'concentrado': 'squint'}


def _dibujar(brazo=None, brazoB=None, gesto='puño', ojos='abiertos', boca='cerrada', cejas=None, cabeza=0, f=0):
    up, lo = brazo or (14, 8)
    ub, lb = brazoB or (14, 8)
    voz = {'media': 'media', 'abierta': 'abierta'}.get(boca)
    return draw(Pose(upF=up, loF=lo, upB=ub, loB=lb, eyes=MARCO_OJOS[ojos], t=f * 0.15, float_=cabeza), voz)


MASCOTA = Mascota('marco', _dibujar, cabeza=(HX, HY), hombro=(OX + 4, OY - 15), cintura=OY - 9,
                  entrada='flotar', acento=PAL['eye'], pies=False)


def clips():
    return [reposo(), especial(), detector()] + todas(MASCOTA)
