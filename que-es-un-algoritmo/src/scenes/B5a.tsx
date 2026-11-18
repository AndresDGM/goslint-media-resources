import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inCubic, inOutCubic, outCubic, pop, tween} from '@commons/lib';
import {CutFlash, GlitchBurst, Shockwave, WipeBar} from '@commons/components';
import {Hit} from '@commons/vertical';
import {PixelBurst} from '@commons/pixel';
import {Iris, Slam, SpeedLines} from '@commons/transiciones';
import {at, BLOCKS, end} from '../timeline';
import {s, Sfx} from '../sfx';
import {
	Cam, ChoiceButton, Clap, CoffeeJar, CornerTag, Counter, Cup, CupFill, Falling, FLOOR, InstrCard, Kettle, Kitchen, Line, LIQ, MeasureJug, MilkJug, Pour, Put,
	Robot, RobotFace, RobotPose, robotRest, RobotSays, SHELF_Y, Shot, SLOT, Spoon, STOVE_Y, SugarBowl, TABLE_Y, Tag, Vee, VeeAct,
} from '../kit';

/* ================================================================== Bloque 5a · «Intento 2», primera mitad (V34–V42) */

/** Primera marca que exista entre varias grafías (el reconocedor oyó «casa» donde Vee dice «taza»). */
const atOr = (id: string, words: string[], nth = 1): number => {
	for (const w of words) {
		try {
			return at(id, w, nth);
		} catch {
			/* prueba la siguiente grafía */
		}
	}
	throw new Error(`Ninguna de ${words.join(', ')} está en ${id}`);
};

/** Marcas de la voz que usa el bloque (fotogramas absolutos). */
const T = {
	b0: BLOCKS.b5[0],
	// V34
	v34: at('V34'),
	esta34: at('V34', 'esta'),
	vamos: at('V34', 'vamos'),
	mucho: at('V34', 'mucho'),
	precisos: at('V34', 'precisos'),
	e34: end('V34'),
	// V35
	v35: at('V35'),
	paso: at('V35', 'paso'),
	uno: at('V35', '1'),
	tomar: at('V35', 'tomar'),
	taza35: at('V35', 'taza'),
	ahora: at('V35', 'ahora'),
	hay: at('V35', 'hay'),
	servir: at('V35', 'servir'),
	e35: end('V35'),
	// V36
	v36: at('V36'),
	cucharadas: at('V36', 'cucharadas'),
	cafe: at('V36', 'cafe'),
	en36: at('V36', 'en'),
	una36: at('V36', 'una'),
	dos36b: at('V36', 'dos', 2),
	e36: end('V36'),
	// V37
	v37: at('V37'),
	calentamos: at('V37', 'calentamos'),
	d200: atOr('V37', ['200', 'doscientos']),
	mili: atOr('V37', ['milililitros', 'mililitros', 'ml']),
	agua: at('V37', 'agua'),
	tetera: at('V37', 'tetera'),
	e37: end('V37'),
	// V38
	v38: at('V38'),
	vertemos: at('V38', 'vertemos'),
	taza38: atOr('V38', ['taza', 'casa']),
	sin: at('V38', 'sin'),
	salpicar: at('V38', 'salpicar'),
	por: at('V38', 'por'),
	favor38: at('V38', 'favor'),
	e38: end('V38'),
	// V39
	v39: at('V39'),
	ahora39: at('V39', 'ahora'),
	viene: at('V39', 'viene'),
	nuevo: at('V39', 'nuevo'),
	robot39: at('V39', 'robot'),
	pregunta: at('V39', 'pregunta'),
	e39: end('V39'),
	// V40
	v40: at('V40'),
	respondamos: at('V40', 'respondamos'),
	cambiar: at('V40', 'cambiar'),
	primero: at('V40', 'primero'),
	si40: at('V40', 'si'),
	e40: end('V40'),
	// V41
	v41: at('V41'),
	dos41: at('V41', 'dos'),
	favor41: at('V41', 'favor'),
	e41: end('V41'),
	// V42
	v42: at('V42'),
	una42a: at('V42', 'una'),
	dos42a: at('V42', 'dos', 1),
	exact: at('V42', 'exactamente'),
	dos42b: at('V42', 'dos', 2),
	ni1: at('V42', 'ni', 1),
	una42b: at('V42', 'una', 2),
	mas42: at('V42', 'mas'),
	menos: at('V42', 'menos'),
	e42: end('V42'),
};

/** Silbido de la tetera: dentro de la pausa de 1,8 s tras V37. */
const WH = {
	cut: T.e37, // corte (iris) al plano detalle de la tetera
	heat: T.e37 + 3, // empieza a subir el termómetro
	pop: T.e37 + 33, // salta la tapa
};
/** La llama se enciende cuando termina de caer el agua en la tetera. */
const FLAME = T.tetera + 12;

/* ------------------------------------------------------------------ posiciones (lienzo 1920×1080) */

const RX0 = 880; // el robot en su sitio
const RX1 = 960; // da un paso a la derecha para alcanzar la tetera
const STEP = {a: T.e36 + 1, b: T.v37 - 2};
const BACK = {a: T.e38 + 2, b: T.v39 + 6};
/** x del robot (se mueve entre RX0 y RX1). */
const rx = (f: number) => RX0 + (RX1 - RX0) * tween(f, STEP.a, STEP.b, 0, 1, inOutCubic) - (RX1 - RX0) * tween(f, BACK.a, BACK.b, 0, 1, inOutCubic);
const walking = (f: number) => (f >= STEP.a && f < STEP.b) || (f >= BACK.a && f < BACK.b);
const restAt = (f: number): [number, number] => robotRest(rx(f), FLOOR, 'F');

const CUP_SH_X = 1500; // taza en la repisa
const CUP_SH_Y = SHELF_Y - 55;
const CUP_T_Y = TABLE_Y - 55; // centro de la taza sobre la mesa
const SP_X = 1400; // cuchara en la repisa (se toma por el extremo del mango)
const SPS = 12; // escala de la cuchara (más grande que PX para que se lea)
const SP_Y = SHELF_Y - 18;
const KET_X = 1700; // la tetera, sobre la hornilla
const KET_HANDLE: [number, number] = [KET_X - 82.5 + 11, STOVE_Y - 132 + 77]; // asa (1628, 623)
const JUG_AT: [number, number] = [1040, 470]; // la jarra medidora bajo el grifo
const JUG_KET: [number, number] = [1618, 485]; // y sobre la tetera
const OVER_CUP: [number, number] = [978, 457]; // mano con la cuchara sobre la taza (cuenco en x ≈ 1110)
const KET_POUR: [number, number] = [966, 512]; // asa de la tetera al verter en la taza
const NOZZLE_Y = 396;
/** Polvo de café más claro que el café líquido: el oscuro no se distingue sobre la pared. */
const COFFEE_DUST = '#8A5434';

/** Gira (dx, dy) θ grados en sentido horario (ejes de pantalla). */
const rotP = (dx: number, dy: number, deg: number): [number, number] => {
	const r = (deg * Math.PI) / 180;
	return [dx * Math.cos(r) - dy * Math.sin(r), dx * Math.sin(r) + dy * Math.cos(r)];
};
/** Centro del cuenco de la cuchara sostenida por el extremo del mango en `h`, girada `a` grados. */
const bowlAt = (h: [number, number], a: number): [number, number] => {
	const [dx, dy] = rotP(0, -134, a);
	return [h[0] + dx, h[1] + dy];
};

/* ------------------------------------------------------------------ trayectoria de la mano delantera del robot */

type HK = {f: number; x: number; y: number; a: number; rest?: boolean; lin?: boolean};
const K = (f: number, x: number, y: number, a = 0, lin = false): HK => ({f, x, y, a, lin});
const KR = (f: number): HK => ({f, x: 0, y: 0, a: 0, rest: true});

/**
 * La mano (en la escena) y un ángulo `a` que depende de lo que sostiene: giro de la cuchara,
 * inclinación de la jarra o de la tetera. `KR` = mano en reposo (sigue al robot cuando camina).
 */
const HAND: HK[] = [
	KR(T.b0),
	KR(T.uno),
	// V35 · la taza de la repisa a la mesa
	K(T.tomar, CUP_SH_X, CUP_SH_Y),
	K(T.tomar + 4, CUP_SH_X, CUP_SH_Y),
	K(T.taza35, SLOT[0], CUP_T_Y),
	K(T.taza35 + 3, SLOT[0], CUP_T_Y),
	KR(T.taza35 + 15),
	// V36 · dos cucharadas de café
	KR(T.v36 - 3),
	K(T.v36 + 9, SP_X, SP_Y),
	K(T.v36 + 12, SP_X, SP_Y),
	K(T.v36 + 23, 1265, 420, 180),
	K(T.cafe, 1265, 476, 180),
	K(T.cafe + 8, 1265, 476, 180),
	K(T.cafe + 15, 1265, 420, 180),
	K(T.cafe + 24, 1200, 380, 0),
	K(T.una36 - 6, 1000, 420, 30),
	K(T.una36, OVER_CUP[0], OVER_CUP[1], 100),
	K(T.una36 + 9, OVER_CUP[0], OVER_CUP[1], 100),
	K(T.una36 + 16, 1265, 420, 180),
	K(T.una36 + 20, 1265, 476, 180),
	K(T.una36 + 23, 1265, 476, 180),
	K(T.una36 + 26, 1265, 420, 180),
	K(T.dos36b - 2, OVER_CUP[0], OVER_CUP[1], 100),
	K(T.dos36b + 9, OVER_CUP[0], OVER_CUP[1], 100),
	K(T.dos36b + 21, SP_X, SP_Y, 0),
	K(T.dos36b + 24, SP_X, SP_Y, 0),
	KR(T.dos36b + 38),
	// V37 · la jarra medidora: grifo → tetera
	K(T.calentamos + 12, JUG_AT[0], JUG_AT[1]),
	K(T.mili - 2, JUG_AT[0], JUG_AT[1]),
	K(T.mili + 16, JUG_KET[0], JUG_KET[1]),
	K(T.agua + 3, JUG_KET[0], JUG_KET[1]),
	K(T.agua + 10, JUG_KET[0], JUG_KET[1], 70),
	K(T.tetera + 10, JUG_KET[0], JUG_KET[1], 70),
	K(T.tetera + 16, JUG_KET[0], JUG_KET[1], 0),
	KR(T.tetera + 24),
	// V38 · la tetera a la taza
	KR(T.v38 - 2),
	K(T.vertemos, KET_HANDLE[0], KET_HANDLE[1]),
	K(T.vertemos + 3, KET_HANDLE[0], KET_HANDLE[1]),
	K(T.vertemos + 10, 1560, 470),
	K(T.vertemos + 17, 1250, 440),
	K(T.taza38, KET_POUR[0], KET_POUR[1]),
	K(T.taza38 + 8, KET_POUR[0], KET_POUR[1], 30),
	K(T.por - 3, KET_POUR[0], KET_POUR[1], 30),
	K(T.por + 4, KET_POUR[0], KET_POUR[1], 0),
	K(T.favor38 + 2, 1300, 450),
	K(T.e38 - 3, KET_HANDLE[0], KET_HANDLE[1]),
	K(T.e38, KET_HANDLE[0], KET_HANDLE[1]),
	KR(T.e38 + 10),
	// V41–V42 · el azúcar
	KR(T.dos41 + 8),
	K(T.dos41 + 18, SP_X, SP_Y),
	K(T.dos41 + 21, SP_X, SP_Y),
	K(T.dos41 + 30, 1400, 420, 180),
	K(T.dos41 + 33, 1400, 476, 180),
	K(T.dos41 + 36, 1400, 476, 180),
	K(T.dos41 + 39, 1400, 412, 180),
	K(T.una42a - 6, 1020, 420, 40),
	K(T.una42a, OVER_CUP[0], OVER_CUP[1], 100),
	K(T.una42a + 6, OVER_CUP[0], OVER_CUP[1], 100),
	K(T.una42a + 13, 1400, 412, 180),
	K(T.una42a + 16, 1400, 476, 180),
	K(T.una42a + 18, 1400, 476, 180),
	K(T.una42a + 20, 1400, 412, 180),
	K(T.dos42a - 1, OVER_CUP[0], OVER_CUP[1], 100),
	K(T.dos42a + 6, OVER_CUP[0], OVER_CUP[1], 100),
	K(T.dos42a + 13, 1400, 412, 180),
	K(T.dos42a + 16, 1400, 476, 180), // la tercera cucharada
	K(T.dos42a + 19, 1400, 476, 180),
	K(T.dos42a + 22, 1400, 412, 180),
	K(T.dos42b - 12, 1150, 400, 40),
	K(T.dos42b - 1, OVER_CUP[0], OVER_CUP[1], 60, true), // frena en seco sobre la taza
	K(T.dos42b + 14, OVER_CUP[0], OVER_CUP[1], 60),
	K(T.una42b, SP_X, SP_Y, 0), // devuelve la cuchara
	K(T.una42b + 3, SP_X, SP_Y, 0),
	KR(T.mas42 + 4),
].sort((a, b) => a.f - b.f);

const keyPt = (k: HK, f: number) => (k.rest ? {x: restAt(f)[0], y: restAt(f)[1], a: 0} : {x: k.x, y: k.y, a: k.a});
const handAt = (f: number): {x: number; y: number; a: number} => {
	if (f <= HAND[0].f) return keyPt(HAND[0], f);
	for (let i = 0; i < HAND.length - 1; i++) {
		const A = HAND[i];
		const B = HAND[i + 1];
		if (f < B.f) {
			const k = tween(f, A.f, B.f, 0, 1, B.lin ? (t: number) => t : inOutCubic);
			const both = A.rest && B.rest;
			const pa = keyPt(A, both ? f : A.f);
			const pb = keyPt(B, both ? f : B.f);
			return {x: pa.x + (pb.x - pa.x) * k, y: pa.y + (pb.y - pa.y) * k, a: pa.a + (pb.a - pa.a) * k};
		}
	}
	return keyPt(HAND[HAND.length - 1], f);
};

/* ------------------------------------------------------------------ qué sostiene el robot y cómo está cada objeto */

const win = (f: number, a: number, b: number) => f >= a && f < b;
type Hold = 'cup' | 'spoon' | 'jug' | 'kettle' | null;
const holdOf = (f: number): Hold => {
	if (win(f, T.tomar + 3, T.taza35 + 2)) return 'cup';
	if (win(f, T.v36 + 11, T.dos36b + 24) || win(f, T.dos41 + 20, T.una42b + 3)) return 'spoon';
	if (win(f, T.calentamos + 8, T.tetera + 16)) return 'jug';
	if (win(f, T.vertemos + 3, T.e38 - 1)) return 'kettle';
	return null;
};
/** Carga de la cuchara. */
const loadOf = (f: number): 'coffee' | 'sugar' | undefined => {
	if (win(f, T.cafe + 5, T.una36 + 3) || win(f, T.una36 + 21, T.dos36b + 3)) return 'coffee';
	if (win(f, T.dos41 + 34, T.una42a + 3) || win(f, T.una42a + 17, T.dos42a + 3) || win(f, T.dos42a + 17, T.una42b)) return 'sugar';
	return undefined;
};

/** Contenido de la taza: vacía, con café molido y luego con el agua que sube. */
const POUR0 = T.taza38 + 10;
const POUR1 = T.por - 2;
const cupState = (f: number): {fill: CupFill; level: number; steam: boolean} => {
	if (f >= POUR0) return {fill: 'black', level: tween(f, POUR0, POUR1, 0, 1, (t) => t), steam: f >= POUR1 - 6};
	if (f >= T.una36 + 6) return {fill: 'grounds', level: 1, steam: false};
	return {fill: 'empty', level: 1, steam: false};
};
/** Altura (y) de la superficie del líquido de la taza sobre la mesa (sprite de 10 filas a escala 11). */
const cupSurface = (level: number) => TABLE_Y - 110 + Math.max(1, Math.round(8 - 7 * level)) * 11;
/** Nivel de la jarra medidora. */
const jugLevel = (f: number) => tween(f, T.calentamos + 10, T.mili, 0, 1, (t) => t) * (1 - 0.93 * tween(f, T.agua + 10, T.tetera + 14, 0, 1, (t) => t));

/* ------------------------------------------------------------------ cámara */

const sh = (f: number, v: [number, number, number], mov?: number): Shot => (mov ? [f, v[0], v[1], v[2], mov] : [f, v[0], v[1], v[2]]);
/**
 * Los encuadres se eligen para que ni Vee ni el robot queden cortados y para que el robot quede
 * a la derecha de la tarjeta (arriba a la izquierda) o por debajo de ella.
 */
const SHOTS: Shot[] = [
	sh(T.b0, [1.06, 940, 585]),
	sh(T.vamos, [1.2, 930, 590]),
	sh(T.mucho, [1.0, 960, 540]),
	// V35
	sh(T.v35, [1.3, 940, 585]),
	sh(T.uno, [1.15, 940, 575]),
	sh(T.tomar, [1.35, 960, 570]),
	sh(T.taza35, [1.5, 940, 590]),
	sh(T.ahora, [1.0, 960, 540]),
	sh(T.hay, [1.5, 940, 590]),
	sh(T.servir, [1.2, 960, 580]),
	// V36
	sh(T.v36, [1.3, 940, 585]),
	sh(T.cafe, [1.5, 960, 590]),
	sh(T.en36 + 3, [1.2, 940, 580]),
	sh(T.una36, [1.5, 960, 590]),
	sh(T.dos36b, [1.35, 960, 585]),
	// V37
	sh(T.v37, [1.4, 980, 575]),
	sh(T.mili, [1.1, 940, 570]),
	sh(T.e37, [2.0, 1463, 600]),
	// V38
	sh(T.v38, [1.1, 940, 570]),
	sh(T.vertemos, [1.5, 960, 580], 12),
	sh(T.taza38 - 2, [1.7, 1030, 570]),
	sh(T.sin, [1.25, 960, 585]),
	sh(T.por, [1.6, 1030, 600]),
	sh(T.favor38, [1.1, 940, 570]),
	// V39
	sh(T.v39, [1.15, 940, 575]),
	sh(T.viene, [1.3, 940, 585]),
	sh(T.robot39, [1.5, 940, 590]),
	sh(T.pregunta, [1.1, 940, 570]),
	// V40
	sh(T.cambiar, [1.0, 960, 540]),
	sh(T.primero, [1.15, 940, 575]),
	sh(T.si40, [1.0, 960, 540]),
	// V41
	sh(T.v41, [1.25, 920, 585]),
	sh(T.favor41, [1.3, 960, 590]),
	// V42
	sh(T.v42, [1.4, 940, 590]),
	sh(T.dos42a, [1.55, 960, 590]),
	sh(T.exact, [1.3, 940, 585]),
	sh(T.dos42b, [1.45, 940, 590]),
	sh(T.ni1, [1.0, 960, 540]),
	sh(T.e42, [1.15, 940, 575]),
	sh(T.e42 + 24, [1.0, 960, 540]),
];
const SHAKES = [T.v34 + 3, T.taza35, T.una36, T.dos36b, WH.pop, WH.pop + 7, T.si40, T.una42a, T.dos42a, T.dos42b];

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
const proj = (f: number, p: [number, number]): [number, number] => {
	const {z, cx, cy} = camAt(f);
	return [960 + (p[0] - cx) * z, 540 + (p[1] - cy) * z];
};

/* ------------------------------------------------------------------ Vee */

const VEE_ACTS: [number, VeeAct, number?][] = [
	[T.esta34, 'senalar', 2.4],
	[T.mucho, 'explicar', 2.6],
	[T.tomar, 'senalar', 2.4],
	[T.ahora, 'celebrar', 2.4],
	[T.cucharadas, 'explicar', 2.6],
	[T.una36, 'senalar', 3],
	[T.calentamos, 'explicar', 2.6],
	[T.tetera, 'senalar', 2.6],
	[T.vertemos, 'explicar', 3],
	[T.sin, 'sorpresa', 2.2],
	[T.ahora39, 'celebrar', 2.6],
	[T.nuevo, 'explicar', 2.6],
	[T.robot39, 'senalar', 2.4],
	[T.respondamos, 'explicar', 2.6],
	[T.cambiar, 'senalar', 2.4],
	[T.primero, 'senalar', 2.6],
	[T.dos41, 'explicar', 3],
	[T.una42a, 'senalar', 3],
	[T.exact, 'explicar', 3],
	[T.ni1, 'celebrar', 2.2],
];
/** Vee: junto al robot durante la acción; se acerca a ver el vertido; vuelve a su sitio al final. */
const VEE_XS: [number, number][] = [
	[T.b0, 270],
	[T.paso, 270],
	[T.paso + 14, 420],
	[T.taza38 - 12, 420],
	[T.taza38 - 2, 600],
	[T.e38 + 4, 600],
	[T.v39 + 10, 420],
	[T.menos, 420],
	[T.e42 + 8, 270],
];

/* ------------------------------------------------------------------ robot */

type RobotState = {
	pose: RobotPose; face: RobotFace; look?: [number, number]; chest?: string; holdF?: React.ReactNode; hops?: number[]; time?: number;
};
const ROBOT_HOPS = [T.taza35 + 3, T.ahora + 4, T.dos36b + 10, T.e37 + 40, T.e38, T.pregunta, T.si40, T.dos41 + 2, T.dos42b + 16, T.menos + 2];

/** Lo que sostiene la mano delantera (el origen del objeto queda donde está la mano). */
const heldNode = (kind: Hold, f: number, a: number): React.ReactNode => {
	if (kind === 'cup') return <Cup />;
	if (kind === 'spoon') {
		return (
			<div style={{position: 'relative', width: 0, height: 0}}>
				<div style={{position: 'absolute', left: -24, top: -158}}>
					<Spoon scale={SPS} rot={a} load={loadOf(f)} />
				</div>
			</div>
		);
	}
	if (kind === 'jug') {
		const lv = jugLevel(f);
		return (
			<div style={{position: 'relative', width: 0, height: 0}}>
				<div style={{position: 'absolute', left: -49.5, top: -66, width: 99, height: 132, transform: `rotate(${a}deg)`, transformOrigin: '50% 50%'}}>
					<MeasureJug level={lv} label={f >= T.d200 && a < 5 ? '200 ml' : undefined} />
				</div>
			</div>
		);
	}
	if (kind === 'kettle') {
		const k = kettleState(f);
		return (
			<div style={{position: 'relative', width: 0, height: 0}}>
				<div style={{position: 'absolute', left: -11, top: -77, width: 165, height: 132, transform: `rotate(${a}deg)`, transformOrigin: '11px 77px'}}>
					<Kettle steam={f >= FLAME} shake={k.shake} lid={k.lid} />
				</div>
			</div>
		);
	}
	return null;
};

const robotAt = (f: number): RobotState => {
	const kind = holdOf(f);
	const h = handAt(f);
	const holdF = heldNode(kind, f, h.a);
	const base = {holdF, hops: ROBOT_HOPS};
	if (walking(f)) return {...base, pose: 'walk', face: 'focus', look: [1, 0], chest: '▶', time: f * 1.6};
	if (f < T.mucho) return {...base, pose: 'idle', face: 'happy', look: [-1, 0], chest: '▶'};
	if (f < T.e34 + 4) return {...base, pose: 'idle', face: 'wow', look: [0, 0], chest: '17'};
	if (f < T.tomar) return {...base, pose: 'hold', face: 'focus', look: [1, -1], chest: '1'};
	if (f < T.taza35 + 2) return {...base, pose: 'hold', face: 'focus', look: [1, -1], chest: '1'};
	if (f < T.v36) return {...base, pose: 'hold', face: 'proud', look: [1, 1], chest: '✓'};
	if (f < T.una36) return {...base, pose: 'hold', face: 'focus', look: [1, 0], chest: '2'};
	if (f < T.dos36b) return {...base, pose: 'hold', face: 'focus', look: [1, 1], chest: '1'};
	if (f < T.dos36b + 14) return {...base, pose: 'hold', face: 'happy', look: [1, 1], chest: '2'};
	if (f < T.calentamos) return {...base, pose: 'hold', face: 'proud', look: [1, 0], chest: '✓'};
	if (f < T.mili) return {...base, pose: 'hold', face: 'focus', look: [1, -1], chest: '200'};
	if (f < T.tetera + 20) return {...base, pose: 'hold', face: 'focus', look: [1, 0], chest: '200'};
	if (f < T.v38) return {...base, pose: 'hold', face: 'happy', look: [1, 0], chest: '✓'};
	if (f < T.e38 - 3) return {...base, pose: 'hold', face: 'focus', look: [1, 1], chest: '~'};
	if (f < T.robot39) return {...base, pose: 'hold', face: 'happy', look: [-1, 0], chest: '✓'};
	if (f < T.si40) return {...base, pose: 'hold', face: 'conf', look: [-1, 0], chest: '?'};
	if (f < T.dos41) return {...base, pose: 'hold', face: 'happy', look: [-1, 0], chest: '✓'};
	if (f < T.una42a) return {...base, pose: 'hold', face: 'proud', look: [1, 0], chest: '2'};
	if (f < T.dos42a) return {...base, pose: 'hold', face: 'focus', look: [1, 0], chest: '1'};
	if (f < T.dos42b) return {...base, pose: 'hold', face: 'focus', look: [1, 0], chest: '2'};
	if (f < T.ni1) return {...base, pose: 'hold', face: 'wow', look: [1, 1], chest: '=='};
	return {...base, pose: 'hold', face: 'proud', look: [-1, 0], chest: '✓'};
};

/** Estado de la tetera: tapa y temblor (la tapa salta al silbar). */
const kettleState = (f: number): {shake: number; lid: number} => {
	const open = win(f, T.agua, T.tetera + 16) ? 1 : 0;
	const heat = tween(f, FLAME, WH.pop, 0, 1, (t) => t);
	const whistle = f >= WH.pop && f < WH.pop + 26 ? Math.abs(Math.sin((f - WH.pop) / 2.2)) : 0;
	const shake = f < FLAME ? 0 : f < WH.pop ? 0.25 + 0.75 * heat : f < T.vertemos ? 0.7 : 0;
	return {shake, lid: Math.max(open, whistle)};
};

/* ------------------------------------------------------------------ tarjeta del algoritmo (17 líneas) */

const LINES: Line[] = [
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
const CARD = {x: 40, y: 90, w: 760, size: 30, win: 9};
const FS = Math.min(CARD.size, Math.floor((CARD.w - 56 - CARD.size * 1.1) / (0.602 * Math.max(...LINES.map((l) => l.text.length + (l.indent ?? 0) * 2)))));
const LH = Math.round(FS * 1.5);
/** Distancia del borde superior de la tarjeta a la primera línea. */
const LINE0 = 69;

/** Cursor de ejecución (una línea por instrucción). */
const CURSOR: [number, number][] = [
	[T.v35, 0],
	[T.uno, 1],
	[T.v36, 2],
	[T.v37, 3],
	[T.v38, 4],
	[T.v39, 5],
	[T.cambiar, 6],
	[T.e40 + 6, 7],
	[T.dos41, 8],
	[T.favor41, 9],
	[T.e42, 10],
];
/** Barrido de V34: recorre las 17 líneas de golpe. */
const SWEEP: [number, number][] = Array.from({length: 17}, (_, i) => [T.mucho + 10 + Math.round(i * 1.4), i] as [number, number]);

const scrollOf = (ln: number) => Math.max(0, Math.min(LINES.length - CARD.win, (ln < 0 ? 0 : ln) - Math.floor(CARD.win / 2)));
/** Desplazamiento (en líneas) de la tarjeta en el fotograma f: igual que el del kit. */
const scrollNow = (f: number) => {
	let active = -1;
	let prev = -1;
	let moved = -999;
	for (const [fr, ln] of CURSOR) {
		if (f >= fr) {
			prev = active;
			active = ln;
			moved = fr;
		}
	}
	return scrollOf(prev) + (scrollOf(active) - scrollOf(prev)) * tween(f, moved, moved + 9);
};
/** Centro vertical de la línea i en pantalla. */
const lineY = (f: number, i: number) => CARD.y + LINE0 + (i - scrollNow(f)) * LH + LH / 2;

const Tarjeta: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.mucho) return null;
	if (f < T.v35) {
		return <InstrCard x={CARD.x} y={CARD.y} w={CARD.w} size={CARD.size} window={CARD.win} title="algoritmo2.txt" lines={LINES} cursor={SWEEP} at={T.mucho} />;
	}
	const blockOn = f >= T.cambiar && f < T.favor41 + 6;
	return (
		<InstrCard
			x={CARD.x}
			y={CARD.y}
			w={CARD.w}
			size={CARD.size}
			window={CARD.win}
			title="algoritmo2.txt"
			lines={LINES}
			cursor={CURSOR}
			marks={f >= T.en36 ? {2: ['a la taza']} : {}}
			blockHl={blockOn ? [6, 10] : null}
			at={T.v35}
		/>
	);
};

/** Las dos flechas de V40 junto a la tarjeta: una entra al bloque SI…FIN SI y la otra lo rodea. */
const Flechas: React.FC = () => {
	const f = useCurrentFrame();
	const a = T.cambiar;
	const o = 1 - tween(f, T.favor41, T.favor41 + 6, 0, 1, inCubic);
	if (f < a || o <= 0) return null;
	const x0 = CARD.x + CARD.w + 6;
	const y6 = lineY(f, 6);
	const y8 = lineY(f, 8);
	const y10 = lineY(f, 10) + LH * 0.62;
	const kA = tween(f, a, a + 14, 0, 1, outCubic);
	const kB = tween(f, a + 8, a + 24, 0, 1, outCubic);
	const head = (x: number, y: number, c: string, k: number) =>
		k > 0.92 ? <polygon points={`${x},${y} ${x + 22},${y - 15} ${x + 22},${y + 15}`} fill={c} /> : null;
	return (
		<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', opacity: o}}>
			<path d={`M ${x0} ${y6 - 8} H ${x0 + 54} V ${y8} H ${x0 + 26}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - kA} fill="none" stroke={C.green} strokeWidth={8} strokeLinejoin="round" />
			{head(x0 + 4, y8, C.green, kA)}
			<path d={`M ${x0} ${y6 + 8} H ${x0 + 108} V ${y10} H ${x0 + 26}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - kB} fill="none" stroke={C.blue} strokeWidth={8} strokeLinejoin="round" />
			{head(x0 + 4, y10, C.blue, kB)}
			{f >= a + 6 && (
				<text x={x0 + 66} y={(y6 + y8) / 2 + 12} fontFamily={MONO} fontWeight={800} fontSize={40} fill={C.green} opacity={pop(f, a + 6, 12, 260, 0.6)}>SÍ</text>
			)}
			{f >= a + 14 && (
				<text x={x0 + 120} y={(y6 + y10) / 2 + 12} fontFamily={MONO} fontWeight={800} fontSize={40} fill={C.blue} opacity={pop(f, a + 14, 12, 260, 0.6)}>NO</text>
			)}
		</svg>
	);
};

/* ------------------------------------------------------------------ piezas locales */

/** Grifo de pared (V37): sale por detrás de la tarjeta y llena la jarra medidora. */
const Grifo: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.v37 - 3 || f >= T.e37) return null;
	const p = pop(f, T.v37 - 3, 11, 260, 0.6);
	const out = tween(f, T.mili + 12, T.mili + 22, 0, 1, inCubic);
	const turn = (f - T.calentamos) * 9 * (f < T.mili ? 1 : 0);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translateY(${(1 - p) * -200 - out * 220}px)`}}>
			<div style={{position: 'absolute', left: 760, top: 292, width: 303, height: 40, background: '#8E9A94', boxShadow: 'inset 0 -8px 0 #6B7771, inset 0 6px 0 #B9C3BE'}} />
			<div style={{position: 'absolute', left: 1017, top: 292, width: 46, height: 100, background: '#8E9A94', boxShadow: 'inset -8px 0 0 #6B7771, inset 6px 0 0 #B9C3BE'}} />
			<div style={{position: 'absolute', left: 1006, top: 378, width: 68, height: 18, background: '#6B7771'}} />
			<div style={{position: 'absolute', left: 905, top: 268, width: 12, height: 26, background: '#6B7771'}} />
			<div style={{position: 'absolute', left: 876, top: 252, width: 70, height: 18, background: '#E2463E', transform: `rotate(${turn}deg)`, boxShadow: '0 5px 0 #A8302A'}} />
		</div>
	);
};

/** Nube de polvo (aparece / desaparece un objeto). */
const Puff: React.FC<{at: number; x: number; y: number; seed?: number}> = ({at: a, x, y, seed = 3}) => {
	const f = useCurrentFrame();
	return <PixelBurst f={f} at={a} x={x} y={y} count={14} power={9} colors={['#FFFFFF', '#B9C3BE', C.green]} seed={seed} grid={8} life={18} />;
};

/** Globo del robot en coordenadas de pantalla, sobre su cabeza (sigue los cortes de cámara). */
const Say: React.FC<{at: number; out: number; text: string; color?: string; size?: number; dx?: number}> = ({at: a, out, text, color = C.green, size = 46, dx = 0}) => {
	const f = useCurrentFrame();
	if (f < a || f >= out) return null;
	const [hx, hy] = proj(f, [rx(f), 478]);
	const w = text.length * 0.602 * size + 56;
	const x = Math.min(Math.max(hx + dx, 40 + w / 2), 1880 - w / 2);
	return (
		<RobotSays x={x} y={Math.max(hy, 215)} at={a} out={out} color={color} size={size}>
			{text}
		</RobotSays>
	);
};

/** Termómetro del plano detalle de la tetera (en pantalla). */
const Termometro: React.FC = () => {
	const f = useCurrentFrame();
	const a = WH.heat;
	const b = T.v38 + 4;
	if (f < a - 2 || f >= b) return null;
	const k = tween(f, a, WH.pop - 2, 0, 1, (t) => t);
	const temp = Math.round(20 + 80 * k);
	const col = k < 0.55 ? C.blue : k < 0.9 ? C.amber : C.red;
	const p = pop(f, a - 2, 11, 260, 0.6);
	const o = 1 - tween(f, T.v38 - 4, T.v38 + 4);
	const H = 520;
	const flash = f >= WH.pop && f < WH.pop + 10 ? 1 : 0;
	return (
		<div style={{position: 'absolute', left: 1660, top: 250, width: 230, height: 640, opacity: o, transform: `scale(${0.3 + 0.7 * p})`, transformOrigin: '50% 100%'}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: -66, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 88, color: col, textShadow: `0 0 ${24 + 20 * flash}px ${col}`}}>{temp}°C</div>
			<div style={{position: 'absolute', left: 78, top: 30, width: 74, height: H, background: 'rgba(255,255,255,0.12)', border: '6px solid #E9EEEA', borderRadius: 37}} />
			<div style={{position: 'absolute', left: 90, top: 30 + 12 + (H - 24) * (1 - k), width: 50, height: (H - 24) * k + 40, background: col, boxShadow: `0 0 26px ${col}`}} />
			<div style={{position: 'absolute', left: 52, top: H - 10, width: 126, height: 126, borderRadius: '50%', background: col, border: '6px solid #E9EEEA', boxShadow: `0 0 34px ${col}`}} />
			{[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
				<div key={i} style={{position: 'absolute', left: 164, top: 42 + (H - 40) * (1 - t), width: 36 - (i % 2) * 12, height: 5, background: '#E9EEEA'}} />
			))}
		</div>
	);
};

/** Panel de interfaz que sale del pecho del robot (V39–V41). Fuera de la cámara. */
const PANEL = {x: 1010, y: 192, w: 860, h: 372};
const Pregunta: React.FC = () => {
	const f = useCurrentFrame();
	const a = T.pregunta;
	const swap = T.e40 + 4;
	const close = T.dos41 + 16;
	if (f < a || f >= close + 10) return null;
	const p = pop(f, a, 11, 230, 0.6);
	const q = tween(f, close, close + 9, 0, 1, inCubic);
	const [cx, cy] = proj(f, [rx(f) + 20, 760]);
	const ox = cx - PANEL.x;
	const oy = cy - PANEL.y;
	const sc = (0.08 + 0.92 * p) * (1 - 0.92 * q);
	const k2 = tween(f, swap, swap + 8, 0, 1, inOutCubic);
	const header = (
		<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 26, color: C.green, padding: '10px 22px', borderBottom: `3px solid ${C.line2}`, letterSpacing: '0.12em', display: 'flex', justifyContent: 'space-between'}}>
			<span>▣ ROBOT · PREGUNTA</span>
			<span style={{color: C.amber}}>{f >= swap ? '2/2' : '1/2'}</span>
		</div>
	);
	return (
		<div style={{position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, transform: `scale(${sc})`, transformOrigin: `${ox}px ${oy}px`, opacity: Math.min(1, p * 2) * (1 - q), background: 'rgba(8,12,10,0.97)', border: `5px solid ${C.green}`, boxShadow: `0 0 60px ${C.green}55, 0 24px 50px rgba(0,0,0,0.6)`, boxSizing: 'border-box', overflow: 'hidden'}}>
			{header}
			{/* pregunta 1 */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 54, bottom: 0, transform: `translateX(${-k2 * 120}px)`, opacity: 1 - k2}}>
				<div style={{position: 'absolute', left: 40, top: 14, fontFamily: MONO, fontWeight: 800, fontSize: 64, lineHeight: 1.12, color: C.white}}>
					¿DESEA AGREGAR<br />
					<span style={{color: C.green}}>AZÚCAR?</span>
				</div>
				<div style={{position: 'absolute', right: 56, top: 26, transform: `rotate(${Math.sin(f / 9) * 4}deg)`}}>
					<SugarBowl scale={13} />
				</div>
				<div style={{position: 'absolute', left: 40, top: 170, display: 'flex', gap: 60}}>
					<ChoiceButton label="SÍ" color={C.green} pressAt={T.si40} />
					<ChoiceButton label="NO" color="#8A948E" dim={f >= T.primero} />
				</div>
			</div>
			{/* pregunta 2 */}
			{f >= swap && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 54, bottom: 0, transform: `translateX(${(1 - k2) * 120}px)`, opacity: k2}}>
					<div style={{position: 'absolute', left: 40, top: 14, fontFamily: MONO, fontWeight: 800, fontSize: 64, lineHeight: 1.12, color: C.white}}>
						¿CUÁNTAS<br />
						<span style={{color: C.green}}>CUCHARADAS?</span>
					</div>
					<div style={{position: 'absolute', right: 56, top: 26}}>
						<Spoon scale={13} load="sugar" rot={20} />
					</div>
					<div style={{position: 'absolute', left: 40, top: 170, display: 'flex', gap: 36}}>
						{['1', '2', '3'].map((n) => {
							const pressed = f >= T.dos41;
							const mine = n === '2';
							const flash = pressed && mine ? Math.max(0, 1 - (f - T.dos41) / 10) : 0;
							return (
								<div key={n} style={{width: 220, height: 130, background: mine ? C.green : '#8A948E', opacity: pressed && !mine ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.bg, transform: `scale(${pressed && mine ? 0.94 : 1}) translateY(${pressed && mine ? 10 : 0}px)`, boxShadow: pressed && mine ? `0 2px 0 rgba(0,0,0,0.4), 0 0 ${50 * flash + 12}px ${C.green}` : '0 12px 0 rgba(0,0,0,0.4)'}}>
									{n}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

/* ------------------------------------------------------------------ cocina (dentro de la cámara) */

const Cocina: React.FC = () => {
	const f = useCurrentFrame();
	const r = robotAt(f);
	const h = handAt(f);
	const kind = holdOf(f);
	const cs = cupState(f);
	const kS = kettleState(f);
	const x = rx(f);
	const flameOn = f >= FLAME && f < T.vertemos + 4;
	const ketHeld = kind === 'kettle';
	// chorros
	const jugNozzle = win(f, T.calentamos + 10, T.mili - 1);
	const jugTop = JUG_AT[1] - 66;
	const jugLiquidY = jugTop + Math.round(11 - 10 * jugLevel(f)) * 11;
	const jugPour = kind === 'jug' && h.a > 40 && f < T.tetera + 12 && f >= T.agua + 8;
	const jugLip = rotP(38.5, -66, h.a);
	const lipX = h.x + jugLip[0];
	const lipY = h.y + jugLip[1];
	const ketPour = ketHeld && h.a > 20 && f >= POUR0 && f < POUR1 + 2;
	const spout = rotP(152, -27, h.a);
	const spX = h.x + spout[0];
	const spY = h.y + spout[1];
	// gotas que caen de la cuchara
	const drop = (a: number, color: string) => {
		const b = bowlAt(OVER_CUP, 100);
		return <Falling key={a} x={b[0]} y0={b[1] + 8} y1={cupSurface(1) + 44} at={a} dur={8} color={color} n={16} spread={30} />;
	};
	const showCupShelf = f < T.tomar + 3;
	const showCupTable = f >= T.taza35 + 2;
	const showSpoonShelf = kind !== 'spoon';
	return (
		<Cam shots={SHOTS} shakeAt={SHAKES}>
			<Kitchen jar={false} flame={flameOn} />
			<Grifo />
			{/* repisa */}
			{showCupShelf && <Put x={CUP_SH_X} y={SHELF_Y}><Cup /></Put>}
			{showSpoonShelf && <Put x={SP_X} y={SHELF_Y}><Spoon scale={SPS} /></Put>}
			{/* mesa: taza, frasco de café, azucarero, leche */}
			{showCupTable && <Put x={SLOT[0]} y={TABLE_Y}><Cup fill={cs.fill} level={cs.level} steam={cs.steam} /></Put>}
			<Put x={SLOT[1]} y={TABLE_Y}><CoffeeJar /></Put>
			<Put x={SLOT[2]} y={TABLE_Y}><SugarBowl /></Put>
			<Put x={SLOT[3]} y={TABLE_Y}><MilkJug /></Put>
			{/* hornilla: la tetera (cuando no la lleva el robot) */}
			{!ketHeld && <Put x={KET_X} y={STOVE_Y}><Kettle steam={f >= FLAME && f < T.vertemos} shake={kS.shake} lid={kS.lid} /></Put>}
			<Robot x={x} y={FLOOR} {...r} reachF={[h.x, h.y]} />
			{/* chorros y caídas */}
			<Pour x={1040} y0={NOZZLE_Y} y1={jugLiquidY} color={LIQ.water} w={14} on={jugNozzle} />
			<Pour x={lipX} y0={lipY} y1={STOVE_Y - 140} color={LIQ.water} w={14} on={jugPour} />
			<Pour x={spX} y0={spY} y1={cupSurface(cs.level)} color={LIQ.water} w={16} on={ketPour} />
			{drop(T.una36, COFFEE_DUST)}
			{drop(T.dos36b, COFFEE_DUST)}
			{drop(T.una42a, LIQ.sugar)}
			{drop(T.dos42a, LIQ.sugar)}
			<Counter x={1250} y={520} value="1" at={T.una36} out={T.una36 + 24} size={120} />
			<Counter x={1250} y={520} value="2" at={T.dos36b} out={T.dos36b + 24} size={120} />
			<Counter x={1250} y={520} value="1" at={T.una42a} out={T.una42a + 22} size={120} />
			<Counter x={1250} y={520} value="2" at={T.dos42a} out={T.dos42a + 22} size={120} />
			<Counter x={1250} y={520} value="3?" at={T.dos42a + 22} out={T.dos42b - 2} size={110} color={C.amber} />
			{/* nubes de aparición */}
			<Puff at={T.calentamos + 8} x={JUG_AT[0]} y={JUG_AT[1]} seed={5} />
			<Puff at={T.tetera + 16} x={JUG_KET[0]} y={JUG_KET[1]} seed={9} />
			{f >= T.taza35 && f < T.taza35 + 26 && <PixelBurst f={f} at={T.taza35} x={SLOT[0]} y={TABLE_Y - 8} count={14} power={10} colors={['#FFFFFF', C.green, '#B9C3BE']} seed={4} grid={8} life={20} />}
			<Vee x={VEE_XS} acts={VEE_ACTS} hops={[T.paso + 14, T.taza38 - 2, T.e38 + 4, T.dos42a, T.dos42b + 16]} />
			{/* ficha del dato que leyó el robot (junto a él) */}
			<Tag x={650} y={655} at={T.dos41 + 14} out={T.e42} color={C.green} size={44} rot={-3}>azúcar: 2</Tag>
		</Cam>
	);
};

/* ------------------------------------------------------------------ escena */

export const B5a: React.FC = () => {
	const f = useCurrentFrame();
	const [ketX, ketY] = proj(f, [KET_X, STOVE_Y - 66]);
	const [lidX, lidY] = proj(f, [KET_X - 6, STOVE_Y - 140]);
	const [cupX, cupY] = proj(f, [SLOT[0], TABLE_Y - 110]);
	return (
		<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
			<Cocina />
			<Tarjeta />
			<Flechas />
			<Termometro />
			<Pregunta />
			{/* claqueta del segundo intento */}
			<Slam at={T.v34} out={T.esta34 + 8} x={960} y={430}>
				<Clap at={T.v34} text="INTENTO 2" />
			</Slam>
			{/* paso uno */}
			<Slam at={T.paso} out={T.tomar + 14} x={1230} y={150}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, color: C.white, letterSpacing: '-0.03em', whiteSpace: 'nowrap', textShadow: '0 6px 0 rgba(0,0,0,0.5)'}}>
					PASO <span style={{color: C.green}}>1</span>
				</div>
			</Slam>
			{f >= T.hay && f < T.servir + 22 && <div style={{position: 'absolute', left: cupX - 30, top: cupY - 150 + Math.abs(Math.sin((f - T.hay) / 4)) * -26, fontFamily: MONO, fontWeight: 800, fontSize: 90, color: C.green, textShadow: `0 0 20px ${C.green}`}}>↓</div>}
			<Tag x={cupX + 130} y={cupY - 70} at={T.ahora} out={T.ahora + 40} color={C.green} size={46} rot={-4}>TAZA ✓</Tag>
			<Tag x={1500} y={460} at={T.salpicar} out={T.favor38 + 10} color={C.green} size={44} rot={3}>SALPICADURAS: 0</Tag>
			<Tag x={1130} y={170} at={T.nuevo} out={T.pregunta} color={C.amber} size={80} rot={-4}>¡NUEVO!</Tag>
			<Tag x={cupX + 40} y={cupY - 80} at={T.e42 + 4} out={T.e42 + 38} color={C.green} size={46} rot={-3}>AZÚCAR ✓</Tag>
			{/* globos del robot */}
			<Say at={T.dos42b} out={T.ni1 + 10} text="2 = 2 ✓" dx={90} />
			<CornerTag text="CAMINO A: SÍ" at={T.si40 + 4} />
			{/* golpes y efectos */}
			<SpeedLines at={T.mucho + 4} len={9} mode="h" color="rgba(255,255,255,0.6)" count={12} />
			<Hit at={T.taza35} x={proj(T.taza35, [SLOT[0], TABLE_Y - 40])[0]} y={proj(T.taza35, [SLOT[0], TABLE_Y - 40])[1]} />
			<SpeedLines at={WH.pop} len={12} x={lidX} y={lidY} />
			<Hit at={WH.pop} x={lidX} y={lidY} big />
			<Shockwave at={FLAME} x={ketX} y={ketY + 40} size={500} color={C.blue} thick={12} dur={18} />
			<Hit at={T.pregunta} x={proj(T.pregunta, [rx(T.pregunta) + 20, 740])[0]} y={proj(T.pregunta, [rx(T.pregunta) + 20, 740])[1]} />
			<Hit at={T.si40} x={PANEL.x + 185} y={PANEL.y + 54 + 170 + 65} big />
			<Hit at={T.dos41} x={PANEL.x + 40 + 220 + 36 + 110} y={PANEL.y + 54 + 170 + 65} />
			<SpeedLines at={T.dos42b} len={9} x={proj(T.dos42b, [1110, 470])[0]} y={proj(T.dos42b, [1110, 470])[1]} />
			<Shockwave at={T.dos42b} x={proj(T.dos42b, [1110, 470])[0]} y={proj(T.dos42b, [1110, 470])[1]} size={800} color={C.green} thick={14} dur={20} />
			<Hit at={T.e42} x={proj(T.e42, [SLOT[0], TABLE_Y - 80])[0]} y={proj(T.e42, [SLOT[0], TABLE_Y - 80])[1]} />
			{/* transiciones */}
			<GlitchBurst at={T.mucho} len={7} />
			<CutFlash at={T.mucho} len={4} max={0.7} />
			<CutFlash at={T.v35} len={5} max={0.8} />
			<WipeBar at={T.v35 - 6} dur={12} />
			<Iris at={WH.cut} x={ketX} y={ketY} dur={18} />
			<WipeBar at={T.v38 - 6} dur={12} />
			<CutFlash at={T.v38} len={3} max={0.5} />
			<CutFlash at={T.e40 + 4} len={3} max={0.4} />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ sonido */

export const sfxB5a: Sfx[] = [
	// V34 · claqueta y barrido de la tarjeta
	s(T.v34, 'clap', 0.45),
	s(T.v34 + 3, 'hit', 0.25),
	s(T.esta34 + 6, 'whoosh', 0.2),
	s(T.mucho, 'glitch', 0.25),
	s(T.mucho + 4, 'whoosh', 0.3),
	s(T.mucho + 10, 'ticks', 0.3),
	s(T.precisos, 'blip', 0.3),
	// V35 · paso uno: la taza
	s(T.v35, 'flash', 0.2),
	s(T.paso, 'hit', 0.35),
	s(T.uno, 'key', 0.25),
	s(T.uno + 2, 'servo', 0.35),
	s(T.tomar + 3, 'stack', 0.25),
	s(T.tomar + 8, 'servo', 0.25),
	s(T.taza35, 'land', 0.4),
	s(T.taza35 + 3, 'check', 0.35),
	s(T.ahora, 'sparkle', 0.25),
	s(T.hay, 'blip', 0.22),
	s(T.servir, 'pop', 0.25),
	// V36 · dos cucharadas de café
	s(T.v36, 'key', 0.25),
	s(T.v36 - 2, 'servo', 0.3),
	s(T.v36 + 11, 'stack', 0.22),
	s(T.cafe, 'land', 0.25),
	s(T.cafe + 8, 'servo', 0.22),
	s(T.una36, 'plop', 0.3),
	s(T.una36 + 1, 'pop', 0.3),
	s(T.una36 + 15, 'servo', 0.25),
	s(T.una36 + 20, 'land', 0.22),
	s(T.dos36b, 'plop', 0.3),
	s(T.dos36b + 1, 'pop', 0.3),
	s(T.dos36b + 10, 'servo', 0.25),
	s(T.dos36b + 22, 'check', 0.35),
	// V37 · agua: grifo, jarra, tetera, silbido
	s(T.v37, 'key', 0.25),
	s(T.v37 - 2, 'slide', 0.25),
	s(T.calentamos + 8, 'pop', 0.25),
	s(T.calentamos + 10, 'pour', 0.35),
	s(T.d200, 'blip', 0.3),
	s(T.mili, 'check', 0.3),
	s(T.mili + 3, 'servo', 0.3),
	s(T.agua + 8, 'pour', 0.38),
	s(T.tetera + 6, 'splash', 0.2),
	s(FLAME, 'sparkle', 0.25),
	s(FLAME + 1, 'blip', 0.25),
	s(WH.cut - 8, 'whoosh', 0.3),
	s(WH.heat, 'rise', 0.3),
	s(WH.pop - 5, 'whistle', 0.4),
	s(WH.pop, 'hit', 0.4),
	// V38 · verter en la taza
	s(T.v38, 'whoosh', 0.25),
	s(T.v38 + 1, 'servo', 0.35),
	s(T.vertemos + 3, 'stack', 0.25),
	s(T.vertemos + 10, 'servo', 0.3),
	s(POUR0, 'pour', 0.4),
	s(POUR0 + 30, 'pour', 0.3),
	s(T.salpicar, 'pop', 0.25),
	s(T.favor38 + 2, 'servo', 0.3),
	s(T.e38 - 2, 'check', 0.35),
	// V39 · la pregunta
	s(T.v39, 'key', 0.25),
	s(T.viene, 'blip', 0.22),
	s(T.nuevo, 'pop', 0.3),
	s(T.nuevo + 1, 'hit', 0.2),
	s(T.robot39, 'blip', 0.25),
	s(T.pregunta, 'whoosh', 0.3),
	s(T.pregunta + 2, 'hit', 0.3),
	s(T.pregunta + 8, 'blip', 0.25),
	// V40 · SI … FIN SI
	s(T.cambiar, 'key', 0.25),
	s(T.cambiar + 1, 'draw', 0.3),
	s(T.cambiar + 9, 'draw', 0.3),
	s(T.primero, 'pop', 0.25),
	s(T.si40, 'hit', 0.4),
	s(T.si40 + 1, 'ac', 0.3),
	s(T.si40 + 5, 'slide', 0.25),
	s(T.e40 + 4, 'slide', 0.3),
	s(T.e40 + 6, 'key', 0.25),
	// V41 · «dos»
	s(T.dos41, 'key', 0.35),
	s(T.dos41 + 2, 'ac', 0.3),
	s(T.dos41 + 10, 'pop', 0.3),
	s(T.dos41 + 16, 'whoosh', 0.25),
	s(T.dos41 + 18, 'servo', 0.3),
	s(T.favor41, 'key', 0.25),
	// V42 · las cucharadas de azúcar
	s(T.dos41 + 21, 'stack', 0.22),
	s(T.una42a, 'plop', 0.3),
	s(T.una42a + 1, 'pop', 0.3),
	s(T.una42a + 7, 'servo', 0.22),
	s(T.una42a + 16, 'land', 0.2),
	s(T.dos42a, 'plop', 0.3),
	s(T.dos42a + 1, 'pop', 0.3),
	s(T.dos42a + 7, 'servo', 0.22),
	s(T.dos42a + 16, 'land', 0.2),
	s(T.exact + 6, 'servo', 0.22),
	s(T.dos42b, 'hit', 0.4),
	s(T.dos42b + 2, 'check', 0.35),
	s(T.ni1, 'sparkle', 0.25),
	s(T.una42b - 2, 'servo', 0.3),
	s(T.una42b + 3, 'land', 0.25),
	s(T.menos, 'ac', 0.3),
	s(T.e42, 'check', 0.4),
	s(T.e42 + 1, 'key', 0.25),
	s(T.e42 + 3, 'sparkle', 0.25),
];
