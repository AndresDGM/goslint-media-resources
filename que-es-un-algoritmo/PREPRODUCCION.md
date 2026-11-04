# ¿Qué es un algoritmo? · Documento de preproducción

**GOSLINT · Semillero de programación competitiva · UCEVA**
Fase 1 · Lógica desde cero · Lección 1 (antes de pseudocódigo y diagramas de flujo)

> Etapa: **guion y plan audiovisual para aprobación.** Aquí no hay video, animaciones ni assets. Solo se planifica.

---

## Índice

- [A. Concepto creativo](#a-concepto-creativo)
- [B. Guion literario completo](#b-guion-literario-completo)
- [C. Guion técnico y storyboard](#c-guion-técnico-y-storyboard)
- [D. Dirección de Vee para ElevenLabs](#d-dirección-de-vee-para-elevenlabs)
- [E. Plan de animaciones](#e-plan-de-animaciones)
- [F. Recursos visuales y sonoros](#f-recursos-visuales-y-sonoros)
- [G. Distribución temporal](#g-distribución-temporal)
- [H. Revisión pedagógica](#h-revisión-pedagógica)
- [I. Auditoría de retención audiovisual](#i-auditoría-de-retención-audiovisual)
- [Decisiones pendientes de aprobación](#decisiones-pendientes-de-aprobación)

---

## Nota sobre Vee y el estilo visual

No se inventa nada nuevo de Vee. Todo sale de su referencia aprobada (`mascotas/kit/referencias/codigo/vee.py` y su hoja de concepto):

- Pixel art chibi de unos 33 px de alto, con contorno blanco, sobre el fondo negro de Goslint (`#070807`).
- Pelo castaño largo y camiseta gris de *Regionals* con bloques azul, amarillo y rojo. Su pose de reposo es con las manos en la cintura.
- **Poses que ya existen y que usa este guion:** `idle`, `wave`, `point`, `pointUp`, `think`, `explain` (tarjeta), `draw` (marcador), `teach` (puntero), `cheer`, `shrug`, `wow`, `oops`, `tired`, `coffee` (taza), `wink`, `back`, `walk1-4`.
- **Expresiones que ya existen:** ojos `open / wide / happy / wink / closed / blink` y boca `smile / open / grin / o / flat / wobble`.
- **Movimiento especial:** «¡Decisión!», cuando dibuja un diagrama de flujo en el aire. Se usa **una sola vez**, en la bifurcación del azúcar, como guiño. No se explica el diagrama.

En el storyboard, las poses se escriben así: **[Vee: pose]**.

**Estilo general:** el de la serie (`busqueda-binaria/`). Fondo negro, verde `#00C063` como color de acento, tipografías Inter y JetBrains Mono, pixel art dibujado por código y una capa 2.5D hecha con parallax de planos, cámara virtual y sombras planas. Se renderiza a 1920×1080 y 30 fps.

**El robot ejecutor** es un personaje nuevo y hay que diseñarlo (ver sección E). Nombre de trabajo: **«Bit»** (falta aprobarlo). Debe seguir las reglas del kit: mismo alto que Vee, sin contorno blanco y con un guiño a Goslint. Su rasgo funcional es **una pantalla en el pecho** donde muestra lo que «piensa»: el paso actual, los datos guardados y la confirmación ✓.

---

# A. Concepto creativo

| Campo | Contenido |
|---|---|
| **Nombre del video** | **«¿Qué es un algoritmo? · El robot que no adivinaba»** |
| **Objetivo pedagógico** | Que el estudiante entienda que un algoritmo es una secuencia ordenada y finita de pasos para resolver un problema o hacer una tarea. Que lo reconozca en la vida diaria, que entienda que se puede escribir con más o menos detalle y que ese detalle depende de quién lo ejecuta. Que vea que las instrucciones ambiguas o desordenadas producen resultados inesperados, que las computadoras ejecutan instrucciones según reglas establecidas y que una decisión puede cambiar el camino de la ejecución. |
| **Idea narrativa** | Vee quiere un café con leche y tiene un robot que hace *exactamente* lo que le dicen, ni más ni menos. Cada intento fallido es una lección: la orden suelta («prepara café»), el orden equivocado, la falta de un final y el algoritmo demasiado general que termina en el piso. Al final, el algoritmo bien detallado produce el café perfecto, que incluso se adapta a si queremos azúcar o no. Después se da el salto: una computadora es ese robot. |
| **Mensaje principal** | **«Una computadora no hace lo que queremos; hace lo que le indicamos».** Va acompañado de un matiz: hay sistemas modernos que interpretan con más flexibilidad, pero también funcionan con instrucciones y reglas diseñadas por personas. |
| **Mensaje de cierre** | «Antes de enseñarle a una computadora a resolver un problema, primero debemos aprender a describir cómo resolverlo». |
| **Público objetivo** | Estudiantes que empiezan a programar (primer semestre o semilleros), sin conocimientos previos de programación. |
| **Duración estimada** | **7:30** (450 s). Margen aceptable: 7:00–7:50. |
| **Tono** | Cercano y con humor físico (gags del robot), con explicaciones claras y tranquilas. Comedia de «genio literal» al servicio del concepto. |

---

# B. Guion literario completo

Cada intervención tiene un identificador (**V01, V02…**) que se repite en el storyboard (C) y en la dirección de voz (D). Las acotaciones van en cursiva.

### BLOQUE 1 · Introducción (0:00–0:45)

*Cocina pixelada a oscuras. Se enciende una luz. Un robot pequeño se activa.*

**V01** — Imagina que tienes un robot que hace todo lo que le pides. *Todo.*
**V02** — Y hoy… le vas a pedir un café.
**V03** — ¿Cómo se lo explicarías?
**V04** — *(al robot)* A ver… ¡Robot! Prepara café.

*El robot procesa. En su pantalla aparece: PREPARAR → «prepararse». Hace estiramientos, sentadillas y calienta los brazos.*

**V05** — No, no, no… ¡Prepararte tú no! ¡El café!

*El robot toma la bolsa de café, la levanta como un trofeo y en su pantalla aparece «CAFÉ ✓».*

**V06** — Bueno… técnicamente, eso sí es café.
**V07** — Y el robot no está fallando. Hizo exactamente lo que entendió de mi orden. Si quiero un café de verdad, no me basta con una orden: necesito darle **un algoritmo**.

*Título: ¿QUÉ ES UN ALGORITMO?*

### BLOQUE 2 · Definición (0:45–1:35)

**V08** — Un algoritmo es una **secuencia ordenada y finita de pasos** que permite resolver un problema o realizar una tarea.
**V09** — Suena muy formal, ¿verdad? Vamos por partes.
**V10** — Primero, **los pasos**: cada acción, una por una. Tomar. Verter. Revolver.
**V11** — Esos pasos forman **una secuencia**: van uno detrás de otro, como los vagones de un tren.
**V12** — Y **el orden** importa muchísimo. Mira lo que pasa si el robot vierte el agua… antes de tener la taza.

*Splash de agua sobre la mesa. El robot mira sus manos vacías.*

**V13** — Exacto.
**V14** — Por último, **es finita**: un algoritmo tiene que terminar. Si le digo «revuelve» y nunca le digo cuándo parar…

*El robot revuelve, revuelve, gira sobre sí mismo y se marea.*

**V15** — …¡Ya, ya, para, para!
**V16** — Pasos, en secuencia, en orden y con un final. Eso es un algoritmo.

### BLOQUE 3 · Algoritmos en la vida cotidiana (1:35–2:15)

**V17** — Y aunque la palabra suene a computadoras, tú usas algoritmos todos los días.
**V18** — Cuando sigues una receta: ingredientes, pasos y, al final, el plato servido.
**V19** — Cuando resuelves una suma: primero las unidades, luego las decenas… ¡y no te olvides de lo que llevas!
**V20** — Cuando alguien te explica cómo llegar a un lugar: dos cuadras derecho, giras a la izquierda y llegaste.
**V21** — Incluso una máquina expendedora: eliges el producto, pagas y, si el dinero alcanza… sale tu paquete.
**V22** — Todos tienen pasos ordenados y un final. Ahora sí, volvamos a nuestro café.

### BLOQUE 4 · Primer algoritmo: instrucciones generales (2:15–3:35)

**V23** — Primer intento. Esta vez le doy al robot un algoritmo completo.
**V24** — Tiene un inicio, cuatro pasos y un fin. Se ve razonable, ¿no? Veamos qué hace.

*El robot ejecuta «Leer cantidad de café». En su pantalla aparece «¿CANTIDAD DE CAFÉ?».*

**V25** — Dos cucharadas.

*El robot guarda el dato y ejecuta «Leer cantidad de leche».*

**V26** — Cien mililitros.
**V27** — Muy bien. Hasta aquí, perfecto.

*«Mezclar los ingredientes». El robot mira a su alrededor. No hay taza. Vierte el café y la leche directamente en el piso.*

**V28** — Espera… ¿qué estás…? ¡No, no, no! ¡En el piso no!

*El robot revuelve el charco con un pie, como quien trapea, y después con una hélice que le sale de la mano.*

*«Mostrar resultado». El robot señala orgulloso el desastre. En su pantalla aparece «RESULTADO ✓».*

**V29** — …Gracias. Muy… ilustrativo.
**V30** — Ahora, ojo con esto: **eso sigue siendo un algoritmo.** Tiene pasos, tiene orden y termina.
**V31** — Lo que pasa es que algunos pasos son muy generales. «Mezclar los ingredientes»… ¿dónde? ¿En qué recipiente? ¿Con qué? Y ya que estamos, ¿no faltaba el agua?
**V32** — A una persona quizás le basta con esa instrucción, porque sabe que el café se mezcla en una taza. Pero el robot no sabe lo que tú das por hecho.
**V33** — Un algoritmo puede escribirse con más o con menos detalle. La clave es que ese detalle alcance **para quien lo va a ejecutar.**

### BLOQUE 5 · Segundo algoritmo: mayor precisión (3:35–5:45)

**V34** — Segundo intento. Esta vez vamos a ser mucho más precisos.
**V35** — Paso uno: tomar una taza. Ahora sí, hay dónde servir.
**V36** — Dos cucharadas de café… **en la taza.** Una… y dos.
**V37** — Calentamos doscientos mililitros de agua en la tetera…
**V38** — …y la vertemos en la taza. Sin salpicar, por favor.
**V39** — Y ahora viene algo nuevo: el robot nos va a hacer **una pregunta.**
**V40** — Lo que respondamos va a cambiar lo que hace. Primero, digamos que sí.

*El robot pregunta cuántas cucharadas.*

**V41** — Dos, por favor.
**V42** — Una… dos. Exactamente dos. Ni una más, ni una menos.
**V43** — Pero retrocedamos un momento. ¿Qué habría pasado si respondíamos que **no**?
**V44** — El robot se salta esos pasos y sigue con el resto del algoritmo.
**V45** — Mismo algoritmo, dos caminos distintos. Todo depende de una respuesta.
**V46** — Sigamos con el camino del azúcar. Ahora, cien mililitros de leche.
**V47** — Toma una cuchara y revuelve.
**V48** — Deja la cuchara sobre la mesa. Sí, hasta eso hay que decirlo. Si no, a lo mejor se queda con la cuchara en la mano para siempre.
**V49** — Y, por último… servir el café.
**V50** — *(prueba el café)* Mmm… ¡ahora sí!
**V51** — Fíjate en la diferencia. Los dos son algoritmos, pero el segundo dice **qué** usar, **cuánto**, **dónde** y **en qué orden**.
**V52** — Para este robot, ese era el nivel de detalle necesario. Las instrucciones no tienen que ser larguísimas: tienen que ser lo bastante claras para quien las ejecuta.

### BLOQUE 6 · ¿Cómo ejecuta instrucciones una computadora? (5:45–6:55)

**V53** — Y esto nos lleva a las computadoras, porque una computadora se parece mucho a nuestro robot.
**V54** — Cuando un algoritmo se escribe en un lenguaje que la computadora puede ejecutar, se convierte en **un programa.**
**V55** — La computadora toma la primera instrucción, la ejecuta, pasa a la siguiente… y así, paso a paso, hasta el final.
**V56** — No se salta pasos porque le parezcan obvios, ni completa lo que olvidaste. Sigue las reglas que definieron quienes la programaron.
**V57** — Por eso decimos que una computadora no hace lo que queremos… **hace lo que le indicamos.**
**V58** — Hoy existen sistemas que interpretan lo que escribimos con mucha más flexibilidad. Pero incluso ellos funcionan con instrucciones y reglas que alguien diseñó.
**V59** — Y en los algoritmos vas a ver tres ideas una y otra vez: **secuencias**, pasos uno tras otro; **decisiones**, como la del azúcar; y **repeticiones**, como revolver varias veces.
**V60** — Las veremos con calma en las próximas lecciones.

### BLOQUE 7 · Cierre (6:55–7:30)

**V61** — Repasemos. Un algoritmo es una secuencia ordenada y finita de pasos para resolver un problema.
**V62** — Lo usas todos los días, puede tener más o menos detalle, y ese detalle tiene que ser el adecuado para quien lo ejecuta.
**V63** — Así que recuerda: antes de enseñarle a una computadora a resolver un problema, primero debemos aprender a **describir cómo resolverlo.**
**V64** — ¡Nos vemos en la próxima lección! *(al robot)* Y tú… ¡ni se te ocurra limpiar ese piso sin un algoritmo!

*Pantalla final:* **PRIMERO PENSAMOS LA SOLUCIÓN. / DESPUÉS CONSTRUIMOS EL ALGORITMO.**

---

# C. Guion técnico y storyboard

**Convenciones**

- **Plano:** PG (plano general de la cocina), PM (plano medio de un personaje), PP (primer plano), PD (plano detalle de un objeto) y 2P (los dos personajes).
- **Escenario base:** una cocina pixelada vista de frente, en 3 capas de parallax (pared con repisas, mesa con objetos y piso). Vee siempre está a la izquierda y el robot, a la derecha o detrás de la mesa.
- **Tarjeta de instrucciones:** un panel tipo terminal (fondo `#0E110F`, borde verde y texto en JetBrains Mono). La línea que se ejecuta lleva **un cursor verde ▶** y un brillo; las líneas ya ejecutadas se marcan con ✓ en gris.
- **Pantalla del robot:** muestra iconos o 1-3 palabras, nunca frases largas.
- **Música:** *lo-fi* o *chiptune* suave a 100-110 BPM. Las acciones caen sobre los tiempos de la música para que el ritmo se sienta «coreografiado».

---

## BLOQUE 1 · INTRODUCCIÓN (0:00–0:45 · 45 s)

### Escena 1.1 · «El robot que hace todo» (0:00–0:12)

| Elemento | Descripción |
|---|---|
| Tiempo | 0:00 · 12 s |
| Visual | La cocina está a oscuras y se enciende. El robot despierta. Entra Vee. |
| Cámara | *Push-in* lento desde PG hacia 2P. |
| Audio | Interruptor, zumbido de arranque y la música, que entra en el tiempo 1. |
| Emoción | Curiosidad y expectativa. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 0:00-0:01 | — | Negro con puntos de la textura Goslint. Un foco pixelado parpadea dos veces. | Fija, en PG. | — | *Clic*, *clic* del interruptor. |
| 0:01-0:03 | V01 «Imagina que tienes un robot…» | La luz se enciende y revela la cocina. El robot está apagado y encorvado; su pantalla se enciende con un punto verde. | *Push-in* lento. | — | Zumbido de arranque ascendente. |
| 0:03-0:05 | «…que hace todo lo que le pides.» | El robot se endereza con dos «clics» mecánicos y parpadea (los ojos son su pantalla). | Sigue el *push-in*. | — | *Bip-bip* y la música, que entra. |
| 0:05-0:06 | «*Todo.*» | El robot hace un saludo militar rígido. En su pantalla aparece «LISTO». | Corte rápido a PM del robot. | — | Golpecito metálico. |
| 0:06-0:08 | V02 «Y hoy… le vas a pedir…» | Vee entra caminando desde la izquierda [Vee: walk1-4] y se detiene junto a la mesa. | Paneo a 2P. | — | Pasos suaves. |
| 0:08-0:09 | «…un café.» | Sobre la mesa aparecen uno por uno, con un rebote, la bolsa de café, la jarra de leche y una taza en la repisa del fondo (todavía lejana). | Fija, en 2P. | — | Tres *pop* afinados (do-mi-sol). |
| 0:09-0:11 | V03 «¿Cómo se lo explicarías?» | Vee mira a cámara [Vee: think]. Sobre su cabeza aparece un «?» pixelado que gira. | *Zoom-in* suave a Vee. | — | *Whoosh* corto. |
| 0:11-0:12 | — | El robot imita a Vee y también inclina la cabeza; en su pantalla aparece «?». | Vuelve a 2P. | — | *Bip* interrogativo. |

### Escena 1.2 · «Prepara café» (0:12–0:32)

| Elemento | Descripción |
|---|---|
| Tiempo | 0:12 · 20 s |
| Visual | Vee da una orden suelta y el robot la interpreta de forma literal: primero se «prepara» él y después entrega la bolsa de café. |
| Cámara | Cortes entre 2P y PM del robot, con dos *zoom-punch* cómicos. |
| Audio | La música baja al 50 % durante los gags. |
| Emoción | Humor y sorpresa. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 0:12-0:14 | V04 «A ver… ¡Robot! Prepara café.» | Vee señala al robot [Vee: point]. Sale una burbuja de diálogo hacia él. | 2P. | Burbuja: «PREPARA CAFÉ» | — |
| 0:14-0:15 | — | La burbuja «entra» en la pantalla del robot. Barra de carga ▓▓▓░░. | *Zoom-punch* a la pantalla. | — | *Bip-bip-bip* de procesamiento. |
| 0:15-0:16 | — | En la pantalla aparece «PREPARAR → prepararse» y la palabra subrayada parpadea. | PD de la pantalla. | «PREPARAR → prepararse» | *Ding* de «entendido». |
| 0:16-0:18 | — | El robot estira los brazos hacia arriba, luego hacia los lados y gira el torso. | PM del robot. | — | Chirridos metálicos rítmicos. |
| 0:18-0:20 | — | Hace dos sentadillas exageradas. Su pantalla muestra «2/10». | Sigue en PM. | — | Muelle *boing* en cada sentadilla. |
| 0:20-0:22 | V05 «No, no, no… ¡prepararte tú no!» | Vee agita las manos [Vee: wow, ojos `wide`]. El robot se congela a media sentadilla. | Corte a 2P. | — | La música se corta con un *scratch*. |
| 0:22-0:23 | «¡El café!» | Vee señala la bolsa con insistencia [Vee: point]. Una flecha verde rebota hacia la bolsa. | Paneo rápido hacia la bolsa. | — | *Whoosh*. |
| 0:23-0:25 | — | El robot mira la bolsa, la toma con las dos manos y la sacude un poco. | PM del robot. | — | Crujido de granos. |
| 0:25-0:27 | — | La levanta sobre su cabeza como un trofeo, con brillos alrededor. En su pantalla aparece «CAFÉ ✓». | *Zoom-in* con *tilt-up*. | «CAFÉ ✓» | Fanfarria de 8 bits muy corta. |
| 0:27-0:29 | V06 «Bueno… técnicamente, eso sí es café.» | Vee pone cara plana [Vee: shrug, boca `flat`] y mira a cámara. | Corte a PM de Vee. | — | La música vuelve. |
| 0:29-0:32 | — | El robot todavía sostiene la bolsa en alto, orgulloso, y se balancea de un lado al otro. Vee suspira y sus hombros bajan. | 2P. | — | Pequeño *bip* alegre. |

### Escena 1.3 · «Necesito un algoritmo» + título (0:32–0:45)

| Elemento | Descripción |
|---|---|
| Tiempo | 0:32 · 13 s |
| Visual | Vee le quita importancia al error del robot y plantea el problema. Después entra el título. |
| Cámara | *Pull-back* y transición por *wipe* del título. |
| Audio | La música sube, con un *riser* hacia el título. |
| Emoción | Descubrimiento y entusiasmo moderado. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 0:32-0:34 | V07 «Y el robot no está fallando.» | Vee le da una palmadita al robot [Vee: explain]. El robot baja la bolsa y la deja en la mesa. | 2P. | — | Golpecito metálico. |
| 0:34-0:36 | «Hizo exactamente lo que entendió de mi orden.» | Repetición en miniatura de la burbuja «PREPARA CAFÉ», que se parte en dos piezas: «prepara» → robot estirándose y «café» → bolsa. | Inserto gráfico sobre la escena. | — | *Crack* de vidrio suave. |
| 0:36-0:38 | «Si quiero un café de verdad, no me basta con una orden:» | La burbuja se desvanece. Vee levanta un dedo [Vee: pointUp]. | *Zoom-in* lento a Vee. | — | — |
| 0:38-0:40 | «necesito darle **un algoritmo**.» | De la mano de Vee sale una línea verde que dibuja en el aire una lista de 3 casillas ☐☐☐ apiladas. | Sigue el *zoom*. | — | Trazo de marcador y *riser*. |
| 0:40-0:43 | — | La lista vuela hacia la cámara y se transforma en el título, que se escribe letra por letra con cursor de terminal. | *Wipe* con el título. | **¿QUÉ ES UN ALGORITMO?** | Tecleo rítmico sincronizado con la música. |
| 0:43-0:45 | — | Debajo aparece el logo de Goslint con «Fase 1 · Lógica desde cero». El robot asoma desde abajo del título y saluda. | Fija. | «GOSLINT · Fase 1» | Golpe de bajo y transición. |

---

## BLOQUE 2 · DEFINICIÓN (0:45–1:35 · 50 s)

### Escena 2.1 · La definición (0:45–0:58)

| Elemento | Descripción |
|---|---|
| Tiempo | 0:45 · 13 s |
| Visual | Fondo negro de «pizarra». Vee dibuja la definición con su marcador; solo se escriben y resaltan 4 palabras clave. |
| Cámara | PM de Vee a la izquierda y gráfico a la derecha. |
| Audio | Música más suave y trazos de marcador. |
| Emoción | Claridad y seguridad. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 0:45-0:47 | V08 «Un algoritmo es una…» | Vee entra con el marcador [Vee: draw]. Una línea verde se desliza horizontalmente detrás de ella. | PM. | — | Trazo. |
| 0:47-0:49 | «…**secuencia ordenada y finita de pasos**…» | Al decir cada palabra, aparece un bloque: **SECUENCIA**, **ORDENADA**, **FINITA**, **PASOS**. Cada uno cae con un rebote. | *Truck* lateral suave hacia el texto. | Las 4 palabras | 4 *pop* en el tiempo de la música. |
| 0:49-0:52 | «…que permite resolver un problema…» | A la derecha aparece un icono de un candado con «?» que se abre. | Fija. | — | *Clic* de candado. |
| 0:52-0:54 | «…o realizar una tarea.» | El candado se transforma en una taza humeante. | Fija. | — | Vapor suave. |
| 0:54-0:56 | V09 «Suena muy formal, ¿verdad?» | Vee guiña [Vee: wink]. Las 4 palabras tiemblan como si fueran «rígidas». | Corte a PM de Vee. | — | Pequeño *wobble*. |
| 0:56-0:58 | «Vamos por partes.» | Las palabras se separan en 4 tarjetas que se alinean en fila, cada una con un icono: 👣 pasos, 🚃 secuencia, 1-2-3 orden, 🏁 fin. | *Pull-back*. | — | Barajado de cartas. |

### Escena 2.2 · Pasos y secuencia (0:58–1:08)

| Elemento | Descripción |
|---|---|
| Tiempo | 0:58 · 10 s |
| Visual | Vuelta a la cocina. Cada acción del robot se convierte en un «vagón». |
| Cámara | Paneo lateral que sigue a un tren de vagones. |
| Audio | Traqueteo de tren suave sincronizado con la música. |
| Emoción | Ritmo y claridad. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 0:58-1:00 | V10 «Primero, **los pasos**: cada acción, una por una.» | La tarjeta «PASOS» se agranda y abre la cocina como una puerta (*wipe*). El robot está detrás de la mesa. | *Zoom* a través de la tarjeta. | — | *Whoosh*. |
| 1:00-1:01 | «Tomar.» | El robot toma una taza (acción de 1 tiempo). Encima aparece una mini-tarjeta «Tomar». | 2P. | «Tomar» | *Tic*. |
| 1:01-1:02 | «Verter.» | El robot vierte agua de una jarra; la mini-tarjeta «Verter» se apila a la derecha. | Fija. | «Verter» | Agua corta y *tic*. |
| 1:02-1:03 | «Revolver.» | El robot revuelve una vez y aparece la mini-tarjeta «Revolver». | Fija. | «Revolver» | Cucharita y *tic*. |
| 1:03-1:05 | V11 «Esos pasos forman **una secuencia**…» | Las 3 mini-tarjetas se enganchan entre sí con eslabones y se convierten en vagones de un tren pixelado. | *Pull-back*. | — | *Clank-clank* de enganche. |
| 1:05-1:08 | «…van uno detrás de otro, como los vagones de un tren.» | El tren avanza por la parte inferior de la pantalla. El robot corre detrás y se sube al último vagón. | Paneo que sigue al tren. | — | Traqueteo y silbato breve. |

### Escena 2.3 · Orden: el gag del agua sin taza (1:08–1:19)

| Elemento | Descripción |
|---|---|
| Tiempo | 1:08 · 11 s |
| Visual | Las tarjetas se reordenan mal y el robot vierte el agua sobre la mesa vacía. |
| Cámara | Fija con *zoom-punch* en el splash. |
| Audio | Silencio musical de 0,5 s antes del splash. |
| Emoción | Humor y lección rápida. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 1:08-1:10 | V12 «Y **el orden** importa muchísimo.» | Vee aparece en primer plano a la izquierda [Vee: teach]. La tarjeta «1-2-3» brilla. | 2P. | — | — |
| 1:10-1:12 | «Mira lo que pasa si el robot vierte el agua…» | Vee toca dos mini-tarjetas, que se intercambian en el aire: «Verter agua» queda primero y «Tomar taza», segundo. Las líneas se ponen ámbar. | *Zoom-in* a las tarjetas. | 1. Verter agua · 2. Tomar taza | *Swish* de intercambio. |
| 1:12-1:13 | «…antes de tener la taza.» | El robot levanta la tetera sobre la mesa vacía. Se ve el espacio vacío donde debería estar la taza. | PD de la mesa. | — | La música se detiene. |
| 1:13-1:14 | — | ¡Splash! El agua cae en la mesa y salpica en pixeles azules. | *Zoom-punch* con un leve temblor. | — | *Splash*. |
| 1:14-1:16 | — | El robot pone la taza (paso 2) sobre el charco con mucho cuidado. En su pantalla aparece «✓». | PM del robot. | — | *Tic* de taza y *bip* satisfecho. |
| 1:16-1:17 | V13 «Exacto.» | Vee mira a cámara [Vee: shrug]. | Corte a PM de Vee. | — | — |
| 1:17-1:19 | — | Las tarjetas vuelven a su orden correcto con un *rewind* y el charco desaparece hacia atrás. | 2P. | — | *Rewind* de cinta y la música vuelve. |

### Escena 2.4 · Finito: el robot que no para (1:19–1:35)

| Elemento | Descripción |
|---|---|
| Tiempo | 1:19 · 16 s |
| Visual | El robot revuelve sin fin y se marea. Después, el resumen de los 4 conceptos. |
| Cámara | Rotación leve de cámara para transmitir el mareo. Termina en un plano de resumen. |
| Audio | Loop de cuchara que se acelera. |
| Emoción | Humor y, después, cierre claro. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 1:19-1:21 | V14 «Por último, **es finita**: un algoritmo tiene que terminar.» | La tarjeta 🏁 se ilumina. Vee la toca [Vee: point]. | 2P. | — | Campanita. |
| 1:21-1:23 | «Si le digo "revuelve"…» | Burbuja «REVOLVER» hacia el robot. El robot empieza a revolver la taza. Contador en su pantalla: «1, 2, 3…». | PM del robot. | — | Cucharita rítmica. |
| 1:23-1:25 | «…y nunca le digo cuándo parar…» | El contador sube rápido: «27… 88… 412…». El café gira como un remolino. | *Zoom-in* lento. | — | La cucharita se acelera. |
| 1:25-1:27 | — | El robot entero empieza a girar como un trompo. Su pantalla muestra «∞». | Rotación de cámara de ±5°. | «∞» | Zumbido ascendente. |
| 1:27-1:29 | V15 «…¡Ya, ya, para, para!» | Vee hace gestos de «¡alto!» [Vee: wow]. Ella misma pone la mano sobre la taza. | Corte a 2P. | — | — |
| 1:29-1:31 | — | El robot se detiene, se tambalea y en su pantalla salen espirales; cae sentado. | PM del robot. | — | *Boing* y pajaritos de 8 bits. |
| 1:31-1:33 | V16 «Pasos, en secuencia, en orden y con un final.» | Las 4 tarjetas vuelven al centro y se encienden una por una con cada palabra. | *Pull-back* al plano de resumen. | 👣 · 🚃 · 1-2-3 · 🏁 | 4 notas ascendentes. |
| 1:33-1:35 | «Eso es un algoritmo.» | Las 4 tarjetas se juntan en una sola ficha verde: «ALGORITMO». Vee asiente [Vee: cheer]. | Fija. | «ALGORITMO» | Acorde resolutivo. |

---

## BLOQUE 3 · ALGORITMOS EN LA VIDA COTIDIANA (1:35–2:15 · 40 s)

**Recurso:** la ficha «ALGORITMO» se convierte en un «carrusel» de cuatro viñetas en tiras horizontales. Cada viñeta es un mini-diorama pixelado donde **los pasos se marcan con ✓ uno por uno mientras Vee los nombra**. Vee aparece como «presentadora» en el lateral, cambiando de pose en cada viñeta. Así se rompe el escenario de la cocina sin perder el hilo.

| Elemento | Descripción |
|---|---|
| Tiempo | 1:35 · 40 s |
| Cámara | Desplazamiento horizontal entre viñetas (*slide*) y un *zoom-in* breve en cada una. |
| Audio | La música cambia a una variación más alegre. Hay un SFX característico por viñeta. |
| Emoción | Reconocimiento («¡yo hago eso!») y ritmo ágil. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 1:35-1:37 | V17 «Y aunque la palabra suene a computadoras…» | La ficha «ALGORITMO» se proyecta en un monitor pixelado; Vee lo empuja fuera de cuadro [Vee: point]. | PM de Vee. | — | *Whoosh*. |
| 1:37-1:39 | «…tú usas algoritmos todos los días.» | Detrás de Vee se despliegan 4 marcos vacíos en fila (como tiras de cómic). | *Pull-back*. | — | Desplegado de papel. |
| 1:39-1:41 | V18 «Cuando sigues una receta:» | Marco 1, con *zoom-in*: un libro de recetas se abre sobre un tazón. | *Slide* al marco 1. | 📖 | Hoja de libro. |
| 1:41-1:43 | «ingredientes, pasos…» | Caen huevo, harina y leche al tazón; aparecen ✓ ✓ en la lista lateral del libro. | Fija. | — | *Plop*, *plop*. |
| 1:43-1:45 | «…y, al final, el plato servido.» | Del horno sale una torta que rebota y humea. | *Zoom-punch* suave. | — | *Ding* de horno. |
| 1:45-1:47 | V19 «Cuando resuelves una suma:» | Marco 2: el cuaderno muestra 47 + 38. | *Slide* al marco 2. | 47 + 38 | Lápiz. |
| 1:47-1:49 | «primero las unidades, luego las decenas…» | Se resalta la columna de unidades: 7 + 8 = 15 y se escribe el **5**. Después se resalta la columna de decenas. | *Zoom* a la columna. | — | Tiza. |
| 1:49-1:51 | «…¡y no te olvides de lo que llevas!» | El «1» que se lleva salta como un personajito, casi se cae del cuaderno y Vee lo atrapa y lo pone arriba [Vee: wow → wink]. Resultado: 85. | Fija. | 85 ✓ | *Boing* y *tic*. |
| 1:51-1:53 | V20 «Cuando alguien te explica cómo llegar a un lugar:» | Marco 3: un mapa visto desde arriba con un muñequito y una bandera de destino. | *Slide* al marco 3. | 🏁 | Pájaros y ciudad suave. |
| 1:53-1:55 | «dos cuadras derecho, giras a la izquierda…» | El muñequito avanza dos cuadras (aparecen huellas punteadas) y gira; se marcan ✓ ✓. | Seguimiento del muñequito. | — | Pasos. |
| 1:55-1:56 | «…y llegaste.» | Llega a la bandera, que se iza. | Fija. | — | Mini-fanfarria. |
| 1:56-1:58 | V21 «Incluso una máquina expendedora:» | Marco 4: máquina expendedora pixelada con luces. | *Slide* al marco 4. | — | Zumbido de máquina. |
| 1:58-2:00 | «eliges el producto, pagas…» | Se pulsa el botón «B2» y cae una moneda por la ranura. Aparecen ✓ ✓. | PD de los botones. | — | *Beep* de botón y moneda. |
| 2:00-2:02 | «…y, si el dinero alcanza…» | La pantalla de la máquina parpadea en ámbar: un pequeño «¿?» de comprobación. **Primer adelanto visual de una decisión.** | Fija. | — | Suspenso de 2 notas. |
| 2:02-2:04 | «…sale tu paquete.» | La pantalla se pone en verde. Cae el paquete y el robot aparece desde abajo para atraparlo. | *Zoom-punch*. | ✓ | *Clunk* y *bip* alegre. |
| 2:04-2:08 | V22 «Todos tienen pasos ordenados y un final.» | Los 4 marcos se alejan en fila. Cada uno muestra un 🏁 final que se enciende en cascada. | *Pull-back* amplio. | — | 4 campanitas en cascada. |
| 2:08-2:12 | «Ahora sí, volvamos a nuestro café.» | El robot, con el paquete, salta dentro del marco del café, que no estaba visible y aparece al final de la fila. | *Zoom* rápido hacia ese marco. | — | *Whoosh* largo. |
| 2:12-2:15 | — | Transición: el marco se expande y quedamos dentro de la cocina. El robot deja el paquete a un lado y se pone «firme» frente a la mesa. | Entramos en PG de la cocina. | — | La música de la cocina vuelve. |

---

## BLOQUE 4 · PRIMER ALGORITMO: INSTRUCCIONES GENERALES (2:15–3:35 · 80 s)

### Escena 4.1 · Presentación del algoritmo (2:15–2:27)

| Elemento | Descripción |
|---|---|
| Tiempo | 2:15 · 12 s |
| Visual | Vee le entrega al robot una tarjeta-terminal que se despliega en pantalla. |
| Cámara | 2P con la tarjeta a la derecha (en un tercio del encuadre). |
| Audio | Tecleo al aparecer cada línea. |
| Emoción | Confianza (que luego se va a romper). |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 2:15-2:17 | V23 «Primer intento.» | Claqueta pixelada en el centro: «INTENTO 1». | Fija. | «INTENTO 1» | *Clap* de claqueta. |
| 2:17-2:19 | «Esta vez le doy al robot un algoritmo completo.» | Vee [Vee: explain] le entrega una tarjeta al robot. El robot la «escanea» con un barrido de luz verde. | 2P. | — | *Scan* electrónico. |
| 2:19-2:22 | V24 «Tiene un inicio, cuatro pasos y un fin.» | La tarjeta se proyecta a la derecha. Las líneas aparecen una por una al ritmo de la voz: INICIO, 4 pasos y FIN. INICIO y FIN brillan al nombrarse. | *Truck* hacia la tarjeta. | Algoritmo 1 completo* | Tecleo por línea. |
| 2:22-2:24 | «Se ve razonable, ¿no?» | Vee se cruza de brazos, satisfecha [Vee: idle → smile]. El robot asiente dos veces. | 2P. | — | *Bip-bip*. |
| 2:24-2:27 | «Veamos qué hace.» | El cursor ▶ se coloca en la primera línea. El robot hace crujir los dedos. | *Zoom* leve al robot. | ▶ | Crujido metálico y redoble breve. |

\* Texto del Algoritmo 1 en la tarjeta:

```text
INICIO
    Leer cantidad de café
    Leer cantidad de leche
    Mezclar los ingredientes
    Mostrar resultado
FIN
```

### Escena 4.2 · Leer café y leche (2:27–2:45)

| Elemento | Descripción |
|---|---|
| Tiempo | 2:27 · 18 s |
| Visual | El robot pregunta, Vee responde y el dato se guarda en «cajitas» de memoria en la pantalla del robot. |
| Cámara | Alterna entre PM del robot, PD de la pantalla y 2P. |
| Audio | Un *bip* de pregunta y un *ding* de dato guardado (se reutilizan después). |
| Emoción | Todo va bien. Calma y confianza. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 2:27-2:29 | — | ▶ en «Leer cantidad de café», que se ilumina. El robot gira la cabeza hacia Vee y en su pantalla aparece «¿CANTIDAD DE CAFÉ?». | PM del robot. | «¿CAFÉ?» | *Bip* de pregunta. |
| 2:29-2:31 | V25 «Dos cucharadas.» | Vee levanta dos dedos [Vee: wink]. Del gesto sale un «2» que vuela hacia el robot. | 2P. | — | *Whoosh* corto. |
| 2:31-2:33 | — | El «2» entra en una cajita etiquetada «café» dentro de la pantalla del robot. La línea queda marcada con ✓. | PD de la pantalla. | café: 2 cdas ✓ | *Ding* de guardado. |
| 2:33-2:35 | — | ▶ baja a «Leer cantidad de leche». En la pantalla aparece «¿CANTIDAD DE LECHE?». El robot mira la jarra de leche. | PM del robot. | «¿LECHE?» | *Bip* de pregunta. |
| 2:35-2:37 | V26 «Cien mililitros.» | Vee [Vee: point] señala la jarra. Un «100 ml» viaja hacia el robot. | 2P. | — | *Whoosh*. |
| 2:37-2:39 | — | Se llena la segunda cajita: «leche: 100 ml». La línea queda con ✓. El robot hace un pulgar arriba metálico. | PD de la pantalla. | leche: 100 ml ✓ | *Ding*. |
| 2:39-2:42 | V27 «Muy bien. Hasta aquí, perfecto.» | Vee aplaude dos veces [Vee: cheer]. El robot hace una reverencia pequeña. | 2P. | — | Dos aplausos. |
| 2:42-2:45 | — | ▶ baja a «Mezclar los ingredientes». La línea se ilumina y parpadea un poco más que las otras (anticipación). | *Zoom* lento a la tarjeta y de vuelta al robot. | ▶ Mezclar | Redoble que crece. |

### Escena 4.3 · El gag: mezclar en el piso (2:45–3:05)

| Elemento | Descripción |
|---|---|
| Tiempo | 2:45 · 20 s |
| Visual | El robot busca dónde mezclar, no encuentra nada en las instrucciones y usa el piso. |
| Cámara | 2P; *tilt-down* al piso; PD del charco; *zoom-punch* en las reacciones de Vee. |
| Audio | La música se apaga y entran SFX de comedia. |
| Emoción | Sorpresa, desconcierto y humor (pico cómico del video). |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 2:45-2:47 | — | El robot toma la bolsa de café con una mano y la jarra de leche con la otra. Su pantalla muestra «MEZCLAR: ¿DÓNDE?» y escanea la tarjeta: no hay respuesta. | PM del robot. | «¿DÓNDE?» | *Scan* y *buzz* corto de «no encontrado». |
| 2:47-2:48 | — | Mira a la izquierda, luego a la derecha (la taza sigue en la repisa del fondo, ignorada). Después mira hacia abajo, al piso. | Sigue la mirada. | — | Dos *tic* de giro de cabeza. |
| 2:48-2:49 | — | En su pantalla aparece «SUPERFICIE DISPONIBLE ✓». | PD de la pantalla. | — | *Ding* (el mismo de «guardado», usado como chiste). |
| 2:49-2:50 | V28 «Espera… ¿qué estás…?» | Vee se inclina hacia adelante [Vee: think → wow]. | Corte a PM de Vee. | — | — |
| 2:50-2:52 | «¡No, no, no!» | El robot voltea la bolsa y la jarra a la vez. El café cae en el piso con una nube marrón y la leche, en un chorro blanco. | *Tilt-down* al piso. | — | Granos cayendo y chorro de leche. |
| 2:52-2:53 | «¡En el piso no!» | Charco café con leche en el piso. Vee se tapa la cara [Vee: oops]. | *Zoom-punch* a Vee. | — | *Splat*. |
| 2:53-2:55 | — | El robot pisa el charco y lo revuelve con el pie, en círculos, como si trapeara. | PD del charco. | — | Chapoteo rítmico. |
| 2:55-2:57 | — | De su mano sale una pequeña hélice de batidora que gira y salpica gotas en pixeles. | PD con *zoom* leve. | — | Zumbido de batidora. |
| 2:57-2:59 | — | Una gota salpica la mejilla de Vee. Ella parpadea [Vee: tired, ojos `blink`]. | PP de Vee. | — | *Plic*. |
| 2:59-3:01 | — | ▶ baja a «Mostrar resultado». El robot se detiene, se limpia las manos y endereza la espalda. | Corte a la tarjeta y luego al robot. | ▶ Mostrar | *Bip*. |
| 3:01-3:03 | — | El robot señala el charco con ambos brazos, como un presentador. Aparecen confeti pixelado y un letrero de neón en su pantalla: «RESULTADO ✓». | *Pull-back* a 2P. | «RESULTADO ✓» | Fanfarria de 8 bits (la misma de 0:25). |
| 3:03-3:05 | V29 «…Gracias. Muy… ilustrativo.» | Vee mira a cámara con cara plana [Vee: shrug, boca `flat`]. El robot sigue sonriendo en su pantalla (`^_^`). | PM de Vee y corte rápido al robot. | — | Silencio cómico de 0,5 s y la música vuelve. |

### Escena 4.4 · ¿Qué faltó? (3:05–3:35)

| Elemento | Descripción |
|---|---|
| Tiempo | 3:05 · 30 s |
| Visual | Vee «congela» la escena y analiza la tarjeta. Aparecen etiquetas de preguntas sobre la instrucción general. |
| Cámara | *Freeze frame* de la escena de fondo, que se desatura, y Vee en primer plano. |
| Audio | Música más tranquila y *pops* suaves para cada pregunta. |
| Emoción | Claridad y reflexión. Se valida el algoritmo antes de criticar su detalle. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 3:05-3:07 | V30 «Ahora, ojo con esto:» | Vee chasquea los dedos y la escena de fondo se congela (el robot queda en pose de presentador). Vee [Vee: teach] da un paso al frente. | La cámara pasa a PM de Vee. | — | Chasquido y *freeze* (sonido de pausa). |
| 3:07-3:09 | «**eso sigue siendo un algoritmo.**» | La tarjeta del algoritmo 1 vuela al centro. Le aparece un sello verde: «ALGORITMO ✓». | Fija. | Sello «ALGORITMO ✓» | Sello de goma. |
| 3:09-3:12 | «Tiene pasos, tiene orden y termina.» | Las 3 mini-tarjetas del bloque 2 (👣, 1-2-3, 🏁) se colocan junto a la tarjeta y cada una se enciende. | Fija. | 👣 · 1-2-3 · 🏁 | 3 *tic*. |
| 3:12-3:14 | V31 «Lo que pasa es que algunos pasos son muy generales.» | La línea «Mezclar los ingredientes» se separa de la tarjeta y queda flotando, agrandada. Las demás se atenúan. | *Zoom* a la línea. | — | *Whoosh*. |
| 3:14-3:16 | «"Mezclar los ingredientes"… ¿dónde?» | De la línea sale una etiqueta ámbar: «¿DÓNDE?», con un icono de piso tachado. | Fija. | «¿DÓNDE?» | *Pop*. |
| 3:16-3:17 | «¿En qué recipiente?» | Segunda etiqueta: «¿RECIPIENTE?», con una taza que aparece entre «?». | Fija. | «¿RECIPIENTE?» | *Pop* (más agudo). |
| 3:17-3:18 | «¿Con qué?» | Tercera etiqueta: «¿CON QUÉ?», con una cuchara. | Fija. | «¿CON QUÉ?» | *Pop* (más agudo). |
| 3:18-3:21 | «Y ya que estamos, ¿no faltaba el agua?» | Vee se rasca la cabeza [Vee: think]. Una gota de agua entra rebotando y busca su lugar en la tarjeta, sin encontrarlo. | Fija. | «¿AGUA?» | *Boing* de gota. |
| 3:21-3:24 | V32 «A una persona quizás le basta con esa instrucción, porque sabe que el café se mezcla en una taza.» | A la izquierda aparece una silueta de persona con un «globo de pensamiento» que ya contiene la taza y la cuchara (lo que «se da por hecho»). | *Split* en 2 mitades: persona y robot. | — | Tono cálido. |
| 3:24-3:27 | «Pero el robot no sabe lo que tú das por hecho.» | A la derecha, el robot (descongelado) tiene su globo vacío: solo ve «Mezclar». Pone cara confundida `o_o`. | Sigue el *split*. | — | *Bip* confundido. |
| 3:27-3:30 | V33 «Un algoritmo puede escribirse con más o con menos detalle.» | Aparece un deslizador horizontal: «GENERAL ←→ DETALLADO». Vee arrastra el control de izquierda a derecha [Vee: point]. | El *split* se cierra a un plano del deslizador. | «GENERAL ←→ DETALLADO» | Deslizador. |
| 3:30-3:33 | «La clave es que ese detalle alcance **para quien lo va a ejecutar.**» | El control se detiene en una marca verde con el icono del robot: «nivel necesario para él». | *Zoom* a la marca. | Icono del robot en la marca | *Ding* suave. |
| 3:33-3:35 | — | Transición: el deslizador se convierte en un rodillo de limpieza que barre el charco del piso de la cocina. | *Wipe* horizontal. | — | Trapeado y *whoosh*. |

---

## BLOQUE 5 · SEGUNDO ALGORITMO: MAYOR PRECISIÓN (3:35–5:45 · 130 s)

**Estructura visual del bloque:** la pantalla se divide en **tarjeta a la izquierda (un tercio, con *scroll* automático) y escena a la derecha (dos tercios)**. Vee entra y sale del encuadre según el momento. Cada línea que se ejecuta queda con ✓ y el cursor ▶ siempre señala la línea activa.

Texto de la tarjeta (redacción ajustada; la intención es la misma que la del original):

```text
INICIO
    Tomar una taza y ponerla sobre la mesa.
    Agregar dos cucharadas de café a la taza.
    Calentar 200 ml de agua en la tetera.
    Verter el agua caliente en la taza.
    Preguntar: "¿Desea agregar azúcar?"
    SI la respuesta es "Sí" ENTONCES
        Preguntar: "¿Cuántas cucharadas de azúcar?"
        Leer cantidad de azúcar.
        Agregar esa cantidad de azúcar a la taza.
    FIN SI
    Agregar 100 ml de leche a la taza.
    Tomar una cuchara.
    Revolver el contenido de la taza.
    Dejar la cuchara sobre la mesa.
    Servir el café.
FIN
```

> Cambios de redacción: «y ponerla sobre la mesa» (el robot lo hace en pantalla) y «en la tetera» (hace explícito el recipiente; este algoritmo existe justamente para eliminar ese tipo de ambigüedad). «La cantidad indicada» se cambió por «esa cantidad», que es más natural.

### Escena 5.1 · Intento 2: taza y café (3:35–3:58)

| Elemento | Descripción |
|---|---|
| Tiempo | 3:35 · 23 s |
| Visual | Presentación de la tarjeta larga y primeros pasos (taza y café), con todas las sub-acciones descritas en la sección 6.3 del encargo. |
| Cámara | Primero la tarjeta en plano completo y después el *layout* de un tercio y dos tercios. Planos detalle en la cuchara. |
| Audio | Música con más pulso (la misma base y un *hi-hat*). SFX de cada objeto. |
| Emoción | Confianza renovada. Precisión. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 3:35-3:37 | V34 «Segundo intento.» | Claqueta: «INTENTO 2». La cocina está limpia y el robot tiene un pequeño delantal (opcional, a aprobar). | Fija. | «INTENTO 2» | *Clap*. |
| 3:37-3:39 | «Esta vez vamos a ser mucho más precisos.» | Vee [Vee: explain] le entrega una tarjeta que se desenrolla hacia abajo como un pergamino largo. El robot la mira de arriba abajo; su pantalla muestra `O_O`. | 2P con *tilt* que sigue al pergamino. | Tarjeta del Algoritmo 2 | Pergamino y *bip* impresionado. |
| 3:39-3:41 | — | El pergamino se transforma en la tarjeta-terminal del tercio izquierdo y la escena se reacomoda a la derecha. ▶ en INICIO. | Transición de *layout*. | — | *Swoosh* y *tic*. |
| 3:41-3:43 | V35 «Paso uno: tomar una taza.» | ▶ en la línea 1. El robot camina hacia la repisa, se estira y toma la taza. | Paneo con el robot. | ▶ L1 | Pasos metálicos. |
| 3:43-3:45 | «Ahora sí, hay dónde servir.» | La deja sobre la mesa con un *tic* exacto y la taza rebota apenas. ✓ en L1. Vee asiente [Vee: smile]. | Fija en la mesa. | ✓ L1 | *Tic* de cerámica. |
| 3:45-3:46 | V36 «Dos cucharadas de café…» | ▶ en L2. El robot mira el frasco de café (*highlight* del contorno). | PM. | ▶ L2 | *Bip*. |
| 3:46-3:47 | — | Toma una cuchara del cajón. | PD de la mano. | — | Cubiertos. |
| 3:47-3:48 | «…**en la taza.**» | Vee remarca «en la taza» con el dedo [Vee: pointUp]. En la tarjeta, «a la taza» se subraya en verde. | Inserto rápido a la tarjeta. | Subrayado | *Tic*. |
| 3:48-3:50 | «Una…» | Mete la cuchara en el frasco, saca café y lo deposita en la taza. Contador sobre la taza: «1». | PD de la taza. | 1 | Arena de café. |
| 3:50-3:52 | «…y dos.» | Repite la acción, más rápido. Contador: «2». ✓ en L2. | PD. | 2 ✓ | Arena de café y *ding*. |
| 3:52-3:55 | — | El robot sopla la cuchara y la deja a un lado. Vee hace un gesto de aprobación. | 2P. | — | *Fff* y *tic*. |
| 3:55-3:58 | — | ▶ baja a L3. El robot gira hacia la estufa, donde aparece la tetera. | Paneo hacia la estufa. | ▶ L3 | *Whoosh*. |

### Escena 5.2 · Agua caliente y vertido (3:58–4:13)

| Elemento | Descripción |
|---|---|
| Tiempo | 3:58 · 15 s |
| Visual | Medición, calentamiento y vertido. |
| Cámara | PD de la jarra medidora, de la tetera y del chorro; 2P. |
| Audio | Agua, hornilla, silbido de tetera y vertido. |
| Emoción | Ritmo de «cocina profesional». |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 3:58-4:00 | V37 «Calentamos doscientos mililitros de agua…» | El robot llena una jarra medidora; el nivel sube hasta la marca «200». | PD de la jarra. | 200 ml | Agua del grifo. |
| 4:00-4:02 | «…en la tetera…» | Vierte la jarra en la tetera y la pone sobre la hornilla. La llama se enciende. | PM. | — | Vertido y encendido. |
| 4:02-4:04 | — | Mini *time-lapse*: la tetera tiembla, sale vapor y un termómetro pixelado sube. | *Zoom* lento a la tetera. | 🌡️ | La tetera empieza a sonar. |
| 4:04-4:05 | — | ¡Silbido! La tapa salta un poco. ✓ en L3. | *Zoom-punch*. | ✓ L3 | Silbido corto. |
| 4:05-4:07 | V38 «…y la vertemos en la taza.» | ▶ en L4. El robot toma la tetera y vierte con precisión. El chorro cae justo en la taza y el café se oscurece. | PD de la taza. | ▶ L4 | Vertido. |
| 4:07-4:09 | «Sin salpicar, por favor.» | Vee pone las manos para frenar [Vee: oops a medias], por precaución. El robot vierte con tanto cuidado que saca la lengua (un pixel rosa en su pantalla). | 2P. | — | — |
| 4:09-4:11 | — | La taza se llena hasta la mitad; el robot corta el chorro en seco. ✓ en L4. | PD. | ✓ L4 | *Ding*. |
| 4:11-4:13 | — | Vee suspira aliviada. ▶ baja a «Preguntar: ¿Desea agregar azúcar?», que brilla con un color distinto (azul). | Corte a la tarjeta. | ▶ L5 | Tono nuevo, más agudo. |

### Escena 5.3 · La pregunta: ¿azúcar? (4:13–4:25)

| Elemento | Descripción |
|---|---|
| Tiempo | 4:13 · 12 s |
| Visual | El robot proyecta una interfaz con dos botones: SÍ y NO. |
| Cámara | 2P, con la interfaz flotando entre los dos personajes. |
| Audio | Sonido de «interfaz» (aparición holográfica). |
| Emoción | Novedad y curiosidad. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 4:13-4:15 | V39 «Y ahora viene algo nuevo:» | Vee se acerca con interés [Vee: wow, moderado]. | 2P. | — | — |
| 4:15-4:17 | «el robot nos va a hacer **una pregunta.**» | De la pantalla del robot sale una interfaz flotante: «¿DESEA AGREGAR AZÚCAR?», con el azucarero en el centro. | *Zoom-in* a la interfaz. | «¿DESEA AGREGAR AZÚCAR?» | Holograma. |
| 4:17-4:19 | — | Aparecen dos botones: **SÍ** (verde) y **NO** (gris). Laten suavemente. | Fija. | SÍ · NO | Dos notas. |
| 4:19-4:21 | V40 «Lo que respondamos va a cambiar lo que hace.» | En la tarjeta, el bloque «SI… FIN SI» se ilumina con un marco azul. Del bloque salen **dos flechitas**: una entra al bloque y otra lo rodea. | Inserto rápido a la tarjeta. | — | *Whoosh* doble. |
| 4:21-4:23 | «Primero, digamos que sí.» | Vee estira el dedo hacia **SÍ** [Vee: point]. | PD del botón. | — | — |
| 4:23-4:25 | — | Toca el botón, que se hunde y destella en verde. Una etiqueta «CAMINO A» aparece en la esquina superior. | *Zoom-punch* suave. | «CAMINO A: SÍ» | *Clic* de botón y *ding*. |

### Escena 5.4 · Camino A: dos cucharadas de azúcar (4:25–4:41)

| Elemento | Descripción |
|---|---|
| Tiempo | 4:25 · 16 s |
| Visual | La pregunta de cantidad, la respuesta y las dos cucharadas exactas. |
| Cámara | PM, PD de la taza y 2P. |
| Audio | Reutiliza *bip* de pregunta, *ding* de guardado y la arena (en una versión más fina para el azúcar). |
| Emoción | Satisfacción por la precisión, con un toque de humor. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 4:25-4:27 | — | ▶ entra en el bloque, en «¿Cuántas cucharadas de azúcar?». En la interfaz aparece un teclado numérico pixelado. | PM del robot. | «¿CUÁNTAS?» | *Bip* de pregunta. |
| 4:27-4:29 | V41 «Dos, por favor.» | Vee teclea «2» [Vee: point] y luego hace el gesto de dos dedos. | PD del teclado. | 2 | Tecla. |
| 4:29-4:30 | — | En la pantalla del robot se guarda «azúcar: 2». ✓ en «Leer cantidad». | PD de la pantalla. | azúcar: 2 ✓ | *Ding*. |
| 4:30-4:32 | V42 «Una…» | El robot toma el azucarero y una cucharadita. Cae la primera cucharada en la taza. Contador: «1». | PD de la taza. | 1 | Azúcar fina. |
| 4:32-4:34 | «…dos.» | Cae la segunda. Contador: «2». | PD. | 2 | Azúcar fina. |
| 4:34-4:36 | «Exactamente dos.» | El robot va a meter la cuchara una tercera vez… se detiene en seco a centímetros de la taza; su pantalla compara «2 = 2» y la retira. | PP de la cuchara. | «2 = 2 ✓» | Freno en seco y *tic*. |
| 4:36-4:38 | «Ni una más, ni una menos.» | Vee hace un gesto de chef satisfecha [Vee: wink]. ✓ en «Agregar esa cantidad». | 2P. | ✓ | — |
| 4:38-4:41 | — | ▶ llega a «FIN SI». En la esquina, «CAMINO A» parpadea. Todo se congela con un efecto de «pausa» (líneas de VHS). | La imagen se congela. | ❚❚ | Sonido de pausa de cinta. |

### Escena 5.5 · Camino B: ¿y si dijéramos que no? (4:41–5:00)

| Elemento | Descripción |
|---|---|
| Tiempo | 4:41 · 19 s |
| Visual | *Rewind* hasta la pregunta y repetición acelerada (x2) del camino NO. Al final, un *split screen* que compara los dos caminos. |
| Cámara | *Rewind* con distorsión VHS y después *split* vertical. |
| Audio | *Rewind* de cinta y la música en *pitch* más alto durante la repetición acelerada. |
| Emoción | Descubrimiento. Entusiasmo moderado. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 4:41-4:43 | V43 «Pero retrocedamos un momento.» | Vee sale del congelado [Vee: pointUp] y gira el dedo hacia atrás. La escena retrocede: el azúcar sale de la taza hacia el azucarero y el ✓ se borra. | *Rewind* (líneas VHS). | ◀◀ | *Rewind*. |
| 4:43-4:46 | «¿Qué habría pasado si respondíamos que **no**?» | Volvemos a la interfaz SÍ/NO. Vee toca **NO**. La etiqueta de la esquina cambia a «CAMINO B: NO» (gris y azul). | PD de los botones. | «CAMINO B: NO» | *Clic* (tono más grave). |
| 4:46-4:49 | V44 «El robot se salta esos pasos…» | En la tarjeta, las 3 líneas del bloque SI se atenúan y una flecha curva azul **las rodea**. El robot, en la escena, mira el azucarero, le dice adiós con la mano y lo aparta. | *Split*: tarjeta y escena. | Flecha que rodea | *Whoosh* curvo. |
| 4:49-4:51 | «…y sigue con el resto del algoritmo.» | ▶ salta directamente a «Agregar 100 ml de leche». Repetición acelerada (x2): el robot agrega leche y revuelve. Arriba se ve el indicador «x2». | Escena acelerada. | «x2» | Música acelerada. |
| 4:51-4:54 | V45 «Mismo algoritmo, dos caminos distintos.» | La pantalla se divide en dos: a la izquierda, el CAMINO A (taza con 2 terrones de azúcar sobre ella, como un icono) y a la derecha, el CAMINO B (taza sin azúcar). Las dos tarjetas muestran los ✓ en líneas distintas. | *Split* vertical. | A: SÍ · B: NO | Dos notas en armonía. |
| 4:54-4:57 | «Todo depende de una respuesta.» | Entre las dos mitades, Vee hace su **movimiento especial «¡Decisión!»**: dibuja en el aire, con el marcador, un pequeño rombo con dos salidas que se conectan a cada mitad [Vee: draw]. Es solo un guiño visual, sin texto ni explicación. | Plano central. | — | Trazo de marcador y destello. |
| 4:57-5:00 | — | El rombo se desvanece. La mitad B se desliza fuera y la mitad A se expande: volvemos al CAMINO A en el punto «FIN SI». | Transición de *slide*. | «CAMINO A» | *Swoosh*. |

### Escena 5.6 · Leche, cuchara, revolver, dejar (5:00–5:22)

| Elemento | Descripción |
|---|---|
| Tiempo | 5:00 · 22 s |
| Visual | Ejecución de los últimos pasos con su mini-gag (la cuchara). |
| Cámara | PD de la taza, PM del robot y 2P. |
| Audio | Leche, cucharita (un tiempo por vuelta) y *tic* sobre la mesa. |
| Emoción | Ritmo de «casi lo logramos». Humor suave. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 5:00-5:02 | V46 «Sigamos con el camino del azúcar.» | La música vuelve a su tempo normal. ▶ en «Agregar 100 ml de leche». | 2P. | ▶ | — |
| 5:02-5:04 | «Ahora, cien mililitros de leche.» | El robot mide la leche en la jarra medidora (nivel en «100») y la vierte. El café pasa de oscuro a color café con leche, en un degradado en pasos de pixel. | PD de la taza. | 100 ml ✓ | Vertido de leche. |
| 5:04-5:06 | V47 «Toma una cuchara…» | ▶ baja. El robot abre el cajón y saca una cuchara, que brilla. | PD del cajón. | ✓ | Cubiertos. |
| 5:06-5:09 | «…y revuelve.» | Revuelve dentro de la taza, 3 vueltas visibles (un contador pequeño: 1, 2, 3). Aparece un remolino suave. | PD. | ✓ | Cucharita x3. |
| 5:09-5:11 | V48 «Deja la cuchara sobre la mesa.» | ▶ en «Dejar la cuchara». El robot deja la cuchara sobre la mesa con un *tic*. | PD de la mesa. | ✓ | *Tic*. |
| 5:11-5:14 | «Sí, hasta eso hay que decirlo.» | Vee [Vee: teach] señala la línea en la tarjeta. | Inserto de la tarjeta. | — | — |
| 5:14-5:18 | «Si no, a lo mejor se queda con la cuchara en la mano para siempre.» | Mini-*flash forward* en una burbuja de pensamiento, en sepia: el robot en el sofá, de noche, en el cine y dormido, siempre con la cuchara en la mano. | Burbuja sobre la cabeza de Vee. | — | *Tic-toc* de reloj y un ronquido metálico. |
| 5:18-5:20 | — | La burbuja explota y Vee se ríe [Vee: grin / happy]. El robot mira su mano vacía, aliviado. | 2P. | — | *Pop*. |
| 5:20-5:22 | — | ▶ baja a «Servir el café». El robot alisa su delantal y se prepara para servir. | Corte a la tarjeta y al robot. | ▶ Servir | Redoble corto. |

### Escena 5.7 · Servir y comparar (5:22–5:45)

| Elemento | Descripción |
|---|---|
| Tiempo | 5:22 · 23 s |
| Visual | El robot sirve, Vee prueba el café (pose `coffee`, que ya existe) y se comparan los dos algoritmos lado a lado. |
| Cámara | 2P, *push-in* a Vee y luego *split* comparativo. |
| Audio | Fanfarria «buena» (versión cálida de la del gag) y música de logro. |
| Emoción | Satisfacción y entusiasmo moderado. Después, claridad. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 5:22-5:24 | V49 «Y, por último… servir el café.» | El robot empuja la taza humeante hacia Vee con una reverencia. ✓ en «Servir». ▶ en FIN. | 2P. | ✓ · FIN | Deslizamiento de taza. |
| 5:24-5:26 | — | Vee toma la taza [Vee: coffee] y sopla. Sube vapor en espiral. | *Push-in* a Vee. | — | Soplido suave. |
| 5:26-5:28 | V50 «Mmm… ¡ahora sí!» | Vee bebe y sonríe [Vee: coffee, ojos `happy`]. Sobre ella aparecen brillos verdes. El robot salta de alegría. | 2P. | — | Fanfarria cálida. |
| 5:28-5:30 | — | En la tarjeta, todas las líneas tienen ✓ y la tarjeta entera parpadea en verde una vez. | Inserto. | Todo ✓ | Acorde. |
| 5:30-5:33 | V51 «Fíjate en la diferencia. Los dos son algoritmos…» | *Split* lado a lado: a la izquierda, la tarjeta 1 (con el charco de fondo) y a la derecha, la tarjeta 2 (con la taza de fondo). Las dos llevan el sello «ALGORITMO ✓». | *Split* vertical. | Sello en las dos | Dos sellos. |
| 5:33-5:35 | «…pero el segundo dice **qué** usar…» | En la tarjeta 2 se resaltan «taza», «cuchara» y «tetera» con la etiqueta **QUÉ**. | *Zoom* leve a la tarjeta 2. | QUÉ | *Pop*. |
| 5:35-5:36 | «…**cuánto**…» | Se resaltan «dos cucharadas», «200 ml» y «100 ml» con la etiqueta **CUÁNTO**. | Fija. | CUÁNTO | *Pop*. |
| 5:36-5:37 | «…**dónde**…» | Se resaltan «a la taza», «en la tetera» y «sobre la mesa» con la etiqueta **DÓNDE**. | Fija. | DÓNDE | *Pop*. |
| 5:37-5:38 | «…y **en qué orden**.» | Al margen de la tarjeta 2 aparecen números 1, 2, 3… en cascada. Etiqueta **ORDEN**. | Fija. | ORDEN | Cascada. |
| 5:38-5:41 | V52 «Para este robot, ese era el nivel de detalle necesario.» | Vuelve el deslizador «GENERAL ←→ DETALLADO» del bloque 4: la tarjeta 1 queda a la izquierda y la tarjeta 2, exactamente en la marca del robot. | *Pull-back*. | Deslizador | *Ding*. |
| 5:41-5:45 | «Las instrucciones no tienen que ser larguísimas: tienen que ser lo bastante claras para quien las ejecuta.» | Vee [Vee: explain] sostiene su taza. Junto a la marca del robot aparecen otros dos iconos en posiciones distintas del deslizador: una persona (más a la izquierda) y una computadora (más a la derecha, con un «?»). La computadora brilla y sirve de transición. | *Zoom* hacia el icono de la computadora. | — | *Riser* hacia el bloque 6. |

---

## BLOQUE 6 · ¿CÓMO EJECUTA INSTRUCCIONES UNA COMPUTADORA? (5:45–6:55 · 70 s)

**Recurso visual:** el robot «se convierte» en una computadora. Su pantalla de pecho se expande hasta llenar el encuadre y se vuelve el monitor de un PC pixelado. Es la misma idea con otra forma. Dentro hay un panel de instrucciones genéricas (de la tarea del café, para no adelantar sintaxis) con un **contador de programa ▶** que baja línea por línea.

| Elemento | Descripción |
|---|---|
| Tiempo | 5:45 · 70 s |
| Cámara | *Zoom* a través de la pantalla del robot; planos del monitor; *pull-back* para mostrar a Vee frente al PC. |
| Audio | La música pasa a una variante más «electrónica» (los mismos acordes con sintetizador). Hay un *tic* de reloj de CPU en cada paso. |
| Emoción | Conexión («¡ah, es lo mismo!») y seguridad. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 5:45-5:47 | V53 «Y esto nos lleva a las computadoras…» | El icono de la computadora del deslizador vuela hacia el robot. La pantalla del robot se agranda. | *Zoom* a la pantalla del robot. | — | *Whoosh* digital. |
| 5:47-5:50 | «…porque una computadora se parece mucho a nuestro robot.» | Atravesamos la pantalla: aparece un PC pixelado con la carcasa verde de Goslint. Vee aparece a su lado. El robot, pequeñito, en el escritorio, saluda al PC como a un «primo». | *Pull-back* a 2P (Vee y PC). | — | Arranque de PC (*beep* POST). |
| 5:50-5:52 | V54 «Cuando un algoritmo se escribe en un lenguaje que la computadora puede ejecutar…» | La tarjeta 2 del café sale del bolsillo del robot y entra en el PC por una ranura, como si fuera un disquete. | PD de la ranura. | — | Inserción. |
| 5:52-5:55 | «…se convierte en **un programa.**» | La tarjeta se «traduce»: sus palabras se descomponen en pixeles y se reorganizan en el monitor como líneas de terminal (texto genérico, **no** código de un lenguaje concreto). En la parte superior se lee «programa». | *Zoom* al monitor. | «ALGORITMO → PROGRAMA» | Pixeles y *ding*. |
| 5:55-5:57 | V55 «La computadora toma la primera instrucción…» | ▶ en la línea 1, que se ilumina. Un pulso verde recorre la línea. | PD del monitor. | ▶ L1 | *Tic* de CPU. |
| 5:57-5:58 | «…la ejecuta…» | Junto a la línea aparece ✓ y, en una esquina, un mini-icono de taza que aparece. | Fija. | ✓ | *Tic*. |
| 5:58-6:00 | «…pasa a la siguiente…» | ▶ baja a L2 → ✓, L3 → ✓. Cada paso dura un tiempo de la música. | Fija. | ✓ ✓ | *Tic*, *tic*. |
| 6:00-6:03 | «…y así, paso a paso, hasta el final.» | El ritmo se acelera: ▶ baja por las demás líneas hasta FIN y todo queda en verde. Una barra de progreso llega al 100 %. | *Tilt-down* que acompaña. | 100 % | *Tic* acelerado y campana. |
| 6:03-6:06 | V56 «No se salta pasos porque le parezcan obvios…» | Vee [Vee: teach] señala una línea (por ejemplo, «Tomar una taza»). Una mano fantasma intenta tacharla («es obvio»), pero la línea brilla y la tachadura rebota. | Fija. | — | *Bonk* de rebote. |
| 6:06-6:09 | «…ni completa lo que olvidaste.» | Recuerdo rápido (*flashback*) del algoritmo 1 en el monitor: el PC lo ejecuta y en la esquina aparece la misma animación del charco, en pequeño. El robot se tapa la pantalla, avergonzado. | Inserto *flashback* con borde sepia. | — | Eco del chapoteo. |
| 6:09-6:12 | «Sigue las reglas que definieron quienes la programaron.» | Alrededor del monitor aparecen siluetas de programadores con portátiles (siluetas genéricas en verde) conectadas con líneas al PC. | *Pull-back*. | — | Teclados suaves. |
| 6:12-6:14 | V57 «Por eso decimos que una computadora no hace lo que queremos…» | La pantalla se oscurece y queda solo el monitor. Aparece una burbuja de pensamiento «☕ perfecto» que rebota contra el monitor y no entra. | *Push-in* lento. | — | Música en *low-pass*. |
| 6:14-6:18 | «…**hace lo que le indicamos.**» | Una tarjeta con instrucciones sí entra en el monitor. Aparece la frase central, escrita con el cursor de terminal y en dos líneas. Vee, a un lado [Vee: explain], asiente. | Fija con un leve *breathing* de la cámara. | **NO HACE LO QUE QUEREMOS. HACE LO QUE LE INDICAMOS.** | Tecleo y golpe de bajo en la última palabra. |
| 6:18-6:21 | — | La frase se mantiene 3 s (es el momento clave). Durante ese tiempo, el cursor parpadea al final, el subrayado verde se dibuja bajo «INDICAMOS» y Vee cruza los brazos [Vee: idle]. | Fija. | (la misma) | La música vuelve sola. |
| 6:21-6:24 | V58 «Hoy existen sistemas que interpretan lo que escribimos con mucha más flexibilidad.» | La frase se desplaza hacia arriba. Aparece un icono de un asistente/chat genérico (una burbuja con puntos «…»), que «entiende» una frase desordenada y la reordena. | *Truck* lateral. | — | Burbujas de chat. |
| 6:24-6:28 | «Pero incluso ellos funcionan con instrucciones y reglas que alguien diseñó.» | Se levanta la carcasa del icono como una tapa y, por dentro, se ven engranajes y líneas de instrucciones, con las mismas siluetas de programadores. | *Zoom* al interior. | — | Engranajes. |
| 6:28-6:31 | V59 «Y en los algoritmos vas a ver tres ideas una y otra vez:» | Vuelve la cocina, en un plano general. Arriba se despliegan tres casillas vacías. | Transición de vuelta a la cocina. | — | *Whoosh*. |
| 6:31-6:34 | «**secuencias**, pasos uno tras otro;» | Casilla 1: el tren de vagones del bloque 2 pasa en miniatura. | *Zoom* a la casilla 1. | SECUENCIA | Traqueteo breve. |
| 6:34-6:37 | «**decisiones**, como la del azúcar;» | Casilla 2: los botones SÍ/NO con las dos flechitas. | *Zoom* a la casilla 2. | DECISIÓN | Dos notas. |
| 6:37-6:41 | «y **repeticiones**, como revolver varias veces.» | Casilla 3: la cuchara gira 3 veces con el contador «1, 2, 3» y se detiene (un guiño al gag del bloque 2, ahora con final). | *Zoom* a la casilla 3. | REPETICIÓN | Cucharita x3 y *ding*. |
| 6:41-6:45 | V60 «Las veremos con calma en las próximas lecciones.» | Las 3 casillas se cierran como sobres, cada una con un sello «PRÓXIMAMENTE». Vee guiña [Vee: wink]. | *Pull-back*. | «PRÓXIMAMENTE» | Tres sellos. |
| 6:45-6:50 | — | El robot sale del PC de vuelta a la cocina (por la pantalla, en reversa). Trapea los últimos restos del charco con orgullo. | Transición inversa (desde la pantalla hacia afuera). | — | *Whoosh* inverso y trapeado. |
| 6:50-6:55 | — | Vee se acerca al centro. La luz cambia a un tono cálido de atardecer (es el cierre). La música baja a una versión suave. | *Push-in* a 2P. | — | Transición musical. |

> Nota: entre 6:45 y 6:55 hay 10 s sin voz. Son un respiro necesario antes del cierre y tienen acción continua (el robot trapea y Vee camina). Si hace falta recortar duración, este es el primer segmento que se puede comprimir a 4 s (ver la sección I).

---

## BLOQUE 7 · CIERRE (6:55–7:30 · 35 s)

| Elemento | Descripción |
|---|---|
| Tiempo | 6:55 · 35 s |
| Visual | El resumen se arma con los objetos de la historia y después vienen la frase final y la pantalla final. |
| Cámara | 2P, *push-in* final y fundido. |
| Audio | La música sube hacia el final y termina con un acorde y el logo. |
| Emoción | Seguridad y tono motivador. |

| Tiempo | Narración | Acción visual / animación | Cámara | Texto | Audio |
|---|---|---|---|---|---|
| 6:55-6:57 | V61 «Repasemos.» | Vee [Vee: explain]. El robot se pone en posición de «firmes». | 2P. | — | — |
| 6:57-7:00 | «Un algoritmo es una secuencia ordenada y finita de pasos…» | Las 4 tarjetas del bloque 2 (👣 🚃 1-2-3 🏁) vuelan desde fuera de cuadro y se colocan junto a Vee. | Fija. | — | 4 *pop*. |
| 7:00-7:02 | «…para resolver un problema.» | Se juntan otra vez en la ficha «ALGORITMO». | Fija. | ALGORITMO | Acorde. |
| 7:02-7:04 | V62 «Lo usas todos los días…» | Pasan en miniatura las 4 viñetas del bloque 3 (receta, suma, mapa y máquina). | *Truck*. | — | Carrusel. |
| 7:04-7:06 | «…puede tener más o menos detalle…» | Aparece el deslizador «GENERAL ←→ DETALLADO» con la tarjeta 1 y la tarjeta 2. | Fija. | — | Deslizador. |
| 7:06-7:09 | «…y ese detalle tiene que ser el adecuado para quien lo ejecuta.» | El control se detiene en la marca del robot. El robot levanta la mano, como diciendo «ese soy yo». | Fija. | — | *Ding*. |
| 7:09-7:12 | V63 «Así que recuerda: antes de enseñarle a una computadora a resolver un problema…» | Los gráficos se van. Vee mira a cámara [Vee: idle]. *Push-in* lento. | *Push-in* a PM de Vee. | — | La música baja. |
| 7:12-7:16 | «…primero debemos aprender a **describir cómo resolverlo.**» | Vee dibuja una línea verde en el aire [Vee: draw]. La línea forma una lista de 3 casillas ☐☐☐ (la misma del título), que se marcan ✓ ✓ ✓. | Fija. | ✓ ✓ ✓ | Trazo y 3 *tic*. |
| 7:16-7:19 | V64 «¡Nos vemos en la próxima lección!» | Vee saluda [Vee: wave]. El robot la imita. | 2P. | — | — |
| 7:19-7:22 | «Y tú… ¡ni se te ocurra limpiar ese piso sin un algoritmo!» | Vee se gira hacia el robot y lo señala [Vee: point]. El robot, que ya tenía el trapeador en la mano, lo esconde detrás de la espalda y su pantalla muestra `^_^;`. | Corte rápido a PM del robot. | — | *Bip* nervioso. |
| 7:22-7:26 | — | Fundido a negro con puntos. Aparece la frase final, escrita con el cursor de terminal: primera línea en blanco y segunda en verde. | Fija. | **PRIMERO PENSAMOS LA SOLUCIÓN.** / **DESPUÉS CONSTRUIMOS EL ALGORITMO.** | Tecleo y acorde final. |
| 7:26-7:28 | — | Debajo aparece el logo de Goslint con «Próxima lección: Pseudocódigo» (a confirmar). El robot pasa por abajo, de izquierda a derecha, con una taza en una bandeja. | Fija. | GOSLINT · UCEVA | *Bip* final. |
| 7:28-7:30 | — | El logo late una vez y se funde a negro. | Fundido. | — | Cola musical. |

---

# D. Dirección de Vee para ElevenLabs

**Configuración recomendada**

- **Modelo:** *Eleven v3*, por sus etiquetas de audio entre corchetes. Si se usa *Multilingual v2*, hay que quitar las etiquetas y usar `<break time="0.5s" />` para las pausas (ver la nota al final).
- **Voz:** femenina, joven adulta, español latinoamericano neutro (colombiano suave, idealmente), cálida, con sonrisa en la voz. Hay que elegirla en la biblioteca o diseñarla y aprobarla antes de generar.
- **Parámetros base:** *Stability* «Natural» (≈ 0.5), *Similarity* ≈ 0.75, *Style* bajo (≈ 0.2) y *Speaker boost* activado. En los gags se puede bajar *Stability* a «Creative» solo para esas líneas.
- **Velocidad general:** ≈ 150 palabras/min en las explicaciones y ≈ 165 en introducciones y gags.
- **Generación:** una toma por intervención (V01-V64), exportada en WAV 48 kHz y nombrada `VEE_Vxx_tomaN.wav`. Las pausas largas entre líneas las controla la edición, no la voz.
- **Regla de mesura:** como máximo una etiqueta emocional por frase. Las etiquetas van en inglés, porque es lo que el modelo reconoce mejor; el texto va en español.
- Las **negritas** del guion literario son **énfasis**: no se escriben en el texto para ElevenLabs. El énfasis se consigue con la etiqueta o con la posición en la frase, y en v3 a veces sirve escribir la palabra en MAYÚSCULAS (se indica cuando conviene).

Leyenda: **Int.** = intensidad (1 baja – 5 alta). **Ritmo**: lento / medio / ágil.

### Bloque 1 · Introducción

| ID | Texto para ElevenLabs | Emoción | Intención | Int. | Ritmo | Pausas | Énfasis |
|---|---|---|---|---|---|---|---|
| V01 | `[curious] Imagina que tienes un robot que hace todo lo que le pides... TODO.` | Curiosidad | Enganchar con una premisa intrigante. | 3 | Medio | Pausa de 0,6 s antes de «TODO». | «TODO», dicho más bajo y misterioso. |
| V02 | `Y hoy... le vas a pedir un café.` | Complicidad | Plantear la misión. | 2 | Medio | Suspensión tras «hoy». | «café» con una sonrisa. |
| V03 | `[curious] ¿Cómo se lo explicarías?` | Pregunta genuina | Interpelar al espectador. | 3 | Lento | — | «explicarías». |
| V04 | `A ver... [excited] ¡Robot! Prepara café.` | Entusiasmo | Dar la orden con confianza. | 3 | Ágil | Breve tras «A ver». | «¡Robot!» proyectado, como llamando. |
| V05 | `[surprised] No, no, no... ¡prepararte TÚ no! ¡El café!` | Sorpresa y risa contenida | Corregir con humor. | 4 | Ágil | Los «no» en ráfaga. | «TÚ», «café». |
| V06 | `[sighs] Bueno... técnicamente, eso sí es café.` | Resignación divertida | Remate cómico. | 2 | Lento | Pausa tras «Bueno». | «técnicamente», con ironía suave. |
| V07 | `Y el robot no está fallando. Hizo exactamente lo que entendió de mi orden. Si quiero un café de verdad, no me basta con una orden... necesito darle un algoritmo.` | Descubrimiento | Plantear el problema del video. | 3 | Medio | Pausa de 0,5 s antes de «necesito». | «exactamente», «un algoritmo» (ligera subida). |

### Bloque 2 · Definición

| ID | Texto para ElevenLabs | Emoción | Intención | Int. | Ritmo | Pausas | Énfasis |
|---|---|---|---|---|---|---|---|
| V08 | `Un algoritmo es una secuencia ordenada y finita de pasos, que permite resolver un problema o realizar una tarea.` | Seguridad | Dar la definición formal con calma. | 2 | Lento | Micro-pausas entre «secuencia», «ordenada», «finita» y «pasos». | Las 4 palabras clave, con el mismo peso. |
| V09 | `[playfully] Suena muy formal, ¿verdad? Vamos por partes.` | Cercanía | Bajar la tensión. | 2 | Medio | Breve tras «¿verdad?». | «por partes». |
| V10 | `Primero, los pasos: cada acción, una por una. Tomar. Verter. Revolver.` | Claridad | Definir «pasos». | 2 | Medio y luego staccato | 0,4 s entre los tres verbos (van con las acciones del robot). | Los tres verbos, cortos. |
| V11 | `Esos pasos forman una secuencia: van uno detrás de otro, como los vagones de un tren.` | Claridad | Dar una imagen concreta. | 2 | Medio | Tras «secuencia». | «uno detrás de otro». |
| V12 | `Y el orden importa muchísimo. Mira lo que pasa si el robot vierte el agua... antes de tener la taza.` | Anticipación pícara | Preparar el gag. | 3 | Medio y luego lento | Suspensión de 0,6 s antes de «antes». | «muchísimo», «antes». |
| V13 | `[deadpan] Exacto.` | Ironía seca | Remate. | 2 | Lento | — | — |
| V14 | `Por último, es finita: un algoritmo tiene que terminar. Si le digo "revuelve"... y nunca le digo cuándo parar...` | Claridad que se vuelve suspenso | Preparar el gag del bucle. | 3 | Medio | Dos suspensiones (tras «revuelve» y al final). | «terminar», «nunca». |
| V15 | `[laughs] ¡Ya, ya, para, para!` | Risa y alarma | Reacción cómica. | 4 | Ágil | — | «para» repetido. |
| V16 | `Pasos, en secuencia, en orden y con un final. Eso es un algoritmo.` | Satisfacción | Consolidar la definición. | 3 | Medio | 0,3 s entre los elementos. | «Eso es un algoritmo». |

### Bloque 3 · Vida cotidiana

| ID | Texto para ElevenLabs | Emoción | Intención | Int. | Ritmo | Pausas | Énfasis |
|---|---|---|---|---|---|---|---|
| V17 | `Y aunque la palabra suene a computadoras, tú usas algoritmos todos los días.` | Revelación amable | Acercar el concepto. | 3 | Medio | Tras «computadoras». | «tú», «todos los días». |
| V18 | `Cuando sigues una receta: ingredientes, pasos y, al final, el plato servido.` | Calidez | Primer ejemplo. | 2 | Ágil | — | «el plato servido». |
| V19 | `Cuando resuelves una suma: primero las unidades, luego las decenas... [playfully] ¡y no te olvides de lo que llevas!` | Complicidad | Ejemplo con un guiño. | 3 | Ágil | Breve antes del remate. | «lo que llevas». |
| V20 | `Cuando alguien te explica cómo llegar a un lugar: dos cuadras derecho, giras a la izquierda... y llegaste.` | Naturalidad | Ejemplo cotidiano. | 2 | Ágil | Antes de «y llegaste». | «llegaste». |
| V21 | `Incluso una máquina expendedora: eliges el producto, pagas y, si el dinero alcanza... sale tu paquete.` | Suspenso ligero | Sembrar la idea de decisión (sin nombrarla). | 3 | Ágil | Suspensión tras «alcanza». | «si el dinero alcanza». |
| V22 | `Todos tienen pasos ordenados y un final. [excited] Ahora sí, volvamos a nuestro café.` | Entusiasmo | Transición de vuelta. | 3 | Medio | Tras «final». | «Ahora sí». |

### Bloque 4 · Primer algoritmo

| ID | Texto para ElevenLabs | Emoción | Intención | Int. | Ritmo | Pausas | Énfasis |
|---|---|---|---|---|---|---|---|
| V23 | `Primer intento. Esta vez le doy al robot un algoritmo completo.` | Confianza | Abrir el experimento. | 3 | Medio | Tras «Primer intento». | «completo». |
| V24 | `Tiene un inicio, cuatro pasos y un fin. Se ve razonable, ¿no? Veamos qué hace.` | Confianza ingenua | Preparar la caída. | 2 | Medio | Breve tras «¿no?». | «razonable». |
| V25 | `Dos cucharadas.` | Amabilidad | Responder al robot. | 2 | Medio | — | «Dos». |
| V26 | `Cien mililitros.` | Amabilidad | Responder al robot. | 2 | Medio | — | — |
| V27 | `Muy bien. Hasta aquí, perfecto.` | Satisfacción | Calma antes del gag. | 2 | Medio | Tras «Muy bien». | «perfecto». |
| V28 | `Espera... ¿qué estás...? [surprised] ¡No, no, no! ¡En el piso no!` | Desconcierto que pasa a alarma | Pico cómico. | 4 | Lento y luego ágil | Suspensión cortada tras «estás». | «piso». |
| V29 | `[sighs] ...Gracias. Muy... ilustrativo.` | Ironía resignada | Remate del gag. | 2 | Lento | 0,5 s antes de «ilustrativo». | «ilustrativo». |
| V30 | `Ahora, ojo con esto: eso SIGUE siendo un algoritmo. Tiene pasos, tiene orden y termina.` | Seguridad | Aclarar el malentendido clave. | 3 | Medio | Tras «ojo con esto». | «SIGUE». |
| V31 | `Lo que pasa es que algunos pasos son muy generales. "Mezclar los ingredientes"... ¿dónde? ¿En qué recipiente? ¿Con qué? [curious] Y ya que estamos... ¿no faltaba el agua?` | Análisis curioso | Señalar lo que falta. | 3 | Medio con preguntas ágiles | 0,4 s entre preguntas. | «¿dónde?», «el agua». |
| V32 | `A una persona quizás le basta con esa instrucción, porque sabe que el café se mezcla en una taza. Pero el robot no sabe lo que tú das por hecho.` | Claridad empática | Contraste entre persona y máquina. | 2 | Medio | Tras «taza». | «das por hecho». |
| V33 | `Un algoritmo puede escribirse con más o con menos detalle. La clave es que ese detalle alcance para quien lo va a ejecutar.` | Seguridad | Idea pedagógica central del bloque. | 3 | Lento | Tras «detalle». | «para quien lo va a ejecutar». |

### Bloque 5 · Segundo algoritmo

| ID | Texto para ElevenLabs | Emoción | Intención | Int. | Ritmo | Pausas | Énfasis |
|---|---|---|---|---|---|---|---|
| V34 | `[excited] Segundo intento. Esta vez vamos a ser mucho más precisos.` | Determinación | Nuevo comienzo. | 3 | Medio | Tras «intento». | «mucho más precisos». |
| V35 | `Paso uno: tomar una taza. Ahora sí, hay dónde servir.` | Alivio con humor | Contraste con el gag. | 2 | Medio | — | «Ahora sí». |
| V36 | `Dos cucharadas de café... en la taza. Una... y dos.` | Precisión juguetona | Acompañar la acción. | 2 | Lento | 0,5 s antes de «en la taza» y 0,8 s entre «Una» y «y dos». | «en la taza». |
| V37 | `Calentamos doscientos mililitros de agua en la tetera...` | Naturalidad | Narrar la acción. | 2 | Medio | Suspensión al final. | — |
| V38 | `...y la vertemos en la taza. [playfully] Sin salpicar, por favor.` | Humor suave | Callback del splash. | 2 | Medio | Antes de «Sin salpicar». | «por favor». |
| V39 | `Y ahora viene algo nuevo: el robot nos va a hacer una pregunta.` | Curiosidad | Introducir la decisión. | 3 | Medio | Tras «nuevo». | «una pregunta». |
| V40 | `Lo que respondamos va a cambiar lo que hace. Primero, digamos que sí.` | Expectativa | Explicar el efecto de la respuesta. | 3 | Medio | Tras «hace». | «cambiar», «sí». |
| V41 | `Dos, por favor.` | Amabilidad | Responder. | 2 | Medio | — | — |
| V42 | `Una... dos. Exactamente dos. Ni una más, ni una menos.` | Satisfacción precisa | Mostrar la exactitud. | 2 | Lento y luego medio | 0,6 s entre «Una» y «dos». | «Exactamente». |
| V43 | `Pero retrocedamos un momento. [curious] ¿Qué habría pasado si respondíamos que NO?` | Curiosidad | Abrir el camino B. | 3 | Medio | Tras «momento». | «NO». |
| V44 | `El robot se salta esos pasos y sigue con el resto del algoritmo.` | Claridad | Explicar el salto. | 2 | Medio | — | «se salta». |
| V45 | `Mismo algoritmo, dos caminos distintos. Todo depende de una respuesta.` | Descubrimiento moderado | Idea clave del bloque. | 3 | Lento | 0,4 s tras «distintos». | «dos caminos», «una respuesta». |
| V46 | `Sigamos con el camino del azúcar. Ahora, cien mililitros de leche.` | Naturalidad | Retomar. | 2 | Medio | — | — |
| V47 | `Toma una cuchara... y revuelve.` | Naturalidad | Acompañar la acción. | 2 | Medio | Breve tras «cuchara». | — |
| V48 | `Deja la cuchara sobre la mesa. Sí, hasta eso hay que decirlo. [laughs softly] Si no, a lo mejor se queda con la cuchara en la mano para siempre.` | Humor | Mostrar que lo «obvio» también se instruye. | 3 | Medio | Tras «decirlo». | «hasta eso», «para siempre». |
| V49 | `Y, por último... servir el café.` | Expectativa | Cierre de la ejecución. | 2 | Lento | Tras «último». | «servir». |
| V50 | `Mmm... [happy] ¡ahora sí!` | Placer genuino | Recompensa. | 3 | Lento y luego ágil | Saborear el «Mmm» (0,8 s). | «¡ahora sí!». |
| V51 | `Fíjate en la diferencia. Los dos son algoritmos, pero el segundo dice qué usar, cuánto, dónde... y en qué orden.` | Claridad | Comparar. | 3 | Medio con staccato al final | 0,3 s entre «qué», «cuánto» y «dónde». | Las 4 palabras. |
| V52 | `Para este robot, ese era el nivel de detalle necesario. Las instrucciones no tienen que ser larguísimas: tienen que ser lo bastante claras para quien las ejecuta.` | Seguridad | Generalizar la lección. | 3 | Lento | Tras «larguísimas». | «claras», «para quien las ejecuta». |

### Bloque 6 · La computadora

| ID | Texto para ElevenLabs | Emoción | Intención | Int. | Ritmo | Pausas | Énfasis |
|---|---|---|---|---|---|---|---|
| V53 | `Y esto nos lleva a las computadoras, porque una computadora se parece mucho a nuestro robot.` | Conexión entusiasta | Puente narrativo. | 3 | Medio | Tras «computadoras». | «se parece mucho». |
| V54 | `Cuando un algoritmo se escribe en un lenguaje que la computadora puede ejecutar, se convierte en un programa.` | Claridad | Distinguir algoritmo y programa. | 2 | Lento | Tras «ejecutar». | «un programa». |
| V55 | `La computadora toma la primera instrucción, la ejecuta, pasa a la siguiente... y así, paso a paso, hasta el final.` | Ritmo didáctico | Describir la ejecución secuencial. | 2 | Medio y acelerando | Sincronizar cada coma con el cursor ▶. | «paso a paso». |
| V56 | `No se salta pasos porque le parezcan obvios, ni completa lo que olvidaste. Sigue las reglas que definieron quienes la programaron.` | Firmeza amable | Idea de literalidad. | 3 | Medio | Tras «olvidaste». | «obvios», «olvidaste», «reglas». |
| V57 | `Por eso decimos que una computadora no hace lo que queremos... hace lo que le indicamos.` | Seguridad | **Mensaje central.** | 3 | Lento | 0,7 s antes de «hace lo que le indicamos». | «queremos» / «indicamos» (contraste). |
| V58 | `Hoy existen sistemas que interpretan lo que escribimos con mucha más flexibilidad. Pero incluso ellos funcionan con instrucciones y reglas que alguien diseñó.` | Matiz sereno | Evitar una afirmación absoluta. | 2 | Medio | Tras «flexibilidad». | «incluso ellos», «alguien diseñó». |
| V59 | `Y en los algoritmos vas a ver tres ideas una y otra vez: secuencias, pasos uno tras otro; decisiones, como la del azúcar; y repeticiones, como revolver varias veces.` | Entusiasmo moderado | Adelanto breve. | 3 | Medio | 0,4 s entre las tres ideas. | «secuencias», «decisiones», «repeticiones». |
| V60 | `[warmly] Las veremos con calma en las próximas lecciones.` | Calidez | Tranquilizar y cerrar el bloque. | 2 | Lento | — | «con calma». |

### Bloque 7 · Cierre

| ID | Texto para ElevenLabs | Emoción | Intención | Int. | Ritmo | Pausas | Énfasis |
|---|---|---|---|---|---|---|---|
| V61 | `Repasemos. Un algoritmo es una secuencia ordenada y finita de pasos para resolver un problema.` | Seguridad | Resumen. | 2 | Medio | Tras «Repasemos». | «ordenada y finita». |
| V62 | `Lo usas todos los días, puede tener más o menos detalle, y ese detalle tiene que ser el adecuado para quien lo ejecuta.` | Claridad | Resumen. | 2 | Medio | Comas marcadas. | «el adecuado». |
| V63 | `Así que recuerda: antes de enseñarle a una computadora a resolver un problema... primero debemos aprender a describir cómo resolverlo.` | Motivación serena | **Frase final.** | 3 | Lento | 0,6 s tras «problema». | «describir cómo resolverlo». |
| V64 | `[excited] ¡Nos vemos en la próxima lección! [playfully] Y tú... ¡ni se te ocurra limpiar ese piso sin un algoritmo!` | Alegría y humor | Despedida con *callback*. | 3 | Ágil | 0,4 s tras «Y tú». | «sin un algoritmo». |

**Nota para Multilingual v2 (sin etiquetas):** quitar los `[tag]` y sustituir «...» por `<break time="0.5s" />` donde la tabla pide una pausa de 0,5 s o más. Para la emoción, conviene escribir la línea anterior como contexto (*previous_text*) y elegir la mejor de 2-3 tomas.

---

# E. Plan de animaciones

### Personajes

| Elemento | Animaciones | Reutilizable | Específica |
|---|---|---|---|
| **Vee** (existente, `vee.py`) | Las 21 poses ya definidas, *idle* de respiración en 4 tiempos y *walk1-4*. Se necesitan **transiciones de pose** (interpolar ángulos `upF/loF/upB/loB` en 4-6 fotogramas), **lip-sync simple** (alternar boca `smile/open/o` con la amplitud del audio) y **parpadeo** periódico. | Todas las poses y el *lip-sync* se reutilizan en todo el video. | Movimiento especial «¡Decisión!» (dibujar el rombo, 4:54). Gota en la mejilla (2:57) como superposición. Pose `coffee` soplando y bebiendo (superposición de vapor). |
| **Robot «Bit»** (nuevo) | Necesita un diseño nuevo con el kit (`motor/pixel.py`, lienzo de 72×64, ≈ 33 px de alto). Poses: apagado o encorvado, *idle*, caminar (4), tomar con una mano o con dos, verter (brazo inclinado), revolver (brazo en círculo, 4 fotogramas), sentadilla y estiramiento (2 + 2), saludo militar, reverencia, presentador (brazos abiertos), sostener algo en alto (trofeo), girar como trompo (4), sentado y mareado, esconder el trapeador. **Pantalla del pecho** como capa aparte (iconos, texto corto, caras `^_^`, `O_O`, `o_o`, `^_^;`, contador). | Caminar, tomar, verter, revolver, *idle* y la pantalla. | Estiramientos o sentadillas, trompo, mareo, hélice de batidora, trapear con el pie y lengua (pixel). |

### Objetos

| Elemento | Animaciones | Reutilizable | Específica |
|---|---|---|---|
| **Taza** | Aparecer, ser tomada, posarse (rebote) y **estados de llenado** (vacía → café en polvo → café negro → con azúcar → con leche). Vapor en espiral. | Estados de llenado y vapor. | Deslizarse hacia Vee (5:22). |
| **Café (bolsa o frasco)** | Rebote al aparecer, ser sacudido, levantado como trofeo y volteado (vertido al piso). Cucharadas de polvo. | Partícula de «cucharada» (también para el azúcar). | Nube de café cayendo al piso. |
| **Leche (jarra)** | Aparecer, verter al piso y verter en la taza. Medición «100 ml». | Vertido (comparte sistema con el agua). | Chorro al piso. |
| **Azúcar (azucarero)** | Aparecer en la interfaz, ser apartado («adiós») y cucharaditas. | Partícula de cucharada (con un color distinto). | Freno en seco de la tercera cucharada. |
| **Cuchara** | Salir del cajón, recoger, depositar, revolver (circular) y dejar sobre la mesa. | Recoger, depositar y revolver (en 4 escenas). | Aparecer en el *flash-forward* (sofá, cine, cama). |
| **Tetera** | Llenarse, posarse en la hornilla, temblar, soltar vapor, silbar con la tapa que salta y verter. | Vertido. | Silbido y tapa. |
| **Jarra medidora** | Nivel que sube hasta una marca. | Para el agua (200) y la leche (100). | — |
| **Mesa y cocina** | Parallax de 3 capas, iluminación (apagada, normal y atardecer) y charcos (aparecer, *rewind* y barrido). | El escenario base de todo el video. | Charco del piso; splash en la mesa. |
| **Interfaz de decisión** | Holograma que sale de la pantalla del robot, botones SÍ/NO que laten, se hunden y destellan, y teclado numérico. | Botones (5.3, 5.5 y 6). | Teclado numérico. |
| **Tarjeta-terminal de instrucciones** | Aparición línea por línea (tecleo), cursor ▶ que baja, ✓ por línea, atenuado de líneas, resaltado de palabras con etiqueta, *scroll* automático, sello «ALGORITMO ✓», flecha que rodea un bloque y transformación en pergamino. | **Es el componente más reutilizado** (bloques 4, 5, 6 y 7). Conviene programarlo una sola vez con parámetros. | Pergamino; «traducción» a programa (5:52). |
| **Mini-tarjetas de conceptos** (👣 🚃 1-2-3 🏁) | Caer, alinearse, encenderse, intercambiarse, engancharse (tren) y fusionarse en la ficha «ALGORITMO». | Bloques 2, 4 y 7. | Tren. |
| **Deslizador GENERAL ↔ DETALLADO** | Aparecer, control arrastrable, marcas con iconos y transformación en rodillo. | Bloques 4, 5 y 7. | Rodillo. |
| **Viñetas del bloque 3** | 4 mini-dioramas con 2-3 acciones cada uno y ✓ en una lista. | Componente «viñeta con checklist». | El «1» que se lleva y salta. |
| **PC pixelado** | Arranque, ranura, monitor con terminal, siluetas de programadores e icono de asistente que «se abre». | — | Todo es propio del bloque 6. |
| **Texto de título y frases clave** | Escritura con cursor de terminal y subrayado verde dibujado. | Título, frase central y pantalla final. | — |

### Efectos y transiciones reutilizables

*Push-in* y *pull-back* suaves, *zoom-punch* (110 % en 4 fotogramas y regreso), temblor leve, *freeze* con desaturación, *rewind* VHS, *split* vertical, *wipe* por objeto, rotación de cámara de ±5°, burbuja de pensamiento, confeti pixelado, brillos, espirales de mareo, partículas de vapor, gotas y polvo.

---

# F. Recursos visuales y sonoros

### Personajes
- **Vee:** existe (`mascotas/kit/referencias/codigo/vee.py`). Hay que exportar las poses en tiras y en la escala del video.
- **Robot ejecutor «Bit»:** **hay que crearlo** con el kit de mascotas (hoja de concepto, 8 poses mínimas y las poses extra de la sección E). Requiere aprobación del diseño.
- **Siluetas genéricas:** persona pensando (4.4) y programadores con portátil (bloque 6), en un solo color.

### Objetos (pixel art por código)
Taza (5 estados), bolsa de café, frasco de café, jarra de leche, azucarero, cuchara, cucharita, tetera, jarra medidora, hornilla con llama, cajón, trapeador, delantal del robot (opcional), libro de recetas, tazón, torta, huevo, harina, cuaderno con lápiz, mapa con muñequito y bandera, máquina expendedora con moneda y paquete, PC pixelado con ranura, icono de asistente o chat, termómetro, claqueta y disquete o tarjeta.

### Fondos
1. Cocina en 3 capas (pared con repisa, mesa y estufa, piso), con 3 variantes de luz.
2. «Pizarra» negra con la textura de puntos de Goslint (bloque 2).
3. Carrusel con 4 marcos (bloque 3).
4. Escritorio con el PC (bloque 6).
5. Negro con puntos para el título y la pantalla final.

### Elementos gráficos
Tarjeta-terminal (componente), cursor ▶, ✓, sello «ALGORITMO ✓», etiquetas ámbar de pregunta, etiquetas QUÉ / CUÁNTO / DÓNDE / ORDEN, mini-tarjetas de conceptos con iconos, deslizador con marcas e iconos, interfaz SÍ/NO con teclado, indicador «CAMINO A / CAMINO B», indicador «x2», símbolo de pausa ❚❚ y de *rewind* ◀◀, barra de progreso, contador de cucharadas, casillas SECUENCIA / DECISIÓN / REPETICIÓN con sello «PRÓXIMAMENTE», título y logotipo (`busqueda-binaria/public/brand/`).

### Efectos visuales
Partículas de vapor, de polvo (café y azúcar), de líquido (agua y leche), splash, confeti, brillos, espirales, pajaritos de mareo, superposición VHS, *freeze* desaturado, *flash-forward* en sepia y destello en botones.

### Música
- **Tema principal:** *lo-fi* o *chiptune* suave a 100-110 BPM, con estructura modular (intro, base, variación alegre, versión electrónica y versión suave de cierre). Puede **sintetizarse por código**, como en los videos anteriores de la serie, o conseguirse con licencia libre (por ejemplo, CC0 o una biblioteca sin regalías).
- **Stingers:** *riser* hacia el título y hacia el bloque 6, acorde resolutivo, fanfarria de 8 bits (en versión «orgullosa» y en versión «cálida») y cola final.

### Efectos de sonido
Interruptor, arranque del robot, *bip* (de pregunta, de alegría, nervioso, confundido e interrogativo), *ding* de dato guardado, *buzz* de «no encontrado», *scan*, chirridos y golpes metálicos, *boing*, *scratch*, *whoosh* (corto, largo, digital y curvo), *pop* afinados, tecleo, trazo de marcador, sello de goma, *clic* de botón y de candado, cartas, papel, pergamino, granos de café, arena de café, azúcar fina, chorro de leche, vertido de agua, grifo, *splash*, *splat*, chapoteo, batidora, *plic*, cerámica, cubiertos, cucharita en taza, hornilla, tetera (tiembla y silba), soplido, aplausos, pasos (de Vee y metálicos), tren (traqueteo y silbato), horno, lápiz, tiza, pájaros y ciudad, máquina expendedora (zumbido, moneda y *clunk*), *rewind* y pausa de cinta, *beep* de arranque de PC, disquete, *tic* de CPU, engranajes, burbujas de chat, reloj, ronquido metálico y pajaritos de 8 bits.

### Voz
64 intervenciones de Vee (sección D). Opcional: «voz» del robot hecha **solo con *bips* sintetizados**, sin texto hablado, para no competir con la narración.

---

# G. Distribución temporal

| Bloque | Inicio | Fin | Duración | Palabras de narración (aprox.) | Contenido |
|---|---|---|---|---|---|
| 1 · Introducción | 0:00 | 0:45 | 45 s | 95 | Premisa, gag «prepárate» y título |
| 2 · Definición | 0:45 | 1:35 | 50 s | 125 | Definición; pasos, secuencia, orden y fin, con 2 gags |
| 3 · Vida cotidiana | 1:35 | 2:15 | 40 s | 95 | 4 ejemplos breves |
| 4 · Algoritmo general | 2:15 | 3:35 | 80 s | 175 | Ejecución, gag del piso y análisis del nivel de detalle |
| 5 · Algoritmo preciso | 3:35 | 5:45 | 130 s | 255 | Ejecución completa, 2 caminos y comparación |
| 6 · La computadora | 5:45 | 6:55 | 70 s | 165 | Programa, ejecución paso a paso, frase central, matiz y adelanto |
| 7 · Cierre | 6:55 | 7:30 | 35 s | 85 | Resumen, frase final y pantalla final |
| **Total** | | | **450 s = 7:30** ✅ | **≈ 1.000** | Dentro del rango de 6-8 min |

**Comprobación de la densidad:** 1.000 palabras a unas 150 palabras/min dan ≈ 6:40 de voz. Los ≈ 50 s restantes son **acción narrada visualmente**: gags (agua, trompo, piso y cuchara), el *rewind* del azúcar, la pausa de 3 s sobre la frase central y las transiciones con acción. No hay pausas artificiales: cada silencio tiene una acción descrita en el storyboard. Si la voz generada sale más rápida, el margen hasta 6:00 es amplio. Si sale más lenta, el video llega a ≈ 7:50, que sigue dentro del rango.

---

# H. Revisión pedagógica

| Criterio | Estado | Dónde se cumple / observación |
|---|---|---|
| La definición es correcta | ✅ | V08: «secuencia ordenada y finita de pasos que permite resolver un problema o realizar una tarea». Se repite en V16 y V61. Cada término se ilustra (2.2-2.4). |
| Se entiende que hay distintos niveles de detalle | ✅ | V33 y V52, con el **deslizador GENERAL ↔ DETALLADO** (que aparece 3 veces) y las marcas por ejecutor (persona, robot y computadora). |
| Una instrucción general no deja de ser algoritmo | ✅ | V30 y el sello «ALGORITMO ✓» en la tarjeta 1. En 5.7 **las dos tarjetas** llevan el sello. El problema se presenta como «detalle insuficiente para este ejecutor», no como «algoritmo incorrecto». |
| No se confunde algoritmo con programa | ✅ | V54: un programa es un algoritmo escrito en un lenguaje que la computadora puede ejecutar. La animación lo «traduce» sin mostrar sintaxis real. Antes del bloque 6 nunca se dice «programa». |
| Se entiende la importancia del orden | ✅ | Gag del agua sin taza (2.3) y etiqueta ORDEN en la comparación (5.7). |
| Se entiende que la ambigüedad produce resultados inesperados | ✅ | Tres casos: «prepara café» (ambigüedad léxica), «revuelve» sin fin (falta de condición de parada) y «mezclar» sin recipiente (falta de detalle). En 4.4 se explica el porqué con el contraste entre persona y robot («lo que das por hecho»). |
| Las computadoras siguen instrucciones y reglas establecidas | ✅ | V55-V57 con el cursor de ejecución. V58 aporta el **matiz** sobre los sistemas modernos, de modo que el mensaje central no queda como una afirmación absoluta. |
| Se usan decisiones para modificar el flujo | ✅ | Bloque 5.3-5.5: se ven los dos caminos (SÍ completo y NO acelerado x2) y un *split* comparativo. Se siembra antes en la máquina expendedora (V21). |
| No se adelantan contenidos de lecciones posteriores | ✅ con vigilancia | La condicional **no se formaliza**: no aparecen las palabras «condicional», «estructura» ni «if», y el rombo de Vee es un guiño visual sin explicación. La tarjeta muestra «SI… ENTONCES… FIN SI» porque así lo pide el encargo, pero **nadie la lee como sintaxis**. Secuencia, decisión y repetición solo se nombran (V59-V60). Ni pseudocódigo ni diagramas de flujo se nombran como tema; solo se menciona la próxima lección en la pantalla final. |
| Vee no repite el texto de la pantalla | ✅ con 2 excepciones intencionadas | En la ejecución del algoritmo 2, Vee **parafrasea** («Paso uno: tomar una taza»; «Toma una cuchara… y revuelve») en lugar de leer la línea entera. Las excepciones son la frase central (6:14) y la definición (0:47), donde voz y texto coinciden a propósito para fijarlas. En la definición, solo 4 palabras están en pantalla. |
| Lenguaje adecuado para principiantes | ✅ | Sin tecnicismos. «Ejecutar» e «instrucción» se entienden por el contexto. |

**Riesgos y ajustes sugeridos**

1. **«Leer cantidad de café» en el algoritmo 1:** un principiante podría preguntarse quién «lee». Se resuelve visualmente: el robot pregunta y Vee responde. No hace falta explicar el término.
2. **«¿No faltaba el agua?» (V31):** es un acierto pedagógico (muestra que también se pueden olvidar pasos enteros), pero hay que cuidar que no parezca que el algoritmo 1 «no vale». El sello ✓ ya visible lo protege.
3. **El robot ejecuta «Calentar agua» sin que diga cómo encender la estufa:** es intencional. Ilustra que «el nivel necesario depende del ejecutor» (este robot ya sabe usar la estufa). Si en la revisión surge la pregunta, se puede añadir una línea opcional de Vee: «Por suerte, este robot ya sabe usar la estufa».

---

# I. Auditoría de retención audiovisual

### 1. Intervalos de más de 1 s sin actividad visual
Revisé todos los segmentos. **Ninguno queda inactivo**: cada fila del storyboard tiene al menos una acción (de un personaje, un objeto, la cámara o un gráfico). Los segmentos sin narración son estos:

| Segmento | Duración | Actividad que lo sostiene | Veredicto |
|---|---|---|---|
| 0:14-0:20 (el robot procesa y se «prepara») | 6 s | 4 acciones distintas cada 1-2 s | ✅ |
| 0:40-0:45 (título) | 5 s | Escritura con tecleo y entrada del robot | ✅ |
| 1:13-1:15 y 1:25-1:27 y 1:29-1:31 (gags) | 2 s cada uno | Acción cómica continua | ✅ |
| 2:12-2:15 (transición a la cocina) | 3 s | Expansión del marco y el robot se coloca | ✅ |
| 2:45-2:49 y 2:53-3:03 (gag del piso) | 4 s + 10 s | Una acción nueva cada 1-2 s | ✅ |
| 3:52-3:58 / 4:02-4:05 / 4:09-4:13 | 3-6 s | Sub-acciones del robot y movimiento del cursor | ✅ |
| 4:17-4:19 y 4:23-4:27 | 2 s cada uno | Botones que laten y teclado | ✅ |
| 6:18-6:21 (frase central) | 3 s | Cursor, subrayado que se dibuja y Vee cruza los brazos. Es un «respiro» intencionado | ⚠️ aceptable (ver la mejora) |
| **6:45-6:55** | **10 s** | El robot vuelve y trapea; Vee camina; cambia la luz | ⚠️ **el más débil** |
| 7:22-7:30 (pantalla final) | 8 s | Escritura, robot con bandeja y logo | ✅ |

### 2. Cambios visuales frecuentes
El promedio es un cambio significativo **cada ≈ 2,1 s** (≈ 210 eventos en 450 s). Los tramos más lentos son 3:21-3:30 (explicación con *split*, un cambio cada 3 s) y 6:21-6:28, ambos dentro del rango de 2-5 s pedido.

### 3. Sincronización entre narración y acción
Todas las acciones verbales tienen una acción visual en el mismo segmento («Tomar. Verter. Revolver», «Una… y dos», «la ejecuta… pasa a la siguiente»). **Regla de edición:** primero se genera la voz, se mide cada clip y se ajustan los tiempos del storyboard a la duración real (*timeline* conducido por el audio, como en `busqueda-binaria/src/timeline.ts`).

### 4. Distribución del humor
| Minuto | Gag |
|---|---|
| 0:14 | Robot «se prepara» |
| 0:25 | Café como trofeo |
| 1:13 | Agua sin taza |
| 1:25 | Robot trompo |
| 1:49 | El «1» que se lleva salta |
| 2:47-3:05 | **Gag principal: el piso** |
| 4:07 | «Sin salpicar» y la lengua |
| 4:34 | La tercera cucharada frenada |
| 5:14 | La cuchara para siempre |
| 6:06 | *Flashback* del charco en el PC |
| 7:19 | El trapeador escondido |

Hay un momento de humor cada **≈ 40 s** como máximo y nunca dos gags seguidos durante una explicación clave. El tramo más largo sin humor va de 5:20 a 6:06 (≈ 46 s, con la comparación y la entrada al PC). Es aceptable porque ahí se concentra el contenido de mayor valor.

### 5. Segmentos estáticos
No hay planos fijos de más de 3 s sin un elemento en movimiento. El *layout* de tarjeta más escena del bloque 5 siempre tiene el cursor ▶ y al robot en acción.

### 6. Saturación
- Como máximo **un foco principal** por segmento. Cuando habla Vee sobre la tarjeta, la escena de fondo se atenúa o se congela (4.4, 5.7).
- Los SFX se mezclan **-12 dB por debajo de la voz** y la música, a -20 dB, con *ducking* automático.
- Las etiquetas en pantalla tienen 1-3 palabras. El texto más largo es la tarjeta del algoritmo 2, y se muestra con el cursor guiando la lectura.

### 7. Aporte de cada escena
Cada escena aporta información, entretenimiento o una transición necesaria. Las escenas puramente de transición (0:40-0:45 título, 2:08-2:15 y 6:45-6:55) llevan humor o un *callback*.

### Segmentos que no cumplen del todo y propuestas

| Segmento | Problema | Propuesta |
|---|---|---|
| **6:45-6:55** (10 s sin voz) | Es el respiro más largo y corre el riesgo de sentirse como relleno. | **Opción A (recomendada):** recortarlo a 4 s (6:45-6:49) y adelantar el cierre. El video queda en **7:24**. **Opción B:** usarlo para un mini-*callback* con intención: el robot intenta trapear, duda, muestra «¿ALGORITMO?» en su pantalla y mira a Vee. Así prepara el chiste de V64. |
| 6:18-6:21 (frase central en pantalla 3 s) | Puede sentirse quieto. | Mantenerlo (refuerza el mensaje), con animación tipográfica sutil: la palabra «INDICAMOS» se ilumina letra por letra, en una ola. |
| 3:21-3:30 (*split* persona/robot) | Es explicativo y tiene menos movimiento. | Añadir un pequeño *loop* en el globo del robot: la palabra «Mezclar» gira con un «?» que da vueltas, y la persona da un sorbo de su taza imaginaria. |
| 5:41-5:45 | V52 es una frase larga sobre un gráfico. | Hacer que los iconos (persona y computadora) entren justo al decir «quien las ejecuta». |

---

## Decisiones pendientes de aprobación

1. **Nombre del robot:** «Bit» es un nombre de trabajo. También puede quedar como «el robot». *Ojo:* ya existe la mascota **Byte** (Fase 5), así que conviene un nombre que no se confunda; otras opciones son «Paso», «Tico» o «Robi».
2. **Diseño del robot:** crear su hoja de concepto con el kit antes de animar.
3. **Delantal del robot** en el intento 2 (detalle visual opcional).
4. **Recorte de 6:45-6:55** (opción A o B de la auditoría).
5. **Texto de la pantalla final:** confirmar si se anuncia «Próxima lección: Pseudocódigo».
6. **Voz de Vee en ElevenLabs:** elegir o diseñar la voz y confirmar el modelo (v3 con etiquetas o Multilingual v2).
7. **Música:** sintetizada por código (como en los videos anteriores) o de biblioteca con licencia.
