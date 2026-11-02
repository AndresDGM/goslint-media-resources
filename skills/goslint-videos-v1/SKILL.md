---
name: "goslint-videos-v1"
description: "Crear vídeos promocionales o de eventos de Goslint (semillero UCEVA) con React y Remotion en el estilo aprobado: terminal negro y verde, fotos reales, locución, música sintetizada y QA."
---

# Goslint videos v1

Sistema para producir vídeos de **Goslint** (semillero de programación competitiva e investigación de Ingeniería de Sistemas, UCEVA, Tuluá, Colombia) con el estilo aprobado en el promocional de octubre de 2026: estética de terminal y juez en línea, negro, blanco y verde, fotos reales tratadas con movimiento, locución en español, música original sintetizada y sincronizada al tempo, y QA objetivo antes de entregar.

El vídeo **siempre** se construye con React + Remotion y se renderiza a un MP4 real. Nunca se entrega solo código, guion o storyboard.

Si el usuario adjunta `goslint-promo-source.zip` (el proyecto v1), parte de él: copia el proyecto, reutiliza `components.tsx`, `lib.ts`, `theme.ts`, scripts de audio y QA, y reescribe solo `timeline.ts`, las escenas y la hoja de efectos. Si no está, reconstruye a partir de esta skill.

## 0. Preguntas obligatorias antes de empezar

Antes de escribir guion, generar audio o tocar código, pregunta con `AskUserQuestion` (en una sola llamada) lo que el usuario **no haya dicho ya** en su mensaje:

1. **Narración** — siempre, salvo que el mensaje ya lo aclare:
   - «La suministramos en **un solo archivo**» (toda la locución).
   - «La suministramos en **varios archivos, uno por escena**».
   - «**Genérala tú con Kokoro**» (voz sintética local, `em_alex`).
   - (Otra: sin narración, solo música y subtítulos/rótulos).
2. **Relación de aspecto** — si no la dieron: 16:9 (YouTube, pantallas), 9:16 (Reels, TikTok, historias), 1:1 (feed), 4:5 (feed de Instagram).
3. **Resolución** — si no la dieron, con opciones coherentes con el aspecto elegido o probable: 16:9 → 1920×1080 o 3840×2160; 9:16 → 1080×1920; 1:1 → 1080×1080; 4:5 → 1080×1350. Avisa de que el tiempo de render crece con los píxeles (4K ≈ 4 veces 1080p, unas 4 h para 70 s en este entorno).

Si el usuario elige suministrar la narración y aún no adjuntó los archivos, pídeselos y espera (sin ellos no se puede fijar la duración de las escenas). Mientras tanto se puede adelantar la extracción del logo y la preparación de fotos.

Si la sesión es desatendida o nadie responde: Kokoro, 16:9, 1920×1080, 30 fps, y decláralo al principio de la entrega.

Estas son las únicas preguntas de partida; el resto (concepto, guion, ritmo, música, transiciones) lo decide Claude. Más adelante solo se pregunta por datos que falten de verdad (p. ej. cuenta de Instagram o fecha de una convocatoria).

## 1. Principios no negociables

1. **Verdad ante todo.** No inventar logros, puestos, estadísticas, fechas, nombres ni cifras. Todo texto en pantalla sale de los materiales (póster, nombres de archivo, lo visible en las fotos) o de lo que el usuario diga. Si una foto no se puede atribuir a un evento, no se usa o se usa sin etiqueta de evento.
2. **Logo exacto.** El logo se extrae del vector del póster o del sticker oficial; nunca se redibuja ni se aproxima.
3. **Decisiones creativas propias** (tras las preguntas del §0).
4. **Español colombiano neutro** para la audiencia de la UCEVA (computador, no ordenador; tú, no vos). Ortografía y tildes correctas en subtítulos y rótulos.
5. **No declarar nada que no se haya hecho**: renderizado, revisado, escuchado (la revisión de audio se hace con medidas y reconocimiento de voz, y así se dice).
6. **La narración suministrada manda**: si el usuario entrega su locución, no se reescribe ni se resintetiza; el montaje se adapta a ella.

## 2. Identidad visual

### Tokens (`src/theme.ts`)

```ts
export const C = {
  bg: '#070807', panel: '#0E110F', panel2: '#141815',
  line: 'rgba(255,255,255,0.10)', line2: 'rgba(255,255,255,0.18)',
  white: '#FFFFFF', text: '#E9EEEA', dim: 'rgba(233,238,234,0.58)', faint: 'rgba(233,238,234,0.32)',
  green: '#00C063',            // verde del logo (muestreado del póster: rgb(3,190,99))
  red: '#FF4D5E', amber: '#FFB547', blue: '#5AA9FF',
};
export const SANS = "'Inter Var', 'Inter', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
export const FPS = 30;
export const W = 1920, H = 1080;   // tomar del §0; todo lo demás se escala con U
export const U = Math.min(W, H) / 1080;  // unidad de escala: diseñar en px de 1080 y multiplicar por U
export const BEAT = 15, BAR = 60;  // 120 BPM a 30 fps
```

Veredictos (chips monoespaciados, peso 800, radio pequeño): **AC** verde `#00C063` sobre `#001a0c`, **WA** `#FF4D5E`, **TLE** `#FFB547`, **RTE** `#B26BFF`.

### Tipografía (tamaños para el lado corto = 1080 px; multiplicar por `U`)
- Titulares: Inter Var 800–850, tracking −0.035 a −0.045 em, 88–110 px. Palabra clave en verde.
- Rótulos y etiquetas: JetBrains Mono en mayúsculas, tracking 0.12–0.16 em, 20–26 px, prefijo `// 01 · Capítulo`.
- Código: JetBrains Mono 21 px, palabras clave en verde, comentarios en `faint`.
- Subtítulos: Inter 500, 34 px, blanco sobre `rgba(0,0,0,0.62)`, máx. 1400 px de ancho (en vertical, 90 % del ancho).
- Fuentes locales: copiar `inter-latin-wght-normal.woff2` de `@fontsource-variable/inter` y `jetbrains-mono-latin-{400,500,700,800}-normal.woff2` de `@fontsource/jetbrains-mono` a `public/fonts/`, y cargarlas con `FontFace` + `delayRender` en `Root.tsx` (Google Fonts puede estar bloqueado).

### Motivos visuales del sistema
- Fondo negro con **cuadrícula** de 80–90 px que deriva lentamente, enmascarada con un degradado radial.
- **Grano** (6 PNG con alfa, 960×540, alternando cada 3 fotogramas, opacidad 0,08), **scanlines** a 0,035 y **viñeta** a 0,55, siempre encima.
- **HUD** de concurso: `● goslint@uceva` a la izquierda y `T− 04:38:26` a la derecha (el reloj de la apertura sigue corriendo).
- **Prompt de terminal** `goslint@uceva:~$` con cursor verde que parpadea cada 15 fotogramas.
- **Tarjeta de problema** estilo juez: cabecera negra «Problema A · Título», límites de tiempo y memoria en mono, «Enunciado», chips de lenguajes.
- **Etiqueta de evento** (`EventTag`): chip negro con cuadradito verde y título mecanografiado en mayúsculas, subtítulo mono sobre fondo oscuro.
- **Glitch** (barras verdes, blancas y negras desplazadas, 3–6 fotogramas), **wipe** diagonal verde con filo blanco y **onda de choque** circular verde en los momentos del logo.

### Logo
Archivos (en `public/brand/`): `mark_white.png`, `mark_green.png` (la «L» verde), `mark_full.png`, `word_white.png`, `logo_sticker.jpeg`, `uceva.png`. Proporciones: marca 1553/1796 (ancho/alto) y wordmark 3346/477.

Extracción desde `Poster_Goslint_v2_A3.pdf` (coordenadas válidas para ese póster a 600 dpi; si cambia, renderizar la página a baja resolución y localizar el recuadro):

```bash
pdftoppm -r 600 -png -x 416 -y 833 -W 1749 -H 1958 Poster_Goslint_v2_A3.pdf mark   # marca
pdftoppm -r 600 -png -x 2291 -y 958 -W 3499 -H 599 Poster_Goslint_v2_A3.pdf word  # GOSLINT
pdftoppm -r 600 -png -x 458 -y 300 -W 1250 -H 520 Poster_Goslint_v2_A3.pdf uceva  # logo UCEVA
```

```python
a = np.asarray(Image.open('mark-1.png').convert('RGB')).astype(np.float32)
alpha = np.clip((255 - a.min(2) - 45) / 155, 0, 1)      # tinta negra -> opaco
green = (a[..., 1] - a[..., 0]) > 50                     # la L verde
# mark_white: RGB blanco, alfa = alpha * ~green ; mark_green: RGB (0,192,99), alfa = alpha * green
# recortar al bbox de alpha>0.05 con 20 px de margen
```

Para 4K, extraer a 1200 dpi (duplicar las coordenadas) para que el logo no se vea blando.

Revelado del logo (`LogoMark`, prop `p` de 0 a 1): la capa blanca se descubre con `mask-image: conic-gradient(from 210deg, #000 {p*360}deg, transparent ...)` y la L verde con `clip-path: inset(0 0 {(1-p)*100}% 0)`, más un `drop-shadow` verde pulsante al terminar. El wordmark entra con `clip-path` de izquierda a derecha y un glitch horizontal de 8 fotogramas.

### Adaptación por relación de aspecto
- **16:9**: composición de referencia (texto a la izquierda, imagen o diagrama a la derecha; tres paneles de código en fila).
- **9:16**: apilar en vertical (titular arriba, imagen o diagrama abajo); paneles de código uno a uno o dos apilados; fotos horizontales como tarjeta sobre su fondo desenfocado; subtítulos por encima de los 300 px inferiores y nada importante en los 220 px superiores (interfaz de Reels/TikTok); HUD dentro de esa zona segura.
- **1:1 y 4:5**: centrado, titulares un 10–15 % más pequeños, un solo bloque de contenido por plano.
- Comprobar en las hojas de contacto que nada se sale del encuadre en el formato elegido.

## 3. Lenguaje de movimiento

- **Rejilla musical:** 120 BPM → 1 tiempo = 15 fotogramas, 1 compás = 60. Todos los cortes de capítulo caen en compases; los acentos, en tiempos.
- **Sincronía con la voz:** cada palabra clave entra en el fotograma exacto en que se dice (ver §6.4). Las animaciones se escriben contra constantes `SYNC.xxx`, nunca contra números sueltos.
- Entradas con `spring` firme (damping 14–18, stiffness 160–260, mass 0,5–0,8). Palabras que suben desde una máscara (`RiseWords`, escalonadas 3–4 fotogramas). Mecanografía a 30–95 caracteres/s según la longitud.
- Salidas rápidas (10–14 fotogramas, ease-in cúbico). Nada flota sin propósito.
- Transiciones: corte en tiempo fuerte + destello blanco de 3–4 fotogramas, glitch, wipe verde, onda de choque. Fundido a negro solo al final.
- Ritmo: un plano nuevo cada 1–3 s en las partes de energía; respiro de 4–6 s en la parte humana.

## 4. Estructura narrativa (plantilla v1)

El concepto aprobado: **el vídeo es un problema de maratón que el espectador termina resolviendo**. Plantilla del promocional de 70 s (2100 fotogramas = 35 compases):

| Fotogramas | Capítulo | Contenido |
|---|---|---|
| 0–240 | Gancho | Terminal `./maraton --duracion=5h --equipo=3 --computadores=1`; «5 horas», «3 personas», «1 computador» en golpes; reloj 05:00:00 que se acelera, temblor y glitches |
| 240–360 | Logo | Destello, onda de choque, marca + wordmark, lema «Programación competitiva e investigación académica.» |
| 360–450 | Enunciado | Tarjeta «Problema A · Únete a Goslint» con el enunciado mecanografiado y chips C / C++, Python, Java |
| 450–660 | Entrenamiento | BFS animado por niveles, problemas A–L que se ponen en verde, «Un problema, tres lenguajes» con el código del póster y AC en cada panel |
| 660–1140 | Maratones | Pila de fotos de las maratones internas; «grafo de viajes» desde Tuluá con coordenadas reales; fotos por ciudad con `EventTag`; mosaico final con «Cada maratón, un problema nuevo.» |
| 1140–1440 | Equipo | El código se disuelve sobre la foto de la cena; «Pensar en equipo», «Equivocarse juntos» con WA/TLE/WA/RTE, «celebrar cada problema resuelto» con AC y estallido de píxeles verdes |
| 1440–1680 | Investigación + Goslint Judge | Las 4 líneas de trabajo del póster; ventana del juez (Envío → Compilación → Sandbox → Casos de prueba → Veredicto) marcado «en desarrollo»; glitch a negro con `$ ▌` |
| 1680–2100 | Llamado | `const requisitos = { experienciaPrevia: false, curiosidad: true, ganasDePracticar: true }`; ejemplo de entrada/salida del póster; cierre «¿Te gusta resolver problemas? Únete a Goslint.» con logo UCEVA y chips de lenguajes |

Si la narración es suministrada, esta tabla es orientativa: las duraciones de cada capítulo salen de la locución (§6.3b).

Guion v1 (referencia de tono: frases cortas, segunda persona, sin superlativos vacíos):
«Cinco horas. Tres personas. Un solo computador. / Y un reloj que no se detiene. / Esto es Goslint. / El semillero de Ingeniería de Sistemas de la UCEVA. / Aquí entrenamos algoritmos y estructuras de datos, problema tras problema, en C++, Python y Java. / Organizamos maratones internas. / Y salimos a competir: en Pereira, en Cali y en Bogotá, en la Regional del ICPC. / Pero lo más valioso no está en el código. / Está en pensar en equipo, equivocarse juntos y celebrar cada problema resuelto. / También investigamos, y estamos construyendo nuestro propio juez en línea. / No necesitas experiencia previa. Solo curiosidad y ganas de practicar. / Tu primer problema ya te está esperando. / Ven, únete a Goslint.»

Para otros tipos de vídeo, conservar el sistema visual y adaptar el arco:
- **Convocatoria corta (15–30 s):** gancho de terminal → logo → 3 fotos con `EventTag` → requisitos → cierre con fecha y lugar dados por el usuario.
- **Resultados de una maratón:** marcador tipo scoreboard (solo con datos reales que el usuario aporte), fotos del evento, agradecimientos, cierre.
- **Goslint Judge:** demo del flujo de evaluación; marcar «en desarrollo» mientras lo esté.

## 5. Tratamiento de fotografías

- Copiar, nunca modificar los originales. `scripts/prepare_photos.py`: `exif_transpose`, RGB, lado mayor 2200 px (3840 para 4K), JPEG 90, nombres limpios (`interna-basica.jpg`, `regional-2025-auditorio.jpg`…).
- Fondos desenfocados **precalculados** en Python (`photos/blur/`, 640 px, Gaussian 18, brillo 0,45). Nunca `filter: blur` en vivo sobre capas grandes.
- **Fotos con la misma orientación que el vídeo:** `Photo` a pantalla completa con Ken Burns suave (escala 1,00→1,15), `transformOrigin` igual a `objectPosition`, oscurecido 0,15–0,2 y degradados arriba/abajo para legibilidad.
- **Orientación contraria:** `PhotoCard` (tarjeta con borde blanco, leve giro de 2–4°, sombra) sobre su propio fondo desenfocado, texto en el lado libre; o pila tipo polaroid (borde blanco 10 px, inferior 54 px).
- Ajustar `objectPosition` foto a foto para que las caras y los rótulos queden dentro (ej. UTP Open: `50% 0%` para ver estudiantes y el letrero).
- Etiquetar cada foto con el evento real; subtítulo con lugar/organizador solo si consta en los materiales.

Inventario verificado a octubre de 2026 (confirmar si llegan materiales nuevos): maratón interna UCEVA 2026 (ganadores nivel básico y avanzado); UTP Open (Universidad Tecnológica de Pereira); Maratón Nacional de Programación 2026 ACIS·REDIS en la Javeriana Cali y cena posterior; Maratón Regional ICPC 2025 en Bogotá (vuelo, auditorio del Politécnico Grancolombiano, foto de equipo). La foto de la catrina (Bogotá, oct. 2026) no se ha atribuido a ningún evento: no usarla sin contexto del usuario.

## 6. Audio

Todo el audio es original, del usuario o de licencia libre, y se procesa localmente; sin APIs de pago.

### 6.1 Música (`scripts/make_music.py`, numpy + scipy)
120 BPM, la menor, 48 kHz estéreo, sin muestras. Instrumentos sintetizados: bombo (seno con barrido 155→45 Hz + clic), hats de ruido filtrado, palmas, caja, ticks de reloj (3,2/2,4 kHz), supersaw de 3–5 voces desafinadas filtrado, bajo saw+seno con semicorcheas a contratiempo, arpegio pluck con delay ping-pong, campana FM, riser de ruido con barrido, impacto (boom 95→35 Hz + crash). Progresión i–VI–III–VII (Am F C G) y en el breakdown Fmaj7–C–G–Am con melodía de campana.
Arreglo por compases ligado al montaje: intro con drone, ticks y latido → impacto en el logo → groove A → groove B con palmas → breakdown sin batería en la parte humana → build con redoble y riser → silencio de un tiempo → drop → impacto final, acorde sostenido y fundido. Sidechain del bombo sobre bajo y pads, reverb por convolución con IR de ruido, soft clip `tanh`, pico −1 dBFS.
La música se compone **después** de fijar los cortes (que dependen de la narración) y su longitud debe coincidir con la del vídeo. Verificar estructura con `showwavespic` + `showspectrumpic` y líneas en los compases de corte.

### 6.2 Efectos (`scripts/make_sfx.py`)
`typing`, `key`, `enter` (clic + golpe grave), `whoosh` (ruido con barrido), `glitch` (bitcrush entrecortado), `blip` (1320 Hz), `ac` (arpegio de campana FM Do6–Mi6–Sol6), `wa` (cuadradas 110/116 Hz), `flash`, `hit`. Se colocan en una hoja de efectos en `AudioLayer.tsx` con fotograma, archivo y volumen (0,22–0,5).

### 6.3a Narración generada con Kokoro (Apache 2.0, local)
```bash
python3 -m venv ~/tts/venv && ~/tts/venv/bin/pip install kokoro-onnx soundfile scipy sherpa-onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```
- Voz `em_alex`, `lang="es"`, velocidad 1,0 (0,9 para la frase final). Es determinista: regenerar no cambia duraciones.
- `scripts/narration.json` con una entrada por frase; `make_vo.py` recorta silencios, aplica compresor suave (umbral −18 dB, ratio 3, ataque 4 ms, relajación 90 ms, pico −1,5 dBFS) y escribe `src/vo-manifest.json` con la duración de cada línea.
- Reescrituras fonéticas en el texto de la voz (los subtítulos llevan la ortografía correcta): «C++» → «ce más más», «ICPC» → «i ce pe ce», «UCEVA» → «Uceva». «Únete a Goslint» suena pegado: usar «Ven, únete a Goslint.» a velocidad 0,9.
- Nunca afirmar que hay locución si solo hay subtítulos.

### 6.3b Narración suministrada por el usuario
- Copiar los archivos (wav, mp3, m4a, ogg…) sin tocar los originales y convertirlos a `public/audio/vo/*.wav` a 48 kHz: `ffmpeg -i entrada -ar 48000 -ac 1 salida.wav`.
- **Un solo archivo:** transcribir con Whisper (sherpa-onnx, §6.5) y cortar por silencios (≥ 250 ms) en frases `l01…lNN`; asignar las frases a escenas según el contenido. Alternativa si el usuario prefiere no cortar: un único `<Audio>` y cues con el instante de inicio de cada frase medido en el archivo.
- **Un archivo por escena:** cada archivo es la voz de esa escena, en el orden que indique el usuario (o por nombre de archivo; si es ambiguo, preguntar el orden). Subdividir dentro de cada escena por silencios para obtener los cues de subtítulo.
- Procesado: recortar silencio inicial y final (dejar 20 ms / 120 ms), mismo compresor que en §6.3a y normalización a pico −1,5 dBFS. Si hay ruido de fondo audible, un `highpass=80` y `afftdn` suave; no más (no cambiar la voz).
- **Subtítulos**: transcribir con Whisper, corregir ortografía y nombres propios (Goslint, UCEVA, ICPC, C++) y, si hay dudas sobre lo dicho, mostrar la transcripción al usuario antes de renderizar.
- **Duraciones**: cada escena dura lo que su narración más un respiro, redondeado **hacia arriba al compás** (60 fotogramas a 120 BPM); si una escena necesita espacio visual extra (logo, mosaico), añadir compases enteros. El total del vídeo y la música se derivan de ahí.
- Escribir `src/vo-manifest.json` con el mismo formato (`{id: {file, seconds}}`) para que el resto del proyecto no cambie.

### 6.4 Sincronía palabra a palabra
Calcular RMS en ventanas de 10 ms de cada línea; los silencios ≥ 50–120 ms (umbral 4–6 % del máximo) marcan límites de palabra. Con `cue.from + t*30` se obtienen las constantes `SYNC` del `timeline.ts`. Con voz humana los silencios son menos limpios: apoyarse en los tiempos por palabra de la transcripción y revisarlos en el borrador.

### 6.5 Mezcla (`AudioLayer.tsx`)
- `MUSIC = 0.85`, `DUCKED = 0.3`, `VOICE = 0.8`; la música baja 6 fotogramas antes de cada frase y vuelve en 10 fotogramas al terminar (función `volume` por fotograma). Con voz humana, ajustar `VOICE` con `simulate_mix.py`.
- `scripts/simulate_mix.py` reproduce la mezcla en Python leyendo la hoja de efectos y los volúmenes, para medir sonoridad y picos **sin renderizar**.
- Inteligibilidad: transcribir cada frase desde la mezcla con Whisper small (sherpa-onnx, `https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2`, `language='es'`). Todas las frases deben salir correctas salvo la marca «Goslint», que el modelo no conoce.
- Masterizado final: +1,5 dB con FFmpeg copiando el vídeo (`npm run master`) → objetivo −15 LUFS integrados, pico real ≤ −1 dBFS, cero muestras recortadas (recalcular la ganancia si la voz es del usuario).

## 7. Flujo de trabajo

Crear lista de tareas y avisar del avance con `SendUserMessage` (el render final tarda ~1 h a 1080p).

1. **Preguntas del §0** (narración, aspecto, resolución) y, si la narración es suministrada, recibir los archivos.
2. **Inspeccionar materiales**: leer todas las fotos (orientación EXIF, tamaño), el logo, el póster (texto, código de ejemplo, líneas de trabajo) y la narración suministrada. Anotar qué evento muestra cada foto según su nombre y contenido.
3. **Inspeccionar el entorno**: `node -v`, `ffmpeg`, Python, núcleos, Chromium local, alcance de red (ver §9).
4. **Proyecto**: `package.json` con versiones exactas (`remotion`, `@remotion/cli`, `@remotion/media-utils`, `@remotion/transitions`, `react`/`react-dom` 19, `@fontsource-variable/inter`, `@fontsource/jetbrains-mono`, `typescript`), `tsconfig.json` (`lib: DOM, DOM.Iterable, ES2020`, `resolveJsonModule`), `remotion.config.ts`; `W`, `H` según el §0.
5. **Recursos**: fotos, fondos desenfocados, grano, logo extraído, fuentes.
6. **Narración**: §6.3a (Kokoro: guion → voz → ASR → fonética) o §6.3b (suministrada: convertir → transcribir → cortar → subtítulos). Medir pausas → `timeline.ts` (`S`, `CUES`, `SYNC`).
7. **Música y efectos** con la rejilla de compases del montaje; revisar espectrograma.
8. **Escenas** en `src/scenes/*.tsx` y composición en `GoslintPromo.tsx` (escenas por rango → scanlines → viñeta → grano → HUD → subtítulos → audio), con la maquetación del aspecto elegido (§2). `npx tsc --noEmit`.
9. **Borrador** a media resolución en segundo plano, QA, hojas de contacto, corregir.
10. **Render final** a la resolución pedida en segundo plano, QA completa, masterizado, ASR sobre el MP4 final.
11. **Entrega** (§10).

## 8. Implementación: piezas clave

Estructura:
```
src/  index.ts  Root.tsx  GoslintPromo.tsx  AudioLayer.tsx  timeline.ts  vo-manifest.json
      theme.ts  lib.ts  components.tsx  scenes/*.tsx
public/ brand/ photos/(blur/) audio/(music.wav, sfx/, vo/) fonts/ fx/
scripts/ prepare_photos.py prepare_fx.py make_music.py make_sfx.py narration.json make_vo.py
         import_vo.py (narración suministrada) simulate_mix.py qa.sh
```

`lib.ts`: `tween(f, a, b, from, to, easing)` con clamp, `pop(f, start, damping, stiffness, mass)` (spring), `rnd(seed)` determinista (`sin(x*12.9898+78.233)*43758.5453`), `typed(f, start, cps, len)`.

`components.tsx`: `GridBg`, `Grain`, `Vignette`, `Scanlines`, `Cursor`, `Typer`, `Label`, `RiseWords` (con `highlight`), `Verdict`, `LogoMark`, `Wordmark`, `Photo`, `PhotoCard`, `EventTag` (prop `cps`, 90 por defecto, 300 en cortes rápidos), `GlitchBurst`, `WipeBar`, `Subtitles` (lee `CUES` y la duración del manifiesto).

Cada escena se monta solo en su rango (`f >= a && f < b`) y usa fotogramas absolutos del vídeo; las sub-secciones se cruzan con unos fotogramas de solape.

`remotion.config.ts`:
```ts
import {Config} from '@remotion/cli/config';
Config.setOverwriteOutput(true);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
if (!process.env.AUDIO_ONLY) {
  Config.setCodec('h264'); Config.setCrf(20); Config.setColorSpace('bt709');
  Config.setPixelFormat('yuv420p'); Config.setAudioCodec('aac'); Config.setAudioBitrate('256k');
}
Config.setChromiumOpenGlRenderer('swangle');
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
if (process.env.REMOTION_CONCURRENCY) Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY));
```

Scripts npm: `render` = `remotion render GoslintPromo out/render-raw.mp4 && npm run master`; `master` = `ffmpeg -y -i out/render-raw.mp4 -c:v copy -af volume=1.5dB -c:a aac -b:a 256k -movflags +faststart out/goslint-promo.mp4`.

## 9. Entorno: problemas conocidos y soluciones

- **Chrome de Remotion bloqueado** (remotion.media, storage.googleapis.com): usar el Chromium preinstalado: `REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`.
- **Hugging Face, Google Fonts y jsDelivr bloqueados; GitHub y npm/PyPI accesibles**: modelos desde GitHub Releases, fuentes desde `@fontsource`.
- **Tiempo de render** (2 núcleos, sin GPU): ~0,35 s/fotograma a media resolución, ~1 s/fotograma a 1080p (70 s ≈ 60 min), ~4 s/fotograma a 4K. Lanzar siempre con `nohup … > out/render.log 2>&1 &` y consultar con `sleep` ≤ 590 s + `tail -c`; el primer plano corta a los 10 min. `REMOTION_CONCURRENCY=2`.
- **Rendimiento**: evitar `mix-blend-mode` y `filter: blur` en capas a pantalla completa (multiplican el coste); mantener montadas las texturas de grano y alternar `visibility` en vez de cambiar `src`.
- `--codec=wav` choca con `setCrf` en la config: usar `AUDIO_ONLY=1`, o mejor `simulate_mix.py`.
- `document.fonts.add` no tipa en TS: castear a `{add: (f: FontFace) => void}`.
- Las líneas vacías del resaltador de código deben renderizar ` ` para conservar la altura.
- `pip` del sistema: usar un venv para Kokoro/sherpa-onnx; los scripts de recursos solo necesitan numpy, scipy y pillow.

## 10. QA y entrega

`scripts/qa.sh vídeo.mp4 out/qa`:
- `ffprobe`: la resolución y el aspecto pedidos en el §0, 30 fps, `yuv420p`, BT.709, AAC 48 kHz estéreo, duración esperada.
- `ffmpeg -v error -i … -f null -`: decodifica sin errores.
- `blackdetect` (d=0.1, pix_th=0.06): solo se aceptan negros intencionados (y se mencionan).
- `freezedetect` (n=0.003, d=1.5): ninguno.
- `ebur128=peak=true` y `astats`: ≈ −15 LUFS, pico ≤ −1 dBFS, sin recortes.
- Hojas de contacto `fps=1,scale=480:-1,tile=6x2` (en vertical `scale=-1:480,tile=8x1`) y fotogramas sueltos a resolución completa en los momentos densos: leer cada uno buscando texto cortado o solapado, faltas de ortografía, fotos estiradas o mal encuadradas, logo deformado, subtítulos tapando caras, contenido fuera de las zonas seguras.
- ASR sobre el audio del MP4 final: la narración debe coincidir con los subtítulos.
- Prueba de reproducibilidad: descomprimir el zip en una carpeta limpia, `npm install`, `npx remotion still` de un fotograma.

Entrega:
- `SendUserFile` tiene límite de 30 MiB. Para vídeos más grandes, enviar una copia a la misma resolución en dos pasadas: `-c:v libx264 -preset slow -b:v {≈ 28·8192/duración_s − 192}k -maxrate 2× -bufsize`, AAC 192k, `+faststart`, y revisar un fotograma de esa copia. Explicar que el máster se regenera con `npm run render`.
- Zip del proyecto sin `node_modules/` ni `out/`, con README en español: concepto, tabla de capítulos, estructura, comandos exactos (`npm install`, `npm run render`, `REMOTION_BROWSER`, regenerar recursos y voz o importar la narración suministrada), QA y licencias (fotos, logos y narración del semillero/UCEVA; música y efectos originales; Kokoro Apache 2.0 si se usó; Inter y JetBrains Mono OFL; licencia de Remotion: gratuita para personas, entidades sin ánimo de lucro y empresas de hasta 3 empleados, recomendar confirmarla).
- Respuesta final breve: qué se entregó, decisiones creativas principales, comprobaciones hechas y limitaciones reales (voz sintética si aplica, datos que faltan como el contacto en el cierre, fotos descartadas y por qué).

## 11. Estilo de transiciones aprobado y reels verticales (noviembre 2026)

Aprobado por el usuario en los reels de «¿Qué es la programación competitiva?» (`programacion-competitiva/src/reels/v/`). Aplicarlo **siempre**, también en videos horizontales.

### Transiciones: entrada con impacto, una idea a la vez
- Cada elemento (tarjeta, foto, dato, código, veredicto) entra **en el fotograma en que la voz lo nombra** con un muelle con rebote (`spring` damping ≈ 12, stiffness ≈ 230), desde un lado o con zoom, y **fotogramas de impacto**: destello blanco sobre el elemento (2–4 f), sacudida corta (≈ 14 px, 8 f), y en los momentos clave onda de choque + partículas pixeladas + destello de pantalla (`Hit`).
- Sale con un barrido rápido (≈ 9 f) **antes** de que entre el siguiente grupo: nunca se recorta ni se solapa contenido. Si caben varios a la vez (2–4 datos), se apilan y salen juntos.
- Nada de cámaras que hacen zoom sobre un cuadro horizontal ni de mostrar el cuadro 16:9 reducido dentro de un vertical: **cada formato tiene su propia maquetación** y los recursos se ven grandes y legibles en el móvil (titulares 70–120 px, texto ≥ 34 px a 1080 de ancho).
- Ninguna pantalla vacía: si la primera marca de un bloque tarda, un titular de relleno entra con impacto hasta que llega.

### Ritmo
- **Pausas de 1,5 s como máximo.** En piezas derivadas (reels) los tramos se toman ajustados a la voz: [inicio − 0,6 s, fin + 0,6 s] de cada segmento; los respiros largos del montaje horizontal se recortan.
- Los efectos de sonido se derivan de las mismas marcas que mueven la imagen; si un tramo se recorta, su efecto desaparece con él (nunca un efecto desincronizado de su transición).

### Reels verticales (1080×1920)
- Zonas: 0–220 interfaz de la app (solo fondo) · 230–400 cabecera (marca + título del reel) · 430–1190 escenario · 1210–1600 **Lint siempre visible** (abajo a la izquierda, boca sincronizada con la voz) con un **bocadillo** que muestra el subtítulo · 1620–1920 interfaz (solo fondo). Sin barras de progreso ni pies con información de relleno.
- Cada reel se siente independiente: abre con un gancho propio (frase corta de Lint + título que entra palabra a palabra con impactos) y cierra con «¿Te gusta programar? ¡Únete a GOSLINT!» en vertical. Si no hay audio para el gancho, se omite (no se deja un arranque mudo).
- Implementación de referencia: piezas de transición en `commons/src/vertical.tsx` (`In`, `Hit`, `Big`, `Panel`, `PhotoV`), marco de reels en `programacion-competitiva/src/reels/v/frame.tsx` (`VReel`, `voiceParts`, `FINAL`) y un archivo por reel; cada reel reutiliza la narración, la música y los efectos del video principal sin volver a sintetizar.

### ElevenLabs
- Generar **de una en una** (las llamadas en paralelo disparan «Unusual activity… Free Tier disabled» o «busy»).
- Los audios pueden servirse desde `elevenlabsusercontent.com`: comprobar que el entorno permite ese dominio **antes** de gastar créditos.
- Revisar la pronunciación escuchando (el reconocimiento de voz corrige solo palabras mal dichas, p. ej. «creatinidad»); corregir regenerando solo la frase y empalmándola en un silencio.

## 12. Recursos comunes: `commons/` (noviembre 2026)

En el repositorio `goslint-media-resources`, todo lo que usan o es probable que usen **dos o más videos** vive en `commons/` y se **importa desde ahí**; nunca se copia ni se duplica.

- **Código** (`commons/src`, alias `@commons/...`): `theme` (colores, fuentes, BEAT/BAR), `lib` (tween, pop, rnd), `components` (rejilla, grano, logo, transiciones, `Photo`, `BlurBg`, `Polaroid`, `EventTag`, `Sprite`), `vertical` (**estilo de transiciones aprobado**: `In`, `Hit`, `Big`, `Kicker`, `Panel`, `PhotoV`), `parts` (`Card`, `ContestClock`, `Globe`, `PixelComputer`, `Fact`…), `pixel` (motor pixel art), `mascot` (Lint).
- **Recursos** (`commons/public`): `brand/`, `fonts/`, `fx/`, `audio/sfx/`, `mascotas/`, `photos/` (biblioteca de fotos preparadas + `blur/`; originales en `commons/fotos-originales`, nombres `AAAA-evento-detalle.jpg`). Cada proyecto declara en `commons.json` qué carpetas necesita y `commons/scripts/sync-public.mjs` las copia a su `public/` (copias en `.gitignore`; los scripts `studio`, `still`, `render` y `reels` lo hacen solos).
- **Scripts comunes** (`commons/scripts`): `sync-public.mjs`, `asr.py` (marcas por palabra), `splice_vo.py`, `prepare_photos.py`, `prepare_fx.py`, `make_sfx.py`, `qa.sh`.
- **Regla:** si un recurso no existe y es probable que otro video lo use (animación, transición, marco de foto, tarjeta, sprite, efecto, foto, script), **créalo en `commons/`** e impórtalo con `@commons/...`. Solo lo específico del video (escenas, `timeline.ts`, guion, música, `kit.tsx`) va en su carpeta.
- Al cambiar algo de `commons/`, mantén la API compatible (props opcionales) y comprueba **todos** los proyectos que lo usan (`pnpm exec tsc --noEmit` y un fotograma de cada uno).
- Un proyecto nuevo copia de `programacion-competitiva/` la configuración del alias (`remotion.config.ts`: `overrideWebpackConfig` con alias y `resolve.modules` del proyecto; `tsconfig.json`: `paths`; `scripts/dump_timeline.mjs`: `alias` de esbuild) y su `commons.json`. Detalle en `commons/README.md`.
- Fuera de ese repositorio (proyecto suelto o zip), las secciones 2–8 siguen valiendo: reconstruye las piezas a partir de esta skill.
