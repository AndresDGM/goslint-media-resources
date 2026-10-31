// Vuelca la línea de tiempo real (escenas, locuciones, subtítulos y hoja de efectos) a out/timeline.json
// para los scripts de Python (música, simulación de mezcla, subtítulos .srt).
// Empaqueta src/sfx.ts con el esbuild que ya trae Remotion: no añade dependencias.
// Uso: node scripts/dump_timeline.mjs
import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(join(root, 'package.json'));
const cli = createRequire(req.resolve('@remotion/cli/package.json'));
const bundler = createRequire(cli.resolve('@remotion/bundler/package.json'));
const esbuild = bundler('esbuild');
mkdirSync(join(root, 'out'), {recursive: true});
const tmp = join(root, 'out', 'timeline-dump.mjs');
await esbuild.build({
	stdin: {
		contents: `import {SFX} from './src/sfx.ts'; import {CUES, DURATION, SC, V, seg, SEG_IDS, CHAPTERS} from './src/timeline.ts';
export default {duration: DURATION, fps: 30, scenes: SC, voices: Object.fromEntries(SEG_IDS.map((id) => [id, {...V[id], file: seg(id).file, seconds: seg(id).seconds}])), cues: CUES, chapters: CHAPTERS, sfx: SFX};`,
		resolveDir: root,
		loader: 'ts',
	},
	bundle: true,
	format: 'esm',
	platform: 'node',
	outfile: tmp,
	logLevel: 'error',
});
const data = (await import(pathToFileURL(tmp).href + '?t=' + Date.now())).default;
writeFileSync(join(root, 'out', 'timeline.json'), JSON.stringify(data, null, 1));
console.log(`out/timeline.json: ${data.duration} fotogramas (${(data.duration / 30 / 60).toFixed(2)} min), ${data.cues.length} subtítulos, ${data.sfx.length} efectos`);
