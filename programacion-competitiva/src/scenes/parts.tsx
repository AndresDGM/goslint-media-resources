import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {pop, tween} from '../lib';
import {Label} from '../components';
import {Buf, PixelSprite} from '../pixel';

/** Tarjeta de panel con rótulo mono que entra con muelle. Los hijos se posicionan en coordenadas locales. */
export const Card: React.FC<{at: number; x: number; y: number; w: number; h: number; label?: string; accent?: string; children?: React.ReactNode; out?: number}> = ({at, x, y, w, h, label, accent = C.line2, children, out}) => {
	const f = useCurrentFrame();
	if (f < at - 2) return null;
	const p = pop(f, at, 16, 190, 0.7);
	const o = out !== undefined ? 1 - tween(f, out - 10, out) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y + (1 - p) * 50, width: w, height: h, opacity: Math.min(1, p * 1.5) * o, background: C.panel, border: `2px solid ${accent}`, boxShadow: '0 30px 90px rgba(0,0,0,0.5)', overflow: 'hidden'}}>
			{label && (
				<Label size={18} color={C.green} style={{position: 'absolute', left: 22, top: 18}}>
					{label}
				</Label>
			)}
			{children}
		</div>
	);
};

const pad = (n: number) => String(n).padStart(2, '0');
export const clockText = (secs: number) => {
	const s = Math.max(0, Math.floor(secs));
	return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

/** Reloj de concurso que arranca en 05:00:00 y baja `speed` segundos de concurso por segundo real. */
export const ContestClock: React.FC<{at: number; x: number; y: number; size?: number; speed?: number; start?: number; color?: string}> = ({at, x, y, size = 48, speed = 60, start = 5 * 3600, color = C.white}) => {
	const f = useCurrentFrame();
	const t = Math.max(0, f - at) / 30;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', fontFamily: MONO, fontWeight: 800, fontSize: size, color, letterSpacing: '0.02em', whiteSpace: 'nowrap'}}>
			<span style={{color: C.red, fontSize: size * 0.5, verticalAlign: '0.3em', marginRight: size * 0.25, opacity: Math.floor(f / 15) % 2 ? 1 : 0.35}}>●</span>
			{clockText(start - t * speed)}
		</div>
	);
};

/** Globo terráqueo de alambre (meridianos y paralelos), con puntos que se encienden. */
export const Globe: React.FC<{at: number; x: number; y: number; r: number}> = ({at, x, y, r}) => {
	const f = useCurrentFrame();
	const p = pop(f, at, 16, 160, 0.8);
	const rot = (f - at) * 1.6;
	const dots = [
		[0.2, -0.3], [-0.45, 0.1], [0.55, 0.25], [-0.1, 0.5], [0.35, -0.65], [-0.6, -0.4], [0.05, 0.05], [0.7, -0.1],
	];
	return (
		<div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, opacity: p, transform: `scale(${0.7 + 0.3 * p})`}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${C.green}`}} />
			{[0.2, 0.5, 0.8].map((k, i) => (
				<div key={`m${i}`} style={{position: 'absolute', top: 0, bottom: 0, left: '50%', width: r * 2 * Math.abs(Math.cos(((rot + i * 60) * Math.PI) / 180)) * k + 2, transform: 'translateX(-50%)', borderRadius: '50%', border: `2px solid rgba(0,192,99,0.55)`}} />
			))}
			{[-0.5, 0, 0.5].map((k, i) => (
				<div key={`p${i}`} style={{position: 'absolute', left: r * (1 - Math.sqrt(1 - k * k)), right: r * (1 - Math.sqrt(1 - k * k)), top: r + k * r - 1, height: 2, background: 'rgba(0,192,99,0.45)'}} />
			))}
			{dots.map(([dx, dy], i) => {
				const on = f >= at + 8 + i * 4;
				return <div key={i} style={{position: 'absolute', left: r + dx * r - 6, top: r + dy * r - 6, width: 12, height: 12, background: on ? C.white : 'transparent', boxShadow: on ? `0 0 14px ${C.green}` : undefined}} />;
			})}
		</div>
	);
};

/** Computador en pixel art (monitor con código verde y teclado), dibujado por código. */
export const pcBuf = (lit = 1): Buf => {
	const b = new Buf(26, 22);
	b.rect(0, 0, 26, 16, '#FFFFFF');
	b.rect(1, 1, 24, 14, '#0A0F0C');
	const rows = [9, 14, 6, 17, 11];
	rows.forEach((w, i) => b.rect(3 + (i % 2) * 2, 3 + i * 2, Math.max(1, Math.round(w * lit)), 1, i === 4 ? '#FFFFFF' : '#00C063'));
	b.rect(11, 16, 4, 2, '#B4C0B8');
	b.rect(6, 18, 14, 1, '#B4C0B8');
	b.rect(3, 20, 20, 2, '#7F8D86');
	return b;
};
export const PixelComputer: React.FC<{x: number; y: number; scale: number; at: number}> = ({x, y, scale, at}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 14, 220, 0.6);
	return (
		<div style={{position: 'absolute', left: x - 13 * scale, top: y - 22 * scale + (1 - p) * 40, opacity: Math.min(1, p * 1.5)}}>
			<PixelSprite buf={pcBuf(Math.min(1, (f - at) / 20))} scale={scale} />
		</div>
	);
};

/** Tres siluetas (personas del equipo) que aparecen una a una alrededor de un computador. */
export const Seats: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
	const f = useCurrentFrame();
	return (
		<>
			{[-1, 0, 1].map((k, i) => {
				const p = pop(f, at + i * 4, 15, 220, 0.6);
				const cx = x + k * 112;
				const cy = y - 96 - (k === 0 ? 34 : 0);
				return (
					<div key={i} style={{position: 'absolute', left: cx - 26, top: cy - 26 + (1 - p) * 20, opacity: Math.min(1, p * 1.5)}}>
						<div style={{width: 52, height: 52, background: C.text, clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)'}} />
						<div style={{width: 64, height: 30, marginLeft: -6, marginTop: 6, background: C.dim}} />
					</div>
				);
			})}
		</>
	);
};

/** Titular grande con rótulo; útil para rótulos de sección dentro de una escena. */
export const BigTitle: React.FC<{at: number; label?: string; children: React.ReactNode; x?: number; y?: number; size?: number; out?: number; align?: 'left' | 'center'}> = ({at, label, children, x = 110, y = 150, size = 84, out, align = 'left'}) => {
	const f = useCurrentFrame();
	if (f < at - 2) return null;
	const p = pop(f, at, 16, 200, 0.7);
	const o = out !== undefined ? 1 - tween(f, out - 10, out) : 1;
	return (
		<div style={{position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y + (1 - p) * 30, opacity: Math.min(1, p * 1.5) * o, textAlign: align}}>
			{label && <Label size={22} color={C.green}>{label}</Label>}
			<div style={{fontFamily: SANS, fontWeight: 830, fontSize: size, letterSpacing: '-0.04em', color: C.white, lineHeight: 1.04, marginTop: label ? 10 : 0}}>{children}</div>
		</div>
	);
};

/** Chip de dato (hecho) con viñeta verde que entra en su marca. */
export const Fact: React.FC<{at: number; x: number; y: number; children: React.ReactNode; size?: number; color?: string; out?: number}> = ({at, x, y, children, size = 34, color = C.green, out}) => {
	const f = useCurrentFrame();
	if (f < at - 2) return null;
	const p = pop(f, at, 16, 220, 0.6);
	const o = out !== undefined ? 1 - tween(f, out - 8, out) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translateX(${(1 - p) * -40}px)`, opacity: Math.min(1, p * 1.6) * o, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(8,11,9,0.9)', borderLeft: `6px solid ${color}`, padding: '14px 24px', fontFamily: SANS, fontWeight: 700, fontSize: size, color: C.white, letterSpacing: '-0.015em', whiteSpace: 'nowrap', boxShadow: '0 16px 50px rgba(0,0,0,0.45)'}}>
			{children}
		</div>
	);
};
