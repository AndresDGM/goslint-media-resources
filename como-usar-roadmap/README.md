# Goslint · Bienvenida 03 · Cómo usar este roadmap

Tercer y último video de la Fase 0 (#003 del temario, `../roadmap/temario_canal_goslint.md`). Lint presenta el mapa de 99 videos en 8 fases, cada mascota guía se presenta con su propia voz, explica los hitos (★), por dónde entrar según lo que ya sepas y que el roadmap no es definitivo. Además, un reel vertical por fase (1 a 7).

- Resultado: `out/goslint-como-usar-roadmap.mp4` · 1920 × 1080 · 30 fps · ≈ 3 min 46 s.
- Reels: `out/reels/goslint-roadmap-fase-N.mp4` · 1080 × 1920.
- Narración: ElevenLabs `eleven_v4`, una voz por mascota (`../commons/voces.json`); 26 segmentos, gasto en `scripts/elevenlabs_ledger.json`.

## Capítulos

| Escena | Voz | Contenido |
|---|---|---|
| 00 · apertura | s01 | `./roadmap --abrir`, logotipo, «¿por dónde empiezo?», el camino de 8 fases |
| 01 · el mapa | s02 | 99 videos · 8 fases; de «nunca he programado» a «listo para una maratón»; el orden en que se aprende |
| 02 · fases y guías | s03a–s03t | cada fase con su tarjeta (temario real) y su guía: Vee, ParserInt, Mocca, Pypo y Byte, Polo, Marco y Ringo, Velasco, DaRu, Diego y Globín |
| 03 · los hitos | s04 | los siete hitos ★ reales; AC → sigue, WA → repasa |
| 04 · ¿por dónde entro? | s05 | nunca has programado → fase 0; ya programas → #038 Checkpoint → fase 3 |
| 05 · un mapa vivo | s06 | el roadmap no es definitivo: agregar, mover, ajustar |
| cierre | s07 | «Guarda el mapa…», ¿Te gusta programar? ¡Únete a GOSLINT! |

## Estructura

```
scripts/narration.txt   guion maestro («== id @Mascota» = quién habla)   scripts/narration.py voces | count | tts <id>
scripts/import_vo.py    voz → public/audio/vo/*.wav + src/narration.json (marcas por palabra de ../commons/scripts/asr.py)
src/timeline.ts         escenas, V, SC, M(), CUES, SPEAKER, talkLevel(f, quién)
src/fases.json          fases y títulos del temario (generado desde ../roadmap/temario_canal_goslint.md)
src/scenes/A–C.tsx      escenas · src/parts.tsx camino de fases, tarjeta de fase y de video
src/reels/frame.tsx     marco vertical · src/reels/FaseN.tsx un reel por fase
../commons/src/mascotas.tsx   las mascotas guía (sprites de commons/public/mascotas)
```

## Comandos

```bash
pnpm install
pnpm exec tsc --noEmit
REMOTION_BROWSER=/ruta/a/chrome-headless-shell pnpm run render     # video principal + masterizado
REMOTION_BROWSER=/ruta/a/chrome-headless-shell pnpm run reels      # reels de las fases
node scripts/dump_timeline.mjs && python3 scripts/make_music.py && python3 scripts/make_srt.py
```

Correcciones de voz: las tomas descartadas quedan en `public/audio/vo/raw/*_original.mp3` y `s06_series_descartado.mp3` (no se usan).
