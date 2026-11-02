/**
 * Contenido del roadmap. Para corregir un título, un número o el orden de las láminas,
 * edita solo este archivo: las 17 imágenes se regeneran con `npm run render`.
 * Fuente: temario_canal_goslint.md (99 videos · 8 fases).
 */

export type Video = {n: number; t: string; hito?: boolean; listo?: boolean};
export type Tag = {t: string; verde?: boolean};

export type Fase = {
	id: number;
	/** nombre en la portada */
	nombre: string;
	/** título de la lámina, una cadena por renglón */
	titulo: string[];
	sub: string;
	tags: Tag[];
	videos: Video[];
};

const v = (n: number, t: string, o: {hito?: boolean; listo?: boolean} = {}): Video => ({n, t, ...o});

export const FASES: Fase[] = [
	{
		id: 0, nombre: 'BIENVENIDA', titulo: ['BIENVENIDA'], sub: 'Arranque del canal', tags: [],
		videos: [
			v(1, 'Tráiler: esto es Goslint'),
			v(2, '¿Qué es la programación competitiva?'),
			v(3, 'Cómo usar este roadmap'),
		],
	},
	{
		id: 1, nombre: 'LÓGICA DESDE CERO', titulo: ['LÓGICA DESDE CERO'], sub: 'Pseudocódigo y diagramas de flujo',
		tags: [{t: 'PSeInt', verde: true}, {t: 'diagramas'}],
		videos: [
			v(4, '¿Qué es un algoritmo?'),
			v(5, 'Diagramas de flujo'),
			v(6, 'Pseudocódigo y PSeInt'),
			v(7, 'Variables, constantes y tipos'),
			v(8, 'Operadores aritméticos'),
			v(9, 'Entrada, proceso y salida'),
			v(10, 'Operadores relacionales y lógicos'),
			v(11, 'Condicional simple y doble'),
			v(12, 'Condicionales anidados y Según'),
			v(13, 'Ciclo Mientras'),
			v(14, 'Ciclo Repetir-Hasta'),
			v(15, 'Ciclo Para'),
			v(16, 'Contadores, acumuladores y banderas'),
			v(17, 'Ciclos anidados'),
			v(18, 'Arreglos (vectores)'),
			v(19, 'Matrices'),
			v(20, 'Funciones y subprocesos'),
			v(21, 'Prueba de escritorio'),
			v(22, 'Reto final: mini cajero', {hito: true}),
		],
	},
	{
		id: 2, nombre: 'PROGRAMACIÓN BÁSICA', titulo: ['PROGRAMACIÓN', 'BÁSICA'], sub: 'Lo mismo, ahora en código real',
		tags: [{t: 'C++', verde: true}, {t: 'Java'}, {t: 'Python'}],
		videos: [
			v(23, 'Preparando el entorno'),
			v(24, 'Hola mundo en 3 lenguajes'),
			v(25, 'Variables y tipos de datos'),
			v(26, 'Entrada y salida por consola'),
			v(27, 'Operadores y expresiones'),
			v(28, 'Condicionales'),
			v(29, 'Ciclos while y do-while'),
			v(30, 'Ciclo for'),
			v(31, 'Arreglos, vectores y listas'),
			v(32, 'Matrices en código'),
			v(33, 'Strings y caracteres'),
			v(34, 'Funciones'),
			v(35, 'Recursión básica'),
			v(36, 'Depurar y errores comunes'),
			v(37, 'Tu primer juez en línea'),
			v(38, 'Checkpoint: ya sabes programar', {hito: true}),
		],
	},
	{
		id: 3, nombre: 'ESTRUCTURAS Y ALGORITMOS', titulo: ['ESTRUCTURAS Y', 'ALGORITMOS'], sub: 'Las herramientas de verdad',
		tags: [{t: 'C++', verde: true}, {t: 'Java'}, {t: 'Python'}],
		videos: [
			v(39, 'Complejidad y notación Big O'),
			v(40, 'Structs, clases y pares'),
			v(41, 'Ordenamientos básicos'),
			v(42, 'Merge sort y quick sort'),
			v(43, 'Ordenar con la librería'),
			v(44, 'Búsqueda lineal y binaria'),
			v(45, 'Pilas'),
			v(46, 'Colas y deques'),
			v(47, 'Listas enlazadas'),
			v(48, 'Conjuntos'),
			v(49, 'Mapas y diccionarios'),
			v(50, 'Colas de prioridad y heaps'),
			v(51, 'Árboles binarios'),
			v(52, 'Introducción a grafos', {hito: true}),
		],
	},
	{
		id: 4, nombre: 'COMPETITIVA I', titulo: ['COMPETITIVA I'], sub: 'Arranque en competitiva',
		tags: [{t: 'C++ (notas para Java y Python)', verde: true}],
		videos: [
			v(53, 'El mundo de la competitiva'),
			v(54, 'Plantilla de C++ y E/S rápida'),
			v(55, 'Leer restricciones'),
			v(56, 'Ad hoc y simulación'),
			v(57, 'Matemática básica para competir'),
			v(58, 'Sumas de prefijos'),
			v(59, 'Dos punteros'),
			v(60, 'Ventana deslizante'),
			v(61, 'Búsqueda binaria en la respuesta'),
			v(62, 'Búsqueda completa'),
			v(63, 'Backtracking'),
			v(64, 'Algoritmos voraces'),
			v(65, 'Primer contest en vivo', {hito: true}),
		],
	},
	{
		id: 5, nombre: 'COMPETITIVA II', titulo: ['COMPETITIVA II'], sub: 'Grafos, teoría de números y DP',
		tags: [{t: 'C++', verde: true}],
		videos: [
			v(66, 'Primos y criba de Eratóstenes'),
			v(67, 'Exponenciación rápida e inverso'),
			v(68, 'Combinatoria'),
			v(69, 'BFS'),
			v(70, 'DFS y componentes conexas'),
			v(71, 'Grafos en grillas'),
			v(72, 'Orden topológico'),
			v(73, 'Dijkstra'),
			v(74, 'Bellman-Ford y Floyd-Warshall'),
			v(75, 'Union-Find (DSU)'),
			v(76, 'Árbol de expansión mínima'),
			v(77, 'Intro a programación dinámica'),
			v(78, 'DP clásica: mochila'),
			v(79, 'DP clásica: LIS y LCS'),
			v(80, 'DP en grillas y conteo', {hito: true}),
		],
	},
	{
		id: 6, nombre: 'COMPETITIVA III', titulo: ['COMPETITIVA III'], sub: 'Nivel maratón y más allá',
		tags: [{t: 'C++', verde: true}],
		videos: [
			v(81, 'Árboles: diámetro y LCA'),
			v(82, 'Sparse table'),
			v(83, 'Fenwick tree (BIT)'),
			v(84, 'Segment tree'),
			v(85, 'Segment tree con lazy'),
			v(86, 'DP con máscaras de bits'),
			v(87, 'DP en árboles'),
			v(88, 'DP de dígitos'),
			v(89, 'Strings: hashing'),
			v(90, 'KMP y función Z'),
			v(91, 'Trie'),
			v(92, 'Componentes fuertemente conexas'),
			v(93, 'Geometría computacional'),
			v(94, 'Teoría de juegos'),
			v(95, 'Flujo máximo', {hito: true}),
		],
	},
	{
		id: 7, nombre: 'MODO MARATÓN', titulo: ['MODO MARATÓN'], sub: 'Competir en equipo', tags: [],
		videos: [
			v(96, 'Estrategia en equipo'),
			v(97, 'Armar tu cuaderno de equipo'),
			v(98, 'Simulacro de maratón'),
			v(99, 'Cómo seguir entrenando', {hito: true}),
		],
	},
];

export const SERIES = [
	{t: 'Problema de la semana', d: 'Un problema corto resuelto en menos de 10 minutos, del nivel de la fase que vaya saliendo.'},
	{t: 'Upsolving en vivo', d: 'Después de cada contest de Codeforces o AtCoder, se resuelven en directo los problemas del concurso.'},
	{t: 'Shorts de Lint', d: 'Datos rápidos de 30 a 60 segundos: un truco de C++, un error clásico o un concepto explicado con Lint.'},
	{t: 'Goslint responde', d: 'Dudas de la comunidad que llegan por comentarios, resueltas en un video corto.'},
];

export const META = {
	etiqueta: 'META',
	titulo: '¡A COMPETIR!',
	texto: 'Con las 8 fases completas ya puedes entrenar en serio para la Maratón Nacional y el ICPC.',
};

export const TOTAL_VIDEOS = 99;
export const TOTAL_FASES = 8;

/** Pose de Lint en cada lámina (claves de POSES en mascot.tsx, o una pose propia). */
export type PoseSpec = {base: string; extra?: Record<string, unknown>};

export type Lamina =
	| {tipo: 'portada'; slug: string; pose: PoseSpec}
	| {tipo: 'fase'; slug: string; fase: number; desde: number; hasta: number; parte?: [number, number]; sigue: string | null; pose: PoseSpec; pitch?: number; meta?: boolean}
	| {tipo: 'series'; slug: string; pose: PoseSpec};

export const LAMINAS: Lamina[] = [
	{tipo: 'portada', slug: 'portada', pose: {base: 'wave'}},
	{tipo: 'fase', slug: 'fase0_bienvenida', fase: 0, desde: 1, hasta: 3, sigue: 'SIGUE: FASE 1 →', pose: {base: 'wave'}, pitch: 110},
	{tipo: 'fase', slug: 'fase1_parte1', fase: 1, desde: 4, hasta: 10, parte: [1, 3], sigue: 'SIGUE ↓', pose: {base: 'point'}},
	{tipo: 'fase', slug: 'fase1_parte2', fase: 1, desde: 11, hasta: 17, parte: [2, 3], sigue: 'SIGUE ↓', pose: {base: 'point'}},
	{tipo: 'fase', slug: 'fase1_parte3', fase: 1, desde: 18, hasta: 22, parte: [3, 3], sigue: 'SIGUE: FASE 2 →', pose: {base: 'shrug'}},
	{tipo: 'fase', slug: 'fase2_parte1', fase: 2, desde: 23, hasta: 30, parte: [1, 2], sigue: 'SIGUE ↓', pose: {base: 'point'}},
	{tipo: 'fase', slug: 'fase2_parte2', fase: 2, desde: 31, hasta: 38, parte: [2, 2], sigue: 'SIGUE: FASE 3 →', pose: {base: 'point'}},
	{tipo: 'fase', slug: 'fase3_parte1', fase: 3, desde: 39, hasta: 45, parte: [1, 2], sigue: 'SIGUE ↓', pose: {base: 'carry'}},
	{tipo: 'fase', slug: 'fase3_parte2', fase: 3, desde: 46, hasta: 52, parte: [2, 2], sigue: 'SIGUE: FASE 4 →', pose: {base: 'point'}},
	{tipo: 'fase', slug: 'fase4_parte1', fase: 4, desde: 53, hasta: 59, parte: [1, 2], sigue: 'SIGUE ↓', pose: {base: 'aim'}},
	{tipo: 'fase', slug: 'fase4_parte2', fase: 4, desde: 60, hasta: 65, parte: [2, 2], sigue: 'SIGUE: FASE 5 →', pose: {base: 'point'}},
	{tipo: 'fase', slug: 'fase5_parte1', fase: 5, desde: 66, hasta: 73, parte: [1, 2], sigue: 'SIGUE ↓', pose: {base: 'carry'}},
	{tipo: 'fase', slug: 'fase5_parte2', fase: 5, desde: 74, hasta: 80, parte: [2, 2], sigue: 'SIGUE: FASE 6 →', pose: {base: 'point'}},
	{tipo: 'fase', slug: 'fase6_parte1', fase: 6, desde: 81, hasta: 88, parte: [1, 2], sigue: 'SIGUE ↓', pose: {base: 'aim'}},
	{tipo: 'fase', slug: 'fase6_parte2', fase: 6, desde: 89, hasta: 95, parte: [2, 2], sigue: 'SIGUE: FASE 7 →', pose: {base: 'carry'}},
	{tipo: 'fase', slug: 'fase7_meta', fase: 7, desde: 96, hasta: 99, sigue: null, pose: {base: 'cheer'}, pitch: 86, meta: true},
	{tipo: 'series', slug: 'series_cortas', pose: {base: 'point'}},
];
