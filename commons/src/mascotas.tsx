import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {pop, tween} from './lib';
import SIZES from './mascotas-sizes.json';
import CLIPS_JSON from './mascotas-clips.json';

/**
 * Las otras mascotas del universo Goslint (sprites 1x exportados del kit de la rama `mascotas`,
 * en public/mascotas/<id>_<pose>.png). Lint se dibuja aparte con `@commons/mascot`.
 *
 *   <Mascota id="velasco" pose="wave" x={1200} y={900} scale={9} at={M('s03o', 'grafos')} talk={talkLevel(f)} />
 */
export type MascotaId = 'vee' | 'parserint' | 'mocca' | 'pypo' | 'byte' | 'polo' | 'marco' | 'ringo' | 'velasco' | 'daru' | 'diego' | 'globin';
export type MascotaPose = 'idle' | 'wave' | 'point' | 'cheer' | 'think';

/** Nombre visible y rol (según la tabla de guías acordada para el roadmap). */
export const MASCOTAS: Record<MascotaId, {name: string; role: string; color: string}> = {
	vee: {name: 'Vee', role: 'guía · lógica', color: '#4F8BE8'},
	parserint: {name: 'ParserInt', role: 'especialista · C++', color: '#00C063'},
	mocca: {name: 'Mocca', role: 'Java · POO', color: '#F2B04A'},
	pypo: {name: 'Pypo', role: 'Python', color: '#4CD04C'},
	byte: {name: 'Byte', role: 'Python', color: '#F2C230'},
	polo: {name: 'Polo', role: 'estructuras', color: '#D6D6D6'},
	marco: {name: 'Marco', role: 'competitiva I', color: '#3E73D8'},
	ringo: {name: 'Ringo', role: 'competitiva I', color: '#C98B52'},
	velasco: {name: 'Velasco', role: 'competitiva II', color: '#9C8FD8'},
	daru: {name: 'DaRu', role: 'competitiva III', color: '#7CFFB3'},
	diego: {name: 'Diego', role: 'coach · modo maratón', color: '#E2463E'},
	globin: {name: 'Globín', role: 'modo maratón', color: '#E0362C'},
};

const SZ = SIZES as unknown as Record<string, [number, number]>;

/** Sprite fijo disponible para la pose (Vee y Marco solo tienen reposo); se usa si una mascota no tiene clips. */
export const spriteOf = (id: MascotaId, pose: MascotaPose = 'idle') => (SZ[`${id}_${pose}`] ? `${id}_${pose}` : `${id}_idle`);

type Clip = {w: number; h: number; n: number; ms: number[]; ax: number; ay: number; loop: boolean; etiquetas?: string[]};
const CLIPS = CLIPS_JSON as unknown as Record<string, Record<string, Clip>>;

/** Clip que dispara cada pose al entrar la mascota (después vuelve al reposo). */
const ACCION: Partial<Record<MascotaPose, string>> = {wave: 'saludar', cheer: 'celebrar', point: 'senalar', think: 'pensar'};

/** Fotograma del clip a `t` fotogramas de video (30 fps) de su inicio; null si ya terminó (y no es bucle). */
const clipIndex = (c: Clip, t: number): number | null => {
	const total = c.ms.reduce((a, b) => a + b, 0);
	let ms = (Math.max(0, t) / 30) * 1000;
	if (ms >= total) {
		if (!c.loop) return null;
		ms %= total;
	}
	for (let i = 0; i < c.n; i++) {
		ms -= c.ms[i];
		if (ms < 0) return i;
	}
	return c.n - 1;
};

/** Un fotograma de una tira de clip, con los pies en (x, y). */
const ClipFrame: React.FC<{id: MascotaId; name: string; i: number; x: number; y: number; scale: number; flip?: boolean; style?: React.CSSProperties}> = ({id, name, i, x, y, scale, flip, style}) => {
	const c = CLIPS[id][name];
	return (
		<div style={{position: 'absolute', left: Math.round(x - (flip ? c.w - c.ax : c.ax) * scale), top: Math.round(y - c.ay * scale), width: c.w * scale, height: c.h * scale, overflow: 'hidden', pointerEvents: 'none', ...style}}>
			<div style={{position: 'absolute', inset: 0, transform: flip ? 'scaleX(-1)' : undefined}}>
				<Img
					src={staticFile(`mascotas/clips/${id}/${name}.png`)}
					style={{position: 'absolute', left: -i * c.w * scale, top: 0, width: c.w * c.n * scale, height: c.h * scale, imageRendering: 'pixelated', maxWidth: 'none'}}
				/>
			</div>
		</div>
	);
};

/**
 * Una mascota animada con sus clips (commons/public/mascotas/clips, de commons/scripts/import_clips.py):
 * reposo en bucle; al entrar (`at`) hace la acción de su `pose` (saludar, celebrar, señalar, pensar);
 * mientras habla (`speaking`), la boca sigue la voz con el clip `bocas` (`talk` 0–3 = volumen).
 * `clip` + `clipAt` fuerzan un clip concreto (p. ej. 'especial' o el gag).
 */
export const Mascota: React.FC<{
	id: MascotaId;
	pose?: MascotaPose;
	/** centro horizontal */
	x: number;
	/** línea de los pies */
	y: number;
	scale?: number;
	/** fotograma de entrada (cae con rebote); sin él, está desde el principio */
	at?: number;
	/** fotograma de salida (se desvanece) */
	out?: number;
	/** nivel de voz 0–3 */
	talk?: number;
	/** está en su locución (aunque haya un silencio): usa las bocas; por defecto, talk > 0 */
	speaking?: boolean;
	clip?: string;
	clipAt?: number;
	flip?: boolean;
	opacity?: number;
}> = ({id, pose = 'idle', x, y, scale = 8, at, out, talk = 0, speaking, clip, clipAt, flip, opacity = 1}) => {
	const f = useCurrentFrame();
	if (at !== undefined && f < at - 1) return null;
	if (out !== undefined && f >= out) return null;
	const p = at !== undefined ? pop(f, at, 11, 220, 0.6) : 1;
	const o = out !== undefined ? 1 - tween(f, out - 8, out) : 1;
	const style: React.CSSProperties = {
		transform: `scale(${0.6 + 0.4 * p}) translateY(${-(1 - p) * 160}px)`,
		transformOrigin: '50% 100%',
		opacity: Math.min(1, p * 2) * o * opacity,
		filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.55))',
	};
	const set = CLIPS[id];
	if (set) {
		const t0 = at ?? 0;
		let name = 'reposo';
		let i: number | null = clipIndex(set.reposo, f - t0);
		const forced = clip && set[clip] ? clipIndex(set[clip], f - (clipAt ?? t0)) : null;
		const accion = ACCION[pose] && set[ACCION[pose]!] ? clipIndex(set[ACCION[pose]!], f - t0) : null;
		if (speaking ?? talk > 0) {
			name = 'bocas';
			const lab = talk <= 0 ? 'cerrada' : talk === 1 ? 'media' : 'abierta';
			i = Math.max(0, (set.bocas.etiquetas ?? []).indexOf(lab));
		} else if (forced !== null && clip) {
			name = clip;
			i = forced;
		} else if (accion !== null) {
			name = ACCION[pose]!;
			i = accion;
		}
		return <ClipFrame id={id} name={name} i={i ?? 0} x={x} y={y} scale={scale} flip={flip} style={style} />;
	}
	// sin clips: sprite fijo de la pose
	const key = spriteOf(id, pose);
	const [w, h] = SZ[key];
	return (
		<Img
			src={staticFile(`mascotas/${key}.png`)}
			style={{position: 'absolute', left: Math.round(x - (w * scale) / 2), top: Math.round(y - h * scale), width: w * scale, height: h * scale, imageRendering: 'pixelated', pointerEvents: 'none', ...style, transform: `${flip ? 'scaleX(-1) ' : ''}${style.transform}`}}
		/>
	);
};
