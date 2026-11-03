"""Exporta las animaciones de las mascotas (todas menos Lint, que vive en TypeScript).

Cada mascota tiene su archivo `<nombre>_anim.py` con una función `clips()` que devuelve la lista de
animaciones (reposo en bucle, movimiento especial y gags). Este script las guarda en
`salida/<nombre>/clips/`: GIF de vista previa, tira 1x y `clips.json`.

Uso (desde mascotas/kit/):
    python3 mascotas/animar_mascotas.py                 # todas
    python3 mascotas/animar_mascotas.py globin ringo    # solo esas
    python3 mascotas/animar_mascotas.py --contactos /ruta/carpeta   # además, hojas de contactos para revisar
"""
from __future__ import annotations
import importlib, os, sys, time

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _aqui)
sys.path.insert(0, os.path.join(os.path.dirname(_aqui), 'motor'))
import animar  # noqa: E402

MASCOTAS = ['byte', 'daru', 'diego', 'globin', 'mocca', 'parserint', 'polo', 'pypo', 'ringo', 'velasco']


def main(argv):
    contactos = None
    if '--contactos' in argv:
        i = argv.index('--contactos')
        contactos = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    nombres = argv or MASCOTAS
    raiz = os.path.dirname(_aqui)
    for n in nombres:
        t0 = time.time()
        mod = importlib.import_module(f'{n}_anim')
        clips = mod.clips()
        atlas = animar.exportar(n, clips, os.path.join(raiz, 'salida', n, 'clips'))
        if contactos:
            os.makedirs(contactos, exist_ok=True)
            for c in clips:
                animar.hoja_contactos([c], os.path.join(contactos, f'{n}_{c.nombre}.png'), cada=2 if len(c.frames) > 40 else 1)
        resumen = ', '.join(f"{k} {v['fotogramas']} f / {v['duracion_ms'] / 1000:.1f} s" for k, v in atlas['clips'].items())
        print(f'{n:10s} {resumen}  ({time.time() - t0:.1f} s)')


if __name__ == '__main__':
    main(sys.argv[1:])
