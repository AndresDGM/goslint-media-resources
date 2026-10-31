import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {clamp, inCubic, pop, tween} from '../../lib';
import {GlitchBurst, GridBg, Label, LogoMark, Verdict} from '../../components';
import {Hex, PILLARS, STAGES} from '../../scenes/Judge';
import {Flash} from '../../reel/ui';
import {JUDGE_VERDICT_AT, R2, STAGE_AT, T} from '../../reel-v2/timeline';

const [START, END] = R2.judge;
/** «y construimos»: the cards give way to the judge. */
const BUILD = T.construimos;

/** The four lines of work from the poster. «Investigación» lights up on «investigamos». */
const Pillars: React.FC = () => {
	const f = useCurrentFrame();
	const out = tween(f, BUILD + 2, BUILD + 14, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{padding: '0 130px', justifyContent: 'center'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1.5px solid ${C.line2}`, paddingBottom: 22, marginBottom: 50, opacity: tween(f, START, START + 8) * (1 - out)}}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 60, letterSpacing: '-0.03em', color: C.white}}>Qué hacemos</div>
				<div style={{fontFamily: MONO, fontSize: 24, color: C.faint}}>// 4 líneas de trabajo</div>
			</div>
			<div style={{display: 'flex', gap: 40}}>
				{PILLARS.map((p, i) => {
					const s = pop(f, START + i * 4, 16, 200, 0.6);
					const hl = (i === 2 && f >= T.investigamos - 2 && f < BUILD) || (i === 3 && f >= BUILD);
					const isJudge = i === 3;
					return (
						<div
							key={p.n}
							style={{
								flex: 1,
								padding: '34px 30px',
								background: hl ? 'rgba(0,192,99,0.10)' : C.panel,
								border: `1.5px solid ${hl ? C.green : C.line2}`,
								borderRadius: 12,
								transform: `translateY(${(1 - s) * 80}px) scale(${isJudge ? 1 + out * 0.25 : 1})`,
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

/** «…y construimos nuestro propio juez en línea»: the pipeline of the judge under construction. */
const JudgeUI: React.FC = () => {
	const f = useCurrentFrame();
	const win = pop(f, BUILD + 6, 18, 160, 0.8);
	const title = pop(f, BUILD + 8, 14, 180, 0.6);
	const juez = pop(f, T.juez, 10, 220, 0.5);
	const zoom = interpolate(f, [END - 16, END], [1, 1.08], {...clamp, easing: inCubic});
	const loopSpeed = f > END - 16 ? 1 + (f - (END - 16)) / 10 : 1;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${zoom})`}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 34, marginBottom: 48, opacity: Math.min(1, title * 1.5), transform: `translateY(${(1 - title) * 30}px)`}}>
				<LogoMark height={110} />
				<div>
					<div style={{fontFamily: SANS, fontWeight: 850, fontSize: 96, letterSpacing: '-0.04em', color: C.white, lineHeight: 1}}>
						Goslint{' '}
						<span style={{color: C.green, display: 'inline-block', transform: `scale(${f >= T.juez ? 1 + 0.12 * Math.sin(Math.min(1, juez) * Math.PI) : 1})`, textShadow: f >= T.juez ? `0 0 ${30 * (1 - Math.min(1, juez)) + 8}px rgba(0,192,99,0.6)` : undefined}}>Judge</span>
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
							const on = f >= STAGE_AT(i);
							const p = pop(f, STAGE_AT(i), 12, 260, 0.5);
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
											<div style={{position: 'absolute', inset: 0, background: C.green, transform: `scaleX(${tween(f, STAGE_AT(i), STAGE_AT(i + 1))})`, transformOrigin: 'left'}} />
											{f > STAGE_AT(STAGES.length - 1) && (
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
							const ok = f >= STAGE_AT(3) + i;
							return (
								<div key={i} style={{width: 46, height: 46, borderRadius: 6, background: ok ? C.green : C.panel2, border: `1px solid ${ok ? C.green : C.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 20, fontWeight: 700, color: ok ? '#001a0c' : C.faint}}>
									{i + 1}
								</div>
							);
						})}
						<div style={{flex: 1}} />
						{f >= JUDGE_VERDICT_AT && (
							<span style={{transform: `scale(${0.5 + 0.5 * Math.min(1, pop(f, JUDGE_VERDICT_AT, 10, 300, 0.5))})`, display: 'inline-flex'}}>
								<Verdict kind="AC" size={34} showLabel />
							</span>
						)}
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** «También investigamos y construimos nuestro propio juez en línea.» */
export const JudgeH2: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.35} />
			{f < BUILD + 16 && <Pillars />}
			{f >= BUILD + 4 && <JudgeUI />}
			<GlitchBurst at={END - 14} len={3} intensity={0.7} />
			<GlitchBurst at={END - 7} len={5} intensity={1.2} />
			<Flash at={START - 1} strength={0.4} />
		</AbsoluteFill>
	);
};
