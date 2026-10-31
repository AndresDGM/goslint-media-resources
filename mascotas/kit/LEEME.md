# Kit de mascotas de Goslint

Sirve para crear una mascota nueva, del mismo universo que Lint, Vee y Marco, y su hoja de concepto.

## Contenido

| Ruta | Qué es |
|---|---|
| `PROMPT.md` | El prompt para pegar en una conversación nueva (rellena los campos `[…]`) |
| `GUIA-MASCOTAS.md` | Reglas de estilo, escala, proporciones y correcciones frecuentes |
| `motor/pixel.py` | Motor de pixel art: lienzo, rectángulos, elipses, líneas, brazos, ruido, luz de contorno |
| `motor/plantilla_mascota.py` | Mascota de ejemplo que ya funciona. Se copia y se modifica |
| `hoja/hacer_hoja.py` | Genera la hoja de concepto a partir de un JSON y los sprites |
| `hoja/ejemplo_config.json` | Todos los campos de texto de la hoja |
| `hoja/fuentes/`, `hoja/marca/` | Fuentes (Silkscreen, JetBrains Mono) y wordmark de Goslint |
| `referencias/hojas/` | Hojas aprobadas de Lint, Vee y Marco |
| `referencias/codigo/` | Código de Lint (TypeScript), Vee y Marco (Python) |
| `referencias/sprites/` | Lint, Vee y Marco a 1x, para el recuadro de escala |

## Flujo

Requisitos: Python 3 con Pillow y Playwright (Chromium).

```bash
pip install pillow playwright && python3 -m playwright install chromium
```

1. Copia la plantilla:
   ```bash
   cp motor/plantilla_mascota.py mascotas/<nombre>.py
   ```
   Cambia la paleta y las secciones marcadas con `✎ CAMBIAR`.
2. Exporta los sprites:
   ```bash
   python3 mascotas/<nombre>.py salida/<nombre>
   ```
3. Copia `hoja/ejemplo_config.json`, rellena los textos y genera la hoja:
   ```bash
   python3 hoja/hacer_hoja.py config.json salida/<nombre> <nombre>_concepto.png
   ```
4. Revisa la hoja, corrige y repite.

Los archivos de `mascotas/` importan el motor con `sys.path`. Si los mueves, ajusta la ruta, o ejecútalos con `PYTHONPATH=motor`.
