import {M, SC, V} from './timeline';

/**
 * Hoja de efectos de sonido: fotograma, archivo (public/audio/sfx/*.wav, sintetizados en
 * scripts/make_sfx.py) y volumen. Todo se deriva de las mismas marcas que mueven la imagen.
 */
export type Sfx = {at: number; file: string; vol: number; dur?: number};

const s = (at: number, file: string, vol: number, dur?: number): Sfx => ({at: Math.round(at), file, vol, dur});
const LOGO_AT = 120; // = scenes/A.tsx LOGO_AT

export const buildSfx = (): Sfx[] => {
	const out: Sfx[] = [];
	const add = (...x: Sfx[]) => out.push(...x);
	const cut = (scene: keyof typeof SC) => add(s(SC[scene][0] - 10, 'whoosh', 0.3), s(SC[scene][0], 'flash', 0.26));
	const pops = (seg: Parameters<typeof M>[0], marks: string[], file = 'pop', vol = 0.3) => marks.forEach((m) => add(s(M(seg, m), file, vol)));

	// 00 · apertura
	add(s(8, 'typing', 0.4, 50), s(70, 'enter', 0.4), s(92, 'blip', 0.2), s(LOGO_AT - 10, 'glitch', 0.34), s(LOGO_AT, 'hit', 0.5), s(LOGO_AT + 42, 'glitch', 0.22));
	add(s(206, 'whoosh', 0.3), s(228, 'land', 0.4));
	add(s(M('s01', 'cinco'), 'land', 0.34), s(M('s01', 'cinco') + 4, 'ticks', 0.2, 80), s(M('s01', 'uno'), 'land', 0.34), s(M('s01', 'uno') + 14, 'blip', 0.24), s(M('s01', 'mundo'), 'land', 0.34));
	add(s(M('s01', 'eso') - 3, 'glitch', 0.28), s(M('s01', 'eso'), 'hit', 0.36));
	(['que', 'como', 'uceva'] as const).forEach((m) => add(s(M('s01', m), 'typing', 0.22, 26)));
	add(s(M('s01', 'vamos'), 'ac', 0.34), s(M('s01', 'vamos') + 2, 'boing', 0.3));

	// 01 · ¿qué es?
	cut('que');
	pops('s02', ['resolver', 'algoritmos']);
	add(s(M('s02', 'algoritmos') + 18, 'pop', 0.3), s(M('s02', 'funcione'), 'enter', 0.32), s(M('s02', 'funcione') + 24, 'no', 0.26));
	add(s(M('s02', 'correcta'), 'ac', 0.3), s(M('s02', 'eficiente'), 'blip', 0.26), s(M('s02', 'recursos'), 'blip', 0.26));
	add(s(M('s02', 'logica') - 12, 'whoosh', 0.24));
	pops('s02', ['logica', 'creatividad', 'conoc'], 'pop', 0.32);
	add(s(M('s02', 'practica'), 'ac', 0.32));
	add(s(M('s02', 'nombre') - 6, 'whoosh', 0.24), s(M('s02', 'nombre') + 34, 'slash', 0.3), s(M('s02', 'nombre') + 36, 'no', 0.22));
	pops('s02', ['software', 'entrevistas', 'estructurada'], 'pop', 0.3);

	// 02 · los problemas
	cut('problema');
	add(s(M('s03', 'enunciado') - 20, 'land', 0.32));
	pops('s03', ['enunciado', 'entrada', 'salida', 'restricciones'], 'blip', 0.24);
	pops('s03', ['entender', 'piensas', 'implementas'], 'pop', 0.32);
	pops('s03', ['cpp', 'java', 'python'], 'key', 0.34);

	// 03 · jueces en línea
	cut('juez');
	add(s(M('s04', 'jueces'), 'rise', 0.3), s(M('s04', 'jueces') + 4, 'pop', 0.3));
	[0, 1, 2].forEach((i) => add(s(M('s04', 'ejecutan') + i * 14, 'pop', 0.26)));
	[0, 1, 2, 3, 4].forEach((i) => add(s(M('s04', 'verifican') + i * 4, 'key', 0.22)));
	add(s(M('s04', 'envio') - 8, 'typing', 0.26, 20), s(M('s04', 'envio') + 6, 'enter', 0.4));
	const verdicts = [
		{m: 'wa', file: 'wa', fail: 4},
		{m: 'tle', file: 'ticks', fail: 5},
		{m: 'rte', file: 'glitch', fail: 3},
		{m: 'ac', file: 'ac', fail: 0},
	];
	verdicts.forEach((v) => {
		const t = M('s04', v.m);
		const n = v.fail || 5;
		for (let c = 0; c < n; c++) add(s(t - 40 + (c * 36) / 5, c === n - 1 && v.fail ? 'no' : 'blip', 0.18));
		add(s(t, v.file, v.m === 'ac' ? 0.46 : 0.36, v.m === 'tle' ? 30 : undefined));
		if (v.m === 'wa') add(s(t, 'hit', 0.24));
	});
	add(s(M('s04', 'ac') + 2, 'boing', 0.26), s(M('s04', 'ejemplo'), 'blip', 0.26), s(M('s04', 'todos'), 'ac', 0.34), s(M('s04', 'desafio'), 'pop', 0.3));

	// 04 · la ICPC
	cut('icpc');
	[0, 1, 2, 3].forEach((i) => add(s(M('s05', 'icpc') + i * 3, 'key', 0.32)));
	add(s(M('s05', 'icpc') + 12, 'hit', 0.3));
	[0, 1, 2, 3].forEach((i) => add(s(M('s05', 'siglas') + i * 16, 'pop', 0.26)));
	add(s(M('s05', 'universitarios'), 'blip', 0.26));
	add(s(M('s05', 'equipos') - 6, 'whoosh', 0.3));
	[2, 10, 18].forEach((d) => add(s(M('s05', 'equipos') + d + 12, 'land', 0.36)));
	add(s(M('s05', 'uncomp'), 'rise', 0.24), s(M('s05', 'uncomp') + 6, 'land', 0.4), s(M('s05', 'si') - 6, 'flash', 0.28));
	pops('s05', ['comunicarte', 'repartir', 'decidir'], 'pop', 0.32);
	add(s(M('s05', 'equipo'), 'ac', 0.36), s(M('s05', 'equipo') + 2, 'boing', 0.26), s(M('s05', 'reloj'), 'ticks', 0.3, 60), s(M('s05', 'reloj'), 'hit', 0.24));

	// 05 · el camino
	cut('camino');
	(['nacional', 'regional', 'latam', 'world'] as const).forEach((m, i) => add(s(M('s06', m) - 16, 'whoosh', 0.18), s(M('s06', m), i === 3 ? 'ac' : 'land', i === 3 ? 0.38 : 0.34)));
	add(s(M('s06', 'campeonato'), 'pop', 0.26), s(M('s06', 'mejores'), 'pop', 0.28), s(M('s06', 'recorrido') - 10, 'glitch', 0.24));
	pops('s06', ['preparacion', 'constancia'], 'land', 0.32);
	add(s(M('s06', 'trabajo'), 'ac', 0.34));

	// 06 · en Colombia
	cut('colombia');
	add(s(SC.colombia[0] + 4, 'slide', 0.28), s(M('s07', 'maraton'), 'pop', 0.3));
	pops('s07', ['oficial', 'presencial', 'sedes', 'tres', 'uno'], 'blip', 0.26);
	add(s(M('s07', 'presencial') - 2, 'slide', 0.26), s(M('s07', 'mejores') - 2, 'slide', 0.26), s(M('s07', 'mejores'), 'rise', 0.24));
	add(s(M('s07', 'asi') - 6, 'flash', 0.3), s(M('s07', 'asi') - 6, 'hit', 0.3), s(M('s07', 'asi') + 20, 'ac', 0.3));

	// 07 · en la UCEVA
	cut('uceva');
	add(s(M('s08', 'lejos'), 'land', 0.34), s(M('s08', 'goslint') - 6, 'riser', 0.24), s(M('s08', 'goslint'), 'hit', 0.42), s(M('s08', 'goslint') + 14, 'glitch', 0.2));
	(['aprender', 'entrenar', 'participar'] as const).forEach((m) => add(s(M('s08', m) - 4, 'flash', 0.22), s(M('s08', m) - 2, 'pop', 0.28)));
	add(s(M('s08', 'maratones') - 8, 'whoosh', 0.28), s(M('s08', 'maratones') + 6, 'slide', 0.26), s(M('s08', 'familiar') + 4, 'slide', 0.26), s(M('s08', 'vivir') + 2, 'slide', 0.26));
	pops('s08', ['familiar', 'practicar', 'vivir'], 'blip', 0.24);
	add(s(M('s08', 'd2024') - 8, 'whoosh', 0.28), s(M('s08', 'd2024'), 'land', 0.36), s(M('s08', 'd2026'), 'land', 0.36));
	add(s(M('s08', 'icpc') - 8, 'whoosh', 0.28), s(M('s08', 'icpc'), 'slide', 0.26), s(M('s08', 'icpc') + 26, 'slide', 0.26), s(M('s08', 'icpc') + 48, 'slide', 0.26));
	add(s(M('s08', 'camp') - 8, 'flash', 0.24), s(M('s08', 'camp') + 20, 'slide', 0.26));
	add(s(M('s08', 'nosolo') - 8, 'glitch', 0.26));
	pops('s08', ['proyectos', 'herramientas'], 'pop', 0.32);
	add(s(M('s08', 'tesis'), 'ac', 0.32));

	// 08 · ¿por qué intentarlo?
	cut('cierre');
	add(s(M('s09', 'mas'), 'blip', 0.22));
	pops('s09', ['logica', 'algoritmos', 'creatividad'], 'pop', 0.32);
	add(s(M('s09', 'equipo'), 'ac', 0.32), s(M('s09', 'empiezas') - 8, 'whoosh', 0.24), s(M('s09', 'empiezas'), 'rise', 0.26), s(M('s09', 'experiencia'), 'pop', 0.3));
	add(s(M('s09', 'siempre') - 8, 'whoosh', 0.24));
	Array.from({length: 26}, (_, i) => i % 2 === 0 && add(s(M('s09', 'siempre') + i * 5, 'key', 0.18)));
	add(s(M('s09', 'retos') - 40, 'typing', 0.22, 24), s(M('s09', 'retos'), 'typing', 0.22, 24), s(M('s09', 'diferente'), 'typing', 0.22, 34));
	add(s(M('s09', 'animate'), 'hit', 0.36), s(M('s09', 'animate') + 2, 'ac', 0.36));

	// cierre: únete a GOSLINT
	const logoAt = M('s10', 'gusta') - 30;
	add(s(logoAt - 4, 'glitch', 0.24), s(logoAt + 4, 'hit', 0.5), s(M('s10', 'unete'), 'pop', 0.3), s(M('s10', 'unete') + 10, 'whoosh', 0.22), s(M('s10', 'nos'), 'blip', 0.22));
	const promptAt = V.s10.end + 70;
	add(s(promptAt - 4, 'glitch', 0.24), s(promptAt + 6, 'typing', 0.26, 30), s(promptAt + 40, 'enter', 0.3));
	return out.filter((x) => x.at >= 0).sort((a, b) => a.at - b.at);
};

export const SFX = buildSfx();
