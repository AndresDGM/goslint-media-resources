import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {clamp, inCubic, outExpo, pop, rnd, tween} from '../../lib';
import {GlitchBurst, GridBg, Label, LogoMark, Typer, Wordmark} from '../../components';
import {formatClock} from '../../scenes/ColdOpen';
import {R2, T, clockV2} from '../../reel-v2/timeline';

/* ============================================================ hook */

const Slam: React.FC<{n: string; word: string; label: string; at: number; until: number}> = ({n, word, label, at, until}) => {
	const f = useCurrentFrame();
	if (f < at || f >= until) return null;
	const p = pop(f, at, 12, 260, 0.5);
	const s = 1.35 - 0.35 * p;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<div style={{transform: `scale(${s})`, opacity: Math.min(1, p * 2), textAlign: 'center'}}>
				<Label color={C.green} size={26} style={{marginBottom: 18}}>
					{label}
				</Label>
				<div style={{fontFamily: SANS, fontWeight: 850, fontSize: 230, lineHeight: 0.9, letterSpacing: '-0.045em', color: C.white}}>
					<span style={{color: C.green}}>{n}</span> {word}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const END = R2.hook[1];

/**
 * «Cinco horas, tres personas, un solo computador y un reloj que no se detiene.»
 * The 16:9 cold open on the word timings of the final narration: the rules slam in on the voice,
 * the clock takes the screen on «y un reloj» and races into the logo.
 */
export const HookH2: React.FC = () => {
	const f = useCurrentFrame();
	const clockIn = pop(f, T.yUnReloj - 4, 14, 160, 0.7);
	const shake = interpolate(f, [END - 48, END - 4], [0, 14], {...clamp, easing: inCubic});
	const sx = (rnd(f * 3.1) - 0.5) * shake;
	const sy = (rnd(f * 7.7) - 0.5) * shake;
	const sweep = f * (1 + Math.max(0, f - T.yUnReloj) * 0.15);
	const grow = tween(f, END - 36, END - 4, 0, 0.12, inCubic);
	const flash = interpolate(f, [END - 6, END - 4, END - 1], [0, 1, 0], clamp);
	const summary = tween(f, T.yUnReloj - 6, T.yUnReloj + 8) * (1 - tween(f, END - 10, END - 4));
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.45} />
			<div style={{position: 'absolute', left: 110, top: 96, fontFamily: MONO, fontSize: 30, color: C.text}}>
				<span style={{color: C.green}}>goslint@uceva</span>
				<span style={{color: C.dim}}>:~$ </span>
				<Typer text="./maraton --duracion=5h --equipo=3 --computadores=1" start={-12} cps={48} />
			</div>

			<Slam n="5" word="horas" label="tiempo de competencia" at={T.cinco - 3} until={T.tres - 2} />
			<Slam n="3" word="personas" label="por equipo" at={T.tres - 2} until={T.unSolo - 2} />
			<Slam n="1" word="computador" label="para los tres" at={T.unSolo - 2} until={T.yUnReloj - 4} />

			{/* compact recap that stays above the clock */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 168,
					textAlign: 'center',
					opacity: summary,
					transform: `translateY(${(1 - summary) * 20}px)`,
					fontFamily: MONO,
					fontSize: 32,
					letterSpacing: '0.12em',
					color: C.dim,
				}}
			>
				<span style={{color: C.green}}>5</span> HORAS · <span style={{color: C.green}}>3</span> PERSONAS · <span style={{color: C.green}}>1</span> COMPUTADOR
			</div>

			{f >= T.yUnReloj - 4 && (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: 60, transform: `translate(${sx}px, ${sy}px) scale(${0.85 + clockIn * 0.15 + grow})`, opacity: clockIn}}>
					<svg width={640} height={640} viewBox="-380 -380 760 760" style={{position: 'absolute'}}>
						{Array.from({length: 60}, (_, i) => {
							const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
							const lit = sweep % 60 > i;
							const r1 = i % 5 === 0 ? 318 : 332;
							return (
								<line
									key={i}
									x1={Math.cos(a) * r1}
									y1={Math.sin(a) * r1}
									x2={Math.cos(a) * 352}
									y2={Math.sin(a) * 352}
									stroke={lit ? C.green : 'rgba(255,255,255,0.22)'}
									strokeWidth={i % 5 === 0 ? 6 : 3}
								/>
							);
						})}
						<circle r={300} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
					</svg>
					<div style={{textAlign: 'center'}}>
						<Label color={C.green} size={24} style={{marginBottom: 6}}>
							tiempo restante
						</Label>
						<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 150, color: C.white, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>
							{formatClock(clockV2(f))}
						</div>
					</div>
				</AbsoluteFill>
			)}

			<GlitchBurst at={END - 22} len={4} intensity={0.6} />
			<GlitchBurst at={END - 14} len={5} intensity={0.9} />
			<GlitchBurst at={END - 7} len={6} intensity={1.3} />
			<AbsoluteFill style={{background: C.white, opacity: flash}} />
		</AbsoluteFill>
	);
};

/* ============================================================ logo */

/** «Esto es Goslint, el semillero de Ingeniería de Sistemas de la UCEVA»: mark on «Esto es», wordmark on «Goslint». */
export const LogoH2: React.FC = () => {
	const f = useCurrentFrame();
	const [A, B] = R2.logo;
	const p = tween(f, A + 2, A + 32, 0, 1, outExpo);
	const ring = tween(f, A, A + 40, 0, 1, outExpo);
	const wordP = tween(f, T.goslint, T.goslint + 14, 0, 1, outExpo);
	const glitch = f >= T.goslint && f < T.goslint + 8 ? (rnd(f) - 0.5) * 40 : 0;
	const tag = pop(f, T.goslint + 9, 16, 180, 0.7);
	const lab = tween(f, T.elSemillero - 4, T.elSemillero + 6);
	const exit = tween(f, B - 11, B, 0, 1, inCubic);
	const glow = 18 + Math.sin(f / 6) * 6;
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.5} size={90} />
			{/* shockwave */}
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div
					style={{
						width: 200 + ring * 1900,
						height: 200 + ring * 1900,
						borderRadius: '50%',
						border: `${Math.max(1, 30 * (1 - ring))}px solid ${C.green}`,
						opacity: 1 - ring,
						position: 'absolute',
						top: 345 - (200 + ring * 1900) / 2,
					}}
				/>
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', transform: `scale(${1 + exit * 0.6})`, opacity: 1 - exit}}>
				<div style={{marginTop: 150, transform: `scale(${0.8 + 0.2 * p})`}}>
					<LogoMark height={390} p={p} glow={f > A + 32 ? glow : 0} />
				</div>
				<div
					style={{
						marginTop: 52,
						clipPath: `inset(0 ${(1 - wordP) * 100}% 0 0)`,
						transform: `translateX(${glitch}px)`,
						filter: glitch ? `drop-shadow(${glitch / 3}px 0 0 ${C.green})` : undefined,
					}}
				>
					<Wordmark height={96} />
				</div>
				<div style={{marginTop: 42, textAlign: 'center', opacity: tag, transform: `translateY(${(1 - tag) * 24}px)`}}>
					<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, color: C.white, letterSpacing: '-0.02em'}}>Programación competitiva </span>
					<span style={{fontFamily: SANS, fontWeight: 400, fontSize: 46, color: C.dim, letterSpacing: '-0.02em'}}>e investigación académica.</span>
				</div>
				<Label size={22} color={C.faint} style={{marginTop: 22, opacity: lab}}>
					Semillero de Investigación · Ingeniería de Sistemas · UCEVA
				</Label>
			</AbsoluteFill>
			<AbsoluteFill style={{background: C.white, opacity: interpolate(f, [A, A + 3], [0.9, 0], clamp)}} />
		</AbsoluteFill>
	);
};
