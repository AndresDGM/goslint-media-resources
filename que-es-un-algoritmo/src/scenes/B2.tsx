import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, FPS} from '@commons/theme';
import {pop, tween} from '@commons/lib';
import {
	Board, Bubble, Cam, CamKey, ConceptCard, Cup, Falling, Kettle, Kitchen, MeasureJug, Pour, Puddle,
	Question, Robot, RobotFace, RobotPose, Spoon, Tag, TABLE_Y, Vee, VeeAct, VHS, punch, FLOOR,
} from '../kit';
import {s, Sfx} from '../sfx';
import {t} from '../timeline';

/* ============================================================ Bloque 2 · DEFINICIÓN (0:45–1:35) */

/** Interpolación lineal con límites (0 → 1). */
const lin = (f: number, a: number, b: number) => Math.min(1, Math.max(0, (f - a) / (b - a)));

/* ---- geometría ---- */
const ROW_Y = 400;                          // centro vertical de la fila de tarjetas
const CARD_SIZE = 1.6;
const CARD_W = 230 * CARD_SIZE;
const CARD_H = 190 * CARD_SIZE;
const SLOT_X = [318, 746, 1174, 1602];      // PASOS, SECUENCIA, ORDEN, FIN (centros)
const CARDS = [
	{icon: '👣', label: 'PASOS'},
	{icon: '🚃', label: 'SECUENCIA'},
	{icon: '1-2-3', label: 'ORDEN'},
	{icon: '🏁', label: 'FIN'},
];
/** Palabras clave de la pizarra: cuándo se nombran, en qué fila caen y a qué tarjeta se convierten. */
const WORDS: {w: string; at: string; y: number; slot: number}[] = [
	{w: 'SECUENCIA', at: '0:47', y: 330, slot: 1},
	{w: 'ORDENADA', at: '0:47.6', y: 470, slot: 2},
	{w: 'FINITA', at: '0:48.2', y: 610, slot: 3},
	{w: 'PASOS', at: '0:48.8', y: 750, slot: 0},
];

const ROBOT_X = 1400;          // el robot trabaja de pie sobre la mesa
const CUP_X = 1516;            // centro de la taza y del chorro
const CUP_TOP = TABLE_Y - 80;  // la taza (10 px × 8) apoyada en la mesa
const TRAIN_Y = 1000;          // centro de los vagones (parte inferior de la pantalla)
const CAR_W = 250;
const CAR_H = 110;
const FORM_X = [1100, 1380, 1660];   // posición de los vagones enganchados
const TOP_X = [1080, 1360, 1640];    // posición de las mini-tarjetas en la fila superior
const TOP_Y = 300;
const PILL_X = [930, 1430];         // dos mini-tarjetas del orden (1:08–1:19)
const HUD_X = 1268;                  // índice de conceptos (esquina superior derecha)
const HUD_ON = ['1:00', '1:03', '1:08', '1:19'];
/** Shift del tren (px) a partir de 1:05, a 300 px/s hacia la izquierda. */
const trainShift = (f: number) => -300 * Math.max(0, f - t('1:05')) / FPS;
/** Fotograma en que el robot salta al último vagón (cuando su x coincide con la del robot en el suelo, 1220). */
const BOARD_AT = t('1:05') + Math.round(((FORM_X[2] - 1220) / 300) * FPS);

/* ---- cámara ---- */
const CAM: CamKey[] = [
	[t('0:45'), 1.2, 780, 560],    // PM de Vee, gráfico a la derecha
	[t('0:49'), 1.2, 900, 560],    // truck lateral hacia el texto
	[t('0:53.9'), 1.2, 900, 560],
	[t('0:54'), 1.35, 800, 560],   // corte a PM de Vee
	[t('0:56'), 1.35, 800, 560],
	[t('0:58'), 1.0, 960, 540],    // pull-back a plano general
	[t('1:00'), 1.0, 960, 540],
	[t('1:00.5'), 1.25, 1350, 600], // 2P de cocina
	[t('1:02'), 1.25, 1350, 600],
	[t('1:03'), 1.0, 960, 540],    // pull-back
	[t('1:05'), 1.0, 960, 540],
	[t('1:08'), 1.0, 760, 540],    // paneo que sigue al tren
	[t('1:08.5'), 1.1, 900, 540],  // Vee enseña el orden
	[t('1:10'), 1.1, 900, 540],
	[t('1:12'), 1.5, 1205, 250],   // zoom a las tarjetas
	[t('1:12.5'), 1.4, 1450, 680], // PD de la mesa vacía
	[t('1:14'), 1.4, 1450, 680],
	[t('1:14.5'), 1.3, 1400, 600], // PM del robot
	[t('1:16'), 1.3, 1400, 600],
	[t('1:16.05'), 1.35, 800, 560], // corte a Vee
	[t('1:17'), 1.35, 800, 560],
	[t('1:17.5'), 1.0, 960, 540],  // 2P durante el rewind
	[t('1:19'), 1.0, 960, 540],
	[t('1:21'), 1.3, 1400, 560],   // PM del robot revolviendo
	[t('1:23'), 1.5, 1450, 600],   // zoom lento
	[t('1:25'), 1.4, 1400, 560],
	[t('1:27'), 1.0, 960, 540],    // corte a 2P
	[t('1:29'), 1.3, 1400, 600],   // PM del robot mareado
	[t('1:31'), 1.3, 960, 470],    // pull-back al plano de resumen
	[t('1:33'), 1.0, 960, 540],
	[t('1:35'), 1.0, 960, 540],
];

/** Acciones de Vee: [inicio, acción]. Cada clip dura 70 fotogramas. */
const VEE_ACTS: [string, VeeAct][] = [
	['0:45', 'explicar'], ['0:54', 'celebrar'], ['1:08', 'explicar'], ['1:16', 'sorpresa'],
	['1:19', 'senalar'], ['1:27', 'sorpresa'], ['1:33', 'celebrar'],
];

/* ============================================================ pizarra (0:45–1:31) */

/** Palabra clave: cae con rebote en la pizarra y luego se convierte en la tarjeta de concepto. */
const Word: React.FC<{w: string; at: string; y: number; slot: number}> = ({w, at, y, slot}) => {
	const f = useCurrentFrame();
	const a = t(at);
	if (f < a || f >= t('0:57.2')) return null;
	const p = pop(f, a, 9, 200, 0.6);
	const m = tween(f, t('0:56'), t('0:57'));
	const shake = f >= t('0:54') && f < t('0:56') ? Math.sin(f * 1.9) * 7 : 0;   // «rígidas» que tiemblan
	const x = 1200 + (SLOT_X[slot] - 1200) * m;
	const yy = y + (ROW_Y - y) * m - (1 - p) * 420;
	const op = 1 - tween(f, t('0:56.6'), t('0:57.2'));
	return (
		<div style={{position: 'absolute', left: x + shake, top: yy, transform: 'translate(-50%, -50%)', opacity: op, fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.green, border: `4px solid ${C.green}`, background: C.bg, padding: '10px 26px', whiteSpace: 'nowrap', boxShadow: `0 0 30px ${C.green}55`}}>
			{w}
		</div>
	);
};

/** Candado con «?» que se abre y se convierte en una taza humeante (0:49–0:56). */
const LockIcon: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('0:49') || f >= t('0:52.5')) return null;
	const p = pop(f, t('0:49'), 12, 240, 0.6);
	const open = tween(f, t('0:50.6'), t('0:51.2'));
	return (
		<div style={{position: 'absolute', left: 1560, top: 500, transform: `scale(${0.4 + 0.6 * p})`, opacity: Math.min(1, p * 2)}}>
			<div style={{position: 'absolute', left: -42, top: -78, width: 84, height: 90, boxSizing: 'border-box', border: `14px solid ${C.white}`, borderBottom: 'none', borderRadius: '42px 42px 0 0', transform: `translate(${-26 * open}px, ${-26 * open}px) rotate(${-18 * open}deg)`, transformOrigin: '100% 100%'}} />
			<div style={{position: 'absolute', left: -70, top: 0, width: 140, height: 110, background: C.white, borderRadius: 14}} />
			<Question x={0} y={55} at={t('0:49.5')} out={t('0:52')} size={96} color={C.bg} />
		</div>
	);
};

/** Taza humeante que sustituye al candado (0:52.5–0:56.6). */
const BoardCup: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('0:52.5') || f >= t('0:56.6')) return null;
	const op = tween(f, t('0:52.5'), t('0:52.8')) * (1 - tween(f, t('0:56.2'), t('0:56.6')));
	return (
		<div style={{position: 'absolute', left: 1508, top: 515, opacity: op}}>
			<Cup fill="black" steam scale={8} />
		</div>
	);
};

/** Línea verde que cruza detrás de Vee y se retira al final de 2.1. */
const MarkerLine: React.FC = () => {
	const f = useCurrentFrame();
	const w = 1520 * tween(f, t('0:45'), t('0:47'));
	const op = 1 - tween(f, t('0:55'), t('0:56'));
	return <div style={{position: 'absolute', left: 200, top: 540, width: w, height: 6, background: C.green, opacity: op}} />;
};

/** Fila de cuatro tarjetas de concepto. Se ve en 2.1 (0:56–0:59) y en el resumen (1:30.5–1:34). */
const CardRow: React.FC = () => {
	const f = useCurrentFrame();
	const inA = f >= t('0:56') && f < t('0:59');
	const inB = f >= t('1:30.5') && f < t('1:34.2');
	if (!inA && !inB) return null;
	const merge = tween(f, t('1:33.2'), t('1:33.8'));   // las 4 tarjetas se juntan en una ficha
	const litAt = [t('1:31'), t('1:31.5'), t('1:32'), t('1:32.5')];
	const base = inA
		? tween(f, t('0:56.3'), t('0:56.8')) * (1 - tween(f, t('0:58.5'), t('0:59')))
		: tween(f, t('1:30.5'), t('1:31')) * (1 - merge);
	return (
		<>
			{CARDS.map((c, i) => {
				const x = SLOT_X[i] + (960 - SLOT_X[i]) * merge;
				const on = f < t('1:30') ? true : f >= litAt[i];
				return (
					<div key={c.label} style={{position: 'absolute', left: x - CARD_W / 2, top: ROW_Y - CARD_H / 2, opacity: base}}>
						<ConceptCard icon={c.icon} label={c.label} on={on} size={CARD_SIZE} />
					</div>
				);
			})}
		</>
	);
};

/* ============================================================ cocina (0:58–1:31) */

/** Mini-tarjeta de la fila superior que se convierte en vagón del tren (1:03–1:08). */
const Car: React.FC<{i: number; label: string; at: string}> = ({i, label, at}) => {
	const f = useCurrentFrame();
	const a = t(at);
	if (f < a || f >= t('1:08.6')) return null;
	const k = tween(f, t('1:03'), t('1:05'));
	const x0 = TOP_X[i];
	const x = x0 + (FORM_X[i] - x0) * k + trainShift(f);
	const y = TOP_Y + (TRAIN_Y - TOP_Y) * k;
	const p = pop(f, a, 12, 240, 0.6);
	const wheels = tween(f, t('1:03.5'), t('1:04'));
	const link = tween(f, t('1:03.4'), t('1:04.2'));
	const fade = 1 - tween(f, t('1:08.3'), t('1:08.6'));
	return (
		<div style={{position: 'absolute', left: x - CAR_W / 2, top: y - CAR_H / 2, width: CAR_W, height: CAR_H, opacity: Math.min(1, p * 2) * fade, transform: `scale(${0.6 + 0.4 * p})`}}>
			<div style={{position: 'absolute', inset: 0, border: `4px solid ${C.green}`, background: 'rgba(0,192,99,0.14)', boxShadow: `0 0 30px ${C.green}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.white, whiteSpace: 'nowrap', boxSizing: 'border-box'}}>
				{label}
			</div>
			{[38, 186].map((wx) => (
				<div key={wx} style={{position: 'absolute', left: wx, top: CAR_H - 12, width: 26, height: 26, borderRadius: '50%', background: C.bg, border: '4px solid #C9D3CE', boxSizing: 'border-box', opacity: wheels}} />
			))}
			{i < 2 && <div style={{position: 'absolute', left: CAR_W, top: CAR_H / 2 - 6, width: 30 * link, height: 12, background: '#B4C0B8'}} />}
		</div>
	);
};

/** Robot que revuelve, vierte y revuelve en 2.2 y luego corre hasta el último vagón. */
const RobotTram: React.FC = () => {
	const f = useCurrentFrame();
	const jump = lin(f, t('1:05'), t('1:05.4'));
	let x = ROBOT_X;
	let y = FLOOR;
	if (f >= t('1:05')) {
		x = ROBOT_X + (1220 - ROBOT_X) * jump;
		y = FLOOR;
	}
	if (f >= BOARD_AT) {
		x = FORM_X[2] + trainShift(f);
		y = TRAIN_Y - CAR_H / 2;
	}
	let pose: RobotPose = 'idle';
	let holdF: React.ReactNode;
	if (f >= t('1:00') && f < t('1:00.6')) pose = 'reach';
	if (f >= t('1:01') && f < t('1:02')) { pose = 'pour'; holdF = <MeasureJug level={0.9} scale={4} />; }
	if (f >= t('1:02') && f < t('1:03.2')) { pose = 'stir'; holdF = <Spoon load="coffee" scale={4} />; }
	if (f >= t('1:05') && f < BOARD_AT) pose = 'walk';
	const face: RobotFace = f >= BOARD_AT ? 'happy' : 'focus';
	return <Robot x={x} y={y} pose={pose} face={face} holdF={holdF} at={t('0:58')} out={t('1:08.4')} />;
};

/** Pantalla de la cocina con la taza, el tren y el robot. Se revela desde la tarjeta PASOS (0:58). */
const KitchenLayer: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('0:58') || f >= t('1:31.5')) return null;
	const k = tween(f, t('0:58'), t('0:59.5'));
	const inv = 1 - k;
	const clip = `inset(${248 * inv}px ${(1920 - 502) * inv}px ${(1080 - 552) * inv}px ${134 * inv}px)`;
	const fade = 1 - tween(f, t('1:30.5'), t('1:31.5'));

	// Chorro de la jarra (1:01) y de la tetera (1:12.5)
	// Agua: tetera sobre la mesa vacía, charco que crece y luego se rebobina.
	const puddleSize = f < t('1:13') ? 0 : f < t('1:17') ? 0.5 * tween(f, t('1:13'), t('1:13.5')) : 0.5 * (1 - tween(f, t('1:17'), t('1:18.5')));

	// Contador del robot (chest) en 2.4
	const COUNT: [string, string][] = [['1:21', '1'], ['1:21.5', '2'], ['1:22', '3'], ['1:23', '27'], ['1:23.5', '88'], ['1:24', '412'], ['1:25', '∞']];
	let counter = '';
	for (const [at, v] of COUNT) if (f >= t(at)) counter = v;

	// Robot de 2.3–2.4 (de pie sobre la mesa)
	let pose: RobotPose = 'idle';
	let face: RobotFace = 'focus';
	let holdF: React.ReactNode;
	let chest: string | undefined;
	let spin = 0;
	let tilt = 0;
	if (f >= t('1:12') && f < t('1:13.5')) { pose = 'pour'; holdF = <Kettle scale={4} />; }
	if (f >= t('1:13.5') && f < t('1:15')) pose = 'reach';
	if (f >= t('1:14.5') && f < t('1:21')) { chest = '✓'; face = 'happy'; }
	if (f >= t('1:19') && f < t('1:21')) face = 'proud';
	if (f >= t('1:21') && f < t('1:25')) { pose = 'stir'; holdF = <Spoon load="coffee" scale={4} />; chest = counter; }
	if (f >= t('1:25') && f < t('1:29')) {
		pose = 'spin';
		spin = 0.45;
		tilt = 6 * (f - t('1:25'));
		chest = '∞';
		face = 'wow';
	}
	if (f >= t('1:29') && f < t('1:30.5')) {
		const d = f - t('1:29');
		pose = 'dizzy';
		face = 'dizzy';
		tilt = 18 * Math.sin(d / 3.5) * Math.exp(-d / 12);
		chest = '@';
	}
	if (f >= t('1:30.5')) {
		pose = 'sit';
		face = 'dizzy';
		chest = '@';
		tilt = 3 * Math.sin((f - t('1:30.5')) / 4);
	}

	// Taza: vacía en 2.2, retirada en 1:11.5, sobre el charco (1:14), negra con remolino (2.4)
	const cupOp = (from: number, to: number) => tween(f, from, from + 4) * (1 - tween(f, to - 4, to));
	const swirl = tween(f, t('1:23'), t('1:23.5')) * (1 - tween(f, t('1:31'), t('1:31.5')));

	return (
		<div style={{position: 'absolute', inset: 0, clipPath: clip, opacity: fade}}>
			<Kitchen />

			{/* Taza de la mesa (2.2) */}
			{f >= t('0:58') && f < t('1:11.5') && (
				<div style={{position: 'absolute', left: CUP_X - 52, top: CUP_TOP}}><Cup fill="empty" scale={8} /></div>
			)}
			{/* Taza sobre el charco (2.3) */}
			{f >= t('1:14') && f < t('1:17.2') && (
				<div style={{position: 'absolute', left: CUP_X - 52, top: CUP_TOP}}><Cup fill="empty" scale={8} /></div>
			)}
			{/* Taza de café negro (2.4) */}
			{f >= t('1:19') && (
				<div style={{position: 'absolute', left: CUP_X - 52, top: CUP_TOP, opacity: cupOp(t('1:19'), t('1:31.5'))}}>
					<Cup fill="black" steam scale={8} />
				</div>
			)}
			{f >= t('1:23') && f < t('1:31.5') && (
				<div style={{position: 'absolute', left: CUP_X - 44, top: CUP_TOP + 8, width: 88, height: 34, borderRadius: '50%', border: '5px dotted #B07A4F', boxSizing: 'border-box', opacity: swirl, transform: `rotate(${(f - t('1:23')) * 14}deg)`}} />
			)}

			{/* Mini-tarjetas de 2.2 → vagones */}
			<Car i={0} label="Tomar" at="1:00" />
			<Car i={1} label="Verter" at="1:01" />
			<Car i={2} label="Revolver" at="1:02" />

			{/* Chorro de la jarra (1:01) y de la tetera (1:12.5) */}
			<Pour x={CUP_X} y0={540} y1={CUP_TOP + 10} on={f >= t('1:01.2') && f < t('1:02')} />
			<Pour x={CUP_X} y0={545} y1={TABLE_Y} on={f >= t('1:12.6') && f < t('1:13.1')} />

			{/* Charco de agua (2.3) y salpicadura */}
			<Puddle size={puddleSize} x={CUP_X} y={TABLE_Y} color="#5AA9FF" />
			<Falling x={CUP_X} y0={700} y1={650} at={t('1:13')} dur={12} color="#5AA9FF" n={16} spread={180} />

			{/* Mini-tarjetas del orden: «1. Tomar taza» / «2. Verter agua» y el intercambio */}
			<Pills />

			{/* Burbuja de 2.4 y pájaros de 8 bits */}
			<Bubble x={ROBOT_X} y={300} at={t('1:21')} out={t('1:23.5')} size={44}>REVOLVER</Bubble>
			<Birds />

			<RobotTram />
			<Robot
				x={ROBOT_X} y={FLOOR} at={t('1:08.9')} pose={pose} face={face} holdF={holdF}
				chest={chest} chestColor={chest === '∞' || chest === '@' ? C.amber : C.green} spin={spin} tilt={tilt}
			/>
		</div>
	);
};

/** Mini-tarjetas del orden (2.3): se intercambian en el aire y luego vuelven en un rewind. */
const Pills: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('1:08') || f >= t('1:19')) return null;
	const sw = tween(f, t('1:10'), t('1:11.5')) - tween(f, t('1:17'), t('1:18.5'));
	const p = pop(f, t('1:08'), 12, 240, 0.6);
	const wrong = sw > 0.5;
	const xT = PILL_X[0] + (PILL_X[1] - PILL_X[0]) * sw;
	const xV = PILL_X[1] - (PILL_X[1] - PILL_X[0]) * sw;
	const pill = (x: number, label: string) => (
		<div style={{position: 'absolute', left: x - 190, top: TOP_Y - 55, width: 380, height: 110, boxSizing: 'border-box', border: `4px solid ${wrong ? C.amber : C.green}`, background: wrong ? 'rgba(255,181,71,0.14)' : 'rgba(0,192,99,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.white, whiteSpace: 'nowrap', opacity: Math.min(1, p * 2), transform: `scale(${0.6 + 0.4 * p})`}}>
			{label}
		</div>
	);
	return (
		<>
			{pill(xT, `${sw > 0.5 ? 2 : 1}. Tomar taza`)}
			{pill(xV, `${sw > 0.5 ? 1 : 2}. Verter agua`)}
		</>
	);
};

/** Tres «v» blancas que dan vueltas sobre la cabeza del robot (mareo, 1:29.5–1:33). */
const Birds: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('1:29.5') || f >= t('1:33')) return null;
	return (
		<>
			{[0, 1, 2].map((i) => {
				const a = (f - t('1:29.5')) * 0.12 + i * 2.1;
				const x = ROBOT_X + Math.cos(a) * 110;
				const y = 300 + Math.sin(a) * 30;
				return (
					<svg key={i} width={44} height={22} viewBox="0 0 44 22" style={{position: 'absolute', left: x - 22, top: y - 11}}>
						<polyline points="3,5 22,18 41,5" fill="none" stroke={C.white} strokeWidth={6} strokeLinecap="square" strokeLinejoin="miter" />
					</svg>
				);
			})}
		</>
	);
};

/** Índice de conceptos fijo en la esquina (fuera de la cámara) durante la cocina. */
const Hud: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('1:00') || f >= t('1:31.2')) return null;
	const op = tween(f, t('1:00'), t('1:00.5')) * (1 - tween(f, t('1:30.5'), t('1:31.2'))) * (1 - Math.min(tween(f, t('1:09.6'), t('1:10')), 1 - tween(f, t('1:18.6'), t('1:19'))));
	return (
		<>
			{CARDS.map((c, i) => (
				<div key={c.label} style={{position: 'absolute', left: HUD_X + i * 158, top: 40, opacity: op}}>
					<ConceptCard icon={c.icon} label={c.label} on={f >= t(HUD_ON[i])} size={0.6} />
				</div>
			))}
		</>
	);
};

/* ============================================================ escena principal */

/** Vee con su acción vigente (una a la vez). */
const VeeLayer: React.FC = () => {
	const f = useCurrentFrame();
	let act: VeeAct | undefined;
	let actAt: number | undefined;
	for (const [at, a] of VEE_ACTS) {
		const st = t(at);
		if (f >= st && f < st + 70) { act = a; actAt = st; }
	}
	return <Vee x={420} at={t('0:45')} act={act} actAt={actAt} />;
};

/** Cierre de la definición: la ficha ALGORITMO (1:33.6). */
const SummaryTag: React.FC = () => (
	<Tag x={960} y={ROW_Y} at={t('1:33.6')} size={96} color={C.green}>ALGORITMO</Tag>
);

export const B2: React.FC = () => {
	const f = useCurrentFrame();
	const scaleP = punch(f, t('1:13'));
	const rot = f >= t('1:25') && f < t('1:29') ? 5 * Math.sin((f - t('1:25')) * 0.35) : 0;
	return (
		<>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${scaleP}) rotate(${rot}deg)`, transformOrigin: '50% 50%'}}>
				<Cam keys={CAM} shakeAt={[t('1:13')]}>
					<Board />
					<MarkerLine />
					{WORDS.map((x) => <Word key={x.w} w={x.w} at={x.at} y={x.y} slot={x.slot} />)}
					<LockIcon />
					<BoardCup />
					<CardRow />
					<KitchenLayer />
					<SummaryTag />
					<VeeLayer />
				</Cam>
			</div>
			<Hud />
			<VHS on={f >= t('1:17') && f < t('1:19')} />
		</>
	);
};

/* ============================================================ efectos de sonido */

export const sfxB2: Sfx[] = [
	s(t('0:45'), 'draw', 0.3),
	s(t('0:47'), 'pop', 0.3), s(t('0:47.6'), 'pop', 0.3), s(t('0:48.2'), 'pop', 0.3), s(t('0:48.8'), 'pop', 0.3),
	s(t('0:51'), 'key', 0.3),
	s(t('0:52'), 'whoosh', 0.15, 60),
	s(t('0:54.5'), 'boing', 0.2),
	s(t('0:56'), 'ticks', 0.25),
	s(t('0:58'), 'whoosh', 0.4),
	s(t('1:00'), 'key', 0.3),
	s(t('1:01'), 'slide', 0.3), s(t('1:01.4'), 'key', 0.25),
	s(t('1:02'), 'ticks', 0.25), s(t('1:02.4'), 'key', 0.25),
	s(t('1:03'), 'stack', 0.35), s(t('1:03.4'), 'stack', 0.35),
	s(t('1:05'), 'ticks', 0.25), s(t('1:06'), 'blip', 0.2),
	s(t('1:10'), 'whoosh', 0.3),
	s(t('1:12.6'), 'slide', 0.3, 30),
	s(t('1:13'), 'debris', 0.4),
	s(t('1:14'), 'key', 0.3), s(t('1:14.6'), 'blip', 0.3),
	s(t('1:17'), 'glitch', 0.3, 60),
	s(t('1:19'), 'ac', 0.35),
	s(t('1:21'), 'ticks', 0.25), s(t('1:21.5'), 'ticks', 0.25), s(t('1:22'), 'ticks', 0.25),
	s(t('1:23'), 'ticks', 0.25), s(t('1:23.5'), 'ticks', 0.25), s(t('1:24'), 'ticks', 0.25), s(t('1:24.5'), 'ticks', 0.25),
	s(t('1:25'), 'rise', 0.3, 60),
	s(t('1:29'), 'boing', 0.4), s(t('1:29.8'), 'blip', 0.2),
	s(t('1:31'), 'ac', 0.3), s(t('1:31.5'), 'ac', 0.3), s(t('1:32'), 'ac', 0.3), s(t('1:32.5'), 'ac', 0.3),
	s(t('1:33.5'), 'enter', 0.35),
];
