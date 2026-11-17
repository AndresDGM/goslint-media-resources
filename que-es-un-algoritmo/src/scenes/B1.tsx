import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inCubic, inOutCubic, outCubic, pop, tween, windowed} from '@commons/lib';
import {PixelBurst} from '@commons/pixel';
import {LogoMark, GlitchBurst, CutFlash, Shockwave} from '@commons/components';
import {Hit, In} from '@commons/vertical';
import {Barrido, Slam, SpeedLines} from '@commons/transiciones';
import {
	Board, Bread, Bubble, Cam, CoffeeBag, Counter, Cup, FLOOR, InstrCard, Kitchen, MilkJug, Put, Question, Robot, RobotSays, ROBOT_X, SHELF_X0, SHELF_Y, SLOT,
	Stamp, TABLE_Y, Tag, TypeLine, Vee, VEE_X, lerpPt, robotRest,
} from '../kit';
import type {RobotFace, RobotPose, Shot} from '../kit';
import {at, end} from '../timeline';
import {Sfx, s} from '../sfx';

/**
 * BLOQUE 1 · «El robot literal» (gancho): V01–V07 y N01.
 * Todo se ancla a las marcas de la voz (at('V01', 'robot')…); no hay fotogramas sueltos.
 */

/* ================================================================== tiempos */

const T = {
	// V01
	imagina: at('V01', 'imagina'),
	tienes: at('V01', 'tienes'),
	robot: at('V01', 'robot'),
	hace: at('V01', 'hace'),
	pides: at('V01', 'pides'),
	todo: at('V01', 'todo', 2),
	// V02
	v02: at('V02'),
	hoy: at('V02', 'hoy'),
	pedir: at('V02', 'pedir'),
	cafe2: at('V02', 'cafe'),
	// V03
	v03: at('V03'),
	explicarias: at('V03', 'explicarias'),
	// V04
	v04: at('V04'),
	ver: at('V04', 'ver'),
	robot4: at('V04', 'robot'),
	prepara: at('V04', 'prepara'),
	cafe4: at('V04', 'cafe'),
	fin4: end('V04'),
	// V05
	v05: at('V05'),
	no1: at('V05', 'no', 1),
	no2: at('V05', 'no', 2),
	no3: at('V05', 'no', 3),
	prepararte: at('V05', 'prepararte'),
	tu: at('V05', 'tu'),
	el: at('V05', 'el'),
	cafe5: at('V05', 'cafe'),
	// V06
	v06: at('V06'),
	bueno: at('V06', 'bueno'),
	tecnicamente: at('V06', 'tecnicamente'),
	eso: at('V06', 'eso'),
	cafe6: at('V06', 'cafe'),
	// V07
	v07: at('V07'),
	robot7: at('V07', 'robot'),
	fallando: at('V07', 'fallando'),
	hizo: at('V07', 'hizo'),
	exactamente: at('V07', 'exactamente'),
	entendio: at('V07', 'entendio'),
	de: at('V07', 'de'),
	mi: at('V07', 'mi'),
	orden1: at('V07', 'orden', 1),
	si: at('V07', 'si'),
	cafe7: at('V07', 'cafe'),
	verdad: at('V07', 'verdad'),
	no7: at('V07', 'no', 2),
	basta: at('V07', 'basta'),
	orden2: at('V07', 'orden', 2),
	necesito: at('V07', 'necesito'),
	darle: at('V07', 'darle'),
	algoritmo: at('V07', 'algoritmo'),
	// N01
	quedate: at('N01', 'quedate'),
	hasta: at('N01', 'hasta'),
	final: at('N01', 'final'),
	porque: at('N01', 'porque'),
	dejar: at('N01', 'dejar'),
	reto: at('N01', 'reto'),
};

/** Caída del robot: empieza 14 fotogramas antes de «robot» y aterriza justo en la palabra. */
const FALL0 = T.robot - 34;

/** GAG 1: el robot se «prepara» a sí mismo (dentro del silencio tras V04). */
const G1 = {
	says: T.cafe4 + 6,
	saysOut: T.fin4 + 12,
	stretch: T.fin4 + 12,
	squat: T.fin4 + 30,
	stand: T.fin4 + 66,
};

/** GAG 2: el robot toma la bolsa y la levanta como un trofeo. */
const G2 = {
	reach: T.cafe5 + 4,
	grab: T.cafe5 + 18,
	up: T.cafe5 + 34,
};

/** Bajada de la bolsa en V07. */
const G3 = {
	down: T.fallando,
	release: T.fallando + 14,
	rest: T.fallando + 32,
};

/** Entrada de la pizarra (transición de impacto en «algoritmo») y golpe del título. */
const TITULO = T.algoritmo + 2;

/* ================================================================== puntos del robot */

const REST = robotRest(ROBOT_X, FLOOR);
/** Centro de la bolsa sobre la mesa (la bolsa mide 143 px de alto, la base está en TABLE_Y). */
const BAG_PT: [number, number] = [SLOT[0], TABLE_Y - 72];
/** Mano en alto (la bolsa queda sobre la cabeza, un poco a la derecha). */
const UP_PT: [number, number] = [ROBOT_X + 80, 395];

const handPoint = (f: number): [number, number] | null => {
	if (f < G2.reach) return null;
	if (f < G2.grab) return lerpPt(REST, BAG_PT, tween(f, G2.reach, G2.grab, 0, 1, outCubic));
	if (f < G2.up) return lerpPt(BAG_PT, UP_PT, tween(f, G2.grab, G2.up, 0, 1, inOutCubic));
	if (f < G3.down) return [UP_PT[0], UP_PT[1] + Math.sin(f / 6) * 6];
	if (f < G3.release) return lerpPt(UP_PT, BAG_PT, tween(f, G3.down, G3.release, 0, 1, inOutCubic));
	if (f < G3.rest) return lerpPt(BAG_PT, REST, tween(f, G3.release, G3.rest, 0, 1, outCubic));
	return null;
};

/* ================================================================== piezas locales */

/** Objeto que cae desde arriba y rebota al posarse en `landAt`. Base centrada en (x, y). */
const Drop: React.FC<{x: number; y: number; landAt: number; children: React.ReactNode}> = ({x, y, landAt, children}) => {
	const f = useCurrentFrame();
	const t0 = landAt - 10;
	if (f < t0) return null;
	const k = f - t0;
	let off = 0;
	if (k < 10) off = -900 * (1 - (k / 10) ** 2);
	else if (k < 18) off = -70 * 4 * ((k - 10) / 8) * (1 - (k - 10) / 8);
	else if (k < 24) off = -20 * 4 * ((k - 18) / 6) * (1 - (k - 18) / 6);
	const squash = k >= 10 && k < 13 ? 0.85 : 1;
	return (
		<Put x={x} y={y + off}>
			<div style={{transform: `scale(${1 / squash}, ${squash})`, transformOrigin: '50% 100%'}}>{children}</div>
		</Put>
	);
};

/** Polvo de un aterrizaje (pixeles marrones grises que saltan hacia los lados). */
const Polvo: React.FC<{at: number; x: number; y: number; n?: number}> = ({at: a, x, y, n = 12}) => {
	const f = useCurrentFrame();
	return <PixelBurst f={f} at={a} x={x} y={y} count={n} power={9} colors={['#B9A58F', '#8A7B6B', '#FFFFFF']} spread={150} dir={-90} gravity={0.9} life={22} seed={a % 89} />;
};

/** Flecha ▼ que rebota sobre un objeto (centrada en x, y = punta). */
const Flecha: React.FC<{x: number; y: number; at: number; out: number; color?: string}> = ({x, y, at: a, out, color = C.amber}) => {
	const f = useCurrentFrame();
	if (f < a || f >= out) return null;
	const p = pop(f, a, 9, 300, 0.5);
	const b = Math.abs(Math.sin((f - a) / 4.5)) * 34;
	return <div style={{position: 'absolute', left: x, top: y - b, transform: `translate(-50%, -100%) scale(${p})`, fontFamily: MONO, fontWeight: 800, fontSize: 110, lineHeight: 1, color, textShadow: `0 0 20px ${color}99, 0 6px 0 rgba(0,0,0,0.5)`}}>▼</div>;
};

/** Pastilla blanca de la orden («PREPARA», «CAFÉ»). */
const Chip: React.FC<{cx: number; cy: number; label: string; scale?: number; rot?: number; size?: number; color?: string; bg?: string}> = ({cx, cy, label, scale = 1, rot = 0, size = 100, color = C.bg, bg = C.white}) => (
	<div style={{position: 'absolute', left: cx, top: cy, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`, fontFamily: SANS, fontWeight: 800, fontSize: size, color, background: bg, padding: '12px 38px', borderRadius: 30, whiteSpace: 'nowrap', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>{label}</div>
);

/** Panel de lectura literal (marco oscuro con rótulo arriba). */
const Panel: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
	<div style={{position: 'relative', width: 780, height: 540, background: 'rgba(14,17,15,0.94)', border: `4px solid ${C.green}`, boxShadow: `0 0 40px ${C.green}33, 0 20px 40px rgba(0,0,0,0.6)`}}>
		<div style={{position: 'absolute', left: 28, top: 22, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.green}}>{label}</div>
		{children}
	</div>
);

/** Orden grande «PREPARA CAFÉ» que se parte en dos en `crackAt`. */
const OrdenGrande: React.FC<{at: number; crackAt: number; x: number; y: number}> = ({at: a, crackAt, x, y}) => {
	const f = useCurrentFrame();
	if (f < a) return null;
	const p = pop(f, a, 10, 260, 0.6);
	const body = (clip?: string) => (
		<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 124, color: C.bg, background: C.white, padding: '20px 56px', borderRadius: 36, whiteSpace: 'nowrap', boxShadow: '0 14px 0 rgba(0,0,0,0.35)', clipPath: clip}}>PREPARA CAFÉ</div>
	);
	if (f < crackAt) {
		const tremble = f > crackAt - 12 ? Math.sin(f * 2.9) * 5 : 0;
		return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translateX(${tremble}px) scale(${0.3 + 0.7 * p})`}}>{body()}</div>;
	}
	const k = f - crackAt;
	const q = tween(k, 0, 22, 0, 1, inCubic);
	if (q >= 1) return null;
	const left = 'polygon(0 0, 54% 0, 46% 30%, 56% 62%, 48% 100%, 0 100%)';
	const right = 'polygon(54% 0, 100% 0, 100% 100%, 48% 100%, 56% 62%, 46% 30%)';
	return (
		<>
			<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translate(${-260 * q - 12}px, ${760 * q * q}px) rotate(${-28 * q}deg)`, opacity: 1 - q * 0.6}}>{body(left)}</div>
			<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translate(${260 * q + 12}px, ${760 * q * q}px) rotate(${28 * q}deg)`, opacity: 1 - q * 0.6}}>{body(right)}</div>
		</>
	);
};

/* ================================================================== pizarra del título */

const TituloTxt: React.FC = () => (
	<div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 860, letterSpacing: '-0.045em', lineHeight: 0.98, color: C.white}}>
		<div style={{fontSize: 170}}>¿QUÉ ES UN</div>
		<div style={{fontSize: 200, color: C.green, textShadow: `0 0 50px ${C.green}66`}}>ALGORITMO?</div>
	</div>
);

const Pizarra: React.FC = () => {
	const f = useCurrentFrame();
	const up = tween(f, T.quedate, T.quedate + 16, 0, 1, inOutCubic);
	const logoY = 700 - 180 * up;
	const capY = 812 - 190 * up;
	const logoP = tween(f, TITULO + 14, TITULO + 40);
	// barra «hasta el final»
	const barK = tween(f, T.hasta, T.final + 3, 0, 1, outCubic);
	const barA = windowed(f, T.hasta - 4, T.porque + 4, 6, 8);
	const breathe = 1 + 0.025 * Math.sin((f - T.reto) / 5);
	return (
		<Cam shots={[[T.algoritmo, 1, 960, 540]]} shakeAt={[TITULO]} shakeAmp={12}>
			<Board />
			{/* título */}
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '960px 400px', transform: `translateY(${-130 * up}px) scale(${1 - 0.22 * up})`}}>
				<Slam at={TITULO} x={960} y={400} from={3} rot={-4}>
					<TituloTxt />
				</Slam>
			</div>
			{/* logo y rótulo */}
			{f >= TITULO + 12 && (
				<div style={{position: 'absolute', left: 0, width: 1920, top: logoY - 58, display: 'flex', justifyContent: 'center'}}>
					<LogoMark height={116} p={logoP} glow={logoP >= 1 ? 18 : 0} />
				</div>
			)}
			<TypeLine text="GOSLINT · Fase 1 · Lógica desde cero" at={TITULO + 22} x={960} y={capY} size={44} color={C.text} cps={34} font={MONO} weight={700} />
			{/* barra de avance «quédate hasta el final» */}
			{barA > 0 && (
				<div style={{position: 'absolute', left: 520, top: 700, width: 880, opacity: barA}}>
					<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 800, fontSize: 38, color: C.dim, marginBottom: 14}}>
						<span>INICIO</span>
						<span style={{color: C.green}}>FINAL</span>
					</div>
					<div style={{position: 'relative', height: 28, background: C.line2, border: `3px solid ${C.line2}`}}>
						<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${barK * 100}%`, background: C.green, boxShadow: `0 0 22px ${C.green}88`}} />
						<div style={{position: 'absolute', left: `${barK * 100}%`, top: -16, width: 52, height: 52, transform: 'translateX(-50%)', background: C.white, border: `8px solid ${C.green}`, boxSizing: 'border-box'}} />
					</div>
				</div>
			)}
			<Shockwave at={T.final + 3} x={1400} y={742} size={520} thick={14} dur={22} />
			{/* reto */}
			<Slam at={T.reto} x={960} y={840} from={3.2} rot={3}>
				<div style={{transform: `scale(${breathe})`}}>
					<Tag x={0} y={0} at={T.reto - 40} size={84} color={C.amber}>RETO AL FINAL</Tag>
				</div>
			</Slam>
			<Hit at={T.reto} x={960} y={840} big />
			<Hit at={T.reto + 34} x={1670} y={600} />
			{/* Vee y el robot con el pan */}
			<Vee x={250} y={965} at={T.algoritmo} acts={[[T.hasta, 'senalar'], [T.porque, 'explicar'], [T.reto, 'celebrar']]} hops={[T.reto + 24]} />
			<Robot
				x={1670}
				y={965 + (1 - (f < T.quedate ? 0 : Math.min(1, pop(f, T.quedate, 13, 170, 0.8)))) * 600}
				pose="hold"
				face="happy"
				flip
				chest="?"
				chestColor={C.amber}
				holdF={<Bread scale={8} />}
				look={[-1, 0]}
				hops={[T.porque + 8, T.reto, T.reto + 28]}
			/>
		</Cam>
	);
};

/* ================================================================== escena de la cocina */

const SHOTS: Shot[] = [
	[0, 1.0, 960, 540],
	[T.imagina + 14, 1.2, 880, 600],
	[T.hace, 1.45, 880, 650, 20],
	[T.todo, 2.0, 880, 720],
	[T.v02, 1.3, 760, 640],
	[T.pedir, 1.5, 1250, 600],
	[T.v03, 1.5, 640, 640],
	[T.v04, 1.15, 835, 600],
	[T.robot4, 1.5, 700, 640],
	[G1.says, 1.7, 880, 660],
	[T.v05, 1.25, 800, 630],
	[T.prepararte, 1.35, 760, 630],
	[T.el, 1.25, 820, 630],
	[G2.up + 20, 1.2, 900, 530, 24],
	[T.v06, 1.2, 780, 530],
	[T.eso, 1.25, 880, 520],
	[T.v07, 1.2, 800, 630],
	[T.hizo, 1.0, 960, 540],
];

const SHAKES = [T.robot, T.todo, T.cafe2, T.cafe2 + 8, T.cafe4, G1.squat + 9, G1.squat + 27, T.no1, T.no2, T.no3, G2.up, G3.release, T.orden2];

const Cocina: React.FC = () => {
	const f = useCurrentFrame();

	/* ---------- robot ---------- */
	let pose: RobotPose = 'idle';
	let face: RobotFace = 'happy';
	let chest: string | undefined;
	let chestColor: string = C.green;
	let look: [number, number] = [0, 0];
	let tilt = 0;
	let time: number | undefined;
	if (f < T.robot) {
		face = 'wow';
		look = [0, 1];
	} else if (f < T.hace) {
		chest = 'LISTO';
	} else if (f < T.todo) {
		pose = 'salute';
		chest = 'LISTO';
	} else if (f < T.cafe2) {
		face = 'proud';
		chest = '∞';
		look = f < T.hoy + 14 ? [-1, 0] : [0, 0];
	} else if (f < T.v03) {
		chest = 'OK';
		look = [1, 0];
	} else if (f < T.robot4) {
		face = 'conf';
		chest = '?';
		chestColor = C.amber;
		tilt = 9 * Math.sin((f - T.v03) / 4);
		look = [-1, 0];
	} else if (f < T.cafe4) {
		face = 'wow';
		chest = '!';
		look = [-1, 0];
	} else if (f < G1.stretch) {
		face = 'focus';
		chest = '…';
	} else if (f < G1.squat) {
		pose = 'stretch';
		chest = 'GO';
		time = f * 1.2;
	} else if (f < G1.stand) {
		pose = 'squat';
		time = (f - G1.squat) * 0.87;
		chest = f >= G1.squat + 27 ? '2' : f >= G1.squat + 9 ? '1' : '0';
		look = [0, 0];
	} else if (f < T.v05) {
		face = 'proud';
		chest = '✓';
	} else if (f < T.el) {
		face = 'sad';
		chest = '✗';
		chestColor = C.red;
		look = [-1, 0];
	} else if (f < G2.reach) {
		face = 'wow';
		chest = '?';
		chestColor = C.amber;
		look = [1, 0];
	} else if (f < G2.up) {
		pose = 'reach';
		face = 'focus';
		chest = '…';
		look = [1, 0];
	} else if (f < G3.down) {
		pose = 'trophy';
		face = 'proud';
		chest = '✓';
		look = [1, -1];
		tilt = 5 * Math.sin((f - G2.up) / 6);
	} else if (f < G3.release) {
		pose = 'reach';
		face = 'happy';
		chest = '✓';
		look = [1, 0];
	} else {
		face = 'happy';
		chest = '✓';
	}
	const hand = handPoint(f);
	const holding = f >= G2.grab && f < G3.release;
	const fallK = tween(f, FALL0, T.robot, 0, 1, (x: number) => x ** 1.5);
	const robotY = f < T.robot ? FLOOR - (1 - fallK) * 1100 : FLOOR;

	/* ---------- orden que vuela de Vee al robot (V04) ---------- */
	const flyK = tween(f, T.prepara, T.cafe4 + 3, 0, 1, inOutCubic);
	const bx = 380 + (ROBOT_X - 70 - 380) * flyK;
	const by = 600 - 110 * flyK;

	/* ---------- explicación de V07 (pantalla, fuera de la cámara) ---------- */
	const expl = f >= T.hizo && f < TITULO ? 1 : 0;
	const dim = expl ? 0.84 * tween(f, T.hizo, T.hizo + 8) : 0;
	const sp = tween(f, T.entendio, T.entendio + 12, 0, 1, inOutCubic);
	const chipP = pop(f, T.hizo, 11, 260, 0.6);
	const chipOut = tween(f, T.cafe7 - 6, T.cafe7 - 1);

	return (
		<>
			<Cam shots={SHOTS} shakeAt={SHAKES} shakeAmp={12}>
				<Kitchen />
				{/* haz de luz y sombra del aterrizaje */}
				{f < T.robot + 24 && (
					<>
						<div style={{position: 'absolute', left: ROBOT_X - 170, top: -300, width: 340, height: FLOOR + 300, background: `linear-gradient(180deg, rgba(0,192,99,0.26), rgba(0,192,99,0.05))`, clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)', opacity: (0.7 + 0.3 * Math.sin(f / 2.5)) * (1 - tween(f, T.robot, T.robot + 24))}} />
						<div style={{position: 'absolute', left: ROBOT_X - 170 * (0.35 + 0.65 * fallK), top: FLOOR - 16, width: 340 * (0.35 + 0.65 * fallK), height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: f < T.robot ? `4px dashed ${C.green}` : undefined, opacity: 1 - tween(f, T.robot + 6, T.robot + 24)}} />
					</>
				)}
				{/* repisa y mesa */}
				<Put x={SHELF_X0 + 330} y={SHELF_Y}><Cup /></Put>
				{f < G2.grab && <Drop x={SLOT[0]} y={TABLE_Y} landAt={T.cafe2}><CoffeeBag /></Drop>}
				{f >= G3.release && <Put x={SLOT[0]} y={TABLE_Y}><CoffeeBag /></Put>}
				<Drop x={SLOT[1]} y={TABLE_Y} landAt={T.cafe2 + 8}><MilkJug /></Drop>
				<Polvo at={T.cafe2} x={SLOT[0]} y={TABLE_Y} />
				<Polvo at={T.cafe2 + 8} x={SLOT[1]} y={TABLE_Y} />
				<Polvo at={G3.release} x={SLOT[0]} y={TABLE_Y} n={8} />
				<Flecha x={SLOT[0]} y={TABLE_Y - 175} at={T.el} out={G2.grab} />
				<Tag x={SLOT[0] + 150} y={TABLE_Y - 330} at={T.cafe5} out={G2.grab} color={C.green} size={44} rot={-5}>EL CAFÉ</Tag>

				{/* robot */}
				{f >= FALL0 - 1 && (
					<Robot
						x={ROBOT_X}
						y={robotY}
						pose={pose}
						face={face}
						chest={chest}
						chestColor={chestColor}
						look={look}
						tilt={tilt}
						time={time}
						reachF={hand}
						holdF={holding ? <CoffeeBag /> : undefined}
						hops={[T.todo, G2.up, G2.up + 24]}
					/>
				)}
				{/* Vee */}
				<Vee
					x={[[0, VEE_X], [T.v07, VEE_X], [T.v07 + 52, 640]]}
					at={T.hoy}
					entra
					acts={[
						[T.explicarias - 18, 'explicar'],
						[T.ver, 'pensar'],
						[T.robot4, 'senalar'],
						[G1.squat - 6, 'pensar'],
						[T.v05, 'sorpresa'],
						[T.el, 'senalar'],
						[G2.up + 4, 'sorpresa'],
						[T.v06, 'pensar'],
						[T.tecnicamente, 'explicar'],
						[T.eso, 'explicar'],
						[T.robot7, 'senalar'],
						[T.hizo, 'explicar'],
						[T.cafe7, 'explicar'],
						[T.no7, 'pensar'],
						[T.necesito, 'explicar'],
					]}
					hops={[T.no1, T.no2, T.no3, T.prepararte + 4]}
				/>

				{/* globos y marcas dentro de la cámara */}
				<Question x={VEE_X} y={470} at={T.v03} out={T.v04} size={170} />
				<RobotSays x={ROBOT_X} y={480} at={T.hace} out={T.pides + 12}>A TUS ÓRDENES</RobotSays>
				<Bubble x={bx} y={by} at={T.prepara} out={T.cafe4 + 8} size={46}>PREPARA CAFÉ</Bubble>
				<RobotSays x={ROBOT_X} y={478} at={G1.says} out={G1.saysOut} size={36}>PREPARAR → prepararse</RobotSays>
				<Counter x={ROBOT_X - 260} y={640} value="1" at={G1.squat + 9} out={G1.squat + 27} size={170} />
				<Counter x={ROBOT_X - 260} y={640} value="2" at={G1.squat + 27} out={G1.stand + 6} size={170} />
				<RobotSays x={1190} y={470} at={G2.up} out={G2.up + 44} size={44}>CAFÉ ✓</RobotSays>
				<Counter x={VEE_X + 30} y={470} value="…" at={T.bueno} out={T.tecnicamente} size={130} color={C.amber} />

				{/* impactos en el mundo */}
				<Hit at={T.robot} x={ROBOT_X} y={FLOOR - 40} big />
				<Hit at={T.todo} x={ROBOT_X} y={700} />
				<Hit at={T.cafe4} x={ROBOT_X} y={500} />
				<Hit at={G2.up} x={UP_PT[0]} y={UP_PT[1] + 30} big />
				<Hit at={G2.up + 22} x={UP_PT[0]} y={UP_PT[1] + 60} />
				<SpeedLines at={G1.squat + 9} len={9} mode="radial" x={ROBOT_X} y={720} count={18} />
				<SpeedLines at={G1.squat + 27} len={9} mode="radial" x={ROBOT_X} y={720} count={18} />
				<SpeedLines at={G1.stretch} len={8} mode="h" count={14} />
				<SpeedLines at={T.no1} len={6} mode="radial" x={ROBOT_X} y={640} count={14} color={C.red} />
			</Cam>

			{/* ---------- capa de pantalla (no se recorta) ---------- */}
			{/* V01: «IMAGINA…» */}
			<Slam at={T.imagina} out={T.tienes} x={640} y={330} from={2.6} rot={-5}>
				<div style={{fontFamily: SANS, fontWeight: 860, fontSize: 170, letterSpacing: '-0.045em', color: C.white, textShadow: `0 8px 0 rgba(0,0,0,0.5)`}}>
					IMAGINA<span style={{color: C.green}}>…</span>
				</div>
			</Slam>
			{/* V02 */}
			<Tag x={560} y={190} at={T.cafe2} out={T.v03} color={C.green} size={52} rot={3}>CAFÉ CON LECHE</Tag>
			{/* V05: negaciones */}
			<Counter x={1060} y={245} value="NO" at={T.no1} out={T.no2} size={150} color={C.red} />
			<Counter x={1060} y={245} value="NO" at={T.no2} out={T.no3} size={190} color={C.red} />
			<Counter x={1060} y={245} value="NO" at={T.no3} out={T.prepararte} size={240} color={C.red} />
			<Tag x={1122} y={235} at={T.prepararte} out={T.el} color={C.red} size={52} rot={-3}>PREPARARTE ✗</Tag>
			{/* V06 */}
			<Tag x={1020} y={230} at={T.tecnicamente} out={T.eso} color={C.amber} size={52} rot={-2}>TÉCNICAMENTE…</Tag>
			<Stamp x={1330} y={310} at={T.cafe6} out={T.fallando} text="ES CAFÉ ✓" size={56} />

			<Tag x={960} y={520} at={T.exactamente} out={T.entendio} color={C.amber} size={76} rot={-3}>AL PIE DE LA LETRA</Tag>
			{/* V07: lectura literal de la orden */}
			{dim > 0 && <AbsoluteFill style={{background: `rgba(7,8,7,${dim})`, pointerEvents: 'none'}} />}
			{expl > 0 && f < T.cafe7 && (
				<div style={{opacity: 1 - chipOut}}>
					<Chip cx={780 + (560 - 780) * sp} cy={250 + 10 * Math.sin(f / 5)} label="PREPARA" scale={chipP} rot={-3 * sp} />
					<Chip cx={1246 + (1360 - 1246) * sp} cy={250 + 10 * Math.sin(f / 5 + 2)} label="CAFÉ" scale={chipP} rot={3 * sp} />
				</div>
			)}
			<In at={T.de} out={T.cafe7 - 4} x={120} y={400} w={780} from="down" exit="left">
				<Panel label="SE PREPARA ÉL">
					<Robot x={390} y={500} scale={8} pose="stretch" face="happy" time={f * 1.3} />
					<Counter x={660} y={150} value="✓" at={T.de + 8} size={150} />
				</Panel>
			</In>
			<In at={T.orden1} out={T.cafe7 - 4} x={1020} y={400} w={780} from="down" exit="right">
				<Panel label="UN CAFÉ">
					<Put x={390} y={490}><CoffeeBag scale={18} /></Put>
					<Counter x={660} y={150} value="✓" at={T.orden1 + 8} size={150} />
				</Panel>
			</In>
			{/* una taza humeante */}
			<In at={T.cafe7} out={T.no7 - 4} x={739} y={500} w={442} from="zoom" exit="zoom">
				<div style={{position: 'relative'}}>
					<Cup fill="latte" steam scale={34} />
				</div>
			</In>
			<Tag x={1500} y={640} at={T.verdad} out={T.no7 - 4} color={C.green} size={72} rot={4}>DE VERDAD</Tag>
			{/* la orden no basta */}
			<OrdenGrande at={T.basta} crackAt={T.orden2} x={960} y={420} />
			<Counter x={960} y={430} value="✗" at={T.orden2 + 4} out={T.necesito + 6} size={340} color={C.red} />
			<InstrCard
				x={360}
				y={270}
				w={1200}
				size={54}
				at={T.necesito}
				title="algoritmo.txt"
				lines={[{text: 'INICIO'}, {text: '██████████████', indent: 1}, {text: '█████████', indent: 1}, {text: '███████████', indent: 1}, {text: 'FIN'}]}
				shownAt={[T.necesito + 2, T.necesito + 8, T.necesito + 14, T.necesito + 20, T.necesito + 26]}
				cursor={[[T.darle, 1], [T.darle + 8, 2], [T.darle + 16, 3], [T.algoritmo - 2, 4]]}
			/>
			<GlitchBurst at={T.orden2} len={8} intensity={1.5} />
			<CutFlash at={T.orden2} len={4} max={0.5} color={C.red} />
			<Barrido at={T.algoritmo} dur={18} />
		</>
	);
};

/* ================================================================== bloque */

export const B1: React.FC = () => {
	const f = useCurrentFrame();
	return <AbsoluteFill>{f < T.algoritmo ? <Cocina /> : <Pizarra />}</AbsoluteFill>;
};

/* ================================================================== sonido */

export const sfxB1: Sfx[] = [
	// V01
	s(T.imagina, 'whoosh', 0.3),
	s(FALL0, 'rise', 0.22),
	s(T.robot, 'land', 0.45),
	s(T.robot + 1, 'hit', 0.3),
	s(T.hace, 'blip', 0.3),
	s(T.todo - 1, 'flash', 0.3),
	s(T.todo, 'hit', 0.3),
	// V02
	s(T.v02, 'whoosh', 0.25),
	s(T.hoy - 20, 'slide', 0.15),
	s(T.cafe2, 'land', 0.4),
	s(T.cafe2 + 8, 'land', 0.4),
	s(T.cafe2 + 2, 'pop', 0.25),
	// V03
	s(T.v03, 'pop', 0.3),
	s(T.v03 + 4, 'blip', 0.25),
	s(T.v03 + 14, 'wobble', 0.25),
	// V04
	s(T.v04, 'whoosh', 0.2),
	s(T.robot4, 'whoosh', 0.25),
	s(T.robot4 + 2, 'blip', 0.3),
	s(T.prepara, 'whoosh', 0.3),
	s(T.cafe4, 'hit', 0.35),
	s(G1.says, 'typing', 0.25, 20),
	s(G1.stretch, 'servo', 0.35),
	s(G1.squat + 9, 'boing', 0.4),
	s(G1.squat + 27, 'boing', 0.4),
	s(G1.stand, 'check', 0.3),
	// V05
	s(T.no1, 'hit', 0.25),
	s(T.no2, 'hit', 0.28),
	s(T.no3, 'hit', 0.32),
	s(T.prepararte, 'no', 0.3),
	s(T.el, 'whoosh', 0.22),
	s(T.cafe5, 'pop', 0.3),
	s(G2.reach, 'servo', 0.35),
	s(G2.grab, 'plop', 0.35),
	s(G2.grab + 3, 'rise', 0.25),
	s(G2.up, 'fanfare', 0.4),
	s(G2.up + 1, 'hit', 0.3),
	s(G2.up + 6, 'sparkle', 0.3),
	// V06
	s(T.v06, 'whoosh', 0.25),
	s(T.bueno, 'pop', 0.2),
	s(T.tecnicamente, 'pop', 0.25),
	s(T.eso - 1, 'flash', 0.25),
	s(T.eso, 'whoosh', 0.3),
	s(T.cafe6, 'check', 0.35),
	// V07
	s(T.v07, 'whoosh', 0.25),
	s(T.robot7 + 8, 'slide', 0.15),
	s(G3.down, 'servo', 0.3),
	s(G3.release, 'land', 0.4),
	s(T.hizo, 'whoosh', 0.3),
	s(T.hizo + 2, 'pop', 0.3),
	s(T.entendio, 'slash', 0.4),
	s(T.de, 'pop', 0.3),
	s(T.de + 8, 'ac', 0.3),
	s(T.orden1, 'pop', 0.3),
	s(T.orden1 + 8, 'ac', 0.3),
	s(T.cafe7, 'sparkle', 0.35),
	s(T.cafe7 + 2, 'pop', 0.3),
	s(T.verdad, 'pop', 0.3),
	s(T.no7 - 4, 'whoosh', 0.25),
	s(T.basta, 'pop', 0.3),
	s(T.orden2 - 12, 'riser', 0.25),
	s(T.orden2, 'glitch', 0.4),
	s(T.orden2, 'no', 0.35),
	s(T.orden2 + 2, 'debris', 0.25),
	s(T.necesito, 'typing', 0.3, 30),
	s(T.algoritmo - 10, 'whoosh', 0.4),
	s(T.algoritmo, 'flash', 0.3),
	s(TITULO, 'hit', 0.45),
	s(TITULO + 1, 'land', 0.3),
	s(TITULO + 14, 'sparkle', 0.25),
	s(TITULO + 22, 'typing', 0.2, 40),
	// N01
	s(T.quedate, 'whoosh', 0.3),
	s(T.quedate + 4, 'slide', 0.2),
	s(T.hasta, 'ticks', 0.25),
	s(T.final + 3, 'pop', 0.35),
	s(T.porque + 8, 'boing', 0.22),
	s(T.dejar, 'riser', 0.3),
	s(T.reto, 'hit', 0.45),
	s(T.reto + 2, 'fanfare', 0.3),
	s(T.reto + 34, 'sparkle', 0.25),
];
