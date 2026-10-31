import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Scanlines, Vignette} from '../components';
import {AudioMix} from '../AudioLayer';
import {CUES_REEL, DURATION_REEL, OFF, R, SFX_REEL} from './timeline';
import {GrainV, ReelHud, ReelSubtitles, Shift} from './ui';
import {HookV} from './scenes/HookV';
import {LogoV} from './scenes/LogoV';
import {ProblemV, TrainingV} from './scenes/TrainingV';
import {CompeteV} from './scenes/CompeteV';
import {TeamV} from './scenes/TeamV';
import {JudgeV} from './scenes/JudgeV';
import {FinalV, RequisitosV} from './scenes/CtaV';

const inRange = (f: number, [a, b]: readonly [number, number]) => f >= a && f < b;

/**
 * Vertical (9:16) cut of the Goslint promo for Instagram Reels.
 * Same assets, components and look as GoslintPromo; the layouts, the photo framing
 * and the edit (45 s instead of 70 s) are specific to this cut.
 */
export const GoslintInstagramReel: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{inRange(f, R.hook) && <HookV />}
			{inRange(f, R.logo) && <LogoV />}
			{inRange(f, R.problem) && <ProblemV />}
			{inRange(f, R.training) && (
				<Shift by={OFF.l05}>
					<TrainingV />
				</Shift>
			)}
			{inRange(f, R.compete) && <CompeteV />}
			{inRange(f, R.team) && <TeamV />}
			{inRange(f, R.judge) && (
				<Shift by={OFF.l10}>
					<JudgeV />
				</Shift>
			)}
			{inRange(f, R.cta) && (
				<Shift by={OFF.l11}>
					<RequisitosV />
				</Shift>
			)}
			{inRange(f, R.final) && <FinalV />}
			<Scanlines opacity={0.035} />
			<Vignette strength={0.55} />
			<GrainV opacity={0.08} />
			<ReelHud />
			<ReelSubtitles />
			<AudioMix music="audio/music-reel.wav" cues={CUES_REEL} sfx={SFX_REEL} duration={DURATION_REEL} />
		</AbsoluteFill>
	);
};
