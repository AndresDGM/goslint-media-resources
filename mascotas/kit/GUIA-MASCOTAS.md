# Guía de estilo · Mascotas de Goslint

Goslint es el semillero de programación competitiva e investigación de Ingeniería de Sistemas de la UCEVA (Tuluá, Colombia). Su canal de YouTube enseña desde lógica básica hasta programación competitiva. Cada fase del roadmap tiene una mascota guía:

| Mascota | Fase | Qué es | Movimiento especial |
|---|---|---|---|
| **Lint** | Bienvenida / mascota principal | Cabeza en hexágono como el logo, «L» verde en la cara, cuerpo de terminal | Machetazo («dividir y machetear») |
| **Vee** | Fase 1 · Lógica | Inspirada en la profe Vivian Orejuela, líder de Goslint: pelo castaño largo, camiseta gris de *Regionals* con bloques azul, amarillo y rojo, manos en la cintura | «¡Decisión!»: dibuja un diagrama de flujo en el aire |
| **Marco** | Fase 4 · Competitiva I | Guía de la competitiva básica: cabeza de humo azul con una llama que se mece, ojos amarillos, buzo con capucha y la «L» verde. Flota sin piernas | «¡Compilando!»: se deshace en humo y aparece en otro lugar |

Fases del roadmap, por si la mascota nueva es para otra: 0 Bienvenida · 1 Lógica desde cero · 2 Programación básica (C++, Java, Python) · 3 Estructuras y algoritmos · 4 Competitiva I · 5 Competitiva II (grafos, teoría de números, DP) · 6 Competitiva III (nivel maratón) · 7 Modo maratón.

Las hojas aprobadas están en `referencias/hojas/` y el código de cada una en `referencias/codigo/`. **Míralas antes de diseñar.**

## Reglas fijas

1. **Pixel art dibujado por código** con `motor/pixel.py`. No se dibujan sprites a mano ni se generan imágenes con IA. Cada pose sale de una función `draw(pose)`.
2. **Lienzo de 72 × 64 píxeles lógicos.** Pies en `OY = 50` y centro en `OX = 36`. El personaje mide **unos 33 px de alto**, el mismo alto que Lint y Vee. Si tiene algo que sobresale (llama, orejas, sombrero), el cuerpo mide igual y solo sobresale ese elemento.
3. **Proporciones chibi.**
   - Cabeza grande, de unos 14 px de ancho y 12 a 14 de alto.
   - Torso pequeño: 10 px en los hombros y 7 u 8 de alto.
   - Piernas de 4 px, o lo que las reemplace.
   - La cabeza no puede verse alargada. Si pasa, se acorta la frente o la parte de arriba, **nunca el cuello**.
4. **Brazos de 2 px** con la función `arm()`.
   - Ángulos: 0 colgando, 90 hacia afuera, 180 arriba y negativo hacia adentro.
   - Cuando un brazo cuelga, se dibuja corto (la mano llega a la cadera). `arm()` ya lo hace.
5. **Paleta plana:** un color base y una sombra por material (a veces una luz). Lo ideal son 12 colores o menos. Sin degradados.
6. **SIN contorno blanco.** Las mascotas nuevas no llevan la línea blanca exterior que tienen Lint y Vee. Para que la silueta se lea sobre el fondo negro (`#070807`):
   - usar colores que contrasten con el negro;
   - si una zona oscura se pierde, usar `rim_light()`, una luz de contorno de un solo lado, o un tono un poco más claro en el borde;
   - rellenar los huecos internos con `fill_holes()`.
7. **Ojos:** de 2×2 con un píxel de brillo blanco, salvo que el concepto pida otra cosa (Marco tiene rendijas amarillas). El guiño se hace con un ojo abierto y el otro como **línea recta corta**; nunca se deja un ojo sin dibujar.
8. **Un guiño a Goslint:** el verde `#00C063`, la «L» en el pecho, un portátil, una camiseta de maratón… Que se note que es del mismo universo.
9. **Personaje original.** Si el usuario manda una imagen de referencia, se toma **solo la idea** (por ejemplo, «cabeza de humo con ojos que brillan»). Nunca se copian la silueta, el diseño, los colores exactos ni los rasgos distintivos de un personaje ajeno. No se ponen dentro de la hoja dibujos de terceros, y en la hoja se aclara qué idea se tomó.
10. **Personas reales:** si la mascota se basa en alguien (como Vee), se toman rasgos visibles y respetuosos de las fotos (peinado, ropa, una pose característica) en estilo caricatura amable. Nada que ridiculice.
11. **Animación determinista:** todo movimiento depende de parámetros de la pose (`t`, `bodyDy`, `special`…), nunca de azar sin semilla. El ruido para pelo, humo o fuego sale de `fbm()`.

## Qué debe tener cada mascota

- **Poses (8):** reposo, saludo, señalar, pensar, una con su accesorio, ¡bien!, sorpresa y una más con personalidad (guiño, ups…).
- **Animación en reposo en 4 tiempos:** respirar, flotar, pelo o humo moviéndose.
- **Movimiento especial:** una acción visual que represente una idea del tema de su fase, como el machete de Lint (divide y vencerás) o el diagrama de Vee (decisiones). Se muestra en 3 fotogramas.
- **Nombre y rol:** «guía de…», ligado a la fase.

## Hoja de concepto

Se genera con `hoja/hacer_hoja.py` a partir de un JSON (ver `hoja/ejemplo_config.json`) y de los sprites que exporta la plantilla. El diseño es fijo y el mismo de las hojas de Vee y Marco:

- fondo negro con puntos;
- columna izquierda: la idea, los rasgos y la paleta;
- centro: el nombre en grande, la mascota a 10x y la comparación de escala con Lint, Vee y Marco;
- derecha: el movimiento especial, las poses y la animación.

Textos en español sencillo y natural, con tildes correctas.

## Correcciones frecuentes de versiones anteriores

- Cabeza demasiado larga → se aplana un poco. Se quitan píxeles de la frente, no del cuello.
- Brazos que cuelgan demasiado largos → se acortan solo cuando cuelgan.
- Elementos que salen de la cabeza (llamas, mechones) → **uno solo**, que **nazca ancho y en curva** desde la cabeza y se afine hacia la punta, sin escalón en la unión.
- Ojo «borrado» en el guiño → línea recta corta.
- Las gafas a ese tamaño se ven pesadas: mejor evitarlas, salvo que el usuario las pida.
