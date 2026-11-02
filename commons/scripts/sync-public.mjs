// Copia los recursos comunes (commons/public/…) a la carpeta public/ del proyecto, porque Remotion
// solo sirve archivos de su propia carpeta public. Qué carpetas copia lo dice el commons.json del
// proyecto: {"public": ["brand", "fonts", "fx", "audio/sfx", "mascotas", "photos"]}.
// Las copias están en el .gitignore del proyecto: la fuente de verdad es commons/.
// Uso (desde la carpeta del proyecto): node ../commons/scripts/sync-public.mjs
import {cpSync, existsSync, readFileSync, rmSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const commons = join(dirname(fileURLToPath(import.meta.url)), '..');
const project = process.cwd();
const cfgPath = join(project, 'commons.json');
if (!existsSync(cfgPath)) {
	console.error('Falta commons.json en', project);
	process.exit(1);
}
const {public: dirs = []} = JSON.parse(readFileSync(cfgPath, 'utf8'));
for (const d of dirs) {
	const src = join(commons, 'public', d);
	const dst = join(project, 'public', d);
	if (!existsSync(src)) {
		console.error(`commons/public/${d} no existe`);
		process.exit(1);
	}
	rmSync(dst, {recursive: true, force: true});
	cpSync(src, dst, {recursive: true});
}
console.log(`commons -> public/: ${dirs.join(', ')}`);
