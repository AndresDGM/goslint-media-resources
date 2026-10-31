import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO} from './theme';
import {inOutCubic, outCubic, pop, tween} from './lib';
import {PixelBurst, PixelText, textWidth} from './pixel';
import {BASE, Lint, POSES, Pose, alive, chop, hop, walk} from './mascot';
import {LightCone, Spot, shake} from './components';
import type {BinaryRun, Step} from './algo/search';
import {talkLevel} from './timeline';

/* ================================================================== celda numérica en pixel art */

export type CellState = 'idle' | 'active' | 'mid' | 'found' | 'hidden' | 'bad' | 'visited';

const SKIN: Record<CellState, {border: string; fill: string; ink: string; hi: string}> = {
	idle: {border: '#5C6A62', fill: '#0F1411', ink: '#C4CFC8', hi: '#1B231E'},
	active: {border: '#FFFFFF', fill: '#141B17', ink: '#FFFFFF', hi: '#26312B'},
	mid: {border: C.green, fill: '#06301C', ink: '#FFFFFF', hi: '#0B5231'},
	found: {border: '#FFFFFF', fill: C.green, ink: '#00190C', hi: '#5BE3A1'},
	hidden: {border: '#4A554F', fill: '#0C100E', ink: '#5C6A62', hi: '#151B17'},
	bad: {border: C.red, fill: '#2B070B', ink: '#FFFFFF', hi: '#4A0F16'},
	visited: {border: '#3C4741', fill: '#0B0F0D', ink: '#6C7972', hi: '#121814'},
};

/** Esquinas escalonadas de un «píxel» de tamaño u. */
const stepped = (u: number) => `polygon(${u}px 0, calc(100% - ${u}px) 0, calc(100% - ${u}px) ${u}px, 100% ${u}px, 100% calc(100% - ${u}px), calc(100% - ${u}px) calc(100% - ${u}px), calc(100% - ${u}px) 100%, ${u}px 100%, ${u}px calc(100% - ${u}px), 0 calc(100% - ${u}px), 0 ${u}px, ${u}px ${u}px)`;

export const Cell: React.FC<{
	x: number;
	y: number;
	size: number;
	value: number | string;
	state?: CellState;
	/** 0..1: atenuado y rayado de una celda descartada */
	dim?: number;
	index?: number;
	/** escala de aparición 0..1 */
	p?: number;
	h?: number;
	/** escala fija de los dígitos (por defecto se ajusta al tamaño de la celda) */
	digit?: number;
}> = ({x, y, size, value, state = 'active', dim = 0, index, p = 1, h, digit}) => {
	if (p <= 0.01) return null;
	const s = SKIN[state];
	const u = Math.max(3, Math.round(size / 16));
	const text = String(value);
	const maxScale = Math.floor((size - u * 4) / textWidth(text));
	const scale = digit ?? Math.max(2, Math.min(u, maxScale));
	const H = h ?? size;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: size, height: H, transform: `scale(${p})`, opacity: 1 - dim * 0.5}}>
			<div style={{position: 'absolute', inset: 0, background: s.border, clipPath: stepped(u)}} />
			<div style={{position: 'absolute', inset: u, background: s.fill, clipPath: stepped(u)}}>
				<div style={{position: 'absolute', left: u, right: u, top: 0, height: u, background: s.hi}} />
				<div style={{position: 'absolute', left: 0, top: u, bottom: u, width: u, background: s.hi}} />
			</div>
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<PixelText text={text} scale={scale} color={s.ink} />
			</div>
			{dim > 0.02 && (
				<div
					style={{
						position: 'absolute',
						inset: u,
						opacity: dim * 0.8,
						backgroundImage: `repeating-linear-gradient(135deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) ${u}px, transparent ${u}px, transparent ${u * 3}px)`,
					}}
				/>
			)}
			{index !== undefined && (
				<div style={{position: 'absolute', left: 0, right: 0, top: H + 6, textAlign: 'center', fontFamily: MONO, fontWeight: 500, fontSize: Math.max(15, size * 0.21), color: state === 'mid' || state === 'found' ? C.white : C.dim}}>{index}</div>
			)}
		</div>
	);
};

/* ================================================================== indicadores low / mid / high */

export const MARK = {low: C.blue, mid: C.green, high: C.amber} as const;

export const Marker: React.FC<{x: number; y: number; kind: 'low' | 'mid' | 'high'; value?: number | string; p?: number; size?: number}> = ({x, y, kind, value, p = 1, size = 24}) => {
	if (p <= 0.01) return null;
	const col = MARK[kind];
	return (
		<div style={{position: 'absolute', left: x, top: y + (1 - p) * 18, transform: 'translateX(-50%)', opacity: Math.min(1, p * 1.5), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<div style={{width: 0, height: 0, borderLeft: `${size * 0.42}px solid transparent`, borderRight: `${size * 0.42}px solid transparent`, borderBottom: `${size * 0.5}px solid ${col}`}} />
			<div style={{background: col, color: '#04110A', fontFamily: MONO, fontWeight: 800, fontSize: size, lineHeight: 1, padding: `${size * 0.22}px ${size * 0.42}px`, whiteSpace: 'pre'}}>
				{kind}
				{value !== undefined ? ` = ${value}` : ''}
			</div>
		</div>
	);
};

/* ================================================================== escenario de búsqueda con machete */

export type StepTiming = {
	/** fotograma en que se identifica el punto medio */
	mid: number;
	/** fotograma en que aparece la comparación (por defecto mid + 18) */
	cmp?: number;
	/** fotograma del impacto del machete (pasos que descartan) o de la celebración (paso que encuentra) */
	hit: number;
};

export type StageProps = {
	data: readonly number[];
	target: number;
	/** traza real del algoritmo: de aquí salen low, mid, high y la mitad descartada */
	run: BinaryRun;
	timing: StepTiming[];
	cx?: number;
	top: number;
	cell: number;
	gap?: number;
	mscale?: number;
	/** fotograma en que aparecen las celdas */
	appear: number;
	/** fotograma en que todo el escenario sale */
	leave?: number;
	/** índice (puede ser fraccionario) sobre el que la mascota espera al principio */
	startAt?: number;
	/** fotograma en que la mascota salta al arreglo */
	enter?: number;
	/** el machete ya está desenvainado al empezar */
	armed?: boolean;
	/** fotograma en que desenvaina por primera vez sin golpear (el chiste de «dividir y machetear») */
	drawAt?: number;
	markers?: {low: number; high: number} | null;
	/** fotograma en que se declara el intervalo vacío (búsqueda sin éxito) */
	emptyAt?: number;
	/** celda que se revela en rojo dentro de la mitad descartada (demostración «sin orden») */
	reveal?: {index: number; at: number};
	showBanner?: boolean;
	bannerY?: number;
	/** el «¡ZAS!» en pantalla en cada impacto */
	zas?: boolean;
	/** pose dirigida por la escena (gana a la pose automática cuando la mascota no camina ni machetea) */
	override?: (f: number) => {pose: Partial<Pose>; facing?: 1 | -1} | null;
};

const SPLIT = 44;

export const cmpText = (s: Step, target: number) => (s.cmp === 'eq' ? `${target} = ${s.value}` : s.cmp === 'lt' ? `${target} > ${s.value}` : `${target} < ${s.value}`);
export const actionText = (s: Step) => (s.cmp === 'eq' ? '¡encontrado!' : s.cmp === 'lt' ? 'descarta la mitad izquierda' : 'descarta la mitad derecha');

/** Geometría compartida: posición de cada celda en cada fotograma (incluye la separación de los cortes). */
export const useStage = (pr: StageProps, f: number) => {
	const {data, run, timing, cell, top} = pr;
	const gap = pr.gap ?? 8;
	const cx = pr.cx ?? 960;
	const n = data.length;
	const pitch = cell + gap;
	const x0 = cx - (n * pitch - gap) / 2;
	const steps = run.steps.slice(0, timing.length);
	const cuts = steps
		.map((s, i) => ({s, t: timing[i], i}))
		.filter((c) => c.s.discard)
		.map((c) => ({
			...c,
			/** el corte cae entre las celdas b-1 y b */
			b: c.s.discard!.side === 'left' ? c.s.discard!.to + 1 : c.s.discard!.from,
			split: f >= c.t.hit ? pop(f, c.t.hit, 13, 150, 0.7) : 0,
			dim: tween(f, c.t.hit + 3, c.t.hit + 20, 0, 1, outCubic),
		}));
	const offset = (j: number) => {
		let dx = 0;
		let dy = 0;
		let dim = 0;
		for (const c of cuts) {
			dx += (j < c.b ? -1 : 1) * (SPLIT / 2) * c.split;
			const d = c.s.discard!;
			if (j >= d.from && j <= d.to) {
				dx += (d.side === 'left' ? -1 : 1) * 22 * c.dim;
				dy += 20 * c.dim;
				dim = Math.max(dim, c.dim);
			}
		}
		return {dx, dy, dim};
	};
	const clampI = (k: number) => Math.max(0, Math.min(n - 1, k));
	/** centro en X de un índice; admite índices fraccionarios o fuera de rango (low = n, high = −1) */
	const centerX = (j: number) => {
		const a = Math.floor(j);
		const t = j - a;
		const at = (k: number) => x0 + k * pitch + cell / 2 + offset(clampI(k)).dx;
		return at(a) + (at(a + 1) - at(a)) * t;
	};
	return {gap, cx, n, pitch, x0, steps, cuts, offset, centerX, clampI, top};
};

export const SearchStage: React.FC<StageProps> = (pr) => {
	const f = useCurrentFrame();
	const {data, target, timing, cell, top, appear} = pr;
	const mscale = pr.mscale ?? 6;
	const g = useStage(pr, f);
	const {n, steps, cuts, offset, centerX, x0, pitch, clampI} = g;
	const leave = pr.leave ?? Infinity;
	const out = leave === Infinity ? 0 : tween(f, leave - 12, leave, 0, 1);
	if (f < appear - 2 || f >= leave) return null;

	// --- paso actual
	let cur = 0;
	while (cur < steps.length - 1 && f >= timing[cur].hit + 12) cur++;
	const st = steps[cur];
	const tm = timing[cur];
	const midOn = f >= tm.mid && (st.cmp === 'eq' || f < tm.hit + 4);
	const found = st.cmp === 'eq' && f >= tm.hit;
	const lastCut = cuts.filter((c) => f >= c.t.hit).pop();
	const empty = pr.emptyAt !== undefined && f >= pr.emptyAt;

	// --- límites animados (salen de la traza real: nextLow / nextHigh)
	let low = steps[0].low;
	let high = steps[0].high;
	for (const c of cuts) {
		const k = tween(f, c.t.hit + 10, c.t.hit + 26, 0, 1, inOutCubic);
		low += (c.s.nextLow - c.s.low) * k;
		high += (c.s.nextHigh - c.s.high) * k;
	}
	const lowI = Math.round(low);
	const highI = Math.round(high);

	// --- mascota: posición, orientación y pose
	const stanceOff = 12 * mscale;
	const stance = (i: number) => {
		const s = steps[i];
		if (!s.discard) return {x: centerX(s.mid), facing: 1 as 1 | -1};
		const b = s.discard.side === 'left' ? s.discard.to + 1 : s.discard.from;
		const keptNeighbor = s.discard.side === 'left' ? clampI(b) : clampI(b - 1);
		const edge = x0 + b * pitch - g.gap / 2 + offset(keptNeighbor).dx;
		return s.discard.side === 'left' ? {x: edge + stanceOff, facing: -1 as 1 | -1} : {x: edge - stanceOff, facing: 1 as 1 | -1};
	};
	let mx = centerX(pr.startAt ?? (n - 1) / 2);
	let facing: 1 | -1 = 1;
	let walking = false;
	let armed = pr.armed ?? false;
	if (pr.drawAt !== undefined && f >= pr.drawAt) armed = true;
	for (let i = 0; i <= cur; i++) {
		const goal = stance(i);
		const free = i > 0 ? timing[i - 1].hit + 12 : (pr.enter ?? appear) + 16;
		const dist = Math.abs(goal.x - mx);
		const deadline = steps[i].discard ? timing[i].hit - 15 : timing[i].hit - 8;
		const need = Math.max(6, Math.min(44, Math.round(dist / 9), Math.max(6, deadline - free)));
		const wEnd = Math.min(deadline, Math.max(free + need, timing[i].mid + 4 + need));
		const wStart = wEnd - need;
		if (f >= wEnd) {
			mx = goal.x;
			facing = goal.facing;
		} else if (f >= wStart && dist > 4) {
			const t = (f - wStart) / need;
			facing = goal.x > mx ? 1 : -1;
			mx = mx + (goal.x - mx) * t;
			walking = true;
		}
		if (i < cur && steps[i].discard) armed = true;
	}
	const talk = talkLevel(f);
	let pose: Pose = {...BASE};
	let jump = 0;
	const enter = pr.enter ?? appear;
	if (walking) pose = {...BASE, ...walk(f, armed)};
	else {
		const c = st.discard ? chop(f, tm.hit, armed) : null;
		const prevChop = cur > 0 && steps[cur - 1].discard ? chop(f, timing[cur - 1].hit, true) : null;
		if (c) pose = {...BASE, ...c};
		else if (prevChop) pose = {...BASE, ...prevChop};
		else if (found) {
			pose = {...BASE, ...POSES.cheer, machete: null, armF: Math.floor(f / 5) % 2 ? 122 : 100, armB: Math.floor(f / 5) % 2 ? 100 : 122};
			jump = hop(f, tm.hit, 14, 70) + hop(f, tm.hit + 18, 12, 44);
		} else if (empty) pose = {...BASE, ...POSES.shrug};
		else if (lastCut && f < lastCut.t.hit + 62 && f >= lastCut.t.hit + 22) pose = {...BASE, ...POSES.aim};
		else if (pr.drawAt !== undefined && f >= pr.drawAt && f < pr.drawAt + 44) {
			const k = outCubic(Math.min(1, (f - pr.drawAt) / 10));
			pose = {...BASE, armF: 60 + 66 * k, machete: 250 - 95 * k, eyes: 'happy', mouth: 3, headDy: -1};
		} else if (midOn && !found) pose = {...BASE, ...(armed ? {...POSES.carry, look: 1, headDy: 1} : POSES.pointDown)};
		else pose = {...BASE, ...(armed ? POSES.carry : {})};
		const ov = pr.override?.(f);
		if (ov && !c && !(prevChop && f < timing[cur - 1].hit + 22) && !found) {
			pose = {...BASE, ...(armed ? POSES.carry : {}), ...ov.pose};
			if (ov.facing) facing = ov.facing;
		}
	}
	const drop = tween(f, enter, enter + 12, 1, 0, outCubic);
	jump += hop(f, enter + 12, 8, 16);
	if (f < enter) pose = {...BASE};
	pose = alive(pose, f, talk);
	const impact = cuts.find((c) => f >= c.t.hit && f < c.t.hit + 6);
	const light = impact
		? {dx: facing, dy: 1, color: '#FFFFFF', amt: 1 - (f - impact.t.hit) / 6}
		: found
			? {dx: 0, dy: 1, color: C.green, amt: 0.75}
			: midOn
				? {dx: Math.sign(centerX(st.mid) - mx) || 1, dy: 1, color: C.green, amt: 0.5 * tween(f, tm.mid, tm.mid + 8)}
				: {dx: 1, dy: -1, color: '#9FB3A8', amt: 0.18};

	// --- sacudida de cámara en cada impacto
	let sx = 0;
	let sy = 0;
	for (const c of cuts) {
		const [a, b] = shake(f, c.t.hit, 9, 9);
		sx += a;
		sy += b;
	}

	const midX = centerX(st.mid);
	const midAmt = midOn ? tween(f, tm.mid, tm.mid + 8) * (found ? 1 : 0.9) : 0;
	const mk = pr.markers;
	const markerY = top + cell + 46;
	const rowH = 58;
	const cmpAt = (i: number) => timing[i].cmp ?? timing[i].mid + 18;
	const bi = f >= cmpAt(cur) ? cur : cur - 1;
	const bs = bi >= 0 ? steps[bi] : null;
	const standOn = clampI(Math.round((mx - x0 - cell / 2) / pitch));

	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `translate(${sx}px, ${sy}px)`}}>
			{/* luz: cono sobre el elemento central, resplandor del intervalo activo, destello del hallazgo */}
			<LightCone x={midX} top={top - 330} bottom={top + cell + 6} w0={18} w1={cell * 1.9} amt={0.2 * midAmt} />
			<Spot x={midX} y={top + cell / 2} r={cell * 2.1} amt={0.26 * midAmt} />
			{!empty && f >= appear + 10 && lowI <= highI && (
				<div
					style={{
						position: 'absolute',
						left: centerX(low) - cell / 2 - 14,
						width: Math.max(0, centerX(high) - centerX(low) + cell + 28),
						top: top + cell + 2,
						height: 10,
						background: `linear-gradient(180deg, rgba(0,192,99,${0.55 * tween(f, appear + 10, appear + 24)}), rgba(0,192,99,0))`,
					}}
				/>
			)}
			{found && <Spot x={midX} y={top + cell / 2} r={cell * 4.2} amt={0.42 * (1 - tween(f, tm.hit, tm.hit + 40) * 0.6)} />}

			{/* celdas */}
			{data.map((v, j) => {
				const o = offset(j);
				const isMid = midOn && j === st.mid;
				const inRange = j >= lowI && j <= highI && !empty;
				const revealed = pr.reveal && pr.reveal.index === j && f >= pr.reveal.at;
				const state = found && j === st.mid ? 'found' : revealed ? 'bad' : isMid ? 'mid' : inRange ? 'active' : 'idle';
				const p = pop(f, appear + j * (n > 10 ? 1 : 2), 14, 220, 0.6);
				const bump = isMid ? -8 * tween(f, tm.mid, tm.mid + 6) : 0;
				const foundBump = found && j === st.mid ? -10 * pop(f, tm.hit, 10, 200, 0.6) : 0;
				const dim = revealed ? o.dim * (0.3 + 0.25 * Math.sin((f - pr.reveal!.at) / 3)) : o.dim;
				return <Cell key={j} x={x0 + j * pitch + o.dx} y={top + o.dy + bump + foundBump} size={cell} value={v} state={state} dim={dim} index={j} p={p} />;
			})}

			{/* tachado de cada mitad descartada */}
			{cuts.map((c) => {
				const d = c.s.discard!;
				const k = tween(f, c.t.hit + 8, c.t.hit + 22, 0, 1, outCubic);
				if (k <= 0) return null;
				const a = x0 + d.from * pitch + offset(d.from).dx;
				const b = x0 + d.to * pitch + cell + offset(d.to).dx;
				const w = (b - a) * k;
				return <div key={c.i} style={{position: 'absolute', left: d.side === 'left' ? b - w : a, width: w, top: top + cell / 2 + offset(d.from).dy - 4, height: 8, background: 'rgba(255,77,94,0.5)'}} />;
			})}

			{/* indicadores low / mid / high: una fila fija para cada uno, así nunca se pisan */}
			{mk && (
				<>
					<Marker kind="mid" x={midX} y={markerY} value={st.mid} p={midOn ? pop(f, tm.mid, 14, 220, 0.6) : 0} />
					<Marker kind="low" x={centerX(low)} y={markerY + rowH} value={lowI} p={pop(f, mk.low, 14, 220, 0.6)} />
					<Marker kind="high" x={centerX(high)} y={markerY + rowH * 2} value={highI} p={pop(f, mk.high, 14, 220, 0.6)} />
				</>
			)}

			{/* efectos del machetazo: tajo, partículas, destello y onomatopeya */}
			{cuts.map((c) => {
				const k = f - c.t.hit;
				if (k < 0 || k > 40) return null;
				const d = c.s.discard!;
				const bx = x0 + c.b * pitch - g.gap / 2;
				const zx = bx + (d.side === 'left' ? -1 : 1) * (60 + mscale * 16);
				const zp = pop(f, c.t.hit, 9, 260, 0.5);
				return (
					<React.Fragment key={c.i}>
						{k < 7 && <div style={{position: 'absolute', left: bx - (14 - k * 2) / 2, top: top - 120, width: Math.max(2, 14 - k * 2), height: cell + 220, background: '#FFFFFF', opacity: 1 - k / 7}} />}
						{k < 5 && <Spot x={bx} y={top + cell / 2} r={520 - k * 40} color="255,255,255" amt={0.5 * (1 - k / 5)} />}
						<PixelBurst f={f} at={c.t.hit} x={bx} y={top + cell * 0.3} seed={c.i + 3} count={22} power={15} grid={mscale} colors={['#FFFFFF', C.green, '#DCE6E0']} spread={170} dir={-90} life={30} />
						<PixelBurst f={f} at={c.t.hit + 1} x={bx} y={top + cell} seed={c.i + 9} count={10} power={9} grid={mscale} colors={['#5C6A62', '#FFFFFF']} spread={120} dir={90} gravity={0.6} life={22} />
						{pr.zas !== false && k < 30 && (
							<div style={{position: 'absolute', left: zx - 150, width: 300, top: top - mscale * 30, display: 'flex', justifyContent: 'center', transform: `rotate(${d.side === 'left' ? 7 : -7}deg) scale(${0.5 + zp * 0.5})`, opacity: k > 22 ? 1 - (k - 22) / 8 : 1}}>
								<PixelText text="¡ZAS!" scale={Math.round(mscale * 1.4)} color="#FFFFFF" bold shadow={C.greenDeep} />
							</div>
						)}
					</React.Fragment>
				);
			})}
			{found && <PixelBurst f={f} at={tm.hit} x={midX} y={top} seed={77} count={30} power={17} grid={mscale} colors={[C.green, '#FFFFFF', '#5BE3A1']} spread={150} dir={-90} life={38} />}

			{/* mascota: de pie sobre la mitad que se conserva */}
			{f >= enter - 1 && <Lint x={mx} y={top + offset(standOn).dy - jump - drop * 500} scale={mscale} pose={pose} facing={facing} light={light} />}

			{/* comparación: la del paso anterior permanece hasta que se plantea la siguiente */}
			{pr.showBanner !== false && bs && (
				<div style={{position: 'absolute', left: 0, right: 0, top: pr.bannerY ?? top + cell + 236, display: 'flex', justifyContent: 'center', gap: 22, alignItems: 'center', opacity: tween(f, cmpAt(bi), cmpAt(bi) + 6)}}>
					<div style={{background: '#050605', border: `2px solid ${bs.cmp === 'eq' ? C.green : C.line2}`, padding: '10px 22px', fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.white, whiteSpace: 'pre'}}>
						<span style={{color: C.dim, fontWeight: 500}}>objetivo </span>
						{cmpText(bs, target).replace(/ ([<>=]) /, '  $1  ')}
						<span style={{color: MARK.mid}}>{'  ← mid'}</span>
					</div>
					{(bs.cmp === 'eq' ? f >= timing[bi].hit : f >= timing[bi].hit - 4) && (
						<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.06em', textTransform: 'uppercase', color: bs.cmp === 'eq' ? C.green : C.red}}>{`→ ${actionText(bs)}`}</div>
					)}
				</div>
			)}
		</div>
	);
};
