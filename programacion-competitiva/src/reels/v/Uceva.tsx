import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {outExpo, pop, tween} from '../../lib';
import {M, SC} from '../../timeline';
import {Chip, LogoMark, RiseWords, Wordmark} from '../../components';
import {POSES} from '../../mascot';
import {Big, FINAL, voiceParts, Hit, In, Kicker, PhotoV, VReelDef} from './frame';

/** Reel 05 · Programación competitiva en la UCEVA (segmento s08). Maquetación vertical 1080×1920. */
const k = (m: string) => M('s08', m);

/** Hecho con barra verde (lista de la sección de maratones). */
const Fact: React.FC<{at: number; out: number; y: number; t: string}> = ({at, out, y, t}) => (
	<In at={at} out={out} x={60} y={y} w={960} from="right" exit="right">
		<div style={{background: 'rgba(8,11,9,0.95)', borderLeft: `10px solid ${C.green}`, padding: '22px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', fontFamily: SANS, fontWeight: 760, fontSize: 42, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.15}}>
			{t}
		</div>
	</In>
);

/** Pilar de investigación (tarjeta del último bloque). */
const Pillar: React.FC<{at: number; out: number; y: number; g: string; t: string; accent?: string}> = ({at, out, y, g, t, accent = C.line2}) => {
	const f = useCurrentFrame();
	if (f < at - 2 || f >= out) return null;
	const p = pop(f, at, 15, 210, 0.6);
	return (
		<div style={{position: 'absolute', left: 60, top: y + (1 - p) * 40, width: 960, height: 120, opacity: Math.min(1, p * 1.5), background: C.panel, border: `3px solid ${accent}`, display: 'flex', alignItems: 'center', gap: 34, padding: '0 36px', boxSizing: 'border-box'}}>
			<span style={{fontFamily: MONO, fontWeight: 800, fontSize: 60, color: C.green, minWidth: 110}}>{g}</span>
			<span style={{fontFamily: SANS, fontWeight: 780, fontSize: 44, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.1}}>{t}</span>
		</div>
	);
};

const verbs = [
	{at: k('aprender'), t: 'aprendemos', src: 'entrenamiento-sala-1.jpg', pos: '50% 40%'},
	{at: k('entrenar'), t: 'entrenamos', src: 'entrenamiento-sala-2.jpg', pos: '50% 50%'},
	{at: k('participar'), t: 'participamos', src: '2026-maraton-interna-sala.jpg', pos: '50% 60%'},
];

const Body: React.FC = () => {
	const f = useCurrentFrame();
	const [, b] = SC.uceva;
	const empezar = k('empezar');
	const lejos = k('lejos');
	const goslint = k('goslint');
	const aprender = k('aprender');
	const maratones = k('maratones');
	const familiar = k('familiar');
	const d2024 = k('d2024');
	const d2026 = k('d2026');
	const icpc = k('icpc');
	const camp = k('camp');
	const nosolo = k('nosolo');
	const logoP = tween(f, goslint - 4, goslint + 36, 0, 1, outExpo);
	const activeVerb = verbs.filter((v) => f >= v.at - 4).length - 1;

	return (
		<>
			{/* 1 · ¿cómo puedo empezar? */}
			<In at={empezar} out={lejos - 2} x={60} y={450} w={960} from="zoom" exit="left">
				<Kicker>{'// en la uceva'}</Kicker>
				<Big size={100} style={{marginTop: 18, textAlign: 'center'}}>
					¿Cómo puedo empezar?
				</Big>
			</In>

			{/* 2 · ¡Muy cerca! + logo UCEVA + ubicación */}
			<In at={lejos} out={goslint - 12} x={60} y={520} w={960} from="zoom" exit="left">
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
					<Big size={140} style={{textAlign: 'center'}}>
						¡Muy <span style={{color: C.green}}>cerca!</span>
					</Big>
					<Img src={staticFile('brand/uceva.png')} style={{height: 150}} />
					<Chip size={40} border={C.green}>
						<span style={{color: C.green}}>●</span> Tuluá · Valle del Cauca
					</Chip>
				</div>
			</In>
			<Hit at={lejos + 2} x={540} y={760} />

			{/* 3 · GOSLINT, semillero de investigación */}
			<In at={goslint - 4} out={aprender - 12} x={60} y={450} w={960} from="down" exit="left">
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
					<Kicker>{'// en la uceva'}</Kicker>
					<LogoMark height={260} p={logoP} glow={f > goslint + 36 ? 14 + Math.sin(f / 6) * 5 : 0} />
					<Wordmark height={100} />
					<div style={{fontFamily: SANS, fontWeight: 620, fontSize: 50, color: C.white, letterSpacing: '-0.02em', textAlign: 'center', marginTop: 8}}>Semillero de investigación</div>
					<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.text, textAlign: 'center'}}>Ingeniería de Sistemas</div>
				</div>
			</In>
			<Hit at={goslint + 2} x={540} y={640} big />

			{/* 4 · aprendemos / entrenamos / participamos, cada una con su foto */}
			{f >= aprender - 12 && f < maratones - 12 && (
				<>
					<div style={{position: 'absolute', left: 60, top: 450, width: 960}}>
						{verbs.map((v, i) => (
							<div
								key={i}
								style={{
									fontFamily: SANS,
									fontWeight: 840,
									fontSize: 84,
									lineHeight: 1.05,
									letterSpacing: '-0.045em',
									color: i === activeVerb ? C.green : 'rgba(255,255,255,0.5)',
									opacity: f >= v.at - 4 ? 1 : 0,
									transform: `translateX(${(1 - pop(f, v.at - 4, 16, 220, 0.6)) * -60}px)`,
								}}
							>
								{v.t}
							</div>
						))}
					</div>
					{verbs.map((v, i) => (
						<In key={i} at={v.at - 4} out={maratones - 12} x={60 + i * 270} y={760 + (i % 2) * 40} from="zoom" exit="left">
							<PhotoV src={v.src} w={420} h={300} pos={v.pos} tilt={[-3, 2, -1.5][i]} />
						</In>
					))}
				</>
			)}

			{/* 5 · Maratones de Programación UCEVA */}
			<In at={maratones} out={d2024 - 12} x={60} y={450} w={960} from="up" exit="up">
				<Big size={84}>
					Maratones de Programación <span style={{color: C.green}}>UCEVA</span>
				</Big>
			</In>
			<In at={maratones + 6} out={familiar - 8} x={190} y={680} from="left" exit="left">
				<PhotoV src="2026-maraton-interna-participantes-1.jpg" w={700} h={380} pos="50% 50%" />
			</In>
			<Hit at={maratones + 2} x={540} y={800} />
			<Fact at={familiar} out={d2024 - 12} y={690} t="Familiarizarte con los problemas" />
			<Fact at={k('practicar')} out={d2024 - 12} y={810} t="Practicar" />
			<Fact at={k('vivir')} out={d2024 - 12} y={930} t="Vivir la dinámica de una competencia" />

			{/* 6 · XI Maratón 2024 */}
			<In at={d2024} out={d2026 - 12} x={60} y={480} w={960} from="zoom" exit="left">
				<div style={{display: 'flex', alignItems: 'flex-start', gap: 28}}>
					<PhotoV src="2024-maraton-interna-poster.jpg" w={480} h={456} pos="50% 50%" tilt={-1.5} />
					<div style={{width: 452}}>
						<div style={{fontFamily: SANS, fontWeight: 880, fontSize: 170, letterSpacing: '-0.05em', color: C.green, lineHeight: 0.9}}>XI</div>
						<div style={{fontFamily: SANS, fontWeight: 760, fontSize: 54, color: C.white, letterSpacing: '-0.03em', marginTop: 14}}>Maratón 2024</div>
						<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.text, marginTop: 26, lineHeight: 1.25}}>viernes 22 de marzo de 2024</div>
						<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.text, marginTop: 10, lineHeight: 1.25}}>Sala de Sistemas A</div>
					</div>
				</div>
			</In>

			{/* 7 · XII Maratón 2026 */}
			<In at={d2026} out={icpc - 12} x={60} y={480} w={960} from="zoom" exit="right">
				<div style={{display: 'flex', alignItems: 'flex-start', gap: 28}}>
					<div style={{width: 492}}>
						<div style={{fontFamily: SANS, fontWeight: 880, fontSize: 170, letterSpacing: '-0.05em', color: C.green, lineHeight: 0.9}}>XII</div>
						<div style={{fontFamily: SANS, fontWeight: 760, fontSize: 54, color: C.white, letterSpacing: '-0.03em', marginTop: 14}}>Maratón 2026</div>
						<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.text, marginTop: 26, lineHeight: 1.25}}>viernes 27 de marzo de 2026</div>
						<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.text, marginTop: 10, lineHeight: 1.25}}>Salas de Sistemas A y E</div>
					</div>
					<PhotoV src="2026-maraton-interna-poster.jpg" w={440} h={520} pos="50% 50%" tilt={1.5} />
				</div>
			</In>
			<Hit at={d2026 + 2} x={540} y={900} big />

			{/* 8 · competencias ICPC, tres fotos que entran una a una */}
			<In at={icpc + 4} out={camp - 12} x={60} y={450} w={960} from="up" exit="up">
				<Big size={56}>
					Equipos GOSLINT en la <span style={{color: C.green}}>ICPC</span>
				</Big>
			</In>
			<In at={icpc} out={camp - 12} x={60} y={540} from="left" exit="left">
				<PhotoV src="2026-nacional-icpc-equipo.jpg" w={420} h={300} pos="50% 40%" caption="Nacional ACIS-REDIS 2026" tilt={-2} />
			</In>
			<In at={icpc + 26} out={camp - 12} x={500} y={540} from="right" exit="right">
				<PhotoV src="2025-regional-icpc-poli.jpg" w={460} h={300} pos="50% 55%" caption="Regional ICPC 2025 · Bogotá" tilt={1.5} />
			</In>
			<In at={icpc + 48} out={camp - 12} x={220} y={940} from="down" exit="down">
				<PhotoV src="2025-regional-icpc-banner.jpg" w={640} h={190} pos="50% 45%" caption="Regional ICPC 2025" tilt={-1} />
			</In>
			<Hit at={icpc + 2} x={540} y={600} />

			{/* 9 · Training Camp de Medellín */}
			<In at={camp} out={nosolo - 12} x={60} y={450} w={960} from="zoom" exit="left">
				<Kicker>{'// entrenamiento presencial'}</Kicker>
				<div style={{marginTop: 14}}>
					<PhotoV src="2026-training-camp-medellin-1.jpg" w={960} h={490} pos="50% 60%" caption="Training Camp · Medellín 2026" />
				</div>
			</In>
			<Hit at={camp + 2} x={540} y={760} />

			{/* 10 · también investigamos */}
			{f >= nosolo - 4 && (
				<div style={{position: 'absolute', left: 60, top: 450, width: 960}}>
					<Kicker>{'// goslint no se limita a competir'}</Kicker>
					<div style={{fontFamily: SANS, fontWeight: 840, fontSize: 84, letterSpacing: '-0.045em', color: C.white, marginTop: 12}}>
						<RiseWords text="También investigamos" start={nosolo + 4} highlight={['investigamos']} />
					</div>
				</div>
			)}
			<Pillar at={k('proyectos')} out={b} y={640} g="∑" t="Proyectos de investigación" />
			<Pillar at={k('herramientas')} out={b} y={790} g="</>" t="Herramientas de entrenamiento" />
			<Pillar at={k('tesis')} out={b} y={940} g="◆" t="Trabajos de grado" accent={C.green} />
			<Hit at={nosolo + 2} x={540} y={800} />
		</>
	);
};

export const UcevaReel: VReelDef = {
	id: 'Reel5Uceva',
	n: 'en la uceva',
	title: 'Programación competitiva en la UCEVA',
	hl: ['UCEVA'],
	parts: [...voiceParts(['s08']), FINAL],
	Body,
	hook: 'h5',
	lint: [
		{at: SC.uceva[0], pose: POSES.think},
		{at: k('lejos'), pose: POSES.cheer},
		{at: k('goslint'), pose: POSES.point},
		{at: k('maratones'), pose: {...POSES.pointUp}},
		{at: k('d2026'), pose: POSES.wow},
		{at: k('icpc'), pose: POSES.cheer},
		{at: k('nosolo'), pose: POSES.point},
		{at: k('proyectos'), pose: {...POSES.pointUp}},
		{at: k('tesis'), pose: POSES.cheer},
	],
};
