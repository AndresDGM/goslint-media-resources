import {Easing, interpolate, spring} from 'remotion';
import {FPS} from './theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const outExpo = Easing.out(Easing.exp);
export const outCubic = Easing.out(Easing.cubic);
export const inOutCubic = Easing.inOut(Easing.cubic);
export const inCubic = Easing.in(Easing.cubic);

/** Clamped interpolation over [a, b] frames. */
export const tween = (
	f: number,
	a: number,
	b: number,
	from = 0,
	to = 1,
	easing: (t: number) => number = outCubic,
) => interpolate(f, [a, b], [from, to], {...clamp, easing});

/** Snappy spring that starts at frame `start`. */
export const pop = (f: number, start: number, damping = 14, stiffness = 180, mass = 0.6) =>
	spring({frame: f - start, fps: FPS, config: {damping, stiffness, mass}});

/** 0 → 1 → 0 window (fade in over `fi`, out over `fo`). */
export const windowed = (f: number, a: number, b: number, fi = 8, fo = 8) =>
	Math.min(tween(f, a, a + fi), 1 - tween(f, b - fo, b, 0, 1, inCubic));

/** Deterministic pseudo-random in [0,1). */
export const rnd = (seed: number) => {
	const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};

/** Number of visible characters for a typewriter effect. */
export const typed = (f: number, start: number, cps: number, len: number) =>
	Math.max(0, Math.min(len, Math.floor(((f - start) / FPS) * cps)));
