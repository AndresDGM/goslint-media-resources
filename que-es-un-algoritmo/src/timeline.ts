import {FPS} from '@commons/theme';
import manifest from '../scripts/vo_manifest.json';
import LEVELS from './vo-levels.json';

/**
 * Línea de tiempo del video «¿Qué es un algoritmo?».
 *
 * Los tiempos de escena, cámara y SFX siguen escritos contra `t('m:ss.s')` (tiempo del storyboard).
 * Lo que cambió con la voz real: `t()` ya no devuelve el tiempo del storyboard, sino el tiempo
 * re-mapeado a las tomas de Vee. Las anclas son los inicios de las 64 locuciones: cada corte que
 * el storyboard ponía en el inicio de una línea cae ahora exactamente cuando Vee empieza a hablar.
 * Entre anclas, los acontecimientos visuales se estiran o se comprimen de forma lineal.
 *
 * El encadenado respeta el storyboard cuando hay hueco y, cuando la toma es más larga que su hueco,
 * empuja la siguiente locución lo justo para que no se pisen (0,25 s de separación). La última toma
 * termina antes de 7:30, así que la duración del video no cambia.
 */

/** Tiempo del storyboard en segundos, sin re-mapear. Acepta '1:08', '1:08.5' o segundos (68). */
const rawSeconds = (x: string | number): number => {
	if (typeof x === 'number') return x;
	const [m, s] = x.split(':');
	return Number(m) * 60 + Number(s);
};

/** Duración real de cada toma (medida con `afinfo`; ver scripts/vo_manifest.json). */
const DUR: Record<string, number> = Object.fromEntries(
	(manifest as {tomas: {id: string; duracion_s: number}[]}).tomas.map((x) => [x.id, x.duracion_s]),
);

/** Inicio previsto de cada locución en el storyboard (y número de palabras, solo como referencia). */
const PLAN: [string, string, number][] = [
	['V01', '0:01', 12], ['V02', '0:06', 7], ['V03', '0:09', 4], ['V04', '0:12', 5], ['V05', '0:20', 8], ['V06', '0:27', 6], ['V07', '0:32', 30],
	['V08', '0:45', 18], ['V09', '0:54', 7], ['V10', '0:58', 11], ['V11', '1:03', 15], ['V12', '1:08', 17], ['V13', '1:16', 1], ['V14', '1:19', 18], ['V15', '1:27', 4], ['V16', '1:31', 12],
	['V17', '1:35', 12], ['V18', '1:39', 11], ['V19', '1:45', 14], ['V20', '1:51', 15], ['V21', '1:56', 15], ['V22', '2:04', 12],
	['V23', '2:15', 11], ['V24', '2:19', 14], ['V25', '2:29', 2], ['V26', '2:35', 2], ['V27', '2:39', 5], ['V28', '2:49', 9], ['V29', '3:03', 3], ['V30', '3:05', 14], ['V31', '3:12', 22], ['V32', '3:21', 28], ['V33', '3:27', 21],
	['V34', '3:35', 9], ['V35', '3:41', 10], ['V36', '3:45', 9], ['V37', '3:58', 8], ['V38', '4:05', 9], ['V39', '4:13', 11], ['V40', '4:19', 11], ['V41', '4:27', 3], ['V42', '4:30', 10],
	['V43', '4:41', 12], ['V44', '4:46', 11], ['V45', '4:51', 10], ['V46', '5:00', 11], ['V47', '5:04', 5], ['V48', '5:09', 25], ['V49', '5:22', 5], ['V50', '5:26', 3], ['V51', '5:30', 20], ['V52', '5:38', 26],
	['V53', '5:45', 15], ['V54', '5:50', 17], ['V55', '5:55', 18], ['V56', '6:03', 20], ['V57', '6:12', 14], ['V58', '6:21', 23], ['V59', '6:28', 25], ['V60', '6:41', 7],
	['V61', '6:55', 15], ['V62', '7:02', 21], ['V63', '7:09', 18], ['V64', '7:16', 14],
];

for (const [id] of PLAN) if (!DUR[id]) throw new Error(`Falta la duración de ${id} en scripts/vo_manifest.json`);

/** Separación mínima entre el final de una toma y el inicio de la siguiente. */
const GAP = 0.25;

/** Inicio real de cada locución: el del storyboard si cabe; si no, detrás de la toma anterior. */
const VO_START: Record<string, number> = {};
{
	let prevEnd = -Infinity;
	for (const [id, at] of PLAN) {
		const start = Math.max(rawSeconds(at), prevEnd + GAP);
		VO_START[id] = start;
		prevEnd = start + DUR[id];
	}
}

const STORY_END = rawSeconds('7:30');
if (VO_START[PLAN[PLAN.length - 1][0]] + DUR[PLAN[PLAN.length - 1][0]] > STORY_END) {
	throw new Error('Las tomas de Vee ya no caben en 7:30; hay que extender la duración o acortar tomas');
}

/** Anclas [tiempo de storyboard, tiempo real] del re-mapeo. */
const ANCHORS: [number, number][] = [
	[0, 0],
	...PLAN.map(([id, at]) => [rawSeconds(at), VO_START[id]] as [number, number]),
	[STORY_END, STORY_END],
];

/** Tiempo del storyboard → fotograma absoluto, re-mapeado a las tomas de Vee. */
export const t = (x: string | number): number => {
	const r = Math.max(0, rawSeconds(x));
	for (let i = 0; i < ANCHORS.length - 1; i++) {
		const [ra, na] = ANCHORS[i];
		const [rb, nb] = ANCHORS[i + 1];
		if (r <= rb) {
			const u = (r - ra) / Math.max(1e-9, rb - ra);
			return Math.round((na + (nb - na) * u) * FPS);
		}
	}
	return Math.round(ANCHORS[ANCHORS.length - 1][1] * FPS);
};

export type BlockId = 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'b7';
/** Rango [inicio, fin) de cada bloque en fotogramas. */
export const BLOCKS: Record<BlockId, [number, number]> = {
	b1: [t('0:00'), t('0:45')],
	b2: [t('0:45'), t('1:35')],
	b3: [t('1:35'), t('2:15')],
	b4: [t('2:15'), t('3:35')],
	b5: [t('3:35'), t('5:45')],
	b6: [t('5:45'), t('6:55')],
	b7: [t('6:55'), t('7:30')],
};
export const DURATION = t('7:30');

export type VoId = string;
/** Ventana real de cada locución: inicio y fin en fotogramas, según la toma de ElevenLabs. */
export const VO: Record<VoId, {start: number; end: number}> = {};
for (const [id] of PLAN) {
	const start = Math.round(VO_START[id] * FPS);
	VO[id] = {start, end: start + Math.ceil(DUR[id] * FPS)};
}

/** ¿Está hablando Vee en el fotograma f? */
export const speaking = (f: number): boolean => {
	for (const v of Object.values(VO)) if (f >= v.start && f < v.end) return true;
	return false;
};

const LEVELS_BY_ID = LEVELS as Record<string, number[]>;

/**
 * Nivel de voz 0–3 para la boca de Vee, medido de la propia toma (RMS por fotograma, 30 fps).
 * 0 = cerrada, 1 = media, 2–3 = abierta.
 */
export const talkLevel = (f: number): number => {
	for (const [id, v] of Object.entries(VO)) {
		if (f < v.start || f >= v.end) continue;
		const levels = LEVELS_BY_ID[id];
		if (!levels || levels.length === 0) return 0;
		const i = Math.max(0, Math.min(levels.length - 1, f - v.start));
		return levels[i] ?? 0;
	}
	return 0;
};
