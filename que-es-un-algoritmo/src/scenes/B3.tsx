import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO} from '@commons/theme';
import {inOutCubic, pop, tween} from '@commons/lib';
import {Buf, PixelSprite} from '@commons/pixel';
import {Cup, Falling, FLOOR, Kitchen, Pour, Robot, Tag, Vee, punch} from '../kit';
import type {RobotFace, RobotPose, VeeAct} from '../kit';
import {t} from '../timeline';
import {Sfx, s} from '../sfx';

/*
 * Bloque 3 · Algoritmos en la vida cotidiana (1:35–2:15).
 * Carrusel de viñetas en un mundo con cámara propia: cada viñeta es un marco de 1040×600 en
 * x = 1100·k (k = 0 receta, 1 suma, 2 mapa, 3 máquina, 4 café). Vee queda fija a la izquierda, en pantalla.
 */

const INK = '#0B0F0D';
const PAPER = '#F4F7F5';
const PW = 1040;
const PH = 600;
const STEP = 1100;
/** Centro de pantalla donde cae la viñeta activa (deja sitio a Vee a la izquierda). */
const CX0 = 1180;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lin = (f: number, ks: [number, number][]) =>
	interpolate(f, ks.map((k) => k[0]), ks.map((k) => k[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/* ================================================================== cámara del mundo */

/** [fotograma, zoom, cx, cy]: cx, cy = punto del mundo que queda en el centro de la pantalla (y = 540). */
const CAM: [number, number, number, number][] = [
	[t('1:35'), 1, 520, 300],
	[t('1:37'), 0.32, 2170, 300], // pull-back: se ven los marcos vacíos
	[t('1:39'), 0.32, 2170, 300],
	[t('1:40.2'), 1, 520, 300], // slide + zoom al marco 1
	[t('1:44.8'), 1, 520, 300],
	[t('1:46'), 1, 1620, 300], // slide al marco 2
	[t('1:51'), 1, 1620, 300],
	[t('1:52.2'), 1, 2720, 300], // slide al marco 3
	[t('1:55.8'), 1, 2720, 300],
	[t('1:57'), 1, 3820, 300], // slide al marco 4
	[t('2:02'), 1.08, 3820, 330], // zoom lento a los botones
	[t('2:03.9'), 1.04, 3820, 320],
	[t('2:07.5'), 0.32, 2170, 300], // pull-back: los 4 marcos en fila
	[t('2:08'), 0.32, 2170, 300],
	[t('2:11.8'), 1, 4920, 300], // zoom rápido al marco del café
	[t('2:15'), 1, 4920, 300],
];

const camAt = (f: number) => {
	let z = CAM[0][1];
	let cx = CAM[0][2];
	let cy = CAM[0][3];
	for (let i = 0; i < CAM.length - 1; i++) {
		const [a, za, xa, ya] = CAM[i];
		const [b, zb, xb, yb] = CAM[i + 1];
		if (f >= a) {
			const k = tween(f, a, b, 0, 1, inOutCubic);
			z = za + (zb - za) * k;
			cx = xa + (xb - xa) * k;
			cy = ya + (yb - ya) * k;
		}
	}
	return {z, cx, cy};
};

/* ================================================================== Vee (presentadora) */

const VEE_ACTS: [number, VeeAct][] = [
	[t('1:35'), 'senalar'],
	[t('1:37'), 'explicar'],
	[t('1:39.5'), 'senalar'],
	[t('1:41.5'), 'explicar'],
	[t('1:43.5'), 'celebrar'],
	[t('1:45.2'), 'pensar'],
	[t('1:47'), 'explicar'],
	[t('1:49.5'), 'sorpresa'],
	[t('1:50.8'), 'celebrar'],
	[t('1:51.5'), 'senalar'],
	[t('1:53'), 'explicar'],
	[t('1:55.6'), 'celebrar'],
	[t('1:56.3'), 'senalar'],
	[t('1:58.2'), 'explicar'],
	[t('2:00'), 'pensar'],
	[t('2:02.5'), 'celebrar'],
	[t('2:04.2'), 'explicar'],
	[t('2:08.2'), 'senalar'],
];
const actNow = (f: number) => {
	let cur: [number, VeeAct] | undefined;
	for (const e of VEE_ACTS) if (f >= e[0]) cur = e;
	return cur;
};

/* ================================================================== piezas comunes */

/** Muestra su contenido desde `at` (con fundido). Sus hijos usan coordenadas del marco. */
const Show: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	return <div style={{position: 'absolute', inset: 0, opacity: tween(f, at, at + 8)}}>{children}</div>;
};

/** Marco tipo cómic de 1040×600. Coordenadas locales dentro del marco. */
const Vineta: React.FC<{k: number; n: string; label: string; at: number; children?: React.ReactNode}> = ({k, n, label, at, children}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const c = camAt(f);
	// las viñetas vecinas se atenúan cuando la cámara está cerca del marco (no durante el pull-back)
	const dist = Math.min(1, Math.abs(c.cx - (STEP * k + PW / 2)) / STEP);
	const dim = 1 - 0.7 * dist * clamp01((c.z - 0.5) / 0.5);
	const p = pop(f, at, 14, 200, 0.6);
	return (
		<div
			style={{
				position: 'absolute',
				left: STEP * k,
				top: 0,
				width: PW,
				height: PH,
				boxSizing: 'border-box',
				background: '#0E110F',
				border: `6px solid ${C.white}`,
				boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
				transform: `scale(${0.92 + 0.08 * p})`,
				transformOrigin: '50% 50%',
				opacity: Math.min(1, p * 2) * dim,
			}}
		>
			<div style={{position: 'absolute', left: 22, top: 16, fontFamily: MONO, fontWeight: 800, fontSize: 24, color: C.green}}>
				{n} · {label}
			</div>
			{children}
		</div>
	);
};

/** Cifra o signo en una celda de cuaderno (90 px de ancho). */
const Digit: React.FC<{x: number; y: number; ch: string; at: number; color?: string; size?: number; h?: number; hide?: [number, number]}> = ({x, y, ch, at, color = INK, size = 96, h = 120, hide}) => {
	const f = useCurrentFrame();
	if (f < at || (hide && f >= hide[0] && f < hide[1])) return null;
	const p = pop(f, at, 12, 240, 0.5);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: 90, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: size, lineHeight: 1, color, transform: `scale(${0.4 + 0.6 * p})`}}>
			{ch}
		</div>
	);
};

/** Lista de comprobación: cada línea se marca con ✓ en su fotograma. */
const Checklist: React.FC<{x: number; y: number; gap?: number; size?: number; ink?: string; off?: string; items: {label: string; at: number}[]}> = ({x, y, gap = 70, size = 34, ink = C.white, off = C.dim, items}) => {
	const f = useCurrentFrame();
	const box = size * 1.2;
	return (
		<>
			{items.map((it, i) => {
				const on = f >= it.at;
				const p = on ? pop(f, it.at, 12, 260, 0.5) : 0;
				return (
					<div key={i} style={{position: 'absolute', left: x, top: y + i * gap, display: 'flex', alignItems: 'center', gap: size * 0.45, fontFamily: MONO, fontWeight: 800, fontSize: size, color: on ? ink : off, whiteSpace: 'nowrap'}}>
						<div style={{width: box, height: box, boxSizing: 'border-box', border: `3px solid ${on ? C.green : off}`, background: on ? C.green : 'transparent', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: box * 0.8, lineHeight: 1, flexShrink: 0, transform: `scale(${on ? 0.8 + 0.2 * p : 1})`}}>
							{on ? '✓' : ''}
						</div>
						<span>{it.label}</span>
					</div>
				);
			})}
		</>
	);
};

/** Línea de cálculo que aparece con fundido. */
const Eq: React.FC<{x: number; y: number; at: number; text: string}> = ({x, y, at, text}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	return <div style={{position: 'absolute', left: x, top: y, fontFamily: MONO, fontWeight: 800, fontSize: 38, color: C.blue, whiteSpace: 'nowrap', opacity: tween(f, at, at + 8)}}>{text}</div>;
};

/** Bandera de «final» (🏁) que se enciende en cascada al cerrar cada algoritmo. */
const Finish: React.FC<{at: number}> = ({at}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 10, 260, 0.5);
	return (
		<div style={{position: 'absolute', left: 960, top: 56, transform: `translate(-50%, -50%) scale(${p})`, fontSize: 100, lineHeight: 1}}>🏁</div>
	);
};

/** Paquete (caja de snack con cinta). 40×36 px. */
const Pkg: React.FC = () => (
	<div style={{position: 'relative', width: 40, height: 36, boxSizing: 'border-box', background: '#B07A4F', border: '3px solid #8A5434'}}>
		<div style={{position: 'absolute', left: 14, top: 0, width: 8, height: '100%', background: '#F2C230'}} />
	</div>
);

/* ================================================================== pixel art de los objetos */

const bowlBuf = () => {
	const b = new Buf(18, 10);
	for (let y = 0; y < 8; y++) {
		const inset = y === 0 ? 0 : Math.min(y + 1, 6);
		b.rect(inset, y, 18 - 2 * inset, 1, y === 0 ? '#A9C6F5' : '#3E73D8');
		b.rect(16 - inset, y, 2, 1, y === 0 ? '#A9C6F5' : '#2B4F96');
	}
	b.rect(5, 8, 8, 1, '#2B4F96');
	b.rect(4, 9, 10, 1, '#2B4F96');
	return b;
};
const BOWL = bowlBuf();

const cakeBuf = () => {
	const b = new Buf(14, 8);
	b.set(6, 0, '#E2463E');
	b.set(7, 0, '#E2463E');
	b.rect(0, 1, 14, 2, PAPER);
	b.rect(0, 3, 14, 4, '#B07A4F');
	b.rect(11, 3, 3, 4, '#8A5434');
	b.rect(0, 7, 14, 1, '#5B4030');
	b.rect(2, 3, 1, 2, PAPER);
	b.rect(8, 3, 1, 1, PAPER);
	return b;
};
const CAKE = cakeBuf();

const walkerBuf = () => {
	const b = new Buf(5, 9);
	b.rect(1, 0, 3, 1, C.green);
	b.rect(1, 1, 3, 2, '#F4C7A1');
	b.rect(1, 3, 3, 3, PAPER);
	b.rect(0, 3, 1, 2, '#F4C7A1');
	b.rect(4, 3, 1, 2, '#F4C7A1');
	b.rect(1, 6, 1, 3, '#5AA9FF');
	b.rect(3, 6, 1, 3, '#5AA9FF');
	return b;
};
const WALKER = walkerBuf();

/* ================================================================== viñeta 1 · receta */

const Recipe: React.FC = () => {
	const f = useCurrentFrame();
	const eggY = lin(f, [[t('1:41.0'), 40], [t('1:41.5'), 330]]);
	const tortaX = lin(f, [[t('1:43.0'), 900], [t('1:43.5'), 840], [t('1:44.1'), 740], [t('1:44.6'), 740]]);
	const tortaY = lin(f, [[t('1:43.0'), 330], [t('1:43.3'), 170], [t('1:44.1'), 358], [t('1:44.35'), 318], [t('1:44.6'), 358]]);
	const ovenOn = f >= t('1:42.8');
	return (
		<Vineta k={0} n="1" label="RECETA" at={t('1:37')}>
			<Tag x={960} y={56} at={t('1:39')} out={t('2:04')} color={C.white} size={34}>📖</Tag>
			<Show at={t('1:39')}>
				{/* mesada */}
				<div style={{position: 'absolute', left: 0, right: 0, top: 430, bottom: 0, background: '#8A6446', boxShadow: 'inset 0 10px 0 #A87D5B'}} />
				{/* libro abierto */}
				<div style={{position: 'absolute', left: 30, top: 150, width: 240, height: 270, background: '#EEF3F0'}} />
				<div style={{position: 'absolute', left: 270, top: 150, width: 240, height: 270, background: PAPER}} />
				<div style={{position: 'absolute', left: 266, top: 150, width: 8, height: 270, background: '#5B4030'}} />
				<div style={{position: 'absolute', left: 56, top: 174, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: INK}}>TORTA</div>
				{['· 2 huevos', '· harina', '· leche'].map((x, i) => (
					<div key={i} style={{position: 'absolute', left: 56, top: 240 + i * 36, fontFamily: MONO, fontWeight: 800, fontSize: 22, color: '#55605A'}}>{x}</div>
				))}
				<Checklist
					x={300}
					y={180}
					gap={80}
					size={22}
					ink={INK}
					off="#7A857F"
					items={[
						{label: 'ingredientes', at: t('1:41.8')},
						{label: 'pasos', at: t('1:42.6')},
						{label: 'servir', at: t('1:44.2')},
					]}
				/>
				{/* tazón */}
				<div style={{position: 'absolute', left: 540, top: 330}}>
					<PixelSprite buf={BOWL} scale={10} />
				</div>
				<div style={{position: 'absolute', left: 552, top: 336, width: 156, height: 12, borderRadius: '50%', background: '#F2E6C9', opacity: tween(f, t('1:42.8'), t('1:43.0'))}} />
				{/* huevo, harina y leche al tazón */}
				{f >= t('1:41.0') && f < t('1:41.5') && (
					<div style={{position: 'absolute', left: 603, top: eggY, width: 34, height: 42, borderRadius: '50%', background: PAPER}}>
						<div style={{position: 'absolute', left: 10, top: 14, width: 14, height: 14, borderRadius: '50%', background: '#F2C230'}} />
					</div>
				)}
				<Falling x={620} y0={60} y1={330} at={t('1:41.5')} dur={24} color="#F2E6C9" n={18} spread={90} />
				<Pour x={620} y0={170} y1={330} color={PAPER} w={14} on={f >= t('1:42') && f < t('1:42.8')} />
				{/* horno */}
				<div style={{position: 'absolute', left: 880, top: 250, width: 150, height: 180, boxSizing: 'border-box', background: '#39423E', border: '6px solid #2A3530'}} />
				<div style={{position: 'absolute', left: 900, top: 290, width: 26, height: 10, background: '#B9C3BE'}} />
				<div style={{position: 'absolute', left: 896, top: 330, width: 118, height: 80, boxSizing: 'border-box', background: ovenOn ? '#E89A4A' : INK, border: '4px solid #5B4030'}} />
				{/* torta: sale del horno, rebota y humea */}
				{f >= t('1:43') && (
					<div style={{position: 'absolute', left: tortaX, top: tortaY}}>
						<PixelSprite buf={CAKE} scale={9} />
					</div>
				)}
				{f >= t('1:44') &&
					[0, 1, 2].map((i) => {
						const k = (((f - t('1:44') + i * 12) % 40) / 40);
						return <div key={i} style={{position: 'absolute', left: 790 + i * 18, top: 340 - k * 70, width: 10, height: 10, background: PAPER, opacity: 0.6 * (1 - k)}} />;
					})}
			</Show>
		</Vineta>
	);
};

/* ================================================================== viñeta 2 · suma 47 + 38 */

const Suma: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Vineta k={1} n="2" label="SUMA" at={t('1:37.25')}>
			<Tag x={880} y={60} at={t('1:45')} out={t('2:04')} color={C.white} size={30}>47 + 38</Tag>
			<Tag x={880} y={520} at={t('1:51.3')} out={t('2:04')} color={C.green} size={36}>85 ✓</Tag>
			<Show at={t('1:45')}>
				{/* cuaderno cuadriculado */}
				<div style={{position: 'absolute', left: 260, top: 40, width: 400, height: 520, background: '#EEF3F0', backgroundImage: 'repeating-linear-gradient(0deg, rgba(90,169,255,0.28) 0 2px, transparent 2px 36px)', boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}} />
				{/* resaltado de columnas */}
				<div style={{position: 'absolute', left: 480, top: 30, width: 90, height: 500, background: 'rgba(90,169,255,0.25)', opacity: tween(f, t('1:47'), t('1:47.3'))}} />
				<div style={{position: 'absolute', left: 390, top: 30, width: 90, height: 500, background: 'rgba(90,169,255,0.25)', opacity: tween(f, t('1:48.8'), t('1:49.1'))}} />
				<Digit x={390} y={110} ch="4" at={t('1:45')} />
				<Digit x={480} y={110} ch="7" at={t('1:45.3')} />
				<Digit x={300} y={240} ch="+" at={t('1:45.8')} />
				<Digit x={390} y={240} ch="3" at={t('1:46')} />
				<Digit x={480} y={240} ch="8" at={t('1:46.2')} />
				<div style={{position: 'absolute', left: 300, top: 372, width: 270, height: 6, background: INK, transformOrigin: 'left', transform: `scaleX(${tween(f, t('1:46.5'), t('1:46.9'))})`}} />
				{/* llevada: el 1 espera arriba de la columna de decenas (salta y lo atrapa Vee, ver token) */}
				<Digit x={390} y={34} ch="1" size={56} h={70} color={C.green} at={t('1:48.2')} hide={[t('1:49.4'), t('1:50.8')]} />
				<Digit x={480} y={390} ch="5" at={t('1:48')} />
				<Digit x={390} y={390} ch="8" at={t('1:51')} />
				<Eq x={700} y={120} at={t('1:47.4')} text="7 + 8 = 15" />
				<Eq x={700} y={200} at={t('1:49.2')} text="4 + 3 + 1 = 8" />
				<Checklist
					x={700}
					y={300}
					gap={70}
					size={34}
					items={[
						{label: 'unidades', at: t('1:48.2')},
						{label: 'decenas', at: t('1:49.3')},
						{label: 'llevar', at: t('1:50.8')},
					]}
				/>
			</Show>
		</Vineta>
	);
};

/* ================================================================== viñeta 3 · mapa */

const XS = [110, 310, 510, 710];
const YS = [120, 300, 480];
/** Caminata: tramo recto (1:53 → 1:54.4) y giro a la izquierda (1:54.6 → 1:55.5). */
const WALK = [t('1:53'), t('1:54.4'), t('1:54.6'), t('1:55.5')];
const FOOT: [number, number, number][] = [];
for (let i = 1; i <= 11; i++) {
	const x = 110 + (i * 400) / 12;
	FOOT.push([x, 480, WALK[0] + ((WALK[1] - WALK[0]) * (x - 110)) / 400]);
}
for (let i = 1; i <= 5; i++) {
	const y = 480 - (i * 180) / 6;
	FOOT.push([510, y, WALK[2] + ((WALK[3] - WALK[2]) * (480 - y)) / 180]);
}

const Mapa: React.FC = () => {
	const f = useCurrentFrame();
	const wx = f < WALK[1] ? lin(f, [[WALK[0], 110], [WALK[1], 510]]) : 510;
	const wy = f < WALK[2] ? 480 : lin(f, [[WALK[2], 480], [WALK[3], 300]]);
	return (
		<Vineta k={2} n="3" label="MAPA" at={t('1:37.5')}>
			<Tag x={880} y={520} at={t('1:51.2')} out={t('2:04')} color={C.white} size={36}>🏁</Tag>
			<Show at={t('1:51')}>
				<div style={{position: 'absolute', left: 40, top: 40, width: 740, height: 520, background: '#2B3833'}} />
				{[0, 1].map((j) =>
					[0, 1, 2].map((i) => (
						<div key={`b${i}${j}`} style={{position: 'absolute', left: XS[i] + 16, top: YS[j] + 16, width: XS[i + 1] - XS[i] - 32, height: YS[j + 1] - YS[j] - 32, background: i === 1 && j === 0 ? '#1E4D33' : '#17211D'}} />
					)),
				)}
				{/* huellas punteadas: aparecen cuando el muñequito pasa */}
				{FOOT.map(([x, y, fr], i) => (
					<div key={i} style={{position: 'absolute', left: x - 4, top: y - 4, width: 8, height: 8, background: '#5AA9FF', opacity: f >= fr ? 0.9 : 0}} />
				))}
				<div style={{position: 'absolute', left: 102, top: 472, width: 16, height: 16, borderRadius: '50%', background: C.green}} />
				<div style={{position: 'absolute', left: 60, top: 500, fontFamily: MONO, fontWeight: 800, fontSize: 20, color: C.green}}>INICIO</div>
				{/* bandera */}
				<div style={{position: 'absolute', left: 508, top: 220, width: 4, height: 80, background: PAPER}} />
				<div style={{position: 'absolute', left: 512, top: lin(f, [[t('1:55.6'), 292], [t('1:56.4'), 226]]), width: 56, height: 34, background: '#E2463E', opacity: tween(f, t('1:55.6'), t('1:55.8'))}} />
				{/* muñequito */}
				<div style={{position: 'absolute', left: wx - 12.5, top: wy - 45}}>
					<PixelSprite buf={WALKER} scale={5} />
				</div>
				<Checklist
					x={800}
					y={200}
					gap={70}
					size={30}
					items={[
						{label: '2 cuadras', at: t('1:54.3')},
						{label: 'izquierda', at: t('1:55.1')},
						{label: 'llegaste', at: t('1:55.8')},
					]}
				/>
			</Show>
		</Vineta>
	);
};

/* ================================================================== viñeta 4 · máquina expendedora */

/** Celdas de la ventana: columnas A–C, filas 1–2. B2 es el paquete. */
const SLOTS: {id: string; c: number; r: number; color: string}[] = [
	{id: 'A1', c: 0, r: 0, color: '#E2463E'},
	{id: 'B1', c: 1, r: 0, color: '#F2C230'},
	{id: 'C1', c: 2, r: 0, color: '#5AA9FF'},
	{id: 'A2', c: 0, r: 1, color: '#B26BFF'},
	{id: 'B2', c: 1, r: 1, color: ''},
	{id: 'C2', c: 2, r: 1, color: '#00C063'},
];
const COLS = [344, 452, 560];
const ROWS = [190, 294];
const PKG_CX = 496; // columna B: centro del paquete en el marco
const PKG_TOP = 324; // su posición al caer desde B2
const PKG_HAND = 564; // centro de las manos del robot (en el marco)
/** Robot que sube desde abajo y recoge el paquete (coordenadas del mundo). */
const RB_X = 3300 + PKG_CX - 44;
const RB_FEET = 600;

const Maquina: React.FC = () => {
	const f = useCurrentFrame();
	const scr = f < t('2:00') ? '#1B2420' : f < t('2:02') ? (Math.floor(f / 5) % 2 ? '#FFB547' : '#B57A2A') : C.green;
	const txt = f < t('2:00') ? 'LISTO' : f < t('2:02') ? '¿?' : '✓';
	const txtCol = f < t('2:00') ? C.dim : INK;
	const fallA = t('2:02.3');
	const fallB = t('2:02.9');
	const fu = clamp01((f - fallA) / (fallB - fallA));
	const keys = ['A1', 'B1', 'C1', 'A2', 'B2', 'C2'];
	return (
		<Vineta k={3} n="4" label="MÁQUINA" at={t('1:37.75')}>
			<Show at={t('1:56')}>
				{/* cuerpo */}
				<div style={{position: 'absolute', left: 300, top: 20, width: 380, height: 575, background: '#3E73D8', boxShadow: 'inset -14px 0 0 #2B4F96'}} />
				<div style={{position: 'absolute', left: 322, top: 30, fontFamily: MONO, fontWeight: 800, fontSize: 24, color: PAPER}}>SNACKS</div>
				{/* pantalla: ámbar «¿?» que pasa a verde */}
				<div style={{position: 'absolute', left: 330, top: 70, width: 320, height: 90, background: scr, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${punch(f, t('2:02'))})`}}>
					<span style={{fontFamily: MONO, fontWeight: 800, fontSize: 64, color: txtCol}}>{txt}</span>
				</div>
				{/* ventana con productos */}
				<div style={{position: 'absolute', left: 330, top: 180, width: 320, height: 230, boxSizing: 'border-box', background: '#0B1A2A', border: '3px solid #1B2A3A'}} />
				{SLOTS.map((sl) => {
					const x = COLS[sl.c];
					const y = ROWS[sl.r];
					const isPkg = sl.id === 'B2';
					return (
						<React.Fragment key={sl.id}>
							<div style={{position: 'absolute', left: x + 6, top: y + 2, fontFamily: MONO, fontWeight: 800, fontSize: 16, color: C.dim}}>{sl.id}</div>
							{isPkg ? (
								f < fallA && (
									<div style={{position: 'absolute', left: x + 14, top: y + 26}}>
										<Pkg />
									</div>
								)
							) : (
								<div style={{position: 'absolute', left: x + 18, top: y + 26, width: 52, height: 56, background: sl.color}} />
							)}
						</React.Fragment>
					);
				})}
				{/* teclado */}
				{keys.map((id, i) => {
					const on = id === 'B2' && f >= t('1:58.2');
					return (
						<div key={id} style={{position: 'absolute', left: 344 + i * 46, top: on ? 440 : 436, width: 40, height: 40, boxSizing: 'border-box', background: on ? C.green : '#1B2420', border: `2px solid ${on ? C.green : C.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 15, color: on ? INK : C.text}}>
							{id}
						</div>
					);
				})}
				{/* moneda que entra por la ranura */}
				<div style={{position: 'absolute', left: 655, top: 500, width: 18, height: 8, background: INK}} />
				{f >= t('1:58.8') && f < t('1:59.2') && (
					<div style={{position: 'absolute', left: 653, top: lin(f, [[t('1:58.8'), 432], [t('1:59.2'), 496]]), width: 22, height: 22, borderRadius: '50%', background: '#F2C230', border: '3px solid #B57A2A', boxSizing: 'border-box'}} />
				)}
				{/* bandeja */}
				<div style={{position: 'absolute', left: 400, top: 520, width: 180, height: 40, boxSizing: 'border-box', background: INK, borderTop: '4px solid #2B4F96'}} />
				{/* el paquete cae; a partir de 2:02.9 lo lleva el robot */}
				{f >= fallA && f < fallB && (
					<div style={{position: 'absolute', left: PKG_CX - 20, top: PKG_TOP + (PKG_HAND - 36 - PKG_TOP) * fu * fu}}>
						<Pkg />
					</div>
				)}
			</Show>
			<Checklist
				x={720}
				y={180}
				gap={70}
				size={34}
				items={[
					{label: 'elegir', at: t('1:58.2')},
					{label: 'pagar', at: t('1:59')},
					{label: '¿alcanza?', at: t('2:02')},
					{label: 'entrega', at: t('2:03.2')},
				]}
			/>
		</Vineta>
	);
};

/* ================================================================== viñeta 5 · café */

const Cafe: React.FC = () => (
	<Vineta k={4} n="5" label="CAFÉ" at={t('2:08')}>
		<Show at={t('2:08')}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 470, bottom: 0, background: '#2A2A26', borderTop: '6px solid #3A3A34'}} />
			<div style={{position: 'absolute', left: 180, top: 380, width: 680, height: 26, background: '#8A6446', boxShadow: '0 8px 0 #5B4030'}} />
			<div style={{position: 'absolute', left: 230, top: 406, width: 22, height: 64, background: '#5B4030'}} />
			<div style={{position: 'absolute', left: 800, top: 406, width: 22, height: 64, background: '#5B4030'}} />
			<div style={{position: 'absolute', left: 430, top: 240}}>
				<Cup fill="latte" steam scale={14} />
			</div>
		</Show>
	</Vineta>
);

/* ================================================================== mundo: robot, token y transición */

/** El robot sube desde abajo con el paquete, salta al marco del café y aterriza dentro. */
const CarryRobot: React.FC = () => {
	const f = useCurrentFrame();
	const rise0 = t('2:02');
	const rise1 = t('2:02.7');
	const hop0 = t('2:08.2');
	const hop1 = t('2:11.4');
	const gone = t('2:12');
	if (f < rise0 || f >= gone) return null;
	const hold = f >= t('2:02.9');
	let x = RB_X;
	let y = RB_FEET;
	let pose: RobotPose = 'idle';
	let face: RobotFace = 'wow';
	if (f < hop0) {
		y = f < rise1 ? lin(f, [[rise0, 900], [rise1, RB_FEET]]) : RB_FEET;
		pose = hold ? 'hold' : 'idle';
		face = hold ? 'proud' : 'wow';
	} else {
		const u = clamp01((f - hop0) / (hop1 - hop0));
		x = RB_X + (5000 - RB_X) * inOutCubic(u);
		y = RB_FEET - 220 * Math.sin(Math.PI * u);
		pose = 'walk';
		face = 'happy';
	}
	return <Robot x={x} y={y} scale={3} pose={pose} face={face} holdF={hold ? <Pkg /> : undefined} chest={hold ? '✓' : undefined} />;
};

/** Monitor pixelado con la ficha «ALGORITMO»; Vee la empuja fuera de cuadro. */
const Monitor: React.FC = () => {
	const f = useCurrentFrame();
	if (f >= t('1:37')) return null;
	const fade = 1 - tween(f, t('1:36.4'), t('1:37'));
	const slide = tween(f, t('1:35.6'), t('1:36.9'), 0, -760, inOutCubic);
	return (
		<div style={{position: 'absolute', left: 140, top: 60, width: 760, height: 480, opacity: fade}}>
			<div style={{position: 'absolute', left: 330, top: 420, width: 100, height: 50, background: '#39423E'}} />
			<div style={{position: 'absolute', left: 250, top: 470, width: 260, height: 12, background: '#39423E'}} />
			<div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 420, boxSizing: 'border-box', background: '#2A3530', border: '14px solid #39423E'}} />
			<div style={{position: 'absolute', left: 44, top: 40, width: 672, height: 340, overflow: 'hidden', background: INK, backgroundImage: 'linear-gradient(rgba(0,192,99,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(0,192,99,0.08) 2px, transparent 2px)', backgroundSize: '24px 24px'}}>
				<div style={{position: 'absolute', left: 36 + slide, top: 90, width: 600, height: 160, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 84, color: INK, whiteSpace: 'nowrap'}}>
					ALGORITMO ✓
				</div>
			</div>
		</div>
	);
};

/** Final en cascada: 🏁 en cada uno de los cuatro marcos. */
const Finishes: React.FC = () => (
	<>
		{[0, 1, 2, 3].map((k) => (
			<div key={k} style={{position: 'absolute', left: STEP * k, top: 0, width: PW, height: PH}}>
				<Finish at={t('2:04') + k * 30} />
			</div>
		))}
	</>
);

/** Token de la llevada: el «1» salta hasta el borde del cuaderno y lo atrapa Vee. Coordenadas de pantalla (la cámara está quieta). */
const TOKEN_SEGS: [number, number, number, number, number, number][] = [
	[t('1:49.4'), t('1:49.9'), 1095, 310, 910, 700],
	[t('1:49.9'), t('1:50.3'), 910, 700, 470, 720],
	[t('1:50.3'), t('1:50.8'), 470, 720, 1095, 310],
];
const CarryToken: React.FC = () => {
	const f = useCurrentFrame();
	const seg = TOKEN_SEGS.find(([a, b]) => f >= a && f <= b);
	if (!seg) return null;
	const [a, b, x0, y0, x1, y1] = seg;
	const u = (f - a) / (b - a);
	const x = x0 + (x1 - x0) * u;
	const y = y0 + (y1 - y0) * u - 80 * Math.sin(Math.PI * u);
	return (
		<div style={{position: 'absolute', left: x - 30, top: y - 36, width: 60, height: 72, background: C.green, color: INK, fontFamily: MONO, fontWeight: 800, fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${Math.sin(u * 6) * 14}deg)`}}>
			1
		</div>
	);
};

/** Transición final: el marco del café se expande hasta llenar la pantalla y aparece la cocina. */
const KitchenWipe: React.FC = () => {
	const f = useCurrentFrame();
	const a = t('2:12');
	const b = t('2:13.6');
	if (f < a) return null;
	const r = 1 - tween(f, a, b, 0, 1, inOutCubic);
	const carrying = f < t('2:13');
	return (
		<div style={{position: 'absolute', inset: 0, clipPath: `inset(${240 * r}px ${220 * r}px ${240 * r}px ${660 * r}px)`}}>
			<Kitchen />
			<Robot x={860} y={FLOOR} pose={carrying ? 'hold' : 'idle'} face={carrying ? 'happy' : 'focus'} holdF={carrying ? <Pkg /> : undefined} at={t('2:12.8')} />
			{!carrying && (
				<div style={{position: 'absolute', left: 690, top: FLOOR - 36}}>
					<Pkg />
				</div>
			)}
		</div>
	);
};

/* ================================================================== escena */

export const B3: React.FC = () => {
	const f = useCurrentFrame();
	const c = camAt(f);
	const a = actNow(f);
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1920,
					height: 1080,
					transform: `translate(${CX0 - c.cx * c.z}px, ${540 - c.cy * c.z}px) scale(${c.z})`,
					transformOrigin: '0 0',
				}}
			>
				<Monitor />
				<Recipe />
				<Suma />
				<Mapa />
				<Maquina />
				<Cafe />
				<Finishes />
				<CarryRobot />
			</div>
			<Vee x={380} act={a?.[1]} actAt={a?.[0]} out={t('2:12')} />
			<CarryToken />
			<KitchenWipe />
		</AbsoluteFill>
	);
};

export const sfxB3: Sfx[] = [
	s(t('1:35.8'), 'whoosh', 0.35), // ficha empujada fuera del monitor
	s(t('1:37'), 'slide', 0.25), // desplegado de marcos
	s(t('1:39'), 'draw', 0.25), // hoja de libro
	s(t('1:41.1'), 'pop', 0.3), // plop: huevo
	s(t('1:41.6'), 'pop', 0.3), // plop: harina
	s(t('1:43'), 'ac', 0.35), // ding del horno
	s(t('1:45'), 'draw', 0.25), // lápiz
	s(t('1:47.8'), 'ticks', 0.2), // tiza
	s(t('1:49.4'), 'boing', 0.35), // el 1 salta
	s(t('1:50.9'), 'blip', 0.25), // tic: vuelve arriba
	s(t('1:53.1'), 'land', 0.15), // pasos
	s(t('1:53.45'), 'land', 0.15),
	s(t('1:53.8'), 'land', 0.15),
	s(t('1:54.15'), 'land', 0.15),
	s(t('1:55.6'), 'rise', 0.3), // mini-fanfarria
	s(t('1:56'), 'slide', 0.18), // zumbido de máquina
	s(t('1:58.2'), 'blip', 0.3), // beep de botón
	s(t('1:58.9'), 'ticks', 0.25), // moneda
	s(t('2:00'), 'rise', 0.25), // suspenso de 2 notas
	s(t('2:02.9'), 'land', 0.35), // clunk del paquete
	s(t('2:03.4'), 'blip', 0.3), // bip alegre
	s(t('2:04'), 'ac', 0.22), // campanitas en cascada
	s(t('2:05'), 'ac', 0.22),
	s(t('2:06'), 'ac', 0.22),
	s(t('2:07'), 'ac', 0.22),
	s(t('2:08'), 'whoosh', 0.4), // vuelo al marco del café
	s(t('2:12'), 'enter', 0.2), // transición a la cocina
];
