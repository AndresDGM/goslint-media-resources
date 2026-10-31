import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, SANS} from './theme';
import {clamp, outCubic, pop, rnd, tween, typed} from './lib';
import {interpolate} from 'remotion';
import {CUES, voFrames} from './timeline';

/* ------------------------------------------------------------------ backdrop */

export const GridBg: React.FC<{opacity?: number; size?: number; drift?: number}> = ({
	opacity = 1,
	size = 80,
	drift = 0.25,
}) => {
	const f = useCurrentFrame();
	const off = (f * drift) % size;
	return (
		<AbsoluteFill
			style={{
				opacity,
				backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
				backgroundSize: `${size}px ${size}px`,
				backgroundPosition: `${off}px ${off}px`,
				maskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, #000 30%, transparent 100%)',
				WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, #000 30%, transparent 100%)',
			}}
		/>
	);
};

/** Pre-rendered film grain (cheap: one small PNG per frame, scaled up). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
	const f = useCurrentFrame();
	const i = Math.floor(f / 3) % 6;
	return (
		<AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
			{/* all tiles stay mounted (decoded once); only one is visible per frame */}
			{[0, 1, 2, 3, 4, 5].map((k) => (
				<Img
					key={k}
					src={staticFile(`fx/grain${k}.png`)}
					style={{position: 'absolute', inset: 0, width: '100%', height: '100%', visibility: k === i ? 'visible' : 'hidden'}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.75}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,${strength}) 100%)`,
			pointerEvents: 'none',
		}}
	/>
);

export const Scanlines: React.FC<{opacity?: number}> = ({opacity = 0.06}) => (
	<AbsoluteFill
		style={{
			opacity,
			backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)',
			pointerEvents: 'none',
		}}
	/>
);

/* ------------------------------------------------------------------ text */

export const Cursor: React.FC<{color?: string; h?: number; w?: number; solid?: boolean}> = ({
	color = C.green,
	h = 1,
	w = 0.55,
	solid,
}) => {
	const f = useCurrentFrame();
	const on = solid || Math.floor(f / 15) % 2 === 0;
	return (
		<span
			style={{
				display: 'inline-block',
				width: `${w}em`,
				height: `${h}em`,
				background: on ? color : 'transparent',
				verticalAlign: '-0.15em',
				marginLeft: '0.08em',
			}}
		/>
	);
};

/** Typewriter. Renders full text invisibly for stable layout. */
export const Typer: React.FC<{
	text: string;
	start: number;
	cps?: number;
	style?: React.CSSProperties;
	cursor?: boolean;
	cursorColor?: string;
}> = ({text, start, cps = 30, style, cursor = true, cursorColor}) => {
	const f = useCurrentFrame();
	const n = typed(f, start, cps, text.length);
	const done = n >= text.length;
	return (
		<span style={{whiteSpace: 'pre', ...style}}>
			{text.slice(0, n)}
			{cursor && f >= start && <Cursor color={cursorColor} solid={!done} />}
		</span>
	);
};

/** Mono label like the poster's section labels. */
export const Label: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({
	children,
	color = C.dim,
	size = 22,
	style,
}) => (
	<div style={{fontFamily: MONO, fontSize: size, letterSpacing: '0.16em', textTransform: 'uppercase', color, ...style}}>{children}</div>
);

/** Words that rise into place one by one. */
export const RiseWords: React.FC<{
	text: string;
	start: number;
	stagger?: number;
	style?: React.CSSProperties;
	highlight?: string[];
}> = ({text, start, stagger = 3, style, highlight = []}) => {
	const f = useCurrentFrame();
	const words = text.split(' ');
	return (
		<span style={style}>
			{words.map((w, i) => {
				const p = pop(f, start + i * stagger, 16, 200, 0.7);
				const hl = highlight.includes(w.replace(/[.,:]/g, ''));
				return (
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em'}}>
						<span
							style={{
								display: 'inline-block',
								transform: `translateY(${(1 - p) * 105}%)`,
								opacity: Math.min(1, p * 1.4),
								color: hl ? C.green : undefined,
							}}
						>
							{w}
							{i < words.length - 1 ? ' ' : ''}
						</span>
					</span>
				);
			})}
		</span>
	);
};

/* ------------------------------------------------------------------ verdicts */

const VERDICT = {
	AC: {bg: C.green, fg: '#001a0c', label: 'Accepted'},
	WA: {bg: C.red, fg: '#2a0005', label: 'Wrong Answer'},
	TLE: {bg: C.amber, fg: '#2a1800', label: 'Time Limit Exceeded'},
	RTE: {bg: '#B26BFF', fg: '#160026', label: 'Runtime Error'},
} as const;

export type VerdictKind = keyof typeof VERDICT;

export const Verdict: React.FC<{kind: VerdictKind; size?: number; showLabel?: boolean; style?: React.CSSProperties}> = ({
	kind,
	size = 28,
	showLabel = false,
	style,
}) => {
	const v = VERDICT[kind];
	return (
		<span style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.5, ...style}}>
			<span
				style={{
					fontFamily: MONO,
					fontWeight: 800,
					fontSize: size,
					background: v.bg,
					color: v.fg,
					padding: `${size * 0.18}px ${size * 0.42}px`,
					borderRadius: size * 0.16,
					letterSpacing: '0.04em',
				}}
			>
				{kind}
			</span>
			{showLabel && <span style={{fontFamily: MONO, fontSize: size * 0.7, color: C.dim}}>{v.label}</span>}
		</span>
	);
};

/* ------------------------------------------------------------------ brand */

const MARK_RATIO = 1553 / 1796; // w / h of the extracted mark
const WORD_RATIO = 3346 / 477;

/** Official Goslint mark (extracted from the poster vectors). `p` = reveal 0..1 */
export const LogoMark: React.FC<{height: number; p?: number; glow?: number; style?: React.CSSProperties}> = ({
	height,
	p = 1,
	glow = 0,
	style,
}) => {
	const w = height * MARK_RATIO;
	const gP = interpolate(p, [0, 0.75], [0, 1], {...clamp, easing: outCubic});
	const lP = interpolate(p, [0.25, 1], [0, 1], {...clamp, easing: outCubic});
	const deg = gP * 360;
	const mask = `conic-gradient(from 210deg at 50% 50%, #000 ${deg}deg, transparent ${deg}deg)`;
	return (
		<div style={{position: 'relative', width: w, height, ...style}}>
			<Img
				src={staticFile('brand/mark_white.png')}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					maskImage: p < 1 ? mask : undefined,
					WebkitMaskImage: p < 1 ? mask : undefined,
				}}
			/>
			<Img
				src={staticFile('brand/mark_green.png')}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					clipPath: `inset(0 0 ${(1 - lP) * 100}% 0)`,
					filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${C.green})` : undefined,
				}}
			/>
		</div>
	);
};

export const Wordmark: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => (
	<Img src={staticFile('brand/word_white.png')} style={{height, width: height * WORD_RATIO, display: 'block', ...style}} />
);

/* ------------------------------------------------------------------ photos */

/** Full-bleed photo with a slow Ken Burns move. */
export const Photo: React.FC<{
	src: string;
	from: number;
	dur: number;
	pos?: string; // object-position
	z?: [number, number];
	pan?: [number, number]; // x% drift start→end
	panY?: [number, number];
	grade?: number; // 0..1 darken
	style?: React.CSSProperties;
}> = ({src, from, dur, pos = '50% 50%', z = [1.06, 1.14], pan = [0, 0], panY = [0, 0], grade = 0.15, style}) => {
	const f = useCurrentFrame();
	const t = interpolate(f, [from, from + dur], [0, 1], clamp);
	const s = z[0] + (z[1] - z[0]) * t;
	const x = pan[0] + (pan[1] - pan[0]) * t;
	const y = panY[0] + (panY[1] - panY[0]) * t;
	return (
		<AbsoluteFill style={{overflow: 'hidden', ...style}}>
			<Img
				src={staticFile(`photos/${src}`)}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: pos,
					transform: `scale(${s}) translate(${x}%, ${y}%)`,
					transformOrigin: pos,
				}}
			/>
			<AbsoluteFill style={{background: `rgba(0,0,0,${grade})`}} />
		</AbsoluteFill>
	);
};

/** Portrait photo shown as a framed card over its own blurred backdrop. */
export const PhotoCard: React.FC<{
	src: string;
	from: number;
	dur: number;
	side?: 'left' | 'right' | 'center';
	tilt?: number;
	cardH?: number;
	ratio?: number; // w/h
	pos?: string;
	children?: React.ReactNode;
}> = ({src, from, dur, side = 'right', tilt = 2, cardH = 860, ratio = 0.75, pos = '50% 50%', children}) => {
	const f = useCurrentFrame();
	const p = pop(f, from, 18, 160, 0.8);
	const t = interpolate(f, [from, from + dur], [0, 1], clamp);
	const cardW = cardH * ratio;
	const left = side === 'right' ? 1920 - cardW - 170 : side === 'left' ? 170 : (1920 - cardW) / 2;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${1.1 + t * 0.06})`}}>
				<Img src={staticFile(`photos/blur/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,7,6,0.85), rgba(5,7,6,0.35) 60%, rgba(5,7,6,0.6))'}} />
			<div
				style={{
					position: 'absolute',
					left,
					top: (1080 - cardH) / 2,
					width: cardW,
					height: cardH,
					transform: `translateY(${(1 - p) * 120}px) rotate(${tilt * (1 - t * 0.5)}deg) scale(${0.92 + p * 0.08})`,
					opacity: Math.min(1, p * 1.5),
					boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
					border: `2px solid rgba(255,255,255,0.9)`,
					overflow: 'hidden',
					background: '#000',
				}}
			>
				<Img
					src={staticFile(`photos/${src}`)}
					style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${1.02 + t * 0.05})`}}
				/>
			</div>
			{children}
		</AbsoluteFill>
	);
};

/** Terminal-style caption chip that names the real event in a photo. */
export const EventTag: React.FC<{
	start: number;
	title: string;
	sub?: string;
	x?: number;
	y?: number;
	align?: 'left' | 'right';
	cps?: number;
	size?: number; // title font size
}> = ({start, title, sub, x = 96, y = 96, align = 'left', cps = 90, size = 24}) => {
	const f = useCurrentFrame();
	const p = pop(f, start, 18, 220, 0.6);
	const n = typed(f, start + 1, cps, title.length);
	return (
		<div
			style={{
				position: 'absolute',
				[align]: x,
				top: y,
				opacity: Math.min(1, p * 2),
				transform: `translateX(${(1 - p) * (align === 'left' ? -30 : 30)}px)`,
				textAlign: align,
			}}
		>
			<div
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: 14,
					background: 'rgba(5,7,6,0.82)',
					border: `1px solid ${C.line2}`,
					padding: '12px 20px',
					fontFamily: MONO,
					fontSize: size,
					letterSpacing: '0.08em',
					color: C.white,
					textTransform: 'uppercase',
				}}
			>
				<span style={{width: 10, height: 10, background: C.green, display: 'inline-block'}} />
				<span style={{whiteSpace: 'pre'}}>{title.slice(0, n)}</span>
			</div>
			{sub && (
				<div>
					<div style={{display: 'inline-block', fontFamily: MONO, fontSize: size - 2, color: C.white, marginTop: 8, letterSpacing: '0.05em', opacity: tween(f, start + 4, start + 10), background: 'rgba(5,7,6,0.72)', padding: '6px 14px'}}>
						{sub}
					</div>
				</div>
			)}
		</div>
	);
};

/* ------------------------------------------------------------------ transitions */

/** Short digital glitch overlay: colour bars + slice offsets, deterministic. */
export const GlitchBurst: React.FC<{at: number; len?: number; intensity?: number}> = ({at, len = 6, intensity = 1}) => {
	const f = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const sx = width / 1920;
	const k = f - at;
	if (k < 0 || k >= len) return null;
	const bars = Array.from({length: 7}, (_, i) => {
		const r = rnd(at * 7 + k * 13 + i);
		const r2 = rnd(at * 3 + k * 5 + i * 9);
		return {
			top: r * height,
			h: 6 + r2 * 60 * intensity,
			off: (rnd(i + k + at) - 0.5) * 300 * intensity * sx,
			color: i % 3 === 0 ? C.green : i % 3 === 1 ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.9)',
			w: (300 + r2 * 1400) * sx,
		};
	});
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'normal'}}>
			{bars.map((b, i) => (
				<div key={i} style={{position: 'absolute', top: b.top, left: width / 2 - b.w / 2 + b.off, width: b.w, height: b.h, background: b.color, opacity: 0.85}} />
			))}
		</AbsoluteFill>
	);
};

/** Green bar that wipes across the frame (used between chapters). */
export const WipeBar: React.FC<{at: number; dur?: number}> = ({at, dur = 12}) => {
	const f = useCurrentFrame();
	const t = (f - at) / dur;
	if (t < 0 || t > 1) return null;
	const x = interpolate(t, [0, 1], [-30, 130]);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', top: 0, bottom: 0, left: `${x - 22}%`, width: '22%', background: C.green, transform: 'skewX(-12deg)'}} />
			<div style={{position: 'absolute', top: 0, bottom: 0, left: `${x - 26}%`, width: '3%', background: C.white, transform: 'skewX(-12deg)', opacity: 0.9}} />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ subtitles */

export const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const cue = CUES.find((c) => f >= c.from - 2 && f < c.from + voFrames(c.id) + 10);
	if (!cue) return null;
	const end = cue.from + voFrames(cue.id) + 10;
	const o = Math.min(tween(f, cue.from - 2, cue.from + 4), 1 - tween(f, end - 6, end));
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: 52,
				display: 'flex',
				justifyContent: 'center',
				opacity: o,
				pointerEvents: 'none',
			}}
		>
			<div
				style={{
					maxWidth: 1400,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 500,
					fontSize: 34,
					lineHeight: 1.3,
					color: C.white,
					background: 'rgba(0,0,0,0.62)',
					padding: '10px 24px',
					borderRadius: 8,
				}}
			>
				{cue.caption}
			</div>
		</div>
	);
};
