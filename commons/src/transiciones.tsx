import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from './theme';
import {inCubic, outCubic, pop, rnd, tween} from './lib';
import {shake} from './components';

/**
 * Transiciones de impacto para cambiar de escena o subrayar un momento. Todas reciben `at` en
 * fotogramas absolutos y se dibujan a pantalla completa (van FUERA de la cámara de la escena).
 * Se combinan con las del sistema: `Hit` (@commons/vertical), `CutFlash`, `Shockwave`, `GlitchBurst`
 * y `WipeBar` (@commons/components).
 */

/**
 * Barrido de franjas: franjas horizontales que cruzan la pantalla escalonadas y la tapan por
 * completo en `at` (ahí se cambia de escena), y luego se van. Dura `dur` fotogramas en total.
 */
export const Barrido: React.FC<{at: number; dur?: number; n?: number; colors?: string[]; dir?: 1 | -1}> = ({at, dur = 18, n = 7, colors = [C.green, '#0B0F0D', C.white], dir = 1}) => {
	const f = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const half = dur / 2;
	if (f < at - half || f > at + half) return null;
	const bh = Math.ceil(height / n);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{Array.from({length: n}, (_, i) => {
				const d = (i / n) * half * 0.5;
				const cover = tween(f, at - half + d, at - half * 0.15 + d * 0.3, 0, 1, outCubic); // entra
				const leave = tween(f, at + half * 0.15 + d * 0.3, at + half - (half * 0.5 - d) * 0.3, 0, 1, inCubic); // sale
				const x0 = dir === 1 ? -width + cover * width + leave * width : width - cover * width - leave * width;
				return <div key={i} style={{position: 'absolute', left: x0, top: i * bh, width: width + 2, height: bh + 1, background: colors[i % colors.length]}} />;
			})}
		</AbsoluteFill>
	);
};

/**
 * Iris: un círculo que se cierra sobre (x, y) hasta tapar la pantalla en `at` y vuelve a abrirse
 * (útil para entrar «dentro» de un objeto o acabar un gag).
 */
export const Iris: React.FC<{at: number; x: number; y: number; dur?: number; color?: string}> = ({at, x, y, dur = 22, color = '#070807'}) => {
	const f = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const half = dur / 2;
	if (f < at - half || f > at + half) return null;
	const max = Math.hypot(width, height);
	const r = f < at ? tween(f, at - half, at, max, 0, inCubic) : tween(f, at, at + half, 0, max, outCubic);
	return (
		<AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(circle at ${x}px ${y}px, transparent ${r}px, ${color} ${r + 2}px)`}}>
			<div style={{position: 'absolute', left: x - r - 6, top: y - r - 6, width: 2 * r + 12, height: 2 * r + 12, borderRadius: '50%', border: `6px solid ${C.green}`, opacity: r > 4 ? 0.9 : 0}} />
		</AbsoluteFill>
	);
};

/**
 * Líneas de velocidad durante `len` fotogramas: horizontales (`mode="h"`, para un arranque o un
 * barrido lateral) o radiales hacia (x, y) (`mode="radial"`, para señalar un impacto o una sorpresa).
 */
export const SpeedLines: React.FC<{at: number; len?: number; mode?: 'h' | 'radial'; x?: number; y?: number; color?: string; count?: number}> = ({at, len = 10, mode = 'radial', x, y, color = '#FFFFFF', count = 22}) => {
	const f = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const k = f - at;
	if (k < 0 || k >= len) return null;
	const o = 1 - k / len;
	const cx = x ?? width / 2;
	const cy = y ?? height / 2;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', opacity: o}}>
			{Array.from({length: count}, (_, i) => {
				const r1 = rnd(at * 3 + i * 7 + Math.floor(k / 2));
				const r2 = rnd(at * 5 + i * 11 + Math.floor(k / 2));
				if (mode === 'h') {
					const w = 200 + r1 * 700;
					return <div key={i} style={{position: 'absolute', left: r2 * width - w / 2, top: (i / count) * height + r1 * 20, width: w, height: 3 + Math.round(r2 * 5), background: color, opacity: 0.25 + r1 * 0.5}} />;
				}
				const a = (i / count) * Math.PI * 2 + r1 * 0.2;
				const inner = 260 + r2 * 220;
				const lenL = 300 + r1 * 700;
				return (
					<div key={i} style={{position: 'absolute', left: cx, top: cy, width: lenL, height: 3 + Math.round(r2 * 6), background: color, opacity: 0.2 + r1 * 0.5, transformOrigin: '0 50%', transform: `rotate(${a}rad) translateX(${inner}px)`}} />
				);
			})}
		</AbsoluteFill>
	);
};

/**
 * Golpe: el hijo cae enorme y se asienta en su sitio con sacudida (títulos, sellos, «INTENTO 1»).
 * Centrado en (x, y). `out`: fotograma en que sale disparado hacia arriba.
 */
export const Slam: React.FC<{at: number; out?: number; x: number; y: number; children: React.ReactNode; from?: number; rot?: number}> = ({at, out, x, y, children, from = 3, rot = -4}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	if (out !== undefined && f >= out + 8) return null;
	const p = pop(f, at, 11, 320, 0.5);
	const q = out !== undefined ? tween(f, out, out + 8, 0, 1, inCubic) : 0;
	const [sx, sy] = shake(f, at + 3, 16, 9);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translate(${sx}px, ${sy - q * 900}px) rotate(${rot * (1 - p)}deg) scale(${from - (from - 1) * p})`, opacity: Math.min(1, (f - at + 1) / 3) * (1 - q), pointerEvents: 'none'}}>
			{children}
		</div>
	);
};
