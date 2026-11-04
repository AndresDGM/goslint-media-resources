import React from 'react';
import {Freeze, useCurrentFrame} from 'remotion';
import {C, MONO} from '@commons/theme';
import {pop, tween} from '@commons/lib';
import {
	Cam, CamKey, Clap, ChoiceButton, Counter, Cup, CupFill, CornerTag, Falling, FLOOR, InstrCard, Kettle, Kitchen, Line, MeasureJug,
	Pour, Robot, RobotPose, RobotFace, RobotSays, Spoon, SugarBowl, Tag, VHS, Vee, VeeAct, CoffeeJar, TABLE_Y,
} from '../kit';
import {t} from '../timeline';
import {Sfx, s} from '../sfx';

/* ---------------------------------------------------------------- helpers del bloque */

/** ¿Está el fotograma dentro de [a, b)? (tiempos del storyboard). */
const between = (f: number, a: string, b: string) => f >= t(a) && f < t(b);

/** Valor del primer tramo [a, b) que contiene f (o `d`). */
const pick = <T,>(f: number, segs: [string, string, T][], d: T): T => {
	for (const [a, b, v] of segs) if (between(f, a, b)) return v;
	return d;
};

/** Trayectoria: interpola (suavizada) entre claves [tiempo, valor] ordenadas. */
const along = (f: number, keys: [string, number][]): number => {
	const k = keys.map(([a, v]) => [t(a), v] as [number, number]);
	if (f <= k[0][0]) return k[0][1];
	for (let i = 0; i < k.length - 1; i++) {
		const [a, va] = k[i];
		const [b, vb] = k[i + 1];
		if (f <= b) {
			const u = (f - a) / Math.max(1, b - a);
			return va + (vb - va) * (u * u * (3 - 2 * u));
		}
	}
	return k[k.length - 1][1];
};

/** Último valor cuyo tiempo ya llegó (para ▶ / ✓ de la tarjeta y acciones de Vee). */
const latest = <T,>(f: number, list: [string, T][], d: T): T => {
	let v = d;
	for (const [a, x] of list) if (f >= t(a)) v = x;
	return v;
};

/** Aparece con rebote desde su esquina inferior (ancla: pies del objeto). */
const Appear: React.FC<{x: number; y: number; at: number; out?: number; children: React.ReactNode}> = ({x, y, at, out, children}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 12, 220, 0.6);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `scale(${0.2 + 0.8 * p})`, transformOrigin: '50% 100%', opacity: Math.min(1, p * 2)}}>
			{children}
		</div>
	);
};

/** Pergamino que se desenrolla hacia abajo y luego se disuelve en la tarjeta. */
const Scroll: React.FC = () => {
	const f = useCurrentFrame();
	if (f < t('3:37') || f >= t('3:40.5')) return null;
	const h = 40 + 380 * tween(f, t('3:37'), t('3:39'));
	const o = 1 - tween(f, t('3:39.2'), t('3:40.5'));
	return (
		<div style={{position: 'absolute', left: 1260, top: 150, width: 420, height: h, background: '#E9DFC4', border: '6px solid #8A6446', opacity: o, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
			<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 32, color: '#2A160C', padding: '20px 24px'}}>ALGORITMO 2</div>
			{Array.from({length: 9}).map((_, i) => (
				<div key={i} style={{position: 'absolute', left: 28, top: 100 + i * 36, width: 364 - (i % 3) * 60, height: 6, background: '#B9A77E'}} />
			))}
		</div>
	);
};

/* ---------------------------------------------------------------- tarjeta del algoritmo 2 */

const LINES: Line[] = [
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

/** Línea activa (▶) del algoritmo. Índice = número de paso (L1 = índice 1). */
const ACTIVE: [string, number][] = [
	['3:41', 1], ['3:43.5', -1], ['3:45', 2], ['3:55', 3], ['4:05', 4], ['4:11.2', 5],
	['4:25', 7], ['4:28.5', 8], ['4:30', 9], ['4:36', -1], ['4:38', 10],
];
/** Líneas ya ejecutadas (✓). */
const DONE: [string, number][] = [
	['3:43.5', 1], ['3:51.5', 2], ['4:04', 3], ['4:09.2', 4], ['4:23', 5], ['4:28.5', 7], ['4:29', 8], ['4:36', 9],
];

/* ---------------------------------------------------------------- robot y Vee */

/** Trayectoria horizontal del robot (centro). La mano delantera queda ~88 px a su derecha. */
const RX: [string, number][] = [
	['3:35', 1700], ['3:40.5', 1700], ['3:41.8', 1557], ['3:42.3', 1557], ['3:43.2', 1162], ['3:45.9', 1162],
	['3:46.8', 1388], ['3:48.6', 1388], ['3:49.3', 1162], ['3:49.9', 1162], ['3:50.4', 1388], ['3:51.0', 1388],
	['3:51.5', 1162], ['3:55.0', 1162], ['3:55.8', 1540], ['3:57.4', 1540], ['3:58.0', 1328], ['4:00.0', 1328],
	['4:00.8', 1540], ['4:04.8', 1540], ['4:05.4', 1540], ['4:06.4', 1134], ['4:09.8', 1134], ['4:10.6', 1162],
	['4:29.5', 1162], ['4:30.2', 1282], ['4:31.4', 1282], ['4:31.9', 1162], ['4:32.0', 1162], ['4:32.5', 1282],
	['4:33.2', 1282], ['4:33.6', 1162], ['4:34.0', 1162], ['4:34.5', 1190], ['4:37.0', 1190], ['4:37.6', 1162],
];

const POSE: [string, string, RobotPose][] = [
	['3:37', '3:39.5', 'present'], ['3:40.5', '3:41.8', 'walk'], ['3:41.8', '3:42.3', 'reach'], ['3:42.3', '3:43.2', 'walk'],
	['3:43.2', '3:43.6', 'reach'], ['3:45.9', '3:46.8', 'walk'], ['3:46.8', '3:48.0', 'point'], ['3:48.0', '3:48.6', 'reach'],
	['3:48.6', '3:49.3', 'walk'], ['3:49.3', '3:49.9', 'pour'], ['3:50.3', '3:50.9', 'reach'], ['3:50.9', '3:51.5', 'walk'],
	['3:51.5', '3:52.9', 'pour'], ['3:55.0', '3:55.8', 'walk'], ['3:57.4', '3:58.0', 'walk'], ['3:58.0', '4:00.0', 'hold'],
	['4:00.0', '4:00.8', 'walk'], ['4:00.8', '4:02.0', 'pour'], ['4:04.8', '4:05.4', 'reach'], ['4:05.4', '4:06.4', 'walk'],
	['4:06.4', '4:09.8', 'pour'], ['4:29.5', '4:30.2', 'walk'], ['4:30.2', '4:31.4', 'reach'], ['4:31.4', '4:31.9', 'walk'],
	['4:31.9', '4:32.0', 'pour'], ['4:32.0', '4:32.5', 'walk'], ['4:32.5', '4:33.2', 'reach'], ['4:33.2', '4:33.6', 'walk'],
	['4:33.6', '4:34.0', 'pour'], ['4:34.0', '4:34.5', 'walk'], ['4:34.5', '4:36.0', 'reach'],
];

const FACE: [string, string, RobotFace][] = [
	['3:37', '3:39.5', 'wow'], ['3:41.8', '3:43.6', 'focus'], ['3:43.6', '3:45.9', 'happy'], ['3:45.9', '3:52.9', 'focus'],
	['3:52.9', '3:55.0', 'happy'], ['3:55.0', '4:02.0', 'focus'], ['4:02.0', '4:04.8', 'wow'], ['4:04.8', '4:06.4', 'focus'],
	['4:06.4', '4:09.8', 'happy'], ['4:09.8', '4:29.5', 'focus'], ['4:29.5', '4:34.5', 'focus'], ['4:34.5', '4:36.0', 'wow'],
	['4:36.0', '4:45.0', 'proud'],
];

const CHEST: [string, string, string][] = [['4:07', '4:09.8', '^_^'], ['4:36', '4:45', '✓']];

/** Objeto que el robot lleva en la mano delantera según el momento. */
const SPOON_COFFEE: [string, string][] = [['3:48.4', '3:49.4'], ['3:50.5', '3:51.1']];
const SPOON_SUGAR: [string, string][] = [['4:30.6', '4:35.5']];

/** Vee: acciones (clip, inicio). Cada una dura ~2,3 s. */
const VEE_ACTS: [string, VeeAct][] = [
	['3:37', 'explicar'], ['3:43.5', 'celebrar'], ['3:47', 'senalar'], ['3:52.5', 'celebrar'], ['4:07', 'sorpresa'],
	['4:13', 'sorpresa'], ['4:21', 'senalar'], ['4:27', 'senalar'], ['4:36', 'celebrar'],
];

/* ---------------------------------------------------------------- cámara */

const CAM: CamKey[] = [
	[t('3:35'), 1, 960, 540],
	[t('4:03.8'), 1, 960, 540],
	[t('4:04.1'), 1.08, 1000, 540],   // zoom-punch del silbido
	[t('4:04.6'), 1, 960, 540],
	[t('4:05.6'), 1.3, 1180, 650],    // PD de la taza
	[t('4:09.6'), 1.3, 1180, 650],
	[t('4:10.6'), 1, 960, 540],
	[t('4:22.6'), 1, 960, 540],
	[t('4:23.2'), 1.06, 1100, 500],   // zoom-punch al pulsar SÍ
	[t('4:24.0'), 1, 960, 540],
	[t('4:29.8'), 1.3, 1180, 650],    // PD del azucarero y la taza
	[t('4:34.0'), 1.3, 1180, 650],
	[t('4:35.0'), 1, 960, 540],
];

/* ---------------------------------------------------------------- escena */

export const B5a: React.FC = () => {
	const f = useCurrentFrame();

	const rx = along(f, RX);
	const rPose = pick<RobotPose>(f, POSE, 'idle');
	const rFace = pick<RobotFace>(f, FACE, 'happy');
	const rChest = pick<string | undefined>(f, CHEST, undefined);
	const spoonLoad = pick<'coffee' | 'sugar' | undefined>(f, [
		...SPOON_COFFEE.map(([a, b]) => [a, b, 'coffee'] as [string, string, 'coffee']),
		...SPOON_SUGAR.map(([a, b]) => [a, b, 'sugar'] as [string, string, 'sugar']),
	], undefined);

	const vAct = [...VEE_ACTS].reverse().find(([a]) => f >= t(a));
	const vx = along(f, [['3:35', 840], ['4:12', 840], ['4:14', 900]]);

	const activeLine = latest<number>(f, ACTIVE, -1);
	const doneLines = DONE.filter(([a]) => f >= t(a)).map(([, i]) => i);

	// Taza: vacía → café molido → café negro (agua caliente).
	const cupFill: CupFill = f < t('3:49.4') ? 'empty' : f < t('4:06.8') ? 'grounds' : 'black';
	const cupLevel = f < t('4:06.8') ? 1 : tween(f, t('4:06.8'), t('4:09.2'), 0, 0.5);

	// Jarra medidora: se llena con agua del grifo (sobre la mesa y luego en la mano).
	const jugLevel = f < t('3:58.2') ? 0 : f < t('3:59.8') ? tween(f, t('3:58.2'), t('3:59.8'), 0, 0.62)
		: f < t('4:00.9') ? 0.62 : tween(f, t('4:00.9'), t('4:01.8'), 0.62, 0);

	// Tetera: tapa, tiemblo y vapor mientras hierve; se levanta para verter en la taza.
	const kettleTip = f >= t('4:06.4') ? 40 * tween(f, t('4:06.4'), t('4:06.9')) : 0;
	const kettleBoil = between(f, '4:02', '4:04.8');

	const panelOut = f < t('4:30') ? 1 : 1 - tween(f, t('4:30'), t('4:30.6'));
	const showQuestion = f < t('4:25');

	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: C.bg}}>
			<Freeze frame={t('4:38')} active={f >= t('4:38')}>
				<Cam keys={CAM} shakeAt={[t('4:34.5')]}>
					<Kitchen light={1} warm={0} panX={0} cupOnShelf={f < t('3:42.0')} flame={between(f, '4:01', '4:10')} />

					{/* mesa: jarra de café, azucarero y cup de la mesa */}
					<div style={{position: 'absolute', left: 1440, top: TABLE_Y - 80}}><CoffeeJar scale={8} /></div>
					{between(f, '3:45.2', '3:46.8') && (
						<div style={{position: 'absolute', left: 1428, top: TABLE_Y - 92, width: 96, height: 104, border: `4px solid ${C.green}`, boxShadow: `0 0 24px ${C.green}`}} />
					)}
					<div style={{position: 'absolute', left: 1330, top: TABLE_Y - 64}}><SugarBowl scale={8} /></div>
					{f >= t('3:43.5') && (
						<div style={{position: 'absolute', left: 1205, top: 624 + 6 * tween(f, t('3:43.5'), t('3:44.0'))}}>
							<Cup fill={cupFill} level={cupLevel} steam={f >= t('4:09.2')} scale={7} />
						</div>
					)}

					{/* jarra medidora sobre la mesa antes de llenarla */}
					<Appear x={1380} y={TABLE_Y - 96} at={t('3:57.0')} out={t('3:58.0')}>
						<MeasureJug level={0} scale={8} />
					</Appear>

					{/* tetera sobre la hornilla */}
					<Appear x={1580} y={576} at={t('3:55.5')} out={t('4:05.0')}>
						<Kettle scale={8} shake={kettleBoil ? 1 : 0} steam={kettleBoil} lid={tween(f, t('4:04.0'), t('4:04.3'), 0, 1)} />
					</Appear>
					<Appear x={1580} y={576} at={t('4:10.0')}>
						<Kettle scale={8} />
					</Appear>

					{/* vertido de la jarra en la tetera y grifo */}
					<Pour x={1416} y0={110} y1={738} color="#5AA9FF" w={14} on={between(f, '3:58.2', '3:59.8')} />
					<Pour x={1640} y0={440} y1={576} color="#5AA9FF" w={12} on={between(f, '4:00.9', '4:01.8')} />

					{/* café: polvo que cae a la taza */}
					<Falling x={1250} y0={540} y1={628} at={t('3:49.4')} dur={t('0:0.4')} color="#6B3D22" n={10} spread={20} />
					<Falling x={1250} y0={540} y1={628} at={t('3:51.5')} dur={t('0:0.4')} color="#6B3D22" n={10} spread={20} />
					{/* azúcar */}
					<Falling x={1250} y0={540} y1={628} at={t('4:31.9')} dur={t('0:0.4')} color="#FFFFFF" n={10} spread={20} />
					<Falling x={1250} y0={540} y1={628} at={t('4:33.6')} dur={t('0:0.4')} color="#FFFFFF" n={10} spread={20} />

					{f >= t('3:49.4') && f < t('3:51.5') && <Counter x={1250} y={585} value={1} at={t('3:49.4')} />}
					{f >= t('3:51.5') && f < t('3:53.5') && <Counter x={1250} y={585} value={2} at={t('3:51.5')} />}
					{f >= t('4:31.9') && f < t('4:33.6') && <Counter x={1250} y={585} value={1} at={t('4:31.9')} size={64} />}
					{f >= t('4:33.6') && f < t('4:34.4') && <Counter x={1250} y={585} value={2} at={t('4:33.6')} size={64} />}

					{/* pensamientos del robot y mensajes de su pantalla */}
					<RobotSays x={1162} y={FLOOR - 340} at={t('4:29')} out={t('4:31.5')}>AZÚCAR: 2 ✓</RobotSays>
					<RobotSays x={1190} y={FLOOR - 340} at={t('4:34.6')} out={t('4:36.2')}>2 = 2 ✓</RobotSays>

					{/* etiqueta 200 ml y termómetro */}
					<Tag x={1416} y={550} at={t('3:59.8')} out={t('4:02.0')} color={C.green} size={34}>200 ml</Tag>
					<Tag x={1804} y={418} at={t('4:02.0')} out={t('4:05.5')} color={C.amber} size={34}>🌡️</Tag>
					{between(f, '4:02', '4:05.5') && (
						<div style={{position: 'absolute', left: 1790, top: 450, width: 26, height: 150, border: `3px solid ${C.amber}`, background: 'rgba(8,12,10,0.85)'}}>
							<div style={{position: 'absolute', left: 3, right: 3, bottom: 3, height: 138 * tween(f, t('4:02'), t('4:04.8'), 0, 1), background: '#E2463E'}} />
						</div>
					)}

					{/* interfaz de decisión: pregunta, botones y teclado */}
					{f >= t('4:15') && f < t('4:30.6') && (
						<div style={{position: 'absolute', left: 1010, top: 120, width: 600, height: 430, background: 'rgba(8,12,10,0.94)', border: `3px solid ${C.green}`, boxShadow: `0 0 40px ${C.green}55`, transform: `scale(${0.3 + 0.7 * pop(f, t('4:15'), 12, 220, 0.6)})`, opacity: panelOut}}>
							<div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.white}}>
								{showQuestion ? '¿DESEA AGREGAR AZÚCAR?' : '¿CUÁNTAS?'}
							</div>
							{showQuestion && <div style={{position: 'absolute', left: 270, top: 96}}><SugarBowl scale={6} /></div>}
							{f >= t('4:17') && showQuestion && (
								<>
									<div style={{position: 'absolute', left: 60, top: 300}}><ChoiceButton label="SÍ" color={C.green} pressAt={t('4:23')} /></div>
									<div style={{position: 'absolute', left: 310, top: 300}}><ChoiceButton label="NO" color="#5A6660" dim={f >= t('4:23')} /></div>
								</>
							)}
							{!showQuestion && (
								<div style={{position: 'absolute', left: 121, top: 110, display: 'grid', gridTemplateColumns: 'repeat(3, 110px)', gap: 14}}>
									{['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => {
										const lit = k === '2' && between(f, '4:27.3', '4:29.5');
										return (
											<div key={k} style={{height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 40, color: lit ? C.bg : C.white, background: lit ? C.green : '#1E241F', border: `3px solid ${lit ? C.green : '#3A443E'}`, transform: lit ? 'scale(0.94)' : 'none'}}>{k}</div>
										);
									})}
								</div>
							)}
						</div>
					)}

					{/* jarra y tetera (robot) — objetos en la mano delantera */}
					<Robot
						x={rx}
						pose={rPose}
						face={rFace}
						chest={rChest}
						chestColor={C.green}
						holdF={
							f >= t('3:42.0') && f < t('3:43.5') ? <Cup scale={7} /> :
							f >= t('3:47.0') && f < t('3:53.0') ? <Spoon scale={6} load={spoonLoad as 'coffee' | undefined} /> :
							f >= t('3:58.0') && f < t('4:02.0') ? <MeasureJug level={jugLevel} scale={8} /> :
							f >= t('4:05.0') && f < t('4:09.8') ? <Kettle scale={8} tip={kettleTip} /> :
							f >= t('4:30.2') && f < t('4:35.5') ? <Spoon scale={6} load="sugar" /> :
							undefined
						}
					/>

					<Vee x={vx} act={vAct?.[1]} actAt={vAct ? t(vAct[0]) : undefined} />

					<Clap at={t('3:35')} out={t('3:37.6')} text="INTENTO 2" />
				</Cam>

				{/* tarjeta del algoritmo: tercio izquierdo, fuera de la cámara */}
				<InstrCard
					x={30}
					y={200}
					w={660}
					size={21}
					title="algoritmo2.txt"
					lines={LINES}
					active={activeLine}
					done={doneLines}
					blockHl={f >= t('4:19') ? [6, 10] : undefined}
					marks={f >= t('3:47.5') ? {2: ['a la taza']} : {}}
					at={t('3:39')}
				/>
				<Scroll />
			</Freeze>

			{/* etiqueta de esquina (parpadea tras congelar) */}
			<div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: f >= t('4:38') ? (Math.floor(f / 6) % 2 ? 1 : 0.35) : 1}}>
				<CornerTag text="CAMINO A: SÍ" at={t('4:23')} />
			</div>

			{/* pausa VHS al final del fragmento */}
			<VHS on={f >= t('4:38')} label="❚❚" />
		</div>
	);
};

export const sfxB5a: Sfx[] = [
	s(t('3:35'), 'hit', 0.4),          // claqueta
	s(t('3:37'), 'whoosh', 0.3),       // pergamino
	s(t('3:37.8'), 'blip', 0.25),      // bip impresionado
	s(t('3:39'), 'whoosh', 0.3),       // tarjeta
	s(t('3:39.4'), 'ticks', 0.25),
	s(t('3:41.0'), 'ticks', 0.2),      // pasos
	s(t('3:41.5'), 'ticks', 0.2),
	s(t('3:42.0'), 'key', 0.3),        // toma la taza
	s(t('3:43.5'), 'key', 0.3),        // tic de cerámica
	s(t('3:45.0'), 'blip', 0.3),       // bip del café
	s(t('3:46.8'), 'stack', 0.25),     // cuchara del cajón
	s(t('3:47.6'), 'key', 0.25),       // subrayado
	s(t('3:48.4'), 'debris', 0.25),    // arena de café
	s(t('3:49.4'), 'debris', 0.25),
	s(t('3:50.5'), 'debris', 0.25),
	s(t('3:51.5'), 'debris', 0.25),
	s(t('3:51.9'), 'ac', 0.3),         // ding
	s(t('3:53.0'), 'key', 0.2),        // tic
	s(t('3:55.0'), 'whoosh', 0.3),     // giro hacia la estufa
	s(t('3:55.6'), 'enter', 0.25),     // aparece la tetera
	s(t('3:58.2'), 'slide', 0.25),     // agua
	s(t('4:00.9'), 'slide', 0.25),     // vertido
	s(t('4:01.4'), 'pop', 0.3),        // encendido
	s(t('4:02.0'), 'riser', 0.2),      // la tetera empieza a sonar
	s(t('4:04.0'), 'rise', 0.35),      // silbido
	s(t('4:06.6'), 'slide', 0.25),     // vertido en la taza
	s(t('4:09.2'), 'ac', 0.35),        // ding
	s(t('4:11.2'), 'blip', 0.3),       // tono nuevo
	s(t('4:15.0'), 'enter', 0.3),      // holograma
	s(t('4:17.0'), 'blip', 0.25),      // nota SÍ/NO
	s(t('4:17.5'), 'ac', 0.25),
	s(t('4:19.4'), 'whoosh', 0.3),     // flechas
	s(t('4:19.9'), 'whoosh', 0.25),
	s(t('4:23.0'), 'key', 0.4),        // clic de botón
	s(t('4:23.5'), 'ac', 0.3),         // ding
	s(t('4:25.0'), 'blip', 0.3),       // bip de pregunta
	s(t('4:27.3'), 'key', 0.3),        // tecla 2
	s(t('4:29.0'), 'ac', 0.3),         // guardado
	s(t('4:30.6'), 'debris', 0.25),    // azúcar fina
	s(t('4:31.9'), 'debris', 0.25),
	s(t('4:33.6'), 'debris', 0.25),
	s(t('4:34.5'), 'hit', 0.25),       // freno en seco
	s(t('4:34.8'), 'key', 0.2),        // tic
	s(t('4:38.0'), 'stack', 0.3),      // pausa de cinta
];
