"""Motor de pixel art de las mascotas de Goslint (Python, solo necesita Pillow).

Es el mismo sistema con el que se dibujaron Lint, Vee y Marco: un lienzo lógico pequeño donde el
personaje se dibuja por código a partir de una pose. Así todas las poses mantienen la silueta,
la paleta y las proporciones, y las animaciones son deterministas.

Convenciones del lienzo (no cambiarlas, para que todas las mascotas midan lo mismo):
  · lienzo de SW × SH = 72 × 64 píxeles lógicos
  · OX = 36 es el centro horizontal; OY = 50 es la línea de los pies
  · el personaje mide unos 33 px de alto (Lint 21×33, Vee 19×33)
"""
from __future__ import annotations
import math
from PIL import Image

SW, SH, OX, OY = 72, 64, 36, 50


class Buf:
    """Lienzo de píxeles: cada celda es un color '#RRGGBB' o None (transparente)."""

    def __init__(self, w: int = SW, h: int = SH):
        self.w, self.h = w, h
        self.px: list[list[str | None]] = [[None] * w for _ in range(h)]

    def set(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[y][x] = c

    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.px[y][x]
        return None

    def rect(self, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.set(xx, yy, c)

    def ellipse(self, cx, cy, rx, ry, c):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1:
                    self.set(x, y, c)

    def line(self, x0, y0, x1, y1, c, th=2):
        """Línea muestreada con pincel de th×th. `c` puede ser un color o una función t→color."""
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
        for i in range(n + 1):
            t = i / n
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            col = c(t) if callable(c) else c
            for dy in range(th):
                for dx in range(th):
                    self.set(math.floor(x + dx - th / 2 + 0.5), math.floor(y + dy - th / 2 + 0.5), col)

    def fill_holes(self, color):
        """Rellena los huecos interiores (píxeles vacíos rodeados por el personaje)."""
        ext = [[False] * self.w for _ in range(self.h)]
        stack = [(x, y) for x in range(self.w) for y in (0, self.h - 1)] + [(x, y) for y in range(self.h) for x in (0, self.w - 1)]
        while stack:
            x, y = stack.pop()
            if 0 <= x < self.w and 0 <= y < self.h and not ext[y][x] and self.px[y][x] is None:
                ext[y][x] = True
                stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
        for y in range(self.h):
            for x in range(self.w):
                if self.px[y][x] is None and not ext[y][x]:
                    self.px[y][x] = color

    def rim_light(self, color, side=(1, -1)):
        """Luz de contorno: tiñe los píxeles del borde que miran hacia `side` (dx, dy).
        Es lo que separa al personaje del fondo negro ahora que NO se usa contorno blanco."""
        sx, sy = side
        hits = []
        for y in range(self.h):
            for x in range(self.w):
                if self.px[y][x] and (self.get(x + sx, y) is None or self.get(x, y + sy) is None):
                    hits.append((x, y))
        for x, y in hits:
            self.px[y][x] = color

    def image(self, scale: int = 1) -> Image.Image:
        im = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))
        for y in range(self.h):
            for x in range(self.w):
                c = self.px[y][x]
                if c:
                    im.putpixel((x, y), tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
        return im if scale == 1 else im.resize((self.w * scale, self.h * scale), Image.NEAREST)

    def sprite(self) -> Image.Image:
        """Imagen 1x recortada a la silueta (para la hoja de concepto)."""
        im = self.image()
        return im.crop(im.getbbox())


def dirv(a, side):
    """Dirección de un ángulo de brazo. 0 = colgando, 90 = hacia afuera, 180 = arriba, negativo = hacia adentro."""
    r = math.radians(a)
    return math.sin(r) * side, math.cos(r)


def arm(b: Buf, sh, up, lo, side, upper_color, lower_color, hand_color):
    """Brazo de dos tramos (hombro→codo→mano) con pincel de 2 px.
    Si el brazo cuelga (los dos ángulos cerca de 0) se dibuja más corto, para que la mano llegue a la cadera."""
    hanging = math.cos(math.radians(up)) > 0.8 and math.cos(math.radians(lo)) > 0.8
    L1, L2 = (3, 2.5) if hanging else (4, 4)
    ex, ey = dirv(up, side)
    el = (sh[0] + ex * L1, sh[1] + ey * L1)
    ux, uy = dirv(lo, side)
    hd = (el[0] + ux * L2, el[1] + uy * L2)
    b.line(sh[0], sh[1], el[0], el[1], lambda t: upper_color if t < 0.6 else lower_color)
    b.line(el[0], el[1], hd[0], hd[1], lower_color)
    b.rect(round(hd[0] - 1), round(hd[1] - 1), 2, 2, hand_color)
    return hd


# ---------------------------------------------------------------- ruido determinista (humo, fuego, agua…)

def _h(x, y, s=0):
    v = math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453
    return v - math.floor(v)


def noise(x, y, s=0):
    xi, yi = math.floor(x), math.floor(y)
    xf, yf = x - xi, y - yi
    u, v = xf * xf * (3 - 2 * xf), yf * yf * (3 - 2 * yf)
    a, b = _h(xi, yi, s), _h(xi + 1, yi, s)
    c, d = _h(xi, yi + 1, s), _h(xi + 1, yi + 1, s)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v


def fbm(x, y, s=0):
    """Ruido fractal 0..1. Mueve el patrón sumando el tiempo a x o y para animar."""
    return 0.6 * noise(x, y, s) + 0.3 * noise(x * 2.1, y * 2.1, s + 3) + 0.1 * noise(x * 4.3, y * 4.3, s + 7)


def rnd(x, y, s=0):
    return _h(x, y, s)
