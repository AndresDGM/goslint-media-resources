# Goslint · Roadmap de contenidos del canal

Bosquejo del temario para el canal de YouTube del semillero Goslint (UCEVA). Son **99 videos repartidos en 8 fases**, más unas series cortas que salen en paralelo. La imagen `roadmap_goslint.png` muestra el mismo orden, pero solo con los títulos.

## Cómo está pensado

La idea es que una persona que nunca ha programado pueda entrar por la fase 0 y salir, al final, lista para entrenar en serio para una maratón. Por eso el orden no es el de un libro de algoritmos, sino el orden en que de verdad se aprende:

1. **Fases 0 y 1:** lógica pura con pseudocódigo (PSeInt) y diagramas de flujo. Nada de sintaxis todavía.
2. **Fase 2:** los mismos temas de la fase 1, pero ahora en código real, con C++, Java y Python en paralelo.
3. **Fase 3:** estructuras de datos y algoritmos clásicos, todavía en los tres lenguajes.
4. **Fases 4, 5 y 6:** programación competitiva por niveles, ya centrada en C++.
5. **Fase 7:** lo que no es algoritmo pero define una competencia: estrategia de equipo, cuaderno y simulacros.

El #001 (tráiler) ya está grabado. Cada fase cierra con un video marcado como **hito** (★). Es un reto o un repaso que sirve para que la persona sepa si ya puede pasar a la siguiente fase.

## Sobre los tres lenguajes en paralelo

Para las fases 2 y 3 hay dos formas de hacerlo, y vale la pena decidirlo en grupo antes de grabar:

- **Opción A, un video por tema con los tres lenguajes:** se explica la idea una vez y luego se muestra el código en C++, Java y Python, uno al lado del otro. Sale un solo video por tema y se nota muy bien que la lógica es la misma. Los videos quedan más largos.
- **Opción B, un video por lenguaje:** el mismo tema se graba tres veces y se arma una lista de reproducción por lenguaje. Los videos son más cortos y cada quien sigue solo su lenguaje, pero son el triple de videos para grabar y editar.

Una salida intermedia es grabar el video principal con la Opción A y, si un tema tiene diferencias grandes entre lenguajes (por ejemplo, entrada y salida o paso por referencia), sacar un short aparte para cada uno.

Desde la fase 4 el foco pasa a C++, porque es lo que se usa en casi todas las competencias. Donde haga falta se dan notas para Java y Python, sobre todo con la entrada y salida rápida, porque Python suele quedarse corto con los límites de tiempo.

## Resumen por fase

| Fase | Nombre | Videos | Lenguajes |
|---|---|---|---|
| 0 | Bienvenida | #001 – #003 (3) | — |
| 1 | Lógica desde cero | #004 – #022 (19) | PSeInt · diagramas |
| 2 | Programación básica | #023 – #038 (16) | C++ · Java · Python |
| 3 | Estructuras y algoritmos | #039 – #052 (14) | C++ · Java · Python |
| 4 | Competitiva I | #053 – #065 (13) | C++ (notas para Java y Python) |
| 5 | Competitiva II | #066 – #080 (15) | C++ |
| 6 | Competitiva III | #081 – #095 (15) | C++ |
| 7 | Modo maratón | #096 – #099 (4) | — |

## Fase 0 · Bienvenida

*Arranque del canal*

Videos cortos para presentar el canal y al semillero. Son la puerta de entrada: cualquiera que llegue por primera vez debería entender qué va a encontrar y por dónde empezar.

**#001 · Tráiler: esto es Goslint** ✓ ya grabado  
Presenta el semillero con la idea de la maratón (5 horas, 3 personas, 1 computador): qué entrenamos, las maratones internas y las salidas a Pereira, Cali y Bogotá, Goslint Judge y la invitación a unirse sin experiencia previa.

**#002 · ¿Qué es la programación competitiva?**  
Resolver problemas contra el reloj, los jueces en línea y las competencias como la Maratón Nacional y el ICPC. Por qué sirve aunque nunca vayas a competir: entrevistas, lógica y velocidad.

**#003 · Cómo usar este roadmap**  
Como el tráiler habla del semillero en general, este video presenta el canal en sí: el mapa por fases, dónde entrar según lo que ya sepas y cómo practicar después de cada video. Si ya programas, aquí te decimos qué fases puedes saltarte.

## Fase 1 · Lógica desde cero

*Pseudocódigo y diagramas de flujo* · **PSeInt · diagramas**

Cero código real. Todo se trabaja con pseudocódigo (PSeInt) y diagramas de flujo, para que la persona entienda cómo se piensa un algoritmo antes de pelear con la sintaxis de un lenguaje.

**#004 · ¿Qué es un algoritmo?**  
Algoritmos de la vida diaria (preparar un café, cruzar la calle) y qué condiciones debe cumplir uno: pasos finitos, claros y en orden.

**#005 · Diagramas de flujo**  
Los símbolos (inicio, proceso, decisión, entrada y salida) y las reglas para dibujar un diagrama limpio. Primer diagrama completo de un problema sencillo.

**#006 · Pseudocódigo y PSeInt**  
Qué es el pseudocódigo, cómo instalar PSeInt y cómo escribir y ejecutar el primer algoritmo. También cómo PSeInt genera el diagrama a partir del pseudocódigo.

**#007 · Variables, constantes y tipos**  
Qué es una variable, cómo se nombra bien y qué tipos de datos existen (entero, real, carácter, lógico). Analogía de las cajas con etiqueta.

**#008 · Entrada, proceso y salida**  
El esquema que siguen casi todos los programas: leer datos, hacer cálculos y mostrar resultados. Ejemplos: área de un rectángulo, conversión de unidades.

**#009 · Operadores aritméticos**  
Suma, resta, multiplicación, división, división entera y módulo. Precedencia de operadores y uso de paréntesis, con ejercicios para calcular a mano.

**#010 · Operadores relacionales y lógicos**  
Mayor, menor, igual, distinto, y los operadores Y, O y NO. Tablas de verdad explicadas con ejemplos cotidianos.

**#011 · Condicional simple y doble**  
Si-entonces-sino en pseudocódigo y en diagrama. Ejemplos: saber si un número es par, si una persona es mayor de edad.

**#012 · Condicionales anidados y Según**  
Decisiones dentro de decisiones y la estructura Según para menús o casos múltiples. Ejemplo: calculadora con menú de opciones.

**#013 · Ciclo Mientras**  
Repetir mientras una condición se cumpla. Cómo evitar un ciclo infinito y cuándo conviene usar Mientras.

**#014 · Ciclo Repetir-Hasta**  
La diferencia con Mientras: aquí el cuerpo se ejecuta al menos una vez. Ejemplo típico: validar que el usuario ingrese un dato correcto.

**#015 · Ciclo Para**  
Repetir un número conocido de veces, con inicio, fin y paso. Tablas de multiplicar y sumas de 1 hasta N.

**#016 · Contadores, acumuladores y banderas**  
Los tres patrones que más se usan dentro de los ciclos: contar cuántos, sumar todo y marcar si algo pasó. Ejemplo: promedio de notas de un curso.

**#017 · Ciclos anidados**  
Un ciclo dentro de otro. Se practica dibujando patrones con asteriscos (triángulos, cuadrados, pirámides), que es la forma más visual de entenderlo.

**#018 · Arreglos (vectores)**  
Guardar muchos datos bajo un mismo nombre y recorrerlos con un ciclo. Buscar el mayor, el menor y la suma de un arreglo.

**#019 · Matrices**  
Arreglos de dos dimensiones: filas y columnas. Recorridos, suma de filas y columnas y la diagonal principal.

**#020 · Funciones y subprocesos**  
Dividir un problema grande en partes pequeñas. Parámetros, valor de retorno y por qué esto hace que el código sea más fácil de leer.

**#021 · Prueba de escritorio**  
Ejecutar un algoritmo a mano, paso a paso, con una tabla de variables. La herramienta para encontrar errores sin computador.

**#022 · Reto final: mini cajero** ★ hito  
Proyecto que junta todo lo de la fase: menú, condicionales, ciclos y validaciones. Se resuelve completo en pseudocódigo y en diagrama.

## Fase 2 · Programación básica

*Lo mismo, ahora en código real* · **C++ · Java · Python**

Se retoma cada tema de la fase 1, pero ahora traducido a C++, Java y Python en paralelo. La idea es que la persona vea que la lógica es la misma y que solo cambia la forma de escribirla.

**#023 · Preparando el entorno**  
Instalar el compilador de C++ (g++), el JDK de Java y Python, y configurar VS Code para los tres. Cómo compilar y ejecutar desde la terminal.

**#024 · Hola mundo en 3 lenguajes**  
La estructura mínima de un programa en cada lenguaje: includes e int main, la clase con main y el script de Python. Qué es compilar y qué es interpretar.

**#025 · Variables y tipos de datos**  
int, long long, double, char, bool y string en C++ y Java frente al tipado dinámico de Python. Rangos de los tipos y qué es el desbordamiento.

**#026 · Entrada y salida por consola**  
cin y cout, Scanner y System.out, input y print. Leer varios datos en una misma línea, que es lo que más piden los jueces.

**#027 · Operadores y expresiones**  
Del pseudocódigo al código: división entera, módulo con negativos, conversión de tipos y los errores típicos al mezclar enteros y decimales.

**#028 · Condicionales**  
if, else if, else y switch en C++ y Java; if, elif, else y match en Python. Las mismas condiciones de la fase 1, ahora en código.

**#029 · Ciclos while y do-while**  
Los equivalentes de Mientras y Repetir-Hasta. Por qué Python no tiene do-while y cómo se reemplaza.

**#030 · Ciclo for**  
El for clásico de C++ y Java frente al for con range de Python. Uso de break y continue.

**#031 · Arreglos, vectores y listas**  
Arreglos fijos, vector en C++, ArrayList en Java y list en Python. Agregar, recorrer y acceder por índice sin salirse del rango.

**#032 · Matrices en código**  
Vectores de vectores, arreglos bidimensionales y listas de listas. Leer una matriz desde la entrada y recorrerla.

**#033 · Strings y caracteres**  
Recorrer un texto letra por letra, la tabla ASCII, convertir mayúsculas y minúsculas y las funciones de string más útiles en cada lenguaje.

**#034 · Funciones**  
Declarar funciones, parámetros, retorno y la diferencia entre pasar por valor y por referencia. Cómo maneja esto cada lenguaje.

**#035 · Recursión básica**  
Una función que se llama a sí misma: caso base y caso recursivo. Factorial, potencia y Fibonacci, dibujando el árbol de llamadas.

**#036 · Depurar y errores comunes**  
Leer los mensajes de error, usar el depurador de VS Code y los errores clásicos del principiante: punto y coma, índices, variables sin inicializar.

**#037 · Tu primer juez en línea**  
Crear cuenta en un juez, leer bien un enunciado y entender los veredictos: Accepted, Wrong Answer, Time Limit. Se envía el primer problema en vivo.

**#038 · Checkpoint: ya sabes programar** ★ hito  
Se resuelven 5 problemas que juntan todo lo visto, en los tres lenguajes. Si te salen, ya tienes las bases para lo que sigue.

## Fase 3 · Estructuras y algoritmos

*Las herramientas de verdad* · **C++ · Java · Python**

Estructuras de datos y algoritmos clásicos, todavía en los tres lenguajes. Aquí aparece la pregunta clave de toda la competitiva: ¿qué tan rápido es mi solución?

**#039 · Complejidad y notación Big O**  
Contar operaciones, qué significan O(1), O(log n), O(n), O(n log n) y O(n²), y la regla práctica de cuántas operaciones aguanta un segundo.

**#040 · Structs, clases y pares**  
Agrupar datos relacionados: struct y pair en C++, clases y records en Java, tuplas y clases en Python. Lo justo de POO para lo que viene.

**#041 · Ordenamientos básicos**  
Burbuja, selección e inserción, animados paso a paso. Por qué son O(n²) y cuándo dejan de servir.

**#042 · Merge sort y quick sort**  
Divide y vencerás aplicado a ordenar. Por qué bajan a O(n log n) y cómo funciona cada uno por dentro.

**#043 · Ordenar con la librería**  
sort en C++, Arrays.sort y Collections.sort en Java, sorted en Python. Ordenar con criterios propios (comparadores y key).

**#044 · Búsqueda lineal y binaria**  
Buscar en un arreglo desordenado frente a uno ordenado. La búsqueda binaria explicada con el juego de adivinar un número.

**#045 · Pilas**  
Último en entrar, primero en salir. Implementación y uso con la librería; problema clásico de los paréntesis balanceados.

**#046 · Colas y deques**  
Primero en entrar, primero en salir, y la cola de doble extremo. Simulación de una fila de banco.

**#047 · Listas enlazadas**  
Nodos y punteros (o referencias): insertar y eliminar sin mover todo el arreglo. Cuándo conviene y cuándo no.

**#048 · Conjuntos**  
Guardar elementos sin repetir: set y unordered_set, HashSet y TreeSet, set de Python. Diferencia entre ordenado y por hash.

**#049 · Mapas y diccionarios**  
Asociar una clave con un valor: map, HashMap y dict. Contar frecuencias de palabras, que es el ejemplo de toda la vida.

**#050 · Colas de prioridad y heaps**  
Sacar siempre el mayor (o el menor) en O(log n). Cómo funciona un heap por dentro y cómo se usa en cada lenguaje.

**#051 · Árboles binarios**  
Raíz, hijos y hojas; recorridos preorden, inorden y postorden; y el árbol binario de búsqueda.

**#052 · Introducción a grafos** ★ hito  
Nodos y aristas, grafos dirigidos y con pesos. Representarlos con matriz y con lista de adyacencia.

## Fase 4 · Competitiva I

*Arranque en competitiva* · **C++ (notas para Java y Python)**

Desde aquí el foco pasa a C++, que es el lenguaje que se usa en casi todas las competencias. Cuando haga falta, se dan notas para Java y Python, sobre todo con la entrada y salida rápida y los límites de tiempo.

**#053 · El mundo de la competitiva**  
Codeforces, AtCoder, CSES, OmegaUp, vjudge y las maratones. Cómo funcionan los rankings y cómo entrenar sin quemarse.

**#054 · Plantilla de C++ y E/S rápida**  
Armar una plantilla propia, desactivar la sincronización de cin, y el equivalente en Java (BufferedReader) y en Python (sys.stdin).

**#055 · Leer restricciones**  
Mirar los límites del problema para saber qué complejidad se necesita antes de escribir una sola línea. Tabla de n contra complejidad permitida.

**#056 · Ad hoc y simulación**  
Problemas sin algoritmo famoso: solo hay que implementar con cuidado lo que dice el enunciado. Cómo no perderse en los casos borde.

**#057 · Matemática básica para competir**  
Paridad, divisibilidad, MCD con Euclides, MCM, aritmética modular básica y por qué casi todo se pide módulo 1e9+7.

**#058 · Sumas de prefijos**  
Responder sumas de rangos en O(1) después de un precálculo. Versión en 1D, en 2D y el arreglo de diferencias.

**#059 · Dos punteros**  
Recorrer el arreglo con dos índices para bajar de O(n²) a O(n). Pares que suman X y subarreglos que cumplen una condición.

**#060 · Ventana deslizante**  
Mantener una ventana que avanza por el arreglo: suma máxima de k elementos y subcadena más larga sin repetidos.

**#061 · Búsqueda binaria en la respuesta**  
Cuando no se busca en un arreglo sino el mejor valor posible: la idea de la función monótona y problemas de minimizar el máximo.

**#062 · Búsqueda completa**  
Probar todas las opciones cuando las restricciones lo permiten: subconjuntos, permutaciones y máscaras de bits.

**#063 · Backtracking**  
Explorar opciones y devolverse cuando un camino no sirve. Las N reinas, sudoku y generar combinaciones con poda.

**#064 · Algoritmos voraces**  
Tomar la mejor decisión local: problemas de intervalos, cambio de monedas y cómo convencerse de que el greedy sí es correcto.

**#065 · Primer contest en vivo** ★ hito  
Se participa en un concurso de Codeforces o AtCoder en tiempo real y luego se resuelven los problemas que quedaron pendientes (upsolving).

## Fase 5 · Competitiva II

*Grafos, teoría de números y DP* · **C++**

El nivel donde se gana la mayoría de los problemas de una maratón regional. Grafos, teoría de números y programación dinámica, en ese orden, porque la DP se entiende mucho mejor después de haber pensado en estados y transiciones con grafos.

**#066 · Primos y criba de Eratóstenes**  
Saber si un número es primo, factorizar y precalcular todos los primos hasta N con la criba.

**#067 · Exponenciación rápida e inverso**  
Calcular potencias enormes módulo M en O(log n) y el inverso modular con el pequeño teorema de Fermat.

**#068 · Combinatoria**  
Permutaciones, combinaciones y nCr módulo un primo con factoriales precalculados. El triángulo de Pascal como DP.

**#069 · BFS**  
Búsqueda en anchura: recorrer un grafo por niveles y encontrar el camino más corto sin pesos.

**#070 · DFS y componentes conexas**  
Búsqueda en profundidad, contar componentes y detectar ciclos en un grafo.

**#071 · Grafos en grillas**  
Mapas de caracteres como grafos: flood fill, contar islas y salir de un laberinto.

**#072 · Orden topológico**  
Ordenar tareas que dependen unas de otras en un grafo dirigido sin ciclos. Algoritmo de Kahn y la versión con DFS.

**#073 · Dijkstra**  
Camino más corto con pesos positivos usando una cola de prioridad. El algoritmo de grafos más preguntado.

**#074 · Bellman-Ford y Floyd-Warshall**  
Caminos más cortos con pesos negativos, detección de ciclos negativos y distancias entre todos los pares.

**#075 · Union-Find (DSU)**  
Unir conjuntos y saber si dos elementos están juntos casi en O(1), con compresión de caminos y unión por tamaño.

**#076 · Árbol de expansión mínima**  
Kruskal (con DSU) y Prim: conectar todos los nodos con el menor costo posible.

**#077 · Intro a programación dinámica**  
Qué es un estado y una transición. Fibonacci y escaleras, primero con memoización y después con tabulación.

**#078 · DP clásica: mochila**  
El problema de la mochila 0/1 y sus variantes. Cómo pasar de la recursión a la tabla y ahorrar memoria.

**#079 · DP clásica: LIS y LCS**  
Subsecuencia creciente más larga, subsecuencia común más larga y distancia de edición entre dos palabras.

**#080 · DP en grillas y conteo** ★ hito  
Contar caminos en una grilla, caminos con obstáculos y el camino de costo mínimo.

## Fase 6 · Competitiva III

*Nivel maratón y más allá* · **C++**

Temas avanzados para quienes ya resuelven con soltura lo de la fase anterior y quieren pelear los problemas difíciles de una maratón.

**#081 · Árboles: diámetro y LCA**  
Propiedades de los árboles, el diámetro con dos BFS y el ancestro común más bajo con binary lifting.

**#082 · Sparse table**  
Mínimo o máximo de un rango en O(1) cuando el arreglo no cambia.

**#083 · Fenwick tree (BIT)**  
Sumas de rangos con actualizaciones en O(log n), en menos de veinte líneas de código.

**#084 · Segment tree**  
La estructura comodín para consultas de rango: suma, mínimo, máximo y MCD, con actualizaciones puntuales.

**#085 · Segment tree con lazy**  
Actualizar rangos completos de una vez con propagación perezosa.

**#086 · DP con máscaras de bits**  
Estados que guardan qué elementos ya se usaron. El problema del viajero (TSP) para n pequeño.

**#087 · DP en árboles**  
Calcular respuestas desde las hojas hacia la raíz: conjunto independiente máximo y rerooting.

**#088 · DP de dígitos**  
Contar números en un rango que cumplen una propiedad, construyéndolos dígito por dígito.

**#089 · Strings: hashing**  
Comparar subcadenas en O(1) con hashing polinomial, y cómo evitar las colisiones.

**#090 · KMP y función Z**  
Buscar un patrón dentro de un texto en tiempo lineal, con la función de prefijos y la función Z.

**#091 · Trie**  
Árbol de prefijos para diccionarios, autocompletado y el problema del XOR máximo.

**#092 · Componentes fuertemente conexas**  
Algoritmos de Kosaraju y Tarjan en grafos dirigidos, y su uso en 2-SAT.

**#093 · Geometría computacional**  
Puntos, vectores, producto cruz, orientación, área de polígonos y envolvente convexa.

**#094 · Teoría de juegos**  
Posiciones ganadoras y perdedoras, el juego de Nim y los números de Grundy.

**#095 · Flujo máximo** ★ hito  
Redes de flujo, Edmonds-Karp y Dinic, y el emparejamiento bipartito como aplicación.

## Fase 7 · Modo maratón

*Competir en equipo*

El cierre del roadmap: todo lo que no es algoritmo pero define una competencia de verdad.

**#096 · Estrategia en equipo**  
Cómo repartir problemas entre tres personas con un solo computador, cuándo cambiar de problema y cómo leer el marcador.

**#097 · Armar tu cuaderno de equipo**  
El notebook de referencia que se permite llevar impreso: qué algoritmos incluir y cómo organizarlo.

**#098 · Simulacro de maratón**  
El equipo resuelve una maratón pasada con el reloj corriendo, y después se analiza cada decisión.

**#099 · Cómo seguir entrenando** ★ hito  
Rutinas, listas de problemas, upsolving, ratings y cómo medir el progreso semana a semana.

## Series paralelas

No siguen el orden del roadmap. Salen entre los videos principales para mantener el canal activo y traer gente nueva.

- **Problema de la semana:** Un problema corto resuelto en menos de 10 minutos, del nivel de la fase que vaya saliendo.
- **Upsolving en vivo:** Después de cada contest de Codeforces o AtCoder, se resuelven en directo los problemas del concurso.
- **Shorts de Lint:** Datos rápidos de 30 a 60 segundos: un truco de C++, un error clásico o un concepto explicado con Lint.
- **Goslint responde:** Dudas de la comunidad que llegan por comentarios, resueltas en un video corto.

## Dónde practicar en cada fase

- **Fase 1:** ejercicios propios en PSeInt; cada video debería terminar con dos o tres retos para resolver en casa.
- **Fases 2 y 3:** problemas fáciles de beecrowd, OmegaUp y la división 4 de Codeforces.
- **Fase 4:** la primera parte del CSES Problem Set (Introductory y Sorting and Searching) y los ABC de AtCoder.
- **Fases 5 y 6:** el resto del CSES, Codeforces divisiones 2 y 3, y listas armadas en vjudge con problemas de maratones pasadas.
- **Fase 7:** maratones pasadas completas, resueltas en equipo y con el reloj corriendo.

## Pendientes para decidir en grupo

- Opción A u Opción B para los tres lenguajes.
- Quién graba cada fase y con qué frecuencia se publica.
- Si los videos de la fase 1 se graban con PSeInt o con otra herramienta de diagramas.
- Qué juez se usa en el video #037 (primer juez en línea) para todo el canal. Si Goslint Judge ya está listo para ese momento, es la mejor opción, porque el tráiler ya lo presenta y así el canal y el juez se impulsan entre sí.
