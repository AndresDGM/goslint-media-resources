import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from './theme';
import {SC, SceneId} from './timeline';
import {Grain, Scanlines, Vignette} from './components';
import {Hud, Subtitles} from './kit';
import {AudioLayer} from './AudioLayer';
import {Idea, Intro, Lineal} from './scenes/A';
import {Demo, Machete, Orden} from './scenes/B';
import {Complejidad} from './scenes/C';
import {Iterativa, Recursiva} from './scenes/D';
import {Cierre, Usos} from './scenes/E';

const SCENE: Partial<Record<SceneId, React.FC>> = {
	intro: Intro,
	lineal: Lineal,
	idea: Idea,
	machete: Machete,
	orden: Orden,
	demo: Demo,
	complejidad: Complejidad,
	iterativa: Iterativa,
	recursiva: Recursiva,
	usos: Usos,
	cierre: Cierre,
};

/** Composición principal: escenas por rango → scanlines → viñeta → grano → HUD → subtítulos → audio. */
export const BusquedaBinaria: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{(Object.keys(SCENE) as SceneId[]).map((id) => {
				const S = SCENE[id]!;
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
