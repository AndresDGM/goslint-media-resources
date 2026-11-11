import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {C, FPS, H, W} from '@commons/theme';
import '../fonts';
import {Hud, Subtitles} from '../kit';
import {DURATION} from '../timeline';
import {B2} from '../scenes/B2';

/**
 * Entrada de desarrollo: SOLO este bloque (con HUD y subtítulos), sin audio. Empaqueta rápido y no
 * depende de los demás bloques. Los fotogramas son los absolutos del video.
 *   pnpm exec remotion still src/dev/B2.tsx Bloque out/x.png --frame=1234 --scale=0.5
 */
const Bloque: React.FC = () => (
	<AbsoluteFill style={{background: C.bg}}>
		<B2 />
		<Hud />
		<Subtitles />
	</AbsoluteFill>
);
registerRoot(() => <Composition id="Bloque" component={Bloque} durationInFrames={DURATION} fps={FPS} width={W} height={H} />);
