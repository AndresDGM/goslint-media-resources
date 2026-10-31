import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO} from './theme';
import {S} from './timeline';
import {tween} from './lib';
import {Grain, Scanlines, Subtitles, Vignette} from './components';
import {AudioLayer} from './AudioLayer';
import {ColdOpen, contestSeconds, formatClock} from './scenes/ColdOpen';
import {Logo} from './scenes/Logo';
import {Problem, Training} from './scenes/Training';
import {Compete} from './scenes/Compete';
import {Team} from './scenes/Team';
import {Judge} from './scenes/Judge';
import {Cta} from './scenes/Cta';

const inRange = (f: number, [a, b]: readonly [number, number]) => f >= a && f < b;

/** Contest HUD: the clock from the cold open keeps running through the video. */
const Hud: React.FC = () => {
	const f = useCurrentFrame();
	if (f < 360 || f >= 1664) return null;
	const o = tween(f, 360, 372) * (1 - tween(f, 1650, 1664));
	return (
		<div style={{position: 'absolute', left: 48, right: 48, top: 34, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 20, color: 'rgba(255,255,255,0.7)', opacity: o, letterSpacing: '0.08em', textShadow: '0 1px 6px rgba(0,0,0,0.8)'}}>
			<span>
				<span style={{color: C.green}}>●</span> goslint@uceva
			</span>
			<span style={{fontVariantNumeric: 'tabular-nums'}}>
				T− {formatClock(contestSeconds(f))}
			</span>
		</div>
	);
};

export const GoslintPromo: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{inRange(f, S.cold) && <ColdOpen />}
			{inRange(f, S.logo) && <Logo />}
			{inRange(f, S.problem) && <Problem />}
			{inRange(f, S.training) && <Training />}
			{inRange(f, S.compete) && <Compete />}
			{inRange(f, S.team) && <Team />}
			{inRange(f, S.judge) && <Judge />}
			{inRange(f, S.cta) && <Cta />}
			<Scanlines opacity={0.035} />
			<Vignette strength={0.55} />
			<Grain opacity={0.08} />
			<Hud />
			<Subtitles />
			<AudioLayer />
		</AbsoluteFill>
	);
};
