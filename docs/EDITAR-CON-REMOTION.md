# Cómo editar los videos a mano con Remotion

Guía para editar sin agente. Los videos son código React: cada fotograma es lo que devuelve un componente para un número de fotograma. Los ejemplos usan `programacion-competitiva/`, pero `busqueda-binaria/` funciona igual.

## 1. Instalar y abrir

Requisitos: Node 18+, `pnpm` (o `npm`), FFmpeg en el `PATH`, Python 3 con `numpy`, `scipy` y `pillow` (solo para regenerar música, efectos, fotos o voz).

```bash
cd programacion-competitiva
pnpm install --frozen-lockfile
pnpm run studio        # copia antes los recursos de commons/ a public/
```

Se abre **Remotion Studio** en el navegador (normalmente http://localhost:3000). A la izquierda están las composiciones (`ProgramacionCompetitiva`, `Reel1QueEs`…, `Miniatura`, `Portada…`); abajo, la línea de tiempo. Cada vez que guardas un archivo, el Studio se recarga solo.

Atajos útiles del Studio: espacio (reproducir), ← → (un fotograma), Shift + ← → (un segundo), y el número de fotograma arriba de la línea de tiempo: es el que usarás en el código (30 fotogramas = 1 segundo).

## 2. Dónde está cada cosa

```
src/Root.tsx            registra las composiciones (tamaño, fps, duración)
src/Video.tsx           video principal: monta cada escena en su rango
src/timeline.ts         tiempos: SC (escenas), V (locuciones), M() (palabras), CUES (subtítulos)
src/scenes/A.tsx …D.tsx escenas del video 16:9 (Intro, Que, Problema, Juez, Icpc, Camino, Colombia, Uceva, Cierre, Final)
src/reels/v/            reels verticales: frame.tsx (marco del proyecto) + un archivo por reel + Cover.tsx (portadas)
src/kit.tsx             Lint como actor, HUD, subtítulos, panel de código
src/sfx.ts              hoja de efectos de sonido
src/AudioLayer.tsx      mezcla (volúmenes de música, voz y efectos)
scripts/narration.txt   guion maestro (voz, subtítulos y marcas)
public/audio/vo/        narración del proyecto
commons.json            qué recursos comunes copia a public/

../commons/src/         COMÚN A TODOS LOS VIDEOS (se importa con @commons/...)
  theme.ts              colores y fuentes
  components.tsx        sistema visual: rejilla, grano, logo, fotos (Photo, Polaroid, EventTag), transiciones
  vertical.tsx          estilo de transiciones aprobado: In, Hit, Big, Kicker, Panel, PhotoV
  parts.tsx             tarjetas, reloj, globo, computador pixel art, Fact
  mascot.tsx            dibujo y poses de Lint (POSES.cheer, POSES.wave…)
../commons/public/      logos, fuentes, grano, efectos de sonido, sprites y biblioteca de fotos
```

**Regla:** si vas a crear algo que otro video podría usar (una tarjeta, una animación, un marco de foto, un efecto), créalo en `commons/` e impórtalo desde `@commons/...`. Detalles en [`commons/README.md`](../commons/README.md).

## 3. El concepto clave: las marcas de la voz

Nada se coloca en un fotograma escrito a mano. En el guion (`scripts/narration.txt`) cada palabra importante lleva una marca:

```
== s04
… {wa}Wrong Answer: produjo una respuesta incorrecta. | {tle}Time Limit Exceeded: …
```

En el código, `M('s04', 'wa')` devuelve el fotograma exacto en que se dice «Wrong Answer». Si la voz cambia, todo se mueve con ella. Otros valores:

- `SC.juez` → `[inicio, fin]` de la escena del juez.
- `V.s04` → `{start, end}` de esa locución.
- `useCurrentFrame()` → fotograma actual dentro del componente.

## 4. Recetas

### Cambiar un texto en pantalla
Busca el texto (`grep -rn "Suma hasta n" src`) y edítalo. Guarda y revisa en el Studio. Ojo: los **subtítulos** no se editan en el código, sino en `scripts/narration.txt` (ver §6).

### Mover o agrandar un elemento
Los elementos usan `position: 'absolute'` con `left`, `top`, `width` y `fontSize` en píxeles del cuadro (1920×1080 en el video, 1080×1920 en los reels). Cambia los números y mira el resultado. En los reels, todo el contenido va entre `y = 430` y `y = 1190` (más abajo está Lint con su bocadillo; arriba, la interfaz de la app).

### Cambiar cuándo entra algo
Cambia la marca o súmale fotogramas: `at={M('s07', 'tres') + 6}` entra 0,2 s después de «tres». Para que salga antes: `out={M('s07', 'mejores') - 4}`.

### Añadir un elemento con el estilo aprobado (reels)
```tsx
<In at={k('sedes')} out={k('mejores') - 4} x={530} y={610} w={490} from="right" exit="right">
  <Fact t="Varias sedes universitarias" />
</In>
<Hit at={k('sedes') + 2} x={770} y={660} />   {/* destello + partículas + onda */}
```
`In` y `Hit` se importan de `@commons/vertical` (`import {In, Hit} from '@commons/vertical'`); `In` hace la entrada con rebote y los fotogramas de impacto; `from`/`exit`: `left`, `right`, `up`, `down`, `zoom`. Mira `src/reels/v/Colombia.tsx` como ejemplo completo.

### Cambiar una foto o su encuadre
La biblioteca de fotos es común: `commons/public/photos/` (y su fondo desenfocado en `blur/`). Cambia el `src` y ajusta `pos` (`'50% 30%'` sube el encuadre). Para añadir fotos nuevas: pon los originales en `commons/fotos-originales/` con el nombre `AAAA-evento-detalle.jpg` y ejecuta, desde la raíz, `python3 commons/scripts/prepare_photos.py commons/fotos-originales`.

### Cambiar la pose de Lint
En la lista `keys`/`lint` de la escena o del reel: `{at: M('s05', 'equipo'), pose: POSES.cheer}`. Poses disponibles en `src/mascot.tsx` (`idle`, `point`, `pointUp`, `think`, `shrug`, `cheer`, `wave`, `wow`, `tired`, `oops`…). Hoja de modelo: `busqueda-binaria/docs/lint-hoja-de-modelo.png`.

### Ajustar un efecto de sonido o su volumen
`src/sfx.ts`: cada línea es `s(fotograma, 'archivo', volumen)`. Los archivos son comunes: `commons/public/audio/sfx/` (se generan con `commons/scripts/make_sfx.py`). Volúmenes generales (música, voz, efectos) en `src/AudioLayer.tsx`.

### Ajustar pausas entre escenas (video principal)
`src/timeline.ts`, tabla `PLAN`: `pre` y `post` son los respiros (en fotogramas) antes y después de cada locución. Después regenera la música (§6) porque la duración cambia.

## 5. Ver y exportar

```bash
pnpm exec tsc --noEmit                                              # comprobar errores
pnpm exec remotion still src/index.ts ProgramacionCompetitiva out/f.png --frame=3950   # un fotograma
pnpm run render          # video principal  -> out/goslint-programacion-competitiva.mp4
pnpm run reels           # los 5 reels      -> out/reels/goslint-reel-0N.mp4
bash scripts/thumbnail.sh   # miniatura y portadas -> miniatura/
pnpm run qa              # comprobaciones objetivas del MP4
```

Desde el Studio también puedes exportar con el botón **Render** de cada composición. Con GPU: `REMOTION_GL=vulkan REMOTION_CONCURRENCY=6 pnpm run render`.

## 6. Cambiar la voz o los subtítulos

1. Edita `scripts/narration.txt` (texto, `|` cortes de subtítulo, `{marcas}`). Si solo cambias **cortes o la ortografía de un subtítulo** sin cambiar lo que se dice, basta con el paso 4.
2. Genera la nueva toma en ElevenLabs con el texto de `python3 scripts/narration.py tts s05` y guárdala en `public/audio/vo/raw/s05.mp3` (o corrige una sola frase con `commons/scripts/splice_vo.py`, ver su cabecera).
3. Transcribe: `python3 ../commons/scripts/asr.py public/audio/vo/raw/s05.mp3` (necesita sherpa-onnx y el modelo Parakeet; instrucciones en el README del proyecto).
4. Importa y regenera lo que depende de la duración:
```bash
python3 scripts/import_vo.py
node scripts/dump_timeline.mjs
python3 scripts/make_music.py
python3 scripts/make_srt.py
```

## 7. Problemas comunes

| Problema | Solución |
|---|---|
| «Marca desconocida: s04.xxx» | la marca no existe en `narration.txt` o falta reimportar (`import_vo.py`) |
| El Studio no carga las fuentes o faltan logos/fotos | `pnpm run commons` (copia `commons/public` a `public/`) |
| «Module not found: @commons/…» | revisa el alias en `remotion.config.ts` y `tsconfig.json` (ver `commons/README.md`) |
| Remotion no descarga su navegador | `REMOTION_BROWSER=/ruta/a/chrome-headless-shell` |
| El render va muy lento | evita `filter: blur` y `mix-blend-mode` en capas grandes; usa `REMOTION_CONCURRENCY` |
| La música no termina con el video | cambió la duración: `node scripts/dump_timeline.mjs && python3 scripts/make_music.py` |
| Texto con ligaduras raras en el código (≤, ==) | el panel de código ya las desactiva; si creas otro, usa `fontVariantLigatures: 'none'` |

Documentación oficial: https://www.remotion.dev/docs
