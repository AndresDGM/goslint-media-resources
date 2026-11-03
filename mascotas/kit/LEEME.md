# Kit de mascotas de Goslint

Sirve para crear una mascota nueva, del mismo universo que Lint, Vee y Marco, y su hoja de concepto.

## Contenido

| Ruta | Qué es |
|---|---|
| `PROMPT.md` | El prompt para pegar en una conversación nueva (rellena los campos `[…]`) |
| `GUIA-MASCOTAS.md` | Reglas de estilo, escala, proporciones y correcciones frecuentes |
| `motor/pixel.py` | Motor de pixel art: lienzo, rectángulos, elipses, líneas, brazos, ruido, luz de contorno |
| `motor/animar.py` | Motor de animación: curvas (easing), estirar/aplastar, inclinar, efectos cómicos y exportación de clips |
| `motor/acciones.py` | Acciones generales comunes a todas: hablar, explicar, saludar, señalar, pensar, celebrar, sorpresa, entrar y salir |
| `motor/plantilla_mascota.py` | Mascota de ejemplo que ya funciona. Se copia y se modifica |
| `hoja/hacer_hoja.py` | Genera la hoja de concepto a partir de un JSON y los sprites |
| `hoja/ejemplo_config.json` | Todos los campos de texto de la hoja |
| `hoja/fuentes/`, `hoja/marca/` | Fuentes (Silkscreen, JetBrains Mono) y wordmark de Goslint |
| `referencias/hojas/` | Hojas aprobadas de Lint, Vee y Marco |
| `referencias/codigo/` | Código de Lint (TypeScript), Vee y Marco (Python) |
| `referencias/sprites/` | Lint, Vee y Marco a 1x, para el recuadro de escala |

## Flujo

Requisitos: Python 3 con Pillow y Playwright (Chromium).

```bash
pip install pillow playwright && python3 -m playwright install chromium
```

1. Copia la plantilla:
   ```bash
   cp motor/plantilla_mascota.py mascotas/<nombre>.py
   ```
   Cambia la paleta y las secciones marcadas con `✎ CAMBIAR`.
2. Exporta los sprites:
   ```bash
   python3 mascotas/<nombre>.py salida/<nombre>
   ```
3. Copia `hoja/ejemplo_config.json`, rellena los textos y genera la hoja:
   ```bash
   python3 hoja/hacer_hoja.py config.json salida/<nombre> <nombre>_concepto.png
   ```
4. Revisa la hoja, corrige y repite.

Los archivos de `mascotas/` importan el motor con `sys.path`. Si los mueves, ajusta la ruta, o ejecútalos con `PYTHONPATH=motor`.

## Animaciones (todas las mascotas menos Lint)

Cada mascota tiene, además de sus 8 poses, un archivo `mascotas/<nombre>_anim.py` con sus clips a 12 fps: tres propios (reposo, especial y gag) y las acciones generales.

| Mascota | Reposo (bucle) | Movimiento especial | Gag cómico |
|---|---|---|---|
| Byte | el código corre por su franja; saltito de un bloque | copias cada vez más pequeñas caen al pozo, emergen juntas y sube «AC» | `culebrita`: se come dos bugs, le crece la cola y eructa |
| DaRu | lluvia de código y ceja de «sé algo que tú no» | invoca fragmentos, los ordena y los compila en un chulo | `bug`: presume, sale «¡BUG!», glitch dramático, se pone serio y lo arregla |
| Diego | manos en la cintura, se balancea, «¿listo?» | las tarjetas salen de la tabla, se ordenan y la más fácil cae en «AC» | `uno_mas`: flexiones contando, el cronómetro pita: «¡UNO MÁS!» |
| Vee | manos en la cintura, mira a los lados | dibuja en el aire un diagrama de flujo (inicio, decisión, sí ✓ / no ✗) | `bucle`: sigue una flecha que gira en un bucle hasta marearse y lo corta con «BREAK» |
| Marco | flota: el humo y la llama se mecen | se deshace en humo, viaja y se rearma en otro lugar | `detector`: el detector de humo pita por su culpa; abanica, estornuda humo y vuelve a pitar |
| Globín | flota: el globo se mece con retraso | sopla tres veces, se infla con rebote, despega con confeti y aterriza | `pinchazo`: un «WA» lo pincha, sale disparado desinflándose y se reinfla |
| Mocca | inquieto: cabecea al ritmo y da un sorbo | barre los píxeles basura avanzando; se vuelven memoria «LIBRE» | `cafe`: tres sorbos, vibra, sale disparado y vuelve derrapando |
| ParserInt | punta del sombrero al viento y saltito de cabra | crece la llama verde y aparece la tarjeta con su ✓ | `nam`: arranca una página del libro y se la come |
| Polo | dormilón: cabecea y se despierta de golpe | toma aire, sopla, el ∞ se congela y le da un escalofrío | `siesta`: un bug le hace cosquillas, «¡ACHÚ!» y la gorra sale volando |
| Pypo | se mece como serpiente y saca la lengüita | toma impulso, engancha el muro con la cola «@» y salta hasta «AC» | `mosca`: la atrapa con la lengua y el bulto baja por su cuerpo |
| Ringo | zen: respira lento y sorbe de su coco | cae un «WA» temblando, ni se inmuta, sorbe y pasa a «AC» | `mandarina`: le cae una mandarina en la cabeza y un pajarito se posa encima |
| Velasco | manos juntas, asiente («ajá») | lee línea por línea, marca en rojo y traza el chulo verde | `complejidad`: «O(n²)» da «TLE», suda, piensa y queda «O(n)» |

### Acciones generales (las 12 mascotas)

Salen de `motor/acciones.py` y las tienen las 12 mascotas (todas menos Lint). Cada mascota solo aporta un adaptador (`MASCOTA` al final de su `_anim.py`) que traduce un vocabulario común (brazo, gesto de la mano, ojos, boca, cejas) a sus propios parámetros.

| Clip | Qué hace |
|---|---|
| `hablar` | Bucle de habla: la boca sigue sílabas, asiente en los acentos, sube las cejas y parpadea |
| `bocas` | Tres fotogramas quietos: boca `cerrada`, `media` y `abierta`, para sincronizar con la voz |
| `explicar` | Bucle: habla gesticulando (palma abierta → señala a un lado → índice arriba para enumerar) |
| `saludar` | Anticipa, da un saltito y agita la mano |
| `senalar` | Toma impulso hacia atrás, señala de golpe a la derecha y lo comenta |
| `pensar` | Mano al mentón, puntos suspensivos… y «!» cuando le llega la idea |
| `celebrar` | Se agacha, salta con los brazos arriba, aterriza con aplastón y confeti |
| `sorpresa` | Respingo, ojos muy abiertos, «!» y gota de sudor |
| `scuba` (solo Globín y ParserInt) | El baile «scuba» de TikTok: a golpe de ritmo, una mano sube a la cara y la otra sale al lado, y se turnan, con rebotito, pasitos e inclinación hacia el brazo que sale (bucle) |
| `entrar` / `salir` | Entra por la izquierda y sale por la derecha (tras despedirse) a su manera: Diego, Velasco y Polo caminan; Globín flota; Byte y ParserInt van a saltos; Mocca llega disparada y derrapa; Pypo y Ringo se deslizan; DaRu se materializa y se desintegra en código |

**Sincronizar la boca con la voz.** En `clips.json`, `hablar` y `explicar` traen `etiquetas` con la boca de cada fotograma, y `bocas` trae las tres bocas sueltas. Para un video, lo más fiel es elegir el fotograma de `bocas` según el volumen de la voz en cada momento (silencio → `cerrada`, medio → `media`, fuerte → `abierta`); `hablar` sirve cuando basta con que «hable» en bucle.

Para exportarlas (solo necesita Pillow):

```bash
python3 mascotas/animar_mascotas.py              # todas
python3 mascotas/animar_mascotas.py polo ringo   # solo esas
```

Se guardan en `salida/<nombre>/clips/`:

- `<clip>.gif`: vista previa a 8x sobre el fondo del canal (#070807), con la duración real de cada fotograma.
- `<clip>.png`: tira 1x de fotogramas, todos con la misma caja (no se desalinean al animarlos en un editor o en Remotion).
- `clips.json`: número de fotogramas, milisegundos de cada uno, tamaño de la celda, si es bucle y dónde quedan los pies dentro de la celda (`ancla_pies_en_celda`).

Con `--contactos <carpeta>` también escribe hojas de contactos con cada fotograma numerado, para revisarlas a ojo.

### Cómo animar (reglas)

- **Nada se mueve lineal:** usa las curvas de `animar.py` (`smooth`, `ease_out`, `back` para el rebote, `bounce`, `keys` para fotogramas clave).
- **Anticipa, actúa y asienta:** antes de un salto o un golpe, aplasta (`stretch(b, -1, cintura)`); en el aterrizaje, un fotograma de `squash`; al final, un pequeño rebote.
- **Los pies no flotan:** para respirar, estira desde la cintura (`stretch`) en vez de subir todo el cuerpo; solo se despegan en saltos y despegues, con polvo (`dust`) y sombra.
- **Efectos de cómic con medida:** «!», «?», sudor, estrellas de mareo, líneas de velocidad, ondas de choque. Un efecto a la vez y que salga antes del siguiente.
- **Rótulos en español y con tildes:** el texto de 3 × 5 de `animar.text` admite `¡ ¿ Á É Í Ó Ú Ñ`.
- **Determinista:** todo depende del número de fotograma; nada de azar sin semilla.
- **No se cambian las poses aprobadas:** si una animación necesita un parámetro nuevo, se añade con un valor por defecto que no altere los sprites existentes.

### Vee y Marco

Su código sigue en `referencias/codigo/` y no se modifica; sus animaciones están en `mascotas/vee_anim.py` y `mascotas/marco_anim.py`, que lo importan desde ahí. Marco se dibuja **sin contorno blanco** (`OUTLINE = False`), como su sprite aprobado. Marco no tiene boca: cuando habla se enciende bajo sus ojos una rendija de luz del mismo amarillo, que crece con la voz (boca `media` y `abierta`).
