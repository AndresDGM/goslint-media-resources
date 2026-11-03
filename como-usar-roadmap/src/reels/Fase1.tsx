import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO} from '@commons/theme';
import {pop} from '@commons/lib';
import {POSES} from '@commons/mascot';
import {Mascota} from '@commons/mascotas';
import {Ilustracion} from '@commons/ilustraciones';
import {Big, Hit, In} from '@commons/vertical';
import {M, V, talkLevel, speakingNow} from '../timeline';
import {FASES, hitoDe} from '../fases';
import {PhaseCard, VideoTile} from '../parts';
import {FINAL, VReelDef} from './frame';

/**
 * Reel · Fase 1 · Lógica desde cero, con Vee.
 * Tramos del video principal: Lint presenta la fase (s03a desde «La fase uno…») y Vee dice su frase (s03b).
 * Zonas: escenario 430–1190 (todo el contenido va aquí); Lint y su bocadillo abajo (frame.tsx).
 */
const FA = FASES[1];
const k = (m: string) => M('s03a', m);

/** Etiqueta pequeña que aparece con rebote. */
const Tag: React.FC<{at: number; children: React.ReactNode; color?: string}> = ({at, children, color = C.green}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 11, 260, 0.55);
	return (
		<span style={{display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: 34, color, border: `3px solid ${color}`, background: 'rgba(8,11,9,0.92)', padding: '8px 18px', marginRight: 16, transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2)}}>
			{children}
		</span>
	);
};

const Body: React.FC = () => {
	const f = useCurrentFrame();
	const vee = V.s03b.start - 6;
	const hito = hitoDe(FA)!;
	return (
		<>
			<In at={k('f1')} out={vee - 2} x={60} y={450} w={960} from="left" exit="up">
				<PhaseCard fa={FA} w={960} />
				<div style={{marginTop: 28}}>
					<Tag at={k('pseint')}>PSeInt</Tag>
					<Tag at={k('pseint') + 14}>diagramas de flujo</Tag>
				</div>
			</In>
			<Hit at={k('f1') + 2} x={540} y={560} />
			{/* Vee entra cuando empieza su frase */}
			<Mascota id="vee" x={800} y={1180} scale={11} at={vee} entra talk={talkLevel(f, 'vee')} speaking={speakingNow(f, 'vee')} />
			<Hit at={vee + 2} x={800} y={950} big />
			<In at={vee} x={60} y={450} w={960} from="up" impact={false}>
				<Big size={64}>
					Con <span style={{color: '#4F8BE8'}}>Vee</span>: pensar algorítmicamente
				</Big>
			</In>
			{FA.videos.slice(0, 1).map((v, i) => (
				<In key={v.n} at={vee + 24 + i * 6} x={60} y={990 + i * 96} w={560} from="left" impact={false}>
					<VideoTile n={v.n} t={v.t} w={560} size={0.85} />
				</In>
			))}
			<In at={M('s03b', 'antes')} x={60} y={1090} w={560} from="left">
				<VideoTile n={hito.n} t={hito.t} hito w={560} size={0.85} />
			</In>
			{/* ejemplos: PSeInt mientras Lint lo nombra; diagrama de flujo con Vee */}
			<Ilustracion kind="pseint" at={k('pseint') - 4} out={vee - 2} x={265} y={870} scale={5.4} />
			<Ilustracion kind="diagrama" at={vee + 4} out={V.s03b.end + 18} x={60} y={640} scale={4.6} />
		</>
	);
};

export const Fase1Reel: VReelDef = {
	id: 'ReelFase1',
	n: 'fase 1',
	title: 'Fase 1 · Lógica desde cero',
	hl: ['Lógica'],
	parts: [[k('f1') - 14, V.s03b.end + 18], FINAL],
	Body,
	lint: [
		{at: k('f1') - 14, pose: POSES.wave},
		{at: k('f1'), pose: POSES.pointUp},
		{at: V.s03b.start, pose: POSES.point},
	],
};
