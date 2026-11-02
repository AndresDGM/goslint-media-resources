import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {outExpo, pop, rnd, tween} from '../../lib';
import {CUES, M, SC, V, seg} from '../../timeline';
import type {SegId} from '../../timeline';
import {CutFlash, GridBg, Grain, Label, LogoMark, Scanlines, Shockwave, Vignette, Wordmark, shake} from '../../components';
import {AudioLayer} from '../../AudioLayer';
import {Actor} from '../../kit';
import {Key, POSES} from '../../mascot';
import {PixelBurst} from '../../pixel';

/**
 * Marco común de los reels verticales (1080×1920). Cada reel tiene su propia maquetación vertical
 * (src/reels/v/*.tsx) escrita contra los fotogramas del video principal: dentro de cada tramo,
 * `useCurrentFrame()` devuelve el fotograma del video principal, así que se usan las mismas marcas
 * `M('s05', 'equipos')` que en el video horizontal, y la voz, la música y los efectos son los mismos.
 *
 * Zonas (1080×1920):
 *   0–220      interfaz de la app: solo fondo
 *   230–400    cabecera: marca + título del reel
 *   430–1190   ESCENARIO: aquí entran los elementos (STAGE)
 *   1210–1600  Lint (siempre visible, abajo a la izquierda) + bocadillo con lo que dice (subtítulos)
 *   1620–1920  interfaz de la app: solo fondo
 */
export const RW = 1080;
export const RH = 1920;
export const STAGE = {x: 60, y: 430, w: 960, h: 760};
export const LINT = {x: 175, y: 1560, scale: 8};

export type VReelDef = {
	id: string;
	n: string;
	title: string;
	hl: string[];
	/** tramos del video principal [desde, hasta) que forman el reel; el último suele ser FINAL */
	parts: [number, number][];
	/** maquetación vertical del contenido (recibe el fotograma del video principal) */
	Body: React.FC;
	/** pista de poses de Lint (fotogramas del video principal) */
	lint: Key[];
	/** gancho de apertura propio del reel (segmento h1…h5 de scripts/narration.txt) */
	hook?: string;
};

/** Cierre corto común: logotipo, «¿Te gusta programar?», «¡Únete a GOSLINT!» y «Nos vemos…». */
export const FINAL: [number, number] = [SC.final[0], V.s10.end + 45];

type HookSeg = {file: string | null; seconds: number; cues: {t0: number; t1: number; text: string}[]; env: string};
const hookSeg = (id?: string): HookSeg | null => (id ? (seg(id as SegId) as unknown as HookSeg) ?? null : null);
/** Duración del gancho en fotogramas (voz + respiro). */
export const hookLen = (r: VReelDef) => {
	const h = hookSeg(r.hook);
	return h ? Math.ceil(h.seconds * 30) + 18 : 0;
};
export const reelDuration = (r: VReelDef) => hookLen(r) + r.parts.reduce((s, [a, b]) => s + b - a, 0);

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

/* ------------------------------------------------------------------ Lint y su bocadillo */

/** Bocadillo de Lint con la frase que se está diciendo (subtítulos fieles a la locución). */
const Speech: React.FC<{cues?: {from: number; to: number; text: string}[]}> = ({cues = CUES}) => {
	const f = useCurrentFrame();
	const cue = cues.find((c) => f >= c.from - 2 && f < c.to);
	if (!cue) return null;
	const p = pop(f, cue.from - 2, 16, 260, 0.5);
	const o = 1 - tween(f, cue.to - 3, cue.to);
	const len = cue.text.length;
	const size = len > 90 ? 36 : len > 60 ? 40 : 44;
	return (
		<div style={{position: 'absolute', left: 330, right: 50, bottom: RH - 1560, display: 'flex', alignItems: 'flex-end', opacity: o}}>
			<div style={{position: 'relative', background: C.white, color: '#0A0F0C', fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 1.22, padding: '22px 28px', boxShadow: '10px 10px 0 rgba(0,192,99,0.85)', transform: `scale(${0.92 + 0.08 * p})`, transformOrigin: 'left bottom'}}>
				{cue.text}
				<div style={{position: 'absolute', left: -26, bottom: 30, width: 0, height: 0, borderTop: '16px solid transparent', borderBottom: '16px solid transparent', borderRight: `28px solid ${C.white}`}} />
			</div>
		</div>
	);
};

const LintV: React.FC<{keys: Key[]; talk?: number}> = ({keys, talk}) => {
	const f = useCurrentFrame();
	return (
		<>
			<div style={{position: 'absolute', left: LINT.x - 160, top: LINT.y - 60, width: 320, height: 90, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,192,99,0.35), rgba(0,192,99,0))'}} />
			<Actor x={LINT.x} y={LINT.y + Math.round(Math.sin(f / 14) * 0)} scale={LINT.scale} keys={keys} talk={talk} light={{dx: 1, dy: -1, color: C.green, amt: 0.35}} />
		</>
	);
};

/* ------------------------------------------------------------------ cierre vertical */

export const FinalV: React.FC = () => {
	const f = useCurrentFrame();
	const gusta = M('s10', 'gusta');
	const unete = M('s10', 'unete');
	const nos = M('s10', 'nos');
	const logoAt = gusta - 30;
	const p = tween(f, logoAt, logoAt + 40, 0, 1, outExpo);
	return (
		<>
			<Shockwave at={logoAt + 4} x={540} y={640} size={1600} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center'}}>
				<LogoMark height={330} p={p} glow={f > logoAt + 40 ? 16 + Math.sin(f / 6) * 6 : 0} />
			</div>
			<In at={gusta} x={0} y={860} w={RW} from="up">
				<div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 760, fontSize: 64, color: C.text, letterSpacing: '-0.03em'}}>¿Te gusta programar?</div>
			</In>
			<In at={unete} x={0} y={960} w={RW} from="zoom">
				<div style={{textAlign: 'center'}}>
					<Big size={120}>¡Únete a</Big>
					<div style={{display: 'flex', justifyContent: 'center', marginTop: 18}}>
						<Wordmark height={104} />
					</div>
				</div>
			</In>
			<Hit at={unete + 2} x={540} y={1080} big />
			{f >= nos && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', opacity: tween(f, nos, nos + 10)}}>
					<Img src={staticFile('brand/uceva.png')} style={{height: 80}} />
				</div>
			)}
			<CutFlash at={logoAt + 4} len={5} />
		</>
	);
};

/* ------------------------------------------------------------------ gancho de apertura */

/** Gancho: el título del reel, palabra por palabra con impactos, mientras Lint lo dice. */
const HookV: React.FC<{r: VReelDef; len: number}> = ({r, len}) => {
	const f = useCurrentFrame();
	const words = r.title.split(' ');
	const step = Math.max(5, Math.floor((len * 0.55) / words.length));
	return (
		<>
			<div style={{position: 'absolute', left: 60, top: 470, display: 'flex', alignItems: 'center', gap: 18, opacity: tween(f, 0, 8)}}>
				<LogoMark height={70} p={tween(f, 0, 24, 0, 1, outExpo)} />
				<Label size={28} color={C.green}>{`goslint · ${r.n}`}</Label>
			</div>
			<div style={{position: 'absolute', left: 60, right: 60, top: 600, fontFamily: SANS, fontWeight: 880, fontSize: 118, lineHeight: 0.98, letterSpacing: '-0.05em'}}>
				{words.map((w, i) => {
					const at = 4 + i * step;
					const p = pop(f, at, 11, 260, 0.6);
					return f >= at ? (
						<span key={i} style={{display: 'inline-block', marginRight: '0.22em', color: r.hl.includes(w) ? C.green : C.white, transform: `scale(${0.5 + 0.5 * p}) translateY(${(1 - p) * 30}px)`, opacity: Math.min(1, p * 2)}}>
							{w}
						</span>
					) : null;
				})}
			</div>
			{r.hl.map((w) => {
				const i = words.indexOf(w);
				return i >= 0 ? <Hit key={w} at={4 + i * step + 2} x={540} y={800} big /> : null;
			})}
		</>
	);
};

/* ------------------------------------------------------------------ composición del reel */

export const VReel: React.FC<{r: VReelDef}> = ({r}) => {
	const f = useCurrentFrame();
	const total = reelDuration(r);
	const hl = hookLen(r);
	const h = hookSeg(r.hook);
	let off = hl;
	const finalKeys: Key[] = [{at: M('s10', 'gusta'), pose: POSES.cheer}, {at: M('s10', 'nos'), pose: POSES.wave}];
	const parts = r.parts.map(([a, b], i) => {
		const from = off;
		off += b - a;
		const isFinal = a === FINAL[0];
		return (
			<Sequence key={i} from={from} durationInFrames={b - a} layout="none">
				<Sequence from={-a} layout="none">
					<AbsoluteFill>{isFinal ? <FinalV /> : <r.Body />}</AbsoluteFill>
					<LintV keys={isFinal ? finalKeys : r.lint} />
					<Speech />
					<AudioLayer />
				</Sequence>
			</Sequence>
		);
	});
	const hookPart = h ? (
		<Sequence from={0} durationInFrames={hl} layout="none">
			<HookV r={r} len={hl} />
			<LintV keys={[{at: 0, pose: POSES.wave}, {at: Math.floor(hl * 0.5), pose: POSES.pointUp}]} talk={Number(h.env[f] ?? 0)} />
			<Speech cues={h.cues.map((c, i, all) => ({text: c.text, from: Math.round(c.t0 * 30), to: i < all.length - 1 ? Math.round(all[i + 1].t0 * 30) : Math.round(c.t1 * 30) + 10}))} />
			{h.file && <Audio src={staticFile(h.file)} />}
			<Audio src={staticFile('audio/music.mp3')} startFrom={SC.intro[0] + 240} volume={(x) => 0.07 + 0.2 * tween(x, hl - 30, hl)} />
		</Sequence>
	) : null;
	const words = r.title.split(' ');
	const headIn = Math.max(0, hl - 2);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.5} size={80} />
			<div style={{position: 'absolute', left: 60, right: 60, top: 228, opacity: f >= headIn ? 1 : 0}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
					<LogoMark height={52} />
					<Label size={24} color={C.green}>{`goslint · ${r.n}`}</Label>
				</div>
				<div style={{fontFamily: SANS, fontWeight: 860, fontSize: 62, lineHeight: 1.02, letterSpacing: '-0.045em', color: C.white, marginTop: 14}}>
					{words.map((w, i) => {
						const p = pop(f, headIn + 2 + i * 3, 14, 220, 0.6);
						return (
							<span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - p) * 40}px)`, opacity: Math.min(1, p * 1.5), color: r.hl.includes(w) ? C.green : C.white, marginRight: '0.22em'}}>
								{w}
							</span>
						);
					})}
				</div>
			</div>
			{hookPart}
			{parts}
			{hl > 0 && <CutFlash at={hl} len={4} />}
			<Scanlines opacity={0.035} />
			<Vignette strength={0.45} />
			<Grain opacity={0.07} />
			<AbsoluteFill style={{background: '#000', opacity: tween(f, total - 20, total - 1)}} />
			{rnd(0) > 2 ? null : null}
		</AbsoluteFill>
	);
};
