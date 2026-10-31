/**
 * Algoritmos reales que alimentan TODAS las animaciones y contadores del video.
 * Convención de conteo: una «comparación» = un elemento del arreglo examinado contra el objetivo
 * (comparación de tres vías: igual, menor o mayor). Es la misma convención para ambos algoritmos.
 */

export type LinearRun = {index: number; comparisons: number; visited: number[]};

/** Búsqueda lineal: revisa de izquierda a derecha. */
export const linearSearch = (data: readonly number[], target: number): LinearRun => {
	const visited: number[] = [];
	for (let i = 0; i < data.length; i++) {
		visited.push(i);
		if (data[i] === target) return {index: i, comparisons: visited.length, visited};
	}
	return {index: -1, comparisons: visited.length, visited};
};

export type Cmp = 'eq' | 'lt' | 'gt'; // datos[mid] comparado con el objetivo: igual, menor o mayor

export type Step = {
	low: number;
	high: number;
	mid: number;
	value: number;
	/** resultado de comparar datos[mid] con el objetivo */
	cmp: Cmp;
	/** límites después del paso (iguales a los de entrada si se encontró) */
	nextLow: number;
	nextHigh: number;
	/** mitad descartada (índices inclusivos), o null si se encontró */
	discard: null | {side: 'left' | 'right'; from: number; to: number};
};

export type BinaryRun = {index: number; comparisons: number; steps: Step[]; finalLow: number; finalHigh: number};

/**
 * Búsqueda binaria iterativa con traza. Es la traducción literal del método Java del video:
 *   while (low <= high) { mid = low + (high - low) / 2; ... low = mid + 1 | high = mid - 1 }
 * No exige que `data` esté ordenado: así la escena «sin orden» muestra, con el algoritmo real,
 * cómo se descarta la mitad equivocada.
 */
export const binarySearch = (data: readonly number[], target: number): BinaryRun => {
	let low = 0;
	let high = data.length - 1;
	const steps: Step[] = [];
	while (low <= high) {
		const mid = low + Math.floor((high - low) / 2);
		const value = data[mid];
		if (value === target) {
			steps.push({low, high, mid, value, cmp: 'eq', nextLow: low, nextHigh: high, discard: null});
			return {index: mid, comparisons: steps.length, steps, finalLow: low, finalHigh: high};
		}
		if (value < target) {
			steps.push({low, high, mid, value, cmp: 'lt', nextLow: mid + 1, nextHigh: high, discard: {side: 'left', from: low, to: mid}});
			low = mid + 1;
		} else {
			steps.push({low, high, mid, value, cmp: 'gt', nextLow: low, nextHigh: mid - 1, discard: {side: 'right', from: mid, to: high}});
			high = mid - 1;
		}
	}
	return {index: -1, comparisons: steps.length, steps, finalLow: low, finalHigh: high};
};

export type Call = {depth: number; low: number; high: number; mid: number | null; result: 'found' | 'empty' | 'recurse'};

/** Búsqueda binaria recursiva con la pila de llamadas que genera (traducción literal del método Java). */
export const binarySearchRecursive = (data: readonly number[], target: number): {index: number; calls: Call[]; maxDepth: number} => {
	const calls: Call[] = [];
	const go = (low: number, high: number, depth: number): number => {
		if (low > high) {
			calls.push({depth, low, high, mid: null, result: 'empty'});
			return -1;
		}
		const mid = low + Math.floor((high - low) / 2);
		if (data[mid] === target) {
			calls.push({depth, low, high, mid, result: 'found'});
			return mid;
		}
		calls.push({depth, low, high, mid, result: 'recurse'});
		return data[mid] < target ? go(mid + 1, high, depth + 1) : go(low, mid - 1, depth + 1);
	};
	const index = go(0, data.length - 1, 1);
	return {index, calls, maxDepth: calls.length};
};

/** La misma búsqueda binaria sobre cualquier tipo comparable (números o palabras): devuelve los puntos medios visitados. */
export const probe = <T extends number | string>(data: readonly T[], target: T): {index: number; mids: number[]; lows: number[]; highs: number[]} => {
	let low = 0;
	let high = data.length - 1;
	const mids: number[] = [];
	const lows: number[] = [];
	const highs: number[] = [];
	while (low <= high) {
		const mid = low + Math.floor((high - low) / 2);
		mids.push(mid);
		lows.push(low);
		highs.push(high);
		if (data[mid] === target) return {index: mid, mids, lows, highs};
		if (data[mid] < target) low = mid + 1;
		else high = mid - 1;
	}
	return {index: -1, mids, lows, highs};
};

/**
 * Búsqueda de límite inferior: primera posición cuyo valor es ≥ x (data.length si no hay ninguna).
 * Es la búsqueda binaria con un pequeño ajuste: no se detiene al encontrar un igual, sigue hacia la izquierda.
 */
export const lowerBound = (data: readonly number[], x: number): {index: number; mids: number[]; lows: number[]; highs: number[]} => {
	let low = 0;
	let high = data.length; // intervalo semiabierto [low, high)
	const mids: number[] = [];
	const lows: number[] = [];
	const highs: number[] = [];
	while (low < high) {
		const mid = low + Math.floor((high - low) / 2);
		mids.push(mid);
		lows.push(low);
		highs.push(high - 1);
		if (data[mid] < x) low = mid + 1;
		else high = mid;
	}
	return {index: low, mids, lows, highs};
};

/** Colección ordenada reproducible de tamaño n: 3, 7, 11, ... (la misma progresión del arreglo de la demostración). */
export const sortedData = (n: number): number[] => Array.from({length: n}, (_, i) => 3 + 4 * i);

/** Objetivo reproducible: el valor ubicado en la posición ⌊0,75·n⌋. */
export const targetAt75 = (data: readonly number[]) => data[Math.floor(data.length * 0.75)];

export const RACE_SIZES = [16, 32, 64, 128, 1024] as const;

/** Ejecuta ambos algoritmos sobre la misma entrada y el mismo objetivo para cada tamaño. */
export const race = () =>
	RACE_SIZES.map((n) => {
		const data = sortedData(n);
		const target = targetAt75(data);
		const lin = linearSearch(data, target);
		const bin = binarySearch(data, target);
		return {n, target, targetIndex: Math.floor(n * 0.75), lin, bin};
	});

/** Arreglos usados en el video. */
export const DEMO = sortedData(16); // [3, 7, 11, ..., 63]
export const SMALL = [2, 5, 8, 12, 16, 23, 38];
export const UNSORTED = [15, 3, 31, 20, 9, 7, 26];
