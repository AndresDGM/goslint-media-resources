# Goslint · banner (React + Remotion)

Banner 16:9 (2000 × 1125) de Goslint construido con componentes React y el motor de pixel art del repositorio, para poder corregirlo y volver a renderizarlo.

| Composición | Qué es | Salida |
|---|---|---|
| `BannerV1` | Reconstrucción del banner original: Lint saludando con globos, marca, lema, marcador de maratón y veredictos | `out/banner-v1.png` |
| `BannerV2` | Misma identidad, pero con las 13 mascotas en fila (Lint, Vee, Polo, ParserInt, Velasco, Ringo, Marco, Byte, Pypo, Mocca, Diego, Globín y DaRu), en el orden del roadmap | `out/banner-v2.png` |

## Estructura

```
banner/
├── src/
│   ├── Banners.tsx   BannerV1 y BannerV2 (posiciones, lista y orden de mascotas en MASCOTAS)
│   ├── parts.tsx     piezas compartidas: fondo, cabecera, terminales, marca, marcador, veredictos, globos
│   ├── mascot.tsx    Lint (pose y dibujo por código), del proyecto busqueda-binaria
│   ├── pixel.tsx     motor de pixel art y fuente 5×7
│   ├── etiqueta.tsx  texto en fuente de píxeles con tracking y tildes
│   └── theme.ts      colores y tamaño del lienzo
└── public/
    ├── brand/        marca, wordmark y logo UCEVA
    ├── mascotas/     sprites 1× de las 13 mascotas (de mascotas/kit/salida y referencias)
    └── fonts, fx/    Inter, JetBrains Mono y grano
```

## Uso

```bash
npm install
npm run studio    # vista previa
npm run render    # out/banner-v1.png y out/banner-v2.png
```

Para cambiar mascotas, su orden o las etiquetas bajo cada una, edita `MASCOTAS` en `src/Banners.tsx`. Si añades un sprite nuevo, cópialo a `public/mascotas/<id>.png` e indica su tamaño en píxeles (`w`, `h`).

Si Remotion no puede descargar su Chrome: `REMOTION_BROWSER=/ruta/al/chromium npm run render`. Los renders (`out/`) no se versionan.
