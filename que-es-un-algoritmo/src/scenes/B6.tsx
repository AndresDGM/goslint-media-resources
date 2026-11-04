import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO} from '@commons/theme';
import {pop, tween, rnd} from '@commons/lib';
import {CutFlash, Shockwave} from '@commons/components';
import {PixelComputer} from '@commons/parts';
import {
	Board,
	Bubble,
	Cam,
	CamKey,
	ChoiceButton,
	Counter,
	Cup,
	FLOOR,
	Kitchen,
	InstrCard,
	Line,
	Puddle,
	Robot,
	RobotFace,
	RobotPose,
	Spoon,
	Stamp,
	Tag,
	TypeLine,
	Vee,
	VeeAct,
} from '../kit';
import {Sfx, s} from '../sfx';
import {t} from '../timeline';

/* Bloque 6 · ¿Cómo ejecuta instrucciones una computadora? (5:45–6:55). Tiempos absolutos con t('m:ss'). */

const DESK = 820;
const PCX = 1180;
const PS = 22; // escala del PC pixelado
// Pantalla del PC en coordenadas del mundo (pcBuf: rect(1,1,24,14) a escala PS).
const SX0 = PCX - 12 * PS;
const SY0 = DESK - 21 * PS;
const SW = 24 * PS;
const SH = 14 * PS;

/* ------------------------------------------------------------ líneas del algoritmo (café, texto genérico) */

const LINES: Line[] = [
	{text: 'INICIO'},
	{text: 'Tomar una taza'},
	{text: 'Poner dos cucharadas de café'},
	{text: 'Verter 200 ml de agua caliente'},
	{text: 'Añadir 100 ml de leche'},
	{text: 'Revolver con la cuchara'},
	{text: 'Dejar la cuchara en la mesa'},
	{text: 'Servir el café'},
	{text: 'FIN'},
];
const LINE_SHOWN = LINES.map((_, i) => t('5:52.6') + i * 4);
/** Inicio de la ejecución de las líneas 1…8 (el cursor ▶ entra en cada una). */
const SEQ = [t('5:55'), t('5:57'), t('5:58'), t('5:59'), t('5:59.7'), t('6:00.3'), t('6:00.8'), t('6:01.3')];
const T_DONE = t('6:02.5');

const progressState = (f: number) => {
	if (f >= T_DONE) return {active: -1, done: LINES.map((_, i) => i)};
	const k = SEQ.filter((x) => f >= x).length;
	const done: number[] = [];
	for (let i = 0; i < k; i++) done.push(i);
	return {active: k === 0 ? -1 : k, done};
};

/* ------------------------------------------------------------ cámaras */

const KITCHEN_A_KEYS: CamKey[] = [
	[t('5:45'), 1, 960, 540],
	[t('5:46.8'), 4, 1296, 802],
	[t('5:47.4'), 26, 1296, 802],
];
const PC_KEYS: CamKey[] = [
	[t('5:47.4'), 6, PCX, 512],
	[t('5:49.8'), 1.4, 1000, 600],
	[t('5:52'), 1.4, 1000, 600],
	[t('5:53.2'), 2.6, PCX, 512],
	[t('6:02.8'), 2.6, PCX, 540],
	[t('6:03.6'), 1.4, 1000, 600],
	[t('6:08.6'), 1, 960, 540],
	[t('6:12'), 1, 960, 540],
	[t('6:14'), 1.2, 1000, 560],
	[t('6:20.5'), 1.2, 1000, 560],
	[t('6:23.5'), 1.2, 1200, 480],
	[t('6:24.8'), 2.4, 1300, 520],
	[t('6:27.8'), 2.4, 1300, 520],
];
const KITCHEN_B_KEYS: CamKey[] = [
	[t('6:28'), 1, 960, 540],
	[t('6:30.5'), 1, 960, 540],
	[t('6:31.2'), 2.2, 480, 200],
	[t('6:33.8'), 2.2, 480, 200],
	[t('6:34.4'), 2.2, 960, 200],
	[t('6:36.8'), 2.2, 960, 200],
	[t('6:37.4'), 2.2, 1440, 200],
	[t('6:40.8'), 2.2, 1440, 200],
	[t('6:41.6'), 1, 960, 540],
	[t('6:50'), 1, 960, 540],
	[t('6:55'), 1.15, 960, 620],
];

/* ------------------------------------------------------------ 5:45–5:47.4 · cocina: la computadora vuela al robot */

const KitchenA: React.FC = () => {
	const f = useCurrentFrame();
	const a = t('5:45.6');
	const b = t('5:46.8');
	const k = tween(f, a, b, 0, 1);
	return (
		<Cam keys={KITCHEN_A_KEYS}>
			<Kitchen light={1} />
			<Vee x={420} />
			<Robot x={1300} pose="idle" face="happy" chest={'>_'} />
			{f >= a && f < b + 4 && (
				<div style={{position: 'absolute', left: 1640 + (1296 - 1640) * k - 80, top: 300 + (802 - 300) * k - 60, width: 160, height: 120, border: `4px solid ${C.green}`, background: C.panel, transform: `scale(${1 - 0.8 * k})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 48, color: C.green}}>
					{'>_'}
				</div>
			)}
		</Cam>
	);
};

/* ------------------------------------------------------------ 5:47.4–6:28 · dentro del PC */

const Dev: React.FC<{x: number; at: number}> = ({x, at}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 15, 220, 0.6);
	return (
		<div style={{position: 'absolute', left: x - 70, top: 130 + (1 - p) * 40, width: 140, height: 170, opacity: Math.min(1, p * 1.5)}}>
			<div style={{position: 'absolute', left: 40, top: 0, width: 60, height: 60, borderRadius: '50%', background: C.green}} />
			<div style={{position: 'absolute', left: 10, top: 68, width: 120, height: 62, borderRadius: '60px 60px 0 0', background: C.greenDeep}} />
			<div style={{position: 'absolute', left: 28, top: 124, width: 84, height: 10, background: '#B4C0B8'}} />
		</div>
	);
};

const Strike: React.FC = () => {
	const f = useCurrentFrame();
	const a = t('6:04.3');
	const b = t('6:04.7');
	const w = tween(f, a, b, 0, 150);
	const bonk = f > b ? Math.sin((f - b) / 2.5) * 7 * Math.exp(-(f - b) / 10) : 0;
	const hl = tween(f, b, b + 6, 0, 0.3) * (1 - tween(f, t('6:05.6'), t('6:06.2'), 0, 1));
	return (
		<>
			<div style={{position: 'absolute', left: 922, top: 445, width: 516, height: 24, background: C.green, opacity: hl}} />
			<div style={{position: 'absolute', left: 936, top: 455 + bonk, width: w, height: 6, background: C.red, transform: 'rotate(-2deg)', transformOrigin: '0 50%', boxShadow: `0 0 12px ${C.red}`}} />
		</>
	);
};

const Card: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('5:50') || f >= t('5:51.8')) return null;
	const k = tween(f, t('5:50'), t('5:51.5'), 0, 1);
	const shrink = tween(f, t('5:51.3'), t('5:51.8'), 1, 0);
	const x = 1600 + (1070 - 1600) * k;
	const y = 760 + (678 - 760) * k;
	return (
		<div style={{position: 'absolute', left: x - 75, top: y - 96, width: 150, height: 96, background: '#F4F7F5', transform: `rotate(-6deg) scaleY(${shrink})`, transformOrigin: '50% 100%', padding: 10, boxSizing: 'border-box'}}>
			<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 15, color: C.bg}}>ALGORITMO</div>
			{[0, 1, 2].map((i) => (
				<div key={i} style={{height: 5, width: `${90 - i * 18}%`, background: '#B4C0B8', marginTop: 9}} />
			))}
		</div>
	);
};

/** Cuadrícula de «píxeles» que se revela sobre la pantalla del PC y deja ver las líneas. */
const PixelCover: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('5:52.2') || f >= t('5:53.4')) return null;
	const p = tween(f, t('5:52.4'), t('5:53.2'), 0, 1, (x) => x);
	const cw = SW / 16;
	const ch = SH / 9;
	return (
		<>
			{Array.from({length: 144}).map((_, i) => {
				if (rnd(i * 7.3 + 1) < p) return null;
				const flick = rnd(i + Math.floor(f / 3) * 17) < 0.3;
				return (
					<div key={i} style={{position: 'absolute', left: SX0 + (i % 16) * cw, top: SY0 + Math.floor(i / 16) * ch, width: cw, height: ch, background: flick ? C.green : '#0A0F0C'}} />
				);
			})}
		</>
	);
};

const PCScene: React.FC = () => {
	const f = useCurrentFrame();
	const {active, done} = progressState(f);
	const prog = tween(f, t('5:55'), T_DONE, 0, 1, (x) => x);
	const robotPose: RobotPose = f < t('5:49.5') ? 'wave' : f < t('5:51.8') ? 'hold' : 'idle';
	const robotFace: RobotFace = f < t('5:51.8') ? 'happy' : f < t('6:06') ? 'proud' : 'nerv';
	const robotChest = f < t('5:52') ? undefined : f < t('6:06') ? '✓' : '^_^;';
	const veeAct: [VeeAct, number] | undefined =
		f >= t('6:18') ? ['reposo', t('6:18')] : f >= t('6:14.5') ? ['explicar', t('6:14.5')] : f >= t('6:03.4') && f < t('6:10') ? ['senalar', t('6:03.4')] : undefined;
	// Mano fantasma que intenta tachar la línea 1
	const ghostOn = f >= t('6:03.6') && f < t('6:05.8');
	const gx = tween(f, t('6:03.6'), t('6:04.3'), 1400, 1000);
	const gy = tween(f, t('6:03.6'), t('6:04.3'), 620, 457);
	// Burbuja de pensamiento que rebota contra el monitor
	const bDelay = Math.max(0, f - t('6:13'));
	const bounce = f > t('6:13') ? Math.abs(Math.sin(bDelay / 5)) * 50 * Math.exp(-bDelay / 12) : 0;
	const bx = tween(f, t('6:12.4'), t('6:13'), 900, PCX);
	const by = tween(f, t('6:12.4'), t('6:13'), 170, 330) - bounce;
	const dim = tween(f, t('6:12'), t('6:14'), 0, 0.84);
	const chatIn = f >= t('6:21.5');
	const CHAT_X = 1300;
	const CHAT_Y = 720;

	return (
		<>
			<Cam keys={PC_KEYS}>
				<Board />
				<div style={{position: 'absolute', left: 0, top: FLOOR, width: 1920, height: 150, background: '#2A2A26'}} />
				{/* mesa y piso */}
				<div style={{position: 'absolute', left: 860, top: DESK, width: 840, height: 22, background: '#8A6446', boxShadow: '0 8px 0 #5B4030'}} />
				<div style={{position: 'absolute', left: 880, top: DESK + 22, width: 22, height: FLOOR - DESK - 22, background: '#5B4030'}} />
				<div style={{position: 'absolute', left: 1658, top: DESK + 22, width: 22, height: FLOOR - DESK - 22, background: '#5B4030'}} />

				{/* PC pixelado */}
				<PixelComputer x={PCX} y={DESK} scale={PS} at={t('5:47.4')} />
				<div style={{position: 'absolute', left: 1000, top: 670, width: 140, height: 8, background: '#050706', boxShadow: '0 1px 0 #7F8D86', opacity: f >= t('5:47.4') ? 1 : 0}} />

				{/* personajes */}
				<Vee x={520} at={t('5:47.4')} act={veeAct?.[0]} actAt={veeAct?.[1]} />
				<Robot x={1560} y={DESK} scale={4} at={t('5:47.4')} pose={robotPose} face={robotFace} chest={robotChest} />
				<Card />

				{/* pantalla: líneas del algoritmo */}
				{f >= t('5:52.2') && f < t('6:12.5') && (
					<div style={{position: 'absolute', left: SX0 + 6, top: SY0 + 8, width: SW - 12}}>
						<InstrCard x={0} y={0} w={SW - 12} lines={LINES} shownAt={LINE_SHOWN} active={active} done={done} size={15} title="cafe.txt" />
					</div>
				)}
				<PixelCover />
				{f >= t('5:52.4') && f < t('6:12.5') && <Shockwave at={t('5:52.4')} x={PCX} y={SY0 + SH / 2} size={700} thick={10} />}

				{/* tachadura que rebota y mano fantasma */}
				{f >= t('6:03.6') && f < t('6:06.2') && <Strike />}
				{ghostOn && (
					<div style={{position: 'absolute', left: gx - 28, top: gy - 28, width: 56, height: 56, borderRadius: '50%', border: `3px dashed ${C.white}`, opacity: 0.75}} />
				)}
				{ghostOn && (
					<Tag x={gx + 80} y={gy - 50} at={t('6:03.8')} out={t('6:05.8')} color={C.white} size={28}>es obvio</Tag>
				)}

				{/* programadores alrededor del PC */}
				<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
					{[-330, 0, 330].map((dx, i) => (
						<line key={i} x1={PCX + dx} y1={262} x2={PCX + (dx / 330) * 120} y2={336} stroke={C.green} strokeWidth={3} strokeDasharray={300} strokeDashoffset={300 * (1 - tween(f, t('6:09.5') + i * 3, t('6:11') + i * 3))} />
					))}
				</svg>
				<Dev x={PCX - 330} at={t('6:09')} />
				<Dev x={PCX} at={t('6:09.3')} />
				<Dev x={PCX + 330} at={t('6:09.6')} />

				{/* oscurecimiento y frase central */}
				<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: '#000', opacity: dim}} />
				<Bubble x={bx} y={by} at={t('6:12.4')} out={t('6:14.2')} size={44}>☕ perfecto</Bubble>
				<Frase />
				{chatIn && <ChatIcon x={CHAT_X} y={CHAT_Y} />}
			</Cam>

			{/* rótulos fijos (fuera de la cámara) */}
			{f >= t('5:52.4') && f < t('6:12') && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 56, display: 'flex', justifyContent: 'center'}}>
					<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.green, background: 'rgba(8,12,10,0.92)', border: `3px solid ${C.green}`, padding: '8px 26px', transform: `scale(${pop(f, t('5:52.4'), 12, 240, 0.6)})`}}>ALGORITMO → PROGRAMA</div>
				</div>
			)}
			{f >= t('5:55') && f < t('6:12') && (
				<div style={{position: 'absolute', left: 660, top: 950, width: 600, fontFamily: MONO, fontWeight: 800, fontSize: 26, color: C.dim}}>
					<div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
						<span>EJECUCIÓN</span>
						<span style={{color: C.green}}>{Math.round(prog * 100)} %</span>
					</div>
					<div style={{height: 12, background: C.line2}}>
						<div style={{width: `${prog * 100}%`, height: '100%', background: C.green}} />
					</div>
				</div>
			)}
			{f >= t('6:06') && f < t('6:08.6') && (
				<div style={{position: 'absolute', left: 640, top: 270, width: 640, height: 360, border: '8px solid #A9824F', background: '#2A1E14', overflow: 'hidden', filter: 'sepia(0.6)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}}>
					<div style={{position: 'absolute', left: 20, top: 16, fontFamily: MONO, fontWeight: 800, fontSize: 26, color: '#E6C79C'}}>ALGORITMO 1 · recuerdo</div>
					<Puddle size={tween(f, t('6:06.4'), t('6:07.6'), 0, 1)} x={320} y={300} />
				</div>
			)}
		</>
	);
};

/** Frase central en dos líneas con cursor de terminal y subrayado verde en INDICAMOS. */
const Frase: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('6:13.6')) return null;
	const p = pop(f, t('6:13.6'), 14, 200, 0.6);
	const y = tween(f, t('6:21'), t('6:22.5'), 360, 120);
	const ulW = tween(f, t('6:16.8'), t('6:17.4'), 0, 346);
	const breathe = 1 + 0.004 * Math.sin((f - t('6:18')) / 12);
	return (
		<div style={{position: 'absolute', left: 660, top: y, width: 1040, height: 270, background: 'rgba(8,12,10,0.94)', border: `3px solid ${C.green}`, boxShadow: `0 0 40px ${C.green}44`, opacity: Math.min(1, p * 1.5), transform: `scale(${(0.92 + 0.08 * p) * breathe})`}}>
			<TypeLine text="NO HACE LO QUE QUEREMOS." at={t('6:14.2')} x={60} y={45} center={false} size={64} color={C.white} cps={22} font={MONO} weight={800} />
			<TypeLine text="HACE LO QUE LE INDICAMOS." at={t('6:15.4')} x={60} y={145} center={false} size={64} color={C.white} cps={22} font={MONO} weight={800} />
			<div style={{position: 'absolute', left: 636, top: 232, width: ulW, height: 6, background: C.green, boxShadow: `0 0 16px ${C.green}`}} />
		</div>
	);
};

/** Icono de asistente de chat genérico: la carcasa se levanta y muestra engranajes. */
const ChatIcon: React.FC<{x: number; y: number}> = ({x, y}) => {
	const f = useCurrentFrame();
	const p = pop(f, t('6:21.5'), 14, 220, 0.6);
	const lid = tween(f, t('6:24'), t('6:25.2'), 0, 1);
	const rot = Math.max(0, f - t('6:24')) * 4;
	return (
		<div style={{position: 'absolute', left: x - 150, top: y - 120, width: 300, height: 240, transform: `scale(${0.6 + 0.4 * p})`}}>
			<div style={{position: 'absolute', inset: 0, background: C.panel, border: `4px solid ${C.green}`, opacity: lid, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24}}>
				<div style={{fontFamily: MONO, fontSize: 110, color: C.green, transform: `rotate(${rot}deg)`}}>⚙</div>
				<div style={{fontFamily: MONO, fontSize: 80, color: C.green, transform: `rotate(${-rot * 1.5}deg)`}}>⚙</div>
			</div>
			<div style={{position: 'absolute', inset: 0, background: C.white, borderRadius: 48, transformOrigin: '50% 0%', transform: `scaleY(${1 - lid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
				{[0, 1, 2].map((i) => (
					<div key={i} style={{width: 36, height: 36, borderRadius: '50%', background: C.bg, opacity: (Math.floor(f / 8) + i) % 3 === 0 ? 1 : 0.25}} />
				))}
			</div>
		</div>
	);
};

/* ------------------------------------------------------------ 6:28–6:55 · vuelta a la cocina */

const BOX_L = [260, 740, 1220];
const BOX_NAMES = ['SECUENCIA', 'DECISIÓN', 'REPETICIÓN'];
const BOX_AT = [t('6:31'), t('6:34'), t('6:37')];
const MOP = (
	<>
		<div style={{position: 'absolute', left: -5, top: 0, width: 10, height: 130, background: '#8A6446'}} />
		<div style={{position: 'absolute', left: -32, top: 126, width: 64, height: 14, background: '#EEF3F0'}} />
	</>
);

const KitchenB: React.FC = () => {
	const f = useCurrentFrame();
	const boxes = f < t('6:45');
	const warm = tween(f, t('6:50'), t('6:55'), 0, 1);
	const vx = tween(f, t('6:50'), t('6:55'), 420, 960);
	const puddle = f < t('6:45') ? 0 : 1 - tween(f, t('6:46'), t('6:50'), 0, 1);
	const sway = Math.sin((f - t('6:45')) / 14);
	const trainOff = (Math.max(0, f - t('6:31')) * 4) % 560;
	const spin = 1080 * tween(f, t('6:37.5'), t('6:40.5'), 0, 1, (x) => x);
	const count = f < t('6:37.5') ? 0 : Math.min(3, Math.floor((f - t('6:37.5')) / 24) + 1);
	const closeK = tween(f, t('6:41'), t('6:41.6'), 0, 1);

	const content = (i: number) => {
		if (i === 0) {
			return (
				<>
					<Tag x={220} y={36} at={BOX_AT[0]} color={C.green}>{BOX_NAMES[0]}</Tag>
					<div style={{position: 'absolute', left: 0, top: 200, width: 440, height: 6, background: C.line2}} />
					{[0, 1, 2, 3].map((k) => {
						const x = ((trainOff + k * 130) % 560) - 100;
						const loco = k === 0;
						return <div key={k} style={{position: 'absolute', left: x, top: 150, width: loco ? 80 : 70, height: loco ? 60 : 50, background: loco ? C.green : '#8A6446', border: '3px solid #0A0F0C'}} />;
					})}
				</>
			);
		}
		if (i === 1) {
			return (
				<>
					<Tag x={220} y={36} at={BOX_AT[1]} color={C.green}>{BOX_NAMES[1]}</Tag>
					<div style={{position: 'absolute', left: 20, top: 100, transform: 'scale(0.8)', transformOrigin: '0 0'}}>
						<ChoiceButton label="SÍ" color={C.green} pressAt={t('6:35.6')} />
					</div>
					<div style={{position: 'absolute', left: 240, top: 100, transform: 'scale(0.8)', transformOrigin: '0 0'}}>
						<ChoiceButton label="NO" color={C.red} />
					</div>
					<div style={{position: 'absolute', left: 90, top: 220, fontFamily: MONO, fontSize: 40, color: C.green}}>↓</div>
					<div style={{position: 'absolute', left: 310, top: 220, fontFamily: MONO, fontSize: 40, color: C.red}}>↓</div>
				</>
			);
		}
		return (
			<>
				<Tag x={220} y={36} at={BOX_AT[2]} color={C.green}>{BOX_NAMES[2]}</Tag>
				<div style={{position: 'absolute', left: 168, top: 220, transform: 'translate(0,0)'}}>
					<Cup fill="latte" />
				</div>
				<div style={{position: 'absolute', left: 208, top: 150, width: 24, height: 88, transform: `rotate(${spin}deg)`}}>
					<Spoon load="sugar" />
				</div>
				{count > 0 && <Counter key={count} x={360} y={250} value={count} at={t('6:37.5') + (count - 1) * 24} size={56} />}
			</>
		);
	};

	return (
		<Cam keys={KITCHEN_B_KEYS}>
			<Kitchen light={1} warm={warm} />
			{boxes &&
				BOX_L.map((bx, i) => {
					const p = pop(f, t('6:28.4') + i * 9, 14, 200, 0.6);
					const sc = Math.max(0.02, p * (1 - 0.75 * closeK));
					return (
						<div key={i} style={{position: 'absolute', left: bx, top: 60, width: 440, height: 280, background: C.panel, border: `3px solid ${C.green}`, boxShadow: `0 0 30px ${C.green}33`, overflow: 'hidden', transform: `scaleY(${sc})`}}>
							{content(i)}
						</div>
					);
				})}
			{boxes &&
				BOX_L.map((bx, i) => (
					<Stamp key={`st${i}`} x={bx + 220} y={200} at={t('6:41.6') + i * 4} text="PRÓXIMAMENTE" color={C.amber} size={34} />
				))}
			<Puddle size={puddle} x={1000} />
			<Vee x={vx} act={f >= t('6:41.6') && f < t('6:45') ? 'celebrar' : undefined} actAt={t('6:41.6')} />
			{f >= t('6:45') && <Robot x={1180 + 60 * sway} pose="stir" face="focus" flip={sway < 0} chest="✓" holdF={MOP} at={t('6:45')} />}
		</Cam>
	);
};

/* ------------------------------------------------------------ escena */

export const B6: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: C.bg}}>
			{f < t('5:47.4') && <KitchenA />}
			{f >= t('5:47.4') && f < t('6:28') && <PCScene />}
			{f >= t('6:28') && <KitchenB />}
			<CutFlash at={t('5:47.4')} />
			<CutFlash at={t('6:28')} />
			<Shockwave at={t('6:45')} x={1180} y={600} size={900} />
		</div>
	);
};

/* ------------------------------------------------------------ efectos de sonido */

export const sfxB6: Sfx[] = [
	s(t('5:45.0'), 'whoosh', 0.35),
	s(t('5:47.4'), 'hit', 0.3),
	s(t('5:47.8'), 'blip', 0.3),
	s(t('5:50.4'), 'enter', 0.3),
	s(t('5:52.4'), 'typing', 0.25, 90),
	s(t('5:53.0'), 'ac', 0.3),
	s(t('5:55.0'), 'key', 0.2),
	s(t('5:57.0'), 'key', 0.2),
	s(t('5:58.0'), 'key', 0.2),
	s(t('5:59.0'), 'key', 0.2),
	s(t('5:59.7'), 'key', 0.2),
	s(t('6:00.3'), 'key', 0.2),
	s(t('6:00.8'), 'key', 0.2),
	s(t('6:01.3'), 'key', 0.2),
	s(t('6:02.5'), 'ac', 0.3),
	s(t('6:04.8'), 'land', 0.3),
	s(t('6:06.0'), 'slide', 0.25, 120),
	s(t('6:09.2'), 'typing', 0.2, 80),
	s(t('6:14.2'), 'typing', 0.3, 60),
	s(t('6:16.5'), 'hit', 0.4),
	s(t('6:24.5'), 'ticks', 0.25),
	s(t('6:28.0'), 'whoosh', 0.35),
	s(t('6:31.2'), 'chop', 0.25),
	s(t('6:34.2'), 'blip', 0.25),
	s(t('6:34.6'), 'blip', 0.25),
	s(t('6:37.5'), 'ticks', 0.25),
	s(t('6:39.8'), 'ac', 0.3),
	s(t('6:41.0'), 'stack', 0.3),
	s(t('6:41.5'), 'stack', 0.3),
	s(t('6:42.0'), 'stack', 0.3),
	s(t('6:45.0'), 'whoosh', 0.3),
	s(t('6:46.0'), 'slide', 0.25, 150),
	s(t('6:50.0'), 'rise', 0.25),
];
