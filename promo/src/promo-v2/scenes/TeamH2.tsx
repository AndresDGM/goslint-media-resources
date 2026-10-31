import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {clamp, inCubic, pop, rnd, tween} from '../../lib';
import {Photo, PhotoCard, RiseWords, Verdict} from '../../components';
import {SYNC} from '../../timeline';
import {DissolvingCode, LOG} from '../../scenes/Team';
import {Shift} from '../../reel/ui';
import {LOG_AT, R2, SOLVED_AT, T} from '../../reel-v2/timeline';

const Big: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 108, lineHeight: 1.0, letterSpacing: '-0.04em', color: C.white, textShadow: '0 4px 30px rgba(0,0,0,0.6)', ...style}}>{children}</div>
);

/** 1 · «Pero lo más valioso no está solo en el código»: the dinner after the Nacional. */
const NotInTheCode: React.FC = () => {
	const f = useCurrentFrame();
	const start = T.pero - 3;
	const strike = tween(f, T.codigo + 6, T.codigo + 18);
	return (
		<AbsoluteFill style={{opacity: tween(f, start, start + 8)}}>
			<Photo src="nacional-cena.jpg" from={start} dur={100} pos="50% 55%" z={[1.12, 1.02]} grade={0.55} style={{filter: 'sepia(0.15) saturate(1.1)'}} />
			{/* the 16:9 component, on the clock of its own line */}
			<Shift by={SYNC.codigo - T.pero}>
				<DissolvingCode />
			</Shift>
			<AbsoluteFill style={{justifyContent: 'flex-end', padding: '0 130px 190px'}}>
				<Big>
					<RiseWords text="Pero lo más valioso" start={T.pero} />
				</Big>
				<Big style={{color: C.dim, marginTop: 8}}>
					<RiseWords text="no está solo en el" start={T.noEsta} />{' '}
					<span style={{position: 'relative', fontFamily: MONO, fontWeight: 700, color: C.white, opacity: tween(f, T.codigo - 4, T.codigo + 4)}}>
						código
						<span style={{position: 'absolute', left: 0, top: '55%', height: 10, width: `${strike * 100}%`, background: C.green}} />
					</span>
				</Big>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** 2–4 · «Está en pensar en equipo, equivocarnos juntos y celebrar cada problema resuelto». */
const Together: React.FC = () => {
	const f = useCurrentFrame();
	const tEquipo = T.estaEn - 3;
	const tFail = T.equivocarnos - 2;
	const tCelebrate = T.yCelebrar;
	const acP = pop(f, SOLVED_AT, 9, 200, 0.6);
	const fadeOut = tween(f, R2.team[1] - 12, R2.team[1], 0, 1, inCubic);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{/* think as a team */}
			{f < tFail && (
				<PhotoCard src="nacional-javeriana-cali.jpg" from={tEquipo} dur={47} side="right" tilt={-2} cardH={860} pos="50% 60%">
					<AbsoluteFill style={{justifyContent: 'center', padding: '0 130px'}}>
						<Big>
							<RiseWords text="Pensar en" start={T.pensar - 4} />
						</Big>
						<Big style={{color: C.green}}>
							<RiseWords text="equipo." start={T.equipo - 2} />
						</Big>
					</AbsoluteFill>
				</PhotoCard>
			)}

			{/* fail together */}
			{f >= tFail && f < tCelebrate && (
				<PhotoCard src="interna-avanzado-1.jpg" from={tFail} dur={45} side="left" tilt={2} cardH={860}>
					<div style={{position: 'absolute', left: 900, top: 200}}>
						<Big>
							<RiseWords text="Equivocarnos" start={tFail} />
						</Big>
						<Big>
							<RiseWords text="juntos." start={T.juntos - 2} />
						</Big>
						<div style={{marginTop: 46, display: 'flex', flexDirection: 'column', gap: 18}}>
							{LOG.map((l, i) => {
								const at = LOG_AT[i];
								const p = pop(f, at, 14, 260, 0.5);
								if (f < at) return null;
								return (
									<div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, transform: `translateX(${(1 - p) * 40}px)`, opacity: Math.min(1, p * 2)}}>
										<Verdict kind={l.k} size={30} />
										<span style={{fontFamily: MONO, fontSize: 28, color: C.text}}>{l.t}</span>
									</div>
								);
							})}
						</div>
					</div>
				</PhotoCard>
			)}

			{/* celebrate every solved problem */}
			{f >= tCelebrate && (
				<AbsoluteFill style={{opacity: 1 - fadeOut}}>
					<PhotoCard src="interna-avanzado-2.jpg" from={tCelebrate} dur={75} side="right" tilt={-2.5} cardH={860} pos="50% 40%">
						<AbsoluteFill style={{justifyContent: 'center', padding: '0 130px'}}>
							<Big>
								<RiseWords text="Y celebrar cada" start={tCelebrate + 1} />
							</Big>
							<Big style={{color: C.green}}>
								<RiseWords text="problema resuelto." start={T.problemaResuelto - 2} stagger={14} />
							</Big>
						</AbsoluteFill>
					</PhotoCard>
					{f >= SOLVED_AT && (
						<div
							style={{
								position: 'absolute',
								left: 1180,
								top: 700,
								transform: `scale(${2.6 - 1.6 * Math.min(1, acP)}) rotate(${-8 + 4 * acP}deg)`,
								opacity: Math.min(1, acP * 2),
								filter: 'drop-shadow(0 0 30px rgba(0,192,99,0.6))',
							}}
						>
							<Verdict kind="AC" size={74} />
						</div>
					)}
					{/* green pixel burst */}
					{f >= SOLVED_AT &&
						Array.from({length: 26}, (_, i) => {
							const t = (f - SOLVED_AT) / 30;
							const a = rnd(i * 3.3) * Math.PI * 2;
							const d = 60 + t * (240 + rnd(i) * 360);
							const o = interpolate(t, [0, 0.2, 1.2], [0, 1, 0], clamp);
							const s = 10 + rnd(i * 7) * 16;
							return <div key={i} style={{position: 'absolute', left: 1260 + Math.cos(a) * d, top: 740 + Math.sin(a) * d + t * t * 120, width: s, height: s, background: i % 4 ? C.green : C.white, opacity: o}} />;
						})}
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

/** Transparent until the dinner photo fades in: the team photo of the previous chapter holds underneath. */
export const TeamH2: React.FC = () => (useCurrentFrame() < T.estaEn - 3 ? <NotInTheCode /> : <Together />);
