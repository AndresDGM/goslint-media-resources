import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {clamp, outCubic, pop, tween} from '../lib';
import {M, SC, V} from '../timeline';
import {race} from '../algo/search';
import {Chip, CutFlash, GlitchBurst, GridBg, Label, RiseWords, Spot, fmt} from '../components';
import {Actor, Mono, Note} from '../kit';
import {POSES} from '../mascot';
import {PixelBurst, PixelText} from '../pixel';

/** Resultados REALES: ambos algoritmos sobre la misma colección ordenada y el mismo objetivo (posición ⌊0,75·n⌋). */
const RACE = race();
const MAXC = Math.max(...RACE.map((r) => r.lin.comparisons));

/* ================================================================== 06 · complejidad algorítmica */

export const Complejidad: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = SC.complejidad;
	const part2 = V.s10.start - 26;
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} />
			{f < part2 ? <Crecimiento /> : <Carrera />}
			<CutFlash at={a} len={4} max={0.6} />
			<GlitchBurst at={part2 - 3} len={6} intensity={0.8} />
		</AbsoluteFill>
	);
};

/** Parte 1: qué es n, por qué lineal es O(n) y por qué partir a la mitad da log₂ n. */
const Crecimiento: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = SC.complejidad;
	const m = (k: string) => M('s09', k);
	const N = 16;
	const bw = 46;
	const bx = 560;
	const scanP = interpolate(f, [m('lineal') + 30, m('on') - 16], [0, N], clamp);
	const halves = [16, 8, 4, 2, 1];
	const hAt = (i: number) => (i === 0 ? m('binaria') + 8 : m('partir') + (i - 1) * 16);
	return (
		<>
			<div style={{position: 'absolute', left: 96, top: 104}}>
				<Label size={22} color={C.green} style={{opacity: tween(f, a + 6, a + 14)}}>
					{'// 06 · complejidad algorítmica'}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 60, letterSpacing: '-0.04em', color: C.white, marginTop: 10}}>
					<RiseWords text="¿Cómo crece el trabajo cuando crecen los datos?" start={m('complejidad') - 4} highlight={['crece', 'trabajo']} />
				</div>
			</div>
			<Actor
				x={270}
				y={880}
				scale={9}
				enter={a + 20}
				keys={[
					{at: m('rapido'), pose: POSES.think},
					{at: m('complejidad'), pose: POSES.point},
					{at: m('n'), pose: POSES.pointUp},
					{at: m('lineal'), pose: POSES.tired},
					{at: m('on'), pose: POSES.shrug},
					{at: m('binaria'), pose: POSES.aim},
					{at: m('log'), pose: POSES.pointUp},
					{at: m('ologn'), pose: POSES.cheer},
				]}
				hops={[m('ologn')]}
				light={{dx: 1, dy: -1, color: f >= m('binaria') ? C.green : C.amber, amt: 0.4}}
			/>
			{/* n elementos */}
			{f >= m('n') - 4 && (
				<div style={{position: 'absolute', left: bx, top: 300}}>
					<div style={{display: 'flex', gap: 6}}>
						{Array.from({length: N}, (_, i) => {
							const p = pop(f, m('n') + i, 14, 240, 0.5);
							const lit = f >= m('lineal') && i < scanP;
							return <div key={i} style={{width: bw, height: 62, background: lit ? C.amber : '#1A211D', border: `3px solid ${lit ? C.amber : '#FFFFFF'}`, transform: `scale(${p})`}} />;
						})}
					</div>
					<div style={{marginTop: 12, width: N * (bw + 6) - 6, opacity: tween(f, m('n') + 14, m('n') + 24)}}>
						<div style={{height: 12, borderLeft: `3px solid ${C.dim}`, borderRight: `3px solid ${C.dim}`, borderBottom: `3px solid ${C.dim}`}} />
						<div style={{textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.white, marginTop: 8}}>
							n <span style={{color: C.dim, fontWeight: 500}}>= cantidad de elementos (aquí, 16)</span>
						</div>
					</div>
				</div>
			)}
			{f >= m('lineal') && (
				<div style={{position: 'absolute', left: bx + N * (bw + 6) + 40, top: 286, opacity: tween(f, m('lineal'), m('lineal') + 8)}}>
					<Label size={20} color={C.amber}>
						lineal · uno por uno
					</Label>
					<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.amber, marginTop: 6}}>
						{Math.floor(scanP)} <span style={{fontSize: 22, color: C.dim, fontWeight: 500}}>revisados</span>
					</div>
				</div>
			)}
			{f >= m('on') && (
				<div style={{position: 'absolute', left: bx + N * (bw + 6) + 40, top: 392, transform: `scale(${pop(f, m('on'), 11, 240, 0.6)})`, transformOrigin: 'left center'}}>
					<Chip size={44} color="#2a1800" bg={C.amber} border={C.amber}>
						O(n)
					</Chip>
				</div>
			)}
			{/* partir a la mitad: 16 → 8 → 4 → 2 → 1 */}
			{f >= m('binaria') && (
				<div style={{position: 'absolute', left: bx, top: 520}}>
					<Label size={20} color={C.green} style={{opacity: tween(f, m('binaria'), m('binaria') + 8), marginBottom: 12}}>
						binaria · cada paso descarta la mitad
					</Label>
					{halves.map((h, i) => {
						if (f < hAt(i)) return null;
						const p = pop(f, hAt(i), 14, 240, 0.55);
						return (
							<div key={i} style={{display: 'flex', alignItems: 'center', height: 58, gap: 18}}>
								<div style={{width: h * (bw + 6) - 6, height: 40, background: i === halves.length - 1 ? C.green : '#0B5231', border: `3px solid ${C.green}`, transformOrigin: 'left', transform: `scaleX(${p})`}} />
								<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.white, opacity: Math.min(1, p * 2)}}>{h}</div>
								{i > 0 && <div style={{fontFamily: MONO, fontSize: 22, color: C.green, opacity: Math.min(1, p * 2)}}>{`corte ${i}`}</div>}
							</div>
						);
					})}
				</div>
			)}
			{halves.slice(1).map((h, i) => (
				<PixelBurst key={h} f={f} at={hAt(i + 1)} x={bx + h * (bw + 6)} y={590 + (i + 1) * 58} seed={i + 40} count={8} power={9} grid={6} life={16} colors={['#FFFFFF', C.green]} spread={120} dir={0} />
			))}
			{f >= m('log') && (
				<div style={{position: 'absolute', left: bx + 640, top: 640, opacity: tween(f, m('log'), m('log') + 8)}}>
					<Note at={m('log')} x={0} y={0} w={560} title="¿cuántas veces puedo partir n a la mitad?">
						<Mono>16 → 8 → 4 → 2 → 1</Mono>: 4 cortes, y <Mono color={C.green}>log₂ 16 = 4</Mono>
					</Note>
				</div>
			)}
			{f >= m('ologn') && (
				<div style={{position: 'absolute', left: bx + 640, top: 800, transform: `scale(${pop(f, m('ologn'), 11, 240, 0.6)})`, transformOrigin: 'left center'}}>
					<Chip size={44} color="#001a0c" bg={C.green} border={C.green}>
						O(log n)
					</Chip>
				</div>
			)}
		</>
	);
};

/** Parte 2: la carrera de comparaciones (16, 32, 64, 128 y 1.024) y los casos mejor, promedio y peor. */
const Carrera: React.FC = () => {
	const f = useCurrentFrame();
	const m = (k: string) => M('s10', k);
	const crece = m('crece');
	const ojo = m('ojo');
	const runs = [
		{start: m('n16') - 20, lin: [m('n16') + 6, m('n16') + 50], bin: [m('n16') + 56, 10]},
		{start: crece, lin: [crece + 2, crece + 12], bin: [crece + 6, 2]},
		{start: crece + 20, lin: [crece + 22, crece + 32], bin: [crece + 26, 2]},
		{start: crece + 40, lin: [crece + 42, crece + 52], bin: [crece + 46, 1]},
		{start: m('n1024') - 4, lin: [m('n1024') + 4, m('r769') + 14], bin: [m('r769') + 30, (m('r10') - m('r769') - 34) / 9]},
	];
	let cur = -1;
	runs.forEach((r, i) => {
		if (f >= r.start) cur = i;
	});
	const linCount = (i: number) => Math.round(interpolate(f, runs[i].lin, [0, RACE[i].lin.comparisons], {...clamp, easing: i === 4 ? outCubic : undefined}));
	const binCount = (i: number) => Math.max(0, Math.min(RACE[i].bin.comparisons, Math.floor((f - runs[i].bin[0]) / runs[i].bin[1]) + 1));
	const W = 1320;
	const X = 500;
	const casos = f >= ojo - 6;
	const fadeRace = 1 - tween(f, ojo - 14, ojo - 2);
	const r = cur >= 0 ? RACE[cur] : null;
	const lc = cur >= 0 ? linCount(cur) : 0;
	const bc = cur >= 0 ? binCount(cur) : 0;
	const lane = (y: number, label: string, color: string, count: number, body: React.ReactNode) => (
		<div style={{position: 'absolute', left: X, top: y, width: W}}>
			<div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8}}>
				<Label size={22} color={color}>
					{label}
				</Label>
				<span style={{fontFamily: MONO, fontWeight: 800, fontSize: 46, color, fontVariantNumeric: 'tabular-nums'}}>{count}</span>
				<span style={{fontFamily: MONO, fontSize: 20, color: C.dim}}>comparaciones</span>
			</div>
			<div style={{position: 'relative', height: 44, background: '#0F1411', border: `2px solid ${C.line2}`}}>{body}</div>
		</div>
	);
	const cellW = r ? W / r.n : 0;
	const step = r && bc > 0 ? r.bin.steps[bc - 1] : null;
	const hl = (k: string, dur = 60) => f >= m(k) && f < m(k) + dur;
	return (
		<>
			<div style={{position: 'absolute', left: 96, top: 104}}>
				<Label size={22} color={C.green}>
					{casos ? '// 06 · mejor, promedio y peor caso' : '// 06 · carrera de comparaciones'}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 56, letterSpacing: '-0.04em', color: C.white, marginTop: 10}}>
					<RiseWords text={casos ? 'El costo depende del caso' : 'Lineal contra binaria'} start={casos ? ojo - 4 : m('competir') - 8} highlight={['binaria', 'caso']} />
				</div>
			</div>
			<Actor
				x={250}
				y={880}
				scale={9}
				keys={[
					{at: m('competir') - 10, pose: POSES.cheer},
					{at: m('misma'), pose: POSES.point},
					{at: m('n16'), pose: POSES.pointUp},
					{at: m('n1024'), pose: POSES.tired},
					{at: m('r769') + 10, pose: POSES.wow},
					{at: m('r10'), pose: POSES.cheer},
					{at: ojo, pose: POSES.think},
					{at: m('mejor'), pose: POSES.pointUp},
					{at: m('bin'), pose: POSES.point},
					{at: m('logn') + 20, pose: POSES.cheer},
				]}
				hops={[m('competir') - 6, m('r10')]}
				light={{dx: 1, dy: -1, color: C.green, amt: 0.4}}
			/>
			{/* condiciones de la carrera */}
			{!casos && (
				<div style={{position: 'absolute', left: X, top: 236, width: W, display: 'flex', flexWrap: 'wrap', gap: '10px 14px', opacity: fadeRace}}>
					{[
						{at: m('misma'), t: 'misma lista ordenada'},
						{at: m('misma') + 30, t: 'mismo objetivo'},
						{at: m('tres4'), t: 'objetivo en la posición ⌊0,75 · n⌋'},
						{at: m('cuento'), t: '1 comparación = 1 elemento examinado'},
					].map((c, i) =>
						f >= c.at ? (
							<div key={i} style={{transform: `scale(${pop(f, c.at, 13, 240, 0.6)})`}}>
								<Chip size={20} border={C.line2}>
									<span style={{color: C.green}}>✓</span>
									{c.t}
								</Chip>
							</div>
						) : null,
					)}
				</div>
			)}
			{/* pistas */}
			{!casos && r && (
				<div style={{opacity: fadeRace}}>
					<div style={{position: 'absolute', left: X, top: 338, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.white}}>
						n = {fmt(r.n)}
						<span style={{fontSize: 22, color: C.dim, fontWeight: 500}}>{`   objetivo: valor ${fmt(r.target)}, índice ${r.targetIndex}`}</span>
					</div>
					{lane(
						400,
						'lineal',
						C.amber,
						lc,
						<>
							<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: cellW * lc, background: 'rgba(255,181,71,0.5)'}} />
							{lc > 0 && <div style={{position: 'absolute', left: cellW * lc - Math.max(4, cellW), top: 0, bottom: 0, width: Math.max(4, cellW), background: C.amber}} />}
						</>,
					)}
					{lane(
						522,
						'binaria',
						C.green,
						bc,
						<>
							{step && <div style={{position: 'absolute', left: cellW * step.low, width: cellW * (step.high - step.low + 1), top: 0, bottom: 0, background: 'rgba(0,192,99,0.22)'}} />}
							{r.bin.steps.slice(0, bc).map((s, i) => (
								<div key={i} style={{position: 'absolute', left: cellW * s.mid + cellW / 2 - Math.max(3, cellW / 2), width: Math.max(6, cellW), top: i === bc - 1 ? -8 : 0, bottom: i === bc - 1 ? -8 : 0, background: i === bc - 1 ? '#FFFFFF' : C.green}} />
							))}
						</>,
					)}
					{/* banderín del objetivo, compartido por las dos pistas */}
					<div style={{position: 'absolute', left: X + cellW * (r.targetIndex + 0.5) - 2, top: 390, width: 4, height: 246, background: 'rgba(255,255,255,0.5)'}} />
					<div style={{position: 'absolute', left: X + cellW * (r.targetIndex + 0.5) + 8, top: 394, fontFamily: MONO, fontSize: 18, color: C.white, opacity: tween(f, m('tres4'), m('tres4') + 8)}}>▼ objetivo (75 %)</div>
				</div>
			)}
			{/* gráfico: comparaciones reales por tamaño, a la misma escala */}
			{f >= m('n16') - 20 && (
				<div style={{position: 'absolute', left: casos ? X + 760 : X, top: casos ? 640 : 664, width: casos ? 560 : W, height: 250, opacity: casos ? 0.9 : 1}}>
					{RACE.map((rr, i) => {
						if (i > cur) return null;
						const l = linCount(i);
						const b = binCount(i);
						const gw = (casos ? 560 : W) / 5;
						const H = casos ? 150 : 170;
						return (
							<div key={i} style={{position: 'absolute', left: i * gw, width: gw, bottom: 0, height: '100%'}}>
								<div style={{position: 'absolute', left: gw / 2 - (casos ? 30 : 70), bottom: 40, width: casos ? 26 : 60, height: Math.max(3, (l / MAXC) * H), background: C.amber}} />
								<div style={{position: 'absolute', left: gw / 2 + (casos ? 4 : 10), bottom: 40, width: casos ? 26 : 60, height: Math.max(3, (b / MAXC) * H), background: C.green}} />
								<div style={{position: 'absolute', left: gw / 2 - (casos ? 30 : 70), width: casos ? 26 : 60, bottom: 46 + Math.max(3, (l / MAXC) * H), textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: casos ? 16 : 24, color: C.amber, whiteSpace: 'nowrap', display: 'flex', justifyContent: 'center'}}>{l}</div>
								<div style={{position: 'absolute', left: gw / 2 + (casos ? 4 : 10), width: casos ? 26 : 60, bottom: 46 + Math.max(3, (b / MAXC) * H), textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: casos ? 16 : 24, color: C.green, display: 'flex', justifyContent: 'center'}}>{b}</div>
								<div style={{position: 'absolute', left: 0, right: 0, bottom: 4, textAlign: 'center', fontFamily: MONO, fontSize: casos ? 16 : 22, color: C.dim}}>n={fmt(rr.n)}</div>
							</div>
						);
					})}
					<div style={{position: 'absolute', left: 0, right: 0, bottom: 38, height: 2, background: C.line2}} />
				</div>
			)}
			{!casos && f >= m('r10') && (
				<>
					<Spot x={X + 110} y={560} r={260} amt={0.35 * (1 - tween(f, m('r10'), m('r10') + 40))} />
					<div style={{position: 'absolute', left: X + 300, top: 640, transform: `rotate(-5deg) scale(${pop(f, m('r10'), 9, 260, 0.5)})`, opacity: fadeRace}}>
						<PixelText text="¡10!" scale={12} color="#FFFFFF" bold shadow={C.greenDeep} />
					</div>
					<PixelBurst f={f} at={m('r10')} x={X + 420} y={690} seed={12} count={24} grid={8} colors={[C.green, '#FFFFFF']} />
				</>
			)}
			{/* casos */}
			{casos && (
				<>
					<div style={{position: 'absolute', left: X, top: 250, width: W}}>
						{[
							['', 'mejor caso', 'caso promedio', 'peor caso'],
							['lineal', '1', '≈ n / 2', 'n'],
							['binaria', '1', '~ log₂ n', '⌊log₂ n⌋ + 1'],
						].map((row, ri) => {
							const at = ri === 0 ? ojo : ri === 1 ? m('mejor') - 40 : m('bin') - 6;
							if (f < at) return null;
							const p = pop(f, at, 16, 220, 0.6);
							return (
								<div key={ri} style={{display: 'flex', height: ri === 0 ? 52 : 96, alignItems: 'center', borderBottom: `2px solid ${C.line}`, opacity: Math.min(1, p * 1.6), transform: `translateX(${(1 - p) * 50}px)`}}>
									{row.map((c, ci) => {
										const on =
											(ri === 1 && ((ci === 1 && hl('mejor', m('promedio') - m('mejor'))) || (ci === 2 && hl('promedio', m('peor') - m('promedio'))) || (ci === 3 && hl('peor', m('bin') - m('peor'))))) ||
											(ri === 2 && ((ci === 1 && hl('bin', m('logn') - m('bin') - 40)) || (ci === 3 && f >= m('logn') - 40)));
										const col = ri === 1 ? C.amber : C.green;
										return (
											<div key={ci} style={{width: ci === 0 ? 220 : (W - 220) / 3, fontFamily: MONO, fontWeight: ri === 0 || ci === 0 ? 700 : 800, fontSize: ri === 0 ? 20 : ci === 0 ? 30 : 40, letterSpacing: ri === 0 ? '0.12em' : 0, textTransform: ri === 0 ? 'uppercase' : undefined, color: ri === 0 ? C.dim : ci === 0 ? col : on ? '#04110A' : C.white}}>
												<span style={{background: on ? col : 'transparent', padding: on ? '6px 16px' : '6px 0'}}>{c}</span>
											</div>
										);
									})}
								</div>
							);
						})}
					</div>
					<Note at={ojo} x={X} y={560} w={700} color={C.amber} title="ojo: ejecuciones concretas">
						Las cifras de la carrera valen para <Mono>ese</Mono> objetivo. <Mono color={C.amber}>O(n)</Mono> y <Mono color={C.green}>O(log n)</Mono> describen cómo crece el trabajo en general.
					</Note>
					<Note at={m('logn') - 40} x={X} y={740} w={700} title="peor caso de la binaria">
						Con <Mono>n = 1.024</Mono>: como mucho <Mono color={C.green}>⌊log₂ 1.024⌋ + 1 = 11</Mono> comparaciones.
					</Note>
				</>
			)}
		</>
	);
};
