# Goslint · recursos multimedia

Recursos gráficos y audiovisuales de **Goslint** (Semillero de Investigación · UCEVA).

| Carpeta | Contenido |
|---|---|
| [`mascotas/kit/`](mascotas/kit/) | Kit de mascotas: motor de pixel art, generador de hojas de concepto, guía de estilo, referencias (Lint, Vee, Marco) y mascotas DaRu, Diego y Velasco con sus sprites |
| [`mascotas/polo/`](mascotas/polo/) | Kit de Polo (Fase 2): código, sprites (1x, x12, tiras, GIF, atlas) y hoja de concepto |
| [`mascotas/hojas-concepto/`](mascotas/hojas-concepto/) | Hojas de concepto: Vee, Ringo, DaRu, Polo, Globín, Pypo, Mocca y ParserInt |
| [`busqueda-binaria/`](busqueda-binaria/) | Vídeo educativo de búsqueda binaria (React + Remotion), con su código Java y subtítulos |
| [`promo/`](promo/) | Vídeo promocional y reels de Instagram (React + Remotion) |

Cada carpeta tiene su propio README con los pasos para generar o renderizar.

## Lo que no está en el repositorio

- `node_modules/` y entornos de Python: se reinstalan con `npm install` / `pip install`.
- Modelos de voz Kokoro (`kokoro-v1.0.onnx`, `voices-v1.0.bin`) del promo: hay que descargarlos aparte.
- Vídeos renderizados (`out/`, `*.mp4`): el de búsqueda binaria pesa más de 500 MB. Se publican como *Release*.
