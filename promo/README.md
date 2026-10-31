# Goslint · vídeo promocional (React + Remotion)

Vídeo promocional de **Goslint**, el semillero de programación competitiva e investigación de Ingeniería de Sistemas de la UCEVA (Tuluá, Colombia). Todo el vídeo está construido con componentes React y se renderiza fotograma a fotograma con [Remotion](https://www.remotion.dev).

- **Salida:** `out/goslint-promo.mp4` · 1920 × 1080 · 30 fps · 70 s · H.264 (yuv420p, BT.709) + AAC estéreo 256 kb/s · −15,2 LUFS
- **Idioma:** español, con locución y subtítulos incrustados
- **Versión vertical:** `out/goslint-instagram-reel.mp4` · 1080 × 1920 · 30 fps · 45 s, para Instagram Reels (véase [Versión para Instagram Reels](#versión-para-instagram-reels))
- **Versión vertical con la narración final:** `out/goslint-instagram-reel-v2.mp4` · 1080 × 1920 · 30 fps · 50 s (véase [Reel con la narración final](#reel-con-la-narración-final))
- **Versión horizontal con la narración final (YouTube):** `out/goslint-promo-v2.mp4` · 1920 × 1080 · 30 fps · 50 s (véase [Horizontal con la narración final](#horizontal-con-la-narración-final-youtube))

## Concepto

El vídeo se plantea como **un problema de maratón que el espectador termina resolviendo**. Abre con las reglas reales de una competencia tipo ICPC (5 horas, 3 personas, 1 computador) y un reloj que se acelera; la identidad de Goslint aparece como la respuesta. Cada capítulo es una línea de trabajo del póster oficial:

| Tiempo | Capítulo | Qué se ve |
|---|---|---|
| 0:00–0:08 | Gancho | Terminal, «5 horas · 3 personas · 1 computador», reloj de competencia acelerándose |
| 0:08–0:12 | Logo | Marca oficial que se dibuja, wordmark con *glitch*, lema del póster |
| 0:12–0:22 | Entrenamiento | Tarjeta «Problema A · Únete a Goslint», BFS animado, problemas A–L en verde, el código de los tres lenguajes del póster con veredicto AC |
| 0:22–0:38 | Maratones | Fotos reales: maratón interna (básico y avanzado), UTP Open, Maratón Nacional en Cali, Regional ICPC 2025 en Bogotá; «grafo de viajes» desde Tuluá con coordenadas reales |
| 0:38–0:48 | Equipo | El lado humano: cena tras la Nacional, «pensar en equipo», WA/TLE/RTE de los errores compartidos y el AC que se celebra |
| 0:48–0:56 | Investigación y Goslint Judge | Las 4 líneas de trabajo del póster y el flujo del juez en desarrollo (envío → compilación → sandbox → casos → veredicto) |
| 0:56–1:10 | Llamado | `requisitos = { experienciaPrevia: false, curiosidad: true, ganasDePracticar: true }`, el ejemplo de entrada/salida del póster y el cierre «¿Te gusta resolver problemas? Únete a Goslint.» |

Toda la información mostrada procede de los materiales suministrados (póster, nombres de las fotos y lo visible en ellas). No se inventan resultados, posiciones ni estadísticas.

## Estructura

```
goslint-promo/
├── src/
│   ├── index.ts            registerRoot
│   ├── Root.tsx            <Composition> + carga de fuentes
│   ├── GoslintPromo.tsx    composición principal (escenas, overlays, HUD, subtítulos, audio)
│   ├── AudioLayer.tsx      música con ducking bajo la voz + hoja de efectos
│   ├── timeline.ts         guion, tiempos de locución y puntos de sincronía (fotogramas)
│   ├── vo-manifest.json    duraciones de cada línea de locución (lo genera make_vo.py)
│   ├── theme.ts / lib.ts / components.tsx
│   └── scenes/             ColdOpen, Logo, Training, Compete, Team, Judge, Cta
│   ├── reel/               corte vertical: GoslintInstagramReel.tsx, timeline.ts, ui.tsx y scenes/*V.tsx
│   ├── reel-v2/            corte vertical con la narración final: GoslintInstagramReelV2.tsx, timeline.ts,
│   │                       narration-words.json (tiempos por palabra) y scenes/*V2.tsx
│   └── promo-v2/           corte horizontal con la narración final: GoslintPromoV2.tsx y scenes/*H2.tsx
├── public/
│   ├── brand/              logo oficial (extraído del vector del póster), sticker, logo UCEVA
│   ├── photos/             fotografías redimensionadas (+ fondos desenfocados en blur/)
│   ├── audio/              music.wav, music-reel.wav, music-reel-v2.wav, sfx/*.wav, vo/*.wav, vo/audio.mp3 (narración final)
│   ├── fonts/              Inter y JetBrains Mono (licencia OFL)
│   └── fx/                 texturas de grano
├── scripts/
│   ├── prepare_photos.py   copia y redimensiona las fotos originales
│   ├── prepare_fx.py       fondos desenfocados y texturas de grano
│   ├── make_music.py       banda sonora original sintetizada (120 BPM, la menor)
│   ├── make_music_reel.py  la misma banda sonora con el arreglo de 45 s del Reel
│   ├── make_sfx.py         efectos de sonido sintetizados
│   ├── narration.json      texto de la locución
│   ├── make_vo.py          locución con Kokoro TTS (modelo abierto, sin conexión)
│   ├── simulate_mix.py     simula la mezcla final (ducking, voz, efectos) para ajustar niveles sin renderizar
│   ├── make_music_reel_v2.py  la banda sonora con el arreglo de 50 s del Reel con la narración final
│   ├── align_narration.py  alineación forzada de la narración final (tiempos por palabra)
│   ├── render_reel.sh      render y masterización del Reel
│   ├── render_reel_v2.sh   render y masterización del Reel con la narración final
│   ├── render_promo_v2.sh  render y masterización del 16:9 con la narración final (YouTube)
│   └── qa.sh               comprobaciones del MP4 (fotogramas negros, sonoridad, recortes…)
└── remotion.config.ts
```

## Volver a renderizar

Requisitos: Node.js 18 o superior (probado con 22.22).

```bash
npm install
npm run render        # Remotion → out/render-raw.mp4, luego masterización → out/goslint-promo.mp4
```

`npm run render` hace dos pasos: `remotion render` produce `out/render-raw.mp4` y `npm run master` sube el audio +1,5 dB con FFmpeg (el vídeo se copia sin recodificar) para dejarlo en unos −15 LUFS con pico real de −1,2 dBFS. Si solo quieres el render de Remotion: `npx remotion render GoslintPromo out/goslint-promo.mp4`.

En el entorno donde se construyó (2 núcleos, sin GPU) el render completo tarda unos 60 minutos; con más núcleos baja bastante (`REMOTION_CONCURRENCY`).

Remotion descarga su propio *Chrome Headless Shell* la primera vez. Si esa descarga está bloqueada en tu red, apunta a cualquier Chromium/Chrome local:

```bash
REMOTION_BROWSER=/ruta/a/chrome-headless-shell npx remotion render GoslintPromo out/goslint-promo.mp4
# opcional: REMOTION_CONCURRENCY=4 para usar más núcleos
```

Para previsualizar y editar en vivo: `npm run studio`.

Todos los recursos ya generados están en `public/`, así que **renderizar no requiere Python ni red**.

## Versión para Instagram Reels

`GoslintInstagramReel` es una segunda composición del mismo proyecto: 1080 × 1920 (9:16), 30 fps, 1350 fotogramas (45 s). No sustituye a `GoslintPromo`; las dos conviven en `src/Root.tsx` y comparten componentes, recursos, voz y efectos.

```bash
pnpm install            # o npm install
pnpm run render:reel    # o npm run render:reel, o bash scripts/render_reel.sh
```

El resultado queda en `out/goslint-instagram-reel.mp4` (H.264 High, yuv420p, BT.709 + AAC estéreo a 256 kb/s, unos −14 LUFS con picos por debajo de −1 dBFS). `out/reel-raw.mp4` es la salida de Remotion antes de masterizar el audio.

### Qué cambia respecto al vídeo horizontal

- **Montaje:** 45 s en lugar de 70 s. Se conserva el relato completo (reglas de la maratón, logo, entrenamiento, maratones internas y salidas, equipo, investigación y Goslint Judge, requisitos, llamado final). Se omiten dos frases de la locución («Y un reloj que no se detiene» y «Tu primer problema ya te está esperando»), el mosaico de fotos y la tarjeta del ejemplo de entrada y salida. El reloj sigue en pantalla desde el primer fotograma.
- **Composición:** cada escena está maquetada de nuevo para 9:16 en `src/reel/scenes/`. Los tres paneles de código caen en cascada, el flujo del juez baja en vertical y las cuatro líneas de trabajo forman una lista.
- **Fotografías:** cada foto tiene su propio encuadre. Las verticales llenan la pantalla; las horizontales y los grupos anchos (UTP Open, Javeriana Cali, la cena, el equipo de la Regional) van en tarjetas enmarcadas sobre su fondo desenfocado, para no dejar a nadie fuera del recorte.
- **Zonas seguras:** nada esencial queda en los 250 px superiores, en los 440 px inferiores ni, en la mitad inferior, en los 150 px de la derecha, que es donde Instagram superpone su interfaz (`SAFE` en `src/reel/timeline.ts`).
- **Subtítulos:** van por frases cortas que siguen a la voz. Cuando el titular de la escena ya muestra las mismas palabras, el subtítulo no las repite.
- **Música:** `scripts/make_music_reel.py` genera `public/audio/music-reel.wav` con los mismos instrumentos y la misma mezcla, pero con un arreglo de 90 pulsos cuyos cambios de sección coinciden con los cortes del Reel.

Las escenas del Reel reutilizan los puntos de sincronía del vídeo original (`SYNC` en `src/timeline.ts`). El componente `<Shift>` de `src/reel/ui.tsx` desplaza el tiempo de sus hijos según cuánto se movió cada frase de la locución (`OFF` en `src/reel/timeline.ts`), de modo que dentro de él valen los números de fotograma del montaje horizontal.

### Render local

El guion `scripts/render_reel.sh` usa `--gl=vulkan --concurrency=6`. En el equipo donde se preparó este corte (Core i5-12600KF, Radeon RX 6600, Manjaro) el render completo tarda unos 22 s.

| Configuración (600 fotogramas a 1080 × 1920) | Tiempo |
|---|---|
| `--gl=swangle` (CPU), concurrencia 8 | 18,1 s |
| `--gl=angle`, concurrencia 8 | 15,3 s |
| `--gl=vulkan`, concurrencia 4 | 12,6 s |
| `--gl=vulkan`, concurrencia 6 | 10,9 s |
| `--gl=vulkan`, concurrencia 8 | 11,0 s |
| `--gl=vulkan`, concurrencia 16 | 12,4 s |

Con `vulkan` y con `angle` Chrome dibuja de verdad en la GPU (WebGL informa «AMD Radeon RX 6600 (RADV NAVI23)»); con `angle-egl` y `egl` no hay aceleración en este equipo. La codificación H.264 la hace x264 en la CPU. Si en otra máquina Vulkan no funciona:

```bash
REEL_GL=swangle bash scripts/render_reel.sh
```

Control de calidad del Reel: `bash scripts/qa.sh out/goslint-instagram-reel.mp4 out/qa-reel`.

## Reel con la narración final

`GoslintInstagramReelV2` es una tercera composición, independiente de las otras dos: 1080 × 1920 (9:16), 30 fps, 1500 fotogramas (50 s). Usa como única voz `public/audio/vo/audio.mp3` (48,16 s), que suena entero desde el fotograma 0, sin cortes ni cambios de velocidad. `GoslintPromo` y `GoslintInstagramReel` no cambian.

```bash
pnpm run render:reel:v2    # o npm run render:reel:v2, o bash scripts/render_reel_v2.sh
```

El resultado queda en `out/goslint-instagram-reel-v2.mp4` (H.264 High, yuv420p, BT.709 + AAC estéreo a 256 kb/s, −14 LUFS, picos por debajo de −1 dBFS). `out/reel-v2-raw.mp4` es la salida de Remotion antes de masterizar; la masterización solo sube la ganancia y limita picos.

### Cómo se sincroniza

- **Texto:** el guion que dice la voz está en `scripts/align_narration.py`. Se comprobó contra dos transcripciones independientes del MP3 (Whisper `turbo` y `large-v3`), que coinciden palabra por palabra.
- **Tiempos:** ese guion se alinea con el audio por alineación forzada (torchaudio `MMS_FA`) y el resultado se guarda en `src/reel-v2/narration-words.json`: cada palabra con su inicio y su final.
- **Subtítulos:** `PHRASES` en `src/reel-v2/timeline.ts` reparte la narración completa en frases cortas. Al cargar, el módulo comprueba que las frases, unidas, son exactamente las palabras del JSON (si falta o sobra una, el render falla) y calcula la entrada y la salida de cada subtítulo a partir de ellas. Ningún tiempo de subtítulo está escrito a mano.
- **Animación:** `T` (misma tabla) da el fotograma de cada palabra clave; los cortes, los titulares, las fotos, los veredictos y los efectos de sonido se colocan con `T`.
- **Música:** `scripts/make_music_reel_v2.py` genera `public/audio/music-reel-v2.wav`, el mismo tema con un arreglo de 100 pulsos cuyas secciones coinciden con los capítulos de este corte. Baja de volumen mientras hay voz.

Si se sustituye el MP3 por otra toma con el mismo texto:

```bash
.venv-chatterbox/bin/python scripts/align_narration.py   # necesita torch + torchaudio y ffmpeg
pnpm run render:reel:v2
```

Si cambia el texto, hay que actualizar `TEXT` en `scripts/align_narration.py` y `PHRASES` (y, si desaparece alguna palabra clave, `T`) en `src/reel-v2/timeline.ts`.

### Qué cambia respecto al Reel de 45 s

- **Guion:** vuelven «y un reloj que no se detiene» (el reloj ocupa la pantalla y se acelera) y «Tu primer problema ya te está esperando» (la tarjeta de ejemplo del póster, en vertical). Los titulares en pantalla siguen las palabras nuevas («nuestras propias maratones», «no está solo en el código», «Equivocarnos juntos»).
- **Subtítulos:** cubren toda la narración, también donde el titular de la escena dice lo mismo. Mismo estilo y misma posición (justo encima de los 440 px inferiores).
- **Composición:** las escenas dejan libre la franja de los subtítulos; por eso las polaroids y algunas tarjetas son algo más pequeñas.
- **Mezcla:** la voz queda unos 2,5 dB más por encima de la música y los efectos que en el corte de 45 s.

## Horizontal con la narración final (YouTube)

`GoslintPromoV2` es el corte 16:9 del Reel con la narración final: 1920 × 1080, 30 fps, 1500 fotogramas (50 s), con `public/audio/vo/audio.mp3` como única voz desde el fotograma 0.

```bash
pnpm run render:promo:v2    # o npm run render:promo:v2, o bash scripts/render_promo_v2.sh
```

El resultado queda en `out/goslint-promo-v2.mp4` (H.264 High, yuv420p, BT.709 + AAC estéreo a 256 kb/s, −14 LUFS, picos por debajo de −1 dBFS, el nivel al que YouTube normaliza). `out/promo-v2-raw.mp4` es la salida de Remotion antes de masterizar. En el equipo de referencia el render tarda unos 25 s (`--gl=vulkan --concurrency=6`; `PROMO_GL=swangle` para renderizar en CPU).

- **Montaje, música, efectos y subtítulos:** los mismos que `GoslintInstagramReelV2`. Todo sale de `src/reel-v2/timeline.ts` (`T`, `R2`, `CAPTIONS_V2`, `SFX_V2`) y la mezcla es el mismo componente (`AudioV2`), así que si se realinea la narración cambian los dos cortes a la vez.
- **Maquetación:** la del vídeo horizontal original. Las escenas de `src/promo-v2/scenes/` son las de `src/scenes/` con los tiempos de la narración final; donde se pudo, el componente 16:9 original se reutiliza tal cual dentro de `<Shift>` (grafo BFS, problemas A–L, paneles de código, código que se disuelve, requisitos).
- **Titulares:** siguen las palabras nuevas («Organizamos nuestras propias maratones», «no está solo en el código», «Equivocarnos juntos», «resolver problemas»).
- **Diferencias con el 16:9 de 70 s:** no hay mosaico de fotos («Cada maratón, un problema nuevo») ni pantalla negra con `$ ▌` antes del llamado; no caben en los 50 s de la narración.

Control de calidad: `bash scripts/qa.sh out/goslint-promo-v2.mp4 out/qa-promo-v2`.

## Regenerar los recursos (opcional)

Requiere Python 3 con `numpy`, `scipy` y `pillow`.

```bash
python3 scripts/prepare_photos.py /ruta/a/fotos_originales   # fotos
python3 scripts/prepare_fx.py                                 # fondos desenfocados + grano
python3 scripts/make_music.py                                 # banda sonora
python3 scripts/make_music_reel.py                            # banda sonora del Reel
python3 scripts/make_music_reel_v2.py                         # banda sonora del Reel con la narración final
python3 scripts/make_sfx.py                                   # efectos
```

### Locución

La voz se generó con [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) (modelo de pesos abiertos, licencia Apache 2.0, se ejecuta localmente, sin API de pago), voz `em_alex`:

```bash
python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
.venv/bin/python scripts/make_vo.py kokoro-v1.0.onnx voices-v1.0.bin public/audio/vo
```

El texto está en `scripts/narration.json`. Algunas palabras se escriben como se pronuncian para que la voz las lea bien («ce más más», «i ce pe ce», «Uceva»); los subtítulos de `src/timeline.ts` usan la ortografía correcta. Si cambias el texto, ajusta también los fotogramas de `CUES` y `SYNC` en `src/timeline.ts`.

Para sustituirla por una voz humana: graba cada línea como `public/audio/vo/lNN.wav`, actualiza `seconds` en `src/vo-manifest.json` y vuelve a renderizar.

## Control de calidad

```bash
bash scripts/qa.sh out/goslint-promo.mp4 out/qa
```

Antes de un render largo, `python3 scripts/simulate_mix.py` reproduce la mezcla de `AudioLayer.tsx` en Python (misma hoja de efectos, mismos volúmenes) y escribe `out/sim_mix.wav` para medir sonoridad y picos.

`qa.sh` comprueba que el archivo decodifica sin errores, busca fotogramas negros y congelados, mide la sonoridad integrada (EBU R128), el pico real y las muestras recortadas, y genera hojas de contacto (un fotograma por segundo).

## Licencias de los recursos

- Fotografías, logo de Goslint, póster y logo UCEVA: material propio del semillero / institución.
- Música y efectos: originales, sintetizados por `scripts/make_music.py` y `scripts/make_sfx.py` (sin muestras de terceros).
- Voz: Kokoro TTS (Apache 2.0).
- Fuentes: Inter y JetBrains Mono (SIL Open Font License).
- Remotion: [licencia de Remotion](https://www.remotion.dev/license) — la licencia gratuita cubre a personas individuales, organizaciones sin ánimo de lucro y empresas de hasta 3 empleados. Un semillero de una institución pública como la UCEVA debería encajar ahí, pero conviene confirmarlo en el texto de la licencia.
