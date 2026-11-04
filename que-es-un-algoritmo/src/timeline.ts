import {FPS} from '@commons/theme';

/**
 * Línea de tiempo del video «¿Qué es un algoritmo?», tomada del storyboard aprobado
 * (PREPRODUCCION.md, sección C). Todo se escribe contra `t('m:ss.s')` (tiempo del storyboard) o
 * contra `VO.V12.start`, nunca contra fotogramas sueltos. Cuando llegue la voz real de Vee,
 * se ajustan `VO` (inicio y duración medidos) y, si hace falta, los tiempos de cada bloque.
 */

/** Tiempo del storyboard → fotograma absoluto. Acepta '1:08', '1:08.5' o segundos (68). */
export const t = (x: string | number): number => {
	if (typeof x === 'number') return Math.round(x * FPS);
	const [m, s] = x.split(':');
	return Math.round((Number(m) * 60 + Number(s)) * FPS);
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

/** Inicio previsto de cada locución de Vee (storyboard) y número de palabras (para estimar su duración). */
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

export type VoId = string;
/** Ventana de cada locución: start/end en fotogramas. La duración se estima a 2,6 palabras/s hasta tener la voz real. */
export const VO: Record<VoId, {start: number; end: number}> = {};
PLAN.forEach(([id, at, words], i) => {
	const start = t(at);
	const next = i < PLAN.length - 1 ? t(PLAN[i + 1][1]) : DURATION;
	const est = Math.round((words / 2.6) * FPS) + 8;
	VO[id] = {start, end: Math.min(next - 2, start + est)};
});

/** ¿Está hablando Vee en el fotograma f? */
export const speaking = (f: number): boolean => Object.values(VO).some((v) => f >= v.start && f < v.end);

/**
 * Nivel de voz 0–3 (mueve la boca de Vee). Provisional: un patrón silábico determinista
 * mientras habla; con la voz real se sustituye por la envolvente medida del audio.
 */
export const talkLevel = (f: number): number => {
	if (!speaking(f)) return 0;
	const k = Math.floor(f / 3);
	const v = Math.abs(Math.sin(k * 1.7) + Math.sin(k * 0.6));
	return v > 1.2 ? 3 : v > 0.7 ? 2 : v > 0.25 ? 1 : 0;
};
