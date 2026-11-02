# AGENTS.md · instrucciones para agentes de IA

Repositorio de recursos multimedia de **GOSLINT**, el semillero de investigación de Ingeniería de Sistemas de la UCEVA (Tuluá, Colombia), dedicado a la programación competitiva y la investigación. Aquí se producen videos con **React + Remotion**, se dibujan las mascotas en pixel art y se guardan fotos, logos y audio.

Este archivo es la referencia para cualquier agente (Claude Code, Codex, Cursor, Copilot…). `CLAUDE.md` lo importa.

## Mapa del repositorio

| Carpeta | Qué es | Composiciones |
|---|---|---|
| `commons/` | **Recursos comunes** a todos los videos: código (`@commons/...`), brand, fuentes, grano, efectos, sprites, biblioteca de fotos y scripts de audio/fotos/QA. Ver `commons/README.md` | — |
| `programacion-competitiva/` | Bienvenida 02 «¿Qué es la programación competitiva?» (16:9), sus 5 reels verticales y sus miniaturas | `ProgramacionCompetitiva`, `Reel1QueEs`…`Reel5Uceva`, `Miniatura`, `Portada1QueEs`…`Portada5Uceva` |
| `busqueda-binaria/` | Video educativo de búsqueda binaria (16:9) | `BusquedaBinaria`, `HojaDeModelo` |
| `promo/` | Promocional y reels de Instagram | ver `promo/src/Root.tsx` |
| `mascotas/` | Kit de mascotas (Lint, Vee, Marco, Globín…): motor de pixel art y hojas de concepto | — |
| `skills/goslint-videos-v1/` | Skill con el sistema visual y de producción aprobado | — |
| `docs/` | Guías para personas: usar agentes y editar a mano con Remotion | — |

Cada proyecto de video tiene su propio `README.md` con capítulos, estructura y comandos. **Léelo antes de tocar ese proyecto.**

## Recursos comunes: `commons/`

- Todo lo que usan o es probable que usen **dos o más videos** vive en `commons/` y **se importa desde ahí**: `import {In, Hit} from '@commons/vertical'`, `import {LogoMark, Polaroid} from '@commons/components'`, `staticFile('brand/…')`.
- **Si necesitas un recurso que no existe y es probable que se reutilice** (una animación, transición, marco de foto, tarjeta, sprite, efecto de sonido, foto del semillero, script), **créalo en `commons/`**, no en el proyecto. Lo específico de un video (escenas, `timeline.ts`, guion, música, `kit.tsx`) se queda en su carpeta.
- Nunca copies un archivo de `commons/` a un proyecto ni dupliques recursos en `public/`: cada proyecto declara en `commons.json` qué carpetas de `commons/public` necesita y `sync-public.mjs` las copia (las copias están en `.gitignore`).
- Al cambiar algo de `commons/`, mantén la API compatible y comprueba **todos** los proyectos que lo usan (`tsc` + un fotograma de cada uno).
- Detalles y lista completa: [`commons/README.md`](commons/README.md).

## Reglas no negociables

1. **Verdad ante todo.** No inventes logros, puestos, fechas, cifras, nombres ni eventos. Todo texto en pantalla sale de los materiales del semillero (fotos y sus nombres de archivo, la presentación, el póster) o de lo que diga el usuario. Si una foto no se puede atribuir a un evento, no la etiquetes.
2. **No menciones** RPC, CCPL ni un juez en línea propio en los videos de bienvenida (decisión del usuario).
3. **Logo exacto.** Usa los PNG de `commons/public/brand/` (extraídos del póster). Nunca redibujes ni pixeles el logotipo.
4. **Español colombiano neutro** (tú, computador), con ortografía y tildes correctas en subtítulos y rótulos.
5. **No declares nada que no hiciste.** Si no renderizaste o no escuchaste, dilo. La revisión de audio se hace con medidas y reconocimiento de voz, y así se dice.
6. **Commits:** mensajes en español, descriptivos. **Prohibido** añadir líneas `Co-Authored-By:` o `Claude-Session:` (ni nada parecido) en commits, PR o cualquier texto publicado. No hagas push a otra rama que la indicada ni abras PR sin que te lo pidan.
7. **No rompas la sincronía.** Las animaciones se escriben contra marcas de la voz (`M('s04', 'wa')`), nunca contra números de fotograma sueltos.

## Sistema visual (resumen; detalle en `skills/goslint-videos-v1/SKILL.md`)

- Negro `#070807`, blanco y verde del logo `#00C063`; ámbar, rojo y morado solo para veredictos (TLE, WA, RTE). Inter Var para titulares, JetBrains Mono para rótulos y código.
- Rejilla que deriva, grano, scanlines y viñeta siempre encima. HUD `● goslint@uceva` en 16:9.
- Música a 120 BPM: cortes de capítulo en compás (60 f), acentos en tiempo (15 f).
- **Transiciones aprobadas:** cada elemento entra en el fotograma en que la voz lo nombra, con muelle con rebote y fotogramas de impacto (destello, sacudida, partículas; onda de choque en los momentos clave), y sale antes de que entre el siguiente grupo. Una idea a la vez, sin recortar contenido, sin pantallas vacías.
- **Pausas de 1,5 s como máximo** en reels y piezas cortas.
- **Lint** (mascota pixel art, `src/mascot.tsx`) siempre visible en los reels, con boca sincronizada a la voz.

## Cómo está construido un video (`programacion-competitiva/` como referencia)

```
scripts/narration.txt  ──(ElevenLabs)──► public/audio/vo/raw/*.mp3
        │                                         │
        │                         scripts/asr.py  ▼  (marcas por palabra)
        └──────────────► scripts/import_vo.py ──► public/audio/vo/*.wav + src/narration.json
                                                          │
src/timeline.ts  (escenas en compás, V, SC, M(), CUES) ◄──┘
        │
src/scenes/*.tsx  (16:9)   src/reels/v/*.tsx  (9:16)   src/sfx.ts  (efectos)   scripts/make_music.py
        │   (importan sistema visual, Lint, transiciones y piezas de @commons/…)
        │
src/Root.tsx  ──►  remotion render  ──►  scripts/render.sh (masterizado)  ──►  out/*.mp4
```

- `scripts/narration.txt` es el guion maestro: `[etiqueta]` = dirección vocal que se envía a ElevenLabs; `|` = corte de subtítulo; `{marca}` = punto de sincronía. `python3 scripts/narration.py tts s05` imprime el texto exacto a enviar (con grafías fonéticas: ICPC → «i ce pe ce», C++ → «ce más más», UCEVA → «Uceva»).
- `src/timeline.ts` deriva todo de la voz: `V[id]` (inicio/fin de cada locución), `SC[escena]` (rango de cada escena), `M(seg, marca)` (fotograma de una palabra), `CUES` (subtítulos).
- Los reels (`src/reels/v/`) reutilizan las mismas marcas, voz, música y efectos: dentro de cada tramo `useCurrentFrame()` devuelve el fotograma del video principal. Marco del proyecto en `frame.tsx` (`VReel`, `voiceParts`, `FINAL`); las piezas de transición (`In`, `Hit`, `Big`, `Panel`, `PhotoV`) vienen de `@commons/vertical`.

## Comandos (desde la carpeta del proyecto)

```bash
pnpm install --frozen-lockfile
pnpm run commons                             # copia los recursos de commons/public a public/
pnpm exec tsc --noEmit                       # SIEMPRE antes de dar algo por terminado
pnpm run studio                              # previsualización interactiva
pnpm exec remotion still src/index.ts ProgramacionCompetitiva out/f.png --frame=3950
pnpm run render                              # video principal + masterizado
pnpm run reels                               # los 5 reels
bash scripts/thumbnail.sh                    # miniatura y portadas
pnpm run qa                                  # QA objetiva (commons/scripts/qa.sh) del MP4 (formato, negros, congelados, sonoridad)
python3 scripts/check_solutions.py           # los veredictos del juez son reales
```

En entornos sin el Chrome de Remotion: `REMOTION_BROWSER=/ruta/a/chrome-headless-shell`. En la nube de Claude Code: `/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`.

## Flujo de trabajo esperado

1. Lee el README del proyecto y los archivos que vas a tocar.
2. Haz el cambio mínimo; mantén estilo, nombres y comentarios en español.
3. `pnpm exec tsc --noEmit`.
4. Renderiza **fotogramas sueltos** de los momentos afectados y míralos (texto cortado, solapes, faltas de ortografía, fotos mal encuadradas, contenido fuera de las zonas seguras). Un render completo tarda 20–75 min: hazlo solo si te lo piden o al final.
5. Si cambias la voz, la duración o las marcas: `import_vo.py` → `node scripts/dump_timeline.mjs` → `make_music.py` → `make_srt.py`.
6. Commit en español sin líneas de coautoría y push a la rama indicada.

## ElevenLabs (narración)

- Voz: «Andres - Social Media Host» (`u36BhA6zuwclwVyAT1Bi`), modelo `eleven_v4` (o v3). 1 crédito por carácter, etiquetas incluidas: cotiza con `estimate_only` y registra el gasto en `scripts/elevenlabs_ledger.json`.
- **Genera de una en una** (en paralelo salta «Unusual activity… Free Tier disabled» o «busy»). Una toma por segmento si el presupuesto es corto.
- Los audios pueden venir de `elevenlabsusercontent.com`: comprueba que la red lo permite **antes** de gastar créditos. Si no, pide al usuario que genere a mano con el texto de `narration.py tts` y suba los mp3 a `public/audio/vo/raw/`.
- El reconocimiento de voz no detecta palabras mal pronunciadas que se parecen («creatinidad»): pide al usuario que escuche. Para corregir, regenera solo la frase y empálmala en un silencio con `commons/scripts/splice_vo.py`.

## Cosas que no debes hacer

- No edites `public/audio/vo/raw/*.mp3` a mano (son las tomas originales; las correcciones van con `commons/scripts/splice_vo.py` y dejan copia).
- No uses `filter: blur` ni `mix-blend-mode` en capas a pantalla completa (multiplican el tiempo de render); los fondos desenfocados están precalculados en `commons/public/photos/blur/`.
- No subas `out/`, `node_modules/` ni vídeos (`*.mp4`): están en `.gitignore`.
- No borres ni sobrescribas fotos originales (`commons/fotos-originales/`); las preparadas están en `commons/public/photos/`.
- No dupliques en un proyecto nada que ya esté en `commons/`.
