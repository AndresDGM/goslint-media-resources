# Goslint · Bienvenida 02 · ¿Qué es la programación competitiva?

Segundo video de la serie de bienvenida de **Goslint** (semillero de investigación de Ingeniería de Sistemas, UCEVA). Lint, la mascota, explica qué es la programación competitiva, cómo son los problemas y los jueces en línea, qué es la ICPC y su camino hasta la final mundial, cómo funciona en Colombia y qué hace Goslint en la UCEVA. Mantiene el sistema visual del video de búsqueda binaria (terminal negro y verde, HUD de concurso, rejilla, grano, veredictos, pixel art y cortes a 120 BPM) y reutiliza su motor (Lint, pixel art, componentes, scripts de audio y QA).

- Resultado: `out/goslint-programacion-competitiva.mp4` · 1920 × 1080 · 30 fps · H.264 + AAC 48 kHz estéreo · 6 min 00 s.
- Narración: ElevenLabs (`eleven_v4`, voz «Andres - Social Media Host», acento colombiano, la misma del video anterior), 10 segmentos.
- Música y efectos: originales, sintetizados por código.

## Capítulos

| Tiempo | Capítulo | Contenido |
|---|---|---|
| 0:00 | Apertura | `./maraton --duracion=5h --equipo=3 --computadores=1`, logotipo, Lint; 5 horas · 3 personas y 1 computador · todo el mundo; las tres preguntas del video |
| 0:32 | 01 · ¿Qué es? | Problema → algoritmo → código; correcta, eficiente y con buen uso de recursos; lógica, creatividad, algoritmos y práctica; para qué sirve aunque no compitas |
| 1:14 | 02 · Los problemas | Tarjeta de juez «Problema A · Suma hasta n» con enunciado, entrada, salida y restricciones; entender → pensar → implementar (C++, Java, Python) |
| 1:42 | 03 · Jueces en línea | Envío → compilación → casos de prueba → veredicto; cuatro envíos reales de Lint: WA, TLE, RTE y AC |
| 2:24 | 04 · La ICPC | Siglas, equipos de tres con un solo computador (Lint, Globín y Marco), foto real del equipo en la Regional 2025, reloj de concurso |
| 3:06 | 05 · El camino | Fase nacional → fase regional → ICPC Latin America Championship → ICPC World Finals |
| 3:44 | 06 · En Colombia | Maratón Nacional ACIS-REDIS con fotos de Goslint en 2024, 2025 y 2026 |
| 4:16 | 07 · En la UCEVA | Goslint, entrenamientos, Maratones de Programación UCEVA (XI 2024 y XII 2026), equipos en la ICPC, Training Camp de Medellín, investigación |
| 5:12 | 08 · ¿Por qué intentarlo? | Lógica, algoritmos, creatividad, equipo; siempre hay un problema nuevo; «¡anímate!»; cierre «¿Te gusta programar? Únete a GOSLINT» |

## El ejemplo del juez es real

La escena del juez usa un problema inventado para el video (*suma 1 + 2 + … + n con 1 ≤ n ≤ 10⁹, límite 1 s*) y cuatro soluciones que están en `soluciones/`. Los veredictos que se ven en pantalla, y el caso en que falla cada una, son los que da ejecutarlas de verdad:

| Archivo | Veredicto | Por qué |
|---|---|---|
| `v1_wa.cpp` | WA (caso 4) | `int` se desborda con n = 100.000 |
| `v2_tle.py` | TLE (caso 5) | un bucle de 10⁹ vueltas en Python supera 1 s |
| `v3_rte.py` | RTE (caso 3) | la recursión supera el límite de Python con n = 1.000 |
| `v4_ac.py` | AC | fórmula n(n + 1)/2 |

Las cuatro pasan el ejemplo del enunciado (3 → 6). `python3 scripts/check_solutions.py` lo comprueba y verifica que el código en pantalla (`src/solutions.ts`) es idéntico al de `soluciones/`.

## Requisitos

- Node 18 o superior y `pnpm` (o `npm`); FFmpeg en el `PATH`.
- Python 3 con `numpy`, `scipy` y `pillow` (música, efectos, fotos y voz).
- Opcional, para reimportar la narración: `sherpa-onnx` y el modelo Parakeet TDT 0.6B v3 (ver más abajo). g++ para `check_solutions.py`.

## Instalar, previsualizar y renderizar

```bash
pnpm install --frozen-lockfile      # o: npm ci
pnpm run studio                     # previsualización en Remotion Studio
pnpm run render                     # render + masterizado -> out/goslint-programacion-competitiva.mp4
pnpm run qa                         # comprobaciones objetivas y hojas de contacto en out/qa
```

- Si Remotion no puede descargar su Chrome Headless Shell: `REMOTION_BROWSER=/ruta/a/chrome-headless-shell pnpm run render`.
- Con GPU: `REMOTION_GL=vulkan REMOTION_CONCURRENCY=6 pnpm run render`.
- Fotogramas sueltos: `bash scripts/stills.sh 600 3950 8650` → `out/stills/`.

## Estructura

```
src/
  Video.tsx  Root.tsx  index.ts          composición «ProgramacionCompetitiva»
  timeline.ts                            línea de tiempo derivada de la narración (escenas en compás, marcas por palabra)
  narration.json                         duraciones, subtítulos, marcas y envolvente de la voz (scripts/import_vo.py)
  solutions.ts                           las cuatro soluciones del juez (generado desde soluciones/)
  scenes/A–D.tsx, parts.tsx              las 10 escenas y sus piezas (tarjetas, reloj, globo, computador en pixel art)
  theme.ts lib.ts components.tsx         sistema Goslint v1 + fotos (Photo, Polaroid, BlurBg, EventTag) y sprites
  pixel.tsx mascot.tsx kit.tsx           motor de pixel art, Lint, HUD, subtítulos y panel de código (del video anterior)
  sfx.ts  AudioLayer.tsx                 hoja de efectos y mezcla
public/
  photos/ (+ blur/)                      fotos preparadas (ver «Fotografías»)
  mascotas/                              Globín y Marco del kit de mascotas (sprites 1x)
  brand/ fonts/ fx/                      logotipos oficiales, Inter y JetBrains Mono, grano
  audio/vo/ (raw/)  audio/sfx/  audio/music.mp3
soluciones/                              el código de los cuatro envíos
subtitulos/                              .srt y .vtt
scripts/                                 guion, voz, ASR, música, efectos, fotos, verificación y QA
```

## Narración (ElevenLabs)

- Guion maestro: `scripts/narration.txt` (etiquetas `[excited]`…, cortes de subtítulo `|` y marcas de sincronía `{marca}`). `python3 scripts/narration.py count` cuenta créditos y `python3 scripts/narration.py tts s05` imprime el texto exacto que se envía, con las grafías fonéticas (ICPC → «i ce pe ce», C++ → «ce más más», UCEVA → «Uceva», ACIS-REDIS → «Acis Redis», años en letras).
- Consumo: 4.899 créditos en las 10 tomas (una toma por segmento) más 60 de la prueba de conexión. Un intento de s04 falló en el servidor sin producir audio (cotizado en 599); si llegara a descontarse, el total sería 5.558. Detalle en `scripts/elevenlabs_ledger.json`.
- Corrección: en s02 la voz decía «creatinidad». Se regeneró solo la frase «Para lograrlo necesitas lógica, creatividad…» (2 tomas, 206 créditos) y se empalmó en silencio con `scripts/splice_vo.py` (la toma original queda en `raw/s02_original.mp3`; las dos tomas de la frase, en `raw/s02_parche_a.mp3` y `_b.mp3`). La duración del segmento no cambia.
- Proceso local: `scripts/asr.py` transcribe cada mp3 con marcas por palabra (sherpa-onnx + Parakeet TDT 0.6B v3, porque los modelos de Whisper no se podían descargar en el entorno de producción) y `scripts/import_vo.py` recorta silencios, comprime, iguala a −17,5 LUFS, alinea el guion con lo reconocido y escribe `src/narration.json`. La transcripción coincide con el guion en todos los segmentos (ver `scripts/asr/comparacion.txt`; el reconocedor escribe «UCEBA» y «C» donde la voz dice «UCEVA» y «ce más más», lo que se comprobó escuchando el tramo ralentizado y midiendo su envolvente).

Para reimportar tras sustituir un mp3 de `public/audio/vo/raw/`:

```bash
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2
tar xjf sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2      # o define PARAKEET_DIR
python3 scripts/asr.py public/audio/vo/raw/*.mp3                 # -> scripts/asr/*.json
python3 scripts/import_vo.py                                     # -> public/audio/vo/*.wav y src/narration.json
node scripts/dump_timeline.mjs && python3 scripts/make_music.py && python3 scripts/make_srt.py
```

## Música, efectos y mezcla

- Música (`scripts/make_music.py`): 120 BPM, la menor, i–VI–III–VII, timbres de 8 bits; la energía cambia por capítulo leyendo `out/timeline.json` (más intensa en el juez, la ICPC y el cierre; calmada en los problemas).
- Efectos (`scripts/make_sfx.py`, mismos del video anterior) colocados en `src/sfx.ts` a partir de las marcas de la voz.
- Mezcla: la música baja bajo la voz; `python3 scripts/simulate_mix.py` mide sin renderizar (voz ≈ 13 dB por encima del fondo). Máster con `scripts/render.sh`.

## Fotografías

Todas son del semillero. Las de `busqueda-binaria/public/Photos` y doce extraídas de la presentación «GOSLINT_UCEVA_presentacion» (pósteres de la XI y XII Maratón, entrenamientos, más fotos de la Maratón Nacional 2026, de la Regional 2025 y de la Maratón interna 2024 y 2026). Cada foto lleva la etiqueta del evento que indica su nombre de archivo o la presentación. Para regenerar las copias preparadas: `python3 scripts/prepare_photos.py CARPETA_DE_ORIGINALES ...`.

## Licencias y créditos

- Logotipos de Goslint y de la UCEVA, fotos y pósteres: del semillero y de la universidad.
- Lint (y los sprites de Globín y Marco del kit de mascotas), animaciones, música y efectos: creados por código para Goslint.
- Narración: ElevenLabs con una voz de su biblioteca; su uso queda sujeto a los términos del plan de la cuenta.
- Fuentes: Inter y JetBrains Mono (SIL Open Font License). Remotion: gratuito para personas, entidades sin ánimo de lucro y empresas de hasta 3 empleados; confirmar la licencia si cambia el contexto de uso.
