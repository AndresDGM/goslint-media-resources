import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {pop, tween} from '../lib';
import {CUES, SC, V} from '../timeline';
import {GridBg, Grain, Label, LogoMark, Scanlines, Vignette} from '../components';
import {AudioLayer} from '../AudioLayer';
import {Scenes} from '../Video';
import {camera} from './camera';

/**
 * Reels verticales (1080×1920) hechos con los mismos fotogramas del video principal: cada reel
 * encadena tramos de la línea de tiempo (escenas + su narración, música y efectos) y termina con
 * el cierre «¿Te gusta programar? ¡Únete a GOSLINT!». No usa narración nueva.
 */
export const RW = 1080;
export const RH = 1920;
const VP_Y = 500; // ventana de la cámara: y de 500 a 1440
const VP_H = 940;

/** Cierre corto: logotipo, «¿Te gusta programar?», «Únete a GOSLINT» y «Nos vemos…». */
const FINAL: [number, number] = [SC.final[0], V.s10.end + 45];

export type ReelDef = {id: string; n: string; title: string; hl: string; parts: [number, number][]};

export const REELS: ReelDef[] = [
	{id: 'Reel1QueEs', n: '01', title: '¿Qué es la programación competitiva?', hl: 'competitiva?', parts: [SC.que, FINAL]},
	{id: 'Reel2Jueces', n: '02', title: '¿Cómo funcionan los jueces en línea?', hl: 'jueces', parts: [[SC.problema[0], SC.juez[1]], FINAL]},
	{id: 'Reel3Icpc', n: '03', title: 'La ICPC: de tu país a la final mundial', hl: 'ICPC:', parts: [[SC.icpc[0], SC.camino[1]], FINAL]},
	{id: 'Reel4Colombia', n: '04', title: 'Programación competitiva en Colombia', hl: 'Colombia', parts: [SC.colombia, FINAL]},
	{id: 'Reel5Uceva', n: '05', title: 'Programación competitiva en la UCEVA', hl: 'UCEVA', parts: [SC.uceva, FINAL]},
];

export const reelDuration = (r: ReelDef) => r.parts.reduce((s, [a, b]) => s + b - a, 0);

/** Fotograma del video principal que corresponde al fotograma `f` del reel. */
const sourceFrame = (r: ReelDef, f: number) => {
	let off = 0;
	for (const [a, b] of r.parts) {
		if (f < off + b - a) return a + (f - off);
		off += b - a;
	}
	return r.parts[r.parts.length - 1][1] - 1;
};

/** Ventana que muestra la escena 16:9 a través de la cámara virtual. */
const CamView: React.FC<{children: React.ReactNode}> = ({children}) => {
	const f = useCurrentFrame(); // fotograma del video principal (dentro de la secuencia desplazada)
	const c = camera(f);
	const x = RW / 2 - c.cx * c.z;
	const y = VP_H / 2 - c.cy * c.z;
	return (
		<div style={{position: 'absolute', left: 0, top: VP_Y, width: RW, height: VP_H, overflow: 'hidden', background: C.bg}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${x}px, ${y}px) scale(${c.z})`, transformOrigin: '0 0'}}>{children}</div>
		</div>
	);
};

const ReelSubtitles: React.FC<{src: number}> = ({src}) => {
	const cue = CUES.find((c) => src >= c.from - 2 && src < c.to);
	if (!cue) return null;
	const o = Math.min(tween(src, cue.from - 2, cue.from + 3), 1 - tween(src, cue.to - 3, cue.to));
	return (
		<div style={{position: 'absolute', left: 60, right: 60, top: VP_Y + VP_H + 24, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.25, color: C.white, background: 'rgba(0,0,0,0.7)', padding: '16px 28px', borderRadius: 10}}>{cue.text}</div>
		</div>
	);
};

export const Reel: React.FC<{r: ReelDef}> = ({r}) => {
	const f = useCurrentFrame();
	const total = reelDuration(r);
	const src = sourceFrame(r, f);
	const words = r.title.split(' ');
	let off = 0;
	const parts = r.parts.map(([a, b], i) => {
		const from = off;
		off += b - a;
		return (
			<Sequence key={i} from={from} durationInFrames={b - a} layout="none">
				<Sequence from={-a} layout="none">
					<CamView>
						<Scenes />
						<Scanlines opacity={0.035} />
					</CamView>
					<AudioLayer />
				</Sequence>
			</Sequence>
		);
	});
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.45} size={80} />
			{/* zona superior (la interfaz de la app ocupa ~220 px): marca + título del reel */}
			<div style={{position: 'absolute', left: 70, right: 70, top: 215}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
					<LogoMark height={64} />
					<Label size={26} color={C.green}>{`goslint · reel ${r.n}`}</Label>
				</div>
				<div style={{fontFamily: SANS, fontWeight: 860, fontSize: 72, lineHeight: 1.0, letterSpacing: '-0.045em', color: C.white, marginTop: 18}}>
					{words.map((w, i) => {
						const p = pop(f, 4 + i * 3, 16, 200, 0.7);
						return (
							<span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - p) * 40}px)`, opacity: Math.min(1, p * 1.5), color: w === r.hl ? C.green : C.white, marginRight: '0.22em'}}>
								{w}
							</span>
						);
					})}
				</div>
			</div>
			
			{parts}
			<ReelSubtitles src={src} />
			{/* barra de progreso sobre la zona inferior de la interfaz */}
			<div style={{position: 'absolute', left: 70, right: 70, top: 1655, height: 6, background: 'rgba(255,255,255,0.14)'}}>
				<div style={{height: 6, width: `${(f / total) * 100}%`, background: C.green}} />
			</div>
			<div style={{position: 'absolute', left: 70, top: 1680, fontFamily: MONO, fontSize: 24, color: C.dim, letterSpacing: '0.08em'}}>
				<span style={{color: C.green}}>●</span> goslint@uceva
			</div>
			<Vignette strength={0.5} />
			<Grain opacity={0.07} />
			<AbsoluteFill style={{background: '#000', opacity: tween(f, total - 20, total - 1)}} />
		</AbsoluteFill>
	);
};
