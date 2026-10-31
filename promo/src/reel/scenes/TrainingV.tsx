import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {inCubic, outExpo, pop, tween, typed} from '../../lib';
import {GridBg, Label, RiseWords, Verdict} from '../../components';
import {SYNC} from '../../timeline';
import {CODE, Graph, Highlighted, Tiles} from '../../scenes/Training';
import {WipeUp} from '../ui';

/* ============================================================ Problem card (Reel frames) */

const ENUNCIADO =
	'Goslint es el semillero de Ingeniería de Sistemas de la UCEVA que estudia algoritmos y estructuras de datos, resuelve problemas en equipo y se prepara para las maratones de programación.';

export const ProblemV: React.FC = () => {
	const f = useCurrentFrame();
	const enter = pop(f, 201, 18, 170, 0.8);
	const exit = tween(f, 274, 285, 0, 1, inCubic);
	const n = typed(f, 214, 140, ENUNCIADO.length);
	const chips = ['C / C++', 'Python', 'Java'];
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.35} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 300}}>
				<div
					style={{
						width: 960,
						background: C.panel,
						border: `1.5px solid ${C.line2}`,
						borderRadius: 16,
						overflow: 'hidden',
						transform: `translateY(${(1 - enter) * 200}px) scale(${1 - exit * 0.08})`,
						opacity: Math.min(1, enter * 1.6) * (1 - exit),
						boxShadow: '0 50px 140px rgba(0,0,0,0.7)',
					}}
				>
					<div style={{padding: '36px 44px 32px', background: '#000', borderBottom: `1px solid ${C.line2}`}}>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 66, lineHeight: 1.08, letterSpacing: '-0.025em', color: C.white}}>
							<div style={{color: C.green}}>Problema A</div>
							<div>Únete a Goslint</div>
						</div>
						<div style={{fontFamily: MONO, fontSize: 28, color: C.dim, lineHeight: 1.5, marginTop: 18}}>
							Límite de tiempo: 1 semestre
							<br />
							Límite de memoria: ilimitada
						</div>
					</div>
					<div style={{padding: '36px 44px 44px'}}>
						<Label color={C.faint} size={26}>
							Enunciado
						</Label>
						<div style={{position: 'relative', marginTop: 16, fontFamily: SANS, fontSize: 46, lineHeight: 1.34, color: C.text, fontWeight: 400}}>
							<span style={{visibility: 'hidden'}}>{ENUNCIADO}</span>
							<span style={{position: 'absolute', inset: 0}}>
								<b style={{color: C.white, fontWeight: 700}}>{ENUNCIADO.slice(0, Math.min(n, 7))}</b>
								{ENUNCIADO.slice(7, n)}
								{n < ENUNCIADO.length && <span style={{display: 'inline-block', width: '0.5em', height: '1em', background: C.green, verticalAlign: '-0.15em'}} />}
							</span>
						</div>
						<div style={{display: 'flex', gap: 18, marginTop: 34}}>
							{chips.map((c, i) => {
								const p = pop(f, 236 + i * 5, 14, 220, 0.5);
								return (
									<div key={c} style={{background: '#000', border: `1px solid ${C.line2}`, padding: '14px 24px', fontFamily: MONO, fontSize: 32, color: C.white, display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${0.6 + p * 0.4})`, opacity: p}}>
										<span style={{width: 14, height: 14, borderRadius: 7, background: C.green, display: 'inline-block'}} />
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

/* ============================================================ code panes */

const PANE_H = 536;
const PANE_STEP = 148;

/**
 * Three side-by-side panes do not fit a phone, so they cascade: each new pane lands lower
 * and leaves the header of the previous one (file name + verdict) in view.
 * `at` = frame of the verdict (defaults to the 16:9 sync point of that language).
 */
export const PaneV: React.FC<{k: keyof typeof CODE; i: number; at?: number}> = ({k, i, at}) => {
	const f = useCurrentFrame();
	const c = CODE[k];
	const verdictAt = at ?? c.at;
	const enter = verdictAt - 20;
	const p = pop(f, enter, 16, 200, 0.6);
	const n = typed(f, enter + 2, 330, c.src.length);
	const done = f >= verdictAt;
	const v = pop(f, verdictAt, 10, 300, 0.5);
	if (f < enter) return null;
	return (
		<div
			style={{
				position: 'absolute',
				left: 60,
				top: 500 + i * PANE_STEP,
				width: 960,
				height: PANE_H,
				background: '#050605',
				border: `2px solid ${done ? C.green : C.line2}`,
				borderRadius: 14,
				overflow: 'hidden',
				transform: `translateY(${(1 - p) * 160}px)`,
				opacity: Math.min(1, p * 1.5),
				boxShadow: `0 -18px 60px rgba(0,0,0,0.75)${done ? `, 0 0 60px rgba(0,192,99,${0.25 * Math.min(1, v)})` : ''}`,
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 76, padding: '0 26px', borderBottom: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 28, color: C.dim}}>
				<span>
					<span style={{color: C.white, fontWeight: 700}}>{c.file}</span>
					<span style={{marginLeft: 20}}>{c.lang}</span>
				</span>
				{done ? (
					<span style={{transform: `scale(${0.6 + 0.4 * v})`, display: 'inline-flex', alignItems: 'center', gap: 14}}>
						<Verdict kind="AC" size={28} />
						<span style={{color: C.green}}>{c.time}</span>
					</span>
				) : (
					<span>compilando…</span>
				)}
			</div>
			<div style={{padding: '20px 26px', fontFamily: MONO, fontSize: 28, lineHeight: 1.5, color: C.text, whiteSpace: 'pre'}}>
				<Highlighted text={c.src.slice(0, n)} />
			</div>
		</div>
	);
};

/* ============================================================ scene (runs on the 16:9 clock, see <Shift>) */

const GRAPH_SCALE = 0.86;

export const TrainingV: React.FC = () => {
	const f = useCurrentFrame();
	const partA = f < 572;
	const aOut = tween(f, 562, 574, 0, 1, inCubic);
	const bIn = tween(f, 566, 580, 0, 1, outExpo);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.35} />
			{partA || aOut < 1 ? (
				<AbsoluteFill style={{opacity: 1 - aOut, transform: `translateY(${-aOut * 60}px)`}}>
					<div style={{position: 'absolute', left: 64, top: 276, width: 960}}>
						<Label color={C.green} size={28}>
							// 01 · Entrenamiento
						</Label>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, lineHeight: 1.0, letterSpacing: '-0.035em', color: C.white, marginTop: 22}}>
							<div>
								<RiseWords text="Algoritmos" start={470} />
							</div>
							{f >= SYNC.estructuras - 2 && (
								<div style={{color: C.dim, fontWeight: 700}}>
									<RiseWords text="y estructuras de datos." start={SYNC.estructuras} stagger={3} highlight={['estructuras', 'datos']} />
								</div>
							)}
						</div>
					</div>
					{/* the BFS from the 16:9 scene, scaled to the width of the phone; its queue read-out is cropped */}
					<div style={{position: 'absolute', left: 84, top: 650, width: 1140 * GRAPH_SCALE, height: 655 * GRAPH_SCALE, overflow: 'hidden'}}>
						<div style={{transform: `scale(${GRAPH_SCALE})`, transformOrigin: '0 0', width: 1140, height: 720}}>
							<Graph style={{left: -40, top: -40}} />
						</div>
					</div>
					{f >= SYNC.problemaTras - 4 && (
						<div style={{position: 'absolute', left: 64, top: 1196}}>
							<div style={{fontFamily: MONO, fontSize: 36, color: C.text, opacity: tween(f, SYNC.problemaTras - 4, SYNC.problemaTras + 4)}}>problema tras problema</div>
							<div style={{transform: 'scale(1.25)', transformOrigin: '0 0', marginTop: -22}}>
								<Tiles />
							</div>
						</div>
					)}
				</AbsoluteFill>
			) : null}
			{f >= 566 && (
				<AbsoluteFill style={{opacity: bIn}}>
					<div style={{position: 'absolute', left: 64, top: 272, right: 64}}>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 84, lineHeight: 1.02, letterSpacing: '-0.035em', color: C.white}}>
							Un problema,
							<br />
							<span style={{color: C.green}}>tres lenguajes</span>
						</div>
						<div style={{fontFamily: MONO, fontSize: 28, color: C.dim, marginTop: 12}}>// sumar dos enteros a y b</div>
					</div>
					<PaneV k="cpp" i={0} />
					<PaneV k="py" i={1} />
					<PaneV k="java" i={2} />
				</AbsoluteFill>
			)}
			<WipeUp at={646} dur={14} />
		</AbsoluteFill>
	);
};
