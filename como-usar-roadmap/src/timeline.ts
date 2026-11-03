import narration from './narration.json';
import {BAR, BEAT, FPS} from '@commons/theme';

/**
 * Línea de tiempo derivada de la narración real (src/narration.json, de scripts/import_vo.py).
 * Las escenas empiezan en compás (60 f a 120 BPM) y cada locución en tiempo (15 f), salvo en la
 * presentación de las guías, donde las frases cortas se encadenan (`grid: 1`) para no dejar huecos.
 * Las animaciones se escriben contra `M('s03o', 'grafos')`, nunca contra fotogramas sueltos.
 */

export type SegId =
	| 's01' | 's02'
	| 's03a' | 's03b' | 's03c' | 's03d' | 's03e' | 's03f' | 's03g' | 's03h' | 's03i' | 's03j'
	| 's03k' | 's03l' | 's03m' | 's03n' | 's03o' | 's03p' | 's03q' | 's03r' | 's03s' | 's03t'
	| 's04' | 's05' | 's06' | 's07';
type Seg = {file: string | null; seconds: number; missing: boolean; cues: {t0: number; t1: number; text: string}[]; marks: Record<string, number>; env: string};
const NAR = narration as unknown as Record<SegId, Seg>;

export type SceneId = 'intro' | 'mapa' | 'guias' | 'hitos' | 'entrada' | 'cambios' | 'final';

const g = (id: SegId, pre = 8, post = 6) => ({id, pre, post, grid: 1});
/** Plan de montaje: segmentos de cada escena con su respiro previo (pre) y posterior (post) en fotogramas. */
const PLAN: {scene: SceneId; segs: {id: SegId; pre: number; post: number; grid?: number}[]}[] = [
	{scene: 'intro', segs: [{id: 's01', pre: 170, post: 24}]},
	{scene: 'mapa', segs: [{id: 's02', pre: 30, post: 30}]},
	{
		scene: 'guias',
		segs: [
			{id: 's03a', pre: 30, post: 10},
			g('s03b', 12), g('s03c', 14), g('s03d'), g('s03e'), g('s03f'), g('s03g', 4), g('s03h', 14), g('s03i'), g('s03j', 10),
			g('s03k', 16), g('s03l'), g('s03m'), g('s03n', 16), g('s03o', 10), g('s03p', 16), g('s03q'), g('s03r', 16), g('s03s'), {id: 's03t', pre: 6, post: 40, grid: 1},
		],
	},
	{scene: 'hitos', segs: [{id: 's04', pre: 30, post: 36}]},
	{scene: 'entrada', segs: [{id: 's05', pre: 30, post: 36}]},
	{scene: 'cambios', segs: [{id: 's06', pre: 30, post: 30}]},
	{scene: 'final', segs: [{id: 's07', pre: 30, post: 200}]},
];

const up = (f: number, grid: number) => Math.ceil(f / grid) * grid;
export const voFrames = (id: SegId) => Math.ceil(NAR[id].seconds * FPS);

/** Inicio y fin (fotogramas absolutos) de cada locución y de cada escena. */
export const V = {} as Record<SegId, {start: number; end: number}>;
export const SC = {} as Record<SceneId, [number, number]>;
{
	let cursor = 0;
	for (const sc of PLAN) {
		const s0 = up(cursor, BAR);
		let t = s0;
		for (const s of sc.segs) {
			const start = up(t + s.pre, s.grid ?? BEAT);
			const end = start + voFrames(s.id);
			V[s.id] = {start, end};
			t = end + s.post;
		}
		const e = up(t, BAR);
		SC[sc.scene] = [s0, e];
		cursor = e;
	}
}

export const SCENES = PLAN.map((p) => p.scene);
export const DURATION = SC.final[1];
export const SEG_IDS = Object.keys(V) as SegId[];
export const seg = (id: SegId) => NAR[id];

/** Fotograma absoluto en que se pronuncia la palabra marcada `{mark}` del segmento. */
export const M = (id: SegId, mark: string): number => {
	const t = NAR[id].marks[mark];
	if (t === undefined) throw new Error(`Marca desconocida: ${id}.${mark}`);
	return V[id].start + Math.round(t * FPS);
};

export type Cue = {from: number; to: number; text: string; seg: SegId};
/** Subtítulos con tiempos absolutos: cada uno dura hasta que empieza el siguiente del mismo segmento. */
export const CUES: Cue[] = SEG_IDS.flatMap((id) =>
	NAR[id].cues.map((c, i, all) => ({
		seg: id,
		text: c.text,
		from: V[id].start + Math.round(c.t0 * FPS),
		to: i < all.length - 1 ? V[id].start + Math.round(all[i + 1].t0 * FPS) : V[id].start + Math.round(c.t1 * FPS) + 10,
	})),
);

/** Quién habla en cada segmento (scripts/narration.txt, «== id @Mascota»). Lint por defecto. */
export const SPEAKER: Partial<Record<SegId, string>> = {
	s03b: 'vee', s03d: 'parserint', s03e: 'mocca', s03f: 'pypo', s03g: 'byte', s03i: 'polo', s03j: 'mocca',
	s03l: 'marco', s03m: 'ringo', s03o: 'velasco', s03q: 'daru', s03s: 'diego', s03t: 'globin',
};
export const speakerOf = (id: SegId) => SPEAKER[id] ?? 'lint';

/** Nivel de voz (0–3) en un fotograma, solo si habla `who` ('lint' por defecto): mueve la boca o el cuerpo. */
export const talkLevel = (f: number, who = 'lint'): number => {
	for (const id of SEG_IDS) {
		const v = V[id];
		if (f >= v.start && f < v.end) return speakerOf(id) === who ? Number(NAR[id].env[f - v.start] ?? 0) : 0;
	}
	return 0;
};

/** Capítulos para el HUD. */
export const CHAPTERS: {scene: SceneId; n: string; label: string}[] = [
	{scene: 'intro', n: '00', label: 'goslint'},
	{scene: 'mapa', n: '01', label: 'el mapa'},
	{scene: 'guias', n: '02', label: 'fases y guías'},
	{scene: 'hitos', n: '03', label: 'los hitos'},
	{scene: 'entrada', n: '04', label: '¿por dónde entro?'},
	{scene: 'cambios', n: '05', label: 'un mapa vivo'},
	{scene: 'final', n: '05', label: 'un mapa vivo'},
];
export const CHAPTER_COUNT = '05';
