"""BYTE · animaciones: reposo con código corriendo, «Desenrollado de recursión» y el gag «Culebrita».

    python3 mascotas/animar_mascotas.py byte
"""
from __future__ import annotations
import math

from byte import Pose, draw, PAL, byte_mini, text as btext, STREAM
from pixel import OX, OY
from animar import (Clip, MS, FX, keys, seg, osc, back, ease_in, ease_out, smooth, blink,
                    shift, lean, squash, stretch, flip, flash, sparkle, bang, question, sweat, dust, puff,
                    burst, ring, text, text_w, float_text)

HX, HY = OX, OY - 34 + 7            # centro aproximado de la cabeza de bloque


def code_at(f, speed=4):
    i = (f // speed) % len(STREAM)
    return (STREAM * 2)[i:i + 6]


def reposo() -> Clip:
    c = Clip('reposo', 'el código corre por su franja letra a letra; parpadea y da un saltito de un bloque', bucle=True)
    N = 44
    for f in range(N):
        k = f - 24
        dy, sq = 0, 0
        if 0 <= k < 2:
            sq = -1
        elif 2 <= k < 8:
            dy = -2 if 3 <= k < 7 else -1                 # salta un bloque (2 px)
        elif 8 <= k < 10:
            sq = -1
        p = Pose(code=code_at(f), eyes='closed' if blink(f, N, 12, 2) else ('happy' if 2 <= k < 8 else 'open'),
                 mouth='grin' if 2 <= k < 8 else 'smile',
                 upF=20 + (40 if 2 <= k < 8 else 0), upB=20 + (40 if 2 <= k < 8 else 0))
        b = draw(p)
        if sq:
            b = squash(b, 1.06, 0.94)
        c.add(shift(b, 0, dy))
    return c


PX = OX + 18                         # pozo de recursión


def pit(b, w=14, glow=False):
    x0 = PX + (14 - w) // 2
    if w <= 0:
        return
    b.rect(x0, OY - 1, w, 2, PAL['y']); b.rect(x0, OY - 1, w, 1, PAL['g'])
    if w > 2:
        b.rect(x0 + 1, OY + 1, w - 2, 12, PAL['pit'])
        if w > 8:
            b.rect(x0 + 4, OY + 4, w - 8, 9, PAL['pitD'] if not glow else PAL['gD'])


def flag(b, h, wave):
    """Bandera «AC» que sube (h 0..1)."""
    if h <= 0:
        return
    fx = PX + 7
    top = OY - round(16 * h)
    b.rect(fx, top, 1, OY - top, '#BFC5CD')
    if h > 0.5:
        for i in range(10):
            dy = round(math.sin(wave + i * 0.7) * 0.6)
            b.rect(fx + 1 + i, top + dy, 1, 7, PAL['green'])
        btext(b, 'AC', fx + 2, top + 1, PAL['white'])


def especial() -> Clip:
    """Se abre el pozo; Byte se divide en copias cada vez más pequeñas que saltan y caen una tras otra
    (las llamadas recursivas). Al llegar al fondo, todas emergen a la vez, vuelven a ser una sola y
    sube la bandera «AC»: sin desbordar la pila."""
    c = Clip('especial', 'Desenrollado de recursión: copias cada vez más pequeñas caen al pozo, emergen juntas y sube «AC»', bucle=False)
    N = 84
    sizes = (6, 4, 3, 2)
    for f in range(N):
        if f < 10:
            eyes, mouth, up, lo = 'wide', 'o', 90, 90
        elif f < 50:
            eyes, mouth, up, lo = 'open', 'flat', 90, 90
        elif f < 58:
            eyes, mouth, up, lo = 'wide', 'o', 60, 160
        else:
            eyes, mouth, up, lo = 'happy', 'grin', 125, 170
        p = Pose(upF=up, loF=lo, upB=up if f >= 58 else 20, loB=lo if f >= 58 else 10, eyes=eyes, mouth=mouth,
                 code='TLE' if f < 10 else ('RECUR' if f < 50 else 'RET'), bodyDy=-1 if 58 <= f < 62 else 0)
        b = draw(p)
        w = round(14 * back(seg(f, 2, 8))) if f < 60 else round(14 * (1 - seg(f, 60, 66)))
        pit(b, w, glow=42 <= f < 50)
        # copias: cada una nace en la cabeza de Byte, salta en arco y cae al fondo
        for i, k in enumerate(sizes):
            t0 = 12 + i * 7
            kk = seg(f, t0, t0 + 10)
            if kk <= 0:
                continue
            bottom = (PX + 4 + i, OY + 10 - i * 2)
            if f < 50:
                sx, sy = HX + 4, HY - 4
                x = sx + (bottom[0] - sx) * kk
                y = sy + (bottom[1] - sy) * kk - math.sin(kk * math.pi) * (10 - i * 2)
                byte_mini(b, round(x), round(y), k)
            elif f < 58:                               # emergen todas a la vez hacia Byte
                ke = ease_in(seg(f, 50, 57))
                x = bottom[0] + (HX - 2 - bottom[0]) * ke
                y = bottom[1] + (HY - 2 - bottom[1]) * ke - math.sin(ke * math.pi) * 8
                byte_mini(b, round(x), round(y), k)
        if f == 57:
            b = flash(b, PAL['gL'])
        if 57 <= f < 66:
            ring(b, HX, HY, seg(f, 57, 66), 13, PAL['y'])
        if 42 <= f < 50:
            text(b, 'n=0', PX + 1, OY - 10, PAL['gL'])
        flag(b, back(seg(f, 64, 72), 1.6), f * 0.6)
        sparkle(b, PX + 20, OY - 18, seg(f, 70, 80), PAL['y'])
        sparkle(b, HX - 12, HY - 6, seg(f, 66, 76), PAL['gL'])
        c.add(b)
    c.hold(500)
    return c


def extra_tail(b, n, dx=0):
    """Bloques que gana la cola al comer (crece como en el juego de la culebrita)."""
    for i in range(n):
        b.rect(OX - 15 + dx, OY - 23 - i * 2, 3, 2, PAL['g'] if i % 2 else PAL['y'])


def food(b, x, y, f):
    """Bug rojo de comida que parpadea."""
    b.rect(x, y, 2, 2, FX['red'] if f % 6 < 4 else '#FF8A80')
    b.set(x - 1, y, FX['red']); b.set(x + 2, y, FX['red'])


def culebrita() -> Clip:
    """Gag: aparece un bug a la derecha; Byte avanza a saltos de bloque, se lo come (+1) y la cola le
    crece un bloque. Aparece otro al otro lado: va a saltos hasta él, se lo come (+1) y crece otra vez. Eructa: «¡UPS!»."""
    c = Clip('culebrita', 'gag: como en la culebrita, avanza a saltos de bloque, se come dos bugs, le crece la cola y eructa', bucle=False)
    N = 104
    for f in range(N):
        grown = (1 if f >= 30 else 0) + (1 if f >= 70 else 0)
        facing = 1
        x = 0
        eyes, mouth = 'open', 'smile'
        if f < 10:
            eyes, mouth = 'wide', 'o'
        elif f < 26:                                   # avanza a saltos de 4 px
            x = min(12, ((f - 10) // 4 + 1) * 4)
            mouth = 'o'
        elif f < 32:
            x, mouth, eyes = 12, ('o' if f < 28 else 'grin'), 'happy'
        elif f < 44:
            x, eyes = 12, ('wide' if f >= 36 else 'open')
        elif f < 66:                                   # avanza a saltos hacia el otro lado
            facing = -1
            x = 12 - min(20, ((f - 46) // 4 + 1) * 4) if f >= 46 else 12
            mouth = 'o'
        elif f < 76:
            facing = -1
            x, mouth, eyes = -8, ('o' if f < 68 else 'grin'), 'happy'
        else:
            facing = -1
            x, eyes = -8, ('closed' if f < 84 else 'happy')
            mouth = 'o' if 78 <= f < 84 else 'grin'
        hopping = (10 <= f < 26 or 46 <= f < 66) and (f - 10) % 4 in (1, 2)
        p = Pose(code=code_at(f, 3), eyes=eyes, mouth=mouth)
        b = draw(p)
        extra_tail(b, grown)
        b = shift(b, x, -2 if hopping else 0)
        if (10 <= f < 26 or 46 <= f < 66) and (f - 10) % 4 == 3:
            dust(b, OX + x, OY, 0.5, side=-facing)
        # comida
        if 4 <= f < 28:
            food(b, OX + 22, OY - 26, f)
        if 36 <= f < 68:
            food(b, OX - 30, OY - 26, f)
        if 4 <= f < 10:
            bang(b, HX + x + 10, HY - 14, FX['yellow'])
        if 36 <= f < 42:
            bang(b, HX + x - 10, HY - 14, FX['yellow'])
        if 28 <= f < 32:
            burst(b, OX + 22, OY - 25, seg(f, 28, 32), 2, 6, 6, FX['white'])
        if 68 <= f < 72:
            burst(b, OX - 30, OY - 25, seg(f, 68, 72), 2, 6, 6, FX['white'])
        float_text(b, '+1', OX + 22, OY - 30, seg(f, 28, 44), PAL['y'])
        float_text(b, '+1', OX - 28, OY - 30, seg(f, 68, 84), PAL['y'])
        if 78 <= f < 90:                                # ¡eructo!
            puff(b, HX + x - 10, HY + 4, seg(f, 78, 88), FX['white'], PAL['gL'])
            if f >= 82:
                text(b, '¡UPS!', HX + x + 9, HY - 12, PAL['gL'])
        sparkle(b, HX + x + 9, HY - 10, seg(f, 90, 100), PAL['y'])
        c.add(b)
    c.hold(500)
    return c



# ---------------------------------------------------------------- acciones generales (hablar, explicar, saludar…)

from acciones import Mascota, OJOS, BOCAS, MANOS, todas  # noqa: E402


def _dibujar(brazo=None, brazoB=None, gesto='puño', ojos='abiertos', boca='cerrada', cejas=None, cabeza=0, f=0):
    up, lo = brazo or (20, 10)
    ub, lb = brazoB or (20, 10)
    return stretch(draw(Pose(upF=up, loF=lo, upB=ub, loB=lb, eyes=OJOS[ojos], mouth=BOCAS[boca], code=code_at(f))),
                   -cabeza, OY - 18)


MASCOTA = Mascota('byte', _dibujar, cabeza=(HX, HY), hombro=(OX + 5, OY - 16), cintura=OY - 9,
                  entrada='saltos', acento=PAL['y'], pies=False)


def clips():
    return [reposo(), especial(), culebrita()] + todas(MASCOTA)
