import {Config} from '@remotion/cli/config';

Config.setOverwriteOutput(true);
Config.setStillImageFormat('png');
Config.setChromiumOpenGlRenderer('swangle');

// Si Remotion no puede descargar su Chrome, apunta a un Chromium local con REMOTION_BROWSER.
if (process.env.REMOTION_BROWSER) {
	Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
