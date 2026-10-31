import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {clamp, inCubic, pop, tween} from '../lib';
import {Cursor, GlitchBurst, GridBg, Label, LogoMark, Verdict} from '../components';
import {SYNC} from '../timeline';

// The four lines of work, verbatim from the Goslint poster.
export const PILLARS = [
	{n: '01', t: 'Entrenamiento', d: 'Algoritmos, estructuras de datos y análisis de complejidad, con práctica en jueces en línea.'},
	{n: '02', t: 'Maratones', d: 'Concursos internos y preparación por equipos para la Maratón Nacional y el circuito ICPC.'},
	{n: '03', t: 'Investigación', d: 'Proyectos y artículos académicos que nacen de los problemas que estudiamos.'},
	{n: '04', t: 'Goslint Judge', d: 'Nuestro juez en línea, en desarrollo: banco de problemas, concursos y evaluación automática.'},
];

export const Hex: React.FC<{n: string; on: boolean; size?: number}> = ({n, on, size = 64}) => (
	<svg width={size} height={size * 1.12} viewBox="0 0 100 112">
		<polygon points="50,2 97,29 97,83 50,110 3,83 3,29" fill={on ? C.green : '#000'} stroke={on ? C.green : 'rgba(255,255,255,0.4)'} strokeWidth={3} />
		<text x={50} y={66} textAnchor="middle" fontFamily={MONO} fontSize={30} fontWeight={700} fill={on ? '#001a0c' : C.white}>
			{n}
		</text>
	</svg>
);

const Pillars: React.FC = () => {
	const f = useCurrentFrame();
	const out = tween(f, SYNC.construyendo + 2, SYNC.construyendo + 14, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{padding: '0 130px', justifyContent: 'center'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1.5px solid ${C.line2}`, paddingBottom: 22, marginBottom: 50, opacity: tween(f, 1440, 1450) * (1 - out)}}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 60, letterSpacing: '-0.03em', color: C.white}}>Qué hacemos</div>
				<div style={{fontFamily: MONO, fontSize: 24, color: C.faint}}>// 4 líneas de trabajo</div>
			</div>
			<div style={{display: 'flex', gap: 40}}>
				{PILLARS.map((p, i) => {
					const at = 1440 + i * 5;
					const s = pop(f, at, 16, 200, 0.6);
					const hl = (i === 2 && f >= SYNC.investigamos && f < SYNC.construyendo) || (i === 3 && f >= SYNC.construyendo);
					const isJudge = i === 3;
					const z = isJudge ? 1 + out * 0.25 : 1;
					return (
						<div
							key={p.n}
							style={{
								flex: 1,
								padding: '34px 30px',
								background: hl ? 'rgba(0,192,99,0.10)' : C.panel,
								border: `1.5px solid ${hl ? C.green : C.line2}`,
								borderRadius: 12,
								transform: `translateY(${(1 - s) * 80}px) scale(${z})`,
								opacity: Math.min(1, s * 1.5) * (isJudge ? 1 - out * 0.9 : 1 - out),
								minHeight: 380,
							}}
						>
							<Hex n={p.n} on={hl} />
							<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.white, marginTop: 26, letterSpacing: '-0.02em'}}>{p.t}</div>
							<div style={{fontFamily: SANS, fontSize: 27, lineHeight: 1.45, color: C.dim, marginTop: 14}}>{p.d}</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// Pipeline of the judge under construction (envío → compilación → sandbox → casos → veredicto)
export const STAGES = ['Envío', 'Compilación', 'Sandbox', 'Casos de prueba', 'Veredicto'];
const STAGE_T = (i: number) => 1508 + i * 15;

const JudgeUI: React.FC = () => {
	const f = useCurrentFrame();
	const win = pop(f, SYNC.construyendo + 6, 18, 160, 0.8);
	const title = pop(f, SYNC.construyendo + 8, 14, 180, 0.6);
	const juez = pop(f, SYNC.juez, 10, 220, 0.5);
	const zoom = interpolate(f, [1600, 1664], [1, 1.12], {...clamp, easing: inCubic});
	const loopSpeed = f > 1600 ? 1 + (f - 1600) / 10 : 1;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${zoom})`}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 34, marginBottom: 48, opacity: Math.min(1, title * 1.5), transform: `translateY(${(1 - title) * 30}px)`}}>
				<LogoMark height={110} />
				<div>
					<div style={{fontFamily: SANS, fontWeight: 850, fontSize: 96, letterSpacing: '-0.04em', color: C.white, lineHeight: 1}}>
						Goslint{' '}
						<span style={{color: C.green, display: 'inline-block', transform: `scale(${f >= SYNC.juez ? 1 + 0.12 * Math.sin(Math.min(1, juez) * Math.PI) : 1})`, textShadow: f >= SYNC.juez ? `0 0 ${30 * (1 - Math.min(1, juez)) + 8}px rgba(0,192,99,0.6)` : undefined}}>Judge</span>
					</div>
					<Label color={C.amber} size={22} style={{marginTop: 12}}>
						● en desarrollo · nuestro propio juez en línea
					</Label>
				</div>
			</div>
			<div
				style={{
					width: 1640,
					background: '#050605',
					border: `1.5px solid ${C.line2}`,
					borderRadius: 14,
					overflow: 'hidden',
					transform: `translateY(${(1 - win) * 140}px)`,
					opacity: Math.min(1, win * 1.5),
				}}
			>
				<div style={{display: 'flex', justifyContent: 'space-between', padding: '16px 26px', borderBottom: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 22, color: C.dim}}>
					<span>goslint-judge — evaluación automática</span>
					<span>
						<span style={{color: C.green}}>●</span> ● ●
					</span>
				</div>
				<div style={{padding: '46px 40px 40px', position: 'relative'}}>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
						{STAGES.map((s, i) => {
							const on = f >= STAGE_T(i);
							const p = pop(f, STAGE_T(i), 12, 260, 0.5);
							return (
								<React.Fragment key={s}>
									<div
										style={{
											padding: '22px 26px',
											minWidth: 210,
											textAlign: 'center',
											border: `2px solid ${on ? C.green : C.line2}`,
											background: on ? 'rgba(0,192,99,0.12)' : C.panel,
											borderRadius: 10,
											fontFamily: MONO,
											fontSize: 26,
											fontWeight: 700,
											color: on ? C.white : C.dim,
											transform: `scale(${on ? 0.94 + 0.06 * Math.min(1, p) : 1})`,
										}}
									>
										{s}
									</div>
									{i < STAGES.length - 1 && (
										<div style={{flex: 1, height: 3, margin: '0 10px', background: C.line2, position: 'relative', overflow: 'hidden'}}>
											<div style={{position: 'absolute', inset: 0, background: C.green, transform: `scaleX(${tween(f, STAGE_T(i), STAGE_T(i + 1))})`, transformOrigin: 'left'}} />
											{f > STAGE_T(STAGES.length - 1) && (
												<div style={{position: 'absolute', top: -4, width: 26, height: 11, background: C.white, left: `${(((f * 4 * loopSpeed) / 3 + i * 31) % 120) - 10}%`}} />
											)}
										</div>
									)}
								</React.Fragment>
							);
						})}
					</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 44, minHeight: 64}}>
						<span style={{fontFamily: MONO, fontSize: 24, color: C.dim, marginRight: 10}}>casos</span>
						{Array.from({length: 12}, (_, i) => {
							const at = STAGE_T(3) + i * 1.2;
							const ok = f >= at;
							return (
								<div key={i} style={{width: 46, height: 46, borderRadius: 6, background: ok ? C.green : C.panel2, border: `1px solid ${ok ? C.green : C.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 20, fontWeight: 700, color: ok ? '#001a0c' : C.faint}}>
									{i + 1}
								</div>
							);
						})}
						<div style={{flex: 1}} />
						{f >= STAGE_T(4) && (
							<span style={{transform: `scale(${0.5 + 0.5 * Math.min(1, pop(f, STAGE_T(4), 10, 300, 0.5))})`, display: 'inline-flex'}}>
								<Verdict kind="AC" size={34} showLabel />
							</span>
						)}
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const Judge: React.FC = () => {
	const f = useCurrentFrame();
	const blackout = f >= 1664;
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.35} />
			{f < SYNC.construyendo + 16 && <Pillars />}
			{f >= SYNC.construyendo + 4 && <JudgeUI />}
			<GlitchBurst at={1630} len={3} intensity={0.6} />
			<GlitchBurst at={1645} len={4} intensity={0.9} />
			<GlitchBurst at={1656} len={5} intensity={1.3} />
			{blackout && (
				<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{fontFamily: MONO, fontSize: 64, color: C.green}}>
						<span style={{color: C.dim}}>$ </span>
						<Cursor solid />
					</div>
				</AbsoluteFill>
			)}
			<AbsoluteFill style={{background: C.white, opacity: interpolate(f, [1440, 1444], [0.4, 0], clamp)}} />
		</AbsoluteFill>
	);
};

