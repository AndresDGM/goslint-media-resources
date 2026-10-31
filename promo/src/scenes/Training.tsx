import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {inCubic, outExpo, pop, tween, typed} from '../lib';
import {GridBg, Label, RiseWords, Verdict, WipeBar} from '../components';
import {SYNC} from '../timeline';

/* ============================================================ Problem card */

const ENUNCIADO =
	'Goslint es el semillero de Ingeniería de Sistemas de la UCEVA que estudia algoritmos y estructuras de datos, resuelve problemas en equipo y se prepara para las maratones de programación.';

export const Problem: React.FC = () => {
	const f = useCurrentFrame();
	const enter = pop(f, 360, 18, 170, 0.8);
	const exit = tween(f, 440, 452, 0, 1, inCubic);
	const n = typed(f, 376, 95, ENUNCIADO.length);
	const chips = ['C / C++', 'Python', 'Java'];
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.35} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div
					style={{
						width: 1560,
						background: C.panel,
						border: `1.5px solid ${C.line2}`,
						borderRadius: 14,
						overflow: 'hidden',
						transform: `translateY(${(1 - enter) * 160}px) scale(${1 - exit * 0.08})`,
						opacity: Math.min(1, enter * 1.6) * (1 - exit),
						boxShadow: '0 50px 140px rgba(0,0,0,0.7)',
					}}
				>
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '34px 52px', background: '#000', borderBottom: `1px solid ${C.line2}`}}>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 54, letterSpacing: '-0.02em', color: C.white}}>
							<span style={{color: C.green}}>Problema A</span> · Únete a Goslint
						</div>
						<div style={{fontFamily: MONO, fontSize: 24, color: C.dim, textAlign: 'right', lineHeight: 1.5}}>
							Límite de tiempo: 1 semestre
							<br />
							Límite de memoria: ilimitada
						</div>
					</div>
					<div style={{padding: '44px 52px 52px', minHeight: 360}}>
						<Label color={C.faint}>Enunciado</Label>
						<div style={{position: 'relative', marginTop: 18, fontFamily: SANS, fontSize: 44, lineHeight: 1.38, color: C.text, fontWeight: 400}}>
							<span style={{visibility: 'hidden'}}>{ENUNCIADO}</span>
							<span style={{position: 'absolute', inset: 0}}>
								<b style={{color: C.white, fontWeight: 700}}>{ENUNCIADO.slice(0, Math.min(n, 7))}</b>
								{ENUNCIADO.slice(7, n)}
								{n < ENUNCIADO.length && <span style={{display: 'inline-block', width: '0.5em', height: '1em', background: C.green, verticalAlign: '-0.15em'}} />}
							</span>
						</div>
						<div style={{display: 'flex', gap: 18, marginTop: 34}}>
							{chips.map((c, i) => {
								const p = pop(f, 404 + i * 5, 14, 220, 0.5);
								return (
									<div key={c} style={{background: '#000', border: `1px solid ${C.line2}`, padding: '12px 22px', fontFamily: MONO, fontSize: 26, color: C.white, display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${0.6 + p * 0.4})`, opacity: p}}>
										<span style={{width: 12, height: 12, borderRadius: 6, background: C.green, display: 'inline-block'}} />
										{c}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ============================================================ BFS graph */

const NODES: [number, number][] = [
	[120, 360], [300, 180], [300, 540], [500, 90], [500, 330], [500, 610],
	[700, 200], [700, 470], [880, 110], [880, 340], [880, 600], [1020, 360],
];
const EDGES: [number, number][] = [
	[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7],
	[6, 8], [6, 9], [7, 9], [7, 10], [9, 11], [8, 11], [10, 11],
];
// BFS distance from node 0
const DIST = (() => {
	const d = Array(NODES.length).fill(-1);
	d[0] = 0;
	const q = [0];
	while (q.length) {
		const u = q.shift()!;
		for (const [a, b] of EDGES) {
			const v = a === u ? b : b === u ? a : -1;
			if (v >= 0 && d[v] < 0) {
				d[v] = d[u] + 1;
				q.push(v);
			}
		}
	}
	return d;
})();
const LEVEL_T = (lvl: number) => 478 + lvl * 15;

export const Graph: React.FC<{style?: React.CSSProperties}> = ({style}) => {
	const f = useCurrentFrame();
	const appear = tween(f, 452, 476, 0, 1, outExpo);
	const levelNow = Math.floor((f - 478) / 15);
	const queue = NODES.map((_, i) => i).filter((i) => DIST[i] === levelNow + 1);
	return (
		<div style={{position: 'absolute', left: 820, top: 190, width: 1060, height: 720, opacity: appear, ...style}}>
			<svg width={1140} height={720} viewBox="0 0 1140 720">
				{EDGES.map(([a, b], i) => {
					const lvl = Math.max(DIST[a], DIST[b]);
					const t = tween(f, LEVEL_T(lvl) - 15, LEVEL_T(lvl), 0, 1);
					const [x1, y1] = NODES[a];
					const [x2, y2] = NODES[b];
					const tree = Math.abs(DIST[a] - DIST[b]) === 1;
					return (
						<g key={i}>
							<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.16)" strokeWidth={3} />
							{tree && (
								<line x1={x1} y1={y1} x2={x1 + (x2 - x1) * t} y2={y1 + (y2 - y1) * t} stroke={C.green} strokeWidth={5} />
							)}
						</g>
					);
				})}
				{NODES.map(([x, y], i) => {
					const lit = f >= LEVEL_T(DIST[i]);
					const p = pop(f, LEVEL_T(DIST[i]), 10, 260, 0.5);
					return (
						<g key={i} transform={`translate(${x} ${y})`}>
							{lit && <circle r={34 + 26 * (1 - Math.min(1, p))} fill="none" stroke={C.green} strokeOpacity={0.5 * (1 - Math.min(1, p))} strokeWidth={3} />}
							<circle r={34} fill={lit ? C.green : C.panel2} stroke={lit ? C.green : 'rgba(255,255,255,0.35)'} strokeWidth={3} />
							<text textAnchor="middle" dy={11} fontFamily={MONO} fontSize={30} fontWeight={800} fill={lit ? '#001a0c' : C.dim}>
								{lit ? DIST[i] : '∞'}
							</text>
						</g>
					);
				})}
			</svg>
			<div style={{fontFamily: MONO, fontSize: 26, color: C.dim, marginTop: -10, marginLeft: 20}}>
				<span style={{color: C.green}}>bfs</span>(0) · cola = [{queue.join(', ')}]
			</div>
		</div>
	);
};

const LETTERS = 'ABCDEFGHIJKL'.split('');
export const Tiles: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<div style={{display: 'flex', gap: 12, marginTop: 40}}>
			{LETTERS.map((l, i) => {
				const at = SYNC.problemaTras + 2 + i * 2;
				const ok = f >= at;
				const p = pop(f, at, 12, 300, 0.4);
				return (
					<div
						key={l}
						style={{
							width: 52,
							height: 64,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontFamily: MONO,
							fontWeight: 800,
							fontSize: 30,
							background: ok ? C.green : C.panel2,
							color: ok ? '#001a0c' : C.dim,
							border: `1px solid ${ok ? C.green : C.line2}`,
							transform: `scale(${ok ? 0.85 + 0.15 * p : 1})`,
						}}
					>
						{l}
					</div>
				);
			})}
		</div>
	);
};

/* ============================================================ code panes (code from the poster) */

export const CODE = {
	cpp: {
		file: 'main.cpp',
		lang: 'C / C++',
		time: '0.01 s',
		at: SYNC.cpp,
		src: `#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  long long a, b;
  cin >> a >> b;
  cout << a + b << '\\n';
}`,
	},
	py: {
		file: 'main.py',
		lang: 'Python',
		time: '0.03 s',
		at: SYNC.python,
		src: `import sys
input = sys.stdin.readline

a, b = map(int, input().split())
print(a + b)

# corto y legible`,
	},
	java: {
		file: 'Main.java',
		lang: 'Java',
		time: '0.09 s',
		at: SYNC.java,
		src: `import java.util.*;

public class Main {
  public static void main(String[] a) {
    Scanner sc = new Scanner(System.in);
    long x = sc.nextLong();
    long y = sc.nextLong();
    System.out.println(x + y);
  }
}`,
	},
};

const KW = /\b(include|using|namespace|int|long|import|public|class|static|void|new|print|return|map)\b/g;

export const Highlighted: React.FC<{text: string}> = ({text}) => {
	const lines = text.split('\n');
	return (
		<>
			{lines.map((ln, i) => {
				const parts: React.ReactNode[] = [];
				let last = 0;
				const isComment = ln.trim().startsWith('#') && !ln.includes('include');
				if (isComment) return <div key={i} style={{color: C.faint}}>{ln || ' '}</div>;
				ln.replace(KW, (m, _g, idx: number) => {
					parts.push(ln.slice(last, idx));
					parts.push(<span key={idx} style={{color: C.green}}>{m}</span>);
					last = idx + m.length;
					return m;
				});
				parts.push(ln.slice(last));
				return <div key={i}>{ln.length ? parts : '\u00A0'}</div>;
			})}
		</>
	);
};

export const Pane: React.FC<{k: keyof typeof CODE; x: number}> = ({k, x}) => {
	const f = useCurrentFrame();
	const c = CODE[k];
	const enter = c.at - 20;
	const p = pop(f, enter, 16, 200, 0.6);
	const n = typed(f, enter + 2, 330, c.src.length);
	const done = f >= c.at;
	const v = pop(f, c.at, 10, 300, 0.5);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: 300,
				width: 540,
				height: 560,
				background: '#050605',
				border: `1.5px solid ${done ? C.green : C.line2}`,
				borderRadius: 12,
				overflow: 'hidden',
				transform: `translateY(${(1 - p) * 120}px)`,
				opacity: Math.min(1, p * 1.5),
				boxShadow: done ? `0 0 60px rgba(0,192,99,${0.25 * Math.min(1, v)})` : 'none',
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between', padding: '16px 22px', borderBottom: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 22, color: C.dim}}>
				<span>{c.file}</span>
				<span style={{letterSpacing: 4}}>
					<span style={{color: C.green}}>●</span>●●
				</span>
			</div>
			<div style={{padding: '20px 22px', fontFamily: MONO, fontSize: 21, lineHeight: 1.55, color: C.text, height: 410, whiteSpace: 'pre'}}>
				<Highlighted text={c.src.slice(0, n)} />
			</div>
			<div style={{position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', borderTop: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 22, color: C.dim}}>
				<span>{c.lang}</span>
				{done ? (
					<span style={{transform: `scale(${0.6 + 0.4 * v})`, display: 'inline-flex', alignItems: 'center', gap: 12}}>
						<Verdict kind="AC" size={24} />
						<span style={{color: C.green}}>{c.time}</span>
					</span>
				) : (
					<span>compilando…</span>
				)}
			</div>
		</div>
	);
};

/* ============================================================ scene */

export const Training: React.FC = () => {
	const f = useCurrentFrame();
	const partA = f < 572;
	const aOut = tween(f, 562, 574, 0, 1, inCubic);
	const bIn = tween(f, 566, 580, 0, 1, outExpo);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.35} />
			{partA || aOut < 1 ? (
				<AbsoluteFill style={{opacity: 1 - aOut, transform: `translateY(${-aOut * 60}px)`}}>
					<div style={{position: 'absolute', left: 130, top: 230, width: 760}}>
						<Label color={C.green}>// 01 · Entrenamiento</Label>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 98, lineHeight: 1.0, letterSpacing: '-0.035em', color: C.white, marginTop: 26}}>
							<div>
								<RiseWords text="Algoritmos" start={470} />
							</div>
							{f >= SYNC.estructuras - 2 && (
								<div style={{color: C.dim, fontWeight: 700}}>
									<RiseWords text="y estructuras de datos." start={SYNC.estructuras} stagger={3} highlight={['estructuras', 'datos']} />
								</div>
							)}
						</div>
						{f >= SYNC.problemaTras - 4 && (
							<div style={{marginTop: 30}}>
								<div style={{fontFamily: MONO, fontSize: 30, color: C.text, opacity: tween(f, SYNC.problemaTras - 4, SYNC.problemaTras + 4)}}>problema tras problema</div>
								<Tiles />
							</div>
						)}
					</div>
					<Graph />
				</AbsoluteFill>
			) : null}
			{f >= 566 && (
				<AbsoluteFill style={{opacity: bIn}}>
					<div style={{position: 'absolute', left: 130, top: 150, right: 130, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: '-0.03em', color: C.white}}>
							Un problema, <span style={{color: C.green}}>tres lenguajes</span>
						</div>
						<div style={{fontFamily: MONO, fontSize: 26, color: C.faint}}>// sumar dos enteros a y b</div>
					</div>
					<Pane k="cpp" x={130} />
					<Pane k="py" x={690} />
					<Pane k="java" x={1250} />
				</AbsoluteFill>
			)}
			<WipeBar at={646} dur={14} />
		</AbsoluteFill>
	);
};

