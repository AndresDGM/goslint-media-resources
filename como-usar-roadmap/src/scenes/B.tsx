import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {pop} from '@commons/lib';
import {GridBg, Label} from '@commons/components';
import {POSES} from '@commons/mascot';
import {MASCOTAS, Mascota, MascotaId, MascotaPose} from '@commons/mascotas';
import {Hit, In} from '@commons/vertical';
import {Ilustracion} from '@commons/ilustraciones';
import {Actor} from '../kit';
import {M, SC, SegId, V, talkLevel} from '../timeline';
import {FASES} from '../fases';
import {PhaseCard, PhaseStrip} from '../parts';

/* ================================================================== 02 · fases y guías (s03a … s03t) */

type Beat = {
	phase: number;
	from: number;
	to: number;
	guides: {id: MascotaId; at: number; pose?: MascotaPose; seg?: SegId}[];
	chips: {at: number; text: string; color?: string}[];
};

/** Guion visual de la escena: cada fase entra cuando Lint la nombra y su guía, cuando empieza a hablar. */
export const beats = (): Beat[] => {
	const s = (id: SegId) => V[id].start;
	return [
		{phase: 0, from: M('s03a', 'f0'), to: M('s03a', 'f1'), guides: [], chips: [{at: M('s03a', 'f0') + 20, text: 'estás aquí'}]},
		{
			phase: 1, from: M('s03a', 'f1'), to: s('s03c'),
			guides: [{id: 'vee', at: s('s03b') - 6, pose: 'idle', seg: 's03b'}],
			chips: [{at: M('s03a', 'pseint'), text: 'PSeInt'}, {at: M('s03a', 'pseint') + 14, text: 'diagramas de flujo'}, {at: M('s03b', 'antes'), text: 'antes de escribir código', color: C.amber}],
		},
		{
			phase: 2, from: s('s03c'), to: s('s03h'),
			guides: [
				{id: 'parserint', at: s('s03d') - 4, pose: 'wave', seg: 's03d'},
				{id: 'mocca', at: s('s03e') - 4, pose: 'cheer', seg: 's03e'},
				{id: 'pypo', at: s('s03f') - 4, pose: 'wave', seg: 's03f'},
				{id: 'byte', at: s('s03g') - 4, pose: 'cheer', seg: 's03g'},
			],
			chips: [{at: M('s03d', 'cpp'), text: 'C++'}, {at: M('s03e', 'java'), text: 'Java', color: C.amber}, {at: M('s03f', 'python'), text: 'Python', color: C.blue}],
		},
		{
			phase: 3, from: s('s03h'), to: s('s03k'),
			guides: [
				{id: 'polo', at: M('s03h', 'polo'), pose: 'wave', seg: 's03i'},
				{id: 'mocca', at: s('s03j') - 4, pose: 'point', seg: 's03j'},
			],
			chips: [{at: s('s03i') + 10, text: 'una estructura a la vez'}, {at: M('s03j', 'poo'), text: 'programación orientada a objetos', color: C.amber}],
		},
		{
			phase: 4, from: s('s03k'), to: s('s03n'),
			guides: [
				{id: 'marco', at: s('s03l') - 4, seg: 's03l'},
				{id: 'ringo', at: s('s03m') - 4, pose: 'idle', seg: 's03m'},
			],
			chips: [{at: M('s03l', 'contest'), text: 'primeros concursos'}, {at: M('s03m', 'reloj'), text: 'cabeza fría', color: C.blue}],
		},
		{
			phase: 5, from: s('s03n'), to: s('s03p'),
			guides: [{id: 'velasco', at: V.s03n.end - 34, pose: 'wave', seg: 's03o'}],
			chips: [{at: M('s03o', 'grafos'), text: 'grafos'}, {at: M('s03o', 'numeros'), text: 'teoría de números'}, {at: M('s03o', 'dp'), text: 'programación dinámica', color: C.amber}],
		},
		{
			phase: 6, from: s('s03p'), to: s('s03r'),
			guides: [{id: 'daru', at: s('s03q') - 4, pose: 'cheer', seg: 's03q'}],
			chips: [
				{at: s('s03q') + 6, text: 'árboles'},
				{at: s('s03q') + 24, text: 'segment trees'},
				{at: s('s03q') + 44, text: 'strings'},
				{at: s('s03q') + 62, text: 'geometría'},
				{at: M('s03q', 'pelear'), text: 'problemas difíciles de maratón', color: C.amber},
			],
		},
		{
			phase: 7, from: s('s03r'), to: SC.guias[1],
			guides: [
				{id: 'diego', at: s('s03s') - 4, pose: 'point', seg: 's03s'},
				{id: 'globin', at: s('s03t') - 4, pose: 'cheer', seg: 's03t'},
			],
			chips: [
				{at: s('s03s') + 4, text: 'estrategia de equipo'},
				{at: s('s03s') + 30, text: 'cuaderno'},
				{at: s('s03s') + 50, text: 'simulacros'},
				{at: M('s03s', 'mas'), text: '¡un problema más!', color: C.amber},
			],
		},
	];
};

/** Posiciones de las guías en la zona derecha (x del centro) según cuántas hay. */
const SLOTS: Record<number, number[]> = {1: [1560], 2: [1420, 1700], 3: [1340, 1560, 1780], 4: [1290, 1460, 1630, 1800]};

const Chip: React.FC<{at: number; text: string; color?: string}> = ({at, text, color = C.green}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 11, 260, 0.55);
	return (
		<span style={{display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: 30, color, border: `3px solid ${color}`, background: 'rgba(8,11,9,0.92)', padding: '8px 16px', marginRight: 14, marginBottom: 14, transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2)}}>
			{text}
		</span>
	);
};

/** Ejemplos en pixel art de cada fase (arriba a la derecha), sincronizados con la voz. */
const IX = 1290;
const IY = 250;
const Ilustraciones: React.FC = () => {
	const f = useCurrentFrame();
	const s = (id: SegId) => V[id].start;
	const hl = f >= s('s03f') ? 2 : f >= s('s03e') ? 1 : f >= s('s03d') ? 0 : -1;
	return (
		<>
			<Ilustracion kind="pseint" at={M('s03a', 'pseint') - 4} out={s('s03b') - 2} x={IX} y={IY} scale={5} />
			<Ilustracion kind="diagrama" at={s('s03b')} out={s('s03c')} x={IX} y={IY - 20} scale={5} />
			<Ilustracion kind="codigo" at={s('s03c') + 30} out={s('s03h')} x={IX} y={IY} scale={5} hl={hl} />
			<Ilustracion kind="pila" at={M('s03h', 'f3') + 20} out={s('s03j') - 2} x={IX} y={IY} scale={5} />
			<Ilustracion kind="clase" at={s('s03j')} out={s('s03k')} x={IX} y={IY} scale={5} />
			<Ilustracion kind="concurso" at={s('s03k') + 10} out={s('s03n')} x={IX} y={IY} scale={5} />
			<Ilustracion kind="grafo" at={s('s03n') + 20} out={M('s03o', 'dp') - 2} x={IX} y={IY} scale={5} />
			<Ilustracion kind="dp" at={M('s03o', 'dp')} out={s('s03p')} x={IX} y={IY} scale={5} />
			<Ilustracion kind="segtree" at={s('s03q') + 20} out={s('s03q') + 60} x={IX} y={IY} scale={5} />
			<Ilustracion kind="geometria" at={s('s03q') + 62} out={s('s03r')} x={IX} y={IY} scale={5} />
			<Ilustracion kind="equipo" at={s('s03r') + 10} out={SC.guias[1]} x={IX} y={IY} scale={5} />
		</>
	);
};

export const Guias: React.FC = () => {
	const f = useCurrentFrame();
	const a = SC.guias[0];
	const B = beats();
	const cur = B.find((b) => f >= b.from && f < b.to);
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} size={90} />
			<PhaseStrip at={a + 6} y={150} x0={200} x1={1720} active={cur ? cur.phase : null} />
			{B.map((b) => {
				const slots = SLOTS[Math.max(1, b.guides.length)];
				return (
					<React.Fragment key={b.phase}>
						<In at={b.from} out={b.to} x={420} y={330} w={760} from="left" exit="left">
							<PhaseCard fa={FASES[b.phase]} w={760} />
							<div style={{marginTop: 26}}>
								{b.chips.map((c, i) => (
									<Chip key={i} {...c} />
								))}
							</div>
						</In>
						<Hit at={b.from + 2} x={800} y={420} />
						{b.guides.map((gd, i) => {
							if (f < gd.at - 1 || f >= b.to) return null;
							const x = slots[i];
							const m = MASCOTAS[gd.id];
							const talk = gd.seg && f >= V[gd.seg].start && f < V[gd.seg].end ? talkLevel(f, gd.id) : 0;
							const pn = pop(f, gd.at + 6, 12, 240, 0.6);
							const scale = b.guides.length >= 4 ? 6 : 7;
							return (
								<React.Fragment key={gd.id + i}>
									<Mascota id={gd.id} pose={gd.pose} x={x} y={900} scale={scale} at={gd.at} out={b.to} talk={talk} />
									<div style={{position: 'absolute', left: x - 120, width: 240, top: 930, textAlign: 'center', opacity: Math.min(1, pn * 2), transform: `translateY(${(1 - pn) * 20}px)`}}>
										<div style={{fontFamily: SANS, fontWeight: 860, fontSize: 34, color: talk > 0 ? m.color : C.white, letterSpacing: '-0.02em'}}>{m.name}</div>
									</div>
									<Hit at={gd.at + 2} x={x} y={760} />
								</React.Fragment>
							);
						})}
					</React.Fragment>
				);
			})}
			<Ilustraciones />
			{cur && cur.phase === 0 && (
				<div style={{position: 'absolute', left: 1300, top: 520, width: 480}}>
					<Label size={30} color={C.green}>{'// guía: Lint'}</Label>
				</div>
			)}
			<Actor
				x={230}
				y={930}
				scale={8}
				keys={[
					{at: a, pose: POSES.idle},
					{at: M('s03a', 'guias'), pose: POSES.cheer},
					{at: M('s03a', 'f0'), pose: POSES.wave},
					{at: M('s03a', 'f1'), pose: POSES.pointUp},
					{at: V.s03b.start, pose: POSES.point},
					{at: V.s03c.start, pose: POSES.pointUp},
					{at: V.s03d.start, pose: POSES.point},
					{at: V.s03h.start, pose: POSES.cheer},
					{at: V.s03i.start, pose: POSES.point},
					{at: V.s03k.start, pose: POSES.pointUp},
					{at: V.s03l.start, pose: POSES.point},
					{at: V.s03n.start, pose: POSES.pointUp},
					{at: V.s03o.start, pose: POSES.point},
					{at: V.s03p.start, pose: POSES.wow},
					{at: V.s03q.start, pose: POSES.point},
					{at: V.s03r.start, pose: POSES.cheer},
					{at: V.s03s.start, pose: POSES.point},
				]}
			/>
		</AbsoluteFill>
	);
};
