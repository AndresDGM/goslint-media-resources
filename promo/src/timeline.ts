import vo from './vo-manifest.json';
import {FPS} from './theme';

/** Total length: 35 bars of 120 BPM = 70 s */
export const DURATION = 2100;

/** Scene boundaries (frames). All land on the musical grid (15 f per beat). */
export const S = {
	cold: [0, 240],
	logo: [240, 360],
	problem: [360, 450],
	training: [450, 660],
	compete: [660, 1140],
	team: [1140, 1440],
	judge: [1440, 1680],
	cta: [1680, 2100],
} as const;

type VoId = keyof typeof vo;

export type Cue = {id: VoId; from: number; caption: string};

/** Narration cues: start frame + on-screen subtitle (correct spelling, not the TTS respelling). */
export const CUES: Cue[] = [
	{id: 'l01', from: 24, caption: 'Cinco horas. Tres personas. Un solo computador.'},
	{id: 'l02', from: 132, caption: 'Y un reloj que no se detiene.'},
	{id: 'l03', from: 262, caption: 'Esto es Goslint.'},
	{id: 'l04', from: 372, caption: 'El semillero de Ingeniería de Sistemas de la UCEVA.'},
	{id: 'l05', from: 470, caption: 'Aquí entrenamos algoritmos y estructuras de datos, problema tras problema, en C++, Python y Java.'},
	{id: 'l06', from: 672, caption: 'Organizamos maratones internas.'},
	{id: 'l07', from: 822, caption: 'Y salimos a competir: en Pereira, en Cali y en Bogotá, en la Regional del ICPC.'},
	{id: 'l08', from: 1150, caption: 'Pero lo más valioso no está en el código.'},
	{id: 'l09', from: 1236, caption: 'Está en pensar en equipo, equivocarse juntos y celebrar cada problema resuelto.'},
	{id: 'l10', from: 1452, caption: 'También investigamos, y estamos construyendo nuestro propio juez en línea.'},
	{id: 'l11', from: 1692, caption: 'No necesitas experiencia previa. Solo curiosidad y ganas de practicar.'},
	{id: 'l12', from: 1840, caption: 'Tu primer problema ya te está esperando.'},
	{id: 'l13', from: 1936, caption: 'Ven, únete a Goslint.'},
];

export const voFrames = (id: VoId) => Math.ceil((vo[id].seconds as number) * FPS);
export const voFile = (id: VoId) => vo[id].file as string;

/** Word-level sync points measured from pauses in the narration audio. */
export const SYNC = {
	horas: 24,
	personas: 48,
	computador: 76,
	reloj: 132,
	estructuras: 523,
	problemaTras: 554,
	cpp: 592,
	python: 623,
	java: 639,
	internas: 672,
	competir: 822,
	pereira: 863,
	cali: 886,
	bogota: 912,
	icpc: 933,
	codigo: 1150,
	equipo: 1236,
	equivocarse: 1283,
	celebrar: 1319,
	investigamos: 1452,
	construyendo: 1490,
	juez: 1552,
	experiencia: 1692,
	curiosidad: 1756,
	ganas: 1787,
	esperando: 1840,
	unete: 1936,
};
