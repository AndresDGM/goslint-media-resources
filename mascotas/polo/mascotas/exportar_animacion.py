"""Exporta todo lo que necesitas de Polo para animarlo.

Uso (desde la carpeta raíz del paquete):
    python3 mascotas/exportar_animacion.py            # escribe en sprites/

Genera, para cada pose, fotograma de reposo y fotograma del movimiento especial:
  · sprites/lienzo_72x64/   PNG transparente 72×64, TODOS con el mismo lienzo y los pies en y = 50
                            (se pueden apilar tal cual en un editor/timeline: no se desalinean)
  · sprites/x12/            los mismos, ampliados 12× sin suavizar (864×768) listos para video
  · sprites/tiras/          tiras horizontales (poses, reposo, especial) con fotogramas de 72×64
  · sprites/gif/            vista previa en GIF del reposo y del movimiento especial
  · sprites/atlas.json      lista de fotogramas, orden, tiempos sugeridos y ancla de los pies
"""
from __future__ import annotations
import json, os, sys

_aqui = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _aqui)
from polo import POSES, IDLE, ESPECIAL, draw, PAL, EXTRA  # noqa: E402
from pixel import OX, OY, SW, SH  # noqa: E402
from PIL import Image  # noqa: E402

RAIZ = os.path.dirname(_aqui)
SALIDA = os.path.join(RAIZ, 'sprites')
ESCALA = 12
FONDO = (7, 8, 7)


def guardar(im: Image.Image, carpeta: str, nombre: str):
    os.makedirs(os.path.join(SALIDA, 'lienzo_72x64', carpeta), exist_ok=True)
    os.makedirs(os.path.join(SALIDA, f'x{ESCALA}', carpeta), exist_ok=True)
    im.save(os.path.join(SALIDA, 'lienzo_72x64', carpeta, nombre))
    im.resize((im.width * ESCALA, im.height * ESCALA), Image.NEAREST).save(os.path.join(SALIDA, f'x{ESCALA}', carpeta, nombre))


def tira(imgs, ruta):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    t = Image.new('RGBA', (SW * len(imgs), SH), (0, 0, 0, 0))
    for i, im in enumerate(imgs):
        t.paste(im, (i * SW, 0))
    t.save(ruta)


def gif(imgs, ruta, ms, escala=8, pausa_final=0):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    frames = []
    for im in imgs:
        bg = Image.new('RGBA', im.size, FONDO + (255,))
        bg.alpha_composite(im)
        frames.append(bg.convert('RGB').resize((im.width * escala, im.height * escala), Image.NEAREST))
    durs = [ms] * len(frames)
    if pausa_final:
        durs[-1] += pausa_final
    frames[0].save(ruta, save_all=True, append_images=frames[1:], duration=durs, loop=0, disposal=2)


def main():
    atlas = {
        'nombre': 'Polo',
        'lienzo': [SW, SH],
        'ancla_pies': {'x': OX, 'y': OY, 'nota': 'los pies tocan la fila y = 49 (línea de base en y = 50); centro horizontal x = 36'},
        'escala_recomendada_video': ESCALA,
        'paleta': PAL,
        'colores_extra_efectos': EXTRA,
        'poses': [], 'reposo': [], 'especial': [],
    }

    pose_imgs = []
    for n, p in POSES.items():
        im = draw(p).image()
        guardar(im, 'poses', f'{n}.png')
        pose_imgs.append(im)
        atlas['poses'].append({'nombre': n, 'archivo': f'lienzo_72x64/poses/{n}.png', 'bbox': list(im.getbbox())})

    idle_imgs = []
    for i, p in enumerate(IDLE):
        im = draw(p).image()
        guardar(im, 'reposo', f'reposo_{i}.png')
        idle_imgs.append(im)
        atlas['reposo'].append({'fotograma': i, 'archivo': f'lienzo_72x64/reposo/reposo_{i}.png', 'ms_sugeridos': 250,
                                'que_cambia': ['reposo, cola a la izquierda', 'inhala: cuerpo y cabeza suben 1 px', 'cola a la derecha y parpadeo lento', 'exhala: cuerpo baja 1 px'][i]})
    esp_imgs = []
    for i, p in enumerate(ESPECIAL):
        im = draw(p).image()
        guardar(im, 'especial', f'especial_{i}.png')
        esp_imgs.append(im)
        atlas['especial'].append({'fotograma': i, 'archivo': f'lienzo_72x64/especial/especial_{i}.png', 'ms_sugeridos': 400,
                                  'que_pasa': ['toma aire (mejillas infladas, ∞ rojo)', 'sopla (nube gélida, ∞ medio congelado)', 'el ∞ queda congelado'][i]})

    tira(pose_imgs, os.path.join(SALIDA, 'tiras', 'poses.png'))
    tira(idle_imgs, os.path.join(SALIDA, 'tiras', 'reposo.png'))
    tira(esp_imgs, os.path.join(SALIDA, 'tiras', 'especial.png'))
    gif(idle_imgs, os.path.join(SALIDA, 'gif', 'reposo.gif'), 250)
    gif(esp_imgs, os.path.join(SALIDA, 'gif', 'especial.gif'), 400, pausa_final=600)

    with open(os.path.join(SALIDA, 'atlas.json'), 'w', encoding='utf-8') as f:
        json.dump(atlas, f, ensure_ascii=False, indent=2)
    print('listo →', SALIDA)


if __name__ == '__main__':
    main()
