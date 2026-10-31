import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {outCubic, pop, tween} from '../lib';
import {M, SC, V} from '../timeline';
import {DEMO, binarySearch, binarySearchRecursive} from '../algo/search';
import {Cell, MARK, Marker} from '../arrayviz';
import {Chip, CutFlash, GlitchBurst, GridBg, Label, RiseWords, Verdict, Window} from '../components';
import {Actor, CodePanel, Mono, Note} from '../kit';
import {POSES} from '../mascot';

/* ================================================================== código Java que se muestra y se explica */

export const JAVA_ITER = [
	'static int busquedaBinaria(int[] datos, int objetivo) {',
	'    int low = 0;',
	'    int high = datos.length - 1;',
	'',
	'    while (low <= high) {',
	'        int mid = low + (high - low) / 2;',
	'',
	'        if (datos[mid] == objetivo) {',
	'            return mid;',
	'        } else if (datos[mid] < objetivo) {',
	'            low = mid + 1;',
	'        } else {',
	'            high = mid - 1;',
	'        }',
	'    }',
	'    return -1;',
	'}',
];

export const JAVA_REC = [
	'static int buscar(int[] datos, int objetivo, int low, int high) {',
	'    if (low > high) {',
	'        return -1;          // caso base: intervalo vacío',
	'    }',
	'    int mid = low + (high - low) / 2;',
	'',
	'    if (datos[mid] == objetivo) {',
	'        return mid;         // caso base: encontrado',
	'    }',
	'    if (datos[mid] < objetivo) {',
	'        return buscar(datos, objetivo, mid + 1, high);',
	'    }',
	'    return buscar(datos, objetivo, low, mid - 1);',
	'}',
];

const RUN = binarySearch(DEMO, 43); // traza real que recorre el resaltado de líneas
const RUN42 = binarySearch(DEMO, 42);
const REC = binarySearchRecursive(DEMO, 43);

/* ================================================================== 07 · versión iterativa */

type Ev = {at: number; lines: number[]; low?: number; high?: number; mid?: number | null; msg?: string; ok?: boolean};

export const Iterativa: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = SC.iterativa;
	const m = (k: string) => M('s11', k);
	const [s0, s1, s2, s3] = RUN.steps;
	const en = m('encoge');
	// La ejecución real de busquedaBinaria(datos, 43), línea a línea, al ritmo de la explicación.
	const ev: Ev[] = [
		{at: m('l1'), lines: [1], low: s0.low, msg: 'low = 0'},
		{at: m('l2'), lines: [2], high: s0.high, msg: 'high = 15'},
		{at: m('l3'), lines: [4], msg: `${s0.low} <= ${s0.high}  →  hay intervalo`, ok: true},
		{at: m('l4'), lines: [5], mid: s0.mid, msg: `mid = 0 + (15 − 0) / 2 = ${s0.mid}`},
		{at: m('l5'), lines: [7], msg: `datos[${s0.mid}] = ${s0.value}  ==  43 ?  no`, ok: false},
		{at: m('l6'), lines: [9], msg: `${s0.value} < 43  →  sí`, ok: true},
		{at: m('l6') + 62, lines: [10], low: s0.nextLow, mid: null, msg: `low = ${s0.mid} + 1 = ${s0.nextLow}`},
		{at: m('l7') - 40, lines: [4], msg: `${s1.low} <= ${s1.high}  →  hay intervalo`, ok: true},
		{at: m('l7') - 28, lines: [5], mid: s1.mid, msg: `mid = ${s1.mid}`},
		{at: m('l7') - 14, lines: [7, 9], msg: `datos[${s1.mid}] = ${s1.value}: ni igual ni menor que 43`, ok: false},
		{at: m('l7'), lines: [11, 12], msg: `${s1.value} > 43  →  rama else`},
		{at: m('l7') + 36, lines: [12], high: s1.nextHigh, mid: null, msg: `high = ${s1.mid} − 1 = ${s1.nextHigh}`},
		{at: en, lines: [4], msg: `${s2.low} <= ${s2.high}  →  hay intervalo`, ok: true},
		{at: en + 10, lines: [5], mid: s2.mid, msg: `mid = ${s2.mid}`},
		{at: en + 20, lines: [9], msg: `datos[${s2.mid}] = ${s2.value} < 43  →  sí`, ok: true},
		{at: en + 30, lines: [10], low: s2.nextLow, mid: null, msg: `low = ${s2.nextLow}`},
		{at: en + 42, lines: [4], msg: `${s3.low} <= ${s3.high}  →  hay intervalo`, ok: true},
		{at: en + 52, lines: [5], mid: s3.mid, msg: `mid = ${s3.mid}`},
		{at: en + 62, lines: [7], msg: `datos[${s3.mid}] = ${s3.value}  ==  43  →  sí`, ok: true},
		{at: en + 74, lines: [8], msg: `return ${RUN.index}`, ok: true},
		{at: m('l8'), lines: [15], msg: 'si el intervalo se vacía (low > high): −1'},
	];
	const done = ev.filter((e) => f >= e.at);
	const last = done[done.length - 1];
	let low: number | undefined;
	let high: number | undefined;
	let mid: number | null | undefined;
	for (const e of done) {
		if (e.low !== undefined) low = e.low;
		if (e.high !== undefined) high = e.high;
		if (e.mid !== undefined) mid = e.mid;
	}
	const clave = f >= m('clave') && f < en;
	const active = clave ? [] : last ? last.lines : [];
	const accent = clave ? [10, 12] : f >= m('desborde') && f < m('l5') ? [5] : [];
	const returned = f >= en + 74;
	const cell = 42;
	const pitch = 46;
	const ax = 1126;
	const ay = 262;
	const cx = (k: number) => ax + k * pitch + cell / 2;
	const end = V.s11.end;
	const watch: [string, string | number, string][] = [
		['low', low ?? '—', MARK.low],
		['high', high ?? '—', MARK.high],
		['mid', mid ?? '—', MARK.mid],
		['datos[mid]', mid != null ? DEMO[mid] : '—', C.white],
	];
	return (
		<AbsoluteFill>
			<GridBg opacity={0.45} />
			<div style={{position: 'absolute', left: 96, top: 96}}>
				<Label size={22} color={C.green} style={{opacity: tween(f, a + 6, a + 14)}}>
					{'// 07 · java · versión iterativa'}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 46, letterSpacing: '-0.04em', color: C.white, marginTop: 6}}>
					<RiseWords text="Con un ciclo while" start={m('java') - 6} highlight={['while']} />
				</div>
			</div>
			<Window x={70} y={210} w={1010} h={692} title="BusquedaBinaria.java" p={pop(f, a + 10, 18, 160, 0.8)}>
				<CodePanel lines={JAVA_ITER} active={active} accent={accent} start={a + 18} fontSize={23} lineH={36} pad={16} />
			</Window>
			{/* demostración sobre el arreglo, sincronizada con la línea resaltada */}
			<div style={{position: 'absolute', left: ax, top: 214, opacity: tween(f, a + 30, a + 40)}}>
				<Label size={18} color={C.dim}>
					datos · objetivo = 43
				</Label>
			</div>
			{DEMO.map((v, k) => {
				const inside = low === undefined || high === undefined ? true : k >= low && k <= high;
				const st = returned && k === RUN.index ? 'found' : mid === k ? 'mid' : inside ? 'active' : 'idle';
				return <Cell key={k} x={ax + k * pitch} y={ay + (mid === k ? -5 : 0)} size={cell} value={v} state={st} dim={inside ? 0 : 1} index={k} p={pop(f, a + 30 + k, 14, 240, 0.5)} digit={2} />;
			})}
			{mid != null && <Marker kind="mid" x={cx(mid)} y={ay + cell + 32} size={17} p={1} />}
			{low !== undefined && <Marker kind="low" x={cx(low)} y={ay + cell + 72} size={17} p={pop(f, m('l1'), 14, 220, 0.6)} />}
			{high !== undefined && <Marker kind="high" x={cx(high)} y={ay + cell + 112} size={17} p={pop(f, m('l2'), 14, 220, 0.6)} />}
			{/* panel de variables */}
			<div style={{position: 'absolute', left: ax, top: 478, width: 736, display: 'flex', gap: 10, opacity: tween(f, m('l1') - 10, m('l1'))}}>
				{watch.map(([k, v, col]) => (
					<div key={k} style={{flex: 1, background: C.panel, borderTop: `5px solid ${col}`, padding: '10px 14px'}}>
						<div style={{fontFamily: MONO, fontSize: 19, color: C.dim}}>{k}</div>
						<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 42, color: col}}>{v}</div>
					</div>
				))}
			</div>
			{last && !clave && f < end + 20 && (
				<div style={{position: 'absolute', left: ax, top: 604, width: 736, opacity: tween(f, last.at, last.at + 5)}}>
					<div style={{background: '#050605', border: `2px solid ${last.ok === false ? C.red : last.ok ? C.green : C.line2}`, padding: '12px 18px', fontFamily: MONO, fontWeight: 700, fontSize: 25, color: C.white, whiteSpace: 'pre'}}>
						<span style={{color: C.dim, fontWeight: 500}}>{`línea ${last.lines[0] + 1}  `}</span>
						{last.msg}
					</div>
				</div>
			)}
			<Note at={m('desborde') - 4} out={m('l5') - 4} x={ax} y={690} w={548} color={C.amber} title="¿por qué no (low + high) / 2?">
				Con arreglos gigantes, <Mono color={C.amber}>low + high</Mono> puede pasarse del máximo de un <Mono>int</Mono>. <Mono color={C.green}>low + (high − low) / 2</Mono> da lo mismo sin desbordarse.
			</Note>
			<Note at={m('clave')} out={en - 2} x={ax} y={604} w={548} title="la clave: + 1 y − 1">
				<Mono color={MARK.low}>low = mid + 1</Mono> y <Mono color={MARK.high}>high = mid − 1</Mono> sacan a <Mono color={MARK.mid}>mid</Mono> del intervalo: en cada vuelta se encoge y el ciclo termina.
			</Note>
			{returned && (
				<div style={{position: 'absolute', left: ax, top: 700, transform: `scale(${pop(f, en + 74, 11, 240, 0.6)})`, transformOrigin: 'left center'}}>
					<Verdict kind="AC" size={30} label="busquedaBinaria(datos, 43) → 10" />
				</div>
			)}
			{f >= end + 24 && (
				<div style={{position: 'absolute', left: ax, top: 770, transform: `scale(${pop(f, end + 24, 11, 240, 0.6)})`, transformOrigin: 'left center'}}>
					<Verdict kind="AC" size={30} label={`busquedaBinaria(datos, 42) → ${RUN42.index}`} />
					<div style={{fontFamily: MONO, fontSize: 19, color: C.dim, marginTop: 10}}>{`low = ${RUN42.finalLow} > high = ${RUN42.finalHigh} tras ${RUN42.comparisons} comparaciones`}</div>
				</div>
			)}
			<Actor
				x={1770}
				y={900}
				scale={7}
				enter={a + 24}
				facing={-1}
				keys={[
					{at: m('java'), pose: POSES.pointUp},
					{at: m('l3'), pose: POSES.point},
					{at: m('desborde'), pose: POSES.think},
					{at: m('l5'), pose: POSES.point},
					{at: m('clave'), pose: POSES.pointUp},
					{at: en + 74, pose: POSES.cheer},
					{at: m('l8') + 20, pose: POSES.point},
					{at: end + 24, pose: POSES.cheer},
				]}
				hops={[en + 74]}
				light={{dx: -1, dy: -1, color: C.green, amt: 0.4}}
			/>
			<CutFlash at={a} len={4} max={0.6} />
		</AbsoluteFill>
	);
};

/* ================================================================== 08 · versión recursiva */

export const Recursiva: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = SC.recursiva;
	const part2 = V.s13.start - 26;
	return (
		<AbsoluteFill>
			<GridBg opacity={0.45} />
			{f < part2 ? <RecCodigo /> : <Comparacion />}
			<CutFlash at={a} len={4} max={0.6} />
			<GlitchBurst at={part2 - 3} len={6} intensity={0.8} />
		</AbsoluteFill>
	);
};

const RecCodigo: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = SC.recursiva;
	const m = (k: string) => M('s12', k);
	const pila = m('pila');
	const reg = m('regresa');
	const active = f >= reg ? [7] : f >= pila ? [10] : f >= m('rec') ? [9, 10, 12] : f >= m('base2') ? [6, 7] : f >= m('base1') ? [1, 2] : f >= m('params') ? [0] : [];
	const calls = REC.calls;
	const pushAt = (i: number) => pila + i * 28;
	const popAt = (i: number) => reg + 16 + (calls.length - 1 - i) * 24; // el último en entrar es el primero en responder
	const sx = 1130;
	const sizes = calls.map((c) => c.high - c.low + 1);
	const depth = calls.filter((_, i) => f >= pushAt(i) && f < popAt(i) + 16).length;
	return (
		<>
			<div style={{position: 'absolute', left: 96, top: 96}}>
				<Label size={22} color={C.green} style={{opacity: tween(f, a + 6, a + 14)}}>
					{'// 08 · java · versión recursiva'}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 46, letterSpacing: '-0.04em', color: C.white, marginTop: 6}}>
					<RiseWords text="Un método que se llama a sí mismo" start={m('def') - 4} highlight={['sí', 'mismo']} />
				</div>
			</div>
			<Window x={70} y={210} w={1010} h={600} title="BusquedaBinaria.java" p={pop(f, a + 10, 18, 160, 0.8)}>
				<CodePanel lines={JAVA_REC} active={active} start={a + 18} fontSize={22} lineH={37} pad={18} />
			</Window>
			{f >= m('base1') && f < pila && (
				<div style={{position: 'absolute', left: 90, top: 826, display: 'flex', gap: 14}}>
					<div style={{transform: `scale(${pop(f, m('base1'), 13, 240, 0.6)})`}}>
						<Chip size={22} border={f < m('base2') ? C.green : C.line2}>
							<span style={{color: C.green}}>caso base 1</span>low {'>'} high → −1
						</Chip>
					</div>
					{f >= m('base2') && (
						<div style={{transform: `scale(${pop(f, m('base2'), 13, 240, 0.6)})`}}>
							<Chip size={22} border={f < m('rec') ? C.green : C.line2}>
								<span style={{color: C.green}}>caso base 2</span>encontrado → mid
							</Chip>
						</div>
					)}
					{f >= m('rec') && (
						<div style={{transform: `scale(${pop(f, m('rec'), 13, 240, 0.6)})`}}>
							<Chip size={22} border={C.green}>
								<span style={{color: C.amber}}>llamada recursiva</span>solo la mitad que importa
							</Chip>
						</div>
					)}
				</div>
			)}
			{/* la misma tarea, cada vez más pequeña */}
			{f >= m('def') && f < pila - 6 && (
				<div style={{position: 'absolute', left: sx, top: 250, width: 720, opacity: 1 - tween(f, pila - 16, pila - 6)}}>
					<Label size={20} color={C.dim} style={{marginBottom: 16, opacity: tween(f, m('def'), m('def') + 8)}}>
						el mismo problema, cada vez más pequeño
					</Label>
					{sizes.map((s, i) => {
						const at = m('def') + 30 + i * 36;
						if (f < at) return null;
						const p = pop(f, at, 14, 220, 0.6);
						return (
							<div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, height: 84, marginLeft: i * 34}}>
								<div style={{width: Math.max(44, (s / 16) * 440), height: 54, background: i === sizes.length - 1 ? C.green : '#0B3A24', border: `3px solid ${C.green}`, transformOrigin: 'left', transform: `scaleX(${p})`}} />
								<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.white, opacity: Math.min(1, p * 2), whiteSpace: 'pre'}}>
									buscar en {s} {s === 1 ? 'elemento' : 'elementos'}
								</div>
							</div>
						);
					})}
				</div>
			)}
			{/* pila de llamadas (traza real de buscar(datos, 43, 0, 15)) */}
			{f >= pila - 6 && (
				<div style={{position: 'absolute', left: sx, top: 236, width: 720}}>
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
						<Label size={20} color={C.dim}>
							pila de llamadas
						</Label>
						<span style={{fontFamily: MONO, fontSize: 22, color: C.dim}}>
							profundidad <span style={{color: C.green, fontWeight: 800, fontSize: 32}}>{depth}</span>
						</span>
					</div>
					<div style={{position: 'relative', height: 500, marginTop: 10, borderBottom: `4px solid ${C.line2}`, borderLeft: `4px solid ${C.line2}`, borderRight: `4px solid ${C.line2}`}}>
						{calls.map((c, i) => {
							if (f < pushAt(i)) return null;
							const p = pop(f, pushAt(i), 14, 200, 0.7);
							const ret = f >= popAt(i);
							const gone = tween(f, popAt(i) + 8, popAt(i) + 18);
							if (gone >= 1) return null;
							return (
								<div key={i} style={{position: 'absolute', left: 14, right: 14, bottom: 12 + i * 118, height: 106, background: ret ? '#06301C' : C.panel2, border: `3px solid ${ret ? C.green : i === depth - 1 ? '#FFFFFF' : C.line2}`, padding: '10px 16px', transform: `translateY(${(1 - p) * -160}px)`, opacity: Math.min(1, p * 1.6) * (1 - gone)}}>
									<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 25, color: C.white, whiteSpace: 'pre'}}>
										buscar(datos, 43, <span style={{color: MARK.low}}>{c.low}</span>, <span style={{color: MARK.high}}>{c.high}</span>)
									</div>
									<div style={{fontFamily: MONO, fontSize: 21, color: C.dim, marginTop: 8, whiteSpace: 'pre'}}>
										<span style={{color: MARK.mid}}>mid = {c.mid}</span>
										{`  datos[${c.mid}] = ${DEMO[c.mid!]}  `}
										{ret ? <span style={{color: C.green, fontWeight: 800}}>{`→ devuelve ${REC.index}`}</span> : c.result === 'found' ? <span style={{color: C.green, fontWeight: 800}}>caso base</span> : <span style={{color: C.amber}}>espera a la siguiente…</span>}
									</div>
								</div>
							);
						})}
					</div>
					{f >= popAt(0) + 14 && (
						<div style={{marginTop: 18, transform: `scale(${pop(f, popAt(0) + 14, 11, 240, 0.6)})`, transformOrigin: 'left center'}}>
							<Verdict kind="AC" size={30} label={`buscar(datos, 43, 0, 15) → ${REC.index}`} />
						</div>
					)}
				</div>
			)}
			<Actor
				x={1010}
				y={212}
				scale={5}
				enter={a + 40}
				keys={[
					{at: m('def'), pose: POSES.pointUp},
					{at: m('base1'), pose: POSES.point},
					{at: pila, pose: POSES.pointUp},
					{at: reg + 100, pose: POSES.cheer},
				]}
				light={{dx: 1, dy: -1, color: C.green, amt: 0.4}}
			/>
		</>
	);
};

const Comparacion: React.FC = () => {
	const f = useCurrentFrame();
	const m = (k: string) => M('s13', k);
	const card = (x: number, title: string, col: string, body: React.ReactNode) => (
		<div style={{position: 'absolute', left: x, top: 236, width: 650, height: 560, background: C.panel, borderTop: `8px solid ${col}`, padding: '22px 28px', opacity: tween(f, m('mejor') - 20, m('mejor') - 8)}}>
			<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 46, letterSpacing: '-0.03em', color: C.white}}>{title}</div>
			{body}
		</div>
	);
	const row = (at: number, label: string, child: React.ReactNode) =>
		f >= at ? (
			<div style={{marginTop: 22, opacity: tween(f, at, at + 8), transform: `translateY(${(1 - pop(f, at, 16, 220, 0.6)) * 20}px)`}}>
				<Label size={18} color={C.dim}>
					{label}
				</Label>
				<div style={{marginTop: 8}}>{child}</div>
			</div>
		) : null;
	const big = (t: string, col: string) => <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 40, color: col}}>{t}</span>;
	return (
		<>
			<div style={{position: 'absolute', left: 96, top: 96}}>
				<Label size={22} color={C.green}>
					{'// 08 · iterativa o recursiva'}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 46, letterSpacing: '-0.04em', color: C.white, marginTop: 6}}>
					<RiseWords text="¿Cuál es mejor?" start={m('mejor') - 6} highlight={['mejor']} />
				</div>
			</div>
			{card(
				110,
				'Iterativa',
				C.blue,
				<>
					{row(m('mismas'), 'comparaciones (buscando el 43)', big(String(RUN.comparisons), C.white))}
					{row(
						m('iter'),
						'memoria extra',
						<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
							{(['low', 'mid', 'high'] as const).map((k) => (
								<div key={k} style={{background: MARK[k], color: '#04110A', fontFamily: MONO, fontWeight: 800, fontSize: 24, padding: '8px 14px'}}>{k}</div>
							))}
							<span style={{fontFamily: MONO, fontSize: 22, color: C.dim}}>siempre 3 variables</span>
							{f >= m('o1') && <span style={{marginLeft: 8, transform: `scale(${pop(f, m('o1'), 11, 240, 0.6)})`}}>{big('O(1)', C.green)}</span>}
						</div>,
					)}
					{row(m('v1'), 'ventaja', <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.white}}>Ahorra memoria</span>)}
				</>,
			)}
			{card(
				1160,
				'Recursiva',
				C.amber,
				<>
					{row(m('mismas'), 'comparaciones (buscando el 43)', big(String(REC.calls.length), C.white))}
					{row(
						m('recu'),
						'memoria extra',
						<div style={{display: 'flex', alignItems: 'flex-end', gap: 14}}>
							<div style={{display: 'flex', flexDirection: 'column-reverse', gap: 4}}>
								{REC.calls.map((c, i) => (
									<div key={i} style={{width: 210, height: 26, background: C.panel2, border: `2px solid ${C.amber}`, fontFamily: MONO, fontSize: 16, color: C.text, paddingLeft: 8, transformOrigin: 'left', transform: `scaleX(${pop(f, m('recu') + 10 + i * 10, 14, 220, 0.6)})`}}>{`buscar(…, ${c.low}, ${c.high})`}</div>
								))}
							</div>
							<span style={{fontFamily: MONO, fontSize: 20, color: C.dim, width: 120}}>una llamada por división</span>
							{f >= m('ologn') && <span style={{whiteSpace: 'nowrap', transform: `scale(${pop(f, m('ologn'), 11, 240, 0.6)})`}}>{big('O(log n)', C.amber)}</span>}
						</div>,
					)}
					{row(m('v2'), 'ventaja', <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.white}}>Expresa la idea de forma directa</span>)}
				</>,
			)}
			<Actor
				x={960}
				y={800}
				scale={8}
				keys={[
					{at: m('mejor'), pose: POSES.think},
					{at: m('mismas'), pose: POSES.shrug},
					{at: m('iter'), pose: POSES.point},
					{at: m('recu'), pose: POSES.point},
					{at: m('sincontar'), pose: POSES.pointUp},
					{at: m('v1'), pose: POSES.point},
					{at: m('v2'), pose: POSES.point},
					{at: m('ninguna'), pose: POSES.shrug},
					{at: m('ninguna') + 60, pose: POSES.cheer},
				]}
				facing={(f >= m('iter') && f < m('recu')) || (f >= m('v1') && f < m('v2')) ? -1 : 1}
				light={{dx: 0, dy: -1, color: C.green, amt: 0.35}}
			/>
			{f >= m('sincontar') && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 172, display: 'flex', justifyContent: 'center', opacity: tween(f, m('sincontar'), m('sincontar') + 8)}}>
					<Chip size={22} border={C.line2}>
						<span style={{color: C.green}}>*</span>espacio auxiliar: no incluye el arreglo original
					</Chip>
				</div>
			)}
			{f >= m('ninguna') && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 826, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, m('ninguna'), 13, 220, 0.6)})`}}>
					<div style={{background: '#050605', border: `2px solid ${C.green}`, padding: '14px 30px', fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.white, letterSpacing: '-0.02em'}}>
						Ninguna gana siempre: elige la que deje tu código <span style={{color: C.green}}>más claro</span>.
					</div>
				</div>
			)}
		</>
	);
};

export const _d = outCubic;
