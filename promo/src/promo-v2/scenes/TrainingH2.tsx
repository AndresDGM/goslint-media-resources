import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {inCubic, outExpo, pop, tween, typed} from '../../lib';
import {GridBg, Label, RiseWords, WipeBar} from '../../components';
import {SYNC} from '../../timeline';
import {CODE, Graph, Pane, Tiles} from '../../scenes/Training';
import {Shift} from '../../reel/ui';
import {BFS_AT, PANE_AT, R2, T} from '../../reel-v2/timeline';

/* ============================================================ Problem card */

const ENUNCIADO =
	'Goslint es el semillero de Ingeniería de Sistemas de la UCEVA que estudia algoritmos y estructuras de datos, resuelve problemas en equipo y se prepara para las maratones de programación.';

/** «…el semillero de Ingeniería de Sistemas de la UCEVA»: the statement of «Problema A» types itself under the voice. */
export const ProblemH2: React.FC = () => {
	const f = useCurrentFrame();
	const [A, B] = R2.problem;
	const enter = pop(f, A - 3, 18, 170, 0.8);
	const exit = tween(f, B - 11, B, 0, 1, inCubic);
	const n = typed(f, A + 9, 170, ENUNCIADO.length);
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
								const p = pop(f, A + 24 + i * 5, 14, 220, 0.5);
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

/* ============================================================ scene */

/**
 * «Aquí aprendemos a diseñar algoritmos, trabajar con estructuras de datos y resolver problemas
 * usando C++, Python y Java.» The 16:9 BFS, tiles and code panes, each shifted onto its own word.
 */
export const TrainingH2: React.FC = () => {
	const f = useCurrentFrame();
	const [, B] = R2.training;
	const aOut = tween(f, T.usando - 6, T.usando + 6, 0, 1, inCubic);
	const bIn = tween(f, T.usando - 2, T.usando + 12, 0, 1, outExpo);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.35} />
			{aOut < 1 ? (
				<AbsoluteFill style={{opacity: 1 - aOut, transform: `translateY(${-aOut * 60}px)`}}>
					<div style={{position: 'absolute', left: 130, top: 230, width: 760}}>
						<Label color={C.green}>// 01 · Entrenamiento</Label>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 98, lineHeight: 1.0, letterSpacing: '-0.035em', color: C.white, marginTop: 26}}>
							<div>
								<RiseWords text="Algoritmos" start={T.disenar - 2} />
							</div>
							{f >= T.estructuras - 4 && (
								<div style={{color: C.dim, fontWeight: 700}}>
									<RiseWords text="y estructuras de datos." start={T.estructuras - 2} stagger={3} highlight={['estructuras', 'datos']} />
								</div>
							)}
						</div>
						{f >= T.yResolver - 4 && (
							<div style={{marginTop: 30}}>
								<div style={{fontFamily: MONO, fontSize: 30, color: C.text, opacity: tween(f, T.yResolver - 4, T.yResolver + 4)}}>resolver problemas</div>
								<Shift by={SYNC.problemaTras - T.resolver}>
									<Tiles />
								</Shift>
							</div>
						)}
					</div>
					<Shift by={478 - BFS_AT}>
						<Graph />
					</Shift>
				</AbsoluteFill>
			) : null}
			{f >= T.usando - 2 && (
				<AbsoluteFill style={{opacity: bIn}}>
					<div style={{position: 'absolute', left: 130, top: 150, right: 130, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: '-0.03em', color: C.white}}>
							Un problema, <span style={{color: C.green}}>tres lenguajes</span>
						</div>
						<div style={{fontFamily: MONO, fontSize: 26, color: C.faint}}>// sumar dos enteros a y b</div>
					</div>
					{/* each pane gets its verdict as its language is named */}
					<Shift by={CODE.cpp.at - PANE_AT.cpp}>
						<Pane k="cpp" x={130} />
					</Shift>
					<Shift by={CODE.py.at - PANE_AT.py}>
						<Pane k="py" x={690} />
					</Shift>
					<Shift by={CODE.java.at - PANE_AT.java}>
						<Pane k="java" x={1250} />
					</Shift>
				</AbsoluteFill>
			)}
			<WipeBar at={B - 14} dur={14} />
		</AbsoluteFill>
	);
};
