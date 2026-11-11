import {BEAT, FPS} from '@commons/theme';
import guion from '../scripts/guion.json';
import narration from './narration.json';

/**
 * Línea de tiempo del video «¿Qué es un algoritmo?», derivada de la voz real de Vee.
 *
 * - scripts/guion.json: el orden de las locuciones, la pausa de acción después de cada una (`gap`)
 *   y la velocidad de la voz (`rate`).
 * - src/narration.json (lo genera scripts/build_vo.py): duración útil de cada toma, marcas por
 *   palabra y niveles de voz.
 *
 * Las escenas se escriben SIEMPRE contra estas marcas: `at('V12')` (inicio de la locución),
 * `at('V12', 'taza')` (fotograma en que dice «taza»), `end('V12')` y `after('V12', 0.5)`.
 * Nunca contra números de fotograma sueltos: si cambia una toma, una pausa o la velocidad,
 * todo se recoloca solo. Los tiempos en m:ss están en scripts/marcas.txt.
 */

type Linea = {id: string; b: BlockId; gap: number; tts: string; sub: string};
type Toma = {file: string; dur: number; t0: number; t1: number; words: [string, number, number][]; levels: string; gain: number};
export type BlockId = 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'b7';
export type VoId = string;

const G = guion as unknown as {rate: number; lead: Record<BlockId, number>; lineas: Linea[]};
const NAR = narration as unknown as Record<string, Toma>;
/** Velocidad de reproducción de la voz (1 = como salió de ElevenLabs). */
export const RATE = G.rate;
export const LINES = G.lineas;

/** Segundos → fotogramas. */
export const sec = (s: number) => Math.round(s * FPS);

/** Ventana de cada locución en fotogramas, y datos para montar el audio. */
export const VO: Record<VoId, {start: number; end: number; file: string; from: number; gain: number; block: BlockId}> = {};
/** Rango [inicio, fin) de cada bloque en fotogramas. */
export const BLOCKS = {} as Record<BlockId, [number, number]>;
{
	let cursor = 0; // segundos
	let block: BlockId | null = null;
	for (const ln of LINES) {
		const tk = NAR[ln.id];
		if (!tk) throw new Error(`Falta la toma ${ln.id} en src/narration.json: ejecuta python3 scripts/build_vo.py`);
		if (ln.b !== block) {
			if (block) {
				cursor = (Math.ceil(sec(cursor) / BEAT) * BEAT) / FPS; // cada bloque empieza en tiempo de la música (15 f)
				BLOCKS[block][1] = sec(cursor);
			}
			block = ln.b;
			BLOCKS[block] = [sec(cursor), 0];
			cursor += G.lead[block];
		}
		const d = (tk.t1 - tk.t0) / RATE;
		VO[ln.id] = {start: sec(cursor), end: sec(cursor + d), file: tk.file, from: sec(tk.t0), gain: tk.gain, block: ln.b};
		cursor += d + ln.gap;
	}
	BLOCKS[block!][1] = sec(cursor);
}
export const DURATION = BLOCKS.b7[1];

const norm = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]/g, '');

/**
 * Fotograma absoluto de una locución o de una palabra suya.
 *   at('V12')              inicio de V12
 *   at('V12', 'taza')      cuando empieza a decir «taza» (sin distinguir mayúsculas, tildes ni puntuación)
 *   at('V12', 'no', 2)     la segunda vez que dice «no» en esa línea
 * Lanza un error si la palabra no está en la toma (mira scripts/marcas.txt).
 */
export const at = (id: VoId, word?: string, nth = 1): number => {
	const v = VO[id];
	if (!v) throw new Error(`Locución desconocida: ${id}`);
	if (!word) return v.start;
	const tk = NAR[id];
	const key = norm(word);
	let k = 0;
	for (const [w, a] of tk.words) {
		if (norm(w) === key && ++k === nth) return v.start + sec(Math.max(0, a - tk.t0) / RATE);
	}
	throw new Error(`«${word}» (n.º ${nth}) no está en ${id}: ${tk.words.map((w) => w[0]).join(' ')}`);
};
/** Fotograma en que termina la locución. */
export const end = (id: VoId): number => VO[id].end;
/** Fotograma `s` segundos después del final de la locución (para las pausas de acción). */
export const after = (id: VoId, s = 0): number => VO[id].end + sec(s);
/** Fotograma `s` segundos antes del inicio de la locución. */
export const before = (id: VoId, s = 0): number => VO[id].start - sec(s);

const IDS = LINES.map((l) => l.id);
/** Locución activa en el fotograma f (o null). */
export const lineAt = (f: number): VoId | null => {
	for (const id of IDS) if (f >= VO[id].start && f < VO[id].end) return id;
	return null;
};
/** ¿Está hablando Vee en el fotograma f? */
export const speaking = (f: number): boolean => lineAt(f) !== null;
/** Nivel de voz 0–3 medido de la toma (mueve la boca de Vee). */
export const talkLevel = (f: number): number => {
	const id = lineAt(f);
	if (!id) return 0;
	return Number(NAR[id].levels[f - VO[id].start] ?? 0);
};

/* ------------------------------------------------------------------ subtítulos */

export type Cue = {from: number; to: number; text: string};
/** Subtítulos: el texto de cada locución partido en frases cortas, con los tiempos de sus palabras. */
export const CUES: Cue[] = LINES.flatMap((ln) => {
	const v = VO[ln.id];
	const tk = NAR[ln.id];
	const tokens = ln.sub.split(/\s+/);
	// tiempo de cada palabra del subtítulo: el de la palabra reconocida en la misma posición (o reparto uniforme)
	const tAt = (i: number) => {
		if (tk.words.length === tokens.length) return v.start + sec(Math.max(0, tk.words[i][1] - tk.t0) / RATE);
		return v.start + Math.round(((v.end - v.start) * i) / tokens.length);
	};
	// frases de ≤ ~44 caracteres, de largo parecido, cortando de preferencia tras un signo de puntuación
	const total = ln.sub.length;
	const n = Math.max(1, Math.ceil(total / 44));
	const target = total / n;
	const cues: Cue[] = [];
	let from = 0;
	let chars = 0;
	for (let i = 0; i < tokens.length; i++) {
		chars += tokens[i].length + 1;
		const last = i === tokens.length - 1;
		const punct = /[.,;:!?…»]$/.test(tokens[i]);
		const nextLen = last ? 0 : tokens[i + 1].length + 1;
		const breakHere = last || (punct && chars >= target * 0.6) || chars + nextLen > target + 8;
		if (breakHere) {
			cues.push({from: tAt(from), to: last ? v.end + 6 : tAt(i + 1), text: tokens.slice(from, i + 1).join(' ')});
			from = i + 1;
			chars = 0;
		}
	}
	return cues;
});

/* ------------------------------------------------------------------ capítulos (HUD) */

export const CHAPTERS: {b: BlockId; label: string}[] = [
	{b: 'b1', label: 'El robot literal'},
	{b: 'b2', label: 'La definición'},
	{b: 'b3', label: 'En tu día a día'},
	{b: 'b4', label: 'Intento 1'},
	{b: 'b5', label: 'Intento 2'},
	{b: 'b6', label: 'La computadora'},
	{b: 'b7', label: 'Tu turno'},
];
