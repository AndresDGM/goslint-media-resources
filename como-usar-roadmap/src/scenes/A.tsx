import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inCubic, outExpo, tween} from '@commons/lib';
import {GridBg, Label, LogoMark, Shockwave, Typer, Wordmark, countUp} from '@commons/components';
import {POSES} from '@commons/mascot';
import {Big, Hit, In, Kicker, Panel} from '@commons/vertical';
import {Actor} from '../kit';
import {M, SC, V} from '../timeline';
import {PhaseStrip} from '../parts';

/* ================================================================== 00 · apertura (s01) */

export const LOGO_AT = 66;

export const Intro: React.FC = () => {
	const f = useCurrentFrame();
	const k = (m: string) => M('s01', m);
	const p = tween(f, LOGO_AT + 2, LOGO_AT + 44, 0, 1, outExpo);
	const wordP = tween(f, LOGO_AT + 36, LOGO_AT + 52, 0, 1, outExpo);
	const logoOut = tween(f, k('llegar') - 12, k('llegar'), 0, 1, inCubic);
	const lintIn = V.s01.start - 22;
	return (
		<AbsoluteFill>
			<GridBg opacity={f < LOGO_AT ? 0.35 : 0.5} size={90} />
			{f < LOGO_AT && (
				<div style={{position: 'absolute', left: 150, top: 430, fontFamily: MONO, fontSize: 42, color: C.white}}>
					<span style={{color: C.green}}>goslint@uceva</span>
					<span style={{color: C.dim}}>:~$ </span>
					<Typer text="./roadmap --abrir" start={6} cps={30} />
					{f >= 40 && <div style={{marginTop: 22, fontSize: 30, color: C.dim}}>{'> cargando 99 videos · 8 fases'}</div>}
				</div>
			)}
			{f >= LOGO_AT && f < k('llegar') && (
				<AbsoluteFill style={{opacity: 1 - logoOut, transform: `scale(${1 - logoOut * 0.08})`}}>
					<Shockwave at={LOGO_AT} x={960} y={340} />
					<div style={{position: 'absolute', left: 0, right: 0, top: 160, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						<LogoMark height={330} p={p} glow={f > LOGO_AT + 44 ? 16 + Math.sin(f / 6) * 6 : 0} />
						<div style={{marginTop: 44, clipPath: `inset(0 ${(1 - wordP) * 100}% 0 0)`}}>
							<Wordmark height={84} />
						</div>
						<Label size={26} color={C.green} style={{marginTop: 36, opacity: tween(f, LOGO_AT + 56, LOGO_AT + 68)}}>
							bienvenida · 03 · cómo usar este roadmap
						</Label>
					</div>
				</AbsoluteFill>
			)}
			<In at={k('llegar')} out={k('donde') - 2} x={620} y={300} w={1150} from="right" exit="up">
				<Kicker>{'// la meta'}</Kicker>
				<Big size={104} style={{marginTop: 16}}>
					De cero a una <span style={{color: C.green}}>maratón de programación</span>
				</Big>
			</In>
			<In at={k('donde')} out={k('mapa') - 4} x={620} y={330} w={1150} from="zoom" exit="up">
				<Big size={128}>
					¿Por dónde <span style={{color: C.amber}}>empiezo</span>?
				</Big>
			</In>
			<Hit at={k('donde') + 2} x={1180} y={420} />
			<In at={k('tranquilo')} out={k('mapa') - 4} x={620} y={640} w={1100} from="down" exit="down" impact={false}>
				<Label size={34} color={C.dim}>tranquilo: para eso está el mapa ↓</Label>
			</In>
			<PhaseStrip at={k('mapa')} y={250} x0={300} x1={1720} out={SC.intro[1]} />
			<Hit at={k('mapa') + 2} x={1010} y={250} />
			{(
				[
					['como', '01', 'Cómo está organizado'],
					['entrar', '02', 'Dónde entrar según lo que sepas'],
					['practicar', '03', 'Cómo avanzar de fase en fase'],
				] as const
			).map(([m, n, t], i) => (
				<In key={m} at={k(m)} x={620} y={470 + i * 150} w={1100} from="right">
					<Panel accent={i === 2 ? C.green : C.line2} pad={24}>
						<div style={{display: 'flex', alignItems: 'center', gap: 28}}>
							<span style={{fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.green}}>{n}</span>
							<span style={{fontFamily: SANS, fontWeight: 760, fontSize: 48, color: C.white, letterSpacing: '-0.02em'}}>{t}</span>
						</div>
					</Panel>
				</In>
			))}
			<Actor
				x={300}
				y={900}
				scale={9}
				enter={lintIn}
				keys={[
					{at: lintIn, pose: POSES.wave},
					{at: k('llegar'), pose: POSES.pointUp},
					{at: k('donde'), pose: POSES.think},
					{at: k('tranquilo'), pose: POSES.cheer},
					{at: k('mapa'), pose: POSES.pointUp},
					{at: k('como'), pose: POSES.point},
				]}
			/>
		</AbsoluteFill>
	);
};

/* ================================================================== 01 · el mapa (s02) */

export const Mapa: React.FC = () => {
	const f = useCurrentFrame();
	const k = (m: string) => M('s02', m);
	const a = SC.mapa[0];
	const n99 = countUp(f, k('noventa'), k('noventa') + 26, 99);
	const n8 = countUp(f, k('ocho'), k('ocho') + 16, 8);
	const lit = f >= k('lista') ? [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => f >= k('lista') + i * 4) : f >= k('cero') ? [0] : [];
	const strike = tween(f, k('libro') + 22, k('libro') + 36);
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} size={90} />
			<In at={k('noventa')} out={k('nunca') - 4} x={560} y={210} from="zoom" exit="up">
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 230, color: C.green, lineHeight: 1}}>{n99}</div>
				<Label size={40} color={C.white}>videos</Label>
			</In>
			<Hit at={k('noventa') + 2} x={700} y={330} big />
			<In at={k('ocho')} out={k('nunca') - 4} x={1180} y={210} from="zoom" exit="up">
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 230, color: C.white, lineHeight: 1}}>{n8}</div>
				<Label size={40} color={C.green}>fases</Label>
			</In>
			<Hit at={k('ocho') + 2} x={1280} y={330} />
			<PhaseStrip at={k('ocho') + 8} y={640} x0={560} x1={1760} active={f >= k('cero') && f < k('lista') ? 0 : null} lit={lit} out={k('libro') - 2} />
			<In at={k('nunca')} out={k('libro') - 2} x={300} y={250} w={620} from="left" exit="up">
				<Panel pad={22}>
					<Label size={24} color={C.dim}>entras así</Label>
					<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.white, marginTop: 6}}>Nunca he programado</div>
				</Panel>
			</In>
			<In at={k('lista')} out={k('libro') - 2} x={1100} y={250} w={620} from="right" exit="up">
				<Panel accent={C.green} pad={22}>
					<Label size={24} color={C.green}>sales así</Label>
					<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.white, marginTop: 6}}>Listo para entrenar una maratón</div>
				</Panel>
			</In>
			<Hit at={k('lista') + 30} x={1720} y={600} />
			<In at={k('libro')} x={560} y={300} w={1200} from="left">
				<div style={{position: 'relative', display: 'inline-block'}}>
					<Big size={78} color={C.dim}>El orden de un libro de algoritmos</Big>
					<div style={{position: 'absolute', left: 0, top: '52%', height: 8, width: `${strike * 100}%`, background: C.red}} />
				</div>
			</In>
			<In at={k('aprende')} x={560} y={500} w={1200} from="right">
				<Kicker>{'// el roadmap sigue'}</Kicker>
				<Big size={96} style={{marginTop: 12}}>
					El orden en que <span style={{color: C.green}}>de verdad se aprende</span>
				</Big>
			</In>
			<Hit at={k('aprende') + 2} x={1100} y={600} big />
			<Actor
				x={300}
				y={900}
				scale={9}
				keys={[
					{at: a, pose: POSES.idle},
					{at: k('noventa'), pose: POSES.pointUp},
					{at: k('nunca'), pose: POSES.point},
					{at: k('lista'), pose: POSES.cheer},
					{at: k('libro'), pose: POSES.shrug},
					{at: k('aprende'), pose: POSES.cheer},
				]}
			/>
		</AbsoluteFill>
	);
};
