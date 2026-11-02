import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {tween} from '../../lib';
import {M, SC} from '../../timeline';
import {POSES} from '../../mascot';
import {Verdict} from '../../components';
import {Big, FINAL, Hit, In, Kicker, Panel, VReelDef} from './frame';

/** Reel 01 · ¿Qué es la programación competitiva? (segmento s02, maquetación vertical). */
const k = (m: string) => M('s02', m);

/** Barra de progreso (tiempo o memoria) que se llena al entrar. */
const Bar: React.FC<{at: number; v: number; label: string}> = ({at, v, label}) => {
	const f = useCurrentFrame();
	return (
		<div style={{marginTop: 22}}>
			<div style={{height: 14, background: 'rgba(255,255,255,0.12)'}}>
				<div style={{height: 14, width: `${tween(f, at + 4, at + 24, 0, v) * 100}%`, background: C.green}} />
			</div>
			<div style={{fontFamily: MONO, fontSize: 32, color: C.dim, marginTop: 10}}>{label}</div>
		</div>
	);
};

/** «competitiva» con el tachado que se traza en `at`. */
const Tachada: React.FC<{at: number}> = ({at}) => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'relative', display: 'inline-block'}}>
			<Big size={136} color={C.white}>
				competitiva
			</Big>
			<div style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 12, background: C.amber, transformOrigin: 'left', transform: `scaleX(${tween(f, at, at + 12)})`}} />
		</div>
	);
};

const Body: React.FC = () => {
	const steps = [
		{at: k('resolver'), y: 450, no: '01', t: 'problema', sub: 'una situación', accent: C.line2},
		{at: k('algoritmos'), y: 700, no: '02', t: 'algoritmo', sub: 'la idea', accent: C.line2},
		{at: k('algoritmos') + 18, y: 950, no: '03', t: 'código', sub: 'C++ · Java · Python', accent: C.green},
	];
	const reqs = [
		{at: k('correcta'), y: 450, t: 'correcta', node: <Verdict kind="AC" size={44} />, bar: null as null | {v: number; label: string}},
		{at: k('eficiente'), y: 700, t: 'eficiente', node: null, bar: {v: 0.12, label: 'tiempo 0,12 s / 1 s'}},
		{at: k('recursos'), y: 950, t: 'recursos', node: null, bar: {v: 0.06, label: 'memoria 14 MB / 256 MB'}},
	];
	const skills = [
		{at: k('logica'), x: 60, y: 520, from: 'left' as const, t: 'lógica', g: 'si ⇒ entonces', last: false},
		{at: k('creatividad'), x: 550, y: 520, from: 'right' as const, t: 'creatividad', g: '¿y si…?', last: false},
		{at: k('conoc'), x: 60, y: 840, from: 'left' as const, t: 'algoritmos', g: 'O(n log n)', last: false},
		{at: k('practica'), x: 550, y: 840, from: 'right' as const, t: 'práctica', g: 'problema tras problema', last: true},
	];
	const uses = [
		{at: k('software'), y: 450, g: '</>', t: 'Desarrollar software'},
		{at: k('entrevistas'), y: 700, g: '?!', t: 'Entrevistas técnicas'},
		{at: k('estructurada'), y: 950, g: '1·2·3', t: 'Resolver con estructura'},
	];
	return (
		<>
			{/* acto 1: problema → algoritmo → código */}
			{steps.map((s, i) => (
				<In key={`step-${i}`} at={s.at} out={k('funcione') - 2} x={60} y={s.y} w={960} from="left" exit="left">
					<Panel accent={s.accent} pad={24} style={{height: 220, boxSizing: 'border-box'}}>
						<Kicker>{s.no}</Kicker>
						<Big size={84} style={{marginTop: 10}}>
							{s.t}
						</Big>
						<div style={{fontFamily: MONO, fontSize: 34, color: C.dim, marginTop: 8}}>{s.sub}</div>
					</Panel>
				</In>
			))}

			{/* «funciona… pero no basta» */}
			<In at={k('funcione')} out={k('correcta') - 4} x={60} y={600} w={960} from="zoom" exit="zoom">
				<Panel accent={C.amber} pad={30}>
					<Kicker color={C.dim}>{'$ ./solucion →'}</Kicker>
					<Big size={68} style={{marginTop: 12}}>
						funciona… <span style={{color: C.amber}}>pero no basta</span>
					</Big>
				</Panel>
			</In>
			<Hit at={k('funcione') + 2} x={540} y={800} />

			{/* requisitos: correcta, eficiente, recursos */}
			{reqs.map((r, i) => (
				<In key={`req-${i}`} at={r.at} out={k('logica') - 6} x={60} y={r.y} w={960} from="right" exit="left">
					<Panel accent={C.green} pad={24} style={{height: 220, boxSizing: 'border-box'}}>
						<Big size={72} style={{display: 'flex', alignItems: 'center', gap: 22}}>
							{r.t} {r.node}
						</Big>
						{r.bar && <Bar at={r.at} v={r.bar.v} label={r.bar.label} />}
					</Panel>
				</In>
			))}
			<Hit at={k('correcta') + 2} x={540} y={800} />

			{/* acto 2: lo que se necesita */}
			<In at={k('logica') - 6} out={k('nombre') - 6} x={60} y={450} w={960} from="up" exit="up">
				<Kicker>{'// para lograrlo necesitas'}</Kicker>
			</In>
			{skills.map((s, i) => (
				<In key={`skill-${i}`} at={s.at} out={k('nombre') - 6} x={s.x} y={s.y} w={470} from={s.from} exit="down">
					<Panel accent={s.last ? C.green : C.line2} pad={30} style={{height: 290, boxSizing: 'border-box', background: s.last ? 'rgba(0,192,99,0.14)' : C.panel}}>
						<Kicker color={C.faint}>{`skill_0${i + 1}`}</Kicker>
						<Big size={64} color={s.last ? C.green : C.white} style={{marginTop: 14}}>
							{s.t}
						</Big>
						<div style={{fontFamily: MONO, fontSize: 30, color: C.dim, marginTop: 16}}>{s.g}</div>
					</Panel>
				</In>
			))}

			{/* acto 3: no hace falta competir */}
			<In at={k('nombre')} out={k('software') - 6} x={60} y={450} w={960} from="up" exit="up">
				<Tachada at={k('nombre') + 34} />
			</In>
			<In at={k('nombre') + 40} out={k('software') - 6} x={60} y={680} w={960} from="up" exit="up">
				<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 52, color: C.text, lineHeight: 1.15}}>
					…no necesitas competir para <span style={{color: C.green}}>beneficiarte</span>.
				</div>
			</In>
			<Hit at={k('nombre') + 36} x={540} y={760} big />

			{/* tres usos */}
			{uses.map((u, i) => (
				<In key={`use-${i}`} at={u.at} x={60} y={u.y} w={960} from="right" exit="left">
					<Panel pad={24} style={{height: 220, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 40}}>
						<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 96, color: C.green, width: 200, flexShrink: 0}}>{u.g}</div>
						<div style={{fontFamily: SANS, fontWeight: 760, fontSize: 56, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.1}}>{u.t}</div>
					</Panel>
				</In>
			))}
			<Hit at={k('software') + 2} x={540} y={800} />
		</>
	);
};

export const QueEsReel: VReelDef = {
	id: 'Reel1QueEs',
	n: 'qué es',
	title: '¿Qué es la programación competitiva?',
	hl: ['competitiva?'],
	parts: [SC.que, FINAL],
	Body,
	hook: 'h1',
	lint: [
		{at: k('resolver'), pose: POSES.point},
		{at: k('funcione') + 16, pose: POSES.shrug},
		{at: k('correcta'), pose: POSES.pointUp},
		{at: k('logica'), pose: POSES.think},
		{at: k('practica'), pose: POSES.cheer},
		{at: k('nombre'), pose: POSES.oops},
		{at: k('nombre') + 40, pose: POSES.wave},
		{at: k('software'), pose: POSES.pointDown},
	],
};
