import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {inCubic, outExpo, pop, tween, typed} from '../../lib';
import {GridBg, Label, RiseWords} from '../../components';
import {SYNC} from '../../timeline';
import {Graph, Tiles} from '../../scenes/Training';
import {PaneV} from '../../reel/scenes/TrainingV';
import {Shift, WipeUp} from '../../reel/ui';
import {BFS_AT, PANE_AT, R2, T} from '../timeline';

/* ============================================================ Problem card */

const ENUNCIADO =
	'Goslint es el semillero de Ingeniería de Sistemas de la UCEVA que estudia algoritmos y estructuras de datos, resuelve problemas en equipo y se prepara para las maratones de programación.';

/** «…el semillero de Ingeniería de Sistemas de la UCEVA»: the statement of «Problema A» types itself under the voice. */
export const ProblemV2: React.FC = () => {
	const f = useCurrentFrame();
	const [A, B] = R2.problem;
	const enter = pop(f, A - 3, 18, 170, 0.8);
	const exit = tween(f, B - 11, B, 0, 1, inCubic);
	const n = typed(f, A + 9, 170, ENUNCIADO.length);
	const chips = ['C / C++', 'Python', 'Java'];
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.35} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 340}}>
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
								const p = pop(f, A + 24 + i * 5, 14, 220, 0.5);
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

/* ============================================================ scene */

const GRAPH_SCALE = 0.86;

/**
 * «Aquí aprendemos a diseñar algoritmos, trabajar con estructuras de datos y resolver problemas
 * usando C++, Python y Java.» The BFS and the A–L tiles are the 16:9 components, each shifted
 * to its own word; the three code panes get their verdict as each language is named.
 */
export const TrainingV2: React.FC = () => {
	const f = useCurrentFrame();
	const [, B] = R2.training;
	const aOut = tween(f, T.usando - 6, T.usando + 6, 0, 1, inCubic);
	const bIn = tween(f, T.usando - 2, T.usando + 12, 0, 1, outExpo);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.35} />
			{aOut < 1 ? (
				<AbsoluteFill style={{opacity: 1 - aOut, transform: `translateY(${-aOut * 60}px)`}}>
					<div style={{position: 'absolute', left: 64, top: 276, width: 960}}>
						<Label color={C.green} size={28}>
							// 01 · Entrenamiento
						</Label>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, lineHeight: 1.0, letterSpacing: '-0.035em', color: C.white, marginTop: 22}}>
							<div>
								<RiseWords text="Algoritmos" start={T.disenar - 2} />
							</div>
							{f >= T.estructuras - 4 && (
								<div style={{color: C.dim, fontWeight: 700}}>
									<RiseWords text="y estructuras de datos." start={T.estructuras - 2} stagger={3} highlight={['estructuras', 'datos']} />
								</div>
							)}
						</div>
					</div>
					{/* the BFS from the 16:9 scene, scaled to the width of the phone; its queue read-out is cropped */}
					<div style={{position: 'absolute', left: 84, top: 640, width: 1140 * GRAPH_SCALE, height: 655 * GRAPH_SCALE, overflow: 'hidden'}}>
						<div style={{transform: `scale(${GRAPH_SCALE})`, transformOrigin: '0 0', width: 1140, height: 720}}>
							<Shift by={478 - BFS_AT}>
								<Graph style={{left: -40, top: -40}} />
							</Shift>
						</div>
					</div>
					{f >= T.yResolver - 4 && (
						<div style={{position: 'absolute', left: 64, top: 1172}}>
							<div style={{fontFamily: MONO, fontSize: 36, color: C.text, opacity: tween(f, T.yResolver - 4, T.yResolver + 4)}}>resolver problemas</div>
							<div style={{transform: 'scale(1.25)', transformOrigin: '0 0', marginTop: -22}}>
								<Shift by={SYNC.problemaTras - T.resolver}>
									<Tiles />
								</Shift>
							</div>
						</div>
					)}
				</AbsoluteFill>
			) : null}
			{f >= T.usando - 2 && (
				<AbsoluteFill style={{opacity: bIn}}>
					<div style={{position: 'absolute', left: 64, top: 272, right: 64}}>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 84, lineHeight: 1.02, letterSpacing: '-0.035em', color: C.white}}>
							Un problema,
							<br />
							<span style={{color: C.green}}>tres lenguajes</span>
						</div>
						<div style={{fontFamily: MONO, fontSize: 28, color: C.dim, marginTop: 12}}>// sumar dos enteros a y b</div>
					</div>
					<PaneV k="cpp" i={0} at={PANE_AT.cpp} />
					<PaneV k="py" i={1} at={PANE_AT.py} />
					<PaneV k="java" i={2} at={PANE_AT.java} />
				</AbsoluteFill>
			)}
			<WipeUp at={B - 14} dur={14} />
		</AbsoluteFill>
	);
};
