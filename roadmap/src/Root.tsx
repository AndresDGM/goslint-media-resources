import React from 'react';
import {Composition, Folder, continueRender, delayRender, staticFile} from 'remotion';
import {Slide} from './Slide';
import {LAMINAS} from './data';
import {FPS, H, W} from './theme';

// Fuentes locales (public/fonts), cargadas antes de capturar cada lámina.
const handle = delayRender('Cargando fuentes');
const faces = [
	...[400, 500, 700].map((w) => new FontFace('JetBrains Mono', `url(${staticFile(`fonts/jbm-${w}.woff2`)}) format('woff2')`, {weight: String(w)})),
];
Promise.all(faces.map((f) => f.load()))
	.then((loaded) => {
		loaded.forEach((f) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f));
		continueRender(handle);
	})
	.catch((err) => {
		console.error('No se pudieron cargar las fuentes', err);
		continueRender(handle);
	});

/** Una composición por lámina: S01 … S17 (el nombre del archivo sale de `slug` en data.ts). */
export const Root: React.FC = () => (
	<Folder name="Roadmap">
		{LAMINAS.map((l, i) => (
			<Composition key={l.slug} id={`S${String(i + 1).padStart(2, '0')}`} component={Slide} defaultProps={{index: i}} durationInFrames={1} fps={FPS} width={W} height={H} />
		))}
	</Folder>
);
