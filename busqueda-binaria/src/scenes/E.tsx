import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {inCubic, outCubic, outExpo, pop, rnd, tween} from '../lib';
import {DURATION, M, SC, talkLevel} from '../timeline';
import {binarySearch, lowerBound, probe, sortedData} from '../algo/search';
import {BIG_COMPARISONS, cierreBeats} from '../beats';
import {Chip, CutFlash, GlitchBurst, GridBg, Label, LogoMark, RiseWords, Shockwave, Spot, Verdict, Wordmark, fmt, shake} from '../components';
import {Actor} from '../kit';
import {BASE, Lint, POSES, alive, chop} from '../mascot';
import {PixelBurst, PixelText} from '../pixel';

/* ================================================================== 09 · dónde se usa */

const IDS = [1004, 1017, 1023, 1038, 1046, 1052, 1069, 1075];
const WORDS = ['algoritmo', 'arreglo', 'binaria', 'ciclo', 'grafo', 'machete', 'nodo', 'pila'];
const SCORES = [41, 55, 62, 74, 80, 80, 87, 93];
// ejecuciones reales de cada ejemplo
const P_ID = probe(IDS, 1052);
const P_WORD = probe(WORDS, 'machete');
const P_SCORE = probe(SCORES, 87);
const P_BOUND = lowerBound(SCORES, 80);

type P = {index: number; mids: number[]; lows: number[]; highs: number[]};

const ListCard: React.FC<{x: number; at: number; n: string; title: string; sub: string; rows: (string | number)[]; run: P; target: string; col: string; bound?: {at: number; run: P; label: string}}> = ({x, at, n, title, sub, rows, run, target, col, bound}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const p = pop(f, at, 16, 200, 0.7);
	const inBound = bound && f >= bound.at;
	const r = inBound ? bound!.run : run;
	const t0 = inBound ? bound!.at + 16 : at + 30;
	const gap = 20;
	const k = Math.min(r.mids.length, Math.max(0, Math.floor((f - t0) / gap) + 1));
	const finished = k >= r.mids.length && f >= t0 + (r.mids.length - 1) * gap + 12;
	const mid = k > 0 ? r.mids[k - 1] : -1;
	const lo = k > 0 ? r.lows[k - 1] : 0;
	const hi = k > 0 ? r.highs[k - 1] : rows.length - 1;
	return (
		<div style={{position: 'absolute', left: x, top: 222 + (1 - p) * 50, width: 540, height: 490, background: C.panel, borderTop: `8px solid ${col}`, opacity: Math.min(1, p * 1.6), padding: '16px 22px'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
				<div style={{width: 50, height: 50, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<PixelText text={n} scale={5} color="#04110A" bold />
				</div>
				<div>
					<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.white, letterSpacing: '-0.02em'}}>{title}</div>
					<div style={{fontFamily: MONO, fontSize: 18, color: C.dim}}>{sub}</div>
				</div>
			</div>
			<div style={{marginTop: 14, fontFamily: MONO, fontSize: 20, color: C.white}}>
				<span style={{color: C.dim}}>{inBound ? 'límite: ' : 'buscar: '}</span>
				<span style={{fontWeight: 800, color: inBound ? C.amber : C.white}}>{inBound ? bound!.label : target}</span>
			</div>
			<div style={{marginTop: 8}}>
				{rows.map((v, i) => {
					const isMid = i === mid && !finished;
					const win = finished && i === r.index;
					const out = k > 0 && (i < lo || i > hi) && !win;
					return (
						<div key={i} style={{height: 39, display: 'flex', alignItems: 'center', gap: 14, padding: '0 12px', marginBottom: 3, background: win ? (inBound ? C.amber : C.green) : isMid ? '#06301C' : '#0A0E0C', border: `2px solid ${win ? '#FFFFFF' : isMid ? C.green : 'transparent'}`, opacity: out ? 0.3 : 1}}>
							<span style={{fontFamily: MONO, fontSize: 16, color: win ? '#04110A' : C.faint, width: 22}}>{i}</span>
							<span style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: win ? '#04110A' : C.white}}>{v}</span>
							{isMid && <span style={{marginLeft: 'auto', fontFamily: MONO, fontWeight: 800, fontSize: 18, color: C.green}}>← mid</span>}
							{win && <span style={{marginLeft: 'auto', fontFamily: MONO, fontWeight: 800, fontSize: 18, color: '#04110A'}}>{inBound ? '← primero ≥ 80' : `← ${r.mids.length} comparaciones`}</span>}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export const Usos: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = SC.usos;
	const m = (k: string) => M('s14', k);
	return (
		<AbsoluteFill>
			<GridBg opacity={0.45} />
			<div style={{position: 'absolute', left: 96, top: 96}}>
				<Label size={22} color={C.green} style={{opacity: tween(f, a + 6, a + 14)}}>
					{'// 09 · en la práctica'}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 52, letterSpacing: '-0.04em', color: C.white, marginTop: 6}}>
					<RiseWords text="¿Dónde se usa la búsqueda binaria?" start={m('donde') - 4} highlight={['Dónde']} />
				</div>
			</div>
			<ListCard x={110} at={m('uno')} n="1" title="Número de identificación" sub="lista ordenada de estudiantes" rows={IDS} run={P_ID} target="1052" col={C.blue} />
			<ListCard x={690} at={m('dos')} n="2" title="Diccionario digital" sub="palabras en orden alfabético" rows={WORDS} run={P_WORD} target="«machete»" col={C.green} />
			<ListCard x={1270} at={m('tres')} n="3" title="Tabla de puntajes" sub="posiciones ordenadas por puntaje" rows={SCORES} run={P_SCORE} target="87" col={C.amber} bound={{at: m('ajuste') + 10, run: P_BOUND, label: 'primer puntaje ≥ 80'}} />
			<Actor
				x={190}
				y={896}
				scale={6}
				enter={a + 20}
				keys={[
					{at: m('donde'), pose: POSES.cheer},
					{at: m('uno'), pose: POSES.pointUp},
					{at: m('cond'), pose: POSES.point},
					{at: m('notodas'), pose: POSES.shrug},
				]}
				hops={[m('donde') + 4]}
				light={{dx: 1, dy: -1, color: C.green, amt: 0.4}}
			/>
			<div style={{position: 'absolute', left: 350, top: 740, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', width: 1500}}>
				{f >= m('cond') && (
					<Label size={22} color={C.white} style={{opacity: tween(f, m('cond'), m('cond') + 8), width: '100%', marginBottom: 2}}>
						condiciones para poder usarla
					</Label>
				)}
				{f >= m('c1') && (
					<div style={{transform: `scale(${pop(f, m('c1'), 12, 240, 0.6)})`}}>
						<Verdict kind="AC" size={28} label="datos ordenados" />
					</div>
				)}
				{f >= m('c2') && (
					<div style={{transform: `scale(${pop(f, m('c2'), 12, 240, 0.6)})`, marginLeft: 20}}>
						<Verdict kind="AC" size={28} label="acceso directo a cualquier posición" />
					</div>
				)}
				{f >= m('notodas') && (
					<div style={{transform: `scale(${pop(f, m('notodas'), 12, 240, 0.6)})`, width: '100%', marginTop: 4, transformOrigin: 'left center'}}>
						<Verdict kind="WA" size={28} label="si falta alguna, no sirve: no todas las búsquedas la admiten" />
					</div>
				)}
			</div>
			<CutFlash at={a} len={4} max={0.6} />
		</AbsoluteFill>
	);
};

/* ================================================================== 10 · repaso, último reto, remate y despedida */

const BIG_N = 1_000_000;
const BIG_DATA = sortedData(BIG_N);
/** Ejecución real: el último de un millón de elementos (20 comparaciones). */
const BIG = binarySearch(BIG_DATA, BIG_DATA[BIG_N - 1]);
if (BIG.comparisons !== BIG_COMPARISONS) throw new Error(`La ejecución real hizo ${BIG.comparisons} comparaciones, no ${BIG_COMPARISONS}`);

const RECAP = [
	['Los datos deben estar', 'ordenados'],
	['Se examina el', 'punto medio'],
	['Se descarta la mitad que', 'no puede tener la respuesta'],
	['Se repite hasta encontrarlo o', 'agotar el intervalo'],
	['El tiempo crece como', 'O(log n)'],
	['Hay versión', 'iterativa y recursiva'],
];

export const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.cierre;
	const m = (k: string) => M('s15', k);
	const rAt = [m('r1'), m('r2'), m('r3'), m('r4'), m('r5'), m('r6')];
	const reto = m('reto');
	const {zas, veinte, stepGap, hit} = cierreBeats();
	const rec = m('recuerda');
	const dym = m('dym');
	const adios = m('adios');
	const gos = m('goslint');
	const recapOut = tween(f, reto - 14, reto - 2);
	// último reto: cada paso de la traza real cada ~2,6 fotogramas
	const k = Math.max(0, Math.min(BIG.comparisons, Math.floor((f - zas) / stepGap) + 1));
	const size = k === 0 ? BIG_N : k >= BIG.comparisons ? 1 : BIG.steps[k].high - BIG.steps[k].low + 1;
	const retoOut = tween(f, rec - 14, rec - 2);
	const split = f >= hit ? pop(f, hit, 12, 150, 0.7) : 0;
	const fall = tween(f, hit + 6, hit + 40, 0, 1, inCubic);
	const [sx, sy] = shake(f, hit, 14, 10);
	const remateOut = tween(f, adios - 10, adios);
	const logoP = tween(f, gos, gos + 44, 0, 1, outExpo);
	const wordP = tween(f, gos + 40, gos + 56, 0, 1, outExpo);
	const fadeOut = tween(f, b - 30, b - 4);
	// Lint
	let lx = 250;
	let ly = 880;
	let scale = 9;
	let pose = {...BASE};
	let facing: 1 | -1 = 1;
	if (f < reto - 8) {
		const i = rAt.filter((t) => f >= t).length;
		pose = {...BASE, ...(i === 0 ? POSES.wave : i % 2 ? POSES.pointUp : POSES.point)};
	} else if (f < rec - 8) {
		lx = 270;
		const z = f >= zas - 4 && f < veinte + 16;
		pose = z ? {...BASE, ...((chop(Math.floor(f) % 8 < 4 ? 100 : 97, 100, true) as object) ?? {}), smear: null} : {...BASE, ...(f >= veinte + 16 ? {...POSES.cheer} : POSES.carry)};
	} else if (f < adios) {
		lx = 1160 - 12 * 9 - split * 60;
		ly = 600 + fall * 54;
		scale = 9;
		const c = chop(f, hit, true);
		pose = {...BASE, ...(c ?? POSES.carry)};
	} else {
		lx = f < gos - 10 ? 960 : 960 + tween(f, gos - 10, gos + 14, 0, 1, outCubic) * 560;
		ly = 870;
		scale = 10;
		pose = {...BASE, ...POSES.wave, armF: Math.floor(f / 6) % 2 ? 124 : 96, machete: null};
		facing = f >= gos ? -1 : 1;
	}
	return (
		<AbsoluteFill>
			<GridBg opacity={0.45} />
			{/* --- repaso */}
			{f < reto && (
				<div style={{opacity: 1 - recapOut}}>
					<div style={{position: 'absolute', left: 96, top: 96}}>
						<Label size={22} color={C.green} style={{opacity: tween(f, a + 6, a + 14)}}>
							{'// 10 · repaso'}
						</Label>
						<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 56, letterSpacing: '-0.04em', color: C.white, marginTop: 6}}>
							<RiseWords text="Búsqueda binaria en seis ideas" start={m('repaso') - 4} highlight={['seis', 'ideas']} />
						</div>
					</div>
					<div style={{position: 'absolute', left: 500, top: 250, width: 1330}}>
						{RECAP.map(([t, hlt], i) => {
							if (f < rAt[i]) return null;
							const p = pop(f, rAt[i], 15, 220, 0.6);
							const now = i === rAt.filter((t2) => f >= t2).length - 1;
							return (
								<div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, height: 92, marginBottom: 12, background: now ? '#0C1811' : C.panel, borderLeft: `8px solid ${now ? C.green : C.line2}`, padding: '0 22px', opacity: Math.min(1, p * 1.6), transform: `translateX(${(1 - p) * 70}px)`}}>
									<div style={{width: 60, height: 60, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
										<PixelText text={String(i + 1)} scale={6} color="#04110A" bold />
									</div>
									<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.white, letterSpacing: '-0.02em', whiteSpace: 'pre'}}>
										{t} <span style={{color: C.green}}>{hlt}</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
			{/* --- último reto: un millón */}
			{f >= reto - 4 && f < rec && (
				<div style={{opacity: 1 - retoOut}}>
					<div style={{position: 'absolute', left: 96, top: 96}}>
						<Label size={22} color={C.green}>
							{'// 10 · último reto'}
						</Label>
						<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 56, letterSpacing: '-0.04em', color: C.white, marginTop: 6}}>
							<RiseWords text="1.000.000 de números ordenados" start={m('millon') - 4} highlight={['1.000.000']} />
						</div>
					</div>
					<div style={{position: 'absolute', left: 500, top: 300, width: 1330}}>
						<Label size={20} color={C.dim}>
							posiciones que aún podrían tener el objetivo (el último elemento)
						</Label>
						<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 150, color: size === 1 ? C.green : C.white, letterSpacing: '-0.03em', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'}}>{fmt(size)}</div>
						<div style={{position: 'relative', height: 46, background: '#0F1411', border: `2px solid ${C.line2}`, marginTop: 6}}>
							<div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: `${Math.max(0.4, (Math.log2(size) / Math.log2(BIG_N)) * 100)}%`, background: size === 1 ? C.green : 'rgba(0,192,99,0.45)', borderLeft: `4px solid ${C.green}`}} />
						</div>
						<div style={{fontFamily: MONO, fontSize: 18, color: C.faint, marginTop: 6}}>ancho en escala logarítmica · cada corte lo reduce a la mitad</div>
						<div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 30}}>
							<Label size={24} color={C.green}>
								comparaciones
							</Label>
							<span style={{fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.green, fontVariantNumeric: 'tabular-nums'}}>{k}</span>
							{f >= veinte + 16 && (
								<span style={{marginLeft: 20, transform: `scale(${pop(f, veinte + 16, 11, 240, 0.6)})`}}>
									<Verdict kind="AC" size={32} label="y listo" />
								</span>
							)}
						</div>
					</div>
					{k > 0 && k < BIG.comparisons && f % 3 === 0 && null}
					{Array.from({length: 6}, (_, i) => (
						<PixelBurst key={i} f={f} at={Math.round(zas + i * stepGap * 3.3)} x={420} y={720} seed={i + 60} count={9} power={12} grid={8} life={16} colors={['#FFFFFF', C.green]} spread={110} dir={-30} />
					))}
					{f >= zas && f < veinte + 14 && (
						<div style={{position: 'absolute', left: 110, top: 440, transform: `rotate(${-6 + rnd(Math.floor(f / 4)) * 12}deg) scale(${0.9 + rnd(Math.floor(f / 4) + 3) * 0.3})`}}>
							<PixelText text="¡ZAS!" scale={9} color="#FFFFFF" bold shadow={C.greenDeep} />
						</div>
					)}
				</div>
			)}
			{/* --- remate: «ante un problema grande… ¡divide y machetea!» */}
			{f >= rec - 4 && f < adios && (
				<div style={{opacity: 1 - remateOut, transform: `translate(${sx}px, ${sy}px)`}}>
					<div style={{position: 'absolute', left: 96, top: 110, fontFamily: SANS, fontWeight: 820, fontSize: 56, letterSpacing: '-0.04em', color: C.white}}>
						<RiseWords text="Y recuerda: ante un problema grande…" start={rec - 2} highlight={['grande…']} />
					</div>
					{/* el «problema grande» es un bloque: el machete lo parte en dos problemas pequeños */}
					{[0, 1].map((h) => (
						<div key={h} style={{position: 'absolute', left: 700 + h * 460 + (h ? 1 : -1) * split * 60, top: 600 + fall * 90 * (h ? 1 : 0.6), width: 460, height: 190, overflow: 'hidden', transform: `rotate(${(h ? 1 : -1) * fall * 9}deg)`, transformOrigin: h ? 'left bottom' : 'right bottom', opacity: 1 - tween(f, hit + 34, hit + 48) * 0.75}}>
							<div style={{position: 'absolute', left: h ? -460 : 0, top: 0, width: 920, height: 190, background: '#141B17', border: '10px solid #FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12}}>
								<PixelText text="PROBLEMA" scale={10} color="#FFFFFF" bold />
								<PixelText text="GRANDE" scale={8} color={C.amber} bold />
							</div>
						</div>
					))}
					{f >= hit && f < hit + 7 && <div style={{position: 'absolute', left: 1160 - (14 - (f - hit) * 2) / 2, top: 440, width: Math.max(2, 14 - (f - hit) * 2), height: 420, background: '#FFFFFF', opacity: 1 - (f - hit) / 7}} />}
					{f >= hit && f < hit + 5 && <Spot x={1160} y={690} r={700} color="255,255,255" amt={0.55 * (1 - (f - hit) / 5)} />}
					<PixelBurst f={f} at={hit} x={1160} y={640} seed={91} count={34} power={19} grid={9} colors={['#FFFFFF', C.green, C.amber]} spread={200} dir={-90} life={36} />
					{f >= hit + 4 && (
						<div style={{position: 'absolute', left: 96, top: 320, transformOrigin: 'left center', transform: `rotate(-4deg) scale(${pop(f, hit + 4, 9, 240, 0.5)})`}}>
							<PixelText text="¡DIVIDE Y" scale={9} color={C.green} bold shadow="#FFFFFF" />
							<div style={{height: 18}} />
							<PixelText text="MACHETEA!" scale={9} color={C.green} bold shadow="#FFFFFF" />
						</div>
					)}
				</div>
			)}
			{/* --- despedida y logotipo final */}
			{f >= gos - 2 && (
				<AbsoluteFill>
					<Shockwave at={gos} x={760} y={380} />
					<div style={{position: 'absolute', left: 240, width: 1040, top: 170, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						<div style={{transform: `scale(${0.8 + 0.2 * logoP})`}}>
							<LogoMark height={360} p={logoP} glow={f > gos + 44 ? 18 + Math.sin(f / 6) * 6 : 0} />
						</div>
						<div style={{marginTop: 46, clipPath: `inset(0 ${(1 - wordP) * 100}% 0 0)`}}>
							<Wordmark height={88} />
						</div>
						<div style={{marginTop: 40, fontFamily: SANS, fontWeight: 700, fontSize: 44, letterSpacing: '-0.02em', color: C.white, opacity: tween(f, gos + 60, gos + 74), whiteSpace: 'pre'}}>
							¿Te gusta resolver problemas? <span style={{color: C.green}}>Únete a Goslint.</span>
						</div>
						<div style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 22, opacity: tween(f, gos + 78, gos + 92)}}>
							<div style={{background: '#FFFFFF', padding: '8px 16px', borderRadius: 6}}>
								<Img src={staticFile('brand/uceva.png')} style={{height: 54, display: 'block'}} />
							</div>
							<Label size={19} color={C.dim}>
								Semillero de Investigación · Ingeniería de Sistemas
							</Label>
						</div>
					</div>
				</AbsoluteFill>
			)}
			{f >= a + 16 && <Lint x={lx} y={ly} scale={scale} pose={alive(pose, f, talkLevel(f))} facing={facing} light={f >= hit && f < hit + 6 ? {dx: 1, dy: 1, color: '#FFFFFF', amt: 1 - (f - hit) / 6} : {dx: facing, dy: -1, color: C.green, amt: 0.4}} />}
			<CutFlash at={a} len={4} max={0.6} />
			<GlitchBurst at={reto - 4} len={5} intensity={0.7} />
			<GlitchBurst at={rec - 5} len={5} intensity={0.7} />
			<CutFlash at={gos} len={5} />
			<AbsoluteFill style={{background: '#000', opacity: fadeOut, pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};

export const _e = [outCubic, DURATION];
