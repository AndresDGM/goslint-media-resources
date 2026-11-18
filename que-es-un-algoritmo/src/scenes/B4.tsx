import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inCubic, inOutCubic, outCubic, pop, tween, windowed} from '@commons/lib';
import {CutFlash, GlitchBurst, Shockwave, WipeBar, shake} from '@commons/components';
import {Hit, In} from '@commons/vertical';
import {Buf, PixelBurst, PixelSprite} from '@commons/pixel';
import {Barrido, Slam, SpeedLines} from '@commons/transiciones';
import {after, at, BLOCKS, end} from '../timeline';
import {s, Sfx} from '../sfx';
import {
	Board, Cam, Clap, CoffeeBag, ConceptCard, Cup, Falling, FLOOR, InstrCard, Kitchen, LIQ, lerpPt, Line, MilkJug, Mop, Pour, Puddle, Put, Question,
	Robot, RobotFace, RobotPose, robotRest, RobotSays, SHELF_X0, SHELF_Y, Shot, SLOT, Splash, Spoon, Stamp, TABLE_Y, Tag, Vee, VeeAct,
} from '../kit';

/* ================================================================== Bloque 4 · «Intento 1» (V23–V33) */

/** Marcas de la voz que usa el bloque (fotogramas absolutos). */
const T = {
	b0: BLOCKS.b4[0],
	b1: BLOCKS.b4[1],
	// V23
	primer: at('V23', 'primer'),
	esta: at('V23', 'esta'),
	robot23: at('V23', 'robot'),
	algo: at('V23', 'algoritmo'),
	// V24
	inicio: at('V24', 'inicio'),
	cuatro: at('V24', 'cuatro'),
	fin: at('V24', 'fin'),
	se: at('V24', 'se'),
	razonable: at('V24', 'razonable'),
	no24: at('V24', 'no'),
	veamos: at('V24', 'veamos'),
	e24: end('V24'),
	// V25–V27
	dos: at('V25', 'dos'),
	e25: end('V25'),
	cien: at('V26', 'cien'),
	e26: end('V26'),
	muy: at('V27', 'muy'),
	perfecto: at('V27', 'perfecto'),
	e27: end('V27'),
	// V28: el gag
	espera: at('V28', 'espera'),
	que28: at('V28', 'que'),
	no1: at('V28', 'no', 1),
	no2: at('V28', 'no', 2),
	no3: at('V28', 'no', 3),
	piso: at('V28', 'piso'),
	e28: end('V28'),
	// V29
	v29: at('V29'),
	gracias: at('V29', 'gracias'),
	muy29: at('V29', 'muy'),
	ilus: at('V29', 'ilustrativo'),
	// V30
	v30: at('V30'),
	ojo: at('V30', 'ojo'),
	eso: at('V30', 'eso'),
	algo30: at('V30', 'algoritmo'),
	tiene: at('V30', 'tiene'),
	pasos30: at('V30', 'pasos'),
	orden: at('V30', 'orden'),
	termina: at('V30', 'termina'),
	// V31
	v31: at('V31'),
	pasos31: at('V31', 'pasos'),
	generales: at('V31', 'generales'),
	mezclar: at('V31', 'mezclar'),
	ingred: at('V31', 'ingredientes'),
	donde: at('V31', 'donde'),
	recip: at('V31', 'recipiente'),
	con: at('V31', 'con'),
	y31: at('V31', 'y'),
	faltaba: at('V31', 'faltaba'),
	agua: at('V31', 'agua'),
	// V32
	v32: at('V32'),
	persona: at('V32', 'persona'),
	basta: at('V32', 'basta'),
	instr: at('V32', 'instruccion'),
	sabe: at('V32', 'sabe'),
	cafe32: at('V32', 'cafe'),
	taza: at('V32', 'taza'),
	pero: at('V32', 'pero'),
	robot32: at('V32', 'robot'),
	no32: at('V32', 'no'),
	das: at('V32', 'das'),
	// V33
	v33: at('V33'),
	algo33: at('V33', 'algoritmo'),
	mas: at('V33', 'mas'),
	menos: at('V33', 'menos'),
	clave: at('V33', 'clave'),
	alcance: at('V33', 'alcance'),
	ejecutar: at('V33', 'ejecutar'),
	e33: end('V33'),
};

/* ------------------------------------------------------------------ tiempos derivados (pausas sin voz) */

/** Pausa tras V27: el robot toma la bolsa y la jarra y busca dónde mezclar. */
const G1 = {
	turn: T.e27, // vuelve a mirar a la mesa; el cursor pasa a «Mezclar»
	reach: T.e27 + 6, // estira los dos brazos
	grab: T.e27 + 17, // los toma
	lift: T.e27 + 25, // los sube
	ask: T.e27 + 20, // «MEZCLAR… ¿DÓNDE?»
	lookL: T.e27 + 30,
	lookR: T.e27 + 38,
	lookD: T.e27 + 46,
	ok: T.e27 + 54, // «PISO: DISPONIBLE ✓»
};
/** El vertido (durante V28). */
const P = {
	move: T.espera, // las manos van sobre el piso
	tip: T.espera + 8, // inclina bolsa y jarra
	flow: T.espera + 16, // empieza a caer
	stop: T.no3 + 8, // deja de caer
	back: T.no3 + 18, // endereza los recipientes
};
/** Pausa tras V28 (4,2 s): revuelve con el pie, gota a Vee, presenta el resultado. */
const G2 = {
	stir: T.e28 + 2,
	stirEnd: T.e28 + 46,
	drop: T.e28 + 42, // la gota sale del charco
	cheek: T.e28 + 56, // llega a la mejilla de Vee
	show: T.e28 + 78, // cursor a «Mostrar resultado» y el robot presenta
	ok: T.e28 + 84,
	confetti: T.e28 + 88,
};
/** El trapeador: después de V33. */
const MOP0 = T.e33 - 8;
const MOP1 = T.b1 - 4;

/* ------------------------------------------------------------------ posiciones (lienzo 1920×1080) */

const RX = 880; // robot
const BAG_X = SLOT[0];
const JUG_X = SLOT[1];
const CUP_SHELF_X = SHELF_X0 + 300;
/** Centros de la bolsa y la jarra apoyadas en la mesa (la mano del robot las toma por el centro). */
const BAG_PT: [number, number] = [BAG_X, TABLE_Y - 72];
const JUG_PT: [number, number] = [JUG_X, TABLE_Y - 66];
/** Manos con las cosas levantadas y sobre el piso al verter. */
const HOLD_F: [number, number] = [1045, 700];
const HOLD_B: [number, number] = [715, 700];
const POUR_F: [number, number] = [1030, 690];
const POUR_B: [number, number] = [745, 690];
const TIP_BAG = 150;
const TIP_JUG = 128;
const PUDDLE_X = 905;
/** Polvo de café algo más claro que LIQ.coffee: el oscuro no se distingue sobre la pared. */
const COFFEE_DUST = '#8A5434';

/** Gira un punto (dx, dy) alrededor del origen θ grados en sentido horario (ejes de pantalla). */
const rot = (dx: number, dy: number, deg: number): [number, number] => {
	const r = (deg * Math.PI) / 180;
	return [dx * Math.cos(r) - dy * Math.sin(r), dx * Math.sin(r) + dy * Math.cos(r)];
};
/** Boca de la bolsa (10×13 a escala 11, gira sobre el 20 % de su alto) sostenida por el centro en `hand`. */
const bagMouth = (hand: [number, number], tip: number): [number, number] => {
	const [dx, dy] = rot(0, -28.6, tip);
	return [hand[0] + dx, hand[1] - 42.9 + dy];
};
/** Pico de la jarra (10×12 a escala 11, gira sobre el 30 % de su alto). */
const jugMouth = (hand: [number, number], tip: number): [number, number] => {
	const [dx, dy] = rot(-5.5, -39.6, tip);
	return [hand[0] + dx, hand[1] - 26.4 + dy];
};

/* ------------------------------------------------------------------ cámara */

const G: [number, number, number] = [1, 960, 540]; // plano general
const M1: [number, number, number] = [1.25, 1000, 560]; // Vee + robot + mesa (la tarjeta no tapa a nadie)
const M2: [number, number, number] = [1.15, 880, 560];
const sh = (f: number, v: [number, number, number], mov?: number): Shot => (mov ? [f, v[0], v[1], v[2], mov] : [f, v[0], v[1], v[2]]);
const SHOTS: Shot[] = [
	sh(T.b0, [1.08, 900, 600]),
	sh(T.primer, G),
	sh(T.esta, M2),
	sh(T.inicio, M1),
	sh(T.fin, G),
	sh(T.se, M2),
	sh(T.veamos, M1),
	sh(T.dos, M2),
	sh(T.e25, G),
	sh(T.cien, M2),
	sh(T.e26, M1),
	sh(T.muy, G),
	sh(T.perfecto, M2),
	sh(T.e27, M1),
	sh(G1.reach + 4, [1.7, 1060, 650]), // primer plano del robot con las cosas (sin tarjeta)
	sh(T.espera, [1.2, 760, 640]), // los dos: el vertido
	sh(T.no1, [1.9, 600, 650]), // golpe a Vee (el robot, entero, sigue vertiendo a su lado)
	sh(T.piso, [1.9, 840, 860]), // el charco (Vee entra entera por la izquierda)
	sh(T.e28, [1.5, 860, 760]), // revuelve con el pie
	sh(G2.drop + 2, [2.6, 420, 650]), // primer plano de Vee: la gota
	sh(G2.show, G), // el robot presenta el resultado
	sh(T.v29, [2.4, 400, 650]), // Vee, seria
	sh(T.gracias + 4, [2.75, 420, 640], 30), // se acerca despacio mientras da las gracias
	sh(T.muy29, [2.0, 1110, 640]), // el robot, feliz
	sh(T.v30, G),
];
const SHAKES = [T.primer + 2, T.no1, T.no2, T.no3, T.piso, T.algo30];

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
	[T.primer + 2, 'celebrar', 2.4],
	[T.esta + 4, 'explicar', 2.6],
	[T.algo, 'senalar', 2.2],
	[T.inicio, 'senalar', 2.4],
	[T.razonable, 'pensar', 2.4],
	[T.veamos, 'senalar', 2.2],
	[T.dos, 'explicar', 3],
	[T.cien, 'explicar', 3],
	[T.muy, 'celebrar', 2],
	[T.espera, 'sorpresa', 2],
	[T.no1, 'sorpresa', 2.2],
	[G2.cheek, 'sorpresa', 2.6],
];
/** Vee en la cocina (V23–V29): se acerca al robot para darle la tarjeta y se inclina al ver el vertido. */
const VEE_X: [number, number][] = [
	[T.b0, 330],
	[T.esta, 330],
	[T.esta + 30, 420],
	[T.espera, 420],
	[T.espera + 16, 480],
];
/** Mejilla de Vee (en la escena) cuando está en x = 480. */
const CHEEK: [number, number] = [530, 652];

/** Vee en las escenas de explicación (V30–V31), un paso al frente. */
const VEE2_ACTS: [number, VeeAct, number?][] = [
	[T.ojo, 'senalar', 2.2],
	[T.algo30, 'celebrar', 2.4],
	[T.pasos30, 'senalar', 3],
	[T.termina, 'explicar', 3],
	[T.generales, 'explicar', 2.6],
	[T.donde, 'pensar', 2.4],
	[T.con, 'pensar', 2.6],
	[T.agua, 'sorpresa', 2.2],
];
const VEE3_ACTS: [number, VeeAct, number?][] = [
	[T.algo33, 'explicar', 2.8],
	[T.clave, 'senalar', 2.2],
	[T.ejecutar, 'celebrar', 2.2],
];

/* ------------------------------------------------------------------ robot */

type RobotState = {
	pose: RobotPose; face: RobotFace; flip?: boolean; look?: [number, number]; chest?: string; chestColor?: string;
	reachF?: [number, number] | null; reachB?: [number, number] | null; holdF?: React.ReactNode; holdB?: React.ReactNode; hops?: number[]; time?: number;
};
const restF = robotRest(RX, FLOOR, 'F');
const restB = robotRest(RX, FLOOR, 'B');

/** Inclinación de la bolsa y la jarra en cada momento del vertido. */
const tips = (f: number) => {
	const up = tween(f, P.tip, P.tip + 9, 0, 1, outCubic);
	const down = tween(f, P.stop, P.back, 0, 1, inOutCubic);
	return {bag: TIP_BAG * up * (1 - down), jug: TIP_JUG * up * (1 - down)};
};
/** Posición de las manos con las cosas (de la mesa al piso y de vuelta). */
const hands = (f: number): {F: [number, number]; B: [number, number]} => {
	if (f < G1.lift) {
		const k = tween(f, G1.grab, G1.lift, 0, 1, inOutCubic);
		return {F: lerpPt(BAG_PT, HOLD_F, k), B: lerpPt(JUG_PT, HOLD_B, k)};
	}
	const k = tween(f, P.move, P.move + 10, 0, 1, inOutCubic) * (1 - tween(f, P.back, P.back + 10, 0, 1, inOutCubic));
	return {F: lerpPt(HOLD_F, POUR_F, k), B: lerpPt(HOLD_B, POUR_B, k)};
};

const robotAt = (f: number): RobotState => {
	const hops = [T.e24 + 1, T.dos + 22, T.cien + 22, T.muy + 3, T.e27 + 1, G1.ok, G2.show + 2, T.muy29 + 3, T.ilus + 4];
	if (f >= T.v30) return {pose: 'present', face: 'happy', chest: '^_^', holdF: <CoffeeBag />, holdB: <MilkJug />, time: T.v30};
	if (f >= G2.show) return {pose: 'present', face: f >= T.v29 ? 'happy' : 'proud', chest: f >= T.v29 ? '^_^' : '✓', holdF: <CoffeeBag />, holdB: <MilkJug />, hops};
	if (f >= G2.stirEnd) return {pose: 'hold', face: 'happy', chest: '✓', look: [-1, 0], holdF: <CoffeeBag />, holdB: <MilkJug />, hops};
	if (f >= G2.stir) return {pose: 'footstir', face: 'focus', chest: '~', look: [0, 1], holdF: <CoffeeBag />, holdB: <MilkJug />, hops};
	if (f >= G1.grab) {
		const h = hands(f);
		const tp = tips(f);
		let look: [number, number] = [0, 0];
		if (f >= G1.lookL) look = [-1, 0];
		if (f >= G1.lookR) look = [1, 0];
		if (f >= G1.lookD) look = [0, 1];
		const asking = f >= G1.ask && f < G1.ok;
		return {
			pose: 'hold', face: asking ? 'conf' : f >= P.move ? 'happy' : 'focus', chest: asking ? '?' : '✓', look,
			reachF: h.F, reachB: h.B, holdF: <CoffeeBag tip={tp.bag} />, holdB: <MilkJug tip={tp.jug} />, hops,
		};
	}
	if (f >= G1.reach) {
		const k = tween(f, G1.reach, G1.grab, 0, 1, inOutCubic);
		return {pose: 'reach', face: 'focus', chest: '▶', look: [1, 0], reachF: lerpPt(restF, BAG_PT, k), reachB: lerpPt(restB, JUG_PT, k), hops};
	}
	if (f >= T.e27) return {pose: 'idle', face: 'focus', chest: '▶', look: [1, 0], hops};
	if (f >= T.muy) return {pose: 'thumb', face: 'proud', flip: true, chest: '✓', hops};
	if (f >= T.e26 + 3) return {pose: 'idle', face: 'happy', flip: true, chest: '✓', hops};
	if (f >= T.cien + 22) return {pose: 'idle', face: 'wow', flip: true, chest: '100', hops};
	if (f >= T.e25 + 22) return {pose: 'idle', face: 'conf', flip: true, chest: '?', hops};
	if (f >= T.e25 + 3) return {pose: 'idle', face: 'happy', flip: true, chest: '✓', hops};
	if (f >= T.dos + 22) return {pose: 'idle', face: 'wow', flip: true, chest: '2', hops};
	if (f >= T.e24) return {pose: 'idle', face: 'conf', flip: true, chest: '?', hops};
	if (f >= T.veamos) return {pose: 'idle', face: 'focus', chest: '▶', look: [-1, -1], hops};
	if (f >= T.algo + 10) return {pose: 'idle', face: 'focus', look: [-1, -1], hops};
	if (f >= T.robot23) return {pose: 'wave', face: 'happy', look: [-1, 0], hops}; // «al robot»: saluda
	return {pose: 'idle', face: 'happy', look: [-1, 0], hops};
};

/* ------------------------------------------------------------------ tarjeta del algoritmo */

const LINES: Line[] = [
	{text: 'INICIO'},
	{text: 'Leer cantidad de café', indent: 1},
	{text: 'Leer cantidad de leche', indent: 1},
	{text: 'Mezclar los ingredientes', indent: 1},
	{text: 'Mostrar resultado', indent: 1},
	{text: 'FIN'},
];
const CARD_W = 740;
const CARD_SIZE = 36;
const FS = Math.min(CARD_SIZE, Math.floor((CARD_W - 56 - CARD_SIZE * 1.1) / (0.602 * 26)));
const LH = Math.round(FS * 1.5);
/** Alto de la cabecera de la tarjeta más el margen superior (hasta la primera línea). */
const HEAD = 62;
const CARD_H = HEAD + LINES.length * LH + 17;
const lineTop = (i: number) => HEAD + i * LH;
/** V30: la tarjeta pasa al centro-derecha y crece (deja sitio a Vee y a las tres mini tarjetas). */
const CARD2_X = 590;
const CARD2_Y = 150;
const CARD2_S = 1.3;

/** Tramos en que la tarjeta se esconde (primeros planos de la cocina). */
const HIDE: [number, number][] = [
	[G1.reach + 4, G2.show],
	[T.v29, T.v30],
];

/** Posición, escala y opacidad de la tarjeta en cada momento. */
const cardAt = (f: number) => {
	// entra volando desde la mano de Vee
	const kin = tween(f, T.algo, T.algo + 14, 0, 1, outCubic);
	let x = 520 + (50 - 520) * kin;
	let y = 700 + (90 - 700) * kin;
	let sc = 0.25 + 0.75 * kin;
	let o = 1;
	for (const [a, b] of HIDE) {
		const out = tween(f, a - 7, a, 0, 1, inCubic) * (1 - tween(f, b, b + 9, 0, 1, outCubic));
		if (f >= a - 7 && f < b + 9) x -= out * 820;
	}
	// V30: pasa al centro-derecha y crece
	const k30 = tween(f, T.ojo, T.ojo + 14, 0, 1, inOutCubic);
	x += (CARD2_X - x) * k30;
	y += (CARD2_Y - y) * k30;
	sc += (CARD2_S - sc) * k30;
	// V31: se atenúa y se va cuando la línea «Mezclar» se desprende
	if (f >= T.generales) o = 1 - 0.7 * tween(f, T.generales, T.generales + 6);
	if (f >= T.mezclar - 4) o *= 1 - tween(f, T.mezclar - 4, T.mezclar + 6);
	return {x, y, sc, o};
};

/** Insignia redonda con número (los cuatro pasos). */
const Badge: React.FC<{n: number; at: number; x: number; y: number}> = ({n, at: a, x, y}) => {
	const f = useCurrentFrame();
	if (f < a) return null;
	const p = pop(f, a, 9, 300, 0.5);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: 46, height: 46, marginLeft: -23, marginTop: -23, borderRadius: '50%', background: C.green, color: C.bg, fontFamily: MONO, fontWeight: 800, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p}) translateY(${(1 - p) * -30}px)`, boxShadow: `0 0 18px ${C.green}`}}>
			{n}
		</div>
	);
};

/** Recuadro que destaca líneas de la tarjeta (de `a` a `b`). */
const LineGlow: React.FC<{from: number; to: number; a: number; b: number; color?: string}> = ({from, to, a, b, color = C.green}) => {
	const f = useCurrentFrame();
	const o = windowed(f, a, b, 4, 8);
	if (o <= 0) return null;
	const p = pop(f, a, 10, 260, 0.6);
	return <div style={{position: 'absolute', left: 6, right: 6, top: lineTop(from) - 3, height: (to - from + 1) * LH + 6, border: `4px solid ${color}`, background: `${color}22`, boxShadow: `0 0 26px ${color}`, opacity: o, transform: `scale(${1.08 - 0.08 * p})`}} />;
};

const AlgCard: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.algo || f >= T.mezclar + 8) return null;
	const {x, y, sc, o} = cardAt(f);
	if (o <= 0.01) return null;
	const cursor: [number, number][] = [
		[T.veamos, 1],
		[T.e25 + 18, 2],
		[G1.turn, 3],
		[G2.show, 4],
		[T.eso, -1],
	];
	const shownAt = LINES.map((_, i) => T.algo + 6 + i * 6);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: CARD_W, height: CARD_H, transform: `scale(${sc})`, transformOrigin: '0 0', opacity: o}}>
			<InstrCard x={0} y={0} w={CARD_W} size={CARD_SIZE} lines={LINES} cursor={cursor} shownAt={shownAt} allDone={f >= T.eso} />
			<LineGlow from={0} to={0} a={T.inicio} b={T.cuatro} />
			{[1, 2, 3, 4].map((n) => (
				<Badge key={n} n={n} at={T.cuatro + (n - 1) * 4} x={CARD_W - 42} y={lineTop(n) + LH / 2} />
			))}
			<LineGlow from={5} to={5} a={T.fin} b={T.fin + 24} />
			<LineGlow from={1} to={4} a={T.pasos31} b={T.generales + 4} color={C.amber} />
		</div>
	);
};

/** La línea «Mezclar los ingredientes» se desprende de la tarjeta y queda enorme en el centro. */
const BigLine: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.generales || f >= T.v32) return null;
	const c = cardAt(T.generales);
	const x0 = c.x + (14 + FS * 1.1 + FS * 1.2) * c.sc;
	const y0 = c.y + (lineTop(3) + LH / 2) * c.sc;
	const k = tween(f, T.generales + 2, T.mezclar, 0, 1, inOutCubic);
	const size = FS * c.sc + (80 - FS * c.sc) * k;
	const w = 0.602 * 24 * size;
	const x = x0 + (960 - w / 2 - x0) * k;
	const y = y0 + (300 - y0) * k;
	const [sx, sy] = shake(f, T.mezclar, 14, 9);
	const glow = Math.max(0, 1 - (f - T.mezclar) / 12);
	return (
		<>
			<div style={{position: 'absolute', left: x + sx, top: y + sy, transform: 'translateY(-50%)', fontFamily: MONO, fontWeight: 800, fontSize: size, color: C.white, whiteSpace: 'nowrap', textShadow: `0 0 ${10 + 30 * glow}px ${C.green}, 0 6px 0 rgba(0,0,0,0.6)`}}>
				Mezclar los ingredientes
			</div>
			{f >= T.mezclar && <div style={{position: 'absolute', left: 960 - (0.602 * 24 * 80) / 2, top: 352, width: 0.602 * 24 * 80 * tween(f, T.mezclar, T.mezclar + 10), height: 8, background: C.green}} />}
		</>
	);
};

/* ------------------------------------------------------------------ piezas locales */

/** Ficha con un dato que vuela de Vee al pecho del robot (en coordenadas de la escena). */
const Ficha: React.FC<{text: string; at: number; from: [number, number]; to: [number, number]}> = ({text, at: a, from, to}) => {
	const f = useCurrentFrame();
	const dur = 18;
	if (f < a || f > a + dur + 4) return null;
	const k = tween(f, a, a + dur, 0, 1, inOutCubic);
	const x = from[0] + (to[0] - from[0]) * k;
	const y = from[1] + (to[1] - from[1]) * k - Math.sin(k * Math.PI) * 160;
	const sc = (0.6 + 0.6 * Math.sin(k * Math.PI)) * (1 - tween(f, a + dur - 4, a + dur + 4) * 0.8);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${sc}) rotate(${(1 - k) * -12}deg)`, fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.bg, background: C.green, padding: '8px 22px', whiteSpace: 'nowrap', boxShadow: `0 0 26px ${C.green}, 0 8px 0 rgba(0,0,0,0.4)`}}>
			{text}
		</div>
	);
};

/** Fila de la memoria del robot. */
const MemRow: React.FC<{k: string; v: string; at: number}> = ({k, v, at: a}) => {
	const f = useCurrentFrame();
	const on = f >= a;
	const p = on ? pop(f, a, 10, 280, 0.5) : 0;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '10px 18px', margin: '10px 14px', border: `3px solid ${on ? C.green : C.line2}`, background: on ? C.greenSoft : 'transparent', fontFamily: MONO, fontWeight: 800, fontSize: 40, color: on ? C.white : C.faint, whiteSpace: 'nowrap', transform: `scale(${on ? 0.9 + 0.1 * p : 1})`}}>
			<span style={{color: on ? C.green : C.faint}}>{k}:</span>
			<span>{on ? v : '—'}</span>
			{on && <span style={{marginLeft: 'auto', color: C.green, transform: `scale(${p})`, display: 'inline-block'}}>✓</span>}
		</div>
	);
};

/** Panel MEMORIA del robot (arriba a la derecha, bajo el HUD). */
const Memoria: React.FC = () => (
	<In at={T.e25} out={G1.turn + 6} x={1330} y={92} w={530} from="right" exit="right">
		<div style={{background: 'rgba(10,14,12,0.96)', border: `4px solid ${C.green}`, boxShadow: `0 0 34px ${C.green}44`}}>
			<div style={{fontFamily: MONO, fontSize: 26, fontWeight: 800, color: C.green, padding: '8px 18px', borderBottom: `2px solid ${C.line2}`, letterSpacing: '0.12em'}}>▣ MEMORIA</div>
			<MemRow k="café" v="2 cdas" at={T.e25 + 4} />
			<MemRow k="leche" v="100 ml" at={T.e26 + 4} />
		</div>
	</In>
);

/** Globo del robot en coordenadas de pantalla, sobre su cabeza (sigue los cortes de cámara). */
const Say: React.FC<{at: number; out: number; text: string; color?: string; size?: number; dx?: number; minX?: number}> = ({at: a, out, text, color = C.green, size = 46, dx = 0, minX = 0}) => {
	const f = useCurrentFrame();
	if (f < a || f >= out) return null;
	const [hx, hy] = proj(f, [RX, 478]);
	const w = text.length * 0.602 * size + 56;
	const x = Math.max(hx + dx, minX + w / 2, 40 + w / 2);
	return <RobotSays x={Math.min(x, 1880 - w / 2)} y={Math.max(hy, 210)} at={a} out={out} color={color} size={size}>{text}</RobotSays>;
};

/** Gota de café que salta del charco a la mejilla de Vee (y se queda ahí). */
const Gota: React.FC = () => {
	const f = useCurrentFrame();
	if (f < G2.drop || f >= T.v30) return null;
	const k = tween(f, G2.drop, G2.cheek, 0, 1, (t) => t);
	const x = PUDDLE_X - 40 + (CHEEK[0] - PUDDLE_X + 40) * k;
	const y = FLOOR - 10 + (CHEEK[1] - FLOOR + 10) * k - Math.sin(k * Math.PI) * 260;
	const landed = f >= G2.cheek;
	const sq = landed ? 1 + 0.4 * Math.max(0, 1 - (f - G2.cheek) / 6) : 1;
	return (
		<div style={{position: 'absolute', left: x - 7, top: y - 9, width: 14, height: 18, background: LIQ.latte, borderRadius: '45% 45% 50% 50%', transform: `scaleX(${sq}) scaleY(${2 - sq})`, boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3)'}} />
	);
};

/** Persona en pixel art (para la pantalla partida de V32). 16×35 px lógicos. */
const PERSONA = (() => {
	const b = new Buf(16, 35);
	const skin = '#E8B58A';
	const hair = '#3B2A20';
	const shirt = '#3E73D8';
	const pants = '#2E3A4A';
	b.rect(4, 0, 8, 3, hair);
	b.rect(3, 1, 1, 5, hair);
	b.rect(12, 1, 1, 5, hair);
	b.rect(4, 3, 8, 7, skin);
	b.rect(4, 3, 8, 1, hair);
	b.set(6, 6, '#1A1A1A');
	b.set(9, 6, '#1A1A1A');
	b.rect(7, 8, 2, 1, '#A8574A');
	b.rect(7, 10, 2, 1, skin);
	b.rect(3, 11, 10, 11, shirt);
	b.rect(11, 11, 2, 11, '#2B4F96');
	b.rect(1, 12, 2, 9, shirt);
	b.rect(13, 12, 2, 9, shirt);
	b.rect(1, 21, 2, 2, skin);
	b.rect(13, 21, 2, 2, skin);
	b.rect(4, 22, 8, 4, pants);
	b.rect(4, 26, 3, 7, pants);
	b.rect(9, 26, 3, 7, pants);
	b.rect(3, 33, 4, 2, '#1A1A1A');
	b.rect(9, 33, 4, 2, '#1A1A1A');
	return b;
})();
/** Cabeza del robot (icono del deslizador). */
const ROBOT_HEAD = (() => {
	const b = new Buf(16, 15);
	b.rect(7, 0, 2, 3, '#8E9A94');
	b.rect(6, 0, 4, 1, C.green);
	b.rect(0, 3, 16, 12, '#C9D3CE');
	b.rect(14, 3, 2, 12, '#8E9A94');
	b.rect(2, 5, 12, 8, '#0B0F0D');
	b.rect(4, 7, 2, 2, C.green);
	b.rect(10, 7, 2, 2, C.green);
	b.rect(6, 11, 4, 1, C.green);
	return b;
})();
/** Cabeza de persona (icono del deslizador). */
const PERSONA_HEAD = (() => {
	const b = new Buf(12, 13);
	b.rect(1, 0, 10, 4, '#3B2A20');
	b.rect(0, 2, 1, 6, '#3B2A20');
	b.rect(11, 2, 1, 6, '#3B2A20');
	b.rect(1, 3, 10, 9, '#E8B58A');
	b.rect(1, 3, 10, 1, '#3B2A20');
	b.rect(3, 7, 2, 2, '#1A1A1A');
	b.rect(7, 7, 2, 2, '#1A1A1A');
	b.rect(4, 10, 4, 1, '#A8574A');
	b.rect(3, 12, 6, 1, '#3E73D8');
	return b;
})();

/** Nube de pensamiento: (x, y) = esquina superior izquierda; la cola baja hacia `tail`. */
const Nube: React.FC<{x: number; y: number; w: number; h: number; at: number; tail: [number, number]; dim?: boolean; children?: React.ReactNode}> = ({x, y, w, h, at: a, tail, dim, children}) => {
	const f = useCurrentFrame();
	if (f < a) return null;
	const p = pop(f, a, 11, 260, 0.6);
	const bx = x + w / 2;
	const by = y + h;
	return (
		<>
			{[0.35, 0.62, 0.85].map((t, i) => {
				const r = 34 - i * 9;
				const q = pop(f, a + 2 + i * 2, 11, 260, 0.6);
				return <div key={i} style={{position: 'absolute', left: bx + (tail[0] - bx) * t - r / 2, top: by + (tail[1] - by) * t - r / 2, width: r, height: r, borderRadius: '50%', background: dim ? 'rgba(255,255,255,0.12)' : C.white, border: dim ? `3px dashed ${C.line2}` : undefined, transform: `scale(${q})`}} />;
			})}
			<div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 70, background: dim ? 'rgba(255,255,255,0.06)' : C.white, border: dim ? `5px dashed rgba(255,255,255,0.45)` : undefined, boxSizing: 'border-box', transform: `scale(${0.3 + 0.7 * p})`, transformOrigin: `50% 100%`, opacity: Math.min(1, p * 2), boxShadow: dim ? undefined : '0 14px 0 rgba(0,0,0,0.3)'}}>
				{children}
			</div>
		</>
	);
};

/** Algo que salta al aparecer (iconos dentro de las nubes y etiquetas). */
const PopIn: React.FC<{at: number; x: number; y: number; children: React.ReactNode; rot?: number}> = ({at: a, x, y, children, rot: r = 0}) => {
	const f = useCurrentFrame();
	if (f < a) return null;
	const p = pop(f, a, 9, 300, 0.5);
	return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) scale(${p}) rotate(${r * (1 - p)}deg)`, transformOrigin: '50% 100%'}}>{children}</div>;
};

/* ------------------------------------------------------------------ sub-escenas */

/** V23–V29: la cocina, el primer algoritmo y el café en el piso. */
const Cocina: React.FC = () => {
	const f = useCurrentFrame();
	const frozen = f >= T.v30;
	const ff = frozen ? T.v30 : f;
	const desat = tween(f, T.v30, T.v30 + 8);
	const r = robotAt(f);
	const grabbed = ff >= G1.grab;
	// vertido
	const h = hands(ff);
	const tp = tips(ff);
	const flowing = !frozen && f >= P.flow && f < P.stop;
	const mB = bagMouth(h.F, tp.bag);
	const mJ = jugMouth(h.B, tp.jug);
	const puddle = tween(ff, P.flow + 4, P.stop + 6, 0, 1, outCubic);
	const stirs = [G2.stir + 4, G2.stir + 18, G2.stir + 32];
	return (
		<Cam shots={SHOTS} shakeAt={SHAKES}>
			<Kitchen desat={desat} />
			<div style={{position: 'absolute', inset: 0, filter: desat ? `saturate(${1 - 0.85 * desat}) brightness(${1 - 0.3 * desat})` : undefined}}>
				{/* mesa: bolsa de café y jarra de leche; en la repisa, una taza que nadie usa */}
				<Put x={CUP_SHELF_X} y={SHELF_Y}><Cup /></Put>
				{!grabbed && <Put x={BAG_X} y={TABLE_Y}><CoffeeBag /></Put>}
				{!grabbed && <Put x={JUG_X} y={TABLE_Y}><MilkJug /></Put>}
				<Puddle size={puddle} x={PUDDLE_X} y={FLOOR + 8} />
				<Robot x={RX} y={FLOOR} {...r} />
				{/* chorros: leche desde el pico de la jarra y café desde la boca de la bolsa, hasta el piso */}
				<Pour x={mJ[0]} y0={mJ[1]} y1={FLOOR + 4} color={LIQ.milk} w={22} on={flowing} />
				{!frozen && <Falling x={mB[0]} y0={mB[1]} y1={FLOOR} at={P.flow - 2} dur={P.stop - P.flow - 10} color={COFFEE_DUST} n={44} spread={34} />}
				{!frozen && [0, 14, 28, 42, 56].map((d) => (
					<Splash key={d} x={mJ[0]} y={FLOOR} at={P.flow + 8 + d} color={LIQ.milk} n={8} power={9} />
				))}
				{!frozen && stirs.map((a) => <Splash key={a} x={RX + 50} y={FLOOR} at={a} color={LIQ.latte} n={12} power={13} />)}
			</div>
			{!frozen && <Vee x={VEE_X} acts={VEE_ACTS} hops={[T.no2, T.no3]} />}
			<Gota />
		</Cam>
	);
};

/** V30–V31: la cocina congelada detrás; la tarjeta al frente. */
const Explica: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.v30 || f >= T.v32) return null;
	const dark = 0.25 + 0.3 * tween(f, T.generales, T.generales + 10);
	const minis: {at: number; label: string; icon: string}[] = [
		{at: T.pasos30, label: 'PASOS', icon: '123'},
		{at: T.orden, label: 'ORDEN', icon: '→'},
		{at: T.termina, label: 'FIN', icon: '■'},
	];
	return (
		<>
			<AbsoluteFill style={{background: '#000', opacity: dark}} />
			{/* Vee da un paso al frente: se acerca a la cámara (crece) y se coloca a la izquierda */}
			<Vee x={[[T.v30, 480], [T.v30 + 12, 330]]} scale={11 + 2 * tween(f, T.v30, T.v30 + 12, 0, 1, outCubic)} acts={VEE2_ACTS} hops={[T.y31]} />
			{/* tres mini tarjetas: tiene pasos, tiene orden y termina */}
			{minis.map((m, i) => (
				<In key={m.label} at={T.tiene + i * 3} out={T.v31 + 8 + i * 2} x={1636} y={130 + i * 240} from="right" exit="right" impact={false}>
					<div style={{background: 'rgba(7,8,7,0.97)', transform: f >= m.at ? `scale(${1 + 0.12 * Math.max(0, 1 - (f - m.at) / 8)})` : undefined}}>
						<ConceptCard icon={m.icon} label={m.label} on={f >= m.at} size={0.9} />
					</div>
				</In>
			))}
			{/* V31: «los ingredientes» = café + leche, bajo la línea enorme */}
			<PopIn at={T.ingred} x={870} y={480}><CoffeeBag scale={10} /></PopIn>
			<PopIn at={T.ingred + 3} x={960} y={455}><div style={{fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.green}}>+</div></PopIn>
			<PopIn at={T.ingred + 6} x={1050} y={480}><MilkJug scale={10} /></PopIn>
			{/* las preguntas; en «Y ya que estamos» se apagan un poco para dar paso a la última */}
			<div style={{position: 'absolute', inset: 0, opacity: 1 - 0.45 * tween(f, T.y31, T.y31 + 8)}}>
				<Tag x={720} y={575} at={T.donde} rot={-4} size={64}>¿DÓNDE?</Tag>
				<Tag x={1330} y={590} at={T.recip} rot={3} size={54}>
					<span style={{display: 'inline-flex', alignItems: 'center', gap: 18}}>¿EN QUÉ RECIPIENTE? <Cup scale={5} /></span>
				</Tag>
				<Tag x={850} y={780} at={T.con} rot={2} size={64}>
					<span style={{display: 'inline-flex', alignItems: 'center', gap: 18}}>¿CON QUÉ? <Spoon scale={5} rot={30} /></span>
				</Tag>
			</div>
			<Question x={1420} y={790} at={T.faltaba} out={T.agua} size={150} color={C.blue} />
			<Tag x={1420} y={800} at={T.agua} rot={-3} size={64} color={C.blue}>
				<span style={{display: 'inline-flex', alignItems: 'center', gap: 18}}>¿Y EL AGUA? <Drop at={T.agua} /></span>
			</Tag>
		</>
	);
};

/** Gota de agua que rebota (dentro de la etiqueta «¿Y EL AGUA?»). */
const Drop: React.FC<{at: number}> = ({at: a}) => {
	const f = useCurrentFrame();
	const k = Math.max(0, f - a);
	const yb = -Math.abs(Math.sin(k / 5)) * 22 * Math.max(0.35, 1 - k / 60);
	return <div style={{width: 30, height: 38, background: LIQ.water, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', transform: `translateY(${yb}px)`, boxShadow: 'inset -5px -5px 0 rgba(0,0,0,0.2)'}} />;
};

/** V32: pantalla partida PERSONA | ROBOT. */
const Partida: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.v32 - 10 || f >= T.v33 + 10) return null;
	const leftOn = 1;
	const rightOn = 0.45 + 0.55 * tween(f, T.pero, T.pero + 8);
	const leftDim = 1 - 0.35 * tween(f, T.pero, T.pero + 8) * (1 - tween(f, T.das - 4, T.das + 4));
	const out = tween(f, T.v33 - 6, T.v33 + 2, 0, 1, inCubic);
	const div = tween(f, T.v32 - 4, T.v32 + 8, 0, 1, outCubic);
	const robotFace: RobotFace = f >= T.robot32 ? 'conf' : 'happy';
	const robotPose: RobotPose = f >= T.no32 ? 'shrug' : 'idle';
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
			<Board />
			{/* lado izquierdo */}
			<div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080, background: 'rgba(0,192,99,0.07)', opacity: leftOn * leftDim}} />
			<div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 1080, background: 'rgba(90,169,255,0.07)', opacity: rightOn}} />
			<div style={{position: 'absolute', left: 954, top: 90, width: 12, height: 860 * div, background: C.green, boxShadow: `0 0 24px ${C.green}`}} />
			<div style={{opacity: leftDim}}>
				<Slam at={T.persona} x={480} y={140}><div style={{fontFamily: SANS, fontWeight: 800, fontSize: 88, color: C.white, letterSpacing: '-0.02em'}}>PERSONA</div></Slam>
				{/* la persona (grande); en «sabe» da un saltito y le brilla la idea */}
				<div style={{position: 'absolute', inset: 0, transform: `translateY(${-Math.sin(Math.min(1, Math.max(0, (f - T.sabe) / 12)) * Math.PI) * 40}px)`}}>
					<PopIn at={T.v32 + 2} x={300} y={940}><PixelSprite buf={PERSONA} scale={14} /></PopIn>
				</div>
				{f >= T.sabe && f < T.sabe + 30 && <PixelBurst f={f} at={T.sabe} x={300} y={470} count={18} power={14} colors={[C.amber, '#FFFFFF', C.green]} seed={3} grid={10} />}
				<Nube x={400} y={210} w={530} h={290} at={T.basta} tail={[400, 452]}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 22, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 42, color: C.bg}}>MEZCLAR</div>
				</Nube>
				<PopIn at={T.cafe32} x={545} y={470}><CoffeeBag scale={9} /></PopIn>
				<PopIn at={T.taza} x={700} y={470} rot={-20}><Cup scale={10} fill="latte" /></PopIn>
				<PopIn at={T.taza + 5} x={845} y={470} rot={20}><Spoon scale={9} rot={20} /></PopIn>
				<Tag x={665} y={565} at={T.das} color={C.green} size={50} rot={-3}>SE DA POR HECHO</Tag>
			</div>
			{/* lado derecho */}
			<div style={{opacity: rightOn}}>
				<Slam at={T.persona + 6} x={1440} y={140}><div style={{fontFamily: SANS, fontWeight: 800, fontSize: 88, color: C.white, letterSpacing: '-0.02em'}}>ROBOT</div></Slam>
				<Robot x={1650} y={940} scale={12} flip pose={robotPose} face={robotFace} chest={f >= T.robot32 ? '?' : undefined} chestColor={C.amber} look={f >= T.robot32 && f < T.no32 ? [0, -1] : [0, 0]} hops={[T.pero + 2]} />
				<Nube x={1000} y={210} w={530} h={290} at={T.pero} tail={[1590, 452]} dim>
					{f >= T.robot32 && (
						<div style={{position: 'absolute', left: 0, right: 0, top: 104, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.amber, transform: `scale(${pop(f, T.robot32, 9, 300, 0.5)})`}}>MEZCLAR ???</div>
					)}
				</Nube>
			</div>
			{/* «esa instrucción»: la misma línea para los dos, sobre la división */}
			<In at={T.instr} x={960} y={872} from="down">
				<div style={{transform: 'translate(-50%, -50%)', fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.white, background: 'rgba(10,14,12,0.97)', border: `4px solid ${C.green}`, padding: '10px 30px', whiteSpace: 'nowrap', boxShadow: `0 0 30px ${C.green}55`}}>
					<span style={{color: C.green}}>▶ </span>Mezclar los ingredientes
				</div>
			</In>
		</div>
	);
};

/** Deslizador de V33 (propio: el del kit pone las marcas encima de los rótulos y es pequeño). */
const SL = {x0: 470, x1: 1810, y: 620};
const SL_W = SL.x1 - SL.x0;
const slX = (k: number) => SL.x0 + SL_W * k;
const POS_ROBOT = 0.8;
const POS_PERSONA = 0.3;
/** Ancho relativo de cada renglón de la hoja que acompaña al control. */
const RENGLON = [0.92, 0.7, 0.84, 0.6, 0.8, 0.74, 0.66, 0.88];

/** V33: deslizador GENERAL ←→ DETALLADO, y el robot pasa con el trapeador. */
const Detalle: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.v33 - 4) return null;
	let knob = 0.5;
	knob += (0.95 - knob) * tween(f, T.mas, T.mas + 10, 0, 1, inOutCubic);
	knob += (0.08 - knob) * tween(f, T.menos, T.menos + 10, 0, 1, inOutCubic);
	knob += (0.5 - knob) * tween(f, T.clave, T.clave + 12, 0, 1, inOutCubic);
	knob += (POS_ROBOT - knob) * tween(f, T.alcance, T.alcance + 12, 0, 1, inOutCubic);
	const kx = slX(knob);
	// la hoja del algoritmo: más detalle = más renglones
	const n = 1 + Math.round(knob * 7);
	const paperW = 270;
	const px = Math.min(SL.x1 - paperW / 2 + 40, Math.max(SL.x0 + paperW / 2, kx));
	const ok = f >= T.alcance + 4;
	const border = f >= T.ejecutar ? C.green : ok ? C.green : C.line2;
	const ent = pop(f, T.v33 + 2, 12, 230, 0.7);
	const mark = (at: number, pos: number, buf: Buf, label: string, color: string) => {
		if (f < at) return null;
		const p = pop(f, at, 10, 260, 0.6);
		return (
			<div style={{position: 'absolute', left: slX(pos), top: SL.y + 16, transform: `translateX(-50%) scale(${p})`, transformOrigin: '50% 0', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{width: 6, height: 104, background: color}} />
				<PixelSprite buf={buf} scale={7} />
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 36, color, marginTop: 6}}>{label}</div>
			</div>
		);
	};
	return (
		<>
			<Board />
			<Slam at={T.algo33} x={1140} y={140}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 100, color: C.white, letterSpacing: '-0.03em', whiteSpace: 'nowrap'}}>
					NIVEL DE <span style={{color: C.green}}>DETALLE</span>
				</div>
			</Slam>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${0.5 + 0.5 * ent})`, transformOrigin: `${(SL.x0 + SL.x1) / 2}px ${SL.y}px`, opacity: Math.min(1, ent * 2)}}>
				{/* hoja del algoritmo sobre el control */}
				<div style={{position: 'absolute', left: px - paperW / 2, top: SL.y - 64, width: paperW, transform: 'translateY(-100%)', background: 'rgba(12,16,14,0.97)', border: `4px solid ${border}`, boxShadow: ok ? `0 0 30px ${C.green}66` : 'none', padding: '10px 18px 14px', boxSizing: 'border-box'}}>
					<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 30, color: ok ? C.green : C.text, marginBottom: 8}}>{n} {n === 1 ? 'paso' : 'pasos'}</div>
					{Array.from({length: n}, (_, i) => (
						<div key={i} style={{height: 20, width: `${RENGLON[i] * 100}%`, background: i === 0 ? C.white : 'rgba(233,238,234,0.55)', marginTop: 12}} />
					))}
				</div>
				<div style={{position: 'absolute', left: kx - 16, top: SL.y - 66, width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: `20px solid ${border}`}} />
				{/* barra */}
				<div style={{position: 'absolute', left: SL.x0, top: SL.y - 12, width: SL_W, height: 24, background: C.line2}} />
				<div style={{position: 'absolute', left: SL.x0, top: SL.y - 12, width: kx - SL.x0, height: 24, background: C.green, boxShadow: `0 0 20px ${C.green}88`}} />
				<div style={{position: 'absolute', left: SL.x0, top: SL.y + 40, fontFamily: MONO, fontWeight: 800, fontSize: 42, color: C.text}}>GENERAL</div>
				<div style={{position: 'absolute', right: 1920 - SL.x1, top: SL.y + 40, fontFamily: MONO, fontWeight: 800, fontSize: 42, color: C.text}}>DETALLADO</div>
				{mark(T.alcance + 4, POS_ROBOT, ROBOT_HEAD, 'ROBOT', C.green)}
				{mark(T.alcance + 14, POS_PERSONA, PERSONA_HEAD, 'PERSONA', C.text)}
				<div style={{position: 'absolute', left: kx - 42, top: SL.y - 42, width: 84, height: 84, background: C.white, border: `10px solid ${C.green}`, boxSizing: 'border-box', boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}} />
			</div>
			<Tag x={1250} y={SL.y + 200} at={T.ejecutar} color={C.green} size={48} rot={-2}>ALCANZA ✓</Tag>
			<Hit at={T.ejecutar} x={slX(POS_ROBOT)} y={SL.y} big />
			<Vee x={250} acts={VEE3_ACTS} hops={[T.ejecutar + 2]} />
			<Trapeador />
		</>
	);
};

/** El robot cruza la pantalla con el trapeador (remate del gag). */
const Trapeador: React.FC = () => {
	const f = useCurrentFrame();
	if (f < MOP0 || f >= MOP1) return null;
	const k = tween(f, MOP0, MOP1, 0, 1, (t) => t);
	const x = -260 + (2180 + 260) * k;
	return (
		<>
			<div style={{position: 'absolute', left: Math.max(0, x - 1200), width: Math.max(0, Math.min(1200, x + 40)), top: FLOOR - 10, height: 16, background: 'rgba(255,255,255,0.22)'}} />
			<Robot x={x} y={FLOOR} pose="walk" face="happy" chest="✓" time={f * 2} reachF={[x + 150, FLOOR - 120]} holdF={<Mop rot={-40} />} />
		</>
	);
};

/* ------------------------------------------------------------------ escena */

/** V23: la claqueta «INTENTO 1». */
const Claqueta: React.FC = () => (
	<Slam at={T.primer} out={T.esta - 4} x={960} y={430}>
		<Clap at={T.primer} text="INTENTO 1" />
	</Slam>
);

export const B4: React.FC = () => {
	const f = useCurrentFrame();
	const enCocina = f < T.v32;
	return (
		<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
			{enCocina && <Cocina />}
			{enCocina && <Explica />}
			{enCocina && <AlgCard />}
			{enCocina && <BigLine />}
			{f >= T.v30 && f < T.v32 && (
				<>
					<Stamp x={CARD2_X + (CARD_W * CARD2_S) / 2} y={CARD2_Y + (CARD_H * CARD2_S) / 2} at={T.algo30} out={T.v31 + 6} size={72} />
					<Hit at={T.algo30} x={CARD2_X + (CARD_W * CARD2_S) / 2} y={CARD2_Y + (CARD_H * CARD2_S) / 2} big />
				</>
			)}
			{enCocina && <Memoria />}
			{/* globos del robot (en pantalla) */}
			<Say at={T.e24 + 2} out={T.dos + 6} text="¿CANTIDAD DE CAFÉ?" color={C.amber} dx={120} minX={720} />
			<Say at={T.e25 + 22} out={T.cien + 6} text="¿CANTIDAD DE LECHE?" color={C.amber} dx={120} minX={720} />
			<Say at={G1.ask} out={G1.ok} text="MEZCLAR… ¿DÓNDE?" color={C.amber} dx={60} />
			<Say at={G1.ok} out={T.espera + 14} text="PISO: DISPONIBLE ✓" dx={60} />
			<Say at={G2.ok} out={T.v29} text="RESULTADO ✓" minX={830} />
			{/* fichas con los datos */}
			{enCocina && f < T.e27 && (
				<Cam shots={SHOTS}>
					<Ficha text="2 cdas" at={T.dos + 4} from={[520, 700]} to={[RX, 770]} />
					<Ficha text="100 ml" at={T.cien + 4} from={[520, 700]} to={[RX, 770]} />
				</Cam>
			)}
			{/* golpes */}
			<Claqueta />
			<SpeedLines at={T.no1} len={14} x={proj(T.no1, [CHEEK[0] - 40, 600])[0]} y={proj(T.no1, [CHEEK[0] - 40, 600])[1]} />
			<SpeedLines at={T.piso} len={10} x={960} y={700} />
			{f >= G2.confetti - 1 && f < G2.confetti + 30 && (
				<>
					<PixelBurst f={f} at={G2.confetti} x={proj(G2.confetti, [PUDDLE_X, FLOOR - 40])[0]} y={proj(G2.confetti, [PUDDLE_X, FLOOR - 40])[1]} count={44} power={26} colors={[C.green, C.amber, C.blue, '#FFFFFF', C.red]} seed={7} grid={10} />
					<PixelBurst f={f} at={G2.confetti + 4} x={proj(G2.confetti, [RX, 520])[0]} y={proj(G2.confetti, [RX, 520])[1]} count={30} power={22} colors={[C.green, C.amber, '#FFFFFF']} seed={11} grid={10} />
				</>
			)}
			{/* V29: «ilustrativo»: el robot brilla de orgullo */}
			{f >= T.ilus && f < T.ilus + 30 && (
				<PixelBurst f={f} at={T.ilus + 2} x={proj(T.ilus, [RX, 600])[0]} y={proj(T.ilus, [RX, 600])[1]} count={26} power={20} colors={[C.green, '#FFFFFF', C.amber]} seed={5} grid={12} />
			)}
			<Shockwave at={T.no1} x={960} y={500} size={1200} color={C.red} thick={18} dur={20} />
			{/* transiciones */}
			<CutFlash at={T.v30} len={5} />
			<GlitchBurst at={T.v30} len={7} />
			{f >= T.v32 - 12 && <Partida />}
			<Barrido at={T.v32} />
			<WipeBar at={T.v33 - 8} dur={14} />
			<CutFlash at={T.v33} len={4} max={0.6} />
			{f >= T.v33 - 4 && <Detalle />}
			<SpeedLines at={MOP0 + 2} len={MOP1 - MOP0 - 2} mode="h" color="rgba(255,255,255,0.7)" count={14} />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ sonido */

export const sfxB4: Sfx[] = [
	// V23–V24: claqueta y tarjeta
	s(T.primer, 'clap', 0.45),
	s(T.primer + 3, 'hit', 0.25),
	s(T.esta - 4, 'whoosh', 0.2),
	s(T.robot23, 'blip', 0.25),
	s(T.algo, 'whoosh', 0.25),
	s(T.algo + 8, 'typing', 0.22),
	s(T.inicio, 'blip', 0.25),
	s(T.cuatro, 'pop', 0.25),
	s(T.cuatro + 4, 'pop', 0.22),
	s(T.cuatro + 8, 'pop', 0.22),
	s(T.cuatro + 12, 'pop', 0.25),
	s(T.fin, 'blip', 0.25),
	s(T.veamos, 'key', 0.3),
	s(T.e24 + 2, 'blip', 0.35),
	// V25–V27: datos a la memoria
	s(T.dos + 4, 'whoosh', 0.2),
	s(T.dos + 22, 'land', 0.3),
	s(T.e25, 'slide', 0.25),
	s(T.e25 + 4, 'check', 0.35),
	s(T.e25 + 18, 'key', 0.25),
	s(T.e25 + 22, 'blip', 0.35),
	s(T.cien + 4, 'whoosh', 0.2),
	s(T.cien + 22, 'land', 0.3),
	s(T.e26 + 4, 'check', 0.35),
	s(T.muy + 3, 'ac', 0.3),
	s(T.perfecto + 4, 'sparkle', 0.25),
	// pausa: toma las cosas y busca dónde
	s(G1.turn, 'key', 0.25),
	s(G1.reach, 'servo', 0.35),
	s(G1.grab, 'stack', 0.25),
	s(G1.ask, 'blip', 0.35),
	s(G1.lookL, 'servo', 0.15),
	s(G1.lookR, 'servo', 0.15),
	s(G1.lookD, 'servo', 0.18),
	s(G1.ok, 'check', 0.4),
	// V28: el café al piso
	s(P.move, 'servo', 0.3),
	s(P.flow - 2, 'pour', 0.4),
	s(P.flow + 6, 'splash', 0.3),
	s(T.no1, 'hit', 0.4),
	s(T.no1 + 1, 'no', 0.22),
	s(T.piso, 'splash', 0.3),
	// pausa: revuelve, gota, resultado
	s(G2.stir + 4, 'splash', 0.3),
	s(G2.stir + 18, 'stir', 0.35),
	s(G2.stir + 32, 'splash', 0.28),
	s(G2.cheek, 'plop', 0.4),
	s(G2.show, 'key', 0.25),
	s(G2.ok, 'check', 0.35),
	s(G2.confetti, 'fanfare', 0.4),
	// V29
	s(T.muy29 + 3, 'boing', 0.2),
	s(T.ilus + 4, 'sparkle', 0.25),
	// V30: la cocina se congela
	s(T.v30, 'glitch', 0.35),
	s(T.ojo, 'whoosh', 0.25),
	s(T.algo30, 'hit', 0.4),
	s(T.algo30 + 2, 'ac', 0.25),
	s(T.pasos30, 'pop', 0.3),
	s(T.orden, 'pop', 0.3),
	s(T.termina, 'pop', 0.3),
	// V31: preguntas
	s(T.v31 + 4, 'unstack', 0.25),
	s(T.pasos31, 'blip', 0.2),
	s(T.generales, 'rise', 0.25),
	s(T.mezclar, 'hit', 0.35),
	s(T.ingred + 2, 'pop', 0.25),
	s(T.donde, 'wa', 0.25),
	s(T.recip, 'wa', 0.25),
	s(T.con, 'wa', 0.25),
	s(T.faltaba, 'rise', 0.2),
	s(T.agua, 'plop', 0.35),
	// V32: pantalla partida
	s(T.v32 - 6, 'whoosh', 0.35),
	s(T.persona, 'hit', 0.3),
	s(T.basta, 'pop', 0.25),
	s(T.instr, 'land', 0.3),
	s(T.sabe, 'sparkle', 0.25),
	s(T.cafe32, 'pop', 0.25),
	s(T.taza, 'pop', 0.3),
	s(T.pero, 'slide', 0.25),
	s(T.robot32, 'no', 0.25),
	s(T.das, 'stack', 0.3),
	// V33: deslizador y trapeador
	s(T.v33 - 8, 'whoosh', 0.3),
	s(T.algo33, 'hit', 0.3),
	s(T.mas, 'slide', 0.25),
	s(T.menos, 'slide', 0.25),
	s(T.alcance + 4, 'pop', 0.3),
	s(T.alcance + 14, 'pop', 0.25),
	s(T.ejecutar, 'ac', 0.35),
	s(MOP0, 'slide', 0.35),
	s(MOP0 + 4, 'whoosh', 0.3),
];
