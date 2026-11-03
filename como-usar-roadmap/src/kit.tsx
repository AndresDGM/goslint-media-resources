import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {pop, tween} from '@commons/lib';
import {BASE, Key, Lint, Pose, Stop, alive, hop, poseTrack, walk, walkTo} from '@commons/mascot';
import type {Light} from '@commons/pixel';
import {CHAPTERS, CHAPTER_COUNT, CUES, DURATION, M, SC, speakerOf, talkLevel} from './timeline';
import {MASCOTAS, MascotaId} from '@commons/mascotas';

/* ================================================================== actor: la mascota con pista de poses */

/**
 * Lint dirigido por una pista de poses (`keys`) y, opcionalmente, por paradas de caminata.
 * La boca se mueve con la envolvente real de la narración y parpadea/respira sola.
 */
export const Actor: React.FC<{
	x: number;
	y: number;
	scale?: number;
	keys?: Key[];
	stops?: Stop[];
	facing?: 1 | -1;
	light?: Light | null;
	/** fotograma en que cae a escena desde arriba */
	enter?: number;
	/** fotograma en que sale */
	leave?: number;
	hops?: number[];
	carrying?: boolean;
	override?: Partial<Pose> | null;
	/** nivel de voz (0–3) si no es la narración del video principal (ganchos de los reels) */
	talk?: number;
}> = ({x, y, scale = 8, keys = [], stops = [], facing = 1, light = null, enter, leave, hops = [], carrying = false, override = null, talk}) => {
	const f = useCurrentFrame();
	if (enter !== undefined && f < enter) return null;
	if (leave !== undefined && f >= leave) return null;
	const w = walkTo(f, x, stops);
	let pose: Pose = w.walking ? {...BASE, ...walk(f, carrying)} : poseTrack(f, keys);
	if (override && !w.walking) pose = {...BASE, ...override};
	pose = alive(pose, f, talk ?? talkLevel(f));
	const drop = enter !== undefined ? tween(f, enter, enter + 12, 1, 0, (t) => 1 - (1 - t) * (1 - t)) : 0;
	let jump = enter !== undefined ? hop(f, enter + 12, 8, 20) : 0;
	for (const h of hops) jump += hop(f, h, 14, 64);
	const out = leave !== undefined ? tween(f, leave - 8, leave, 0, 1) : 0;
	return <Lint x={w.x} y={y - jump - drop * 620} scale={scale} pose={pose} facing={w.walking ? (w.dir as 1 | -1) : facing} light={light} opacity={1 - out} />;
};

/* ================================================================== subtítulos y HUD */

/** Subtítulos fieles a la locución, sincronizados con los tiempos por palabra. */
export const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const cue = CUES.find((c) => f >= c.from - 2 && f < c.to);
	if (!cue) return null;
	const who = speakerOf(cue.seg);
	const o = Math.min(tween(f, cue.from - 2, cue.from + 3), 1 - tween(f, cue.to - 3, cue.to));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center', opacity: o, pointerEvents: 'none'}}>
			<div style={{maxWidth: 1400, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 34, lineHeight: 1.3, color: C.white, background: 'rgba(0,0,0,0.66)', padding: '10px 24px', borderRadius: 8}}>{cue.text}</div>
		</div>
	);
};

/** HUD de concurso del sistema v1: prompt a la izquierda; a la derecha, capítulo y avance. */
export const Hud: React.FC = () => {
	const f = useCurrentFrame();
	const from = SC.intro[0] + 96;
	const end = M('s07', 'gusta') - 6; // el HUD cede la pantalla al logotipo final
	if (f < from || f > end) return null;
	const o = tween(f, from, from + 12) * (1 - tween(f, end - 14, end));
	const ch = CHAPTERS.find((c) => f >= SC[c.scene][0] && f < SC[c.scene][1]) ?? CHAPTERS[0];
	return (
		<div style={{position: 'absolute', left: 48, right: 48, top: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: MONO, fontSize: 20, color: 'rgba(255,255,255,0.7)', opacity: o, letterSpacing: '0.08em', textShadow: '0 1px 6px rgba(0,0,0,0.8)'}}>
			<span>
				<span style={{color: C.green}}>●</span> goslint@uceva
			</span>
			<span style={{display: 'flex', alignItems: 'center', gap: 16}}>
				<span style={{textTransform: 'uppercase'}}>{`${ch.n}/${CHAPTER_COUNT} · ${ch.label}`}</span>
				<span style={{width: 170, height: 4, background: 'rgba(255,255,255,0.16)', display: 'inline-block', position: 'relative'}}>
					<span style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(f / DURATION) * 100}%`, background: C.green}} />
				</span>
			</span>
		</div>
	);
};

