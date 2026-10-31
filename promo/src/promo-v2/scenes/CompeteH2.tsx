import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, SANS} from '../../theme';
import {clamp, inCubic, outExpo, pop, tween} from '../../lib';
import {EventTag, GlitchBurst, GridBg, Label, Photo, RiseWords} from '../../components';
import {TravelMap} from '../../scenes/Compete';
import {CITY_AT, PILE_AT, T} from '../../reel-v2/timeline';

/* ============================================================ A · «Organizamos nuestras propias maratones» */

const PILE = [
	{src: 'interna-basica.jpg', at: PILE_AT[0], tilt: 4, dx: 40, dy: 10, pos: '50% 50%'},
	{src: 'interna-avanzado-1.jpg', at: PILE_AT[1], tilt: -3.5, dx: -30, dy: -10, pos: '50% 60%'},
	{src: 'interna-avanzado-2.jpg', at: PILE_AT[2], tilt: 2.5, dx: 10, dy: 0, pos: '50% 45%'},
];
const TRAVEL_IN = T.ySalimos - 6;

const Pile: React.FC = () => {
	const f = useCurrentFrame();
	const cardH = 820;
	const cardW = cardH * 0.75;
	const cur = [...PILE].reverse().find((p) => f >= p.at) ?? PILE[0];
	return (
		<AbsoluteFill>
			{PILE.map((p) => {
				if (f < p.at) return null;
				const o = tween(f, p.at, p.at + 8);
				return (
					<AbsoluteFill key={p.src} style={{opacity: p === cur ? o : p.at < cur.at ? 1 - tween(f, cur.at, cur.at + 8) : 0}}>
						<Img src={staticFile(`photos/blur/${p.src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.15)'}} />
					</AbsoluteFill>
				);
			})}
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,7,6,0.92) 0%, rgba(5,7,6,0.75) 45%, rgba(5,7,6,0.35) 100%)'}} />
			{PILE.map((p, i) => {
				if (f < p.at) return null;
				const s = pop(f, p.at, 16, 170, 0.8);
				const settle = tween(f, p.at, p.at + 90, 0, 1);
				return (
					<div
						key={p.src}
						style={{
							position: 'absolute',
							left: 1920 - cardW - 190 + p.dx,
							top: (1080 - cardH) / 2 + p.dy,
							width: cardW,
							height: cardH,
							transform: `translate(${(1 - s) * 500}px, ${(1 - s) * -80}px) rotate(${p.tilt * (1 + (1 - s) * 3) - settle}deg)`,
							border: '10px solid #F4F4F0',
							borderBottomWidth: 54,
							background: '#000',
							boxShadow: '0 30px 90px rgba(0,0,0,0.65)',
							zIndex: i,
						}}
					>
						<Img src={staticFile(`photos/${p.src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.pos}} />
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

const SegmentInternal: React.FC = () => {
	const f = useCurrentFrame();
	const out = tween(f, TRAVEL_IN, TRAVEL_IN + 10, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{opacity: 1 - out}}>
			<Pile />
			<div style={{position: 'absolute', left: 130, top: 200, width: 920}}>
				<Label color={C.green}>// 02 · Maratones</Label>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, lineHeight: 1.0, letterSpacing: '-0.04em', color: C.white, marginTop: 26}}>
					<RiseWords text="Organizamos" start={T.organizamos - 2} />
					<br />
					<RiseWords text="nuestras propias" start={T.nuestras - 2} stagger={T.propias - T.nuestras} />
					<br />
					<RiseWords text="maratones." start={T.maratones - 2} highlight={['maratones']} />
				</div>
			</div>
			{f < PILE_AT[1] ? (
				<EventTag start={T.organizamos + 2} title="Maratón interna · UCEVA 2026" sub="Nivel básico · ganadores" x={130} y={720} cps={200} />
			) : (
				<EventTag start={PILE_AT[1] + 2} title="Maratón interna · UCEVA 2026" sub="Nivel avanzado · ganadores" x={130} y={720} cps={400} />
			)}
		</AbsoluteFill>
	);
};

/* ============================================================ B · «…y salimos a competir en Pereira, Cali y Bogotá, en la Regional ICPC» */

// Each photo cuts in on the name of its city (16:9 framing of the original cut).
const CITY_SHOTS = [
	{src: 'utp-open.jpg', at: CITY_AT.pereira, until: CITY_AT.cali, pos: '50% 0%', z: [1.0, 1.05] as [number, number], tag: 'UTP Open', sub: 'Universidad Tecnológica de Pereira'},
	{src: 'nacional-javeriana-cali.jpg', at: CITY_AT.cali, until: CITY_AT.bogota, pos: '50% 74%', z: [1.0, 1.08] as [number, number], tag: 'Maratón Nacional de Programación 2026', sub: 'ACIS · REDIS — Javeriana Cali'},
	{src: 'regional-2025-vuelo.jpg', at: CITY_AT.bogota, until: CITY_AT.regional, pos: '50% 40%', z: [1.0, 1.1] as [number, number], tag: 'Rumbo a Bogotá', sub: 'Maratón Regional ICPC 2025'},
	{src: 'regional-2025-auditorio.jpg', at: CITY_AT.regional, until: CITY_AT.equipo, pos: '50% 60%', z: [1.02, 1.1] as [number, number], tag: 'Maratón Regional ICPC 2025', sub: 'Politécnico Grancolombiano · Bogotá'},
	{src: 'regional-2025-equipo.jpg', at: CITY_AT.equipo, until: Infinity, pos: '50% 45%', z: [1.0, 1.06] as [number, number], tag: 'Nuestro equipo · Regional ICPC 2025', sub: 'Bogotá'},
];
const VISIT = {pereira: CITY_AT.pereira, cali: CITY_AT.cali, bogota: CITY_AT.bogota};

const SegmentTravel: React.FC = () => {
	const f = useCurrentFrame();
	const mapIn = tween(f, TRAVEL_IN, TRAVEL_IN + 16, 0, 1, outExpo);
	const bigMapOut = tween(f, CITY_AT.pereira - 6, CITY_AT.pereira, 0, 1, inCubic);
	const miniIn = tween(f, CITY_AT.pereira, CITY_AT.pereira + 10, 0, 1, outExpo);
	const miniOut = tween(f, CITY_AT.equipo - 4, CITY_AT.equipo + 2);
	return (
		<AbsoluteFill>
			{f < CITY_AT.pereira && (
				<AbsoluteFill style={{background: C.bg, opacity: mapIn * (1 - bigMapOut)}}>
					<GridBg opacity={0.4} />
					<div style={{position: 'absolute', left: 130, top: 300, width: 700}}>
						<Label color={C.green}>// grafo de viajes</Label>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, lineHeight: 1.0, letterSpacing: '-0.04em', color: C.white, marginTop: 26}}>
							<RiseWords text="Y salimos" start={T.ySalimos - 2} stagger={4} />
							<br />
							<RiseWords text="a competir." start={T.competir - 6} stagger={4} highlight={['competir']} />
						</div>
					</div>
					<div style={{position: 'absolute', left: 830, top: 170, transform: `scale(${0.9 + 0.1 * mapIn})`}}>
						<TravelMap k={300} at={VISIT} />
					</div>
				</AbsoluteFill>
			)}
			{CITY_SHOTS.map((s) =>
				f >= s.at && f < s.until ? (
					<AbsoluteFill key={s.src}>
						<Photo src={s.src} from={s.at} dur={Math.min(s.until, s.at + 60) - s.at} pos={s.pos} z={s.z} grade={0.18} />
						<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)'}} />
						<EventTag start={s.at} title={s.tag} sub={s.sub} x={96} y={110} cps={400} />
						<AbsoluteFill style={{background: C.white, opacity: interpolate(f, [s.at, s.at + 4], [0.55, 0], clamp)}} />
					</AbsoluteFill>
				) : null,
			)}
			{f >= CITY_AT.pereira && f < CITY_AT.equipo + 2 && (
				<div
					style={{
						position: 'absolute',
						right: 70,
						bottom: 150,
						padding: '22px 26px 18px',
						background: 'rgba(5,7,6,0.84)',
						border: `1px solid ${C.line2}`,
						opacity: miniIn * (1 - miniOut),
						transform: `translateY(${(1 - miniIn) * 30}px)`,
					}}
				>
					<Label size={16} color={C.faint} style={{marginBottom: 10}}>
						salidas desde Tuluá
					</Label>
					<TravelMap k={108} mini at={VISIT} />
				</div>
			)}
		</AbsoluteFill>
	);
};

export const CompeteH2: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{f < TRAVEL_IN + 10 && <SegmentInternal />}
			{f >= TRAVEL_IN && <SegmentTravel />}
			<GlitchBurst at={CITY_AT.regional - 2} len={3} intensity={0.7} />
		</AbsoluteFill>
	);
};
