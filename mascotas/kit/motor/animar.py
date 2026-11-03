"""Motor de animación de las mascotas de Goslint (Python + Pillow).

Complementa a `pixel.py`: las poses siguen saliendo de `draw(pose)` de cada mascota y aquí están las
piezas para convertirlas en animaciones vivas y deterministas:

  · curvas (easing): `smooth`, `ease_out`, `back`, `bounce`, `keys`… para que nada se mueva lineal;
  · transformaciones de píxel sobre un `Buf` ya dibujado: `stretch` (estirar o aplastar desde la
    cintura sin mover los pies), `lean` (inclinar), `shift`, `squash` (aplastar en un aterrizaje),
    `glitch`, `flash`…;
  · efectos cómicos: sudor, «!», «?», estrellas de mareo, polvo, líneas de velocidad, zzz, corazones,
    notas, destellos, onda de impacto, vapor y texto de 3 × 5;
  · `Clip` y `exportar()`: cada animación se guarda como GIF de vista previa (8x, fondo #070807),
    tira de fotogramas 1x con caja común y `clips.json` (duraciones, ancla de los pies, bucle).

Reglas: todo depende del número de fotograma (nada de azar sin semilla) y los pies se quedan en
OY salvo que la animación los despegue a propósito (saltos, despegues).
"""
from __future__ import annotations
import json, math, os
from dataclasses import dataclass, field
from PIL import Image
from pixel import Buf, OX, OY, rnd

FPS = 12
MS = round(1000 / FPS)          # 83 ms por fotograma
FONDO = (7, 8, 7)

# colores de efectos (comunes a todas las mascotas)
FX = {
    'white': '#FFFFFF', 'ice': '#A8E6FF', 'iceD': '#4FB3E6', 'sweat': '#8ED3F0',
    'yellow': '#F2C230', 'red': '#E2463E', 'pink': '#FF7A9C', 'green': '#00C063',
    'glow': '#7CFFB3', 'dust': '#9AA3AD', 'dustD': '#6A727C', 'ink': '#141018',
}


# ---------------------------------------------------------------- curvas

def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def lerp(a, b, t):
    return a + (b - a) * t


def seg(t, a, b):
    """Avance 0..1 de t dentro del tramo [a, b]."""
    return clamp((t - a) / (b - a)) if b != a else float(t >= b)


def smooth(t):
    t = clamp(t)
    return t * t * (3 - 2 * t)


def ease_in(t):
    t = clamp(t)
    return t * t * t


def ease_out(t):
    t = clamp(t)
    return 1 - (1 - t) ** 3


def back(t, s=1.9):
    """Sale, se pasa un poco y vuelve (rebote de muelle)."""
    t = clamp(t) - 1
    return t * t * ((s + 1) * t + s) + 1


def bounce(t):
    t = clamp(t)
    n, d = 7.5625, 2.75
    if t < 1 / d:
        return n * t * t
    if t < 2 / d:
        t -= 1.5 / d
        return n * t * t + 0.75
    if t < 2.5 / d:
        t -= 2.25 / d
        return n * t * t + 0.9375
    t -= 2.625 / d
    return n * t * t + 0.984375


def elastic(t):
    t = clamp(t)
    if t in (0, 1):
        return t
    return 2 ** (-10 * t) * math.sin((t * 10 - 0.75) * 2 * math.pi / 3) + 1


def osc(t, period, amp=1.0, phase=0.0):
    """Seno de periodo `period` (en fotogramas o en la unidad de t)."""
    return amp * math.sin(2 * math.pi * (t / period + phase))


def keys(t, pts, ease=smooth):
    """Interpola entre fotogramas clave [(t0, v0), (t1, v1), …] con la curva `ease` en cada tramo."""
    if t <= pts[0][0]:
        return pts[0][1]
    for (t0, v0), (t1, v1) in zip(pts, pts[1:]):
        if t <= t1:
            return lerp(v0, v1, ease(seg(t, t0, t1)))
    return pts[-1][1]


def step(t, pts):
    """Valor discreto: el del último fotograma clave alcanzado (expresiones, accesorios…)."""
    v = pts[0][1]
    for t0, v0 in pts:
        if t >= t0:
            v = v0
    return v


def blink(f, every=40, at=0, dur=2):
    """True durante `dur` fotogramas cada `every` (parpadeo determinista)."""
    return (f - at) % every < dur


# ---------------------------------------------------------------- transformaciones de píxel

def copy(b: Buf) -> Buf:
    n = Buf(b.w, b.h)
    n.px = [row[:] for row in b.px]
    return n


def merge(dst: Buf, src: Buf, dx=0, dy=0):
    for y in range(src.h):
        for x in range(src.w):
            c = src.px[y][x]
            if c:
                dst.set(x + dx, y + dy, c)
    return dst


def shift(b: Buf, dx=0, dy=0) -> Buf:
    dx, dy = int(round(dx)), int(round(dy))
    if not dx and not dy:
        return b
    n = Buf(b.w, b.h)
    return merge(n, b, dx, dy)


def stretch(b: Buf, n: int, y_cut: int) -> Buf:
    """Estira (n > 0) o aplasta (n < 0) todo lo que está por encima de `y_cut` sin mover lo de abajo.
    Al estirar se repite la fila del corte; al aplastar se quitan filas justo encima del corte.
    Con el corte en la cintura, la respiración sube cabeza y pecho y los pies no se despegan."""
    n = int(round(n))
    if not n:
        return b
    out = Buf(b.w, b.h)
    for y in range(y_cut, b.h):
        out.px[y] = b.px[y][:]
    if n > 0:
        for y in range(0, y_cut):
            src = min(y + n, y_cut - 1)
            out.px[y] = b.px[src][:]
    else:
        k = -n
        for y in range(0, y_cut):
            src = y - k
            out.px[y] = b.px[src][:] if src >= 0 else [None] * b.w
    return out


def lean(b: Buf, k: float, base: int = OY, top: int = OY - 33) -> Buf:
    """Inclina (cizalla) lo que está por encima de `base`: la fila `top` se mueve `k` px, los pies nada."""
    if abs(k) < 0.5:
        return b
    out = Buf(b.w, b.h)
    for y in range(b.h):
        d = 0 if y >= base else int(round(k * (base - y) / max(1, base - top)))
        for x in range(b.w):
            c = b.px[y][x]
            if c:
                out.set(x + d, y, c)
    return out


def squash(b: Buf, sx: float, sy: float, ax: float = OX, ay: float = OY) -> Buf:
    """Escala sin suavizar alrededor del ancla (pies). Úsalo solo 1 o 2 fotogramas: impactos y saltos."""
    out = Buf(b.w, b.h)
    for y in range(b.h):
        for x in range(b.w):
            u = math.floor((x + 0.5 - ax) / sx + ax)
            v = math.floor((y + 0.5 - ay) / sy + ay)
            c = b.get(u, v)
            if c:
                out.px[y][x] = c
    return out


def flip(b: Buf, cx: float = OX) -> Buf:
    """Espejo horizontal alrededor de x = cx (la mascota mira hacia el otro lado)."""
    out = Buf(b.w, b.h)
    for y in range(b.h):
        for x in range(b.w):
            c = b.px[y][x]
            if c:
                out.set(round(2 * cx - x - 1), y, c)
    return out


def glitch(b: Buf, bands, seed=0) -> Buf:
    """Desplaza franjas horizontales [(y0, y1, dx), …] (fallo digital)."""
    out = copy(b)
    for y0, y1, dx in bands:
        for y in range(max(0, y0), min(b.h, y1)):
            row = b.px[y]
            out.px[y] = [None] * b.w
            for x in range(b.w):
                if row[x]:
                    xx = x + dx
                    if 0 <= xx < b.w:
                        out.px[y][xx] = row[x]
    return out


def flash(b: Buf, color='#FFFFFF') -> Buf:
    """Silueta de un solo color (fotograma de impacto)."""
    out = Buf(b.w, b.h)
    for y in range(b.h):
        for x in range(b.w):
            if b.px[y][x]:
                out.px[y][x] = color
    return out


def recolor(b: Buf, mapping: dict) -> Buf:
    out = copy(b)
    for y in range(b.h):
        for x in range(b.w):
            c = out.px[y][x]
            if c in mapping:
                out.px[y][x] = mapping[c]
    return out


def erase_rect(b: Buf, x, y, w, h):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            if 0 <= xx < b.w and 0 <= yy < b.h:
                b.px[yy][xx] = None


# ---------------------------------------------------------------- texto de 3 × 5

FONT = {
    'A': '010101111101101', 'B': '110101110101110', 'C': '011100100100011', 'D': '110101101101110',
    'E': '111100110100111', 'F': '111100110100100', 'G': '011100101101011', 'H': '101101111101101',
    'I': '111010010010111', 'K': '101101110101101', 'L': '100100100100111', 'M': '1000111011101011000110001',
    'N': '110101101101101', 'O': '111101101101111', 'P': '110101110100100', 'R': '110101110101101',
    'S': '011100010001110', 'T': '111010010010010', 'U': '101101101101111', 'V': '101101101101010',
    'W': '1000110001101011101110001', 'X': '101101010101101', 'Y': '101101010010010', 'Z': '111001010100111',
    '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
    '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010',
    '8': '111101111101111', '9': '111101111001110',
    '+': '000010111010000', '-': '000000111000000', '!': '010010010000010', '?': '110001010000010',
    '(': '010100100100010', ')': '010001001001010', '.': '000000000000010', ':': '000010000010000',
    'n': '000000110101101', 'g': '000011101011110', 'l': '100100100100010', 'o': '000000010101010',
    '²': '110010100110000', '@': '011101111100011', '*': '000101010101000', ' ': '000000000000000',
    '¡': '010000010010010', '¿': '010000010100011',
    '/': '001001010100100', '<': '001010100010001', '>': '100010001010100', '=': '000111000111000',
}


TILDES = {'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'}


def text(b: Buf, s: str, x, y, col):
    """Texto de 3 × 5 (mayúsculas, dígitos y algunos signos). Las vocales con tilde llevan su tilde
    de un píxel encima (Á É Í Ó Ú), para que los rótulos tengan la ortografía correcta."""
    x, y = int(round(x)), int(round(y))
    for ch in s:
        if ch in TILDES:
            b.set(x + 2, y - 2, col)
            ch = TILDES[ch]
        elif ch == 'Ñ':                     # virgulilla de la Ñ
            b.set(x, y - 2, col); b.set(x + 1, y - 3, col); b.set(x + 2, y - 2, col)
            ch = 'N'
        g = FONT.get(ch, FONT[' '])
        w = len(g) // 5                     # casi todas miden 3; la M y la W, 5 (si no, parecen H)
        for j in range(5):
            for i in range(w):
                if g[j * w + i] == '1':
                    b.set(x + i, y + j, col)
        x += w + 1


def text_w(s: str) -> int:
    return sum(len(FONT.get(TILDES.get(ch, 'N' if ch == 'Ñ' else ch), FONT[' '])) // 5 + 1 for ch in s) - 1


def glyph(b: Buf, x, y, rows, col):
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch == 'X':
                b.set(x + i, y + j, col)


# ---------------------------------------------------------------- efectos cómicos

def pop_in(k):
    """Escala 0..1 con rebote para que un efecto «aparezca» (0 = nada, 1 = tamaño final)."""
    return back(k, 2.4) if k < 1 else 1.0


def sparkle(b: Buf, x, y, k, col=FX['yellow'], core=FX['white']):
    """Destello de cuatro puntas que crece y se apaga con k 0..1."""
    if k <= 0 or k >= 1:
        return
    x, y = int(round(x)), int(round(y))
    r = round(math.sin(k * math.pi) * 2.6)
    b.set(x, y, core)
    for i in range(1, r + 1):
        for dx, dy in ((i, 0), (-i, 0), (0, i), (0, -i)):
            b.set(x + dx, y + dy, col)
    if r >= 2:
        for dx, dy in ((1, 1), (-1, -1), (1, -1), (-1, 1)):
            b.set(x + dx, y + dy, col)


def bang(b: Buf, x, y, col=FX['yellow'], tall=4):
    """«!» con rebote: (x, y) es la punta de arriba."""
    x, y = int(round(x)), int(round(y))
    b.rect(x, y, 1, tall, col); b.set(x, y + tall + 1, col)
    b.rect(x + 1, y, 1, tall - 1, col)


def question(b: Buf, x, y, col=FX['white']):
    glyph(b, x, y, ['XXX.', '...X', '..X.', '.X..', '....', '.X..'], col)


def sweat(b: Buf, x, y, k, col=FX['sweat']):
    """Gota de sudor que resbala (k 0..1)."""
    if k <= 0 or k >= 1:
        return
    x, yy = int(round(x)), int(round(y + k * 4))
    b.set(x, yy, col); b.rect(x - 1, yy + 1, 2, 2, col); b.set(x - 1, yy + 1, FX['white'])


def zzz(b: Buf, x, y, t, col=FX['ice'], col2=FX['white']):
    """Tres zetas que suben y se alejan; t en fotogramas (ciclo de 24)."""
    for i in range(3):
        k = ((t / 24) + i / 3) % 1
        px, py = x + round(k * 6) + i, y - round(k * 10)
        if k < 0.85:
            if i == 2:
                glyph(b, px, py, ['XXXX', '...X', '..X.', '.X..', 'XXXX'], col2)
            else:
                glyph(b, px, py, ['XXX', '..X', '.X.', 'XXX'], col if i == 0 else col2)


def stars(b: Buf, cx, cy, t, r=7, n=3, col=FX['yellow']):
    """Estrellitas de mareo que giran sobre la cabeza (t en fotogramas)."""
    for i in range(n):
        a = t * 0.45 + i * 2 * math.pi / n
        x, y = cx + math.cos(a) * r, cy + math.sin(a) * r * 0.35
        x, y = round(x), round(y)
        b.set(x, y, FX['white'])
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            b.set(x + dx, y + dy, col)


def dust(b: Buf, x, y, k, side=0, col=FX['dust'], colD=FX['dustD']):
    """Nubecitas de polvo a ras de suelo que se abren y se deshacen (k 0..1). side: −1, 1 o 0 = ambos."""
    if k <= 0 or k >= 1:
        return
    sides = (-1, 1) if side == 0 else (side,)
    for s in sides:
        for i in range(3):
            d = 2 + k * (4 + i * 3)
            r = (1.6 - i * 0.3) * (1 - k * 0.7)
            cx, cy = x + s * d, y - 1 - i * 0.6 - k * 1.5
            if r < 0.5:
                continue
            for yy in range(int(cy - r) - 1, int(cy + r) + 2):
                for xx in range(int(cx - r) - 1, int(cx + r) + 2):
                    if (xx + 0.5 - cx) ** 2 + (yy + 0.5 - cy) ** 2 <= r * r and rnd(xx, yy, 3) > k * 0.6:
                        b.set(xx, yy, col if yy < cy else colD)


def speed_lines(b: Buf, x, y, h, side=-1, ln=5, col=FX['white'], gap=3):
    """Líneas de velocidad horizontales detrás del personaje (side = hacia dónde quedan)."""
    for i, yy in enumerate(range(y, y + h, gap)):
        L = ln - (i % 2) * 2
        for j in range(L):
            b.set(x + side * j, yy, col if j < L - 1 else FX['dust'])


def burst(b: Buf, cx, cy, k, r0=4, r1=10, n=8, col=FX['yellow'], ang0=0.0):
    """Onda de impacto: rayos que salen del centro (k 0..1)."""
    if k <= 0 or k >= 1:
        return
    a_r = lerp(r0, r1, ease_out(k))
    ln = max(1, round(3 * (1 - k)))
    for i in range(n):
        a = ang0 + i * 2 * math.pi / n
        for j in range(ln):
            rr = a_r + j
            b.set(round(cx + math.cos(a) * rr), round(cy + math.sin(a) * rr), col)


def ring(b: Buf, cx, cy, k, r1=9, col=FX['white']):
    """Anillo de choque que se expande (k 0..1)."""
    if k <= 0 or k >= 1:
        return
    r = 1 + (r1 - 1) * ease_out(k)
    n = int(r * 6) + 6
    for i in range(n):
        a = i * 2 * math.pi / n
        if rnd(i, int(k * 10), 9) < 1 - k * 0.8:
            b.set(round(cx + math.cos(a) * r), round(cy + math.sin(a) * r * 0.8), col)


def heart(b: Buf, x, y, col=FX['pink']):
    glyph(b, x, y, ['XX.XX', 'XXXXX', '.XXX.', '..X..'], col)
    b.set(x + 1, y, FX['white'])


def note(b: Buf, x, y, col=FX['white']):
    glyph(b, x, y, ['..XX', '..X.', '..X.', 'XXX.', 'XX..'], col)


def anger(b: Buf, x, y, col=FX['red']):
    """Vena de enojo (cruz de manga)."""
    glyph(b, x, y, ['X.X', '...', 'X.X'], col)
    b.set(x + 1, y - 1, col); b.set(x - 1, y + 1, col); b.set(x + 3, y + 1, col); b.set(x + 1, y + 3, col)


def puff(b: Buf, x, y, k, col=FX['white'], col2=FX['dust']):
    """Bocanada redonda que sube y se deshace (vapor, humo, aire)."""
    if k <= 0 or k >= 1:
        return
    r = 0.8 + 2.2 * ease_out(k)
    cy = y - k * 6
    for yy in range(int(cy - r) - 1, int(cy + r) + 2):
        for xx in range(int(x - r) - 1, int(x + r) + 2):
            d = math.hypot(xx + 0.5 - x, yy + 0.5 - cy)
            if d <= r and rnd(xx, yy, 11) > k * 0.75:
                b.set(xx, yy, col if d < r * 0.6 else col2)


def motion_arc(b: Buf, cx, cy, r, a0, a1, col=FX['white']):
    """Arco de movimiento (estela de un brazo o de una escoba)."""
    n = max(3, int(abs(a1 - a0) * r))
    for i in range(n):
        a = a0 + (a1 - a0) * i / (n - 1)
        if i % 2 == 0 or i > n * 0.6:
            b.set(round(cx + math.cos(a) * r), round(cy + math.sin(a) * r), col)


def float_text(b: Buf, s, x, y, k, col=FX['green'], rise=6):
    """Texto que aparece con rebote y sube (k 0..1). x es el centro."""
    if k <= 0 or k >= 1:
        return
    yy = y - rise * ease_out(k)
    if k < 0.12:
        return
    text(b, s, x - text_w(s) // 2, yy, col)


def shadow(b: Buf, cx, y, w, col='#1A1D1B'):
    """Sombra en el suelo (para saltos y despegues): se encoge con la altura."""
    w = max(2, int(w))
    b.rect(int(cx - w // 2), y, w, 1, col)


# ---------------------------------------------------------------- clips y exportación

@dataclass
class Clip:
    nombre: str
    descripcion: str = ''
    bucle: bool = True
    frames: list = field(default_factory=list)   # [(Buf, ms)]

    def add(self, b: Buf, ms: int = MS):
        self.frames.append((b, ms))
        return self

    def hold(self, ms: int):
        """Alarga el último fotograma (pausa cómica)."""
        b, m = self.frames[-1]
        self.frames[-1] = (b, m + ms)
        return self

    @property
    def duracion(self):
        return sum(m for _, m in self.frames)


def _img(b: Buf) -> Image.Image:
    return b.image()


def exportar(mascota: str, clips: list[Clip], carpeta: str, escala: int = 8, margen: int = 2):
    """Escribe en `carpeta`:
      · <clip>.gif   vista previa a `escala`x sobre el fondo del canal
      · <clip>.png   tira 1x de fotogramas con la misma caja (no se desalinean)
      · clips.json   orden, duración de cada fotograma, caja y ancla de los pies dentro de la caja
    """
    os.makedirs(carpeta, exist_ok=True)
    atlas = {'mascota': mascota, 'fps_base': FPS, 'ancla_lienzo': {'x': OX, 'y': OY}, 'clips': {}}
    for c in clips:
        ims = [_img(b) for b, _ in c.frames]
        W = max(im.width for im in ims)
        H = max(im.height for im in ims)
        boxes = [im.getbbox() for im in ims if im.getbbox()]
        x0 = max(0, min(bx[0] for bx in boxes) - margen)
        y0 = max(0, min(bx[1] for bx in boxes) - margen)
        x1 = min(W, max(bx[2] for bx in boxes) + margen)
        y1 = min(H, max(bx[3] for bx in boxes) + margen)
        cw, ch = x1 - x0, y1 - y0
        celdas = []
        for im in ims:
            full = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            full.paste(im, (0, 0))
            celdas.append(full.crop((x0, y0, x1, y1)))
        tira = Image.new('RGBA', (cw * len(celdas), ch), (0, 0, 0, 0))
        for i, im in enumerate(celdas):
            tira.paste(im, (i * cw, 0))
        tira.save(os.path.join(carpeta, f'{c.nombre}.png'))

        frames = []
        for im in celdas:
            bg = Image.new('RGBA', im.size, FONDO + (255,))
            bg.alpha_composite(im)
            frames.append(bg.convert('RGB').resize((cw * escala, ch * escala), Image.NEAREST))
        durs = [m for _, m in c.frames]
        frames[0].save(os.path.join(carpeta, f'{c.nombre}.gif'), save_all=True, append_images=frames[1:],
                       duration=durs, loop=0, disposal=1, optimize=False)
        atlas['clips'][c.nombre] = {
            'descripcion': c.descripcion, 'bucle': c.bucle,
            'tira': f'{c.nombre}.png', 'gif': f'{c.nombre}.gif',
            'celda': [cw, ch], 'fotogramas': len(celdas), 'ms': durs, 'duracion_ms': sum(durs),
            'ancla_pies_en_celda': {'x': OX - x0, 'y': OY - y0},
        }
    with open(os.path.join(carpeta, 'clips.json'), 'w', encoding='utf-8') as f:
        json.dump(atlas, f, ensure_ascii=False, indent=1)
    return atlas


def hoja_contactos(clips: list[Clip], ruta: str, escala: int = 5, cols: int = 10, solo=None, cada: int = 1):
    """Hoja de contactos para revisar a ojo los fotogramas (no se versiona). Cada clip va recortado
    a su caja común y cada celda lleva su número de fotograma."""
    from PIL import ImageDraw
    filas = []
    for c in clips:
        if solo and c.nombre not in solo:
            continue
        ims = [b.image() for b, _ in c.frames][::cada]
        boxes = [im.getbbox() for im in ims if im.getbbox()]
        box = (min(x[0] for x in boxes) - 1, min(x[1] for x in boxes) - 1, max(x[2] for x in boxes) + 1, max(x[3] for x in boxes) + 1)
        ims = [im.crop(box) for im in ims]
        for i in range(0, len(ims), cols):
            filas.append((c.nombre, i * cada, ims[i:i + cols]))
    cw = max(im.width for _, _, ims in filas for im in ims) * escala
    ch = max(im.height for _, _, ims in filas for im in ims) * escala + 12
    hoja = Image.new('RGB', (cols * (cw + 4), len(filas) * (ch + 4)), (40, 40, 40))
    d = ImageDraw.Draw(hoja)
    for r, (nombre, i0, ims) in enumerate(filas):
        for i, im in enumerate(ims):
            x, y = i * (cw + 4), r * (ch + 4)
            hoja.paste(FONDO, (x, y, x + cw, y + ch))
            big = im.resize((im.width * escala, im.height * escala), Image.NEAREST)
            hoja.paste(big, (x, y + 12), big)
            d.text((x + 2, y), f'{nombre} {i0 + i * cada}', fill=(150, 150, 150))
    hoja.save(ruta)
