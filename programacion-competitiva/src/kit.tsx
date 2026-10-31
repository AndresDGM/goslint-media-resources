import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from './theme';
import {pop, tween} from './lib';
import {BASE, Key, Lint, Pose, Stop, alive, hop, poseTrack, walk, walkTo} from './mascot';
import type {Light} from './pixel';
import {CHAPTERS, CHAPTER_COUNT, CUES, DURATION, M, SC, talkLevel} from './timeline';

/* ================================================================== actor: la mascota con pista de poses */

/**
 * Lint dirigido por una pista de poses (`keys`) y, opcionalmente, por paradas de caminata.
 * La boca se mueve con la envolvente real de la narración y parpadea/respira sola.
 */
export const Actor: React.FC<{
	x: number;
	y: number;
	scale?: number;
	keys?: Key[];
	stops?: Stop[];
	facing?: 1 | -1;
	light?: Light | null;
	/** fotograma en que cae a escena desde arriba */
	enter?: number;
	/** fotograma en que sale */
	leave?: number;
	hops?: number[];
	carrying?: boolean;
	override?: Partial<Pose> | null;
}> = ({x, y, scale = 8, keys = [], stops = [], facing = 1, light = null, enter, leave, hops = [], carrying = false, override = null}) => {
	const f = useCurrentFrame();
	if (enter !== undefined && f < enter) return null;
	if (leave !== undefined && f >= leave) return null;
	const w = walkTo(f, x, stops);
	let pose: Pose = w.walking ? {...BASE, ...walk(f, carrying)} : poseTrack(f, keys);
	if (override && !w.walking) pose = {...BASE, ...override};
	pose = alive(pose, f, talkLevel(f));
	const drop = enter !== undefined ? tween(f, enter, enter + 12, 1, 0, (t) => 1 - (1 - t) * (1 - t)) : 0;
	let jump = enter !== undefined ? hop(f, enter + 12, 8, 20) : 0;
	for (const h of hops) jump += hop(f, h, 14, 64);
	const out = leave !== undefined ? tween(f, leave - 8, leave, 0, 1) : 0;
	return <Lint x={w.x} y={y - jump - drop * 620} scale={scale} pose={pose} facing={w.walking ? (w.dir as 1 | -1) : facing} light={light} opacity={1 - out} />;
};

/* ================================================================== subtítulos y HUD */

/** Subtítulos fieles a la locución, sincronizados con los tiempos por palabra. */
export const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const cue = CUES.find((c) => f >= c.from - 2 && f < c.to);
	if (!cue) return null;
	const o = Math.min(tween(f, cue.from - 2, cue.from + 3), 1 - tween(f, cue.to - 3, cue.to));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center', opacity: o, pointerEvents: 'none'}}>
			<div style={{maxWidth: 1400, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 34, lineHeight: 1.3, color: C.white, background: 'rgba(0,0,0,0.66)', padding: '10px 24px', borderRadius: 8}}>{cue.text}</div>
		</div>
	);
};

/** HUD de concurso del sistema v1: prompt a la izquierda; a la derecha, capítulo y avance. */
export const Hud: React.FC = () => {
	const f = useCurrentFrame();
	const from = SC.intro[0] + 96;
	const end = M('s10', 'gusta') - 6; // el HUD cede la pantalla al logotipo final
	if (f < from || f > end) return null;
	const o = tween(f, from, from + 12) * (1 - tween(f, end - 14, end));
	const ch = CHAPTERS.find((c) => f >= SC[c.scene][0] && f < SC[c.scene][1]) ?? CHAPTERS[0];
	return (
		<div style={{position: 'absolute', left: 48, right: 48, top: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: MONO, fontSize: 20, color: 'rgba(255,255,255,0.7)', opacity: o, letterSpacing: '0.08em', textShadow: '0 1px 6px rgba(0,0,0,0.8)'}}>
			<span>
				<span style={{color: C.green}}>●</span> goslint@uceva
			</span>
			<span style={{display: 'flex', alignItems: 'center', gap: 16}}>
				<span style={{textTransform: 'uppercase'}}>{`${ch.n}/${CHAPTER_COUNT} · ${ch.label}`}</span>
				<span style={{width: 170, height: 4, background: 'rgba(255,255,255,0.16)', display: 'inline-block', position: 'relative'}}>
					<span style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(f / DURATION) * 100}%`, background: C.green}} />
				</span>
			</span>
		</div>
	);
};

/* ================================================================== código con resaltado de líneas */

const KW = new Set(['int', 'long', 'if', 'else', 'for', 'while', 'return', 'def', 'in', 'print', 'input', 'range', 'include', 'using', 'namespace', 'std', 'cin', 'cout', 'endl', 'main']);
const VAR: Record<string, string> = {suma: '#FFFFFF', n: '#FFFFFF'};

const tokenize = (line: string, py = false): {t: string; c: string; w?: number}[] => {
	const out: {t: string; c: string; w?: number}[] = [];
	const ci = py ? line.search(/(^|\s)#/) : line.indexOf('//');
	const code = ci >= 0 ? line.slice(0, ci) : line;
	for (const m of code.matchAll(/[A-Za-z_][A-Za-z0-9_]*|-?\d+|\s+|./g)) {
		const t = m[0];
		if (KW.has(t)) out.push({t, c: C.green, w: 700});
		else if (VAR[t]) out.push({t, c: VAR[t], w: 700});
		else if (/^-?\d+$/.test(t)) out.push({t, c: '#FFD08A'});
		else if (/^[A-Za-z_]/.test(t)) out.push({t, c: C.text});
		else out.push({t, c: C.dim});
	}
	if (ci >= 0) out.push({t: line.slice(ci), c: C.faint});
	return out;
};

export const CodePanel: React.FC<{
	lines: string[];
	/** líneas activas (se resaltan); el resto se atenúa */
	active?: number[];
	/** líneas con acento secundario (ámbar) */
	accent?: number[];
	start: number;
	fontSize?: number;
	lineH?: number;
	pad?: number;
	py?: boolean;
}> = ({lines, active = [], accent = [], start, fontSize = 24, lineH = 36, pad = 26, py = false}) => {
	const f = useCurrentFrame();
	const any = active.length > 0 || accent.length > 0;
	return (
		<div style={{position: 'absolute', inset: 0, padding: `${pad}px 0`, fontFamily: MONO, fontSize, lineHeight: `${lineH}px`, fontVariantLigatures: 'none'}}>
			{lines.map((ln, i) => {
				const p = tween(f, start + i * 2, start + i * 2 + 8);
				const on = active.includes(i);
				const ac = accent.includes(i);
				return (
					<div key={i} style={{position: 'relative', height: lineH, opacity: p * (any && !on && !ac ? 0.5 : 1), whiteSpace: 'pre', paddingLeft: 74}}>
						{(on || ac) && <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: on ? 'rgba(0,192,99,0.17)' : 'rgba(255,181,71,0.13)', borderLeft: `6px solid ${on ? C.green : C.amber}`}} />}
						<span style={{position: 'absolute', left: 18, width: 36, textAlign: 'right', color: on ? C.green : C.faint, fontSize: fontSize * 0.78}}>{i + 1}</span>
						<span style={{position: 'relative'}}>
							{ln === '' ? ' ' : tokenize(ln, py).map((tk, k) => (
								<span key={k} style={{color: tk.c, fontWeight: tk.w ?? 500}}>
									{tk.t}
								</span>
							))}
						</span>
					</div>
				);
			})}
		</div>
	);
};

/** Nota flotante (pizarra): borde lateral de color y texto en dos pesos. */
export const Note: React.FC<{at: number; out?: number; x: number; y: number; w?: number; color?: string; title?: string; children: React.ReactNode; size?: number}> = ({at, out, x, y, w, color = C.green, title, children, size = 26}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out)) return null;
	const p = pop(f, at, 16, 200, 0.6);
	const o = out !== undefined ? 1 - tween(f, out - 8, out) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y + (1 - p) * 20, width: w, opacity: Math.min(1, p * 1.6) * o, background: 'rgba(8,11,9,0.94)', borderLeft: `6px solid ${color}`, padding: '14px 20px', boxShadow: '0 16px 50px rgba(0,0,0,0.5)'}}>
			{title && <div style={{fontFamily: MONO, fontSize: size * 0.72, letterSpacing: '0.14em', textTransform: 'uppercase', color, marginBottom: 6}}>{title}</div>}
			<div style={{fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: 1.3, color: C.text, letterSpacing: '-0.01em'}}>{children}</div>
		</div>
	);
};

export const Mono: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.white}) => <span style={{fontFamily: MONO, fontWeight: 700, color, letterSpacing: 0}}>{children}</span>;
