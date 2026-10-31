# Goslint · Búsqueda binaria (video educativo)

Video educativo de **Goslint** (semillero de programación competitiva e investigación de Ingeniería de Sistemas, UCEVA) que enseña búsqueda binaria desde cero. Está hecho con **React + Remotion**, sigue el sistema audiovisual **Goslint v1** (terminal negro y verde, HUD de concurso, rejilla, grano, veredictos AC/WA, cortes en compás a 120 BPM) y añade, solo para esta producción, **pixel art**: la mascota Lint, el machete, los números, las partículas y la onomatopeya.

- Resultado: `out/goslint-busqueda-binaria.mp4` · 1920 × 1080 · 30 fps · H.264 (High, yuv420p, BT.709) + AAC 48 kHz estéreo · 8 min 58 s.
- Narración: ElevenLabs (`eleven_v4`, voz «Andres - Social Media Host», acento colombiano), 15 segmentos.
- Música y efectos: originales, sintetizados por código (sin muestras).

## Capítulos

| Tiempo | Capítulo | Contenido |
|---|---|---|
| 0:00 | Apertura | Terminal, logotipo real de Goslint, entrada de Lint y el reto: encontrar un número en una colección enorme |
| 0:18 | 01 · Búsqueda lineal | Lint revisa uno por uno (ejecución real de `linearSearch`); barras a escala real para 10, 1.000 y 1.000.000 |
| 0:38 | 02 · La idea | Mirar solo el centro: igual, menor (izquierda) o mayor (derecha) |
| 1:00 | 03 · Dividir y machetear | `low`, `mid`, `high`; «divide y vencerás» → «dividir y machetear»; dos machetazos y hallazgo en `[2, 5, 8, 12, 16, 23, 38]` |
| 1:54 | 04 · Datos ordenados | El mismo algoritmo sobre una fila desordenada descarta la respuesta; la fila se ordena; cuándo compensa ordenar |
| 2:36 | 05 · Paso a paso | `[3, 7, …, 63]`: buscar 43 (4 comparaciones) y 42 (intervalo vacío, −1) |
| 3:52 | 06 · Complejidad | Qué es `n`, O(n) frente a O(log n), carrera real con 16, 32, 64, 128 y 1.024 elementos, casos mejor/promedio/peor |
| 5:16 | 07 · Java iterativo | Código completo con resaltado de líneas sincronizado con la ejecución sobre el arreglo |
| 6:08 | 08 · Java recursivo | Casos base, pila de llamadas real, comparación de espacio O(1) / O(log n) |
| 7:22 | 09 · En la práctica | Identificación, diccionario, puntajes, búsqueda de límites y condiciones de uso |
| 8:04 | 10 · Repaso | Seis ideas, último reto (1.000.000 → 20 comparaciones), remate del machete y logotipo final |

## Requisitos

- Node 18 o superior y `pnpm` (o `npm`).
- FFmpeg en el `PATH` (masterizado, QA, música).
- Python 3 con `numpy` y `scipy` (solo para regenerar música y efectos o reimportar la voz).
- Opcional: `openai-whisper` (reimportar la narración y comprobar la inteligibilidad) y un JDK (comprobar el Java).

## Instalar, previsualizar y renderizar

```bash
pnpm install --frozen-lockfile      # o: npm ci
pnpm run studio                     # previsualización en Remotion Studio
pnpm run render                     # render completo + masterizado -> out/goslint-busqueda-binaria.mp4
```

`pnpm run render` ejecuta `scripts/render.sh`: `remotion render BusquedaBinaria out/render-raw.mp4` y después el masterizado con FFmpeg (ganancia + limitador, video copiado sin recodificar).

- Por defecto se renderiza en CPU (`swangle`), que funciona en cualquier equipo. Con una GPU con Vulkan: `REMOTION_GL=vulkan REMOTION_CONCURRENCY=6 pnpm run render` (en el equipo donde se produjo, i5-12600KF + RX 6600, el render completo tarda unos 4 minutos).
- Si Remotion no puede descargar su Chrome Headless Shell: `REMOTION_BROWSER=/ruta/a/chromium pnpm run render`.
- Un fotograma suelto: `pnpm exec remotion still BusquedaBinaria out/still.png --frame=2597`.
- Hoja de modelo de la mascota: `pnpm exec remotion still HojaDeModelo out/hoja.png`.

## Estructura

```
src/
  index.ts  Root.tsx  Video.tsx        composición «BusquedaBinaria» (y «HojaDeModelo»)
  theme.ts  lib.ts  components.tsx     sistema Goslint v1: colores, rejilla, grano, logotipo, transiciones, luces
  pixel.tsx                            motor de pixel art: lienzo, fuente 5×7, iluminación de contorno, partículas
  mascot.tsx                           Lint: dibujo por código, poses, caminar, machetazo (anticipación → impacto → recuperación)
  arrayviz.tsx                         celdas, índices, low/mid/high y el escenario de búsqueda con machete
  kit.tsx                              actor, subtítulos, HUD, panel de código con resaltado, notas
  algo/search.ts                       ALGORITMOS REALES que alimentan todas las animaciones y contadores
  timeline.ts  beats.ts  sfx.ts        línea de tiempo derivada de la narración, momentos clave y hoja de efectos
  narration.json                       duraciones, subtítulos, marcas de sincronía y envolvente de la voz
  AudioLayer.tsx                       mezcla: música (con ducking), voz y efectos
  scenes/A–E.tsx                       las 11 escenas
public/
  brand/      logotipo oficial (extraído del póster) y logo de la UCEVA
  audio/vo/   narración final (wav) y raw/ (los mp3 tal como los entregó ElevenLabs)
  audio/sfx/  efectos sintetizados · audio/music.mp3 música original
  fonts/      Inter y JetBrains Mono · fx/ grano
java/BusquedaBinaria.java              el Java del video, compilable y con pruebas
subtitulos/                            subtítulos .srt y .vtt
scripts/                               guion, importación de voz, música, efectos, verificación y QA
```

## Cómo se garantiza la corrección

- **Una sola fuente de verdad algorítmica.** `src/algo/search.ts` implementa búsqueda lineal, binaria iterativa (con traza de `low`, `mid`, `high` y la mitad descartada), binaria recursiva (con su pila de llamadas), una variante genérica y `lowerBound`. Las escenas no contienen cifras escritas a mano: los cortes del machete, los indicadores, los contadores de la carrera, la pila de llamadas y las «20 comparaciones» salen de ejecutar ese código.
- **Convención de conteo:** una comparación = un elemento examinado contra el objetivo. En la carrera, ambos algoritmos reciben la misma colección ordenada (3, 7, 11, …) y el mismo objetivo, el valor de la posición ⌊0,75·n⌋. Resultados reales: lineal 13, 25, 49, 97, 769; binaria 4, 5, 6, 7, 10.
- **El machete es una metáfora y respeta el algoritmo:** primero se identifica `mid`; si el objetivo es mayor se descarta la mitad izquierda (incluido `mid`) y si es menor, la derecha; el corte cae en el borde de la región descartada, la mascota queda sobre la mitad que se conserva y las celdas descartadas siguen visibles, atenuadas y tachadas. Si `mid` es el objetivo no hay machetazo: celebra.

```bash
pnpm run test:algo                 # node --experimental-strip-types scripts/verify_algorithms.ts
python3 scripts/check_java.py      # compila y prueba java/BusquedaBinaria.java y verifica que es el código en pantalla
pnpm run typecheck
```

## Narración (ElevenLabs)

- Guion maestro: `scripts/narration.txt` (etiquetas de dirección vocal `[excited]`, `[curious]`, `[mischievously]`…, cortes de subtítulo `|` y marcas de sincronía `{marca}`). `python3 scripts/narration.py count` cuenta los caracteres; `python3 scripts/narration.py tts s05` imprime el texto exacto enviado.
- Métrica real del consumo, comprobada con una cotización previa (`estimate_only`): **1 crédito por carácter enviado, etiquetas y espacios incluidos**.
- Consumo: **6.330 créditos** en las 15 tomas usadas, de un presupuesto de 10.000. La muestra de voz (segmento s04) se aprobó y se reutilizó como toma final. Seis intentos fallaron en el servidor de ElevenLabs sin producir audio (cotizados en 2.586 créditos); si llegaran a descontarse, el máximo posible sería 8.916. Detalle en `scripts/elevenlabs_ledger.json`.
- La versión del conector usada solo expone modelo, voz e idioma: no permite ajustar estabilidad ni estilo. La expresividad se dirigió con etiquetas de audio, puntuación y elección de voz.
- Proceso local (`scripts/import_vo.py`): recorte de silencios, compresor suave, mismo nivel para todos los segmentos (−17,5 LUFS) y limitador a −1,5 dBFS; alineación palabra a palabra con Whisper para obtener subtítulos y marcas.

Para reimportar (por ejemplo, tras sustituir un mp3 de `public/audio/vo/raw/`):

```bash
whisper public/audio/vo/raw/*.mp3 --model small --language es --word_timestamps True --output_format json --output_dir scripts/asr
python3 scripts/import_vo.py            # -> public/audio/vo/*.wav y src/narration.json
node scripts/dump_timeline.mjs          # -> out/timeline.json
python3 scripts/make_music.py           # la música se adapta a la nueva duración
python3 scripts/make_srt.py             # -> subtitulos/
```

## Música, efectos y mezcla

```bash
python3 scripts/make_sfx.py             # public/audio/sfx/*.wav
node scripts/dump_timeline.mjs && python3 scripts/make_music.py
python3 scripts/simulate_mix.py         # mide la mezcla sin renderizar
```

- Música: 120 BPM, la menor, progresión i–VI–III–VII (convención v1) con timbres de 8 bits; la energía cambia por capítulo leyendo la línea de tiempo real.
- Mezcla (`src/AudioLayer.tsx`): la música baja a 0,07 bajo la voz; la voz queda unos 12 dB por encima del fondo. Máster: −15 LUFS, pico ≤ −1 dBFS.

## QA

```bash
pnpm run qa                             # scripts/qa.sh out/goslint-busqueda-binaria.mp4 out/qa
```

Comprueba formato, decodificación completa, negros, congelados, sonoridad, recortes y silencios, y genera hojas de contacto en `out/qa/`.

## Licencias y créditos

- Logotipo y nombre de Goslint, logo de la UCEVA: del semillero y de la universidad. El logotipo se usa tal como se extrajo del póster oficial (sin redibujar ni pixelar).
- Mascota Lint, animaciones, música y efectos: creados para este proyecto por código; uso libre para Goslint.
- Narración: generada con ElevenLabs con una voz de su biblioteca; su uso queda sujeto a los términos del plan de la cuenta con la que se generó (conviene confirmarlos antes de publicar).
- Fuentes: Inter y JetBrains Mono (SIL Open Font License).
- Remotion: gratuito para personas, entidades sin ánimo de lucro y empresas de hasta 3 empleados; confirmar la licencia si cambia el contexto de uso.
