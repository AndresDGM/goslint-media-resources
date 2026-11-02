import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Buf, PixelSprite} from './pixel';
import {Etiqueta} from './etiqueta';
import {C, H, MONO, SANS, W} from './theme';

/* ------------------------------------------------------------------ fondo */

const hexPoints = (cx: number, cy: number, r: number) =>
	Array.from({length: 6}, (_, i) => {
		const a = (Math.PI / 180) * (60 * i - 90);
		return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
	}).join(' ');

/** Fondo: rejilla tenue, brillo verde, hexágonos de contorno, grano y viñeta. */
export const Backdrop: React.FC<{cx: number; cy: number; r?: number}> = ({cx, cy, r = 205}) => (
	<AbsoluteFill style={{background: C.bg}}>
		<AbsoluteFill
			style={{
				backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
				backgroundSize: '80px 80px',
				maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, #000 25%, transparent 100%)',
				WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, #000 25%, transparent 100%)',
			}}
		/>
		<AbsoluteFill style={{background: `radial-gradient(ellipse 620px 440px at ${cx}px ${cy}px, rgba(0,192,99,0.17), transparent 72%)`}} />
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<polygon points={hexPoints(cx, cy, r)} fill="none" stroke="rgba(0,192,99,0.22)" strokeWidth={1.5} />
			<polygon points={hexPoints(cx, cy, r * 1.6)} fill="none" stroke="rgba(0,192,99,0.08)" strokeWidth={1.5} />
		</svg>
		<AbsoluteFill style={{opacity: 0.07}}>
			<Img src={staticFile('fx/grain0.png')} style={{width: '100%', height: '100%'}} />
		</AbsoluteFill>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)'}} />
	</AbsoluteFill>
);

/* ------------------------------------------------------------------ cabecera y terminales */

const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, ...extra});

export const Header: React.FC = () => (
	<>
		<div style={abs(94, 74, {display: 'flex', alignItems: 'center', gap: 16, fontFamily: MONO, fontSize: 19, letterSpacing: '0.14em', color: C.dim})}>
			<span style={{width: 12, height: 12, borderRadius: 6, background: C.green}} />
			goslint@uceva
		</div>
		<div style={abs(0, 74, {right: 94, left: 'auto', fontFamily: MONO, fontSize: 19, letterSpacing: '0.15em', color: C.dim, whiteSpace: 'nowrap'})}>
			ICPC · ALGORITMOS · ESTRUCTURAS DE DATOS · MATEMÁTICAS
		</div>
	</>
);

const g = (t: string) => <span style={{color: 'rgba(0,192,99,0.55)'}}>{t}</span>;

/** Código tenue arriba a la izquierda y salida del juez arriba a la derecha. */
export const Terminals: React.FC<{top?: number}> = ({top = 168}) => {
	const base: React.CSSProperties = {fontFamily: MONO, fontSize: 17, lineHeight: '30px', whiteSpace: 'pre', color: 'rgba(233,238,234,0.34)'};
	return (
		<>
			<div style={abs(94, top, base)}>
				{g('#include')} {'<bits/stdc++.h>'}
				{'\n'}
				{g('using namespace')} std;{'\n'}
				{g('int')} main() {'{'}
				{'\n'}
				{'    ios::sync_with_stdio('}
				{g('0')}
				{');\n'}
				{'    '}
				{g('int')} t; cin {'>>'} t;
			</div>
			<div style={abs(0, top, {...base, right: 94, left: 'auto', textAlign: 'right'})}>
				$ g++ -O2 -std=c++17 sol.cpp -o sol{'\n'}$ ./sol &lt; in.txt{'\n'}
				{g('✓')} test 1 … {g('42 passed')}
				{'\n'}veredicto: {g('Accepted')}
			</div>
		</>
	);
};

/* ------------------------------------------------------------------ marca */

const MARK_RATIO = 1553 / 1796;
const WORD_RATIO = 3346 / 477;

export const Mark: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => (
	<div style={abs(x, y, {width: h * MARK_RATIO, height: h, filter: 'drop-shadow(0 0 22px rgba(0,192,99,0.35))'})}>
		<Img src={staticFile('brand/mark_white.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
		<Img src={staticFile('brand/mark_green.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
	</div>
);

/** Bloque de texto de la marca: etiqueta, wordmark, lema y tarjeta UCEVA. `x`, `y` = esquina superior izquierda. */
export const TitleBlock: React.FC<{x: number; y: number; wordH?: number}> = ({x, y, wordH = 70}) => (
	<>
		<div style={abs(x, y, {fontFamily: MONO, fontSize: 19, letterSpacing: '0.14em', color: C.green, whiteSpace: 'nowrap'})}>&gt; SEMILLERO DE INVESTIGACIÓN_</div>
		<Img src={staticFile('brand/word_white.png')} style={abs(x, y + 29, {height: wordH, width: wordH * WORD_RATIO})} />
		<div style={abs(x, y + 29 + wordH + 14, {fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '-0.02em', color: C.white, whiteSpace: 'nowrap'})}>
			Programación <span style={{color: C.green}}>competitiva</span>
		</div>
		<div style={abs(x - 1, y + 29 + wordH + 82, {width: 219, height: 85, boxSizing: 'border-box', background: C.white, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4})}>
			<Img src={staticFile('brand/uceva.png')} style={{width: '100%', height: 'auto'}} />
		</div>
		<div style={abs(x + 240, y + 29 + wordH + 100, {fontFamily: MONO, fontSize: 19, lineHeight: '28px', color: C.text, whiteSpace: 'nowrap'})}>
			Ingeniería de Sistemas
			<div style={{color: C.dim}}>Tuluá · Valle del Cauca</div>
		</div>
	</>
);

/* ------------------------------------------------------------------ marcador y veredictos */

export const VERDICT = {
	AC: {bg: C.green, fg: '#001a0c'},
	WA: {bg: C.red, fg: '#2a0005'},
	TLE: {bg: C.amber, fg: '#2a1800'},
	RTE: {bg: C.purple, fg: '#160026'},
} as const;
export type Veredicto = keyof typeof VERDICT;

export const Chip: React.FC<{kind: Veredicto; size: number}> = ({kind, size}) => (
	<span style={{display: 'inline-block', fontFamily: MONO, fontWeight: 800, fontSize: size, background: VERDICT[kind].bg, color: VERDICT[kind].fg, padding: `${size * 0.18}px ${size * 0.42}px`, borderRadius: size * 0.16, letterSpacing: '0.04em', lineHeight: 1.2}}>{kind}</span>
);

const FILAS: [string, Veredicto, string][] = [
	['A', 'AC', '0:12'],
	['B', 'AC', '0:47'],
	['C', 'WA', '+1'],
	['D', 'TLE', '+2'],
	['E', 'AC', '2:58'],
];

export const Marcador: React.FC<{x: number; y: number}> = ({x, y}) => (
	<>
		<div style={abs(x, y, {fontFamily: MONO, fontSize: 15, letterSpacing: '0.18em', color: C.green, whiteSpace: 'nowrap'})}>{'// MARCADOR'}</div>
		{FILAS.map(([l, k, t], i) => (
			<div key={l} style={abs(x, y + 29 + i * 39, {display: 'flex', alignItems: 'center', height: 30, fontFamily: MONO, fontSize: 19, whiteSpace: 'nowrap'})}>
				<span style={{width: 34, color: C.white, fontWeight: 700}}>{l}</span>
				<span style={{width: 51}}>
					<Chip kind={k} size={15} />
				</span>
				<span style={{color: C.dim}}>{t}</span>
			</div>
		))}
	</>
);

export const VeredictosFila: React.FC<{cy: number; size?: number}> = ({cy, size = 24}) => (
	<div style={abs(0, cy - size, {width: W, display: 'flex', justifyContent: 'center', gap: size * 0.9})}>
		{(['AC', 'WA', 'TLE', 'RTE'] as Veredicto[]).map((k) => (
			<Chip key={k} kind={k} size={size} />
		))}
	</div>
);

export const LineaWhile: React.FC<{cy: number}> = ({cy}) => (
	<div style={abs(0, cy - 20, {width: W, textAlign: 'center', fontFamily: MONO, fontSize: 27.5, whiteSpace: 'pre', color: 'rgba(233,238,234,0.85)'})}>
		<span style={{color: C.green}}>while</span> (!accepted) intentar_de_nuevo(); <span style={{color: C.faint}}>// un Wrong Answer no es el final</span>
	</div>
);

/* ------------------------------------------------------------------ pixel art decorativo */

const Cruz: React.FC<{x: number; y: number; color: string; u?: number}> = ({x, y, color, u = 4}) => {
	const b = new Buf(5, 5);
	b.rect(2, 0, 1, 5, color);
	b.rect(0, 2, 5, 1, color);
	return (
		<div style={abs(x - 2.5 * u, y - 2.5 * u)}>
			<PixelSprite buf={b} scale={u} />
		</div>
	);
};
export {Cruz};

/** Globo de píxeles con brillo, nudo y cordel punteado. (x, yTop) = centro y borde superior del cuerpo. */
export const Globo: React.FC<{x: number; yTop: number; w: number; h: number; color: string; shade: string; string: number; u?: number}> = ({x, yTop, w, h, color, shade, string, u = 6}) => {
	const knot = 2;
	const rows = h + knot + Math.ceil(string / u);
	const b = new Buf(w, rows);
	const cx = (w - 1) / 2;
	const cy = (h - 1) / 2;
	for (let j = 0; j < h; j++)
		for (let i = 0; i < w; i++) {
			const nx = (i - cx) / (w / 2);
			const ny = (j - cy) / (h / 2 + (j > cy ? -1 : 0));
			if (nx * nx + ny * ny <= 1) b.set(i, j, nx + ny > 0.9 ? shade : color);
		}
	b.rect(2, 3, 2, 3, 'rgba(255,255,255,0.45)');
	b.rect(Math.floor(cx) - 1, h, 3, 1, shade);
	b.rect(Math.floor(cx), h + 1, 1, 1, shade);
	for (let j = h + 2; j < rows; j++) if (j % 2 === 0) b.set(Math.floor(cx), j, '#8A8F8C');
	return (
		<div style={abs(x - (w * u) / 2, yTop)}>
			<PixelSprite buf={b} scale={u} />
		</div>
	);
};

/** Globo de diálogo en pixel art: fondo negro, borde blanco y cola. */
export const Globito: React.FC<{x: number; y: number; w: number; text: string; tail?: number}> = ({x, y, w, text, tail = 76}) => (
	<div style={abs(x, y, {width: w, height: 42, boxSizing: 'border-box', background: '#050605', border: `3px solid ${C.white}`, display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
		<Etiqueta text={text} u={2} bold tracking={2} />
		<div style={{position: 'absolute', left: tail, bottom: -15, width: 0, height: 0, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: `12px solid ${C.white}`}} />
	</div>
);
