import {SYNC, type Cue} from '../timeline';
import type {Sfx} from '../AudioLayer';

/** Instagram Reel cut: 1080 × 1920, 30 fps, 45 s (90 beats of 120 BPM). */
export const RW = 1080;
export const RH = 1920;
export const DURATION_REEL = 1350;

/**
 * Areas Instagram covers with its own interface. Nothing essential goes above `top`,
 * below `RH - bottom`, or (in the lower half) right of `RW - right`.
 */
export const SAFE = {top: 250, bottom: 440, side: 60, right: 150};

/** Scene boundaries (frames). Every one lands on a beat (15 f) of scripts/make_music_reel.py. */
export const R = {
	hook: [0, 120],
	logo: [120, 204],
	problem: [204, 285],
	training: [285, 480],
	compete: [480, 720],
	team: [705, 945],
	judge: [945, 1080],
	cta: [1080, 1230],
	final: [1230, 1350],
} as const;

/**
 * Narration for the Reel. Same recordings as the 16:9 video, minus two lines
 * (l02 «Y un reloj que no se detiene» and l12 «Tu primer problema ya te está esperando»).
 */
export const CUES_REEL: Cue[] = [
	{id: 'l01', from: 8, caption: 'Cinco horas. Tres personas. Un solo computador.'},
	{id: 'l03', from: 134, caption: 'Esto es Goslint.'},
	{id: 'l04', from: 190, caption: 'El semillero de Ingeniería de Sistemas de la UCEVA.'},
	{id: 'l05', from: 290, caption: 'Aquí entrenamos algoritmos y estructuras de datos, problema tras problema, en C++, Python y Java.'},
	{id: 'l06', from: 484, caption: 'Organizamos maratones internas.'},
	{id: 'l07', from: 556, caption: 'Y salimos a competir: en Pereira, en Cali y en Bogotá, en la Regional del ICPC.'},
	{id: 'l08', from: 711, caption: 'Pero lo más valioso no está en el código.'},
	{id: 'l09', from: 791, caption: 'Está en pensar en equipo, equivocarse juntos y celebrar cada problema resuelto.'},
	{id: 'l10', from: 951, caption: 'También investigamos, y estamos construyendo nuestro propio juez en línea.'},
	{id: 'l11', from: 1088, caption: 'No necesitas experiencia previa. Solo curiosidad y ganas de practicar.'},
	{id: 'l13', from: 1240, caption: 'Ven, únete a Goslint.'},
];

/**
 * How far each narration line moved from the 16:9 timeline (original frame − Reel frame).
 * A scene wrapped in <Shift by={OFF.l05}> sees the original frame numbers, so it can reuse
 * the original components and the word-level SYNC table untouched.
 */
export const OFF = {
	l01: SYNC.horas - 8,
	l05: 470 - 290,
	l07: SYNC.competir - 556,
	l08: SYNC.codigo - 711,
	l09: SYNC.equipo - 791,
	l10: SYNC.investigamos - 951,
	l11: SYNC.experiencia - 1088,
	l13: SYNC.unete - 1240,
} as const;

/** Word-level sync points in Reel frames. */
export const T = {
	horas: SYNC.horas - OFF.l01,
	personas: SYNC.personas - OFF.l01,
	computador: SYNC.computador - OFF.l01,
	goslint: 154,
	estructuras: SYNC.estructuras - OFF.l05,
	problemaTras: SYNC.problemaTras - OFF.l05,
	cpp: SYNC.cpp - OFF.l05,
	python: SYNC.python - OFF.l05,
	java: SYNC.java - OFF.l05,
	internas: 484,
	competir: SYNC.competir - OFF.l07,
	pereira: SYNC.pereira - OFF.l07,
	cali: SYNC.cali - OFF.l07,
	bogota: SYNC.bogota - OFF.l07,
	icpc: SYNC.icpc - OFF.l07,
	nuestroEquipo: 686,
	codigo: SYNC.codigo - OFF.l08,
	equipo: SYNC.equipo - OFF.l09,
	equivocarse: SYNC.equivocarse - OFF.l09,
	celebrar: SYNC.celebrar - OFF.l09,
	investigamos: SYNC.investigamos - OFF.l10,
	construyendo: SYNC.construyendo - OFF.l10,
	juez: SYNC.juez - OFF.l10,
	experiencia: SYNC.experiencia - OFF.l11,
	curiosidad: SYNC.curiosidad - OFF.l11,
	ganas: SYNC.ganas - OFF.l11,
	unete: SYNC.unete - OFF.l13,
};

/**
 * On-screen captions, split into short phrases that follow the voice.
 * Lines whose words are already on screen as the scene's headline (the hook slams,
 * «Organizamos maratones internas», the team chapter, the requirements, the final call)
 * are not repeated here.
 */
export const CAPTIONS: {from: number; to: number; text: string}[] = [
	{from: 134, to: 180, text: 'Esto es Goslint.'},
	{from: 190, to: 282, text: 'El semillero de Ingeniería de Sistemas de la UCEVA.'},
	{from: 290, to: T.estructuras - 2, text: 'Aquí entrenamos algoritmos'},
	{from: T.estructuras - 2, to: T.problemaTras - 2, text: 'y estructuras de datos,'},
	{from: T.problemaTras - 2, to: T.cpp - 8, text: 'problema tras problema,'},
	{from: T.cpp - 8, to: 476, text: 'en C++, Python y Java.'},
	{from: T.pereira - 6, to: T.cali - 4, text: 'en Pereira,'},
	{from: T.cali - 4, to: T.bogota - 6, text: 'en Cali'},
	{from: T.bogota - 6, to: T.icpc - 4, text: 'y en Bogotá,'},
	{from: T.icpc - 4, to: 707, text: 'en la Regional del ICPC.'},
	{from: T.investigamos, to: T.construyendo - 2, text: 'También investigamos,'},
	{from: T.construyendo - 2, to: 1022, text: 'y estamos construyendo'},
	{from: 1022, to: 1080, text: 'nuestro propio juez en línea.'},
];

/** Contest clock: starts at 05:00:00, runs in real time for 2 s, then races. The HUD keeps it running. */
export const reelClockSeconds = (f: number) => {
	const t = f / 30;
	if (t < 2) return 5 * 3600 - t;
	const u = t - 2;
	const fast = u < 2 ? u + Math.pow(u, 4) * 28 : 2 + 16 * 28 + (u - 2) * 4;
	return 5 * 3600 - 2 - fast;
};

/** Sound-design cue sheet for the Reel (frame, sound, volume). Same sounds as the 16:9 mix. */
export const SFX_REEL: Sfx[] = [
	{at: 0, file: 'typing', vol: 0.4, dur: 30},
	{at: T.horas, file: 'hit', vol: 0.32},
	{at: T.personas, file: 'hit', vol: 0.32},
	{at: T.computador, file: 'hit', vol: 0.36},
	{at: 98, file: 'glitch', vol: 0.3},
	{at: 106, file: 'glitch', vol: 0.36},
	{at: 113, file: 'glitch', vol: 0.42},
	{at: T.goslint, file: 'glitch', vol: 0.28},
	{at: 194, file: 'whoosh', vol: 0.45},
	{at: 214, file: 'typing', vol: 0.28, dur: 44},
	...[0, 1, 2, 3, 4].map((l) => ({at: 478 - OFF.l05 + l * 15, file: 'blip', vol: 0.22})),
	...[0, 4, 8, 12, 16, 20].map((d) => ({at: T.problemaTras + 2 + d, file: 'key', vol: 0.3})),
	{at: T.cpp, file: 'ac', vol: 0.3},
	{at: T.python, file: 'ac', vol: 0.3},
	{at: T.java, file: 'ac', vol: 0.34},
	{at: 466, file: 'whoosh', vol: 0.5},
	{at: 480, file: 'flash', vol: 0.4},
	{at: 502, file: 'flash', vol: 0.4},
	{at: 524, file: 'flash', vol: 0.4},
	{at: 540, file: 'whoosh', vol: 0.45},
	{at: T.pereira, file: 'flash', vol: 0.36},
	{at: T.cali, file: 'flash', vol: 0.36},
	{at: T.bogota, file: 'flash', vol: 0.36},
	{at: T.icpc - 2, file: 'glitch', vol: 0.3},
	{at: T.nuestroEquipo, file: 'flash', vol: 0.36},
	{at: 708, file: 'whoosh', vol: 0.3},
	...[3, 11, 19, 27].map((d) => ({at: T.equivocarse + d, file: 'wa', vol: 0.3})),
	{at: T.celebrar + 16, file: 'ac', vol: 0.5},
	...[0, 4, 8, 12].map((d) => ({at: 945 + d, file: 'blip', vol: 0.22})),
	{at: T.construyendo + 2, file: 'whoosh', vol: 0.4},
	...[0, 1, 2, 3, 4].map((i) => ({at: 999 + i * 12, file: 'blip', vol: 0.24})),
	{at: 1055, file: 'ac', vol: 0.4},
	{at: 1064, file: 'glitch', vol: 0.3},
	{at: 1072, file: 'glitch', vol: 0.4},
	{at: 1079, file: 'enter', vol: 0.5},
	{at: T.experiencia + 4, file: 'typing', vol: 0.25, dur: 14},
	{at: T.experiencia + 34, file: 'wa', vol: 0.22},
	{at: T.curiosidad, file: 'typing', vol: 0.25, dur: 12},
	{at: T.ganas, file: 'typing', vol: 0.25, dur: 14},
	{at: 1220, file: 'whoosh', vol: 0.35},
	{at: T.unete + 16, file: 'enter', vol: 0.4},
];
