import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {BannerV1, BannerV2} from './Banners';
import {FPS, H, W} from './theme';

// Fuentes locales (public/fonts), cargadas antes de capturar.
const handle = delayRender('Cargando fuentes');
const faces = [
	new FontFace('Inter Var', `url(${staticFile('fonts/inter-var.woff2')}) format('woff2')`, {weight: '100 900'}),
	...[400, 500, 700, 800].map((w) => new FontFace('JetBrains Mono', `url(${staticFile(`fonts/jbm-${w}.woff2`)}) format('woff2')`, {weight: String(w)})),
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

export const Root: React.FC = () => (
	<>
		<Composition id="BannerV1" component={BannerV1} durationInFrames={1} fps={FPS} width={W} height={H} />
		<Composition id="BannerV2" component={BannerV2} durationInFrames={1} fps={FPS} width={W} height={H} />
	</>
);
