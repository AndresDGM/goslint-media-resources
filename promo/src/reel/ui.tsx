import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {clamp, pop, tween} from '../lib';
import {Grain} from '../components';
import {formatClock} from '../scenes/ColdOpen';
import {CAPTIONS, RH, RW, SAFE, reelClockSeconds} from './timeline';

/**
 * Shifts time for its children: inside, useCurrentFrame() returns the Reel frame + `by`.
 * With `by` = how far a narration line moved, children can use the 16:9 frame numbers as they are.
 */
export const Shift: React.FC<{by: number; children: React.ReactNode}> = ({by, children}) => (
	<Sequence from={-by} layout="none">
		{children}
	</Sequence>
);

/** The grain tiles are 16:9; rotate them so the grain stays isotropic on a 9:16 canvas. */
export const GrainV: React.FC<{opacity?: number}> = ({opacity}) => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<div style={{position: 'absolute', left: (RW - RH) / 2, top: (RH - RW) / 2, width: RH, height: RW, transform: 'rotate(90deg)'}}>
			<Grain opacity={opacity} />
		</div>
	</AbsoluteFill>
);

/** Contest HUD: the clock from the hook keeps running until the call to action. */
export const ReelHud: React.FC<{from?: number; until?: number; clock?: (f: number) => number}> = ({from = 204, until = 1076, clock = reelClockSeconds}) => {
	const f = useCurrentFrame();
	if (f < from || f >= until) return null;
	const o = tween(f, from, from + 12) * (1 - tween(f, until - 12, until));
	return (
		<div
			style={{
				position: 'absolute',
				left: SAFE.side,
				right: SAFE.side,
				top: 196,
				display: 'flex',
				justifyContent: 'space-between',
				fontFamily: MONO,
				fontSize: 26,
				color: 'rgba(255,255,255,0.72)',
				opacity: o,
				letterSpacing: '0.08em',
				textShadow: '0 1px 6px rgba(0,0,0,0.85)',
			}}
		>
			<span>
				<span style={{color: C.green}}>●</span> goslint@uceva
			</span>
			<span style={{fontVariantNumeric: 'tabular-nums'}}>T− {formatClock(clock(f))}</span>
		</div>
	);
};

/** Phrase-by-phrase captions, sitting just above Instagram's caption area. */
export const ReelSubtitles: React.FC<{captions?: {from: number; to: number; text: string}[]}> = ({captions = CAPTIONS}) => {
	const f = useCurrentFrame();
	const cue = captions.find((c) => f >= c.from && f < c.to);
	if (!cue) return null;
	const o = Math.min(tween(f, cue.from, cue.from + 3), 1 - tween(f, cue.to - 3, cue.to));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: SAFE.bottom, display: 'flex', justifyContent: 'center', opacity: o, pointerEvents: 'none'}}>
			<div
				style={{
					maxWidth: 820,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 650,
					fontSize: 46,
					lineHeight: 1.22,
					letterSpacing: '-0.01em',
					color: C.white,
					background: 'rgba(0,0,0,0.72)',
					padding: '12px 26px 14px',
					borderRadius: 12,
				}}
			>
				{cue.text}
			</div>
		</div>
	);
};

/** Blurred, darkened copy of a photo that fills the frame behind a framed card. */
export const Backdrop: React.FC<{src: string; from: number; dur: number; dim?: number; fade?: number}> = ({src, from, dur, dim = 0.35, fade = 0}) => {
	const f = useCurrentFrame();
	const t = interpolate(f, [from, from + dur], [0, 1], clamp);
	return (
		<AbsoluteFill style={{opacity: fade ? tween(f, from, from + fade) : 1}}>
			<AbsoluteFill style={{transform: `scale(${1.15 + t * 0.07})`}}>
				<Img src={staticFile(`photos/blur/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(5,7,6,${dim + 0.4}) 0%, rgba(5,7,6,${dim}) 30%, rgba(5,7,6,${dim}) 65%, rgba(5,7,6,${dim + 0.45}) 100%)`}} />
		</AbsoluteFill>
	);
};

/**
 * Framed photo for the pictures that cannot fill a 9:16 frame without losing people
 * (landscape shots and wide groups). `pos` chooses the crop inside the frame.
 */
export const Card: React.FC<{
	src: string;
	from: number;
	dur: number;
	w?: number;
	h: number;
	top: number;
	pos?: string;
	tilt?: number;
	/** 'pop' springs up from below; 'cut' lands instantly with a small settle (for fast montages) */
	enter?: 'pop' | 'cut';
}> = ({src, from, dur, w = 1000, h, top, pos = '50% 50%', tilt = 0, enter = 'pop'}) => {
	const f = useCurrentFrame();
	if (f < from) return null;
	const t = interpolate(f, [from, from + dur], [0, 1], clamp);
	const p = enter === 'pop' ? pop(f, from, 18, 160, 0.8) : 1;
	const settle = enter === 'cut' ? 1 + 0.05 * (1 - tween(f, from, from + 7)) : 0.92 + p * 0.08;
	return (
		<div
			style={{
				position: 'absolute',
				left: (RW - w) / 2,
				top,
				width: w,
				height: h,
				transform: `translateY(${(1 - p) * 140}px) rotate(${tilt * (1 - t * 0.4)}deg) scale(${settle})`,
				opacity: Math.min(1, p * 1.6),
				boxShadow: '0 40px 120px rgba(0,0,0,0.65)',
				border: '3px solid rgba(255,255,255,0.92)',
				overflow: 'hidden',
				background: '#000',
			}}
		>
			<Img src={staticFile(`photos/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${1.02 + t * 0.05})`, transformOrigin: pos}} />
		</div>
	);
};

/** Darkens the top and bottom of a full-bleed photo so overlaid text stays readable. */
export const Shade: React.FC<{top?: number; bottom?: number}> = ({top = 0.7, bottom = 0.6}) => (
	<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${top}) 0%, rgba(0,0,0,${top * 0.75}) 22%, transparent 42%, transparent 62%, rgba(0,0,0,${bottom}) 100%)`}} />
);

/** White flash on a cut. */
export const Flash: React.FC<{at: number; strength?: number; len?: number; color?: string}> = ({at, strength = 0.55, len = 4, color = C.white}) => {
	const f = useCurrentFrame();
	if (f < at || f > at + len) return null;
	return <AbsoluteFill style={{background: color, opacity: interpolate(f, [at, at + len], [strength, 0], clamp), pointerEvents: 'none'}} />;
};

/** Green bar that sweeps up the frame between chapters (vertical counterpart of WipeBar). */
export const WipeUp: React.FC<{at: number; dur?: number}> = ({at, dur = 12}) => {
	const f = useCurrentFrame();
	const t = (f - at) / dur;
	if (t < 0 || t > 1) return null;
	const y = interpolate(t, [0, 1], [112, -34]);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: -40, right: -40, top: `${y}%`, height: '20%', background: C.green, transform: 'skewY(-7deg)'}} />
			<div style={{position: 'absolute', left: -40, right: -40, top: `${y + 21.5}%`, height: '2.4%', background: C.white, transform: 'skewY(-7deg)', opacity: 0.9}} />
		</AbsoluteFill>
	);
};

/** Chapter headline. */
export const Big: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({children, size = 100, style}) => (
	<div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1.02, letterSpacing: '-0.04em', color: C.white, textShadow: '0 4px 30px rgba(0,0,0,0.65)', ...style}}>{children}</div>
);
