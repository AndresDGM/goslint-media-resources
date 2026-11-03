import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {pop, tween} from './lib';
import SIZES from './mascotas-sizes.json';

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

/** Archivo disponible para la pose (Vee y Marco solo tienen reposo). */
export const spriteOf = (id: MascotaId, pose: MascotaPose = 'idle') => (SZ[`${id}_${pose}`] ? `${id}_${pose}` : `${id}_idle`);

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
	/** nivel de voz 0–3: la mascota «rebota» al hablar */
	talk?: number;
	flip?: boolean;
	opacity?: number;
}> = ({id, pose = 'idle', x, y, scale = 8, at, out, talk = 0, flip, opacity = 1}) => {
	const f = useCurrentFrame();
	if (at !== undefined && f < at - 1) return null;
	if (out !== undefined && f >= out) return null;
	const key = spriteOf(id, pose);
	const [w, h] = SZ[key];
	const p = at !== undefined ? pop(f, at, 11, 220, 0.6) : 1;
	const o = out !== undefined ? 1 - tween(f, out - 8, out) : 1;
	const breathe = Math.round(Math.sin(f / 9 + x) * 0.6) * scale * 0.5;
	const sq = 1 + talk * 0.018;
	return (
		<Img
			src={staticFile(`mascotas/${key}.png`)}
			style={{
				position: 'absolute',
				left: Math.round(x - (w * scale) / 2),
				top: Math.round(y - h * scale - (1 - p) * 160 + breathe),
				width: w * scale,
				height: h * scale,
				imageRendering: 'pixelated',
				transform: `${flip ? 'scaleX(-1) ' : ''}scale(${(0.6 + 0.4 * p) / sq}, ${(0.6 + 0.4 * p) * sq})`,
				transformOrigin: '50% 100%',
				opacity: Math.min(1, p * 2) * o * opacity,
				filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.55))',
				pointerEvents: 'none',
			}}
		/>
	);
};
