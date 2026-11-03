import React from 'react';
import {useCurrentFrame} from 'remotion';
import {pop, tween} from './lib';
import {Buf, PixelSprite, drawText, textWidth} from './pixel';

/**
 * Ilustraciones en pixel art de los temas del roadmap (se dibujan por código y se animan paso a paso):
 *
 *   diagrama   diagrama de flujo (inicio → leer → decisión → escribir → fin)
 *   pseint     ventana de PSeInt con un algoritmo que se escribe solo
 *   codigo     el mismo «escribir x» en C++, Java y Python (`hl` resalta 0, 1 o 2)
 *   pila       pila, cola y árbol binario que se llenan
 *   clase      una clase (POO) con atributos y métodos
 *   concurso   marcador de concurso con reloj y veredictos
 *   grafo      grafo recorrido por niveles (BFS)
 *   dp         tabla de programación dinámica que se llena
 *   segtree    segment tree sobre un arreglo
 *   geometria  puntos y su envolvente convexa
 *   equipo     tres personas, un computador y globos
 *
 * Uso: <Ilustracion kind="diagrama" at={M('s03a','pseint')} x={1260} y={260} scale={6} />
 * `t` = fotogramas desde `at`; todo es determinista.
 */
export type IlusKind = 'diagrama' | 'pseint' | 'codigo' | 'pila' | 'clase' | 'concurso' | 'grafo' | 'dp' | 'segtree' | 'geometria' | 'equipo';

const K = {
	bg: '#0E110F',
	bar: '#1B211D',
	line: '#3A433D',
	dim: '#7D8781',
	white: '#E9EEEA',
	green: '#00C063',
	gdeep: '#00864A',
	amber: '#FFB547',
	red: '#FF4D5E',
	blue: '#5AA9FF',
	skin: '#E0A47E',
};

/** Tamaño lógico (px) de cada ilustración. */
export const ILUS_SIZE: Record<IlusKind, [number, number]> = {
	diagrama: [96, 62],
	pseint: [96, 52],
	codigo: [96, 72],
	pila: [96, 52],
	clase: [96, 52],
	concurso: [96, 52],
	grafo: [96, 52],
	dp: [96, 56],
	segtree: [96, 52],
	geometria: [96, 52],
	equipo: [96, 52],
};

const step = (t: number, i: number, every = 8) => t >= i * every;
const box = (b: Buf, x: number, y: number, w: number, h: number, edge: string, fill = K.bg) => {
	b.rect(x, y, w, h, edge);
	b.rect(x + 1, y + 1, w - 2, h - 2, fill);
};
const textC = (b: Buf, s: string, cx: number, y: number, c: string) => drawText(b, s, Math.round(cx - textWidth(s) / 2), y, c);
const arrowDown = (b: Buf, x: number, y0: number, y1: number, c: string) => {
	b.rect(x, y0, 1, y1 - y0, c);
	b.rect(x - 1, y1 - 2, 3, 1, c);
};
const win = (b: Buf, x: number, y: number, w: number, h: number, title: string, accent = K.green) => {
	box(b, x, y, w, h, K.line);
	b.rect(x + 1, y + 1, w - 2, 9, K.bar);
	b.rect(x + 3, y + 4, 2, 2, K.red);
	b.rect(x + 7, y + 4, 2, 2, K.amber);
	b.rect(x + 11, y + 4, 2, 2, accent);
	drawText(b, title, x + 16, y + 2, K.dim);
};
const typed = (s: string, t: number, cps = 1) => s.slice(0, Math.max(0, Math.floor(t * cps)));

export const drawIlus = (kind: IlusKind, t: number, hl = -1): Buf => {
	const [w, h] = ILUS_SIZE[kind];
	const b = new Buf(w, h);
	switch (kind) {
		case 'diagrama': {
			// inicio
			if (step(t, 0)) {
				b.rect(33, 0, 30, 9, K.green);
				b.rect(32, 1, 32, 7, K.green);
				textC(b, 'INICIO', 48, 1, K.bg);
			}
			if (step(t, 1)) arrowDown(b, 48, 9, 13, K.dim);
			// leer (paralelogramo)
			if (step(t, 2)) {
				b.poly([[24, 13], [76, 13], [72, 23], [20, 23]], K.blue);
				b.poly([[25, 14], [74, 14], [71, 22], [22, 22]], K.bg);
				textC(b, 'LEER N', 48, 15, K.white);
			}
			if (step(t, 3)) arrowDown(b, 48, 23, 27, K.dim);
			// decisión (rombo)
			if (step(t, 4)) {
				b.poly([[48, 26], [64, 34], [48, 42], [32, 34]], K.amber);
				b.poly([[48, 28], [61, 34], [48, 40], [35, 34]], K.bg);
				textC(b, 'N>0', 48, 31, K.white);
				drawText(b, 'SI', 68, 27, K.green);
				drawText(b, 'NO', 18, 27, K.red);
				b.line(64, 34, 78, 34, K.dim);
				arrowDown(b, 78, 34, 45, K.dim);
				b.line(32, 34, 18, 34, K.dim);
				arrowDown(b, 18, 34, 45, K.dim);
			}
			// escribir
			if (step(t, 5)) {
				box(b, 64, 45, 30, 9, K.green);
				textC(b, '+', 79, 46, K.green);
				box(b, 2, 45, 30, 9, K.red);
				textC(b, '-', 17, 46, K.red);
			}
			if (step(t, 6)) {
				b.line(79, 54, 79, 58, K.dim);
				b.line(17, 54, 17, 58, K.dim);
				b.line(17, 58, 79, 58, K.dim);
				b.rect(40, 55, 17, 7, K.green);
				textC(b, 'FIN', 48, 55, K.bg);
			}
			break;
		}
		case 'pseint': {
			win(b, 0, 0, 96, 52, 'PSEINT');
			const lines: [string, string][] = [
				['ALGORITMO SUMA', K.green],
				[' LEER A,B', K.white],
				[' C<-A+B', K.white],
				[' ESCRIBIR C', K.white],
				['FINALGORITMO', K.green],
			];
			let left = Math.max(0, t) * 1.2;
			lines.forEach(([s, c], i) => {
				const shown = typed(s, left);
				left -= s.length + 2;
				if (shown) drawText(b, shown, 4, 12 + i * 8, c);
			});
			if (Math.floor(t / 8) % 2 === 0) b.rect(4 + Math.min(80, textWidth(typed('FINALGORITMO', left + 14)) + 2), 44, 2, 7, K.green);
			break;
		}
		case 'codigo': {
			const langs: [string, string[], string][] = [
				['C++', ['COUT<<X;'], K.blue],
				['JAVA', ['SYSTEM.OUT', '.PRINTLN(X);'], K.amber],
				['PYTHON', ['PRINT(X)'], K.green],
			];
			let y = 0;
			langs.forEach(([name, code, c], i) => {
				const hh = 12 + code.length * 8;
				if (step(t, i, 6)) {
					box(b, 0, y, 96, hh, hl === i ? c : K.line);
					drawText(b, name, 3, y + 3, c);
					code.forEach((ln, j) => drawText(b, typed(ln, t - i * 6, 1.4), 18, y + 11 + j * 8, hl === i ? K.white : K.dim));
				}
				y += hh + 2;
			});
			break;
		}
		case 'pila': {
			// pila
			drawText(b, 'PILA', 0, 0, K.dim);
			b.rect(0, 9, 1, 40, K.line);
			b.rect(22, 9, 1, 40, K.line);
			b.rect(0, 49, 23, 1, K.line);
			for (let i = 0; i < 4; i++) if (step(t, i, 6)) b.rect(2, 41 - i * 8, 19, 7, i === 3 ? K.green : K.gdeep);
			// cola
			drawText(b, 'COLA', 30, 0, K.dim);
			b.rect(30, 9, 30, 1, K.line);
			b.rect(30, 19, 30, 1, K.line);
			for (let i = 0; i < 4; i++) if (step(t, i + 1, 6)) b.rect(31 + i * 7, 11, 6, 7, i === 0 ? K.amber : K.blue);
			// árbol
			const N: [number, number][] = [[78, 26], [69, 36], [87, 36], [64, 46], [74, 46], [92, 46]];
			const E: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]];
			E.forEach(([a, c], i) => step(t, i + 2, 6) && b.line(N[a][0], N[a][1], N[c][0], N[c][1], K.dim));
			N.forEach(([x, y], i) => {
				if (step(t, i + 1, 6)) {
					b.rect(x - 2, y - 2, 5, 5, i === 0 ? K.green : K.white);
				}
			});
			
			break;
		}
		case 'clase': {
			box(b, 18, 0, 60, 52, K.amber);
			b.rect(19, 1, 58, 10, '#2A2214');
			textC(b, 'MASCOTA', 48, 2, K.amber);
			b.rect(19, 11, 58, 1, K.amber);
			const rows: [string, string][] = [
				['-NOMBRE', K.white],
				['-FASE', K.white],
				['+SALUDAR()', K.green],
				['+GUIAR()', K.green],
			];
			rows.forEach(([s, c], i) => step(t, i + 1, 7) && drawText(b, s, 22, 14 + i * 9 + (i >= 2 ? 2 : 0), c));
			if (step(t, 3, 7)) b.rect(19, 31, 58, 1, K.amber);
			break;
		}
		case 'concurso': {
			win(b, 0, 0, 96, 52, '04:59:12', K.green);
			const res = [
				['AC', 'WA', 'AC'],
				['AC', 'TLE', '-'],
				['WA', 'AC', 'AC'],
			];
			drawText(b, 'A', 34, 12, K.dim);
			drawText(b, 'B', 56, 12, K.dim);
			drawText(b, 'C', 78, 12, K.dim);
			['GOS', 'LIN', 'UCE'].forEach((tm, r) => {
				drawText(b, tm, 3, 21 + r * 10, K.white);
				res[r].forEach((v, c) => {
					if (!step(t, r * 3 + c, 4)) return;
					const col = v === 'AC' ? K.green : v === 'WA' ? K.red : v === 'TLE' ? K.amber : K.line;
					b.rect(26 + c * 22, 20 + r * 10, 20, 9, col);
					if (v !== '-') textC(b, v === 'TLE' ? 'TL' : v, 36 + c * 22, 21 + r * 10, K.bg);
				});
			});
			break;
		}
		case 'grafo': {
			const N: [number, number][] = [[10, 26], [32, 10], [32, 42], [56, 18], [56, 40], [84, 28]];
			const lvl = [0, 1, 1, 2, 2, 3];
			const E: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [1, 2], [3, 4]];
			const cur = Math.floor(t / 10);
			E.forEach(([a, c]) => b.line(N[a][0], N[a][1], N[c][0], N[c][1], lvl[a] < cur && lvl[c] <= cur ? K.green : K.line));
			N.forEach(([x, y], i) => {
				const on = lvl[i] <= cur;
				b.rect(x - 4, y - 4, 9, 9, on ? K.green : K.line);
				b.rect(x - 3, y - 3, 7, 7, on ? K.gdeep : K.bg);
				drawText(b, String(i), x - 2, y - 3, on ? K.white : K.dim);
			});
			break;
		}
		case 'dp': {
			// caminos en una grilla: cada casilla = arriba + izquierda
			const cols = 5;
			const rows = 4;
			const tab: number[][] = Array.from({length: rows}, (_, r) => Array.from({length: cols}, (_, c) => (r === 0 || c === 0 ? 1 : 0)));
			for (let r = 1; r < rows; r++) for (let c = 1; c < cols; c++) tab[r][c] = tab[r - 1][c] + tab[r][c - 1];
			const n = Math.floor(t / 3);
			for (let r = 0; r < rows; r++)
				for (let c = 0; c < cols; c++) {
					const k = r * cols + c;
					const x = 1 + c * 19;
					const y = 1 + r * 14;
					b.rect(x, y, 18, 13, K.line);
					b.rect(x + 1, y + 1, 16, 11, k < n ? (k === n - 1 ? K.amber : K.gdeep) : K.bg);
					if (k < n) textC(b, String(tab[r][c]), x + 9, y + 3, K.white);
				}
			break;
		}
		case 'segtree': {
			const arr = [5, 2, 7, 1];
			// hojas
			arr.forEach((v, i) => {
				if (!step(t, 0, 1)) return;
				box(b, 6 + i * 22, 42, 18, 10, K.blue);
				textC(b, String(v), 15 + i * 22, 44, K.white);
			});
			const sums = [7, 8];
			sums.forEach((v, i) => {
				if (!step(t, 1 + i, 8)) return;
				const x = 17 + i * 44;
				b.line(x + 9, 30, 15 + i * 44, 42, K.dim);
				b.line(x + 9, 30, 37 + i * 44, 42, K.dim);
				box(b, x, 21, 18, 10, K.green);
				textC(b, String(v), x + 9, 23, K.white);
			});
			if (step(t, 3, 8)) {
				b.line(48, 10, 26, 21, K.dim);
				b.line(48, 10, 70, 21, K.dim);
				box(b, 37, 0, 22, 11, K.amber);
				textC(b, '15', 48, 2, K.white);
			}
			break;
		}
		case 'geometria': {
			const P: [number, number][] = [[8, 40], [20, 10], [44, 4], [70, 8], [90, 30], [74, 48], [36, 50], [40, 26], [58, 28], [28, 34], [64, 36]];
			const hull = [0, 1, 2, 3, 4, 5, 6];
			P.forEach(([x, y], i) => step(t, i, 2) && b.rect(x - 1, y - 1, 3, 3, hull.includes(i) ? K.white : K.dim));
			const k = Math.floor((t - 24) / 6);
			for (let i = 0; i < Math.min(hull.length, k); i++) {
				const a = P[hull[i]];
				const c = P[hull[(i + 1) % hull.length]];
				b.line(a[0], a[1], c[0], c[1], K.green);
			}
			break;
		}
		case 'equipo': {
			// tres personas y un computador
			const heads = [20, 48, 76];
			heads.forEach((x, i) => {
				if (!step(t, i, 5)) return;
				b.rect(x - 5, 22, 10, 10, K.skin);
				b.rect(x - 5, 20, 10, 3, ['#3A2C26', '#17110F', '#6A4430'][i]);
				b.rect(x - 3, 26, 2, 2, K.bg);
				b.rect(x + 2, 26, 2, 2, K.bg);
				b.rect(x - 7, 33, 14, 12, [K.green, K.blue, K.amber][i]);
			});
			if (step(t, 3, 5)) {
				// un solo computador al centro
				b.rect(38, 36, 20, 12, K.line);
				b.rect(39, 37, 18, 10, K.gdeep);
				drawText(b, '>_', 42, 39, K.white);
				b.rect(34, 48, 28, 3, K.line);
				// cuaderno
				b.rect(2, 44, 14, 8, K.white);
				b.rect(8, 44, 1, 8, K.line);
			}
			// globos
			[[10, K.red], [86, K.amber], [64, K.blue]].forEach(([x, c], i) => {
				if (!step(t, 4 + i, 5)) return;
				const rise = Math.min(8, Math.floor((t - (4 + i) * 5) / 3));
				const y = 12 - rise;
				b.rect((x as number) - 3, y, 7, 8, c as string);
				b.rect((x as number) - 2, y - 1, 5, 1, c as string);
				b.line(x as number, y + 8, x as number, y + 16, K.dim);
			});
			break;
		}
	}
	return b;
};

/** Ilustración animada: entra con rebote en `at`, se dibuja paso a paso y se va en `out`. */
export const Ilustracion: React.FC<{kind: IlusKind; at: number; out?: number; x: number; y: number; scale?: number; hl?: number; frame?: boolean}> = ({kind, at, out, x, y, scale = 6, hl = -1, frame = true}) => {
	const f = useCurrentFrame();
	if (f < at - 1) return null;
	if (out !== undefined && f >= out) return null;
	const p = pop(f, at, 12, 230, 0.6);
	const o = out !== undefined ? 1 - tween(f, out - 8, out) : 1;
	const buf = drawIlus(kind, f - at, hl);
	const pad = 3 * scale;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				padding: frame ? pad : 0,
				background: frame ? 'rgba(8,11,9,0.92)' : undefined,
				border: frame ? '3px solid rgba(255,255,255,0.14)' : undefined,
				boxShadow: frame ? '0 24px 70px rgba(0,0,0,0.55)' : undefined,
				opacity: Math.min(1, p * 2) * o,
				transform: `scale(${0.7 + 0.3 * p})`,
				transformOrigin: '50% 50%',
			}}
		>
			<PixelSprite buf={buf} scale={scale} />
		</div>
	);
};
