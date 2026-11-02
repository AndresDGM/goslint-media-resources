import React from 'react';
import {Buf, Light, PixelSprite, PixelText, relight} from './pixel';
import {clamp, inOutCubic, outCubic, rnd} from './lib';
import {interpolate} from 'remotion';

/**
 * LINT — mascota pixel art de Goslint.
 *
 * Rasgos tomados del logotipo real (y solo de él): cabeza en hexágono de punta hacia arriba con
 * contorno blanco, la abertura de la «G» arriba a la derecha con su barra interior, y la «L» verde
 * recorriendo el lado izquierdo de la cara. Paleta: negro, blanco y el verde #00C063 de la marca.
 * El cuerpo es un pequeño terminal con la «L» en el pecho. El machete usa acero y un mango ámbar
 * (el ámbar ya existe en el sistema v1 como color de veredicto).
 *
 * No hay hojas de sprites: la mascota se dibuja por código en un lienzo lógico de 72×64 px a
 * partir de una pose (ángulos de brazos, machete, ojos, boca, piernas), así que todas las
 * animaciones son deterministas y mantienen proporciones, silueta y paleta constantes.
 */

export const PAL = {
	white: '#FFFFFF',
	shade: '#B4C0B8',
	dark: '#0C120E',
	face: '#0A0F0C',
	green: '#00C063',
	greenD: '#00864A',
	steel: '#DCE6E0',
	steelD: '#7F8D86',
	wood: '#FFB547',
	woodD: '#A8691A',
	smear: '#EAFBF2',
};

export type Eyes = 'open' | 'blink' | 'wide' | 'happy' | 'squint';

export type Pose = {
	/** brazo delantero: 0 = colgando, 90 = al frente, 180 = arriba */
	armF: number;
	/** brazo trasero: 0 = colgando, 90 = hacia atrás, 180 = arriba */
	armB: number;
	/** ángulo de la hoja del machete (misma convención que armF) o null si está guardado */
	machete: number | null;
	eyes: Eyes;
	/** 0 cerrada · 1 entreabierta · 2 abierta · 3 sonrisa · 4 «o» de sorpresa */
	mouth: number;
	/** desplazamiento de la mirada en px lógicos (positivo = hacia donde mira el cuerpo) */
	look: number;
	headDy: number;
	headDx: number;
	bodyDy: number;
	/** 0 de pie · 1–4 fotogramas del ciclo de caminar */
	legs: number;
	/** estela del machetazo entre dos ángulos */
	smear: [number, number] | null;
};

export const BASE: Pose = {armF: 8, armB: 8, machete: null, eyes: 'open', mouth: 0, look: 0, headDy: 0, headDx: 0, bodyDy: 0, legs: 0, smear: null};

export const SW = 72;
export const SH = 64;
export const OX = 36;
export const OY = 50;
const ARM = 6;

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Polígono en coordenadas locales (u a lo largo de `d`, v perpendicular) con color por píxel. */
const localPoly = (b: Buf, ox: number, oy: number, dx: number, dy: number, nx: number, ny: number, pts: [number, number][], color: (u: number, v: number) => string) => {
	const world = pts.map(([u, v]) => [ox + u * dx + v * nx, oy + u * dy + v * ny] as [number, number]);
	b.poly(world, (x, y) => {
		const rx = x + 0.5 - ox;
		const ry = y + 0.5 - oy;
		return color(rx * dx + ry * dy, rx * nx + ry * ny);
	});
};

export const drawLint = (p: Pose, facing: 1 | -1 = 1): Buf => {
	const b = new Buf(SW, SH);
	const F = facing;
	const by = OY + Math.round(p.bodyDy);
	const hx = OX + Math.round(p.headDx) * F;
	const hy = by - 22 + Math.round(p.headDy);

	const shoulderF: [number, number] = [OX + 5 * F, by - 10];
	const shoulderB: [number, number] = [OX - 5 * F, by - 10];
	const handOf = (s: [number, number], a: number, dir: number): [number, number] => [s[0] + Math.sin(rad(a)) * ARM * dir, s[1] + Math.cos(rad(a)) * ARM];
	const handF = handOf(shoulderF, p.armF, F);
	const handB = handOf(shoulderB, p.armB, -F);
	const arm = (s: [number, number], h: [number, number]) => {
		b.line(s[0] - 0.5, s[1] - 0.5, h[0] - 0.5, h[1] - 0.5, PAL.white, 2);
		b.rect(Math.round(h[0] - 1), Math.round(h[1] - 1), 2, 2, PAL.green);
	};

	// --- brazo trasero (queda detrás del cuerpo)
	arm(shoulderB, handB);

	// --- piernas y pies
	const leg = (side: -1 | 1, lift: number, shift: number) => {
		const x = OX + (side === -1 ? -4 : 2) + shift * F;
		b.rect(x, OY - 4 - lift, 2, 3, PAL.shade);
		b.rect(F === 1 ? x : x - 1, OY - 1 - lift, 3, 1, PAL.white);
	};
	const cycle = [
		[0, 0, 0, 0],
		[1, 1, 0, -1],
		[0, 0, 0, 0],
		[0, -1, 1, 1],
		[0, 0, 0, 0],
	][Math.max(0, Math.min(4, Math.round(p.legs)))];
	leg(-1, cycle[0], cycle[1]);
	leg(1, cycle[2], cycle[3]);

	// --- cuerpo: pequeño terminal con la «L» verde
	b.rect(OX - 4, by - 12, 8, 9, PAL.white);
	b.rect(OX - 5, by - 11, 10, 7, PAL.white);
	b.rect(OX - 4, by - 11, 8, 7, PAL.dark);
	b.rect(OX - 2, by - 9, 1, 3, PAL.green);
	b.rect(OX - 1, by - 7, 2, 1, PAL.green);
	b.rect(OX + 2, by - 9, 1, 1, PAL.shade);

	// --- cabeza: hexágono de punta hacia arriba (como el logotipo)
	const hex = (R: number): [number, number][] => Array.from({length: 6}, (_, i) => [hx + 0.5 + Math.cos(rad(60 * i - 90)) * R, hy + 0.5 + Math.sin(rad(60 * i - 90)) * R] as [number, number]);
	b.poly(hex(11.6), PAL.white);
	b.poly(hex(9.1), PAL.face);
	// abertura de la «G» (arriba a la derecha) y su barra interior
	for (let y = hy - 5; y <= hy; y++) for (let x = hx + 6; x <= hx + 11; x++) if (b.get(x, y) === PAL.white) b.set(x, y, PAL.face);
	b.rect(hx + 5, hy + 1, 5, 2, PAL.white);
	// «L» verde del logotipo sobre el lado izquierdo de la cara
	b.rect(hx - 6, hy - 4, 2, 8, PAL.green);
	b.line(hx - 6, hy + 4, hx - 1, hy + 7, PAL.green, 2);
	b.set(hx - 6, hy + 5, PAL.face);

	// ojos
	const lk = Math.round(p.look) * F;
	const eye = (ex: number) => {
		const x = hx + ex + lk;
		switch (p.eyes) {
			case 'blink':
				b.rect(x, hy - 2, 2, 1, PAL.white);
				break;
			case 'wide':
				b.rect(x, hy - 4, 2, 4, PAL.white);
				break;
			case 'happy':
				b.rect(x, hy - 3, 2, 1, PAL.white);
				b.set(x - 1, hy - 2, PAL.white);
				b.set(x + 2, hy - 2, PAL.white);
				break;
			case 'squint':
				b.rect(x, hy - 2, 2, 2, PAL.white);
				break;
			default:
				b.rect(x, hy - 3, 2, 3, PAL.white);
		}
	};
	eye(-2);
	eye(2);
	// boca
	const mx = hx - 1 + lk;
	const my = hy + 3;
	switch (Math.round(p.mouth)) {
		case 1:
			b.rect(mx + 1, my, 2, 2, PAL.white);
			break;
		case 2:
			b.rect(mx, my, 4, 2, PAL.white);
			b.rect(mx + 1, my + 1, 2, 1, PAL.greenD);
			break;
		case 3:
			b.set(mx, my, PAL.white);
			b.set(mx + 3, my, PAL.white);
			b.rect(mx + 1, my + 1, 2, 1, PAL.white);
			break;
		case 4:
			b.rect(mx + 1, my - 1, 2, 3, PAL.white);
			break;
		default:
			b.rect(mx + 1, my, 2, 1, PAL.white);
	}

	// --- estela y machete (delante de todo)
	if (p.smear) {
		const [a0, a1] = p.smear;
		const lo = Math.min(a0, a1);
		const hi = Math.max(a0, a1);
		for (let y = 0; y < SH; y++)
			for (let x = 0; x < SW; x++) {
				const rx = (x + 0.5 - handF[0]) * F;
				const ry = y + 0.5 - handF[1];
				const r = Math.hypot(rx, ry);
				if (r < 8 || r > 20) continue;
				let ang = (Math.atan2(rx, ry) * 180) / Math.PI; // 0 = abajo, 90 = al frente
				if (ang < lo - 180) ang += 360;
				if (ang < -60 && hi > 180) ang += 360;
				if (ang < lo || ang > hi) continue;
				const t = (ang - lo) / Math.max(1, hi - lo); // 0 = extremo más avanzado del golpe
				if (r > 13 + t * 7) continue; // la estela se afila hacia atrás
				if (!b.get(x, y)) b.set(x, y, t < 0.45 ? PAL.smear : PAL.green);
			}
	}
	if (p.machete !== null) {
		const m = rad(p.machete);
		const dx = Math.sin(m) * F;
		const dy = Math.cos(m);
		const nx = -dy * F * F * F; // normal (lado del filo), ya orientada según F
		const ny = dx * F;
		const hox = handF[0];
		const hoy = handF[1];
		localPoly(b, hox, hoy, dx, dy, nx, ny, [[-3.6, -1.2], [0.2, -1.2], [0.2, 1.2], [-3.6, 1.2]], (u) => (u < -2.4 ? PAL.woodD : PAL.wood));
		localPoly(b, hox, hoy, dx, dy, nx, ny, [[0.2, -2.4], [1.7, -2.4], [1.7, 2.8], [0.2, 2.8]], () => PAL.steelD);
		// hoja de machete: lomo recto, panza que se ensancha y punta en sesgo
		localPoly(b, hox, hoy, dx, dy, nx, ny, [[1.7, -1.6], [13.5, -2.3], [19, -0.4], [17.6, 4.6], [10, 3.4], [1.7, 1.7]], (u, v) => (v > 1.6 + (u > 9 ? 1.2 : 0) ? PAL.white : v < -0.9 ? PAL.steelD : PAL.steel));
	}
	// --- brazo delantero
	arm(shoulderF, handF);
	return b;
};

/* ------------------------------------------------------------------ poses y animación */

const num = (a: number, b: number, t: number) => a + (b - a) * t;

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
	armF: num(a.armF, b.armF, t),
	armB: num(a.armB, b.armB, t),
	machete: b.machete === null ? (t >= 0.5 ? null : a.machete) : a.machete === null ? (t >= 0.5 ? b.machete : null) : num(a.machete, b.machete, t),
	eyes: t >= 0.5 ? b.eyes : a.eyes,
	mouth: t >= 0.5 ? b.mouth : a.mouth,
	look: num(a.look, b.look, t),
	headDy: num(a.headDy, b.headDy, t),
	headDx: num(a.headDx, b.headDx, t),
	bodyDy: num(a.bodyDy, b.bodyDy, t),
	legs: t >= 0.5 ? b.legs : a.legs,
	smear: t >= 0.5 ? b.smear : a.smear,
});

export type Key = {at: number; pose: Partial<Pose>; in?: number};

/** Pista de poses: cada clave arranca en `at` y llega a su pose en `in` fotogramas. */
export const poseTrack = (f: number, keys: Key[]): Pose => {
	let prev: Pose = BASE;
	let cur: Pose = BASE;
	let t = 1;
	for (const k of keys) {
		if (f < k.at) break;
		prev = lerpPose(prev, cur, t);
		cur = {...BASE, ...k.pose};
		const d = k.in ?? 6;
		t = d <= 0 ? 1 : inOutCubic(Math.min(1, (f - k.at) / d));
	}
	return lerpPose(prev, cur, t);
};

/** Poses con nombre (parciales sobre BASE). */
export const POSES = {
	idle: {},
	point: {armF: 96, look: 1},
	pointUp: {armF: 126, look: 1, headDy: -1},
	pointDown: {armF: 52, look: 1, headDy: 1},
	pointBack: {armB: 96, look: -1},
	think: {armF: 118, armB: 20, eyes: 'squint' as Eyes, look: -1, headDx: -1},
	shrug: {armF: 80, armB: 80, eyes: 'open' as Eyes, mouth: 1, headDy: 1},
	cheer: {armF: 122, armB: 122, eyes: 'happy' as Eyes, mouth: 3, headDy: -1},
	wave: {armF: 124, eyes: 'happy' as Eyes, mouth: 3},
	wow: {armF: 40, armB: 40, eyes: 'wide' as Eyes, mouth: 4, headDy: -1},
	tired: {armF: 0, armB: 0, eyes: 'squint' as Eyes, mouth: 1, headDy: 2, bodyDy: 1},
	oops: {armF: 118, armB: 118, eyes: 'wide' as Eyes, mouth: 4, headDx: -1},
	carry: {armF: 28, machete: 168},
	aim: {armF: 96, machete: 96, look: 1},
} satisfies Record<string, Partial<Pose>>;

/** Ciclo de caminar (4 fotogramas, cada uno dura 4 fotogramas de video). */
export const walk = (f: number, carrying = false): Partial<Pose> => {
	const k = Math.floor(f / 4) % 4;
	const sw = [22, 0, -22, 0][k];
	return {legs: k + 1, bodyDy: k % 2 === 0 ? -1 : 0, armF: carrying ? 28 : 8 + sw, armB: 8 + sw, machete: carrying ? 168 : null, look: 1};
};

/**
 * Machetazo completo relativo al fotograma de impacto `t0`:
 * desenvaina → anticipación (se agacha y carga atrás) → tres fotogramas de bajada con estela →
 * impacto (queda clavado) → recuperación. Devuelve null fuera de la ventana.
 */
export const chop = (f: number, t0: number, alreadyOut = false): Partial<Pose> | null => {
	const t = f - t0;
	if (t < -30 || t > 22) return null;
	const carry: Partial<Pose> = POSES.carry;
	const ready: Partial<Pose> = {armF: 122, machete: 150, eyes: 'squint', mouth: 3, look: 1};
	const back: Partial<Pose> = {armF: 205, armB: 60, machete: 238, eyes: 'wide', mouth: 2, look: 1, bodyDy: 1, headDx: -1, headDy: 1};
	const hit: Partial<Pose> = {armF: 52, armB: 70, machete: 14, eyes: 'squint', mouth: 2, look: 1, bodyDy: 1, headDx: 1, headDy: 1};
	const full = (x: Partial<Pose>): Pose => ({...BASE, ...x});
	if (t < -18) {
		// desenvaina: el machete aparece girando desde la espalda
		const k = outCubic(Math.min(1, (t + 30) / 9));
		return alreadyOut ? lerpPose(full(carry), full(ready), k) : {...lerpPose(full({armF: 60, machete: 250}), full(ready), k), machete: num(250, 150, k)};
	}
	if (t < -3) return lerpPose(full(ready), full(back), inOutCubic(Math.min(1, (t + 18) / 9)));
	if (t === -3) return back;
	if (t === -2) return {...back, armF: 160, machete: 165, smear: [165, 238], bodyDy: 0, headDx: 0, headDy: 0};
	if (t === -1) return {...hit, armF: 105, machete: 82, smear: [82, 185], bodyDy: 0};
	if (t <= 1) return {...hit, smear: [14, 110]};
	if (t <= 2) return {...hit, smear: [14, 48]};
	if (t <= 8) return hit;
	return lerpPose(full(hit), full({...carry, eyes: 'happy', mouth: 3}), outCubic(Math.min(1, (t - 8) / 10)));
};

/** Movimientos «vivos» que se suman a cualquier pose: parpadeo, respiración y boca al hablar. */
export const alive = (p: Pose, f: number, talk = 0, seed = 0): Pose => {
	const q = {...p};
	const cyc = (f + seed * 37) % 96;
	if (q.eyes === 'open' && (cyc === 60 || cyc === 61 || cyc === 62)) q.eyes = 'blink';
	if (q.legs === 0 && Math.floor((f + seed * 11) / 22) % 2 === 1) q.headDy += 1;
	if (talk > 0 && (q.mouth === 0 || q.mouth === 1)) q.mouth = talk >= 2 ? 2 : 1;
	return q;
};

/* ------------------------------------------------------------------ componentes */

export const Lint: React.FC<{
	/** posición de los pies (centro) en píxeles de pantalla */
	x: number;
	y: number;
	scale?: number;
	pose: Pose;
	facing?: 1 | -1;
	light?: Light | null;
	opacity?: number;
}> = ({x, y, scale = 7, pose, facing = 1, light = null, opacity = 1}) => {
	const buf = relight(drawLint(pose, facing), light);
	return (
		<div style={{position: 'absolute', left: Math.round(x - OX * scale), top: Math.round(y - OY * scale), opacity, pointerEvents: 'none'}}>
			<PixelSprite buf={buf} scale={scale} />
		</div>
	);
};

/** Globo de emoción en pixel art sobre la cabeza («?», «!», «...»). */
export const Emote: React.FC<{x: number; y: number; scale?: number; text: string; f: number; at: number; dur?: number; color?: string}> = ({x, y, scale = 6, text, f, at, dur = 40, color = '#FFFFFF'}) => {
	const k = f - at;
	if (k < 0 || k > dur) return null;
	const rise = Math.min(1, k / 5);
	const out = interpolate(k, [dur - 5, dur], [1, 0], clamp);
	const bob = Math.round(Math.sin(k / 5) * 1) * scale * 0.5;
	return (
		<div style={{position: 'absolute', left: x, top: y - 14 * scale * rise + bob, transform: 'translateX(-50%)', opacity: out}}>
			<div style={{background: '#0A0F0C', border: `${scale}px solid ${color}`, padding: `${scale}px ${scale * 1.5}px`, boxShadow: `${scale}px ${scale}px 0 rgba(0,0,0,0.6)`}}>
				<PixelText text={text} scale={scale} color={color} bold />
			</div>
		</div>
	);
};

/** Desplazamiento en X con paradas: cada tramo va de la posición anterior a `x` entre `from` y `to`. */
export type Stop = {from: number; to: number; x: number};
export const walkTo = (f: number, x0: number, stops: Stop[]) => {
	let x = x0;
	let walking = false;
	let dir: 1 | -1 | 0 = 0;
	for (const s of stops) {
		if (f >= s.to) {
			x = s.x;
			continue;
		}
		if (f >= s.from) {
			const t = (f - s.from) / Math.max(1, s.to - s.from);
			dir = s.x > x ? 1 : s.x < x ? -1 : 0;
			walking = dir !== 0;
			x = x + (s.x - x) * t;
		}
		break;
	}
	return {x, walking, dir};
};

/** Salto parabólico (devuelve cuánto sube, en px) entre `at` y `at + dur`. */
export const hop = (f: number, at: number, dur = 12, height = 40) => {
	const t = (f - at) / dur;
	if (t <= 0 || t >= 1) return 0;
	return Math.round((4 * t * (1 - t) * height) / 4) * 4;
};

export const jitter = (f: number, seed: number, amp: number) => (rnd(f * 3.1 + seed) - 0.5) * 2 * amp;
