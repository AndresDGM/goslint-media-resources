import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '@commons/theme';
import {Grain, Scanlines, Vignette} from '@commons/components';
import {SC, SceneId} from './timeline';
import {Hud, Subtitles} from './kit';
import {AudioLayer} from './AudioLayer';
import {Intro, Mapa} from './scenes/A';
import {Guias} from './scenes/B';
import {Cambios, Entrada, Final, Hitos} from './scenes/C';

export const SCENE: Record<SceneId, React.FC> = {intro: Intro, mapa: Mapa, guias: Guias, hitos: Hitos, entrada: Entrada, cambios: Cambios, final: Final};

/** Solo las escenas (sin HUD, subtítulos ni audio). */
export const Scenes: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			{(Object.keys(SCENE) as SceneId[]).map((id) => {
				const S = SCENE[id];
				return f >= SC[id][0] && f < SC[id][1] ? <S key={id} /> : null;
			})}
		</>
	);
};

/** Composición principal: escenas por rango → scanlines → viñeta → grano → HUD → subtítulos → audio. */
export const ComoUsarRoadmap: React.FC = () => (
	<AbsoluteFill style={{background: C.bg}}>
		<Scenes />
		<Scanlines opacity={0.035} />
		<Vignette strength={0.55} />
		<Grain opacity={0.08} />
		<Hud />
		<Subtitles />
		<AudioLayer />
	</AbsoluteFill>
);
