import React from 'react';
import {rnd} from './lib';

/**
 * Motor mínimo de pixel art: un lienzo lógico de píxeles (Buf) que se dibuja por código
 * (rectángulos, líneas de Bresenham, polígonos) y se pinta como SVG de bordes nítidos.
 * Todo es determinista: el mismo fotograma produce siempre los mismos píxeles.
 */

export type Color = string;

export class Buf {
	w: number;
	h: number;
	d: (Color | null)[];
	constructor(w: number, h: number) {
		this.w = w;
		this.h = h;
		this.d = new Array(w * h).fill(null);
	}
	get(x: number, y: number): Color | null {
		if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
		return this.d[y * this.w + x];
	}
	set(x: number, y: number, c: Color | null) {
		x = Math.round(x);
		y = Math.round(y);
		if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
		this.d[y * this.w + x] = c;
	}
	rect(x: number, y: number, w: number, h: number, c: Color | null) {
		for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
	}
	/** Línea de Bresenham con pincel cuadrado de `thick` píxeles. */
	line(x0: number, y0: number, x1: number, y1: number, c: Color, thick = 1) {
		x0 = Math.round(x0);
		y0 = Math.round(y0);
		x1 = Math.round(x1);
		y1 = Math.round(y1);
		const dx = Math.abs(x1 - x0);
		const dy = -Math.abs(y1 - y0);
		const sx = x0 < x1 ? 1 : -1;
		const sy = y0 < y1 ? 1 : -1;
		let err = dx + dy;
		for (let guard = 0; guard < 400; guard++) {
			this.rect(x0, y0, thick, thick, c);
			if (x0 === x1 && y0 === y1) break;
			const e2 = 2 * err;
			if (e2 >= dy) {
				err += dy;
				x0 += sx;
			}
			if (e2 <= dx) {
				err += dx;
				y0 += sy;
			}
		}
	}
	/** Relleno de polígono muestreando el centro de cada píxel. */
	poly(pts: [number, number][], c: Color | ((x: number, y: number) => Color | null)) {
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;
		for (const [x, y] of pts) {
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}
		for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
			for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
				const px = x + 0.5;
				const py = y + 0.5;
				let inside = false;
				for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
					const [xi, yi] = pts[i];
					const [xj, yj] = pts[j];
					if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
				}
				if (inside) {
					const col = typeof c === 'function' ? c(x, y) : c;
					if (col) this.set(x, y, col);
				}
			}
		}
	}
	blit(src: Buf, dx: number, dy: number) {
		for (let y = 0; y < src.h; y++)
			for (let x = 0; x < src.w; x++) {
				const c = src.d[y * src.w + x];
				if (c) this.set(x + dx, y + dy, c);
			}
	}
}

/* ------------------------------------------------------------------ color */

const hexCache = new Map<string, [number, number, number]>();
const rgb = (hex: string): [number, number, number] => {
	let v = hexCache.get(hex);
	if (!v) {
		const n = parseInt(hex.slice(1), 16);
		v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
		hexCache.set(hex, v);
	}
	return v;
};
const h2 = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
/** Mezcla dos colores #rrggbb (t = 0 → a, t = 1 → b), cuantizada a 8 niveles para conservar una paleta corta. */
export const mix = (a: string, b: string, t: number) => {
	const q = Math.round(Math.max(0, Math.min(1, t)) * 8) / 8;
	if (q === 0) return a;
	if (q === 1) return b;
	const [r1, g1, b1] = rgb(a);
	const [r2, g2, b2] = rgb(b);
	return `#${h2(r1 + (r2 - r1) * q)}${h2(g1 + (g2 - g1) * q)}${h2(b1 + (b2 - b1) * q)}`;
};

export type Light = {
	/** dirección desde la que llega la luz: -1 izquierda, 1 derecha, 0 cenital */
	dx: number;
	/** -1 desde arriba, 1 desde abajo */
	dy: number;
	color: string;
	/** intensidad 0..1 */
	amt: number;
};

/**
 * Iluminación dinámica sobre el sprite: los píxeles del borde que mira hacia la luz se tiñen
 * con su color (luz de contorno) y los del borde opuesto se oscurecen. Así la mascota reacciona
 * a los focos, destellos y resaltados de cada escena sin dejar de ser pixel art.
 */
export const relight = (src: Buf, light: Light | null, ambient = 0): Buf => {
	if (!light || light.amt <= 0.01) return src;
	const out = new Buf(src.w, src.h);
	const sx = Math.sign(light.dx);
	const sy = Math.sign(light.dy);
	for (let y = 0; y < src.h; y++)
		for (let x = 0; x < src.w; x++) {
			const c = src.d[y * src.w + x];
			if (!c) continue;
			const litX = sx !== 0 && !src.get(x + sx, y);
			const litY = sy !== 0 && !src.get(x, y + sy);
			const backX = sx !== 0 && !src.get(x - sx, y);
			let o = c;
			if (litX || litY) o = mix(c, light.color, light.amt * (litX && litY ? 0.95 : 0.75));
			else if (backX) o = mix(c, '#000000', light.amt * 0.35);
			else if (ambient > 0) o = mix(c, light.color, ambient * light.amt);
			out.d[y * src.w + x] = o;
		}
	return out;
};

/* ------------------------------------------------------------------ render */

/** Pinta un Buf como SVG: un <path> por color, con tramos horizontales fusionados. */
export const PixelSprite: React.FC<{buf: Buf; scale: number; style?: React.CSSProperties}> = ({buf, scale, style}) => {
	const paths = new Map<string, string>();
	for (let y = 0; y < buf.h; y++) {
		let x = 0;
		while (x < buf.w) {
			const c = buf.d[y * buf.w + x];
			if (!c) {
				x++;
				continue;
			}
			let run = 1;
			while (x + run < buf.w && buf.d[y * buf.w + x + run] === c) run++;
			paths.set(c, (paths.get(c) ?? '') + `M${x} ${y}h${run}v1h-${run}z`);
			x += run;
		}
	}
	return (
		<svg
			width={buf.w * scale}
			height={buf.h * scale}
			viewBox={`0 0 ${buf.w} ${buf.h}`}
			shapeRendering="crispEdges"
			style={{display: 'block', overflow: 'visible', ...style}}
		>
			{[...paths.entries()].map(([c, d]) => (
				<path key={c} d={d} fill={c} />
			))}
		</svg>
	);
};

/* ------------------------------------------------------------------ fuente de píxeles 5×7 */

export const G: Record<string, string> = {
	'0': '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
	'1': '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
	'2': '.###.|#...#|....#|...#.|..#..|.#...|#####',
	'3': '.###.|#...#|....#|..##.|....#|#...#|.###.',
	'4': '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
	'5': '#####|#....|####.|....#|....#|#...#|.###.',
	'6': '..##.|.#...|#....|####.|#...#|#...#|.###.',
	'7': '#####|....#|...#.|..#..|.#...|.#...|.#...',
	'8': '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
	'9': '.###.|#...#|#...#|.####|....#|...#.|.##..',
	A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
	B: '####.|#...#|#...#|####.|#...#|#...#|####.',
	C: '.###.|#...#|#....|#....|#....|#...#|.###.',
	D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
	E: '#####|#....|#....|####.|#....|#....|#####',
	F: '#####|#....|#....|####.|#....|#....|#....',
	G: '.###.|#...#|#....|#.###|#...#|#...#|.###.',
	H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
	I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
	J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
	K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
	L: '#....|#....|#....|#....|#....|#....|#####',
	M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
	N: '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#',
	O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
	P: '####.|#...#|#...#|####.|#....|#....|#....',
	Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
	R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
	S: '.####|#....|#....|.###.|....#|....#|####.',
	T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
	U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
	V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
	W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#',
	X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
	Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
	Z: '#####|....#|...#.|..#..|.#...|#....|#####',
	'!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
	'¡': '..#..|.....|..#..|..#..|..#..|..#..|..#..',
	'?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
	'¿': '..#..|.....|..#..|.#...|#....|#...#|.###.',
	'.': '.....|.....|.....|.....|.....|.##..|.##..',
	',': '.....|.....|.....|.....|.##..|..#..|.#...',
	':': '.....|.##..|.##..|.....|.##..|.##..|.....',
	'-': '.....|.....|.....|#####|.....|.....|.....',
	'+': '.....|..#..|..#..|#####|..#..|..#..|.....',
	'=': '.....|.....|#####|.....|#####|.....|.....',
	'<': '...#.|..#..|.#...|#....|.#...|..#..|...#.',
	'>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
	'/': '....#|....#|...#.|..#..|.#...|#....|#....',
	'(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
	')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
	'×': '.....|#...#|.#.#.|..#..|.#.#.|#...#|.....',
	' ': '.....|.....|.....|.....|.....|.....|.....',
};

/** Ancho en píxeles lógicos de un texto en la fuente 5×7 (más 1 px si es negrita). */
export const textWidth = (text: string, bold = false) => text.length * (bold ? 7 : 6) - 1;

/** Dibuja texto 5×7 en un Buf. `bold` engrosa el trazo a 2 px (glifos de 6 px de ancho). */
export const drawText = (buf: Buf, text: string, x: number, y: number, c: Color, bold = false) => {
	let cx = x;
	for (const ch of text.toUpperCase()) {
		const rows = (G[ch] ?? G['?']).split('|');
		for (let j = 0; j < 7; j++)
			for (let i = 0; i < 5; i++)
				if (rows[j][i] === '#') {
					buf.set(cx + i, y + j, c);
					if (bold) buf.set(cx + i + 1, y + j, c);
				}
		cx += bold ? 7 : 6;
	}
};

export const PixelText: React.FC<{
	text: string;
	scale: number;
	color?: Color;
	bold?: boolean;
	/** sombra dura de 1 px lógico */
	shadow?: Color;
	style?: React.CSSProperties;
}> = ({text, scale, color = '#FFFFFF', bold = false, shadow, style}) => {
	const w = textWidth(text, bold) + (shadow ? 1 : 0) + (bold ? 1 : 0);
	const buf = new Buf(w, shadow ? 8 : 7);
	if (shadow) drawText(buf, text, 1, 1, shadow, bold);
	drawText(buf, text, 0, 0, color, bold);
	return <PixelSprite buf={buf} scale={scale} style={style} />;
};

/* ------------------------------------------------------------------ partículas */

/**
 * Estallido balístico de partículas cuadradas ajustadas a una rejilla de `grid` px.
 * Se usa en el impacto del machete, al encontrar el objetivo y en las celebraciones.
 */
export const PixelBurst: React.FC<{
	f: number;
	at: number;
	x: number;
	y: number;
	count?: number;
	colors?: string[];
	seed?: number;
	power?: number;
	grid?: number;
	gravity?: number;
	life?: number;
	/** abanico en grados alrededor de `dir` (-90 = hacia arriba) */
	spread?: number;
	dir?: number;
}> = ({f, at, x, y, count = 18, colors = ['#FFFFFF', '#00C063'], seed = 1, power = 16, grid = 6, gravity = 1.1, life = 26, spread = 360, dir = -90}) => {
	const k = f - at;
	if (k < 0 || k > life) return null;
	return (
		<>
			{Array.from({length: count}, (_, i) => {
				const a = ((dir + (rnd(seed * 31 + i) - 0.5) * spread) * Math.PI) / 180;
				const v = power * (0.35 + rnd(seed * 17 + i * 3) * 0.75);
				const px = x + Math.cos(a) * v * k;
				const py = y + Math.sin(a) * v * k + 0.5 * gravity * k * k;
				const size = grid * (1 + Math.floor(rnd(seed * 7 + i * 5) * 2.2));
				const l = life * (0.55 + rnd(seed * 3 + i * 11) * 0.45);
				if (k > l) return null;
				const shrink = k > l * 0.7 ? grid : 0;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: Math.round(px / grid) * grid - (size - shrink) / 2,
							top: Math.round(py / grid) * grid - (size - shrink) / 2,
							width: size - shrink,
							height: size - shrink,
							background: colors[i % colors.length],
						}}
					/>
				);
			})}
		</>
	);
};
