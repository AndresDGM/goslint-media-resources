import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {pop, tween} from '@commons/lib';
import {Buf, PixelSprite} from '@commons/pixel';
import {Mascota} from '@commons/mascotas';
import {talkLevel, speaking} from './timeline';

/**
 * Piezas propias de este video. Todos los tiempos son fotogramas ABSOLUTOS (usa `t('m:ss')`).
 * Coordenadas en el lienzo de 1920×1080. Línea del piso de la cocina: FLOOR. Tablero de la mesa: TABLE_Y.
 */
export const FLOOR = 930;
export const TABLE_Y = 700;
export const TABLE_X0 = 1060;
export const TABLE_X1 = 1780;
/** Escala de pixel art de los personajes (Vee y el robot miden ≈ 34 px lógicos → ≈ 270 px). */
export const PX = 8;

/* ================================================================== Vee */

/** Acción de Vee (clips del kit de mascotas). */
export type VeeAct = 'reposo' | 'saludar' | 'senalar' | 'pensar' | 'celebrar' | 'sorpresa' | 'explicar' | 'especial' | 'hablar';

/**
 * Vee con la boca sincronizada a la locución. `act` + `actAt` lanzan un clip (señalar, sorpresa…);
 * mientras habla y no hay acción en curso, mueve la boca.
 */
export const Vee: React.FC<{x: number; y?: number; scale?: number; at?: number; out?: number; act?: VeeAct; actAt?: number; flip?: boolean; entra?: boolean; sale?: boolean}> = ({x, y = FLOOR, scale = PX, at, out, act, actAt, flip, entra, sale}) => {
	const f = useCurrentFrame();
	const acting = act && actAt !== undefined && f >= actAt && f < actAt + 70;
	return (
		<Mascota
			id="vee"
			x={x}
			y={y}
			scale={scale}
			at={at}
			out={out}
			flip={flip}
			entra={entra}
			sale={sale}
			clip={acting ? act : undefined}
			clipAt={actAt}
			speaking={!acting && speaking(f)}
			talk={acting ? 0 : talkLevel(f)}
		/>
	);
};

/* ================================================================== robot «Bit» */

export type RobotPose =
	| 'off' | 'idle' | 'walk' | 'reach' | 'hold' | 'pour' | 'stir' | 'squat' | 'stretch' | 'salute'
	| 'bow' | 'present' | 'trophy' | 'spin' | 'dizzy' | 'sit' | 'point' | 'wave' | 'thumb';
export type RobotFace = 'happy' | 'wow' | 'conf' | 'nerv' | 'dizzy' | 'blink' | 'off' | 'proud' | 'focus';

const RB = {
	metal: '#C9D3CE', metalD: '#8E9A94', metalL: '#EEF3F0', visor: '#0B0F0D', eye: '#00C063', eyeL: '#7CFFB3',
	joint: '#4A5550', screen: '#0E110F', green: '#00C063', greenD: '#00864A', shoe: '#39423E', red: '#E2463E',
};

/** Ángulos de brazos por pose: [delantero, trasero] en grados (0 colgando, 90 afuera, 180 arriba). */
const ARMS: Record<RobotPose, (t: number) => [number, number]> = {
	off: () => [5, 5], idle: (t) => [8 + 3 * Math.sin(t / 9), 8 - 3 * Math.sin(t / 9)], walk: (t) => [20 * Math.sin(t / 4), -20 * Math.sin(t / 4)],
	reach: () => [150, 10], hold: () => [75, 10], pour: () => [110, 10], stir: (t) => [70 + 18 * Math.sin(t / 2.2), 10], squat: () => [90, 90],
	stretch: (t) => [170 - 30 * Math.abs(Math.sin(t / 8)), 170 - 30 * Math.abs(Math.sin(t / 8))], salute: () => [160, 5], bow: () => [20, 20],
	present: () => [120, 120], trophy: () => [172, 172], spin: (t) => [90 + 20 * Math.sin(t), 90 - 20 * Math.sin(t)], dizzy: (t) => [40 + 20 * Math.sin(t / 3), 40 - 20 * Math.sin(t / 3)],
	sit: () => [40, 40], point: () => [95, 10], wave: (t) => [150 + 20 * Math.sin(t / 2.5), 10], thumb: () => [120, 10],
};

/** Dibuja al robot en un lienzo de 44×44 (pies en y=42, centro x=22). Devuelve también la mano delantera y trasera. */
const drawRobot = (pose: RobotPose, face: RobotFace, t: number) => {
	const b = new Buf(44, 44);
	const cx = 22;
	const squat = pose === 'squat' ? 3 + Math.round(2 * Math.abs(Math.sin(t / 6))) : pose === 'sit' ? 5 : 0;
	const bob = pose === 'idle' ? Math.round(Math.sin(t / 12)) : pose === 'walk' ? Math.round(Math.abs(Math.sin(t / 4))) * -1 : 0;
	const bow = pose === 'bow' ? 3 : 0;
	const y0 = bob + squat;
	// piernas
	const leg = (x: number, lift: number) => {
		b.rect(x, 33 + y0 - lift, 3, Math.max(2, 7 - squat) , RB.joint);
		b.rect(x - 1, 40 - lift, 5, 2, RB.shoe);
	};
	const step = pose === 'walk' ? Math.round(Math.max(0, Math.sin(t / 4)) * 2) : 0;
	const step2 = pose === 'walk' ? Math.round(Math.max(0, -Math.sin(t / 4)) * 2) : 0;
	if (pose === 'sit') {
		b.rect(cx - 6, 38, 12, 2, RB.joint);
		b.rect(cx - 8, 40, 4, 2, RB.shoe);
		b.rect(cx + 4, 40, 4, 2, RB.shoe);
	} else {
		leg(cx - 5, step);
		leg(cx + 2, step2);
	}
	// cuerpo
	const by = 21 + y0;
	b.rect(cx - 7, by, 14, 12, RB.metal);
	b.rect(cx + 5, by, 2, 12, RB.metalD);
	b.rect(cx - 7, by, 14, 1, RB.metalL);
	b.rect(cx - 5, by + 2, 9, 7, RB.screen); // pantalla del pecho
	b.rect(cx - 5, by + 2, 9, 1, RB.greenD);
	b.rect(cx - 4, by + 10, 2, 1, RB.green); // guiño Goslint: «L» verde
	b.rect(cx - 4, by + 9, 1, 2, RB.green);
	// cabeza
	const hy = 7 + y0 + bow;
	const hx = cx + (bow ? 1 : 0);
	b.rect(hx - 8, hy, 16, 13, RB.metal);
	b.rect(hx + 6, hy, 2, 13, RB.metalD);
	b.rect(hx - 8, hy, 16, 1, RB.metalL);
	b.rect(hx - 9, hy + 4, 1, 5, RB.metalD); // orejas
	b.rect(hx + 8, hy + 4, 1, 5, RB.metalD);
	b.rect(hx - 6, hy + 2, 12, 8, RB.visor);
	// antena
	b.rect(hx, hy - 4, 1, 4, RB.metalD);
	b.rect(hx - 1, hy - 6, 3, 2, Math.floor(t / 15) % 2 ? RB.eyeL : RB.green);
	// cara (ojos en el visor)
	const ex = hx - 4, ey = hy + 4;
	const eye = (x: number, y: number, kind: RobotFace) => {
		if (kind === 'off') return;
		if (kind === 'blink' || (kind === 'happy' && t % 90 < 4)) b.rect(x, y + 1, 2, 1, RB.eye);
		else if (kind === 'happy' || kind === 'proud') {
			b.set(x, y + 1, RB.eye); b.set(x + 1, y, RB.eye); b.set(x + 2, y + 1, RB.eye);
		} else if (kind === 'wow') b.rect(x, y - 1, 3, 3, RB.eye);
		else if (kind === 'dizzy') {
			b.set(x, y, RB.eye); b.set(x + 2, y, RB.eye); b.set(x + 1, y + 1, RB.eye); b.set(x, y + 2, RB.eye); b.set(x + 2, y + 2, RB.eye);
		} else if (kind === 'focus') b.rect(x, y + 1, 3, 1, RB.eye);
		else b.rect(x, y, 2, 2, RB.eye); // conf / nerv
	};
	eye(ex, ey, face);
	eye(ex + 6, ey, face === 'conf' ? 'wow' : face);
	if (face !== 'off') b.set(ex - 1, ey, RB.eyeL);
	if (face === 'proud' || face === 'happy') b.rect(hx - 2, hy + 8, 4, 1, RB.eye);
	if (face === 'nerv') { b.set(hx - 2, hy + 8, RB.eye); b.set(hx - 1, hy + 7, RB.eye); b.set(hx, hy + 8, RB.eye); b.set(hx + 1, hy + 7, RB.eye); b.set(hx + 6, hy + 1, '#7FB8FF'); }
	if (face === 'wow') b.rect(hx - 1, hy + 7, 2, 2, RB.eye);
	// brazos
	const [aF, aB] = ARMS[pose](t);
	const arm = (sx: number, sy: number, deg: number, dir: number) => {
		const r = (deg * Math.PI) / 180;
		const L = 8;
		const hx2 = sx + dir * Math.sin(r) * L;
		const hy2 = sy + Math.cos(r) * L;
		b.line(sx, sy, hx2, hy2, RB.metalD, 2);
		b.rect(Math.round(hx2) - 1, Math.round(hy2) - 1, 3, 3, RB.joint);
		return [hx2, hy2] as [number, number];
	};
	const back = arm(cx - 8, by + 1, aB, -1);
	const front = arm(cx + 7, by + 1, aF, 1);
	return {buf: b, front, back};
};

/**
 * El robot ejecutor. `x` = centro, `y` = línea de los pies. `holdF`/`holdB`: lo que lleva en la mano
 * delantera (derecha de la pantalla, o izquierda si `flip`) y trasera. `chest`: glifo corto de la
 * pantalla del pecho (✓, ?, ∞, 2…). `spin` > 0 lo hace girar como trompo.
 */
export const Robot: React.FC<{
	x: number; y?: number; scale?: number; pose?: RobotPose; face?: RobotFace; flip?: boolean; at?: number; out?: number;
	holdF?: React.ReactNode; holdB?: React.ReactNode; chest?: string; chestColor?: string; spin?: number; tilt?: number; opacity?: number;
}> = ({x, y = FLOOR, scale = PX, pose = 'idle', face = 'happy', flip, at, out, holdF, holdB, chest, chestColor = C.green, spin = 0, tilt = 0, opacity = 1}) => {
	const f = useCurrentFrame();
	if (at !== undefined && f < at) return null;
	if (out !== undefined && f >= out) return null;
	const p = at !== undefined ? pop(f, at, 12, 220, 0.6) : 1;
	const {buf, front, back} = drawRobot(pose, face, f);
	const w = buf.w * scale;
	const h = buf.h * scale;
	const sx = spin ? Math.cos(f * spin) : 1;
	const fl = flip ? -1 : 1;
	const place = (pt: [number, number], node: React.ReactNode) =>
		node ? <div style={{position: 'absolute', left: pt[0] * scale, top: pt[1] * scale, transform: `translate(-50%, -50%) scaleX(${fl})`}}>{node}</div> : null;
	return (
		<div style={{position: 'absolute', left: x - w / 2, top: y - (42 / 44) * h, width: w, height: h, opacity: opacity * Math.min(1, p * 2), transform: `scaleX(${fl * sx}) rotate(${tilt}deg) scale(${0.7 + 0.3 * p})`, transformOrigin: '50% 95%', filter: 'drop-shadow(0 16px 20px rgba(0,0,0,0.5))'}}>
			<PixelSprite buf={buf} scale={scale} />
			{chest && (
				<div style={{position: 'absolute', left: 17 * scale, top: (23 + (pose === 'squat' ? 4 : pose === 'sit' ? 5 : 0)) * scale, width: 9 * scale, height: 7 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, color: chestColor, fontSize: chest.length > 2 ? 3 * scale : 5 * scale, transform: `scaleX(${fl})`, textShadow: `0 0 8px ${chestColor}`}}>{chest}</div>
			)}
			{place(front, holdF)}
			{place(back, holdB)}
		</div>
	);
};

/** Globo de «pantalla proyectada» del robot: texto corto en terminal, unido a su cabeza. */
export const RobotSays: React.FC<{x: number; y: number; at: number; out?: number; children: React.ReactNode; color?: string; size?: number}> = ({x, y, at, out, children, color = C.green, size = 34}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 12, 240, 0.6);
	const o = out !== undefined ? 1 - tween(f, out - 6, out) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) scale(${0.5 + 0.5 * p})`, transformOrigin: '50% 100%', opacity: o * Math.min(1, p * 2)}}>
			<div style={{fontFamily: MONO, fontWeight: 800, fontSize: size, color, background: 'rgba(8,12,10,0.94)', border: `3px solid ${color}`, padding: '10px 20px', whiteSpace: 'nowrap', boxShadow: `0 0 24px ${color}55`}}>{children}</div>
			<div style={{width: 0, height: 0, margin: '0 auto', borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: `16px solid ${color}`}} />
		</div>
	);
};

/* ================================================================== objetos (pixel art) */

const OBJ = {
	cer: '#F4F7F5', cerD: '#B4C0B8', coffee: '#4A2A18', coffeeL: '#6B3D22', latte: '#B07A4F', latteL: '#C9956A', black: '#2A160C',
	bag: '#8A5434', bagD: '#5B3521', label: '#F2C230', milk: '#F4F7F5', milkD: '#C9D6DE', milkCap: '#3E73D8',
	sugar: '#FFFFFF', bowl: '#3E73D8', bowlD: '#2B4F96', steel: '#B9C3BE', steelD: '#7E8A84', kettle: '#E2463E', kettleD: '#A8302A',
	water: '#5AA9FF', waterL: '#A9D3FF', wood: '#6B4A33', glass: '#9FD6F5',
};

const sprite = (w: number, h: number, draw: (b: Buf) => void, scale = PX) => {
	const b = new Buf(w, h);
	draw(b);
	return <PixelSprite buf={b} scale={scale} />;
};

/** Contenido de la taza: vacía, café en polvo, café negro, café con azúcar (igual que negro), café con leche. */
export type CupFill = 'empty' | 'grounds' | 'black' | 'latte';
/** Taza (12×10 px). `level` 0–1 para el llenado durante un vertido. */
export const Cup: React.FC<{fill?: CupFill; level?: number; steam?: boolean; scale?: number}> = ({fill = 'empty', level = 1, steam, scale = PX}) => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'relative'}}>
			{sprite(13, 10, (b) => {
				b.rect(0, 0, 10, 10, OBJ.cer);
				b.rect(8, 0, 2, 10, OBJ.cerD);
				b.rect(10, 2, 3, 1, OBJ.cer); b.rect(12, 2, 1, 5, OBJ.cer); b.rect(10, 6, 3, 1, OBJ.cer);
				b.rect(1, 0, 8, 1, '#DDE5E0');
				const top = fill === 'grounds' ? 7 : Math.round(8 - 7 * level);
				if (fill !== 'empty') b.rect(1, Math.max(1, top), 8, 9 - Math.max(1, top), fill === 'grounds' ? OBJ.coffee : fill === 'latte' ? OBJ.latte : OBJ.black);
				if (fill === 'latte') b.rect(2, Math.max(1, top), 5, 1, OBJ.latteL);
				b.rect(0, 9, 10, 1, OBJ.cerD);
			}, scale)}
			{steam && [0, 1, 2].map((i) => {
				const k = ((f + i * 14) % 42) / 42;
				return <div key={i} style={{position: 'absolute', left: (2 + i * 3) * scale, top: -k * 9 * scale, width: scale, height: scale * 2, background: '#FFFFFF', opacity: 0.5 * (1 - k), transform: `translateX(${Math.sin(k * 6 + i) * scale}px)`}} />;
			})}
		</div>
	);
};

/** Bolsa de café (10×13 px). */
export const CoffeeBag: React.FC<{scale?: number; tip?: number}> = ({scale = PX, tip = 0}) => (
	<div style={{transform: `rotate(${tip}deg)`, transformOrigin: '50% 20%'}}>
		{sprite(10, 13, (b) => {
			b.rect(1, 1, 8, 12, OBJ.bag); b.rect(7, 1, 2, 12, OBJ.bagD); b.rect(0, 0, 10, 2, OBJ.bagD);
			b.rect(2, 5, 5, 4, OBJ.label); b.rect(3, 6, 1, 2, OBJ.coffee); b.rect(5, 6, 1, 2, OBJ.coffee);
		}, scale)}
	</div>
);

/** Frasco de café con tapa (9×10 px). */
export const CoffeeJar: React.FC<{scale?: number}> = ({scale = PX}) =>
	sprite(9, 10, (b) => {
		b.rect(1, 0, 7, 2, OBJ.wood); b.rect(0, 2, 9, 8, OBJ.glass); b.rect(1, 3, 7, 6, OBJ.coffee); b.rect(1, 3, 2, 6, OBJ.coffeeL); b.rect(3, 5, 3, 2, OBJ.label);
	}, scale);

/** Jarra de leche (9×12 px). */
export const MilkJug: React.FC<{scale?: number; tip?: number}> = ({scale = PX, tip = 0}) => (
	<div style={{transform: `rotate(${tip}deg)`, transformOrigin: '50% 30%'}}>
		{sprite(10, 12, (b) => {
			b.rect(1, 2, 7, 10, OBJ.milk); b.rect(6, 2, 2, 10, OBJ.milkD); b.rect(2, 0, 5, 2, OBJ.milkCap); b.rect(8, 4, 2, 5, OBJ.milkD); b.rect(2, 6, 4, 3, OBJ.milkCap);
		}, scale)}
	</div>
);

/** Azucarero (10×8 px). */
export const SugarBowl: React.FC<{scale?: number}> = ({scale = PX}) =>
	sprite(10, 8, (b) => {
		b.rect(0, 2, 10, 6, OBJ.bowl); b.rect(8, 2, 2, 6, OBJ.bowlD); b.rect(1, 1, 8, 2, OBJ.sugar); b.rect(3, 0, 4, 1, OBJ.sugar);
	}, scale);

/** Cuchara (3×11 px). `load`: lleva café o azúcar en la punta. */
export const Spoon: React.FC<{scale?: number; load?: 'coffee' | 'sugar'; rot?: number}> = ({scale = PX, load, rot = 0}) => (
	<div style={{transform: `rotate(${rot}deg)`, transformOrigin: '50% 90%'}}>
		{sprite(3, 11, (b) => {
			b.rect(1, 3, 1, 8, OBJ.steel); b.rect(0, 0, 3, 3, OBJ.steel); b.rect(2, 0, 1, 3, OBJ.steelD);
			if (load) b.rect(0, 0, 3, 1, load === 'coffee' ? OBJ.coffee : OBJ.sugar);
		}, scale)}
	</div>
);

/** Tetera (14×11 px). `shake` 0–1 la hace temblar; `steam` suelta vapor; `lid` levanta la tapa. */
export const Kettle: React.FC<{scale?: number; shake?: number; steam?: boolean; lid?: number; tip?: number}> = ({scale = PX, shake = 0, steam, lid = 0, tip = 0}) => {
	const f = useCurrentFrame();
	const dx = shake ? Math.sin(f * 2.3) * 2 * shake : 0;
	return (
		<div style={{position: 'relative', transform: `translateX(${dx}px) rotate(${tip}deg)`, transformOrigin: '30% 60%'}}>
			{sprite(15, 12, (b) => {
				b.rect(2, 3, 10, 9, OBJ.kettle); b.rect(10, 3, 2, 9, OBJ.kettleD); b.rect(12, 5, 2, 1, OBJ.kettle); b.rect(13, 4, 2, 1, OBJ.kettle);
				b.rect(0, 5, 2, 4, OBJ.kettleD); b.rect(4, 2, 6, 1, OBJ.kettleD);
				b.rect(5, 1 - Math.round(lid * 2), 4, 1, OBJ.steelD); b.rect(6, 0 - Math.round(lid * 2), 2, 1, OBJ.steelD);
			}, scale)}
			{steam && [0, 1, 2].map((i) => {
				const k = ((f + i * 10) % 30) / 30;
				return <div key={i} style={{position: 'absolute', left: (14 + k * 4) * scale, top: (3 - k * 8) * scale, width: scale * 1.5, height: scale * 1.5, background: '#FFFFFF', opacity: 0.6 * (1 - k)}} />;
			})}
		</div>
	);
};

/** Jarra medidora (8×12 px) con nivel 0–1 y marcas. `liquid`: agua o leche. */
export const MeasureJug: React.FC<{level: number; liquid?: 'water' | 'milk'; scale?: number; label?: string}> = ({level, liquid = 'water', scale = PX, label}) => (
	<div style={{position: 'relative'}}>
		{sprite(9, 12, (b) => {
			b.rect(0, 0, 8, 12, 'rgba(159,214,245,0.35)'); b.rect(0, 0, 1, 12, OBJ.glass); b.rect(7, 0, 1, 12, OBJ.glass); b.rect(0, 11, 8, 1, OBJ.glass); b.rect(8, 3, 1, 5, OBJ.glass);
			const top = Math.round(11 - 10 * level);
			b.rect(1, top, 6, 11 - top, liquid === 'water' ? OBJ.water : OBJ.milk);
			[3, 6, 9].forEach((y) => b.rect(5, y, 2, 1, OBJ.steelD));
		}, scale)}
		{label && <div style={{position: 'absolute', left: '110%', top: '30%', fontFamily: MONO, fontWeight: 800, fontSize: 26, color: C.white, whiteSpace: 'nowrap'}}>{label}</div>}
	</div>
);

/** Charco en el piso (café con leche). `size` 0–1. */
export const Puddle: React.FC<{size: number; x: number; y?: number; color?: string}> = ({size, x, y = FLOOR, color = OBJ.latte}) => {
	if (size <= 0) return null;
	const w = 420 * size;
	return (
		<div style={{position: 'absolute', left: x - w / 2, top: y - 14 * size, width: w, height: 34 * size, background: color, borderRadius: '50%', boxShadow: `inset 0 -6px 0 ${OBJ.coffee}`, imageRendering: 'pixelated'}} />
	);
};

/** Chorro de líquido vertical (agua, leche, café en polvo) de (x, y0) a y1. */
export const Pour: React.FC<{x: number; y0: number; y1: number; color?: string; w?: number; on?: boolean}> = ({x, y0, y1, color = OBJ.water, w = 12, on = true}) => {
	const f = useCurrentFrame();
	if (!on || y1 <= y0) return null;
	return (
		<div style={{position: 'absolute', left: x - w / 2, top: y0, width: w, height: y1 - y0, background: `repeating-linear-gradient(180deg, ${color} 0 14px, ${color}CC 14px 22px)`, backgroundPositionY: f * 9}} />
	);
};

/** Partículas que caen (polvo de café, azúcar, gotas). Deterministas. */
export const Falling: React.FC<{x: number; y0: number; y1: number; at: number; dur: number; color: string; n?: number; spread?: number}> = ({x, y0, y1, at, dur, color, n = 14, spread = 30}) => {
	const f = useCurrentFrame();
	if (f < at || f > at + dur + 20) return null;
	return (
		<>
			{Array.from({length: n}).map((_, i) => {
				const st = at + (i / n) * dur;
				const k = (f - st) / 14;
				if (k < 0 || k > 1) return null;
				const xx = x + Math.sin(i * 7.3) * spread * 0.5;
				return <div key={i} style={{position: 'absolute', left: xx, top: y0 + (y1 - y0) * k * k, width: 8, height: 8, background: color}} />;
			})}
		</>
	);
};

/** Contador grande sobre un objeto (1, 2…) que salta al cambiar. */
export const Counter: React.FC<{x: number; y: number; value: string | number; at: number; color?: string; size?: number}> = ({x, y, value, at, color = C.green, size = 64}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 10, 260, 0.5);
	return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * p})`, fontFamily: MONO, fontWeight: 800, fontSize: size, color, textShadow: `0 0 18px ${color}88`}}>{value}</div>;
};

/* ================================================================== escenarios */

/** Cocina pixelada en 3 capas (pared con repisa, mesa con estufa, piso). `light` 0 apagada – 1 normal; `warm` 0–1 atardecer. `panX` desplaza las capas (parallax). */
export const Kitchen: React.FC<{light?: number; warm?: number; panX?: number; cupOnShelf?: boolean; stove?: boolean; flame?: boolean}> = ({light = 1, warm = 0, panX = 0, cupOnShelf = false, stove = true, flame = false}) => {
	const f = useCurrentFrame();
	const wall = warm ? `rgb(${24 + 20 * warm}, ${30 + 6 * warm}, ${28 - 4 * warm})` : '#18201C';
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: C.bg}}>
			{/* pared */}
			<div style={{position: 'absolute', left: -100 + panX * 0.3, top: 0, width: 2200, height: FLOOR, background: wall}}>
				{/* azulejos */}
				<div style={{position: 'absolute', left: 0, right: 0, top: 470, height: TABLE_Y - 470, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)', backgroundSize: '48px 48px'}} />
				{/* ventana */}
				<div style={{position: 'absolute', left: 300, top: 150, width: 300, height: 220, background: warm ? '#E89A4A' : '#0E2A3A', border: '12px solid #2A3530'}}>
					<div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 10, background: '#2A3530'}} />
					<div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: 10, background: '#2A3530'}} />
				</div>
				{/* repisa */}
				<div style={{position: 'absolute', left: 1460, top: 400, width: 380, height: 18, background: '#5B4030', boxShadow: '0 10px 0 #3E2C21'}} />
				<div style={{position: 'absolute', left: 1490, top: 330}}><CoffeeJar scale={7} /></div>
				{/* logo Goslint pequeño en la pared */}
				<div style={{position: 'absolute', left: 900, top: 190, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.green, opacity: 0.35}}>● goslint@uceva</div>
			</div>
			{cupOnShelf && <div style={{position: 'absolute', left: 1700 + panX * 0.3 - 100, top: 400 - 10 * 7}}><Cup scale={7} /></div>}
			{/* mesa */}
			<div style={{position: 'absolute', left: TABLE_X0 + panX, top: TABLE_Y, width: TABLE_X1 - TABLE_X0, height: 26, background: '#8A6446', boxShadow: '0 8px 0 #5B4030'}} />
			<div style={{position: 'absolute', left: TABLE_X0 + 30 + panX, top: TABLE_Y + 26, width: 22, height: FLOOR - TABLE_Y - 26, background: '#5B4030'}} />
			<div style={{position: 'absolute', left: TABLE_X1 - 52 + panX, top: TABLE_Y + 26, width: 22, height: FLOOR - TABLE_Y - 26, background: '#5B4030'}} />
			{stove && (
				<div style={{position: 'absolute', left: TABLE_X1 - 230 + panX, top: TABLE_Y - 18, width: 180, height: 18, background: '#39423E'}}>
					{flame && <div style={{position: 'absolute', left: 60, top: -10, width: 60, height: 12, background: Math.floor(f / 3) % 2 ? '#5AA9FF' : '#3E73D8'}} />}
				</div>
			)}
			{/* piso */}
			<div style={{position: 'absolute', left: 0, top: FLOOR, width: 1920, height: 1080 - FLOOR, background: '#2A2A26', backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.25) 3px, transparent 3px)', backgroundSize: '120px 100%', backgroundPositionX: panX}} />
			<div style={{position: 'absolute', left: 0, top: FLOOR, width: 1920, height: 6, background: '#3A3A34'}} />
			{/* luz */}
			<div style={{position: 'absolute', inset: 0, background: '#000', opacity: (1 - light) * 0.92, pointerEvents: 'none'}} />
		</div>
	);
};

/** Pizarra negra con puntos (fondo de la definición y del título). */
export const Board: React.FC<{opacity?: number}> = ({opacity = 1}) => (
	<div style={{position: 'absolute', inset: 0, background: C.bg, opacity, backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 2px, transparent 2px)', backgroundSize: '40px 40px'}} />
);

/* ================================================================== cámara */

export type CamKey = [frame: number, zoom: number, cx: number, cy: number];
/** Cámara virtual: interpola zoom y centro entre claves [fotograma, zoom, cx, cy]. `shake` añade temblor. */
export const Cam: React.FC<{keys: CamKey[]; children: React.ReactNode; shakeAt?: number[]}> = ({keys, children, shakeAt = []}) => {
	const f = useCurrentFrame();
	let z = keys[0][1], cx = keys[0][2], cy = keys[0][3];
	for (let i = 0; i < keys.length - 1; i++) {
		const [a, za, xa, ya] = keys[i];
		const [b, zb, xb, yb] = keys[i + 1];
		if (f >= a) {
			const k = tween(f, a, b, 0, 1);
			z = za + (zb - za) * k; cx = xa + (xb - xa) * k; cy = ya + (yb - ya) * k;
		}
	}
	if (z >= 1) { cx = Math.min(1920 - 960 / z, Math.max(960 / z, cx)); cy = Math.min(1080 - 540 / z, Math.max(540 / z, cy)); }
	let sx = 0, sy = 0;
	for (const s of shakeAt) if (f >= s && f < s + 9) { const d = 1 - (f - s) / 9; sx += Math.sin(f * 3.1) * 12 * d; sy += Math.cos(f * 2.7) * 9 * d; }
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transform: `translate(${960 - cx * z + sx}px, ${540 - cy * z + sy}px) scale(${z})`, transformOrigin: '0 0'}}>{children}</div>
		</div>
	);
};

/** «Zoom-punch»: escala 1 → 1.1 → 1 en 8 fotogramas desde `at` (envuelve a cualquier hijo). */
export const punch = (f: number, at: number) => (f >= at && f < at + 10 ? 1 + 0.1 * Math.sin(((f - at) / 10) * Math.PI) : 1);

/* ================================================================== tarjeta de instrucciones */

export type Line = {text: string; indent?: number};
/**
 * Panel tipo terminal con el algoritmo. `shownAt[i]`: fotograma en que aparece la línea i (tecleo).
 * `active`: índice con el cursor ▶ (o -1). `done`: líneas con ✓. `dim`: líneas atenuadas.
 * `marks`: palabras resaltadas en verde (subrayado) por línea. `title`: rótulo superior.
 */
export const InstrCard: React.FC<{
	x: number; y: number; w: number; lines: Line[]; shownAt?: number[]; active?: number; done?: number[]; dim?: number[];
	marks?: Record<number, string[]>; size?: number; title?: string; at?: number; out?: number; accent?: string; blockHl?: [number, number];
}> = ({x, y, w, lines, shownAt, active = -1, done = [], dim = [], marks = {}, size = 30, title = 'algoritmo.txt', at, out, accent = C.green, blockHl}) => {
	const f = useCurrentFrame();
	if (at !== undefined && f < at) return null;
	if (out !== undefined && f >= out) return null;
	const p = at !== undefined ? pop(f, at, 13, 220, 0.6) : 1;
	const lh = size * 1.55;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, transform: `translateY(${(1 - p) * 80}px)`, opacity: Math.min(1, p * 2), background: 'rgba(14,17,15,0.96)', border: `3px solid ${accent}`, boxShadow: `0 0 40px ${accent}33, 0 20px 40px rgba(0,0,0,0.6)`}}>
			<div style={{fontFamily: MONO, fontSize: 20, color: C.dim, padding: '8px 16px', borderBottom: `2px solid ${C.line2}`, display: 'flex', gap: 10}}>
				<span style={{color: '#E2463E'}}>●</span><span style={{color: '#F2C230'}}>●</span><span style={{color: C.green}}>●</span><span style={{marginLeft: 8}}>{title}</span>
			</div>
			<div style={{position: 'relative', padding: '14px 18px 18px 18px'}}>
				{blockHl && <div style={{position: 'absolute', left: 8, right: 8, top: 14 + blockHl[0] * lh - 4, height: (blockHl[1] - blockHl[0] + 1) * lh + 8, border: `3px solid ${C.blue}`, background: 'rgba(90,169,255,0.08)'}} />}
				{lines.map((ln, i) => {
					const s = shownAt ? shownAt[i] : -1;
					if (shownAt && f < s) return <div key={i} style={{height: lh}} />;
					const chars = shownAt ? Math.min(ln.text.length, Math.floor((f - s) * 2.2)) : ln.text.length;
					const isA = i === active;
					const isD = done.includes(i);
					const isDim = dim.includes(i);
					let txt: React.ReactNode = ln.text.slice(0, chars);
					const mk = marks[i];
					if (mk && chars >= ln.text.length) {
						const re = new RegExp(`(${mk.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
						txt = ln.text.split(re).map((part, j) => (mk.includes(part) ? <span key={j} style={{color: C.green, borderBottom: `3px solid ${C.green}`}}>{part}</span> : <span key={j}>{part}</span>));
					}
					const kw = /^(INICIO|FIN|SI |FIN SI)/.test(ln.text);
					return (
						<div key={i} style={{height: lh, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: size, whiteSpace: 'nowrap', color: isDim ? C.faint : isA ? C.white : isD ? C.dim : kw ? C.green : C.text, background: isA ? 'rgba(0,192,99,0.16)' : 'transparent', fontWeight: isA || kw ? 800 : 500}}>
							<span style={{width: size * 1.1, color: C.green, flexShrink: 0}}>{isA ? '▶' : isD ? <span style={{color: C.dim}}>✓</span> : ''}</span>
							<span style={{paddingLeft: (ln.indent ?? 0) * size * 1.2}}>{txt}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

/* ================================================================== rótulos y gráficos */

/** Etiqueta corta (1–3 palabras) que entra con rebote. Ámbar = pregunta; verde = confirmación. */
export const Tag: React.FC<{x: number; y: number; at: number; out?: number; children: React.ReactNode; color?: string; size?: number}> = ({x, y, at, out, children, color = C.amber, size = 36}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 11, 260, 0.6);
	const o = out !== undefined ? 1 - tween(f, out - 6, out) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${0.3 + 0.7 * p})`, opacity: o, fontFamily: MONO, fontWeight: 800, fontSize: size, color: C.bg, background: color, padding: '8px 18px', whiteSpace: 'nowrap', boxShadow: `0 8px 0 rgba(0,0,0,0.35)`}}>{children}</div>
	);
};

/** Burbuja de diálogo de Vee (texto corto) apuntando hacia abajo-izquierda. */
export const Bubble: React.FC<{x: number; y: number; at: number; out?: number; children: React.ReactNode; size?: number}> = ({x, y, at, out, children, size = 40}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 12, 240, 0.6);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) scale(${0.4 + 0.6 * p})`, transformOrigin: '20% 100%'}}>
			<div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color: C.bg, background: C.white, padding: '12px 26px', borderRadius: 22, whiteSpace: 'nowrap'}}>{children}</div>
			<div style={{width: 0, height: 0, marginLeft: 30, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: `20px solid ${C.white}`}} />
		</div>
	);
};

/** Sello «ALGORITMO ✓» que cae girado. */
export const Stamp: React.FC<{x: number; y: number; at: number; text?: string; color?: string; size?: number}> = ({x, y, at, text = 'ALGORITMO ✓', color = C.green, size = 40}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 9, 300, 0.5);
	return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(-8deg) scale(${2.2 - 1.2 * p})`, opacity: Math.min(1, p * 1.5), fontFamily: MONO, fontWeight: 800, fontSize: size, color, border: `5px solid ${color}`, padding: '6px 18px', whiteSpace: 'nowrap', background: 'rgba(7,8,7,0.7)'}}>{text}</div>;
};

/** Claqueta «INTENTO n». */
export const Clap: React.FC<{at: number; text: string; out?: number}> = ({at, text, out}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 12, 230, 0.6);
	const close = tween(f, at + 6, at + 12);
	return (
		<div style={{position: 'absolute', left: 960, top: 300, transform: `translate(-50%, -50%) scale(${p})`}}>
			<div style={{width: 520, height: 40, background: 'repeating-linear-gradient(45deg, #FFFFFF 0 30px, #111 30px 60px)', transform: `rotate(${-24 * (1 - close)}deg)`, transformOrigin: '0 100%'}} />
			<div style={{width: 520, padding: '22px 0', background: '#111', color: C.white, fontFamily: MONO, fontWeight: 800, fontSize: 72, textAlign: 'center', border: '4px solid #FFFFFF'}}>{text}</div>
		</div>
	);
};

/** Mini-tarjeta de concepto (icono + palabra). */
export const ConceptCard: React.FC<{icon: string; label: string; on?: boolean; size?: number}> = ({icon, label, on = true, size = 1}) => (
	<div style={{width: 230 * size, height: 190 * size, background: on ? 'rgba(0,192,99,0.14)' : 'rgba(20,24,21,0.9)', border: `4px solid ${on ? C.green : C.line2}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 * size, boxShadow: on ? `0 0 30px ${C.green}44` : 'none'}}>
		<div style={{fontSize: 70 * size, fontFamily: MONO, fontWeight: 800, color: C.white}}>{icon}</div>
		<div style={{fontSize: 30 * size, fontFamily: MONO, fontWeight: 800, color: on ? C.green : C.dim}}>{label}</div>
	</div>
);

/** Deslizador GENERAL ←→ DETALLADO con marcas (icono, posición 0–1). `knob` 0–1. */
export const DetailSlider: React.FC<{x: number; y: number; w?: number; knob: number; marks?: {at: number; icon: React.ReactNode; pos: number}[]}> = ({x, y, w = 1100, knob, marks = []}) => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w}}>
			<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.text, marginBottom: 22}}><span>GENERAL</span><span>DETALLADO</span></div>
			<div style={{position: 'relative', height: 14, background: C.line2}}>
				<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${knob * 100}%`, background: C.green}} />
				{marks.map((m, i) => (f >= m.at ? (
					<div key={i} style={{position: 'absolute', left: `${m.pos * 100}%`, top: -120, transform: `translateX(-50%) scale(${pop(f, m.at, 11, 240, 0.6)})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						{m.icon}
						<div style={{width: 4, height: 30, background: C.green, marginTop: 6}} />
					</div>
				) : null))}
				<div style={{position: 'absolute', left: `${knob * 100}%`, top: -16, width: 46, height: 46, transform: 'translateX(-50%)', background: C.white, border: `6px solid ${C.green}`}} />
			</div>
		</div>
	);
};

/** Botón SÍ / NO de la interfaz de decisión. `pressAt`: se hunde y destella. */
export const ChoiceButton: React.FC<{label: string; color: string; pressAt?: number; dim?: boolean}> = ({label, color, pressAt, dim}) => {
	const f = useCurrentFrame();
	const pressed = pressAt !== undefined && f >= pressAt;
	const beat = 1 + 0.04 * Math.sin(f / 5);
	const flash = pressed ? Math.max(0, 1 - (f - pressAt!) / 10) : 0;
	return (
		<div style={{width: 230, height: 110, background: color, opacity: dim ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.bg, transform: `scale(${pressed ? 0.94 : beat}) translateY(${pressed ? 8 : 0}px)`, boxShadow: pressed ? `0 2px 0 rgba(0,0,0,0.4), 0 0 ${40 * flash + 10}px ${color}` : '0 10px 0 rgba(0,0,0,0.4)'}}>{label}</div>
	);
};

/** Signo «?» pixelado que gira (sobre una cabeza). */
export const Question: React.FC<{x: number; y: number; at: number; out?: number; size?: number; color?: string}> = ({x, y, at, out, size = 90, color = C.amber}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 10, 250, 0.6);
	return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${p}) rotateY(${(f - at) * 8}deg)`, fontFamily: MONO, fontWeight: 800, fontSize: size, color, textShadow: `0 0 20px ${color}88`}}>?</div>;
};

/** Texto escrito con cursor de terminal (título, frase central, pantalla final). */
export const TypeLine: React.FC<{text: string; at: number; x: number; y: number; size?: number; color?: string; cps?: number; center?: boolean; weight?: number; font?: string}> = ({text, at, x, y, size = 80, color = C.white, cps = 22, center = true, weight = 800, font = SANS}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const n = Math.min(text.length, Math.floor(((f - at) / 30) * cps));
	const cur = Math.floor(f / 8) % 2 === 0;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: center ? 'translate(-50%, -50%)' : undefined, fontFamily: font, fontWeight: weight, fontSize: size, color, whiteSpace: 'nowrap', letterSpacing: -1}}>
			{text.slice(0, n)}
			<span style={{color: C.green, opacity: cur ? 1 : 0}}>▌</span>
		</div>
	);
};

/** Superposición VHS (pausa / rebobinado). */
export const VHS: React.FC<{on: boolean; label?: string}> = ({on, label}) => {
	const f = useCurrentFrame();
	if (!on) return null;
	return (
		<div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
			<div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 6px)', transform: `translateY(${(f * 7) % 6}px)`}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: ((f * 23) % 1080), height: 40, background: 'rgba(255,255,255,0.08)'}} />
			{label && <div style={{position: 'absolute', left: 80, top: 70, fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.white, textShadow: '3px 0 #E2463E, -3px 0 #5AA9FF'}}>{label}</div>}
		</div>
	);
};

/** Indicador de esquina «CAMINO A: SÍ» / «CAMINO B: NO» / «x2». */
export const CornerTag: React.FC<{text: string; at: number; out?: number; color?: string}> = ({text, at, out, color = C.green}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 12, 240, 0.6);
	return <div style={{position: 'absolute', right: 70, top: 60, transform: `translateX(${(1 - p) * 300}px)`, fontFamily: MONO, fontWeight: 800, fontSize: 36, color, border: `3px solid ${color}`, padding: '8px 18px', background: 'rgba(7,8,7,0.85)'}}>{text}</div>;
};
