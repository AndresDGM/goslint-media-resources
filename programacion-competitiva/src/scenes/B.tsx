import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {inCubic, inOutCubic, pop, tween} from '../lib';
import {M, SC} from '../timeline';
import {ChapterTitle, Chip, GlitchBurst, GridBg, Label, Spot, Verdict, Window, WipeBar, shake} from '../components';
import {Actor, CodePanel} from '../kit';
import {Emote, POSES} from '../mascot';
import {PixelBurst} from '../pixel';
import {CASES, SUBS} from '../solutions';

/* ================================================================== el problema de ejemplo */

const fmtN = (n: number) => n.toLocaleString('es-CO').replace(/,/g, '.');
const expected = (n: number) => fmtN(n * (n + 1) / 2);

/** Tarjeta de problema estilo juez: cabecera, límites, enunciado, entrada, salida y ejemplo. */
const ProblemCard: React.FC<{x: number; y: number; at: number; hl: (k: string) => number; compact?: number}> = ({x, y, at, hl, compact = 0}) => {
	const f = useCurrentFrame();
	const p = pop(f, at, 16, 170, 0.8);
	const sec = (k: string, title: string, body: React.ReactNode) => {
		const on = hl(k);
		return (
			<div style={{position: 'relative', padding: '12px 18px', marginTop: 10, background: on > 0 ? `rgba(0,192,99,${0.14 * on})` : 'transparent', borderLeft: `5px solid ${on > 0 ? C.green : 'transparent'}`}}>
				<div style={{fontFamily: MONO, fontSize: 18, letterSpacing: '0.14em', textTransform: 'uppercase', color: on > 0 ? C.green : C.faint}}>{title}</div>
				<div style={{fontFamily: SANS, fontWeight: 520, fontSize: 28, color: C.text, marginTop: 4, lineHeight: 1.3}}>{body}</div>
			</div>
		);
	};
	return (
		<div style={{position: 'absolute', left: x, top: y + (1 - p) * 60, width: 900, opacity: Math.min(1, p * 1.5), background: '#F2F5F3', boxShadow: '0 40px 120px rgba(0,0,0,0.6)', transform: `scale(${1 - compact * 0.12})`, transformOrigin: 'top left'}}>
			<div style={{background: '#050605', padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 16}}>
				<span style={{fontFamily: MONO, fontWeight: 800, fontSize: 22, color: '#001a0c', background: C.green, padding: '4px 12px'}}>A</span>
				<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.white, letterSpacing: '-0.02em'}}>Suma hasta n</span>
				<span style={{marginLeft: 'auto', fontFamily: MONO, fontSize: 20, color: hl('restricciones') > 0 ? C.green : C.dim}}>tiempo: 1 s · memoria: 256 MB</span>
			</div>
			<div style={{background: '#0E110F', padding: '10px 10px 18px 10px'}}>
				{sec('enunciado', 'Enunciado', 'Lint quiere saber cuánto da 1 + 2 + 3 + … + n.')}
				{sec('entrada', 'Entrada', 'Un entero n.')}
				{sec('salida', 'Salida', 'La suma 1 + 2 + … + n.')}
				{sec('restricciones', 'Restricciones', <span style={{fontFamily: MONO, fontSize: 28}}>1 ≤ n ≤ 10⁹</span>)}
				<div style={{display: 'flex', gap: 14, padding: '12px 18px 0 18px', fontFamily: MONO, fontSize: 24, color: C.text}}>
					<div style={{flex: 1, border: `1px solid ${C.line2}`, padding: '8px 14px'}}>
						<span style={{color: C.faint, fontSize: 16, letterSpacing: '0.14em'}}>EJEMPLO · ENTRADA</span>
						<div>3</div>
					</div>
					<div style={{flex: 1, border: `1px solid ${C.line2}`, padding: '8px 14px'}}>
						<span style={{color: C.faint, fontSize: 16, letterSpacing: '0.14em'}}>EJEMPLO · SALIDA</span>
						<div>6</div>
					</div>
				</div>
			</div>
		</div>
	);
};

/* ================================================================== 02 · ¿cómo es un problema? */

export const Problema: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.problema;
	const k = (m: string) => M('s03', m);
	const marks = ['enunciado', 'entrada', 'salida', 'restricciones'];
	const hl = (m: string) => {
		const i = marks.indexOf(m);
		const t0 = k(m);
		const t1 = i < marks.length - 1 ? k(marks[i + 1]) : k('entender') - 6;
		return Math.min(tween(f, t0 - 2, t0 + 6), 1 - tween(f, t1 - 4, t1 + 4));
	};
	const steps = [
		{at: k('entender'), n: '1', t: 'Entender', g: '¿qué piden?'},
		{at: k('piensas'), n: '2', t: 'Pensar el algoritmo', g: '¿bucle? ¿fórmula?'},
		{at: k('implementas'), n: '3', t: 'Implementar', g: ''},
	];
	const langs = [
		{at: k('cpp'), t: 'C++'},
		{at: k('java'), t: 'Java'},
		{at: k('python'), t: 'Python'},
	];
	const shift = tween(f, k('entender') - 12, k('entender') + 6, 0, 1, inOutCubic);
	return (
		<AbsoluteFill>
			<GridBg opacity={0.45} size={90} />
			<ChapterTitle at={a + 6} n="02" label="los problemas" title="¿Cómo es un problema?" highlight={['problema?']} />
			<div style={{transform: `translateX(${-shift * 20}px)`}}>
				<ProblemCard x={110} y={300} at={k('enunciado') - 20} hl={hl} compact={shift} />
			</div>
			{steps.map((s, i) => {
				if (f < s.at - 2) return null;
				const p = pop(f, s.at, 16, 210, 0.6);
				return (
					<div key={i} style={{position: 'absolute', left: 990, top: 330 + i * 150 + (1 - p) * 30, width: 560, opacity: Math.min(1, p * 1.5), display: 'flex', gap: 22, alignItems: 'center'}}>
						<div style={{width: 84, height: 84, flex: '0 0 84px', border: `3px solid ${C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.green}}>{s.n}</div>
						<div>
							<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 42, color: C.white, letterSpacing: '-0.03em'}}>{s.t}</div>
							{s.g && <div style={{fontFamily: MONO, fontSize: 22, color: C.dim, marginTop: 4}}>{s.g}</div>}
							{i === 2 && (
								<div style={{display: 'flex', gap: 12, marginTop: 10}}>
									{langs.map((l, j) => (f >= l.at - 1 ? <Chip key={j} size={22} border={C.green} style={{opacity: pop(f, l.at, 14, 220, 0.5)}}>{l.t}</Chip> : null))}
								</div>
							)}
						</div>
					</div>
				);
			})}
			<Actor
				x={1640}
				y={880}
				scale={10}
				enter={a + 4}
				facing={-1}
				keys={[
					{at: a + 4, pose: POSES.idle},
					{at: k('enunciado'), pose: {...POSES.point, look: -1}},
					{at: k('entender'), pose: POSES.think},
					{at: k('piensas'), pose: {...POSES.think, eyes: 'open'}},
					{at: k('implementas'), pose: {...POSES.pointUp, look: -1}},
					{at: k('python') + 10, pose: POSES.cheer},
				]}
			/>
			<Emote x={1640} y={560} text="?" f={f} at={k('entender')} dur={40} scale={6} color={C.green} />
			<Emote x={1640} y={560} text="..." f={f} at={k('piensas') + 4} dur={46} scale={6} color={C.white} />
			<GlitchBurst at={a} len={5} />
			<WipeBar at={b - 8} dur={12} />
		</AbsoluteFill>
	);
};

/* ================================================================== 03 · jueces en línea */

const PIPE = ['Envío', 'Compilación', 'Casos de prueba', 'Veredicto'];

const CaseDot: React.FC<{state: 'idle' | 'ok' | 'bad' | 'skip'; verdict?: string; size?: number}> = ({state, verdict, size = 40}) => {
	const bg = state === 'ok' ? C.green : state === 'bad' ? (verdict === 'TLE' ? C.amber : verdict === 'RTE' ? C.purple : C.red) : 'transparent';
	return (
		<div style={{width: size, height: size, border: `2px solid ${state === 'idle' || state === 'skip' ? C.line2 : bg}`, background: bg, opacity: state === 'skip' ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: size * 0.5, color: state === 'ok' ? '#001a0c' : '#160006'}}>
			{state === 'ok' ? '✓' : state === 'bad' ? '✗' : ''}
		</div>
	);
};

export const Juez: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.juez;
	const k = (m: string) => M('s04', m);
	const jueces = k('jueces');
	const ejecutan = k('ejecutan');
	const envio = k('envio');
	const verdictAt = [k('wa'), k('tle'), k('rte'), k('ac')];
	const ejemplo = k('ejemplo');
	const todos = k('todos');
	// envío activo: cada uno «corre» sus casos durante los ~40 fotogramas previos a su veredicto
	const active = verdictAt.filter((t) => f >= t - 40).length - 1;
	const sub = active >= 0 ? SUBS[active] : null;
	const runStart = active >= 0 ? verdictAt[active] - 40 : 0;
	const caseState = (si: number, ci: number, fr: number): 'idle' | 'ok' | 'bad' | 'skip' => {
		const s = SUBS[si];
		const t0 = verdictAt[si] - 40;
		const step = 36 / CASES.length;
		if (fr < t0 + ci * step) return 'idle';
		if (s.failAt && ci + 1 === s.failAt) return 'bad';
		if (s.failAt && ci + 1 > s.failAt) return 'skip';
		return 'ok';
	};
	const pipeOut = tween(f, envio - 16, envio - 4, 0, 1, inCubic);
	const [sx, sy] = shake(f, verdictAt[0], 8);
	const exGlow = Math.min(tween(f, ejemplo, ejemplo + 8), 1 - tween(f, todos - 8, todos));
	const allGreen = f >= todos;
	return (
		<AbsoluteFill>
			<GridBg opacity={0.45} size={90} />
			<ChapterTitle at={a + 6} n="03" label="jueces en línea" title="¿Cómo sabes si funciona?" highlight={['funciona?']} out={envio - 4} />
			{/* cómo trabaja un juez */}
			{f >= jueces - 4 && f < envio && (
				<AbsoluteFill style={{opacity: 1 - pipeOut}}>
					{PIPE.map((t, i) => {
						const at = i === 0 ? jueces + 4 : ejecutan + (i - 1) * 14;
						if (f < at - 2) return null;
						const p = pop(f, at, 16, 200, 0.6);
						return (
							<React.Fragment key={i}>
								<div style={{position: 'absolute', left: 110 + i * 330, top: 360 + (1 - p) * 30, width: 270, height: 120, opacity: Math.min(1, p * 1.5), background: C.panel, border: `2px solid ${i === 3 ? C.green : C.line2}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 24}}>
									<Label size={16} color={C.faint}>{`paso ${i + 1}`}</Label>
									<div style={{fontFamily: SANS, fontWeight: 760, fontSize: 32, color: C.white, marginTop: 4}}>{t}</div>
								</div>
								{i > 0 && <div style={{position: 'absolute', left: 110 + i * 330 - 50, top: 392, fontFamily: MONO, fontSize: 40, color: C.green, opacity: p}}>→</div>}
							</React.Fragment>
						);
					})}
					{f >= k('verifican') - 2 && (
						<div style={{position: 'absolute', left: 110, top: 540, opacity: pop(f, k('verifican'), 16, 200, 0.6)}}>
							<Label size={20} color={C.green}>{'// casos de prueba: tu salida contra la esperada'}</Label>
							<div style={{display: 'flex', gap: 16, marginTop: 16}}>
								{CASES.map((n, i) => (
									<div key={i} style={{background: C.panel, border: `1px solid ${C.line2}`, padding: '12px 18px', fontFamily: MONO, fontSize: 22, color: C.text, opacity: tween(f, k('verifican') + i * 4, k('verifican') + i * 4 + 6)}}>
										<div style={{color: C.faint, fontSize: 16}}>{`caso ${i + 1}${i === 0 ? ' · ejemplo' : ''}`}</div>
										<div>{`n = ${fmtN(n)}`}</div>
										<div style={{color: C.green}}>{`→ ${expected(n)}`}</div>
									</div>
								))}
							</div>
						</div>
					)}
				</AbsoluteFill>
			)}
			{/* los cuatro envíos de Lint */}
			{f >= envio - 4 && (
				<AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
					<Window x={96} y={130} w={800} h={470} title={sub ? `${sub.file} · ${sub.lang}` : 'solucion'} p={pop(f, envio - 4, 16, 170, 0.8)}>
						{sub && <CodePanel key={sub.id} lines={sub.code} start={runStart - 10} fontSize={23} lineH={38} py={sub.lang === 'Python'} />}
					</Window>
					<div style={{position: 'absolute', left: 96, top: 630, width: 800}}>
						<Label size={18} color={C.faint}>{'// casos de prueba (el 1 es el ejemplo del enunciado)'}</Label>
						<div style={{display: 'flex', gap: 14, marginTop: 12, alignItems: 'center'}}>
							{CASES.map((n, ci) => (
								<div key={ci} style={{textAlign: 'center', padding: 8, background: ci === 0 && exGlow > 0 ? `rgba(0,192,99,${0.22 * exGlow})` : 'transparent', border: ci === 0 && exGlow > 0 ? `2px solid rgba(0,192,99,${exGlow})` : '2px solid transparent'}}>
									<CaseDot state={allGreen ? 'ok' : active >= 0 ? caseState(active, ci, f) : 'idle'} verdict={sub?.verdict} size={56} />
									<div style={{fontFamily: MONO, fontSize: 16, color: C.dim, marginTop: 6}}>{ci === 4 ? 'n = 10⁹' : `n = ${fmtN(n)}`}</div>
								</div>
							))}
						</div>
					</div>
					{/* tabla de envíos */}
					<div style={{position: 'absolute', left: 950, top: 130, width: 560}}>
						<Label size={18} color={C.green}>{'// mis envíos · problema A'}</Label>
						{SUBS.map((s, i) => {
							const at = verdictAt[i];
							if (f < at - 40) return null;
							const judging = f < at;
							const p = pop(f, at - 40, 16, 210, 0.6);
							const meaning = {WA: 'respuesta incorrecta', TLE: 'tardó demasiado', RTE: 'error al ejecutarse', AC: '¡solución correcta!'}[s.verdict];
							return (
								<div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, padding: '14px 18px', background: C.panel, border: `1px solid ${i === active ? C.line2 : C.line}`, opacity: Math.min(1, p * 1.5) * (i === active || allGreen ? 1 : 0.6), transform: `translateX(${(1 - p) * 40}px)`}}>
									<span style={{fontFamily: MONO, fontSize: 20, color: C.faint}}>{`#${i + 1}`}</span>
									<span style={{fontFamily: MONO, fontSize: 20, color: C.text, width: 92}}>{s.lang}</span>
									{judging ? (
										<span style={{fontFamily: MONO, fontSize: 20, color: C.amber}}>{`evaluando${'.'.repeat(Math.floor(f / 6) % 4)}`}</span>
									) : (
										<>
											<span style={{transform: `scale(${1 + 0.25 * (1 - tween(f, at, at + 10))})`, display: 'inline-block'}}>
												<Verdict kind={s.verdict} size={26} />
											</span>
											<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.text}}>{meaning}</span>
										</>
									)}
								</div>
							);
						})}
						{f >= verdictAt[0] && (
							<div style={{fontFamily: MONO, fontSize: 18, color: C.dim, marginTop: 16, opacity: tween(f, verdictAt[0], verdictAt[0] + 10)}}>
								{sub && !allGreen && f >= verdictAt[active] && sub.failAt > 0 ? `falla en el caso ${sub.failAt}` : ''}
							</div>
						)}
					</div>
					{f >= ejemplo && f < todos && (
						<div style={{position: 'absolute', left: 950, top: 700, width: 560, opacity: tween(f, ejemplo + 4, ejemplo + 12)}}>
							<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.white, lineHeight: 1.25}}>
								Los cuatro envíos <span style={{color: C.green}}>pasaban el ejemplo</span>. Solo uno pasó todos los casos.
							</div>
						</div>
					)}
				</AbsoluteFill>
			)}
			{f >= verdictAt[3] && <PixelBurst f={f} at={verdictAt[3]} x={1250} y={520} count={28} power={20} />}
			<Spot x={1700} y={760} r={260} amt={0.14} />
			<Actor
				x={1720}
				y={900}
				scale={9}
				enter={a + 4}
				facing={-1}
				keys={[
					{at: a + 4, pose: POSES.think},
					{at: jueces, pose: POSES.cheer},
					{at: ejecutan, pose: {...POSES.point, look: -1}},
					{at: envio, pose: {...POSES.pointDown, look: -1}},
					{at: verdictAt[0], pose: POSES.oops},
					{at: verdictAt[1], pose: POSES.tired},
					{at: verdictAt[2], pose: POSES.wow},
					{at: verdictAt[3], pose: POSES.cheer},
					{at: ejemplo + 10, pose: {...POSES.point, look: -1}},
					{at: k('desafio'), pose: POSES.wave},
				]}
				hops={[jueces + 2, verdictAt[3]]}
			/>
			<Emote x={1720} y={600} text="!" f={f} at={verdictAt[0] + 2} dur={30} scale={6} color={C.red} />
			<Emote x={1720} y={600} text="..." f={f} at={verdictAt[1] + 2} dur={30} scale={6} color={C.amber} />
			<Emote x={1720} y={600} text="?!" f={f} at={verdictAt[2] + 2} dur={30} scale={6} color={C.purple} />
			<GlitchBurst at={a} len={5} />
			<GlitchBurst at={verdictAt[0]} len={5} intensity={0.7} />
			<WipeBar at={b - 8} dur={12} />
		</AbsoluteFill>
	);
};
