import {M, SC, V} from './timeline';
import {beats} from './scenes/B';

/**
 * Hoja de efectos: fotograma, archivo (public/audio/sfx/*.wav, de commons/scripts/make_sfx.py) y volumen.
 * Todo se deriva de las mismas marcas de voz que mueven la imagen.
 */
export type Sfx = {at: number; file: string; vol: number; dur?: number};

const s = (at: number, file: string, vol: number, dur?: number): Sfx => ({at: Math.round(at), file, vol, dur});
const LOGO_AT = 66; // = scenes/A.tsx LOGO_AT

export const buildSfx = (): Sfx[] => {
	const out: Sfx[] = [];
	const add = (...x: Sfx[]) => out.push(...x);
	const cut = (scene: keyof typeof SC) => add(s(SC[scene][0] - 10, 'whoosh', 0.3), s(SC[scene][0], 'flash', 0.26));

	// 00 · apertura
	add(s(6, 'typing', 0.4, 30), s(40, 'enter', 0.4), s(LOGO_AT - 8, 'glitch', 0.34), s(LOGO_AT, 'hit', 0.5));
	add(s(V.s01.start - 22, 'land', 0.36));
	add(s(M('s01', 'llegar'), 'whoosh', 0.26), s(M('s01', 'donde'), 'hit', 0.34), s(M('s01', 'mapa'), 'draw', 0.3), s(M('s01', 'mapa') + 2, 'pop', 0.3));
	(['como', 'entrar', 'practicar'] as const).forEach((m) => add(s(M('s01', m), 'pop', 0.3)));

	// 01 · el mapa
	cut('mapa');
	add(s(M('s02', 'noventa'), 'hit', 0.36), s(M('s02', 'noventa') + 2, 'ticks', 0.2, 26), s(M('s02', 'ocho'), 'hit', 0.32), s(M('s02', 'ocho') + 8, 'draw', 0.26));
	add(s(M('s02', 'nunca'), 'pop', 0.28), s(M('s02', 'lista'), 'rise', 0.26), s(M('s02', 'lista') + 30, 'ac', 0.3));
	add(s(M('s02', 'libro') + 22, 'slash', 0.3), s(M('s02', 'aprende'), 'hit', 0.36));

	// 02 · fases y guías
	cut('guias');
	add(s(SC.guias[0] + 6, 'draw', 0.26));
	for (const b of beats()) {
		add(s(b.from, 'slide', 0.26), s(b.from + 2, 'pop', 0.26));
		b.guides.forEach((g) => add(s(g.at, 'land', 0.3), s(g.at + 2, 'boing', 0.2)));
		b.chips.forEach((c) => add(s(c.at, 'blip', 0.18)));
	}

	// 03 · los hitos
	cut('hitos');
	Array.from({length: 7}, (_, i) => add(s(M('s04', 'hito') + i * 6, 'key', 0.2)));
	add(s(M('s04', 'reto'), 'pop', 0.3), s(M('s04', 'sale'), 'ac', 0.34), s(M('s04', 'repasa'), 'wa', 0.24));

	// 04 · ¿por dónde entro?
	cut('entrada');
	add(s(M('s05', 'cero'), 'pop', 0.3), s(M('s05', 'fase0'), 'slide', 0.26), s(M('s05', 'programas'), 'pop', 0.3), s(M('s05', 'checkpoint'), 'hit', 0.32));
	Array.from({length: 5}, (_, i) => add(s(M('s05', 'salen') + i * 4, 'key', 0.2)));
	add(s(M('s05', 'salen') + 20, 'ac', 0.32), s(M('s05', 'pasar'), 'hit', 0.36), s(M('s05', 'mismo'), 'draw', 0.26), s(M('s05', 'tuya'), 'rise', 0.28));

	// 05 · un mapa vivo
	cut('cambios');
	add(s(M('s06', 'definitivo') + 4, 'land', 0.4), s(M('s06', 'ajustar'), 'unstack', 0.28), s(M('s06', 'ajustar') + 6, 'stack', 0.26), s(M('s06', 'mejor'), 'ac', 0.3));

	// cierre
	cut('final');
	const logoAt = M('s07', 'gusta') - 30;
	add(s(M('s07', 'mapa'), 'pop', 0.28), s(logoAt - 4, 'glitch', 0.24), s(logoAt + 4, 'hit', 0.5), s(M('s07', 'unete'), 'pop', 0.3), s(M('s07', 'unete') + 10, 'whoosh', 0.22));
	return out.filter((x) => x.at >= 0).sort((a, b) => a.at - b.at);
};

export const SFX = buildSfx();
