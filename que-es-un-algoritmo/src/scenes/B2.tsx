import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inCubic, inOutCubic, outCubic, pop, rnd, tween} from '@commons/lib';
import {PixelBurst} from '@commons/pixel';
import {CutFlash, GlitchBurst, Shockwave} from '@commons/components';
import {Hit, In} from '@commons/vertical';
import {Barrido, Iris, Slam, SpeedLines} from '@commons/transiciones';
import {
	Board, Bubble, Cam, CoffeeJar, ConceptCard, Cup, FLOOR, Kettle, Kitchen, LIQ, MeasureJug, Pour, Puddle, Put, Question, Robot, ROBOT_X, SHELF_X1, SHELF_Y,
	SLOT, Spoon, Splash, TABLE_Y, Tag, VHS, Vee, VEE_X, lerpPt, robotRest,
} from '../kit';
import type {RobotFace, RobotPose, Shot} from '../kit';
import {at, end, after} from '../timeline';
import {Sfx, s} from '../sfx';

/**
 * BLOQUE 2 · «La definición»: V08–V16.
 * Pizarra (definición cinética y 4 conceptos) → cocina (pasos, secuencia, orden, fin) → pizarra (síntesis).
 * Todo se ancla a las marcas de la voz; no hay fotogramas sueltos (solo desfases cortos respecto a una marca).
 */

/* ================================================================== tiempos */

const T = {
	// V08
	v08: at('V08'),
	algoritmo8: at('V08', 'algoritmo'),
	secuencia8: at('V08', 'secuencia'),
	ordenada: at('V08', 'ordenada'),
	finita8: at('V08', 'finita'),
	de8: at('V08', 'de'),
	pasos8: at('V08', 'pasos'),
	resolver: at('V08', 'resolver'),
	problema: at('V08', 'problema'),
	realizar: at('V08', 'realizar'),
	tarea: at('V08', 'tarea'),
	// V09
	v09: at('V09'),
	suena: at('V09', 'suena'),
	formal: at('V09', 'formal'),
	vamos: at('V09', 'vamos'),
	partes: at('V09', 'partes'),
	// V10
	primero: at('V10'),
	pasos10: at('V10', 'pasos'),
	cada: at('V10', 'cada'),
	accion: at('V10', 'accion'),
	una1: at('V10', 'una', 1),
	tomar: at('V10', 'tomar'),
	verter: at('V10', 'verter'),
	revolver: at('V10', 'revolver'),
	// V11
	esos: at('V11'),
	forman: at('V11', 'forman'),
	secuencia11: at('V11', 'secuencia'),
	van: at('V11', 'van'),
	uno: at('V11', 'uno'),
	detras: at('V11', 'detras'),
	otro: at('V11', 'otro'),
	vagones: at('V11', 'vagones'),
	tren: at('V11', 'tren'),
	// V12
	v12: at('V12'),
	orden12: at('V12', 'orden'),
	importa: at('V12', 'importa'),
	muchisimo: at('V12', 'muchisimo'),
	mira: at('V12', 'mira'),
	robot12: at('V12', 'robot'),
	vierte: at('V12', 'vierte'),
	agua: at('V12', 'agua'),
	antes: at('V12', 'antes'),
	tener: at('V12', 'tener'),
	taza12: at('V12', 'taza'),
	// V13
	v13: at('V13'),
	end13: end('V13'),
	// V14
	v14: at('V14'),
	ultimo: at('V14', 'ultimo'),
	finita14: at('V14', 'finita'),
	terminar: at('V14', 'terminar'),
	si14: at('V14', 'si'),
	revuelve: at('V14', 'revuelve'),
	parar: at('V14', 'parar'),
	end14: end('V14'),
	// V15
	v15: at('V15'),
	ya1: at('V15', 'ya', 1),
	ya2: at('V15', 'ya', 2),
	para1: at('V15', 'para', 1),
	para2: at('V15', 'para', 2),
	end15: end('V15'),
	// V16
	v16: at('V16'),
	pasos16: at('V16', 'pasos'),
	secuencia16: at('V16', 'secuencia'),
	orden16: at('V16', 'orden'),
	final16: at('V16', 'final'),
	eso: at('V16', 'eso'),
	algoritmo16: at('V16', 'algoritmo'),
};

/** Cortes de escena: pizarra → cocina (barrido) y cocina → pizarra (iris). */
const K0 = T.primero + 2;
const P2 = T.v16 - 2;

/* ---------- V10: la receta, acción por acción ---------- */
const CUP0X = 1490; // la taza empieza lejos
const TGT = SLOT[0]; // y la deja aquí, cerca del robot
const JUGX = SLOT[1];
const SPX = 1375;
const CUP_Y = TABLE_Y - 55; // centro de la taza sobre la mesa
const JUG_Y = TABLE_Y - 66;
const SPS = 13; // escala de la cuchara
const SP_Y = TABLE_Y - 72;
const G = {
	cupGrab: T.tomar + 2,
	cupRel: T.tomar + 18,
	jugGrab: T.verter - 2,
	pourA: T.verter + 8,
	pourB: T.verter + 24,
	jugRel: T.verter + 31,
	spGrab: T.revolver + 11,
	stirA: T.revolver + 22,
	stirB: T.forman, // deja de revolver cuando Vee dice «forman»
};

/* ---------- V12: GAG del agua sin taza ---------- */
const KETX = 1085; // tetera en la mesa
const PUDX = SLOT[1]; // el puesto vacío
const SHELF_CX = 1440; // taza en la repisa
const PS = T.antes;
const RESET = T.v12;
const H12 = {
	grab: T.vierte - 2,
	up: T.vierte + 16,
	pourA: PS + 6,
	pourB: PS + 42,
	back: PS + 56,
	kRel: PS + 57,
	cGrab: PS + 67,
	cRel: PS + 88,
	done: PS + 99,
};

/* ---------- V13: rebobinado ---------- */
const R0 = T.end13;
const R1 = T.v14;

/* ---------- V14: GAG del revuelve infinito ---------- */
const CUP14X = PUDX;
const S14 = {
	grab: T.revuelve + 4,
	stirA: T.revuelve + 20,
	spin: T.parar + 6,
};
const SPOON14X = 1410;

/* ---------- V15 ---------- */
const SIT = T.end15 + 10;

/* ================================================================== trayectos del brazo del robot */

const REST = robotRest(ROBOT_X, FLOOR);
type Key = [number, [number, number]];
/** Interpola una lista de claves [fotograma, punto] con suavizado. Devuelve null fuera de su rango (brazo en reposo). */
const trayecto = (f: number, ks: Key[]): [number, number] | null => {
	if (f < ks[0][0] || f > ks[ks.length - 1][0]) return null;
	for (let i = 0; i < ks.length - 1; i++) {
		if (f <= ks[i + 1][0]) {
			const k = tween(f, ks[i][0], ks[i + 1][0], 0, 1, inOutCubic);
			return lerpPt(ks[i][1], ks[i + 1][1], k);
		}
	}
	return null;
};

const CUP0_C: [number, number] = [CUP0X, CUP_Y];
const TGT_C: [number, number] = [TGT, CUP_Y];
const JUG_C: [number, number] = [JUGX, JUG_Y];
const POUR_H: [number, number] = [1180, 500];
const SP_C: [number, number] = [SPX, SP_Y];
const STIR_C: [number, number] = [TGT - 5, 596];

const SEG_V10: Key[] = [
	[T.tomar - 8, REST],
	[G.cupGrab, CUP0_C],
	[G.cupGrab + 3, CUP0_C],
	[G.cupGrab + 9, [1300, 560]],
	[G.cupRel - 1, TGT_C],
	[G.cupRel + 1, TGT_C],
	[G.jugGrab, JUG_C],
	[G.jugGrab + 3, JUG_C],
	[G.pourA, POUR_H],
	[G.pourB, POUR_H],
	[G.jugRel - 1, JUG_C],
	[G.jugRel + 1, JUG_C],
	[G.spGrab, SP_C],
	[G.spGrab + 2, SP_C],
	[G.stirA, STIR_C],
];
const SEG_V10_FIN: Key[] = [[G.stirB, STIR_C], [G.stirB + 10, REST]];

const KET_C: [number, number] = [KETX, TABLE_Y - 66];
const KPOUR_H: [number, number] = [1208, 505];
const SHELF_C: [number, number] = [SHELF_CX, SHELF_Y - 55];
const PUD_C: [number, number] = [PUDX, CUP_Y];
const SEG_V12: Key[] = [
	[H12.grab - 8, REST],
	[H12.grab, KET_C],
	[H12.grab + 2, KET_C],
	[H12.up, KPOUR_H],
	[PS + 48, KPOUR_H],
	[H12.back, KET_C],
	[H12.kRel + 1, KET_C],
	[H12.cGrab - 1, SHELF_C],
	[H12.cGrab + 1, SHELF_C],
	[H12.cGrab + 11, [1340, 390]],
	[H12.cRel - 1, PUD_C],
	[H12.cRel + 1, PUD_C],
	[H12.done, REST],
];

const SP14_C: [number, number] = [SPOON14X, SP_Y];
const STIR14_C: [number, number] = [CUP14X - 5, 596];
const SEG_V14: Key[] = [
	[S14.grab - 8, REST],
	[S14.grab, SP14_C],
	[S14.grab + 2, SP14_C],
	[S14.stirA, STIR14_C],
];

/** Fase del revuelto (radianes): acelera con el tiempo. */
const fase = (p: number) => 2 * Math.PI * 1.33 * (Math.exp(0.03 * Math.min(p, 110)) - 1);
const mano = (f: number, f0: number, c: [number, number]): [number, number] => {
	const ph = fase(f - f0);
	return [c[0] + Math.sin(ph) * 34, c[1] + Math.cos(ph) * 7];
};
/** Contador del pecho en V14: lento al principio y luego desbocado. */
const cuenta = (p: number) => (p < 0 ? 0 : p <= 66 ? Math.floor(Math.exp(0.05 * p)) : Math.floor(27 * Math.exp(0.11 * (p - 66))));
const INF = S14.stirA + 92;

/** Posición de la punta del pico de la tetera (px de pantalla) dado el centro de la mano y la inclinación. */
const picoTetera = (h: [number, number], deg: number): [number, number] => {
	const t = (deg * Math.PI) / 180;
	const vx = 115.5;
	const vy = -29.2;
	return [h[0] - 33 + vx * Math.cos(t) - vy * Math.sin(t), h[1] + 13.2 + vx * Math.sin(t) + vy * Math.cos(t)];
};
/** Labio de la jarra medidora (esquina superior izquierda) con la inclinación dada. */
const labioJarra = (h: [number, number], deg: number): [number, number] => {
	const t = (deg * Math.PI) / 180;
	const vx = -49.5;
	const vy = -52.8;
	return [h[0] + vx * Math.cos(t) - vy * Math.sin(t), h[1] - 13.2 + vx * Math.sin(t) + vy * Math.cos(t)];
};

/* ================================================================== piezas locales */

/** Rótulo grande de impacto (se usa dentro de Slam). */
const Rotulo: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = C.white, size = 120}) => (
	<div style={{fontFamily: SANS, fontWeight: 860, fontSize: size, lineHeight: 1, letterSpacing: '-0.04em', color, whiteSpace: 'nowrap', textShadow: `0 8px 0 rgba(0,0,0,0.5), 0 0 44px ${color}55`}}>{children}</div>
);

/** Candado con «?»: `open` 0–1 levanta el arco. */
const Candado: React.FC<{open: number}> = ({open}) => (
	<div style={{position: 'relative', width: 190, height: 220}}>
		<div style={{position: 'absolute', left: 32, top: 20 - open * 26, width: 126, height: 110, border: '24px solid #D8DEDA', borderBottom: 'none', borderRadius: '63px 63px 0 0', transformOrigin: '0 100%', transform: `rotate(${-open * 30}deg)`, boxSizing: 'border-box'}} />
		<div style={{position: 'absolute', left: 0, top: 100, width: 190, height: 120, background: C.amber, boxShadow: 'inset 0 -14px 0 rgba(0,0,0,0.25), 0 12px 0 rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 92, color: C.bg}}>{open > 0.6 ? '✓' : '?'}</div>
	</div>
);

/** Taza con agua (la taza del kit no tiene relleno de agua): `level` 0–1. */
const TazaAgua: React.FC<{level: number}> = ({level}) => (
	<div style={{position: 'relative'}}>
		<Cup />
		{level > 0.01 && <div style={{position: 'absolute', left: 11, width: 88, bottom: 11, height: Math.round(level * 7) * 11, background: LIQ.water, boxShadow: 'inset 0 6px 0 #A9D3FF'}} />}
	</div>
);

/** Cuchara en la mano: el cuenco hacia abajo (para meterla en la taza). */
const CucharaMano: React.FC<{rot: number}> = ({rot}) => (
	<div style={{transform: `rotate(${rot}deg)`}}>
		<Spoon scale={SPS} />
	</div>
);

/** Marca de «sin taza» que parpadea sobre el puesto vacío no hace falta: se usa Tag. */

/** Estrellitas que giran alrededor de la cabeza del robot mareado. */
const Estrellas: React.FC<{x: number; y: number; at: number}> = ({x, y, at: a}) => {
	const f = useCurrentFrame();
	if (f < a) return null;
	return (
		<>
			{[0, 1, 2, 3].map((i) => {
				const ang = (f - a) * 0.22 + (i * Math.PI) / 2;
				const p = pop(f, a + i * 3, 9, 260, 0.5);
				return <div key={i} style={{position: 'absolute', left: x + Math.cos(ang) * 130, top: y + Math.sin(ang) * 34, transform: `translate(-50%, -50%) scale(${p})`, fontSize: 56, lineHeight: 1, color: C.amber, textShadow: `0 0 16px ${C.amber}`, fontFamily: MONO, fontWeight: 800}}>★</div>;
			})}
		</>
	);
};

/* ================================================================== índice de conceptos (fila de arriba) */

const CARDS: {icon: React.ReactNode; label: string}[] = [
	{icon: '👣', label: 'PASOS'},
	{icon: '🚃', label: 'SECUENCIA'},
	{icon: <span style={{fontSize: '0.72em'}}>1-2-3</span>, label: 'ORDEN'},
	{icon: '🏁', label: 'FIN'},
];
const IDX_L = [60, 238, 416, 594];
const IDX_Y = 90;
const idxC = (i: number): [number, number] => [IDX_L[i] + 78, IDX_Y + 66];
/** Dónde estaba la palabra de la que sale cada tarjeta (PASOS ← «DE PASOS», SECUENCIA, ORDEN ← «ORDENADA», FIN ← «FINITA»). */
const WORD_X = 1270;
const WORD_Y = [250, 400, 550, 700];
const FROM_PT: [number, number][] = [[WORD_X, WORD_Y[3]], [WORD_X, WORD_Y[0]], [WORD_X, WORD_Y[1]], [WORD_X, WORD_Y[2]]];
const LIT_AT = [T.pasos10, T.secuencia11, T.orden12, T.finita14];
const litIdx = (f: number) => (f < LIT_AT[0] ? -1 : f < LIT_AT[1] ? 0 : f < LIT_AT[2] ? 1 : f < LIT_AT[3] ? 2 : 3);

const Indice: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.partes || f >= P2 + 4) return null;
	const lit = litIdx(f);
	return (
		<>
			{CARDS.map((cd, i) => {
				const t0 = T.partes + i * 3;
				const k = tween(f, t0 + 5, t0 + 21, 0, 1, inOutCubic);
				const [fx, fy] = FROM_PT[i];
				const [sx, sy] = idxC(i);
				const cx = fx + (sx - fx) * k;
				const cy = fy + (sy - fy) * k - Math.sin(k * Math.PI) * 90;
				const p = pop(f, t0, 10, 260, 0.5);
				const bump = lit === i ? 1 + 0.22 * Math.max(0, 1 - (f - LIT_AT[i]) / 12) : 1;
				const sc = (1 - 0.4 * k) * p * bump;
				const on = k < 1 || lit === i;
				return (
					<div key={i} style={{position: 'absolute', left: cx, top: cy, transform: `translate(-50%, -50%) scale(${sc}) rotate(${(1 - k) * (i % 2 ? 8 : -8) * Math.sin(k * Math.PI)}deg)`, opacity: Math.min(1, p * 2)}}>
						<ConceptCard icon={cd.icon} label={cd.label} on={on} size={1} />
					</div>
				);
			})}
			{LIT_AT.map((a, i) => (f >= a && f < a + 4 ? <Hit key={i} at={a} x={idxC(i)[0]} y={idxC(i)[1]} /> : null))}
		</>
	);
};

/* ================================================================== PIZARRA 1 (V08–V09) */

const PALABRAS = [
	{txt: 'SECUENCIA', t: T.secuencia8, y: WORD_Y[0], color: C.white, rot: -4, from: 2.4},
	{txt: 'ORDENADA', t: T.ordenada, y: WORD_Y[1], color: C.white, rot: 3, from: 2.6},
	{txt: 'FINITA', t: T.finita8, y: WORD_Y[2], color: C.white, rot: -3, from: 2.8},
	{txt: 'DE PASOS', t: T.de8, y: WORD_Y[3], color: C.green, rot: 4, from: 3},
];
const LOCK_X = 1110;
const LOCK_Y = 860;

const Pizarra1: React.FC = () => {
	const f = useCurrentFrame();
	const trem = f >= T.suena && f < T.partes + 2 ? tween(f, T.suena, T.partes, 0.2, 1, inCubic) : 0;
	const jx = (i: number) => (rnd(f * 5 + i * 3) - 0.5) * 2 * 18 * trem;
	const jy = (i: number) => (rnd(f * 7 + i * 5 + 1) - 0.5) * 2 * 12 * trem;
	// grupo candado/taza: entra con «resolver» y sale al empezar V09
	const gout = tween(f, T.v09 + 2, T.v09 + 14, 0, 1, inCubic);
	const lockP = pop(f, T.resolver, 10, 260, 0.5);
	const open = tween(f, T.problema - 4, T.problema + 6, 0, 1, outCubic);
	const cupP = pop(f, T.realizar, 9, 280, 0.5);
	return (
		<>
			<Cam shots={[[T.v08, 1, 960, 540]]} shakeAt={[T.secuencia8, T.ordenada, T.finita8, T.de8, T.realizar]} shakeAmp={12}>
				<Board />
				<Tag x={WORD_X} y={122} at={T.v08 + 2} out={T.suena} color={C.green} size={84} rot={-2}>ALGORITMO =</Tag>
				{f < T.partes + 2 && PALABRAS.map((w, i) => (
					<Slam key={w.txt} at={w.t} x={WORD_X} y={w.y} from={w.from} rot={w.rot}>
						<div style={{transform: `translate(${jx(i)}px, ${jy(i)}px)`}}>
							<Rotulo size={w.txt === 'SECUENCIA' ? 150 : 150} color={w.color}>{w.txt}</Rotulo>
						</div>
					</Slam>
				))}
				{PALABRAS.map((w) => (f >= w.t && f < w.t + 4 ? <Hit key={w.txt} at={w.t} x={WORD_X} y={w.y} /> : null))}
				{/* candado → taza */}
				{f >= T.resolver && f < T.v09 + 16 && (
					<div style={{position: 'absolute', left: LOCK_X, top: LOCK_Y, transform: `translate(-50%, -50%) translateY(${gout * 360}px)`, opacity: 1 - gout}}>
						{f < T.realizar && (
							<div style={{transform: `scale(${lockP}) rotate(${Math.sin((f - T.resolver) / 3) * (1 - open) * 4}deg)`}}>
								<Candado open={open} />
							</div>
						)}
						{f >= T.realizar && (
							<div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -62%) scale(${cupP})`}}>
								<Cup fill="latte" steam scale={14} />
							</div>
						)}
					</div>
				)}
				<Tag x={1480} y={LOCK_Y - 10} at={T.problema} out={T.realizar} color={C.amber} size={50} rot={-3}>PROBLEMA</Tag>
				<Tag x={1480} y={LOCK_Y - 10} at={T.tarea} out={T.suena} color={C.green} size={50} rot={3}>TAREA</Tag>
				<Hit at={T.realizar} x={LOCK_X} y={LOCK_Y} />
				<PixelBurst f={f} at={T.realizar} x={LOCK_X} y={LOCK_Y} count={18} power={14} colors={[C.amber, '#FFFFFF', C.green]} seed={9} />
				{/* ¿formal? */}
				<Question x={1815} y={330} at={T.formal} out={T.partes} size={230} />
				<SpeedLines at={T.partes} len={9} mode="radial" x={WORD_X} y={480} count={20} />
				{(['SECUENCIA', 'ORDENADA', 'FINITA', 'DE PASOS'] as const).map((_, i) => (
					<PixelBurst key={i} f={f} at={T.partes} x={WORD_X} y={WORD_Y[i]} count={16} power={16} colors={[C.green, '#FFFFFF']} seed={i + 3} />
				))}
				<Vee
					x={240}
					y={965}
					scale={13}
					acts={[[T.v08, 'explicar'], [T.secuencia8 + 6, 'senalar'], [T.resolver, 'explicar'], [T.suena, 'pensar'], [T.vamos, 'senalar']]}
					hops={[T.ordenada, T.finita8, T.partes]}
				/>
			</Cam>
			<CutFlash at={T.partes} len={4} max={0.55} />
		</>
	);
};

/* ================================================================== COCINA (V10–V15) */

const FICHAS = [
	{t: '1 · Tomar', l: 520, w: 270, at: T.tomar},
	{t: '2 · Verter', l: 834, w: 292, at: T.verter},
	{t: '3 · Revolver', l: 1170, w: 340, at: T.revolver},
];
const FY = 268;
const FH = 76;
const TRAIN_X = 1556;
const trenOffset = (f: number) => tween(f, T.tren - 2, T.tren + 30, 0, 1750, inCubic);

const Locomotora: React.FC<{f: number}> = ({f}) => (
	<div style={{position: 'absolute', left: TRAIN_X, top: FY - 50, width: 270, height: 110}}>
		{/* eslabón con la última ficha */}
		<div style={{position: 'absolute', left: -48, top: 40, width: 56, height: 14, background: C.white}} />
		{/* cabina */}
		<div style={{position: 'absolute', left: 0, top: 0, width: 104, height: 92, background: '#A8302A', border: '4px solid #0B0F0D', boxSizing: 'border-box'}}>
			<div style={{position: 'absolute', left: 22, top: 14, width: 48, height: 34, background: '#7FD0FF', border: '4px solid #0B0F0D', boxSizing: 'border-box'}} />
		</div>
		{/* caldera */}
		<div style={{position: 'absolute', left: 100, top: 30, width: 170, height: 62, background: '#E2463E', border: '4px solid #0B0F0D', borderRadius: '0 22px 22px 0', boxSizing: 'border-box'}}>
			<div style={{position: 'absolute', right: 12, top: 14, width: 18, height: 18, background: C.amber, boxShadow: `0 0 16px ${C.amber}`}} />
		</div>
		{/* chimenea */}
		<div style={{position: 'absolute', left: 196, top: 0, width: 38, height: 36, background: '#1A1F1C', border: '4px solid #0B0F0D', boxSizing: 'border-box'}} />
		{/* humo */}
		{[0, 1, 2, 3, 4].map((i) => {
			const k = ((f + i * 6) % 30) / 30;
			return <div key={i} style={{position: 'absolute', left: 205 - k * 130, top: -10 - k * 90, width: 24 + k * 30, height: 24 + k * 30, background: '#FFFFFF', opacity: 0.8 * (1 - k)}} />;
		})}
		{/* ruedas */}
		{[34, 120, 206].map((x, i) => (
			<div key={i} style={{position: 'absolute', left: x, top: 72, width: 44, height: 44, borderRadius: '50%', background: '#1A1F1C', border: '5px solid #B9C3BE', boxSizing: 'border-box'}}>
				<div style={{position: 'absolute', left: 17, top: 4, width: 4, height: 28, background: '#B9C3BE', transform: `rotate(${trenOffset(f) * 1.6}deg)`}} />
			</div>
		))}
	</div>
);

/** Fila de fichas de pasos (V10) que se enganchan, ganan ruedas y salen como un tren (V11). Pantalla, fuera de la cámara. */
const FilaFichas: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.tomar - 2 || f >= T.v12 + 8) return null;
	const off = trenOffset(f);
	const bounce = (t: number) => (f >= t && f < t + 12 ? Math.sin(((f - t) / 12) * Math.PI) * 22 : 0);
	const bt = [T.uno, T.detras, T.otro];
	const locoP = pop(f, T.tren - 6, 10, 260, 0.6);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 400, transform: `translateX(${off}px)`}}>
			{FICHAS.map((fc, i) => (
				<React.Fragment key={fc.t}>
					<In at={fc.at} x={fc.l} y={FY - FH / 2 - bounce(bt[i])} w={fc.w} from="up" exit="right">
						<div style={{height: FH, boxSizing: 'border-box', background: 'rgba(8,12,10,0.96)', border: `4px solid ${C.green}`, boxShadow: `0 0 28px ${C.green}44, 0 12px 0 rgba(0,0,0,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.white, whiteSpace: 'nowrap'}}>
							<span style={{color: C.green}}>{fc.t.slice(0, 1)}</span>
							<span style={{color: C.dim, margin: '0 10px'}}>·</span>
							<span>{fc.t.slice(4)}</span>
						</div>
					</In>
					{/* ruedas */}
					{[0.2, 0.72].map((r, j) => {
						const p = pop(f, T.vagones + i * 4 + j * 2, 10, 260, 0.5);
						return f >= T.vagones + i * 4 + j * 2 ? (
							<div key={j} style={{position: 'absolute', left: fc.l + fc.w * r, top: FY + FH / 2 - 14 - bounce(bt[i]), width: 38, height: 38, borderRadius: '50%', background: '#1A1F1C', border: '5px solid #B9C3BE', boxSizing: 'border-box', transform: `scale(${p})`}}>
								<div style={{position: 'absolute', left: 14, top: 3, width: 4, height: 22, background: '#B9C3BE', transform: `rotate(${off * 1.6 + f * 3}deg)`}} />
							</div>
						) : null;
					})}
					{/* eslabón con la siguiente */}
					{i < FICHAS.length - 1 && f >= T.secuencia11 + i * 5 && (
						<div style={{position: 'absolute', left: fc.l + fc.w - 6, top: FY - 14, width: 56, height: 28, transform: `scale(${pop(f, T.secuencia11 + i * 5, 9, 300, 0.5)})`}}>
							<div style={{position: 'absolute', left: 0, top: 0, width: 34, height: 28, border: `6px solid ${C.white}`, borderRadius: 14, boxSizing: 'border-box'}} />
							<div style={{position: 'absolute', left: 22, top: 0, width: 34, height: 28, border: `6px solid ${C.green}`, borderRadius: 14, boxSizing: 'border-box'}} />
						</div>
					)}
				</React.Fragment>
			))}
			{/* eslabón con la locomotora */}
			{f >= T.tren - 6 && (
				<div style={{transform: `scale(${locoP})`, transformOrigin: '0 50%'}}>
					<Locomotora f={f} />
				</div>
			)}
		</div>
	);
};

/** Dos fichas grandes de V12 que se intercambian. */
const FichasOrden: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.orden12 || f >= T.v14 + 14) return null;
	const sw = tween(f, T.mira, T.mira + 16, 0, 1, inOutCubic);
	const back = tween(f, R0, R1, 0, 1, inOutCubic); // al rebobinar vuelven a su sitio
	const k = sw * (1 - back);
	const out = tween(f, T.v14 + 4, T.v14 + 14, 0, 1, inCubic);
	const col = k > 0.5 ? C.amber : C.green;
	const throb = f >= T.muchisimo && f < T.muchisimo + 14 ? 1 + 0.1 * Math.sin(((f - T.muchisimo) / 14) * Math.PI) : 1;
	const chip = (txt: string, y0: number, y1: number, atF: number, sign: number) => {
		const y = y0 + (y1 - y0) * k;
		return (
			<In at={atF} x={770} y={y} w={500} from="right" exit="up" impact>
				<div style={{height: 92, boxSizing: 'border-box', background: 'rgba(8,12,10,0.96)', border: `5px solid ${col}`, boxShadow: `0 0 34px ${col}55, 0 12px 0 rgba(0,0,0,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.white, whiteSpace: 'nowrap', transform: `rotateX(${k * 360 * sign}deg) scale(${throb})`}}>{txt}</div>
			</In>
		);
	};
	return (
		<div style={{opacity: 1 - out, transform: `translateY(${-out * 160}px)`}}>
			{chip('1. Tomar la taza', 100, 212, T.orden12, 1)}
			{chip('2. Verter el agua', 212, 100, T.importa, -1)}
		</div>
	);
};

type EstadoRobot = {pose: RobotPose; face: RobotFace; chest?: string; cc?: string; look?: [number, number]; tilt?: number};
const estadoRobot = (f: number): EstadoRobot => {
	const spinT = f - S14.spin;
	if (f < T.accion) return {pose: 'idle', face: 'happy', chest: '…', look: [1, 0]};
	if (f < T.tomar) return {pose: 'idle', face: 'focus', chest: '…', look: [1, 0]};
	if (f < T.verter) return {pose: 'hold', face: 'focus', chest: '1', look: [1, 0]};
	if (f < T.revolver) return {pose: 'hold', face: 'focus', chest: '2', look: [1, 0]};
	if (f < G.stirB + 4) return {pose: 'stir', face: 'focus', chest: '3', look: [1, 0]};
	if (f < T.tren - 4) return {pose: 'present', face: 'proud', chest: '✓', look: [0, 0]};
	if (f < RESET + 6) return {pose: 'wave', face: 'happy', chest: '✓', look: [0, 0]};
	// V12
	if (f < T.robot12) return {pose: 'idle', face: 'happy', chest: '…', look: [1, 0]};
	if (f < H12.grab - 8) return {pose: 'idle', face: 'focus', chest: '…', look: [1, 0]};
	if (f < PS + 12) return {pose: 'hold', face: 'focus', chest: '2', cc: C.amber, look: [1, 0]};
	if (f < H12.cRel) return {pose: 'hold', face: 'focus', chest: '…', look: [1, 0]};
	if (f < R0) return {pose: 'hold', face: 'proud', chest: '✓', look: [1, 0]};
	if (f < R1) return {pose: 'idle', face: 'happy', chest: '◀◀', cc: C.blue, look: [1, 0]};
	// V14
	if (f < S14.grab - 6) return {pose: 'idle', face: 'happy', chest: '…', look: [1, 0]};
	if (f < S14.spin) {
		const n = cuenta(f - S14.stirA);
		return {pose: 'stir', face: n > 60 ? 'nerv' : 'focus', chest: f < S14.stirA ? '▶' : String(Math.max(1, n)), cc: n > 60 ? C.red : n > 12 ? C.amber : C.green, look: [1, 0]};
	}
	if (f < T.ya1) return {pose: 'spin', face: 'dizzy', chest: f >= INF ? '∞' : String(cuenta(f - S14.stirA)), cc: C.red, tilt: 0, look: [0, 0]};
	// V15
	if (f < T.para2 + 6) return {pose: 'idle', face: 'nerv', chest: '!', cc: C.red, tilt: 5 * Math.sin((f - T.ya1) / 2) * Math.max(0, 1 - (f - T.ya1) / 24), look: [-1, 0]};
	if (f < SIT) return {pose: 'dizzy', face: 'dizzy', chest: '?', cc: C.amber, tilt: Math.sin((f - T.para2) / 3.5) * (6 + (f - T.para2) * 0.3), look: [0, 0]};
	return {pose: 'sit', face: 'dizzy', chest: '✗', cc: C.red, tilt: 0, look: [0, 0]};
};

const SHOTS: Shot[] = [
	[K0, 1.0, 960, 540],
	[T.accion, 1.3, 900, 650],
	[T.tomar - 14, 1.35, 900, 640],
	[T.esos, 1.2, 960, 650],
	[T.secuencia11, 1.0, 960, 540],
	[T.vagones, 1.3, 960, 660],
	[T.tren, 1.0, 960, 540],
	// V12
	[RESET, 1.0, 960, 540],
	[T.mira, 1.3, 860, 640],
	[T.vierte - 4, 1.35, 900, 640],
	[PS - 6, 1.3, 880, 650],
	[PS + 58, 1.0, 960, 560],
	// V13: primer plano de Vee
	[T.v13, 2.2, 436, 640],
	// rebobinado
	[R0, 1.15, 1000, 620],
	[T.v14, 1.2, 900, 640],
	[T.finita14, 1.0, 960, 560],
	[at('V14', 'algoritmo'), 1.3, 700, 650],
	[T.terminar - 6, 1.6, 520, 620],
	[T.si14, 1.15, 900, 640],
	[S14.grab - 8, 1.35, 900, 650],
	[S14.spin, 1.2, 880, 640],
	[T.ya1, 1.3, 700, 650],
	[T.para2, 1.45, 800, 680],
	[SIT - 6, 1.7, 880, 720],
];
const SHAKES = [G.cupRel, G.jugRel, T.forman, T.tren, RESET, PS + 10, PS + 50, H12.cRel, S14.spin, S14.spin + 12, S14.spin + 24, T.ya1, T.ya2, T.para1, T.para2, SIT];

const Cocina: React.FC = () => {
	const f = useCurrentFrame();
	const st = estadoRobot(f);

	/* ---------- mano y objeto en mano ---------- */
	let hand: [number, number] | null = trayecto(f, SEG_V10) ?? trayecto(f, SEG_V10_FIN) ?? trayecto(f, SEG_V12) ?? trayecto(f, SEG_V14);
	let held: React.ReactNode = null;
	const waterC = tween(f, G.pourA, G.pourB, 0, 0.85);
	const tipJ = -68 * tween(f, T.verter + 4, T.verter + 11) + 68 * tween(f, G.pourB, G.pourB + 5);
	const tipK = 55 * tween(f, PS, PS + 8) - 55 * tween(f, PS + 42, PS + 50);
	if (f >= G.stirA && f < G.stirB) {
		hand = mano(f, G.stirA, STIR_C);
		held = <CucharaMano rot={180 + Math.sin(fase(f - G.stirA)) * 16} />;
	} else if (f >= G.spGrab && f < G.stirA) {
		held = <CucharaMano rot={180 * tween(f, G.spGrab + 2, G.stirA)} />;
	} else if (f >= G.jugGrab && f < G.jugRel) {
		held = <MeasureJug level={1 - 0.5 * tween(f, G.pourA, G.pourB)} liquid="water" tip={tipJ} />;
	} else if (f >= G.cupGrab && f < G.cupRel) {
		held = <Cup />;
	} else if (f >= H12.grab && f < H12.kRel) {
		held = <Kettle tip={tipK} />;
	} else if (f >= H12.cGrab && f < H12.cRel) {
		held = <Cup />;
	} else if (f >= S14.stirA && f < S14.spin) {
		hand = mano(f, S14.stirA, STIR14_C);
		held = <CucharaMano rot={180 + Math.sin(fase(f - S14.stirA)) * 16} />;
	} else if (f >= S14.grab && f < S14.stirA) {
		held = <CucharaMano rot={180 * tween(f, S14.grab + 2, S14.stirA)} />;
	}
	if (f >= S14.spin && f < SIT) hand = null;

	/* ---------- vertidos ---------- */
	const lip = labioJarra(POUR_H, tipJ);
	const jugHand = trayecto(f, SEG_V10) ?? POUR_H;
	const lipNow = labioJarra(jugHand, tipJ);
	const cupWaterTop = TABLE_Y - 110 + 99 - waterC * 77;
	const pico = picoTetera(KPOUR_H, tipK);
	void lip;

	/* ---------- estado del mundo ---------- */
	const spoonFlight = f >= S14.spin && f < S14.spin + 40 ? f - S14.spin : -1;
	const puddle = tween(f, PS + 10, PS + 52) * (1 - tween(f, R0, R1));
	const stirring14 = f >= S14.stirA && f < S14.spin;
	const cnt = cuenta(f - S14.stirA);
	const spinAng = Math.sin((f - S14.spin) / 3) * 6 * tween(f, S14.spin, S14.spin + 10) * (f < T.ya1 ? 1 : 0);

	return (
		<>
			<div style={{position: 'absolute', inset: 0, transform: `rotate(${spinAng}deg) scale(${f >= S14.spin && f < T.ya1 + 4 ? 1.08 : 1})`, transformOrigin: '50% 55%'}}>
				<Cam shots={SHOTS} shakeAt={SHAKES} shakeAmp={13}>
					<Kitchen jar={false} />
					<Put x={SHELF_X1 - 70} y={SHELF_Y}><CoffeeJar scale={9} /></Put>

					{/* ---- objetos de V10–V11 ---- */}
					{f < RESET && (
						<>
							{f < G.cupGrab && <Put x={CUP0X} y={TABLE_Y}><Cup /></Put>}
							{f >= G.cupRel && <Put x={TGT} y={TABLE_Y}><TazaAgua level={f < G.pourA ? 0 : waterC} /></Put>}
							{(f < G.jugGrab || f >= G.jugRel) && <Put x={JUGX} y={TABLE_Y} at={f < G.jugGrab ? K0 + 4 : undefined}><MeasureJug level={1 - 0.5 * tween(f, G.pourA, G.pourB)} liquid="water" /></Put>}
							{f < G.spGrab && <Put x={SPX} y={TABLE_Y} at={K0 + 8}><Spoon scale={SPS} /></Put>}
							{f >= G.stirB && (
								<div style={{position: 'absolute', left: TGT - 4, top: TABLE_Y - 14, transform: 'translate(-50%, -100%) rotate(10deg)', transformOrigin: '50% 100%'}}>
									<CucharaMano rot={180} />
								</div>
							)}
						</>
					)}
					{f < RESET && (
						<>
							<Pour x={lipNow[0] - 4} y0={lipNow[1] + 4} y1={cupWaterTop} color={LIQ.water} w={14} on={f >= G.pourA && f < G.pourB} />
							<Splash x={TGT - 10} y={cupWaterTop} at={G.pourA + 2} n={8} power={9} />
						</>
					)}

					{/* ---- objetos de V12 en adelante ---- */}
					{f >= RESET && (
						<>
							{f < H12.cGrab && <Put x={SHELF_CX} y={SHELF_Y} at={RESET + 4}><Cup /></Put>}
							{(f < H12.grab || f >= H12.kRel) && <Put x={KETX} y={TABLE_Y} at={f < H12.grab ? RESET + 2 : undefined}><Kettle /></Put>}
							<Puddle size={puddle} x={PUDX} y={TABLE_Y} color={LIQ.water} w={470} />
							{f >= H12.cRel && <Put x={PUDX} y={TABLE_Y} at={H12.cRel}><Cup /></Put>}
							{f >= R1 + 2 && f < S14.grab && <Put x={SPOON14X} y={TABLE_Y} at={R1 + 2}><Spoon scale={SPS} /></Put>}
							{f >= S14.spin && f < S14.spin + 1 + 0 && null}
							{spoonFlight >= 0 && (
								<div style={{position: 'absolute', left: CUP14X - 5 + spoonFlight * 16, top: 596 - spoonFlight * 34 + spoonFlight * spoonFlight * 1.5, transform: `translate(-50%, -50%) rotate(${180 + spoonFlight * 40}deg)`}}>
									<Spoon scale={SPS} />
								</div>
							)}
							<Pour x={pico[0] - 6} y0={pico[1] - 4} y1={TABLE_Y} color={LIQ.water} w={16} on={f >= H12.pourA && f < H12.pourB} />
							<Splash x={PUDX} y={TABLE_Y} at={H12.pourA + 5} n={16} power={20} />
							<Splash x={PUDX} y={TABLE_Y} at={H12.cRel} n={10} power={14} />
						</>
					)}

					{/* ---- robot ---- */}
					<Robot
						x={ROBOT_X}
						y={FLOOR}
						pose={st.pose}
						face={st.face}
						chest={st.chest}
						chestColor={st.cc ?? C.green}
						look={st.look}
						tilt={st.tilt ?? 0}
						spin={f >= S14.spin && f < T.ya1 ? 0.34 : 0}
						reachF={hand}
						holdF={held}
						hops={[G.stirB + 6, T.tren, H12.cRel + 4, T.ya1]}
					/>
					{/* ---- Vee ---- */}
					<Vee
						x={VEE_X}
						acts={[
							[T.primero + 8, 'explicar'],
							[T.accion, 'senalar'],
							[T.tomar + 20, 'explicar'],
							[T.esos, 'explicar'],
							[T.secuencia11, 'senalar'],
							[T.vagones, 'explicar'],
							[T.v12, 'explicar'],
							[T.mira, 'senalar'],
							[PS + 16, 'sorpresa'],
							[T.v14, 'explicar'],
							[T.finita14, 'senalar'],
							[T.si14, 'explicar'],
							[S14.stirA, 'pensar'],
							[S14.spin + 4, 'sorpresa'],
							[T.ya1, 'sorpresa', 1.2],
						]}
						hops={[T.ya1 + 4, T.ya2, T.para1, T.para2, S14.spin + 18]}
					/>

					{/* ---- marcas dentro de la cámara ---- */}
					<Tag x={1430} y={590} at={T.tener} out={H12.cRel} color={C.red} size={44} rot={-4}>¡SIN TAZA!</Tag>
					<Bubble x={330} y={520} at={T.revuelve} out={T.revuelve + 24} size={50}>REVUELVE</Bubble>
					{f >= S14.stirA && f < SIT && (
						<div style={{position: 'absolute', left: 1500, top: 470, transform: 'translate(-50%, -50%)', fontFamily: MONO, fontWeight: 800, fontSize: Math.min(220, 100 + Math.max(0, f - S14.stirA) * 1.3), color: f >= INF ? C.red : cnt > 40 ? C.red : cnt > 10 ? C.amber : C.green, textShadow: '0 6px 0 rgba(0,0,0,0.5)', opacity: f >= S14.spin + 30 ? 0 : 1}}>
							{f >= INF ? '∞' : cnt}
						</div>
					)}
					<Estrellas x={ROBOT_X} y={FLOOR - 36 * 11 + 70} at={SIT + 2} />

					{/* ---- impactos en el mundo ---- */}
					<Hit at={G.cupRel} x={TGT} y={TABLE_Y - 60} />
					<Hit at={T.revolver} x={STIR_C[0]} y={560} />
					<Hit at={RESET} x={1250} y={640} big />
					<Hit at={H12.pourA + 5} x={PUDX} y={TABLE_Y - 20} big />
					<Hit at={H12.cRel} x={PUDX} y={TABLE_Y - 60} />
					<Hit at={T.ya1} x={ROBOT_X} y={620} big />
					<Hit at={SIT} x={ROBOT_X} y={FLOOR - 40} />
					<SpeedLines at={H12.pourA + 5} len={8} mode="radial" x={PUDX} y={TABLE_Y} count={16} color="#A9D3FF" />
					<SpeedLines at={S14.spin} len={14} mode="radial" x={ROBOT_X} y={640} count={24} color={C.red} />
					<SpeedLines at={S14.spin + 14} len={12} mode="h" count={18} />
					<SpeedLines at={S14.spin + 28} len={12} mode="radial" x={ROBOT_X} y={640} count={20} color={C.amber} />
					<SpeedLines at={T.ya1} len={8} mode="radial" x={ROBOT_X} y={640} count={18} />
					<SpeedLines at={T.tren} len={14} mode="h" count={18} />
				</Cam>
			</div>

			{/* ---------- capa de pantalla (no se recorta) ---------- */}
			{/* V10: rótulos arriba a la derecha */}
			<Slam at={K0 + 10} out={T.pasos10 - 8} x={1320} y={165} from={2.4} rot={-4}><Rotulo size={118}>PRIMERO</Rotulo></Slam>
			<Slam at={T.pasos10} out={T.accion - 8} x={1320} y={165} from={2.6} rot={3}><Rotulo size={132} color={C.green}>PASOS</Rotulo></Slam>
			<Tag x={1320} y={165} at={T.accion} out={T.una1} color={C.green} size={64} rot={-3}>UNA ACCIÓN</Tag>
			<Tag x={1320} y={165} at={T.una1} out={T.tomar + 20} color={C.amber} size={64} rot={3}>UNA POR UNA</Tag>
			{/* V11 */}
			<Slam at={T.secuencia11} out={T.van - 8} x={1320} y={165} from={2.6} rot={-3}><Rotulo size={118} color={C.green}>SECUENCIA</Rotulo></Slam>
			<Tag x={1320} y={165} at={T.van} out={T.vagones} color={C.amber} size={60} rot={2}>UNO DETRÁS DE OTRO</Tag>
			<Tag x={1320} y={165} at={T.vagones} out={T.tren + 14} color={C.green} size={64} rot={-2}>VAGONES</Tag>
			<FilaFichas />
			<Hit at={T.secuencia11} x={900} y={FY} />
			<Hit at={T.vagones} x={900} y={FY + 30} />
			<Hit at={T.tren} x={1700} y={FY} big />
			<FichasOrden />
			{/* V14 */}
			<Slam at={T.finita14} out={T.si14} x={1320} y={165} from={2.6} rot={-3}><Rotulo size={132} color={C.green}>FINITA</Rotulo></Slam>
			<Slam at={T.terminar} out={T.si14} x={1740} y={160} from={2.6} rot={5}><div style={{fontSize: 130, lineHeight: 1}}>🏁</div></Slam>
			<Tag x={1320} y={290} at={T.terminar} out={T.si14} color={C.green} size={56} rot={2}>TIENE QUE TERMINAR</Tag>
			<Tag x={1320} y={165} at={INF} out={T.para1} color={C.red} size={80} rot={-3}>¡NO PARA!</Tag>
			<Tag x={1320} y={165} at={T.para1} out={SIT} color={C.red} size={110} rot={4}>¡STOP!</Tag>
			{/* cortes y transiciones de impacto */}
			<CutFlash at={RESET} len={5} max={0.7} />
			<CutFlash at={H12.pourA + 5} len={3} max={0.35} color="#A9D3FF" />
			<GlitchBurst at={R0} len={8} intensity={1.2} />
			<VHS on={f >= R0 && f < R1 + 2} label="◀◀" />
			<GlitchBurst at={S14.spin} len={8} intensity={1.4} />
			<CutFlash at={S14.spin} len={4} max={0.5} color={C.red} />
			<Shockwave at={T.ya1} x={960} y={600} size={1400} thick={24} dur={26} color={C.red} />
			<CutFlash at={T.ya1} len={4} max={0.6} />
		</>
	);
};

/* ================================================================== PIZARRA 2 (V16) */

const CARD_X = [291, 737, 1183, 1629];
const CARD_Y = 360;
const CARD_SZ = 1.5;
const CHECK = ['pasos', 'secuencia', 'orden', 'fin'];

const Pizarra2: React.FC = () => {
	const f = useCurrentFrame();
	const lits = [T.pasos16, T.secuencia16, T.orden16, T.final16];
	const conv = tween(f, T.eso, T.algoritmo16 - 1, 0, 1, inCubic);
	const algoP = pop(f, T.algoritmo16, 11, 300, 0.5);
	const robotP = f >= T.algoritmo16;
	return (
		<>
			<Cam shots={[[P2, 1, 960, 540]]} shakeAt={[T.pasos16, T.secuencia16, T.orden16, T.final16, T.algoritmo16 + 1]} shakeAmp={13}>
				<Board />
				{/* las cuatro tarjetas grandes */}
				{f < T.algoritmo16 && CARD_X.map((cx, i) => {
					const p = pop(f, P2 + 4 + i * 3, 11, 240, 0.6);
					const on = f >= lits[i];
					const bump = on ? 1 + 0.2 * Math.max(0, 1 - (f - lits[i]) / 12) : 1;
					const x = cx + (960 - cx) * conv;
					const y = CARD_Y + (400 - CARD_Y) * conv;
					return (
						<div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${p * bump * (1 - 0.15 * conv)})`, opacity: Math.min(1, p * 2) * (1 - 0.3 * conv)}}>
							<ConceptCard icon={CARDS[i].icon} label={CARDS[i].label} on={on} size={CARD_SZ} />
						</div>
					);
				})}
				{f < T.eso && [0, 1, 2].map((i) => (f >= lits[i + 1] - 2 || f >= lits[i] + 10 ? (
					<div key={i} style={{position: 'absolute', left: (CARD_X[i] + CARD_X[i + 1]) / 2, top: CARD_Y, transform: `translate(-50%, -50%) scale(${pop(f, lits[i] + 8, 9, 300, 0.5)})`, fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.green}}>+</div>
				) : null))}
				{/* lista de verificación */}
				{f < T.eso && lits.map((a, i) => (f >= a ? (
					<div key={i} style={{position: 'absolute', left: 640, top: 640 + i * 76, transform: `scale(${pop(f, a, 10, 260, 0.5)})`, transformOrigin: '0 50%', fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.white, whiteSpace: 'nowrap'}}>
						<span style={{color: C.green}}>✓ </span>{CHECK[i]}
					</div>
				) : null))}
				{lits.map((a, i) => (f >= a && f < a + 4 ? <Hit key={i} at={a} x={CARD_X[i]} y={CARD_Y} /> : null))}
				{/* ficha ALGORITMO */}
				<Slam at={T.algoritmo16} x={960} y={400} from={3.2} rot={-3}>
					<div style={{padding: '24px 80px', background: 'rgba(0,192,99,0.16)', border: `10px solid ${C.green}`, boxShadow: `0 0 80px ${C.green}77, 0 22px 0 rgba(0,0,0,0.45)`, fontFamily: SANS, fontWeight: 860, fontSize: 200, lineHeight: 1, letterSpacing: '-0.045em', color: C.white, whiteSpace: 'nowrap', transform: `scale(${0.85 + 0.15 * algoP})`}}>
						ALGORITMO<span style={{color: C.green}}>✓</span>
					</div>
				</Slam>
				{f >= T.algoritmo16 && (
					<div style={{position: 'absolute', left: 960, top: 640, transform: `translate(-50%, -50%) scale(${pop(f, T.algoritmo16 + 8, 10, 260, 0.5)})`, fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.dim, whiteSpace: 'nowrap', letterSpacing: '0.05em'}}>
						PASOS · SECUENCIA · ORDEN · FIN
					</div>
				)}
				<Hit at={T.algoritmo16} x={960} y={400} big />
				<Shockwave at={T.algoritmo16} x={960} y={400} size={1700} thick={30} dur={34} />
				<Shockwave at={T.algoritmo16 + 6} x={960} y={400} size={1100} thick={16} dur={28} color={C.white} />
				<PixelBurst f={f} at={T.algoritmo16} x={620} y={400} count={26} power={20} colors={[C.green, '#FFFFFF', C.amber]} seed={21} />
				<PixelBurst f={f} at={T.algoritmo16} x={1300} y={400} count={26} power={20} colors={[C.green, '#FFFFFF', C.amber]} seed={33} />
				<PixelBurst f={f} at={T.algoritmo16 + 10} x={960} y={300} count={22} power={18} colors={[C.green, '#FFFFFF']} seed={45} />
				<SpeedLines at={T.eso} len={14} mode="radial" x={960} y={400} count={22} color={C.green} />
				{robotP && <Robot x={1670} y={965} pose="trophy" face="proud" flip chest="✓" at={T.algoritmo16 + 2} hops={[T.algoritmo16 + 14, T.algoritmo16 + 36]} />}
				<Vee x={250} y={965} acts={[[T.v16, 'explicar'], [T.eso, 'celebrar']]} hops={[T.pasos16, T.secuencia16, T.orden16, T.final16, T.algoritmo16 + 8, T.algoritmo16 + 30]} />
			</Cam>
			<CutFlash at={T.eso + 14} len={3} max={0.45} />
			<CutFlash at={T.algoritmo16} len={5} max={0.8} />
		</>
	);
};

/* ================================================================== bloque */

export const B2: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			{f < K0 ? <Pizarra1 /> : f < P2 ? <Cocina /> : <Pizarra2 />}
			<Barrido at={K0} dur={18} />
			<Iris at={P2} x={960} y={620} dur={22} />
			<Indice />
		</AbsoluteFill>
	);
};

/* ================================================================== sonido */

export const sfxB2: Sfx[] = [
	// V08
	s(T.algoritmo8, 'pop', 0.25),
	s(T.secuencia8, 'hit', 0.4),
	s(T.ordenada, 'hit', 0.4),
	s(T.finita8, 'hit', 0.4),
	s(T.de8, 'hit', 0.45),
	s(T.resolver, 'pop', 0.3),
	s(T.problema, 'servo', 0.25),
	s(T.realizar, 'sparkle', 0.35),
	s(T.realizar + 1, 'hit', 0.3),
	s(T.tarea, 'pop', 0.25),
	// V09
	s(T.suena, 'wobble', 0.25),
	s(T.formal, 'blip', 0.3),
	s(T.partes - 6, 'riser', 0.25),
	s(T.partes, 'flash', 0.35),
	s(T.partes + 2, 'debris', 0.3),
	s(T.partes + 6, 'whoosh', 0.35),
	// V10
	s(K0, 'whoosh', 0.4),
	s(K0 + 10, 'hit', 0.35),
	s(T.pasos10, 'hit', 0.4),
	s(T.pasos10 + 2, 'ac', 0.3),
	s(T.accion, 'pop', 0.3),
	s(T.una1, 'pop', 0.3),
	s(T.tomar - 6, 'servo', 0.3),
	s(T.tomar, 'pop', 0.3),
	s(G.cupGrab, 'plop', 0.3),
	s(G.cupRel, 'land', 0.4),
	s(T.verter, 'pop', 0.3),
	s(G.jugGrab, 'plop', 0.25),
	s(G.pourA, 'pour', 0.4, 28),
	s(G.jugRel, 'land', 0.3),
	s(T.revolver, 'pop', 0.3),
	s(G.spGrab, 'plop', 0.25),
	s(G.stirA, 'stir', 0.35),
	s(G.stirA + 18, 'stir', 0.3),
	s(G.stirB, 'check', 0.3),
	// V11
	s(T.esos, 'whoosh', 0.2),
	s(T.secuencia11, 'hit', 0.4),
	s(T.secuencia11, 'stack', 0.3),
	s(T.secuencia11 + 5, 'stack', 0.25),
	s(T.secuencia11 + 10, 'stack', 0.25),
	s(T.van, 'pop', 0.3),
	s(T.uno, 'blip', 0.3),
	s(T.detras, 'blip', 0.3),
	s(T.otro, 'blip', 0.3),
	s(T.vagones, 'pop', 0.35),
	s(T.vagones + 4, 'pop', 0.3),
	s(T.vagones + 8, 'pop', 0.3),
	s(T.tren - 6, 'whistle', 0.35),
	s(T.tren, 'hit', 0.4),
	s(T.tren, 'riser', 0.35),
	s(T.tren + 6, 'whoosh', 0.4),
	// V12
	s(RESET - 2, 'flash', 0.3),
	s(RESET, 'hit', 0.4),
	s(T.orden12, 'pop', 0.35),
	s(T.orden12 + 2, 'ac', 0.25),
	s(T.importa, 'pop', 0.3),
	s(T.muchisimo, 'hit', 0.3),
	s(T.mira, 'whoosh', 0.35),
	s(T.mira + 4, 'slide', 0.25),
	s(T.mira + 14, 'no', 0.25),
	s(H12.grab, 'servo', 0.3),
	s(H12.grab + 3, 'plop', 0.25),
	s(T.tener, 'pop', 0.3),
	s(H12.pourA, 'pour', 0.45, 36),
	s(H12.pourA + 5, 'splash', 0.45),
	s(H12.pourA + 5, 'hit', 0.35),
	s(H12.kRel, 'land', 0.3),
	s(H12.cGrab, 'servo', 0.3),
	s(H12.cGrab + 2, 'plop', 0.25),
	s(H12.cRel, 'land', 0.4),
	s(H12.cRel + 1, 'splash', 0.25),
	s(H12.cRel + 4, 'check', 0.4),
	// V13
	s(T.v13 - 1, 'whoosh', 0.3),
	s(R0, 'rewind', 0.45),
	s(R0, 'glitch', 0.3),
	s(R1 - 2, 'flash', 0.3),
	// V14
	s(T.finita14, 'hit', 0.4),
	s(T.finita14 + 2, 'ac', 0.3),
	s(T.terminar, 'pop', 0.3),
	s(T.revuelve, 'pop', 0.35),
	s(T.revuelve + 4, 'whoosh', 0.3),
	s(S14.grab, 'plop', 0.25),
	s(S14.stirA, 'stir', 0.35),
	s(S14.stirA + 16, 'stir', 0.35),
	s(S14.stirA + 32, 'stir', 0.35),
	s(S14.stirA + 48, 'ticks', 0.3),
	s(S14.stirA + 60, 'rise', 0.3),
	s(S14.spin - 4, 'riser', 0.35),
	s(S14.spin, 'glitch', 0.4),
	s(S14.spin, 'hit', 0.4),
	s(S14.spin + 2, 'wobble', 0.4),
	s(S14.spin + 14, 'whoosh', 0.3),
	s(S14.spin + 28, 'wobble', 0.35),
	s(INF, 'no', 0.35),
	// V15
	s(T.ya1, 'hit', 0.5),
	s(T.ya1, 'flash', 0.3),
	s(T.ya1 + 1, 'servo', 0.25),
	s(T.ya2, 'pop', 0.3),
	s(T.para1, 'hit', 0.35),
	s(T.para2, 'hit', 0.4),
	s(T.para2 + 8, 'wobble', 0.35),
	s(SIT, 'plop', 0.4),
	s(SIT + 1, 'boing', 0.35),
	s(SIT + 4, 'sparkle', 0.3),
	s(P2 - 8, 'whoosh', 0.4),
	// V16
	s(T.pasos16, 'hit', 0.35),
	s(T.pasos16 + 2, 'ac', 0.3),
	s(T.secuencia16, 'hit', 0.35),
	s(T.secuencia16 + 2, 'ac', 0.3),
	s(T.orden16, 'hit', 0.35),
	s(T.orden16 + 2, 'ac', 0.3),
	s(T.final16, 'hit', 0.35),
	s(T.final16 + 2, 'ac', 0.3),
	s(T.eso - 2, 'riser', 0.4),
	s(T.eso + 4, 'whoosh', 0.3),
	s(T.algoritmo16 - 1, 'flash', 0.35),
	s(T.algoritmo16, 'hit', 0.5),
	s(T.algoritmo16 + 1, 'land', 0.35),
	s(T.algoritmo16 + 2, 'fanfare', 0.4),
	s(T.algoritmo16 + 8, 'sparkle', 0.3),
];
void end;
void after;
void outCubic;
