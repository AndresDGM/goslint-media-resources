import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, SANS} from './theme';
import {clamp, outCubic, outExpo, pop, rnd, tween, typed} from './lib';

/* ================================================================== sistema visual Goslint v1 */

export const GridBg: React.FC<{opacity?: number; size?: number; drift?: number}> = ({opacity = 1, size = 80, drift = 0.25}) => {
	const f = useCurrentFrame();
	const off = (f * drift) % size;
	const mask = 'radial-gradient(ellipse 70% 65% at 50% 50%, #000 30%, transparent 100%)';
	return (
		<AbsoluteFill
			style={{
				opacity,
				backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
				backgroundSize: `${size}px ${size}px`,
				backgroundPosition: `${off}px ${off}px`,
				maskImage: mask,
				WebkitMaskImage: mask,
			}}
		/>
	);
};

/** Grano precalculado: las seis texturas quedan montadas y solo se alterna su visibilidad. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
	const f = useCurrentFrame();
	const i = Math.floor(f / 3) % 6;
	return (
		<AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
			{[0, 1, 2, 3, 4, 5].map((k) => (
				<Img key={k} src={staticFile(`fx/grain${k}.png`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', visibility: k === i ? 'visible' : 'hidden'}} />
			))}
		</AbsoluteFill>
	);
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.75}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: 'none'}} />
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

export const Cursor: React.FC<{color?: string; h?: number; w?: number; solid?: boolean}> = ({color = C.green, h = 1, w = 0.55, solid}) => {
	const f = useCurrentFrame();
	const on = solid || Math.floor(f / 15) % 2 === 0;
	return <span style={{display: 'inline-block', width: `${w}em`, height: `${h}em`, background: on ? color : 'transparent', verticalAlign: '-0.15em', marginLeft: '0.08em'}} />;
};

/** Mecanografía (conserva el ancho final para que la maquetación no salte). */
export const Typer: React.FC<{text: string; start: number; cps?: number; style?: React.CSSProperties; cursor?: boolean; cursorColor?: string}> = ({text, start, cps = 30, style, cursor = true, cursorColor}) => {
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

export const Label: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = C.dim, size = 22, style}) => (
	<div style={{fontFamily: MONO, fontSize: size, letterSpacing: '0.16em', textTransform: 'uppercase', color, ...style}}>{children}</div>
);

/** Palabras que suben desde una máscara, una a una. */
export const RiseWords: React.FC<{text: string; start: number; stagger?: number; style?: React.CSSProperties; highlight?: string[]}> = ({text, start, stagger = 3, style, highlight = []}) => {
	const f = useCurrentFrame();
	const words = text.split(' ');
	return (
		<span style={style}>
			{words.map((w, i) => {
				const p = pop(f, start + i * stagger, 16, 200, 0.7);
				const hl = highlight.includes(w.replace(/[.,:¿?¡!]/g, ''));
				return (
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.12em'}}>
						<span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, opacity: Math.min(1, p * 1.4), color: hl ? C.green : undefined}}>
							{w}
							{i < words.length - 1 ? ' ' : ''}
						</span>
					</span>
				);
			})}
		</span>
	);
};

const VERDICT = {
	AC: {bg: C.green, fg: '#001a0c'},
	WA: {bg: C.red, fg: '#2a0005'},
	TLE: {bg: C.amber, fg: '#2a1800'},
	RTE: {bg: C.purple, fg: '#160026'},
} as const;

export const Verdict: React.FC<{kind: keyof typeof VERDICT; size?: number; label?: string; style?: React.CSSProperties}> = ({kind, size = 28, label, style}) => {
	const v = VERDICT[kind];
	return (
		<span style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.5, ...style}}>
			<span style={{fontFamily: MONO, fontWeight: 800, fontSize: size, background: v.bg, color: v.fg, padding: `${size * 0.18}px ${size * 0.42}px`, borderRadius: size * 0.16, letterSpacing: '0.04em'}}>{kind}</span>
			{label && <span style={{fontFamily: MONO, fontSize: size * 0.72, color: C.text}}>{label}</span>}
		</span>
	);
};

/* ------------------------------------------------------------------ logotipo real (extraído del vector del póster) */

const MARK_RATIO = 1553 / 1796;
const WORD_RATIO = 3346 / 477;

/** Marca oficial de Goslint. `p` = revelado 0..1. Nunca se redibuja ni se pixela. */
export const LogoMark: React.FC<{height: number; p?: number; glow?: number; style?: React.CSSProperties}> = ({height, p = 1, glow = 0, style}) => {
	const w = height * MARK_RATIO;
	const gP = interpolate(p, [0, 0.75], [0, 1], {...clamp, easing: outCubic});
	const lP = interpolate(p, [0.25, 1], [0, 1], {...clamp, easing: outCubic});
	const deg = gP * 360;
	const mask = `conic-gradient(from 210deg at 50% 50%, #000 ${deg}deg, transparent ${deg}deg)`;
	return (
		<div style={{position: 'relative', width: w, height, ...style}}>
			<Img src={staticFile('brand/mark_white.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', maskImage: p < 1 ? mask : undefined, WebkitMaskImage: p < 1 ? mask : undefined}} />
			<Img
				src={staticFile('brand/mark_green.png')}
				style={{position: 'absolute', inset: 0, width: '100%', height: '100%', clipPath: `inset(0 0 ${(1 - lP) * 100}% 0)`, filter: glow > 0 ? `drop-shadow(0 0 ${glow}px ${C.green})` : undefined}}
			/>
		</div>
	);
};

export const Wordmark: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => (
	<Img src={staticFile('brand/word_white.png')} style={{height, width: height * WORD_RATIO, display: 'block', ...style}} />
);

/* ------------------------------------------------------------------ transiciones */

export const GlitchBurst: React.FC<{at: number; len?: number; intensity?: number}> = ({at, len = 6, intensity = 1}) => {
	const f = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const k = f - at;
	if (k < 0 || k >= len) return null;
	const bars = Array.from({length: 7}, (_, i) => {
		const r = rnd(at * 7 + k * 13 + i);
		const r2 = rnd(at * 3 + k * 5 + i * 9);
		return {top: r * height, h: 6 + r2 * 60 * intensity, off: (rnd(i + k + at) - 0.5) * 300 * intensity, color: i % 3 === 0 ? C.green : i % 3 === 1 ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.9)', w: 300 + r2 * 1400};
	});
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{bars.map((b, i) => (
				<div key={i} style={{position: 'absolute', top: b.top, left: width / 2 - b.w / 2 + b.off, width: b.w, height: b.h, background: b.color, opacity: 0.85}} />
			))}
		</AbsoluteFill>
	);
};

/** Barrido diagonal verde con filo blanco (cambio de capítulo). */
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

/** Destello blanco de 3–4 fotogramas en un corte. */
export const CutFlash: React.FC<{at: number; len?: number; color?: string; max?: number}> = ({at, len = 4, color = '#FFFFFF', max = 0.85}) => {
	const f = useCurrentFrame();
	const k = f - at;
	if (k < 0 || k >= len) return null;
	return <AbsoluteFill style={{background: color, opacity: max * (1 - k / len), pointerEvents: 'none'}} />;
};

/** Onda de choque circular (momentos del logo y del hallazgo). */
export const Shockwave: React.FC<{at: number; x: number; y: number; dur?: number; size?: number; color?: string; thick?: number}> = ({at, x, y, dur = 36, size = 1800, color = C.green, thick = 26}) => {
	const f = useCurrentFrame();
	const t = tween(f, at, at + dur, 0, 1, outExpo);
	if (f < at || t >= 1) return null;
	const d = 120 + t * size;
	return <div style={{position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', border: `${Math.max(1, thick * (1 - t))}px solid ${color}`, opacity: 1 - t, pointerEvents: 'none'}} />;
};

/* ================================================================== iluminación dinámica */

/** Foco suave: un degradado radial aditivo sobre el fondo negro. */
export const Spot: React.FC<{x: number; y: number; r?: number; color?: string; amt?: number; squash?: number}> = ({x, y, r = 260, color = '0,192,99', amt = 0.3, squash = 1}) =>
	amt <= 0.003 ? null : (
		<div
			style={{
				position: 'absolute',
				left: x - r,
				top: y - r * squash,
				width: r * 2,
				height: r * 2 * squash,
				background: `radial-gradient(closest-side, rgba(${color},${amt}) 0%, rgba(${color},${amt * 0.42}) 45%, rgba(${color},0) 100%)`,
				pointerEvents: 'none',
			}}
		/>
	);

/** Cono de luz cenital sobre un punto del escenario (el elemento central, el hallazgo…). */
export const LightCone: React.FC<{x: number; top: number; bottom: number; w0?: number; w1?: number; color?: string; amt?: number}> = ({x, top, bottom, w0 = 30, w1 = 230, color = '0,192,99', amt = 0.22}) =>
	amt <= 0.003 ? null : (
		<div
			style={{
				position: 'absolute',
				left: x - w1 / 2,
				top,
				width: w1,
				height: bottom - top,
				clipPath: `polygon(${50 - (w0 / w1) * 50}% 0, ${50 + (w0 / w1) * 50}% 0, 100% 100%, 0 100%)`,
				background: `linear-gradient(180deg, rgba(${color},0) 0%, rgba(${color},${amt * 0.5}) 35%, rgba(${color},${amt}) 100%)`,
				pointerEvents: 'none',
			}}
		/>
	);

/** Oscurece todo salvo una ventana: atenúa lo descartado y concentra la mirada en lo activo. */
export const Dimmer: React.FC<{x: number; y: number; rx?: number; ry?: number; amt?: number}> = ({x, y, rx = 700, ry = 420, amt = 0.4}) =>
	amt <= 0.003 ? null : <AbsoluteFill style={{background: `radial-gradient(${rx}px ${ry}px at ${x}px ${y}px, rgba(0,0,0,0) 45%, rgba(0,0,0,${amt}) 100%)`, pointerEvents: 'none'}} />;

/** Sacudida de cámara breve y determinista (px). */
export const shake = (f: number, at: number, amp = 10, len = 9): [number, number] => {
	const k = f - at;
	if (k < 0 || k >= len) return [0, 0];
	const a = amp * (1 - k / len);
	return [Math.round((rnd(at * 13 + k * 7) - 0.5) * 2 * a), Math.round((rnd(at * 5 + k * 11) - 0.5) * 2 * a)];
};

/* ================================================================== piezas de interfaz */

/** Encabezado de capítulo: `// 03 · Título` + titular grande con palabra clave en verde. */
export const ChapterTitle: React.FC<{at: number; n: string; label: string; title?: string; highlight?: string[]; x?: number; y?: number; out?: number; size?: number}> = ({at, n, label, title, highlight = [], x = 96, y = 104, out, size = 64}) => {
	const f = useCurrentFrame();
	if (f < at - 2) return null;
	const o = out ? 1 - tween(f, out - 10, out) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y, opacity: o}}>
			<Label size={22} color={C.green} style={{opacity: tween(f, at, at + 8)}}>
				{`// ${n} · ${label}`}
			</Label>
			{title && (
				<div style={{fontFamily: SANS, fontWeight: 820, fontSize: size, letterSpacing: '-0.04em', color: C.white, marginTop: 10, lineHeight: 1.04}}>
					<RiseWords text={title} start={at + 4} highlight={highlight} />
				</div>
			)}
		</div>
	);
};

/** Chip monoespaciado genérico (objetivo, contadores, etiquetas de estado). */
export const Chip: React.FC<{children: React.ReactNode; color?: string; bg?: string; size?: number; style?: React.CSSProperties; border?: string}> = ({children, color = C.white, bg = 'rgba(5,7,6,0.82)', size = 26, style, border = C.line2}) => (
	<div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.5, background: bg, border: `2px solid ${border}`, padding: `${size * 0.36}px ${size * 0.7}px`, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: '0.04em', color, whiteSpace: 'pre', ...style}}>{children}</div>
);

/** Ventana de terminal/editor con barra de título (lleva la marca real de Goslint). */
export const Window: React.FC<{x: number; y: number; w: number; h: number; title: string; children: React.ReactNode; p?: number; accent?: string; logo?: boolean}> = ({x, y, w, h, title, children, p = 1, accent = C.green, logo = true}) => (
	<div style={{position: 'absolute', left: x, top: y + (1 - p) * 40, width: w, height: h, opacity: Math.min(1, p * 1.6), background: C.panel, border: `1px solid ${C.line2}`, boxShadow: '0 30px 90px rgba(0,0,0,0.55)', overflow: 'hidden'}}>
		<div style={{height: 46, background: '#050605', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12}}>
			{logo && <LogoMark height={26} />}
			<span style={{fontFamily: MONO, fontSize: 18, color: C.dim, letterSpacing: '0.06em'}}>{title}</span>
			<span style={{marginLeft: 'auto', width: 10, height: 10, background: accent}} />
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 46, bottom: 0}}>{children}</div>
	</div>
);

/** Número que cuenta hasta `to` entre dos fotogramas. */
export const countUp = (f: number, a: number, b: number, to: number, from = 0) => Math.round(interpolate(f, [a, b], [from, to], {...clamp, easing: outCubic}));

export const fmt = (n: number) => n.toLocaleString('es-CO').replace(/,/g, '.');
