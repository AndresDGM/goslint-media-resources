# Polo · paquete para animar

Mascota de la **Fase 2 · Programación básica** de Goslint: zorro ártico de peluche, cuadrúpedo, con gorra con la «L» verde.
Pixel art dibujado **por código** (nada de imágenes de IA ni a mano), con el mismo motor que Lint, Vee y Marco.

## Qué trae

| Carpeta / archivo | Para qué sirve |
|---|---|
| `salida/polo_concepto.png` | La hoja de concepto aprobada (3840×2160). |
| `salida/polo/animacion/lienzo_72x64/` | **Lo principal para animar.** PNG transparentes de 72×64, todos con el mismo lienzo y los pies en el mismo sitio (no se desalinean al apilarlos). |
| `salida/polo/animacion/x12/` | Los mismos ampliados 12× sin suavizar (864×768), listos para video. |
| `salida/polo/animacion/tiras/` | Tiras horizontales: `poses.png` (8), `reposo.png` (4), `especial.png` (3). |
| `salida/polo/animacion/gif/` | Vista previa: `reposo.gif` y `especial.gif`. |
| `salida/polo/animacion/atlas.json` | Lista de fotogramas, orden, tiempos sugeridos, ancla de los pies y paleta. |
| `salida/polo/p_*.png` | Sprites recortados a la silueta (los usa la hoja de concepto). |
| `mascotas/polo.py` | **El código de Polo.** Todo el dibujo, las poses y las animaciones. |
| `mascotas/polo_exportar_animacion.py` | Regenera `salida/polo/animacion/`. |
| `mascotas/polo_config.json` | Textos de la hoja de concepto. |
| `motor/`, `hoja/`, `referencias/` | Los del kit (motor de pixel art, generador de hojas, fuentes y recuadro de escala). |

## Medidas (no cambian)

- Lienzo **72×64**. Pies en **y = 50** (la última fila de píxeles de las patas es y = 49). Centro horizontal **x = 36**.
- Alto **33 px** (de y = 17 a y = 49), ancho 29 px en reposo. La silueta sobresale solo por efectos y accesorios.
- Sin contorno blanco. Fondo transparente.

## Fotogramas

**Poses (8):** `idle` reposo · `wave` saludo · `point` señalar · `think` pensar · `prog` programar (portátil) · `cheer` ¡bien! · `wow` sorpresa · `tranqui` (duerme con un bug en la gorra).

**Reposo, 4 tiempos (250 ms c/u, en bucle):** 0 cola a la izquierda · 1 inhala (cuerpo y cabeza suben 1 px) · 2 cola a la derecha y parpadeo lento · 3 exhala (cuerpo baja 1 px).

**Movimiento especial «¡AIRE FRESCO!», 3 fotogramas (400 ms; deja una pausa al final):** 0 toma aire (mejillas infladas, ∞ rojo) · 1 sopla (nube gélida, el ∞ se congela de izquierda a derecha) · 2 el ∞ queda congelado.

## Regenerar y crear más fotogramas

Necesitas Python 3 y Pillow (`pip install pillow`). Para la hoja de concepto también Playwright con Chromium.

```
python3 mascotas/polo.py salida/polo                              # sprites recortados
python3 mascotas/polo_exportar_animacion.py                       # lienzo 72×64, x12, tiras, GIF y atlas
python3 hoja/hacer_hoja.py mascotas/polo_config.json salida/polo salida/polo_concepto.png
```

Cada fotograma es un `Pose(...)` en `mascotas/polo.py`. Para animar algo nuevo, agrega otro `Pose` (por ejemplo más fotogramas intermedios del reposo o del soplo) y vuelve a exportar. Parámetros:

| Parámetro | Qué hace |
|---|---|
| `eyes` | `sleepy` (semicerrados, por defecto) · `closed` · `happy` · `wide` · `wink` |
| `mouth` | `smile` · `open` · `o` · `flat` |
| `look` | 0 de frente · 1 con la cara girada hacia la derecha (cualquier valor intermedio sirve para animar el giro) |
| `bodyDy`, `headDy` | Sube o baja el cuerpo / la cabeza (las patas siguen pisando el suelo y se estiran) |
| `capDy` | Despega la gorra de la cabeza (la usa «sorpresa») |
| `tail`, `tailUp` | Balanceo de la cola (−1 a 1) y cuánto sube (0 a 1) |
| `puff` | Mejillas infladas |
| `upF`, `loF`, `sy`, `sxo` | Pata delantera cercana levantada (ángulos de `arm()`, altura y posición del hombro). Con los valores por defecto la pata queda en el suelo |
| `prop` | `laptop` o `bug` |
| `fx` | `think` · `spark` · `bang` · `zzz` |
| `special` | 0 a 1: avance del soplo y del congelado del ∞ (−1 = sin movimiento especial) |

## Paleta (12 colores planos)

Pelaje `#D6D6D6` (luz `#EEEEF0`, sombras `#AEB0BA` y `#8C8E9A`) · tinta `#1C2027` · rosa `#E9A8B4` · gorra `#33423B` y `#222C27` · verde Goslint `#00C063` y `#00864A` · aliento gélido `#A8E6FF` y `#4FB3E6`.
Extras solo para accesorios y efectos (los del kit): portátil `#C9D3DC` `#7F8D99` `#0A1A12`, calor `#E2463E` `#F2C230`.

## Reglas del kit que Polo respeta

Dibujado por código con `motor/pixel.py` · lienzo 72×64 con pies en y = 50 · cabeza grande y cuerpo pequeño · patas delanteras de 2 px con `arm()` cuando se levantan · sin contorno blanco · paleta plana corta con guiño a Goslint (la «L» verde) · diseño original (del zorro ártico solo se toma la idea: pelaje claro, orejas pequeñas y cola esponjosa).
