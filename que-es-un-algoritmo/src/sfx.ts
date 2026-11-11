/** Efecto de sonido: fotograma absoluto, archivo de commons/public/audio/sfx (sin .wav), volumen 0–1. */
export type Sfx = {at: number; file: SfxFile; vol: number; dur?: number};
/** Archivos disponibles (sintetizados por commons/scripts/make_sfx.py). */
export type SfxFile =
	// sistema v1
	| 'ac' | 'blip' | 'boing' | 'chop' | 'debris' | 'draw' | 'enter' | 'flash' | 'glitch' | 'hit' | 'key' | 'land' | 'no' | 'pop'
	| 'rise' | 'riser' | 'slash' | 'slide' | 'stack' | 'ticks' | 'typing' | 'unstack' | 'wa' | 'whoosh'
	// cocina y robot
	| 'clap' | 'splash' | 'pour' | 'whistle' | 'rewind' | 'fanfare' | 'stir' | 'plop' | 'sparkle' | 'servo' | 'check' | 'wobble';
export const s = (at: number, file: SfxFile, vol = 0.3, dur?: number): Sfx => ({at: Math.round(at), file, vol, dur});
