# Prompt · Nueva mascota de Goslint

Copia todo lo que está debajo de la línea, rellena los campos `[…]` y pégalo en una conversación nueva junto con este .zip. También puedes adjuntar fotos o imágenes de referencia.

---

Necesito diseñar una **nueva mascota en pixel art** para el canal de YouTube de **Goslint** (semillero de programación competitiva de la UCEVA). Te adjunto `goslint-mascotas-kit.zip`, que trae todo lo necesario.

**Antes de diseñar:**
1. Descomprime el kit y lee completos `GUIA-MASCOTAS.md` y `LEEME.md`.
2. Mira las hojas aprobadas de `referencias/hojas/` (Lint, Vee y Marco) y su código en `referencias/codigo/`. La mascota nueva tiene que sentirse del mismo universo: misma escala, proporciones, tipo de pixel art y estilo de hoja.

**La mascota:**
- **Nombre:** [nombre, o «propón 3 opciones»]
- **Fase o rol en el canal:** [p. ej. «guía de la Fase 2 · Programación básica»]
- **Descripción del personaje:** [cómo es: cabeza, cara, pelo, ropa, cuerpo, colores, personalidad, accesorios, de qué está hecho…]
- **Basada en:** [una persona real con fotos adjuntas / una imagen de referencia adjunta / nada, idea libre]
- **Movimiento especial:** [tu idea, o «propón uno ligado al tema de la fase»]
- **Algo que NO quiero:** [opcional]

**Reglas que no cambian** (están detalladas en la guía):
- Pixel art **dibujado por código** con `motor/pixel.py`, partiendo de `motor/plantilla_mascota.py`. Nada de imágenes generadas por IA ni de dibujo a mano.
- Lienzo de 72×64, pies en y = 50 y unos 33 px de alto, igual que Lint, Vee y Marco. Cabeza grande, cuerpo pequeño y brazos de 2 px.
- **Sin contorno blanco alrededor.** La silueta se separa del fondo negro con contraste y, si hace falta, con luz de contorno.
- Paleta plana corta, un guiño a Goslint (el verde `#00C063` o la «L») y un diseño original. De una referencia ajena solo se toma la idea, nunca el diseño.

**Lo que quiero que me entregues:**
1. Diseña la mascota en un archivo propio (`mascotas/<nombre>.py`) con 8 poses, la animación en reposo en 4 tiempos y 3 fotogramas del movimiento especial.
2. Escribe su `config.json` y genera la **hoja de concepto** con `hoja/hacer_hoja.py`.
3. **Revisa la hoja visualmente antes de mandármela:** que no se encime nada, que la cabeza no se vea alargada, que los brazos no queden largos y que mida lo mismo que las otras en el recuadro de escala.
4. Mándame **solo la imagen de la hoja de concepto** y un resumen corto de las decisiones de diseño. **Sin .zip.**

Yo te diré qué corregir. Haz solo los cambios que te pida, sin rediseñar lo demás, y mándame la hoja corregida cada vez.
