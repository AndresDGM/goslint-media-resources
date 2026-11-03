import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {outExpo, pop, tween} from '@commons/lib';
import {CUES, M, V, speakerOf} from '../timeline';
import type {SegId} from '../timeline';
import {MASCOTAS, MascotaId} from '@commons/mascotas';
import {CutFlash, GridBg, Grain, Label, LogoMark, Scanlines, Shockwave, Vignette, Wordmark} from '@commons/components';
import {AudioLayer} from '../AudioLayer';
import {Actor} from '../kit';
import {Key, POSES} from '@commons/mascot';
import {Big, Hit, In} from '@commons/vertical';

/**
 * Marco común de los reels verticales (1080×1920), uno por fase. Cada reel tiene su propia maquetación vertical
 * (src/reels/FaseN.tsx) escrita contra los fotogramas del video principal: dentro de cada tramo,
 * `useCurrentFrame()` devuelve el fotograma del video principal, así que se usan las mismas marcas
 * `M('s03o', 'grafos')` que en el video horizontal, y la voz, la música y los efectos son los mismos.
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
};

/** Cierre corto común: logotipo, «¿Te gusta programar?» y «¡Únete a GOSLINT!» (final de s07). */
export const FINAL: [number, number] = [M('s07', 'gusta') - 34, V.s07.end + 45];

/**
 * Tramos ajustados a la voz: de cada segmento se toma [inicio − pre, fin + post], así que ninguna
 * pausa del reel supera ~1,2 s (los respiros largos del video horizontal se recortan).
 */
export const voiceParts = (ids: SegId[], pre = 18, post = 18): [number, number][] =>
	ids.map((id) => [V[id].start - pre, V[id].end + post] as [number, number]);

export const reelDuration = (r: VReelDef) => r.parts.reduce((s, [a, b]) => s + b - a, 0);

/* ------------------------------------------------------------------ Lint y su bocadillo */

/** Bocadillo de Lint con la frase que se está diciendo (subtítulos fieles a la locución). */
const Speech: React.FC<{cues?: {from: number; to: number; text: string; seg: SegId}[]}> = ({cues = CUES}) => {
	const f = useCurrentFrame();
	const cue = cues.find((c) => f >= c.from - 2 && f < c.to);
	if (!cue) return null;
	const p = pop(f, cue.from - 2, 16, 260, 0.5);
	const o = 1 - tween(f, cue.to - 3, cue.to);
	const len = cue.text.length;
	const size = len > 90 ? 36 : len > 60 ? 40 : 44;
	const who = speakerOf(cue.seg);
	const m = who === 'lint' ? null : MASCOTAS[who as MascotaId];
	return (
		<div style={{position: 'absolute', left: 330, right: 50, bottom: RH - 1560, display: 'flex', alignItems: 'flex-end', opacity: o}}>
			<div style={{position: 'relative', background: C.white, color: '#0A0F0C', fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 1.22, padding: '22px 28px', boxShadow: `10px 10px 0 ${m ? m.color : 'rgba(0,192,99,0.85)'}`, transform: `scale(${0.92 + 0.08 * p})`, transformOrigin: 'left bottom'}}>
				{m && <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: '0.08em', color: '#0A0F0C', opacity: 0.6, marginBottom: 6}}>{m.name.toUpperCase()}</div>}
				{cue.text}
				<div style={{position: 'absolute', left: -26, bottom: 30, width: 0, height: 0, borderTop: '16px solid transparent', borderBottom: '16px solid transparent', borderRight: `28px solid ${C.white}`}} />
			</div>
		</div>
	);
};

export const LintV: React.FC<{keys: Key[]; talk?: number}> = ({keys, talk}) => {
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
	const gusta = M('s07', 'gusta');
	const unete = M('s07', 'unete');
	const nos = M('s07', 'unete') + 30;
	const logoAt = gusta - 30;
	const p = tween(f, logoAt, logoAt + 40, 0, 1, outExpo);
	return (
		<>
			<Shockwave at={logoAt + 4} x={540} y={640} size={1600} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center'}}>
				<LogoMark height={330} p={p} glow={f > logoAt + 40 ? 16 + Math.sin(f / 6) * 6 : 0} />
			</div>
			<In at={gusta} x={0} y={860} w={RW} from="up" impact={false}>
				<div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 760, fontSize: 64, color: C.text, letterSpacing: '-0.03em'}}>¿Te gusta programar?</div>
			</In>
			<In at={unete} x={0} y={960} w={RW} from="zoom" impact={false}>
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

/* ------------------------------------------------------------------ composición del reel */

export const VReel: React.FC<{r: VReelDef}> = ({r}) => {
	const f = useCurrentFrame();
	const total = reelDuration(r);
	let off = 0;
	const finalKeys: Key[] = [{at: M('s07', 'gusta'), pose: POSES.cheer}, {at: M('s07', 'unete') + 30, pose: POSES.wave}];
	const parts = r.parts.map(([a, b], i) => {
		const from = off;
		off += b - a;
		const isFinal = a === FINAL[0];
		return (
			<Sequence key={i} from={from} durationInFrames={b - a} layout="none">
				<Sequence from={-a} layout="none">
					<AbsoluteFill>{isFinal ? <FinalV /> : <r.Body />}</AbsoluteFill>
					<LintV keys={isFinal ? finalKeys : r.lint} />
					<Speech cues={isFinal ? CUES.filter((c) => c.from >= M('s07', 'gusta') - 2) : CUES} />
					<AudioLayer />
				</Sequence>
			</Sequence>
		);
	});
	const words = r.title.split(' ');
	const headIn = 0;
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
			{parts}
			<Scanlines opacity={0.035} />
			<Vignette strength={0.45} />
			<Grain opacity={0.07} />
			<AbsoluteFill style={{background: '#000', opacity: tween(f, total - 20, total - 1)}} />
		</AbsoluteFill>
	);
};
