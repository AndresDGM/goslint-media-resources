import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {clamp, inCubic, outExpo, pop, rnd, tween} from '../lib';
import {GridBg, Label, LogoMark, Wordmark} from '../components';

export const Logo: React.FC = () => {
	const f = useCurrentFrame();
	const p = tween(f, 242, 286, 0, 1, outExpo);
	const ring = tween(f, 240, 280, 0, 1, outExpo);
	const wordP = tween(f, 282, 298, 0, 1, outExpo);
	const glitch = f >= 282 && f < 290 ? (rnd(f) - 0.5) * 40 : 0;
	const tag = pop(f, 300, 16, 180, 0.7);
	const lab = tween(f, 314, 326);
	const exit = tween(f, 344, 360, 0, 1, inCubic);
	const glow = 18 + Math.sin(f / 6) * 6;
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.5} size={90} />
			{/* shockwave */}
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div
					style={{
						width: 200 + ring * 1900,
						height: 200 + ring * 1900,
						borderRadius: '50%',
						border: `${Math.max(1, 30 * (1 - ring))}px solid ${C.green}`,
						opacity: 1 - ring,
						position: 'absolute',
						top: 345 - (200 + ring * 1900) / 2,
					}}
				/>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					alignItems: 'center',
					transform: `scale(${1 + exit * 0.6})`,
					opacity: 1 - exit,
				}}
			>
				<div style={{marginTop: 150, transform: `scale(${0.8 + 0.2 * p})`}}>
					<LogoMark height={390} p={p} glow={f > 286 ? glow : 0} />
				</div>
				<div
					style={{
						marginTop: 52,
						clipPath: `inset(0 ${(1 - wordP) * 100}% 0 0)`,
						transform: `translateX(${glitch}px)`,
						filter: glitch ? `drop-shadow(${glitch / 3}px 0 0 ${C.green})` : undefined,
					}}
				>
					<Wordmark height={96} />
				</div>
				<div style={{marginTop: 42, textAlign: 'center', opacity: tag, transform: `translateY(${(1 - tag) * 24}px)`}}>
					<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, color: C.white, letterSpacing: '-0.02em'}}>Programación competitiva </span>
					<span style={{fontFamily: SANS, fontWeight: 400, fontSize: 46, color: C.dim, letterSpacing: '-0.02em'}}>e investigación académica.</span>
				</div>
				<Label size={22} color={C.faint} style={{marginTop: 22, opacity: lab}}>
					Semillero de Investigación · Ingeniería de Sistemas · UCEVA
				</Label>
			</AbsoluteFill>
			<AbsoluteFill style={{background: C.white, opacity: interpolate(f, [240, 243], [0.9, 0], clamp)}} />
		</AbsoluteFill>
	);
};
