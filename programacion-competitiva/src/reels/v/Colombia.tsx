import React from 'react';
import {C, MONO} from '@commons/theme';
import {M, SC} from '../../timeline';
import {POSES} from '@commons/mascot';
import {FINAL, voiceParts, VReelDef} from './frame';
import {Big, Hit, In, Kicker, Panel, PhotoV} from '@commons/vertical';

/** Reel 04 · Programación competitiva en Colombia (segmento s07). */
const k = (m: string) => M('s07', m);

const Fact: React.FC<{n?: string; t: string; color?: string}> = ({n, t, color = C.green}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(8,11,9,0.95)', borderLeft: `10px solid ${color}`, padding: '20px 26px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
		{n && <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 58, color}}>{n}</span>}
		<span style={{fontFamily: 'Inter Var, Inter, sans-serif', fontWeight: 760, fontSize: 40, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.1}}>{t}</span>
	</div>
);

const Body: React.FC = () => {
	const a = SC.colombia[0];
	return (
		<>
			<In at={a + 4} out={k('maraton')} x={90} y={470} from="zoom" exit="up">
				<PhotoV src="2024-nacional-icpc-equipo-banner.jpg" w={900} h={640} caption="Maratón Nacional ICPC 2024" tilt={-1.5} />
			</In>
			<In at={k('maraton')} out={k('presencial')} x={60} y={450} w={960} from="left" exit="up">
				<Kicker>{'// la fase nacional en colombia'}</Kicker>
				<Big size={92} style={{marginTop: 14}}>
					Maratón Nacional de Programación <span style={{color: C.green, whiteSpace: 'nowrap'}}>ACIS-REDIS</span>
				</Big>
			</In>
			<In at={k('oficial')} out={k('presencial')} x={60} y={880} w={960} from="right" exit="down">
				<Panel accent={C.green}>
					<Big size={56}>
						Fase nacional <span style={{color: C.green}}>oficial</span> de la ICPC
					</Big>
				</Panel>
			</In>
			<Hit at={k('oficial') + 2} x={540} y={960} />
			<In at={k('presencial') - 4} out={k('mejores') - 4} x={60} y={450} from="left" exit="left">
				<PhotoV src="2025-nacional-icpc-equipo1.jpg" w={430} h={600} caption="Nacional 2025" tilt={-2} />
			</In>
			<In at={k('presencial')} out={k('mejores') - 4} x={530} y={460} w={490} from="right" exit="right">
				<Fact t="Presencial" />
			</In>
			<In at={k('sedes')} out={k('mejores') - 4} x={530} y={610} w={490} from="right" exit="right">
				<Fact t="Varias sedes universitarias" />
			</In>
			<In at={k('tres')} out={k('mejores') - 4} x={530} y={800} w={490} from="right" exit="right">
				<Fact n="3" t="estudiantes" />
			</In>
			<In at={k('uno')} out={k('mejores') - 4} x={530} y={950} w={490} from="right" exit="right">
				<Fact n="1" t="computador" />
			</In>
			<Hit at={k('uno') + 2} x={770} y={1010} />
			<In at={k('mejores')} out={k('asi') - 6} x={60} y={450} w={960} from="up" exit="up">
				<Panel accent={C.amber} pad={28}>
					<Big size={52}>
						Los mejores <span style={{color: C.amber}}>→</span> fase regional latinoamericana
					</Big>
				</Panel>
			</In>
			<In at={k('mejores') + 10} out={k('asi') - 6} x={230} y={640} from="down" exit="down">
				<PhotoV src="2026-nacional-icpc-integrantes.jpg" w={620} h={460} pos="50% 35%" caption="Nacional ACIS-REDIS 2026" tilt={1.5} />
			</In>
			<In at={k('asi') - 4} x={60} y={450} w={960} from="up">
				<Big size={78}>
					Desde Colombia, hacia una <span style={{color: C.green}}>competencia internacional</span>
				</Big>
			</In>
			<In at={k('asi') + 6} x={60} y={720} from="zoom">
				<PhotoV src="2024-nacional-icpc-grupal.jpg" w={960} h={420} pos="50% 50%" caption="GOSLINT en la Maratón Nacional 2024" />
			</In>
			<Hit at={k('asi') + 8} x={540} y={920} big />
		</>
	);
};

export const ColombiaReel: VReelDef = {
	id: 'Reel4Colombia',
	n: 'en colombia',
	title: 'Programación competitiva en Colombia',
	hl: ['Colombia'],
	parts: [...voiceParts(['s07']), FINAL],
	Body,
	hook: 'h4',
	lint: [
		{at: SC.colombia[0], pose: POSES.wave},
		{at: k('maraton'), pose: {...POSES.pointUp}},
		{at: k('presencial'), pose: POSES.point},
		{at: k('tres'), pose: POSES.cheer},
		{at: k('mejores'), pose: POSES.pointUp},
		{at: k('asi'), pose: POSES.cheer},
	],
};
