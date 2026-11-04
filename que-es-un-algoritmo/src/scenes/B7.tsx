import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO} from '@commons/theme';
import {inOutCubic, pop, tween} from '@commons/lib';
import {LogoMark} from '@commons/components';
import {Board, Cam, CamKey, Cup, ConceptCard, DetailSlider, Kitchen, RobotFace, RobotPose, Robot, TypeLine, Vee, VeeAct} from '../kit';
import {t} from '../timeline';
import {Sfx, s} from '../sfx';

/* Bloque 7 · cierre (6:55–7:30). Todos los tiempos son fotogramas absolutos vía t('m:ss'). */

const VEE_X = 420;
const ROBOT_X = 1250;
const CARD_Y = 380;
const SLOT_X = [560, 840, 1120, 1400];
const CARDS: [string, string][] = [['👣', 'PASOS'], ['🚃', 'SECUENCIA'], ['1-2-3', 'ORDEN'], ['🏁', 'FIN']];
const TILES: [string, string][] = [['🥣', 'RECETA'], ['2+3', 'SUMA'], ['🗺️', 'MAPA'], ['🥤', 'MÁQUINA']];

/** Cámara: plano general → 2P → push-in a Vee → 2P → corte al robot. */
const CAM: CamKey[] = [
	[t('6:55'), 1.1, 960, 540],
	[t('7:02'), 1.1, 1120, 540],
	[t('7:09'), 1.1, 1120, 540],
	[t('7:12'), 1.45, 520, 470],
	[t('7:16'), 1.1, 900, 540],
	[t('7:19'), 1.1, 900, 540],
	[t('7:19.4'), 1.1, 900, 540],
	[t('7:19.5'), 1.9, 1250, 690],
	[t('7:22'), 1.9, 1250, 690],
];

/** Acciones de Vee (la última que haya empezado). */
const VEE_CUES: [VeeAct, number][] = [
	['explicar', t('6:55')], ['explicar', t('7:02')], ['explicar', t('7:12')], ['saludar', t('7:16')], ['senalar', t('7:19')],
];

/** Trapeador (en la mano y, después, a la espalda). */
const Mop: React.FC = () => (
	<div style={{position: 'relative', width: 70, height: 200}}>
		<div style={{position: 'absolute', left: 31, top: 0, width: 8, height: 170, background: '#8A6446'}} />
		<div style={{position: 'absolute', left: 0, top: 150, width: 70, height: 46, background: '#DCE6E0', boxShadow: 'inset 0 -10px 0 #B9C3BE'}} />
	</div>
);

/** Bandeja con una taza (el robot la lleva al cruzar). */
const Tray: React.FC = () => (
	<div style={{position: 'relative', width: 64, height: 30}}>
		<div style={{position: 'absolute', left: 0, top: 22, width: 64, height: 8, background: '#8A6446'}} />
		<div style={{position: 'absolute', left: 16, top: 0}}>
			<Cup fill="latte" scale={2} />
		</div>
	</div>
);

/** Tarjeta pequeña de la escala de detalle; su palito baja hasta la barra del deslizador (y = 500). */
const Tarjeta: React.FC<{x: number; at: number; w: number; children: React.ReactNode}> = ({x, at, w, children}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 12, 240, 0.6);
	return (
		<>
			<div style={{position: 'absolute', left: x, top: 500, width: 4, height: 60, background: C.green, transform: 'translateX(-2px)', opacity: Math.min(1, p * 2)}} />
			<div
				style={{
					position: 'absolute', left: x, top: 500, width: w, transform: `translate(-50%, -100%) scale(${0.6 + 0.4 * p})`, transformOrigin: '50% 100%', opacity: Math.min(1, p * 2),
					background: 'rgba(14,17,15,0.96)', border: `3px solid ${C.green}`, padding: '14px 18px', fontFamily: MONO, fontWeight: 800, fontSize: 24, lineHeight: 1.3, color: C.text, whiteSpace: 'nowrap',
				}}
			>
				{children}
			</div>
		</>
	);
};

export const B7: React.FC = () => {
	const f = useCurrentFrame();

	// Fundido a negro: primero sale la cocina; después, la pantalla final; al final, otro fundido.
	const fade = f < t('7:22.4') ? tween(f, t('7:21.6'), t('7:22.4')) : tween(f, t('7:29.0'), t('7:29.97'));

	// Vee: la última acción que haya empezado.
	const cue = [...VEE_CUES].reverse().find(([, at]) => f >= at);

	// Robot: pose, cara y pecho según el momento.
	const robotPose: RobotPose = f >= t('7:06') && f < t('7:09') ? 'salute' : f >= t('7:16') && f < t('7:19') ? 'wave' : 'idle';
	const robotFace: RobotFace = f < t('6:57') ? 'focus' : f >= t('7:19.5') ? 'nerv' : f >= t('7:06') && f < t('7:09') ? 'proud' : 'happy';
	const chest = f >= t('7:19.5') ? '^_^;' : f >= t('7:13') ? '✓' : undefined;
	const mopInHand = f < t('7:19.5');

	// Gráficos del tramo 1 (tarjetas, carrusel, deslizador, lista) salen hacia 7:09.
	const graphOut = 1 - tween(f, t('7:08.6'), t('7:09.2'));

	// Tarjetas que vuelan desde fuera de cuadro y se funden en la ficha «ALGORITMO».
	const cardsEl = CARDS.map(([icon, label], i) => {
		const s0 = t('6:57') + i * 6;
		const y = tween(f, s0, s0 + 18, 1300, CARD_Y);
		const m = tween(f, t('7:00'), t('7:01.4'), 0, 1, inOutCubic);
		const x = SLOT_X[i] + (960 - SLOT_X[i]) * m;
		const vanish = 1 - tween(f, t('7:01.0'), t('7:01.6'));
		return (
			<div key={label} style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: f < t('7:02') ? vanish : 0}}>
				<ConceptCard icon={icon} label={label} size={1.1} />
			</div>
		);
	});
	const fichaP = pop(f, t('7:01.2'), 12, 240, 0.6);
	const fichaOut = tween(f, t('7:01.9'), t('7:02.2'));

	// Carrusel de viñetas (7:02–7:04).
	const carouselK = tween(f, t('7:02'), t('7:04'), 0, 3, inOutCubic);
	const carouselOpacity = (f < t('7:04.1') ? 1 : 0) * (f >= t('7:02') ? 1 : 0);
	const sliderIn = tween(f, t('7:04.1'), t('7:04.5'));

	// Trazo y lista ☐☐☐ (7:12–7:19).
	const listOut = 1 - tween(f, t('7:18.6'), t('7:19'));
	const drawn = tween(f, t('7:12'), t('7:13.2'));
	const boxes = [680, 860, 1040];
	const checks = [t('7:13.5'), t('7:14.2'), t('7:14.9')];

	// Cruce del robot con la bandeja (7:26–7:28.8).
	const crossX = tween(f, t('7:26'), t('7:28.8'), -200, 2120, (v) => v);
	const pulse = f >= t('7:28') && f < t('7:28.8') ? 1 + 0.06 * Math.sin(((f - t('7:28')) / (t('7:28.8') - t('7:28'))) * Math.PI) : 1;
	const logoP = tween(f, t('7:26'), t('7:27.2'));

	return (
		<>
			{f < t('7:22.4') && (
				<Cam keys={CAM} shakeAt={[t('7:19.5')]}>
					<Kitchen light={1} warm={1} flame />

					{/* Tramo de las tarjetas */}
					{f < t('7:02') && cardsEl}
					{f >= t('7:01.2') && f < t('7:02.2') && (
						<div
							style={{
								position: 'absolute', left: 960, top: CARD_Y, transform: `translate(-50%, -50%) scale(${0.3 + 0.7 * fichaP})`, opacity: 1 - fichaOut,
								fontFamily: MONO, fontWeight: 800, fontSize: 110, color: C.green, background: 'rgba(0,192,99,0.14)', border: `6px solid ${C.green}`,
								padding: '30px 60px', boxShadow: `0 0 60px ${C.green}55`, whiteSpace: 'nowrap',
							}}
						>
							ALGORITMO
						</div>
					)}

					{/* Carrusel en miniatura */}
					{f >= t('7:02') && f < t('7:04.1') && (
						<div style={{position: 'absolute', left: 760, top: 330, width: 1000, height: 260, overflow: 'hidden', opacity: carouselOpacity}}>
							<div style={{position: 'absolute', left: 20 - carouselK * 400, top: 0, display: 'flex', gap: 40}}>
								{TILES.map(([icon, label]) => (
									<div
										key={label}
										style={{
											width: 360, height: 260, flexShrink: 0, background: '#0E110F', border: `4px solid ${C.green}`,
											display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
										}}
									>
										<div style={{fontSize: 120, lineHeight: 1, fontFamily: MONO, fontWeight: 800, color: C.white}}>{icon}</div>
										<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.green}}>{label}</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Deslizador GENERAL ←→ DETALLADO con tarjetas 1 y 2 */}
					{f >= t('7:04.1') && f < t('7:09.2') && (
						<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: sliderIn * graphOut}}>
							<DetailSlider x={ROBOT_X - 0.62 * 1100} y={498} w={1100} knob={tween(f, t('7:04.2'), t('7:05.8'), 0.05, 0.62)} />
							<Tarjeta x={898} at={t('7:04.5')} w={280}>Preparar café</Tarjeta>
							<Tarjeta x={ROBOT_X} at={t('7:05.3')} w={300}>
								1. Tomar taza
								<br />
								2. Verter agua
								<br />
								3. Revolver
							</Tarjeta>
						</div>
					)}

					{/* Lista ☐☐☐ que Vee dibuja y se marca */}
					{f >= t('7:12') && f < t('7:19') && (
						<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: listOut}}>
							<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
								<path d="M 540 470 L 1180 470" fill="none" stroke={C.green} strokeWidth={8} strokeLinecap="round" strokeDasharray={640} strokeDashoffset={640 * (1 - drawn)} />
							</svg>
							{boxes.map((bx, i) => {
								const bp = pop(f, t('7:13.2') + i * 4, 12, 240, 0.6);
								return (
									<div
										key={bx}
										style={{
											position: 'absolute', left: bx - 55, top: 415, width: 110, height: 110, background: C.bg, border: `6px solid ${C.green}`,
											transform: `scale(${bp})`, display: 'flex', alignItems: 'center', justifyContent: 'center',
											fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.green,
										}}
									>
										{f >= checks[i] ? '✓' : ''}
									</div>
								);
							})}
						</div>
					)}

					{/* Vee y el robot */}
					<Vee x={VEE_X} act={cue?.[0]} actAt={cue?.[1]} />

					{/* Trapeador a la espalda del robot (detrás del cuerpo) */}
					{!mopInHand && (
						<div style={{position: 'absolute', left: ROBOT_X + 50, top: 600, transform: 'rotate(-12deg)'}}>
							<Mop />
						</div>
					)}
					<Robot
						x={ROBOT_X}
						pose={robotPose}
						face={robotFace}
						chest={chest}
						holdF={mopInHand ? <Mop /> : undefined}
					/>
				</Cam>
			)}

			{/* Pantalla final, logo y cruce del robot */}
			{f >= t('7:22.4') && <Board />}
			{f >= t('7:22.4') && (
				<>
					<TypeLine text="PRIMERO PENSAMOS LA SOLUCIÓN." at={t('7:22.6')} x={960} y={360} size={76} color={C.white} />
					<TypeLine text="DESPUÉS CONSTRUIMOS EL ALGORITMO." at={t('7:24')} x={960} y={470} size={76} color={C.green} />
				</>
			)}
			{f >= t('7:26') && (
				<>
					<div
						style={{
							position: 'absolute', left: 960, top: 620, transform: `translate(-50%, -50%) scale(${pulse})`,
							opacity: Math.min(1, logoP * 2),
						}}
					>
						<LogoMark height={130} p={logoP} glow={18} />
					</div>
					<div
						style={{
							position: 'absolute', left: 960, top: 745, transform: 'translate(-50%, -50%)', fontFamily: MONO, fontWeight: 800,
							fontSize: 28, color: C.dim, letterSpacing: 4, opacity: tween(f, t('7:26.8'), t('7:27.2')), whiteSpace: 'nowrap',
						}}
					>
						GOSLINT · UCEVA
					</div>
					<TypeLine text="Próxima lección: Pseudocódigo" at={t('7:27')} x={960} y={810} size={40} font={MONO} weight={800} color={C.green} cps={30} />
				</>
			)}
			{f >= t('7:26') && f < t('7:28.8') && <Robot x={crossX} y={1050} scale={2.5} pose="walk" face="happy" holdF={<Tray />} />}

			{/* Fundidos a negro */}
			<div style={{position: 'absolute', inset: 0, background: '#000', opacity: fade, pointerEvents: 'none'}} />
		</>
	);
};

export const sfxB7: Sfx[] = [
	s(t('6:57'), 'pop', 0.25), s(t('6:57.3'), 'pop', 0.25), s(t('6:57.6'), 'pop', 0.25), s(t('6:57.9'), 'pop', 0.25),
	s(t('7:00'), 'rise', 0.3),
	s(t('7:01.2'), 'ac', 0.3),
	s(t('7:02'), 'slide', 0.25),
	s(t('7:04.2'), 'ticks', 0.25),
	s(t('7:04.5'), 'pop', 0.2),
	s(t('7:05.3'), 'pop', 0.2),
	s(t('7:06'), 'ac', 0.3),
	s(t('7:12'), 'draw', 0.3),
	s(t('7:13.5'), 'ticks', 0.3), s(t('7:14.2'), 'ticks', 0.3), s(t('7:14.9'), 'ticks', 0.3),
	s(t('7:19.5'), 'blip', 0.3),
	s(t('7:22.6'), 'typing', 0.3),
	s(t('7:25.6'), 'ac', 0.3),
	s(t('7:26'), 'blip', 0.3),
	s(t('7:26.4'), 'whoosh', 0.25),
	s(t('7:28'), 'pop', 0.25),
];
