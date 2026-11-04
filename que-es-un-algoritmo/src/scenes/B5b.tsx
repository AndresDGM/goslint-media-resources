import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO} from '@commons/theme';
import {pop} from '@commons/lib';
import {CutFlash, Shockwave} from '@commons/components';
import {t} from '../timeline';
import {s, Sfx} from '../sfx';
import {
	Cam, CamKey, Kitchen, Board, Vee, VeeAct, Robot, RobotPose, RobotFace, Cup, MilkJug, SugarBowl, Spoon, Pour, Counter,
	InstrCard, Line, Tag, Stamp, CornerTag, VHS, ChoiceButton, DetailSlider, FLOOR, TABLE_Y,
} from '../kit';

/* ------------------------------------------------------------------ tiempos */

/** Hitos del bloque (fotogramas absolutos). */
const T = {
	rew: t('4:41'), rewEnd: t('4:43'), no: t('4:44.5'), bS: t('4:46'), skip: t('4:49'), split: t('4:51'),
	especial: t('4:54'), merge: t('4:57'), mergeEnd: t('5:00'), cmp: t('5:30'), shrink: t('5:38'),
};

const ramp = (f: number, a: number, b: number) => Math.max(0, Math.min(1, (f - a) / (b - a)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const range = (a: number, b: number) => Array.from({length: Math.max(0, b - a + 1)}, (_, i) => a + i);

/* ------------------------------------------------------------------ textos */

/** Algoritmo 2 (tarjeta larga). Índices: 6 = SI, 7–9 = bloque SI, 10 = FIN SI. */
const ALGO2: Line[] = [
	{text: 'INICIO'},
	{text: 'Tomar una taza y ponerla sobre la mesa.', indent: 1},
	{text: 'Agregar dos cucharadas de café a la taza.', indent: 1},
	{text: 'Calentar 200 ml de agua en la tetera.', indent: 1},
	{text: 'Verter el agua caliente en la taza.', indent: 1},
	{text: 'Preguntar: "¿Desea agregar azúcar?"', indent: 1},
	{text: 'SI la respuesta es "Sí" ENTONCES', indent: 1},
	{text: 'Preguntar: "¿Cuántas cucharadas de azúcar?"', indent: 2},
	{text: 'Leer cantidad de azúcar.', indent: 2},
	{text: 'Agregar esa cantidad de azúcar a la taza.', indent: 2},
	{text: 'FIN SI', indent: 1},
	{text: 'Agregar 100 ml de leche a la taza.', indent: 1},
	{text: 'Tomar una cuchara.', indent: 1},
	{text: 'Revolver el contenido de la taza.', indent: 1},
	{text: 'Dejar la cuchara sobre la mesa.', indent: 1},
	{text: 'Servir el café.', indent: 1},
	{text: 'FIN'},
];

/** Algoritmo 1 (tarjeta corta, para la comparación). */
const ALGO1: Line[] = [
	{text: 'INICIO'},
	{text: 'Leer cantidad de café', indent: 1},
	{text: 'Leer cantidad de leche', indent: 1},
	{text: 'Mezclar los ingredientes', indent: 1},
	{text: 'Mostrar resultado', indent: 1},
	{text: 'FIN'},
];

/** Estado de la tarjeta del algoritmo 2 (vista a tercio izquierdo). */
const cardState = (f: number): {active: number; done: number[]; dim: number[]} => {
	if (f < T.rewEnd) {
		// rebobinado: los ✓ se borran en orden inverso
		const n = Math.round(9 - 4 * ramp(f, T.rew, T.rewEnd));
		return {active: f < t('4:42') ? 10 : 5, done: range(1, n), dim: []};
	}
	if (f < T.bS) return {active: 5, done: range(1, 4), dim: []};
	if (f < T.skip) return {active: 6, done: range(1, 5), dim: [7, 8, 9]};
	if (f < T.split) return {active: 11, done: [...range(1, 6), 10], dim: []};
	if (f < t('5:04')) return {active: 11, done: range(1, 10), dim: []};
	if (f < t('5:06')) return {active: 12, done: range(1, 11), dim: []};
	if (f < t('5:09')) return {active: 13, done: range(1, 12), dim: []};
	if (f < t('5:20')) return {active: 14, done: range(1, 13), dim: []};
	if (f < t('5:22')) return {active: 15, done: range(1, 14), dim: []};
	if (f < t('5:28')) return {active: 16, done: range(1, 15), dim: []};
	return {active: -1, done: range(0, 16), dim: []};
};

/** Acciones de Vee: [acción, fotograma de inicio]. */
const ACTS: [VeeAct, number][] = [
	['senalar', t('4:43')], ['explicar', t('4:46')], ['especial', T.especial], ['explicar', t('5:11')],
	['celebrar', t('5:18')], ['celebrar', t('5:26')], ['explicar', T.cmp], ['explicar', t('5:41')],
];

/** Vee: en la cocina a x=880; en el partido, al centro; en la comparación, a la derecha. */
const veeX = (f: number) => (f < T.split ? 880 : f < T.mergeEnd ? 960 : f < T.cmp ? 880 : 1650);

/* ------------------------------------------------------------ cocina y robot */

/** Taza: al empezar café negro con azúcar; leche en 4:50 (camino B) y 5:03 (camino A). */
const cupFill = (f: number) => (f >= t('4:50') && f < t('4:51')) || f >= t('5:03') ? 'latte' : 'black';

/** Cuchara: sale del cajón, bate la taza, se deja sobre la mesa. */
const spoonAt = (f: number): {x: number; y: number; rot: number} | null => {
	const P_DRAWER = {x: 1470, y: 700, rot: 0};
	const P_CUP = {x: 1200, y: 560, rot: 0};
	const P_TABLE = {x: 1270, y: 672, rot: 90};
	const mix = (a: typeof P_CUP, b: typeof P_CUP, k: number) => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), rot: lerp(a.rot, b.rot, k)});
	if (f < t('5:04')) return null;
	if (f < t('5:06')) return mix(P_DRAWER, P_CUP, ramp(f, t('5:04'), t('5:06')));
	if (f < t('5:09')) return {x: P_CUP.x, y: P_CUP.y + 6 * Math.sin(f / 3), rot: 25 * Math.sin(f / 3)};
	return mix(P_CUP, P_TABLE, ramp(f, t('5:09'), t('5:10')));
};

/** Pantalla de la escena de cocina: taza, bolsa, jarra, azucarero, cuchara, robot y pasos del algoritmo. */
const KitchenScene: React.FC = () => {
	const f = useCurrentFrame();
	if (f >= T.cmp) return null;
	const pouring = (f >= t('4:49.5') && f < T.split) || (f >= t('5:02') && f < t('5:04'));
	const cupK = ramp(f, t('5:22'), t('5:24'));
	const cupLeft = lerp(1148, 938, cupK);
	const cupTop = lerp(620, 600, cupK);
	const sugarX = lerp(1520, 1700, ramp(f, T.bS, t('4:48.5')));
	const swirlA = t('5:06');
	const counter = f >= t('5:08.5') ? 3 : f >= t('5:07.5') ? 2 : f >= t('5:06.5') ? 1 : 0;
	const counterAt = [0, t('5:06.5'), t('5:07.5'), t('5:08.5')][counter];
	const sp = spoonAt(f);
	const pose = (): {pose: RobotPose; face: RobotFace; chest?: string; y: number} => {
		let y = FLOOR;
		if (f < t('4:46')) return {pose: 'idle', face: 'conf', chest: '?', y};
		if (f < t('4:49')) return {pose: 'wave', face: 'happy', y};
		if (f < T.split) return {pose: 'reach', face: 'focus', y};
		if (f < t('5:02')) return {pose: 'idle', face: 'focus', y};
		if (f < t('5:06')) return {pose: 'reach', face: 'focus', y};
		if (f < t('5:09')) return {pose: 'stir', face: 'focus', y};
		if (f < t('5:10')) return {pose: 'reach', face: 'focus', y};
		if (f < t('5:22')) return {pose: 'idle', face: 'happy', y};
		if (f < t('5:24')) return {pose: 'bow', face: 'happy', chest: '✓', y};
		if (f < t('5:26')) return {pose: 'idle', face: 'happy', chest: '✓', y};
		if (f < t('5:28')) {
			y = FLOOR - 80 * Math.abs(Math.sin((f - t('5:26')) / 6));
			return {pose: 'trophy', face: 'happy', chest: '^_^', y};
		}
		return {pose: 'thumb', face: 'proud', chest: '✓', y};
	};
	const rp = pose();
	return (
		<>
			{/* la mesa: azucarero, jarra, cajón */}
			<div style={{position: 'absolute', left: sugarX - 40, top: TABLE_Y - 64}}><SugarBowl /></div>
			{!pouring && <div style={{position: 'absolute', left: 1060, top: TABLE_Y - 96}}><MilkJug /></div>}
			<div style={{position: 'absolute', left: 1420, top: TABLE_Y + 28, width: 110, height: 36, background: '#5B4030', boxShadow: 'inset 0 -4px 0 #3E2C21'}}>
				<div style={{position: 'absolute', left: 44, top: 12, width: 22, height: 6, background: '#B9C3BE'}} />
				{f >= t('5:04') && f < t('5:05.5') && <div style={{position: 'absolute', left: -6, top: -6, width: 122, height: 48, background: 'rgba(255,255,255,0.12)'}} />}
			</div>
			{/* sacudida de sugar al revés (rebobinado) */}
			{f < t('4:43.5') && range(0, 5).map((i) => {
				const p = ramp(f, T.rew + i * 4, T.rew + i * 4 + 30);
				return <div key={i} style={{position: 'absolute', left: lerp(1200, 1520, p), top: 650 - 60 * Math.sin(p * Math.PI), width: 12, height: 12, background: '#FFFFFF'}} />;
			})}
			{/* taza */}
			<div style={{position: 'absolute', left: cupLeft, top: cupTop}}>
				<Cup fill={cupFill(f)} steam={f >= t('5:24')} />
			</div>
			{/* leche: jarra suspendida y chorro */}
			{pouring && <div style={{position: 'absolute', left: 1140, top: 470}}><MilkJug tip={-35} /></div>}
			<Pour x={1180} y0={566} y1={618} w={10} color="#F4F7F5" on={pouring} />
			{/* cuchara */}
			{sp && (
				<div style={{position: 'absolute', left: sp.x - 12, top: sp.y - 44, transform: `rotate(${sp.rot}deg)`}}>
					<Spoon load={sp.y < 600 ? 'coffee' : undefined} />
				</div>
			)}
			{f >= t('5:06') && f < t('5:09') && (
				<div style={{position: 'absolute', left: 1140, top: 618, width: 120, height: 30, borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.45)', transform: `rotate(${(f - swirlA) * 5}deg)`}} />
			)}
			{counter > 0 && <Counter x={1300} y={560} value={counter} at={counterAt} size={56} />}
			{/* robot */}
			<Robot x={1330} y={rp.y} flip pose={rp.pose} face={rp.face} chest={rp.chest} />
			{/* flecha que rodea el bloque SI (camino B) */}
			{f >= t('4:46') && f < t('4:49') && (
				<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
					<path d="M 728 300 C 800 300, 800 470, 728 470" fill="none" stroke={C.blue} strokeWidth={6}
						strokeDasharray={320} strokeDashoffset={(1 - ramp(f, t('4:46'), t('4:46.8'))) * 320} />
					<polygon points="712,470 732,456 732,484" fill={C.blue} opacity={ramp(f, t('4:46.6'), t('4:46.9'))} />
				</svg>
			)}
		</>
	);
};

/* ------------------------------------------------------------ tarjeta única */

const SingleCard: React.FC = () => {
	const f = useCurrentFrame();
	if (f >= T.cmp || (f >= T.split && f < T.mergeEnd)) return null;
	const st = cardState(f);
	return (
		<InstrCard x={30} y={60} w={680} lines={ALGO2} size={20} active={st.active} done={st.done} dim={st.dim}
			blockHl={[6, 10]} title="algoritmo2.txt" />
	);
};

/* ------------------------------------------------------------ partido A / B */

/** Rombo «¡Decisión!» de Vee entre las dos mitades. */
const Decision: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.especial || f >= T.merge) return null;
	const p = ramp(f, T.especial + 6, T.especial + 40);
	const pp = pop(f, T.especial, 10, 240, 0.6);
	const fade = 1 - ramp(f, T.merge - 12, T.merge);
	return (
		<>
			<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: fade}}>
				<path d="M 960 380 L 1040 460 L 960 540 L 880 460 Z" fill="none" stroke={C.green} strokeWidth={6}
					strokeDasharray={600} strokeDashoffset={(1 - p) * 600} />
				<path d="M 880 460 L 780 460 M 1040 460 L 1140 460" fill="none" stroke={C.green} strokeWidth={6}
					strokeDasharray={200} strokeDashoffset={(1 - p) * 200} />
			</svg>
			<div style={{position: 'absolute', left: 960, top: 300, transform: `translate(-50%, -50%) scale(${pp})`, fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.green, opacity: fade, whiteSpace: 'nowrap'}}>¡Decisión!</div>
		</>
	);
};

/** Pantalla dividida: CAMINO A (izquierda) y CAMINO B (derecha); al final se vuelve a A. */
const SplitLayer: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.split || f >= T.mergeEnd) return null;
	const m = ramp(f, T.merge, T.mergeEnd);
	const sa = 1 - m;
	const cardA = {active: 10, done: range(1, 9), dim: [] as number[]};
	const cardB = {active: 12, done: [...range(1, 6), 10, 11], dim: [7, 8, 9]};
	return (
		<>
			<div style={{position: 'absolute', left: 0, top: 0, width: 960 + 960 * m, height: 1080, background: C.panel, opacity: sa}} />
			<div style={{position: 'absolute', left: 960 + 960 * m, top: 0, width: 960, height: 1080, background: C.panel2, opacity: sa}} />
			<div style={{position: 'absolute', left: 958 + 960 * m, top: 0, width: 4, height: 1080, background: C.green, opacity: sa}} />

			<Tag x={480} y={100} at={T.split} out={T.merge} color={C.green}>CAMINO A</Tag>
			<Tag x={1440} y={100} at={T.split} out={T.merge} color={C.blue}>CAMINO B</Tag>

			<div style={{position: 'absolute', left: lerp(210, 30, m), top: lerp(150, 60, m), transform: `scale(${lerp(1, 1.26, m)})`, transformOrigin: '0 0'}}>
				<InstrCard x={0} y={0} w={540} lines={ALGO2} size={16} active={cardA.active} done={cardA.done} title="algoritmo2.txt" blockHl={[6, 10]} />
			</div>
			<div style={{position: 'absolute', left: 1170 + 900 * m, top: 150, opacity: sa}}>
				<InstrCard x={0} y={0} w={540} lines={ALGO2} size={16} active={cardB.active} done={cardB.done} dim={cardB.dim} title="algoritmo2.txt" accent={C.blue} blockHl={[6, 10]} />
			</div>

			{/* icono de la taza de cada camino */}
			<div style={{position: 'absolute', left: 428, top: 740, opacity: sa}}><Cup fill="black" /></div>
			<div style={{position: 'absolute', left: 452, top: 712, width: 16, height: 16, background: '#FFFFFF', opacity: sa}} />
			<div style={{position: 'absolute', left: 478, top: 712, width: 16, height: 16, background: '#FFFFFF', opacity: sa}} />
			<div style={{position: 'absolute', left: 1388, top: 740, opacity: sa}}><Cup fill="latte" /></div>

			<Decision />
			<Shockwave at={T.especial} x={960} y={460} size={900} />
		</>
	);
};

/* ------------------------------------------------------------ comparación */

const IconPersona: React.FC = () => (
	<div style={{position: 'relative', width: 46, height: 62}}>
		<div style={{position: 'absolute', left: 12, top: 0, width: 22, height: 22, borderRadius: 11, background: C.white}} />
		<div style={{position: 'absolute', left: 4, top: 26, width: 38, height: 36, borderRadius: '18px 18px 4px 4px', background: C.white}} />
	</div>
);
const IconRobot: React.FC = () => (
	<div style={{position: 'relative', width: 52, height: 56, background: '#C9D3CE', border: `3px solid ${C.green}`}}>
		<div style={{position: 'absolute', left: 10, top: 14, width: 10, height: 10, background: C.green}} />
		<div style={{position: 'absolute', left: 32, top: 14, width: 10, height: 10, background: C.green}} />
		<div style={{position: 'absolute', left: 14, top: 36, width: 24, height: 4, background: C.bg}} />
	</div>
);
const IconPC: React.FC = () => (
	<div style={{position: 'relative', width: 66, height: 46}}>
		<div style={{position: 'absolute', left: 0, top: 0, width: 66, height: 42, border: `4px solid ${C.white}`, background: '#0E2A1C'}} />
		<div style={{position: 'absolute', left: 26, top: 42, width: 14, height: 6, background: C.white}} />
		<div style={{position: 'absolute', left: 16, top: 48, width: 34, height: 4, background: C.white}} />
		<div style={{position: 'absolute', right: -14, top: -22, fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.amber}}>?</div>
	</div>
);

/** Algoritmo 1 y 2 lado a lado, sellos y etiquetas QUÉ / CUÁNTO / DÓNDE / ORDEN; luego el deslizador. */
const Comparison: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.cmp) return null;
	const q = ramp(f, T.shrink, T.shrink + 24);
	const sliderOp = ramp(f, T.shrink, T.shrink + 12);
	const marksA: Record<number, string[]> = f < t('5:35')
		? {1: ['taza'], 3: ['tetera'], 12: ['cuchara']}
		: f < t('5:36')
			? {2: ['dos cucharadas'], 3: ['200 ml'], 11: ['100 ml']}
			: {1: ['sobre la mesa'], 2: ['a la taza'], 3: ['en la tetera']};
	return (
		<>
			<Board />
			<div style={{position: 'absolute', left: lerp(60, 260, q), top: lerp(100, 230, q), transform: `scale(${lerp(1, 0.55, q)})`, transformOrigin: '0 0'}}>
				<InstrCard x={0} y={0} w={800} lines={ALGO1} size={22} active={-1} done={[]} title="algoritmo1.txt" at={T.cmp} />
			</div>
			<div style={{position: 'absolute', left: lerp(1060, 795, q), top: lerp(100, 230, q), transform: `scale(${lerp(1, 0.55, q)})`, transformOrigin: '0 0'}}>
				<InstrCard x={0} y={0} w={800} lines={ALGO2} size={22} active={-1} done={range(0, 16)} marks={marksA} blockHl={[6, 10]} title="algoritmo2.txt" at={T.cmp} />
			</div>

			{f < T.shrink && <Stamp x={700} y={345} at={t('5:30')} size={30} />}
			{f < T.shrink && <Stamp x={1720} y={160} at={t('5:31')} size={30} />}
			{f < T.shrink && <Tag x={1460} y={800} size={44} at={t('5:33')} out={t('5:35')}>QUÉ</Tag>}
			{f < T.shrink && <Tag x={1460} y={800} size={44} at={t('5:35')} out={t('5:36')}>CUÁNTO</Tag>}
			{f < T.shrink && <Tag x={1460} y={800} size={44} at={t('5:36')} out={t('5:37')}>DÓNDE</Tag>}
			{f < T.shrink && <Tag x={1460} y={800} size={44} at={t('5:37')} out={T.shrink}>ORDEN</Tag>}
			{f >= t('5:37') && f < T.shrink && range(0, 16).map((i) => (
				<Counter key={i} x={1030} y={176 + i * 34.1} value={i + 1} at={t('5:37') + i * 2} size={24} color={C.amber} />
			))}

			<div style={{position: 'absolute', left: 0, top: 0, opacity: sliderOp}}>
				<DetailSlider x={410} y={820} w={1100} knob={0.55} marks={[
					{at: t('5:38.5'), icon: <IconRobot />, pos: 0.55},
					{at: t('5:41.5'), icon: <IconPersona />, pos: 0.2},
					{at: t('5:41.5'), icon: <IconPC />, pos: 0.85},
				]} />
			</div>
			{/* la computadora brilla y sirve de transición */}
			{f >= t('5:43') && (
				<div style={{position: 'absolute', left: 1345 - 80, top: 793 - 80, width: 160, height: 160, borderRadius: '50%', boxShadow: `0 0 60px ${C.green}`, opacity: 0.4 + 0.4 * Math.sin(f / 4)}} />
			)}
			{f >= t('5:41') && <div style={{position: 'absolute', left: 1520, top: 620}}><Cup fill="latte" steam /></div>}
		</>
	);
};

/* ------------------------------------------------------------ Vee y burbujas */

/** Burbuja de pensamiento en sepia: el robot con la cuchara «para siempre». */
const ThoughtBubble: React.FC = () => {
	const f = useCurrentFrame();
	const a = t('5:14');
	const b = t('5:18');
	if (f < a || f >= b + 8) return null;
	const p = pop(f, a, 12, 240, 0.6);
	const boom = ramp(f, b, b + 8);
	return (
		<>
			<div style={{position: 'absolute', left: 878, top: 548, width: 24, height: 24, borderRadius: 12, background: '#8A6A3E', opacity: (1 - boom) * p}} />
			<div style={{position: 'absolute', left: 900, top: 512, width: 14, height: 14, borderRadius: 7, background: '#8A6A3E', opacity: (1 - boom) * p}} />
			<div style={{
				position: 'absolute', left: 880, top: 220, width: 420, height: 270,
				transform: `scale(${(0.3 + 0.7 * p) * (1 + 0.4 * boom)})`, transformOrigin: '20% 100%',
				opacity: (1 - boom) * Math.min(1, p * 2), filter: 'sepia(0.9) saturate(0.6)',
			}}>
				<div style={{position: 'absolute', inset: 0, borderRadius: 140, background: '#C9A46E', border: '5px solid #5C4425'}} />
				<Robot x={210} y={230} scale={4} pose="sit" face="off" holdF={<Spoon scale={4} load="coffee" />} />
				<div style={{position: 'absolute', left: 300, top: 50, fontFamily: MONO, fontWeight: 800, fontSize: 36, color: '#3B2A14'}}>zzz</div>
			</div>
		</>
	);
};

/** Vee (siempre por encima de las capas de escena), con su burbuja. */
const VeeTop: React.FC = () => {
	const f = useCurrentFrame();
	const cur = [...ACTS].reverse().find(([, a]) => f >= a);
	return (
		<>
			<Vee x={veeX(f)} scale={f >= T.cmp ? 6 : undefined} act={cur?.[0]} actAt={cur?.[1]} />
			<ThoughtBubble />
		</>
	);
};

/* ------------------------------------------------------------ HUD y escena */

const Hud: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			<VHS on={f >= T.rew && f < T.rewEnd} label="◀◀" />
			<CornerTag text="CAMINO A" at={T.rew} out={T.rewEnd} />
			<CornerTag text="CAMINO B: NO" at={T.no} out={T.skip} color={C.blue} />
			<CornerTag text="x2" at={T.skip} out={T.split} color={C.amber} />
			<CornerTag text="CAMINO A" at={t('4:57.5')} out={T.cmp} />
			{/* pulso de transición hacia la computadora (B6) */}
			<CutFlash at={t('5:44.6')} />
		</>
	);
};

/** Cámara: plano general hasta 5:43; luego se acerca al icono de la computadora. */
const CAM: CamKey[] = [[T.rew, 1, 960, 540], [t('5:43'), 1, 960, 540], [t('5:45'), 2.4, 1345, 790]];

const Choice: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.rewEnd || f >= T.bS) return null;
	const p = pop(f, T.rewEnd, 12, 240, 0.6);
	return (
		<div style={{
			position: 'absolute', left: 1100, top: 300, width: 700, height: 300, background: 'rgba(14,17,15,0.96)',
			border: `3px solid ${C.green}`, boxShadow: '0 20px 40px rgba(0,0,0,0.6)', opacity: Math.min(1, p * 2),
			transform: `scale(${0.7 + 0.3 * p})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40,
		}}>
			<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.white}}>¿DESEA AGREGAR AZÚCAR?</div>
			<div style={{display: 'flex', gap: 60}}>
				<ChoiceButton label="SÍ" color={C.green} dim={f >= T.no} />
				<ChoiceButton label="NO" color="#9AA39E" pressAt={T.no} />
			</div>
		</div>
	);
};

/** Escena completa del bloque 5.5–5.7. Cada capa se oculta cuando la de encima la tapa. */
export const B5b: React.FC = () => (
	<>
		<Cam keys={CAM}>
			<Kitchen />
			<KitchenScene />
			<Choice />
			<SingleCard />
			<SplitLayer />
			<Comparison />
			<VeeTop />
		</Cam>
		<Hud />
	</>
);

/* ------------------------------------------------------------ sonido */

export const sfxB5b: Sfx[] = [
	s(t('4:41'), 'rise', 0.3),
	s(t('4:43'), 'blip', 0.25),
	s(t('4:44.5'), 'key', 0.35),
	s(t('4:46'), 'whoosh', 0.35),
	s(t('4:49'), 'ticks', 0.3),
	s(t('4:51'), 'ac', 0.3),
	s(t('4:51.5'), 'blip', 0.25),
	s(t('4:54'), 'draw', 0.35),
	s(t('4:55'), 'pop', 0.3),
	s(t('4:57'), 'slide', 0.3),
	s(t('5:02'), 'slide', 0.3),
	s(t('5:04'), 'stack', 0.25),
	s(t('5:06'), 'ticks', 0.2),
	s(t('5:06.8'), 'ticks', 0.2),
	s(t('5:07.6'), 'ticks', 0.2),
	s(t('5:09'), 'key', 0.25),
	s(t('5:14'), 'ticks', 0.2),
	s(t('5:16'), 'glitch', 0.15),
	s(t('5:18'), 'pop', 0.35),
	s(t('5:20'), 'ticks', 0.25),
	s(t('5:22'), 'slide', 0.3),
	s(t('5:24'), 'whoosh', 0.2),
	s(t('5:26'), 'rise', 0.35),
	s(t('5:27'), 'ac', 0.3),
	s(t('5:28'), 'blip', 0.25),
	s(t('5:30'), 'stack', 0.3),
	s(t('5:30.5'), 'land', 0.3),
	s(t('5:33'), 'pop', 0.3),
	s(t('5:35'), 'pop', 0.3),
	s(t('5:36'), 'pop', 0.3),
	s(t('5:37'), 'ticks', 0.2),
	s(t('5:38'), 'ac', 0.3),
	s(t('5:41'), 'riser', 0.35),
];
