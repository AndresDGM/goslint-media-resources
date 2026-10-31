import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {clamp} from '../lib';
import {Scanlines, Vignette} from '../components';
import {GrainV, ReelHud, ReelSubtitles, Shift} from '../reel/ui';
import {FinalV, RequisitosV} from '../reel/scenes/CtaV';
import {CAPTIONS_V2, DURATION_V2, FINAL, MUSIC_V2, NARRATION, OFF_CTA, R2, SFX_V2, SPEECH, clockV2} from './timeline';
import {HookV2} from './scenes/HookV2';
import {LogoV2} from './scenes/LogoV2';
import {ProblemV2, TrainingV2} from './scenes/TrainingV2';
import {CompeteV2} from './scenes/CompeteV2';
import {TeamV2} from './scenes/TeamV2';
import {JudgeV2} from './scenes/JudgeV2';
import {ExampleV} from './scenes/ExampleV';

const inRange = (f: number, [a, b]: readonly [number, number]) => f >= a && f < b;

// The voice sits about 2.5 dB further above the bed than in the 45 s cut: this narration is denser,
// and the names it has to land (C++, Python, Java, ICPC) fall on sound effects.
const MUSIC = 0.85;
const DUCKED = 0.26;
const VOICE = 1;

/** Music gain per frame: ducks smoothly under every stretch of speech. */
const musicVolume = (f: number) => {
	let duck = 0;
	for (const [from, to] of SPEECH) {
		const a = from - 6;
		const b = to + 4;
		duck = Math.max(duck, Math.min(interpolate(f, [a - 6, a], [0, 1], clamp), interpolate(f, [b, b + 10], [1, 0], clamp)));
	}
	return MUSIC - (MUSIC - DUCKED) * duck;
};

/** One narration file from the first frame, the music bed under it, and the sound effects of the edit. */
export const AudioV2: React.FC = () => (
	<>
		<Audio src={staticFile(MUSIC_V2)} volume={musicVolume} />
		<Audio src={staticFile(NARRATION)} volume={VOICE} />
		{SFX_V2.filter((s) => s.at < DURATION_V2).map((s, i) => (
			<Sequence key={i} from={s.at} durationInFrames={s.dur ?? 45} layout="none">
				<Audio src={staticFile(`audio/sfx/${s.file}.wav`)} volume={s.vol} />
			</Sequence>
		))}
	</>
);

/**
 * Vertical (9:16) cut of the Goslint promo for Instagram Reels, edited to the final narration
 * (public/audio/vo/audio.mp3). Same assets, components and look as GoslintPromo and
 * GoslintInstagramReel; every cut, headline and caption follows the word timings of
 * narration-words.json, and the layouts leave the caption band free.
 */
export const GoslintInstagramReelV2: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{inRange(f, R2.hook) && <HookV2 />}
			{inRange(f, R2.logo) && <LogoV2 />}
			{inRange(f, R2.problem) && <ProblemV2 />}
			{inRange(f, R2.training) && <TrainingV2 />}
			{inRange(f, R2.compete) && <CompeteV2 />}
			{inRange(f, R2.team) && <TeamV2 />}
			{inRange(f, R2.judge) && <JudgeV2 />}
			{inRange(f, R2.cta) && (
				<Shift by={OFF_CTA}>
					<RequisitosV />
				</Shift>
			)}
			{inRange(f, R2.example) && <ExampleV />}
			{inRange(f, R2.final) && <FinalV t={FINAL} />}
			<Scanlines opacity={0.035} />
			<Vignette strength={0.55} />
			<GrainV opacity={0.08} />
			<ReelHud from={R2.problem[0]} until={R2.judge[1] - 4} clock={clockV2} />
			<ReelSubtitles captions={CAPTIONS_V2} />
			<AudioV2 />
		</AbsoluteFill>
	);
};
