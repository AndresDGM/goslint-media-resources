import {M, V} from './timeline';
import {linearSearch} from './algo/search';

/**
 * Momentos clave compartidos por las escenas y por la hoja de efectos de sonido
 * (así imagen y sonido salen siempre del mismo número).
 */
export type StepTiming = {mid: number; cmp?: number; hit: number};

/** Apertura: el logotipo golpea en el compás 2. */
export const LOGO_AT = 120;

/** 01 · búsqueda lineal: instante en que se revisa cada posición. */
export const ROW = [4, 9, 15, 21, 26, 33, 40, 47, 51, 58];
export const LIN = linearSearch(ROW, 58);
export const linealChecks = (): number[] => {
	const e = [M('s02', 'e1'), M('s02', 'e2'), M('s02', 'e3')];
	const diez = M('s02', 'diez');
	return LIN.visited.map((_, k) => (k < 3 ? e[k] : Math.round(e[2] + 16 + ((k - 3) * (diez + 12 - e[2] - 16)) / (LIN.visited.length - 4))));
};

/** 03 · dividir y machetear (arreglo de 7, objetivo 16). */
export const macheteTiming = (): StepTiming[] => [
	{mid: M('s04', 'mid'), cmp: M('s05', 'mayor'), hit: M('s05', 'zas1')},
	{mid: M('s05', 'centro2'), cmp: M('s05', 'menor'), hit: M('s05', 'zas2')},
	{mid: M('s05', 'queda'), cmp: M('s05', 'queda') + 14, hit: M('s05', 'found')},
];
export const DRAW_AT = () => M('s04', 'dym') + 6;

/** 04 · sin orden: el corte equivocado. */
export const ordenHit = () => M('s06', 'zas') - 34;

/** 05 · paso a paso: 43 (presente) y 42 (ausente). */
export const demoA = (): StepTiming[] => [
	{mid: M('s07', 'mid7'), cmp: M('s07', 'cmp1'), hit: M('s07', 'zas1')},
	{mid: M('s07', 'mid11'), cmp: M('s07', 'cmp2'), hit: M('s07', 'zas2')},
	{mid: M('s07', 'mid9'), cmp: M('s07', 'cmp3'), hit: M('s07', 'zas3')},
	{mid: M('s07', 'coinciden') + 50, cmp: M('s07', 'coinciden') + 62, hit: M('s07', 'found')},
];
export const demoSwap = () => V.s08.start - 34;
export const demoB = (): StepTiming[] => {
	const cam = M('s08', 'camino');
	return [
		{mid: cam - 6, cmp: cam, hit: cam + 20},
		{mid: cam + 34, cmp: cam + 38, hit: cam + 54},
		{mid: cam + 68, cmp: cam + 72, hit: cam + 88},
		{mid: Math.max(M('s08', 'llega') + 8, cam + 106), cmp: M('s08', 'cmp'), hit: M('s08', 'high9')},
	];
};

/** 10 · cierre: último reto y remate. */
export const BIG_COMPARISONS = 20; // se verifica contra la ejecución real en scenes/E.tsx
export const cierreBeats = () => {
	const zas = M('s15', 'zas');
	const veinte = M('s15', 'veinte');
	const stepGap = (veinte + 16 - zas) / BIG_COMPARISONS;
	return {zas, veinte, stepGap, hit: M('s15', 'dym') + 4, gos: M('s15', 'goslint')};
};
