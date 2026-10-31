import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {clamp, inCubic, pop, rnd, tween} from '../lib';
import {GlitchBurst, GridBg, Label, Typer} from '../components';
import {SYNC} from '../timeline';

const Slam: React.FC<{n: string; word: string; label: string; at: number; until: number}> = ({n, word, label, at, until}) => {
	const f = useCurrentFrame();
	if (f < at || f >= until) return null;
	const p = pop(f, at, 12, 260, 0.5);
	const s = 1.35 - 0.35 * p;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<div style={{transform: `scale(${s})`, opacity: Math.min(1, p * 2), textAlign: 'center'}}>
				<Label color={C.green} size={26} style={{marginBottom: 18}}>
					{label}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 850, fontSize: 230, lineHeight: 0.9, letterSpacing: '-0.045em', color: C.white}}>
					<span style={{color: C.green}}>{n}</span> {word}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const fmt = (sec: number) => {
	const s = Math.max(0, Math.floor(sec));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const ss = s % 60;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};

/** Contest clock: starts at 05:00:00, accelerates. Exported so the HUD can continue it. */
export const contestSeconds = (f: number) => {
	const start = SYNC.reloj;
	if (f < start) return 5 * 3600;
	const t = (f - start) / 30; // seconds of video
	const accel = t < 3.4 ? t + Math.pow(t, 4) * 9 : 3.4 + Math.pow(3.4, 4) * 9 + (t - 3.4) * 4;
	return 5 * 3600 - accel;
};
export const formatClock = fmt;

export const ColdOpen: React.FC = () => {
	const f = useCurrentFrame();
	const clockIn = pop(f, SYNC.reloj - 4, 14, 160, 0.7);
	const shake = interpolate(f, [190, 236], [0, 14], {...clamp, easing: inCubic});
	const sx = (rnd(f * 3.1) - 0.5) * shake;
	const sy = (rnd(f * 7.7) - 0.5) * shake;
	const secs = contestSeconds(f);
	const sweep = (f - SYNC.reloj) * (6 + Math.max(0, f - 180) * 0.9);
	const flash = interpolate(f, [234, 236, 239], [0, 1, 0], clamp);
	const summary = tween(f, 110, 124) * (1 - tween(f, 226, 236));

	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.45} />
			<div style={{position: 'absolute', left: 110, top: 96, fontFamily: MONO, fontSize: 30, color: C.text}}>
				<span style={{color: C.green}}>goslint@uceva</span>
				<span style={{color: C.dim}}>:~$ </span>
				<Typer text="./maraton --duracion=5h --equipo=3 --computadores=1" start={6} cps={34} />
			</div>

			<Slam n="5" word="horas" label="tiempo de competencia" at={SYNC.horas} until={SYNC.personas} />
			<Slam n="3" word="personas" label="por equipo" at={SYNC.personas} until={SYNC.computador} />
			<Slam n="1" word="computador" label="para los tres" at={SYNC.computador} until={112} />

			{/* compact recap that stays above the clock */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 168,
					textAlign: 'center',
					opacity: summary,
					transform: `translateY(${(1 - summary) * 20}px)`,
					fontFamily: MONO,
					fontSize: 32,
					letterSpacing: '0.12em',
					color: C.dim,
				}}
			>
				<span style={{color: C.green}}>5</span> HORAS · <span style={{color: C.green}}>3</span> PERSONAS · <span style={{color: C.green}}>1</span> COMPUTADOR
			</div>

			{f >= SYNC.reloj - 4 && (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: 60, transform: `translate(${sx}px, ${sy}px) scale(${0.85 + clockIn * 0.15 + tween(f, 200, 236, 0, 0.12, inCubic)})`, opacity: clockIn}}>
					<svg width={640} height={640} viewBox="-380 -380 760 760" style={{position: 'absolute'}}>
						{Array.from({length: 60}, (_, i) => {
							const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
							const lit = ((sweep / 6) % 60) > i;
							const r1 = i % 5 === 0 ? 318 : 332;
							return (
								<line
									key={i}
									x1={Math.cos(a) * r1}
									y1={Math.sin(a) * r1}
									x2={Math.cos(a) * 352}
									y2={Math.sin(a) * 352}
									stroke={lit ? C.green : 'rgba(255,255,255,0.22)'}
									strokeWidth={i % 5 === 0 ? 6 : 3}
								/>
							);
						})}
						<circle r={300} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
					</svg>
					<div style={{textAlign: 'center'}}>
						<Label color={C.green} size={24} style={{marginBottom: 6}}>
							tiempo restante
						</Label>
						<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 150, color: C.white, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>
							{fmt(secs)}
						</div>
					</div>
				</AbsoluteFill>
			)}

			<GlitchBurst at={200} len={4} intensity={0.6} />
			<GlitchBurst at={215} len={5} intensity={0.9} />
			<GlitchBurst at={228} len={6} intensity={1.3} />
			<AbsoluteFill style={{background: C.white, opacity: flash}} />
		</AbsoluteFill>
	);
};
