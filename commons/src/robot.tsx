import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO} from './theme';
import {pop} from './lib';
import {Buf, PixelSprite} from './pixel';

/**
 * «Bit», el robot ejecutor de las lecciones de lógica (Fase 1): hace exactamente lo que le dicen.
 * Pixel art dibujado por código, del mismo alto que Vee (≈ 38 px lógicos sin la antena).
 *
 *   <Robot x={880} y={940} pose="idle" face="happy" chest="✓" />
 *   <Robot x={880} y={940} reachF={[1110, 640]} holdF={<Cup />} />   // el brazo se estira hasta ese punto
 *
 * `x` = centro, `y` = línea de los pies. El brazo delantero es el del lado al que mira (derecha,
 * o izquierda con `flip`). `reachF` / `reachB` = punto del lienzo (px de pantalla) al que llega la
 * mano: el brazo es telescópico y se estira lo que haga falta (hasta ~60 px lógicos).
 */

export type RobotPose =
	| 'off' | 'idle' | 'walk' | 'reach' | 'hold' | 'pour' | 'stir' | 'squat' | 'stretch' | 'salute' | 'bow' | 'present'
	| 'trophy' | 'spin' | 'dizzy' | 'sit' | 'point' | 'wave' | 'thumb' | 'footstir' | 'shrug' | 'hide';
export type RobotFace = 'happy' | 'wow' | 'conf' | 'nerv' | 'dizzy' | 'blink' | 'off' | 'proud' | 'focus' | 'sad';

const RB = {
	metal: '#C9D3CE', metalD: '#8E9A94', metalL: '#EEF3F0', visor: '#0B0F0D', eye: '#00C063', eyeL: '#7CFFB3',
	joint: '#4A5550', screen: '#0E110F', green: '#00C063', greenD: '#00864A', shoe: '#39423E',
};

/** Lienzo lógico del robot: ancho, alto, centro y línea de los pies. */
const CW = 130;
const CH = 96;
const CX = 65;
const FEET = 94;
/** Largo del brazo en reposo (px lógicos). */
const ARM = 8;

/** Ángulos de los brazos por pose: [delantero, trasero] en grados (0 colgando, 90 hacia afuera, 180 arriba). */
const ARMS: Record<RobotPose, (t: number) => [number, number]> = {
	off: () => [4, 4],
	idle: (t) => [8 + 3 * Math.sin(t / 9), 8 - 3 * Math.sin(t / 9)],
	walk: (t) => [24 * Math.sin(t / 3.2), -24 * Math.sin(t / 3.2)],
	reach: () => [150, 10],
	hold: () => [78, 10],
	pour: () => [112, 10],
	stir: (t) => [72 + 16 * Math.sin(t / 1.8), 10],
	squat: () => [92, 92],
	stretch: (t) => [172 - 34 * Math.abs(Math.sin(t / 7)), 172 - 34 * Math.abs(Math.sin(t / 7))],
	salute: () => [158, 5],
	bow: () => [22, 22],
	present: (t) => [118 + 4 * Math.sin(t / 5), 118 - 4 * Math.sin(t / 5)],
	trophy: (t) => [172 + 4 * Math.sin(t / 4), 172 - 4 * Math.sin(t / 4)],
	spin: (t) => [92 + 22 * Math.sin(t), 92 - 22 * Math.sin(t)],
	dizzy: (t) => [42 + 22 * Math.sin(t / 3), 42 - 22 * Math.sin(t / 3)],
	sit: () => [42, 42],
	point: () => [94, 10],
	wave: (t) => [150 + 22 * Math.sin(t / 2.2), 10],
	thumb: () => [122, 10],
	footstir: (t) => [40 + 10 * Math.sin(t / 3), 60 - 10 * Math.sin(t / 3)],
	shrug: () => [70, 70],
	hide: () => [-28, -28],
};

type Draw = {buf: Buf; front: [number, number]; back: [number, number]; chestY: number};

const drawRobot = (pose: RobotPose, face: RobotFace, t: number, reachF: [number, number] | null, reachB: [number, number] | null, look: [number, number]): Draw => {
	const b = new Buf(CW, CH);
	const squat = pose === 'squat' ? 3 + Math.round(2 * Math.abs(Math.sin(t / 5))) : pose === 'sit' ? 5 : 0;
	const bob = pose === 'idle' || pose === 'hold' || pose === 'present' ? Math.round(Math.sin(t / 11)) : pose === 'walk' ? -Math.round(Math.abs(Math.sin(t / 3.2))) : 0;
	const bow = pose === 'bow' ? 3 : 0;
	const y0 = bob + squat;
	// piernas
	const leg = (x: number, lift: number, dx = 0) => {
		b.rect(x + dx, FEET - 9 + y0 - lift, 3, Math.max(2, 7 - squat), RB.joint);
		b.rect(x - 1 + dx, FEET - 2 - lift, 5, 2, RB.shoe);
	};
	if (pose === 'sit') {
		b.rect(CX - 6, FEET - 4, 12, 2, RB.joint);
		b.rect(CX - 9, FEET - 2, 4, 2, RB.shoe);
		b.rect(CX + 5, FEET - 2, 4, 2, RB.shoe);
	} else if (pose === 'footstir') {
		leg(CX - 5, 0);
		leg(CX + 2, 1, Math.round(3 + 3 * Math.sin(t / 2)));
	} else {
		const s = pose === 'walk' ? Math.sin(t / 3.2) : 0;
		leg(CX - 5, Math.round(Math.max(0, s) * 2), pose === 'walk' ? Math.round(s) : 0);
		leg(CX + 2, Math.round(Math.max(0, -s) * 2), pose === 'walk' ? -Math.round(s) : 0);
	}
	// cuerpo
	const by = FEET - 21 + y0;
	b.rect(CX - 7, by, 14, 12, RB.metal);
	b.rect(CX + 5, by, 2, 12, RB.metalD);
	b.rect(CX - 7, by, 14, 1, RB.metalL);
	b.rect(CX - 5, by + 2, 9, 7, RB.screen); // pantalla del pecho
	b.rect(CX - 5, by + 2, 9, 1, RB.greenD);
	b.rect(CX - 4, by + 9, 1, 2, RB.green); // guiño Goslint: «L» verde
	b.rect(CX - 4, by + 10, 2, 1, RB.green);
	b.rect(CX + 1, by + 10, 3, 1, RB.metalD); // rejilla
	// cabeza
	const hy = FEET - 35 + y0 + bow;
	const hx = CX + (bow ? 1 : 0);
	b.rect(hx - 8, hy, 16, 13, RB.metal);
	b.rect(hx + 6, hy, 2, 13, RB.metalD);
	b.rect(hx - 8, hy, 16, 1, RB.metalL);
	b.rect(hx - 9, hy + 4, 1, 5, RB.metalD); // orejas
	b.rect(hx + 8, hy + 4, 1, 5, RB.metalD);
	b.rect(hx - 6, hy + 2, 12, 8, RB.visor);
	// antena
	b.rect(hx, hy - 4, 1, 4, RB.metalD);
	b.rect(hx - 1, hy - 6, 3, 2, Math.floor(t / 15) % 2 ? RB.eyeL : RB.green);
	// cara: ojos en el visor (se desplazan con `look`)
	const ex = hx - 4 + look[0];
	const ey = hy + 4 + look[1];
	const eye = (x: number, y: number, kind: RobotFace) => {
		if (kind === 'off') return;
		if (kind === 'blink' || ((kind === 'happy' || kind === 'focus') && t % 96 < 4)) b.rect(x, y + 1, 2, 1, RB.eye);
		else if (kind === 'happy' || kind === 'proud') {
			b.set(x, y + 1, RB.eye); b.set(x + 1, y, RB.eye); b.set(x + 2, y + 1, RB.eye);
		} else if (kind === 'wow') b.rect(x, y - 1, 3, 3, RB.eye);
		else if (kind === 'dizzy') {
			b.set(x, y, RB.eye); b.set(x + 2, y, RB.eye); b.set(x + 1, y + 1, RB.eye); b.set(x, y + 2, RB.eye); b.set(x + 2, y + 2, RB.eye);
		} else if (kind === 'focus') b.rect(x, y + 1, 3, 1, RB.eye);
		else if (kind === 'sad') {
			b.set(x, y, RB.eye); b.set(x + 1, y + 1, RB.eye); b.set(x + 2, y, RB.eye);
		} else b.rect(x, y, 2, 2, RB.eye); // conf / nerv
	};
	eye(ex, ey, face);
	eye(ex + 6, ey, face === 'conf' ? 'wow' : face);
	if (face === 'proud' || face === 'happy') b.rect(hx - 2, hy + 8, 4, 1, RB.eye);
	if (face === 'nerv') {
		b.set(hx - 2, hy + 8, RB.eye); b.set(hx - 1, hy + 7, RB.eye); b.set(hx, hy + 8, RB.eye); b.set(hx + 1, hy + 7, RB.eye);
		b.set(hx + 6, hy + 1 + (Math.floor(t / 4) % 3), '#7FB8FF'); // gota de sudor
	}
	if (face === 'wow') b.rect(hx - 1, hy + 7, 2, 2, RB.eye);
	if (face === 'sad') b.rect(hx - 2, hy + 8, 4, 1, RB.eye);
	// brazos (el trasero primero, para que el delantero quede encima)
	const [aF, aB] = ARMS[pose](t);
	const arm = (sx: number, sy: number, deg: number, dir: number, target: [number, number] | null): [number, number] => {
		let hx2: number;
		let hy2: number;
		if (target) {
			hx2 = Math.max(2, Math.min(CW - 3, target[0]));
			hy2 = Math.max(2, Math.min(CH - 3, target[1]));
		} else {
			const r = (deg * Math.PI) / 180;
			hx2 = sx + dir * Math.sin(r) * ARM;
			hy2 = sy + Math.cos(r) * ARM;
		}
		b.line(sx, sy, hx2, hy2, RB.metalD, 2);
		if (target) b.line(sx, sy, sx + (hx2 - sx) * 0.4, sy + (hy2 - sy) * 0.4, RB.metal, 2); // tramo telescópico
		b.rect(Math.round(hx2) - 1, Math.round(hy2) - 1, 3, 3, RB.joint);
		return [hx2, hy2];
	};
	const back = arm(CX - 8, by + 1, aB, -1, reachB);
	const front = arm(CX + 7, by + 1, aF, 1, reachF);
	return {buf: b, front, back, chestY: by + 2};
};

/** Punto de pantalla del hombro (delantero o trasero) del robot colocado en (x, y). */
export const robotShoulder = (x: number, y: number, side: 'F' | 'B' = 'F', scale = 11, flip = false): [number, number] => {
	const dx = (side === 'F' ? 7 : -8) * scale * (flip ? -1 : 1);
	return [x + dx, y - 20 * scale];
};
/** Punto de pantalla de la mano en reposo (brazo colgando): sirve de origen para animar `reachF`. */
export const robotRest = (x: number, y: number, side: 'F' | 'B' = 'F', scale = 11, flip = false): [number, number] => {
	const [sx, sy] = robotShoulder(x, y, side, scale, flip);
	return [sx, sy + ARM * scale];
};
/** Interpola dos puntos (para mover la mano del robot de un sitio a otro). */
export const lerpPt = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

export const Robot: React.FC<{
	x: number;
	y: number;
	scale?: number;
	pose?: RobotPose;
	face?: RobotFace;
	flip?: boolean;
	/** fotograma de entrada (aparece con rebote) y de salida */
	at?: number;
	out?: number;
	/** lo que lleva en la mano delantera / trasera */
	holdF?: React.ReactNode;
	holdB?: React.ReactNode;
	/** punto de pantalla [x, y] al que llega la mano delantera / trasera (brazo telescópico) */
	reachF?: [number, number] | null;
	reachB?: [number, number] | null;
	/** glifo corto de la pantalla del pecho (✓, ?, ∞, 2, ^_^) */
	chest?: string;
	chestColor?: string;
	/** dirección de la mirada: [-1|0|1, -1|0|1] */
	look?: [number, number];
	/** > 0: gira como un trompo (radianes por fotograma) */
	spin?: number;
	tilt?: number;
	opacity?: number;
	/** reloj de la animación; por defecto el fotograma actual (pasa f * 2 para cámara rápida) */
	time?: number;
	/** fotogramas en los que da un saltito */
	hops?: number[];
}> = ({x, y, scale = 11, pose = 'idle', face = 'happy', flip, at, out, holdF, holdB, reachF = null, reachB = null, chest, chestColor = C.green, look = [0, 0], spin = 0, tilt = 0, opacity = 1, time, hops = []}) => {
	const f = useCurrentFrame();
	if (at !== undefined && f < at) return null;
	if (out !== undefined && f >= out) return null;
	const t = time ?? f;
	const p = at !== undefined ? pop(f, at, 12, 220, 0.6) : 1;
	const fl = flip ? -1 : 1;
	const toCanvas = (pt: [number, number] | null): [number, number] | null => (pt ? [CX + ((pt[0] - x) / scale) * fl, FEET + (pt[1] - y) / scale] : null);
	const {buf, front, back, chestY} = drawRobot(pose, face, t, toCanvas(reachF), toCanvas(reachB), look);
	const w = CW * scale;
	const h = CH * scale;
	const sx = spin ? Math.cos(t * spin) : 1;
	let jump = 0;
	for (const hp of hops) {
		const k = (f - hp) / 12;
		if (k > 0 && k < 1) jump += Math.sin(k * Math.PI) * 5 * scale;
	}
	const place = (pt: [number, number], node: React.ReactNode) =>
		node ? <div style={{position: 'absolute', left: pt[0] * scale, top: pt[1] * scale, transform: `translate(-50%, -50%) scaleX(${fl})`}}>{node}</div> : null;
	return (
		<div
			style={{
				position: 'absolute', left: x - CX * scale, top: y - FEET * scale - jump, width: w, height: h, opacity: opacity * Math.min(1, p * 2), pointerEvents: 'none',
				transform: `scaleX(${fl * sx}) rotate(${tilt}deg) scale(${0.7 + 0.3 * p})`, transformOrigin: `${(CX / CW) * 100}% ${(FEET / CH) * 100}%`,
				filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.5))',
			}}
		>
			{place(back, holdB)}
			<PixelSprite buf={buf} scale={scale} />
			{chest && (
				<div
					style={{
						position: 'absolute', left: (CX - 5) * scale, top: chestY * scale, width: 9 * scale, height: 7 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center',
						fontFamily: MONO, fontWeight: 800, color: chestColor, fontSize: (chest.length > 2 ? 2.6 : chest.length > 1 ? 3.6 : 5) * scale, transform: `scaleX(${fl})`, textShadow: `0 0 8px ${chestColor}`,
					}}
				>
					{chest}
				</div>
			)}
			{place(front, holdF)}
		</div>
	);
};
