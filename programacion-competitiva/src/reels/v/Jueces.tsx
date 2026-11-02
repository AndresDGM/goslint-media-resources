import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {tween} from '../../lib';
import {M, SC} from '../../timeline';
import {Chip, Verdict} from '../../components';
import {CodePanel} from '../../kit';
import {POSES} from '../../mascot';
import {CASES, SUBS} from '../../solutions';
import {ProblemCard} from '../../scenes/B';
import {Big, FINAL, Hit, In, Kicker, Panel, VReelDef} from './frame';

/** Reel 02 · ¿Cómo funcionan los jueces en línea? (segmentos s03 y s04). */
const k3 = (m: string) => M('s03', m);
const k4 = (m: string) => M('s04', m);
const fmtN = (n: number) => n.toLocaleString('es-CO').replace(/,/g, '.');
const MEANING = {WA: 'respuesta incorrecta', TLE: 'tardó demasiado', RTE: 'error al ejecutarse', AC: '¡solución correcta!'} as const;
const COLOR = {WA: C.red, TLE: C.amber, RTE: C.purple, AC: C.green} as const;

const Body: React.FC = () => {
	const f = useCurrentFrame();
	const marks = ['enunciado', 'entrada', 'salida', 'restricciones'];
	const hl = (m: string) => {
		const i = marks.indexOf(m);
		const t0 = k3(m);
		const t1 = i < marks.length - 1 ? k3(marks[i + 1]) : k3('entender') - 6;
		return Math.min(tween(f, t0 - 2, t0 + 6), 1 - tween(f, t1 - 4, t1 + 4));
	};
	const steps = [
		{at: k3('entender'), n: '1', t: 'Entender', g: '¿qué piden?'},
		{at: k3('piensas'), n: '2', t: 'Pensar el algoritmo', g: '¿bucle? ¿fórmula?'},
		{at: k3('implementas'), n: '3', t: 'Implementar', g: ''},
	];
	const pipe = ['Envío', 'Compilación', 'Casos de prueba', 'Veredicto'];
	const vAt = [k4('wa'), k4('tle'), k4('rte'), k4('ac')];
	const envio = k4('envio');
	const todos = k4('todos');
	const active = vAt.filter((t) => f >= t - 40).length - 1;
	const sub = active >= 0 ? SUBS[active] : null;
	const state = (ci: number) => {
		if (f >= todos) return 'ok';
		if (!sub) return 'idle';
		const t0 = vAt[active] - 40;
		if (f < t0 + ci * 7) return 'idle';
		if (sub.failAt && ci + 1 === sub.failAt) return 'bad';
		if (sub.failAt && ci + 1 > sub.failAt) return 'skip';
		return 'ok';
	};
	const shown = active >= 0 && f >= vAt[active] ? sub!.verdict : null;
	return (
		<>
			{/* el enunciado */}
			<In at={SC.problema[0] + 8} out={k3('entender') - 4} x={60} y={450} from="zoom" exit="up">
				<div style={{transform: 'scale(1.066)', transformOrigin: 'top left'}}>
					<div style={{position: 'relative', width: 900, height: 700}}>
						<ProblemCard x={0} y={0} at={SC.problema[0] + 8} hl={hl} />
					</div>
				</div>
			</In>
			{steps.map((s, i) => (
				<In key={i} at={s.at} out={k4('jueces') - 4} x={60} y={460 + i * 240} w={960} from="right" exit="left">
					<div style={{display: 'flex', alignItems: 'center', gap: 30}}>
						<div style={{width: 130, height: 130, flex: '0 0 130px', border: `5px solid ${C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 72, color: C.green}}>{s.n}</div>
						<div>
							<Big size={64}>{s.t}</Big>
							{s.g && <div style={{fontFamily: MONO, fontSize: 34, color: C.dim, marginTop: 8}}>{s.g}</div>}
							{i === 2 && (
								<div style={{display: 'flex', gap: 14, marginTop: 14}}>
									{(['cpp', 'java', 'python'] as const).map((m, j) =>
										f >= k3(m) ? (
											<Chip key={j} size={34} border={C.green}>
												{['C++', 'Java', 'Python'][j]}
											</Chip>
										) : null,
									)}
								</div>
							)}
						</div>
					</div>
				</In>
			))}
			{/* cómo trabaja un juez */}
			<In at={k4('jueces')} out={k4('verifican') - 4} x={60} y={440} w={960} from="up" exit="up">
				<Big size={96}>
					¡Jueces <span style={{color: C.green}}>en línea!</span>
				</Big>
			</In>
			<Hit at={k4('jueces') + 2} x={540} y={520} big />
			{pipe.map((t, i) => (
				<In key={i} at={k4('ejecutan') + i * 12} out={k4('verifican') - 4} x={60 + i * 40} y={620 + i * 140} w={840} from="left" exit="left">
					<Panel accent={i === 3 ? C.green : C.line2} pad={22}>
						<span style={{fontFamily: MONO, fontSize: 28, color: C.faint}}>{`paso ${i + 1}  `}</span>
						<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 48, color: C.white}}>{t}</span>
					</Panel>
				</In>
			))}
			<In at={k4('verifican')} out={envio - 4} x={60} y={440} w={960} from="up" exit="up">
				<Kicker>{'// tu salida contra la esperada'}</Kicker>
			</In>
			{CASES.map((n, i) => (
				<In key={i} at={k4('verifican') + i * 5} out={envio - 4} x={60} y={500 + i * 134} w={960} from="right" exit="left" impact={false}>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.panel, border: `2px solid ${C.line2}`, padding: '18px 28px', fontFamily: MONO, fontSize: 38, color: C.text}}>
						<span style={{color: C.faint, fontSize: 28}}>{`caso ${i + 1}${i === 0 ? ' · ejemplo' : ''}`}</span>
						<span>{`n = ${i === 4 ? '10⁹' : fmtN(n)}`}</span>
						<span style={{color: C.green}}>{`→ ${n === 1e9 ? '5·10¹⁷' : fmtN((n * (n + 1)) / 2)}`}</span>
					</div>
				</In>
			))}
			{/* los cuatro envíos */}
			<In at={envio - 4} x={60} y={440} w={960} from="zoom">
				<div style={{background: C.panel, border: `2px solid ${C.line2}`, height: 470, position: 'relative', overflow: 'hidden'}}>
					<div style={{height: 54, background: '#050605', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 20px', fontFamily: MONO, fontSize: 26, color: C.dim}}>{sub ? `${sub.file} · ${sub.lang}` : 'solucion'}</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 54, bottom: 0}}>{sub && <CodePanel key={sub.id} lines={sub.code} start={vAt[active] - 50} fontSize={sub.lang === 'C++' ? 27 : 32} lineH={sub.lang === 'C++' ? 42 : 52} py={sub.lang === 'Python'} />}</div>
				</div>
			</In>
			{f >= envio - 4 && (
				<div style={{position: 'absolute', left: 60, top: 940, width: 960, display: 'flex', justifyContent: 'space-between'}}>
					{CASES.map((n, ci) => {
						const s = state(ci);
						const bg = s === 'ok' ? C.green : s === 'bad' ? COLOR[sub!.verdict] : 'transparent';
						const glow = ci === 0 && f >= k4('ejemplo') && f < todos;
						return (
							<div key={ci} style={{textAlign: 'center', padding: 6, border: `3px solid ${glow ? C.white : 'transparent'}`}}>
								<div style={{width: 150, height: 110, background: bg, border: `3px solid ${s === 'idle' || s === 'skip' ? C.line2 : bg}`, opacity: s === 'skip' ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 56, color: '#0A0F0C'}}>{s === 'ok' ? '✓' : s === 'bad' ? '✗' : ''}</div>
								<div style={{fontFamily: MONO, fontSize: 24, color: C.dim, marginTop: 6}}>{`caso ${ci + 1}`}</div>
							</div>
						);
					})}
				</div>
			)}
			{shown && f < k4('ejemplo') && (
				<In key={shown} at={vAt[active]} x={60} y={1110} w={960} from="zoom" impact>
					<div style={{display: 'flex', alignItems: 'center', gap: 22, justifyContent: 'center'}}>
						<Verdict kind={shown} size={60} />
						<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.white}}>{MEANING[shown]}</span>
					</div>
				</In>
			)}
			{vAt.map((t, i) => (
				<Hit key={i} at={t + 1} x={540} y={1000} big={i === 3} />
			))}
			<In at={k4('ejemplo')} out={todos - 2} x={60} y={1110} w={960} from="down" exit="down">
				<div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 760, fontSize: 40, color: C.white}}>
					Los cuatro pasaban <span style={{color: C.green}}>el ejemplo</span>
				</div>
			</In>
			<In at={todos} out={k4('desafio') - 2} x={60} y={1110} w={960} from="zoom">
				<div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 840, fontSize: 52, color: C.green}}>¡todos los casos!</div>
			</In>
			<In at={k4('desafio')} x={60} y={1100} w={960} from="up">
				<div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 860, fontSize: 56, color: C.white}}>
					Ahí está <span style={{color: C.amber}}>el desafío</span>
				</div>
			</In>
		</>
	);
};

export const JuecesReel: VReelDef = {
	id: 'Reel2Jueces',
	n: 'jueces en línea',
	title: '¿Cómo funcionan los jueces en línea?',
	hl: ['jueces'],
	parts: [[SC.problema[0], SC.juez[1]], FINAL],
	Body,
	hook: 'h2',
	lint: [
		{at: SC.problema[0], pose: POSES.idle},
		{at: k3('enunciado'), pose: POSES.pointUp},
		{at: k3('entender'), pose: POSES.think},
		{at: k3('implementas'), pose: POSES.pointUp},
		{at: k4('jueces'), pose: POSES.cheer},
		{at: envio_(), pose: POSES.pointUp},
		{at: k4('wa'), pose: POSES.oops},
		{at: k4('tle'), pose: POSES.tired},
		{at: k4('rte'), pose: POSES.wow},
		{at: k4('ac'), pose: POSES.cheer},
		{at: k4('desafio'), pose: POSES.wave},
	],
};
function envio_() {
	return k4('envio');
}
