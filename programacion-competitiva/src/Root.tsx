import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {FPS, H, W} from './theme';
import {ProgramacionCompetitiva} from './Video';
import {DURATION} from './timeline';

// Las fuentes son locales (public/fonts) y se cargan antes de capturar cualquier fotograma.
const fontHandle = delayRender('Cargando fuentes');
const faces = [
	new FontFace('Inter Var', `url(${staticFile('fonts/inter-var.woff2')}) format('woff2')`, {weight: '100 900'}),
	...[400, 500, 700, 800].map((w) => new FontFace('JetBrains Mono', `url(${staticFile(`fonts/jbm-${w}.woff2`)}) format('woff2')`, {weight: String(w)})),
];
Promise.all(faces.map((ff) => ff.load()))
	.then((loaded) => {
		loaded.forEach((ff) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff));
		continueRender(fontHandle);
	})
	.catch((err) => {
		console.error('No se pudieron cargar las fuentes', err);
		continueRender(fontHandle);
	});

export const Root: React.FC = () => (
	<>
		<Composition id="ProgramacionCompetitiva" component={ProgramacionCompetitiva} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
	</>
);
