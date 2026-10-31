import narration from './narration.json';
import {BAR, BEAT, FPS} from './theme';

/**
 * Línea de tiempo derivada de la narración real (src/narration.json, generado por
 * scripts/import_vo.py). Las escenas duran lo que su locución más un respiro, los capítulos
 * empiezan en compás (60 f a 120 BPM) y cada locución en tiempo (15 f). Las animaciones se
 * escriben contra `M('s04', 'wa')`, etc., nunca contra fotogramas sueltos.
 */

export type SegId = 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07' | 's08' | 's09' | 's10';
type Seg = {file: string | null; seconds: number; missing: boolean; cues: {t0: number; t1: number; text: string}[]; marks: Record<string, number>; env: string};
const NAR = narration as unknown as Record<SegId, Seg>;

export type SceneId = 'intro' | 'que' | 'problema' | 'juez' | 'icpc' | 'camino' | 'colombia' | 'uceva' | 'cierre' | 'final';

/** Plan de montaje: segmentos de cada escena con su respiro previo (pre) y posterior (post) en fotogramas. */
const PLAN: {scene: SceneId; segs: {id: SegId; pre: number; post: number}[]}[] = [
	{scene: 'intro', segs: [{id: 's01', pre: 232, post: 24}]},
	{scene: 'que', segs: [{id: 's02', pre: 36, post: 30}]},
	{scene: 'problema', segs: [{id: 's03', pre: 36, post: 40}]},
	{scene: 'juez', segs: [{id: 's04', pre: 30, post: 50}]},
	{scene: 'icpc', segs: [{id: 's05', pre: 40, post: 34}]},
	{scene: 'camino', segs: [{id: 's06', pre: 36, post: 40}]},
	{scene: 'colombia', segs: [{id: 's07', pre: 36, post: 40}]},
	{scene: 'uceva', segs: [{id: 's08', pre: 40, post: 50}]},
	{scene: 'cierre', segs: [{id: 's09', pre: 40, post: 20}]},
	{scene: 'final', segs: [{id: 's10', pre: 50, post: 230}]},
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
			const start = up(t + s.pre, BEAT);
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
		to: i < all.length - 1 ? V[id].start + Math.round(all[i + 1].t0 * FPS) : V[id].start + Math.round(c.t1 * FPS) + 12,
	})),
);

/** Nivel de voz (0–3) en un fotograma: mueve la boca de la mascota. */
export const talkLevel = (f: number): number => {
	for (const id of SEG_IDS) {
		const v = V[id];
		if (f >= v.start && f < v.end) return Number(NAR[id].env[f - v.start] ?? 0);
	}
	return 0;
};

/** Capítulos para el HUD. */
export const CHAPTERS: {scene: SceneId; n: string; label: string}[] = [
	{scene: 'intro', n: '00', label: 'goslint'},
	{scene: 'que', n: '01', label: '¿qué es?'},
	{scene: 'problema', n: '02', label: 'los problemas'},
	{scene: 'juez', n: '03', label: 'jueces en línea'},
	{scene: 'icpc', n: '04', label: 'la icpc'},
	{scene: 'camino', n: '05', label: 'el camino'},
	{scene: 'colombia', n: '06', label: 'en colombia'},
	{scene: 'uceva', n: '07', label: 'en la uceva'},
	{scene: 'cierre', n: '08', label: '¿por qué intentarlo?'},
	{scene: 'final', n: '08', label: '¿por qué intentarlo?'},
];
export const CHAPTER_COUNT = '08';
