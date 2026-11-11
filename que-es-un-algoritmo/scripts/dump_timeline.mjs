// Vuelca la línea de tiempo real (bloques, locuciones, palabras y subtítulos) a:
//   - scripts/marcas.txt   tiempos m:ss.s de cada locución y de cada palabra, para escribir las escenas
//   - out/timeline.json    para los scripts de Python (música, subtítulos .srt)
// Empaqueta src/timeline.ts con el esbuild que ya trae Remotion: no añade dependencias.
// Uso: node scripts/dump_timeline.mjs
import {createRequire} from 'node:module';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
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
		contents: `import {BLOCKS, CHAPTERS, CUES, DURATION, LINES, RATE, VO} from './src/timeline.ts';
export default {duration: DURATION, fps: 30, rate: RATE, blocks: BLOCKS, voices: VO, lines: LINES, cues: CUES, chapters: CHAPTERS};`,
		resolveDir: root,
		loader: 'ts',
	},
	bundle: true,
	alias: {'@commons': join(root, '..', 'commons', 'src')},
	format: 'esm',
	platform: 'node',
	outfile: tmp,
	logLevel: 'error',
});
const data = (await import(pathToFileURL(tmp).href + '?t=' + Date.now())).default;
writeFileSync(join(root, 'out', 'timeline.json'), JSON.stringify(data, null, 1));

const nar = JSON.parse(readFileSync(join(root, 'src', 'narration.json'), 'utf8'));
const fmt = (f) => `${Math.floor(f / 30 / 60)}:${((f / 30) % 60).toFixed(1).padStart(4, '0')}`;
const out = [
	'Marcas de la narración: tiempos de VIDEO (m:ss.s), con la velocidad de voz aplicada. Generado por scripts/dump_timeline.mjs; no editar.',
	"En las escenas se usan por nombre: at('V12') inicio · at('V12', 'taza') cuando dice «taza» · end('V12') · after('V12', 0.5).",
	'Cada palabra aparece como palabra@m:ss.s (tiempo absoluto del video).',
];
let block = null;
data.lines.forEach((ln, i) => {
	const v = data.voices[ln.id];
	if (ln.b !== block) {
		block = ln.b;
		out.push(`\n===== ${block.toUpperCase()} · ${fmt(data.blocks[block][0])} → ${fmt(data.blocks[block][1])} (${((data.blocks[block][1] - data.blocks[block][0]) / 30).toFixed(1)} s) =====`);
	}
	const next = data.lines[i + 1];
	const gapEnd = next ? data.voices[next.id].start : data.duration;
	out.push(`\n${ln.id}  ${fmt(v.start)} → ${fmt(v.end)}  (${((v.end - v.start) / 30).toFixed(1)} s)   silencio después: ${((gapEnd - v.end) / 30).toFixed(1)} s (hasta ${fmt(gapEnd)})`);
	out.push(`    «${ln.sub}»`);
	const tk = nar[ln.id];
	out.push('    ' + tk.words.map(([w, a]) => `${w}@${fmt(v.start + Math.round((Math.max(0, a - tk.t0) / data.rate) * 30))}`).join('  '));
});
out.push(`\nDURACIÓN TOTAL: ${fmt(data.duration)} (${data.duration} fotogramas)`);
writeFileSync(join(root, 'scripts', 'marcas.txt'), out.join('\n') + '\n');
console.log(`marcas.txt y out/timeline.json: ${data.duration} fotogramas (${fmt(data.duration)}), ${data.cues.length} subtítulos`);
