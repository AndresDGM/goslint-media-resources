import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {FPS, H, W} from '@commons/theme';
import {QueEsUnAlgoritmo} from './Video';
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
