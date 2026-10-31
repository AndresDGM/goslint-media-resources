import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {clamp, inCubic, pop, rnd} from '../../lib';
import {GlitchBurst, GridBg, Label, Typer} from '../../components';
import {formatClock} from '../../scenes/ColdOpen';
import {T, reelClockSeconds} from '../timeline';

/** Number over word: the 16:9 slam («5 horas») restacked so it fills a phone screen. */
export const Slam: React.FC<{n: string; word: string; label: string; at: number; until: number}> = ({n, word, label, at, until}) => {
	const f = useCurrentFrame();
	if (f < at || f >= until) return null;
	const p = pop(f, at, 12, 260, 0.5);
	const s = 1.3 - 0.3 * p;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 430, height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{transform: `scale(${s})`, opacity: Math.min(1, p * 2), textAlign: 'center'}}>
				<Label color={C.green} size={30} style={{marginBottom: 4}}>
					{label}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 850, fontSize: 330, lineHeight: 0.9, letterSpacing: '-0.05em', color: C.green}}>{n}</div>
				<div style={{fontFamily: SANS, fontWeight: 850, fontSize: 150, lineHeight: 0.95, letterSpacing: '-0.045em', color: C.white}}>{word}</div>
			</div>
		</div>
	);
};

const RING = 540;

/** Hook: the contest rules slam in over a clock that is already running. */
export const HookV: React.FC = () => {
	const f = useCurrentFrame();
	const shake = interpolate(f, [72, 116], [0, 14], {...clamp, easing: inCubic});
	const sx = (rnd(f * 3.1) - 0.5) * shake;
	const sy = (rnd(f * 7.7) - 0.5) * shake;
	const sweep = f * (1 + Math.max(0, f - 60) * 0.15);
	const grow = interpolate(f, [84, 116], [0, 0.1], {...clamp, easing: inCubic});
	const flash = interpolate(f, [114, 116, 119], [0, 1, 0], clamp);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.45} />
			<div style={{position: 'absolute', left: 64, top: 268, fontFamily: MONO, fontSize: 34, lineHeight: 1.4, color: C.text}}>
				<span style={{color: C.green}}>goslint@uceva</span>
				<span style={{color: C.dim}}>:~$ </span>
				<Typer text={'./maraton \\\n    --duracion=5h --equipo=3 \\\n    --computadores=1'} start={-10} cps={48} />
			</div>

			<Slam n="5" word="horas" label="tiempo de competencia" at={T.horas - 3} until={T.personas - 2} />
			<Slam n="3" word="personas" label="por equipo" at={T.personas - 2} until={T.computador - 2} />
			<Slam n="1" word="computador" label="para los tres" at={T.computador - 2} until={120} />

			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 945,
					height: RING,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transform: `translate(${sx}px, ${sy}px) scale(${1 + grow})`,
				}}
			>
				<svg width={RING} height={RING} viewBox="-380 -380 760 760" style={{position: 'absolute'}}>
					{Array.from({length: 60}, (_, i) => {
						const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
						const lit = sweep % 60 > i;
						const r1 = i % 5 === 0 ? 318 : 332;
						return (
							<line
								key={i}
								x1={Math.cos(a) * r1}
								y1={Math.sin(a) * r1}
								x2={Math.cos(a) * 352}
								y2={Math.sin(a) * 352}
								stroke={lit ? C.green : 'rgba(255,255,255,0.22)'}
								strokeWidth={i % 5 === 0 ? 7 : 4}
							/>
						);
					})}
					<circle r={300} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
				</svg>
				<div style={{textAlign: 'center'}}>
					<Label color={C.green} size={24} style={{marginBottom: 2}}>
						tiempo restante
					</Label>
					<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.white, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>{formatClock(reelClockSeconds(f))}</div>
				</div>
			</div>

			<GlitchBurst at={98} len={4} intensity={0.6} />
			<GlitchBurst at={106} len={5} intensity={0.9} />
			<GlitchBurst at={113} len={6} intensity={1.3} />
			<AbsoluteFill style={{background: C.white, opacity: flash}} />
		</AbsoluteFill>
	);
};
