import {Ilustracion} from '@commons/ilustraciones';
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {POSES} from '@commons/mascot';
import {Mascota, MASCOTAS, MascotaId} from '@commons/mascotas';
import {Hit, In} from '@commons/vertical';
import {M, V, talkLevel, speakingNow} from '../timeline';
import {FASES, hitoDe} from '../fases';
import {PhaseCard, VideoTile} from '../parts';
import {FINAL, VReelDef} from './frame';

/**
 * Reel · Fase 2 · Programación básica, con las cuatro guías de la fase (C++, Java y Python).
 * Tramos del video principal: Lint presenta la fase (s03c desde «En la fase dos…») y cada guía dice su frase
 * (s03d C++, s03e Java, s03f y s03g Python). Las mascotas entran en su segmento; la tarjeta de fase sale antes.
 * Zonas: escenario 430–1190 (todo el contenido va aquí); Lint y su bocadillo abajo (frame.tsx).
 */
const FA = FASES[2];
const k = (m: string) => M('s03c', m);

/** Columnas de las cuatro mascotas (centro horizontal) y línea de los pies. */
const COL = [180, 420, 660, 900];
const FEET = 740;

/** Nombre y lenguaje bajo cada mascota; entra con ella. */
const Etiqueta: React.FC<{at: number; cx: number; id: MascotaId; lang: string}> = ({at, cx, id, lang}) => (
	<In at={at + 8} x={cx - 120} y={FEET + 14} w={240} from="down" impact={false}>
		<div style={{textAlign: 'center'}}>
			<div style={{fontFamily: SANS, fontWeight: 860, fontSize: 40, letterSpacing: '-0.03em', color: C.white, lineHeight: 1.05}}>{MASCOTAS[id].name}</div>
			<div style={{display: 'inline-block', marginTop: 8, fontFamily: MONO, fontWeight: 800, fontSize: 26, color: C.green, border: `3px solid ${C.green}`, background: 'rgba(8,11,9,0.92)', padding: '4px 14px'}}>{lang}</div>
		</div>
	</In>
);

const Body: React.FC = () => {
	const f = useCurrentFrame();
	const hito = hitoDe(FA)!;
	const [c0, c1, c2, c3] = COL;
	return (
		<>
			{/* Tarjeta de la fase: entra con Lint y sale antes de que entren las guías */}
			<In at={k('f2')} out={V.s03d.start - 10} x={60} y={450} w={960} from="left" exit="up">
				<PhaseCard fa={FA} w={960} />
			</In>
			<Hit at={k('f2') + 2} x={540} y={560} />

			{/* ParserInt (C++) entra cuando empieza su frase */}
			<Mascota id="parserint" pose="wave" x={c0} y={FEET} scale={6} at={V.s03d.start - 4} talk={talkLevel(f, 'parserint')} speaking={speakingNow(f, 'parserint')} />
			<Hit at={V.s03d.start - 2} x={c0} y={600} />
			<Etiqueta at={V.s03d.start - 4} cx={c0} id="parserint" lang="C++" />

			{/* Mocca (Java) */}
			<Mascota id="mocca" pose="wave" x={c1} y={FEET} scale={6} at={V.s03e.start - 4} talk={talkLevel(f, 'mocca')} speaking={speakingNow(f, 'mocca')} />
			<Hit at={V.s03e.start - 2} x={c1} y={600} />
			<Etiqueta at={V.s03e.start - 4} cx={c1} id="mocca" lang="Java" />

			{/* Pypo y Byte (hermanos, Python) */}
			<Mascota id="pypo" pose="wave" x={c2} y={FEET} scale={6} at={V.s03f.start - 4} talk={talkLevel(f, 'pypo')} speaking={speakingNow(f, 'pypo')} />
			<Hit at={V.s03f.start - 2} x={c2} y={600} />
			<Etiqueta at={V.s03f.start - 4} cx={c2} id="pypo" lang="Python" />

			<Mascota id="byte" pose="wave" x={c3} y={FEET} scale={6} at={V.s03g.start - 4} talk={talkLevel(f, 'byte')} speaking={speakingNow(f, 'byte')} />
			<Hit at={V.s03g.start - 2} x={c3} y={600} />
			<Etiqueta at={V.s03g.start - 4} cx={c3} id="byte" lang="Python" />

			{/* Videos reales de la fase, en la franja baja del escenario */}
			{FA.videos.slice(0, 2).map((v, i) => (
				<In key={v.n} at={(i === 0 ? V.s03e.start : V.s03f.start) + 10} x={60} y={900 + i * 86} w={960} from="left" impact={false}>
					<VideoTile n={v.n} t={v.t} w={960} />
				</In>
			))}
			{/* Hito de la fase: al final, con Byte */}
			<In at={V.s03g.start + 6} x={60} y={900 + 2 * 86} w={960} from="left">
				<VideoTile n={hito.n} t={hito.t} hito w={960} />
			</In>
			<Hit at={V.s03g.start + 6} x={540} y={1000} big />
			{/* ejemplo: el mismo código en C++, Java y Python mientras Lint presenta la fase */}
			<Ilustracion kind="codigo" at={k('f2') + 24} out={V.s03d.start - 10} x={230} y={800} scale={4.4} />
		</>
	);
};

export const Fase2Reel: VReelDef = {
	id: 'ReelFase2',
	n: 'fase 2',
	title: 'Fase 2 · Programación básica',
	hl: ['Programación'],
	parts: [[V.s03c.start - 14, V.s03g.end + 18], FINAL],
	Body,
	lint: [
		{at: k('f2') - 14, pose: POSES.wave},
		{at: k('f2'), pose: POSES.pointUp},
		{at: V.s03d.start, pose: POSES.point},
	],
};
