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
 * Reel · Fase 6 · Competitiva III, con DaRu.
 * Tramos del video principal: Lint presenta la fase (s03p desde «La fase seis…», marca f6) y DaRu
 * enumera los temas (s03q; «pelear» cierra con el titular y el hito #095).
 * Zonas: escenario 430–1190 (todo el contenido va aquí); Lint y su bocadillo abajo (frame.tsx).
 */
const FA = FASES[6];
const q = V.s03q.start;
const pelear = M('s03q', 'pelear');

/** Etiqueta pequeña que aparece con rebote (igual que en Fase1). */
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

/** Temas que DaRu enumera, con el video real del temario que los cubre (n de FASES[6].videos). */
const TEMAS = [
	{n: '081', tag: 'Árboles', at: q + 6},
	{n: '084', tag: 'Segment trees', at: q + 24},
	{n: '089', tag: 'Strings', at: q + 44},
	{n: '093', tag: 'Geometría', at: q + 62},
];

const Body: React.FC = () => {
	const f = useCurrentFrame();
	const hito = hitoDe(FA)!;
	return (
		<>
			<In at={M('s03p', 'f6')} out={q - 2} x={60} y={450} w={960} from="left" exit="up">
				<PhaseCard fa={FA} w={960} />
			</In>
			{/* DaRu entra cuando empieza su frase */}
			<Mascota id="daru" x={540} y={812} scale={10} at={q} entra talk={talkLevel(f, 'daru')} speaking={speakingNow(f, 'daru')} />
			{TEMAS.map((t, i) => {
				const v = FA.videos.find((x) => x.n === t.n)!;
				return (
					<In key={t.n} at={t.at} out={pelear - 6} x={60} y={840 + i * 88} w={960} from={i % 2 ? 'right' : 'left'} exit="left">
						<div style={{display: 'flex', alignItems: 'center'}}>
							<Tag at={t.at}>{t.tag}</Tag>
							<VideoTile n={v.n} t={v.t} w={620} size={0.9} />
						</div>
					</In>
				);
			})}
			{/* En «pelear»: titular y hito #095 */}
			<Hit at={pelear} x={540} y={960} big />
			<In at={pelear} x={60} y={880} w={960} from="up">
				<Big size={64}>
					<span style={{color: C.green}}>Problemas difíciles</span> de una maratón
				</Big>
			</In>
			<In at={pelear} x={60} y={1080} w={960} from="left" impact={false}>
				<VideoTile n={hito.n} t={hito.t} hito w={960} size={1} />
			</In>
			{/* ejemplo: segment tree mientras Lint presenta la fase */}
			<Ilustracion kind="segtree" at={M('s03p', 'f6') + 12} out={q - 2} x={183} y={765} scale={7} />
		</>
	);
};

export const Fase6Reel: VReelDef = {
	id: 'ReelFase6',
	n: 'fase 6',
	title: 'Fase 6 · Competitiva III',
	hl: ['Competitiva'],
	parts: [[V.s03p.start - 14, V.s03q.end + 18], FINAL],
	Body,
	lint: [
		{at: V.s03p.start - 14, pose: POSES.wave},
		{at: M('s03p', 'f6'), pose: POSES.pointUp},
		{at: q, pose: POSES.point},
	],
};
