import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO} from '@commons/theme';
import {pop} from '@commons/lib';
import {POSES} from '@commons/mascot';
import {Mascota} from '@commons/mascotas';
import {Ilustracion} from '@commons/ilustraciones';
import {ContestClock} from '@commons/parts';
import {Big, Hit, In} from '@commons/vertical';
import {M, V, talkLevel, speakingNow} from '../timeline';
import {FASES, hitoDe} from '../fases';
import {PhaseCard, VideoTile} from '../parts';
import {FINAL, VReelDef} from './frame';

/**
 * Reel · Fase 4 · Competitiva I, con Lint, Marco y Ringo.
 * Tramos del video principal: Lint presenta la fase (s03k desde «La fase cuatro…»), Marco habla de C++ y
 * los primeros concursos (s03l) y Ringo de la cabeza fría y el reloj (s03m).
 * Zonas: escenario 430–1190 (todo el contenido va aquí); Lint y su bocadillo abajo (frame.tsx).
 */
const FA = FASES[4];
const f4 = M('s03k', 'f4');
const contest = M('s03l', 'contest');
const reloj = M('s03m', 'reloj');

/** Etiqueta pequeña que aparece con rebote (como en Fase1.tsx). */
const Tag: React.FC<{at: number; children: React.ReactNode; color?: string}> = ({at, children, color = C.green}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 11, 260, 0.55);
	return (
		<div style={{display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: 34, color, border: `3px solid ${color}`, background: 'rgba(8,11,9,0.92)', padding: '8px 18px', marginBottom: 18, transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2)}}>
			{children}
		</div>
	);
};

const Body: React.FC = () => {
	const f = useCurrentFrame();
	const hito = hitoDe(FA)!;
	// Marco sale y Ringo entra cuando empieza su locución; todo lo de Marco sale antes.
	const marcoOut = V.s03m.start - 6;
	return (
		<>
			{/* s03k · Lint presenta la fase: tarjeta y primeros videos */}
			<In at={f4} out={V.s03l.start - 4} x={60} y={450} w={960} from="left" exit="up">
				<PhaseCard fa={FA} w={960} />
			</In>
			<Hit at={f4 + 2} x={540} y={560} />
			{FA.videos.slice(0, 3).map((v, i) => (
				<In key={v.n} at={f4 + 30 + i * 6} out={V.s03l.start - 4} x={60} y={760 + i * 96} w={960} from="left" impact={false}>
					<VideoTile n={v.n} t={v.t} w={960} size={0.9} />
				</In>
			))}

			{/* s03l · Marco: «Ya en C++, con los primeros concursos.» */}
			<Mascota id="marco" x={230} y={1190} scale={9} at={V.s03l.start} out={marcoOut} talk={talkLevel(f, 'marco')} speaking={speakingNow(f, 'marco')} />
			<In at={V.s03l.start} out={marcoOut} x={360} y={770} w={660} from="left" exit="up" impact={false}>
				<Tag at={V.s03l.start}>C++</Tag>
				<br />
				<Tag at={contest}>primeros concursos</Tag>
			</In>
			<In at={contest} out={marcoOut} x={400} y={1000} w={620} from="left" exit="left">
				<VideoTile n={hito.n} t={hito.t} hito w={620} size={0.9} />
			</In>
			<Hit at={contest + 2} x={710} y={1040} />

			{/* s03m · Ringo: «Y con la cabeza fría aunque corra el reloj.» */}
			<Mascota id="ringo" pose="think" x={800} y={1190} scale={9} at={V.s03m.start} talk={talkLevel(f, 'ringo')} speaking={speakingNow(f, 'ringo')} />
			<In at={V.s03m.start} x={60} y={470} w={960} from="up">
				<Big size={96}>
					Cabeza <span style={{color: C.green}}>fría</span>
				</Big>
			</In>
			<Hit at={V.s03m.start + 2} x={540} y={640} />
			<In at={reloj} x={0} y={600} w={1080} from="zoom" impact={false}>
				<div style={{position: 'relative', height: 140}}>
					<ContestClock at={reloj} x={540} y={70} size={110} />
				</div>
			</In>
			{/* ejemplo: marcador de concurso mientras habla Marco */}
			<Ilustracion kind="concurso" at={V.s03l.start + 6} out={marcoOut} x={450} y={460} scale={4.6} />
		</>
	);
};

export const Fase4Reel: VReelDef = {
	id: 'ReelFase4',
	n: 'fase 4',
	title: 'Fase 4 · Competitiva I',
	hl: ['Competitiva'],
	parts: [[V.s03k.start - 14, V.s03m.end + 18], FINAL],
	Body,
	lint: [
		{at: V.s03k.start - 14, pose: POSES.wave},
		{at: f4, pose: POSES.pointUp},
		{at: V.s03k.end, pose: POSES.idle},
	],
};
