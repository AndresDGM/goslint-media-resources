import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {clamp, inCubic, outCubic, outExpo, pop, tween} from '../lib';
import {EventTag, GlitchBurst, GridBg, Label, Photo, RiseWords, WipeBar} from '../components';
import {SYNC} from '../timeline';

/* ============================================================ A · internal contests (photo pile) */

const PILE = [
	{src: 'interna-basica.jpg', at: 660, tilt: 4, dx: 40, dy: 10, pos: '50% 50%'},
	{src: 'interna-avanzado-1.jpg', at: 705, tilt: -3.5, dx: -30, dy: -10, pos: '50% 60%'},
	{src: 'interna-avanzado-2.jpg', at: 750, tilt: 2.5, dx: 10, dy: 0, pos: '50% 45%'},
];

const Pile: React.FC = () => {
	const f = useCurrentFrame();
	const cardH = 820;
	const cardW = cardH * 0.75;
	const cur = [...PILE].reverse().find((p) => f >= p.at) ?? PILE[0];
	return (
		<AbsoluteFill>
			{PILE.map((p) => {
				const o = tween(f, p.at, p.at + 8);
				if (f < p.at) return null;
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
				const settle = tween(f, p.at, p.at + 150, 0, 1);
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
	const out = tween(f, 800, 812, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{opacity: 1 - out}}>
			<Pile />
			<div style={{position: 'absolute', left: 130, top: 250, width: 900}}>
				<Label color={C.green}>// 02 · Maratones</Label>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, lineHeight: 1.0, letterSpacing: '-0.04em', color: C.white, marginTop: 26}}>
					<RiseWords text="Organizamos maratones internas." start={SYNC.internas} stagger={4} highlight={['internas']} />
				</div>
			</div>
			{f < 705 ? (
				<EventTag start={664} title="Maratón interna · UCEVA 2026" sub="Nivel básico · ganadores" x={130} y={690} />
			) : (
				<EventTag start={707} title="Maratón interna · UCEVA 2026" sub="Nivel avanzado · ganadores" x={130} y={690} />
			)}
		</AbsoluteFill>
	);
};

/* ============================================================ B · travel graph */

const CITIES = {
	tulua: {name: 'Tuluá', lat: 4.084, lon: -76.195},
	pereira: {name: 'Pereira', lat: 4.813, lon: -75.696},
	cali: {name: 'Cali', lat: 3.452, lon: -76.532},
	bogota: {name: 'Bogotá', lat: 4.711, lon: -74.072},
};
type CityKey = keyof typeof CITIES;
const VISIT: Record<Exclude<CityKey, 'tulua'>, number> = {pereira: SYNC.pereira, cali: SYNC.cali, bogota: SYNC.bogota};

const proj = (lat: number, lon: number, k: number) => [(lon + 76.9) * k, (5.25 - lat) * k] as const;

/** `at` = frame at which each city lights up; `fs` = label size (defaults follow `mini`). */
export const TravelMap: React.FC<{k: number; mini?: boolean; at?: Record<Exclude<CityKey, 'tulua'>, number>; fs?: number}> = ({k, mini, at: visit = VISIT, fs: fsProp}) => {
	const f = useCurrentFrame();
	const w = 3.35 * k;
	const h = 2.25 * k;
	const r = mini ? 9 : 20;
	const fs = fsProp ?? (mini ? 17 : 34);
	const [tx, ty] = proj(CITIES.tulua.lat, CITIES.tulua.lon, k);
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
			{(Object.keys(visit) as (keyof typeof VISIT)[]).map((c) => {
				const [x, y] = proj(CITIES[c].lat, CITIES[c].lon, k);
				const t = tween(f, visit[c] - 6, visit[c] + 8, 0, 1, outCubic);
				return (
					<g key={c}>
						<line x1={tx} y1={ty} x2={x} y2={y} stroke="rgba(255,255,255,0.14)" strokeWidth={mini ? 2 : 3} strokeDasharray={mini ? '4 6' : '8 10'} />
						<line x1={tx} y1={ty} x2={tx + (x - tx) * t} y2={ty + (y - ty) * t} stroke={C.green} strokeWidth={mini ? 3 : 5} />
					</g>
				);
			})}
			{(Object.keys(CITIES) as CityKey[]).map((c) => {
				const [x, y] = proj(CITIES[c].lat, CITIES[c].lon, k);
				const lit = c === 'tulua' || f >= visit[c as keyof typeof VISIT] + 6;
				const home = c === 'tulua';
				const pulse = home ? (f % 30) / 30 : 0;
				const labelLeft = c === 'cali' || c === 'tulua';
				return (
					<g key={c} transform={`translate(${x} ${y})`}>
						{home && <circle r={r + pulse * r * 2.4} fill="none" stroke={C.green} strokeOpacity={1 - pulse} strokeWidth={2} />}
						<circle r={r} fill={lit ? C.green : C.panel2} stroke={lit ? C.green : 'rgba(255,255,255,0.4)'} strokeWidth={mini ? 2 : 3} />
						<text
							x={labelLeft ? -r - (mini ? 8 : 16) : r + (mini ? 8 : 16)}
							dy={fs * 0.35}
							textAnchor={labelLeft ? 'end' : 'start'}
							fontFamily={MONO}
							fontSize={fs}
							fontWeight={700}
							fill={lit ? C.white : C.dim}
						>
							{CITIES[c].name.toUpperCase()}
							{home && !mini ? ' · UCEVA' : ''}
						</text>
					</g>
				);
			})}
		</svg>
	);
};

const CITY_SHOTS = [
	{src: 'utp-open.jpg', at: SYNC.pereira, until: SYNC.cali, pos: '50% 0%', z: [1.0, 1.05] as [number, number], tag: 'UTP Open', sub: 'Universidad Tecnológica de Pereira'},
	{src: 'nacional-javeriana-cali.jpg', at: SYNC.cali, until: SYNC.bogota, pos: '50% 74%', z: [1.0, 1.08] as [number, number], tag: 'Maratón Nacional de Programación 2026', sub: 'ACIS · REDIS — Javeriana Cali'},
	{src: 'regional-2025-vuelo.jpg', at: SYNC.bogota, until: SYNC.icpc, pos: '50% 40%', z: [1.0, 1.15] as [number, number], tag: 'Rumbo a Bogotá', sub: 'Maratón Regional ICPC 2025'},
	{src: 'regional-2025-auditorio.jpg', at: SYNC.icpc, until: 990, pos: '50% 60%', z: [1.02, 1.12] as [number, number], tag: 'Maratón Regional ICPC 2025', sub: 'Politécnico Grancolombiano · Bogotá'},
	{src: 'regional-2025-equipo.jpg', at: 990, until: 1050, pos: '50% 45%', z: [1.0, 1.07] as [number, number], tag: 'Nuestro equipo · Regional ICPC 2025', sub: 'Bogotá'},
];

const SegmentTravel: React.FC = () => {
	const f = useCurrentFrame();
	const mapIn = tween(f, 806, 826, 0, 1, outExpo);
	const bigMapOut = tween(f, SYNC.pereira - 6, SYNC.pereira, 0, 1, inCubic);
	const miniIn = tween(f, SYNC.pereira, SYNC.pereira + 10, 0, 1, outExpo);
	const miniOut = tween(f, 984, 994);
	return (
		<AbsoluteFill>
			{f < SYNC.pereira && (
				<AbsoluteFill style={{background: C.bg, opacity: mapIn * (1 - bigMapOut)}}>
					<GridBg opacity={0.4} />
					<div style={{position: 'absolute', left: 130, top: 300, width: 700}}>
						<Label color={C.green}>// grafo de viajes</Label>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, lineHeight: 1.0, letterSpacing: '-0.04em', color: C.white, marginTop: 26}}>
							<RiseWords text="Y salimos a competir." start={SYNC.competir} stagger={4} highlight={['competir']} />
						</div>
					</div>
					<div style={{position: 'absolute', left: 830, top: 170, transform: `scale(${0.9 + 0.1 * mapIn})`}}>
						<TravelMap k={300} />
					</div>
				</AbsoluteFill>
			)}
			{CITY_SHOTS.map((s) =>
				f >= s.at && f < s.until ? (
					<AbsoluteFill key={s.src}>
						<Photo src={s.src} from={s.at} dur={s.until - s.at} pos={s.pos} z={s.z} grade={0.18} />
						<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)'}} />
						<EventTag start={s.at} title={s.tag} sub={s.sub} x={96} y={110} cps={300} />
						<AbsoluteFill style={{background: C.white, opacity: interpolate(f, [s.at, s.at + 4], [0.55, 0], clamp)}} />
					</AbsoluteFill>
				) : null,
			)}
			{f >= SYNC.pereira && f < 994 && (
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
					<TravelMap k={108} mini />
				</div>
			)}
		</AbsoluteFill>
	);
};

/* ============================================================ C · mosaic */

const MOSAIC = [
	'interna-basica.jpg',
	'utp-open.jpg',
	'interna-avanzado-1.jpg',
	'regional-2025-auditorio.jpg',
	'nacional-javeriana-cali.jpg',
	'regional-2025-vuelo.jpg',
	'interna-avanzado-2.jpg',
	'regional-2025-equipo.jpg',
];

const Mosaic: React.FC = () => {
	const f = useCurrentFrame();
	const textP = pop(f, 1082, 16, 180, 0.7);
	const out = tween(f, 1122, 1140, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{MOSAIC.map((src, i) => {
				const at = 1050 + i * 3;
				const p = pop(f, at, 14, 220, 0.6);
				const col = i % 4;
				const row = Math.floor(i / 4);
				return (
					<div
						key={src}
						style={{
							position: 'absolute',
							left: col * 480,
							top: row * 540,
							width: 480,
							height: 540,
							overflow: 'hidden',
							opacity: Math.min(1, p * 1.5) * (1 - out),
							transform: `scale(${(0.7 + 0.3 * p) * (1 - out * 0.15)})`,
							borderRight: '4px solid #000',
							borderBottom: '4px solid #000',
						}}
					>
						<Img src={staticFile(`photos/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) brightness(0.62)'}} />
					</div>
				);
			})}
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out}}>
				<div
					style={{
						background: C.green,
						color: '#001a0c',
						padding: '26px 54px',
						fontFamily: SANS,
						fontWeight: 850,
						fontSize: 88,
						letterSpacing: '-0.035em',
						transform: `scale(${0.6 + 0.4 * textP}) rotate(${-2 * textP}deg)`,
						opacity: Math.min(1, textP * 2),
						boxShadow: '0 30px 100px rgba(0,0,0,0.6)',
					}}
				>
					Cada maratón, un problema nuevo.
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const Compete: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{f < 812 && <SegmentInternal />}
			{f >= 804 && f < 1050 && <SegmentTravel />}
			{f >= 1048 && <Mosaic />}
			<GlitchBurst at={SYNC.icpc - 2} len={3} intensity={0.7} />
			<GlitchBurst at={1048} len={4} intensity={0.8} />
			<WipeBar at={1128} dur={14} />
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [802, 808, 816], [0, 1, 0], clamp)}} />
		</AbsoluteFill>
	);
};

