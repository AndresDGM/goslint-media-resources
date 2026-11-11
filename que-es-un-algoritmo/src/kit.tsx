import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inOutCubic, pop, tween} from '@commons/lib';
import {Buf, PixelSprite} from '@commons/pixel';
import {Mascota} from '@commons/mascotas';
import CLIPS_JSON from '@commons/mascotas-clips.json';
import {BLOCKS, CHAPTERS, CUES, DURATION, speaking, talkLevel} from './timeline';

export {Robot, robotRest, robotShoulder, lerpPt} from '@commons/robot';
export type {RobotPose, RobotFace} from '@commons/robot';

/**
 * Piezas propias del video «¿Qué es un algoritmo?». Todos los tiempos son fotogramas ABSOLUTOS
 * (se obtienen con `at('V12', 'taza')` de ../timeline). Coordenadas en el lienzo de 1920×1080.
 *
 * Escenario de la cocina (personajes a escala PX = 11: Vee mide ≈ 400 px y el robot ≈ 420 px):
 *   FLOOR      línea del piso (pies de los personajes)
 *   TABLE_Y    superficie de la mesa; la mesa va de TABLE_X0 a TABLE_X1
 *   SLOT[0..3] centros x de los cuatro puestos de la mesa; STOVE_X centro de la hornilla (su
 *              superficie está en STOVE_Y)
 *   SHELF_Y    superficie de la repisa (de SHELF_X0 a SHELF_X1)
 *   VEE_X, ROBOT_X  posiciones habituales de Vee (izquierda) y del robot (junto a la mesa)
 * Zonas reservadas: el HUD ocupa y < 70 y los subtítulos y > 965 (centro). Deja libres esas franjas.
 */
export const PX = 11;
export const FLOOR = 940;
export const TABLE_Y = 700;
export const TABLE_X0 = 1010;
export const TABLE_X1 = 1880;
export const SLOT = [1110, 1265, 1420, 1575];
export const STOVE_X = 1745;
export const STOVE_Y = TABLE_Y - 22;
export const SHELF_Y = 372;
export const SHELF_X0 = 1380;
export const SHELF_X1 = 1860;
export const VEE_X = 270;
export const ROBOT_X = 880;

/* ================================================================== Vee */

/** Acciones de Vee (clips del kit de mascotas). `especial` = dibuja un diagrama con una decisión. */
export type VeeAct = 'saludar' | 'senalar' | 'pensar' | 'celebrar' | 'sorpresa' | 'explicar' | 'especial' | 'hablar';
const CLIPS = (CLIPS_JSON as unknown as Record<string, Record<string, {ms: number[]}>>).vee;
const clipFrames = (name: string) => Math.ceil((CLIPS[name].ms.reduce((a, b) => a + b, 0) / 1000) * 30);

/**
 * Vee, con la boca sincronizada a la locución real.
 *   x      posición fija, o claves [[fotograma, x], …]: entre claves se desplaza dando saltitos.
 *   acts   gestos [[fotograma, acción, velocidad?], …]: cada uno dura lo que su clip (÷ velocidad;
 *          por defecto 1.5) y luego vuelve a hablar o al reposo. Lanza un gesto en las palabras
 *          clave (señalar lo que nombra, sorpresa en el gag…): que no pase 4 s sin gesto mientras habla.
 *   hops   fotogramas en los que da un saltito en el sitio.
 *   entra / sale  llega caminando justo en `at` / se va caminando desde `out`.
 */
export const Vee: React.FC<{
	x: number | [number, number][];
	y?: number;
	scale?: number;
	acts?: [number, VeeAct, number?][];
	hops?: number[];
	at?: number;
	out?: number;
	flip?: boolean;
	entra?: boolean;
	sale?: boolean;
	opacity?: number;
}> = ({x, y = FLOOR, scale = PX, acts = [], hops = [], at, out, flip, entra, sale, opacity}) => {
	const f = useCurrentFrame();
	let px: number;
	let jump = 0;
	if (typeof x === 'number') px = x;
	else {
		px = x[0][1];
		for (let i = 0; i < x.length - 1; i++) {
			const [a, xa] = x[i];
			const [b, xb] = x[i + 1];
			if (f >= a) {
				const k = Math.min(1, (f - a) / Math.max(1, b - a));
				px = xa + (xb - xa) * k;
				if (k > 0 && k < 1 && xa !== xb) jump = Math.abs(Math.sin(k * Math.PI * Math.max(1, Math.round(Math.abs(xb - xa) / 110)))) * 2.2 * scale;
			}
		}
	}
	for (const h of hops) {
		const k = (f - h) / 11;
		if (k > 0 && k < 1) jump += Math.sin(k * Math.PI) * 4 * scale;
	}
	let act: VeeAct | undefined;
	let actAt = 0;
	let speed = 1.5;
	for (const [a, name, sp] of acts) {
		const s = sp ?? 1.5;
		if (f >= a && f < a + clipFrames(name) / s) {
			act = name;
			actAt = a;
			speed = s;
		}
	}
	const talk = talkLevel(f);
	const bob = act ? 0 : talk >= 2 ? scale * 0.35 : 0; // cabecea con las sílabas fuertes
	return (
		<Mascota
			id="vee"
			x={Math.round(px)}
			y={Math.round(y - jump - bob)}
			scale={scale}
			at={at}
			out={out}
			flip={flip}
			entra={entra}
			sale={sale}
			opacity={opacity}
			clip={act}
			// Mascota reproduce el clip a velocidad normal desde clipAt: se adelanta el origen para acelerarlo
			clipAt={act ? f - (f - actAt) * speed : undefined}
			speaking={!act && speaking(f)}
			talk={act ? 0 : talk}
		/>
	);
};

/* ================================================================== colocación */

/**
 * Coloca a su hijo con la BASE centrada en (x, y): `<Put x={SLOT[0]} y={TABLE_Y}><Cup /></Put>`.
 * `at`: aparece cayendo con rebote; `out`: desaparece; `rot`: giro en grados; `z`: escala extra.
 */
export const Put: React.FC<{x: number; y: number; at?: number; out?: number; rot?: number; z?: number; opacity?: number; children: React.ReactNode}> = ({x, y, at, out, rot = 0, z = 1, opacity = 1, children}) => {
	const f = useCurrentFrame();
	if (at !== undefined && f < at) return null;
	if (out !== undefined && f >= out) return null;
	const p = at !== undefined ? pop(f, at, 10, 260, 0.6) : 1;
	const o = out !== undefined ? 1 - tween(f, out - 5, out) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) translateY(${(1 - p) * -120}px) rotate(${rot}deg) scale(${z * (0.6 + 0.4 * p)})`, transformOrigin: '50% 100%', opacity: opacity * o * Math.min(1, p * 2)}}>{children}</div>
	);
};

/* ================================================================== objetos (pixel art) */

const OBJ = {
	cer: '#F4F7F5', cerD: '#B4C0B8', coffee: '#4A2A18', coffeeL: '#6B3D22', latte: '#B07A4F', latteL: '#C9956A', black: '#2A160C',
	bag: '#8A5434', bagD: '#5B3521', label: '#F2C230', milk: '#F4F7F5', milkD: '#C9D6DE', milkCap: '#3E73D8',
	sugar: '#FFFFFF', bowl: '#3E73D8', bowlD: '#2B4F96', steel: '#B9C3BE', steelD: '#7E8A84', kettle: '#E2463E', kettleD: '#A8302A',
	water: '#5AA9FF', waterL: '#A9D3FF', wood: '#6B4A33', glass: '#9FD6F5', bread: '#E8B56B', breadD: '#B9803E', crumb: '#F6E3B4',
};
/** Colores de los líquidos y polvos, para `Pour` y `Falling`. */
export const LIQ = {water: OBJ.water, milk: OBJ.milk, coffee: OBJ.coffee, latte: OBJ.latte, sugar: OBJ.sugar};

const sprite = (w: number, h: number, draw: (b: Buf) => void, scale = PX) => {
	const b = new Buf(w, h);
	draw(b);
	return <PixelSprite buf={b} scale={scale} />;
};

/** Vapor que sube desde el punto (0, 0) del contenedor. */
export const Steam: React.FC<{scale?: number; n?: number; w?: number}> = ({scale = PX, n = 3, w = 8}) => {
	const f = useCurrentFrame();
	return (
		<>
			{Array.from({length: n}, (_, i) => {
				const k = ((f + i * 13) % 40) / 40;
				return <div key={i} style={{position: 'absolute', left: (1 + (i * w) / n) * scale, top: -k * 9 * scale - scale, width: scale, height: scale * 2, background: '#FFFFFF', opacity: 0.55 * (1 - k), transform: `translateX(${Math.sin(k * 6 + i) * scale}px)`}} />;
			})}
		</>
	);
};

/** Contenido de la taza: vacía, café en polvo, café negro o café con leche. */
export type CupFill = 'empty' | 'grounds' | 'black' | 'latte';
/** Taza (13×10 px lógicos). `level` 0–1 = cuánto líquido tiene (para animar un vertido). */
export const Cup: React.FC<{fill?: CupFill; level?: number; steam?: boolean; scale?: number}> = ({fill = 'empty', level = 1, steam, scale = PX}) => (
	<div style={{position: 'relative'}}>
		{sprite(13, 10, (b) => {
			b.rect(0, 0, 10, 10, OBJ.cer);
			b.rect(8, 0, 2, 10, OBJ.cerD);
			b.rect(10, 2, 3, 1, OBJ.cer); b.rect(12, 2, 1, 5, OBJ.cer); b.rect(10, 6, 3, 1, OBJ.cer);
			b.rect(1, 0, 8, 1, '#DDE5E0');
			const top = fill === 'grounds' ? 7 : Math.max(1, Math.round(8 - 7 * level));
			if (fill !== 'empty') b.rect(1, top, 8, 9 - top, fill === 'grounds' ? OBJ.coffee : fill === 'latte' ? OBJ.latte : OBJ.black);
			if (fill === 'latte') b.rect(2, top, 5, 1, OBJ.latteL);
			if (fill === 'black') b.rect(2, top, 3, 1, OBJ.coffeeL);
			b.rect(0, 9, 10, 1, OBJ.cerD);
		}, scale)}
		{steam && <Steam scale={scale} />}
	</div>
);

/** Bolsa de café (10×13). `tip`: grados de inclinación al verter. */
export const CoffeeBag: React.FC<{scale?: number; tip?: number}> = ({scale = PX, tip = 0}) => (
	<div style={{transform: `rotate(${tip}deg)`, transformOrigin: '50% 20%'}}>
		{sprite(10, 13, (b) => {
			b.rect(1, 1, 8, 12, OBJ.bag); b.rect(7, 1, 2, 12, OBJ.bagD); b.rect(0, 0, 10, 2, OBJ.bagD);
			b.rect(2, 5, 5, 4, OBJ.label); b.rect(3, 6, 1, 2, OBJ.coffee); b.rect(5, 6, 1, 2, OBJ.coffee);
		}, scale)}
	</div>
);

/** Frasco de café con tapa (9×10). */
export const CoffeeJar: React.FC<{scale?: number}> = ({scale = PX}) =>
	sprite(9, 10, (b) => {
		b.rect(1, 0, 7, 2, OBJ.wood); b.rect(0, 2, 9, 8, OBJ.glass); b.rect(1, 3, 7, 6, OBJ.coffee); b.rect(1, 3, 2, 6, OBJ.coffeeL); b.rect(3, 5, 3, 2, OBJ.label);
	}, scale);

/** Jarra de leche (10×12). `tip`: grados de inclinación al verter. */
export const MilkJug: React.FC<{scale?: number; tip?: number}> = ({scale = PX, tip = 0}) => (
	<div style={{transform: `rotate(${tip}deg)`, transformOrigin: '50% 30%'}}>
		{sprite(10, 12, (b) => {
			b.rect(1, 2, 7, 10, OBJ.milk); b.rect(6, 2, 2, 10, OBJ.milkD); b.rect(2, 0, 5, 2, OBJ.milkCap); b.rect(8, 4, 2, 5, OBJ.milkD); b.rect(2, 6, 4, 3, OBJ.milkCap);
		}, scale)}
	</div>
);

/** Azucarero (10×8). */
export const SugarBowl: React.FC<{scale?: number}> = ({scale = PX}) =>
	sprite(10, 8, (b) => {
		b.rect(0, 2, 10, 6, OBJ.bowl); b.rect(8, 2, 2, 6, OBJ.bowlD); b.rect(1, 1, 8, 2, OBJ.sugar); b.rect(3, 0, 4, 1, OBJ.sugar);
	}, scale);

/** Cuchara (3×11, el cuenco arriba). `load`: lleva café o azúcar. `rot`: giro en grados alrededor del mango. */
export const Spoon: React.FC<{scale?: number; load?: 'coffee' | 'sugar'; rot?: number}> = ({scale = PX, load, rot = 0}) => (
	<div style={{transform: `rotate(${rot}deg)`, transformOrigin: '50% 90%'}}>
		{sprite(3, 11, (b) => {
			b.rect(1, 3, 1, 8, OBJ.steel); b.rect(0, 0, 3, 3, OBJ.steel); b.rect(2, 0, 1, 3, OBJ.steelD);
			if (load) b.rect(0, 0, 3, 1, load === 'coffee' ? OBJ.coffee : OBJ.sugar);
		}, scale)}
	</div>
);

/** Tetera (15×12). `shake` 0–1 la hace temblar, `steam` suelta vapor por el pico, `lid` 0–1 levanta la tapa, `tip` la inclina. */
export const Kettle: React.FC<{scale?: number; shake?: number; steam?: boolean; lid?: number; tip?: number}> = ({scale = PX, shake = 0, steam, lid = 0, tip = 0}) => {
	const f = useCurrentFrame();
	const dx = shake ? Math.sin(f * 2.3) * 3 * shake : 0;
	return (
		<div style={{position: 'relative', transform: `translateX(${dx}px) rotate(${tip}deg)`, transformOrigin: '30% 60%'}}>
			{sprite(15, 12, (b) => {
				b.rect(2, 3, 10, 9, OBJ.kettle); b.rect(10, 3, 2, 9, OBJ.kettleD); b.rect(12, 5, 2, 1, OBJ.kettle); b.rect(13, 4, 2, 1, OBJ.kettle);
				b.rect(0, 5, 2, 4, OBJ.kettleD); b.rect(4, 2, 6, 1, OBJ.kettleD); b.rect(3, 5, 2, 3, '#F08A84');
				b.rect(5, 1 - Math.round(lid * 2), 4, 1, OBJ.steelD); b.rect(6, 0 - Math.round(lid * 2), 2, 1, OBJ.steelD);
			}, scale)}
			{steam && [0, 1, 2].map((i) => {
				const k = ((f + i * 10) % 30) / 30;
				return <div key={i} style={{position: 'absolute', left: (14 + k * 4) * scale, top: (3 - k * 8) * scale, width: scale * 1.5, height: scale * 1.5, background: '#FFFFFF', opacity: 0.6 * (1 - k)}} />;
			})}
		</div>
	);
};

/** Jarra medidora (9×12) con nivel 0–1. `liquid`: agua o leche. `label`: rótulo a su derecha («200 ml»). */
export const MeasureJug: React.FC<{level: number; liquid?: 'water' | 'milk'; scale?: number; label?: string; tip?: number}> = ({level, liquid = 'water', scale = PX, label, tip = 0}) => (
	<div style={{position: 'relative', transform: `rotate(${tip}deg)`, transformOrigin: '50% 40%'}}>
		{sprite(9, 12, (b) => {
			b.rect(0, 0, 8, 12, 'rgba(159,214,245,0.35)'); b.rect(0, 0, 1, 12, OBJ.glass); b.rect(7, 0, 1, 12, OBJ.glass); b.rect(0, 11, 8, 1, OBJ.glass); b.rect(8, 3, 1, 5, OBJ.glass);
			const top = Math.round(11 - 10 * Math.max(0, Math.min(1, level)));
			b.rect(1, top, 6, 11 - top, liquid === 'water' ? OBJ.water : OBJ.milk);
			[3, 6, 9].forEach((y) => b.rect(5, y, 2, 1, OBJ.steelD));
		}, scale)}
		{label && <div style={{position: 'absolute', left: '112%', top: '26%', fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.white, whiteSpace: 'nowrap', textShadow: '0 2px 0 rgba(0,0,0,0.6)'}}>{label}</div>}
	</div>
);

/** Rebanada de pan (11×10). */
export const Bread: React.FC<{scale?: number}> = ({scale = PX}) =>
	sprite(11, 10, (b) => {
		b.rect(1, 1, 9, 9, OBJ.bread); b.rect(0, 0, 11, 3, OBJ.bread); b.rect(2, 3, 7, 6, OBJ.crumb); b.rect(1, 9, 9, 1, OBJ.breadD); b.rect(10, 1, 1, 2, OBJ.breadD);
	}, scale);

/** Trapeador (5×22, la mecha abajo). */
export const Mop: React.FC<{scale?: number; rot?: number}> = ({scale = PX, rot = 0}) => (
	<div style={{transform: `rotate(${rot}deg)`, transformOrigin: '50% 10%'}}>
		{sprite(7, 22, (b) => {
			b.rect(3, 0, 1, 17, OBJ.wood); b.rect(0, 17, 7, 5, OBJ.cer); b.rect(1, 18, 1, 4, OBJ.cerD); b.rect(3, 18, 1, 4, OBJ.cerD); b.rect(5, 18, 1, 4, OBJ.cerD);
		}, scale)}
	</div>
);

/** Charco en el piso o en la mesa. `size` 0–1; (x, y) = centro, a ras de la superficie. */
export const Puddle: React.FC<{size: number; x: number; y?: number; color?: string; w?: number}> = ({size, x, y = FLOOR, color = OBJ.latte, w = 520}) => {
	if (size <= 0) return null;
	const ww = w * size;
	return <div style={{position: 'absolute', left: x - ww / 2, top: y - 12 * size, width: ww, height: 40 * size, background: color, borderRadius: '50%', boxShadow: `inset 0 -8px 0 rgba(0,0,0,0.28)`}} />;
};

/** Chorro vertical de líquido de (x, y0) a y1. `on`: visible. Úsalo con LIQ.water, LIQ.milk… */
export const Pour: React.FC<{x: number; y0: number; y1: number; color?: string; w?: number; on?: boolean}> = ({x, y0, y1, color = OBJ.water, w = 16, on = true}) => {
	const f = useCurrentFrame();
	if (!on || y1 <= y0) return null;
	return <div style={{position: 'absolute', left: x - w / 2, top: y0, width: w, height: y1 - y0, background: `repeating-linear-gradient(180deg, ${color} 0 16px, ${color}CC 16px 26px)`, backgroundPositionY: f * 11}} />;
};

/** Partículas que caen de y0 a y1 (polvo de café, azúcar, gotas) entre `at` y `at + dur`. */
export const Falling: React.FC<{x: number; y0: number; y1: number; at: number; dur: number; color: string; n?: number; spread?: number; size?: number}> = ({x, y0, y1, at, dur, color, n = 14, spread = 40, size = PX}) => {
	const f = useCurrentFrame();
	if (f < at || f > at + dur + 16) return null;
	return (
		<>
			{Array.from({length: n}).map((_, i) => {
				const st = at + (i / n) * dur;
				const k = (f - st) / 12;
				if (k < 0 || k > 1) return null;
				return <div key={i} style={{position: 'absolute', left: Math.round((x + Math.sin(i * 7.3) * spread * 0.5) / size) * size, top: y0 + (y1 - y0) * k * k, width: size, height: size, background: color}} />;
			})}
		</>
	);
};

/** Salpicadura: gotas que saltan desde (x, y) en `at` (agua sobre la mesa, café en el piso). */
export const Splash: React.FC<{x: number; y: number; at: number; color?: string; n?: number; power?: number}> = ({x, y, at, color = OBJ.water, n = 14, power = 16}) => {
	const f = useCurrentFrame();
	const k = f - at;
	if (k < 0 || k > 22) return null;
	return (
		<>
			{Array.from({length: n}, (_, i) => {
				const a = Math.PI * (0.15 + 0.7 * (i / (n - 1)));
				const v = power * (0.6 + 0.5 * Math.abs(Math.sin(i * 3.7)));
				const px = x - Math.cos(a) * v * k;
				const py = y - Math.sin(a) * v * k + 0.9 * k * k;
				if (py > y + 4) return null;
				return <div key={i} style={{position: 'absolute', left: Math.round(px / PX) * PX, top: Math.round(py / PX) * PX, width: PX, height: PX, background: color}} />;
			})}
		</>
	);
};

/** Número o texto grande que salta al aparecer (contador de cucharadas, «×2»…). Centrado en (x, y). */
export const Counter: React.FC<{x: number; y: number; value: string | number; at: number; out?: number; color?: string; size?: number}> = ({x, y, value, at, out, color = C.green, size = 96}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 9, 280, 0.5);
	return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${0.3 + 0.7 * p})`, fontFamily: MONO, fontWeight: 800, fontSize: size, color, textShadow: `0 0 22px ${color}99, 0 4px 0 rgba(0,0,0,0.5)`}}>{value}</div>;
};

/* ================================================================== escenarios */

/**
 * Cocina pixelada: pared con ventana y repisa, mesa con hornilla y piso.
 *   light  0 apagada – 1 normal        warm   0–1 luz de atardecer
 *   jar    frasco de café en la repisa (por defecto sí)   stove / flame   hornilla y llama
 *   desat  0–1 desatura (para congelar la escena detrás de una explicación)
 */
export const Kitchen: React.FC<{light?: number; warm?: number; jar?: boolean; stove?: boolean; flame?: boolean; desat?: number}> = ({light = 1, warm = 0, jar = true, stove = true, flame = false, desat = 0}) => {
	const f = useCurrentFrame();
	const wall = `rgb(${Math.round(26 + 22 * warm)}, ${Math.round(36 + 4 * warm)}, ${Math.round(31 - 6 * warm)})`;
	const frame = '#33423B';
	return (
		<div style={{position: 'absolute', left: -200, top: -200, width: 2320, height: 1480, overflow: 'hidden', background: wall, filter: desat ? `saturate(${1 - 0.85 * desat}) brightness(${1 - 0.25 * desat})` : undefined}}>
			<div style={{position: 'absolute', left: 200, top: 200, width: 1920, height: 1080}}>
				{/* azulejos */}
				<div style={{position: 'absolute', left: -200, right: -200, top: 470, height: FLOOR - 470, backgroundImage: 'linear-gradient(rgba(255,255,255,0.045) 3px, transparent 3px), linear-gradient(90deg, rgba(255,255,255,0.045) 3px, transparent 3px)', backgroundSize: '66px 66px'}} />
				<div style={{position: 'absolute', left: -200, right: -200, top: 462, height: 8, background: 'rgba(255,255,255,0.06)'}} />
				{/* ventana */}
				<div style={{position: 'absolute', left: 90, top: 110, width: 420, height: 300, background: warm > 0.5 ? '#E89A4A' : '#12384E', border: `14px solid ${frame}`}}>
					<div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 12, marginLeft: -6, background: frame}} />
					<div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: 12, marginTop: -6, background: frame}} />
					<div style={{position: 'absolute', left: 40, top: 40, width: 22, height: 22, background: warm > 0.5 ? '#FFE3A8' : '#EAF2F7', opacity: 0.8}} />
				</div>
				{/* repisa */}
				<div style={{position: 'absolute', left: SHELF_X0, top: SHELF_Y, width: SHELF_X1 - SHELF_X0, height: 22, background: '#6B4A33', boxShadow: '0 12px 0 #46301F'}} />
				{jar && <Put x={SHELF_X0 + 90} y={SHELF_Y}><CoffeeJar scale={9} /></Put>}
				{/* mesa */}
				<div style={{position: 'absolute', left: TABLE_X0, top: TABLE_Y, width: TABLE_X1 - TABLE_X0, height: 30, background: '#8A6446', boxShadow: '0 10px 0 #5B4030'}} />
				<div style={{position: 'absolute', left: TABLE_X0 + 40, top: TABLE_Y + 30, width: 28, height: FLOOR - TABLE_Y - 30, background: '#5B4030'}} />
				<div style={{position: 'absolute', left: TABLE_X1 - 68, top: TABLE_Y + 30, width: 28, height: FLOOR - TABLE_Y - 30, background: '#5B4030'}} />
				{stove && (
					<div style={{position: 'absolute', left: STOVE_X - 115, top: STOVE_Y, width: 230, height: 22, background: '#39423E', boxShadow: 'inset 0 4px 0 #4D5853'}}>
						{flame && <div style={{position: 'absolute', left: 70, top: -14, width: 90, height: 16, background: Math.floor(f / 3) % 2 ? '#5AA9FF' : '#3E73D8', boxShadow: '0 0 30px #5AA9FF'}} />}
					</div>
				)}
				{/* piso */}
				<div style={{position: 'absolute', left: -200, right: -200, top: FLOOR, height: 400, background: '#2B2B27', backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.28) 4px, transparent 4px)', backgroundSize: '160px 100%'}} />
				<div style={{position: 'absolute', left: -200, right: -200, top: FLOOR, height: 8, background: '#3C3C36'}} />
			</div>
			<div style={{position: 'absolute', inset: 0, background: '#000', opacity: (1 - light) * 0.93, pointerEvents: 'none'}} />
		</div>
	);
};

/** Pizarra negra con puntos (fondo de la definición, del título y de la pantalla final). */
export const Board: React.FC<{opacity?: number}> = ({opacity = 1}) => {
	const f = useCurrentFrame();
	return <div style={{position: 'absolute', left: -200, top: -200, width: 2320, height: 1480, background: C.bg, opacity, backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 2px, transparent 2px)', backgroundSize: '44px 44px', backgroundPosition: `${(f * 0.25) % 44}px ${(f * 0.12) % 44}px`}} />;
};

/* ================================================================== cámara */

/** Plano: [fotograma, zoom, cx, cy, mov?]. Sin `mov` es un CORTE; con `mov` = fotogramas de travelling suave hasta ese encuadre. */
export type Shot = [frame: number, zoom: number, cx: number, cy: number, move?: number];
/**
 * Cámara virtual. Envuelve la escena; los rótulos que no deben moverse van fuera.
 *   shots    planos en orden. zoom 1 = plano general; (cx, cy) = punto que queda en el centro.
 *            Cada corte entra con un pequeño golpe de zoom y luego deriva despacio (nunca está quieta).
 *   shakeAt  fotogramas con sacudida (impactos).
 * El encuadre se recorta solo para no mostrar nada fuera del lienzo.
 */
export const Cam: React.FC<{shots: Shot[]; children: React.ReactNode; shakeAt?: number[]; shakeAmp?: number}> = ({shots, children, shakeAt = [], shakeAmp = 16}) => {
	const f = useCurrentFrame();
	let i = 0;
	for (let k = 0; k < shots.length; k++) if (f >= shots[k][0]) i = k;
	const [a, z1, x1, y1, mv] = shots[i];
	let z = z1;
	let cx = x1;
	let cy = y1;
	if (mv && i > 0) {
		const [, z0, x0, y0] = shots[i - 1];
		const k = tween(f, a, a + mv, 0, 1, inOutCubic);
		z = z0 + (z1 - z0) * k;
		cx = x0 + (x1 - x0) * k;
		cy = y0 + (y1 - y0) * k;
	} else if (i > 0) {
		z *= 1 + 0.06 * (1 - tween(f, a, a + 8)); // golpe de zoom en el corte
	}
	z *= 1 + 0.018 * Math.min(1, Math.max(0, f - a - (mv ?? 0)) / 150); // deriva lenta hacia dentro
	if (z >= 1) {
		cx = Math.min(1920 - 960 / z, Math.max(960 / z, cx));
		cy = Math.min(1080 - 540 / z, Math.max(540 / z, cy));
	}
	let sx = 0;
	let sy = 0;
	for (const s of shakeAt)
		if (f >= s && f < s + 10) {
			const d = 1 - (f - s) / 10;
			sx += Math.sin(f * 3.1) * shakeAmp * d;
			sy += Math.cos(f * 2.7) * shakeAmp * 0.7 * d;
		}
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${960 - cx * z + sx}px, ${540 - cy * z + sy}px) scale(${z})`, transformOrigin: '0 0'}}>{children}</div>
		</div>
	);
};

/* ================================================================== tarjeta de instrucciones */

export type Line = {text: string; indent?: number};
/**
 * Panel tipo terminal con el algoritmo.
 *   cursor   [[fotograma, línea], …]: en cada fotograma el cursor ▶ pasa a esa línea; las líneas que
 *            deja atrás quedan con ✓ (salvo las de `skip`, que quedan atenuadas). Línea -1 = sin cursor.
 *   window   n.º máximo de líneas visibles: si hay más, la lista se desplaza sola siguiendo al cursor.
 *   shownAt  fotograma en que se teclea cada línea (si no, están todas desde el principio).
 *   marks    palabras subrayadas en verde por línea: {2: ['a la taza']}.
 *   blockHl  [desde, hasta]: recuadro azul alrededor de un grupo de líneas (el bloque SI … FIN SI).
 * El tamaño de letra se reduce solo si una línea no cabe en `w`.
 */
export const InstrCard: React.FC<{
	x: number; y: number; w: number; lines: Line[]; cursor?: [number, number][]; skip?: number[]; window?: number; shownAt?: number[];
	marks?: Record<number, string[]>; size?: number; title?: string; at?: number; out?: number; accent?: string; blockHl?: [number, number] | null; allDone?: boolean;
}> = ({x, y, w, lines, cursor = [], skip = [], window: win, shownAt, marks = {}, size = 30, title = 'algoritmo.txt', at, out, accent = C.green, blockHl, allDone}) => {
	const f = useCurrentFrame();
	if (at !== undefined && f < at) return null;
	if (out !== undefined && f >= out) return null;
	const p = at !== undefined ? pop(f, at, 13, 220, 0.6) : 1;
	const o = out !== undefined ? 1 - tween(f, out - 6, out) : 1;
	const maxLen = Math.max(...lines.map((l) => l.text.length + (l.indent ?? 0) * 2));
	const fs = Math.min(size, Math.floor((w - 56 - size * 1.1) / (0.602 * maxLen)));
	const lh = Math.round(fs * 1.5);
	// estado del cursor
	let active = -1;
	let movedAt = -999;
	let prev = -1;
	const leftAt: Record<number, number> = {};
	for (const [fr, ln] of cursor) {
		if (f >= fr) {
			if (active >= 0 && ln !== active) leftAt[active] = fr;
			prev = active;
			active = ln;
			movedAt = fr;
		}
	}
	const n = win ? Math.min(win, lines.length) : lines.length;
	const scrollOf = (ln: number) => (win && lines.length > n ? Math.max(0, Math.min(lines.length - n, (ln < 0 ? 0 : ln) - Math.floor(n / 2))) : 0);
	const sc = scrollOf(prev) + (scrollOf(active) - scrollOf(prev)) * tween(f, movedAt, movedAt + 9);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, transform: `translateY(${(1 - p) * 90}px) scale(${0.9 + 0.1 * p})`, transformOrigin: '50% 0', opacity: Math.min(1, p * 2) * o, background: 'rgba(12,16,14,0.97)', border: `3px solid ${accent}`, boxShadow: `0 0 44px ${accent}33, 0 22px 44px rgba(0,0,0,0.6)`}}>
			<div style={{fontFamily: MONO, fontSize: 20, color: C.dim, padding: '8px 16px', borderBottom: `2px solid ${C.line2}`, display: 'flex', gap: 10, alignItems: 'center'}}>
				<span style={{color: '#E2463E'}}>●</span><span style={{color: '#F2C230'}}>●</span><span style={{color: C.green}}>●</span><span style={{marginLeft: 8}}>{title}</span>
			</div>
			<div style={{position: 'relative', margin: '12px 14px 14px 14px', height: n * lh, overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: -sc * lh}}>
					{blockHl && <div style={{position: 'absolute', left: 0, right: 0, top: blockHl[0] * lh, height: (blockHl[1] - blockHl[0] + 1) * lh, border: `3px solid ${C.blue}`, background: 'rgba(90,169,255,0.09)'}} />}
					{lines.map((ln, i) => {
						const s = shownAt ? shownAt[i] : -1;
						if (shownAt && f < s) return <div key={i} style={{height: lh}} />;
						const chars = shownAt ? Math.min(ln.text.length, Math.floor((f - s) * 2.4)) : ln.text.length;
						const isA = i === active;
						const isSkip = skip.includes(i);
						const isD = !isSkip && (allDone || leftAt[i] !== undefined) && !isA;
						const tick = isD && leftAt[i] !== undefined ? pop(f, leftAt[i], 9, 300, 0.5) : 1;
						let txt: React.ReactNode = ln.text.slice(0, chars);
						const mk = marks[i];
						if (mk && chars >= ln.text.length) {
							const re = new RegExp(`(${mk.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
							txt = ln.text.split(re).map((part, j) => (mk.includes(part) ? <span key={j} style={{color: C.green, borderBottom: `3px solid ${C.green}`}}>{part}</span> : <span key={j}>{part}</span>));
						}
						const kw = /^(INICIO|FIN|SI )/.test(ln.text);
						const glow = isA ? 0.14 + 0.1 * Math.max(0, 1 - (f - movedAt) / 10) : 0;
						return (
							<div key={i} style={{height: lh, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: fs, whiteSpace: 'nowrap', color: isSkip ? C.faint : isA ? C.white : isD ? C.dim : kw ? C.green : C.text, background: isA ? `rgba(0,192,99,${glow})` : 'transparent', fontWeight: isA || kw ? 800 : 500, textDecoration: isSkip && active > i ? 'line-through' : undefined}}>
								<span style={{width: fs * 1.1, color: C.green, flexShrink: 0, display: 'inline-block', transform: isD ? `scale(${tick})` : undefined}}>{isA ? '▶' : isD ? '✓' : ''}</span>
								<span style={{paddingLeft: (ln.indent ?? 0) * fs * 1.2}}>{txt}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

/* ================================================================== rótulos y gráficos */

/** Globo de «pantalla proyectada» del robot: texto corto de terminal sobre su cabeza. (x, y) = punta inferior del globo. */
export const RobotSays: React.FC<{x: number; y: number; at: number; out?: number; children: React.ReactNode; color?: string; size?: number}> = ({x, y, at, out, children, color = C.green, size = 40}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 11, 260, 0.6);
	const o = out !== undefined ? 1 - tween(f, out - 5, out) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) scale(${0.4 + 0.6 * p})`, transformOrigin: '50% 100%', opacity: o * Math.min(1, p * 2)}}>
			<div style={{fontFamily: MONO, fontWeight: 800, fontSize: size, color, background: 'rgba(8,12,10,0.95)', border: `4px solid ${color}`, padding: '12px 24px', whiteSpace: 'nowrap', boxShadow: `0 0 30px ${color}66`}}>{children}</div>
			<div style={{width: 0, height: 0, margin: '0 auto', borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: `18px solid ${color}`}} />
		</div>
	);
};

/** Etiqueta corta (1–3 palabras) que entra con rebote, centrada en (x, y). Ámbar = pregunta o duda; verde = confirmación. */
export const Tag: React.FC<{x: number; y: number; at: number; out?: number; children: React.ReactNode; color?: string; size?: number; rot?: number}> = ({x, y, at, out, children, color = C.amber, size = 44, rot = 0}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 10, 280, 0.6);
	const o = out !== undefined ? 1 - tween(f, out - 5, out) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${0.2 + 0.8 * p})`, opacity: o, fontFamily: MONO, fontWeight: 800, fontSize: size, color: C.bg, background: color, padding: '10px 22px', whiteSpace: 'nowrap', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>{children}</div>
	);
};

/** Burbuja de diálogo blanca (texto corto). (x, y) = punta de la burbuja; `tail`: lado del que sale la punta. */
export const Bubble: React.FC<{x: number; y: number; at: number; out?: number; children: React.ReactNode; size?: number; tail?: 'left' | 'right'}> = ({x, y, at, out, children, size = 46, tail = 'left'}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 11, 260, 0.6);
	const o = out !== undefined ? 1 - tween(f, out - 5, out) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(${tail === 'left' ? '-46px' : 'calc(-100% + 46px)'}, -100%) scale(${0.3 + 0.7 * p})`, transformOrigin: `${tail === 'left' ? '46px' : 'calc(100% - 46px)'} 100%`, opacity: o}}>
			<div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color: C.bg, background: C.white, padding: '14px 30px', borderRadius: 26, whiteSpace: 'nowrap', boxShadow: '0 10px 0 rgba(0,0,0,0.3)'}}>{children}</div>
			<div style={{width: 0, height: 0, marginLeft: tail === 'left' ? 30 : undefined, marginRight: tail === 'right' ? 30 : undefined, float: tail === 'right' ? 'right' : undefined, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: `22px solid ${C.white}`}} />
		</div>
	);
};

/** Sello que cae girado («ALGORITMO ✓»), centrado en (x, y). */
export const Stamp: React.FC<{x: number; y: number; at: number; out?: number; text?: string; color?: string; size?: number}> = ({x, y, at, out, text = 'ALGORITMO ✓', color = C.green, size = 52}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 9, 320, 0.5);
	return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(-8deg) scale(${2.6 - 1.6 * p})`, opacity: Math.min(1, p * 1.5), fontFamily: MONO, fontWeight: 800, fontSize: size, color, border: `6px solid ${color}`, padding: '8px 22px', whiteSpace: 'nowrap', background: 'rgba(7,8,7,0.82)', boxShadow: `0 0 30px ${color}55`}}>{text}</div>;
};

/** Claqueta («INTENTO 1»). Para que golpee, envuélvela en <Slam> de @commons/transiciones. */
export const Clap: React.FC<{at: number; text: string}> = ({at, text}) => {
	const f = useCurrentFrame();
	const close = tween(f, at + 5, at + 10);
	return (
		<div>
			<div style={{width: 640, height: 50, background: 'repeating-linear-gradient(45deg, #FFFFFF 0 36px, #111 36px 72px)', transform: `rotate(${-24 * (1 - close)}deg)`, transformOrigin: '0 100%'}} />
			<div style={{width: 640, padding: '26px 0', background: '#111', color: C.white, fontFamily: MONO, fontWeight: 800, fontSize: 92, textAlign: 'center', border: '5px solid #FFFFFF', boxSizing: 'border-box'}}>{text}</div>
		</div>
	);
};

/** Mini-tarjeta de concepto (icono + palabra). `on`: encendida. `size`: factor de escala (1 = 260×220). */
export const ConceptCard: React.FC<{icon: React.ReactNode; label: string; on?: boolean; size?: number}> = ({icon, label, on = true, size = 1}) => (
	<div style={{width: 260 * size, height: 220 * size, background: on ? 'rgba(0,192,99,0.16)' : 'rgba(20,24,21,0.92)', border: `${Math.max(3, 5 * size)}px solid ${on ? C.green : C.line2}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 * size, boxShadow: on ? `0 0 36px ${C.green}55` : 'none', boxSizing: 'border-box'}}>
		<div style={{fontSize: 84 * size, lineHeight: 1, fontFamily: MONO, fontWeight: 800, color: C.white}}>{icon}</div>
		<div style={{fontSize: 34 * size, fontFamily: MONO, fontWeight: 800, color: on ? C.green : C.dim}}>{label}</div>
	</div>
);

/** Deslizador GENERAL ←→ DETALLADO. `knob` 0–1; `marks`: iconos que aparecen sobre la barra en `pos` 0–1. */
export const DetailSlider: React.FC<{x: number; y: number; w?: number; knob: number; marks?: {at: number; icon: React.ReactNode; pos: number}[]}> = ({x, y, w = 1300, knob, marks = []}) => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w}}>
			<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.text, marginBottom: 26}}><span>GENERAL</span><span>DETALLADO</span></div>
			<div style={{position: 'relative', height: 18, background: C.line2}}>
				<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${knob * 100}%`, background: C.green}} />
				{marks.map((m, i) => (f >= m.at ? (
					<div key={i} style={{position: 'absolute', left: `${m.pos * 100}%`, bottom: 26, transform: `translateX(-50%) scale(${pop(f, m.at, 10, 260, 0.6)})`, transformOrigin: '50% 100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						{m.icon}
						<div style={{width: 5, height: 34, background: C.green, marginTop: 8}} />
					</div>
				) : null))}
				<div style={{position: 'absolute', left: `${knob * 100}%`, top: -20, width: 58, height: 58, transform: 'translateX(-50%)', background: C.white, border: `8px solid ${C.green}`, boxSizing: 'border-box'}} />
			</div>
		</div>
	);
};

/** Botón SÍ / NO de la interfaz de decisión (290×130). `pressAt`: se hunde y destella. */
export const ChoiceButton: React.FC<{label: string; color: string; pressAt?: number; dim?: boolean}> = ({label, color, pressAt, dim}) => {
	const f = useCurrentFrame();
	const pressed = pressAt !== undefined && f >= pressAt;
	const beat = 1 + 0.045 * Math.sin(f / 4.5);
	const flash = pressed ? Math.max(0, 1 - (f - pressAt!) / 10) : 0;
	return (
		<div style={{width: 290, height: 130, background: color, opacity: dim ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 72, color: C.bg, transform: `scale(${pressed ? 0.94 : beat}) translateY(${pressed ? 10 : 0}px)`, boxShadow: pressed ? `0 2px 0 rgba(0,0,0,0.4), 0 0 ${50 * flash + 12}px ${color}` : '0 12px 0 rgba(0,0,0,0.4)'}}>{label}</div>
	);
};

/** Signo «?» que gira (sobre una cabeza), centrado en (x, y). */
export const Question: React.FC<{x: number; y: number; at: number; out?: number; size?: number; color?: string}> = ({x, y, at, out, size = 120, color = C.amber}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 10, 260, 0.6);
	return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${p}) rotateY(${(f - at) * 9}deg)`, fontFamily: MONO, fontWeight: 800, fontSize: size, color, textShadow: `0 0 24px ${color}99`}}>?</div>;
};

/**
 * Texto que se escribe con cursor de terminal. Ocupa desde el principio el ancho del texto completo
 * (no se mueve al escribir). `center`: centrado en (x, y); si no, (x, y) es su esquina superior izquierda.
 */
export const TypeLine: React.FC<{text: string; at: number; x: number; y: number; size?: number; color?: string; cps?: number; center?: boolean; weight?: number; font?: string; out?: number}> = ({text, at, x, y, size = 96, color = C.white, cps = 26, center = true, weight = 800, font = SANS, out}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const n = Math.min(text.length, Math.floor(((f - at) / 30) * cps));
	const cur = Math.floor(f / 8) % 2 === 0;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: center ? 'translate(-50%, -50%)' : undefined, fontFamily: font, fontWeight: weight, fontSize: size, color, whiteSpace: 'nowrap', letterSpacing: font === SANS ? '-0.03em' : undefined}}>
			<span style={{visibility: 'hidden'}}>{text}</span>
			<span style={{position: 'absolute', left: 0, top: 0}}>
				{text.slice(0, n)}
				<span style={{color: C.green, opacity: cur ? 1 : 0}}>▌</span>
			</span>
		</div>
	);
};

/** Superposición de cinta de video (pausa o rebobinado), a pantalla completa. `label`: «❚❚», «◀◀». */
export const VHS: React.FC<{on: boolean; label?: string}> = ({on, label}) => {
	const f = useCurrentFrame();
	if (!on) return null;
	return (
		<div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
			<div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 6px)', transform: `translateY(${(f * 7) % 6}px)`}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: (f * 31) % 1080, height: 46, background: 'rgba(255,255,255,0.1)'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: (f * 17 + 400) % 1080, height: 14, background: 'rgba(255,255,255,0.14)', transform: `translateX(${Math.sin(f) * 30}px)`}} />
			{label && <div style={{position: 'absolute', left: 90, top: 96, fontFamily: MONO, fontWeight: 800, fontSize: 96, color: C.white, textShadow: '4px 0 #E2463E, -4px 0 #5AA9FF'}}>{label}</div>}
		</div>
	);
};

/** Indicador de esquina superior derecha («CAMINO A: SÍ», «×2»), bajo el HUD. */
export const CornerTag: React.FC<{text: string; at: number; out?: number; color?: string}> = ({text, at, out, color = C.green}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 12, 240, 0.6);
	return <div style={{position: 'absolute', right: 60, top: 86, transform: `translateX(${(1 - p) * 400}px)`, fontFamily: MONO, fontWeight: 800, fontSize: 44, color, border: `4px solid ${color}`, padding: '10px 22px', background: 'rgba(7,8,7,0.9)', boxShadow: `0 0 26px ${color}55`}}>{text}</div>;
};

/* ================================================================== HUD y subtítulos (los monta Video.tsx) */

/** HUD del sistema Goslint: prompt a la izquierda; a la derecha, capítulo y avance. */
export const Hud: React.FC = () => {
	const f = useCurrentFrame();
	const i = Math.max(0, CHAPTERS.findIndex((c) => f >= BLOCKS[c.b][0] && f < BLOCKS[c.b][1]));
	const ch = CHAPTERS[i];
	const o = tween(f, 20, 34) * (1 - tween(f, DURATION - 150, DURATION - 130));
	const p = pop(f, BLOCKS[ch.b][0] + 6, 12, 240, 0.6);
	return (
		<div style={{position: 'absolute', left: 48, right: 48, top: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: MONO, fontSize: 22, color: 'rgba(255,255,255,0.78)', opacity: o, letterSpacing: '0.08em', textShadow: '0 1px 6px rgba(0,0,0,0.9)', pointerEvents: 'none'}}>
			<span><span style={{color: C.green}}>●</span> goslint@uceva</span>
			<span style={{display: 'flex', alignItems: 'center', gap: 16}}>
				<span style={{textTransform: 'uppercase', display: 'inline-block', transform: `translateY(${(1 - p) * -30}px)`, opacity: p}}>{`${i + 1}/${CHAPTERS.length} · ${ch.label}`}</span>
				<span style={{width: 190, height: 5, background: 'rgba(255,255,255,0.18)', display: 'inline-block', position: 'relative'}}>
					<span style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(f / DURATION) * 100}%`, background: C.green}} />
				</span>
			</span>
		</div>
	);
};

/** Subtítulos fieles a la locución (abajo, centrados). */
export const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const cue = CUES.find((c) => f >= c.from - 1 && f < c.to);
	if (!cue) return null;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
			<div style={{maxWidth: 1500, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 38, lineHeight: 1.25, color: C.white, background: 'rgba(0,0,0,0.72)', padding: '10px 26px', borderRadius: 10}}>{cue.text}</div>
		</div>
	);
};
