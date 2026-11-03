import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '@commons/theme';
import {POSES} from '@commons/mascot';
import {Mascota} from '@commons/mascotas';
import {Ilustracion} from '@commons/ilustraciones';
import {Big, Hit, In} from '@commons/vertical';
import {M, V, talkLevel} from '../timeline';
import {FASES, hitoDe} from '../fases';
import {PhaseCard, VideoTile} from '../parts';
import {FINAL, VReelDef} from './frame';

/**
 * Reel · Fase 5 · Competitiva II, con Velasco.
 * Tramos del video principal: Lint presenta la fase (s03n desde «La fase cinco…») y Velasco dice su frase (s03o).
 * Zonas: escenario 430–1190 (todo el contenido va aquí); Lint y su bocadillo abajo (frame.tsx).
 */
const FA = FASES[5];
const k = (m: string) => M('s03n', m);
const o = (m: string) => M('s03o', m);
const video = (n: string) => FA.videos.find((v) => v.n === n)!;

/** Velasco entra al final de la frase de Lint; la tarjeta de fase sale cuando empieza Velasco. */
const velasco = V.s03n.end - 34;
const fueraFase = V.s03o.start - 2;

/** Bloque temático: rótulo a la izquierda y videos reales a la derecha, cada uno con su entrada. */
const Tema: React.FC<{at: number; y: number; label: string; videos: string[]; rowGap?: number}> = ({at, y, label, videos, rowGap = 82}) => (
	<>
		<In at={at} x={60} y={y} w={320} from="left" impact={false}>
			<Big size={40} color={C.green}>{label}</Big>
		</In>
		{videos.map((n, i) => (
			<In key={n} at={at + 8 + i * 8} x={380} y={y + i * rowGap} w={640} from="left" impact={false}>
				<VideoTile n={video(n).n} t={video(n).t} hito={video(n).hito} w={640} size={0.9} />
			</In>
		))}
	</>
);

const Body: React.FC = () => {
	const f = useCurrentFrame();
	const hito = hitoDe(FA)!;
	return (
		<>
			{/* Tarjeta de la fase: entra cuando Lint dice «cinco» y sale antes de que hable Velasco */}
			<In at={k('f5')} out={fueraFase} x={60} y={446} w={600} from="left" exit="up">
				<PhaseCard fa={FA} w={600} size={0.85} />
			</In>
			<Hit at={k('f5') + 2} x={360} y={560} />

			{/* Velasco entra al final de la frase de Lint */}
			<Mascota id="velasco" pose="wave" x={860} y={720} scale={9} at={velasco} talk={talkLevel(f, 'velasco')} />
			<Hit at={velasco + 2} x={860} y={520} big />

			{/* Tres bloques, cada uno en su marca de voz */}
			<Tema at={o('grafos')} y={700} label="Grafos" videos={['069', '073']} />
			<Tema at={o('numeros')} y={880} label="Teoría de números" videos={['066']} />
			<Tema at={o('dp')} y={990} label="Programación dinámica" videos={['077']} />
			<In at={o('dp') + 20} x={380} y={990 + 82} w={640} from="left" impact={false}>
				<VideoTile n={hito.n} t={hito.t} hito w={640} size={0.9} />
			</In>
			{/* ejemplo: grafo recorrido por niveles mientras Lint presenta la fase */}
			<Ilustracion kind="grafo" at={k('f5') + 20} out={o('grafos') - 2} x={60} y={730} scale={5} />
		</>
	);
};

export const Fase5Reel: VReelDef = {
	id: 'ReelFase5',
	n: 'fase 5',
	title: 'Fase 5 · Competitiva II',
	hl: ['Competitiva'],
	parts: [[V.s03n.start - 14, V.s03o.end + 18], FINAL],
	Body,
	lint: [
		{at: k('f5') - 14, pose: POSES.wave},
		{at: k('f5'), pose: POSES.pointUp},
		{at: V.s03o.start, pose: POSES.point},
	],
};
