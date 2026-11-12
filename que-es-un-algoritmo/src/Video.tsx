import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C} from '@commons/theme';
import {Grain, Scanlines, Vignette, WipeBar} from '@commons/components';
import {Barrido} from '@commons/transiciones';
import {BLOCKS, BlockId, RATE, VO} from './timeline';
import {Hud, Subtitles} from './kit';
import {Sfx, s} from './sfx';
import {B1, sfxB1} from './scenes/B1';
import {B2, sfxB2} from './scenes/B2';
import {B3, sfxB3} from './scenes/B3';
import {B4, sfxB4} from './scenes/B4';
import {B5, sfxB5} from './scenes/B5';
import {B6, sfxB6} from './scenes/B6';
import {B7, sfxB7} from './scenes/B7';

const SCENES: [BlockId, React.FC][] = [['b1', B1], ['b2', B2], ['b3', B3], ['b4', B4], ['b5', B5], ['b6', B6], ['b7', B7]];

/** Cortes entre bloques: una transición de impacto tapa la pantalla justo en el cambio. */
const CUTS = (['b2', 'b3', 'b4', 'b5', 'b6', 'b7'] as BlockId[]).map((b) => BLOCKS[b][0]);
const sfxCuts: Sfx[] = CUTS.flatMap((c) => [s(c - 8, 'whoosh', 0.34), s(c, 'flash', 0.22)]);

export const SFX: Sfx[] = [...sfxB1, ...sfxB2, ...sfxB3, ...sfxB4, ...sfxB5, ...sfxB6, ...sfxB7, ...sfxCuts];

/** Niveles de mezcla. */
const VOICE = 1;
const SFX_GAIN = 0.55;
const MUSIC = 0.42;
const DUCKED = 0.11;
const WINDOWS = Object.values(VO).map((v) => [v.start - 5, v.end + 4]);
const clampOpt = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Ganancia de la música por fotograma: baja suavemente bajo cada locución y sube en los gags. */
const musicVolume = (f: number) => {
	let duck = 0;
	for (const [a, b] of WINDOWS) {
		if (f < a - 8 || f > b + 14) continue;
		duck = Math.max(duck, Math.min(interpolate(f, [a - 8, a], [0, 1], clampOpt), interpolate(f, [b, b + 14], [1, 0], clampOpt)));
	}
	return MUSIC - (MUSIC - DUCKED) * duck;
};

/** Cada bloque se dibuja solo dentro de su rango, con fotogramas absolutos (useCurrentFrame no se reinicia). */
const Block: React.FC<{id: BlockId; C: React.FC}> = ({id, C: Comp}) => {
	const f = useCurrentFrame();
	const [a, b] = BLOCKS[id];
	if (f < a || f >= b) return null;
	return <Comp />;
};

export const QueEsUnAlgoritmo: React.FC = () => (
	<AbsoluteFill style={{background: C.bg}}>
		{SCENES.map(([id, Comp]) => <Block key={id} id={id} C={Comp} />)}
		<Hud />
		<Subtitles />
		{CUTS.map((c, i) => (i % 2 === 0 ? <Barrido key={c} at={c} dir={i % 4 === 0 ? 1 : -1} /> : <WipeBar key={c} at={c - 7} dur={14} />))}
		<Vignette strength={0.5} />
		<Scanlines opacity={0.04} />
		<Grain opacity={0.05} />
		<Audio src={staticFile('audio/music.mp3')} volume={musicVolume} />
		{/* Voz de Vee: una toma por locución, sin su silencio inicial y a la velocidad RATE. */}
		{Object.entries(VO).map(([id, v]) => (
			<Sequence key={id} from={v.start} durationInFrames={v.end - v.start + 2} layout="none">
				<Audio src={staticFile(v.file)} startFrom={v.from} playbackRate={RATE} volume={VOICE * v.gain} />
			</Sequence>
		))}
		{SFX.map((x, i) => (
			<Sequence key={i} from={Math.max(0, x.at)} durationInFrames={x.dur ?? 80} layout="none">
				<Audio src={staticFile(`audio/sfx/${x.file}.wav`)} volume={x.vol * SFX_GAIN} />
			</Sequence>
		))}
	</AbsoluteFill>
);
