# Goslint · roadmap del canal (React + Remotion)

Carrusel de **17 imágenes** (1080 × 1350, 4:5, renderizadas a ×2 → 2160 × 2700) con el roadmap del canal de YouTube: portada, 14 láminas de fases (Fase 0 a Fase 7), la meta y las series cortas. Está construido con componentes React y el mismo motor de pixel art que el resto de vídeos (Lint, fuente 5×7 y paleta de Goslint), no con imágenes estáticas, así que cualquier corrección se hace en el código y se vuelve a renderizar.

El contenido sale de [`temario_canal_goslint.md`](temario_canal_goslint.md): 99 videos en 8 fases.

## Estructura

```
roadmap/
├── temario_canal_goslint.md   temario de origen
├── src/
│   ├── data.ts        TODO el contenido: fases, títulos, hitos, series, meta y qué láminas hay
│   ├── Slide.tsx      diseño de las láminas (portada, fase, series)
│   ├── etiqueta.tsx   texto en fuente de píxeles 5×7 con tracking y tildes
│   ├── pixel.tsx      motor de pixel art y fuente 5×7 (el de busqueda-binaria)
│   ├── mascot.tsx     Lint, con sus poses (el de busqueda-binaria)
│   ├── theme.ts       colores y tamaño (1080×1350)
│   └── Root.tsx       una composición por lámina: S01 … S17
├── public/            fuentes JetBrains Mono y logotipo
└── scripts/render_all.ts
```

## Cómo corregir algo

| Quiero cambiar… | Dónde |
|---|---|
| Un título de video, un número o marcar un hito (`hito: true`) o el «listo» | `FASES` en `src/data.ts` |
| Qué videos van en cada lámina, el texto de «SIGUE», la pose de Lint | `LAMINAS` en `src/data.ts` |
| Series cortas o el recuadro de la meta | `SERIES` y `META` en `src/data.ts` |
| Colores, márgenes, tamaños de letra | `src/theme.ts` y `src/Slide.tsx` |

Si agregas o quitas láminas, el contador «NN/17» y las composiciones se ajustan solos.

## Uso

```bash
npm install
npm run studio          # vista previa interactiva (carpeta Roadmap: S01 … S17)
npm run render          # las 17 láminas en out/NN_nombre.png (2160×2700)
npm run render -- 4     # solo la lámina 4
```

Remotion descarga su propio Chrome. Si no puede, apunta a uno local: `REMOTION_BROWSER=/ruta/al/chromium npm run render`.

Los renders (`out/`) no se versionan; se regeneran con `npm run render`.
