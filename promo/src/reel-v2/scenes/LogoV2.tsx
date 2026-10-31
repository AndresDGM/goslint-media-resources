import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, SANS} from '../../theme';
import {clamp, inCubic, outExpo, pop, rnd, tween} from '../../lib';
import {GridBg, Label, LogoMark, Wordmark} from '../../components';
import {R2, T} from '../timeline';

const [A, B] = R2.logo;
const MARK_TOP = 410;
const MARK_H = 400;

/** Logo reveal, stacked: the mark draws on «Esto es», the wordmark lands on «Goslint», the label on «el semillero…». */
export const LogoV2: React.FC = () => {
	const f = useCurrentFrame();
	const p = tween(f, A + 2, A + 32, 0, 1, outExpo);
	const ring = tween(f, A, A + 40, 0, 1, outExpo);
	const wordP = tween(f, T.goslint, T.goslint + 14, 0, 1, outExpo);
	const glitch = f >= T.goslint && f < T.goslint + 8 ? (rnd(f) - 0.5) * 40 : 0;
	const tag = pop(f, T.goslint + 9, 16, 180, 0.7);
	const lab = tween(f, T.elSemillero - 4, T.elSemillero + 6);
	const exit = tween(f, B - 11, B, 0, 1, inCubic);
	const glow = 18 + Math.sin(f / 6) * 6;
	const d = 200 + ring * 2100;
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.5} size={90} />
			{/* shockwave */}
			<AbsoluteFill style={{alignItems: 'center'}}>
				<div style={{position: 'absolute', top: MARK_TOP + MARK_H / 2 - d / 2, width: d, height: d, borderRadius: '50%', border: `${Math.max(1, 30 * (1 - ring))}px solid ${C.green}`, opacity: 1 - ring}} />
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', transform: `scale(${1 + exit * 0.5})`, opacity: 1 - exit}}>
				<div style={{marginTop: MARK_TOP, transform: `scale(${0.8 + 0.2 * p})`}}>
					<LogoMark height={MARK_H} p={p} glow={f > A + 32 ? glow : 0} />
				</div>
				<div
					style={{
						marginTop: 60,
						clipPath: `inset(0 ${(1 - wordP) * 100}% 0 0)`,
						transform: `translateX(${glitch}px)`,
						filter: glitch ? `drop-shadow(${glitch / 3}px 0 0 ${C.green})` : undefined,
					}}
				>
					<Wordmark height={104} />
				</div>
				<div style={{marginTop: 52, textAlign: 'center', opacity: tag, transform: `translateY(${(1 - tag) * 24}px)`, fontFamily: SANS, fontSize: 56, lineHeight: 1.18, letterSpacing: '-0.02em'}}>
					<div style={{fontWeight: 700, color: C.white}}>Programación competitiva</div>
					<div style={{fontWeight: 400, color: C.dim}}>e investigación académica.</div>
				</div>
				<Label size={28} color="rgba(233,238,234,0.78)" style={{marginTop: 44, opacity: lab, textAlign: 'center', lineHeight: 1.6}}>
					Semillero de Investigación
					<br />
					Ingeniería de Sistemas · UCEVA
				</Label>
			</AbsoluteFill>
			<AbsoluteFill style={{background: C.white, opacity: interpolate(f, [A, A + 3], [0.9, 0], clamp)}} />
		</AbsoluteFill>
	);
};
