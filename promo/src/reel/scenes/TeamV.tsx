import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO} from '../../theme';
import {clamp, inCubic, pop, rnd, tween} from '../../lib';
import {Photo, RiseWords, Verdict} from '../../components';
import {SYNC} from '../../timeline';
import {DissolvingCode, LOG} from '../../scenes/Team';
import {Backdrop, Big, Card, Flash, Shade, Shift} from '../ui';
import {OFF, T} from '../timeline';

/* Every block below runs on the 16:9 clock of its narration line (see <Shift>). */

/** 1 · «Pero lo más valioso no está en el código»: the dinner after the Nacional. */
const NotInTheCode: React.FC = () => {
	const f = useCurrentFrame();
	const start = SYNC.codigo - 3; // the card lands just before the voice
	const strike = tween(f, 1196, 1210);
	return (
		<AbsoluteFill>
			<Backdrop src="nacional-cena.jpg" from={start} dur={90} dim={0.3} fade={10} />
			<Card src="nacional-cena.jpg" from={start + 2} dur={90} h={770} top={310} pos="55% 70%" tilt={1.5} />
			<AbsoluteFill style={{opacity: tween(f, start + 6, start + 14)}}>
				<DissolvingCode style={{padding: '320px 70px 0', fontSize: 30}} />
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 64, right: 64, top: 1140}}>
				<Big size={88} style={{whiteSpace: 'nowrap'}}>
					<RiseWords text="Pero lo más valioso" start={SYNC.codigo} />
				</Big>
				<Big size={88} style={{color: C.dim, marginTop: 6, whiteSpace: 'nowrap'}}>
					<RiseWords text="no está en el" start={SYNC.codigo + 22} />{' '}
					<span style={{position: 'relative', fontFamily: MONO, fontWeight: 700, fontSize: 80, color: C.white, opacity: tween(f, SYNC.codigo + 34, SYNC.codigo + 42)}}>
						código
						<span style={{position: 'absolute', left: 0, top: '55%', height: 10, width: `${strike * 100}%`, background: C.green}} />
					</span>
				</Big>
			</div>
		</AbsoluteFill>
	);
};

/** 2–4 · «pensar en equipo, equivocarse juntos y celebrar cada problema resuelto». */
const Together: React.FC = () => {
	const f = useCurrentFrame();
	const acAt = SYNC.celebrar + 16;
	const acP = pop(f, acAt, 9, 200, 0.6);
	const fadeOut = tween(f, 1378, 1390, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{/* think as a team: the whole group has to fit, so the photo is a card */}
			{f < SYNC.equivocarse && (
				<AbsoluteFill>
					<Backdrop src="nacional-javeriana-cali.jpg" from={SYNC.equipo} dur={47} dim={0.3} />
					<Card src="nacional-javeriana-cali.jpg" from={SYNC.equipo} dur={47} h={860} top={560} pos="50% 94%" tilt={-1.5} />
					<div style={{position: 'absolute', left: 64, top: 290}}>
						<Big size={122}>
							<RiseWords text="Pensar en" start={SYNC.equipo + 2} />
						</Big>
						<Big size={122} style={{color: C.green}}>
							<RiseWords text="equipo." start={SYNC.equipo + 8} />
						</Big>
					</div>
					<Flash at={SYNC.equipo} strength={0.4} />
				</AbsoluteFill>
			)}

			{/* fail together */}
			{f >= SYNC.equivocarse && f < SYNC.celebrar && (
				<AbsoluteFill>
					<Photo src="interna-avanzado-1.jpg" from={SYNC.equivocarse} dur={36} pos="80% 50%" z={[1.03, 1.09]} grade={0.2} />
					<Shade top={0.85} bottom={0.75} />
					<div style={{position: 'absolute', left: 64, top: 290}}>
						<Big size={122}>
							<RiseWords text="Equivocarse" start={SYNC.equivocarse} />
						</Big>
						<Big size={122}>
							<RiseWords text="juntos." start={SYNC.equivocarse + 4} />
						</Big>
					</div>
					<div style={{position: 'absolute', left: 64, top: 1030, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14}}>
						{LOG.map((l, i) => {
							const p = pop(f, l.at, 14, 260, 0.5);
							if (f < l.at) return null;
							return (
								<div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '10px 20px 10px 10px', background: 'rgba(5,7,6,0.86)', border: `1px solid ${C.line2}`, transform: `translateX(${(1 - p) * 40}px)`, opacity: Math.min(1, p * 2)}}>
									<Verdict kind={l.k} size={34} />
									<span style={{fontFamily: MONO, fontSize: 32, color: C.text}}>{l.t}</span>
								</div>
							);
						})}
					</div>
					<Flash at={SYNC.equivocarse} strength={0.4} />
				</AbsoluteFill>
			)}

			{/* celebrate every solved problem */}
			{f >= SYNC.celebrar && (
				<AbsoluteFill style={{opacity: 1 - fadeOut}}>
					<Photo src="interna-avanzado-2.jpg" from={SYNC.celebrar} dur={90} pos="0% 50%" z={[1.02, 1.1]} grade={0.12} />
					<Shade top={0.88} bottom={0.6} />
					<div style={{position: 'absolute', left: 64, top: 290, width: 960}}>
						<Big size={104}>
							<RiseWords text="Y celebrar cada" start={SYNC.celebrar + 2} />
						</Big>
						<Big size={104} style={{color: C.green}}>
							<RiseWords text="problema resuelto." start={SYNC.celebrar + 12} />
						</Big>
					</div>
					{f >= acAt && (
						<div
							style={{
								position: 'absolute',
								left: 610,
								top: 566,
								transform: `scale(${2.6 - 1.6 * Math.min(1, acP)}) rotate(${-8 + 4 * acP}deg)`,
								opacity: Math.min(1, acP * 2),
								filter: 'drop-shadow(0 0 30px rgba(0,192,99,0.6))',
							}}
						>
							<Verdict kind="AC" size={84} />
						</div>
					)}
					{/* green pixel burst */}
					{f >= acAt &&
						Array.from({length: 26}, (_, i) => {
							const t = (f - acAt) / 30;
							const a = rnd(i * 3.3) * Math.PI * 2;
							const d = 60 + t * (240 + rnd(i) * 360);
							const o = interpolate(t, [0, 0.2, 1.2], [0, 1, 0], clamp);
							const s = 10 + rnd(i * 7) * 16;
							return <div key={i} style={{position: 'absolute', left: 710 + Math.cos(a) * d, top: 622 + Math.sin(a) * d + t * t * 120, width: s, height: s, background: i % 4 ? C.green : C.white, opacity: o}} />;
						})}
					<Flash at={SYNC.celebrar} strength={0.4} />
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

/** No background of its own until the dinner photo lands: the team photo of the previous chapter holds underneath. */
export const TeamV: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			{f < T.equipo ? (
				<Shift by={OFF.l08}>
					<NotInTheCode />
				</Shift>
			) : (
				<Shift by={OFF.l09}>
					<Together />
				</Shift>
			)}
		</AbsoluteFill>
	);
};
