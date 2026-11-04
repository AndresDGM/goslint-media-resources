import React from 'react';
import {Freeze, useCurrentFrame} from 'remotion';
import {C, MONO} from '@commons/theme';
import {inCubic, inOutCubic, pop, rnd, tween} from '@commons/lib';
import {Shockwave} from '@commons/components';
import {t} from '../timeline';
import {s, Sfx} from '../sfx';
import {
	Cam, CamKey, Clap, ConceptCard, CoffeeBag, Cup, DetailSlider, Falling, FLOOR, InstrCard, Kitchen, Line, MilkJug, PX, Pour,
	Puddle, punch, Robot, RobotFace, RobotPose, RobotSays, Spoon, Stamp, Tag, TABLE_Y, Vee, VeeAct,
} from '../kit';

/* ================================================================== Bloque 4 · primer algoritmo (2:15–3:35) */

/** Posiciones fijas del encuadre (lienzo 1920×1080). */
const RX = 860; // centro del robot
const VX = 430; // Vee en 4.1–4.3
const CARD_X = 1290; // tarjeta del algoritmo a la derecha (un tercio)
const CARD_Y = 170;
const CARD_W = 580;
/** Congelado de 4.4: el mundo de fondo se queda quieto a partir de 3:05. */
const FZ = t('3:05');

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Acciones de Vee por escena: cada una vale desde su fotograma hasta que llega la siguiente. */
const VEE_ACTS: [VeeAct, number][] = [
	['explicar', t('2:17')], ['reposo', t('2:22')], ['celebrar', t('2:29')], ['senalar', t('2:35')], ['celebrar', t('2:39')],
	['pensar', t('2:49')], ['sorpresa', t('2:52')], ['pensar', t('2:57')], ['sorpresa', t('3:03')], ['explicar', t('3:05')], ['pensar', t('3:18')],
];
const actOf = (list: [VeeAct, number][], f: number): {act?: VeeAct; actAt?: number} => {
	let cur: [VeeAct, number] | undefined;
	for (const x of list) if (f >= x[1]) cur = x;
	return cur ? {act: cur[0], actAt: cur[1]} : {};
};

/**
 * Encuadres. Cada plano dura hasta el siguiente; entre planos hay un corte de 4 fotogramas.
 * [inicio, zoom, centro x, centro y]
 */
const SHOTS: [string, number, number, number][] = [
	['2:15', 1, 960, 540], // 2P con la tarjeta a la derecha
	['2:26', 1.7, RX, 700], // PM del robot: pregunta
	['2:29', 1, 960, 540], // 2P: Vee dice «dos»
	['2:31', 2.6, 1100, 340], // PD de la memoria: café
	['2:33', 1.7, RX, 700], // PM del robot: pregunta leche
	['2:35', 1, 960, 540], // 2P: Vee señala la jarra
	['2:37', 2.6, 1100, 340], // PD de la memoria: leche
	['2:39', 1, 960, 540], // 2P: aplausos
	['2:42', 1.2, 1200, 480], // hacia la tarjeta
	['2:44', 1.7, RX, 700], // PM del robot: mezclar
	['2:47', 1.7, RX, 760], // sigue la mirada al piso
	['2:48', 2.4, RX, 470], // lo que dice la pantalla
	['2:49.5', 1.8, VX, 720], // PM de Vee
	['2:50.5', 1.5, 960, 880], // tilt-down al piso
	['2:52', 1.9, VX, 700], // zoom-punch a Vee
	['2:53', 2.3, 960, 900], // PD del charco
	['2:57', 2.8, 440, 690], // PP de Vee (gota)
	['2:59', 1.6, 1560, 350], // la tarjeta
	['3:01', 1.7, RX, 700], // el robot presenta
	['3:03', 1, 960, 540], // pull-back a 2P
	['3:05', 1.8, VX, 640], // PM de Vee (congelado)
	['3:07', 1, 960, 540], // fija
	['3:12', 1.3, 960, 560], // zoom a la línea «Mezclar»
	['3:14', 1, 960, 540],
	['3:30', 2.1, 1090, 480], // zoom a la marca del robot
	['3:33', 1, 960, 540],
];
const CAM: CamKey[] = [];
SHOTS.forEach(([time, z, x, y], i) => {
	const a = t(time);
	if (i > 0) {
		const [, pz, px, py] = SHOTS[i - 1];
		CAM.push([a - 4, pz, px, py]); // mantiene el plano anterior hasta el corte
	}
	CAM.push([a, z, x, y]);
});

/** Estado del robot en cada momento (pose, cara, objetos en las manos, pecho). */
const robotState = (f: number) => {
	let pose: RobotPose = 'idle';
	let face: RobotFace = 'happy';
	let tilt = 0;
	let chest: string | undefined;
	let holdF: React.ReactNode;
	let holdB: React.ReactNode;
	const on = (a: string, b: string) => f >= t(a) && f < t(b);
	if (on('2:17', '2:19')) { pose = 'reach'; face = 'focus'; } // escanea la tarjeta
	if (on('2:22', '2:24')) { face = 'proud'; tilt = 6 * Math.sin(((f - t('2:22')) / (t('2:24') - t('2:22'))) * 4 * Math.PI); } // asiente dos veces
	if (on('2:24', '2:27')) { face = 'focus'; tilt = Math.round(f / 3) % 2 ? 1.5 : -1.5; } // crujir de dedos
	if (on('2:27', '2:37')) face = 'focus';
	if (on('2:37', '2:39')) { pose = 'thumb'; face = 'proud'; }
	if (on('2:39', '2:42')) { pose = 'bow'; face = 'happy'; }
	if (on('2:42', '2:45')) face = 'focus';
	if (on('2:45', '2:50')) { pose = 'hold'; face = 'nerv'; holdF = <CoffeeBag />; holdB = <MilkJug />; }
	if (on('2:50', '2:52')) {
		pose = 'pour';
		face = 'nerv';
		holdF = <CoffeeBag tip={tween(f, t('2:50'), t('2:51.5'), 0, 100)} />;
		holdB = <MilkJug tip={tween(f, t('2:50.3'), t('2:51.8'), 0, 120)} />;
	}
	if (on('2:52', '2:57')) { pose = 'stir'; face = 'focus'; } // revuelve con el pie
	if (on('2:59', '3:01')) { pose = 'stretch'; face = 'proud'; } // se endereza
	if (f >= t('3:01')) { pose = 'present'; face = 'happy'; chest = f < t('3:03') ? '✓' : '^_^'; }
	return {pose, face, tilt, chest, holdF, holdB};
};

/* ------------------------------------------------------------------ piezas locales */

/** Casilla de la memoria del robot: vacía («—») hasta que entra el dato. */
const Cell: React.FC<{label: string; value: string; at: number}> = ({label, value, at}) => {
	const f = useCurrentFrame();
	const on = f >= at;
	const p = on ? pop(f, at, 12, 240, 0.6) : 0;
	return (
		<div style={{margin: '10px 14px', padding: '10px 14px', border: `3px solid ${on ? C.green : C.line2}`, background: on ? C.greenSoft : 'transparent', fontFamily: MONO, fontWeight: 800, fontSize: 24, color: on ? C.green : C.faint, whiteSpace: 'nowrap', transform: `scale(${on ? 0.92 + 0.08 * p : 1})`}}>
			{label}: {on ? value : '—'}
		</div>
	);
};

/** Pantalla de memoria del robot con las «cajitas» de los datos guardados. */
const Memoria: React.FC = () => (
	<div style={{position: 'absolute', left: 950, top: 230, width: 300, background: 'rgba(14,17,15,0.96)', border: `3px solid ${C.green}`, boxShadow: `0 0 30px ${C.green}33`}}>
		<div style={{fontFamily: MONO, fontSize: 20, color: C.dim, padding: '8px 14px', borderBottom: `2px solid ${C.line2}`}}>MEMORIA</div>
		<Cell label="café" value="2 cdas ✓" at={t('2:31')} />
		<Cell label="leche" value="100 ml ✓" at={t('2:37')} />
	</div>
);

/** Un valor que vuela de un punto a otro (el «2» de Vee, los «100 ml» de la jarra). */
const Fly: React.FC<{from: [number, number]; to: [number, number]; at: number; dur: number; children: React.ReactNode}> = ({from, to, at, dur, children}) => {
	const f = useCurrentFrame();
	if (f < at || f > at + dur + 6) return null;
	const k = tween(f, at, at + dur, 0, 1, inOutCubic);
	const o = 1 - tween(f, at + dur, at + dur + 6);
	return <div style={{position: 'absolute', left: lerp(from[0], to[0], k), top: lerp(from[1], to[1], k), transform: 'translate(-50%, -50%)', opacity: o}}>{children}</div>;
};

/** Haz de escaneo entre dos puntos (la luz verde del robot o el rojo de «no encontrado»). */
const Beam: React.FC<{from: [number, number]; to: [number, number]; at: number; out: number; color?: string}> = ({from, to, at, out, color = C.green}) => {
	const f = useCurrentFrame();
	if (f < at || f >= out) return null;
	const dx = to[0] - from[0];
	const dy = to[1] - from[1];
	const k = tween(f, at, at + 8);
	return <div style={{position: 'absolute', left: from[0], top: from[1], width: Math.hypot(dx, dy) * k, height: 4, background: color, transform: `rotate(${(Math.atan2(dy, dx) * 180) / Math.PI}deg)`, transformOrigin: '0 50%', boxShadow: `0 0 14px ${color}`, opacity: 0.85}} />;
};

/** Batidora de mano: dos aspas que giran. */
const Beater: React.FC<{x: number; y: number}> = ({x, y}) => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'absolute', left: x, top: y, width: 6, height: 6, transform: 'translate(-50%, -50%)'}}>
			{[0, 1].map((i) => (
				<div key={i} style={{position: 'absolute', left: -30, top: -3, width: 60, height: 6, background: '#B9C3BE', transform: `rotate(${f * 25 + i * 90}deg)`}} />
			))}
		</div>
	);
};

/** Gota de agua del «¿AGUA?»: cae, rebota y se va sin encontrar su lugar. */
const WaterDrop: React.FC = () => {
	const f = useCurrentFrame();
	const a = t('3:18.5');
	const b = t('3:19.5');
	const e = t('3:21');
	if (f < a || f > e) return null;
	let x = 1800;
	let y: number;
	if (f < b) y = lerp(260, 720, tween(f, a, b, 0, 1, inCubic));
	else {
		const k = tween(f, b, e, 0, 1);
		y = 720 - 70 * Math.abs(Math.sin(k * Math.PI * 1.5));
		x = lerp(1800, 1880, k);
	}
	return <div style={{position: 'absolute', left: x, top: y, width: 18, height: 24, background: '#5AA9FF', transform: 'translate(-50%, -50%)', boxShadow: '0 0 12px #5AA9FF88'}} />;
};

/** Frase del algoritmo separada y agrandada, que flota sobre la tarjeta. */
const FloatLine: React.FC = () => {
	const f = useCurrentFrame();
	const a = t('3:12');
	if (f < a || f >= t('3:21')) return null;
	const p = pop(f, a, 12, 220, 0.6);
	return (
		<div style={{position: 'absolute', left: 960, top: 555, transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2), fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.green, whiteSpace: 'nowrap', textShadow: `0 0 18px ${C.green}66`}}>
			Mezclar los ingredientes
		</div>
	);
};

/** Confeti pixelado del «RESULTADO ✓». */
const Confetti: React.FC = () => {
	const f = useCurrentFrame();
	const a = t('3:01');
	if (f < a || f > t('3:05')) return null;
	const k = (f - a) / 30;
	const cols = [C.green, C.amber, C.blue, C.red, C.white];
	return (
		<>
			{Array.from({length: 48}).map((_, i) => {
				const x = RX + (rnd(i) - 0.5) * 900 * Math.min(1, k * 1.2);
				const y = 560 - 420 * k * (0.4 + rnd(i + 9)) + 260 * k * k;
				return <div key={i} style={{position: 'absolute', left: x, top: y, width: 12, height: 12, background: cols[i % 5], transform: `rotate(${f * 12 + i * 30}deg)`}} />;
			})}
		</>
	);
};

/** Icono de robot para la marca del deslizador. */
const RobotMark: React.FC = () => (
	<div style={{position: 'relative', width: 44, height: 36, border: `4px solid ${C.green}`, background: C.panel}}>
		<div style={{position: 'absolute', left: 8, top: 8, width: 8, height: 8, background: C.green}} />
		<div style={{position: 'absolute', left: 24, top: 8, width: 8, height: 8, background: C.green}} />
		<div style={{position: 'absolute', left: 10, top: 22, width: 20, height: 4, background: C.green}} />
	</div>
);

/** Persona (silueta) y robot separados en dos mitades, con el globo de cada uno. */
const SplitView: React.FC = () => {
	const f = useCurrentFrame();
	const vis = tween(f, t('3:20.8'), t('3:21.6')) * (1 - tween(f, t('3:26.6'), t('3:27.4')));
	if (vis <= 0.001) return null;
	const sil = '#3A4541';
	return (
		<>
			<div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080, background: C.panel, opacity: vis}} />
			<div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 1080, background: C.panel2, opacity: vis}} />
			<div style={{position: 'absolute', left: 958, top: 0, width: 4, height: 1080, background: C.green, opacity: vis}} />
			<div style={{position: 'absolute', left: 40, top: 60, fontFamily: MONO, fontSize: 26, color: C.dim, opacity: vis}}>PERSONA</div>
			<div style={{position: 'absolute', left: 1000, top: 60, fontFamily: MONO, fontSize: 26, color: C.dim, opacity: vis}}>ROBOT</div>
			{/* persona */}
			<div style={{position: 'absolute', left: 340, top: 500, width: 160, height: 160, borderRadius: '50%', background: sil, opacity: vis}} />
			<div style={{position: 'absolute', left: 240, top: 680, width: 360, height: 260, borderRadius: '160px 160px 0 0', background: sil, opacity: vis}} />
			<div style={{position: 'absolute', left: 430, top: 170, width: 400, height: 260, borderRadius: '50%', background: C.panel2, border: `4px solid ${C.line2}`, opacity: vis}} />
			<div style={{position: 'absolute', left: 420, top: 418, width: 26, height: 26, borderRadius: '50%', background: C.panel2, border: `4px solid ${C.line2}`, opacity: vis}} />
			<div style={{position: 'absolute', left: 398, top: 448, width: 16, height: 16, borderRadius: '50%', background: C.panel2, border: `4px solid ${C.line2}`, opacity: vis}} />
			<div style={{position: 'absolute', left: 520, top: 230, opacity: vis}}><Cup fill="black" scale={9} /></div>
			<div style={{position: 'absolute', left: 690, top: 232, opacity: vis}}><Spoon scale={8} load="coffee" /></div>
			{/* robot (descongelado) */}
			<div style={{position: 'absolute', left: 0, top: 0, opacity: vis}}>
				<Robot x={1440} y={FLOOR} pose="idle" face={f >= t('3:24') ? 'wow' : 'happy'} opacity={vis} />
			</div>
			<RobotSays x={1440} y={520} at={t('3:24')} out={t('3:27')} size={34}>MEZCLAR</RobotSays>
		</>
	);
};

/** Deslizador GENERAL ←→ DETALLADO que aparece tras el split y se detiene en la marca del robot. */
const Slider: React.FC = () => {
	const f = useCurrentFrame();
	const vis = tween(f, t('3:27'), t('3:27.8')) * (1 - tween(f, t('3:33'), t('3:33.5')));
	if (vis <= 0.001) return null;
	const knob = f < t('3:27') ? 0 : 0.62 * tween(f, t('3:27'), t('3:30'), 0, 1, inOutCubic);
	return (
		<div style={{opacity: vis}}>
			<DetailSlider x={410} y={520} w={1100} knob={knob} marks={[{at: t('3:30'), icon: <RobotMark />, pos: 0.62}]} />
		</div>
	);
};

/** Rodillo de limpieza: barre el charco y deja la pantalla limpia para el bloque 5. */
const Roller: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('3:33')) return null;
	const k = tween(f, t('3:33'), t('3:35'), 0, 1, inOutCubic);
	const x = lerp(-150, 2070, k);
	return (
		<>
			<div style={{position: 'absolute', left: 0, top: 0, width: Math.max(0, x), height: 1080, background: C.bg}} />
			<div style={{position: 'absolute', left: x - 40, top: 680, width: 80, height: 360, background: C.green, boxShadow: `0 0 30px ${C.green}88`}} />
		</>
	);
};

/* ------------------------------------------------------------------ mundo (se congela en 4.4) */

const world = (f: number) => (
	<>
		<Kitchen cupOnShelf light={1} />
		{/* extensión de la cocina fuera del encuadre (la cámara puede asomarse) */}
		<div style={{position: 'absolute', left: -1400, top: 0, width: 1400, height: FLOOR, background: '#18201C'}} />
		<div style={{position: 'absolute', left: -1400, top: FLOOR, width: 1400, height: 1080 - FLOOR, background: '#2A2A26'}} />
		<div style={{position: 'absolute', left: 1920, top: 0, width: 1400, height: FLOOR, background: '#18201C'}} />
		<div style={{position: 'absolute', left: 1920, top: FLOOR, width: 1400, height: 1080 - FLOOR, background: '#2A2A26'}} />
		<div style={{position: 'absolute', left: -1400, top: 1080, width: 4720, height: 800, background: '#2A2A26'}} />
		{f < t('2:45') && <div style={{position: 'absolute', left: 1120, top: TABLE_Y - 13 * PX}}><CoffeeBag /></div>}
		{f < t('2:45') && <div style={{position: 'absolute', left: 1260, top: TABLE_Y - 12 * PX}}><MilkJug /></div>}
		<Memoria />
		{/* vertido al piso y charco */}
		<Pour x={RX + 116} y0={770} y1={FLOOR} color="#4A2A18" w={14} on={f >= t('2:50') && f < t('2:51.8')} />
		<Pour x={RX - 75} y0={840} y1={FLOOR} color="#F4F7F5" w={12} on={f >= t('2:50.4') && f < t('2:51.8')} />
		<Falling x={RX + 116} y0={770} y1={FLOOR} at={t('2:50')} dur={36} color="#4A2A18" n={16} spread={50} />
		<Puddle x={960} size={tween(f, t('2:51'), t('2:52.8'), 0, 1) * (f >= t('2:53') && f < t('2:55') ? 1 + 0.04 * Math.sin(f / 2) : 1)} />
		{/* batidora: gira junto al robot y salpica */}
		{f >= t('2:55') && f < t('2:57.5') && <Beater x={1010} y={700} />}
		{f >= t('2:55') && f < t('2:57.5') && <Falling x={1010} y0={700} y1={800} at={t('2:55')} dur={40} color="#5AA9FF" n={10} spread={80} />}
		<Robot x={RX} {...robotState(f)} />
		{/* globos de pantalla del robot */}
		<RobotSays x={RX} y={590} at={t('2:27')} out={t('2:33')}>¿CANTIDAD DE CAFÉ?</RobotSays>
		<RobotSays x={RX} y={590} at={t('2:33')} out={t('2:37')}>¿CANTIDAD DE LECHE?</RobotSays>
		<RobotSays x={RX} y={590} at={t('2:45')} out={t('2:47')}>MEZCLAR: ¿DÓNDE?</RobotSays>
		<RobotSays x={RX} y={590} at={t('2:48')} out={t('2:49.5')}>SUPERFICIE DISPONIBLE ✓</RobotSays>
		<RobotSays x={RX} y={590} at={t('3:01')} out={t('3:05')} size={40}>RESULTADO ✓</RobotSays>
	</>
);

/* ================================================================== escena */

export const B4: React.FC = () => {
	const f = useCurrentFrame();

	/* Vee: la de 4.1–3:21 y la que vuelve en el deslizador (3:27). */
	const vx = VX - 130 * tween(f, t('3:07'), t('3:09'), 0, 1, inOutCubic);
	const veeA = actOf(VEE_ACTS, f);
	const veeB = actOf([['senalar', t('3:27')]], f);

	/* Tarjeta: aparece en 2:18; líneas al ritmo de la voz; se mueve al centro en 4.4. */
	const LINE_AT = [t('2:24'), t('2:27'), t('2:33'), t('2:42'), t('2:59'), t('3:01')];
	const DONE_AT = [t('2:27'), t('2:33'), t('2:39'), t('2:59'), t('3:01')];
	const cur = LINE_AT.filter((x) => f >= x).length - 1;
	const fz = f >= FZ;
	const active = fz ? -1 : cur;
	const done = fz ? [0, 1, 2, 3, 4] : DONE_AT.map((x, i) => (f >= x ? i : -1)).filter((i) => i >= 0);
	const marks: Record<number, string[]> = {};
	if (f >= t('2:19') && f < t('2:22')) marks[0] = ['INICIO'];
	if (f >= t('2:22.2') && f < t('2:27')) marks[5] = ['FIN'];
	const lines: Line[] = [
		{text: 'INICIO'},
		{text: 'Leer cantidad de café', indent: 1},
		{text: 'Leer cantidad de leche', indent: 1},
		{text: 'Mezclar los ingredientes', indent: 1},
		{text: 'Mostrar resultado', indent: 1},
		{text: 'FIN'},
	];
	const cardX = lerp(CARD_X, 650, tween(f, t('3:07'), t('3:09'), 0, 1, inOutCubic));
	const dim = f >= t('3:12') && f < t('3:21') ? [0, 1, 2, 4, 5] : [];

	/* Mini-tarjetas del bloque 2 (3:09–3:14) y etiquetas de preguntas (3:14–3:21). */
	const minis: [string, string, number][] = [['👣', 'PASOS', t('3:09')], ['1-2-3', 'ORDEN', t('3:10')], ['🏁', 'TERMINA', t('3:11')]];

	return (
		<Cam keys={CAM} shakeAt={[t('2:50.5')]}>
			{/* mundo: cocina, robot, objetos y charco (se congela y desatura en 3:05) */}
			<div style={{position: 'absolute', inset: 0, opacity: f < t('3:21') ? 1 : f < t('3:27') ? 0 : tween(f, t('3:27'), t('3:28'), 0, 0.35), filter: `saturate(${f < FZ ? 1 : 1 - 0.85 * tween(f, FZ, FZ + 12)})`}}>
				<Freeze frame={FZ} active={f >= FZ}>{world(f)}</Freeze>
			</div>

			{/* Clap */}
			<Clap at={t('2:15')} out={t('2:17')} text="INTENTO 1" />

			{/* escaneo: luz verde al leer la tarjeta; roja cuando no hay respuesta */}
			<Beam from={[900, 640]} to={[CARD_X, 380]} at={t('2:17')} out={t('2:19')} />
			<Beam from={[900, 640]} to={[CARD_X, 380]} at={t('2:45')} out={t('2:46.5')} color={C.red} />

			{/* Vee */}
			<Vee x={vx} scale={PX * punch(f, t('2:52'))} {...veeA} out={t('3:21')} sale />
			{f >= t('3:26') && <Vee x={300} at={t('3:27')} entra {...veeB} />}

			{/* tarjeta del algoritmo */}
			<InstrCard
				x={cardX} y={CARD_Y} w={CARD_W} lines={lines} title="algoritmo.txt" at={t('2:18')}
				shownAt={[t('2:19'), t('2:20'), t('2:20.7'), t('2:21.4'), t('2:22'), t('2:22.6')]}
				active={active} done={done} dim={dim} marks={marks} out={t('3:21')}
			/>

			{/* 4.4: sello, mini-tarjetas, línea flotante, etiquetas, gota y confeti */}
			{f < t('3:21') && <Stamp x={940} y={420} at={t('3:07')} />}
			{f >= t('3:09') && f < t('3:14') && minis.map(([icon, label, at], i) => (
				<div key={label} style={{position: 'absolute', left: 1290 + i * 204, top: CARD_Y}}>
					<ConceptCard icon={icon} label={label} on={f >= at} size={0.8} />
				</div>
			))}
			<FloatLine />
			<Tag x={1480} y={610} at={t('3:14')} out={t('3:21')}>
				<span style={{display: 'inline-block', width: 40, height: 14, background: '#8A6446', marginRight: 12, position: 'relative', verticalAlign: 'middle'}}>
					<span style={{position: 'absolute', left: -4, right: -4, top: 5, height: 4, background: C.red, transform: 'rotate(-20deg)'}} />
				</span>
				¿DÓNDE?
			</Tag>
			<Tag x={1480} y={690} at={t('3:16')} out={t('3:21')}>
				<span style={{display: 'inline-block', verticalAlign: 'middle', marginRight: 12}}><Cup fill="black" scale={3} /></span>
				¿RECIPIENTE?
			</Tag>
			<Tag x={1480} y={770} at={t('3:17')} out={t('3:21')}>
				<span style={{display: 'inline-block', verticalAlign: 'middle', marginRight: 12}}><Spoon scale={3} load="coffee" /></span>
				¿CON QUÉ?
			</Tag>
			<Tag x={1480} y={850} at={t('3:18')} out={t('3:21')}>¿AGUA?</Tag>
			<WaterDrop />
			<Confetti />

			{/* split persona / robot y deslizador */}
			<SplitView />
			<Slider />
			<Roller />
			{f >= FZ && <Shockwave at={FZ} x={960} y={540} size={1600} />}
		</Cam>
	);
};

/* ================================================================== sonido */

const tm = (xs: string[], file: string, vol: number): Sfx[] => xs.map((x) => s(t(x), file, vol));

export const sfxB4: Sfx[] = [
	// 4.1
	s(t('2:15'), 'hit', 0.4),
	s(t('2:17'), 'draw', 0.3),
	...tm(['2:19', '2:20', '2:20.7', '2:21.4', '2:22', '2:22.6'], 'typing', 0.22),
	...tm(['2:22.8', '2:23.5'], 'blip', 0.3),
	s(t('2:24'), 'ticks', 0.3),
	// 4.2
	s(t('2:27'), 'blip', 0.3),
	s(t('2:29'), 'whoosh', 0.3),
	s(t('2:31'), 'ac', 0.35),
	s(t('2:33'), 'blip', 0.3),
	s(t('2:35'), 'whoosh', 0.3),
	s(t('2:37'), 'ac', 0.35),
	s(t('2:39.2'), 'pop', 0.35),
	s(t('2:40.2'), 'pop', 0.35),
	s(t('2:42'), 'riser', 0.35, 90),
	// 4.3
	s(t('2:45'), 'draw', 0.25),
	s(t('2:45.5'), 'no', 0.35),
	...tm(['2:47', '2:47.5'], 'ticks', 0.25),
	s(t('2:48'), 'ac', 0.35),
	s(t('2:50'), 'debris', 0.3),
	s(t('2:50.4'), 'slide', 0.3),
	s(t('2:52'), 'land', 0.4),
	...tm(['2:53.2', '2:53.8', '2:54.4'], 'slide', 0.25),
	s(t('2:55'), 'glitch', 0.18),
	s(t('2:57'), 'key', 0.3),
	s(t('2:59'), 'blip', 0.3),
	s(t('3:01'), 'riser', 0.35, 120),
	// 4.4
	s(t('3:05'), 'pop', 0.4),
	s(t('3:05.3'), 'glitch', 0.25),
	s(t('3:07'), 'stack', 0.35),
	...tm(['3:09', '3:10', '3:11'], 'ticks', 0.3),
	s(t('3:12'), 'whoosh', 0.35),
	s(t('3:14'), 'pop', 0.35),
	s(t('3:16'), 'blip', 0.35),
	s(t('3:17'), 'blip', 0.35),
	s(t('3:18'), 'pop', 0.35),
	s(t('3:19.5'), 'boing', 0.35),
	s(t('3:21'), 'whoosh', 0.3),
	s(t('3:24'), 'blip', 0.3),
	s(t('3:27'), 'ticks', 0.25),
	s(t('3:30'), 'ac', 0.35),
	s(t('3:33'), 'whoosh', 0.35),
	s(t('3:33.2'), 'slide', 0.3),
];
