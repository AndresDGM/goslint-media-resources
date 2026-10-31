import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO} from '../../theme';
import {clamp, inCubic, outExpo, rnd, tween} from '../../lib';
import {GlitchBurst, GridBg, Label, Typer} from '../../components';
import {formatClock} from '../../scenes/ColdOpen';
import {Slam} from '../../reel/scenes/HookV';
import {R2, T, clockV2} from '../timeline';

const RING = 420;
const END = R2.hook[1];

/**
 * Hook: the three contest rules slam in on the voice, over a clock that is already running.
 * On «y un reloj que no se detiene» the clock takes the screen and races into the logo.
 */
export const HookV2: React.FC = () => {
	const f = useCurrentFrame();
	const focus = tween(f, T.yUnReloj - 4, T.yUnReloj + 14, 0, 1, outExpo);
	const recap = tween(f, T.yUnReloj - 2, T.yUnReloj + 10) * (1 - tween(f, END - 10, END - 4));
	const shake = interpolate(f, [END - 48, END - 4], [0, 14], {...clamp, easing: inCubic});
	const sx = (rnd(f * 3.1) - 0.5) * shake;
	const sy = (rnd(f * 7.7) - 0.5) * shake;
	const sweep = f * (1 + Math.max(0, f - T.yUnReloj) * 0.15);
	const grow = interpolate(f, [END - 36, END - 4], [0, 0.1], {...clamp, easing: inCubic});
	const flash = interpolate(f, [END - 6, END - 4, END - 1], [0, 1, 0], clamp);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.45} />
			<div style={{position: 'absolute', left: 64, top: 268, fontFamily: MONO, fontSize: 34, lineHeight: 1.4, color: C.text}}>
				<span style={{color: C.green}}>goslint@uceva</span>
				<span style={{color: C.dim}}>:~$ </span>
				<Typer text={'./maraton \\\n    --duracion=5h --equipo=3 \\\n    --computadores=1'} start={-10} cps={48} />
			</div>

			<Slam n="5" word="horas" label="tiempo de competencia" at={T.cinco - 3} until={T.tres - 2} />
			<Slam n="3" word="personas" label="por equipo" at={T.tres - 2} until={T.unSolo - 2} />
			<Slam n="1" word="computador" label="para los tres" at={T.unSolo - 2} until={T.yUnReloj - 2} />

			{/* compact recap of the three rules, above the clock (as in the 16:9 cold open) */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 452, textAlign: 'center', opacity: recap, transform: `translateY(${(1 - recap) * 16}px)`, fontFamily: MONO, fontSize: 30, letterSpacing: '0.12em', color: C.dim}}>
				<span style={{color: C.green}}>5</span> HORAS · <span style={{color: C.green}}>3</span> PERSONAS · <span style={{color: C.green}}>1</span> COMPUTADOR
			</div>

			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 905 - focus * 215,
					height: RING,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transform: `translate(${sx}px, ${sy}px) scale(${(1 + focus * 0.75) * (1 + grow)})`,
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
					<Label color={C.green} size={19} style={{marginBottom: 2}}>
						tiempo restante
					</Label>
					<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 66, color: C.white, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>{formatClock(clockV2(f))}</div>
				</div>
			</div>

			<GlitchBurst at={END - 22} len={4} intensity={0.6} />
			<GlitchBurst at={END - 14} len={5} intensity={0.9} />
			<GlitchBurst at={END - 7} len={6} intensity={1.3} />
			<AbsoluteFill style={{background: C.white, opacity: flash}} />
		</AbsoluteFill>
	);
};
