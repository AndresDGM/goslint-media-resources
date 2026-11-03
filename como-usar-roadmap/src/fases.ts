import data from './fases.json';
import type {MascotaId} from '@commons/mascotas';

/** Fases del roadmap, leídas del temario (../roadmap/temario_canal_goslint.md → src/fases.json). */
export type Fase = {n: number; name: string; sub: string; langs: string; videos: {n: string; t: string; hito: boolean}[]};
export const FASES = data as Fase[];

/** Guías de cada fase (decisión del usuario). Lint presenta y guía la fase 0 y la 3. */
export const GUIAS: Record<number, (MascotaId | 'lint')[]> = {
	0: ['lint'],
	1: ['vee'],
	2: ['parserint', 'mocca', 'pypo', 'byte'],
	3: ['lint', 'polo', 'mocca'],
	4: ['marco', 'ringo'],
	5: ['velasco'],
	6: ['daru'],
	7: ['diego', 'globin'],
};

export const rango = (fa: Fase) => `#${fa.videos[0].n} – #${fa.videos[fa.videos.length - 1].n}`;
export const hitoDe = (fa: Fase) => fa.videos.find((v) => v.hito);
