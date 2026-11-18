import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inCubic, inOutCubic, outCubic, pop, rnd, tween} from '@commons/lib';
import {CutFlash, GlitchBurst, Shockwave, WipeBar, shake} from '@commons/components';
import {Hit, In} from '@commons/vertical';
import {Buf, PixelBurst, PixelSprite} from '@commons/pixel';
import {Barrido, Iris, Slam, SpeedLines} from '@commons/transiciones';
import {at, BLOCKS, end} from '../timeline';
import {s, Sfx} from '../sfx';
import {
	Board, Cam, ChoiceButton, CornerTag, Counter, Cup, CupFill, FLOOR, InstrCard, Kettle, Kitchen, LIQ, lerpPt, Line, MeasureJug, MilkJug, Pour, Put, Robot, RobotFace, RobotPose,
	robotRest, ROBOT_X, Shot, SLOT, Splash, Spoon, Stamp, STOVE_X, STOVE_Y, SHELF_Y, SugarBowl, CoffeeJar, TABLE_Y, Tag, Vee, VeeAct, VEE_X, VHS,
} from '../kit';

/* ================================================================== Bloque 5 · segunda mitad «Los dos caminos» (V43–V52) */

type Pt = [number, number];

/** Marcas de la voz que usa el bloque (fotogramas absolutos). */
const T = {
	b0: at('V43') - 6, // = B5_CUT (src/scenes/B5.tsx); no se importa para evitar el ciclo
	b1: BLOCKS.b5[1],
	// V43
	v43: at('V43'),
	retro: at('V43', 'retrocedamos'),
	momento: at('V43', 'momento'),
	que1: at('V43', 'que', 1),
	resp: at('V43', 'respondi'),
	no: at('V43', 'no'),
	e43: end('V43'),
	// V44
	v44: at('V44'),
	salta: at('V44', 'salca'), // el reconocedor escribió «salca»
	sigue: at('V44', 'sigue'),
	e44: end('V44'),
	// V45
	v45: at('V45'),
	algo45: at('V45', 'algoritmo'),
	dos45: at('V45', 'dos'),
	caminos: at('V45', 'caminos'),
	todo: at('V45', 'todo'),
	depende: at('V45', 'depende'),
	respuesta: at('V45', 'respuesta'),
	e45: end('V45'),
	// V46
	v46: at('V46'),
	camino46: at('V46', 'camino'),
	azucar46: at('V46', 'azucar'),
	ahora: at('V46', 'ahora'),
	cien: at('V46', '100'),
	mili: at('V46', 'mililitros'),
	leche: at('V46', 'leche'),
	e46: end('V46'),
	// V47
	v47: at('V47'),
	toma: at('V47', 'toma'),
	cuch47: at('V47', 'cuchara'),
	revuelve: at('V47', 'revuelve'),
	e47: end('V47'),
	// V48
	v48: at('V48'),
	deja: at('V48', 'deja'),
	mesa: at('V48', 'mesa'),
	hasta: at('V48', 'hasta'),
	decirlo: at('V48', 'decirlo'),
	sino: at('V48', 'si', 2),
	queda: at('V48', 'queda'),
	cuch48: at('V48', 'cuchara', 2),
	mano: at('V48', 'mano'),
	siempre: at('V48', 'siempre'),
	e48: end('V48'),
	// V49
	v49: at('V49'),
	servir: at('V49', 'servir'),
	cafe49: at('V49', 'cafe'),
	e49: end('V49'),
	// V50
	v50: at('V50'),
	mmm: at('V50', 'mmm'),
	ahora50: at('V50', 'ahora'),
	e50: end('V50'),
	// V51
	v51: at('V51'),
	algs: at('V51', 'algoritmos'),
	segundo: at('V51', 'segundo'),
	que51: at('V51', 'que', 1),
	cuanto: at('V51', 'cuanto'),
	donde: at('V51', 'donde'),
	en51: at('V51', 'en', 2),
	orden: at('V51', 'orden'),
	e51: end('V51'),
	// V52
	v52: at('V52'),
	robot52: at('V52', 'robot'),
	ese: at('V52', 'ese'),
	nivel: at('V52', 'nivel'),
	detalle: at('V52', 'detalle'),
	larg: at('V52', 'larguisimas'),
	tienen: at('V52', 'tienen', 2),
	claras: at('V52', 'claras'),
	quien: at('V52', 'quien'),
	ejecuta: at('V52', 'ejecuta'),
	e52: end('V52'),
};
/** Vuelta a la cocina en el camino A (cierre de iris al terminar la pantalla partida). */
const BACK = T.v46 - 8;

/* ------------------------------------------------------------------ geometría de la cocina */

const RX = ROBOT_X;
const restF = robotRest(RX, FLOOR, 'F');
const restB = robotRest(RX, FLOOR, 'B');
const CUP_LIQ_X = SLOT[0] - 16.5; // centro del líquido de la taza
const CUP_SURF = TABLE_Y - 99; // superficie del líquido (nivel 1)
const CUP_PT: Pt = [SLOT[0], TABLE_Y - 55]; // centro de la taza
const JUG_PT: Pt = [SLOT[3], TABLE_Y - 66]; // centro de la jarra de leche
const BOWL_X = SLOT[2];
const MEAS_X = 1340; // la jarra medidora, en el borde delantero de la mesa
const MEAS_Y = TABLE_Y + 22;
const MEAS_PT: Pt = [MEAS_X, MEAS_Y - 66];
const SPOON_A: Pt = [1490, 716]; // la cuchara, acostada en el borde delantero
const SPOON_B: Pt = [1240, 716]; // donde la deja
const STIR_C: Pt = [CUP_LIQ_X, 560]; // mano al revolver (la punta queda dentro de la taza)
const HIGH: Pt = [1020, 430];
const CUPV: Pt = [560, 650]; // la taza servida, frente a Vee
const TIP_JUG = 128;
const TIP_MEAS = 100;

const rot = (dx: number, dy: number, deg: number): Pt => {
	const r = (deg * Math.PI) / 180;
	return [dx * Math.cos(r) - dy * Math.sin(r), dx * Math.sin(r) + dy * Math.cos(r)];
};
/** Pico de la jarra de leche (10×12 a escala 11, gira sobre el 30 % de su alto), sostenida por el centro en `hand`. */
const jugMouth = (hand: Pt, tip: number): Pt => {
	const [dx, dy] = rot(-5.5, -39.6, tip);
	return [hand[0] + dx, hand[1] - 26.4 + dy];
};
/** Mano necesaria para que el pico de la jarra quede en `mouth`. */
const jugHandFor = (mouth: Pt, tip: number): Pt => {
	const o = jugMouth([0, 0], tip);
	return [mouth[0] - o[0], mouth[1] - o[1]];
};
/** Borde de vertido de la jarra medidora (gira sobre el 40 % de su alto). */
const measLip = (hand: Pt, tip: number): Pt => {
	const [dx, dy] = rot(38.5, -52.8, tip);
	return [hand[0] + dx, hand[1] - 13.2 + dy];
};
const measHandFor = (lip: Pt, tip: number): Pt => {
	const o = measLip([0, 0], tip);
	return [lip[0] - o[0], lip[1] - o[1]];
};

const POUR_MEAS_HAND = jugHandFor([MEAS_X - 5.5, MEAS_Y - 132 - 44], TIP_JUG); // vierte en la medidora
const POUR_CUP_HAND = jugHandFor([CUP_LIQ_X, CUP_SURF - 50], TIP_JUG); // vierte directo en la taza (cámara rápida)
const POUR_CUP_MEAS = measHandFor([CUP_LIQ_X, CUP_SURF - 70], TIP_MEAS); // la medidora vierte en la taza

const seg = (f: number, a: number, b: number) => tween(f, a, b, 0, 1, inOutCubic);
const hop = (f: number, a: number) => (f >= a && f < a + 12 ? Math.sin(((f - a) / 12) * Math.PI) : 0);

/* ------------------------------------------------------------------ tiempos derivados */

/** Camino A (V46–V50): la medición y el vertido de la leche, el revuelto y el servicio. Todo con un solo brazo. */
const a0 = T.ahora;
const A = {
	cursor11: T.v46 + 8,
	grab: a0 + 10, // toma la jarra de leche
	tip0: a0 + 14, // la inclina sobre la medidora
	tip1: a0 + 22,
	pour1a: a0 + 22, // la leche cae en la medidora
	pour1b: a0 + 40,
	ret0: a0 + 45, // la jarra vuelve a su sitio
	ret1: a0 + 55,
	mg1: a0 + 63, // toma la medidora
	mt0: a0 + 67, // la lleva sobre la taza y la inclina
	mp0: a0 + 73, // vierte en la taza
	mp1: a0 + 87,
	mu1: a0 + 92, // la endereza
	mr1: a0 + 100, // la deja en la mesa
	sg1: a0 + 110, // toma la cuchara
	st0: T.revuelve + 3, // revuelve: 3 vueltas
	st1: T.revuelve + 3 + 36,
	dj0: T.deja + 1, // sale de la taza con la cuchara
	dj1: T.mesa - 2, // llega a la mesa
	dj2: T.mesa + 12,
	c1: T.v49 + 10, // toma la taza
	c2: T.v49 + 16, // la sube
};
/** Camino B en cámara rápida (V44): el tiempo local corre al doble (un fotograma real = 2 locales). */
const lb = (f: number) => (f - T.sigue) * 2;
const B = {
	grab: T.sigue + 7,
	pour0: T.sigue + 16,
	pourEnd: T.sigue + 26, // la taza pasa a café con leche
	jugBack: T.sigue + 35,
	stir0: T.sigue + 47,
	stir1: T.sigue + 65,
};

/* ------------------------------------------------------------------ cámara */

const sh = (f: number, z: number, x: number, y: number, mov?: number): Shot => (mov ? [f, z, x, y, mov] : [f, z, x, y]);
const SHOTS: Shot[] = [
	sh(T.b0, 1.1, 930, 590),
	sh(T.retro, 1.55, 1250, 610),
	sh(T.momento, 1.15, 900, 570),
	sh(T.que1, 1.25, 1000, 590),
	sh(T.no, 1.6, 930, 640),
	sh(T.v44, 1.2, 1000, 600),
	sh(T.salta, 1.5, 1150, 620),
	sh(T.sigue, 1.4, 1230, 610),
	sh(BACK, 1.0, 960, 540),
	sh(T.camino46, 1.15, 900, 570),
	sh(T.ahora, 1.6, 1280, 600),
	sh(A.ret0, 1.7, 1250, 610),
	sh(A.mt0, 1.9, 1150, 580),
	sh(A.mr1, 1.6, 1300, 640),
	sh(T.revuelve, 2.1, 1130, 610),
	sh(T.deja, 1.5, 1180, 640),
	sh(T.hasta, 1.15, 800, 570),
	sh(T.sino, 1.05, 900, 560),
	sh(T.v49, 1.0, 960, 560),
	sh(T.v50, 1.8, 533, 640),
];
const SHAKES = [T.no, B.pourEnd, A.mp1, T.mesa, T.ahora50, T.siempre + 2];

/** Réplica de la cámara del kit (sin sacudida) para llevar un punto de la escena a la pantalla. */
const camAt = (f: number) => {
	let i = 0;
	for (let k = 0; k < SHOTS.length; k++) if (f >= SHOTS[k][0]) i = k;
	const [a, z1, x1, y1, mv] = SHOTS[i];
	let z = z1;
	let cx = x1;
	let cy = y1;
	if (mv && i > 0) {
		const [, z0, x0, y0] = SHOTS[i - 1];
		const k = tween(f, a, a + mv, 0, 1, inOutCubic);
		z = z0 + (z1 - z0) * k;
		cx = x0 + (x1 - x0) * k;
		cy = y0 + (y1 - y0) * k;
	} else if (i > 0) z *= 1 + 0.06 * (1 - tween(f, a, a + 8));
	z *= 1 + 0.018 * Math.min(1, Math.max(0, f - a - (mv ?? 0)) / 150);
	if (z >= 1) {
		cx = Math.min(1920 - 960 / z, Math.max(960 / z, cx));
		cy = Math.min(1080 - 540 / z, Math.max(540 / z, cy));
	}
	return {z, cx, cy};
};
const proj = (f: number, p: Pt): Pt => {
	const {z, cx, cy} = camAt(f);
	return [960 + (p[0] - cx) * z, 540 + (p[1] - cy) * z];
};

/* ------------------------------------------------------------------ Vee */

const VEE_ACTS: [number, VeeAct, number?][] = [
	[T.retro, 'sorpresa', 2.4],
	[T.que1, 'pensar', 2.6],
	[T.no, 'senalar', 2.8],
	[T.salta, 'senalar', 3],
	[T.sigue, 'explicar', 3],
	[T.camino46 + 6, 'senalar', 3],
	[T.cien, 'explicar', 3],
	[T.revuelve, 'senalar', 3],
	[T.deja, 'explicar', 3],
	[T.hasta, 'senalar', 2.8],
	[T.sino, 'pensar', 2.8],
	[T.mano, 'sorpresa', 2.8],
	[T.servir, 'senalar', 3],
	[T.mmm, 'pensar', 2.2],
	[T.ahora50, 'celebrar', 2],
];
const VEE_X_KEYS: [number, number][] = [
	[T.b0, VEE_X],
	[T.servir, VEE_X],
	[T.servir + 14, 330],
];

/* ------------------------------------------------------------------ robot */

type RS = {
	pose: RobotPose; face: RobotFace; flip?: boolean; look?: [number, number]; chest?: string; chestColor?: string;
	reachF?: Pt | null; reachB?: Pt | null; holdF?: React.ReactNode; holdB?: React.ReactNode; time?: number;
	/** chorros: desde (x, y0) hasta y1 */
	pours?: {x: number; y0: number; y1: number; color: string}[];
};
const HOPS = [T.no + 2, T.salta + 2, B.pourEnd, A.mp1, T.mesa + 2, T.ahora50 + 2];

const jugNode = (tip: number) => <MilkJug tip={tip} />;
const spoonNode = (ang: number) => (
	<div style={{transform: `rotate(${ang}deg)`}}>
		<Spoon />
	</div>
);
/** Nivel de la medidora en cada momento (0–1). */
const measLevel = (f: number) => (f < A.mg1 ? tween(f, A.pour1a, A.pour1b) : 1 - tween(f, A.mp0, A.mp1));
/** Altura de la superficie de la leche en la medidora apoyada en la mesa. */
const measSurface = (level: number) => MEAS_Y - 132 + Math.round(11 - 10 * Math.max(0, Math.min(1, level))) * 11;

/** Mano que barre (de la taza al azucarero) durante el rebobinado. */
const PILE_TOP: Pt = [CUP_LIQ_X, TABLE_Y - 150];
const BOWL_TOP: Pt = [BOWL_X, TABLE_Y - 135];
const rewindHand = (f: number): Pt => {
	const r = T.retro;
	if (f < r + 8) return lerpPt(restF, PILE_TOP, seg(f, r + 2, r + 8));
	if (f < r + 20) return lerpPt(PILE_TOP, BOWL_TOP, seg(f, r + 8, r + 20));
	if (f < r + 28) return lerpPt(BOWL_TOP, PILE_TOP, seg(f, r + 20, r + 28));
	if (f < r + 40) return lerpPt(PILE_TOP, BOWL_TOP, seg(f, r + 28, r + 40));
	return lerpPt(BOWL_TOP, restF, seg(f, r + 40, r + 50));
};

/** Camino B (V44), cámara rápida: leche directo a la taza y revuelve. */
const robotB = (f: number): RS => {
	const t = lb(f);
	const base: RS = {pose: 'hold', face: 'focus', chest: '▶', look: [1, 0], time: f * 2};
	const tip = TIP_JUG * seg(t, 24, 32) * (1 - seg(t, 52, 60));
	if (t < 14) return {...base, reachF: lerpPt(restF, JUG_PT, seg(t, 0, 14))};
	if (t < 70) {
		let hand: Pt;
		if (t < 28) hand = lerpPt(JUG_PT, POUR_CUP_HAND, seg(t, 14, 28));
		else if (t < 56) hand = POUR_CUP_HAND;
		else hand = lerpPt(POUR_CUP_HAND, JUG_PT, seg(t, 56, 70));
		const m = jugMouth(hand, tip);
		const pours = t >= 32 && t < 52 ? [{x: m[0], y0: m[1], y1: CUP_SURF, color: LIQ.milk}] : undefined;
		return {...base, reachF: hand, holdF: jugNode(tip), pours};
	}
	if (t < 82) return {...base, reachF: lerpPt(JUG_PT, SPOON_A, seg(t, 70, 82)), chest: '✓'};
	if (t < 94) {
		const k = seg(t, 82, 94);
		return {...base, reachF: lerpPt(SPOON_A, STIR_C, k), holdF: spoonNode(90 + 90 * k)};
	}
	const th = ((t - 94) / 24) * Math.PI * 2;
	const hand: Pt = [STIR_C[0] + 16 * Math.sin(th), STIR_C[1] + 6 * Math.cos(th)];
	return {...base, reachF: hand, holdF: spoonNode(180 + 14 * Math.cos(th)), chest: '~'};
};

/** Camino A: V46 en adelante. */
const robotA = (f: number): RS => {
	const base: RS = {pose: 'idle', face: 'happy', chest: '✓', look: [1, 0]};
	// ---- V49–V50: sirve el café
	if (f >= T.v49) {
		const flip = f >= T.servir - 3;
		let hand: Pt;
		if (f < A.c1) hand = lerpPt(restF, CUP_PT, seg(f, T.v49, A.c1));
		else if (f < A.c2) hand = CUP_PT;
		else if (f < T.servir) hand = lerpPt(CUP_PT, HIGH, seg(f, A.c2, T.servir - 4));
		else hand = lerpPt(HIGH, CUPV, seg(f, T.servir, T.servir + 18));
		const served = f >= T.servir + 18;
		return {
			pose: 'hold', face: served ? 'proud' : 'focus', flip, look: [1, 0], chest: served ? '✓' : '▶', reachF: hand,
			holdF: f >= A.c1 ? <Cup fill="latte" steam /> : undefined,
		};
	}
	// ---- V48: deja la cuchara
	if (f >= T.v48) {
		let hand: Pt | null = null;
		let hold: React.ReactNode;
		let face: RobotFace = 'focus';
		let chest = '~';
		if (f < A.dj0) {
			hand = STIR_C;
			hold = spoonNode(180);
		} else if (f < A.dj1) {
			const k = seg(f, A.dj0, A.dj1);
			hand = lerpPt(STIR_C, SPOON_B, k);
			hold = spoonNode(180 - 90 * k);
			chest = '▶';
		} else if (f < T.mesa) {
			hand = SPOON_B;
			hold = spoonNode(90);
			chest = '▶';
		} else {
			face = f >= T.sino ? 'nerv' : 'proud';
			chest = f >= T.sino ? '?' : '✓';
			if (f < A.dj2) hand = lerpPt(SPOON_B, restF, seg(f, T.mesa + 2, A.dj2));
		}
		return {pose: 'hold', face, look: [1, 0], chest, chestColor: chest === '?' ? C.amber : C.green, reachF: hand, holdF: hold};
	}
	// ---- V46–V47: la leche medida y el revuelto
	if (f >= T.ahora) {
		const st = A.st0;
		const pours: RS['pours'] = [];
		let hand: Pt | null = null;
		let hold: React.ReactNode;
		let face: RobotFace = 'focus';
		let chest = '▶';
		if (f < A.grab) hand = lerpPt(restF, JUG_PT, seg(f, a0, A.grab));
		else if (f < A.ret0) {
			const tip = TIP_JUG * seg(f, A.tip0, A.tip1) * (1 - seg(f, A.pour1b, A.pour1b + 5));
			hand = lerpPt(JUG_PT, POUR_MEAS_HAND, seg(f, A.grab, A.grab + 10));
			hold = jugNode(tip);
			if (f >= A.pour1a && f < A.pour1b) {
				const m = jugMouth(hand, tip);
				pours.push({x: m[0], y0: m[1], y1: measSurface(measLevel(f)), color: LIQ.milk});
			}
		} else if (f < A.ret1) {
			hand = lerpPt(POUR_MEAS_HAND, JUG_PT, seg(f, A.ret0, A.ret1));
			hold = jugNode(0);
		} else if (f < A.mg1) hand = lerpPt(JUG_PT, MEAS_PT, seg(f, A.ret1, A.mg1));
		else if (f < A.mr1) {
			const tip = TIP_MEAS * seg(f, A.mt0, A.mp0) * (1 - seg(f, A.mp1, A.mu1));
			hand = f < A.mp1 ? lerpPt(MEAS_PT, POUR_CUP_MEAS, seg(f, A.mg1, A.mt0 + 6)) : lerpPt(POUR_CUP_MEAS, MEAS_PT, seg(f, A.mu1, A.mr1));
			hold = <MeasureJug level={measLevel(f)} liquid="milk" tip={tip} />;
			if (f >= A.mp0 && f < A.mp1) {
				const lip = measLip(hand, tip);
				pours.push({x: lip[0], y0: lip[1], y1: CUP_SURF, color: LIQ.milk});
			}
			if (f >= A.mp1) {
				face = 'happy';
				chest = '✓';
			}
		} else if (f < A.sg1) {
			hand = lerpPt(MEAS_PT, SPOON_A, seg(f, A.mr1, A.sg1));
			face = 'focus';
		} else if (f < st) {
			const k = seg(f, A.sg1, st);
			hand = lerpPt(SPOON_A, STIR_C, k);
			hold = spoonNode(90 + 90 * k);
		} else {
			const th = ((f - st) / 12) * Math.PI * 2;
			const sw = f < A.st1 ? 1 : 0;
			hand = [STIR_C[0] + 16 * Math.sin(th) * sw, STIR_C[1] + 6 * Math.cos(th) * sw];
			hold = spoonNode(180 + 14 * Math.cos(th) * sw);
			chest = '~';
		}
		return {pose: 'hold', face, look: [1, 0], chest, reachF: hand, holdF: hold, pours};
	}
	// ---- antes de V46
	return base;
};

const robotAt = (f: number): RS => {
	const base: RS = {pose: 'idle', face: 'happy', chest: '✓', look: [1, 0]};
	if (f < T.retro) return base;
	if (f < T.retro + 50) return {pose: 'reach', face: 'wow', chest: '◀◀', look: [1, 0], reachF: rewindHand(f)};
	if (f < T.salta) {
		const no = f >= T.no;
		return {...base, face: no ? 'focus' : 'conf', chest: no ? 'NO' : '?', chestColor: no ? C.blue : C.amber};
	}
	if (f < T.sigue) return {...base, pose: 'wave', chest: 'NO', chestColor: C.blue};
	if (f < T.v45 + 2) return robotB(f);
	if (f < BACK) return base;
	return robotA(f);
};

/* ------------------------------------------------------------------ tarjeta */

const L2: Line[] = [
	{text: 'INICIO'},
	{text: 'Tomar una taza y ponerla sobre la mesa.', indent: 1},
	{text: 'Agregar dos cucharadas de café a la taza.', indent: 1},
	{text: 'Calentar 200 ml de agua en la tetera.', indent: 1},
	{text: 'Verter el agua caliente en la taza.', indent: 1},
	{text: 'Preguntar: "¿Desea agregar azúcar?"', indent: 1},
	{text: 'SI la respuesta es "Sí" ENTONCES', indent: 1},
	{text: 'Preguntar: "¿Cuántas cucharadas de azúcar?"', indent: 2},
	{text: 'Leer cantidad de azúcar.', indent: 2},
	{text: 'Agregar esa cantidad de azúcar a la taza.', indent: 2},
	{text: 'FIN SI', indent: 1},
	{text: 'Agregar 100 ml de leche a la taza.', indent: 1},
	{text: 'Tomar una cuchara.', indent: 1},
	{text: 'Revolver el contenido de la taza.', indent: 1},
	{text: 'Dejar la cuchara sobre la mesa.', indent: 1},
	{text: 'Servir el café.', indent: 1},
	{text: 'FIN'},
];
const L1: Line[] = [
	{text: 'INICIO'},
	{text: 'Leer cantidad de café', indent: 1},
	{text: 'Leer cantidad de leche', indent: 1},
	{text: 'Mezclar los ingredientes', indent: 1},
	{text: 'Mostrar resultado', indent: 1},
	{text: 'FIN'},
];
/** Misma cuenta que hace InstrCard para el tamaño de letra y el alto de línea. */
const cardMetrics = (lines: Line[], w: number, size: number) => {
	const maxLen = Math.max(...lines.map((l) => l.text.length + (l.indent ?? 0) * 2));
	const fs = Math.min(size, Math.floor((w - 56 - size * 1.1) / (0.602 * maxLen)));
	return {fs, lh: Math.round(fs * 1.5)};
};
const HEADH = 62; // de lo alto de la tarjeta a la primera línea
const CARD = {x: 50, y: 90, w: 760, size: 30};
const KM = cardMetrics(L2, CARD.w, CARD.size);

/** Entradas «pasadas» del cursor: las líneas 0..n-1 ya hechas (con ✓). */
const past = (n: number): [number, number][] => Array.from({length: n}, (_, i) => [T.b0 - 400 + i, i] as [number, number]);
const withSteps = (n: number, steps: [number, number][], f: number): [number, number][] => [...past(n), ...steps.filter(([t]) => f >= t)];

/** Cursor de la tarjeta y líneas saltadas en cada momento. */
const cardState = (f: number): {cursor: [number, number][]; skip: number[]} => {
	// antes del rebobinado: líneas 0–9 hechas, cursor en la 10
	if (f < T.retro + 4) return {cursor: [...past(10), [T.b0 - 300, 10]], skip: []};
	// rebobinado: el cursor retrocede de la 10 a la 5 (las líneas 6–9 pierden su ✓)
	if (f < T.retro + 24) {
		const k = Math.min(4, Math.floor((f - (T.retro + 4)) / 5));
		const line = 9 - k;
		return {cursor: [...past(line), [T.retro + 4 + k * 5, line]], skip: []};
	}
	if (f < T.salta) return {cursor: [...past(5), [T.retro + 24, 5]], skip: f >= T.no ? [6, 7, 8, 9, 10] : []};
	// camino B: salta de la 5 a la 11 y corre hasta el final
	if (f < BACK) {
		const steps: [number, number][] = [[T.salta, 11], [T.sigue + 28, 12], [T.sigue + 40, 13], [T.sigue + 50, 14], [T.sigue + 58, 15]];
		return {cursor: withSteps(6, steps, f), skip: [6, 7, 8, 9, 10]};
	}
	// camino A
	const steps: [number, number][] = [[T.b0 - 300, 10], [A.cursor11, 11], [A.mp1, 12], [T.revuelve, 13], [T.deja, 14], [T.v49, 15], [T.ahora50, -1]];
	return {cursor: withSteps(10, steps, f), skip: []};
};

const CardKitchen: React.FC = () => {
	const f = useCurrentFrame();
	const {cursor, skip} = cardState(f);
	const marks: Record<number, string[]> = f >= T.hasta && f < T.sino ? {14: ['la cuchara']} : {};
	return (
		<InstrCard
			x={CARD.x} y={CARD.y} w={CARD.w} size={CARD.size} lines={L2} title="algoritmo2.txt" window={f < T.retro ? 9 : 12}
			cursor={cursor} skip={skip} marks={marks} allDone={f >= T.ahora50}
		/>
	);
};

/** Flecha azul curva que rodea el bloque «SI … FIN SI» cuando el cursor lo salta. */
const SkipArrow: React.FC = () => {
	const f = useCurrentFrame();
	const a = T.salta + 8;
	if (f < a || f >= T.v45) return null;
	const k = tween(f, a, a + 14, 0, 1, outCubic);
	const x0 = CARD.x + CARD.w - 30;
	const y5 = CARD.y + HEADH + KM.lh / 2;
	const y11 = CARD.y + HEADH + 6 * KM.lh + KM.lh / 2;
	const bend = 120;
	return (
		<>
			<svg style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, pointerEvents: 'none', overflow: 'visible'}}>
				<path d={`M ${x0} ${y5} C ${x0 + bend} ${y5}, ${x0 + bend} ${y11}, ${x0 + 6} ${y11}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} fill="none" stroke={C.blue} strokeWidth={10} strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${C.blue})`}} />
				{k > 0.92 && <polygon points={`${x0 + 6},${y11} ${x0 + 38},${y11 - 20} ${x0 + 38},${y11 + 20}`} fill={C.blue} />}
			</svg>
			<Tag x={x0 + bend + 70} y={(y5 + y11) / 2} at={a + 6} color={C.blue} size={42} rot={4}>SE SALTA</Tag>
		</>
	);
};

/** Panel de la decisión: «¿DESEA AGREGAR AZÚCAR?» con SÍ y NO (en pantalla, fuera de la cámara). */
const PANEL = {x: 800, y: 185, w: 880, h: 380};
const NO_PT: Pt = [PANEL.x + 110 + 290 + 80 + 145, PANEL.y + 190 + 65];
const AskPanel: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<In at={T.que1} out={T.v44 + 6} x={PANEL.x} y={PANEL.y} w={PANEL.w} from="up" exit="up">
			<div style={{height: PANEL.h, boxSizing: 'border-box', background: 'rgba(10,14,12,0.97)', border: `5px solid ${C.amber}`, boxShadow: `0 0 50px ${C.amber}55, 0 24px 60px rgba(0,0,0,0.6)`, position: 'relative'}}>
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 24, color: C.amber, padding: '10px 22px', borderBottom: `2px solid ${C.line2}`, letterSpacing: '0.12em'}}>? PREGUNTA</div>
				<div style={{textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 54, color: C.white, marginTop: 34, whiteSpace: 'nowrap'}}>¿DESEA AGREGAR AZÚCAR?</div>
				<div style={{position: 'absolute', left: 110, top: 190}}>
					<ChoiceButton label="SÍ" color={C.green} dim={f >= T.no} />
				</div>
				<div style={{position: 'absolute', left: 110 + 290 + 80, top: 190}}>
					<ChoiceButton label="NO" color={C.blue} pressAt={T.no} />
				</div>
			</div>
		</In>
	);
};

/* ------------------------------------------------------------------ piezas locales del escenario */

/** Azúcar en montículo sobre la taza (n = 0, 1 o 2 filas). */
const Pile: React.FC<{rows: number}> = ({rows}) => {
	if (rows <= 0) return null;
	const cell = (x: number, y: number, w: number) => <div key={`${x}-${y}`} style={{position: 'absolute', left: x, top: y, width: w, height: 11, background: '#FFFFFF', boxShadow: 'inset 0 -3px 0 #C9D6DE'}} />;
	const cx = CUP_LIQ_X;
	return (
		<>
			{cell(cx - 33, TABLE_Y - 110 - 11, 66)}
			{rows >= 2 && cell(cx - 22, TABLE_Y - 110 - 22, 44)}
		</>
	);
};
/** Granitos de azúcar que vuelven de la taza al azucarero (rebobinado). */
const Grains: React.FC = () => {
	const f = useCurrentFrame();
	const r = T.retro;
	if (f < r + 4 || f > r + 52) return null;
	return (
		<>
			{Array.from({length: 22}, (_, i) => {
				const st = r + 4 + i * 1.6;
				const k = (f - st) / 14;
				if (k < 0 || k > 1) return null;
				const x = CUP_LIQ_X + (BOWL_X - CUP_LIQ_X) * k + (rnd(i + 3) - 0.5) * 30;
				const y = TABLE_Y - 125 + (-20 - 0) * k - Math.sin(k * Math.PI) * 190;
				return <div key={i} style={{position: 'absolute', left: Math.round(x / 11) * 11, top: Math.round(y / 11) * 11, width: 11, height: 11, background: '#FFFFFF'}} />;
			})}
		</>
	);
};
const LyingSpoon: React.FC<{pt: Pt}> = ({pt}) => (
	<div style={{position: 'absolute', left: pt[0], top: pt[1], transform: 'translate(-50%, -50%) rotate(90deg)'}}>
		<Spoon />
	</div>
);

/* ------------------------------------------------------------------ sub-escena: la cocina (V43–V44 y V46–V50) */

/** Filas de azúcar sobre la taza en cada momento. */
const pileRows = (f: number) => {
	if (f >= BACK) return f < T.azucar46 ? 2 : f < T.azucar46 + 10 ? 1 : 0;
	if (f < T.retro + 10) return 2;
	return f < T.retro + 24 ? 1 : 0;
};

const Cocina: React.FC = () => {
	const f = useCurrentFrame();
	const R = robotAt(f);
	const pathA = f >= BACK;
	const milkAway = pathA ? f >= A.grab && f < A.ret1 : f >= B.grab && f < B.jugBack;
	const latte = pathA ? f >= A.mp1 : f >= B.pourEnd;
	const cupHeld = pathA && f >= A.c1;
	const spoonA = pathA ? f < A.sg1 : f < T.sigue + 41;
	const spoonB = pathA && f >= T.mesa;
	const lvl = measLevel(f);
	const stirs = [A.st0 + 6, A.st0 + 18, A.st0 + 30];
	const {pours, ...robotProps} = R;
	return (
		<Cam shots={SHOTS} shakeAt={SHAKES}>
			<Kitchen />
			<Put x={SLOT[1]} y={TABLE_Y}><CoffeeJar /></Put>
			<Put x={SLOT[2]} y={TABLE_Y}><SugarBowl /></Put>
			{!milkAway && <Put x={SLOT[3]} y={TABLE_Y}><MilkJug /></Put>}
			<Put x={STOVE_X} y={STOVE_Y}><Kettle steam /></Put>
			{f < T.retro + 6 && <Put x={1400} y={SHELF_Y}><Spoon scale={12} /></Put>}
			{/* la jarra medidora, en el borde delantero de la mesa */}
			{pathA && f < A.mg1 && (
				<Put x={MEAS_X} y={MEAS_Y} at={T.cien} out={A.mg1}>
					<MeasureJug level={lvl} liquid="milk" label="100 ml" />
				</Put>
			)}
			{pathA && f >= A.mr1 && (
				<Put x={MEAS_X} y={MEAS_Y}>
					<MeasureJug level={0} liquid="milk" />
				</Put>
			)}
			{spoonA && <LyingSpoon pt={SPOON_A} />}
			{spoonB && <LyingSpoon pt={SPOON_B} />}
			<Robot x={RX} y={FLOOR} {...robotProps} />
			{(pours ?? []).map((p, i) => (
				<Pour key={i} x={p.x} y0={p.y0} y1={p.y1} color={p.color} w={22} />
			))}
			{/* la taza va después del robot: la cuchara y el chorro quedan «dentro» */}
			{!cupHeld && (
				<Put x={SLOT[0]} y={TABLE_Y}>
					<Cup fill={(latte ? 'latte' : 'black') as CupFill} steam />
				</Put>
			)}
			<Pile rows={cupHeld ? 0 : pileRows(f)} />
			{f >= T.retro && f < BACK && <Grains />}
			{[0, 9, 18].map((d) => <Splash key={`a${d}`} x={MEAS_X - 5.5} y={MEAS_Y - 80} at={A.pour1a + 6 + d} color={LIQ.milk} n={8} power={8} />)}
			{[0, 9].map((d) => <Splash key={`b${d}`} x={CUP_LIQ_X} y={CUP_SURF} at={A.mp0 + 5 + d} color={LIQ.milk} n={8} power={8} />)}
			{[0, 8].map((d) => <Splash key={`c${d}`} x={CUP_LIQ_X} y={CUP_SURF} at={B.pour0 + 4 + d} color={LIQ.milk} n={8} power={8} />)}
			<Vee x={VEE_X_KEYS} acts={VEE_ACTS} hops={[T.no + 1, T.salta + 2]} />
			{/* contadores sobre la escena */}
			<Counter x={MEAS_X} y={410} value="100 ml" at={T.cien} out={A.ret0 + 8} size={76} color={C.white} />
			{stirs.map((a, i) => (
				<Counter key={i} x={CUP_LIQ_X} y={400} value={i + 1} at={a} out={i < 2 ? stirs[i + 1] : A.st1 + 8} size={92} />
			))}
		</Cam>
	);
};

/** Nube de pensamiento de V48 (en pantalla): tres viñetas del robot con la cuchara en la mano. */
const NUBE = {x: 790, y: 100, w: 760, h: 380};
const Viñeta: React.FC<{k: number; at: number; kind: 'sofa' | 'cine' | 'zzz'}> = ({k, at: a, kind}) => {
	const f = useCurrentFrame();
	if (f < a) return null;
	const p = pop(f, a, 9, 300, 0.5);
	const W = 214;
	const bg = kind === 'sofa' ? '#2B3B52' : kind === 'cine' ? '#0B0F0D' : '#1B2A3A';
	const label = kind === 'sofa' ? 'SOFÁ' : kind === 'cine' ? 'CINE' : 'DORMIDO';
	return (
		<div style={{position: 'absolute', left: 38 + k * (W + 20), top: 34, width: W, transform: `scale(${p})`, transformOrigin: '50% 100%'}}>
			<div style={{position: 'relative', width: W, height: 256, overflow: 'hidden', background: bg, border: '5px solid #6B5638', boxSizing: 'border-box'}}>
				{kind === 'sofa' && (
					<>
						<div style={{position: 'absolute', left: 14, top: 120, width: 180, height: 80, background: '#8A4B3A', borderRadius: 14}} />
						<div style={{position: 'absolute', left: 4, top: 160, width: 30, height: 50, background: '#6D3A2D', borderRadius: 8}} />
						<div style={{position: 'absolute', left: 170, top: 160, width: 30, height: 50, background: '#6D3A2D', borderRadius: 8}} />
					</>
				)}
				{kind === 'cine' && (
					<>
						<div style={{position: 'absolute', left: 18, top: 16, width: 170, height: 96, background: '#CFE8FF', boxShadow: '0 0 26px #CFE8FF'}} />
						<div style={{position: 'absolute', left: 84, top: 36, fontFamily: MONO, fontWeight: 800, fontSize: 52, color: '#2A3F66'}}>▶</div>
						<div style={{position: 'absolute', left: 6, top: 170, width: 190, height: 70, background: '#7A1E2B', borderRadius: 10}} />
					</>
				)}
				{kind === 'zzz' && (
					<>
						<div style={{position: 'absolute', left: 8, top: 160, width: 190, height: 60, background: '#4B5E7A'}} />
						<div style={{position: 'absolute', left: 150, top: 10, fontFamily: MONO, fontWeight: 800, fontSize: 44, color: '#FFE9A8'}}>☾</div>
						<div style={{position: 'absolute', left: 120 + Math.sin(f / 6) * 6, top: 60 - ((f - a) % 40) * 0.8, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: '#B5D6FF'}}>z z z</div>
					</>
				)}
				<Robot x={W / 2} y={kind === 'sofa' ? 196 : 224} scale={3.4} pose="sit" face={kind === 'zzz' ? 'blink' : kind === 'cine' ? 'wow' : 'happy'} holdF={<Spoon scale={3} />} reachF={[W / 2 + 28, kind === 'sofa' ? 150 : 178]} />
			</div>
			<div style={{textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 34, color: '#5B4630', marginTop: 8}}>{label}</div>
		</div>
	);
};
const NubeV48: React.FC = () => {
	const f = useCurrentFrame();
	const a = T.sino;
	if (f < a || f >= T.siempre + 2) return null;
	const p = pop(f, a, 11, 260, 0.6);
	const head = proj(f, [RX, 500]);
	return (
		<>
			{[0.35, 0.62, 0.85].map((t, i) => {
				const r = 34 - i * 9;
				const bx = NUBE.x + 120;
				const by = NUBE.y + NUBE.h;
				const q = pop(f, a + 2 + i * 2, 11, 260, 0.6);
				return <div key={i} style={{position: 'absolute', left: bx + (head[0] - bx) * t - r / 2, top: by + (head[1] - 40 - by) * t - r / 2, width: r, height: r, borderRadius: '50%', background: '#E8D9B5', border: '3px solid #B79C6B', transform: `scale(${q})`}} />;
			})}
			<div style={{position: 'absolute', left: NUBE.x, top: NUBE.y, width: NUBE.w, height: NUBE.h, borderRadius: 90, background: '#E8D9B5', border: '6px solid #B79C6B', boxSizing: 'border-box', transform: `scale(${0.3 + 0.7 * p})`, transformOrigin: '15% 100%', opacity: Math.min(1, p * 2), boxShadow: '0 16px 0 rgba(0,0,0,0.3)'}}>
				{f < T.queda && (
					<div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center'}}>
						<div style={{display: 'inline-block', transform: `scale(${pop(f, T.sino + 3, 9, 300, 0.5)})`}}><Spoon scale={14} /></div>
					</div>
				)}
				<Viñeta k={0} at={T.queda} kind="sofa" />
				<Viñeta k={1} at={T.cuch48} kind="cine" />
				<Viñeta k={2} at={T.mano} kind="zzz" />
			</div>
		</>
	);
};

/** Todo lo que va sobre la cocina, en coordenadas de pantalla (fuera de la cámara). */
const CocinaUI: React.FC = () => {
	const f = useCurrentFrame();
	const cupScr = (at: number): Pt => proj(at, [CUP_LIQ_X, 560]);
	const burst = (at: number) => proj(at, [CUPV[0] - 40, 560]);
	return (
		<>
			<CardKitchen />
			<SkipArrow />
			<CornerTag text="CAMINO A: SÍ" at={T.b0 - 200} out={T.no} />
			<CornerTag text="CAMINO B: NO" at={T.no} out={T.v45} color={C.blue} />
			<div style={{position: 'absolute', left: 0, top: 100, width: 1920, height: 200}}>
				<CornerTag text="×2" at={T.sigue} out={T.v45} color={C.amber} />
			</div>
			<CornerTag text="CAMINO A: SÍ" at={BACK + 4} out={T.v51} />
			<AskPanel />
			<NubeV48 />
			<VHS on={f >= T.retro && f < T.retro + 40} label="◀◀" />
			<GlitchBurst at={T.retro} len={6} />
			<GlitchBurst at={T.retro + 16} len={4} intensity={0.8} />
			<GlitchBurst at={T.retro + 32} len={4} intensity={0.8} />
			<CutFlash at={T.retro} len={5} />
			<Hit at={T.no} x={NO_PT[0]} y={NO_PT[1]} big />
			<SpeedLines at={T.sigue} len={46} mode="h" color="rgba(255,255,255,0.4)" count={12} />
			<Hit at={A.mp1} x={cupScr(A.mp1)[0]} y={cupScr(A.mp1)[1]} />
			<Hit at={T.mesa} x={proj(T.mesa, SPOON_B)[0]} y={proj(T.mesa, SPOON_B)[1]} />
			{f >= T.siempre + 2 && f < T.siempre + 34 && <PixelBurst f={f} at={T.siempre + 2} x={NUBE.x + NUBE.w / 2} y={NUBE.y + NUBE.h / 2} count={46} power={24} colors={['#E8D9B5', '#FFFFFF', '#B79C6B', C.amber]} seed={4} grid={12} />}
			<Shockwave at={T.siempre + 2} x={NUBE.x + NUBE.w / 2} y={NUBE.y + NUBE.h / 2} size={900} color="#E8D9B5" thick={14} dur={20} />
			{/* V50: ¡ahora sí! */}
			<Hit at={T.ahora50} x={burst(T.ahora50)[0]} y={burst(T.ahora50)[1]} big />
			{f >= T.ahora50 + 3 && f < T.ahora50 + 40 && (
				<>
					<PixelBurst f={f} at={T.ahora50 + 3} x={burst(T.ahora50)[0]} y={burst(T.ahora50)[1]} count={34} power={22} colors={[C.green, C.amber, '#FFFFFF', C.blue]} seed={9} grid={10} />
					<PixelBurst f={f} at={T.ahora50 + 8} x={proj(T.ahora50, [VEE_X + 60, 560])[0]} y={proj(T.ahora50, [VEE_X + 60, 560])[1]} count={22} power={18} colors={['#FFFFFF', C.green, C.amber]} seed={12} grid={10} />
				</>
			)}
		</>
	);
};

/* ------------------------------------------------------------------ sub-escena: pantalla partida (V45) */

const MiniCard: React.FC<{x: number; y: number; w: number; color: string; skip: number[]; at: number; mark: number}> = ({x, y, w, color, skip, at: a, mark}) => {
	const f = useCurrentFrame();
	if (f < a) return null;
	const p = pop(f, a, 12, 230, 0.7);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, transform: `translateY(${(1 - p) * 120}px) scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 2), background: 'rgba(12,16,14,0.97)', border: `4px solid ${color}`, boxShadow: `0 0 36px ${color}44, 0 20px 40px rgba(0,0,0,0.55)`, boxSizing: 'border-box', padding: '10px 14px 14px'}}>
			<div style={{fontFamily: MONO, fontSize: 22, color: C.dim, marginBottom: 8}}>algoritmo2.txt</div>
			{L2.map((ln, i) => {
				const skipped = skip.includes(i);
				const judged = f >= mark + i * 1.2;
				const len = (ln.text.length + (ln.indent ?? 0) * 2) / 47;
				return (
					<div key={i} style={{height: 24, display: 'flex', alignItems: 'center', gap: 10}}>
						<span style={{width: 22, fontFamily: MONO, fontWeight: 800, fontSize: 20, color: judged && !skipped ? C.green : C.faint, textAlign: 'center'}}>{judged ? (skipped ? '—' : '✓') : ''}</span>
						<div style={{height: 12, width: Math.max(30, (w - 28 - 32 - 8) * len), boxSizing: 'border-box', background: judged ? (skipped ? 'transparent' : C.green) : 'rgba(233,238,234,0.35)', border: judged && skipped ? `2px dashed ${C.faint}` : undefined}} />
					</div>
				);
			})}
		</div>
	);
};

const Mitad: React.FC<{side: 'A' | 'B'}> = ({side}) => {
	const f = useCurrentFrame();
	const isA = side === 'A';
	const color = isA ? C.green : C.blue;
	const cupX = isA ? 235 : 1685;
	const cardX = isA ? 400 : 1180;
	const titleX = isA ? 477 : 1443;
	const base = 700;
	const a = T.v45 + (isA ? 2 : 5);
	const cubes = isA && f >= T.todo;
	return (
		<>
			<Slam at={isA ? T.dos45 : T.caminos} x={titleX} y={140}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 80, color, letterSpacing: '-0.02em', whiteSpace: 'nowrap', textShadow: `0 0 30px ${color}66`}}>CAMINO {side}: {isA ? 'SÍ' : 'NO'}</div>
			</Slam>
			<Put x={cupX} y={base} at={a}>
				<Cup scale={18} fill="black" steam />
			</Put>
			{cubes && [0, 1].map((i) => {
				const p = pop(f, T.todo + i * 5, 9, 300, 0.5);
				return <div key={i} style={{position: 'absolute', left: cupX - 27 - 30 + i * 56, top: base - 162 - 50 - (1 - p) * 220 - i * 6, width: 50, height: 50, background: '#FFFFFF', boxShadow: 'inset -8px -8px 0 #C9D6DE, 0 6px 0 rgba(0,0,0,0.4)', transform: `rotate(${(i ? 8 : -6)}deg)`, opacity: Math.min(1, p * 2)}} />;
			})}
			<MiniCard x={cardX} y={235} w={340} color={color} skip={isA ? [] : [6, 7, 8, 9, 10]} at={a + 2} mark={T.todo} />
			<In at={T.todo + 2} x={cupX - 190} y={base + 60} w={380} from="down" impact={false}>
				<div style={{textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 50, color}}>{isA ? 'CON AZÚCAR' : 'SIN AZÚCAR'}</div>
				<div style={{textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 36, color: C.text, marginTop: 10}}>{isA ? 'TODAS LAS LÍNEAS' : 'SALTA 4 LÍNEAS'}</div>
			</In>
		</>
	);
};

const Partida: React.FC = () => {
	const f = useCurrentFrame();
	const out = tween(f, T.e45 + 3, T.e45 + 17, 0, 1, inCubic);
	const grow = tween(f, T.e45 + 8, T.e45 + 28, 0, 1, inOutCubic);
	const div = tween(f, T.v45, T.v45 + 10, 0, 1, outCubic) * (1 - tween(f, T.e45 + 3, T.e45 + 12));
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Board />
			<div style={{position: 'absolute', left: 0, top: 0, width: 954 + grow * 966, height: 1080, background: 'rgba(0,192,99,0.09)'}} />
			<div style={{position: 'absolute', left: 966 + out * 1000, top: 0, width: 954, height: 1080, background: 'rgba(90,169,255,0.09)', opacity: 1 - out}} />
			<div style={{position: 'absolute', left: 954, top: 70, width: 12, height: 900 * div, background: C.green, boxShadow: `0 0 24px ${C.green}`}} />
			<div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.12 * grow})`, transformOrigin: '477px 540px'}}>
				<Mitad side="A" />
			</div>
			<div style={{position: 'absolute', inset: 0, transform: `translateX(${out * 1100}px)`, opacity: 1 - out}}>
				<Mitad side="B" />
			</div>
			<Slam at={T.algo45} x={960} y={400}>
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 200, color: C.green, textShadow: `0 0 40px ${C.green}88`, opacity: 1 - tween(f, T.depende - 8, T.depende - 2)}}>=</div>
			</Slam>
			<Hit at={T.v45 + 2} x={960} y={540} big />
			{f >= T.depende - 8 && f < T.e45 + 20 && (
				<Vee x={[[T.e45 + 4, 960], [T.e45 + 20, 700]]} y={FLOOR} scale={12} at={T.depende - 8} acts={[[T.depende - 2, 'especial', 2.4]]} opacity={1 - tween(f, T.e45 + 8, T.e45 + 20)} />
			)}
			<Hit at={T.todo} x={235} y={500} />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ sub-escena: comparación (V51) */

const Comparacion: React.FC = () => {
	const f = useCurrentFrame();
	const stage = f >= T.en51 ? 4 : f >= T.donde ? 3 : f >= T.cuanto ? 2 : f >= T.que51 ? 1 : 0;
	const marks: Record<number, string[]> =
		stage === 1
			? {1: ['taza'], 2: ['café', 'taza'], 3: ['tetera', 'agua'], 4: ['agua', 'taza'], 9: ['azúcar', 'taza'], 11: ['leche', 'taza'], 12: ['cuchara'], 13: ['taza'], 14: ['cuchara']}
			: stage === 2
				? {2: ['dos cucharadas'], 3: ['200 ml'], 11: ['100 ml']}
				: stage === 3
					? {1: ['sobre la mesa'], 2: ['a la taza'], 3: ['en la tetera'], 4: ['en la taza'], 9: ['a la taza'], 11: ['a la taza'], 13: ['de la taza'], 14: ['sobre la mesa']}
					: {};
	const C2 = {x: 840, y: 100, w: 1000, size: 30};
	const M = cardMetrics(L2, C2.w, C2.size);
	const dim = 1 - 0.5 * tween(f, T.segundo, T.segundo + 8);
	return (
		<AbsoluteFill>
			<Board />
			<In at={T.v51 + 3} x={60} y={100} w={700} from="left">
				<div style={{opacity: dim}}>
					<InstrCard x={0} y={0} w={700} size={34} lines={L1} title="algoritmo1.txt" allDone />
				</div>
			</In>
			<In at={T.v51 + 7} x={C2.x} y={C2.y} w={C2.w} from="right">
				<InstrCard x={0} y={0} w={C2.w} size={C2.size} lines={L2} title="algoritmo2.txt" allDone marks={marks} />
			</In>
			<Stamp x={560} y={420} at={T.algs} out={T.segundo + 6} size={52} />
			<Stamp x={1570} y={880} at={T.algs + 4} out={T.segundo + 6} size={52} />
			<Hit at={T.algs} x={560} y={420} />
			<Hit at={T.algs + 4} x={1570} y={880} />
			<Tag x={410} y={585} at={T.que51} size={58} rot={-3} color={C.green}>
				<span style={{display: 'inline-flex', alignItems: 'center', gap: 18}}>QUÉ <Cup scale={4} /><Spoon scale={4} /></span>
			</Tag>
			<Tag x={410} y={690} at={T.cuanto} size={58} rot={2} color={C.amber}>
				<span style={{display: 'inline-flex', alignItems: 'center', gap: 18}}>CUÁNTO <MeasureJug level={0.7} scale={4} /></span>
			</Tag>
			<Tag x={410} y={795} at={T.donde} size={58} rot={-2} color={C.blue}>DÓNDE ⌖</Tag>
			<Tag x={410} y={900} at={T.orden} size={58} rot={3} color={C.white}>ORDEN 1→15</Tag>
			{Array.from({length: 15}, (_, i) => {
				const a = T.en51 + i * 1.3;
				if (f < a) return null;
				const p = pop(f, a, 9, 300, 0.5);
				const y = C2.y + HEADH + (i + 1) * M.lh + M.lh / 2;
				return (
					<div key={i} style={{position: 'absolute', left: 800 - 24, top: y - 24, width: 48, height: 48, borderRadius: '50%', background: C.green, color: C.bg, fontFamily: MONO, fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`, boxShadow: `0 0 16px ${C.green}`}}>
						{i + 1}
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ sub-escena: nivel de detalle (V52) */

const buf = (w: number, h: number, draw: (b: Buf) => void) => {
	const b = new Buf(w, h);
	draw(b);
	return b;
};
const PERSONA_HEAD = buf(12, 13, (b) => {
	b.rect(1, 0, 10, 4, '#3B2A20'); b.rect(0, 2, 1, 6, '#3B2A20'); b.rect(11, 2, 1, 6, '#3B2A20');
	b.rect(1, 3, 10, 9, '#E8B58A'); b.rect(1, 3, 10, 1, '#3B2A20');
	b.rect(3, 7, 2, 2, '#1A1A1A'); b.rect(7, 7, 2, 2, '#1A1A1A'); b.rect(4, 10, 4, 1, '#A8574A'); b.rect(3, 12, 6, 1, '#3E73D8');
});
const ROBOT_HEAD = buf(16, 15, (b) => {
	b.rect(7, 0, 2, 3, '#8E9A94'); b.rect(6, 0, 4, 1, C.green);
	b.rect(0, 3, 16, 12, '#C9D3CE'); b.rect(14, 3, 2, 12, '#8E9A94'); b.rect(2, 5, 12, 8, '#0B0F0D');
	b.rect(4, 7, 2, 2, C.green); b.rect(10, 7, 2, 2, C.green); b.rect(6, 11, 4, 1, C.green);
});
const COMPUTER = (on: boolean) =>
	buf(20, 17, (b) => {
		b.rect(0, 0, 20, 14, '#39423E'); b.rect(1, 1, 18, 11, on ? '#0A3D24' : '#0B0F0D');
		b.rect(8, 14, 4, 2, '#39423E'); b.rect(4, 16, 12, 1, '#4D5853');
		if (on) { b.rect(2, 2, 16, 1, C.green); }
	});

const SL = {x0: 500, x1: 1830, y: 715};
const slX = (k: number) => SL.x0 + (SL.x1 - SL.x0) * k;
const POS = {persona: 0.18, robot: 0.62, compu: 0.93};
const CARD1_H = HEADH + 6 * 36 + 14;

const Deslizador: React.FC = () => {
	const f = useCurrentFrame();
	const knob = POS.persona + (POS.robot - POS.persona) * seg(f, T.ese, T.ese + 12);
	const kx = slX(knob);
	const zoomK = seg(f, T.e52 + 3, T.b1 - 8);
	const zE = 2.8;
	const cx = slX(POS.compu);
	const cy = SL.y + 150;
	const mark = (a: number, pos: number, b: Buf, label: string, color: string, size = 7, extra?: React.ReactNode) => {
		if (f < a) return null;
		const p = pop(f, a, 10, 260, 0.6);
		return (
			<div style={{position: 'absolute', left: slX(pos), top: SL.y + 12, transform: `translateX(-50%) scale(${p})`, transformOrigin: '50% 0', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{width: 6, height: 60, background: color}} />
				<div style={{position: 'relative'}}>
					<PixelSprite buf={b} scale={size} />
					{extra}
				</div>
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 36, color, marginTop: 6, whiteSpace: 'nowrap'}}>{label}</div>
			</div>
		);
	};
	const glow = f >= T.ejecuta ? 0.6 + 0.4 * Math.sin((f - T.ejecuta) / 4) : 0;
	// pergamino
	const parch = (() => {
		if (f < T.larg || f >= T.tienen + 12) return null;
		const h = 500 * tween(f, T.larg, T.larg + 20, 0, 1, outCubic);
		const fall = tween(f, T.tienen, T.tienen + 12, 0, 1, inCubic) * 1000;
		return (
			<div style={{position: 'absolute', left: 1650, top: 100 + fall, width: 230}}>
				<div style={{height: 26, background: '#C7AE72', borderRadius: 13, boxShadow: '0 6px 0 rgba(0,0,0,0.4)'}} />
				<div style={{height: h, background: 'repeating-linear-gradient(180deg, transparent 0 16px, rgba(70,48,20,0.5) 16px 22px), #E8D9AE', margin: '0 12px', overflow: 'hidden'}} />
				{h > 20 && <div style={{height: 26, background: '#C7AE72', borderRadius: 13, boxShadow: '0 6px 0 rgba(0,0,0,0.4)'}} />}
			</div>
		);
	})();
	return (
		<AbsoluteFill>
			<Board />
			<div style={{position: 'absolute', inset: 0, transform: `translate(${zoomK * (960 - cx * zE)}px, ${zoomK * (540 - cy * zE)}px) scale(${1 + (zE - 1) * zoomK})`, transformOrigin: '0 0'}}>
				<Slam at={T.v52 + 3} x={270} y={200}>
					<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 84, lineHeight: 1.05, color: C.white, letterSpacing: '-0.03em', textAlign: 'center'}}>
						NIVEL DE<br />
						<span style={{color: C.green}}>DETALLE</span>
					</div>
				</Slam>
				{/* tarjeta 1, arriba del extremo GENERAL */}
				<In at={T.v52 + 5} x={500} y={100} w={480} from="left">
					<InstrCard x={0} y={0} w={480} size={30} lines={L1} title="algoritmo1.txt" allDone />
				</In>
				{f >= T.v52 + 8 && <div style={{position: 'absolute', left: slX(POS.persona) - 3, top: 100 + CARD1_H, width: 6, height: SL.y - 100 - CARD1_H, background: C.green, opacity: 0.6}} />}
				{/* tarjeta 2, sobre la marca del robot */}
				{f >= T.nivel && <div style={{position: 'absolute', left: slX(POS.robot) - 3, top: 640, width: 6, height: SL.y - 640, background: C.green}} />}
				<In at={T.nivel} x={slX(POS.robot) - 310} y={100} w={620} from="up">
					<div style={{transform: 'scale(0.62)', transformOrigin: '0 0'}}>
						<InstrCard x={0} y={0} w={1000} size={30} lines={L2} title="algoritmo2.txt" allDone />
					</div>
				</In>
				{/* deslizador */}
				<div style={{position: 'absolute', left: SL.x0, top: SL.y - 12, width: SL.x1 - SL.x0, height: 24, background: C.line2}} />
				<div style={{position: 'absolute', left: SL.x0, top: SL.y - 12, width: kx - SL.x0, height: 24, background: C.green, boxShadow: `0 0 20px ${C.green}88`}} />
				<div style={{position: 'absolute', left: SL.x0, top: SL.y - 76, fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.text}}>GENERAL</div>
				<div style={{position: 'absolute', right: 1920 - SL.x1, top: SL.y - 76, fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.text}}>DETALLADO</div>
				<div style={{position: 'absolute', left: kx - 42, top: SL.y - 42, width: 84, height: 84, background: C.white, border: `10px solid ${C.green}`, boxSizing: 'border-box', boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}} />
				{mark(T.robot52, POS.robot, ROBOT_HEAD, 'ROBOT', C.green)}
				{mark(T.quien, POS.persona, PERSONA_HEAD, 'PERSONA', C.text)}
				{mark(T.ejecuta, POS.compu, COMPUTER(f >= T.ejecuta), 'COMPUTADORA', C.blue, 7,
					glow > 0 ? <div style={{position: 'absolute', inset: -14, boxShadow: `0 0 ${50 * glow}px ${C.blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><span style={{fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.amber, marginTop: -14}}>?</span></div> : null)}
				{parch}
				<Slam at={T.larg + 16} x={1765} y={360}>
					<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 280, color: C.red, textShadow: '0 8px 0 rgba(0,0,0,0.5)', opacity: f >= T.tienen + 6 ? 0 : 1}}>✗</div>
				</Slam>
				<Tag x={740} y={560} at={T.claras} size={62} rot={-3} color={C.green}>CLARAS ✓</Tag>
				<Vee x={175} scale={9} acts={[[T.nivel, 'senalar', 2.6], [T.larg, 'sorpresa', 2.6], [T.claras, 'celebrar', 2.4], [T.quien, 'explicar', 3]]} />
			</div>
			<Hit at={T.nivel + 2} x={slX(POS.robot)} y={400} big />
			<Hit at={T.larg + 16} x={1765} y={360} />
			<Hit at={T.claras} x={740} y={560} />
			{f >= T.larg && f < T.larg + 30 && <SpeedLines at={T.larg} len={12} mode="h" color="rgba(255,255,255,0.4)" count={8} />}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ escena */

export const B5b: React.FC = () => {
	const f = useCurrentFrame();
	const kitchen = f < T.v45 || (f >= BACK && f < T.v51);
	return (
		<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
			{kitchen && <Cocina />}
			{kitchen && <CocinaUI />}
			{f >= T.v45 && f < BACK && <Partida />}
			{f >= T.v51 && f < T.v52 && <Comparacion />}
			{f >= T.v52 && <Deslizador />}
			{/* transiciones */}
			<Barrido at={T.v45} dur={16} />
			<Iris at={BACK} x={960} y={540} dur={22} />
			<Barrido at={T.v51} dur={18} dir={-1} />
			<WipeBar at={T.v52 - 8} dur={14} />
			<CutFlash at={T.v52} len={4} max={0.6} />
			<GlitchBurst at={T.v52 - 1} len={5} intensity={0.8} />
			<Shockwave at={T.v52} x={960} y={540} size={1400} thick={16} dur={24} />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ sonido */

export const sfxB5b: Sfx[] = [
	// V43: rebobinado
	s(T.retro, 'rewind', 0.4),
	s(T.retro, 'glitch', 0.3),
	s(T.retro + 12, 'sparkle', 0.2),
	s(T.retro + 32, 'glitch', 0.2),
	s(T.que1, 'whoosh', 0.25),
	s(T.que1 + 4, 'blip', 0.25),
	s(T.resp, 'wa', 0.2),
	s(T.no, 'key', 0.35),
	s(T.no + 1, 'hit', 0.4),
	// V44: se salta y sigue en ×2
	s(T.salta, 'whoosh', 0.25),
	s(T.salta + 8, 'draw', 0.3),
	s(T.salta + 18, 'blip', 0.25),
	s(T.sigue, 'whoosh', 0.3),
	s(T.sigue + 2, 'riser', 0.25),
	s(B.pour0, 'pour', 0.3),
	s(B.pourEnd, 'check', 0.3),
	s(T.sigue + 28, 'key', 0.2),
	s(B.stir0, 'stir', 0.3),
	s(T.sigue + 50, 'key', 0.2),
	s(T.sigue + 58, 'key', 0.2),
	// V45: pantalla partida
	s(T.v45 - 3, 'whoosh', 0.35),
	s(T.v45 + 2, 'hit', 0.4),
	s(T.algo45, 'land', 0.3),
	s(T.dos45, 'hit', 0.3),
	s(T.caminos, 'hit', 0.3),
	s(T.todo, 'pop', 0.3),
	s(T.todo + 5, 'pop', 0.3),
	s(T.depende - 2, 'whoosh', 0.3),
	s(T.depende + 8, 'draw', 0.3),
	s(T.e45 + 4, 'whoosh', 0.3),
	s(BACK - 10, 'rise', 0.3),
	// V46: la leche medida
	s(BACK + 2, 'glitch', 0.2),
	s(T.azucar46, 'sparkle', 0.2),
	s(T.ahora, 'servo', 0.3),
	s(A.grab, 'stack', 0.25),
	s(T.cien, 'pop', 0.3),
	s(A.pour1a, 'pour', 0.35),
	s(A.pour1b, 'check', 0.3),
	s(A.ret1, 'land', 0.25),
	s(A.mg1, 'stack', 0.25),
	s(A.mp0, 'pour', 0.35),
	s(A.mp1, 'plop', 0.3),
	s(A.mp1 + 2, 'check', 0.35),
	// V47: cuchara y revuelto
	s(A.sg1, 'stack', 0.25),
	s(A.st0 + 2, 'stir', 0.35),
	s(A.st0 + 6, 'pop', 0.2),
	s(A.st0 + 18, 'pop', 0.2),
	s(A.st0 + 30, 'pop', 0.2),
	// V48: la cuchara sobre la mesa y la nube
	s(T.deja, 'servo', 0.25),
	s(T.mesa, 'land', 0.3),
	s(T.mesa + 1, 'check', 0.4),
	s(T.hasta, 'blip', 0.3),
	s(T.sino, 'pop', 0.3),
	s(T.queda, 'pop', 0.3),
	s(T.cuch48, 'pop', 0.3),
	s(T.mano, 'pop', 0.3),
	s(T.siempre + 2, 'pop', 0.4),
	s(T.siempre + 2, 'debris', 0.25),
	// V49: servir
	s(T.v49, 'servo', 0.3),
	s(A.c1, 'stack', 0.2),
	s(T.servir, 'whoosh', 0.3),
	s(T.servir + 16, 'land', 0.3),
	// V50: ¡ahora sí!
	s(T.ahora50, 'fanfare', 0.4),
	s(T.ahora50 + 1, 'hit', 0.4),
	s(T.ahora50 + 4, 'sparkle', 0.35),
	s(T.ahora50 + 10, 'ac', 0.3),
	// V51: comparación
	s(T.v51 - 6, 'whoosh', 0.35),
	s(T.v51 + 3, 'slide', 0.25),
	s(T.v51 + 7, 'slide', 0.25),
	s(T.algs, 'hit', 0.4),
	s(T.algs + 3, 'ac', 0.3),
	s(T.que51, 'land', 0.35),
	s(T.cuanto, 'land', 0.35),
	s(T.donde, 'land', 0.35),
	s(T.en51, 'ticks', 0.3),
	s(T.orden, 'land', 0.35),
	// V52: nivel de detalle
	s(T.v52 - 8, 'whoosh', 0.3),
	s(T.v52, 'flash', 0.3),
	s(T.v52 + 5, 'slide', 0.2),
	s(T.ese, 'slide', 0.25),
	s(T.robot52, 'pop', 0.3),
	s(T.nivel, 'hit', 0.4),
	s(T.larg, 'slide', 0.3),
	s(T.larg + 16, 'hit', 0.35),
	s(T.larg + 17, 'no', 0.3),
	s(T.tienen, 'whoosh', 0.2),
	s(T.claras, 'ac', 0.35),
	s(T.quien, 'pop', 0.3),
	s(T.ejecuta, 'pop', 0.3),
	s(T.ejecuta + 4, 'sparkle', 0.3),
	s(T.e52 + 3, 'riser', 0.3),
];
