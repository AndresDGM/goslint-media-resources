import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inCubic, inOutCubic, outCubic, pop, rnd, tween} from '@commons/lib';
import {CutFlash, GlitchBurst, Shockwave, WipeBar, shake} from '@commons/components';
import {Hit, In} from '@commons/vertical';
import {Buf, PixelBurst, PixelSprite} from '@commons/pixel';
import {Barrido, Iris, Slam, SpeedLines} from '@commons/transiciones';
import {at, BLOCKS, end} from '../timeline';
import {s, Sfx} from '../sfx';
import {Board, Cam, ChoiceButton, Counter, Cup, FLOOR, InstrCard, Kitchen, Line, Mop, Puddle, Robot, Shot, SugarBowl, Spoon, Stamp, Tag, Vee, VeeAct} from '../kit';

/* ================================================================== Bloque 6 · «La computadora» (V53–V60) */

/** Marcas de la voz que usa el bloque (fotogramas absolutos). */
const T = {
	b0: BLOCKS.b6[0],
	b1: BLOCKS.b6[1],
	// V53
	v53: at('V53'),
	esto: at('V53', 'esto'),
	computadoras: at('V53', 'computadoras'),
	computadora: at('V53', 'computadora'),
	parece: at('V53', 'parece'),
	mucho: at('V53', 'mucho'),
	nuestro: at('V53', 'nuestro'),
	robot: at('V53', 'robot'),
	// V54
	v54: at('V54'),
	algoritmo: at('V54', 'algoritmo'),
	escribe: at('V54', 'escribe'),
	lenguaje: at('V54', 'lenguaje'),
	ejecutar: at('V54', 'ejecutar'),
	convierte: at('V54', 'convierte'),
	programa: at('V54', 'programa'),
	e54: end('V54'),
	// V55
	v55: at('V55'),
	toma: at('V55', 'toma'),
	primera: at('V55', 'primera'),
	ejecuta: at('V55', 'ejecuta'),
	pasa: at('V55', 'pasa'),
	y55: at('V55', 'y'),
	asi: at('V55', 'asi'),
	paso1: at('V55', 'paso', 1),
	paso2: at('V55', 'paso', 2),
	hasta: at('V55', 'hasta'),
	final: at('V55', 'final'),
	// V56
	v56: at('V56'),
	salta: at('V56', 'salta'),
	parezcan: at('V56', 'parezcan'),
	obvios: at('V56', 'obvios'),
	ni: at('V56', 'ni'),
	completa: at('V56', 'completa'),
	olvidaste: at('V56', 'olvidaste'),
	sigue: at('V56', 'sigue'),
	reglas56: at('V56', 'reglas'),
	definieron: at('V56', 'definieron'),
	quienes: at('V56', 'quienes'),
	la56: at('V56', 'la'),
	programaron: at('V56', 'programaron'),
	// V57
	v57: at('V57'),
	decimos: at('V57', 'decimos'),
	computadora57: at('V57', 'computadora'),
	no57: at('V57', 'no'),
	lo1: at('V57', 'lo', 1),
	queremos: at('V57', 'queremos'),
	hace2: at('V57', 'hace', 2),
	indicamos: at('V57', 'indicamos'),
	e57: end('V57'),
	// V58
	v58: at('V58'),
	sistemas: at('V58', 'sistemas'),
	escribimos: at('V58', 'escribimos'),
	flex: at('V58', 'flexibilidad'),
	pero: at('V58', 'pero'),
	incluso: at('V58', 'incluso'),
	instruccion: at('V58', 'instruccion'),
	reglas58: at('V58', 'reglas'),
	alguien: at('V58', 'alguien'),
	disenio: at('V58', 'diseñó'),
	// V59
	v59: at('V59'),
	algoritmos: at('V59', 'algoritmos'),
	tres: at('V59', 'tres'),
	ideas: at('V59', 'ideas'),
	una: at('V59', 'una'),
	otra: at('V59', 'otra'),
	secuencias: at('V59', 'secuencias'),
	pasos59: at('V59', 'pasos'),
	uno: at('V59', 'uno'),
	tras: at('V59', 'tras'),
	otro: at('V59', 'otro'),
	decisiones: at('V59', 'decisiones'),
	como1: at('V59', 'como', 1),
	azucar: at('V59', 'azucar'),
	repeticiones: at('V59', 'repeticiones'),
	revolver: at('V59', 'revolver'),
	varias: at('V59', 'varias'),
	veces: at('V59', 'veces'),
	// V60
	v60: at('V60'),
	veremos: at('V60', 'veremos'),
	calma: at('V60', 'calma'),
	proximas: at('V60', 'proximas'),
};

/** Cambios de sub-escena (fotogramas absolutos). */
const SW = {
	pantalla: T.v55, // del mundo (zoom a la pantalla) a la pantalla a todo el cuadro
	iris: T.sigue - 3, // de la pantalla a los programadores
	oscuro: T.v57, // a la frase central
	pizarra: T.v59, // a las tres ideas
};

/* ------------------------------------------------------------------ textos */

const ALGORITMO = ['INICIO', 'Tomar una taza', 'Agregar el café', 'Calentar el agua', 'Verter el agua', 'Agregar la leche', 'Revolver', 'Servir el café', 'FIN'];
const LINEAS: Line[] = ALGORITMO.map((text) => ({text}));

/* ------------------------------------------------------------------ dibujos en pixel art */

const pxs = (b: Buf, scale: number, style?: React.CSSProperties) => <PixelSprite buf={b} scale={scale} style={style} />;

/** Mano que señala con el índice (la punta está en el pixel (4, 0)). */
const MANO = (() => {
	const b = new Buf(12, 15);
	const sk = '#F2C9A0';
	const ol = '#3A2416';
	b.rect(2, 0, 5, 9, ol);
	b.rect(3, 1, 3, 8, sk);
	b.rect(1, 7, 10, 8, ol);
	b.rect(2, 8, 8, 6, sk);
	b.rect(6, 7, 1, 3, ol);
	b.rect(8, 8, 1, 3, ol);
	return b;
})();

/** Programador: silueta con capucha frente a un portátil (22×26). */
const PROG = (() => {
	const b = new Buf(22, 26);
	const d = '#22332A';
	const e = C.green;
	b.rect(8, 0, 6, 1, e);
	b.rect(7, 1, 8, 7, d);
	b.rect(7, 1, 1, 7, e);
	b.rect(9, 4, 4, 2, '#0B0F0D');
	b.rect(5, 8, 12, 11, d);
	b.rect(5, 8, 12, 1, e);
	b.rect(2, 11, 4, 4, d);
	b.rect(16, 11, 4, 4, d);
	b.rect(1, 14, 20, 2, '#B4C0B8');
	b.rect(3, 16, 16, 6, '#5B6A63');
	b.rect(4, 17, 14, 4, C.green);
	b.rect(6, 18, 6, 1, '#0B0F0D');
	b.rect(6, 20, 8, 1, '#0B0F0D');
	b.rect(5, 19, 12, 7, d);
	return b;
})();

const engranaje = (color: string) => {
	const b = new Buf(17, 17);
	for (let y = 0; y < 17; y++)
		for (let x = 0; x < 17; x++) {
			const dx = x - 8;
			const dy = y - 8;
			const d = Math.hypot(dx, dy);
			const aro = d <= 5.4 && d >= 2.4;
			const diente = d <= 7.7 && d > 5 && (Math.min(Math.abs(dx), Math.abs(dy)) <= 1 || Math.abs(Math.abs(dx) - Math.abs(dy)) <= 1);
			if (aro || diente) b.set(x, y, color);
		}
	return b;
};
const ENG_V = engranaje(C.green);
const ENG_A = engranaje(C.amber);

/* ------------------------------------------------------------------ el computador */

const PC_W = 700;
const PC_H = 440;
const BEZEL = 24;
const SCR_W = PC_W - 2 * BEZEL; // 652
const SCR_H = PC_H - 2 * BEZEL; // 392

/**
 * Monitor de pixel art. (x, top) = centro y borde superior; `s` = escala. Los hijos se dibujan en las
 * coordenadas LÓGICAS de la pantalla (652×392), que la escala agranda. `appear`: entra cayendo con rebote.
 */
const Pc: React.FC<{x: number; top: number; s: number; appear?: number; stand?: boolean; glow?: number; dx?: number; dy?: number; children?: React.ReactNode}> = ({x, top, s: k, appear, stand = true, glow = 0.35, dx = 0, dy = 0, children}) => {
	const f = useCurrentFrame();
	if (appear !== undefined && f < appear) return null;
	const p = appear !== undefined ? pop(f, appear, 11, 260, 0.55) : 1;
	const [sx, sy] = shake(f, (appear ?? 0) + 5, 10, 8);
	return (
		<div style={{position: 'absolute', left: x - (PC_W * k) / 2 + dx + (appear !== undefined ? sx : 0), top: top + dy + (appear !== undefined ? sy : 0), width: PC_W * k, height: (PC_H + 60) * k, transformOrigin: '50% 100%', transform: `translateY(${(1 - p) * -320}px) scale(${0.55 + 0.45 * p})`, opacity: Math.min(1, p * 2)}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: PC_W * k, height: PC_H * k, background: '#E9EEEA', boxShadow: `inset ${-7 * k}px ${-7 * k}px 0 #B4C0B8, 0 0 ${70 * k}px rgba(0,192,99,${glow})`}}>
				<div style={{position: 'absolute', left: BEZEL * k, top: BEZEL * k, width: SCR_W * k, height: SCR_H * k, background: '#0A0F0C', overflow: 'hidden'}}>
					<div style={{position: 'absolute', left: 0, top: 0, width: SCR_W, height: SCR_H, transform: `scale(${k})`, transformOrigin: '0 0'}}>{children}</div>
					<div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 5px)', pointerEvents: 'none'}} />
				</div>
				<div style={{position: 'absolute', right: 10 * k, bottom: 6 * k, width: 8 * k, height: 8 * k, background: C.green}} />
			</div>
			{stand && (
				<>
					<div style={{position: 'absolute', left: ((PC_W - 40) / 2) * k, top: PC_H * k, width: 40 * k, height: 40 * k, background: '#B4C0B8'}} />
					<div style={{position: 'absolute', left: ((PC_W - 240) / 2) * k, top: (PC_H + 40) * k, width: 240 * k, height: 20 * k, background: '#7F8D86'}} />
				</>
			)}
		</div>
	);
};

/** Pantalla del computador antes de la tarjeta: cursor, arranque y «ojos» como los del robot. */
const PantallaInicio: React.FC<{blink: boolean}> = ({blink}) => {
	const f = useCurrentFrame();
	const cur = Math.floor(f / 8) % 2 === 0;
	const eyes = f >= T.parece;
	const boot = f >= T.computadora;
	const lines = ['> iniciando…', '> cargando pasos…', '> listo'];
	return (
		<div style={{position: 'absolute', inset: 0, fontFamily: MONO, color: C.green}}>
			{!eyes && (
				<div style={{position: 'absolute', left: 30, top: 28, fontSize: 30, fontWeight: 800, lineHeight: 1.5}}>
					{boot ? lines.map((l, i) => (f >= T.computadora + i * 9 ? <div key={i}>{l}</div> : null)) : <div>{'> '}</div>}
					<span style={{opacity: cur ? 1 : 0}}>▌</span>
				</div>
			)}
			{eyes && (
				<>
					{[170, 382].map((ex, i) => (
						<div key={i} style={{position: 'absolute', left: ex, top: blink ? 168 : 80, width: 100, height: blink ? 14 : 140, background: C.green, boxShadow: `0 0 30px ${C.green}`}} />
					))}
					<div style={{position: 'absolute', left: 236, top: 275, width: 180, height: 18, background: C.green, boxShadow: `0 0 20px ${C.green}`}} />
				</>
			)}
		</div>
	);
};

/** Ventana con el algoritmo dentro del monitor (coordenadas lógicas). Se revuelve al «escribirse» y pasa a programa. */
const Ventana: React.FC<{at: number}> = ({at: t0}) => {
	const f = useCurrentFrame();
	if (f < t0) return null;
	const p = pop(f, t0, 12, 240, 0.6);
	const revuelto = f >= T.lenguaje && f < T.lenguaje + 16;
	const prog = f >= T.programa;
	const formal = f >= T.lenguaje + 16;
	const GL = '▓▒░#@%&*+=<>/|01';
	const verbo = (l: string) => l.split(' ')[0];
	return (
		<div style={{position: 'absolute', left: 21, top: 10, width: 526, transform: `scale(${0.8 + 0.2 * p})`, transformOrigin: '30% 0', opacity: Math.min(1, p * 2), background: 'rgba(12,16,14,0.97)', border: `1.6px solid ${prog ? C.white : C.green}`, boxShadow: `0 0 ${prog ? 40 : 20}px ${C.green}${prog ? 'aa' : '44'}`}}>
			<div style={{fontFamily: MONO, fontSize: 11, color: prog ? C.bg : C.dim, padding: '4px 8px', height: 22, boxSizing: 'border-box', borderBottom: `1px solid ${C.line2}`, display: 'flex', gap: 6, alignItems: 'center', background: prog ? C.green : 'transparent', fontWeight: prog ? 800 : 400}}>
				<span style={{color: '#E2463E'}}>●</span><span style={{color: '#F2C230'}}>●</span><span style={{color: prog ? C.bg : C.green}}>●</span>
				<span style={{marginLeft: 4}}>{prog ? 'programa' : 'algoritmo.txt'}</span>
				{f >= T.ejecutar && !prog && <span style={{marginLeft: 'auto', color: C.green, fontWeight: 800}}>{'▶ ejecutar'}</span>}
			</div>
			<div style={{margin: '6.3px 7px 7px 7px'}}>
				{ALGORITMO.map((l, i) => {
					const kw = i === 0 || i === ALGORITMO.length - 1;
					let txt: React.ReactNode = l;
					if (revuelto) txt = l.split('').map((ch, j) => (ch === ' ' ? ' ' : GL[Math.floor(rnd(i * 31 + j * 7 + Math.floor(f / 2) * 13) * GL.length)])).join('');
					else if (formal && !kw) txt = <><span style={{color: C.green}}>{verbo(l)}</span>{l.slice(verbo(l).length)}</>;
					return (
						<div key={i} style={{height: 31.6, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: 21, whiteSpace: 'nowrap', color: kw ? C.green : revuelto ? C.green : C.text, fontWeight: kw ? 800 : 500}}>
							<span style={{width: 23, color: C.green}} />
							<span style={{whiteSpace: 'pre'}}>{txt}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

/** Escritorio con teclado (mundo de la cocina de la computadora). */
const Escritorio: React.FC = () => (
	<>
		<div style={{position: 'absolute', left: 1020, top: 800, width: 880, height: 30, background: '#8A6446', boxShadow: '0 10px 0 #5B4030'}} />
		<div style={{position: 'absolute', left: 1050, top: 830, width: 26, height: FLOOR - 830, background: '#5B4030'}} />
		<div style={{position: 'absolute', left: 1840, top: 830, width: 26, height: FLOOR - 830, background: '#5B4030'}} />
		<div style={{position: 'absolute', left: 1255, top: 786, width: 290, height: 22, background: '#B4C0B8', boxShadow: 'inset 0 -6px 0 #7F8D86'}}>
			{Array.from({length: 14}, (_, i) => <div key={i} style={{position: 'absolute', left: 8 + i * 20, top: 4, width: 14, height: 6, background: '#E9EEEA'}} />)}
		</div>
	</>
);

/** Suelo del mundo (sobre la pizarra). */
const Suelo: React.FC = () => (
	<>
		<div style={{position: 'absolute', left: -200, top: FLOOR, width: 2320, height: 400, background: '#161B18'}} />
		<div style={{position: 'absolute', left: -200, top: FLOOR, width: 2320, height: 6, background: '#2F3A34'}} />
	</>
);

/* ================================================================== 1 · el mundo: V53 y V54 */

/** Tarjeta pequeña que Vee lanza al computador. */
const MiniTarjeta: React.FC<{x: number; y: number; k?: number}> = ({x, y, k = 1}) => (
	<div style={{position: 'absolute', left: x, top: y, width: 190, height: 140, transform: `translate(-50%, -50%) scale(${k})`, background: 'rgba(12,16,14,0.97)', border: `4px solid ${C.green}`, boxShadow: `0 0 26px ${C.green}77`}}>
		<div style={{height: 24, borderBottom: `2px solid ${C.line2}`, padding: '4px 8px', fontFamily: MONO, fontSize: 14, color: C.dim}}>algoritmo.txt</div>
		{[110, 90, 120, 70, 100].map((w, i) => <div key={i} style={{margin: '8px 0 0 14px', height: 7, width: w, background: i % 2 ? C.text : C.green, opacity: 0.85}} />)}
	</div>
);

const MundoPC: React.FC = () => {
	const f = useCurrentFrame();
	const parpadeo = [T.mucho, T.robot].some((b) => f >= b && f < b + 7);
	// vuelo de la mini tarjeta: nace en la mano de Vee y entra en la pantalla en «escribe»
	const vuelo0 = T.escribe - 15;
	const kv = tween(f, vuelo0, T.escribe, 0, 1, inOutCubic);
	const cx = 430 + (1400 - 430) * kv;
	const cy = 600 + (520 - 600) * kv - Math.sin(kv * Math.PI) * 170;
	const flotante = f >= T.algoritmo && f < T.escribe;
	const pm = pop(f, T.algoritmo, 11, 260, 0.55);
	const bob = Math.sin(f / 5) * 8;
	const shots: Shot[] = [
		[T.b0, 1, 960, 540],
		[T.computadoras, 1.2, 1200, 560],
		[T.parece, 1.3, 1100, 570],
		[T.nuestro, 1.5, 900, 620],
		[T.v54, 1, 960, 540],
		[T.escribe + 10, 1.9, 1400, 520, 26],
	];
	return (
		<>
			<Cam shots={shots} shakeAt={[T.computadoras + 4, T.parece + 3, T.escribe + 2, T.programa + 3]}>
				<Board />
				<Suelo />
				<Escritorio />
				<Pc x={1400} top={300} s={1} appear={T.esto}>
					<PantallaInicio blink={parpadeo} />
					<Ventana at={T.escribe + 1} />
				</Pc>
				<Vee
					x={270}
					acts={[
						[T.esto, 'senalar'],
						[T.parece, 'explicar'],
						[T.robot, 'senalar'],
						[T.algoritmo, 'senalar'],
						[T.escribe + 4, 'explicar'],
						[T.convierte, 'celebrar'],
					] as [number, VeeAct][]}
				/>
				<Robot x={800} y={FLOOR} pose={f >= T.nuestro && f < T.v54 ? 'wave' : 'idle'} face={parpadeo ? 'blink' : f >= T.v54 ? 'focus' : 'happy'} look={[1, 0]} hops={[T.computadoras + 6, T.parece + 6]} />
				{flotante && <MiniTarjeta x={f < vuelo0 ? 430 : cx} y={f < vuelo0 ? 600 + bob : cy} k={(f < vuelo0 ? pm : 1 - 0.4 * kv) * 1} />}
				<Tag x={1400} y={235} at={T.computadoras + 2} out={T.v54} color={C.green} size={46}>COMPUTADORA</Tag>
				<Tag x={800} y={445} at={T.robot} out={T.v54} color={C.amber} size={46}>ROBOT</Tag>
				<Slam at={T.parece} x={985} y={545} out={T.v54 - 4}>
					<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 230, color: C.white, textShadow: `0 0 40px ${C.green}, 0 8px 0 rgba(0,0,0,0.5)`, lineHeight: 1}}>≈</div>
				</Slam>
				<Hit at={T.computadoras + 4} x={1400} y={520} />
				<Shockwave at={T.parece + 3} x={985} y={560} size={900} dur={26} />
				<Hit at={T.escribe + 2} x={1400} y={520} />
				<PixelBurst f={f} at={T.mucho} x={1100} y={420} count={10} colors={[C.green, C.white, C.amber]} seed={4} power={11} />
				<SpeedLines at={T.robot} len={8} mode="radial" x={800} y={560} count={16} />
			</Cam>
			<GlitchBurst at={T.lenguaje} len={10} intensity={1.2} />
			<CutFlash at={T.lenguaje} len={3} max={0.35} />
			<Slam at={T.programa} out={T.e54 + 3} x={960} y={560}>
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 170, color: C.bg, background: C.green, padding: '4px 50px', border: `8px solid ${C.white}`, boxShadow: '0 0 80px rgba(0,192,99,0.8), 0 14px 0 rgba(0,0,0,0.45)'}}>PROGRAMA</div>
			</Slam>
			<Shockwave at={T.programa + 3} x={960} y={540} size={1700} />
			<CutFlash at={T.programa + 2} len={4} max={0.5} />
		</>
	);
};

/* ================================================================== 2 · dentro del monitor: V55 y V56 */

const CARD_X = 381;
const CARD_Y = 187;
const LH = 60;
const lineY = (i: number) => CARD_Y + 87 + LH * i;

/** Progreso (0–1) de la ejecución en cada fotograma. */
const PROG_KEYS: [number, number][] = [
	[T.v55, 0],
	[T.toma, 0.04],
	[T.primera, 0.12],
	[T.pasa, 0.25],
	[T.y55, 0.37],
	[T.asi, 0.5],
	[T.paso1, 0.62],
	[T.paso2, 0.75],
	[T.hasta, 0.87],
	[T.final, 1],
];
const CURSOR55: [number, number][] = [
	[T.toma, 0],
	[T.primera, 1],
	[T.pasa, 2],
	[T.y55, 3],
	[T.asi, 4],
	[T.paso1, 5],
	[T.paso2, 6],
	[T.hasta, 7],
	[T.final, 8],
];
const lineaActiva = (f: number) => {
	let a = -1;
	for (const [fr, ln] of CURSOR55) if (f >= fr) a = ln;
	return a;
};

const Chip: React.FC<{y: number; label: string; on: boolean; color?: string}> = ({y, label, on, color = C.green}) => (
	<div style={{position: 'absolute', left: CARD_X + 1015, top: y, width: 190, height: 64, boxSizing: 'border-box', fontFamily: MONO, fontWeight: 800, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: on ? C.bg : C.faint, background: on ? color : 'transparent', border: `3px solid ${on ? color : C.line2}`, boxShadow: on ? `0 0 26px ${color}88` : 'none', transform: `scale(${on ? 1.05 : 1})`}}>{label}</div>
);

const PantallaGrande: React.FC = () => {
	const f = useCurrentFrame();
	const act = lineaActiva(f);
	const fin = f >= T.final;
	const v56 = f >= T.v56;
	const prog = interpolate(f, PROG_KEYS.map((k) => k[0]), PROG_KEYS.map((k) => k[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	// chips: LEE → EJECUTA → SIGUE, y luego en carrera
	let chip = -1;
	if (f >= T.toma) chip = 0;
	if (f >= T.ejecuta) chip = 1;
	if (f >= T.pasa) chip = 2;
	if (f >= T.y55 && !fin) chip = Math.floor((f - T.y55) / 4) % 3;
	const cursor: [number, number][] = v56 ? [[T.v56, 0]] : CURSOR55;
	// salida de la tarjeta al recordar
	const salida = tween(f, T.ni, T.ni + 12, 0, 1, inCubic);
	// la tachadura: crece, rebota y se deshace
	const t0 = T.obvios;
	const crece = tween(f, t0, t0 + 6, 0, 0.72, outCubic);
	const rebote = f >= t0 + 8 ? pop(f, t0 + 8, 5, 420, 0.28) : 0;
	const tacha = f < t0 ? 0 : Math.max(0, f < t0 + 8 ? crece : 0.72 * (1 - rebote));
	const manoK = tween(f, T.salta, T.salta + 9, 0, 1, outCubic);
	const manoOut = tween(f, t0 + 22, t0 + 32, 0, 1, inCubic);
	const xTxt0 = CARD_X + 61;
	const anchoTxt = 337;
	const manoX = f < t0 ? xTxt0 + 60 : xTxt0 + anchoTxt * tacha;
	const manoY = lineY(1) + 12;
	const [sx, sy] = shake(f, t0 + 8, 18, 12);
	const [sx2, sy2] = shake(f, T.final + 1, 8, 8);
	return (
		<>
			<Pc x={960} top={122} s={1.9} stand={false} glow={0.5} />
			{/* tarjeta del programa, a todo el monitor */}
			<div style={{position: 'absolute', inset: 0, transform: `translate(${-salida * 1300 + (v56 ? sx : sx2)}px, ${v56 ? sy : sy2}px) scale(${1 - 0.3 * salida})`, opacity: 1 - salida, transformOrigin: '50% 50%'}}>
				<InstrCard x={CARD_X} y={CARD_Y} w={1000} lines={LINEAS} cursor={cursor} size={40} title="programa" allDone={fin && !v56} />
				{!v56 && (
					<>
						<Chip y={CARD_Y + 60} label="LEE" on={chip === 0 || fin} />
						<Chip y={CARD_Y + 150} label="EJECUTA" on={chip === 1 || fin} />
						<Chip y={CARD_Y + 240} label="SIGUE" on={chip === 2 || fin} />
						{/* barra de progreso */}
						<div style={{position: 'absolute', left: CARD_X, top: CARD_Y + 640, width: 1000, height: 34, border: `3px solid ${C.line2}`, boxSizing: 'border-box', background: 'rgba(12,16,14,0.9)'}}>
							<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${prog * 100}%`, background: C.green, boxShadow: `0 0 20px ${C.green}`}} />
						</div>
						<div style={{position: 'absolute', left: CARD_X + 1015, top: CARD_Y + 630, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: fin ? C.green : C.dim}}>{Math.round(prog * 100)}%</div>
						{/* ✓ de la ejecución de la primera instrucción */}
						{f >= T.ejecuta && f < T.pasa + 12 && <Counter x={CARD_X + 930} y={lineY(1) - 2} value="✓" at={T.ejecuta} out={T.pasa + 12} size={76} />}
					</>
				)}
				{/* intento de saltarse un paso */}
				{v56 && f >= T.salta && f < T.ni + 10 && (
					<>
						<div style={{position: 'absolute', left: xTxt0 - 6, top: lineY(1) - 3, width: anchoTxt * tacha + 12, height: 8, background: C.red, boxShadow: `0 0 18px ${C.red}`, display: tacha > 0.01 ? 'block' : 'none'}} />
						<div style={{position: 'absolute', left: manoX - 4 * 6, top: manoY, transform: `translateX(${(1 - manoK) * 700 + manoOut * 700}px) rotate(${(f >= t0 + 8 ? -rebote * 10 : -6) }deg)`, opacity: manoK}}>{pxs(MANO, 6)}</div>
						<Tag x={CARD_X + 890} y={lineY(1)} at={T.parezcan} out={t0 + 14} color={C.amber} size={40} rot={-4}>ES OBVIO</Tag>
						<Tag x={CARD_X + 850} y={lineY(1)} at={t0 + 14} out={T.ni + 10} color={C.green} size={40} rot={3}>NO SE SALTA</Tag>
						<PixelBurst f={f} at={t0 + 8} x={xTxt0 + anchoTxt * 0.72} y={lineY(1)} count={14} colors={[C.red, C.white, C.amber]} seed={9} power={13} />
					</>
				)}
			</div>
			{/* recuerdo: el robot presenta el charco */}
			{f >= T.completa && <Recuerdo />}
		</>
	);
};

const Recuerdo: React.FC = () => {
	const f = useCurrentFrame();
	const p = pop(f, T.completa, 11, 240, 0.6);
	const charco = tween(f, T.completa + 4, T.olvidaste + 10, 0, 1, outCubic);
	return (
		<div style={{position: 'absolute', left: 440, top: 192, width: 1040, height: 700, transform: `scale(${0.5 + 0.5 * p}) rotate(${(1 - p) * -5}deg)`, opacity: Math.min(1, p * 2), background: '#1A1712', border: `8px dashed ${C.amber}`, boxSizing: 'border-box', filter: 'saturate(0.7) sepia(0.3)', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: '#2B2B27'}} />
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 120, height: 6, background: '#3C3C36'}} />
			<div style={{position: 'absolute', left: 30, top: 24, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.amber}}>RECUERDO</div>
			<Puddle size={charco} x={760} y={1090 - 120 + 40 - 30} w={620} />
			<div style={{position: 'absolute', left: -340 + 440, top: 0}} />
			<RobotRecuerdo />
		</div>
	);
};

/** El robot del recuerdo, dentro del recuadro (coordenadas del recuadro: la pantalla le resta su esquina). */
const RobotRecuerdo: React.FC = () => (
	<div style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1}}>
		<Robot x={300} y={640 - 120 + 50} scale={8} pose="present" face="proud" chest="✓" at={T.completa + 3} />
	</div>
);

/* ================================================================== 3 · los programadores: V56 (final) */

const Progr: React.FC<{x: number; y: number; at: number}> = ({x, y, at: t0}) => {
	const f = useCurrentFrame();
	if (f < t0) return <div style={{position: 'absolute', left: x - 110, top: y, opacity: 0.18}}>{pxs(PROG, 10)}</div>;
	const p = pop(f, t0, 10, 260, 0.55);
	return (
		<div style={{position: 'absolute', left: x - 110, top: y, transform: `translateY(${(1 - p) * -200}px) scale(${0.5 + 0.5 * p})`, opacity: Math.min(1, p * 2)}}>
			{pxs(PROG, 10)}
		</div>
	);
};

const Linea: React.FC<{x0: number; y0: number; x1: number; y1: number; at: number}> = ({x0, y0, x1, y1, at: t0}) => {
	const f = useCurrentFrame();
	if (f < t0) return null;
	const k = tween(f, t0, t0 + 10);
	const len = Math.hypot(x1 - x0, y1 - y0);
	const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
	const paquete = ((f - t0) % 22) / 22;
	return (
		<>
			<div style={{position: 'absolute', left: x0, top: y0 - 3, width: len * k, height: 6, background: `repeating-linear-gradient(90deg, ${C.green} 0 14px, transparent 14px 24px)`, transformOrigin: '0 50%', transform: `rotate(${ang}deg)`, opacity: 0.9}} />
			{k >= 1 && <div style={{position: 'absolute', left: x0 + (x1 - x0) * paquete - 10, top: y0 + (y1 - y0) * paquete - 10, width: 20, height: 20, background: C.white, boxShadow: `0 0 16px ${C.green}`}} />}
		</>
	);
};

const Programadores: React.FC = () => {
	const f = useCurrentFrame();
	const xs = [1000, 1380, 1760];
	const ts = [T.quienes, T.la56, T.programaron];
	const regla = (i: number, texto: string, t0: number) => {
		if (f < t0) return null;
		const p = pop(f, t0, 11, 260, 0.6);
		return (
			<div key={i} style={{height: 74, display: 'flex', alignItems: 'center', gap: 16, transform: `translateX(${(1 - p) * -260}px)`, opacity: Math.min(1, p * 2), fontFamily: MONO, fontWeight: 800, fontSize: 38, color: C.white}}>
				<span style={{color: C.bg, background: C.green, width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
				{texto}
			</div>
		);
	};
	return (
		<>
			<Board />
			<Suelo />
			<Vee x={230} acts={[[T.sigue, 'explicar'], [T.programaron, 'celebrar']] as [number, VeeAct][]} />
			{/* reglas */}
			{f >= T.sigue && (
				<div style={{position: 'absolute', left: 430, top: 400, width: 560, padding: '18px 26px', boxSizing: 'border-box', background: 'rgba(12,16,14,0.96)', border: `4px solid ${C.green}`, boxShadow: `0 0 36px ${C.green}44`, overflow: 'hidden', transform: `scale(${0.6 + 0.4 * pop(f, T.sigue, 11, 240, 0.6)})`, transformOrigin: '0 50%'}}>
					<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.green, marginBottom: 6}}>REGLAS</div>
					{regla(0, 'Orden fijo', T.sigue + 3)}
					{regla(1, 'Sin saltos', T.reglas56 + 2)}
					{regla(2, 'Solo lo escrito', T.definieron + 2)}
				</div>
			)}
			<Pc x={1380} top={480} s={0.84} appear={SW.iris + 4}>
				<div style={{position: 'absolute', left: 30, top: 24, width: 592, height: 340, border: `2px solid ${C.green}`, boxSizing: 'border-box', padding: 16, fontFamily: MONO, fontWeight: 800, fontSize: 22, color: C.green}}>
					programa
					{[0.8, 0.55, 0.7, 0.4, 0.62, 0.5, 0.75].map((w, i) => <div key={i} style={{marginTop: 14, height: 12, width: `${w * 100}%`, background: i % 2 ? C.text : C.green, opacity: 0.8}} />)}
				</div>
			</Pc>
			{f >= T.reglas56 && f < T.quienes + 20 && <Tag x={1000} y={620} at={T.definieron + 10} color={C.green} size={36}>▶ PC</Tag>}
			{xs.map((x, i) => (
				<React.Fragment key={i}>
					<Linea x0={x} y0={345} x1={1380 + (i - 1) * 190} y1={480} at={ts[i] + 4} />
					<Progr x={x} y={80} at={ts[i]} />
					<Hit at={ts[i] + 2} x={x} y={230} big={i === 2} />
				</React.Fragment>
			))}
			<Tag x={1380} y={410} at={T.programaron + 6} color={C.blue} size={40}>PROGRAMADORES</Tag>
		</>
	);
};

/* ================================================================== 4 · «no hace lo que queremos»: V57 y V58 */

const BOX_X = 570;
const BOX_W = 1260;

const Frase: React.FC<{text: string; t0: number; y: number; cps?: number; verde?: [number, number]}> = ({text, t0, y, cps = 38, verde}) => {
	const f = useCurrentFrame();
	if (f < t0) return null;
	const n = Math.min(text.length, Math.floor(((f - t0) / 30) * cps));
	const cur = Math.floor(f / 8) % 2 === 0;
	const brillo = f >= T.indicamos + 14 ? (((f - T.indicamos - 14) % 54) / 54) * 3 - 1 : -2;
	const parte = (a: number, b: number) => text.slice(a, Math.min(b, n));
	const vs = verde ? verde[0] : text.length;
	const ve = verde ? verde[1] : text.length;
	const base: React.CSSProperties = {fontFamily: MONO, fontWeight: 800, fontSize: 84, whiteSpace: 'pre', lineHeight: '110px'};
	return (
		<div style={{position: 'absolute', left: BOX_X, top: y - 55, width: BOX_W, height: 110}}>
			<div style={{...base, color: 'rgba(233,238,234,0.92)'}}>
				{parte(0, vs)}
				<span style={{color: C.green, textShadow: `0 0 26px ${C.green}77`}}>{parte(vs, ve)}</span>
				{parte(ve, text.length)}
				<span style={{color: C.green, opacity: cur && n < text.length ? 1 : 0}}>▌</span>
			</div>
			{/* brillo que recorre las letras */}
			<div style={{...base, position: 'absolute', left: 0, top: 0, color: 'transparent', backgroundImage: `linear-gradient(100deg, transparent ${brillo * 33}%, rgba(124,255,179,0.95) ${brillo * 33 + 8}%, transparent ${brillo * 33 + 16}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text'}}>{text.slice(0, n)}</div>
		</div>
	);
};

const Pensamiento: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.lo1 || f > T.queremos + 60) return null;
	const pp = pop(f, T.lo1, 11, 260, 0.6);
	const tf = T.queremos;
	const th = tf + 11;
	const goal: [number, number] = [1175, 290];
	let x = 380;
	let y = 460 + Math.sin(f / 5) * 8;
	let rot = 0;
	let op = 1;
	if (f >= tf && f < th) {
		const k = tween(f, tf, th, 0, 1, inCubic);
		x = 380 + (goal[0] - 380) * k;
		y = 460 + (goal[1] - 460) * k - Math.sin(k * Math.PI) * 50;
	} else if (f >= th) {
		const d = f - th;
		x = goal[0] - 16 * d;
		y = goal[1] - 22 * d + 1.7 * d * d;
		rot = -d * 7;
		op = 1 - tween(f, th + 18, th + 30);
	}
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${0.3 + 0.7 * pp})`, opacity: op, display: 'flex', alignItems: 'center', gap: 16, background: C.white, padding: '14px 30px', borderRadius: 40, boxShadow: '0 10px 0 rgba(0,0,0,0.3)'}}>
			<Cup fill="latte" steam scale={6} />
			<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.bg}}>perfecto</span>
		</div>
	);
};

/** Pantalla del monitor pequeño de la frase: rechaza el pensamiento. */
const PantallaRechazo: React.FC = () => {
	const f = useCurrentFrame();
	const golpe = T.queremos + 11;
	const rojo = f >= golpe && f < golpe + 26;
	return (
		<div style={{position: 'absolute', inset: 0, background: rojo ? 'rgba(255,77,94,0.22)' : 'transparent', fontFamily: MONO, color: C.green}}>
			<div style={{position: 'absolute', left: 36, top: 30, fontSize: 30, fontWeight: 800, lineHeight: 1.6}}>
				{[T.v57 + 8, T.v57 + 18, T.v57 + 28].map((t, i) => (f >= t ? <div key={i} style={{color: i === 2 ? C.white : C.green}}>{['> instrucción 1', '> instrucción 2', '> instrucción 3'][i]}</div> : null))}
			</div>
			{rojo && <div style={{position: 'absolute', right: 70, top: 90, fontSize: 200, fontWeight: 800, color: C.red, textShadow: `0 0 40px ${C.red}`, transform: `scale(${0.6 + 0.4 * pop(f, golpe, 7, 400, 0.4)})`}}>✕</div>}
		</div>
	);
};

const ChatLid: React.FC<{lid: number}> = ({lid}) => {
	const f = useCurrentFrame();
	const palabras = ['leche', 'un', 'Quiero', 'con', 'café'];
	const orden = ['Quiero', 'un', 'café', 'con', 'leche'];
	const w = (t: string) => t.length * 26 + 22;
	const xsFor = (lst: string[]) => {
		let x = 0;
		const m: Record<string, number> = {};
		for (const t of lst) {
			m[t] = x;
			x += w(t);
		}
		return m;
	};
	const xa = xsFor(palabras);
	const xb = xsFor(orden);
	const total = orden.reduce((a, t) => a + w(t), 0);
	const kf = pop(f, T.flex, 12, 200, 0.6);
	const ok = f >= T.flex + 8;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 920, height: 560, background: '#101512', border: `4px solid ${C.green}`, boxSizing: 'border-box', transformOrigin: '50% 0', transform: `perspective(1400px) rotateX(${-lid * 100}deg)`, opacity: lid > 0.96 ? 0 : 1, backfaceVisibility: 'hidden', overflow: 'hidden', boxShadow: `0 0 40px ${C.green}33`}}>
			<div style={{height: 66, background: C.green, color: C.bg, fontFamily: MONO, fontWeight: 800, fontSize: 34, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14}}>● ASISTENTE</div>
			{/* mensaje de la persona */}
			<div style={{position: 'absolute', right: 30, top: 110, width: total + 60, height: 96, background: C.white, borderRadius: 30, boxShadow: '0 8px 0 rgba(0,0,0,0.3)'}}>
				{f >= T.escribimos && palabras.map((t, i) => {
					const t0 = T.escribimos + i * 4;
					const pp = pop(f, t0, 10, 260, 0.6);
					const x = xa[t] + (xb[t] - xa[t]) * kf;
					const y = ok ? 0 : (i % 2 ? 6 : -6) * (1 - kf);
					return f >= t0 ? <span key={t} style={{position: 'absolute', left: 30 + x, top: 22 + y, fontFamily: SANS, fontWeight: 800, fontSize: 44, color: ok ? C.bg : '#6B1D26', transform: `scale(${pp}) rotate(${(1 - kf) * (i % 2 ? 5 : -5)}deg)`, whiteSpace: 'nowrap'}}>{t}</span> : null;
				})}
				{ok && <div style={{position: 'absolute', right: -14, top: -16, width: 52, height: 52, borderRadius: 26, background: C.green, color: C.bg, fontFamily: MONO, fontWeight: 800, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, T.flex + 8, 8, 300, 0.4)})`}}>✓</div>}
			</div>
			{/* respuesta */}
			{ok && (
				<div style={{position: 'absolute', left: 30, top: 270, display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(0,192,99,0.18)', border: `3px solid ${C.green}`, borderRadius: 30, padding: '14px 34px', transform: `scale(${pop(f, T.flex + 12, 10, 260, 0.6)})`, transformOrigin: '0 50%'}}>
					<Cup fill="latte" steam scale={8} />
					<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 48, color: C.white}}>¡Listo!</span>
				</div>
			)}
		</div>
	);
};

const Asistente: React.FC = () => {
	const f = useCurrentFrame();
	const pp = pop(f, T.sistemas, 11, 240, 0.6);
	const lid = tween(f, T.incluso, T.incluso + 16, 0, 1, inOutCubic);
	const reglas = [['SI pide → responder', T.instruccion], ['REGLA: ser claro', T.reglas58], ['REGLA: no inventar', T.alguien - 6]] as [string, number][];
	return (
		<div style={{position: 'absolute', left: 640, top: 320, width: 920, height: 560, transform: `scale(${(0.5 + 0.5 * pp) * 1.1})`, opacity: Math.min(1, pp * 2), transformOrigin: '50% 100%'}}>
			{/* interior */}
			<div style={{position: 'absolute', inset: 0, background: '#0B0F0D', border: `4px solid ${C.amber}`, boxSizing: 'border-box', boxShadow: `0 0 40px ${C.amber}33`, overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: 50, top: 150, transform: `rotate(${f * 4}deg)`}}>{pxs(ENG_V, 14)}</div>
				<div style={{position: 'absolute', left: 250, top: 40, transform: `rotate(${-f * 5.6 + 12}deg)`}}>{pxs(ENG_A, 9)}</div>
				<div style={{position: 'absolute', left: 190, top: 330, transform: `rotate(${f * 6}deg)`}}>{pxs(ENG_V, 8)}</div>
				<div style={{position: 'absolute', left: 450, top: 70, width: 430}}>
					<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.amber, marginBottom: 14}}>INSTRUCCIONES</div>
					{reglas.map(([t, t0], i) => (f >= t0 ? <div key={i} style={{marginBottom: 22, padding: '10px 16px', fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.white, background: 'rgba(255,181,71,0.14)', borderLeft: `8px solid ${C.amber}`, transform: `translateX(${(1 - pop(f, t0, 11, 260, 0.6)) * 300}px)`, whiteSpace: 'nowrap'}}>{t}</div> : null))}
				</div>
			</div>
			<ChatLid lid={lid} />
		</div>
	);
};

const FraseCentral: React.FC = () => {
	const f = useCurrentFrame();
	const k = f >= T.v58 ? pop(f, T.v58, 14, 200, 0.7) : 0;
	const scale = 1 - 0.5 * k;
	const ty = -560 * k;
	return (
		<div style={{position: 'absolute', inset: 0, transformOrigin: `${BOX_X + BOX_W / 2}px 715px`, transform: `translateY(${ty}px) scale(${scale})`}}>
			<Frase text="NO HACE LO QUE QUEREMOS." t0={T.no57} y={650} />
			<Frase text="HACE LO QUE LE INDICAMOS." t0={T.hace2} y={780} verde={[15, 24]} />
			{f >= T.indicamos && f < T.indicamos + 40 && (
				<div style={{position: 'absolute', left: BOX_X + 15 * 50.4, top: 780 + 40, width: 9 * 50.4 * tween(f, T.indicamos + 4, T.indicamos + 14), height: 10, background: C.green, boxShadow: `0 0 20px ${C.green}`}} />
			)}
			{f >= T.indicamos + 40 && <div style={{position: 'absolute', left: BOX_X + 15 * 50.4, top: 780 + 40, width: 9 * 50.4, height: 10, background: C.green, boxShadow: `0 0 20px ${C.green}`}} />}
		</div>
	);
};

const Oscuro: React.FC = () => {
	const f = useCurrentFrame();
	const sale = tween(f, T.v58 - 14, T.v58 - 2, 0, 1, inCubic);
	const [sx, sy] = shake(f, T.queremos + 11, 14, 10);
	const [sx2, sy2] = shake(f, T.indicamos, 12, 10);
	return (
		<>
			<Board />
			<div style={{position: 'absolute', inset: -200, background: 'radial-gradient(900px 600px at 1200px 600px, rgba(0,0,0,0) 20%, rgba(0,0,0,0.55) 100%)'}} />
			<div style={{position: 'absolute', inset: 0, transform: `translate(${sx + sx2}px, ${sy + sy2}px)`}}>
				<Vee
					x={270}
					acts={[
						[T.decimos, 'explicar'],
						[T.lo1, 'pensar'],
						[T.hace2, 'senalar'],
						[T.indicamos, 'celebrar'],
						[T.sistemas, 'explicar'],
						[T.incluso, 'pensar'],
						[T.alguien, 'senalar'],
					] as [number, VeeAct][]}
				/>
				{/* monitor de la idea */}
				<Pc x={1450} top={110} s={0.8} appear={T.v57 + 4} dy={-sale * 700}>
					<PantallaRechazo />
				</Pc>
				<Tag x={800} y={240} at={T.v57 + 3} out={T.computadora57 + 8} color={C.green} size={54}>IDEA CLAVE</Tag>
				<Pensamiento />
				<FraseCentral />
				{f >= T.sistemas && <Asistente />}
				{f >= T.alguien && (
					<div style={{position: 'absolute', left: 1650, top: 560, transform: `translateY(${(1 - pop(f, T.alguien, 10, 220, 0.6)) * 280}px)`}}>
						{pxs(PROG, 11)}
					</div>
				)}
				<Tag x={560} y={165} at={T.v58 + 6} out={T.sistemas + 30} color={C.blue} size={50}>HOY</Tag>
				<Hit at={T.queremos + 11} x={1175} y={290} />
				<Hit at={T.indicamos + 2} x={BOX_X + 15 * 50.4 + 227} y={800} big />
				<Shockwave at={T.indicamos + 2} x={960} y={780} size={1500} />
				<Hit at={T.sistemas + 2} x={1100} y={560} />
				<Hit at={T.disenio} x={1700} y={680} />
				<SpeedLines at={T.incluso} len={8} mode="radial" x={1100} y={560} count={16} color={C.amber} />
			</div>
		</>
	);
};

/* ================================================================== 5 · tres ideas: V59 y V60 */

const TarjetaIdea: React.FC<{x: number; t0: number; color: string; titulo: string; num: string; children: React.ReactNode}> = ({x, t0, color, titulo, num, children}) => (
	<>
		<In at={t0} x={x} y={110} w={520} from="up" impact>
			<div style={{width: 520, height: 560, boxSizing: 'border-box', background: 'rgba(12,16,14,0.97)', border: `6px solid ${color}`, boxShadow: `0 0 50px ${color}44, 0 24px 0 rgba(0,0,0,0.35)`, position: 'relative', overflow: 'hidden'}}>
				<div style={{height: 100, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', background: `${color}22`, borderBottom: `4px solid ${color}`}}>
					<span style={{width: 56, height: 56, background: color, color: C.bg, fontFamily: MONO, fontWeight: 800, fontSize: 42, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{num}</span>
					<span style={{fontFamily: MONO, fontWeight: 800, fontSize: 46, color}}>{titulo}</span>
				</div>
				{children}
			</div>
		</In>
		<Hit at={t0 + 3} x={x + 260} y={680} />
	</>
);

const Vagon: React.FC<{t0: number; n?: string; loco?: boolean; k: number}> = ({t0, n, loco, k}) => {
	const f = useCurrentFrame();
	if (f < t0) return null;
	const p = pop(f, t0, 11, 260, 0.55);
	const w = loco ? 120 : 100;
	const h = loco ? 110 : 90;
	const x = (loco ? 20 : 20 + 134 + (k - 1) * 114);
	const col = loco ? C.green : C.blue;
	return (
		<div style={{position: 'absolute', left: x, top: 340 - h, width: w, height: h, transform: `translateX(${(1 - p) * 460}px)`, opacity: Math.min(1, p * 2)}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: w, height: h - 18, background: col, border: `4px solid ${C.white}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.bg}}>{loco ? '▶' : n}</div>
			{loco && <div style={{position: 'absolute', left: 10, top: -26, width: 24, height: 26, background: '#7F8D86'}} />}
			{[18, w - 46].map((lx, i) => <div key={i} style={{position: 'absolute', left: lx, top: h - 30, width: 28, height: 28, borderRadius: 14, background: C.white, border: '5px solid #39423E', boxSizing: 'border-box'}} />)}
			{!loco && <div style={{position: 'absolute', left: -14, top: h - 46, width: 14, height: 8, background: C.white}} />}
		</div>
	);
};

const Secuencia: React.FC = () => {
	const f = useCurrentFrame();
	const rodando = f >= T.otro + 10 ? Math.sin((f - T.otro) / 3) * 3 : 0;
	return (
		<div style={{position: 'absolute', left: 0, top: 100, right: 0, bottom: 0, transform: `translateX(${rodando}px)`}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 244, height: 8, background: '#5B6A63'}} />
			{Array.from({length: 12}, (_, i) => <div key={i} style={{position: 'absolute', left: 14 + i * 42, top: 252, width: 14, height: 22, background: '#3F2E22'}} />)}
			<Vagon t0={T.pasos59} loco k={0} />
			<Vagon t0={T.uno} n="1" k={1} />
			<Vagon t0={T.tras} n="2" k={2} />
			<Vagon t0={T.otro} n="3" k={3} />
			{f >= T.otro + 4 && <div style={{position: 'absolute', left: 30, top: 300, width: 440, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.green, opacity: tween(f, T.otro + 4, T.otro + 12)}}>1 → 2 → 3</div>}
		</div>
	);
};

const Decision: React.FC = () => {
	const f = useCurrentFrame();
	const pq = pop(f, T.como1, 11, 260, 0.6);
	const press = T.azucar;
	return (
		<div style={{position: 'absolute', left: 0, top: 100, right: 0, bottom: 0}}>
			{f >= T.como1 && <div style={{position: 'absolute', left: 0, right: 0, top: 22, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 60, color: C.amber, transform: `scale(${pq})`, textShadow: `0 0 20px ${C.amber}88`}}>¿AZÚCAR?</div>}
			{f >= T.como1 + 4 && (
				<div style={{position: 'absolute', left: 14, top: 120, transform: `scale(${0.78 * pop(f, T.como1 + 4, 11, 260, 0.6)})`, transformOrigin: '0 0'}}>
					<ChoiceButton label="SÍ" color={C.green} pressAt={press} />
				</div>
			)}
			{f >= T.como1 + 4 && (
				<div style={{position: 'absolute', left: 266, top: 120, transform: `scale(${0.78 * pop(f, T.como1 + 4, 11, 260, 0.6)})`, transformOrigin: '0 0'}}>
					<ChoiceButton label="NO" color={C.red} dim={f >= press} />
				</div>
			)}
			{f >= T.como1 + 10 && (
				<div style={{position: 'absolute', left: 205, top: 270, transform: `translateY(${f >= press ? -Math.abs(Math.sin((f - press) / 3)) * 14 : 0}px)`}}>
					<SugarBowl scale={10} />
				</div>
			)}
			{f >= press && <div style={{position: 'absolute', left: 340, top: 235, fontFamily: MONO, fontWeight: 800, fontSize: 90, color: C.green, textShadow: `0 0 24px ${C.green}`, transform: `scale(${pop(f, press, 8, 320, 0.5)})`}}>✓</div>}
		</div>
	);
};

const Repeticion: React.FC = () => {
	const f = useCurrentFrame();
	const girando = f >= T.revolver && f < T.veces + 14;
	const n = f >= T.veces ? 3 : f >= T.varias ? 2 : f >= T.revolver ? 1 : 0;
	const ang = girando ? (f - T.revolver) * 16 : 0;
	return (
		<div style={{position: 'absolute', left: 0, top: 100, right: 0, bottom: 0}}>
			<div style={{position: 'absolute', left: 90, top: 70, width: 240, height: 240, borderRadius: '50%', border: `8px dashed ${C.amber}`, boxSizing: 'border-box', transform: `rotate(${ang}deg)`, opacity: n > 0 ? 1 : 0.35}} />
			<div style={{position: 'absolute', left: 130, top: 150}}>
				<Cup fill="latte" scale={13} />
				<div style={{position: 'absolute', left: 36, top: -70, transform: `rotate(${girando ? Math.sin(ang / 20) * 24 : 0}deg)`, transformOrigin: '50% 90%'}}><Spoon scale={9} /></div>
			</div>
			<Counter x={410} y={150} value={n || ''} at={T.revolver} size={150} color={C.amber} />
			{n > 0 && <Counter x={410} y={150} value={n} at={n === 1 ? T.revolver : n === 2 ? T.varias : T.veces} out={n === 1 ? T.varias : n === 2 ? T.veces : undefined} size={150} color={C.amber} />}
			{f >= T.veces + 10 && <Counter x={410} y={290} value="✓" at={T.veces + 10} size={110} color={C.green} />}
			{f >= T.revolver && f < T.veces + 10 && <div style={{position: 'absolute', left: 30, top: 340, width: 470, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 36, color: C.amber}}>{'↻ ×' + (n || 1)}</div>}
		</div>
	);
};

const Ideas: React.FC = () => {
	const f = useCurrentFrame();
	const out = T.secuencias - 5;
	const [sx, sy] = shake(f, T.proximas + 4, 14, 10);
	return (
		<>
			<Board />
			<Suelo />
			<Vee x={270} scale={7} acts={[[T.algoritmos, 'senalar'], [T.tres, 'explicar'], [T.decisiones, 'senalar'], [T.revolver, 'explicar'], [T.calma, 'celebrar']] as [number, VeeAct][]} />
			{/* título: «3 ideas… una y otra vez» */}
			<Slam at={T.algoritmos} out={out} x={960} y={190}>
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 130, color: C.white, textShadow: `0 8px 0 rgba(0,0,0,0.5)`}}>ALGORITMOS</div>
			</Slam>
			<Slam at={T.tres} out={out} x={760} y={520}>
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 420, color: C.green, textShadow: `0 0 60px ${C.green}88, 0 12px 0 rgba(0,0,0,0.5)`, lineHeight: 1}}>3</div>
			</Slam>
			<Slam at={T.ideas} out={out} x={1250} y={560}>
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 190, color: C.white, textShadow: `0 8px 0 rgba(0,0,0,0.5)`}}>IDEAS</div>
			</Slam>
			{f >= T.una && f < out + 8 && (
				<div style={{position: 'absolute', left: 1500, top: 720, transform: `translate(-50%, -50%) rotate(${(f - T.una) * 12}deg) scale(${pop(f, T.una, 10, 260, 0.6)})`, fontFamily: MONO, fontWeight: 800, fontSize: 200, color: C.amber, textShadow: `0 0 30px ${C.amber}88`, lineHeight: 1}}>↻</div>
			)}
			{f >= T.otra && f < out + 8 && <Tag x={1500} y={880} at={T.otra} out={out} color={C.amber} size={46}>OTRA VEZ</Tag>}
			<SpeedLines at={T.tres} len={9} mode="radial" x={760} y={520} count={20} color={C.green} />
			<Shockwave at={T.tres + 3} x={760} y={520} size={1400} />
			{/* huecos de las tres tarjetas (llenan el cuadro hasta que cae cada una) */}
			{([[90, T.secuencias, '1'], [700, T.decisiones, '2'], [1310, T.repeticiones, '3']] as [number, number, string][]).map(([gx, gt, gn]) =>
				f >= out && f < gt ? (
					<div key={gn} style={{position: 'absolute', left: gx, top: 110, width: 520, height: 560, boxSizing: 'border-box', border: `5px dashed ${C.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 260, color: 'rgba(233,238,234,0.12)'}}>{gn}</div>
				) : null
			)}
			{/* las tres tarjetas */}
			<div style={{position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)`, opacity: f >= T.proximas ? 0.85 : 1}}>
				<TarjetaIdea x={90} t0={T.secuencias} color={C.green} titulo="SECUENCIA" num="1"><Secuencia /></TarjetaIdea>
				<TarjetaIdea x={700} t0={T.decisiones} color={C.blue} titulo="DECISIÓN" num="2"><Decision /></TarjetaIdea>
				<TarjetaIdea x={1310} t0={T.repeticiones} color={C.amber} titulo="REPETICIÓN" num="3"><Repeticion /></TarjetaIdea>
			</div>
			{/* V60: sello y robot trapeando */}
			<RobotTrapea />
			<Stamp x={960} y={380} at={T.proximas} text="PRÓXIMAMENTE" color={C.amber} size={120} />
			<Hit at={T.proximas + 4} x={960} y={380} big />
		</>
	);
};

const RobotTrapea: React.FC = () => {
	const f = useCurrentFrame();
	if (f < T.calma - 4) return null;
	const k = tween(f, T.calma - 4, T.b1 + 6, 0, 1, (t) => t);
	const x = 2100 - 2400 * k;
	const swing = Math.sin(f / 3) * 14;
	return (
		<>
			<div style={{position: 'absolute', left: x, top: FLOOR - 20, width: 2200 - x, height: 14, background: 'rgba(124,255,179,0.35)'}} />
			<Robot x={x} y={FLOOR - 4} scale={8} pose="hold" face="happy" flip holdF={<div style={{position: 'relative', top: 70, left: -20, transform: `rotate(${swing}deg)`}}><Mop scale={8} /></div>} />
		</>
	);
};

/* ================================================================== el bloque */

export const B6: React.FC = () => {
	const f = useCurrentFrame();
	const mundo = f < SW.pantalla;
	const pantalla = f >= SW.pantalla && f < SW.iris;
	const progs = f >= SW.iris && f < SW.oscuro;
	const oscuro = f >= SW.oscuro && f < SW.pizarra;
	const ideas = f >= SW.pizarra;
	return (
		<AbsoluteFill>
			{mundo && <MundoPC />}
			{pantalla && (
				<>
					<Board />
					<Suelo />
					<PantallaLados />
					<PantallaGrande />
					<Hit at={T.final + 1} x={960} y={540} big />
					<Hit at={T.ejecuta + 1} x={1330} y={lineY(1)} />
					<GlitchBurst at={T.v56 - 1} len={4} intensity={0.8} />
					<CutFlash at={T.v56} len={3} max={0.4} />
					<Shockwave at={T.obvios + 8} x={820} y={lineY(1)} size={800} color={C.red} dur={22} />
					<WipeBar at={T.ni - 3} dur={12} />
				</>
			)}
			{progs && <Programadores />}
			{oscuro && <Oscuro />}
			{ideas && <Ideas />}
			{/* transiciones de impacto */}
			<Iris at={SW.iris} x={960} y={540} dur={22} />
			<WipeBar at={T.v57 - 7} dur={14} />
			<Barrido at={T.v59} dur={18} />
		</AbsoluteFill>
	);
};

/** Vee y el robot a los lados del monitor grande. */
const PantallaLados: React.FC = () => {
	const f = useCurrentFrame();
	const act = lineaActiva(f);
	const ent = tween(f, T.v55, T.v55 + 14, 0, 1, outCubic);
	return (
		<>
			<Vee
				x={[[T.v55, -120], [T.v55 + 14, 150]]}
				scale={8}
				acts={[
					[T.toma, 'explicar'],
					[T.primera + 8, 'senalar'],
					[T.paso1, 'explicar'],
					[T.final, 'celebrar'],
					[T.salta, 'senalar'],
					[T.obvios + 8, 'sorpresa'],
					[T.completa, 'explicar'],
				] as [number, VeeAct][]}
			/>
			<Robot x={2060 - 280 * ent} y={FLOOR} scale={8} pose="idle" face={f >= T.final && f < T.v56 ? 'proud' : f >= T.obvios + 8 && f < T.obvios + 40 ? 'wow' : 'focus'} flip look={[-1, 0]} chest={f < T.v56 ? (act < 0 ? '' : f >= T.final ? '✓' : String(act)) : ''} />
		</>
	);
};

/* ================================================================== sonido */

export const sfxB6: Sfx[] = [
	// V53
	s(T.esto, 'whoosh', 0.22),
	s(T.computadoras, 'hit', 0.4),
	s(T.computadoras + 5, 'land', 0.3),
	s(T.computadora, 'typing', 0.22),
	s(T.parece, 'hit', 0.38),
	s(T.parece + 2, 'rise', 0.25),
	s(T.mucho, 'blip', 0.28),
	s(T.robot, 'blip', 0.28),
	s(T.robot + 3, 'pop', 0.3),
	// V54
	s(T.algoritmo, 'pop', 0.3),
	s(T.escribe - 15, 'whoosh', 0.3),
	s(T.escribe + 2, 'land', 0.4),
	s(T.escribe + 3, 'ac', 0.25),
	s(T.escribe + 10, 'riser', 0.25),
	s(T.lenguaje, 'glitch', 0.35),
	s(T.ejecutar, 'blip', 0.3),
	s(T.convierte, 'rise', 0.3),
	s(T.programa, 'hit', 0.45),
	s(T.programa + 1, 'flash', 0.3),
	// V55
	s(T.toma, 'blip', 0.28),
	s(T.primera, 'blip', 0.28),
	s(T.ejecuta, 'check', 0.4),
	s(T.pasa, 'blip', 0.28),
	s(T.y55, 'ticks', 0.25),
	s(T.paso1, 'blip', 0.2),
	s(T.hasta, 'blip', 0.2),
	s(T.final, 'fanfare', 0.3),
	s(T.final + 1, 'hit', 0.4),
	// V56
	s(T.v56, 'flash', 0.25),
	s(T.salta, 'whoosh', 0.25),
	s(T.parezcan, 'pop', 0.3),
	s(T.obvios, 'slash', 0.35),
	s(T.obvios + 8, 'boing', 0.45),
	s(T.obvios + 8, 'no', 0.2),
	s(T.obvios + 14, 'pop', 0.25),
	s(T.ni - 3, 'whoosh', 0.35),
	s(T.completa, 'pop', 0.3),
	s(T.olvidaste, 'splash', 0.3),
	s(T.sigue - 12, 'whoosh', 0.3),
	s(T.reglas56, 'pop', 0.3),
	s(T.definieron, 'blip', 0.25),
	s(T.quienes, 'hit', 0.35),
	s(T.la56, 'hit', 0.35),
	s(T.programaron, 'hit', 0.45),
	// V57
	s(T.v57 - 7, 'whoosh', 0.35),
	s(T.decimos + 2, 'pop', 0.3),
	s(T.v57 + 4, 'land', 0.35),
	s(T.no57, 'typing', 0.28),
	s(T.lo1, 'pop', 0.3),
	s(T.queremos, 'whoosh', 0.28),
	s(T.queremos + 11, 'boing', 0.45),
	s(T.queremos + 11, 'no', 0.28),
	s(T.hace2, 'typing', 0.28),
	s(T.indicamos, 'draw', 0.3),
	s(T.indicamos + 2, 'hit', 0.45),
	s(T.indicamos + 20, 'sparkle', 0.25),
	// V58
	s(T.v58, 'whoosh', 0.3),
	s(T.sistemas, 'land', 0.35),
	s(T.escribimos, 'key', 0.25),
	s(T.flex, 'rewind', 0.2),
	s(T.flex + 8, 'check', 0.4),
	s(T.incluso, 'slide', 0.35),
	s(T.incluso + 10, 'servo', 0.3),
	s(T.instruccion, 'blip', 0.25),
	s(T.reglas58, 'blip', 0.25),
	s(T.alguien, 'rise', 0.3),
	s(T.disenio, 'hit', 0.4),
	// V59
	s(T.v59, 'whoosh', 0.4),
	s(T.algoritmos, 'hit', 0.35),
	s(T.tres, 'hit', 0.45),
	s(T.ideas, 'hit', 0.4),
	s(T.una, 'rise', 0.25),
	s(T.otra, 'pop', 0.3),
	s(T.secuencias, 'land', 0.45),
	s(T.pasos59, 'plop', 0.3),
	s(T.uno, 'plop', 0.3),
	s(T.tras, 'plop', 0.3),
	s(T.otro, 'plop', 0.3),
	s(T.decisiones, 'land', 0.45),
	s(T.como1, 'pop', 0.3),
	s(T.azucar, 'key', 0.4),
	s(T.azucar + 2, 'ac', 0.3),
	s(T.repeticiones, 'land', 0.45),
	s(T.revolver, 'stir', 0.3),
	s(T.varias, 'blip', 0.28),
	s(T.veces, 'blip', 0.28),
	s(T.veces + 10, 'check', 0.4),
	// V60
	s(T.proximas, 'hit', 0.45),
	s(T.proximas + 2, 'fanfare', 0.25),
	s(T.calma, 'sparkle', 0.3),
	s(T.calma + 8, 'servo', 0.2),
];
