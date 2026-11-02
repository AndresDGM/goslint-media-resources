import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {GridBg, Grain, LogoMark, Verdict, Vignette} from '../../components';
import {BASE, Lint, POSES, Pose} from '../../mascot';

/** Portada vertical (1080×1920) de cada reel. Se exporta con scripts/thumbnail.sh. */
export type CoverDef = {id: string; n: string; title: string; hl: string[]; photo?: string; pos?: string; chips?: ('AC' | 'WA' | 'TLE' | 'RTE')[]; pose: keyof typeof POSES};

export const COVERS: CoverDef[] = [
	{id: 'Portada1QueEs', n: '01', title: '¿Qué es la programación competitiva?', hl: ['competitiva?'], chips: ['AC'], pose: 'cheer'},
	{id: 'Portada2Jueces', n: '02', title: '¿Cómo funcionan los jueces en línea?', hl: ['jueces'], chips: ['WA', 'TLE', 'RTE', 'AC'], pose: 'wow'},
	{id: 'Portada3Icpc', n: '03', title: 'La ICPC: de tu país a la final mundial', hl: ['ICPC:'], photo: '2025-regional-icpc-equipo-computador.jpg', pos: '50% 40%', pose: 'pointUp'},
	{id: 'Portada4Colombia', n: '04', title: 'Programación competitiva en Colombia', hl: ['Colombia'], photo: '2024-nacional-icpc-grupal.jpg', pos: '50% 50%', pose: 'cheer'},
	{id: 'Portada5Uceva', n: '05', title: 'Programación competitiva en la UCEVA', hl: ['UCEVA'], photo: '2026-maraton-interna-participantes-2.jpg', pos: '50% 50%', pose: 'wave'},
];

export const Cover: React.FC<{c: CoverDef}> = ({c}) => {
	const pose: Pose = {...BASE, ...POSES[c.pose]};
	const spots = [
		[90, 1130, -8],
		[700, 1040, 7],
		[120, 1380, 5],
		[720, 1300, -6],
	];
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.5} size={80} />
			<div style={{position: 'absolute', left: 60, top: 260, display: 'flex', alignItems: 'center', gap: 20}}>
				<LogoMark height={84} />
				<span style={{fontFamily: MONO, fontSize: 32, letterSpacing: '0.14em', color: C.green, textTransform: 'uppercase'}}>{`goslint · ${c.n}`}</span>
			</div>
			<div style={{position: 'absolute', left: 60, right: 60, top: 400, fontFamily: SANS, fontWeight: 880, fontSize: 128, lineHeight: 0.96, letterSpacing: '-0.05em', color: C.white, textShadow: '0 8px 40px rgba(0,0,0,0.8)'}}>
				{c.title.split(' ').map((w, i) => (
					<span key={i} style={{color: c.hl.includes(w) ? C.green : C.white}}>{w} </span>
				))}
			</div>
			{c.photo && (
				<div style={{position: 'absolute', left: 60, top: 900, width: 760, background: '#F4F6F4', padding: '14px 14px 46px 14px', transform: 'rotate(-3deg)', boxShadow: '0 40px 100px rgba(0,0,0,0.7)'}}>
					<Img src={staticFile(`photos/${c.photo}`)} style={{width: '100%', height: 430, objectFit: 'cover', objectPosition: c.pos}} />
				</div>
			)}
			{(c.chips ?? []).map((k, i) => (
				<div key={k} style={{position: 'absolute', left: spots[i][0], top: spots[i][1], transform: `rotate(${spots[i][2]}deg)`}}>
					<Verdict kind={k} size={c.chips!.length === 1 ? 120 : 88} />
				</div>
			))}
			<div style={{position: 'absolute', left: (c.photo ? 860 : 540) - 380, top: c.photo ? 1560 : 1420, width: 760, height: 260, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,192,99,0.45), rgba(0,192,99,0))'}} />
			<Lint x={c.photo ? 860 : 540} y={c.photo ? 1720 : 1660} scale={c.photo ? 12 : 18} pose={pose} facing={c.photo ? -1 : 1} />
			<Vignette strength={0.45} />
			<Grain opacity={0.06} />
		</AbsoluteFill>
	);
};
