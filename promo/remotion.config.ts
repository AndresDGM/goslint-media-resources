import {Config} from '@remotion/cli/config';

Config.setOverwriteOutput(true);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);

// Video settings (AUDIO_ONLY=1 allows a `--codec=wav` render; for quick level checks prefer scripts/simulate_mix.py)
if (!process.env.AUDIO_ONLY) {
	Config.setCodec('h264');
	Config.setCrf(20);
	Config.setColorSpace('bt709');
	Config.setPixelFormat('yuv420p');
	Config.setAudioCodec('aac');
	Config.setAudioBitrate('256k');
}
// 'swangle' renders on the CPU and works everywhere. On a machine with a working Vulkan
// driver, REMOTION_GL=vulkan (or the --gl=vulkan flag) renders on the GPU instead.
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as 'swangle' | 'vulkan' | 'angle' | undefined) ?? 'swangle');

// Remotion normally downloads its own Chrome Headless Shell. If that download is
// blocked (as in the sandbox this was built in), point it at a local headless
// Chromium with the REMOTION_BROWSER environment variable.
if (process.env.REMOTION_BROWSER) {
	Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
if (process.env.REMOTION_CONCURRENCY) {
	Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY));
}
