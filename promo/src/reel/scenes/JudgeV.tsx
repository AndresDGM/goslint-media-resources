import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {clamp, inCubic, pop, tween} from '../../lib';
import {GlitchBurst, GridBg, Label, LogoMark, Verdict} from '../../components';
import {SYNC} from '../../timeline';
import {Hex, PILLARS, STAGES} from '../../scenes/Judge';
import {Flash} from '../ui';

/* Runs on the 16:9 clock of narration line l10 (see <Shift>): the scene opens at frame 1446. */
const START = 1446;

/** The four lines of work, as a list instead of a row of cards. */
const PillarsV: React.FC = () => {
	const f = useCurrentFrame();
	const out = tween(f, SYNC.construyendo + 2, SYNC.construyendo + 14, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{padding: '276px 60px 0'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1.5px solid ${C.line2}`, paddingBottom: 20, marginBottom: 26, opacity: tween(f, START, START + 8) * (1 - out)}}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 76, letterSpacing: '-0.03em', color: C.white}}>Qué hacemos</div>
				<div style={{fontFamily: MONO, fontSize: 26, color: C.dim}}>// 4 líneas</div>
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
				{PILLARS.map((p, i) => {
					const s = pop(f, START + i * 4, 16, 200, 0.6);
					const hl = (i === 2 && f >= SYNC.investigamos && f < SYNC.construyendo) || (i === 3 && f >= SYNC.construyendo);
					const isJudge = i === 3;
					return (
						<div
							key={p.n}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 30,
								padding: '24px 30px',
								background: hl ? 'rgba(0,192,99,0.10)' : C.panel,
								border: `2px solid ${hl ? C.green : C.line2}`,
								borderRadius: 14,
								transform: `translateX(${(1 - s) * 120}px) scale(${isJudge ? 1 + out * 0.06 : 1})`,
								opacity: Math.min(1, s * 1.5) * (isJudge ? 1 - out * 0.9 : 1 - out),
							}}
						>
							<div style={{flexShrink: 0}}>
								<Hex n={p.n} on={hl} size={92} />
							</div>
							<div>
								<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.1}}>{p.t}</div>
								<div style={{fontFamily: SANS, fontSize: 30, lineHeight: 1.32, color: C.dim, marginTop: 8}}>{p.d}</div>
							</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// The pipeline runs top to bottom on a phone: one stage per row.
const STAGE_T = (i: number) => 1500 + i * 12;
const VERDICT_AT = STAGE_T(4) + 7;

const JudgeUIV: React.FC = () => {
	const f = useCurrentFrame();
	const win = pop(f, SYNC.construyendo + 6, 18, 160, 0.8);
	const title = pop(f, SYNC.construyendo + 8, 14, 180, 0.6);
	const juez = pop(f, SYNC.juez, 10, 220, 0.5);
	const zoom = interpolate(f, [1558, 1581], [1, 1.07], {...clamp, easing: inCubic});
	return (
		<AbsoluteFill style={{alignItems: 'center', paddingTop: 280, transform: `scale(${zoom})`, transformOrigin: '50% 42%'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 30, opacity: Math.min(1, title * 1.5), transform: `translateY(${(1 - title) * 30}px)`}}>
				<LogoMark height={124} />
				<div style={{fontFamily: SANS, fontWeight: 850, fontSize: 112, letterSpacing: '-0.04em', color: C.white, lineHeight: 1}}>
					Goslint{' '}
					<span style={{color: C.green, display: 'inline-block', transform: `scale(${f >= SYNC.juez ? 1 + 0.12 * Math.sin(Math.min(1, juez) * Math.PI) : 1})`, textShadow: f >= SYNC.juez ? `0 0 ${30 * (1 - Math.min(1, juez)) + 8}px rgba(0,192,99,0.6)` : undefined}}>Judge</span>
				</div>
			</div>
			<Label color={C.amber} size={27} style={{marginTop: 22, letterSpacing: '0.1em', opacity: Math.min(1, title * 1.5)}}>
				● en desarrollo · nuestro propio juez en línea
			</Label>
			<div
				style={{
					width: 960,
					marginTop: 40,
					background: '#050605',
					border: `1.5px solid ${C.line2}`,
					borderRadius: 16,
					overflow: 'hidden',
					transform: `translateY(${(1 - win) * 160}px)`,
					opacity: Math.min(1, win * 1.5),
				}}
			>
				<div style={{display: 'flex', justifyContent: 'space-between', padding: '16px 28px', borderBottom: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 26, color: C.dim}}>
					<span>goslint-judge — evaluación automática</span>
					<span>
						<span style={{color: C.green}}>●</span> ● ●
					</span>
				</div>
				<div style={{padding: '30px 36px 32px'}}>
					{STAGES.map((s, i) => {
						const on = f >= STAGE_T(i);
						const p = pop(f, STAGE_T(i), 12, 260, 0.5);
						return (
							<React.Fragment key={s}>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 22,
										height: 82,
										padding: '0 26px',
										border: `2px solid ${on ? C.green : C.line2}`,
										background: on ? 'rgba(0,192,99,0.12)' : C.panel,
										borderRadius: 10,
										fontFamily: MONO,
										fontSize: 34,
										fontWeight: 700,
										color: on ? C.white : C.dim,
										transform: `scale(${on ? 0.96 + 0.04 * Math.min(1, p) : 1})`,
									}}
								>
									<span style={{color: on ? C.green : C.faint, fontWeight: 500}}>{`0${i + 1}`}</span>
									<span style={{flex: 1}}>{s}</span>
									<span style={{color: C.green, opacity: on ? Math.min(1, p) : 0}}>✓</span>
								</div>
								{i < STAGES.length - 1 && (
									<div style={{width: 4, height: 24, marginLeft: 46, background: C.line2, position: 'relative', overflow: 'hidden'}}>
										<div style={{position: 'absolute', inset: 0, background: C.green, transform: `scaleY(${tween(f, STAGE_T(i), STAGE_T(i + 1))})`, transformOrigin: 'top'}} />
									</div>
								)}
							</React.Fragment>
						);
					})}
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 30, height: 60}}>
						<span style={{fontFamily: MONO, fontSize: 30, color: C.dim}}>12 casos de prueba</span>
						{f >= VERDICT_AT && (
							<span style={{transform: `scale(${0.5 + 0.5 * Math.min(1, pop(f, VERDICT_AT, 10, 300, 0.5))})`, transformOrigin: '100% 50%', display: 'inline-flex'}}>
								<Verdict kind="AC" size={38} showLabel />
							</span>
						)}
					</div>
					<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 16}}>
						{Array.from({length: 12}, (_, i) => {
							const ok = f >= STAGE_T(3) + i;
							return (
								<div key={i} style={{width: 62, height: 62, borderRadius: 8, background: ok ? C.green : C.panel2, border: `1px solid ${ok ? C.green : C.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 26, fontWeight: 700, color: ok ? '#001a0c' : C.faint}}>
									{i + 1}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const JudgeV: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.35} />
			{f < SYNC.construyendo + 16 && <PillarsV />}
			{f >= SYNC.construyendo + 4 && <JudgeUIV />}
			<GlitchBurst at={1565} len={3} intensity={0.7} />
			<GlitchBurst at={1573} len={5} intensity={1.2} />
			<Flash at={START - 1} strength={0.4} />
		</AbsoluteFill>
	);
};
