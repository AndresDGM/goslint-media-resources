import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {clamp, inCubic, inOutCubic, outCubic, outExpo, pop, rnd, tween} from '../lib';
import {M, SC, talkLevel} from '../timeline';
import {LIN, LOGO_AT, ROW, linealChecks} from '../beats';
import {Cell} from '../arrayviz';
import {Chip, CutFlash, GlitchBurst, GridBg, Label, LightCone, LogoMark, RiseWords, Shockwave, Spot, Typer, Verdict, Wordmark, fmt} from '../components';
import {Actor} from '../kit';
import {BASE, Emote, Lint, POSES, alive, walk} from '../mascot';
import {PixelBurst, PixelText} from '../pixel';

/* ================================================================== 00 · apertura: terminal → logotipo → Lint */

const WALL = Array.from({length: 84}, (_, i) => 11 + 12 * i); // 11, 23, …, 743, …, 1007 (ordenados)

export const Intro: React.FC = () => {
	const f = useCurrentFrame();
	const logoAt = LOGO_AT;
	const p = tween(f, logoAt + 2, logoAt + 46, 0, 1, outExpo);
	const wordP = tween(f, logoAt + 42, logoAt + 58, 0, 1, outExpo);
	const glitch = f >= logoAt + 42 && f < logoAt + 50 ? (rnd(f) - 0.5) * 40 : 0;
	const tag = pop(f, logoAt + 62, 16, 180, 0.7);
	const side = tween(f, 208, 234, 0, 1, inOutCubic); // el logo cede el centro a la mascota
	const gos = M('s01', 'goslint');
	const num = M('s01', 'numero');
	const como = M('s01', 'como');
	const logoOut = tween(f, num - 14, num - 2, 0, 1, inCubic);
	const glow = 16 + Math.sin(f / 6) * 6 + (f >= gos ? 30 * Math.max(0, 1 - (f - gos) / 20) : 0);
	const cmd = './buscar --objetivo=743 coleccion.txt';
	return (
		<AbsoluteFill>
			<GridBg opacity={f < logoAt ? 0.35 : 0.5} size={90} />
			{f < logoAt && (
				<div style={{position: 'absolute', left: 150, top: 450, fontFamily: MONO, fontSize: 44, color: C.white}}>
					<span style={{color: C.green}}>goslint@uceva</span>
					<span style={{color: C.dim}}>:~$ </span>
					<Typer text={cmd} start={10} cps={30} />
					{f >= 66 && <div style={{marginTop: 22, fontSize: 30, color: C.dim}}>{`> 1.000 números ordenados · revisando uno por uno${'.'.repeat(Math.floor((f - 66) / 6) % 4)}`}</div>}
				</div>
			)}
			{f >= logoAt && f < num && (
				<AbsoluteFill style={{opacity: 1 - logoOut, transform: `translateX(${-side * 420}px) scale(${1 - side * 0.22})`, transformOrigin: '50% 40%'}}>
					<Shockwave at={logoAt} x={960} y={330} />
					<div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						<div style={{transform: `scale(${0.8 + 0.2 * p})`}}>
							<LogoMark height={360} p={p} glow={f > logoAt + 46 ? glow : 0} />
						</div>
						<div style={{marginTop: 48, clipPath: `inset(0 ${(1 - wordP) * 100}% 0 0)`, transform: `translateX(${glitch}px)`, filter: glitch ? `drop-shadow(${glitch / 3}px 0 0 ${C.green})` : undefined}}>
							<Wordmark height={88} />
						</div>
						<div style={{marginTop: 38, textAlign: 'center', opacity: tag, transform: `translateY(${(1 - tag) * 24}px)`}}>
							<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.white, letterSpacing: '-0.02em'}}>Programación competitiva </span>
							<span style={{fontFamily: SANS, fontWeight: 400, fontSize: 40, color: C.dim, letterSpacing: '-0.02em'}}>e investigación académica.</span>
						</div>
						<Label size={20} color={C.faint} style={{marginTop: 20, opacity: tween(f, logoAt + 76, logoAt + 88)}}>
							Semillero de Investigación · Ingeniería de Sistemas · UCEVA
						</Label>
					</div>
				</AbsoluteFill>
			)}
			{/* la colección enorme */}
			{f >= num - 6 && (
				<>
					<div style={{position: 'absolute', left: 96, top: 104}}>
						<Label size={22} color={C.green} style={{opacity: tween(f, num - 2, num + 8)}}>
							{'// hoy · búsqueda binaria'}
						</Label>
						<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 64, letterSpacing: '-0.04em', color: C.white, marginTop: 10}}>
							<RiseWords text="Encontrar un número en una colección enorme" start={num} highlight={['número']} />
						</div>
					</div>
					{WALL.map((v, i) => {
						const col = i % 12;
						const row = Math.floor(i / 12);
						const pp = pop(f, num + 6 + col * 2 + row * 3, 14, 220, 0.6);
						const hot = v === 743 && f >= como - 30;
						return <Cell key={i} x={110 + col * 92} y={300 + row * 84} size={80} h={72} digit={3} value={v} state={hot ? 'mid' : 'idle'} p={pp} />;
					})}
					{f >= como - 30 && <Spot x={110 + 1 * 92 + 40} y={300 + 5 * 84 + 36} r={220} amt={0.3 * tween(f, como - 30, como - 18)} />}
				</>
			)}
			{/* Lint entra y saluda */}
			<Actor
				x={1470}
				y={870}
				scale={12}
				enter={216}
				keys={[
					{at: 216, pose: POSES.wow},
					{at: 236, pose: POSES.wave, in: 5},
					{at: gos + 20, pose: POSES.idle},
					{at: num - 4, pose: {...POSES.point, look: -1}},
					{at: como - 6, pose: POSES.think},
					{at: como + 26, pose: {...POSES.point}},
				]}
				facing={f >= num - 4 ? -1 : 1}
				override={f >= 236 && f < gos + 20 ? {...POSES.wave, armF: Math.floor(f / 5) % 2 ? 124 : 96} : null}
				light={f >= gos && f < gos + 30 ? {dx: -1, dy: -1, color: C.green, amt: 0.8} : {dx: -1, dy: -1, color: '#9FB3A8', amt: 0.25}}
			/>
			{f >= 250 && f < num + 30 && (
				<div style={{position: 'absolute', left: 1470 - 170, width: 340, top: 890, textAlign: 'center', opacity: tween(f, 250, 262) * (1 - tween(f, num + 18, num + 30))}}>
					<Chip size={24} border={C.green}>
						<span style={{color: C.green}}>LINT</span>
						<span style={{color: C.dim, fontWeight: 500}}>mascota de Goslint</span>
					</Chip>
				</div>
			)}
			<Emote x={1470} y={470} text="?" f={f} at={como} dur={44} scale={7} color={C.green} />
			<GlitchBurst at={logoAt - 10} len={10} intensity={1.1} />
			<CutFlash at={logoAt} len={5} />
		</AbsoluteFill>
	);
};

/* ================================================================== 01 · el problema: revisar uno por uno */

// ROW y LIN (ejecución real de la búsqueda lineal: visita 10 posiciones) viven en beats.ts

export const Lineal: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = SC.lineal;
	const mil = M('s02', 'mil');
	const millon = M('s02', 'millon');
	const preg = M('s02', 'pregunta');
	// instante en que se revisa cada posición (los tres primeros siguen a la voz; el resto se acelera)
	const checkAt = linealChecks();
	const checked = checkAt.filter((t) => f >= t).length;
	const foundAt = checkAt[checkAt.length - 1];
	const cell = 132;
	const pitch = 144;
	const x0 = 960 - (10 * pitch - 12) / 2;
	const top = 470;
	const cxOf = (k: number) => x0 + k * pitch + cell / 2;
	// la fila se encoge y sube para dejar sitio a la escala del problema
	const up = tween(f, mil - 12, mil + 8, 0, 1, inOutCubic);
	const rowOut = tween(f, preg - 14, preg - 2);
	// Lint: camina sobre la fila de celda en celda
	let lx = cxOf(0);
	let walking = false;
	for (let k = 1; k < checkAt.length; k++) {
		const t0 = checkAt[k - 1] + 3;
		const t1 = Math.max(t0 + 3, checkAt[k] - 2);
		if (f >= t1) lx = cxOf(k);
		else if (f >= t0) {
			lx = cxOf(k - 1) + (cxOf(k) - cxOf(k - 1)) * ((f - t0) / (t1 - t0));
			walking = true;
			break;
		} else break;
	}
	const leaveRow = tween(f, mil - 14, mil + 4, 0, 1);
	const gx = lx + (250 - lx) * leaveRow;
	const gy = top + (890 - top) * leaveRow - Math.sin(leaveRow * Math.PI) * 150;
	const recent = checkAt.filter((t) => f >= t).pop() ?? -100;
	let pose = {...BASE, ...(walking ? walk(f) : f < checkAt[0] - 20 ? POSES.idle : f - recent < 10 ? POSES.pointDown : {...POSES.pointDown, eyes: 'squint' as const})};
	if (f >= foundAt && f < mil - 14) pose = {...BASE, ...POSES.cheer};
	if (f >= mil - 14) pose = {...BASE, ...(f >= preg - 6 ? POSES.think : f >= millon ? POSES.tired : POSES.wow)};
	const bars = [
		{n: 10, at: mil - 6, w: 2},
		{n: 1000, at: mil + 4, w: 5},
		{n: 1000000, at: millon, w: 1180},
	];
	const dimBars = tween(f, preg - 14, preg, 0, 1);
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} />
			<div style={{position: 'absolute', left: 96, top: 104, opacity: 1 - rowOut}}>
				<Label size={22} color={C.green} style={{opacity: tween(f, a + 6, a + 14)}}>
					{'// 01 · búsqueda lineal'}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 60, letterSpacing: '-0.04em', color: C.white, marginTop: 10}}>
					<RiseWords text="Revisar uno por uno" start={M('s02', 'uno') - 6} highlight={['uno']} />
				</div>
			</div>
			<div style={{position: 'absolute', left: 1320, top: 110, opacity: tween(f, a + 20, a + 30) * (1 - rowOut)}}>
				<Chip size={24}>
					<span style={{color: C.dim}}>objetivo 58 · revisados</span>
					<span style={{color: checked >= 10 ? C.green : C.amber, fontSize: 34}}>{checked}</span>
				</Chip>
			</div>
			<div style={{position: 'absolute', inset: 0, opacity: 1 - rowOut, transform: `translateY(${-up * 196}px) scale(${1 - up * 0.42})`, transformOrigin: '50% 536px'}}>
				{ROW.map((v, k) => {
					const done = f >= checkAt[k];
					const isLast = k === LIN.index;
					const flip = done ? pop(f, checkAt[k], 12, 260, 0.5) : 0;
					return (
						<React.Fragment key={k}>
							<Cell x={x0 + k * pitch} y={top - flip * 10 * (1 - Math.min(1, (f - checkAt[k]) / 8))} size={cell} value={done ? v : '?'} state={done ? (isLast ? 'found' : 'visited') : 'hidden'} index={k} p={pop(f, a + 8 + k * 2, 14, 220, 0.6)} />
							{done && !isLast && (
								<div style={{position: 'absolute', left: cxOf(k) - 15, top: top + cell + 46, transform: `scale(${flip})`}}>
									<PixelText text="×" scale={6} color={C.red} bold />
								</div>
							)}
						</React.Fragment>
					);
				})}
				{f >= foundAt && <Spot x={cxOf(9)} y={top + cell / 2} r={300} amt={0.35 * (1 - up)} />}
			</div>
			<PixelBurst f={f} at={foundAt} x={cxOf(9)} y={top} seed={5} count={20} colors={[C.green, '#FFFFFF']} grid={8} spread={150} />
			<Lint x={gx} y={gy} scale={8} pose={alive(pose, f, talkLevel(f))} facing={f >= mil - 14 ? 1 : 1} light={{dx: 1, dy: -1, color: f >= foundAt && f < mil ? C.green : '#9FB3A8', amt: f >= foundAt && f < mil ? 0.6 : 0.2}} />
			{f >= millon + 30 && f < preg && <Emote x={250} y={600} text="..." f={f} at={millon + 30} dur={preg - millon - 34} scale={5} />}
			{/* la escala del problema: barras a escala real (10 no llega ni a un píxel) */}
			{f >= mil - 8 && (
				<div style={{position: 'absolute', left: 470, top: 560, opacity: 1 - dimBars * 0.75}}>
					<Label size={20} color={C.dim} style={{opacity: tween(f, mil - 8, mil + 2), marginBottom: 14}}>
						peor caso de la búsqueda lineal · barras a escala real
					</Label>
					{bars.map((b, i) => {
						if (f < b.at) return null;
						const g = i === 2 ? tween(f, b.at, b.at + 70, 0, 1, outCubic) : tween(f, b.at, b.at + 8);
						return (
							<div key={i} style={{display: 'flex', alignItems: 'center', height: 78, gap: 20}}>
								<div style={{width: 250, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.white, textAlign: 'right'}}>
									{fmt(b.n)} <span style={{color: C.dim, fontWeight: 500, fontSize: 20}}>datos</span>
								</div>
								<div style={{width: Math.max(2, b.w * g), height: 40, background: i === 2 ? C.amber : C.green}} />
								<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: i === 2 ? C.amber : C.text, whiteSpace: 'pre', marginLeft: i === 2 ? -Math.min(b.w * g - 12, 330) : 0, mixBlendMode: 'normal', background: i === 2 ? 'rgba(7,8,7,0.82)' : undefined, padding: i === 2 ? '2px 10px' : 0}}>
									{fmt(Math.round(b.n * g))} revisiones
								</div>
							</div>
						);
					})}
				</div>
			)}
			{f >= preg - 4 && (
				<div style={{position: 'absolute', left: 470, right: 120, top: 220, fontFamily: SANS, fontWeight: 840, fontSize: 92, letterSpacing: '-0.045em', lineHeight: 1.02, color: C.white}}>
					<RiseWords text="¿Y si pudiera encontrarlo sin revisar cada elemento?" start={preg} highlight={['sin', 'revisar', 'cada', 'elemento']} />
				</div>
			)}
			<Emote x={250} y={610} text="?" f={f} at={preg + 20} dur={70} scale={6} color={C.green} />
			<CutFlash at={a} len={4} max={0.6} />
		</AbsoluteFill>
	);
};

/* ================================================================== 02 · la idea: mirar solo el centro */

const SORTED9 = [5, 12, 18, 24, 31, 37, 44, 52, 60];

export const Idea: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = SC.idea;
	const nombre = M('s03', 'nombre');
	const ord = M('s03', 'ordenados');
	const centro = M('s03', 'centro');
	const igual = M('s03', 'igual');
	const menor = M('s03', 'menor');
	const mayor = M('s03', 'mayor');
	const otra = M('s03', 'otra');
	const cell = 120;
	const pitch = 132;
	const x0 = 960 - (9 * pitch - 12) / 2;
	const top = 480;
	const cx = (k: number) => x0 + k * pitch + cell / 2;
	const phase = f >= mayor ? 'mayor' : f >= menor ? 'menor' : f >= igual ? 'igual' : 'none';
	const cards = [
		{at: igual, k: '=', t: 'es el que busco', d: 'terminé', col: C.green, on: phase === 'igual'},
		{at: menor, k: '<', t: 'mi número es menor', d: '← solo puede estar a la izquierda', col: C.blue, on: phase === 'menor'},
		{at: mayor, k: '>', t: 'mi número es mayor', d: 'solo puede estar a la derecha →', col: C.amber, on: phase === 'mayor'},
	];
	const drop = tween(f, otra, otra + 16, 0, 1, outCubic);
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} />
			<div style={{position: 'absolute', left: 96, top: 104}}>
				<Label size={22} color={C.green} style={{opacity: tween(f, a + 6, a + 14)}}>
					{'// 02 · la idea'}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 840, fontSize: 72, letterSpacing: '-0.045em', color: C.white, marginTop: 6}}>
					<RiseWords text="Búsqueda binaria" start={nombre - 4} highlight={['binaria']} />
				</div>
			</div>
			<LightCone x={cx(4)} top={top - 300} bottom={top + cell} w1={cell * 1.9} amt={0.2 * tween(f, centro, centro + 8)} />
			<Spot x={cx(4)} y={top + cell / 2} r={cell * 2.2} amt={0.26 * tween(f, centro, centro + 8)} />
			{SORTED9.map((v, k) => {
				const left = k < 4;
				const right = k > 4;
				const hot = (phase === 'menor' && left) || (phase === 'mayor' && right);
				const gone = phase === 'mayor' && left ? drop : phase === 'menor' && right ? 0.6 * tween(f, menor, menor + 10) : 0;
				const state = k === 4 && f >= centro ? (phase === 'igual' ? 'found' : 'mid') : f >= centro && !hot && phase !== 'none' && phase !== 'igual' ? 'idle' : 'active';
				return (
					<React.Fragment key={k}>
						<Cell x={x0 + k * pitch} y={top + (k === 4 && f >= centro ? -8 : 0) + gone * 16 - (f >= ord && f < centro ? 14 * Math.max(0, 1 - Math.abs(f - (ord + 6 + k * 4)) / 6) : 0)} size={cell} value={v} state={state} dim={gone} index={k} p={pop(f, a + 10 + k * 2, 14, 220, 0.6)} />
					</React.Fragment>
				);
			})}
			{f >= ord && f < centro && (
				<div style={{position: 'absolute', left: x0, width: 9 * pitch - 12, top: top + cell + 50, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 24, color: C.dim, opacity: tween(f, ord, ord + 8) * (1 - tween(f, centro - 12, centro))}}>
					<span>menor</span>
					<span style={{flex: 1, margin: '14px 18px 0', height: 2, background: C.line2}} />
					<span>mayor</span>
				</div>
			)}
			{f >= centro && (
				<div style={{position: 'absolute', left: cx(4) - 100, width: 200, top: top + cell + 46, textAlign: 'center', opacity: tween(f, centro, centro + 6)}}>
					<Chip size={22} color="#04110A" bg={C.green} border={C.green}>
						el centro
					</Chip>
				</div>
			)}
			{(phase === 'menor' || phase === 'mayor') && (
				<div style={{position: 'absolute', left: phase === 'menor' ? x0 - 8 : x0 + 5 * pitch - 8, width: 4 * pitch + 4, top: top + cell + 4, height: 10, background: phase === 'menor' ? C.blue : C.amber, opacity: tween(f, phase === 'menor' ? menor : mayor, (phase === 'menor' ? menor : mayor) + 8)}} />
			)}
			{f >= otra && (
				<div style={{position: 'absolute', left: x0, width: 4 * pitch - 12, top: top + cell / 2 + 12, height: 8, background: 'rgba(255,77,94,0.6)', transformOrigin: 'right', transform: `scaleX(${tween(f, otra + 4, otra + 18)})`}} />
			)}
			<Actor
				x={cx(7.5)}
				y={top}
				scale={7}
				enter={a + 26}
				stops={[{from: centro - 26, to: centro - 2, x: cx(4)}]}
				keys={[
					{at: a + 40, pose: POSES.cheer},
					{at: nombre + 24, pose: POSES.idle},
					{at: ord, pose: POSES.point},
					{at: centro, pose: POSES.pointDown},
					{at: igual, pose: POSES.cheer},
					{at: menor, pose: POSES.point},
					{at: mayor, pose: POSES.point},
					{at: otra, pose: POSES.shrug},
				]}
				facing={f >= menor && f < mayor ? -1 : 1}
				hops={[a + 40, igual]}
				light={f >= centro ? {dx: 0, dy: 1, color: C.green, amt: 0.5} : {dx: 1, dy: -1, color: '#9FB3A8', amt: 0.2}}
			/>
			<div style={{position: 'absolute', left: 130, right: 130, top: 736, display: 'flex', gap: 26}}>
				{cards.map((c, i) => {
					if (f < c.at) return <div key={i} style={{flex: 1}} />;
					const p = pop(f, c.at, 15, 220, 0.6);
					return (
						<div key={i} style={{flex: 1, height: 170, background: C.panel, border: `2px solid ${c.on ? c.col : C.line}`, padding: '18px 22px', opacity: Math.min(1, p * 1.6) * (c.on ? 1 : 0.55), transform: `translateY(${(1 - p) * 40}px)`}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
								<div style={{width: 62, height: 62, background: c.col, color: '#04110A', fontFamily: MONO, fontWeight: 800, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{c.k}</div>
								<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 31, color: C.white, letterSpacing: '-0.02em'}}>{c.t}</div>
							</div>
							<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 23, color: c.col, marginTop: 20}}>{i === 0 ? <Verdict kind="AC" size={24} label="terminé" /> : c.d}</div>
						</div>
					);
				})}
			</div>
			<CutFlash at={a} len={4} max={0.6} />
			<Shockwave at={a + 2} x={960} y={500} dur={30} size={1500} thick={14} />
		</AbsoluteFill>
	);
};

export const _a = [interpolate, clamp];
