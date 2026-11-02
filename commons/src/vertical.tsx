import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from './theme';
import {pop, tween} from './lib';
import {CutFlash, Label, Shockwave, shake} from './components';
import {PixelBurst} from './pixel';

/**
 * Piezas del estilo de transiciones aprobado (noviembre 2026): entradas con rebote y fotogramas de
 * impacto, golpes con destello/onda/partículas, titulares, paneles y fotos enmarcadas.
 * Pensadas para formato vertical, pero sirven en cualquier composición.
 */

/* ------------------------------------------------------------------ entrada con impacto */

/**
 * Un elemento que entra al escenario en `at` con muelle, sacudida y destello (fotogramas de impacto).
 * `out`: fotograma en que sale (barrido rápido hacia `exit`).
 */
export const In: React.FC<{
	at: number;
	out?: number;
	x: number;
	y: number;
	w?: number;
	from?: 'left' | 'right' | 'up' | 'down' | 'zoom';
	exit?: 'left' | 'right' | 'up' | 'down' | 'zoom';
	impact?: boolean;
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({at, out, x, y, w, from = 'down', exit = 'left', impact = true, children, style}) => {
	const f = useCurrentFrame();
	if (f < at - 1) return null;
	if (out !== undefined && f >= out) return null;
	const p = pop(f, at, 12, 230, 0.7); // con rebote
	const q = out !== undefined ? tween(f, out - 9, out) : 0;
	const d = (1 - p) * 260;
	const e = q * 1300;
	const off = {left: [-d, 0], right: [d, 0], up: [0, -d], down: [0, d], zoom: [0, 0]}[from];
	const ex = {left: [-e, 0], right: [e, 0], up: [0, -e], down: [0, e], zoom: [0, 0]}[exit];
	const sc = (from === 'zoom' ? 0.4 + 0.6 * p : 1) * (exit === 'zoom' ? 1 + q * 0.6 : 1);
	const [sx, sy] = impact ? shake(f, at + 3, 14, 8) : [0, 0];
	const flash = impact ? Math.max(0, 1 - (f - at - 2) / 4) * (f >= at + 2 ? 1 : 0) : 0;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(${off[0] + ex[0] + sx}px, ${off[1] + ex[1] + sy}px) scale(${sc})`, opacity: Math.min(1, p * 2) * (1 - q), ...style}}>
			{children}
			{flash > 0 && <div style={{position: 'absolute', inset: -4, background: '#FFFFFF', opacity: flash * 0.7, mixBlendMode: 'screen', pointerEvents: 'none'}} />}
		</div>
	);
};

/** Destello + partículas + onda en un momento de impacto (fotograma absoluto del video principal). */
export const Hit: React.FC<{at: number; x?: number; y?: number; big?: boolean}> = ({at, x = 540, y = 800, big}) => {
	const f = useCurrentFrame();
	return (
		<>
			<CutFlash at={at} len={big ? 5 : 3} max={big ? 0.8 : 0.45} />
			<Shockwave at={at} x={x} y={y} size={big ? 1400 : 700} thick={big ? 24 : 14} dur={big ? 30 : 22} />
			<PixelBurst f={f} at={at} x={x} y={y} count={big ? 30 : 16} power={big ? 22 : 15} seed={at % 97} />
		</>
	);
};

/* ------------------------------------------------------------------ piezas de texto */

export const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.green}) => (
	<Label size={26} color={color}>
		{children}
	</Label>
);

export const Big: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 96, color = C.white, style}) => (
	<div style={{fontFamily: SANS, fontWeight: 860, fontSize: size, lineHeight: 1.0, letterSpacing: '-0.045em', color, ...style}}>{children}</div>
);

/** Tarjeta de panel vertical (ancho del escenario por defecto). */
export const Panel: React.FC<{children: React.ReactNode; accent?: string; pad?: number; style?: React.CSSProperties}> = ({children, accent = C.line2, pad = 34, style}) => (
	<div style={{background: C.panel, border: `3px solid ${accent}`, padding: pad, boxShadow: '0 30px 90px rgba(0,0,0,0.55)', ...style}}>{children}</div>
);

/** Foto enmarcada grande (polaroid) para el formato vertical. */
export const PhotoV: React.FC<{src: string; w: number; h: number; pos?: string; caption?: string; tilt?: number}> = ({src, w, h, pos = '50% 50%', caption, tilt = 0}) => {
	const f = useCurrentFrame();
	return (
		<div style={{width: w, background: '#F4F6F4', padding: '12px 12px 0 12px', boxShadow: '0 40px 100px rgba(0,0,0,0.65)', transform: `rotate(${tilt}deg)`}}>
			<div style={{width: w - 24, height: h, overflow: 'hidden', background: '#000'}}>
				<Img src={staticFile(`photos/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${1.02 + ((f % 600) / 600) * 0.06})`, transformOrigin: pos}} />
			</div>
			<div style={{height: caption ? 60 : 14, fontFamily: MONO, fontSize: 24, color: '#1a1f1c', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', paddingLeft: 6, whiteSpace: 'nowrap', overflow: 'hidden'}}>{caption}</div>
		</div>
	);
};

