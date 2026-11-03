"""POLO · animaciones: reposo dormilón, «¡Aire fresco!» y el gag «Siesta con bug».

    python3 mascotas/animar_mascotas.py polo
"""
from __future__ import annotations
import math

from polo import Pose, draw, C, BUG, glyph as pglyph
from pixel import OX, OY
from animar import (Clip, MS, FX, keys, seg, osc, back, ease_in, ease_out, smooth, blink,
                    shift, lean, squash, stretch, sparkle, bang, sweat, zzz, dust, puff, burst, ring,
                    text, speed_lines, question)

HX, HY = OX + 4, OY - 23


def reposo() -> Clip:
    """Respira lento, la cola se mece y le gana el sueño: cabecea despacio y se despierta de golpe."""
    c = Clip('reposo', 'dormilón: respira, mece la cola, cabecea de sueño y se despierta de golpe', bucle=True)
    N = 60
    for f in range(N):
        nod = round(keys(f, [(28, 0), (40, 2), (44, 3), (45, 0)], ease_in)) if 28 <= f < 45 else 0
        eyes = 'closed' if (34 <= f < 45) or blink(f, 60, 12, 3) else ('wide' if 45 <= f < 48 else 'sleepy')
        p = Pose(bodyDy=-1 if osc(f, 30) > 0.3 else 0, tail=osc(f, 30, 1.0), headDy=nod, eyes=eyes,
                 capDy=-1 if f == 45 else 0, mouth='o' if 45 <= f < 48 else 'smile')
        b = draw(p)
        if 45 <= f < 48:
            bang(b, HX + 11, HY - 13, FX['yellow'])
        c.add(b)
    return c


def especial() -> Clip:
    c = Clip('especial', '¡Aire fresco!: ve el ∞ al rojo, toma aire, sopla, el bucle se congela y le da un escalofrío', bucle=False)
    N = 66
    for f in range(N):
        look = keys(f, [(0, 0), (8, 1)], back)
        if f < 10:
            sp, eyes, mouth, puff_, body = 0.0, 'wide' if f >= 4 else 'sleepy', 'o' if f >= 4 else 'smile', 0, 0
        elif f < 20:                                    # toma aire: se infla
            sp, eyes, mouth, puff_, body = 0.0, 'closed', 'flat', 1, -1
        elif f < 40:                                    # sopla
            sp, eyes, mouth, puff_, body = ease_out(seg(f, 20, 38)), 'closed', 'o', 0, 0
        else:
            sp, eyes, mouth, puff_, body = 1.0, ('closed' if f < 52 else 'happy'), ('flat' if f < 52 else 'smile'), 0, 0
        p = Pose(special=sp, look=look, eyes=eyes, mouth=mouth, puff=puff_, bodyDy=body,
                 tailUp=keys(f, [(10, 0), (18, 0.8), (24, 0.2)]), tail=osc(f, 12, 0.6) if f >= 52 else 0)
        b = draw(p)
        if 10 <= f < 20:
            b = stretch(b, 1, OY - 8)
        if 20 <= f < 26:
            b = lean(b, -2 + (f - 20) // 3)               # retrocede por el soplido
        if 40 <= f < 52:
            b = shift(b, 1 if f % 2 else -1, 0)         # escalofrío
            for i, (dx, dy) in enumerate(((-12, -4), (-14, 2), (-10, 8))):
                b.set(HX + dx - (f % 2), HY + dy, C['ice'])
        if 4 <= f < 12:
            bang(b, HX - 12, HY - 12 - round(back(seg(f, 4, 8)) * 2), FX['yellow'])
            sweat(b, HX - 9, HY - 6, seg(f, 4, 12))
        sparkle(b, HX + 22, HY - 12, seg(f, 38, 48), C['ice'], C['furL'])
        sparkle(b, HX + 10, HY - 16, seg(f, 42, 52), C['ice'], C['furL'])
        c.add(b)
    c.hold(500)
    return c


def bug(b, x, y, legs):
    pglyph(b, round(x), round(y), BUG if legs else ['.X.', 'XXX', 'XXX', 'X.X'], C['hot'])
    b.set(round(x) + 1, round(y) + 1, C['hotL'])


def siesta() -> Clip:
    """Gag: bosteza y se duerme. Un bug baja colgando de un hilo, camina por la gorra y le hace
    cosquillas en la nariz… ¡ACHÚ! La gorra sale volando, el bug sale disparado, Polo se despierta,
    mira a todos lados y se vuelve a dormir."""
    c = Clip('siesta', 'gag: se duerme, un bug le hace cosquillas en la nariz, estornuda, vuela la gorra y se vuelve a dormir', bucle=False)
    N = 120
    cap_top = HY - 12
    for f in range(N):
        headDy, capDy, eyes, mouth, look, body, fx = 0, 0, 'sleepy', 'smile', 0.0, 0, None
        if f < 14:                                       # bostezo
            eyes = 'closed'
            mouth = 'open' if 3 <= f < 12 else 'smile'
            body = -1 if 3 <= f < 12 else 0
        elif f < 72:                                     # duerme
            eyes, headDy = 'closed', 1
            mouth = 'flat' if 58 <= f < 72 else 'smile'  # arruga la nariz
        elif f < 80:                                     # ¡ACHÚ!
            eyes, mouth = 'closed', 'open'
            capDy = -round(keys(f, [(72, 0), (76, 14), (80, 30)], ease_out))
        elif f < 98:                                     # despierto, mira a los lados
            eyes, mouth = 'wide', 'o'
            look = keys(f, [(82, 0), (86, 1), (90, 1), (94, 0)])
            capDy = -40
        else:                                            # ni modo: a dormir otra vez
            eyes, headDy = 'closed', 1
            capDy = -40 if f < 104 else round(keys(f, [(104, -26), (110, 0)], ease_in))
        p = Pose(eyes=eyes, mouth=mouth, headDy=headDy, capDy=capDy, look=look, bodyDy=body,
                 tail=osc(f, 40, 0.8), puff=1 if 66 <= f < 72 else 0)
        b = draw(p)
        if f < 12 and f >= 3:
            b = stretch(b, 1, OY - 8)
        if 72 <= f < 76:
            b = shift(b, -2 if f < 74 else -1, 0)        # el estornudo lo empuja
            if f == 72:
                b = squash(b, 1.1, 0.9)
        if 18 <= f < 72 or f >= 104:
            zzz(b, HX + 10, HY - 10, f)
        # el bug: baja colgando (14-26), camina por la gorra (26-46) y baja a la nariz (46-72)
        if 14 <= f < 72:
            if f < 26:
                bx, by = HX + 3, keys(f, [(14, 0), (26, cap_top - 4)], smooth)
                for yy in range(0, int(by)):
                    b.set(bx + 1, yy, C['furL'] if yy % 2 else C['furD'])
            elif f < 46:
                bx, by = keys(f, [(26, HX + 3), (46, HX + 8)]), keys(f, [(26, cap_top - 4), (36, cap_top - 2), (46, cap_top + 5)])
            else:
                bx, by = keys(f, [(46, HX + 8), (56, HX + 2)]), keys(f, [(46, cap_top + 5), (56, HY + 1)])
            if f >= 56:
                bx += round(osc(f, 4, 1))                # cosquillas
            bug(b, bx, by, (f // 2) % 2)
        if 72 <= f < 86:                                 # sale disparado
            k = seg(f, 72, 86)
            bug(b, HX + 2 + k * 30, HY + 1 - math.sin(k * math.pi) * 12, f % 2)
        if 72 <= f < 80:
            puff(b, HX + 6, HY + 6, seg(f, 72, 80), C['furL'], C['ice'])
            burst(b, HX + 2, HY + 4, seg(f, 72, 78), 4, 10, 8, FX['white'])
            text(b, '¡ACHÚ!', HX - 26, HY - 14, FX['white'])
        if 86 <= f < 96:
            question(b, HX + 11, HY - 16)
        c.add(b)
    c.hold(500)
    return c



# ---------------------------------------------------------------- acciones generales (hablar, explicar, saludar…)

from acciones import Mascota, OJOS, BOCAS, MANOS, todas  # noqa: E402


POLO_OJOS = {'abiertos': 'sleepy', 'cerrados': 'closed', 'felices': 'happy', 'sorpresa': 'wide', 'guiño': 'wink',
             'concentrado': 'sleepy'}
POLO_BOCAS = {'cerrada': 'smile', 'media': 'flat', 'abierta': 'open', 'sonrisa': 'smile', 'plana': 'flat'}


def _dibujar(brazo=None, brazoB=None, gesto='puño', ojos='abiertos', boca='cerrada', cejas=None, cabeza=0, f=0):
    kw = dict(eyes=POLO_OJOS[ojos], mouth=POLO_BOCAS[boca], headDy=cabeza, tail=osc(f, 30, 1.0),
              capDy=-2 if ojos == 'sorpresa' else 0)
    if brazo is not None:                           # levanta la pata delantera
        kw.update(sy=39, upF=brazo[0], loF=brazo[1])
    return draw(Pose(**kw))


MASCOTA = Mascota('polo', _dibujar, cabeza=(HX, HY), hombro=(HX + 3, OY - 11), cintura=OY - 6,
                  entrada='caminar', acento=C['ice'])


def clips():
    return [reposo(), especial(), siesta()] + todas(MASCOTA)
