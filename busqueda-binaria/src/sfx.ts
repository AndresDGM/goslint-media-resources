import {M, SC, V} from './timeline';
import {DRAW_AT, LOGO_AT, StepTiming, cierreBeats, demoA, demoB, demoSwap, linealChecks, macheteTiming, ordenHit} from './beats';

/**
 * Hoja de efectos de sonido: fotograma, archivo (public/audio/sfx/*.wav, sintetizados en
 * scripts/make_sfx.py) y volumen. Todo se deriva de las mismas marcas que mueven la imagen.
 */
export type Sfx = {at: number; file: string; vol: number; dur?: number};

const s = (at: number, file: string, vol: number, dur?: number): Sfx => ({at: Math.round(at), file, vol, dur});

/** Sonidos de un machetazo completo: desenvaine/carga, silbido de la hoja, golpe cómico y astillas. */
const chopSfx = (hit: number, vol = 1): Sfx[] => [s(hit - 20, 'whoosh', 0.16 * vol), s(hit - 3, 'slash', 0.5 * vol), s(hit, 'chop', 0.62 * vol), s(hit + 4, 'debris', 0.3 * vol)];

const stageSfx = (t: StepTiming[], kinds: ('cut' | 'found' | 'none')[], vol = 1): Sfx[] =>
	t.flatMap((x, i) => [s(x.mid, 'blip', 0.2 * vol), ...(kinds[i] === 'cut' ? [...chopSfx(x.hit, vol), s(x.hit + 14, 'slide', 0.22 * vol)] : kinds[i] === 'found' ? [s(x.hit, 'ac', 0.42)] : [])]);

export const buildSfx = (): Sfx[] => {
	const out: Sfx[] = [];
	const add = (...x: Sfx[]) => out.push(...x);
	const cut = (scene: keyof typeof SC) => add(s(SC[scene][0] - 10, 'whoosh', 0.3), s(SC[scene][0], 'flash', 0.3));

	// 00 · apertura
	add(s(10, 'typing', 0.4, 42), s(66, 'key', 0.3), s(LOGO_AT - 12, 'enter', 0.45), s(LOGO_AT - 10, 'glitch', 0.34), s(LOGO_AT, 'hit', 0.5), s(LOGO_AT + 42, 'glitch', 0.22));
	add(s(206, 'whoosh', 0.32), s(228, 'land', 0.4), s(M('s01', 'goslint'), 'blip', 0.2), s(M('s01', 'numero') - 4, 'rise', 0.32), s(M('s01', 'como'), 'pop', 0.4));

	// 01 · búsqueda lineal
	cut('lineal');
	const checks = linealChecks();
	checks.forEach((t, k) => add(s(t, 'key', 0.34), ...(k < checks.length - 1 ? [s(t + 2, 'no', k < 3 ? 0.3 : 0.16)] : [s(t, 'ac', 0.4)])));
	add(s(M('s02', 'mil') - 12, 'whoosh', 0.3), s(M('s02', 'mil') - 6, 'blip', 0.2), s(M('s02', 'mil') + 4, 'blip', 0.22), s(M('s02', 'millon'), 'riser', 0.34), s(M('s02', 'pregunta'), 'hit', 0.28), s(M('s02', 'pregunta') + 20, 'pop', 0.4));

	// 02 · la idea
	cut('idea');
	add(s(SC.idea[0] + 40, 'land', 0.3), s(M('s03', 'ordenados') + 2, 'rise', 0.3), s(M('s03', 'centro'), 'blip', 0.3), s(M('s03', 'igual'), 'ac', 0.32), s(M('s03', 'menor'), 'pop', 0.34), s(M('s03', 'mayor'), 'pop', 0.34), s(M('s03', 'otra') + 4, 'slide', 0.3));

	// 03 · dividir y machetear
	cut('machete');
	add(s(SC.machete[0] + 46, 'land', 0.34), s(M('s04', 'low'), 'pop', 0.34), s(M('s04', 'high'), 'pop', 0.34), s(M('s04', 'mid'), 'blip', 0.3));
	add(s(M('s04', 'dym') - 22, 'pop', 0.3), s(M('s04', 'dym'), 'no', 0.26), s(DRAW_AT(), 'draw', 0.5), s(M('s05', 'busco'), 'blip', 0.22));
	add(...stageSfx(macheteTiming(), ['cut', 'cut', 'found']).filter((x) => x.at > M('s04', 'mid') + 2));
	add(s(M('s05', 'porque'), 'pop', 0.26), s(M('s05', 'metafora'), 'pop', 0.26));

	// 04 · datos ordenados
	cut('orden');
	add(s(M('s06', 'desorden') - 8, 'rise', 0.2), s(M('s06', 'desorden') + 18, 'land', 0.34), s(M('s06', 'centro'), 'blip', 0.28), ...chopSfx(ordenHit()), s(M('s06', 'zas') + 2, 'wa', 0.4), s(M('s06', 'error'), 'no', 0.3));
	[0, 1, 2, 3, 4, 5].forEach((k) => add(s(M('s06', 'sinorden') + 8 + k * 4, 'pop', 0.22)));
	add(s(M('s06', 'conorden') - 3, 'glitch', 0.26), s(M('s06', 'conorden') + 6, 'rise', 0.34), s(M('s06', 'conorden') + 44, 'blip', 0.24), s(M('s06', 'costo'), 'pop', 0.3), s(M('s06', 'una'), 'no', 0.26), s(M('s06', 'ya'), 'pop', 0.3), s(M('s06', 'muchas'), 'pop', 0.3), s(M('s06', 'muchas') + 34, 'ac', 0.3));

	// 05 · paso a paso
	cut('demo');
	add(s(M('s07', 'dieciseis') - 10, 'rise', 0.3), s(M('s07', 'dieciseis') + 26, 'land', 0.34), s(M('s07', 'busco'), 'blip', 0.22), s(M('s07', 'low0'), 'pop', 0.32), s(M('s07', 'high15'), 'pop', 0.32));
	add(...stageSfx(demoA(), ['cut', 'cut', 'cut', 'found']), s(M('s07', 'cuatro'), 'pop', 0.3));
	add(s(demoSwap() - 3, 'glitch', 0.3), s(demoSwap(), 'rise', 0.24), s(demoSwap() + 22, 'land', 0.3));
	add(...stageSfx(demoB(), ['cut', 'cut', 'cut', 'cut'], 0.85), s(M('s08', 'low10'), 'blip', 0.3), s(M('s08', 'supera'), 'pop', 0.3), s(M('s08', 'vacio'), 'no', 0.36), s(M('s08', 'menos1'), 'wa', 0.4));

	// 06 · complejidad
	cut('complejidad');
	const c9 = (k: string) => M('s09', k);
	add(s(c9('n'), 'rise', 0.3), s(c9('lineal') + 30, 'ticks', 0.26, c9('on') - c9('lineal') - 46), s(c9('on'), 'no', 0.3), s(c9('binaria') + 8, 'pop', 0.3));
	[0, 1, 2, 3].forEach((i) => add(s(c9('partir') + i * 16 - 3, 'slash', 0.34), s(c9('partir') + i * 16, 'chop', 0.4)));
	add(s(c9('log'), 'pop', 0.3), s(c9('ologn'), 'ac', 0.4));
	const c10 = (k: string) => M('s10', k);
	add(s(V.s10.start - 29, 'glitch', 0.28), s(c10('competir') - 6, 'land', 0.3), s(c10('misma'), 'pop', 0.26), s(c10('misma') + 30, 'pop', 0.26), s(c10('tres4'), 'pop', 0.26), s(c10('cuento'), 'pop', 0.26));
	add(s(c10('n16') + 6, 'ticks', 0.3, 44), ...[0, 1, 2, 3].map((i) => s(c10('n16') + 56 + i * 10, 'blip', 0.3)));
	[0, 20, 40].forEach((d) => add(s(c10('crece') + d, 'whoosh', 0.2), s(c10('crece') + d + 6, 'blip', 0.26)));
	add(s(c10('n1024') + 4, 'riser', 0.32), s(c10('r769') + 14, 'no', 0.3));
	Array.from({length: 10}, (_, i) => add(s(c10('r769') + 30 + (i * (c10('r10') - c10('r769') - 34)) / 9, 'blip', 0.3)));
	add(s(c10('r10'), 'ac', 0.44), s(c10('ojo') - 4, 'whoosh', 0.26), s(c10('mejor'), 'blip', 0.24), s(c10('promedio'), 'blip', 0.24), s(c10('peor'), 'blip', 0.24), s(c10('bin'), 'blip', 0.24), s(c10('logn') - 40, 'pop', 0.3));

	// 07 · java iterativo
	cut('iterativa');
	const c11 = (k: string) => M('s11', k);
	add(s(SC.iterativa[0] + 18, 'typing', 0.26, 40), s(SC.iterativa[0] + 36, 'land', 0.3));
	const en = c11('encoge');
	[c11('l1'), c11('l2'), c11('l3'), c11('l4'), c11('l5'), c11('l6'), c11('l6') + 62, c11('l7') - 40, c11('l7') - 28, c11('l7') - 14, c11('l7'), c11('l7') + 36, en, en + 10, en + 20, en + 30, en + 42, en + 52, en + 62].forEach((t) => add(s(t, 'key', 0.3)));
	add(s(c11('desborde') - 4, 'pop', 0.28), s(c11('clave'), 'pop', 0.3), s(en + 74, 'ac', 0.42), s(c11('l8'), 'key', 0.3), s(V.s11.end + 24, 'ac', 0.34));

	// 08 · java recursivo
	cut('recursiva');
	const c12 = (k: string) => M('s12', k);
	add(s(SC.recursiva[0] + 18, 'typing', 0.26, 36), s(SC.recursiva[0] + 52, 'land', 0.26), s(c12('params'), 'key', 0.3), s(c12('base1'), 'pop', 0.3), s(c12('base2'), 'pop', 0.3), s(c12('rec'), 'pop', 0.3));
	[0, 1, 2, 3].forEach((i) => add(s(c12('def') + 30 + i * 36, 'blip', 0.24 + i * 0.02), s(c12('pila') + i * 28, 'stack', 0.4), s(c12('regresa') + 16 + i * 24, 'unstack', 0.4)));
	add(s(c12('regresa') + 16 + 3 * 24 + 14, 'ac', 0.42));
	const c13 = (k: string) => M('s13', k);
	add(s(V.s13.start - 29, 'glitch', 0.28), s(c13('mismas'), 'pop', 0.28), s(c13('iter'), 'pop', 0.28), s(c13('o1'), 'blip', 0.3), s(c13('recu'), 'pop', 0.28), s(c13('ologn'), 'blip', 0.3), s(c13('sincontar'), 'pop', 0.24), s(c13('v1'), 'pop', 0.28), s(c13('v2'), 'pop', 0.28), s(c13('ninguna'), 'ac', 0.34));

	// 09 · en la práctica
	cut('usos');
	const c14 = (k: string) => M('s14', k);
	add(s(c14('donde') + 4, 'land', 0.3));
	(['uno', 'dos', 'tres'] as const).forEach((k) => add(s(c14(k), 'whoosh', 0.24), s(c14(k) + 30, 'blip', 0.26), s(c14(k) + 50, 'blip', 0.26), s(c14(k) + 62, 'ac', 0.3)));
	add(s(c14('ajuste') + 10, 'pop', 0.28), s(c14('ajuste') + 26, 'blip', 0.26), s(c14('ajuste') + 46, 'blip', 0.26), s(c14('ajuste') + 66, 'blip', 0.26), s(c14('limite'), 'ac', 0.3), s(c14('c1'), 'ac', 0.3), s(c14('c2'), 'ac', 0.3), s(c14('notodas'), 'wa', 0.34));

	// 10 · cierre
	cut('cierre');
	const c15 = (k: string) => M('s15', k);
	(['r1', 'r2', 'r3', 'r4', 'r5', 'r6'] as const).forEach((k, i) => add(s(c15(k), i === 5 ? 'ac' : 'pop', 0.3)));
	const cb = cierreBeats();
	add(s(c15('reto') - 4, 'glitch', 0.28), s(c15('millon'), 'hit', 0.26));
	Array.from({length: 7}, (_, i) => add(s(cb.zas + i * cb.stepGap * 3, 'slash', 0.34), s(cb.zas + i * cb.stepGap * 3 + 2, 'chop', i % 2 ? 0.34 : 0.44)));
	add(s(cb.veinte + 16, 'ac', 0.44), s(c15('recuerda') - 5, 'glitch', 0.28), ...chopSfx(cb.hit, 1.1), s(cb.hit + 6, 'hit', 0.4), s(cb.hit + 10, 'boing', 0.4));
	add(s(c15('adios') - 6, 'whoosh', 0.26), s(cb.gos - 14, 'riser', 0.3), s(cb.gos, 'hit', 0.52), s(cb.gos + 40, 'glitch', 0.2), s(cb.gos + 60, 'ac', 0.32));
	return out.filter((x) => x.at >= 0).sort((a, b) => a.at - b.at);
};

export const SFX = buildSfx();
