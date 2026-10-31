// Renderiza las 17 láminas a 2160×2700 en out/NN_slug.png (usa la lista de src/data.ts).
import {spawnSync} from 'node:child_process';
import {LAMINAS} from '../src/data.ts';

const solo = process.argv[2]; // opcional: número de lámina (p. ej. 4)
LAMINAS.forEach((l, i) => {
	const n = String(i + 1).padStart(2, '0');
	if (solo && Number(solo) !== i + 1) return;
	const r = spawnSync('npx', ['remotion', 'still', `S${n}`, `out/${n}_${l.slug}.png`, '--scale=2'], {stdio: 'inherit'});
	if (r.status !== 0) process.exit(r.status ?? 1);
});
