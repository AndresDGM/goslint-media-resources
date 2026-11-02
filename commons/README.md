# commons · recursos comunes de GOSLINT

Todo lo que usan (o es probable que usen) **dos o más** videos vive aquí, una sola vez. Los proyectos lo **importan desde aquí**; nunca lo copian.

## Contenido

| Ruta | Qué es | Cómo se usa |
|---|---|---|
| `src/theme.ts` | colores (`C`), fuentes (`SANS`, `MONO`), `FPS`, `W`, `H`, `BEAT`, `BAR` | `import {C, SANS} from '@commons/theme'` |
| `src/lib.ts` | `tween`, `pop` (muelle), `rnd`, `typed`, curvas | `import {tween, pop} from '@commons/lib'` |
| `src/components.tsx` | sistema visual: `GridBg`, `Grain`, `Vignette`, `Scanlines`, `Typer`, `Label`, `RiseWords`, `Verdict`, `LogoMark`, `Wordmark`, `GlitchBurst`, `WipeBar`, `CutFlash`, `Shockwave`, `Spot`, `ChapterTitle`, `Chip`, `Window`; fotos: `Photo`, `BlurBg`, `Polaroid`, `EventTag`; `Sprite` (otras mascotas) | `import {LogoMark, Polaroid} from '@commons/components'` |
| `src/vertical.tsx` | **estilo de transiciones aprobado**: `In` (entrada con rebote + fotogramas de impacto), `Hit` (destello, onda, partículas), `Big`, `Kicker`, `Panel`, `PhotoV` (foto enmarcada grande) | `import {In, Hit} from '@commons/vertical'` |
| `src/parts.tsx` | tarjetas y piezas: `Card`, `ContestClock`, `Globe`, `PixelComputer`, `Seats`, `BigTitle`, `Fact` | `import {Card, Fact} from '@commons/parts'` |
| `src/pixel.tsx` | motor de pixel art: `Buf`, `PixelSprite`, `PixelText`, `PixelBurst`, luz | `import {PixelBurst} from '@commons/pixel'` |
| `src/mascot.tsx` | Lint: dibujo, `POSES`, `Lint`, `Emote`, caminar, machetazo | `import {Lint, POSES} from '@commons/mascot'` |
| `public/brand/` | logotipos oficiales (extraídos del póster) y logo UCEVA | `staticFile('brand/mark_white.png')` |
| `public/fonts/` | Inter Var y JetBrains Mono | se cargan en el `Root.tsx` de cada proyecto |
| `public/fx/` | texturas de grano | `<Grain />` |
| `public/audio/sfx/` | efectos sintetizados (`ac`, `wa`, `hit`, `whoosh`, `glitch`, `pop`…) | `staticFile('audio/sfx/hit.wav')` |
| `public/mascotas/` | sprites 1x de otras mascotas (Globín, Marco) | `<Sprite src="globin_idle.png" …/>` |
| `public/photos/` (+ `blur/`) | biblioteca de fotos del semillero, preparadas, con fondo desenfocado | `staticFile('photos/2024-nacional-icpc-grupal.jpg')` |
| `fotos-originales/` | originales de las fotos (no se sirven) | `python3 commons/scripts/prepare_photos.py commons/fotos-originales` |
| `scripts/sync-public.mjs` | copia `public/` común al proyecto (Remotion solo sirve su propia carpeta `public/`) | se ejecuta solo en `pnpm run studio/render/still/reels` |
| `scripts/asr.py` | reconocimiento de voz con marcas por palabra (Parakeet) | `python ../commons/scripts/asr.py public/audio/vo/raw/s01.mp3` |
| `scripts/splice_vo.py` | corregir una frase de una toma empalmando otra generación | ver su cabecera |
| `scripts/prepare_photos.py`, `prepare_fx.py`, `make_sfx.py` | generan `public/photos`, `public/fx`, `public/audio/sfx` de commons | `python3 commons/scripts/…` |
| `scripts/qa.sh` | QA objetiva de un MP4 | `bash ../commons/scripts/qa.sh out/video.mp4 out/qa` |

Los nombres de fotos siguen `AAAA-evento-detalle.jpg` (por ejemplo `2025-regional-icpc-poli.jpg`): el nombre es la fuente de la etiqueta del evento en pantalla.

## Cómo lo usa un proyecto

1. **Código** — alias `@commons` → `commons/src`, configurado en:
   - `remotion.config.ts` (`overrideWebpackConfig`: alias + `resolve.modules` con los `node_modules` del proyecto, para que `react` y `remotion` sean una sola copia),
   - `tsconfig.json` (`paths` para `@commons/*`, `react`, `remotion`, `@remotion/*`; `include` con `../commons/src`),
   - `scripts/dump_timeline.mjs` (`alias` de esbuild).
2. **Recursos** — `commons.json` en la carpeta del proyecto dice qué carpetas de `commons/public` necesita:
   ```json
   {"public": ["brand", "fonts", "fx", "audio/sfx", "mascotas", "photos"]}
   ```
   `node ../commons/scripts/sync-public.mjs` las copia a `public/` (las copias están en `.gitignore`). Los scripts `studio`, `still`, `render` y `reels` lo hacen solos; si usas `remotion` directamente, ejecuta antes `pnpm run commons`.

Para un proyecto nuevo, copia esas tres configuraciones y el `commons.json` de `programacion-competitiva/`.

## Reglas

- **Si un recurso no existe y es probable que lo use más de un video, se crea aquí**, no en el proyecto: componentes, animaciones, transiciones, marcos de fotos, tarjetas, sprites, efectos de sonido, fotos del semillero, logos, scripts de audio/fotos/QA.
- Lo específico de un video (sus escenas, su `timeline.ts`, su guion, su música, `kit.tsx` con su HUD y capítulos) se queda en el proyecto.
- **Se importa desde `@commons/...`**; nunca se copia un archivo de commons a un proyecto ni se duplica un recurso en `public/`.
- Cambiar algo en commons afecta a **todos** los videos: mantén la API compatible (props opcionales con valores por defecto), comprueba `pnpm exec tsc --noEmit` en cada proyecto que lo usa y renderiza un fotograma de cada uno.
- Dentro de `commons/src` los imports entre archivos son relativos (`./theme`) y solo dependen de `react` y `remotion`.
