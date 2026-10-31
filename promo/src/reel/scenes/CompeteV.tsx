import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO} from '../../theme';
import {inCubic, outExpo, pop, tween} from '../../lib';
import {EventTag, GlitchBurst, GridBg, Label, Photo, RiseWords} from '../../components';
import {SYNC} from '../../timeline';
import {TravelMap} from '../../scenes/Compete';
import {Backdrop, Big, Card, Flash, Shade, Shift} from '../ui';
import {OFF, RW, T} from '../timeline';

/* ============================================================ A · internal contests (Reel frames) */

// `pos` picks the part of each 3:4 photo that the polaroid keeps (faces + diplomas / prizes).
const PILE = [
	{src: 'interna-basica.jpg', at: 480, tilt: 3.2, dx: 18, dy: 8, pos: '50% 70%', note: 'Nivel básico · ganadores'},
	{src: 'interna-avanzado-1.jpg', at: 502, tilt: -2.8, dx: -16, dy: -6, pos: '50% 92%', note: 'Nivel avanzado · ganadores'},
	{src: 'interna-avanzado-2.jpg', at: 524, tilt: 2, dx: 8, dy: 0, pos: '50% 82%', note: 'Nivel avanzado · ganadores'},
];
const POL_W = 670;
const POL_H = 790;

const Pile: React.FC = () => {
	const f = useCurrentFrame();
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
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,6,0.94) 0%, rgba(5,7,6,0.8) 30%, rgba(5,7,6,0.4) 70%, rgba(5,7,6,0.75) 100%)'}} />
			{PILE.map((p, i) => {
				if (f < p.at) return null;
				const s = pop(f, p.at, 16, 170, 0.8);
				const settle = tween(f, p.at, p.at + 90, 0, 1);
				return (
					<div
						key={p.src}
						style={{
							position: 'absolute',
							left: (RW - POL_W) / 2 + p.dx,
							top: 640 + p.dy,
							width: POL_W,
							height: POL_H,
							transform: `translate(${(1 - s) * 240}px, ${(1 - s) * 520}px) rotate(${p.tilt * (1 + (1 - s) * 3) - settle}deg)`,
							border: '14px solid #F4F4F0',
							borderBottomWidth: 82,
							background: '#000',
							boxShadow: '0 30px 90px rgba(0,0,0,0.65)',
							zIndex: i,
						}}
					>
						<Img src={staticFile(`photos/${p.src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.pos}} />
						<div style={{position: 'absolute', left: 8, right: 8, bottom: -66, fontFamily: MONO, fontSize: 30, fontWeight: 700, color: '#161a17', letterSpacing: '0.02em'}}>{p.note}</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

const SegmentInternal: React.FC = () => {
	const f = useCurrentFrame();
	const out = tween(f, 540, 550, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{opacity: 1 - out}}>
			<Pile />
			<div style={{position: 'absolute', left: 64, top: 276, width: 960}}>
				<Label color={C.green} size={28}>
					// 02 · Maratones
				</Label>
				<Big size={92} style={{marginTop: 20}}>
					<RiseWords text="Organizamos maratones internas." start={T.internas} stagger={4} highlight={['internas']} />
				</Big>
			</div>
			{/* above the polaroids, which carry their own z-order */}
			<AbsoluteFill style={{zIndex: 5}}>
				<EventTag start={484} title="Maratón interna · UCEVA 2026" x={64} y={536} size={30} cps={200} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ============================================================ B · travel graph (16:9 clock, see <Shift>) */

type Shot = {src: string; at: number; until: number; tag: string; sub: string} & ({kind: 'card'; h: number; top: number; pos: string; tilt: number} | {kind: 'full'; pos: string; z: [number, number]});

// Landscape shots and wide groups become framed cards (nobody is cropped out);
// portrait-friendly shots fill the frame.
const CITY_SHOTS: Shot[] = [
	{kind: 'card', src: 'utp-open.jpg', at: SYNC.pereira, until: SYNC.cali, h: 940, top: 408, pos: '0% 50%', tilt: -1.2, tag: 'UTP Open', sub: 'Universidad Tecnológica de Pereira'},
	{kind: 'card', src: 'nacional-javeriana-cali.jpg', at: SYNC.cali, until: SYNC.bogota, h: 940, top: 408, pos: '50% 100%', tilt: 1.2, tag: 'Maratón Nacional de Programación 2026', sub: 'ACIS · REDIS — Javeriana Cali'},
	{kind: 'full', src: 'regional-2025-vuelo.jpg', at: SYNC.bogota, until: SYNC.icpc, pos: '20% 50%', z: [1.0, 1.12], tag: 'Rumbo a Bogotá', sub: 'Maratón Regional ICPC 2025'},
	{kind: 'full', src: 'regional-2025-auditorio.jpg', at: SYNC.icpc, until: SYNC.icpc + 19, pos: '28% 50%', z: [1.02, 1.1], tag: 'Maratón Regional ICPC 2025', sub: 'Politécnico Grancolombiano · Bogotá'},
	{kind: 'card', src: 'regional-2025-equipo.jpg', at: SYNC.icpc + 19, until: 2000, h: 650, top: 500, pos: '50% 40%', tilt: -1.5, tag: 'Nuestro equipo · Regional ICPC 2025', sub: 'Bogotá'},
];

const SegmentTravel: React.FC = () => {
	const f = useCurrentFrame();
	const mapIn = tween(f, 806, 826, 0, 1, outExpo);
	const bigMapOut = tween(f, SYNC.pereira - 6, SYNC.pereira, 0, 1, inCubic);
	const miniIn = tween(f, SYNC.pereira, SYNC.pereira + 10, 0, 1, outExpo);
	const miniOut = tween(f, SYNC.icpc + 15, SYNC.icpc + 21);
	return (
		<AbsoluteFill>
			{f < SYNC.pereira && (
				<AbsoluteFill style={{background: C.bg, opacity: mapIn * (1 - bigMapOut)}}>
					<GridBg opacity={0.4} />
					<div style={{position: 'absolute', left: 64, top: 276, width: 960}}>
						<Label color={C.green} size={28}>
							// grafo de viajes
						</Label>
						<Big size={112} style={{marginTop: 20}}>
							<RiseWords text="Y salimos" start={SYNC.competir - 6} stagger={4} />
							<br />
							<RiseWords text="a competir." start={SYNC.competir + 2} stagger={4} highlight={['competir']} />
						</Big>
					</div>
					<div style={{position: 'absolute', left: 176, top: 720, transform: `scale(${0.9 + 0.1 * mapIn})`, transformOrigin: '40% 50%'}}>
						<TravelMap k={230} fs={33} />
					</div>
				</AbsoluteFill>
			)}
			{CITY_SHOTS.map((s) =>
				f >= s.at && f < s.until ? (
					<AbsoluteFill key={s.src}>
						{s.kind === 'full' ? (
							<>
								<Photo src={s.src} from={s.at} dur={s.until - s.at} pos={s.pos} z={s.z} grade={0.14} />
								<Shade top={0.6} bottom={0.55} />
							</>
						) : (
							<>
								<Backdrop src={s.src} from={s.at} dur={60} />
								<Card src={s.src} from={s.at} dur={60} h={s.h} top={s.top} pos={s.pos} tilt={s.tilt} enter="cut" />
							</>
						)}
						<EventTag start={s.at} title={s.tag} sub={s.sub} x={56} y={268} cps={400} size={30} />
						<Flash at={s.at} />
					</AbsoluteFill>
				) : null,
			)}
			{f >= SYNC.pereira && f < SYNC.icpc + 21 && (
				<div
					style={{
						position: 'absolute',
						right: 150,
						top: 1010,
						padding: '20px 24px 16px',
						background: 'rgba(5,7,6,0.86)',
						border: `1px solid ${C.line2}`,
						opacity: miniIn * (1 - miniOut),
						transform: `translateY(${(1 - miniIn) * 30}px)`,
					}}
				>
					<Label size={20} color={C.dim} style={{marginBottom: 10}}>
						salidas desde Tuluá
					</Label>
					<TravelMap k={104} mini fs={20} />
				</div>
			)}
		</AbsoluteFill>
	);
};

export const CompeteV: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{f < 550 && <SegmentInternal />}
			{f >= 540 && (
				<Shift by={OFF.l07}>
					<SegmentTravel />
				</Shift>
			)}
			<GlitchBurst at={T.icpc - 2} len={3} intensity={0.7} />
		</AbsoluteFill>
	);
};
