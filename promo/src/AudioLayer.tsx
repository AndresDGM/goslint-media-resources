import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {CUES, DURATION, SYNC, voFile, voFrames, type Cue} from './timeline';
import {clamp} from './lib';

const MUSIC = 0.85;
const DUCKED = 0.3;
const VOICE = 0.8;

/** Music gain per frame: ducks smoothly under every narration line. */
const musicVolume = (cues: Cue[]) => (f: number) => {
	let duck = 0;
	for (const c of cues) {
		const a = c.from - 6;
		const b = c.from + voFrames(c.id) + 4;
		const d = Math.min(interpolate(f, [a - 6, a], [0, 1], clamp), interpolate(f, [b, b + 10], [1, 0], clamp));
		duck = Math.max(duck, d);
	}
	return MUSIC - (MUSIC - DUCKED) * duck;
};

export type Sfx = {at: number; file: string; vol: number; dur?: number};

// Sound-design cue sheet (frame, sound, volume). Every sound is synthesised in scripts/make_sfx.py.
const SFX: Sfx[] = [
	{at: 6, file: 'typing', vol: 0.45, dur: 46},
	{at: SYNC.horas, file: 'hit', vol: 0.32},
	{at: SYNC.personas, file: 'hit', vol: 0.32},
	{at: SYNC.computador, file: 'hit', vol: 0.36},
	{at: 200, file: 'glitch', vol: 0.3},
	{at: 215, file: 'glitch', vol: 0.36},
	{at: 228, file: 'glitch', vol: 0.42},
	{at: 282, file: 'glitch', vol: 0.28},
	{at: 345, file: 'whoosh', vol: 0.45},
	{at: 376, file: 'typing', vol: 0.28, dur: 62},
	...[0, 1, 2, 3, 4].map((l) => ({at: 478 + l * 15, file: 'blip', vol: 0.22})),
	...[0, 4, 8, 12, 16, 20].map((d) => ({at: SYNC.problemaTras + 2 + d, file: 'key', vol: 0.3})),
	{at: SYNC.cpp, file: 'ac', vol: 0.3},
	{at: SYNC.python, file: 'ac', vol: 0.3},
	{at: SYNC.java, file: 'ac', vol: 0.34},
	{at: 646, file: 'whoosh', vol: 0.5},
	{at: 660, file: 'flash', vol: 0.4},
	{at: 705, file: 'flash', vol: 0.4},
	{at: 750, file: 'flash', vol: 0.4},
	{at: 802, file: 'whoosh', vol: 0.45},
	{at: SYNC.pereira, file: 'flash', vol: 0.36},
	{at: SYNC.cali, file: 'flash', vol: 0.36},
	{at: SYNC.bogota, file: 'flash', vol: 0.36},
	{at: SYNC.icpc - 2, file: 'glitch', vol: 0.3},
	{at: 990, file: 'flash', vol: 0.36},
	{at: 1048, file: 'glitch', vol: 0.3},
	...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({at: 1050 + i * 3, file: 'key', vol: 0.32})),
	{at: 1082, file: 'hit', vol: 0.3},
	{at: 1128, file: 'whoosh', vol: 0.4},
	...[3, 11, 19, 27].map((d) => ({at: SYNC.equivocarse + d, file: 'wa', vol: 0.3})),
	{at: SYNC.celebrar + 16, file: 'ac', vol: 0.5},
	...[0, 5, 10, 15].map((d) => ({at: 1440 + d, file: 'blip', vol: 0.22})),
	{at: SYNC.construyendo + 2, file: 'whoosh', vol: 0.4},
	...[0, 1, 2, 3].map((i) => ({at: 1508 + i * 15, file: 'blip', vol: 0.24})),
	{at: 1568, file: 'ac', vol: 0.4},
	{at: 1630, file: 'glitch', vol: 0.3},
	{at: 1645, file: 'glitch', vol: 0.36},
	{at: 1656, file: 'glitch', vol: 0.42},
	{at: 1664, file: 'enter', vol: 0.5},
	{at: SYNC.experiencia + 4, file: 'typing', vol: 0.25, dur: 14},
	{at: SYNC.experiencia + 34, file: 'wa', vol: 0.22},
	{at: SYNC.curiosidad, file: 'typing', vol: 0.25, dur: 12},
	{at: SYNC.ganas, file: 'typing', vol: 0.25, dur: 14},
	{at: 1834, file: 'whoosh', vol: 0.35},
	{at: 1880, file: 'ac', vol: 0.45},
	{at: SYNC.unete + 16, file: 'enter', vol: 0.4},
];

/** Mix shared by every cut of the video: music bed (ducked under the voice), narration and sound effects. */
export const AudioMix: React.FC<{music: string; cues: Cue[]; sfx: Sfx[]; duration: number}> = ({music, cues, sfx, duration}) => (
	<>
		<Audio src={staticFile(music)} volume={musicVolume(cues)} />
		{cues.map((c) => (
			<Sequence key={c.id} from={c.from} durationInFrames={voFrames(c.id) + 6} layout="none">
				<Audio src={staticFile(voFile(c.id))} volume={VOICE} />
			</Sequence>
		))}
		{sfx.filter((s) => s.at < duration).map((s, i) => (
			<Sequence key={i} from={s.at} durationInFrames={s.dur ?? 45} layout="none">
				<Audio src={staticFile(`audio/sfx/${s.file}.wav`)} volume={s.vol} />
			</Sequence>
		))}
	</>
);

export const AudioLayer: React.FC = () => <AudioMix music="audio/music.wav" cues={CUES} sfx={SFX} duration={DURATION} />;
