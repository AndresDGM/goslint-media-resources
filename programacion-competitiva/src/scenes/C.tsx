import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {inCubic, inOutCubic, outCubic, pop, tween} from '../lib';
import {M, SC} from '../timeline';
import {BlurBg, ChapterTitle, Chip, CutFlash, EventTag, GlitchBurst, GridBg, Label, Photo, Polaroid, Spot, Sprite, WipeBar} from '../components';
import {Actor} from '../kit';
import {Emote, POSES} from '../mascot';
import {PixelBurst} from '../pixel';
import {Fact, PixelComputer} from './parts';
import {ContestClock} from './parts';

/* ================================================================== 04 · la ICPC */

const ACRO = [
	{w: 'International', k: 'internacional'},
	{w: 'Collegiate', k: 'universitaria'},
	{w: 'Programming', k: 'de programación'},
	{w: 'Contest', k: 'competencia'},
];

export const Icpc: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.icpc;
	const k = (m: string) => M('s05', m);
	const icpc = k('icpc');
	const siglas = k('siglas');
	const equipos = k('equipos');
	const uncomp = k('uncomp');
	const si = k('si');
	const reloj = k('reloj');
	const acroOut = tween(f, equipos - 14, equipos - 2, 0, 1, inCubic);
	const photoIn = si - 6;
	const photoOut = k('comunicarte') - 8;
	const tasks = [
		{at: k('comunicarte'), t: '«¿Quién toma el B?»', who: 0},
		{at: k('repartir'), t: 'A · B · C repartidos', who: 1},
		{at: k('decidir'), t: 'primero el más fácil', who: 2},
	];
	// el equipo: Lint, Globín y Marco alrededor de un único computador
	const teamY = 900;
	const team = [
		{x: 690, at: equipos + 2},
		{x: 1220, at: equipos + 10},
		{x: 1420, at: equipos + 18},
	];
	const drop = (at: number) => tween(f, at, at + 12, -700, 0, outCubic);
	const cheer = f >= k('equipo');
	const bob = (s: number) => Math.round(Math.sin((f + s * 20) / 9) * 2) * 6;
	return (
		<AbsoluteFill>
			<GridBg opacity={0.45} size={90} />
			<ChapterTitle at={a + 6} n="04" label="la icpc" title="Una competencia mundial" highlight={['mundial']} out={equipos - 4} />
			{f < equipos && (
				<AbsoluteFill style={{opacity: 1 - acroOut}}>
					{f >= icpc - 2 && (
						<div style={{position: 'absolute', left: 110, top: 300, fontFamily: SANS, fontWeight: 880, fontSize: 230, letterSpacing: '-0.03em', color: C.white, lineHeight: 1}}>
							{'ICPC'.split('').map((ch, i) => {
								const p = pop(f, icpc + i * 3, 14, 220, 0.6);
								return (
									<span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - p) * 80}px)`, opacity: Math.min(1, p * 1.5), color: i % 2 ? C.green : C.white}}>
										{ch}
									</span>
								);
							})}
						</div>
					)}
					{ACRO.map((w, i) => {
						const at = siglas + i * 16;
						if (f < at - 2) return null;
						const p = pop(f, at, 16, 200, 0.6);
						return (
							<div key={i} style={{position: 'absolute', left: 770, top: 300 + i * 66, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 40}px)`, fontFamily: SANS, fontWeight: 760, fontSize: 52, color: C.white, letterSpacing: '-0.03em', whiteSpace: 'nowrap'}}>
								<span style={{color: C.green}}>{w.w[0]}</span>
								{w.w.slice(1)}
								<span style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, color: C.dim, marginLeft: 18}}>{w.k}</span>
							</div>
						);
					})}
					{f >= k('universitarios') - 2 && (
						<div style={{position: 'absolute', left: 116, top: 600, opacity: pop(f, k('universitarios'), 16, 200, 0.6)}}>
							<Chip size={30} border={C.green}>
								<span style={{color: C.green}}>●</span> para estudiantes universitarios
							</Chip>
						</div>
					)}
				</AbsoluteFill>
			)}
			{/* tres personas y un computador */}
			{f >= equipos - 4 && (
				<>
					<div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: SANS, fontWeight: 840, fontSize: 92, letterSpacing: '-0.045em', color: C.white, opacity: pop(f, equipos, 16, 200, 0.6)}}>
						3 estudiantes <span style={{color: C.dim}}>·</span> <span style={{color: f >= uncomp ? C.green : C.faint}}>1 computador</span>
					</div>
					<Spot x={960} y={720} r={420} amt={0.18} squash={0.5} />
					<div style={{position: 'absolute', left: 520, top: teamY, width: 1060, height: 12, background: '#2A322D'}} />
					<PixelComputer x={960} y={teamY} scale={8} at={uncomp} />
					{f >= team[1].at && <Sprite src={cheer ? 'globin_cheer.png' : f >= k('repartir') ? 'globin_point.png' : 'globin_idle.png'} x={team[1].x} y={teamY + drop(team[1].at)} w={cheer ? 19 : f >= k('repartir') ? 20 : 14} h={30} scale={8} bob={cheer ? Math.max(0, bob(1)) : 0} />}
					{f >= team[2].at && <Sprite src="marco_idle.png" x={team[2].x} y={teamY - 10 + drop(team[2].at) - bob(2)} w={26} h={45} scale={7} flip />}
					<Actor x={team[0].x} y={teamY} scale={8} enter={team[0].at - 12} keys={[{at: team[0].at, pose: POSES.wow}, {at: si, pose: POSES.cheer}, {at: k('comunicarte'), pose: POSES.point}, {at: k('decidir'), pose: POSES.think}, {at: k('equipo'), pose: POSES.cheer}, {at: reloj, pose: POSES.oops}]} hops={[k('equipo') + 2]} />
					{tasks.map((t, i) => {
						if (f < t.at - 2 || f >= reloj) return null;
						const p = pop(f, t.at, 16, 220, 0.6);
						const x = team[t.who].x;
						return (
							<div key={i} style={{position: 'absolute', left: x - 170, width: 340, top: 470 + (1 - p) * 20, opacity: Math.min(1, p * 1.5) * (1 - tween(f, reloj - 8, reloj)), textAlign: 'center'}}>
								<div style={{display: 'inline-block', background: C.white, color: '#0A0F0C', fontFamily: SANS, fontWeight: 760, fontSize: 26, padding: '12px 18px', boxShadow: '6px 6px 0 rgba(0,0,0,0.6)'}}>{t.t}</div>
							</div>
						);
					})}
					{cheer && f < reloj + 30 && <PixelBurst f={f} at={k('equipo') + 2} x={960} y={600} count={24} power={18} />}
					{f >= reloj - 4 && (
						<div style={{position: 'absolute', left: 0, right: 0, top: 300, opacity: pop(f, reloj, 16, 200, 0.6)}}>
							<ContestClock at={reloj} x={960} y={110} size={84} speed={900} start={4 * 3600 + 59 * 60 + 59} color={C.amber} />
						</div>
					)}
				</>
			)}
			{/* foto real: tres personas, un computador */}
			{f >= photoIn && f < photoOut && (
				<AbsoluteFill style={{opacity: Math.min(tween(f, photoIn, photoIn + 6), 1 - tween(f, photoOut - 8, photoOut))}}>
					<BlurBg src="2025-regional-icpc-equipo-computador.jpg" from={photoIn} dur={photoOut - photoIn} />
					<Polaroid src="2025-regional-icpc-equipo-computador.jpg" at={photoIn + 2} x={560} y={150} w={800} h={700} tilt={-2} pos="50% 40%" />
					<EventTag start={photoIn + 8} title="Regional ICPC 2025" sub="GOSLINT · tres personas, un computador" x={96} y={140} />
				</AbsoluteFill>
			)}
			<CutFlash at={photoIn} len={4} />
			<GlitchBurst at={a} len={5} />
			<WipeBar at={b - 8} dur={12} />
		</AbsoluteFill>
	);
};

/* ================================================================== 05 · el camino de la ICPC */

const STAGES = [
	{key: 'nacional', n: '01', t: 'Fase nacional', s: 'cada país'},
	{key: 'regional', n: '02', t: 'Fase regional', s: 'mejores clasificados'},
	{key: 'latam', n: '03', t: 'Latin America Championship', s: 'campeonato latinoamericano'},
	{key: 'world', n: '04', t: 'World Finals', s: 'final mundial'},
];

export const Camino: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.camino;
	const k = (m: string) => M('s06', m);
	const xs = [250, 680, 1110, 1560];
	const lineY = 600;
	const at = STAGES.map((s) => k(s.key));
	const reached = at.filter((t) => f >= t).length;
	const lintX = (() => {
		let x = xs[0] - 140;
		for (let i = 0; i < at.length; i++) if (f >= at[i] - 16) x = interp(f, at[i] - 16, at[i] + 4, i === 0 ? xs[0] - 140 : xs[i - 1], xs[i]);
		return x;
	})();
	const walking = at.some((t) => f >= t - 16 && f < t + 4);
	const rec = k('recorrido');
	const pathOut = tween(f, rec - 12, rec, 0, 1, inCubic);
	const words = [
		{at: k('preparacion'), t: 'preparación'},
		{at: k('constancia'), t: 'constancia'},
		{at: k('trabajo'), t: 'trabajo en equipo'},
	];
	return (
		<AbsoluteFill>
			<GridBg opacity={0.45} size={90} />
			<ChapterTitle at={a + 6} n="05" label="el camino de la icpc" title="De la sede nacional a la final mundial" highlight={['final', 'mundial']} out={rec - 4} />
			<AbsoluteFill style={{opacity: 1 - pathOut}}>
				{/* carril */}
				<div style={{position: 'absolute', left: xs[0], top: lineY - 3, width: xs[3] - xs[0], height: 6, background: 'rgba(255,255,255,0.12)'}} />
				<div style={{position: 'absolute', left: xs[0], top: lineY - 3, width: Math.max(0, lintX - xs[0]), height: 6, background: C.green}} />
				{STAGES.map((s, i) => {
					const on = f >= at[i];
					const p = pop(f, at[i], 15, 220, 0.6);
					const last = i === 3;
					return (
						<React.Fragment key={i}>
							<div style={{position: 'absolute', left: xs[i] - 26, top: lineY - 26, width: 52, height: 52, background: on ? (last ? C.amber : C.green) : C.panel, border: `3px solid ${on ? C.white : C.line2}`, transform: `rotate(45deg) scale(${on ? 1 + 0.3 * (1 - tween(f, at[i], at[i] + 10)) : 0.8})`}} />
							<div style={{position: 'absolute', left: xs[i] - 190, width: 380, top: lineY + 60 + (1 - p) * 20, textAlign: 'center', opacity: on ? Math.min(1, p * 1.5) : 0.25}}>
								<Label size={18} color={last ? C.amber : C.green}>{s.n}</Label>
								<div style={{fontFamily: SANS, fontWeight: 800, fontSize: i >= 2 ? 36 : 42, color: C.white, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1.08}}>
									{i >= 2 && <span style={{color: C.dim}}>ICPC </span>}
									{s.t}
								</div>
								<div style={{fontFamily: MONO, fontSize: 20, color: C.dim, marginTop: 8}}>{s.s}</div>
							</div>
						</React.Fragment>
					);
				})}
				{f >= k('campeonato') - 2 && f < k('world') && (
					<div style={{position: 'absolute', left: xs[2] - 200, width: 400, top: lineY + 230, textAlign: 'center', opacity: pop(f, k('campeonato'), 16, 220, 0.6)}}>
						<Chip size={22} border={C.green}>campeonato latinoamericano</Chip>
					</div>
				)}
				{f >= k('mejores') - 2 && (
					<div style={{position: 'absolute', left: xs[3] - 220, width: 440, top: lineY + 230, textAlign: 'center', opacity: pop(f, k('mejores'), 16, 220, 0.6)}}>
						<Chip size={22} border={C.amber}>
							<span style={{color: C.amber}}>★</span> los mejores del planeta
						</Chip>
					</div>
				)}
				<Actor x={lintX} y={lineY - 12} scale={7} enter={a + 10} keys={[{at: a + 10, pose: POSES.idle}, {at: at[3] + 6, pose: POSES.wow}, {at: k('mejores'), pose: POSES.cheer}]} hops={[at[0] + 4, at[1] + 4, at[2] + 4]} />
				{walking && <Emote x={lintX} y={lineY - 260} text="!" f={f} at={at[Math.max(0, reached - 1)]} dur={20} scale={5} color={C.green} />}
			</AbsoluteFill>
			{f >= rec - 4 && (
				<AbsoluteFill>
					<div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
						<Label size={24} color={C.green} style={{opacity: tween(f, rec, rec + 8)}}>
							{'// un recorrido que exige'}
						</Label>
					</div>
					{words.map((w, i) => {
						if (f < w.at - 2) return null;
						const p = pop(f, w.at, 14, 220, 0.6);
						return (
							<div key={i} style={{position: 'absolute', left: 0, right: 0, top: 330 + i * 140 + (1 - p) * 30, textAlign: 'center', opacity: Math.min(1, p * 1.5), fontFamily: SANS, fontWeight: 840, fontSize: 104, letterSpacing: '-0.045em', color: i === 2 ? C.green : C.white}}>
								{w.t}
							</div>
						);
					})}
				</AbsoluteFill>
			)}
			<GlitchBurst at={a} len={5} />
			<WipeBar at={b - 8} dur={12} />
		</AbsoluteFill>
	);
};

const interp = (f: number, a: number, b: number, from: number, to: number) => tween(f, a, b, from, to, inOutCubic);

/* ================================================================== 06 · en Colombia */

export const Colombia: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.colombia;
	const k = (m: string) => M('s07', m);
	const maraton = k('maraton');
	const asi = k('asi');
	const shots = [
		{src: '2024-nacional-icpc-equipo-banner.jpg', tag: 'Maratón Nacional ICPC 2024', from: a, pos: '50% 30%'},
		{src: '2025-nacional-icpc-equipo1.jpg', tag: 'Maratón Nacional ICPC 2025', from: k('presencial') - 6, pos: '50% 35%'},
		{src: '2026-nacional-icpc-integrantes.jpg', tag: 'Maratón Nacional ACIS-REDIS 2026', from: k('mejores') - 6, pos: '50% 40%'},
	];
	const cur = shots.filter((s) => f >= s.from).length - 1;
	const finalIn = asi - 6;
	return (
		<AbsoluteFill>
			{f < finalIn &&
				shots.map((s, i) =>
					i === cur ? (
						<AbsoluteFill key={i}>
							<BlurBg src={s.src} from={s.from} dur={200} />
							<Polaroid src={s.src} at={s.from + 4} x={1060} y={130} w={640} h={700} tilt={i % 2 ? 2.5 : -2} pos={s.pos} caption={s.tag} />
						</AbsoluteFill>
					) : null,
				)}
			{f < finalIn && (
				<>
					<ChapterTitle at={a + 6} n="06" label="en colombia" />
					<div style={{position: 'absolute', left: 96, top: 180, width: 900}}>
						{f >= maraton - 2 && (
							<div style={{fontFamily: SANS, fontWeight: 830, fontSize: 64, letterSpacing: '-0.04em', color: C.white, lineHeight: 1.04, opacity: pop(f, maraton, 16, 200, 0.6)}}>
								Maratón Nacional de Programación <span style={{color: C.green}}>ACIS-REDIS</span>
							</div>
						)}
					</div>
					<Fact at={k('oficial')} x={96} y={420}>Fase nacional oficial de la ICPC</Fact>
					<Fact at={k('presencial')} x={96} y={510}>Presencial</Fact>
					<Fact at={k('sedes')} x={360} y={510}>Varias sedes universitarias</Fact>
					<Fact at={k('tres')} x={96} y={600}>3 estudiantes</Fact>
					<Fact at={k('uno')} x={400} y={600}>1 computador</Fact>
					<Fact at={k('mejores')} x={96} y={690} color={C.amber}>
						Los mejores <span style={{color: C.amber}}>→</span> fase regional latinoamericana
					</Fact>
				</>
			)}
			{f >= finalIn && (
				<AbsoluteFill>
					<Photo src="2024-nacional-icpc-grupal.jpg" from={finalIn} dur={b - finalIn} pos="50% 45%" grade={0.25} />
					<EventTag start={finalIn + 6} title="Maratón Nacional ICPC 2024" sub="GOSLINT con equipos de todo el país" x={96} y={110} />
					<div style={{position: 'absolute', left: 96, top: 250, fontFamily: SANS, fontWeight: 840, fontSize: 64, letterSpacing: '-0.04em', color: C.white, lineHeight: 1.05, textShadow: '0 4px 30px rgba(0,0,0,0.7)', opacity: pop(f, asi + 20, 16, 200, 0.6)}}>
						Desde Colombia, hacia una <br />
						<span style={{color: C.green}}>competencia internacional</span>
					</div>
				</AbsoluteFill>
			)}
			<CutFlash at={finalIn} len={4} />
			{shots.slice(1).map((s, i) => (
				<CutFlash key={i} at={s.from} len={3} max={0.5} />
			))}
			<WipeBar at={b - 8} dur={12} />
		</AbsoluteFill>
	);
};
