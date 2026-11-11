import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {FPS, H, W} from '@commons/theme';
import {QueEsUnAlgoritmo} from './Video';
import {DURATION} from './timeline';

/** Versión 480p (854×480) para previsualización/exportación ligera: escala el máster de 1920×1080. */
const W480 = 854;
const H480 = 480;
const Scaled480: React.FC = () => (
	<div style={{position: 'absolute', inset: 0, background: '#070807', overflow: 'hidden'}}>
		<div
			style={{
				position: 'absolute',
				left: (W480 - W * (H480 / H)) / 2,
				top: 0,
				width: W,
				height: H,
				transform: `scale(${H480 / H})`,
				transformOrigin: 'top left',
			}}
		>
			<QueEsUnAlgoritmo />
		</div>
	</div>
);

export const Root: React.FC = () => (
	<>
		<Composition id="QueEsUnAlgoritmo" component={QueEsUnAlgoritmo} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
		<Composition id="QueEsUnAlgoritmo480" component={Scaled480} durationInFrames={DURATION} fps={FPS} width={W480} height={H480} />
	</>
);
