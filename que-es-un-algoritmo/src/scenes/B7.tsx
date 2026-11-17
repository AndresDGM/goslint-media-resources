import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inCubic, inOutCubic, pop, tween, typed} from '@commons/lib';
import {Buf, PixelBurst, PixelSprite} from '@commons/pixel';
import {CutFlash, GlitchBurst, LogoMark, Shockwave, WipeBar, shake} from '@commons/components';
import {Hit, In} from '@commons/vertical';
import {Barrido, Slam, SpeedLines} from '@commons/transiciones';
import {
	Board, Bread, Cam, ConceptCard, Cup, DetailSlider, FLOOR, InstrCard, Kitchen, Mop, Put, Robot, RobotSays, ROBOT_X, SLOT, Stamp, Tag, TypeLine, Vee, VEE_X, TABLE_Y, lerpPt,
} from '../kit';
import type {RobotFace, Shot} from '../kit';
import {Sfx, s} from '../sfx';
import {BLOCKS, after, at, end} from '../timeline';

/**
 * Bloque 7 · «Tu turno» (cierre y reto del sándwich).
 *   V61  repaso: 4 tarjetas de concepto caen y se funden en «ALGORITMO»
 *   V62  fichas de uso diario, deslizador de detalle y marca del robot
 *   V63  la cámara entra hacia Vee: «primero describir» (lista ✓ ✓ ✓)
 *   N02  ¡TU TURNO!, caja de comentarios y los ingredientes sobre la mesa
 *   N03  el robot espera instrucciones (gag del pan) · V64 despedida y trapeador escondido
 *   final  pantalla de cierre con el reto y el logotipo
 * Todo se ancla a las marcas de la voz (at/end/after).
 */

/* ================================================================== tiempos */

const T0 = BLOCKS.b7[0];
const T1 = BLOCKS.b7[1];

// V61
const v61 = at('V61');
const v61Un = at('V61', 'un');
const v61Alg = at('V61', 'algoritmo');
const v61Sec = at('V61', 'secuencia');
const v61Ord = at('V61', 'ordenada');
const v61Fin = at('V61', 'finita');
const v61Pas = at('V61', 'pasos');
const v61Res = at('V61', 'resolver');
const v61Prob = at('V61', 'problema');
// V62
const v62 = at('V62');
const v62Todos = at('V62', 'todos');
const v62Puede = at('V62', 'puede');
const v62Mas = at('V62', 'mas');
const v62Det = at('V62', 'detalle');
const v62Ese = at('V62', 'ese');
const v62Adec = at('V62', 'adecuado');
const v62Para = at('V62', 'para');
const v62Quien = at('V62', 'quien');
// cortes de escena
const tK = end('V62') + 4; // Tablero → cocina
const tN2 = at('N02') - 5;
const tN3 = at('N03') - 5;
const tV64 = at('V64') - 5;
const tF = after('V64', 0.12); // cocina → pantalla final
// V63
const v63 = at('V63');
const v63Rec = at('V63', 'recuerda');
const v63Ens = at('V63', 'ensenarle');
const v63Comp = at('V63', 'computadora');
const v63Res = at('V63', 'resolver');
const v63Prob = at('V63', 'problema');
const v63Prim = at('V63', 'primero');
const v63Deb = at('V63', 'debemos');
const v63Desc = at('V63', 'describir');
const v63Como = at('V63', 'como');
const v63Resv = at('V63', 'resolverlo');
// N02
const n02 = at('N02');
const n02Toca = at('N02', 'toca');
const n02Esc = at('N02', 'escribe');
const n02Com = at('N02', 'comentarios');
const n02El = at('N02', 'el');
const n02Alg = at('N02', 'algoritmo');
const n02Prep = at('N02', 'preparar');
const n02Sand = at('N02', 'sandwich');
// N03
const n03 = at('N03');
const n03Ojo = at('N03', 'ojo');
const n03Va = at('N03', 'va');
const n03Ejec = at('N03', 'ejecutar');
const n03Robot = at('N03', 'robot');
const n03No = at('N03', 'no');
const n03Nada = at('N03', 'nada');
const gag = end('N03'); // arranca el silencio de 1,4 s
// V64
const v64 = at('V64');
const v64Vemos = at('V64', 'vemos');
const v64Prox = at('V64', 'proxima');
const v64Tu = at('V64', 'tu');
const v64Ni = at('V64', 'ni');
const v64Limp = at('V64', 'limpiar');
const v64Piso = at('V64', 'piso');
const v64Alg = at('V64', 'algoritmo');

/* ================================================================== dibujos de pixel art propios */

const px = (w: number, h: number, draw: (b: Buf) => void, scale: number) => {
	const b = new Buf(w, h);
	draw(b);
	return <PixelSprite buf={b} scale={scale} />;
};

const icoReceta = (sc: number) =>
	px(14, 12, (b) => {
		b.rect(0, 1, 14, 11, '#00864A');
		b.rect(1, 0, 12, 11, '#F4F7F5');
		b.rect(6, 0, 2, 11, '#CBD5CF');
		[2, 4, 6, 8].forEach((y) => {
			b.rect(2, y, 3, 1, '#8E9A94');
			b.rect(9, y, 3, 1, '#8E9A94');
		});
		b.rect(2, 9, 3, 1, '#00C063');
	}, sc);

const icoRuta = (sc: number) =>
	px(14, 12, (b) => {
		b.line(1, 10, 5, 10, '#00C063', 1);
		b.line(5, 10, 5, 5, '#00C063', 1);
		b.line(5, 5, 10, 5, '#00C063', 1);
		b.line(10, 5, 10, 2, '#00C063', 1);
		b.rect(0, 9, 2, 2, '#FFFFFF');
		b.rect(10, 0, 1, 4, '#FFFFFF');
		b.rect(11, 0, 3, 2, '#FF4D5E');
	}, sc);

const icoMaquina = (sc: number) =>
	px(14, 12, (b) => {
		b.rect(1, 0, 12, 12, '#B9C3BE');
		b.rect(12, 0, 1, 12, '#8E9A94');
		b.rect(2, 1, 7, 7, '#0E110F');
		b.rect(3, 2, 2, 2, '#FFB547');
		b.rect(6, 2, 2, 2, '#FF4D5E');
		b.rect(3, 5, 2, 2, '#00C063');
		b.rect(6, 5, 2, 2, '#5AA9FF');
		b.rect(10, 1, 2, 5, '#39423E');
		b.rect(3, 9, 6, 2, '#0E110F');
	}, sc);

const icoSecuencia = (sc: number) =>
	px(21, 5, (b) => {
		[0, 8, 16].forEach((x) => b.rect(x, 0, 5, 5, '#FFFFFF'));
		[5, 13].forEach((x) => {
			b.rect(x, 2, 2, 1, '#00C063');
			b.rect(x + 2, 1, 1, 3, '#00C063');
		});
	}, sc);

const icoFinita = (sc: number) =>
	px(11, 12, (b) => {
		b.rect(1, 0, 1, 12, '#FFFFFF');
		b.rect(2, 0, 8, 6, '#00C063');
		for (let y = 0; y < 6; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2 === 0 && x > 3) b.set(2 + x, y, '#070807');
	}, sc);

const icoPasos = (sc: number) =>
	px(12, 12, (b) => {
		b.rect(0, 9, 3, 3, '#FFFFFF');
		b.rect(3, 6, 3, 6, '#FFFFFF');
		b.rect(6, 3, 3, 9, '#FFFFFF');
		b.rect(9, 0, 3, 12, '#00C063');
	}, sc);

/** PC pequeño (16×14): monitor y base. */
const PcSprite: React.FC<{sc?: number; text?: string; color?: string; at?: number}> = ({sc = 11, text, color = C.green, at: tAt = 0}) => {
	const f = useCurrentFrame();
	const p = pop(f, tAt, 10, 280, 0.5);
	return (
		<div style={{position: 'relative'}}>
			{px(16, 14, (b) => {
				b.rect(0, 0, 16, 11, '#B9C3BE');
				b.rect(14, 0, 2, 11, '#8E9A94');
				b.rect(1, 1, 13, 8, '#0E110F');
				b.rect(6, 11, 4, 1, '#7E8A84');
				b.rect(2, 12, 12, 2, '#7E8A84');
				b.rect(3, 12, 10, 1, '#B9C3BE');
			}, sc)}
			{text && (
				<div style={{position: 'absolute', left: sc, top: sc, width: 13 * sc, height: 8 * sc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 6.4 * sc, color, textShadow: `0 0 14px ${color}`, transform: `scale(${0.5 + 0.5 * p})`}}>{text}</div>
			)}
		</div>
	);
};

/** Ingredientes del sándwich dibujados aquí (no existen en el kit). */
const Queso: React.FC<{sc?: number}> = ({sc = 12}) =>
	px(12, 9, (b) => {
		[12, 12, 11, 10, 9, 8, 6, 4, 2].forEach((w, y) => b.rect(0, y, w, 1, '#F2C230'));
		b.rect(0, 8, 2, 1, '#C9951A');
		b.rect(0, 0, 12, 1, '#FFE08A');
		[[3, 2], [7, 3], [2, 5], [5, 5]].forEach(([x, y]) => b.rect(x, y, 1, 1, '#C9951A'));
	}, sc);

const Jamon: React.FC<{sc?: number}> = ({sc = 12}) =>
	px(12, 8, (b) => {
		b.rect(1, 0, 10, 8, '#E58C8A');
		b.rect(0, 1, 12, 6, '#E58C8A');
		b.rect(1, 0, 10, 1, '#F4B8B5');
		b.rect(1, 7, 10, 1, '#B8605E');
		b.rect(3, 3, 5, 1, '#F4B8B5');
		b.rect(2, 5, 4, 1, '#F4B8B5');
	}, sc);

const Lechuga: React.FC<{sc?: number}> = ({sc = 12}) =>
	px(12, 8, (b) => {
		b.rect(0, 2, 12, 5, '#5DBB4B');
		[0, 4, 8].forEach((x) => b.rect(x, 1, 3, 1, '#5DBB4B'));
		[2, 6, 10].forEach((x) => b.rect(x, 0, 2, 1, '#9BE08A'));
		b.rect(0, 6, 12, 2, '#3E8F34');
		b.rect(3, 3, 1, 3, '#9BE08A');
		b.rect(8, 3, 1, 3, '#9BE08A');
	}, sc);

const Tomate: React.FC<{sc?: number}> = ({sc = 12}) =>
	px(11, 11, (b) => {
		for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) if ((x - 5) ** 2 + (y - 5.5) ** 2 <= 25) b.set(x, y, '#E2463E');
		b.rect(2, 8, 7, 2, '#A8302A');
		b.rect(2, 2, 2, 2, '#F08A84');
		b.rect(4, 0, 3, 2, '#3EA04B');
	}, sc);

/** Flecha grande hacia abajo (pixel art). */
const FlechaAbajo: React.FC<{sc?: number}> = ({sc = 14}) =>
	px(11, 13, (b) => {
		b.rect(3, 0, 5, 7, '#FFFFFF');
		b.rect(4, 0, 3, 7, '#00C063');
		for (let i = 0; i < 6; i++) {
			b.rect(i, 7 + i, 11 - 2 * i, 1, '#FFFFFF');
			if (11 - 2 * i - 2 > 0) b.rect(i + 1, 7 + i, 11 - 2 * i - 2, 1, '#00C063');
		}
	}, sc);

/* ================================================================== piezas del bloque */

/** Piso de las escenas sobre el tablero (para que Vee y el robot no floten). */
const Suelo: React.FC = () => <div style={{position: 'absolute', left: 0, right: 0, top: FLOOR, height: 140, background: 'linear-gradient(rgba(0,192,99,0.12), rgba(0,192,99,0))', borderTop: '4px solid rgba(255,255,255,0.16)'}} />;

/** Tarjeta de concepto que cae en su palabra y, más tarde, vuela hacia la ficha final. */
const TarjetaVuela: React.FC<{i: number; at: number; fly: number; x: number; y: number; tx: number; ty: number; icon: React.ReactNode; label: string; gloss: string}> = ({i, at: tAt, fly, x, y, tx, ty, icon, label, gloss}) => {
	const f = useCurrentFrame();
	const f0 = fly + i;
	if (f < tAt - 1 || f >= f0 + 17) return null;
	const p = pop(f, tAt, 12, 230, 0.7);
	const [sx, sy] = shake(f, tAt + 3, 12, 8);
	const q = tween(f, f0, f0 + 13, 0, 1, inCubic);
	const flash = f >= tAt + 2 ? Math.max(0, 1 - (f - tAt - 2) / 4) : 0;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: 364, transform: `translate(${(tx - x - 182) * q + sx}px, ${(ty - y - 154) * q + sy + (1 - p) * -380}px) scale(${1 - 0.7 * q}) rotate(${q * (i % 2 ? 9 : -9)}deg)`, opacity: Math.min(1, p * 2) * (1 - tween(f, f0 + 11, f0 + 16))}}>
			<ConceptCard icon={icon} label={label} size={1.4} />
			{flash > 0 && <div style={{position: 'absolute', left: 0, top: 0, width: 364, height: 308, background: '#FFFFFF', opacity: flash * 0.6}} />}
			<div style={{marginTop: 16, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.dim, opacity: 1 - tween(f, fly - 4, fly + 2)}}>{gloss}</div>
		</div>
	);
};

const Ficha: React.FC<{label: string; icon: React.ReactNode}> = ({label, icon}) => (
	<div style={{width: 380, height: 260, boxSizing: 'border-box', background: 'rgba(14,17,15,0.96)', border: `5px solid ${C.green}`, boxShadow: `0 0 40px ${C.green}44`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
		<div style={{height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
		<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 48, color: C.white}}>{label}</div>
	</div>
);

/* ------------------------------------------------------------------ caja de comentarios */

type Linea = {t: string; at: number; cps: number};
const LINEAS_COM: Linea[] = [
	{t: 'INICIO', at: n02El, cps: 30},
	{t: '1. Tomar dos rebanadas de pan', at: n02Alg, cps: 36},
	{t: '2. …', at: n02Prep + 6, cps: 10},
];

const CAJA = {x: 640, y: 110, w: 1100, h: 420};

const CajaComentarios: React.FC = () => {
	const f = useCurrentFrame();
	const n = LINEAS_COM.map((l) => typed(f, l.at, l.cps, l.t.length));
	const activa = n.reduce((a, v, i) => (v > 0 ? i : a), -1);
	const cur = Math.floor(f / 8) % 2 === 0;
	const listo = f >= n02Prep + 14;
	return (
		<div style={{position: 'relative', width: CAJA.w, height: CAJA.h, boxSizing: 'border-box', background: 'rgba(14,17,15,0.97)', border: `4px solid ${C.green}`, boxShadow: `0 0 50px ${C.green}44, 0 24px 50px rgba(0,0,0,0.6)`, padding: '24px 36px', fontFamily: MONO}}>
			<div style={{fontSize: 34, color: C.dim, fontWeight: 800, marginBottom: 18}}>Comentarios</div>
			<div style={{display: 'flex', gap: 28}}>
				<div style={{width: 84, height: 84, flexShrink: 0, background: C.green, color: C.bg, fontWeight: 800, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>TÚ</div>
				<div style={{flex: 1, borderBottom: `3px solid ${C.green}`, paddingBottom: 10, height: 190, fontSize: 40, color: C.white, fontWeight: 700}}>
					{activa < 0 && <div style={{color: C.faint, lineHeight: '56px'}}>Agrega un comentario…<span style={{color: C.green, opacity: cur ? 1 : 0}}>▌</span></div>}
					{activa >= 0 &&
						LINEAS_COM.map((l, i) => (
							<div key={i} style={{height: 56, lineHeight: '56px', whiteSpace: 'nowrap', color: i === 0 ? C.green : C.white}}>
								{l.t.slice(0, n[i])}
								{i === activa && <span style={{color: C.green, opacity: cur ? 1 : 0}}>▌</span>}
							</div>
						))}
				</div>
			</div>
			<div style={{position: 'absolute', right: 36, bottom: 24, display: 'flex', gap: 22, fontSize: 34, fontWeight: 800}}>
				<div style={{padding: '8px 24px', color: C.dim}}>CANCELAR</div>
				<div style={{padding: '8px 24px', background: listo ? C.green : 'rgba(255,255,255,0.12)', color: listo ? C.bg : C.faint}}>COMENTAR</div>
			</div>
		</div>
	);
};

/** Bandeja del robot en la pantalla final: taza y pan encima. */
const Bandeja: React.FC<{sc: number}> = ({sc}) => (
	<div style={{position: 'relative', width: 26 * sc, height: 2 * sc}}>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 2 * sc, background: '#B9C3BE', boxShadow: `0 ${0.7 * sc}px 0 #7E8A84`}} />
		<div style={{position: 'absolute', left: 2 * sc, bottom: 2 * sc}}>
			<Cup fill="latte" steam scale={sc * 0.8} />
		</div>
		<div style={{position: 'absolute', right: 2 * sc, bottom: 2 * sc}}>
			<Bread scale={sc * 0.8} />
		</div>
	</div>
);

/* ================================================================== escena 1: tablero (V61 y V62) */

const EscenaTablero: React.FC = () => {
	const f = useCurrentFrame();
	// deslizador: sube con «más o menos detalle» y vuelve al punto justo en «el adecuado»
	const knob = f < v62Ese ? tween(f, v62Mas, v62Det, 0.08, 0.95, inOutCubic) : tween(f, v62Ese, v62Adec, 0.95, 0.58, inOutCubic);
	const cardX = [172, 576, 980, 1384];
	const gl = ['uno tras otro', 'en orden', 'termina', 'uno a uno'];
	const ic = [icoSecuencia(8), <span key="o" style={{fontSize: 84, whiteSpace: 'nowrap'}}>1·2·3</span>, icoFinita(9), icoPasos(9)];
	const lb = ['SECUENCIA', 'ORDENADA', 'FINITA', 'PASOS'];
	const ts = [v61Sec, v61Ord, v61Fin, v61Pas];
	const fichas: [string, React.ReactNode][] = [
		['RECETA', icoReceta(9)],
		['SUMA', <span key="s" style={{fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.white}}>2+3=<span style={{color: C.green}}>5</span></span>],
		['RUTA', icoRuta(9)],
		['MÁQUINA', icoMaquina(9)],
	];
	const knobX = 310 + knob * 1300;
	return (
		<AbsoluteFill>
			<Board />
			<Suelo />
			{/* ---- V61: repaso */}
			<Slam at={T0} out={v61Un + 2} x={960} y={300}>
				<div style={{textAlign: 'center'}}>
					<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 250, color: C.white, letterSpacing: '-0.04em', lineHeight: 1}}>REPASO</div>
					<div style={{height: 14, background: C.green, marginTop: 8}} />
				</div>
			</Slam>
			<In at={v61Un + 2} out={v62 + 2} x={600} y={560} from="right" exit="right">
				<div style={{width: 1260, height: 340, boxSizing: 'border-box', border: `6px dashed ${C.green}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 170, letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.18)'}}>ALGORITMO</div>
			</In>
			{cardX.map((x, i) => (
				<TarjetaVuela key={i} i={i} at={ts[i]} fly={v61Res - 1} x={x} y={110} tx={1230} ty={730} icon={ic[i]} label={lb[i]} gloss={gl[i]} />
			))}
			<Slam at={v61Prob} out={v62 + 2} x={1230} y={730} from={1.8} rot={-3}>
				<div style={{width: 1260, height: 340, background: C.green, boxShadow: `0 0 80px ${C.green}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 176, letterSpacing: '-0.04em', color: C.bg}}>ALGORITMO</div>
			</Slam>
			<Hit at={v61Prob} x={1230} y={730} big />
			{/* ---- V62: uso diario, detalle, ejecutor */}
			{fichas.map(([label, icon], i) => (
				<In key={label} at={v62Todos + i * 5} out={v62Para + i * 2} x={140 + i * 420} y={100} from="down" exit="up">
					<Ficha label={label} icon={icon} />
				</In>
			))}
			<Tag x={960} y={500} at={v62Puede} out={v62Mas} size={64}>¿CUÁNTO DETALLE?</Tag>
			<In at={v62Mas} out={v62Para} x={0} y={0} from="down" exit="up" impact={false}>
				<DetailSlider x={310} y={440} w={1300} knob={knob} />
			</In>
			<Tag x={knobX} y={640} at={v62Adec} out={v62Para} color={C.green} size={56}>EL ADECUADO</Tag>
			<Hit at={v62Adec} x={knobX} y={540} />
			<Tag x={1330} y={340} at={v62Quien} color={C.green} size={76}>QUIEN EJECUTA</Tag>
			<Robot x={1330} y={FLOOR} at={v62Quien} pose="wave" face="happy" chest=">_" />
			<Hit at={v62Quien} x={1330} y={640} />
			<SpeedLines at={v62Quien} len={9} x={1330} y={640} />
			<Vee
				x={VEE_X}
				scale={10}
				hops={[v61Sec, v61Fin, v62Adec]}
				acts={[
					[v61, 'explicar'],
					[v61Sec, 'senalar'],
					[v61Fin, 'senalar'],
					[v61Prob, 'celebrar'],
					[v62Todos, 'senalar'],
					[v62Puede, 'explicar'],
					[v62Quien, 'senalar'],
				]}
			/>
			{/* transiciones */}
			<WipeBar at={v62 - 6} />
			<CutFlash at={v62 - 3} len={3} max={0.5} />
		</AbsoluteFill>
	);
};

/* ================================================================== escena 2: cocina (V63 → V64) */

const SHOTS: Shot[] = [
	[tK, 1.0, 960, 540],
	[v63Rec - 6, 1.5, 640, 650, 36], // la cámara entra hacia Vee
	[v63Ens, 1.9, 540, 680],
	[v63Comp - 2, 1.0, 960, 540],
	[v63Res, 1.8, 1265, 640],
	[v63Prim, 1.5, 640, 650],
	[n02 - 2, 1.0, 960, 540],
	[n02Toca - 2, 1.4, 600, 640],
	[n02Com - 2, 1.0, 960, 540],
	[n02Sand - 2, 1.15, 1000, 640],
	[n03 - 2, 1.0, 960, 540],
	[n03Ojo, 1.25, 1000, 600],
	[n03Ejec, 1.15, 1100, 620, 28],
	[n03Robot - 2, 1.3, 800, 620],
	[v64 - 2, 1.0, 960, 540],
	[v64Prox, 1.25, 640, 650],
	[v64Tu, 1.4, 700, 680],
	[v64Limp, 1.5, 720, 700, 22],
];

/** x de los ingredientes sobre la mesa (6 puestos de 130 px) y su orden de caída tras «sándwich». */
const MESA_X = [1090, 1220, 1350, 1480, 1610, 1740];

const EscenaCocina: React.FC = () => {
	const f = useCurrentFrame();
	const rx = ROBOT_X;
	const drop = gag + 30; // suelta los panes
	const lowK = tween(f, gag + 16, drop, 0, 1, inOutCubic);
	const sosteniendo = f >= n03Robot && f < drop;
	// pose y cara del robot según el momento
	let pose: 'idle' | 'squat' | 'wave' | 'hold' | 'hide' = 'idle';
	if (f >= gag + 16 && f < v64Vemos - 2) pose = 'squat';
	else if (f >= v64Vemos - 2 && f < v64Tu) pose = 'wave';
	else if (f >= v64Tu && f < v64Tu + 9) pose = 'hold';
	else if (f >= v64Tu + 9) pose = 'hide';
	const face: RobotFace = f >= v64Tu + 9 ? 'nerv' : f >= v64Tu ? 'wow' : f >= gag + 16 && f < v64Vemos - 2 ? 'sad' : f >= v64Vemos - 2 ? 'happy' : 'conf';
	const mira: [number, number] = f >= v64Tu ? [1, 0] : f >= gag + 10 && f < v64Vemos - 2 ? [0, 1] : f >= v64Vemos - 2 ? [0, 0] : f >= n03Robot + 20 && f < gag ? [Math.sin(f / 9) > 0.2 ? 1 : Math.sin(f / 9) < -0.2 ? -1 : 0, 0] : [0, 0];
	const chest = f >= v64Tu + 9 ? '^_^;' : f >= gag + 6 && f < v64Vemos - 2 ? '?' : f >= v64Vemos - 2 ? '^_^' : '...';
	const enMano = sosteniendo;
	const reachF = f >= n03Robot && f < drop ? lerpPt([rx + 170, FLOOR - 215], [rx + 175, FLOOR - 175], lowK) : null;
	const reachB = f >= n03Robot && f < drop ? lerpPt([rx - 170, FLOOR - 215], [rx - 175, FLOOR - 175], lowK) : null;
	const mopP = pop(f, v64Tu, 9, 300, 0.5);
	const mopRot = 24 + 4 * Math.sin(f / 3);
	return (
		<AbsoluteFill>
			<Cam shots={SHOTS} shakeAt={[n02Toca, n02Sand, v64Tu, gag + 32, v64Alg]} shakeAmp={14}>
				<Kitchen warm={1} stove={false} />
				{/* ---- V63: computadora pequeña sobre la mesa */}
				<Put x={SLOT[1]} y={TABLE_Y} at={v63Comp} out={v63Prim}>
					<PcSprite sc={11} text={f >= v63Prob ? '?' : '>_'} color={f >= v63Prob ? C.amber : C.green} at={f >= v63Prob ? v63Prob : v63Comp} />
				</Put>
				{/* ---- N02: ingredientes sobre la mesa */}
				<Put x={MESA_X[0]} y={TABLE_Y} at={n02Sand} out={n03Robot} z={1}><Bread scale={12} /></Put>
				<Put x={MESA_X[5]} y={TABLE_Y} at={n02Sand + 3} out={n03Robot}><Bread scale={12} /></Put>
				<Put x={MESA_X[1]} y={TABLE_Y} at={n02Sand + 7}><Jamon sc={12} /></Put>
				<Put x={MESA_X[2]} y={TABLE_Y} at={n02Sand + 11}><Queso sc={12} /></Put>
				<Put x={MESA_X[3]} y={TABLE_Y} at={n02Sand + 15}><Lechuga sc={12} /></Put>
				<Put x={MESA_X[4]} y={TABLE_Y} at={n02Sand + 19}><Tomate sc={12} /></Put>
				{/* ---- V63: el robot escucha junto a la mesa (no deja media cocina vacía) */}
				<Robot x={rx} y={FLOOR} at={tK} out={n02Sand} pose={f >= v63Resv + 8 ? 'thumb' : 'idle'} face={f >= v63Prob && f < v63Prim ? 'conf' : 'happy'} look={[-1, 0]} chest={f >= v63Resv + 8 ? '✓' : f >= v63Prob && f < v63Prim ? '?' : undefined} hops={[v63Resv + 8]} />
				{/* ---- N03/V64: robot */}
				<Robot
					x={rx}
					y={FLOOR}
					at={n03Robot}
					pose={pose}
					face={face}
					chest={chest}
					look={mira}
					reachF={reachF}
					reachB={reachB}
					holdF={enMano ? <Bread scale={11} /> : f >= v64Tu && f < v64Tu + 9 ? <div style={{transform: `scale(${0.4 + 0.6 * mopP})`}}><Mop scale={11} /></div> : null}
					holdB={enMano ? <Bread scale={11} /> : f >= v64Tu + 9 ? <Mop scale={11} rot={mopRot} /> : null}
				/>
				<Put x={rx + 175} y={FLOOR} at={drop} rot={8}><Bread scale={11} /></Put>
				<Put x={rx - 175} y={FLOOR} at={drop} rot={-6}><Bread scale={11} /></Put>
				<PixelBurst f={f} at={drop} x={rx + 175} y={FLOOR} count={10} power={9} seed={7} colors={['#F6E3B4', '#E8B56B']} spread={140} />
				<PixelBurst f={f} at={drop} x={rx - 175} y={FLOOR} count={10} power={9} seed={11} colors={['#F6E3B4', '#E8B56B']} spread={140} />
				<RobotSays x={rx} y={475} at={n03Robot + 8} out={gag + 3} size={36}>ESPERANDO INSTRUCCIONES…</RobotSays>
				<RobotSays x={rx} y={475} at={gag + 3} out={v64 - 2} size={36} color={C.amber}>¿DÓNDE PONGO EL PAN?</RobotSays>
				<Tag x={rx + 10} y={420} at={v64Tu + 4} out={v64Ni + 6} size={60}>¿YO?</Tag>
				<Tag x={rx + 175} y={FLOOR - 170} at={v64Piso} color={C.red} size={40} rot={-4}>¡PAN AL PISO!</Tag>
				{/* Vee */}
				<Vee
					x={VEE_X}
					hops={[v63Rec, v63Deb, n02Esc, n03Nada, v64Vemos]}
					acts={[
						[v63Rec, 'explicar'],
						[v63Ens, 'senalar'],
						[v63Prob, 'pensar'],
						[v63Prim, 'explicar'],
						[v63Desc, 'senalar'],
						[v63Resv + 8, 'celebrar'],
						[n02, 'celebrar'],
						[n02Toca, 'senalar'],
						[n02Esc, 'explicar'],
						[n02Sand, 'celebrar'],
						[n03Ojo, 'explicar'],
						[n03Robot, 'senalar'],
						[n03No, 'explicar'],
						[gag + 26, 'sorpresa'],
						[v64, 'saludar'],
						[v64Tu, 'senalar'],
						[v64Ni, 'explicar'],
						[v64Alg, 'celebrar'],
					]}
				/>
			</Cam>

			{/* ---- V63: etiqueta y lista (en pantalla, fuera de la cámara) */}
			<Tag x={1150} y={300} at={v63Rec} out={v63Ens} color={C.green} size={96}>¡RECUERDA!</Tag>
			<Hit at={v63Comp} x={960} y={520} />
			<Shockwave at={v63Prob} x={960} y={468} size={900} color={C.amber} dur={26} />
			<InstrCard
				x={50}
				y={90}
				w={680}
				title="pasos.txt"
				at={v63Deb}
				out={tN2 + 6}
				lines={[{text: '1. Entender el problema'}, {text: '2. Pensar los pasos'}, {text: '3. Escribirlos en orden'}]}
				shownAt={[v63Deb + 6, v63Deb + 14, v63Deb + 22]}
				cursor={[[v63Desc, 0], [v63Como, 1], [v63Resv, 2], [v63Resv + 10, -1]]}
				allDone={f >= v63Resv + 10}
			/>
			<Slam at={v63Resv + 14} out={tN2 + 2} x={1250} y={330} from={2.2} rot={-3}>
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 78, color: C.bg, background: C.green, padding: '16px 34px', boxShadow: `0 0 60px ${C.green}77`, whiteSpace: 'nowrap'}}>PRIMERO: DESCRIBIR</div>
			</Slam>
			<Hit at={v63Resv + 14} x={1250} y={330} />

			{/* ---- N02: ¡TU TURNO! y comentarios */}
			<Slam at={n02Toca} out={n02Com - 4} x={960} y={300} from={3} rot={-5}>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 230, background: C.green, padding: '0 60px', letterSpacing: '-0.04em', whiteSpace: 'nowrap', lineHeight: 1.1, boxShadow: `0 0 80px ${C.green}88`}}>
					<span style={{color: C.bg}}>¡TU TURNO!</span>
				</div>
			</Slam>
			<Hit at={n02Toca + 3} x={960} y={300} big />
			<SpeedLines at={n02Toca} len={10} x={960} y={300} />
				<Hit at={at('N02', 'ti')} x={1500} y={300} />
				<Shockwave at={n02Esc} x={960} y={300} size={1100} dur={24} />
			<In at={n02Com} out={tN3 + 4} x={CAJA.x} y={CAJA.y} w={CAJA.w} from="right" exit="up">
				<CajaComentarios />
			</In>
			<In at={n02Com + 4} out={tN3 + 4} x={1727} y={760 - 0} from="down" exit="down" impact={false}>
				<div style={{transform: `translateY(${-Math.abs(Math.sin((f - n02Com) / 5)) * 44}px)`}}>
					<FlechaAbajo sc={14} />
				</div>
			</In>

			{/* ---- N03: ¡OJO! y la tarjeta que se ejecuta */}
			<Slam at={n03Ojo} out={n03Va} x={960} y={300} from={3} rot={4}>
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 200, color: C.bg, background: C.amber, padding: '0 56px', whiteSpace: 'nowrap', boxShadow: `0 0 70px ${C.amber}77`}}>¡OJO!</div>
			</Slam>
			<Hit at={n03Ojo + 3} x={960} y={300} />
			<InstrCard
				x={50}
				y={90}
				w={640}
				size={28}
				title="sandwich.txt"
				at={n03Va}
				out={tV64 + 4}
				lines={[{text: 'INICIO'}, {text: '1. Tomar dos rebanadas de pan'}, {text: '2. …'}]}
				cursor={[[n03Ejec, 0], [n03Robot, 1], [gag + 4, 2]]}
			/>
			<Tag x={1230} y={135} at={n03No} out={n03Nada + 16} color={C.red} size={84}>NO SUPONGAS</Tag>
			<Hit at={n03No} x={1230} y={135} />
			<SpeedLines at={gag + 30} len={9} x={400} y={560} />
			<Hit at={v64Alg} x={700} y={200} />
			<Stamp x={700} y={200} at={v64Alg} text="¡ALGORITMO!" size={84} />

			{/* ---- transiciones de impacto */}
			<WipeBar at={tN2} />
			<CutFlash at={tN2 + 3} len={4} />
			<GlitchBurst at={tN2 + 1} len={5} />
			<WipeBar at={tN3} dur={10} />
			<CutFlash at={tN3 + 3} len={3} max={0.5} />
			<WipeBar at={tV64} dur={10} />
			<CutFlash at={tV64 + 3} len={4} />
		</AbsoluteFill>
	);
};

/* ================================================================== escena 3: pantalla final */

const PantallaFinal: React.FC = () => {
	const f = useCurrentFrame();
	const l1 = tF + 10;
	const l2 = tF + 40;
	const hit = tF + 70;
	const ficha = tF + 76;
	const logo = tF + 94;
	const prox = tF + 110;
	const w0 = tF + 18;
	const w1 = T1 - 6;
	const rxw = -260 + tween(f, w0, w1, 0, 1, (t) => t) * 2500;
	const ss = 6;
	const ry = 1072;
	const fade = tween(f, T1 - 15, T1);
	const walk = f >= w0 && f <= w1;
	return (
		<AbsoluteFill>
			<Board />
			<TypeLine text="PRIMERO PENSAMOS LA SOLUCIÓN." at={l1} x={960} y={130} size={88} cps={34} />
			<TypeLine text="DESPUÉS CONSTRUIMOS EL ALGORITMO." at={l2} x={960} y={245} size={88} cps={36} color={C.green} />
			<Hit at={hit} x={960} y={245} big />
			<In at={ficha} x={210} y={335} w={1500} from="down" exit="down">
				<div style={{height: 230, boxSizing: 'border-box', background: 'rgba(14,17,15,0.97)', border: `5px solid ${C.green}`, boxShadow: `0 0 50px ${C.green}44`, display: 'flex', alignItems: 'center', gap: 40, padding: '0 44px'}}>
					<div style={{transform: 'rotate(-6deg)'}}><Bread scale={16} /></div>
					<div>
						<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.green, lineHeight: 1.1}}>RETO</div>
						<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.white, marginTop: 10, whiteSpace: 'nowrap'}}>tu algoritmo del sándwich, en los comentarios ↓</div>
					</div>
				</div>
			</In>
			<div style={{position: 'absolute', left: 0, right: 0, top: 585, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 36, opacity: f >= logo ? 1 : 0}}>
				<LogoMark height={135} p={tween(f, logo, logo + 22)} glow={f >= logo + 22 ? 14 : 0} />
				<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 72, color: C.white, letterSpacing: '0.04em', transform: `translateX(${(1 - tween(f, logo + 6, logo + 20)) * 80}px)`, opacity: tween(f, logo + 6, logo + 16)}}>GOSLINT · UCEVA</div>
			</div>
			<Shockwave at={logo + 20} x={960} y={650} size={900} dur={26} />
			<Tag x={960} y={790} at={prox} color={C.green} size={52}>Próxima lección: Pseudocódigo</Tag>
			{walk && (
				<Robot
					x={rxw}
					y={ry}
					scale={ss}
					pose="walk"
					face="happy"
					chest="^_^"
					time={f * 1.8}
					reachF={[rxw + 16 * ss, ry - 17 * ss]}
					reachB={[rxw + 9 * ss, ry - 17 * ss]}
					holdF={<Bandeja sc={ss} />}
				/>
			)}
			<CutFlash at={tF + 1} len={4} />
			<GlitchBurst at={tF + 2} len={4} />
			<AbsoluteFill style={{background: '#000', opacity: fade, pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};

/* ================================================================== bloque */

export const B7: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			{f < tK && <EscenaTablero />}
			{f >= tK && f < tF && <EscenaCocina />}
			{f >= tF && <PantallaFinal />}
			<Barrido at={tK} />
			<Barrido at={tF} colors={[C.green, '#0B0F0D', C.white]} dir={-1} />
		</AbsoluteFill>
	);
};

/* ================================================================== sonido */

export const sfxB7: Sfx[] = [
	// V61: repaso
	s(v61 - 2, 'hit', 0.35),
	s(v61Un + 2, 'whoosh', 0.25),
	s(v61Alg, 'pop', 0.3),
	s(v61Sec, 'land', 0.35),
	s(v61Ord, 'land', 0.35),
	s(v61Fin, 'land', 0.35),
	s(v61Pas, 'land', 0.35),
	s(v61Res - 1, 'whoosh', 0.3),
	s(v61Prob, 'hit', 0.45),
	s(v61Prob + 4, 'sparkle', 0.3),
	// V62: uso diario, detalle, ejecutor
	s(v62 - 6, 'whoosh', 0.3),
	s(v62Todos, 'pop', 0.3),
	s(v62Todos + 5, 'pop', 0.3),
	s(v62Todos + 10, 'pop', 0.3),
	s(v62Todos + 15, 'pop', 0.3),
	s(v62Puede, 'blip', 0.25),
	s(v62Mas, 'slide', 0.3),
	s(v62Det, 'ticks', 0.2),
	s(v62Adec, 'ac', 0.35),
	s(v62Para, 'whoosh', 0.25),
	s(v62Quien, 'hit', 0.35),
	s(v62Quien + 3, 'servo', 0.25),
	// V63: primero describir
	s(tK - 8, 'whoosh', 0.35),
	s(v63Rec, 'pop', 0.3),
	s(v63Ens, 'whoosh', 0.2),
	s(v63Comp, 'land', 0.35),
	s(v63Comp + 4, 'blip', 0.25),
	s(v63Prob, 'blip', 0.3),
	s(v63Deb, 'enter', 0.3),
	s(v63Deb + 6, 'typing', 0.2),
	s(v63Desc, 'check', 0.3),
	s(v63Como, 'check', 0.3),
	s(v63Resv, 'check', 0.3),
	s(v63Resv + 14, 'hit', 0.4),
	s(v63Resv + 18, 'ac', 0.3),
	// N02: tu turno
	s(tN2, 'whoosh', 0.35),
	s(tN2 + 3, 'flash', 0.3),
	s(n02Toca, 'hit', 0.45),
	s(n02Esc, 'rise', 0.2),
	s(n02Com, 'pop', 0.3),
	s(n02El, 'typing', 0.22),
	s(n02Alg, 'key', 0.2),
	s(n02Prep + 6, 'key', 0.2),
	s(n02Com + 4, 'boing', 0.25),
	s(n02Sand, 'land', 0.35),
	s(n02Sand + 3, 'land', 0.3),
	s(n02Sand + 7, 'plop', 0.3),
	s(n02Sand + 11, 'plop', 0.3),
	s(n02Sand + 15, 'plop', 0.3),
	s(n02Sand + 19, 'plop', 0.3),
	// N03: el robot espera
	s(tN3, 'whoosh', 0.3),
	s(n03Ojo, 'hit', 0.4),
	s(n03Va, 'enter', 0.25),
	s(n03Ejec, 'ticks', 0.25),
	s(n03Robot, 'servo', 0.3),
	s(n03Robot + 4, 'blip', 0.3),
	s(n03No, 'no', 0.3),
	s(gag + 3, 'blip', 0.3),
	s(gag + 16, 'wobble', 0.25),
	s(gag + 30, 'land', 0.4),
	s(gag + 26, 'boing', 0.3),
	// V64: despedida
	s(tV64, 'whoosh', 0.3),
	s(v64Vemos, 'servo', 0.2),
	s(v64Prox, 'sparkle', 0.2),
	s(v64Tu, 'pop', 0.3),
	s(v64Tu + 4, 'pop', 0.3),
	s(v64Ni, 'wobble', 0.2),
	s(v64Piso, 'no', 0.25),
	s(v64Alg, 'hit', 0.4),
	s(v64Alg + 4, 'fanfare', 0.25),
	// pantalla final
	s(tF - 4, 'whoosh', 0.4),
	s(tF + 2, 'glitch', 0.25),
	s(tF + 10, 'typing', 0.22),
	s(tF + 40, 'typing', 0.22),
	s(tF + 70, 'hit', 0.4),
	s(tF + 72, 'fanfare', 0.3),
	s(tF + 76, 'land', 0.35),
	s(tF + 94, 'sparkle', 0.3),
	s(tF + 110, 'pop', 0.3),
];
