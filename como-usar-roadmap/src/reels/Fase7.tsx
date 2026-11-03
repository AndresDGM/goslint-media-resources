import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO} from '@commons/theme';
import {pop, tween} from '@commons/lib';
import {POSES} from '@commons/mascot';
import {Mascota} from '@commons/mascotas';
import {Ilustracion} from '@commons/ilustraciones';
import {Hit, In} from '@commons/vertical';
import {M, V, talkLevel, speakingNow} from '../timeline';
import {FASES, hitoDe} from '../fases';
import {PhaseCard, VideoTile} from '../parts';
import {FINAL, VReelDef} from './frame';

/**
 * Reel · Fase 7 · Modo maratón, con Diego (coach) y Globín.
 * Tramos del video principal: Lint presenta la fase (s03r desde «Y la fase siete…»), Diego habla de la
 * estrategia (s03s) y Globín cierra con «¡Hasta que el equipo despegue!» (s03t).
 * Zonas: escenario 430–1190 (todo el contenido va aquí); Lint y su bocadillo abajo (frame.tsx).
 */
const FA = FASES[7];
const k = (m: string) => M('s03r', m);
const dieg = V.s03s.start;

/** Etiqueta pequeña que aparece con rebote (copia local del `Tag` de Fase1, que no se exporta). */
const Tag: React.FC<{at: number; children: React.ReactNode; color?: string}> = ({at, children, color = C.green}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 11, 260, 0.55);
	return (
		<span style={{display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: 34, color, border: `3px solid ${color}`, background: 'rgba(8,11,9,0.92)', padding: '8px 18px', marginRight: 16, marginBottom: 12, transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2)}}>
			{children}
		</span>
	);
};

const Body: React.FC = () => {
	const f = useCurrentFrame();
	const hito = hitoDe(FA)!;
	const despega = M('s03t', 'despega');
	// Globín sube un poco en «despega» (sobre la columna derecha, feet en y=1180 → 1090)
	const rise = tween(f, despega, despega + 14) * 90;
	return (
		<>
			{/* Tarjeta de la fase */}
			<In at={k('f7')} x={60} y={450} w={960} from="left" exit="up" out={dieg - 6}>
				<PhaseCard fa={FA} w={960} />
			</In>
			<Hit at={k('f7') + 2} x={540} y={560} />

			{/* Etiquetas de Diego: estrategia, cuaderno y simulacros; «¡Un problema más!» en «mas» */}
			<div style={{position: 'absolute', left: 60, top: 720, width: 960}}>
				<Tag at={dieg + 4}>Estrategia de equipo</Tag>
				<Tag at={dieg + 24}>Cuaderno</Tag>
				<Tag at={dieg + 44}>Simulacros</Tag>
				<Tag at={M('s03s', 'mas')} color={C.amber}>¡Un problema más!</Tag>
			</div>

			{/* Los videos de la fase: 096–098 entran al nombrarse en la presentación de Diego */}
			{FA.videos.slice(0, 3).map((v, i) => (
				<In key={v.n} at={dieg + 8 + i * 14} x={60} y={856 + i * 84} w={560} from="left" impact={false}>
					<VideoTile n={v.n} t={v.t} w={560} size={0.85} />
				</In>
			))}

			{/* Diego (coach) entra al empezar su locución */}
			<Mascota id="diego" x={760} y={1180} scale={8} at={dieg - 6} entra talk={talkLevel(f, 'diego')} speaking={speakingNow(f, 'diego')} />
			<Hit at={dieg - 4} x={800} y={1000} />

			{/* Globín entra con su locución; sube un poco en «despega» */}
			<Mascota id="globin" x={945} y={1180 - rise} scale={7} at={V.s03t.start} entra talk={talkLevel(f, 'globin')} speaking={speakingNow(f, 'globin')} />

			{/* Hito #099 al pronunciarse «despega» */}
			<In at={despega} x={60} y={1112} w={560} from="left">
				<VideoTile n={hito.n} t={hito.t} hito w={560} size={0.85} />
			</In>
			<Hit at={despega + 2} x={540} y={1100} big />
			{/* ejemplo: tres personas, un computador y globos mientras Lint presenta la fase */}
			<Ilustracion kind="equipo" at={k('f7') + 10} out={dieg - 6} x={183} y={765} scale={7} />
		</>
	);
};

export const Fase7Reel: VReelDef = {
	id: 'ReelFase7',
	n: 'fase 7',
	title: 'Fase 7 · Modo maratón',
	hl: ['maratón'],
	parts: [[V.s03r.start - 14, V.s03t.end + 18], FINAL],
	Body,
	lint: [
		{at: V.s03r.start - 14, pose: POSES.wave},
		{at: k('f7'), pose: POSES.pointUp},
		{at: V.s03s.start, pose: POSES.point},
	],
};
