import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {GoslintPromo} from './GoslintPromo';
import {GoslintInstagramReel} from './reel/GoslintInstagramReel';
import {DURATION_REEL, RH, RW} from './reel/timeline';
import {GoslintInstagramReelV2} from './reel-v2/GoslintInstagramReelV2';
import {DURATION_V2} from './reel-v2/timeline';
import {GoslintPromoV2} from './promo-v2/GoslintPromoV2';
import {DURATION} from './timeline';
import {FPS, H, W} from './theme';

// Load local fonts before any frame is captured.
const fontHandle = delayRender('Loading fonts');
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
		console.error('Font loading failed', err);
		continueRender(fontHandle);
	});

export const Root: React.FC = () => (
	<>
		<Composition id="GoslintPromo" component={GoslintPromo} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
		<Composition id="GoslintInstagramReel" component={GoslintInstagramReel} durationInFrames={DURATION_REEL} fps={FPS} width={RW} height={RH} />
		<Composition id="GoslintPromoV2" component={GoslintPromoV2} durationInFrames={DURATION_V2} fps={FPS} width={W} height={H} />
		<Composition id="GoslintInstagramReelV2" component={GoslintInstagramReelV2} durationInFrames={DURATION_V2} fps={FPS} width={RW} height={RH} />
	</>
);
