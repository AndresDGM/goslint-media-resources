import React from 'react';
import {useCurrentFrame} from 'remotion';
import {POSES} from '@commons/mascot';
import {Mascota} from '@commons/mascotas';
import {Ilustracion} from '@commons/ilustraciones';
import {Big, Hit, In} from '@commons/vertical';
import {M, V, talkLevel} from '../timeline';
import {FASES, hitoDe} from '../fases';
import {PhaseCard, VideoTile} from '../parts';
import {FINAL, VReelDef} from './frame';

/**
 * Reel · Fase 3 · Estructuras y algoritmos, con Polo y Mocca (Lint presenta la fase en s03h).
 * Tramos del video principal: PhaseCard (s03h), Polo y sus estructuras (s03i) y Mocca con POO (s03j).
 * Zonas: escenario 430–1190 (todo el contenido va aquí); Lint y su bocadillo abajo (frame.tsx).
 */
const FA = FASES[3];
const k = (m: string) => M('s03h', m);
const polo = M('s03h', 'polo');
const poo = M('s03j', 'poo');
const pick = (n: string) => FA.videos.find((v) => v.n === n)!;

const Body: React.FC = () => {
	const f = useCurrentFrame();
	const hito = hitoDe(FA)!;
	const sinPrisa = V.s03i.start;
	const moca = V.s03j.start;
	const estructuras = [pick('045'), pick('046'), pick('047')];
	const pooVideo = pick('040');
	return (
		<>
			{/* Tarjeta de la fase: sale cuando Polo entra */}
			<In at={k('f3')} out={polo - 2} x={60} y={450} w={960} from="left" exit="up">
				<PhaseCard fa={FA} w={960} />
			</In>
			<Hit at={k('f3') + 2} x={540} y={560} />

			{/* Polo entra en la palabra «Polo» y habla de una estructura a la vez */}
			<Mascota id="polo" x={800} y={1180} scale={11} at={polo} out={moca - 2} talk={talkLevel(f, 'polo')} />
			<Hit at={polo + 2} x={800} y={950} big />
			<In at={sinPrisa - 6} out={moca - 2} x={60} y={450} w={960} from="up" exit="left">
				<Big size={64}>
					Una <span style={{color: '#D6D6D6'}}>estructura</span> a la vez
				</Big>
			</In>
			{estructuras.map((v, i) => (
				<In key={v.n} at={sinPrisa + 30 + i * 12} out={moca - 2} x={60} y={850 + i * 96} w={560} from="left" exit="left" impact={false}>
					<VideoTile n={v.n} t={v.t} w={560} size={0.85} />
				</In>
			))}

			{/* Mocca entra en su frase: la programación orientada a objetos */}
			<Mascota id="mocca" x={260} y={1180} scale={11} at={moca} talk={talkLevel(f, 'mocca')} />
			<Hit at={moca + 2} x={260} y={950} big />
			<In at={moca} x={60} y={450} w={960} from="up" impact={false}>
				<Big size={64}>
					La <span style={{color: '#F2B04A'}}>programación orientada a objetos</span>
				</Big>
			</In>
			<In at={poo} x={440} y={960} w={580} from="left" impact={false}>
				<VideoTile n={pooVideo.n} t={pooVideo.t} w={580} size={0.85} />
			</In>
			<In at={poo + 10} x={440} y={1060} w={580} from="left" impact={false}>
				<VideoTile n={hito.n} t={hito.t} hito w={580} size={0.85} />
			</In>
			{/* ejemplos: pila, cola y árbol con Polo; una clase con Mocca */}
			<Ilustracion kind="pila" at={sinPrisa} out={moca - 2} x={60} y={560} scale={4.4} />
			<Ilustracion kind="clase" at={poo - 10} out={V.s03j.end + 18} x={440} y={650} scale={4.6} />
		</>
	);
};

export const Fase3Reel: VReelDef = {
	id: 'ReelFase3',
	n: 'fase 3',
	title: 'Fase 3 · Estructuras y algoritmos',
	hl: ['Estructuras'],
	parts: [[V.s03h.start - 14, V.s03j.end + 18], FINAL],
	Body,
	lint: [
		{at: V.s03h.start - 14, pose: POSES.wave},
		{at: polo, pose: POSES.point},
		{at: V.s03i.start, pose: POSES.think},
		{at: V.s03j.start, pose: POSES.pointUp},
	],
};
