import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inCubic, pop, tween} from '@commons/lib';
import {CutFlash, LogoMark, Shockwave, Spot, WipeBar} from '@commons/components';
import {Board, Bubble, Cam, CamKey, CoffeeBag, Kitchen, MilkJug, Question, Robot, RobotFace, RobotPose, RobotSays, TABLE_Y, TypeLine, Vee, VeeAct} from '../kit';
import {Sfx, s} from '../sfx';
import {t} from '../timeline';

/* Bloque 1 · INTRODUCCIÓN (0:00–0:45): escenas 1.1, 1.2 y 1.3 del storyboard. */

const VEE_X = 450;
const ROBOT_X = 1480;
const MILK_X = 1240;
const BAG_X = 1620;

/** Cámara: push-in lento (1.1), cortes de gag (1.2) y zoom a Vee (1.3). Plano 2P = zoom 1.1 centrado. */
const CAM: CamKey[] = [
	[t('0:00'), 1, 960, 540],
	[t('0:04.8'), 1.1, 960, 560],
	[t('0:05'), 1.5, 1230, 600], // corte a PM del robot
	[t('0:06.4'), 1.5, 1230, 600],
	[t('0:07.6'), 1.1, 960, 560], // paneo a 2P
	[t('0:08.8'), 1.1, 960, 560],
	[t('0:11'), 1.45, 660, 600], // zoom-in a Vee (duda)
	[t('0:11.4'), 1.1, 960, 560],
	[t('0:14.6'), 1.1, 960, 560],
	[t('0:15'), 1.45, 1200, 640], // zoom-punch a la pantalla del robot
	[t('0:19.8'), 1.45, 1200, 640],
	[t('0:20'), 1.1, 960, 560], // corte a 2P
	[t('0:22'), 1.1, 960, 560],
	[t('0:23'), 1.4, 1230, 600], // paneo hacia la bolsa
	[t('0:25'), 1.5, 1230, 520], // tilt-up con el trofeo
	[t('0:27'), 1.5, 1230, 520],
	[t('0:27.1'), 1.5, 700, 540], // corte a PM de Vee
	[t('0:28.6'), 1.5, 700, 540],
	[t('0:29.2'), 1.1, 960, 560], // vuelta a 2P
	[t('0:32.2'), 1.1, 960, 560],
	[t('0:36'), 1.1, 960, 560],
	[t('0:38'), 1.4, 686, 600], // zoom lento a Vee
];

/** Vee: la acción activa es la última cuyo inicio ya pasó. */
const VEE_ACTS: {act: VeeAct; at: number}[] = [
	{act: 'pensar', at: t('0:09')},
	{act: 'senalar', at: t('0:12')},
	{act: 'sorpresa', at: t('0:20')},
	{act: 'senalar', at: t('0:22')},
	{act: 'pensar', at: t('0:27')},
	{act: 'explicar', at: t('0:32')},
	{act: 'senalar', at: t('0:36')},
];
const veeAct = (f: number) => {
	let cur: {act: VeeAct; at: number} | undefined;
	for (const a of VEE_ACTS) if (f >= a.at) cur = a;
	return cur;
};

/** Luz de la cocina: parpadeo de arranque y encendido completo. */
const lightAt = (f: number): number => {
	const on = t('0:01');
	if (f < on) return 0;
	const k = f - on;
	if (k < 14) return [0.15, 0.7, 0.1, 0.55, 0.9, 0.35, 0.8][Math.min(6, Math.floor(k / 2))];
	return tween(f, on + 14, t('0:02.2'), 0.8, 1);
};

/** Postura del robot: apagado → idle → saludo → gag de preparación → trofeo → reposo. */
const robotPose = (f: number): RobotPose => {
	if (f < t('0:03')) return 'off';
	if (f < t('0:05')) return 'idle';
	if (f < t('0:06')) return 'salute';
	if (f < t('0:16')) return 'idle';
	if (f < t('0:18')) return 'stretch';
	if (f < t('0:22')) return 'squat';
	if (f < t('0:22.5')) return 'idle';
	if (f < t('0:23.5')) return 'point';
	if (f < t('0:25')) return 'hold';
	if (f < t('0:32')) return 'trophy';
	if (f < t('0:33')) return 'hold';
	return 'idle';
};

const robotTilt = (f: number): number => {
	if (f < t('0:03')) return 14; // encorvado
	if (f < t('0:03.3')) return 7; // primer clic mecánico
	if (f < t('0:03.6')) return 3; // segundo clic
	if (f >= t('0:11') && f < t('0:12')) return 10; // imita a Vee
	if (f >= t('0:24') && f < t('0:25')) return 6 * Math.sin((f - t('0:24')) / 3); // sacude la bolsa
	if (f >= t('0:29') && f < t('0:32')) return 5 * Math.sin((f - t('0:29')) / 6); // se balancea
	return 0;
};

const robotFace = (f: number): RobotFace => {
	if (f < t('0:03')) return 'off';
	if (f < t('0:03.6')) return 'blink';
	if (f < t('0:11')) return 'happy';
	if (f < t('0:16')) return 'focus';
	if (f < t('0:20')) return 'happy';
	if (f < t('0:22')) return 'wow';
	if (f < t('0:25')) return 'focus';
	if (f < t('0:33')) return 'proud';
	return 'happy';
};

/** Glifo de la pantalla del pecho. */
const robotChest = (f: number): {glyph?: string; color?: string} => {
	if (f < t('0:01.5')) return {};
	if (f < t('0:11')) return {glyph: '•'};
	if (f < t('0:14')) return {glyph: '?', color: '#FFB547'};
	if (f < t('0:18')) return {glyph: '•'};
	if (f < t('0:20')) return {glyph: '2/10'};
	if (f < t('0:25')) return {glyph: '•'};
	if (f < t('0:33')) return {glyph: '✓'};
	return {};
};

/** Objeto sobre la mesa que entra con un rebote. */
const Item: React.FC<{x: number; y: number; at: number; children: React.ReactNode}> = ({x, y, at, children}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 11, 240, 0.6);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translateY(${(1 - p) * -60}px) scale(${0.5 + 0.5 * p})`, transformOrigin: '50% 100%', opacity: Math.min(1, p * 2)}}>
			{children}
		</div>
	);
};

/** Flecha verde de Vee que rebota hacia la bolsa. */
const Arrow: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('0:22') || f >= t('0:23.3')) return null;
	const grow = tween(f, t('0:22'), t('0:22.9'));
	const bounce = f > t('0:22.9') ? 14 * Math.abs(Math.sin((f - t('0:22.9')) / 3)) : 0;
	const len = 1000 * grow + bounce;
	return (
		<div style={{position: 'absolute', left: 600, top: 556, width: len, height: 12, background: C.green}}>
			<div style={{position: 'absolute', right: -24, top: -14, width: 0, height: 0, borderTop: '20px solid transparent', borderBottom: '20px solid transparent', borderLeft: `26px solid ${C.green}`}} />
		</div>
	);
};

/** Burbuja «PREPARA CAFÉ» que se parte en dos piezas («prepara» y «café»). */
const Crack: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('0:34') || f >= t('0:38')) return null;
	const p = pop(f, t('0:34'), 11, 240, 0.6);
	const split = tween(f, t('0:35.8'), t('0:36.8'));
	const crackIn = tween(f, t('0:35.2'), t('0:35.6')) * (1 - split);
	const fade = 1 - tween(f, t('0:37'), t('0:38'));
	const gap = 70 * split;
	const half: React.CSSProperties = {position: 'absolute', top: 0, width: 310, height: 120, background: C.white, display: 'flex', alignItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 60, color: C.bg, whiteSpace: 'nowrap', boxSizing: 'border-box'};
	return (
		<div style={{position: 'absolute', left: 650, top: 380, width: 620, height: 120, transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2) * fade}}>
			<div style={{...half, left: -gap, justifyContent: 'flex-end', paddingRight: 18, borderRadius: '26px 0 0 26px', transform: `rotate(${-6 * split}deg)`}}>PREPARA</div>
			<div style={{...half, left: 310 + gap, justifyContent: 'flex-start', paddingLeft: 18, borderRadius: '0 26px 26px 0', transform: `rotate(${6 * split}deg)`}}>CAFÉ</div>
			<svg width={620} height={120} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: crackIn}}>
				<polyline points="310,-6 326,22 300,44 330,70 306,100 320,126" fill="none" stroke={C.bg} strokeWidth={6} strokeLinejoin="round" />
			</svg>
		</div>
	);
};

/** Lista de 3 casillas que Vee dibuja en el aire, luego vuela hacia la cámara. */
const TRACE = 'M 540 600 Q 620 420 740 280';
const BOX_X = 740;
const BOX_Y = [250, 330, 410];
const Checklist: React.FC = () => {
	const f = useCurrentFrame();
	const op = 1 - tween(f, t('0:40.4'), t('0:41'));
	if (f < t('0:38') || op <= 0) return null;
	const trace = tween(f, t('0:38'), t('0:39'));
	const fly = tween(f, t('0:40'), t('0:41'), 0, 1, inCubic);
	const k = 1 + 2.5 * fly;
	const cx = 770;
	const cy = 330;
	return (
		<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
			<g transform={`translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`} opacity={op}>
				<path d={TRACE} pathLength={100} fill="none" stroke={C.green} strokeWidth={6} strokeLinecap="round" strokeDasharray={100} strokeDashoffset={100 * (1 - trace)} />
				{BOX_Y.map((y, i) => {
					const a = t('0:39') + i * 9;
					return <rect key={i} x={BOX_X} y={y} width={60} height={60} fill="none" stroke={C.green} strokeWidth={5} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - tween(f, a, a + 12))} />;
				})}
			</g>
		</svg>
	);
};

/** Fondo de la escena: oscuro al inicio, luz que se enciende. */
const Lamp: React.FC<{on: boolean}> = ({on}) => (
	<>
		<div style={{position: 'absolute', left: 930, top: 0, width: 60, height: 14, background: on ? '#FFF3C4' : '#2A2A26'}} />
		{on && <Spot x={960} y={40} r={480} color="255,243,196" amt={0.2} />}
	</>
);

export const B1: React.FC = () => {
	const f = useCurrentFrame();

	if (f < t('0:01')) {
		const lampOn = (f >= 6 && f < 12) || (f >= 15 && f < 20);
		return (
			<AbsoluteFill style={{background: C.bg}}>
				<Board />
				<Lamp on={lampOn} />
			</AbsoluteFill>
		);
	}

	const light = lightAt(f);
	const act = veeAct(f);
	const chest = robotChest(f);
	const bagOnTable = (f >= t('0:08') && f < t('0:23.4')) || f >= t('0:33.2');
	const bagAt = f < t('0:23.4') ? t('0:08') : t('0:33.2');
	const dark = (1 - light) * 0.92;
	const spotAmt = f >= t('0:25') ? 0.25 * (1 - tween(f, t('0:28'), t('0:30'))) : 0;
	const boardOpacity = tween(f, t('0:40.2'), t('0:40.8'));
	const robotEndY = tween(f, t('0:43'), t('0:44.3'), 1180, 1010);

	return (
		<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
			<Cam keys={CAM}>
				{/* 1.1 · cocina que se enciende */}
				<Kitchen light={light} cupOnShelf={f >= t('0:08.7')} stove={false} />
				{bagOnTable && (
					<Item x={BAG_X} y={TABLE_Y - 104} at={bagAt}>
						<CoffeeBag />
					</Item>
				)}
				<Item x={MILK_X} y={TABLE_Y - 96} at={t('0:08.33')}>
					<MilkJug />
				</Item>
				<Vee x={VEE_X} at={t('0:06')} entra act={act?.act} actAt={act?.at} />
				<Question x={VEE_X} y={590} at={t('0:09')} out={t('0:11.5')} />
				<Robot
					x={ROBOT_X}
					at={t('0:01')}
					pose={robotPose(f)}
					face={robotFace(f)}
					tilt={robotTilt(f)}
					chest={chest.glyph}
					chestColor={chest.color}
					holdF={f >= t('0:23.5') && f < t('0:33') ? <div style={{transform: f >= t('0:25') && f < t('0:32') ? 'translate(-6px, -70px)' : undefined}}><CoffeeBag /></div> : undefined}
				/>

				{/* 1.2 · «Prepara café» */}
				<Bubble x={tween(f, t('0:13'), t('0:14'), 620, ROBOT_X - 60)} y={560} at={t('0:12.4')} out={t('0:14.3')}>
					PREPARA CAFÉ
				</Bubble>
				<RobotSays x={ROBOT_X} y={600} at={t('0:05')} out={t('0:07')}>LISTO</RobotSays>
				<RobotSays x={ROBOT_X} y={600} at={t('0:14.3')} out={t('0:15')}>▓▓▓░░</RobotSays>
				<RobotSays x={ROBOT_X} y={600} at={t('0:15')} out={t('0:18')}>
					PREPARAR → <span style={{textDecoration: 'underline'}}>prepararse</span>
				</RobotSays>
				<RobotSays x={ROBOT_X} y={600} at={t('0:25.5')} out={t('0:29.3')}>CAFÉ ✓</RobotSays>
				<Arrow />
				<Shockwave at={t('0:25')} x={ROBOT_X} y={650} size={900} />
				<Spot x={ROBOT_X} y={700} r={320} amt={spotAmt} />

				{/* 1.3 · «Necesito un algoritmo» */}
				<Crack />
				<Checklist />

				{/* oscurecimiento de la cocina apagada (también sobre personajes y objetos) */}
				{dark > 0.003 && <AbsoluteFill style={{background: '#000', opacity: dark, pointerEvents: 'none'}} />}
			</Cam>

			{/* rótulos y transición: fuera de la cámara */}
			{f >= t('0:40') && <WipeBar at={t('0:40')} dur={14} />}
			{f >= t('0:40.2') && <Board opacity={boardOpacity} />}
			<TypeLine text="¿QUÉ ES UN ALGORITMO?" at={t('0:40.5')} x={960} y={430} size={120} cps={8} color={C.white} />
			{f >= t('0:43') && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
					<LogoMark height={110} p={tween(f, t('0:43'), t('0:44'))} glow={18} />
					<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.green, opacity: tween(f, t('0:43.6'), t('0:44.2'))}}>GOSLINT · Fase 1</div>
				</div>
			)}
			{f >= t('0:43') && <Robot x={1600} y={robotEndY} pose="wave" face="happy" />}
			<CutFlash at={t('0:43')} len={5} max={0.5} />
		</AbsoluteFill>
	);
};

export const sfxB1: Sfx[] = [
	s(t('0:00'), 'pop', 0.25), s(t('0:00.5'), 'pop', 0.25), s(t('0:01'), 'rise', 0.2),
	s(t('0:03'), 'ticks', 0.2), s(t('0:03.3'), 'ticks', 0.2), s(t('0:03.6'), 'blip', 0.2),
	s(t('0:05'), 'hit', 0.2),
	s(t('0:08'), 'pop', 0.25), s(t('0:08.33'), 'pop', 0.25), s(t('0:08.66'), 'pop', 0.25),
	s(t('0:09'), 'whoosh', 0.3), s(t('0:11'), 'blip', 0.2),
	s(t('0:14'), 'blip', 0.2), s(t('0:14.33'), 'blip', 0.2), s(t('0:14.66'), 'blip', 0.2),
	s(t('0:15'), 'ac', 0.3),
	s(t('0:16'), 'ticks', 0.18), s(t('0:16.5'), 'ticks', 0.18), s(t('0:17'), 'ticks', 0.18),
	s(t('0:18'), 'boing', 0.3), s(t('0:19'), 'boing', 0.3),
	s(t('0:20'), 'slash', 0.3),
	s(t('0:22'), 'whoosh', 0.3),
	s(t('0:23.4'), 'debris', 0.2),
	s(t('0:25'), 'rise', 0.3), s(t('0:25.4'), 'ac', 0.25),
	s(t('0:29.5'), 'blip', 0.2),
	s(t('0:32.5'), 'hit', 0.2),
	s(t('0:34.5'), 'glitch', 0.25),
	s(t('0:37.8'), 'riser', 0.25), s(t('0:38'), 'draw', 0.3, t('0:40') - t('0:38')),
	s(t('0:40'), 'whoosh', 0.3), s(t('0:40.5'), 'typing', 0.3, t('0:43') - t('0:40.5')),
	s(t('0:43'), 'hit', 0.4), s(t('0:43.5'), 'enter', 0.25),
];
