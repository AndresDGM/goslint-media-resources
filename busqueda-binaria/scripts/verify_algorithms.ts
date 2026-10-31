/**
 * Verificación de los algoritmos del video (los mismos módulos que usan las escenas).
 * Uso: node --experimental-strip-types scripts/verify_algorithms.ts
 */
import {DEMO, SMALL, UNSORTED, binarySearch, binarySearchRecursive, linearSearch, lowerBound, probe, race, sortedData} from '../src/algo/search.ts';

let failures = 0;
const check = (name: string, ok: boolean, extra = '') => {
	if (!ok) failures++;
	console.log(`${ok ? 'OK  ' : 'FALLA'} ${name}${extra ? ' — ' + extra : ''}`);
};
const fmt = (r: ReturnType<typeof binarySearch>) => r.steps.map((s) => `[low=${s.low} mid=${s.mid} high=${s.high} v=${s.value} ${s.cmp}]`).join(' → ');

console.log('DEMO =', JSON.stringify(DEMO));
const a = binarySearch(DEMO, 43);
console.log('buscar 43:', fmt(a), '=>', a.index);
check('43 presente en índice 10 con 4 comparaciones', a.index === 10 && a.comparisons === 4);
check('43: mids 7, 11, 9, 10', a.steps.map((s) => s.mid).join() === '7,11,9,10');
const b = binarySearch(DEMO, 42);
console.log('buscar 42:', fmt(b), '=> low', b.finalLow, 'high', b.finalHigh, '=>', b.index);
check('42 ausente: -1 y termina con low=10 > high=9', b.index === -1 && b.finalLow === 10 && b.finalHigh === 9);
const s = binarySearch(SMALL, 16);
console.log('SMALL', JSON.stringify(SMALL), 'buscar 16:', fmt(s), '=>', s.index);
check('escena del machete: descarta izquierda, luego derecha, luego encuentra', s.steps.map((x) => x.discard?.side ?? 'found').join() === 'left,right,found' && s.index === 4);
const u = binarySearch(UNSORTED, 7);
console.log('UNSORTED', JSON.stringify(UNSORTED), 'buscar 7:', fmt(u), '=>', u.index, '(el 7 está en', UNSORTED.indexOf(7) + ')');
check('sin orden: el primer corte descarta la mitad que contiene el 7', u.steps[0].discard!.from <= UNSORTED.indexOf(7) && UNSORTED.indexOf(7) <= u.steps[0].discard!.to && u.index === -1);

// iterativa == recursiva == lineal, presentes y ausentes, en muchos tamaños
let agree = true;
let shrink = true;
for (const n of [0, 1, 2, 3, 7, 16, 31, 64, 100, 1024]) {
	const d = sortedData(n);
	for (const t of [...d, ...d.map((x) => x + 1), -5, 1e9]) {
		const it = binarySearch(d, t);
		const re = binarySearchRecursive(d, t);
		const li = linearSearch(d, t);
		if (it.index !== re.index || it.index !== li.index) agree = false;
		if (re.calls.length !== it.comparisons + (it.index === -1 ? 1 : 0)) agree = false;
		for (const st of it.steps) {
			if (st.discard && !(st.nextHigh - st.nextLow < st.high - st.low)) shrink = false; // el intervalo siempre se reduce
			if (st.mid !== st.low + Math.floor((st.high - st.low) / 2)) shrink = false;
		}
		if (n > 0 && it.comparisons > Math.floor(Math.log2(n)) + 1) shrink = false; // peor caso ⌊log2 n⌋ + 1
	}
}
check('iterativa, recursiva y lineal devuelven lo mismo (presentes y ausentes)', agree);
check('cada paso reduce el intervalo; mid = low + (high-low)/2; comparaciones ≤ ⌊log2 n⌋ + 1', shrink);

// variantes usadas en «ejemplos prácticos»
const palabras = ['algoritmo', 'arreglo', 'binaria', 'ciclo', 'grafo', 'machete', 'nodo', 'pila'];
check('probe encuentra palabras en un diccionario ordenado', palabras.every((w, i) => probe(palabras, w).index === i) && probe(palabras, 'zeta').index === -1);
const puntajes = [41, 55, 62, 74, 80, 80, 87, 93];
let lbOk = true;
for (let x = 30; x <= 100; x++) {
	const want = puntajes.findIndex((v) => v >= x);
	if (lowerBound(puntajes, x).index !== (want === -1 ? puntajes.length : want)) lbOk = false;
}
check('lowerBound devuelve la primera posición con valor ≥ x (aquí, primer puntaje ≥ 80 → índice 4)', lbOk && lowerBound(puntajes, 80).index === 4);

console.log('\nCarrera (misma colección ordenada, objetivo en la posición ⌊0,75·n⌋):');
for (const r of race()) console.log(`  n=${String(r.n).padStart(5)}  objetivo=${r.target} (índice ${r.targetIndex})  lineal=${r.lin.comparisons}  binaria=${r.bin.comparisons}  mids=${r.bin.steps.map((x) => x.mid).join(',')}`);

// último reto: un millón de elementos
const M = sortedData(1_000_000);
for (const idx of [0, 1, 123_456, 600_000, 742_118, 999_999]) console.log(`  n=1.000.000 índice ${idx}: binaria=${binarySearch(M, M[idx]).comparisons}`);
const rec = binarySearchRecursive(DEMO, 43);
console.log('recursiva 43:', rec.calls.map((c) => `buscar(${c.low},${c.high})${c.result === 'found' ? '→' + c.mid : ''}`).join(' → '), 'profundidad', rec.maxDepth);
console.log(failures ? `\n${failures} verificaciones fallaron` : '\nTodas las verificaciones pasaron');
process.exit(failures ? 1 : 0);
