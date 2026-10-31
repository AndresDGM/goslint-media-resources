import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {tween} from '../lib';
import {Grain, Scanlines, Vignette} from '../components';
import {formatClock} from '../scenes/ColdOpen';
import {AudioV2} from '../reel-v2/GoslintInstagramReelV2';
import {CAPTIONS_V2, R2, clockV2} from '../reel-v2/timeline';
import {HookH2, LogoH2} from './scenes/OpenH2';
import {ProblemH2, TrainingH2} from './scenes/TrainingH2';
import {CompeteH2} from './scenes/CompeteH2';
import {TeamH2} from './scenes/TeamH2';
import {JudgeH2} from './scenes/JudgeH2';
import {ExampleH2, FinalH2, RequisitosH2} from './scenes/CtaH2';

const inRange = (f: number, [a, b]: readonly [number, number]) => f >= a && f < b;

const HUD_FROM = R2.problem[0];
const HUD_UNTIL = R2.judge[1] - 4;

/** Contest HUD: the clock from the hook keeps running until the call to action. */
const Hud: React.FC = () => {
	const f = useCurrentFrame();
	if (f < HUD_FROM || f >= HUD_UNTIL) return null;
	const o = tween(f, HUD_FROM, HUD_FROM + 12) * (1 - tween(f, HUD_UNTIL - 12, HUD_UNTIL));
	return (
		<div style={{position: 'absolute', left: 48, right: 48, top: 34, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 20, color: 'rgba(255,255,255,0.7)', opacity: o, letterSpacing: '0.08em', textShadow: '0 1px 6px rgba(0,0,0,0.8)'}}>
			<span>
				<span style={{color: C.green}}>●</span> goslint@uceva
			</span>
			<span style={{fontVariantNumeric: 'tabular-nums'}}>T− {formatClock(clockV2(f))}</span>
		</div>
	);
};

/** Phrase-by-phrase captions from the forced alignment of the narration, in the 16:9 style. */
const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const cue = CAPTIONS_V2.find((c) => f >= c.from && f < c.to);
	if (!cue) return null;
	const o = Math.min(tween(f, cue.from, cue.from + 3), 1 - tween(f, cue.to - 3, cue.to));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 52, display: 'flex', justifyContent: 'center', opacity: o, pointerEvents: 'none'}}>
			<div style={{maxWidth: 1400, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 34, lineHeight: 1.3, color: C.white, background: 'rgba(0,0,0,0.62)', padding: '10px 24px', borderRadius: 8}}>{cue.text}</div>
		</div>
	);
};

/**
 * 16:9 cut of the Goslint promo edited to the final narration (public/audio/vo/audio.mp3), for YouTube.
 * Same edit, music, sound design and captions as GoslintInstagramReelV2 (timeline in src/reel-v2/timeline.ts),
 * with the horizontal layouts of GoslintPromo.
 */
export const GoslintPromoV2: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{inRange(f, R2.hook) && <HookH2 />}
			{inRange(f, R2.logo) && <LogoH2 />}
			{inRange(f, R2.problem) && <ProblemH2 />}
			{inRange(f, R2.training) && <TrainingH2 />}
			{inRange(f, R2.compete) && <CompeteH2 />}
			{inRange(f, R2.team) && <TeamH2 />}
			{inRange(f, R2.judge) && <JudgeH2 />}
			{inRange(f, R2.cta) && <RequisitosH2 />}
			{inRange(f, R2.example) && <ExampleH2 />}
			{inRange(f, R2.final) && <FinalH2 />}
			<Scanlines opacity={0.035} />
			<Vignette strength={0.55} />
			<Grain opacity={0.08} />
			<Hud />
			<Subtitles />
			<AudioV2 />
		</AbsoluteFill>
	);
};
