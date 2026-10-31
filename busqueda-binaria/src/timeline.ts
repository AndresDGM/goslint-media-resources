import narration from './narration.json';
import {BAR, BEAT, FPS} from './theme';

/**
 * Línea de tiempo derivada de la narración real (src/narration.json, generado por
 * scripts/import_vo.py). Nada está escrito a mano en fotogramas absolutos: las escenas duran lo
 * que su locución más un respiro, los capítulos empiezan en compás (60 f a 120 BPM) y cada frase
 * en tiempo (15 f). Las animaciones se escriben contra `M('s07', 'zas1')`, etc.
 */

export type SegId = 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07' | 's08' | 's09' | 's10' | 's11' | 's12' | 's13' | 's14' | 's15';
type Seg = {file: string | null; seconds: number; missing: boolean; cues: {t0: number; t1: number; text: string}[]; marks: Record<string, number>; env: string};
const NAR = narration as unknown as Record<SegId, Seg>;

export type SceneId = 'intro' | 'lineal' | 'idea' | 'machete' | 'orden' | 'demo' | 'complejidad' | 'iterativa' | 'recursiva' | 'usos' | 'cierre';

/** Plan de montaje: qué segmentos lleva cada escena, con su respiro previo (pre) y posterior (post) en fotogramas. */
const PLAN: {scene: SceneId; segs: {id: SegId; pre: number; post: number}[]}[] = [
	{scene: 'intro', segs: [{id: 's01', pre: 232, post: 16}]},
	{scene: 'lineal', segs: [{id: 's02', pre: 30, post: 24}]},
	{scene: 'idea', segs: [{id: 's03', pre: 24, post: 30}]},
	{scene: 'machete', segs: [{id: 's04', pre: 36, post: 50}, {id: 's05', pre: 0, post: 70}]},
	{scene: 'orden', segs: [{id: 's06', pre: 50, post: 40}]},
	{scene: 'demo', segs: [{id: 's07', pre: 50, post: 70}, {id: 's08', pre: 0, post: 70}]},
	{scene: 'complejidad', segs: [{id: 's09', pre: 50, post: 30}, {id: 's10', pre: 0, post: 50}]},
	{scene: 'iterativa', segs: [{id: 's11', pre: 60, post: 150}]},
	{scene: 'recursiva', segs: [{id: 's12', pre: 60, post: 60}, {id: 's13', pre: 0, post: 50}]},
	{scene: 'usos', segs: [{id: 's14', pre: 50, post: 50}]},
	{scene: 'cierre', segs: [{id: 's15', pre: 50, post: 250}]},
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
export const DURATION = SC.cierre[1];
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
	{scene: 'lineal', n: '01', label: 'el problema'},
	{scene: 'idea', n: '02', label: 'la idea'},
	{scene: 'machete', n: '03', label: 'dividir y machetear'},
	{scene: 'orden', n: '04', label: 'datos ordenados'},
	{scene: 'demo', n: '05', label: 'paso a paso'},
	{scene: 'complejidad', n: '06', label: 'complejidad'},
	{scene: 'iterativa', n: '07', label: 'java iterativo'},
	{scene: 'recursiva', n: '08', label: 'java recursivo'},
	{scene: 'usos', n: '09', label: 'en la práctica'},
	{scene: 'cierre', n: '10', label: 'repaso'},
];
