import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from './theme';
import {SC, SceneId} from './timeline';
import {Grain, Scanlines, Vignette} from './components';
import {Hud, Subtitles} from './kit';
import {AudioLayer} from './AudioLayer';
import {Intro, Que} from './scenes/A';
import {Juez, Problema} from './scenes/B';
import {Camino, Colombia, Icpc} from './scenes/C';
import {Cierre, Final, Uceva} from './scenes/D';

const SCENE: Record<SceneId, React.FC> = {
	intro: Intro,
	que: Que,
	problema: Problema,
	juez: Juez,
	icpc: Icpc,
	camino: Camino,
	colombia: Colombia,
	uceva: Uceva,
	cierre: Cierre,
	final: Final,
};

/** Composición principal: escenas por rango → scanlines → viñeta → grano → HUD → subtítulos → audio. */
export const ProgramacionCompetitiva: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{(Object.keys(SCENE) as SceneId[]).map((id) => {
				const S = SCENE[id];
				return f >= SC[id][0] && f < SC[id][1] ? <S key={id} /> : null;
			})}
			<Scanlines opacity={0.035} />
			<Vignette strength={0.55} />
			<Grain opacity={0.08} />
			<Hud />
			<Subtitles />
			<AudioLayer />
		</AbsoluteFill>
	);
};
