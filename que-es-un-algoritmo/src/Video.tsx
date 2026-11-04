import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C} from '@commons/theme';
import {Grain, Scanlines, Vignette} from '@commons/components';
import {BLOCKS, BlockId} from './timeline';
import {B1, sfxB1} from './scenes/B1';
import {B2, sfxB2} from './scenes/B2';
import {B3, sfxB3} from './scenes/B3';
import {B4, sfxB4} from './scenes/B4';
import {B5, sfxB5} from './scenes/B5';
import {B6, sfxB6} from './scenes/B6';
import {B7, sfxB7} from './scenes/B7';

const SCENES: [BlockId, React.FC][] = [['b1', B1], ['b2', B2], ['b3', B3], ['b4', B4], ['b5', B5], ['b6', B6], ['b7', B7]];
export const SFX = [...sfxB1, ...sfxB2, ...sfxB3, ...sfxB4, ...sfxB5, ...sfxB6, ...sfxB7];

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
		<Vignette strength={0.55} />
		<Scanlines opacity={0.04} />
		<Grain opacity={0.05} />
		{SFX.map((x, i) => (
			<Sequence key={i} from={x.at} durationInFrames={x.dur ?? 80} layout="none">
				<Audio src={staticFile(`audio/sfx/${x.file}.wav`)} volume={x.vol * 0.8} />
			</Sequence>
		))}
	</AbsoluteFill>
);
