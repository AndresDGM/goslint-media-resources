import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from './theme';
import {pop, tween} from './lib';

/**
 * Ilustraciones vectoriales (estilo terminal de Goslint, no pixel art) de los temas del roadmap.
 * Se dibujan paso a paso desde `at`:
 *
 *   diagrama   diagrama de flujo (inicio → leer → decisión → escribir → fin)
 *   pseint     ventana de PSeInt con un algoritmo que se escribe solo
 *   codigo     la misma salida en C++, Java y Python (`hl` resalta 0, 1 o 2)
 *   pila       pila, cola y árbol binario que se llenan
 *   clase      una clase (POO) con atributos y métodos
 *   concurso   marcador de concurso con reloj y veredictos
 *   grafo      grafo recorrido por niveles (BFS)
 *   dp         tabla de programación dinámica que se llena
 *   segtree    segment tree sobre un arreglo
 *   geometria  puntos y su envolvente convexa
 *   equipo     tres personas, un computador y globos
 *
 * Uso: <Ilustracion kind="diagrama" at={M('s03a','pseint')} x={1260} y={260} scale={5} />
 * Las coordenadas internas van en una rejilla de 96 de ancho; `scale` = píxeles por unidad.
 */
export type IlusKind = 'diagrama' | 'pseint' | 'codigo' | 'pila' | 'clase' | 'concurso' | 'grafo' | 'dp' | 'segtree' | 'geometria' | 'equipo';

export const ILUS_SIZE: Record<IlusKind, [number, number]> = {
	diagrama: [96, 64],
	pseint: [96, 54],
	codigo: [96, 72],
	pila: [96, 54],
	clase: [96, 54],
	concurso: [96, 54],
	grafo: [96, 54],
	dp: [96, 58],
	segtree: [96, 54],
	geometria: [96, 54],
	equipo: [96, 54],
};

const LINE = 'rgba(255,255,255,0.22)';
const DIM = 'rgba(233,238,234,0.6)';
const BG = '#0E110F';

/** Aparición de un paso: 0 → 1 en 8 fotogramas a partir de `i * every`. */
const ap = (t: number, i: number, every = 8) => tween(t, i * every, i * every + 8);
const typed = (s: string, t: number, cps = 1) => s.slice(0, Math.max(0, Math.floor(t * cps)));

const T: React.FC<{x: number; y: number; s?: number; c?: string; w?: number; anchor?: 'start' | 'middle' | 'end'; o?: number; sans?: boolean; children: React.ReactNode}> = ({x, y, s = 5, c = C.text, w = 600, anchor = 'start', o = 1, sans, children}) => (
	<text x={x} y={y} fontFamily={sans ? SANS : MONO} fontSize={s} fontWeight={w} fill={c} textAnchor={anchor} dominantBaseline="middle" opacity={o} style={{whiteSpace: 'pre'}}>
		{children}
	</text>
);

const Win: React.FC<{w: number; h: number; title: string}> = ({w, h, title}) => (
	<>
		<rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={2} fill={BG} stroke={LINE} strokeWidth={0.6} />
		<rect x={0.8} y={0.8} width={w - 1.6} height={8} rx={1.6} fill="#161B18" />
		{[C.red, C.amber, C.green].map((c, i) => (
			<circle key={i} cx={5 + i * 4} cy={4.8} r={1.2} fill={c} />
		))}
		<T x={18} y={5} s={4} c={DIM} w={500}>
			{title}
		</T>
	</>
);

const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; o: number; c?: string}> = ({x1, y1, x2, y2, o, c = DIM}) => {
	const a = Math.atan2(y2 - y1, x2 - x1);
	const ex = x1 + (x2 - x1) * o;
	const ey = y1 + (y2 - y1) * o;
	return (
		<g opacity={o > 0 ? 1 : 0}>
			<line x1={x1} y1={y1} x2={ex} y2={ey} stroke={c} strokeWidth={0.7} />
			{o > 0.95 && <polygon points={`${x2},${y2} ${x2 - 2.4 * Math.cos(a - 0.5)},${y2 - 2.4 * Math.sin(a - 0.5)} ${x2 - 2.4 * Math.cos(a + 0.5)},${y2 - 2.4 * Math.sin(a + 0.5)}`} fill={c} />}
		</g>
	);
};

const Draw: React.FC<{kind: IlusKind; t: number; hl: number}> = ({kind, t, hl}) => {
	switch (kind) {
		case 'diagrama':
			return (
				<>
					<g opacity={ap(t, 0)}>
						<rect x={34} y={1} width={28} height={8} rx={4} fill={C.green} />
						<T x={48} y={5.2} s={4.2} c={BG} w={800} anchor="middle">INICIO</T>
					</g>
					<Arrow x1={48} y1={9} x2={48} y2={14} o={ap(t, 1)} />
					<g opacity={ap(t, 2)}>
						<polygon points="28,14.5 72,14.5 68,23.5 24,23.5" fill={BG} stroke={C.blue} strokeWidth={0.8} />
						<T x={48} y={19.2} s={4.2} anchor="middle">Leer n</T>
					</g>
					<Arrow x1={48} y1={23.5} x2={48} y2={27.5} o={ap(t, 3)} />
					<g opacity={ap(t, 4)}>
						<polygon points="48,27.5 63,35 48,42.5 33,35" fill={BG} stroke={C.amber} strokeWidth={0.8} />
						<T x={48} y={35.2} s={4.2} anchor="middle">n &gt; 0</T>
						<T x={68} y={31} s={3.6} c={C.green}>Sí</T>
						<T x={28} y={31} s={3.6} c={C.red} anchor="end">No</T>
					</g>
					<Arrow x1={63} y1={35} x2={79} y2={45} o={ap(t, 5)} c={C.green} />
					<Arrow x1={33} y1={35} x2={17} y2={45} o={ap(t, 5)} c={C.red} />
					<g opacity={ap(t, 6)}>
						<rect x={64} y={45} width={30} height={8} fill={BG} stroke={C.green} strokeWidth={0.8} />
						<T x={79} y={49.2} s={3.8} anchor="middle">positivo</T>
						<rect x={2} y={45} width={30} height={8} fill={BG} stroke={C.red} strokeWidth={0.8} />
						<T x={17} y={49.2} s={3.6} anchor="middle">no positivo</T>
					</g>
					<g opacity={ap(t, 7)}>
						<polyline points="79,53 79,57 17,57 17,53" fill="none" stroke={DIM} strokeWidth={0.7} />
						<rect x={38} y={55} width={20} height={8} rx={4} fill={C.green} />
						<T x={48} y={59.2} s={4.2} c={BG} w={800} anchor="middle">FIN</T>
					</g>
				</>
			);
		case 'pseint': {
			const lines: [string, string][] = [
				['Algoritmo Suma', C.green],
				['  Leer a, b', C.text],
				['  c <- a + b', C.text],
				['  Escribir c', C.text],
				['FinAlgoritmo', C.green],
			];
			let left = Math.max(0, t) * 1.2;
			return (
				<>
					<Win w={96} h={54} title="PSeInt · suma.psc" />
					{lines.map(([s, c], i) => {
						const shown = typed(s, left);
						left -= s.length + 2;
						return (
							<g key={i}>
								<T x={4} y={15 + i * 8} s={3.4} c={DIM} w={400}>{String(i + 1)}</T>
								<T x={10} y={15 + i * 8} s={4.6} c={c} w={i === 0 || i === 4 ? 700 : 500}>{shown}</T>
							</g>
						);
					})}
				</>
			);
		}
		case 'codigo': {
			const langs: [string, string[], string][] = [
				['C++', ['cout << x;'], C.blue],
				['Java', ['System.out', '  .println(x);'], C.amber],
				['Python', ['print(x)'], C.green],
			];
			let y = 0;
			return (
				<>
					{langs.map(([name, code, c], i) => {
						const hh = 11 + code.length * 7;
						const y0 = y;
						y += hh + 2.5;
						const on = hl === i;
						return (
							<g key={name} opacity={ap(t, i, 6)}>
								<rect x={0.5} y={y0 + 0.5} width={95} height={hh} rx={2} fill={on ? 'rgba(255,255,255,0.05)' : BG} stroke={on ? c : LINE} strokeWidth={on ? 1 : 0.6} />
								<rect x={0.5} y={y0 + 0.5} width={2} height={hh} fill={c} />
								<T x={6} y={y0 + 5.5} s={3.8} c={c} w={800}>{name}</T>
								{code.map((ln, j) => (
									<T key={j} x={6} y={y0 + 12.5 + j * 7} s={4.6} c={on ? C.white : DIM} w={600}>{typed(ln, t - i * 6, 1.4)}</T>
								))}
							</g>
						);
					})}
				</>
			);
		}
		case 'pila': {
			const N: [number, number][] = [[78, 22], [68, 34], [88, 34], [63, 46], [73, 46], [93, 46]];
			const E: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]];
			return (
				<>
					<T x={0} y={3} s={3.8} c={DIM}>pila</T>
					<polyline points="0.5,8 0.5,52.5 22.5,52.5 22.5,8" fill="none" stroke={LINE} strokeWidth={0.8} />
					{[0, 1, 2, 3].map((i) => (
						<rect key={i} x={3} y={44 - i * 9 - (1 - ap(t, i, 6)) * 10} width={17} height={7} rx={1} fill={i === 3 ? C.green : C.greenDeep} opacity={ap(t, i, 6)} />
					))}
					<T x={30} y={3} s={3.8} c={DIM}>cola</T>
					<line x1={30} y1={8} x2={60} y2={8} stroke={LINE} strokeWidth={0.8} />
					<line x1={30} y1={18} x2={60} y2={18} stroke={LINE} strokeWidth={0.8} />
					{[0, 1, 2, 3].map((i) => (
						<rect key={i} x={31 + i * 7.2} y={9.5} width={6} height={7} rx={1} fill={i === 0 ? C.amber : C.blue} opacity={ap(t, i + 1, 6)} />
					))}
					<T x={63} y={9} s={3.8} c={DIM}>árbol</T>
					{E.map(([a, c], i) => (
						<line key={i} x1={N[a][0]} y1={N[a][1]} x2={N[c][0]} y2={N[c][1]} stroke={DIM} strokeWidth={0.7} opacity={ap(t, i + 2, 6)} />
					))}
					{N.map(([x, y], i) => (
						<circle key={i} cx={x} cy={y} r={3} fill={i === 0 ? C.green : BG} stroke={i === 0 ? C.green : C.white} strokeWidth={0.8} opacity={ap(t, i + 1, 6)} />
					))}
				</>
			);
		}
		case 'clase': {
			const rows: [string, string][] = [
				['- nombre: String', C.text],
				['- fase: int', C.text],
				['+ saludar()', C.green],
				['+ guiar()', C.green],
			];
			return (
				<>
					<rect x={14} y={0.5} width={68} height={53} rx={2} fill={BG} stroke={C.amber} strokeWidth={0.9} />
					<rect x={14} y={0.5} width={68} height={11} rx={2} fill="rgba(255,181,71,0.15)" />
					<T x={48} y={6.5} s={4.8} c={C.amber} w={800} anchor="middle">class Mascota</T>
					<line x1={14} y1={11.5} x2={82} y2={11.5} stroke={C.amber} strokeWidth={0.8} />
					<line x1={14} y1={32} x2={82} y2={32} stroke={C.amber} strokeWidth={0.8} opacity={ap(t, 3, 7)} />
					{rows.map(([s, c], i) => (
						<T key={i} x={18} y={17 + i * 9 + (i >= 2 ? 2.5 : 0)} s={4.2} c={c} o={ap(t, i + 1, 7)}>{s}</T>
					))}
				</>
			);
		}
		case 'concurso': {
			const res = [
				['AC', 'WA', 'AC'],
				['AC', 'TLE', ''],
				['WA', 'AC', 'AC'],
			];
			const col = (v: string) => (v === 'AC' ? C.green : v === 'WA' ? C.red : v === 'TLE' ? C.amber : 'rgba(255,255,255,0.08)');
			return (
				<>
					<Win w={96} h={54} title="marcador · 04:59:12" />
					{['A', 'B', 'C'].map((p, i) => (
						<T key={p} x={38 + i * 20} y={14} s={4} c={DIM} anchor="middle">{p}</T>
					))}
					{['equipo 1', 'equipo 2', 'equipo 3'].map((tm, r) => (
						<g key={tm}>
							<T x={4} y={23 + r * 10} s={3.8} c={C.text} w={500} sans>{tm}</T>
							{res[r].map((v, c) => (
								<g key={c} opacity={ap(t, r * 3 + c, 4)}>
									<rect x={29 + c * 20} y={19 + r * 10} width={18} height={8} rx={1} fill={col(v)} />
									{v && <T x={38 + c * 20} y={23.2 + r * 10} s={3.8} c={BG} w={800} anchor="middle">{v}</T>}
								</g>
							))}
						</g>
					))}
				</>
			);
		}
		case 'grafo': {
			const N: [number, number][] = [[10, 27], [32, 11], [32, 43], [58, 18], [58, 40], [86, 29]];
			const lvl = [0, 1, 1, 2, 2, 3];
			const E: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [1, 2], [3, 4]];
			const cur = Math.floor(t / 10);
			return (
				<>
					{E.map(([a, c], i) => {
						const on = lvl[a] < cur && lvl[c] <= cur && lvl[a] !== lvl[c];
						return <line key={i} x1={N[a][0]} y1={N[a][1]} x2={N[c][0]} y2={N[c][1]} stroke={on ? C.green : LINE} strokeWidth={on ? 1.2 : 0.7} />;
					})}
					{N.map(([x, y], i) => {
						const on = lvl[i] <= cur;
						return (
							<g key={i}>
								<circle cx={x} cy={y} r={5} fill={on ? C.greenDeep : BG} stroke={on ? C.green : LINE} strokeWidth={0.9} />
								<T x={x} y={y + 0.3} s={4.4} c={on ? C.white : DIM} anchor="middle" w={700}>{String(i)}</T>
							</g>
						);
					})}
					<T x={2} y={52} s={3.6} c={DIM}>{`nivel ${Math.min(3, cur)}`}</T>
				</>
			);
		}
		case 'dp': {
			const cols = 5;
			const rows = 4;
			const tab: number[][] = Array.from({length: rows}, (_, r) => Array.from({length: cols}, (_, c) => (r === 0 || c === 0 ? 1 : 0)));
			for (let r = 1; r < rows; r++) for (let c = 1; c < cols; c++) tab[r][c] = tab[r - 1][c] + tab[r][c - 1];
			const n = Math.floor(t / 3);
			return (
				<>
					{tab.map((row, r) =>
						row.map((v, c) => {
							const k = r * cols + c;
							const x = 1 + c * 19;
							const y = 1 + r * 14;
							return (
								<g key={k}>
									<rect x={x} y={y} width={18} height={13} rx={1} fill={k < n ? (k === n - 1 ? 'rgba(255,181,71,0.35)' : 'rgba(0,192,99,0.18)') : BG} stroke={k === n - 1 ? C.amber : LINE} strokeWidth={0.7} />
									{k < n && <T x={x + 9} y={y + 6.8} s={5} anchor="middle" w={700}>{String(v)}</T>}
								</g>
							);
						}),
					)}
				</>
			);
		}
		case 'segtree': {
			const arr = [5, 2, 7, 1];
			const node = (key: string, x: number, y: number, w: number, v: string, c: string, o: number) => (
				<g key={key} opacity={o}>
					<rect x={x} y={y} width={w} height={10} rx={1.5} fill={BG} stroke={c} strokeWidth={0.9} />
					<T x={x + w / 2} y={y + 5.3} s={4.8} anchor="middle" w={700}>{v}</T>
				</g>
			);
			return (
				<>
					{[0, 1].map((i) => (
						<g key={i} opacity={ap(t, 1 + i, 8)}>
							<line x1={26 + i * 44} y1={31} x2={15 + i * 44} y2={43} stroke={DIM} strokeWidth={0.7} />
							<line x1={26 + i * 44} y1={31} x2={37 + i * 44} y2={43} stroke={DIM} strokeWidth={0.7} />
						</g>
					))}
					<g opacity={ap(t, 3, 8)}>
						<line x1={48} y1={11} x2={26} y2={21} stroke={DIM} strokeWidth={0.7} />
						<line x1={48} y1={11} x2={70} y2={21} stroke={DIM} strokeWidth={0.7} />
					</g>
					{arr.map((v, i) => node(`h${i}`, 6 + i * 22, 43, 18, String(v), C.blue, ap(t, 0, 8)))}
					{node('a', 17, 21, 18, '7', C.green, ap(t, 1, 8))}
					{node('b', 61, 21, 18, '8', C.green, ap(t, 2, 8))}
					{node('r', 37, 1, 22, '15', C.amber, ap(t, 3, 8))}
				</>
			);
		}
		case 'geometria': {
			const P: [number, number][] = [[8, 40], [20, 10], [44, 4], [70, 8], [90, 30], [74, 48], [36, 50], [40, 26], [58, 28], [28, 34], [64, 36]];
			const hull = [0, 1, 2, 3, 4, 5, 6];
			const k = (t - 24) / 6;
			return (
				<>
					{hull.map((h, i) => {
						const a = P[h];
						const c = P[hull[(i + 1) % hull.length]];
						const o = Math.max(0, Math.min(1, k - i));
						return o > 0 ? <line key={i} x1={a[0]} y1={a[1]} x2={a[0] + (c[0] - a[0]) * o} y2={a[1] + (c[1] - a[1]) * o} stroke={C.green} strokeWidth={1.1} /> : null;
					})}
					{P.map(([x, y], i) => (
						<circle key={i} cx={x} cy={y} r={1.6} fill={hull.includes(i) ? C.white : DIM} opacity={ap(t, i, 2)} />
					))}
				</>
			);
		}
		case 'equipo': {
			const xs = [20, 48, 76];
			return (
				<>
					{xs.map((x, i) => (
						<g key={i} opacity={ap(t, i, 5)}>
							<circle cx={x} cy={24} r={5.5} fill="#E0A47E" />
							<path d={`M${x - 8},44 Q${x - 8},32 ${x},32 Q${x + 8},32 ${x + 8},44 Z`} fill={[C.green, C.blue, C.amber][i]} />
						</g>
					))}
					<g opacity={ap(t, 3, 5)}>
						<rect x={37} y={34} width={22} height={13} rx={1.2} fill="#1B211D" stroke={LINE} strokeWidth={0.7} />
						<rect x={39} y={36} width={18} height={9} fill={C.greenDeep} />
						<T x={48} y={40.8} s={4.4} c={C.white} anchor="middle" w={700}>&gt;_</T>
						<rect x={33} y={47.5} width={30} height={2.2} rx={1} fill={LINE} />
						<rect x={3} y={45} width={14} height={8} rx={0.8} fill={C.white} />
						<line x1={10} y1={45} x2={10} y2={53} stroke={DIM} strokeWidth={0.5} />
					</g>
					{([[10, C.red], [86, C.amber], [64, C.blue]] as [number, string][]).map(([x, c], i) => {
						const o = ap(t, 4 + i, 5);
						const rise = Math.min(8, Math.max(0, (t - (4 + i) * 5) / 3));
						const y = 11 - rise;
						return (
							<g key={i} opacity={o}>
								<ellipse cx={x} cy={y} rx={3.4} ry={4.2} fill={c} />
								<line x1={x} y1={y + 4.2} x2={x} y2={y + 13} stroke={DIM} strokeWidth={0.5} />
							</g>
						);
					})}
				</>
			);
		}
	}
	return null;
};

/** Ilustración animada: entra con rebote en `at`, se dibuja paso a paso y se va en `out`. */
export const Ilustracion: React.FC<{kind: IlusKind; at: number; out?: number; x: number; y: number; scale?: number; hl?: number; frame?: boolean}> = ({kind, at, out, x, y, scale = 6, hl = -1, frame = true}) => {
	const f = useCurrentFrame();
	if (f < at - 1) return null;
	if (out !== undefined && f >= out) return null;
	const p = pop(f, at, 12, 230, 0.6);
	const o = out !== undefined ? 1 - tween(f, out - 8, out) : 1;
	const [w, h] = ILUS_SIZE[kind];
	const pad = 3 * scale;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				padding: frame ? pad : 0,
				background: frame ? 'rgba(8,11,9,0.92)' : undefined,
				border: frame ? `3px solid ${C.line2}` : undefined,
				boxShadow: frame ? '0 24px 70px rgba(0,0,0,0.55)' : undefined,
				opacity: Math.min(1, p * 2) * o,
				transform: `scale(${0.7 + 0.3 * p})`,
				transformOrigin: '50% 50%',
			}}
		>
			<svg width={w * scale} height={h * scale} viewBox={`0 0 ${w} ${h}`} style={{display: 'block', overflow: 'visible'}}>
				<Draw kind={kind} t={f - at} hl={hl} />
			</svg>
		</div>
	);
};
