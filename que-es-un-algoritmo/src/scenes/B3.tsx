import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inCubic, inOutCubic, outCubic, pop, tween, windowed} from '@commons/lib';
import {Buf, PixelBurst, PixelSprite} from '@commons/pixel';
import {CutFlash, GlitchBurst, Shockwave, WipeBar, shake} from '@commons/components';
import {Hit} from '@commons/vertical';
import {Barrido, Slam, SpeedLines} from '@commons/transiciones';
import {Board, Cup, Robot, Splash, Steam, Tag, Vee, lerpPt, robotRest} from '../kit';
import type {VeeAct} from '../kit';
import {BLOCKS, at, end} from '../timeline';
import {Sfx, s} from '../sfx';

/**
 * BLOQUE 3 · «En tu día a día»: V17–V22.
 * Cada ejemplo (receta, suma, ruta, máquina) llena la pantalla con un panel grande y su diorama en pixel art,
 * un rótulo de título y una lista de 3 pasos cuyos ✓ saltan en la palabra que nombra cada paso.
 * Todo está anclado a las marcas de la voz.
 */

/* ================================================================== tiempos */

const B0 = BLOCKS.b3[0];
const B1 = BLOCKS.b3[1];

const T = {
	// V17
	v17: at('V17'),
	palabra: at('V17', 'palabra'),
	compu: at('V17', 'computadoras'),
	tu: at('V17', 'tu'),
	algoritmos: at('V17', 'algoritmos'),
	todos17: at('V17', 'todos'),
	los17: at('V17', 'los'),
	dias17: at('V17', 'dias'),
	// V18
	v18: at('V18'),
	receta: at('V18', 'receta'),
	ing: at('V18', 'ingredientes'),
	pasos18: at('V18', 'pasos'),
	y18: at('V18', 'y'),
	final18: at('V18', 'final'),
	plato: at('V18', 'plato'),
	servido: at('V18', 'servido'),
	// V19
	v19: at('V19'),
	resuelves: at('V19', 'resuelves'),
	una19: at('V19', 'una'),
	suma: at('V19', 'suma'),
	primero: at('V19', 'primero'),
	unidades: at('V19', 'unidades'),
	luego: at('V19', 'luego'),
	decenas: at('V19', 'decenas'),
	no19: at('V19', 'no'),
	olvides: at('V19', 'olvides'),
	llevas: at('V19', 'llevas'),
	// V20
	v20: at('V20'),
	alguien: at('V20', 'alguien'),
	te: at('V20', 'te'),
	llegar: at('V20', 'llegar'),
	lugar: at('V20', 'lugar'),
	dos: at('V20', 'dos'),
	cuadras: at('V20', 'cuadras'),
	derecho: at('V20', 'derecho'),
	giras: at('V20', 'giras'),
	izquierda: at('V20', 'izquierda'),
	llegaste: at('V20', 'llegaste'),
	// V21
	v21: at('V21'),
	maquina: at('V21', 'maquina'),
	expendedora: at('V21', 'expendedora'),
	eliges: at('V21', 'eliges'),
	producto: at('V21', 'producto'),
	pagas: at('V21', 'pagas'),
	si21: at('V21', 'si'),
	dinero: at('V21', 'dinero'),
	alcanza: at('V21', 'alcanza'),
	sale: at('V21', 'sale'),
	tu21: at('V21', 'tu'),
	paquete: at('V21', 'paquete'),
	// V22
	v22: at('V22'),
	todos22: at('V22', 'todos'),
	tienen: at('V22', 'tienen'),
	pasos22: at('V22', 'pasos'),
	ordenados: at('V22', 'ordenados'),
	final22: at('V22', 'final'),
	ahora: at('V22', 'ahora'),
	volvamos: at('V22', 'volvamos'),
	nuestro: at('V22', 'nuestro'),
	cafe: at('V22', 'cafe'),
	fin22: end('V22'),
};

/** Panel grande donde viven los dioramas (coordenadas de pantalla) y su tamaño. */
const OX = 580;
const OY = 100;
const PW = 1310;
const PH = 790;
/** De coordenadas del panel a coordenadas de pantalla (para Hit, Shockwave…). */
const G = (x: number, y: number): [number, number] => [OX + x, OY + y];

const VX = 450; // posición de Vee (pisa la esquina del panel)

/* ================================================================== sprites (pixel art) */

const mk = (w: number, h: number, draw: (b: Buf) => void) => {
	const b = new Buf(w, h);
	draw(b);
	return b;
};
const Spr: React.FC<{b: Buf; s: number; style?: React.CSSProperties}> = ({b, s: sc, style}) => <PixelSprite buf={b} scale={sc} style={style} />;

const EGG = mk(7, 9, (b) => {
	const c = '#F6EAD0';
	const d = '#D9C393';
	b.rect(2, 0, 3, 1, c); b.rect(1, 1, 5, 1, c); b.rect(0, 2, 7, 5, c); b.rect(1, 7, 5, 1, c); b.rect(2, 8, 3, 1, c);
	b.rect(5, 3, 2, 3, d); b.rect(4, 7, 2, 1, d); b.rect(4, 8, 1, 1, d); b.rect(1, 2, 1, 2, '#FFFFFF');
});
const FLOUR = mk(10, 13, (b) => {
	b.rect(1, 1, 8, 12, '#EDE6D6'); b.rect(0, 0, 10, 2, '#CFC6B0'); b.rect(7, 2, 2, 11, '#CFC6B0');
	b.rect(2, 5, 5, 4, '#E2463E'); b.rect(3, 6, 3, 1, '#FFFFFF'); b.rect(3, 7, 1, 1, '#FFFFFF');
});
const MILK = mk(9, 13, (b) => {
	b.rect(1, 3, 7, 10, '#F4F7F5'); b.rect(6, 3, 2, 10, '#C9D6DE'); b.rect(1, 1, 7, 2, '#C9D6DE'); b.rect(2, 0, 5, 1, '#B4C0B8');
	b.rect(2, 6, 5, 4, '#3E73D8'); b.rect(3, 7, 3, 1, '#FFFFFF');
});
const bowlCache = new Map<string, Buf>();
const bowlBuf = (fill: string | null) => {
	const key = fill ?? 'none';
	let b = bowlCache.get(key);
	if (!b) {
		b = mk(22, 10, (x) => {
			x.rect(0, 0, 22, 2, '#5E92F0');
			if (fill) x.rect(1, 0, 20, 1, fill);
			x.rect(1, 2, 20, 2, '#3E73D8'); x.rect(2, 4, 18, 2, '#3E73D8'); x.rect(3, 6, 16, 2, '#3E73D8'); x.rect(5, 8, 12, 2, '#2B4F96');
			x.rect(17, 2, 4, 2, '#2B4F96'); x.rect(15, 4, 5, 2, '#2B4F96'); x.rect(13, 6, 6, 2, '#2B4F96'); x.rect(2, 2, 2, 1, '#8DB5FF');
		});
		bowlCache.set(key, b);
	}
	return b;
};
const WHISK = mk(7, 17, (b) => {
	const st = '#B9C3BE';
	b.rect(2, 0, 3, 8, '#6B4A33'); b.rect(4, 0, 1, 8, '#46301F');
	b.rect(1, 8, 5, 1, st); b.rect(0, 9, 1, 6, st); b.rect(6, 9, 1, 6, st); b.rect(1, 15, 5, 1, st); b.rect(3, 9, 1, 6, '#7E8A84'); b.rect(1, 9, 1, 5, '#7E8A84'); b.rect(5, 9, 1, 5, '#7E8A84');
});
const OVEN = mk(30, 24, (b) => {
	b.rect(0, 0, 30, 24, '#7E8A84'); b.rect(0, 0, 30, 2, '#A3AEA8'); b.rect(0, 2, 30, 5, '#5B6661');
	b.rect(3, 3, 3, 3, '#EEF3F0'); b.rect(9, 3, 3, 3, '#EEF3F0'); b.rect(24, 3, 3, 3, '#00C063');
	b.rect(4, 8, 22, 1, '#EEF3F0'); b.rect(2, 9, 26, 14, '#39423E'); b.rect(3, 10, 24, 12, '#1A1F1C');
	b.rect(0, 23, 30, 1, '#5B6661');
});
const CAKE = mk(22, 14, (b) => {
	b.rect(0, 11, 22, 2, '#F4F7F5'); b.rect(2, 13, 18, 1, '#B4C0B8');
	b.rect(3, 5, 16, 6, '#E8B56B'); b.rect(15, 5, 4, 6, '#B9803E'); b.rect(3, 3, 16, 3, '#F6E3B4'); b.rect(4, 6, 1, 2, '#F6E3B4'); b.rect(9, 6, 1, 1, '#F6E3B4'); b.rect(13, 6, 1, 2, '#F6E3B4');
	b.rect(10, 1, 2, 2, '#E2463E'); b.rect(11, 0, 1, 1, '#00C063'); b.rect(5, 3, 3, 1, '#FFFFFF');
});
const COIN = mk(9, 9, (b) => {
	const g = '#F2C230';
	b.rect(3, 0, 3, 1, g); b.rect(1, 1, 7, 1, g); b.rect(0, 2, 9, 5, g); b.rect(1, 7, 7, 1, g); b.rect(3, 8, 3, 1, g);
	b.rect(6, 3, 3, 3, '#C99A1A'); b.rect(4, 2, 1, 5, '#C99A1A'); b.rect(3, 3, 3, 1, '#C99A1A'); b.rect(3, 5, 3, 1, '#C99A1A');
});
const bag = (main: string, dark: string, acc: string) =>
	mk(10, 14, (b) => {
		b.rect(1, 1, 8, 13, main); b.rect(7, 2, 2, 12, dark); b.rect(0, 0, 10, 2, dark); b.rect(2, 0, 1, 1, main); b.rect(5, 0, 1, 1, main);
		b.rect(2, 5, 6, 5, acc); b.rect(4, 6, 2, 3, main);
	});
const BAGS = {
	A1: bag('#5AA9FF', '#3E73D8', '#F4F7F5'),
	A2: bag('#00C063', '#00864A', '#F2C230'),
	B1: bag('#E2463E', '#A8302A', '#F4F7F5'),
	B2: bag('#F2C230', '#C99A1A', '#E2463E'),
	C1: bag('#B26BFF', '#7B3FD1', '#F4F7F5'),
	C2: bag('#FFB547', '#C27C1A', '#3E73D8'),
};
const FLAG = mk(14, 16, (b) => {
	b.rect(0, 0, 1, 16, '#EEF3F0');
	for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) b.rect(1 + i * 3, 1 + j * 3, 3, 3, (i + j) % 2 ? '#0B0F0D' : '#FFFFFF');
	b.rect(0, 15, 3, 1, '#8E9A94');
});
const personBuf = (step: number) =>
	mk(10, 15, (b) => {
		b.rect(3, 0, 4, 4, '#F2C9A0'); b.rect(3, 0, 4, 1, '#4A2A18'); b.rect(3, 1, 1, 1, '#4A2A18'); b.rect(4, 2, 1, 1, '#222222'); b.rect(6, 2, 1, 1, '#222222');
		b.rect(2, 4, 6, 6, '#3E73D8'); b.rect(1, 5, 1, 4, '#3E73D8'); b.rect(8, 5, 1, 4, '#3E73D8'); b.rect(6, 5, 2, 5, '#2B4F96');
		if (step) { b.rect(2, 10, 2, 4, '#2A3A5A'); b.rect(6, 10, 2, 5, '#2A3A5A'); b.rect(2, 14, 2, 1, '#111111'); b.rect(6, 14, 3, 1, '#111111'); }
		else { b.rect(3, 10, 2, 5, '#2A3A5A'); b.rect(5, 10, 2, 4, '#2A3A5A'); b.rect(3, 14, 3, 1, '#111111'); b.rect(5, 13, 2, 1, '#111111'); }
	});
const PERSON = [personBuf(0), personBuf(1)];
// iconos de los ejemplos
const ICON_HAT = mk(16, 12, (b) => {
	const w = '#F4F7F5';
	b.rect(3, 0, 10, 1, w); b.rect(1, 1, 14, 2, w); b.rect(0, 3, 16, 3, w); b.rect(2, 6, 12, 1, w);
	b.rect(12, 1, 3, 5, '#C9D6DE'); b.rect(2, 7, 12, 4, '#E8EEEA'); b.rect(12, 7, 2, 4, '#C9D6DE'); b.rect(2, 10, 12, 1, '#B4C0B8'); b.rect(5, 1, 1, 3, '#DDE5E0'); b.rect(9, 2, 1, 3, '#DDE5E0');
});
const ICON_PLUS = mk(15, 15, (b) => {
	b.rect(5, 0, 5, 15, '#00C063'); b.rect(0, 5, 15, 5, '#00C063'); b.rect(5, 0, 1, 15, '#7CFFB3'); b.rect(0, 5, 15, 1, '#7CFFB3'); b.rect(9, 6, 1, 9, '#00864A'); b.rect(10, 9, 5, 1, '#00864A');
});
const ICON_PIN = mk(12, 16, (b) => {
	const r = '#E2463E';
	const rows: [number, number][] = [[4, 4], [2, 8], [1, 10], [1, 10], [0, 12], [0, 12], [0, 12], [1, 10], [1, 10], [2, 8], [3, 6], [4, 4], [5, 2], [5, 2], [5, 2], [5, 2]];
	rows.forEach(([x, w], y) => b.rect(x, y, w, 1, r));
	b.rect(8, 3, 3, 6, '#A8302A'); b.rect(4, 4, 4, 4, '#F4F7F5'); b.rect(2, 2, 2, 1, '#FF8A82');
});
const ICON_VEND = mk(14, 18, (b) => {
	b.rect(0, 0, 14, 18, '#A8302A'); b.rect(0, 0, 14, 1, '#E2463E'); b.rect(1, 2, 8, 11, '#12384E');
	b.rect(2, 3, 2, 2, '#F2C230'); b.rect(5, 3, 2, 2, '#5AA9FF'); b.rect(2, 7, 2, 2, '#00C063'); b.rect(5, 7, 2, 2, '#FFB547'); b.rect(2, 10, 2, 2, '#B26BFF'); b.rect(5, 10, 2, 2, '#E2463E');
	b.rect(1, 5, 8, 1, '#7E8A84'); b.rect(1, 9, 8, 1, '#7E8A84'); b.rect(10, 2, 3, 6, '#39423E'); b.rect(10, 3, 3, 1, '#00C063'); b.rect(10, 5, 1, 1, '#EEF3F0'); b.rect(12, 5, 1, 1, '#EEF3F0'); b.rect(2, 14, 10, 3, '#2A160C');
});
const ICONS = [
	{b: ICON_HAT, s: 15, label: 'RECETA'},
	{b: ICON_PLUS, s: 15, label: 'SUMA'},
	{b: ICON_PIN, s: 15, label: 'RUTA'},
	{b: ICON_VEND, s: 13, label: 'MÁQUINA'},
];
/** Posiciones (esquina) de las 4 tarjetas del mosaico 2×2, en pantalla. */
const TILE_W = 640;
const TILE_H = 400;
const TILES: [number, number][] = [[560, 100], [1240, 100], [560, 520], [1240, 520]];

/* ================================================================== piezas del marco */

/** Muestra a sus hijos solo entre a (incl.) y b (excl.). */
const Seg: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => {
	const f = useCurrentFrame();
	return f >= a && f < b ? <>{children}</> : null;
};

/** Panel grande del ejemplo (clipa su contenido, con sacudidas en los impactos). */
const Marco: React.FC<{a: number; accent?: string; shakes?: number[]; children: React.ReactNode}> = ({a, accent = C.green, shakes = [], children}) => {
	const f = useCurrentFrame();
	const p = pop(f, a, 12, 240, 0.7);
	let sx = 0;
	let sy = 0;
	for (const t of shakes) {
		const [x, y] = shake(f, t, 12, 9);
		sx += x;
		sy += y;
	}
	return (
		<div style={{position: 'absolute', left: OX, top: OY, width: PW, height: PH, transform: `translate(${sx}px, ${sy}px) scale(${0.92 + 0.08 * p})`, opacity: Math.min(1, p * 3), overflow: 'hidden', background: C.panel, boxShadow: `0 0 70px ${accent}33, 0 30px 80px rgba(0,0,0,0.6)`}}>
			{children}
			<div style={{position: 'absolute', inset: 0, border: `5px solid ${accent}`, pointerEvents: 'none'}} />
		</div>
	);
};

type PShot = [frame: number, zoom: number, cx: number, cy: number, move?: number];
/** Cámara interna del panel: cortes con golpe de zoom y travelling opcional. */
const PCam: React.FC<{shots: PShot[]; children: React.ReactNode}> = ({shots, children}) => {
	const f = useCurrentFrame();
	let i = 0;
	for (let k = 0; k < shots.length; k++) if (f >= shots[k][0]) i = k;
	const [a, z1, x1, y1, mv] = shots[i];
	let z = z1;
	let cx = x1;
	let cy = y1;
	if (mv && i > 0) {
		const [, z0, x0, y0] = shots[i - 1];
		const k = tween(f, a, a + mv, 0, 1, inOutCubic);
		z = z0 + (z1 - z0) * k;
		cx = x0 + (x1 - x0) * k;
		cy = y0 + (y1 - y0) * k;
	} else if (i > 0) {
		z *= 1 + 0.06 * (1 - tween(f, a, a + 8));
	}
	z *= 1 + 0.015 * Math.min(1, Math.max(0, f - a - (mv ?? 0)) / 150);
	if (z >= 1) {
		cx = Math.min(PW - PW / 2 / z, Math.max(PW / 2 / z, cx));
		cy = Math.min(PH - PH / 2 / z, Math.max(PH / 2 / z, cy));
	}
	return <div style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH, transform: `translate(${PW / 2 - cx * z}px, ${PH / 2 - cy * z}px) scale(${z})`, transformOrigin: '0 0'}}>{children}</div>;
};

/** Título del ejemplo: cae con golpe en la columna izquierda. */
const Titulo: React.FC<{a: number; text: string}> = ({a, text}) => (
	<Slam at={a} x={290} y={150} from={3} rot={-3}>
		<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 96, color: C.white, letterSpacing: '-0.02em', textShadow: `5px 5px 0 ${C.green}, 0 0 40px ${C.green}66`, whiteSpace: 'nowrap'}}>{text}</div>
	</Slam>
);

/** Lista de 3 pasos; cada ✓ salta en la fotograma indicado. */
const Pasos: React.FC<{a: number; items: [string, number][]}> = ({a, items}) => {
	const f = useCurrentFrame();
	return (
		<>
			{items.map(([txt, t], i) => {
				const st = a + 4 + i * 4;
				if (f < st) return null;
				const e = pop(f, st, 12, 240, 0.7);
				const done = f >= t;
				const k = done ? pop(f, t, 9, 300, 0.5) : 0;
				const fl = done ? Math.max(0, 1 - (f - t) / 12) : 0;
				return (
					<div key={i} style={{position: 'absolute', left: 50 - (1 - e) * 480, top: 232 + i * 100, width: 470, height: 88, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 18, padding: '0 16px', background: done ? 'rgba(0,192,99,0.16)' : 'rgba(14,17,15,0.94)', border: `4px solid ${done ? C.green : C.line2}`, boxShadow: fl ? `0 0 ${50 * fl}px ${C.green}` : `0 10px 0 rgba(0,0,0,0.35)`}}>
						<div style={{width: 54, height: 54, flexShrink: 0, boxSizing: 'border-box', border: `4px solid ${done ? C.green : C.faint}`, background: done ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.bg}}>
							<span style={{display: 'inline-block', transform: `scale(${k})`}}>{done ? '✓' : ''}</span>
						</div>
						<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 38, color: done ? C.white : C.dim, whiteSpace: 'nowrap'}}>{txt}</div>
					</div>
				);
			})}
		</>
	);
};

/** Cuadrícula de fondo de los paneles (cuaderno, mapa…). */
const Rejilla: React.FC<{c?: string; size?: number}> = ({c = 'rgba(255,255,255,0.05)', size = 60}) => (
	<div style={{position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${c} 2px, transparent 2px), linear-gradient(90deg, ${c} 2px, transparent 2px)`, backgroundSize: `${size}px ${size}px`}} />
);

/* ================================================================== V17 · intro (monitor + ficha) */

const ficha = (f: number) => {
	const br = 1 + 0.012 * Math.sin(f / 7);
	return (
		<div style={{width: 1100, height: 300, boxSizing: 'border-box', border: `8px solid ${C.green}`, background: 'rgba(0,192,99,0.14)', boxShadow: `0 0 70px ${C.green}66, inset 0 0 50px ${C.green}22`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${br})`}}>
			<div style={{fontFamily: MONO, fontSize: 34, fontWeight: 800, color: C.green, letterSpacing: '0.2em', marginBottom: 6}}>FICHA</div>
			<div style={{fontFamily: SANS, fontWeight: 860, fontSize: 168, lineHeight: 1, letterSpacing: '-0.045em', color: C.white}}>ALGORITMO</div>
		</div>
	);
};

const CODE = ['for i in range(n):', '  total += i', 'if x > 0:', '  print(total)', 'while True:', '  leer()', 'return a + b', 'x = [1, 2, 3]'];

const Intro: React.FC = () => {
	const f = useCurrentFrame();
	const fly = tween(f, T.tu, T.tu + 14, 0, 1, inCubic);
	const mp = pop(f, T.compu, 11, 250, 0.7);
	const hasMon = f >= T.compu;
	// TÚ y ALGORITMOS
	const gone = tween(f, T.todos17 - 2, T.todos17 + 8, 0, 1, inCubic);
	return (
		<>
			{/* código de fondo */}
			{[0, 1].map((side) => (
				<div key={side} style={{position: 'absolute', top: 120, [side ? 'right' : 'left']: 70, width: 420, fontFamily: MONO, fontSize: 38, color: 'rgba(0,192,99,0.22)', lineHeight: '56px', whiteSpace: 'pre', opacity: f < T.compu ? 1 : 0}}>
					{CODE.map((_, k) => CODE[(k + side * 3 + Math.floor(f / 14)) % CODE.length]).join('\n')}
				</div>
			))}
			{/* monitor + ficha */}
			{fly < 1 && (
				<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${fly * 1700}px, ${-fly * 800}px) rotate(${fly * 32}deg) scale(${1 + fly * 0.15})`, transformOrigin: '960px 460px'}}>
					{hasMon && (
						<div style={{position: 'absolute', inset: 0, transform: `scale(${1.2 - 0.2 * mp})`, transformOrigin: '960px 460px', opacity: Math.min(1, mp * 3)}}>
							{/* base y soporte */}
							<div style={{position: 'absolute', left: 860, top: 800, width: 200, height: 90, background: '#7E8A84'}} />
							<div style={{position: 'absolute', left: 700, top: 880, width: 520, height: 34, background: '#C9D3CE', boxShadow: '0 10px 0 #8E9A94'}} />
							{/* marco y pantalla */}
							<div style={{position: 'absolute', left: 100, top: 96, width: 1720, height: 714, boxSizing: 'border-box', border: '34px solid #C9D3CE', borderBottomWidth: 50, background: '#0B0F0D', boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 90px rgba(0,192,99,0.18)'}}>
								<div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 6px)'}} />
								{[0, 1].map((side) => (
									<div key={side} style={{position: 'absolute', top: 24, [side ? 'right' : 'left']: 34, width: 400, fontFamily: MONO, fontSize: 34, color: 'rgba(0,192,99,0.38)', lineHeight: '48px', whiteSpace: 'pre'}}>
										{CODE.map((_, k) => CODE[(k + side * 3 + Math.floor(f / 14)) % CODE.length]).slice(0, 10).join('\n')}
									</div>
								))}
								<div style={{position: 'absolute', right: 22, bottom: -38, width: 14, height: 14, background: C.green, boxShadow: `0 0 12px ${C.green}`}} />
							</div>
						</div>
					)}
					<div style={{position: 'absolute', left: 410, top: 300, transform: `translateY(${Math.sin(f / 18) * 6}px)`}}>{ficha(f)}</div>
					<Tag x={960} y={178} at={T.compu} size={52} color={C.green}>COMPUTADORAS</Tag>
				</div>
			)}
			{/* TÚ y ALGORITMOS */}
			<div style={{opacity: 1 - gone, transform: `translateY(${-gone * 400}px)`}}>
				<Slam at={T.tu} x={1170} y={330} from={3} rot={-5}>
					<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 420, lineHeight: 1, letterSpacing: '-0.05em', color: C.white, textShadow: `10px 10px 0 ${C.green}`}}>TÚ</div>
				</Slam>
			</div>
			<div style={{opacity: 1 - gone, transform: `translateY(${gone * 400}px)`}}>
				<Slam at={T.algoritmos} x={1170} y={650} from={2.6} rot={4}>
					<div style={{fontFamily: SANS, fontWeight: 860, fontSize: 168, lineHeight: 1, letterSpacing: '-0.045em', color: C.green, textShadow: `0 0 50px ${C.green}77`}}>ALGORITMOS</div>
				</Slam>
			</div>
			{/* todos los días */}
			<Slam at={T.todos17} x={290} y={160} from={2.6} rot={-4}>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 100, lineHeight: 1, color: C.white, letterSpacing: '-0.04em'}}>TODOS</div>
			</Slam>
			<Slam at={T.los17} x={290} y={285} from={2.6} rot={3}>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 100, lineHeight: 1, color: C.white, letterSpacing: '-0.04em'}}>LOS</div>
			</Slam>
			<Slam at={T.dias17} x={290} y={410} from={2.6} rot={-3}>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 100, lineHeight: 1, color: C.green, letterSpacing: '-0.04em'}}>DÍAS</div>
			</Slam>
			{ICONS.map((ic, i) => {
				const t = i < 2 ? T.todos17 + 3 + i * 6 : T.dias17 + (i - 2) * 6;
				if (f < t) return null;
				const p = pop(f, t, 10, 260, 0.6);
				const [x, y] = TILES[i];
				return (
					<div key={i} style={{position: 'absolute', left: x, top: y, width: TILE_W, height: TILE_H, boxSizing: 'border-box', border: `6px solid ${C.green}`, background: 'rgba(14,17,15,0.96)', boxShadow: `0 0 50px ${C.green}44, 0 20px 40px rgba(0,0,0,0.5)`, transform: `scale(${0.3 + 0.7 * p})`, opacity: Math.min(1, p * 3), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
						<Spr b={ic.b} s={ic.s} />
						<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 62, color: C.white, letterSpacing: '0.04em'}}>{ic.label}</div>
					</div>
				);
			})}
		</>
	);
};

/* ================================================================== V18 · receta */

const ING: {b: Buf; sc: number; x: number; fill: string; nm: string; col: string}[] = [
	{b: EGG, sc: 22, x: 430, fill: '#F2D45C', nm: 'HUEVO', col: '#F2C230'},
	{b: FLOUR, sc: 18, x: 470, fill: '#EFE6CF', nm: 'HARINA', col: '#F4F7F5'},
	{b: MILK, sc: 18, x: 510, fill: '#F1E4C4', nm: 'LECHE', col: '#5AA9FF'},
];
const ING_T = [T.ing, T.ing + 10, T.ing + 20];
const BOWL_X = 470;
const BOWL_Y = 610; // base del tazón = encimera
const OVEN_X = 800;
const OVEN_S = 14;

const Receta: React.FC = () => {
	const f = useCurrentFrame();
	// color de la mezcla según lo ya caído
	let fill: string | null = null;
	ING.forEach((g, i) => {
		if (f >= ING_T[i] + 11) fill = g.fill;
	});
	// tazón: se desliza hacia el horno en 'final'
	const slide = tween(f, T.final18, T.final18 + 16, 0, 1, inOutCubic);
	const bx = BOWL_X + slide * 520;
	let squash = 1;
	ING_T.forEach((t) => {
		const k = f - (t + 11);
		if (k >= 0 && k < 14) squash = Math.min(squash, 1 - 0.12 * Math.sin((k / 14) * Math.PI));
	});
	const batir = f >= T.pasos18 && f < T.final18;
	const wob = batir ? Math.sin((f - T.pasos18) * 1.1) * 0.03 : 0;
	// batidor
	const wIn = pop(f, T.pasos18, 12, 240, 0.7);
	const wOut = tween(f, T.y18 + 8, T.y18 + 18);
	const wRot = Math.sin((f - T.pasos18) * 0.9) * 16;
	// horno
	const oIn = pop(f, T.y18, 12, 220, 0.7);
	const bakeK = tween(f, T.final18 + 14, T.plato, 0, 1);
	const glow = f >= T.final18 + 10 && f < T.plato ? 0.65 + 0.35 * Math.sin(f * 0.8) : 0;
	const ding = f >= T.plato ? Math.max(0, 1 - (f - T.plato) / 12) : 0;
	const oy = BOWL_Y - 24 * OVEN_S;
	const winX = OVEN_X + 3 * OVEN_S;
	const winY = oy + 10 * OVEN_S;
	const winW = 24 * OVEN_S;
	const winH = 12 * OVEN_S;
	return (
		<>
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #121A15 0%, #0E130F 100%)'}} />
			<Rejilla c="rgba(255,255,255,0.035)" size={66} />
			{/* ventana de luz */}
			<div style={{position: 'absolute', left: 60, top: 70, width: 220, height: 170, boxSizing: 'border-box', border: '12px solid #33423B', background: '#12384E'}} />
			{/* encimera */}
			<div style={{position: 'absolute', left: 0, top: BOWL_Y, width: PW, height: PH - BOWL_Y, background: '#8A6446', boxShadow: 'inset 0 14px 0 #A07A58'}} />
			<div style={{position: 'absolute', left: 0, top: BOWL_Y + 90, width: PW, height: PH, background: '#5B4030'}} />
			<PCam
				shots={[
					[B0, 1, 655, 395],
					[T.ing, 1.15, 470, 400],
					[T.pasos18, 1.3, 480, 400],
					[T.y18, 1, 655, 395],
					[T.final18, 1.25, 760, 430, 22],
					[T.plato, 1.4, 470, 430],
				]}
			>
				{/* horno */}
				{f >= T.y18 && (
					<div style={{position: 'absolute', left: OVEN_X + (1 - oIn) * 500, top: oy}}>
						<Spr b={OVEN} s={OVEN_S} />
						<div style={{position: 'absolute', left: 3 * OVEN_S, top: 10 * OVEN_S, width: winW, height: winH, overflow: 'hidden', background: glow ? `rgba(255,${Math.round(120 + 40 * glow)},40,${0.25 + 0.4 * glow})` : 'transparent'}}>
							{bakeK > 0 && (
								<div style={{position: 'absolute', left: winW / 2 - 120, bottom: 10, width: 240, height: 28 + 86 * bakeK, background: '#E8B56B', borderRadius: '120px 120px 0 0', boxShadow: 'inset -20px 0 0 #B9803E'}} />
							)}
							<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: '#39423E'}} />
						</div>
						{ding > 0 && <div style={{position: 'absolute', left: 3 * OVEN_S, top: 10 * OVEN_S, width: winW, height: winH, background: '#FFFFFF', opacity: ding * 0.8}} />}
					</div>
				)}
				{/* tazón con la mezcla */}
				{f < T.plato && bx < OVEN_X + 40 + 0 && (
					<div style={{position: 'absolute', left: bx - 11 * 24, top: BOWL_Y - 10 * 24, transform: `scale(1, ${squash}) rotate(${wob * 57}deg)`, transformOrigin: '50% 100%'}}>
						<Spr b={bowlBuf(fill)} s={24} />
					</div>
				)}
				{/* tazón entrando al horno: queda tapado por el cuerpo del horno */}
				{f >= T.y18 && f < T.plato && bx >= OVEN_X + 40 && (
					<div style={{position: 'absolute', left: OVEN_X + 3 * OVEN_S + winW / 2 - 11 * 7, top: oy + 10 * OVEN_S + winH - 10 * 7 - 12, opacity: tween(f, T.final18 + 14, T.final18 + 20)}}>
						<Spr b={bowlBuf(fill)} s={7} />
					</div>
				)}
				{/* ingredientes que caen */}
				{ING.map((g, i) => {
					const t = ING_T[i];
					const k = (f - t) / 11;
					if (k < 0 || k >= 1) return null;
					const y0 = -100;
					const y1 = BOWL_Y - 10 * 24 + 30;
					const y = y0 + (y1 - y0) * k * k;
					const w = g.b.w * g.sc;
					const h = g.b.h * g.sc;
					const rot = (1 - k) * (i - 1) * 40;
					return (
						<div key={i} style={{position: 'absolute', left: g.x - w / 2, top: y - h, transform: `rotate(${rot}deg)`, transformOrigin: '50% 50%'}}>
							<Spr b={g.b} s={g.sc} />
						</div>
					);
				})}
				{ING.map((g, i) => (
					<Tag key={g.nm} x={470} y={250} at={ING_T[i]} out={ING_T[i] + 10} size={46} color={g.col}>
						{g.nm}
					</Tag>
				))}
				{ING.map((g, i) => (
					<Splash key={i} x={g.x} y={BOWL_Y - 10 * 24 + 30} at={ING_T[i] + 11} color={g.fill} n={12} power={14} />
				))}
				{/* batidor */}
				{f >= T.pasos18 && f < T.y18 + 18 && (
					<div style={{position: 'absolute', left: BOWL_X - 7 * 22 / 2 + (1 - wIn) * 160 + 30, top: BOWL_Y - 100 - 17 * 22 - (1 - wIn) * 300 - wOut * 300, transform: `rotate(${wRot}deg)`, transformOrigin: '50% 90%', opacity: 1 - wOut}}>
						<Spr b={WHISK} s={22} />
					</div>
				)}
				{batir && <Tag x={BOWL_X} y={250} at={T.pasos18} out={T.y18} size={46} color={C.green}>BATIR</Tag>}
				{/* torta servida */}
				{f >= T.plato && (
					<div style={{position: 'absolute', left: BOWL_X - 11 * 18, top: BOWL_Y - 14 * 18 + 26 - (1 - pop(f, T.plato, 9, 260, 0.6)) * 260, transform: `scale(${0.7 + 0.3 * pop(f, T.plato, 9, 260, 0.6)})`, transformOrigin: '50% 100%'}}>
						<Spr b={CAKE} s={18} />
						<div style={{position: 'absolute', left: 5 * 18, top: 0}}>
							<Steam scale={18} n={4} w={12} />
						</div>
					</div>
				)}
				<Tag x={470} y={190} at={T.servido} size={54} color={C.green} rot={-3}>¡SERVIDO!</Tag>
				<PixelBurst f={f} at={T.plato} x={470} y={430} count={26} colors={['#FFFFFF', '#00C063', '#F2C230']} seed={11} power={20} />
			</PCam>
		</>
	);
};

/* ================================================================== V19 · suma */

const COL_T = 480;
const COL_U = 760;
const ROW_C = 110;
const ROW_1 = 290;
const ROW_2 = 470;
const LINE_Y = 555;
const ROW_R = 680;

const Dig: React.FC<{x: number; y: number; ch: string; at?: number; color?: string; size?: number; sc?: number; rot?: number; glow?: string}> = ({x, y, ch, at: a, color = C.white, size = 200, sc = 1, rot = 0, glow}) => {
	const f = useCurrentFrame();
	if (a !== undefined && f < a) return null;
	const p = a !== undefined ? pop(f, a, 10, 260, 0.55) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${(1.9 - 0.9 * p) * sc})`, opacity: Math.min(1, p * 3), fontFamily: MONO, fontWeight: 800, fontSize: size, lineHeight: 1, color, textShadow: glow ? `0 0 40px ${glow}, 0 0 16px ${glow}` : '0 6px 0 rgba(0,0,0,0.4)'}}>{ch}</div>
	);
};

const Suma: React.FC = () => {
	const f = useCurrentFrame();
	// banda de columna
	const bandOn = tween(f, T.primero, T.primero + 8);
	const bandX = COL_U + (COL_T - COL_U) * tween(f, T.luego, T.luego + 9, 0, 1, inOutCubic);
	const bandOff = 1 - tween(f, T.no19 - 6, T.no19);
	// pulsos de los dígitos sumados
	const pulse = (t: number) => (f >= t && f < t + 16 ? 1 + 0.3 * Math.sin(((f - t) / 16) * Math.PI) : 1);
	const uPulse = pulse(T.unidades);
	const dPulse = pulse(T.decenas);
	// llevada: vuelo del 1
	const k = tween(f, T.unidades + 12, T.unidades + 26, 0, 1, inOutCubic);
	const flying = f >= T.unidades + 12 && f < T.unidades + 26;
	const fx = 1166 + (COL_T - 1166) * k;
	const fy = ROW_1 + (ROW_C - ROW_1) * k - Math.sin(k * Math.PI) * 170;
	const landed = f >= T.unidades + 26;
	const landP = landed ? pop(f, T.unidades + 26, 7, 300, 0.45) : 0;
	// 1 que se menea y brilla
	const meneo = f >= T.no19 && f < T.llevas + 8;
	const wob = meneo ? Math.sin((f - T.no19) * 0.9) * 14 : 0;
	const brillo = meneo ? 0.7 + 0.3 * Math.sin((f - T.no19) * 0.7) : 0;
	// final
	const fin = f >= T.llevas;
	const lineW = tween(f, T.suma, T.suma + 9) * 700;
	return (
		<>
			<div style={{position: 'absolute', inset: 0, background: '#0F1511'}} />
			<Rejilla c="rgba(90,169,255,0.07)" size={60} />
			<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 56, background: 'rgba(226,70,62,0.35)'}} />
			<PCam
				shots={[
					[B0, 1, 655, 395],
					[T.primero, 1.1, 720, 410],
					[T.luego, 1.1, 640, 410],
					[T.no19, 1.45, 560, 280],
					[T.llevas, 1, 655, 395],
				]}
			>
				{/* banda de la columna activa */}
				{bandOn > 0 && bandOff > 0 && (
					<div style={{position: 'absolute', left: bandX - 125, top: 30, width: 250, height: 730, boxSizing: 'border-box', border: `5px dashed ${C.green}`, background: 'rgba(0,192,99,0.12)', transformOrigin: '50% 0', transform: `scaleY(${bandOn})`, opacity: bandOff}} />
				)}
				{/* operación */}
				<Dig x={COL_T} y={ROW_1} ch="4" at={T.resuelves} color={C.white} sc={dPulse} glow={dPulse > 1 ? C.green : undefined} />
				<Dig x={COL_U} y={ROW_1} ch="7" at={T.resuelves + 4} color={C.white} sc={uPulse} glow={uPulse > 1 ? C.green : undefined} />
				<Dig x={250} y={ROW_2} ch="+" at={T.una19} color={C.amber} size={170} />
				<Dig x={COL_T} y={ROW_2} ch="3" at={T.una19 + 4} color={C.white} sc={dPulse} glow={dPulse > 1 ? C.green : undefined} />
				<Dig x={COL_U} y={ROW_2} ch="8" at={T.una19 + 8} color={C.white} sc={uPulse} glow={uPulse > 1 ? C.green : undefined} />
				{f >= T.suma && <div style={{position: 'absolute', left: 170, top: LINE_Y, width: lineW, height: 10, background: C.white}} />}
				{/* resultado */}
				<Dig x={COL_U} y={ROW_R} ch="5" at={T.unidades + 8} color={fin ? C.green : C.white} glow={fin ? C.green : undefined} />
				<Dig x={COL_T} y={ROW_R} ch="8" at={T.decenas + 10} color={fin ? C.green : C.white} glow={fin ? C.green : undefined} />
				{fin && (
					<div style={{position: 'absolute', left: COL_T - 135, top: ROW_R - 100, width: 2 * 135 + (COL_U - COL_T), height: 200, boxSizing: 'border-box', border: `8px solid ${C.green}`, boxShadow: `0 0 50px ${C.green}88`, transform: `scale(${0.9 + 0.1 * pop(f, T.llevas, 9, 300, 0.5)})`, opacity: Math.min(1, (f - T.llevas + 1) / 3)}} />
				)}
				{/* notas de suma parcial */}
				<div style={{opacity: f >= T.no19 - 2 && f < T.llevas ? 0 : 1}}><Dig x={1060} y={ROW_1} ch="7+8=15" at={T.unidades} size={62} color={C.text} />
				<Dig x={1060} y={ROW_2} ch="4+3+1=8" at={T.decenas} size={62} color={C.text} /></div>
				{f >= T.unidades && f < T.unidades + 12 && <div style={{position: 'absolute', left: 1166 - 30, top: ROW_1 - 40, width: 60, height: 80, background: C.amber, opacity: 0.0}} />}
				{/* el 1 que se lleva */}
				{flying && <Dig x={fx} y={fy} ch="1" color={C.amber} size={120} sc={1 + 0.4 * Math.sin(k * Math.PI)} glow={C.amber} />}
				{landed && (
					<Dig x={COL_T} y={ROW_C} ch="1" color={C.amber} size={130} sc={(0.7 + 0.3 * landP) * (1 + (meneo ? 0.12 * brillo : 0))} rot={wob} glow={meneo ? C.amber : undefined} />
				)}
				{landed && <div style={{position: 'absolute', left: COL_T - 45, top: ROW_C + 62, width: 90, height: 6, background: C.amber, opacity: 0.8}} />}
				<Tag x={COL_T + 210} y={ROW_C} at={T.olvides} out={T.llevas + 6} size={52} color={C.amber} rot={-4}>+1</Tag>
				<Shockwave at={T.unidades + 26} x={COL_T} y={ROW_C} size={420} thick={12} dur={18} color={C.amber} />
			</PCam>
		</>
	);
};

/* ================================================================== V20 · ruta */

/** Carreteras: x de las verticales y y de las horizontales (centros), ancho 100. */
const RV = [150, 550, 950, 1250];
const RH = [300, 640];
const DEST: [number, number] = [950, 215];
const START: [number, number] = [150, 640];

const Ruta: React.FC = () => {
	const f = useCurrentFrame();
	// recorrido de la persona
	const t1 = T.cuadras + 5;
	const t2 = T.derecho + 8;
	const tTurn = T.izquierda;
	let px = START[0];
	let py = START[1];
	if (f >= T.dos) {
		const k1 = tween(f, T.dos, t1, 0, 1, inOutCubic);
		const k2 = tween(f, t1 + 2, t2, 0, 1, inOutCubic);
		const k3 = tween(f, tTurn + 2, T.llegaste, 0, 1, inOutCubic);
		px = START[0] + 400 * k1 + 400 * k2;
		py = START[1] + (DEST[1] - START[1]) * k3;
	}
	const moving = (f >= T.dos && f < t2 + 2) || (f >= tTurn + 2 && f < T.llegaste + 1);
	const step = moving ? Math.floor(f / 3) % 2 : 0;
	const bob = moving ? Math.abs(Math.sin(f * 0.8)) * 14 : 0;
	const pIn = pop(f, T.alguien, 10, 250, 0.6);
	// huellas
	const prints: [number, number][] = [];
	for (let x = START[0] + 60; x < px - 40 && x < 950; x += 70) prints.push([x, 640 + (Math.round(x / 70) % 2 ? 14 : -14)]);
	if (px >= 950) for (let y = 640 - 70; y > py + 40 && y > DEST[1]; y -= 70) prints.push([950 + (Math.round(y / 70) % 2 ? 14 : -14), y]);
	// camino dibujado
	const pathLen1 = Math.max(0, Math.min(800, px - START[0]));
	const pathLen2 = f >= tTurn + 2 ? START[1] - py : 0;
	const arrowP = pop(f, T.giras, 10, 260, 0.6);
	const flagP = pop(f, T.llegaste, 9, 280, 0.5);
	return (
		<>
			<div style={{position: 'absolute', inset: 0, background: '#0E130F'}} />
			<PCam
				shots={[
					[B0, 1, 655, 395],
					[T.dos, 1.3, 340, 560],
					[T.cuadras, 1.3, 830, 560, 26],
					[T.giras, 1.45, 950, 520],
					[T.izquierda + 3, 1.3, 950, 380, 28],
					[T.llegaste, 1.55, 950, 280],
				]}
			>
				{/* manzanas con casitas */}
				{[-1, 0, 1, 2, 3].map((ci) =>
					[-1, 0, 1].map((ri) => {
						const x0 = ci < 0 ? -50 : RV[ci] + 50;
						const x1 = ci >= RV.length - 1 ? PW + 50 : RV[ci + 1] - 50;
						const y0 = ri < 0 ? -50 : RH[ri] + 50;
						const y1 = ri >= RH.length - 1 ? PH + 50 : RH[ri + 1] - 50;
						if (ci >= 3) return null;
						const cols = ['#223229', '#2A3A32', '#1F2B3A', '#33332A', '#2E2438'];
						const w = x1 - x0;
						const h = y1 - y0;
						return (
							<div key={`${ci}-${ri}`} style={{position: 'absolute', left: x0, top: y0, width: w, height: h, background: '#161D18'}}>
								{[0, 1, 2, 3].map((q) => {
									const qx = (q % 2) * (w / 2) + 18;
									const qy = Math.floor(q / 2) * (h / 2) + 18;
									const hh = Math.max(40, h / 2 - 36);
									return (
										<div key={q} style={{position: 'absolute', left: qx, top: qy, width: w / 2 - 36, height: hh, background: cols[(ci * 3 + ri + q + 7) % cols.length], boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.3)'}}>
											<div style={{position: 'absolute', left: 12, top: 12, width: 14, height: 14, background: (ci + ri + q) % 2 ? '#F2C230' : '#2A3A32'}} />
											<div style={{position: 'absolute', right: 12, top: 12, width: 14, height: 14, background: (ci + q) % 2 ? '#2A3A32' : '#F2C230'}} />
										</div>
									);
								})}
							</div>
						);
					}),
				)}
				{/* calles */}
				{RV.map((x) => (
					<div key={x} style={{position: 'absolute', left: x - 50, top: 0, width: 100, height: PH, background: '#252E29', backgroundImage: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.28) 0 26px, transparent 26px 56px)', backgroundSize: '6px 100%', backgroundRepeat: 'no-repeat', backgroundPosition: '47px 0'}} />
				))}
				{RH.map((y) => (
					<div key={y} style={{position: 'absolute', left: 0, top: y - 50, width: PW, height: 100, background: '#252E29', backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0 26px, transparent 26px 56px)', backgroundSize: '100% 6px', backgroundRepeat: 'no-repeat', backgroundPosition: '0 47px'}} />
				))}
				{RV.flatMap((x) => RH.map((y) => <div key={`${x}-${y}`} style={{position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, background: '#252E29'}} />))}
				{/* ruta verde */}
				<div style={{position: 'absolute', left: START[0], top: 640 - 8, width: pathLen1, height: 16, background: C.green, opacity: 0.85, boxShadow: `0 0 20px ${C.green}`}} />
				<div style={{position: 'absolute', left: 950 - 8, top: 640 - pathLen2, width: 16, height: pathLen2 + 8, background: C.green, opacity: 0.85, boxShadow: `0 0 20px ${C.green}`}} />
				{prints.map(([x, y], i) => (
					<div key={i} style={{position: 'absolute', left: x - 8, top: y - 8, width: 16, height: 16, background: '#FFFFFF', opacity: 0.8}} />
				))}
				{/* destino */}
				{f >= T.llegar && f < T.llegaste && (
					<>
						<div style={{position: 'absolute', left: DEST[0] - 36, top: DEST[1] - 36, width: 72, height: 72, borderRadius: '50%', border: `8px dashed ${C.amber}`, transform: `scale(${1 + 0.1 * Math.sin(f / 4)})`}} />
						<div style={{position: 'absolute', left: DEST[0] - 40, top: DEST[1] - 140, fontFamily: MONO, fontWeight: 800, fontSize: 110, color: C.amber, textShadow: `0 0 24px ${C.amber}99`, transform: `scale(${pop(f, T.llegar, 10, 260, 0.6)})`}}>?</div>
					</>
				)}
				{f >= T.llegaste && (
					<div style={{position: 'absolute', left: DEST[0] - 6, top: DEST[1] + 30 - 16 * 10 * flagP, transform: `scaleY(${0.2 + 0.8 * flagP})`, transformOrigin: '0 100%'}}>
						<div style={{marginTop: 16 * 10 * (1 - flagP) * 0}}>
							<Spr b={FLAG} s={10} />
						</div>
					</div>
				)}
				{/* flecha de giro a la izquierda */}
				{f >= T.giras && f < T.izquierda + 40 && (
					<svg width="260" height="260" viewBox="0 0 260 260" style={{position: 'absolute', left: 950 - 130, top: 640 - 330, transform: `scale(${0.2 + 0.8 * arrowP})`, overflow: 'visible'}}>
						<path d="M150 250 L150 130 Q150 70 90 70 L70 70" fill="none" stroke={C.amber} strokeWidth="30" strokeLinecap="square" />
						<path d="M110 20 L40 70 L110 120 Z" fill={C.amber} />
					</svg>
				)}
				{/* persona */}
				{f >= T.alguien && (
					<div style={{position: 'absolute', left: px - 5 * 12, top: py - 15 * 12 - bob + (1 - pIn) * -260, transform: `scale(${0.6 + 0.4 * pIn})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.5))'}}>
						<Spr b={PERSON[step]} s={12} />
					</div>
				)}
				<Tag x={START[0]} y={START[1] - 150} at={T.te} out={T.dos} size={44} color={C.green}>TÚ</Tag>
				{/* contadores */}
				{f >= t1 && f < t2 + 40 && (
					<div style={{position: 'absolute', left: 550 - 50, top: 640 - 330, width: 100, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 150, color: C.green, textShadow: `0 0 26px ${C.green}99, 0 5px 0 rgba(0,0,0,0.5)`, transform: `scale(${0.3 + 0.7 * pop(f, t1, 9, 280, 0.5)})`, opacity: f > t2 - 4 ? 1 - tween(f, t2 - 4, t2 + 2) : 1}}>1</div>
				)}
				{f >= t2 && f < T.giras + 20 && (
					<div style={{position: 'absolute', left: 950 - 190, top: 640 - 330, width: 100, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 150, color: C.green, textShadow: `0 0 26px ${C.green}99, 0 5px 0 rgba(0,0,0,0.5)`, transform: `scale(${0.3 + 0.7 * pop(f, t2, 9, 280, 0.5)})`}}>2</div>
				)}
				<Tag x={1130} y={560} at={T.izquierda} out={T.llegaste - 4} size={44} color={C.blue}>IZQUIERDA</Tag>
				<Tag x={DEST[0] - 330} y={DEST[1] + 60} at={T.llegaste + 6} size={50} color={C.green} rot={4}>¡LLEGASTE!</Tag>
				<Shockwave at={T.llegaste} x={DEST[0]} y={DEST[1]} size={520} thick={12} dur={22} />
			</PCam>
		</>
	);
};

/* ================================================================== V21 · máquina expendedora */

const CELL_X = [192, 357];
const CELL_Y = [190, 350, 510];
const CELLS: {k: keyof typeof BAGS; cx: number; cy: number}[] = [
	{k: 'A1', cx: CELL_X[0], cy: CELL_Y[0]}, {k: 'A2', cx: CELL_X[1], cy: CELL_Y[0]},
	{k: 'B1', cx: CELL_X[0], cy: CELL_Y[1]}, {k: 'B2', cx: CELL_X[1], cy: CELL_Y[1]},
	{k: 'C1', cx: CELL_X[0], cy: CELL_Y[2]}, {k: 'C2', cx: CELL_X[1], cy: CELL_Y[2]},
];
const KEYS: {t: string; x: number; y: number}[] = [
	{t: 'A1', x: 508, y: 250}, {t: 'A2', x: 572, y: 250}, {t: 'B1', x: 508, y: 320}, {t: 'B2', x: 572, y: 320}, {t: 'C1', x: 508, y: 390}, {t: 'C2', x: 572, y: 390},
];
const SLOT_XY: [number, number] = [540, 480];
const BAY_Y = 735; // suelo de la bandeja
const ROBOT_MX = 850;

const Maquina: React.FC = () => {
	const f = useCurrentFrame();
	// estados de la pantalla grande
	const tB2 = T.producto;
	const tCoin = T.pagas + 14; // la moneda entra en la ranura
	const state = f >= T.sale ? 'ok' : f >= T.si21 ? 'alcanza' : f >= tCoin ? 'pago' : f >= tB2 ? 'b2' : 'elige';
	const blink = Math.floor(f / 5) % 2 === 0;
	const scrCol = state === 'ok' ? C.green : state === 'alcanza' ? C.amber : state === 'pago' ? C.blue : C.white;
	const sign = f >= T.maquina;
	// cursor de selección
	const hops = [0, 6, 12, 18].map((d) => T.eliges + d);
	let cur = -1;
	hops.forEach((t, i) => {
		if (f >= t) cur = [0, 1, 2, 3][i];
	});
	const curCell = cur >= 0 ? CELLS[cur] : null;
	const press = f >= tB2 ? Math.max(0, 1 - (f - tB2) / 14) : 0;
	// moneda: cae desde arriba hasta la ranura
	const ck = (f - T.pagas) / 14;
	// paquete: cae de B2 a la bandeja
	const fallT = T.paquete - 14;
	const pk = (f - fallT) / 14;
	const bagCx = CELLS[3].cx;
	const bagY = CELLS[3].cy + 75 + (BAY_Y - (CELLS[3].cy + 75)) * Math.max(0, Math.min(1, pk)) ** 2;
	const caught = f >= T.paquete + 8;
	// robot
	const rp = pop(f, T.tu21, 12, 200, 0.7);
	const ry = 905 + (1 - rp) * 330;
	const reachK = tween(f, T.paquete, T.paquete + 8) - tween(f, T.paquete + 10, T.paquete + 24);
	const bayPt: [number, number] = [400, 685];
	const rest = robotRest(ROBOT_MX, ry, 'F', 10, true);
	const hand = lerpPt(rest, bayPt, Math.max(0, reachK));
	const holding = caught;
	// temblor del producto antes de caer
	const tremor = f >= T.sale && f < fallT ? Math.sin(f * 2.4) * 5 : 0;
	return (
		<>
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #121A15 0%, #0E130F 100%)'}} />
			<Rejilla c="rgba(255,255,255,0.03)" size={66} />
			<PCam
				shots={[
					[B0, 1, 655, 395],
					[T.eliges, 1.25, 680, 360],
					[T.pagas, 1.3, 700, 360, 14],
					[T.si21, 1.4, 780, 300, 40],
					[T.sale, 1.0, 655, 395, 12],
					[T.paquete - 6, 1.25, 640, 560, 18],
				]}
			>
				{/* cuerpo de la máquina */}
				<div style={{position: 'absolute', left: 80, top: 20, width: 540, height: 750, background: '#A8302A', boxShadow: 'inset 0 0 0 8px #E2463E, 18px 22px 0 rgba(0,0,0,0.45)'}} />
				<div style={{position: 'absolute', left: 110, top: 34, width: 330, height: 60, background: '#0B0F0D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: '0.12em', color: sign ? '#FFD84A' : '#5B4030', textShadow: sign ? '0 0 22px #FFD84A' : 'none', opacity: sign ? (blink || f > T.maquina + 20 ? 1 : 0.6) : 1}}>SNACKS</div>
				{/* escaparate */}
				<div style={{position: 'absolute', left: 110, top: 110, width: 330, height: 480, background: '#12384E', boxShadow: 'inset 0 0 0 8px #0B0F0D, inset 0 0 60px rgba(90,169,255,0.25)'}} />
				{CELL_Y.map((y) => (
					<div key={y} style={{position: 'absolute', left: 118, top: y + 75, width: 314, height: 10, background: '#8A6446'}} />
				))}
				{CELLS.map((c, i) => {
					const isHero = i === 3;
					if (isHero && f >= fallT) return null;
					const w = 10 * 10;
					const enter = pop(f, B0 + 6 + i * 3, 10, 240, 0.7);
					return (
						<div key={c.k} style={{position: 'absolute', left: c.cx - w / 2 + (isHero ? tremor : 0), top: c.cy - 65 - (1 - enter) * 300, opacity: Math.min(1, enter * 2)}}>
							<Spr b={BAGS[c.k]} s={10} />
						</div>
					);
				})}
				{curCell && f < tB2 + 30 && (
					<div style={{position: 'absolute', left: curCell.cx - 80, top: curCell.cy - 75, width: 160, height: 150, boxSizing: 'border-box', border: `6px solid ${C.green}`, boxShadow: `0 0 26px ${C.green}`, background: 'rgba(0,192,99,0.12)', opacity: 1 - tween(f, tB2 + 18, tB2 + 30)}} />
				)}
				{/* panel de control */}
				<div style={{position: 'absolute', left: 462, top: 110, width: 140, height: 480, background: '#39423E', boxShadow: 'inset 0 0 0 5px #0B0F0D'}} />
				<div style={{position: 'absolute', left: 474, top: 124, width: 116, height: 70, background: '#0B0F0D', border: `4px solid ${scrCol}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 40, color: scrCol, textShadow: `0 0 10px ${scrCol}`}}>
					{state === 'elige' ? '--' : state === 'b2' ? 'B2' : state === 'pago' ? '$$' : state === 'alcanza' ? (blink ? '?' : ' ') : '✓'}
				</div>
				{KEYS.map((k) => {
					const isB2 = k.t === 'B2';
					const down = isB2 && f >= tB2;
					return (
						<div key={k.t} style={{position: 'absolute', left: k.x - 28, top: k.y - 28 + (down ? 6 : 0), width: 56, height: 56, boxSizing: 'border-box', background: down ? C.green : '#C9D3CE', boxShadow: down ? `0 0 ${30 * press + 8}px ${C.green}` : '0 6px 0 #6B7570', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 26, color: C.bg}}>{k.t}</div>
					);
				})}
				<div style={{position: 'absolute', left: SLOT_XY[0] - 44, top: SLOT_XY[1] - 10, width: 88, height: 20, background: '#0B0F0D', boxShadow: `0 0 0 5px #8E9A94${f >= T.pagas && f < tCoin + 10 ? `, 0 0 24px ${C.amber}` : ''}`}} />
				{/* bandeja */}
				<div style={{position: 'absolute', left: 110, top: 630, width: 330, height: 120, background: '#0B0F0D', boxShadow: 'inset 0 0 0 6px #5B4030'}} />
				{/* moneda cayendo */}
				{ck >= 0 && ck < 1 && (
					<div style={{position: 'absolute', left: SLOT_XY[0] - 9 * 6 * Math.abs(Math.cos(ck * 14)), top: -80 + (SLOT_XY[1] - 10 + 80 - 54) * ck * ck, transform: `scaleX(${Math.max(0.15, Math.abs(Math.cos(ck * 14)))})`, transformOrigin: '50% 50%'}}>
						<Spr b={COIN} s={6} />
					</div>
				)}
				{/* paquete cayendo y en bandeja */}
				{f >= fallT && !caught && (
					<div style={{position: 'absolute', left: bagCx - 50, top: bagY - 140 + (pk > 1 ? -Math.abs(Math.sin((f - fallT - 14) * 0.6)) * 18 * Math.max(0, 1 - (f - fallT - 14) / 8) : 0), transform: `rotate(${(1 - Math.min(1, Math.max(0, pk))) * -8}deg)`}}>
						<Spr b={BAGS.B2} s={10} />
					</div>
				)}
				{/* pantalla grande */}
				<div style={{position: 'absolute', left: 690, top: 40, width: 520, height: 420, boxSizing: 'border-box', background: '#0B0F0D', border: `10px solid ${scrCol}`, boxShadow: `0 0 ${state === 'alcanza' ? 70 : 40}px ${scrCol}77, inset 0 0 60px ${scrCol}22`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transform: `scale(${state === 'alcanza' ? 1 + 0.025 * Math.sin(f / 3) : 1})`}}>
					<div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0 2px, transparent 2px 6px)'}} />
					{state === 'elige' && <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.dim, opacity: blink ? 1 : 0.4}}>ELIGE_</div>}
					{state === 'b2' && <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 250, lineHeight: 1, color: C.white, transform: `scale(${0.5 + 0.5 * pop(f, tB2, 9, 300, 0.5)})`}}>B2</div>}
					{state === 'pago' && (
						<div style={{display: 'flex', gap: 24, alignItems: 'center', transform: `scale(${0.5 + 0.5 * pop(f, tCoin, 9, 300, 0.5)})`}}>
							<Spr b={COIN} s={20} />
							<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 110, color: C.blue}}>PAGO</div>
						</div>
					)}
					{state === 'alcanza' && <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 80, color: C.amber, opacity: blink ? 1 : 0.18, textShadow: `0 0 30px ${C.amber}`}}>¿ALCANZA?</div>}
					{state === 'ok' && <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 300, lineHeight: 1, color: C.green, textShadow: `0 0 50px ${C.green}`, transform: `scale(${0.4 + 0.6 * pop(f, T.sale, 8, 300, 0.5)})`}}>✓</div>}
				</div>
				{/* robot que asoma por abajo */}
				<Robot x={ROBOT_MX} y={ry} scale={10} flip pose="idle" face={caught ? 'proud' : 'focus'} look={[-1, 1]} chest={caught ? '✓' : '·'} reachF={reachK > 0 || caught ? hand : null} holdF={holding ? <Spr b={BAGS.B2} s={7} /> : undefined} hops={[T.paquete + 26]} />
			</PCam>
		</>
	);
};

/* ================================================================== V22 · mosaico y taza */

const Mosaico: React.FC = () => {
	const f = useCurrentFrame();
	const tIn = [T.todos22 + 9, T.tienen + 3, T.pasos22, T.ordenados];
	const cupP = pop(f, T.volvamos, 10, 280, 0.5);
	const grow = tween(f, T.nuestro, T.fin22 + 16, 0, 1, inOutCubic);
	const sc = 1 + 2.75 * grow;
	const ccx = 1220 + (960 - 1220) * grow;
	const ccy = 510 + (540 - 510) * grow;
	const chips: [string, number][] = [['1', T.pasos22], ['2', T.pasos22 + 3], ['3', T.pasos22 + 6]];
	const flagsT = [0, 1, 2, 3].map((i) => T.final22 + i * 5);
	return (
		<>
			{/* fichas 1 2 3 + bandera */}
			{chips.map(([n, t], i) => (
				<Slam key={n} at={t} x={110 + i * 128} y={160} from={2.4} rot={-6 + i * 5}>
					<div style={{width: 108, height: 108, boxSizing: 'border-box', border: `6px solid ${C.green}`, background: 'rgba(0,192,99,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 76, color: C.white}}>{n}</div>
				</Slam>
			))}
			<Slam at={T.final22} x={110 + 3 * 128 + 8} y={160} from={2.6} rot={5}>
				<div style={{width: 108, height: 108, boxSizing: 'border-box', border: `6px solid ${C.white}`, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Spr b={FLAG} s={5} />
				</div>
			</Slam>
			<Slam at={T.final22 + 6} x={290} y={330} from={2.4} rot={-3}>
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.green, textShadow: `0 0 36px ${C.green}77`, whiteSpace: 'nowrap'}}>= ALGORITMO</div>
			</Slam>
			{/* tarjetas */}
			{ICONS.map((ic, i) => {
				const t = tIn[i];
				if (f < t) return null;
				const p = pop(f, t, 10, 260, 0.6);
				const [x, y] = TILES[i];
				const ft = flagsT[i];
				return (
					<div key={i} style={{position: 'absolute', left: x, top: y, width: TILE_W, height: TILE_H, boxSizing: 'border-box', border: `6px solid ${f >= ft ? C.green : C.line2}`, background: 'rgba(14,17,15,0.96)', boxShadow: `0 20px 40px rgba(0,0,0,0.5)${f >= ft ? `, 0 0 40px ${C.green}55` : ''}`, transform: `scale(${0.3 + 0.7 * p})`, opacity: Math.min(1, p * 3)}}>
						<div style={{position: 'absolute', left: 40, top: 70}}>
							<Spr b={ic.b} s={ic.s} />
						</div>
						<div style={{position: 'absolute', right: 30, top: 40, fontFamily: MONO, fontWeight: 800, fontSize: 58, color: C.white, letterSpacing: '0.03em'}}>{ic.label}</div>
					</div>
				);
			})}
			{TILES.map(([x, y], i) => (
				<Slam key={i} at={flagsT[i]} x={x + 520} y={y + 280} from={3} rot={-8}>
					<Spr b={FLAG} s={9} />
				</Slam>
			))}
			{flagsT.map((t, i) => (
				<Shockwave key={i} at={t} x={TILES[i][0] + 520} y={TILES[i][1] + 280} size={380} thick={10} dur={18} />
			))}
			{/* quinta ficha: el café */}
			{f >= T.volvamos && (
				<div style={{position: 'absolute', left: ccx, top: ccy, width: 600, height: 440, transform: `translate(-50%, -50%) scale(${sc * (grow > 0 ? 1 : 0.4 + 0.6 * cupP + (1 - cupP) * 2)})`, transformOrigin: '50% 50%', opacity: Math.min(1, (f - T.volvamos + 1) / 3)}}>
					<div style={{position: 'absolute', inset: 0, boxSizing: 'border-box', border: `${6}px solid ${C.green}`, background: '#1E130C', boxShadow: `0 0 90px ${C.green}77, 0 30px 80px rgba(0,0,0,0.6)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26}}>
						<div style={{position: 'relative', marginTop: 40}}>
							<Cup fill="latte" steam scale={22} />
						</div>
						<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 76, color: '#FFD9A8', letterSpacing: '0.06em'}}>CAFÉ</div>
					</div>
				</div>
			)}
		</>
	);
};

/* ================================================================== montaje */

const CUT = {r: T.v18, s: T.v19, ru: T.v20, m: T.v21, mo: T.v22};
const ACTS: [number, VeeAct, number?][] = [
	[T.palabra, 'explicar', 3],
	[T.tu, 'senalar', 2],
	[T.todos17, 'sorpresa', 2],
	[T.receta, 'explicar', 3],
	[T.ing, 'senalar', 2],
	[T.pasos18, 'explicar', 3],
	[T.plato, 'celebrar', 2],
	[T.suma, 'explicar', 3],
	[T.primero, 'senalar', 2],
	[T.luego, 'senalar', 2],
	[T.no19, 'sorpresa', 2],
	[T.llevas, 'celebrar', 2.2],
	[T.alguien, 'pensar', 2.5],
	[T.dos, 'senalar', 2],
	[T.giras, 'senalar', 2],
	[T.llegaste, 'celebrar', 2.2],
	[T.maquina, 'senalar', 2],
	[T.eliges, 'explicar', 3],
	[T.si21, 'pensar', 2.5],
	[T.sale, 'sorpresa', 2],
	[T.paquete, 'celebrar', 2.2],
	[T.todos22, 'explicar', 3],
	[T.final22, 'senalar', 2],
	[T.ahora, 'celebrar', 2.2],
	[T.volvamos, 'saludar', 2],
];

export const B3: React.FC = () => {
	return (
		<AbsoluteFill>
			<Board />
			{/* V17 */}
			<Seg a={B0} b={CUT.r}>
				<Intro />
			</Seg>
			{/* V18 · receta */}
			<Seg a={CUT.r} b={CUT.s}>
				<Titulo a={CUT.r + 8} text="RECETA" />
				<Pasos a={CUT.r + 10} items={[['INGREDIENTES', T.ing], ['PASOS', T.pasos18], ['PLATO SERVIDO', T.plato]]} />
				<Marco a={CUT.r + 2} shakes={[T.ing + 11, T.ing + 21, T.ing + 31, T.plato]}>
					<Receta />
				</Marco>
			</Seg>
			{/* V19 · suma */}
			<Seg a={CUT.s} b={CUT.ru}>
				<Titulo a={CUT.s + 8} text="SUMA" />
				<Pasos a={CUT.s + 10} items={[['UNIDADES', T.unidades], ['DECENAS', T.decenas], ['LO QUE LLEVAS', T.llevas]]} />
				<Marco a={CUT.s + 2} shakes={[T.unidades + 8, T.unidades + 26, T.decenas + 10, T.llevas]}>
					<Suma />
				</Marco>
			</Seg>
			{/* V20 · ruta */}
			<Seg a={CUT.ru} b={CUT.m}>
				<Titulo a={CUT.ru + 3} text="RUTA" />
				<Pasos a={CUT.ru + 5} items={[['2 CUADRAS', T.derecho], ['IZQUIERDA', T.izquierda], ['LLEGASTE', T.llegaste]]} />
				<Marco a={CUT.ru + 3} shakes={[T.llegaste]}>
					<Ruta />
				</Marco>
			</Seg>
			{/* V21 · máquina */}
			<Seg a={CUT.m} b={CUT.mo}>
				<Titulo a={CUT.m + 8} text="MÁQUINA" />
				<Pasos a={CUT.m + 10} items={[['ELIGES', T.producto], ['PAGAS', T.pagas], ['TU PAQUETE', T.paquete]]} />
				<Marco a={CUT.m + 2} shakes={[T.producto, T.pagas + 14, T.sale, T.paquete]}>
					<Maquina />
				</Marco>
			</Seg>
			{/* V22 · mosaico */}
			<Seg a={CUT.mo} b={B1}>
				<Mosaico />
			</Seg>
			<Vee x={VX} acts={ACTS} hops={[CUT.r + 10, CUT.s + 10, CUT.ru + 8, CUT.m + 10, CUT.mo + 10]} />
			<Overlays />
		</AbsoluteFill>
	);
};

/** Transiciones de impacto y remates (todo en coordenadas de pantalla, fuera de los paneles). */
const Overlays: React.FC = () => {
	return (
		<>
			{/* cortes entre ejemplos */}
			<Barrido at={CUT.r} dur={18} />
			<WipeBar at={CUT.s - 6} dur={12} />
			<CutFlash at={CUT.s} len={5} max={0.9} />
			<CutFlash at={CUT.ru} len={5} max={0.8} />
			<Shockwave at={CUT.ru + 3} x={290} y={150} size={900} thick={18} dur={24} />
			<GlitchBurst at={CUT.m - 6} len={9} intensity={1.3} />
			<CutFlash at={CUT.m} len={5} max={0.9} />
			<Barrido at={CUT.mo} dur={18} dir={-1} colors={[C.white, '#0B0F0D', C.green]} />
			{/* V17 */}
			<Hit at={T.compu} x={960} y={460} />
			<SpeedLines at={T.tu} len={10} mode="h" />
			<Hit at={T.tu + 2} x={1170} y={330} />
			<Hit at={T.todos17 + 3} x={1220} y={500} big />
			{/* V18 */}
			<Hit at={T.plato} {...{x: G(470, 480)[0], y: G(470, 480)[1]}} big />
			{/* V19 */}
			<Hit at={T.llevas} x={G(620, 680)[0]} y={G(620, 680)[1]} big />
			{/* V20 */}
			<Hit at={T.llegaste} x={G(950, 215)[0]} y={G(950, 215)[1]} big />
			{/* V21 */}
			<SpeedLines at={T.sale} len={9} mode="radial" x={G(1000, 250)[0]} y={G(1000, 250)[1]} color={C.green} />
			<Hit at={T.sale} x={G(1000, 250)[0]} y={G(1000, 250)[1]} />
			<Hit at={T.paquete} x={G(300, 700)[0]} y={G(300, 700)[1]} big />
			{/* V22 */}
			<Hit at={T.volvamos} x={1220} y={510} big />
			<SpeedLines at={T.volvamos} len={10} mode="radial" x={1220} y={510} />
		</>
	);
};

/* ================================================================== sonido */

export const sfxB3: Sfx[] = [
	// V17
	s(T.compu, 'hit', 0.4), s(T.compu - 1, 'flash', 0.25),
	s(T.tu - 2, 'whoosh', 0.4), s(T.tu + 2, 'hit', 0.4),
	s(T.algoritmos, 'hit', 0.32),
	s(T.todos17, 'whoosh', 0.3), s(T.todos17 + 3, 'pop', 0.3), s(T.todos17 + 9, 'pop', 0.3), s(T.dias17 + 1, 'pop', 0.3), s(T.dias17 + 7, 'pop', 0.3),
	// corte a la receta
	s(CUT.r - 8, 'whoosh', 0.4),
	s(CUT.r + 8, 'hit', 0.35),
	// V18
	s(T.ing, 'check', 0.3), s(T.ing + 11, 'plop', 0.3), s(T.ing + 21, 'plop', 0.3), s(T.ing + 31, 'splash', 0.28),
	s(T.pasos18, 'check', 0.3), s(T.pasos18 + 4, 'stir', 0.3, 40),
	s(T.y18, 'slide', 0.3), s(T.final18, 'whoosh', 0.28), s(T.final18 + 16, 'servo', 0.22),
	s(T.plato, 'check', 0.32), s(T.plato + 3, 'hit', 0.4), s(T.plato + 8, 'sparkle', 0.3), s(T.servido, 'pop', 0.3),
	// corte a la suma
	s(CUT.s - 6, 'whoosh', 0.4), s(CUT.s, 'flash', 0.3),
	s(CUT.s + 8, 'hit', 0.3),
	// V19
	s(T.resuelves, 'key', 0.3), s(T.resuelves + 4, 'key', 0.3), s(T.una19, 'key', 0.3), s(T.una19 + 4, 'key', 0.3), s(T.una19 + 8, 'key', 0.3),
	s(T.suma, 'draw', 0.3),
	s(T.primero, 'slide', 0.25),
	s(T.unidades, 'check', 0.3), s(T.unidades + 8, 'land', 0.35), s(T.unidades + 26, 'boing', 0.35),
	s(T.luego, 'slide', 0.25),
	s(T.decenas, 'check', 0.3), s(T.decenas + 10, 'land', 0.35),
	s(T.no19, 'wobble', 0.3), s(T.olvides + 4, 'pop', 0.3),
	s(T.llevas, 'check', 0.32), s(T.llevas + 2, 'hit', 0.4), s(T.llevas + 8, 'ac', 0.3),
	// corte a la ruta
	s(CUT.ru, 'flash', 0.3), s(CUT.ru + 3, 'hit', 0.4),
	// V20
	s(T.alguien, 'pop', 0.3), s(T.te, 'pop', 0.25), s(T.lugar, 'pop', 0.25),
	s(T.dos, 'whoosh', 0.25), s(T.cuadras + 5, 'blip', 0.3), s(T.derecho + 8, 'blip', 0.3), s(T.derecho, 'check', 0.28),
	s(T.giras, 'slide', 0.3), s(T.izquierda, 'check', 0.28), s(T.izquierda + 4, 'whoosh', 0.25),
	s(T.llegaste, 'check', 0.3), s(T.llegaste + 2, 'hit', 0.4), s(T.llegaste + 8, 'fanfare', 0.3),
	// corte a la máquina
	s(CUT.m - 6, 'glitch', 0.35), s(CUT.m, 'flash', 0.3),
	s(CUT.m + 8, 'hit', 0.3),
	// V21
	s(T.maquina, 'rise', 0.3), s(T.maquina + 4, 'blip', 0.3),
	s(T.eliges, 'key', 0.22), s(T.eliges + 6, 'key', 0.22), s(T.eliges + 12, 'key', 0.22), s(T.eliges + 18, 'key', 0.22),
	s(T.producto, 'check', 0.3), s(T.producto + 2, 'hit', 0.3),
	s(T.pagas, 'check', 0.3), s(T.pagas + 14, 'plop', 0.35), s(T.pagas + 17, 'blip', 0.3),
	s(T.si21, 'riser', 0.3), s(T.alcanza, 'ticks', 0.22),
	s(T.sale, 'ac', 0.4), s(T.sale + 2, 'hit', 0.3),
	s(T.paquete - 14, 'servo', 0.22), s(T.tu21, 'pop', 0.3), s(T.paquete, 'land', 0.4), s(T.paquete + 1, 'check', 0.3), s(T.paquete + 8, 'plop', 0.28), s(T.paquete + 20, 'sparkle', 0.28),
	// corte al mosaico
	s(CUT.mo - 8, 'whoosh', 0.4),
	// V22
	s(T.todos22 + 9, 'pop', 0.3), s(T.tienen + 3, 'pop', 0.3), s(T.pasos22, 'pop', 0.3), s(T.pasos22 + 3, 'pop', 0.25), s(T.pasos22 + 6, 'pop', 0.25), s(T.ordenados, 'pop', 0.3),
	s(T.final22, 'hit', 0.35), s(T.final22 + 5, 'land', 0.3), s(T.final22 + 10, 'land', 0.3), s(T.final22 + 15, 'land', 0.3),
	s(T.volvamos - 2, 'riser', 0.25), s(T.volvamos, 'hit', 0.45), s(T.volvamos + 2, 'flash', 0.25),
	s(T.nuestro, 'rise', 0.3), s(T.cafe, 'sparkle', 0.3),
];
