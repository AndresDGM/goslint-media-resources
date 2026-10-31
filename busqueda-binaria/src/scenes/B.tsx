import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {inOutCubic, outCubic, pop, tween} from '../lib';
import {M, SC} from '../timeline';
import {DEMO, SMALL, UNSORTED, binarySearch} from '../algo/search';
import {Cell, SearchStage, StepTiming} from '../arrayviz';
import {DRAW_AT, demoA, demoB, demoSwap, macheteTiming, ordenHit} from '../beats';
import {Chip, CutFlash, GlitchBurst, GridBg, Label, Verdict} from '../components';
import {Actor, Mono, Note} from '../kit';
import {Emote, POSES} from '../mascot';

/** Chip del objetivo: siempre visible mientras se busca. */
export const Target: React.FC<{at: number; value: number | string; x?: number; y?: number; out?: number}> = ({at, value, x = 1560, y = 96, out}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 13, 220, 0.6);
	return (
		<div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 18, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * -24}px)`}}>
			<Label size={24} color={C.white}>
				objetivo
			</Label>
			<div style={{position: 'relative', width: 104, height: 104}}>
				<Cell x={0} y={0} size={104} value={value} state="active" />
			</div>
		</div>
	);
};

/* ================================================================== 03 · dividir y machetear */

const RUN_SMALL = binarySearch(SMALL, 16);

export const Machete: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.machete;
	const timing: StepTiming[] = macheteTiming();
	const dyv = M('s04', 'dyv');
	const dym = M('s04', 'dym');
	const drawAt = DRAW_AT();
	const swap = pop(f, dym, 12, 200, 0.6);
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} />
			<div style={{position: 'absolute', left: 96, top: 104}}>
				<Label size={22} color={C.green} style={{opacity: tween(f, a + 6, a + 14)}}>
					{'// 03 · divide y vencerás'}
				</Label>
				{f < dyv - 4 ? (
					<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 60, letterSpacing: '-0.04em', color: C.white, marginTop: 10, opacity: tween(f, a + 10, a + 20) * (1 - tween(f, dyv - 12, dyv - 4))}}>
						Tres marcas: <span style={{color: C.blue}}>low</span>, <span style={{color: C.green}}>mid</span> y <span style={{color: C.amber}}>high</span>
					</div>
				) : (
					<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 60, letterSpacing: '-0.04em', color: C.white, marginTop: 10, opacity: tween(f, dyv - 4, dyv + 6), whiteSpace: 'pre'}}>
						{f < dym ? 'Divide y ' : 'Dividir y '}
						<span style={{position: 'relative', color: f >= dym ? C.faint : C.white}}>
							vencerás
							{f >= dym && <span style={{position: 'absolute', left: -4, right: -4, top: '54%', height: 6, background: C.red, transformOrigin: 'left', transform: `scaleX(${tween(f, dym, dym + 6)})`}} />}
						</span>
						{f >= dym && (
							<span style={{color: C.green, display: 'inline-block', marginLeft: 22, transform: `scale(${0.6 + swap * 0.4}) rotate(${(1 - swap) * -8}deg)`, transformOrigin: 'left bottom', opacity: Math.min(1, swap * 2)}}>machetear</span>
						)}
					</div>
				)}
			</div>
			<Target at={M('s05', 'busco')} value={16} />
			<SearchStage
				data={SMALL}
				target={16}
				run={RUN_SMALL}
				timing={timing}
				top={470}
				cell={132}
				gap={12}
				mscale={8}
				appear={a + 12}
				enter={a + 34}
				startAt={5.2}
				drawAt={drawAt}
				markers={{low: M('s04', 'low'), high: M('s04', 'high')}}
				leave={b}
				override={(fr) => {
					if (fr < M('s04', 'low') - 4) return {pose: POSES.idle};
					if (fr < M('s04', 'high') - 4) return {pose: POSES.pointDown, facing: -1};
					if (fr < M('s04', 'mid') - 4) return {pose: POSES.pointDown, facing: 1};
					if (fr < dyv) return null;
					if (fr < dym - 22) return {pose: POSES.point, facing: -1};
					if (fr < drawAt) return {pose: POSES.think, facing: -1};
					if (fr >= M('s05', 'metafora') && fr < M('s05', 'centro2') - 20) return {pose: {...POSES.shrug, machete: null, mouth: 0}, facing: -1};
					return null;
				}}
			/>
			<Emote x={RUN_SMALL ? 1182 : 0} y={236} text="..." f={f} at={dym - 22} dur={26} scale={5} />
			{/* destello del desenvaine */}
			{f >= drawAt && f < drawAt + 14 && (
				<div style={{position: 'absolute', left: 1182 + 70, top: 250 - (f - drawAt) * 4, fontFamily: MONO, fontSize: 60, fontWeight: 800, color: C.white, opacity: 1 - (f - drawAt) / 14}}>✦</div>
			)}
			<Note at={M('s05', 'porque')} out={M('s05', 'metafora') - 4} x={1296} y={214} w={560} title="por qué puedo descartarla">
				Está ordenado: a la izquierda del <Mono>12</Mono> solo hay valores <Mono>≤ 12</Mono>. El <Mono>16</Mono> no puede estar ahí.
			</Note>
			<Note at={M('s05', 'metafora')} out={M('s05', 'centro2') - 6} x={1296} y={214} w={560} color={C.amber} title="el machete es una metáfora">
				El arreglo no cambia: los datos siguen ahí. Solo se reduce el intervalo <Mono color={C.blue}>[low</Mono>, <Mono color={C.amber}>high]</Mono> que examino.
			</Note>
			<CutFlash at={a} len={4} max={0.5} />
		</AbsoluteFill>
	);
};

/* ================================================================== 04 · por qué deben estar ordenados */

const RUN_UNS = binarySearch(UNSORTED, 7);
const SORTED7 = [...UNSORTED].sort((x, y) => x - y);

export const Orden: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = SC.orden;
	const hit = ordenHit();
	const con = M('s06', 'conorden');
	const costo = M('s06', 'costo');
	const timing: StepTiming[] = [{mid: M('s06', 'centro'), cmp: M('s06', 'centro') + 46, hit}];
	// fila que se ordena: cada celda viaja de su posición desordenada a la ordenada
	const cell = 112;
	const pitch = 124;
	const rowX = 960 - (7 * pitch - 12) / 2 + 150;
	const sortT = tween(f, con + 6, con + 40, 0, 1, inOutCubic);
	const bracket = tween(f, con + 44, con + 58);
	const rowsAt = [costo, M('s06', 'una'), M('s06', 'ya'), M('s06', 'muchas')];
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} />
			<div style={{position: 'absolute', left: 96, top: 104}}>
				<Label size={22} color={C.green} style={{opacity: tween(f, a + 6, a + 14)}}>
					{'// 04 · datos ordenados'}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 60, letterSpacing: '-0.04em', color: C.white, marginTop: 10, opacity: tween(f, M('s06', 'exijo') - 6, M('s06', 'exijo') + 6)}}>
					¿Por qué <span style={{color: C.green}}>ordenados</span>?
				</div>
			</div>
			<Target at={M('s06', 'desorden') + 30} value={7} out={con - 4} />
			<SearchStage
				data={UNSORTED}
				target={7}
				run={RUN_UNS}
				timing={timing}
				top={470}
				cell={132}
				gap={12}
				mscale={8}
				appear={M('s06', 'desorden') - 8}
				enter={M('s06', 'desorden') + 6}
				startAt={1.6}
				armed
				leave={con}
				markers={null}
				reveal={{index: 5, at: M('s06', 'zas') + 2}}
				override={(fr) => {
					if (fr >= M('s06', 'sinorden')) return {pose: {...POSES.shrug, machete: null}, facing: 1};
					if (fr >= M('s06', 'zas')) return {pose: {...POSES.oops, machete: null}, facing: 1};
					return null;
				}}
			/>
			{f >= M('s06', 'desorden') - 8 && f < con && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 388, textAlign: 'center', opacity: tween(f, M('s06', 'desorden'), M('s06', 'desorden') + 8) * (1 - tween(f, M('s06', 'centro') - 10, M('s06', 'centro')))}}>
					<Chip color={C.amber} border={C.amber} size={24}>
						fila desordenada
					</Chip>
				</div>
			)}
			{f >= M('s06', 'error') && f < con && (
				<div style={{position: 'absolute', left: 1180, top: 300, transform: `scale(${pop(f, M('s06', 'error'), 11, 240, 0.6)})`, transformOrigin: 'left center', opacity: 1 - tween(f, con - 8, con)}}>
					<Verdict kind="WA" size={40} label="descarté la mitad que tenía el 7" />
				</div>
			)}
			{[0, 1, 2, 4, 5, 6].map((j, k) => (
				<Emote key={j} x={960 - (7 * 144 - 12) / 2 + j * 144 + 66 + (j > 2 ? 66 : -22)} y={470 + (j > 2 ? 40 : 0)} text="?" f={f} at={M('s06', 'sinorden') + 8 + k * 4} dur={con - M('s06', 'sinorden') - 12 - k * 4} scale={5} color={C.amber} />
			))}

			{/* con orden: la misma fila, ordenada */}
			{f >= con && (
				<>
					{UNSORTED.map((v, j) => {
						const to = SORTED7.indexOf(v);
						const x = rowX + (j + (to - j) * sortT) * pitch;
						const y = 250 - Math.sin(sortT * Math.PI) * (j % 2 === 0 ? 46 : -30);
						const p = pop(f, con + j, 14, 220, 0.6);
						const isMid = to === 3 && f >= con + 40;
						return <Cell key={v} x={x} y={y} size={cell} value={v} state={isMid ? 'mid' : 'active'} index={sortT > 0.98 ? to : undefined} p={p} />;
					})}
					{bracket > 0 && (
						<>
							<div style={{position: 'absolute', left: rowX, width: 3 * pitch - 12, top: 250 + cell + 48, opacity: bracket, textAlign: 'center'}}>
								<div style={{height: 14, borderLeft: `4px solid ${C.blue}`, borderRight: `4px solid ${C.blue}`, borderBottom: `4px solid ${C.blue}`}} />
								<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.blue, marginTop: 8}}>todo ≤ 15</div>
							</div>
							<div style={{position: 'absolute', left: rowX + 4 * pitch, width: 3 * pitch - 12, top: 250 + cell + 48, opacity: bracket, textAlign: 'center'}}>
								<div style={{height: 14, borderLeft: `4px solid ${C.amber}`, borderRight: `4px solid ${C.amber}`, borderBottom: `4px solid ${C.amber}`}} />
								<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.amber, marginTop: 8}}>todo ≥ 15</div>
							</div>
						</>
					)}
					<Actor
						x={300}
						y={800}
						scale={9}
						enter={con - 2}
						keys={[
							{at: con, pose: POSES.pointUp},
							{at: costo - 8, pose: POSES.think},
							{at: M('s06', 'una'), pose: POSES.shrug},
							{at: M('s06', 'ya'), pose: POSES.point},
							{at: M('s06', 'muchas') + 30, pose: POSES.cheer},
						]}
						hops={[M('s06', 'muchas') + 34]}
						light={{dx: 1, dy: -1, color: C.green, amt: 0.4}}
					/>
					{/* el costo de ordenar */}
					<div style={{position: 'absolute', left: 560, top: 540, width: 1270}}>
						{[
							{t: 'Ordenar también cuesta', d: '≈ n · log₂ n comparaciones (con un buen algoritmo)', k: 'TLE' as const, tag: 'costo extra', col: C.amber},
							{t: 'Una sola búsqueda en datos sin ordenar', d: 'ordenar + binaria  >  una búsqueda lineal', k: 'WA' as const, tag: 'no compensa', col: C.red},
							{t: 'Los datos ya vienen ordenados', d: 'cada búsqueda: ≈ log₂ n comparaciones', k: 'AC' as const, tag: 'ideal', col: C.green},
							{t: 'Muchas consultas sobre los mismos datos', d: 'se ordena una vez y cada consulta sale rápida', k: 'AC' as const, tag: 'vale la pena', col: C.green},
						].map((r, i) => {
							const p = pop(f, rowsAt[i], 15, 220, 0.6);
							if (f < rowsAt[i]) return null;
							return (
								<div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, height: 78, marginBottom: 12, background: C.panel, borderLeft: `6px solid ${r.col}`, padding: '0 22px', opacity: Math.min(1, p * 1.6), transform: `translateX(${(1 - p) * 60}px)`}}>
									<div style={{flex: 1}}>
										<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.white, letterSpacing: '-0.01em'}}>{r.t}</div>
										<div style={{fontFamily: MONO, fontSize: 20, color: C.dim, marginTop: 2}}>{r.d}</div>
									</div>
									<Verdict kind={r.k} size={24} label={r.tag} />
								</div>
							);
						})}
					</div>
				</>
			)}
			<CutFlash at={a} len={4} max={0.5} />
			<GlitchBurst at={con - 3} len={5} intensity={0.7} />
		</AbsoluteFill>
	);
};

/* ================================================================== 05 · paso a paso (43 y 42) */

const RUN43 = binarySearch(DEMO, 43);
const RUN42 = binarySearch(DEMO, 42);

export const Demo: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.demo;
	const tA: StepTiming[] = demoA();
	const swapAt = demoSwap();
	const tB: StepTiming[] = demoB();
	const second = f >= swapAt;
	const t = second ? tB : tA;
	const comps = t.filter((s, i) => f >= (i === 3 && !second ? s.hit - 30 : (s.cmp ?? s.mid))).length;
	const vacio = M('s08', 'vacio');
	const menos1 = M('s08', 'menos1');
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} />
			<div style={{position: 'absolute', left: 96, top: 104}}>
				<Label size={22} color={C.green} style={{opacity: tween(f, a + 6, a + 14)}}>
					{second ? '// 05 · paso a paso · un valor que no existe' : '// 05 · paso a paso'}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 56, letterSpacing: '-0.04em', color: C.white, marginTop: 10, opacity: tween(f, M('s07', 'paso') - 4, M('s07', 'paso') + 8)}}>
					{second ? (
						<>
							Buscar el <span style={{color: C.red}}>42</span>
						</>
					) : (
						<>
							Buscar el <span style={{color: C.green}}>43</span> en 16 números
						</>
					)}
				</div>
			</div>
			{!second && <Target at={M('s07', 'busco')} value={43} out={swapAt} />}
			{second && <Target at={M('s08', 'noexiste') + 16} value={42} />}
			{f >= M('s07', 'mid7') && (
				<div style={{position: 'absolute', left: 1060, top: 112, opacity: tween(f, M('s07', 'mid7'), M('s07', 'mid7') + 8)}}>
					<Chip size={24} border={C.line2}>
						<span style={{color: C.dim}}>comparaciones</span>
						<span style={{color: C.green, fontSize: 34, display: 'inline-block', transform: `scale(${1 + 0.3 * Math.max(0, 1 - (f - Math.max(...t.filter((s) => f >= (s.cmp ?? s.mid)).map((s) => s.cmp ?? s.mid), 0)) / 8)})`}}>{comps}</span>
					</Chip>
				</div>
			)}
			{!second && (
				<SearchStage
					data={DEMO}
					target={43}
					run={RUN43}
					timing={tA}
					top={452}
					cell={96}
					gap={8}
					mscale={6}
					appear={M('s07', 'dieciseis') - 10}
					enter={M('s07', 'dieciseis') + 14}
					startAt={11.5}
					armed
					markers={{low: M('s07', 'low0'), high: M('s07', 'high15')}}
					leave={swapAt}
				/>
			)}
			{second && (
				<SearchStage
					data={DEMO}
					target={42}
					run={RUN42}
					timing={tB}
					top={452}
					cell={96}
					gap={8}
					mscale={6}
					appear={swapAt}
					enter={swapAt + 10}
					startAt={11.5}
					armed
					markers={{low: swapAt + 18, high: swapAt + 22}}
					emptyAt={vacio}
					leave={b}
					bannerY={f >= M('s08', 'supera') - 6 ? 2000 : undefined}
				/>
			)}
			{!second && f >= M('s07', 'cuatro') && (
				<div style={{position: 'absolute', left: 96, top: 222, transformOrigin: 'left center', transform: `scale(${pop(f, M('s07', 'cuatro'), 12, 220, 0.6)})`}}>
					<Verdict kind="AC" size={36} label="4 comparaciones para 16 números" />
				</div>
			)}
			{second && f >= M('s08', 'supera') - 6 && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 780, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, opacity: tween(f, M('s08', 'supera') - 6, M('s08', 'supera') + 4)}}>
					<div style={{background: '#050605', border: `2px solid ${f >= vacio ? C.red : C.line2}`, padding: '12px 26px', fontFamily: MONO, fontWeight: 800, fontSize: 36, whiteSpace: 'pre'}}>
						<span style={{color: C.blue}}>low = 10</span>
						<span style={{color: C.white}}>{'  >  '}</span>
						<span style={{color: C.amber}}>high = 9</span>
					</div>
					{f >= vacio && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.red, opacity: tween(f, vacio, vacio + 6)}}>→ intervalo vacío</div>}
					{f >= menos1 && (
						<div style={{transform: `scale(${pop(f, menos1, 11, 240, 0.6)})`}}>
							<Chip size={32} color="#2a0005" bg={C.red} border={C.red}>
								return −1 · no está
							</Chip>
						</div>
					)}
				</div>
			)}
			<CutFlash at={a} len={4} max={0.5} />
			<GlitchBurst at={swapAt - 3} len={6} intensity={0.8} />
		</AbsoluteFill>
	);
};

export const _unused = outCubic;
