import {FPS} from '../theme';
import type {Sfx} from '../AudioLayer';
import {RH, RW, SAFE, reelClockSeconds} from '../reel/timeline';
import words from './narration-words.json';

export {RH, RW, SAFE};

/**
 * Instagram Reel, second cut: 1080 × 1920, 30 fps, 50 s (100 beats of 120 BPM).
 * The edit follows one narration file, played from frame 0 and never cut, stretched or re-timed.
 */
export const NARRATION = 'audio/vo/audio.mp3';
export const MUSIC_V2 = 'audio/music-reel-v2.wav';
export const DURATION_V2 = 1500;

/* ------------------------------------------------------------------ narration */

/** Every spoken word with its frames, from the forced alignment of scripts/align_narration.py. */
export const WORDS = words.map((w) => ({text: w.word, from: Math.round(w.start * FPS), to: Math.round(w.end * FPS)}));

const plain = (s: string) => s.toLowerCase().replace(/[.,]/g, '');

/** Frame at which the voice starts the `nth` occurrence of `word` (`back` = that many words earlier). */
const at = (word: string, nth = 1, back = 0) => {
	const hits = WORDS.map((w, i) => (plain(w.text) === word ? i : -1)).filter((i) => i >= 0);
	if (hits.length < nth) throw new Error(`narration: «${word}» #${nth} not found`);
	return WORDS[hits[nth - 1] - back].from;
};

/** Word-level sync points (frames). */
export const T = {
	cinco: at('cinco'),
	tres: at('tres'),
	unSolo: at('solo', 1, 1),
	yUnReloj: at('reloj', 1, 2),
	esto: at('esto'),
	goslint: at('goslint'),
	elSemillero: at('semillero', 1, 1),
	aqui: at('aquí'),
	disenar: at('diseñar'),
	algoritmos: at('algoritmos'),
	estructuras: at('estructuras'),
	yResolver: at('resolver', 1, 1),
	resolver: at('resolver'),
	usando: at('usando'),
	cpp: at('c++'),
	python: at('python'),
	java: at('java'),
	organizamos: at('organizamos'),
	nuestras: at('nuestras'),
	propias: at('propias'),
	maratones: at('maratones'),
	ySalimos: at('salimos', 1, 1),
	competir: at('competir'),
	pereira: at('pereira'),
	cali: at('cali'),
	bogota: at('bogotá'),
	laRegional: at('regional', 1, 1),
	icpc: at('icpc'),
	pero: at('pero'),
	noEsta: at('está', 1, 1),
	codigo: at('código'),
	estaEn: at('está', 2),
	pensar: at('pensar'),
	equipo: at('equipo'),
	equivocarnos: at('equivocarnos'),
	juntos: at('juntos'),
	yCelebrar: at('celebrar', 1, 1),
	problemaResuelto: at('resuelto', 1, 1),
	resuelto: at('resuelto'),
	tambien: at('también'),
	investigamos: at('investigamos'),
	construimos: at('construimos'),
	juez: at('juez'),
	noNecesitas: at('necesitas', 1, 1),
	soloCuriosidad: at('curiosidad', 1, 1),
	yGanas: at('ganas', 1, 1),
	tu: at('tu'),
	yaTe: at('ya'),
	esperando: at('esperando'),
	ven: at('ven'),
	unete: at('únete'),
};

/** Scene boundaries (frames). The ones that are free to move sit on a beat (15 f) of scripts/make_music_reel_v2.py. */
export const R2 = {
	hook: [0, 180],
	logo: [180, 249],
	problem: [249, 315],
	training: [315, 555],
	compete: [555, 792],
	team: [T.pero - 10, 1050],
	judge: [1050, 1170],
	cta: [1170, 1320],
	example: [T.tu - 5, 1395],
	final: [1395, DURATION_V2],
} as const;

/* ------------------------------------------------------------------ captions */

/**
 * The whole narration, phrase by phrase, in the order it is spoken. Nothing is left out:
 * joined with spaces, these phrases are the transcript of the MP3 (checked below, word by word).
 */
const PHRASES = [
	'Cinco horas,',
	'tres personas,',
	'un solo computador',
	'y un reloj que no se detiene.',
	'Esto es Goslint,',
	'el semillero de Ingeniería',
	'de Sistemas de la UCEVA.',
	'Aquí aprendemos',
	'a diseñar algoritmos,',
	'trabajar con estructuras de datos',
	'y resolver problemas',
	'usando C++,',
	'Python y Java.',
	'Organizamos nuestras',
	'propias maratones',
	'y salimos a competir',
	'en Pereira,',
	'Cali y Bogotá,',
	'en la Regional ICPC.',
	'Pero lo más valioso',
	'no está solo en el código.',
	'Está en pensar en equipo,',
	'equivocarnos juntos',
	'y celebrar cada',
	'problema resuelto.',
	'También investigamos',
	'y construimos',
	'nuestro propio juez en línea.',
	'No necesitas experiencia previa,',
	'solo curiosidad',
	'y ganas de practicar.',
	'Tu primer problema',
	'ya te está esperando.',
	'Ven, únete a Goslint.',
];

/** A caption appears just before its first word and stays a little after its last one… */
const LEAD = 2;
const HOLD = 9;
/** …but never across one of the hard cuts that follow the end of a sentence. */
const HARD_CUTS = [R2.hook[1], R2.judge[1], R2.final[0]];

export type Caption = {from: number; to: number; text: string};

export const CAPTIONS_V2: Caption[] = (() => {
	let i = 0;
	const spans = PHRASES.map((text) => {
		const n = text.split(' ').length;
		const said = WORDS.slice(i, i + n);
		if (said.map((w) => w.text).join(' ') !== text) throw new Error(`captions: «${text}» does not match the narration at word ${i}`);
		i += n;
		return {text, from: said[0].from - LEAD, end: said[n - 1].to};
	});
	if (i !== WORDS.length) throw new Error('captions: part of the narration has no caption');
	return spans.map((s, k) => {
		const next = spans[k + 1]?.from ?? Infinity;
		const cut = HARD_CUTS.find((c) => c > s.end && c < s.end + HOLD) ?? Infinity;
		const to = Math.min(s.end + HOLD, next, cut);
		// no blink between two phrases of the same breath
		return {from: s.from, to: next - to < 6 && cut > next ? next : to, text: s.text};
	});
})();

/** Stretches of continuous speech (pauses under half a second do not split one). The music ducks under these. */
export const SPEECH: [number, number][] = WORDS.reduce<[number, number][]>((acc, w) => {
	const last = acc[acc.length - 1];
	if (last && w.from - last[1] < 15) last[1] = w.to;
	else acc.push([w.from, w.to]);
	return acc;
}, []);

/* ------------------------------------------------------------------ clock */

/** Contest clock: real time while the rules are read out, then it races on «y un reloj que no se detiene». */
export const clockV2 = (f: number) => (f < 60 ? 5 * 3600 - f / 30 : reelClockSeconds(f - 60) - 2);

/* ------------------------------------------------------------------ scene timing shared with the sound design */

/** BFS levels of the training graph light up from here, one every 15 f. */
export const BFS_AT = T.disenar;
/** Verdict of each code pane. */
export const PANE_AT = {cpp: T.cpp + 3, py: T.python, java: T.java};
/** Polaroids of the internal contests. */
export const PILE_AT = [R2.compete[0], T.nuestras + 3, T.propias + 8];
/** Photo cuts of the trips. */
export const CITY_AT = {pereira: T.pereira - 2, cali: T.cali - 1, bogota: T.bogota, regional: T.laRegional, equipo: T.icpc + 2};
/** Wrong answers of «equivocarnos juntos». */
export const LOG_AT = [3, 11, 19, 27].map((d) => T.equivocarnos - 2 + d);
/** The AC stamp of «problema resuelto». */
export const SOLVED_AT = T.resuelto;
/** Stages of the judge pipeline. */
export const STAGE_AT = (i: number) => T.construimos + 16 + i * 9;
export const JUDGE_VERDICT_AT = STAGE_AT(4) + 6;
/** The requirements scene runs on the 16:9 clock of its line (see <Shift>): 16:9 frame − Reel frame. */
export const OFF_CTA = 1684 - R2.cta[0];
/** The poster's example: the output arrives, then the verdict. */
export const EXAMPLE_OUT_AT = T.tu + 13;
export const EXAMPLE_AC_AT = T.esperando;
/** Final lockup: the question, then the call lands on «únete». */
export const FINAL = {f0: R2.final[0], q: R2.final[0] + 5, join: T.unete + 2, foot: T.unete + 34, fade: DURATION_V2 - 18};

/* ------------------------------------------------------------------ sound design */

/** Cue sheet (frame, sound, volume). Same sounds as the other cuts, placed on the new edit. */
export const SFX_V2: Sfx[] = [
	{at: 0, file: 'typing', vol: 0.4, dur: 30},
	{at: T.cinco - 3, file: 'hit', vol: 0.32},
	{at: T.tres - 2, file: 'hit', vol: 0.32},
	{at: T.unSolo - 2, file: 'hit', vol: 0.36},
	{at: 158, file: 'glitch', vol: 0.3},
	{at: 166, file: 'glitch', vol: 0.36},
	{at: 173, file: 'glitch', vol: 0.42},
	{at: T.goslint, file: 'glitch', vol: 0.28},
	{at: R2.logo[1] - 10, file: 'whoosh', vol: 0.45},
	{at: R2.problem[0] + 9, file: 'typing', vol: 0.28, dur: 34},
	...[0, 1, 2, 3, 4].map((l) => ({at: BFS_AT + l * 15, file: 'blip', vol: 0.22})),
	...[0, 4, 8, 12, 16, 20].map((d) => ({at: T.resolver + 2 + d, file: 'key', vol: 0.3})),
	// under the names of the languages: lower than in the other cuts so the words stay clear
	{at: PANE_AT.cpp, file: 'ac', vol: 0.2},
	{at: PANE_AT.py, file: 'ac', vol: 0.2},
	{at: PANE_AT.java, file: 'ac', vol: 0.24},
	{at: R2.training[1] - 14, file: 'whoosh', vol: 0.5},
	...PILE_AT.map((a) => ({at: a, file: 'flash', vol: 0.4})),
	{at: T.ySalimos - 8, file: 'whoosh', vol: 0.45},
	{at: CITY_AT.pereira, file: 'flash', vol: 0.36},
	{at: CITY_AT.cali, file: 'flash', vol: 0.36},
	{at: CITY_AT.bogota, file: 'flash', vol: 0.36},
	{at: CITY_AT.regional - 2, file: 'glitch', vol: 0.3},
	{at: CITY_AT.equipo, file: 'flash', vol: 0.36},
	{at: R2.team[0] + 3, file: 'whoosh', vol: 0.3},
	...LOG_AT.map((a) => ({at: a, file: 'wa', vol: 0.3})),
	{at: SOLVED_AT, file: 'ac', vol: 0.5},
	...[0, 4, 8, 12].map((d) => ({at: R2.judge[0] + d, file: 'blip', vol: 0.22})),
	{at: T.construimos + 2, file: 'whoosh', vol: 0.4},
	...[0, 1, 2, 3, 4].map((i) => ({at: STAGE_AT(i), file: 'blip', vol: 0.24})),
	{at: JUDGE_VERDICT_AT, file: 'ac', vol: 0.4},
	{at: R2.judge[1] - 14, file: 'glitch', vol: 0.3},
	{at: R2.judge[1] - 7, file: 'glitch', vol: 0.4},
	{at: R2.judge[1] - 1, file: 'enter', vol: 0.5},
	{at: T.noNecesitas + 2, file: 'typing', vol: 0.25, dur: 14},
	// quieter than in the 45 s cut: here it falls on the word «previa»
	{at: T.noNecesitas + 32, file: 'wa', vol: 0.1},
	{at: T.soloCuriosidad, file: 'typing', vol: 0.25, dur: 12},
	{at: T.yGanas, file: 'typing', vol: 0.25, dur: 14},
	{at: R2.example[0] - 4, file: 'whoosh', vol: 0.35},
	{at: EXAMPLE_AC_AT, file: 'ac', vol: 0.45},
	{at: FINAL.join, file: 'enter', vol: 0.4},
];
