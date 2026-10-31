import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {clamp} from './lib';
import {SFX} from './sfx';
import {SEG_IDS, V, seg, voFrames} from './timeline';

/** Niveles de mezcla (scripts/simulate_mix.py los lee de aquí para medir sin renderizar). */
const MUSIC = 0.5;
const DUCKED = 0.07;
const VOICE = 1;
const SFX_GAIN = 0.8;

/** Ganancia de la música por fotograma: baja suavemente bajo cada locución. */
const musicVolume = (f: number) => {
	let duck = 0;
	for (const id of SEG_IDS) {
		const a = V[id].start - 6;
		const b = V[id].end + 4;
		const d = Math.min(interpolate(f, [a - 8, a], [0, 1], clamp), interpolate(f, [b, b + 14], [1, 0], clamp));
		duck = Math.max(duck, d);
	}
	return MUSIC - (MUSIC - DUCKED) * duck;
};

/** Música original (atenuada bajo la voz), narración de ElevenLabs y efectos sintetizados. */
export const AudioLayer: React.FC = () => (
	<>
		<Audio src={staticFile('audio/music.mp3')} volume={musicVolume} />
		{SEG_IDS.filter((id) => seg(id).file).map((id) => (
			<Sequence key={id} from={V[id].start} durationInFrames={voFrames(id) + 8} layout="none">
				<Audio src={staticFile(seg(id).file!)} volume={VOICE} />
			</Sequence>
		))}
		{SFX.map((s, i) => (
			<Sequence key={i} from={s.at} durationInFrames={s.dur ?? 80} layout="none">
				<Audio src={staticFile(`audio/sfx/${s.file}.wav`)} volume={s.vol * SFX_GAIN} />
			</Sequence>
		))}
	</>
);
