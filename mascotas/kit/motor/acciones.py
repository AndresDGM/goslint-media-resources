"""Acciones generales de las mascotas: hablar, explicar, saludar, señalar, pensar, celebrar, sorpresa,
entrar, salir y la hoja de bocas para sincronizar con la voz.

Las acciones son las mismas para todas; cada mascota solo aporta un adaptador (`Mascota`) que
traduce un vocabulario común a sus propios parámetros:

  · brazo / brazoB: None (reposo) o (ángulo del brazo, ángulo del antebrazo), como arm() del motor
  · gesto: mano delantera · 'puño', 'abierta', 'indice', 'pulgar' (si la mascota tiene manos)
  · ojos:  'abiertos', 'cerrados', 'felices', 'sorpresa', 'guiño', 'concentrado'
  · boca:  'cerrada', 'media', 'abierta', 'sonrisa', 'plana'
  · cejas: None, 'arriba', 'concentrado'
  · cabeza: px que baja la cabeza (asentir) · f: fotograma (pelo, humo, código, vapor…)
"""
from __future__ import annotations
import math
from dataclasses import dataclass
from typing import Callable

from pixel import Buf, OX, OY, dirv
from animar import (Clip, MS, FX, keys, seg, osc, back, ease_in, ease_out, smooth, blink, clamp, lerp,
                    shift, lean, squash, stretch, flash, paso, materialize, glitch, sparkle, bang, sweat,
                    dust, puff, burst, ring, text, speed_lines, confetti)

# ángulos de brazo comunes (los de las poses de la guía)
BRAZO = {
    'saludo': (115, 165), 'señalar': (90, 90), 'menton': (30, -150), 'arriba': (125, 170),
    'explicar': (65, 115), 'contar': (95, 175), 'abierto': (60, 160), 'atras': (25, -40),
}

# sílabas del bucle de habla (c = cerrada · m = media · a = abierta), 2 fotogramas cada una (~6 por segundo)
SILABAS = 'cmaamcmaccmaamamcmmacaac'


# traducciones más comunes (la mayoría de las mascotas usan estos nombres en su Pose)
OJOS = {'abiertos': 'open', 'cerrados': 'closed', 'felices': 'happy', 'sorpresa': 'wide', 'guiño': 'wink', 'concentrado': 'open'}
BOCAS = {'cerrada': 'smile', 'media': 'grin', 'abierta': 'o', 'sonrisa': 'grin', 'plana': 'flat'}
MANOS = {'puño': 'fist', 'abierta': 'open', 'indice': 'point', 'pulgar': 'thumb'}


@dataclass
class Mascota:
    nombre: str
    dibujar: Callable[..., Buf]
    cabeza: tuple            # (x, y) centro de la cabeza en reposo
    hombro: tuple            # (x, y) hombro del brazo delantero
    cintura: int             # fila donde se corta para estirar o aplastar
    entrada: str = 'caminar' # caminar · flotar · saltos · disparado · deslizar · materializar
    acento: str = '#00C063'
    salto: int = 7           # altura del salto al celebrar
    pies: bool = True        # si tiene pies que se levanten al caminar
    largo: tuple = (4, 4)    # largo del brazo y del antebrazo de arm()
    manita: tuple | None = None  # (mano, manga[, punta]) para dibujar las manitas del gesto «gatito»


def mano(M: Mascota, brazo, dy=0):
    """Dónde queda la mano delantera para un par de ángulos."""
    up, lo = brazo
    sx, sy = M.hombro
    ex, ey = dirv(up, 1)
    el = (sx + ex * M.largo[0], sy + dy + ey * M.largo[0])
    ux, uy = dirv(lo, 1)
    return el[0] + ux * M.largo[1], el[1] + uy * M.largo[1]


def mezcla(a, b_, k):
    """Interpola dos brazos (None = reposo, que se toma como colgando)."""
    a = a or (12, 6)
    b_ = b_ or (12, 6)
    return (lerp(a[0], b_[0], k), lerp(a[1], b_[1], k))


def boca_habla(f):
    return {'c': 'cerrada', 'm': 'media', 'a': 'abierta'}[SILABAS[(f // 2) % len(SILABAS)]]


# ---------------------------------------------------------------- acciones

def hablar(M: Mascota) -> Clip:
    """Bucle de habla: la boca sigue sílabas, asiente en los acentos, sube las cejas y parpadea."""
    c = Clip('hablar', 'bucle de habla: boca por sílabas, asiente en los acentos y parpadea (etiquetas = boca de cada fotograma)', bucle=True)
    N = len(SILABAS) * 2
    for f in range(N):
        boca = boca_habla(f)
        acento = (f // 2) in (3, 12, 19)
        b = M.dibujar(boca=boca, ojos='cerrados' if blink(f, N, 30, 2) else 'abiertos',
                      cejas='arriba' if 22 <= f < 30 else None, cabeza=1 if acento else 0, f=f)
        b = lean(b, round(osc(f, N, 1.2)))
        c.add(b, etiqueta=boca)
    return c


def bocas(M: Mascota) -> Clip:
    """Tres fotogramas quietos (boca cerrada, media y abierta) para sincronizar la boca con la voz."""
    c = Clip('bocas', 'boca cerrada · media · abierta, para sincronizar con la voz (usar según el volumen)', bucle=False)
    for boca in ('cerrada', 'media', 'abierta'):
        c.add(M.dibujar(boca=boca, f=0), etiqueta=boca)
    return c


def explicar(M: Mascota) -> Clip:
    """Habla gesticulando: palma abierta, señala a un lado y levanta el índice para enumerar."""
    c = Clip('explicar', 'habla gesticulando: palma abierta, señala a un lado y levanta el índice (etiquetas = boca)', bucle=True)
    tramos = [(BRAZO['explicar'], 'abierta', None), (BRAZO['señalar'], 'indice', None),
              (BRAZO['contar'], 'indice', BRAZO['explicar'])]
    L = 24
    N = L * len(tramos)
    for f in range(N):
        i, k = divmod(f, L)
        cur, nxt = tramos[i], tramos[(i + 1) % len(tramos)]
        t = ease_out(seg(k, 0, 5))
        prev = tramos[i - 1]
        brazo = mezcla(prev[0], cur[0], back(seg(k, 0, 5), 1.6))
        brazo = (brazo[0] + osc(k, 12, 5) * (k > 5), brazo[1] + osc(k, 6, 6) * (i == 0 and k > 5))
        brazoB = mezcla(prev[2], cur[2], t)
        brazoB = None if brazoB == (12, 6) else brazoB
        boca = boca_habla(f)
        b = M.dibujar(brazo=brazo, brazoB=brazoB, gesto=cur[1] if k >= 2 else prev[1], boca=boca,
                      ojos='cerrados' if blink(f, N, 40, 2) else 'abiertos',
                      cejas='arriba' if i == 2 else ('concentrado' if i == 1 else None),
                      cabeza=1 if k in (6, 7) else 0, f=f)
        b = lean(b, 1 if i == 1 and k > 3 else 0)
        c.add(b, etiqueta=boca)
    return c


def saludar(M: Mascota) -> Clip:
    c = Clip('saludar', 'saluda con la mano: anticipa, da un saltito y agita la mano con rebote', bucle=False)
    N = 36
    for f in range(N):
        up = keys(f, [(2, 12), (7, BRAZO['saludo'][0]), (30, BRAZO['saludo'][0]), (36, 12)], back if f < 10 else smooth)
        lo = BRAZO['saludo'][1] + 18 * math.sin((f - 7) * 0.9) if 7 <= f < 30 else keys(f, [(2, 6), (7, 165), (30, 165), (36, 6)])
        b = M.dibujar(brazo=(up, lo) if f >= 2 else None, gesto='abierta', ojos='felices' if 5 <= f < 32 else 'abiertos',
                      boca='sonrisa' if 5 <= f < 32 else 'cerrada', cejas='arriba' if 5 <= f < 32 else None, f=f)
        if 2 <= f < 5:
            b = stretch(b, -1, M.cintura)
        dy = -round(math.sin(seg(f, 5, 11) * math.pi) * 3) if 5 <= f < 11 else 0
        b = shift(b, 0, dy)
        if 11 <= f < 13:
            b = squash(b, 1.06, 0.94)
        if 8 <= f < 30:
            hx, hy = mano(M, (up, lo))
            for i in range(2):
                a = math.radians(-60 + i * 30 + 15 * math.sin(f * 0.9))
                b.set(round(hx + math.cos(a) * 4), round(hy - 1 + math.sin(a) * 4), FX['white'])
        sparkle(b, M.cabeza[0] - 11, M.cabeza[1] - 8, seg(f, 10, 20), M.acento)
        c.add(b)
    return c


def senalar(M: Mascota) -> Clip:
    c = Clip('senalar', 'señala a la derecha: toma impulso hacia atrás, señala de golpe y lo comenta', bucle=False)
    N = 32
    for f in range(N):
        if f < 5:
            brazo = mezcla(None, BRAZO['atras'], ease_out(seg(f, 0, 5)))
            lk = -1
        else:
            brazo = mezcla(BRAZO['atras'], BRAZO['señalar'], back(seg(f, 5, 9), 2.2))
            lk = 1 if f < 14 else 0
        boca = 'cerrada' if f < 12 else boca_habla(f - 12)
        b = M.dibujar(brazo=brazo, gesto='indice', ojos='concentrado' if f < 5 else 'abiertos',
                      boca=boca if f >= 9 else ('plana' if f < 5 else 'abierta'), cejas='concentrado' if f < 9 else 'arriba', f=f)
        b = lean(b, lk)
        hx, hy = mano(M, brazo)
        if 8 <= f < 13:
            burst(b, hx + 3, hy, seg(f, 8, 13), 2, 6, 6, FX['white'])
        if 9 <= f < 16:
            speed_lines(b, round(hx) - 8, round(hy) - 2, 5, side=-1, ln=4, col=FX['white'], gap=2)
        c.add(b)
    return c


def pensar(M: Mascota) -> Clip:
    c = Clip('pensar', 'piensa: mano al mentón, salen los puntos suspensivos… ¡y le llega la idea!', bucle=False)
    N = 52
    hx, hy = M.cabeza
    for f in range(N):
        if f < 30:
            brazo = mezcla(None, BRAZO['menton'], back(seg(f, 0, 6), 1.6))
            ojos, boca, cejas = ('concentrado' if f % 24 < 20 else 'cerrados'), 'plana', 'concentrado'
            lk = -1 if f >= 4 else 0
        else:
            brazo = mezcla(BRAZO['menton'], BRAZO['contar'], back(seg(f, 30, 34), 2))
            ojos, boca, cejas = ('sorpresa' if f < 38 else 'felices'), ('abierta' if f < 38 else 'sonrisa'), 'arriba'
            lk = 0
        b = M.dibujar(brazo=brazo, gesto='indice' if f >= 30 else 'puño', ojos=ojos, boca=boca, cejas=cejas, f=f)
        b = lean(b, lk)
        if 30 <= f < 33:
            b = shift(b, 0, -2)
        for i, t0 in enumerate((8, 14, 20)):           # puntos suspensivos que suben en arco
            if t0 <= f < 30:
                k = seg(f, t0, t0 + 4)
                b.set(hx + 8 + i * 3, hy - 9 - i * 2 - round(back(k) * 1), FX['white'])
        if 28 <= f < 40:
            bang(b, hx + 9, hy - 16 - round(back(seg(f, 28, 32)) * 2), FX['yellow'])
            burst(b, hx + 9, hy - 13, seg(f, 29, 36), 3, 8, 8, FX['yellow'])
        sparkle(b, hx - 10, hy - 10, seg(f, 34, 44), FX['yellow'])
        sparkle(b, hx + 13, hy - 4, seg(f, 38, 48), M.acento)
        c.add(b)
    return c


def celebrar(M: Mascota) -> Clip:
    c = Clip('celebrar', 'celebra: se agacha, salta con los brazos arriba, aterriza con aplastón y confeti', bucle=False)
    N = 44
    hx, hy = M.cabeza
    for f in range(N):
        arriba = (BRAZO['arriba'][0] + (osc(f, 6, 10) if f >= 20 else 0), BRAZO['arriba'][1])
        brazo = mezcla(None, arriba, back(seg(f, 3, 7), 1.6)) if f >= 3 else None
        b = M.dibujar(brazo=brazo, brazoB=brazo, gesto='abierta', ojos='felices' if f >= 4 else 'cerrados',
                      boca='abierta' if 4 <= f < 20 else ('sonrisa' if f >= 20 else 'plana'), cejas='arriba', f=f)
        if f < 4:
            b = stretch(b, -1 - (f >= 2), M.cintura)
        dy = -round(math.sin(seg(f, 4, 16) * math.pi) * M.salto) if 4 <= f < 16 else 0
        if 16 <= f < 18:
            b = squash(b, 1.14, 0.86)
        if 4 <= f < 8:
            b = stretch(b, 1, M.cintura)
        b = shift(b, 0, dy)
        dust(b, OX, OY, seg(f, 16, 24))
        confetti(b, hx, hy - 10, seg(f, 8, 34), 12, spread=18)
        if 16 <= f < 24:
            ring(b, hx, hy, seg(f, 16, 24), 14, M.acento)
        sparkle(b, hx - 12, hy - 4, seg(f, 22, 32), FX['yellow'])
        sparkle(b, hx + 12, hy - 10, seg(f, 26, 36), M.acento)
        c.add(b)
    return c


def sorpresa(M: Mascota) -> Clip:
    c = Clip('sorpresa', 'se sorprende: respingo, ojos muy abiertos, «!» y una gota de sudor', bucle=False)
    N = 34
    hx, hy = M.cabeza
    for f in range(N):
        sorp = f >= 3
        brazo = mezcla(None, BRAZO['abierto'], back(seg(f, 3, 6), 2)) if sorp else None
        b = M.dibujar(brazo=brazo, brazoB=brazo, gesto='abierta', ojos='sorpresa' if sorp else 'abiertos',
                      boca='abierta' if sorp else 'cerrada', cejas='arriba' if sorp else None, f=f)
        if f in (3, 4):
            b = squash(b, 1.1, 0.9)
        dy = -round(math.sin(seg(f, 5, 11) * math.pi) * 3) if 5 <= f < 11 else 0
        b = shift(b, round(osc(f, 2, 1)) if 11 <= f < 17 else 0, dy)
        if sorp:
            bang(b, hx + 9, hy - 16 - round((back(seg(f, 3, 7), 3) - 1) * 3), FX['yellow'])
        if 4 <= f < 10:
            burst(b, hx, hy - 2, seg(f, 4, 10), 8, 13, 10, FX['white'])
        sweat(b, hx - 8, hy - 5, seg(f, 12, 24))
        c.add(b)
    return c


def _moverse(M: Mascota, f, N, entra: bool):
    """Desplazamiento x, y, inclinación y si está en marcha, según el estilo de la mascota."""
    k = seg(f, 0, N - 8) if entra else seg(f, 6, N)
    D = 46
    est = M.entrada
    if est == 'disparado':
        if entra:
            x = -60 + 60 * back(seg(f, 0, 8), 1.2) if f < 8 else 0
            return x, 0, (-3 if 6 <= f < 12 else 0), f < 8
        x = 70 * ease_in(seg(f, 8, 14))
        return x, 0, (2 if 4 <= f < 14 else 0), 8 <= f < 14
    if est == 'saltos':
        x = (-D + D * k) if entra else D * k
        h = abs(math.sin(k * math.pi * 3)) * 6
        return x, -h, 0, 0 < k < 1
    if est == 'flotar':
        x = (-D + D * ease_out(k)) if entra else D * ease_in(k)
        return x, -3 * math.sin(k * math.pi) + osc(f, 12, 1), 0, 0 < k < 1
    if est == 'materializar':
        return 0, 0, 0, False
    x = (-D + D * ease_out(k)) if entra else D * ease_in(k)
    lk = 1 if 0 < k < 1 else 0
    if est == 'deslizar':
        lk = round(osc(f, 8, 2)) if 0 < k < 1 else 0
    return x, 0, lk, 0 < k < 1


def _caminando(M, b, f, moving, x, y, lk):
    if moving and M.entrada == 'caminar':
        fase = (f // 3) % 2
        if M.pies:
            b = paso(b, fase)
        y += -1 if f % 3 == 1 else 0
    b = lean(b, lk)
    return shift(b, x, y)


def entrar(M: Mascota) -> Clip:
    c = Clip('entrar', f'entra en cuadro desde la izquierda ({M.entrada}) y se planta con un rebote', bucle=False)
    N = 36
    hx, hy = M.cabeza
    for f in range(N):
        x, y, lk, moving = _moverse(M, f, N, True)
        b = M.dibujar(ojos='abiertos' if moving else ('felices' if f >= N - 8 else 'abiertos'),
                      boca='sonrisa' if f >= N - 8 else 'cerrada', f=f)
        if M.entrada == 'materializar':
            k = seg(f, 0, 24)
            b = materialize(b, k, 7) if k < 1 else b
            if 4 <= f < 20 and f % 4 < 2:
                y0 = hy - 8 + (f * 7) % 24
                b = glitch(b, [(y0, y0 + 2, 2 if f % 2 else -2)])
        else:
            b = _caminando(M, b, f, moving, x, y, lk)
        if not moving and f >= N - 8 and f < N - 6 and M.entrada != 'materializar':
            b = squash(b, 1.06, 0.94)
        if M.entrada == 'saltos' and moving and abs(y) < 1:
            dust(b, OX + round(x), OY, 0.4)
        if M.entrada == 'disparado' and moving:
            speed_lines(b, round(OX + x) - 12, hy - 4, 20, side=-1, ln=7, col=FX['white'], gap=3)
        if M.entrada == 'disparado' and 6 <= f < 14:
            dust(b, OX - 4, OY, seg(f, 6, 14), side=-1)
        if M.entrada == 'caminar' and moving and f % 6 == 0:
            dust(b, OX + round(x) - 4, OY, 0.5, side=-1)
        sparkle(b, hx + 11, hy - 8, seg(f, N - 8, N), M.acento)
        c.add(b)
    c.hold(300)
    return c


def salir(M: Mascota) -> Clip:
    c = Clip('salir', f'se despide con la mano y sale de cuadro por la derecha ({M.entrada})', bucle=False)
    N = 40
    hx, hy = M.cabeza
    for f in range(N):
        x, y, lk, moving = _moverse(M, f - 6, N - 6, False) if f >= 6 else (0, 0, 0, False)
        if f < 6:
            brazo = (BRAZO['saludo'][0], BRAZO['saludo'][1] + 18 * math.sin(f * 1.2))
            b = M.dibujar(brazo=brazo, gesto='abierta', ojos='felices', boca='sonrisa', f=f)
        else:
            b = M.dibujar(ojos='abiertos', boca='sonrisa', f=f)
        if M.entrada == 'materializar':
            k = 1 - seg(f, 8, 32)
            if k < 1:
                b = materialize(b, k, 7)
            if 8 <= f < 30 and f % 4 < 2:
                y0 = hy - 8 + (f * 7) % 24
                b = glitch(b, [(y0, y0 + 2, 2 if f % 2 else -2)])
        else:
            x = x * (b.w - OX + 22) / 46               # que salga del todo, aunque el lienzo sea más ancho
            b = _caminando(M, b, f, moving, x, y, lk)
        if M.entrada == 'disparado' and moving:
            speed_lines(b, round(OX + x) - 10, hy - 4, 20, side=-1, ln=8, col=FX['white'], gap=3)
            dust(b, OX + round(x) - 4, OY, 0.5, side=-1)
        if M.entrada == 'saltos' and moving and abs(y) < 1:
            dust(b, OX + round(x), OY, 0.4)
        vacio = not any(any(r) for r in b.px)
        if vacio and c.frames and not any(any(r) for r in c.frames[-1][0].px):
            break                                      # ya salió: un solo fotograma vacío al final basta
        c.add(b)
    return c


# baile «scuba»: una mano sube a la cara (como sujetando el tubo de buceo) y la otra sale al lado
SCUBA_CARA = (-35, -178)      # codo hacia adentro, antebrazo arriba: la mano queda bajo el mentón
SCUBA_AFUERA = (80, 100)      # brazo afuera, antebrazo horizontal: la mano sale al lado del pecho


def _mano_en(sh, brazo, side, largo):
    up, lo = brazo
    ex, ey = dirv(up, side)
    el = (sh[0] + ex * largo[0], sh[1] + ey * largo[0])
    ux, uy = dirv(lo, side)
    return el, (el[0] + ux * largo[1], el[1] + uy * largo[1])


def scuba(M: Mascota) -> Clip:
    """Baile «scuba» (el de TikTok): a golpe de ritmo, una mano sube a la cara y la otra sale hacia el
    lado, y se turnan (unas 2,4 veces por segundo). En cada tiempo el cuerpo da un rebotito, se inclina
    hacia el brazo que sale y pisa con un pie y luego con el otro. Ojos muy abiertos. Bucle."""
    c = Clip('scuba', 'baile «scuba»: una mano a la cara y la otra al lado, se turnan a golpe de ritmo con rebotito y pasitos', bucle=True)
    P = 5                                            # fotogramas por tiempo
    N = P * 8
    shB = (2 * OX - M.hombro[0] - 1, M.hombro[1])
    for f in range(N):
        t, k = divmod(f, P)
        k_cambio = back(seg(k, 0, 2), 2.2)           # el cambio de manos es seco, con rebote
        lado = 1 if t % 2 == 0 else -1               # qué mano sale (1 = la delantera)
        if lado == 1:
            brazo = mezcla(SCUBA_CARA, SCUBA_AFUERA, k_cambio)
            brazoB = mezcla(SCUBA_AFUERA, SCUBA_CARA, k_cambio)
        else:
            brazo = mezcla(SCUBA_AFUERA, SCUBA_CARA, k_cambio)
            brazoB = mezcla(SCUBA_CARA, SCUBA_AFUERA, k_cambio)
        b = M.dibujar(brazo=brazo, brazoB=brazoB, gesto='puño',
                      ojos='cerrados' if f in (26, 27) else 'sorpresa',
                      boca='media' if k == 1 else 'cerrada', cejas='arriba', cabeza=1 if k == 0 else 0, f=f)
        if M.manita:                                 # manos y antebrazos visibles encima de la ropa
            mano, manga = M.manita[0], M.manita[1]
            punta = M.manita[2] if len(M.manita) > 2 else None
            for sh, br, side in ((M.hombro, brazo, 1), (shB, brazoB, -1)):
                el, hd = _mano_en(sh, br, side, M.largo)
                b.line(el[0], el[1], hd[0], hd[1], manga)
                x, y = round(hd[0]) - 1, round(hd[1]) - 1
                b.rect(x, y, 2, 2, mano)
                b.set(x + (2 if side > 0 else -1), y, mano)              # deditos
                if punta:
                    b.rect(x, y + 1, 2, 1, punta)
        if k == 0:
            b = stretch(b, -1, M.cintura)            # rebotito en el tiempo
        if M.pies and k in (1, 2):
            b = paso(b, t % 2)                       # pasito: un pie, luego el otro
        b = lean(b, lado if k >= 1 else -lado)       # se inclina hacia el brazo que sale
        b = shift(b, 0, -1 if k in (1, 2) else 0)
        hx, hy = M.cabeza
        if k in (1, 2):                              # rayitas en la mano que sale
            x = hx + lado * 13
            y = hy + 10
            b.set(x, y, FX['white']); b.set(x + lado, y - 2, FX['white']); b.set(x + lado, y + 2, FX['white'])
        if k == 0 and t % 4 == 0:
            from animar import note
            note(b, hx - 14 + (t // 4) * 26, hy - 12, M.acento)
        c.add(b)
    return c


def todas(M: Mascota) -> list[Clip]:
    return [hablar(M), bocas(M), explicar(M), saludar(M), senalar(M), pensar(M), celebrar(M),
            sorpresa(M), entrar(M), salir(M)]
