/** Efecto de sonido: fotograma absoluto, archivo de commons/public/audio/sfx (sin .wav), volumen 0–1. */
export type Sfx = {at: number; file: string; vol: number; dur?: number};
export const s = (at: number, file: string, vol = 0.3, dur?: number): Sfx => ({at: Math.round(at), file, vol, dur});
/** Archivos disponibles en commons/public/audio/sfx. */
export const SFX_FILES = ['ac', 'blip', 'boing', 'chop', 'debris', 'draw', 'enter', 'flash', 'glitch', 'hit', 'key', 'land', 'no', 'pop', 'rise', 'riser', 'slash', 'slide', 'stack', 'ticks', 'typing', 'unstack', 'wa', 'whoosh'] as const;
