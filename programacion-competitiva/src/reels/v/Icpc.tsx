import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {outCubic, tween} from '@commons/lib';
import {M, SC} from '../../timeline';
import {Chip, Label, Sprite} from '@commons/components';
import {ContestClock, PixelComputer} from '@commons/parts';
import {Key, POSES} from '@commons/mascot';
import {FINAL, voiceParts, VReelDef} from './frame';
import {Big, Hit, In, Kicker, PhotoV} from '@commons/vertical';

/** Reel 03 · La ICPC (segmentos s05 y s06). Maquetación vertical: todo dentro del escenario (x 60–1020, y 430–1190). */
const k5 = (m: string) => M('s05', m);
const k6 = (m: string) => M('s06', m);

const ACRO = [
	{w: 'International', k: 'internacional'},
	{w: 'Collegiate', k: 'universitaria'},
	{w: 'Programming', k: 'de programación'},
	{w: 'Contest', k: 'competencia'},
];

const STAGES = [
	{key: 'nacional', n: '01', pre: '', t: 'Fase nacional', s: 'cada país'},
	{key: 'regional', n: '02', pre: '', t: 'Fase regional', s: 'mejores clasificados'},
	{key: 'latam', n: '03', pre: 'ICPC', t: 'Latin America Championship', s: 'campeonato latinoamericano'},
	{key: 'world', n: '04', pre: 'ICPC', t: 'World Finals', s: 'final mundial', last: true},
];

const Bubble: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div style={{display: 'inline-block', background: C.white, color: '#0A0F0C', fontFamily: SANS, fontWeight: 760, fontSize: 34, letterSpacing: '-0.02em', padding: '12px 20px', boxShadow: '8px 8px 0 rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>{children}</div>
);

const Body: React.FC = () => {
	const f = useCurrentFrame();
	const icpc = k5('icpc');
	const siglas = k5('siglas');
	const universitarios = k5('universitarios');
	const equipos = k5('equipos');
	const uncomp = k5('uncomp');
	const si = k5('si');
	const comunicarte = k5('comunicarte');
	const repartir = k5('repartir');
	const decidir = k5('decidir');
	const equipo = k5('equipo');
	const reloj = k5('reloj');
	const endS5 = SC.icpc[1] - 10;
	const floorY = 1050;
	// el equipo (Globín, Marco y el computador) se oculta mientras se ve la foto real
	const teamOn = (f >= equipos && f < si - 4) || (f >= comunicarte - 8 && f < endS5);
	const cheer = f >= equipo;
	const bob = (s: number) => Math.round(Math.sin((f + s * 20) / 9) * 2) * 6;
	const drop = (at: number) => tween(f, at, at + 12, -120, 0, outCubic);

	const rec = k6('recorrido');
	const at6 = STAGES.map((s) => k6(s.key));
	const fill = [0, 1, 2].reduce((h, i) => h + tween(f, at6[i], at6[i + 1]) * 184, 0);
	const endCam = SC.camino[1] - 14;

	return (
		<>
			{/* ---- 1 · ICPC gigante y siglas ---- */}
			<In at={icpc} out={siglas - 4} x={60} y={440} w={960} from="zoom" exit="up">
				<div style={{fontFamily: SANS, fontWeight: 880, fontSize: 260, lineHeight: 0.95, letterSpacing: '-0.03em', color: C.white}}>
					{'ICPC'.split('').map((ch, i) => (
						<span key={i} style={{color: i % 2 ? C.green : C.white}}>
							{ch}
						</span>
					))}
				</div>
			</In>
			<Hit at={icpc + 2} x={540} y={600} big />
			{ACRO.map((w, i) => (
				<In key={i} at={siglas + i * 16} out={equipos - 14} x={60} y={460 + i * 140} w={960} from="left" exit="left" impact={false}>
					<div style={{fontFamily: SANS, fontWeight: 760, fontSize: 96, lineHeight: 1, letterSpacing: '-0.04em', color: C.white, whiteSpace: 'nowrap'}}>
						<span style={{color: C.green}}>{w.w[0]}</span>
						{w.w.slice(1)}
					</div>
					<div style={{fontFamily: MONO, fontWeight: 500, fontSize: 34, color: C.dim, marginTop: 8}}>{w.k}</div>
				</In>
			))}
			<In at={universitarios} out={equipos - 14} x={60} y={1050} from="up" exit="up" impact={false}>
				<Chip size={30} border={C.green}>
					<span style={{color: C.green}}>●</span> para estudiantes universitarios
				</Chip>
			</In>

			{/* ---- 2 · tres personas y un computador ---- */}
			<In at={equipos} out={si - 8} x={60} y={440} w={960} from="up" exit="up" impact={false}>
				<div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 840, fontSize: 88, lineHeight: 1.04, letterSpacing: '-0.045em', color: C.white}}>
					3 estudiantes <span style={{color: C.dim}}>·</span>
					<div style={{color: f >= uncomp ? C.green : C.faint}}>1 computador</div>
				</div>
			</In>
			{teamOn && <div style={{position: 'absolute', left: 120, top: floorY, width: 840, height: 8, background: '#2A322D'}} />}
			{teamOn && <PixelComputer x={540} y={floorY} scale={8} at={uncomp} />}
			{teamOn && f >= equipos + 10 && (
				<Sprite
					src={cheer ? 'globin_cheer.png' : f >= repartir ? 'globin_point.png' : 'globin_idle.png'}
					x={230}
					y={floorY + drop(equipos + 10)}
					w={cheer ? 19 : f >= repartir ? 20 : 14}
					h={30}
					scale={8}
					bob={cheer ? Math.max(0, bob(1)) : 0}
				/>
			)}
			{teamOn && f >= equipos + 18 && <Sprite src="marco_idle.png" x={830} y={floorY + drop(equipos + 18)} w={26} h={45} scale={7} flip bob={cheer ? Math.max(0, bob(2)) : 0} />}
			<In at={comunicarte} out={reloj - 8} x={110} y={640} from="up" exit="up" impact={false}>
				<Bubble>¿Quién toma el B?</Bubble>
			</In>
			<In at={repartir} out={reloj - 8} x={300} y={730} from="up" exit="up" impact={false}>
				<Bubble>A · B · C repartidos</Bubble>
			</In>
			<In at={decidir} out={reloj - 8} x={596} y={640} from="up" exit="up" impact={false}>
				<Bubble>primero el más fácil</Bubble>
			</In>
			<Hit at={uncomp + 2} x={540} y={940} />
			<Hit at={equipo + 2} x={540} y={880} big />

			{/* foto real: tres personas, un computador */}
			<In at={si - 1} out={comunicarte - 12} x={140} y={470} w={800} from="zoom" exit="zoom">
				<PhotoV src="2025-regional-icpc-equipo-computador.jpg" w={800} h={560} pos="50% 40%" caption="Regional ICPC 2025" tilt={-1.5} />
			</In>
			<Hit at={si + 2} x={540} y={800} />

			{/* reloj */}
			<In at={reloj} out={endS5} x={0} y={0} from="zoom" exit="zoom">
				<ContestClock at={reloj} x={540} y={520} size={110} speed={900} start={4 * 3600 + 59 * 60 + 59} color={C.amber} />
				<div style={{position: 'absolute', left: 60, width: 960, top: 640, textAlign: 'center'}}>
					<Chip size={28} border={C.amber}>
						todo mientras el reloj sigue avanzando
					</Chip>
				</div>
			</In>

			{/* rellenos: titulares mientras llega la primera marca de cada bloque */}
			<In at={SC.icpc[0] + 6} out={k5('icpc') - 2} x={60} y={520} w={960} from="zoom" exit="up">
				<Kicker>{'// la gran competencia universitaria'}</Kicker>
				<Big size={120} style={{marginTop: 16}}>
					Una competencia <span style={{color: C.green}}>mundial</span>
				</Big>
			</In>
			<In at={SC.camino[0] + 4} out={at6[0] - 2} x={60} y={520} w={960} from="zoom" exit="up">
				<Kicker>{'// el camino de la icpc'}</Kicker>
				<Big size={110} style={{marginTop: 16}}>
					De tu país a la <span style={{color: C.amber}}>final mundial</span>
				</Big>
			</In>
			<Hit at={SC.camino[0] + 6} x={540} y={700} big />

			{/* ---- 3 · el camino: fase nacional → final mundial ---- */}
			<In at={rec} out={k6('preparacion') - 4} x={60} y={470} w={960} from="up" exit="up" impact={false}>
				<Kicker>{'// un recorrido que exige'}</Kicker>
			</In>
			{f >= at6[0] - 2 && f < rec && (
				<>
					<div style={{position: 'absolute', left: 118, top: 509, width: 4, height: 552, background: 'rgba(255,255,255,0.12)', opacity: 1 - tween(f, rec - 12, rec)}} />
					<div style={{position: 'absolute', left: 118, top: 509, width: 4, height: fill, background: C.green, opacity: 1 - tween(f, rec - 12, rec)}} />
				</>
			)}
			{STAGES.map((s, i) => (
				<In key={i} at={at6[i]} out={rec - 10} x={60} y={452 + i * 184} w={960} from="right" exit="left">
					<div style={{position: 'absolute', left: 34, top: 31, width: 52, height: 52, background: s.last ? C.amber : C.green, border: `3px solid ${C.white}`, transform: 'rotate(45deg)'}} />
					<div style={{position: 'absolute', left: 130, top: 0, width: 830}}>
						<Label size={24} color={s.last ? C.amber : C.green}>{s.n}</Label>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: i >= 2 ? 52 : 64, color: C.white, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1.05, whiteSpace: 'nowrap'}}>
							{s.pre && <span style={{color: C.dim}}>{s.pre} </span>}
							{s.t}
						</div>
						<div style={{fontFamily: MONO, fontSize: 32, color: C.dim, marginTop: 6}}>{s.s}</div>
					</div>
				</In>
			))}
			<In at={k6('mejores')} out={rec - 6} x={540} y={1100} from="right" exit="right" impact={false}>
				<Chip size={26} border={C.amber}>
					<span style={{color: C.amber}}>★</span> los mejores del planeta
				</Chip>
			</In>
			<In at={k6('preparacion')} out={endCam} x={60} y={560} w={960} from="right" exit="left" impact={false}>
				<Big size={120}>preparación</Big>
			</In>
			<In at={k6('constancia')} out={endCam} x={60} y={740} w={960} from="right" exit="left" impact={false}>
				<Big size={120}>constancia</Big>
			</In>
			<In at={k6('trabajo')} out={endCam} x={60} y={920} w={960} from="right" exit="left" impact={false}>
				<Big size={88} color={C.green}>trabajo en equipo</Big>
			</In>
			<Hit at={k6('trabajo') + 2} x={540} y={960} big />
		</>
	);
};

const LINT_KEYS: Key[] = [
	{at: SC.icpc[0], pose: POSES.wave},
	{at: k5('siglas'), pose: POSES.point},
	{at: k5('equipos'), pose: POSES.wow},
	{at: k5('comunicarte'), pose: POSES.point},
	{at: k5('equipo'), pose: POSES.cheer},
	{at: k5('reloj'), pose: POSES.oops},
	{at: k6('nacional'), pose: POSES.pointUp},
	{at: k6('mejores'), pose: POSES.pointUp},
	{at: k6('trabajo'), pose: POSES.cheer},
];

export const IcpcReel: VReelDef = {
	id: 'Reel3Icpc',
	n: 'la icpc',
	title: 'La ICPC: de tu país a la final mundial',
	hl: ['ICPC:'],
	parts: [...voiceParts(['s05', 's06']), FINAL],
	Body,
	hook: 'h3',
	lint: LINT_KEYS,
};
