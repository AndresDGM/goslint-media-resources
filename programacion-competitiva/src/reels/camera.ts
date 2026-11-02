import {Easing, interpolate} from 'remotion';
import {M, SC, V} from '../timeline';

/**
 * Cámara virtual de los reels: en cada momento enfoca una zona del cuadro 16:9 (coordenadas
 * 1920×1080) con un zoom `z` (1 = un píxel de la escena por píxel del reel). Los planos se escriben
 * contra las mismas marcas de la voz que mueven la animación, y entre plano y plano hay un
 * movimiento rápido de 14 fotogramas.
 */
export type Shot = {at: number; cx: number; cy: number; z: number};
const sh = (at: number, cx: number, cy: number, z: number): Shot => ({at, cx, cy, z});
const FULL = (at: number) => sh(at, 960, 540, 0.62);

export const SHOTS: Shot[] = (() => {
	const k2 = (m: string) => M('s02', m), k3 = (m: string) => M('s03', m), k4 = (m: string) => M('s04', m);
	const k5 = (m: string) => M('s05', m), k6 = (m: string) => M('s06', m), k7 = (m: string) => M('s07', m), k8 = (m: string) => M('s08', m);
	const v = [k4('wa'), k4('tle'), k4('rte'), k4('ac')];
	const xs = [250, 680, 1110, 1560];
	return [
		// 01 · ¿qué es?
		sh(SC.que[0], 640, 300, 0.95), sh(k2('resolver') - 4, 460, 400, 1.0), sh(k2('algoritmos') + 10, 840, 400, 1.0),
		sh(k2('funcione') - 4, 520, 560, 0.95), sh(k2('correcta') - 4, 640, 650, 0.9), sh(k2('logica') - 6, 400, 380, 1.05), sh(k2('conoc') - 6, 660, 600, 0.95),
		sh(k2('practica') - 4, 1000, 640, 0.9), sh(k2('nombre') - 4, 560, 300, 1.0), sh(k2('software') - 6, 680, 620, 0.95),
		// 02 · los problemas
		sh(SC.problema[0], 560, 280, 1.0), sh(k3('enunciado') - 10, 560, 520, 1.0), sh(k3('salida') - 4, 560, 700, 1.0),
		sh(k3('entender') - 6, 1240, 520, 1.0), sh(k3('implementas') - 4, 1250, 700, 1.05),
		// 03 · jueces
		sh(SC.juez[0], 560, 260, 1.0), sh(k4('jueces'), 460, 420, 1.0), sh(k4('ejecutan') + 10, 900, 420, 0.9), sh(k4('verifican') - 4, 600, 640, 0.95),
		...v.flatMap((t) => [sh(t - 42, 500, 420, 1.0), sh(t - 14, 480, 700, 1.15), sh(t, 1230, 330, 1.1)]),
		sh(k4('ejemplo'), 520, 700, 1.05), sh(k4('todos') - 6, 700, 560, 0.75), sh(k4('desafio'), 1600, 650, 1.0),
		// 04 · la ICPC
		sh(SC.icpc[0], 560, 260, 1.0), sh(k5('icpc') - 4, 420, 420, 1.0), sh(k5('siglas') - 4, 800, 440, 0.82), sh(k5('universitarios') - 4, 500, 560, 0.95),
		sh(k5('equipos') - 6, 960, 400, 0.85), sh(k5('uncomp') - 4, 960, 720, 1.1), FULL(k5('si') - 8), sh(k5('si') + 30, 960, 500, 1.05),
		sh(k5('comunicarte') - 8, 820, 660, 1.0), sh(k5('decidir') - 4, 1220, 660, 1.0), sh(k5('equipo') - 4, 1060, 680, 0.85), sh(k5('reloj') - 4, 960, 480, 0.9),
		// 05 · el camino
		sh(SC.camino[0], 640, 300, 0.85), ...['nacional', 'regional', 'latam', 'world'].map((m, i) => sh(k6(m) - 14, xs[i], 600, 1.0)),
		sh(k6('mejores'), xs[3] - 60, 700, 0.95), sh(k6('recorrido') - 6, 960, 520, 0.9),
		// 06 · Colombia
		sh(SC.colombia[0], 1430, 520, 0.95), sh(k7('maraton') - 4, 520, 360, 1.0), sh(k7('oficial') - 4, 520, 520, 1.0), sh(k7('presencial') - 8, 1430, 520, 0.95),
		sh(k7('presencial') + 40, 520, 620, 1.0), sh(k7('mejores') - 8, 1430, 470, 0.95), sh(k7('mejores') + 36, 600, 720, 1.0), FULL(k7('asi') - 8), sh(k7('asi') + 40, 760, 440, 0.8),
		// 07 · UCEVA
		sh(SC.uceva[0], 560, 260, 1.0), sh(k8('lejos') - 4, 520, 380, 1.0), sh(k8('goslint') - 4, 560, 460, 0.9),
		sh(k8('aprender') - 8, 880, 620, 0.66), sh(k8('maratones') - 8, 480, 300, 1.0), sh(k8('familiar') - 4, 480, 560, 1.0), sh(k8('vivir') + 10, 1320, 520, 0.9),
		sh(k8('d2024') - 8, 520, 420, 0.95), sh(k8('d2026') - 4, 1400, 420, 0.95),
		sh(k8('icpc') - 8, 460, 500, 0.95), sh(k8('icpc') + 26, 1130, 380, 0.95), sh(k8('icpc') + 50, 1460, 660, 0.95),
		sh(k8('camp') - 8, 900, 560, 0.7), sh(k8('camp') + 24, 1500, 640, 0.95), sh(k8('nosolo') - 8, 560, 260, 1.0), sh(k8('proyectos') - 4, 740, 580, 0.85),
		// cierre: únete a GOSLINT
		sh(SC.final[0], 900, 470, 0.85), sh(M('s10', 'nos') - 4, 1000, 640, 0.75),
	].sort((a, b) => a.at - b.at);
})();

const MOVE = 14;
/** Plano actual (con transición rápida desde el anterior) para un fotograma del video principal. */
export const camera = (src: number) => {
	let i = -1;
	for (let j = 0; j < SHOTS.length; j++) if (SHOTS[j].at <= src) i = j;
	if (i < 0) return {...SHOTS[0], moving: false};
	const cur = SHOTS[i];
	const prev = SHOTS[i - 1] ?? cur;
	const t = interpolate(src, [cur.at, cur.at + MOVE], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
	const drift = 1 + 0.03 * interpolate(src, [cur.at, cur.at + 240], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return {cx: prev.cx + (cur.cx - prev.cx) * t, cy: prev.cy + (cur.cy - prev.cy) * t, z: (prev.z + (cur.z - prev.z) * t) * drift, moving: t < 1};
};
export const ENDS = V; // (referencia para depurar)
