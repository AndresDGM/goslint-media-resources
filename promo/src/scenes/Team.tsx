import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {clamp, inCubic, pop, rnd, tween} from '../lib';
import {Photo, PhotoCard, RiseWords, Verdict, VerdictKind} from '../components';
import {SYNC} from '../timeline';

const CODE_LINES = [
	'for (int i = 0; i < n; i++) {',
	'  dp[i] = max(dp[i-1], dp[i-2] + a[i]);',
	'}',
	'while (!q.empty()) { int u = q.front(); q.pop();',
	'  for (int v : adj[u]) if (d[v] < 0) d[v] = d[u] + 1;',
	'sort(v.begin(), v.end());',
	'long long lo = 0, hi = 1e18;',
	'while (lo < hi) { long long mid = (lo + hi) / 2;',
	'cout << ans << "\\n";',
];

/** Lines of code that drift over the photo and dissolve character by character. */
export const DissolvingCode: React.FC<{style?: React.CSSProperties}> = ({style}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{padding: '120px 130px', fontFamily: MONO, fontSize: 30, lineHeight: 1.9, color: 'rgba(255,255,255,0.55)', ...style}}>
			{CODE_LINES.map((ln, i) => (
				<div key={i} style={{transform: `translateX(${(f - 1140) * (0.3 + (i % 3) * 0.15)}px)`, whiteSpace: 'pre'}}>
					{ln.split('').map((ch, j) => {
						const dieAt = 1178 + rnd(i * 97 + j) * 50;
						const o = 1 - tween(f, dieAt, dieAt + 8);
						return (
							<span key={j} style={{opacity: o, color: o < 0.6 ? C.green : undefined}}>
								{ch}
							</span>
						);
					})}
				</div>
			))}
		</AbsoluteFill>
	);
};

export const LOG: {k: VerdictKind; at: number; t: string}[] = [
	{k: 'WA', at: SYNC.equivocarse + 3, t: 'caso 3 · salida incorrecta'},
	{k: 'TLE', at: SYNC.equivocarse + 11, t: 'caso 7 · se pasó del tiempo'},
	{k: 'WA', at: SYNC.equivocarse + 19, t: 'caso 7 · casi…'},
	{k: 'RTE', at: SYNC.equivocarse + 27, t: 'caso 9 · índice fuera de rango'},
];

const Big: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 108, lineHeight: 1.0, letterSpacing: '-0.04em', color: C.white, textShadow: '0 4px 30px rgba(0,0,0,0.6)', ...style}}>{children}</div>
);

export const Team: React.FC = () => {
	const f = useCurrentFrame();
	const strike = tween(f, 1196, 1210);
	const acP = pop(f, SYNC.celebrar + 16, 9, 200, 0.6);
	const fadeOut = tween(f, 1418, 1440, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{/* 1 · not in the code */}
			{f < SYNC.equipo && (
				<AbsoluteFill>
					<Photo src="nacional-cena.jpg" from={1140} dur={96} pos="50% 55%" z={[1.12, 1.02]} grade={0.55} style={{filter: 'sepia(0.15) saturate(1.1)'}} />
					<DissolvingCode />
					<AbsoluteFill style={{justifyContent: 'flex-end', padding: '0 130px 210px'}}>
						<Big>
							<RiseWords text="Pero lo más valioso" start={SYNC.codigo} />
						</Big>
						<Big style={{color: C.dim, marginTop: 8}}>
							<RiseWords text="no está en el" start={SYNC.codigo + 22} />{' '}
							<span style={{position: 'relative', fontFamily: MONO, fontWeight: 700, color: C.white, opacity: tween(f, SYNC.codigo + 34, SYNC.codigo + 42)}}>
								código
								<span style={{position: 'absolute', left: 0, top: '55%', height: 10, width: `${strike * 100}%`, background: C.green}} />
							</span>
						</Big>
					</AbsoluteFill>
				</AbsoluteFill>
			)}

			{/* 2 · think as a team */}
			{f >= SYNC.equipo && f < SYNC.equivocarse && (
				<PhotoCard src="nacional-javeriana-cali.jpg" from={SYNC.equipo} dur={47} side="right" tilt={-2} cardH={860} pos="50% 60%">
					<AbsoluteFill style={{justifyContent: 'center', padding: '0 130px'}}>
						<Big>
							<RiseWords text="Pensar en" start={SYNC.equipo + 2} />
						</Big>
						<Big style={{color: C.green}}>
							<RiseWords text="equipo." start={SYNC.equipo + 8} />
						</Big>
					</AbsoluteFill>
				</PhotoCard>
			)}

			{/* 3 · fail together */}
			{f >= SYNC.equivocarse && f < SYNC.celebrar && (
				<PhotoCard src="interna-avanzado-1.jpg" from={SYNC.equivocarse} dur={36} side="left" tilt={2} cardH={860}>
					<div style={{position: 'absolute', left: 900, top: 230}}>
						<Big>
							<RiseWords text="Equivocarse juntos." start={SYNC.equivocarse} stagger={4} />
						</Big>
						<div style={{marginTop: 50, display: 'flex', flexDirection: 'column', gap: 18}}>
							{LOG.map((l, i) => {
								const p = pop(f, l.at, 14, 260, 0.5);
								if (f < l.at) return null;
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

			{/* 4 · celebrate every solved problem */}
			{f >= SYNC.celebrar && (
				<AbsoluteFill style={{opacity: 1 - fadeOut}}>
					<PhotoCard src="interna-avanzado-2.jpg" from={SYNC.celebrar} dur={120} side="right" tilt={-2.5} cardH={860} pos="50% 40%">
						<AbsoluteFill style={{justifyContent: 'center', padding: '0 130px'}}>
							<Big>
								<RiseWords text="Y celebrar cada" start={SYNC.celebrar + 2} />
							</Big>
							<Big style={{color: C.green}}>
								<RiseWords text="problema resuelto." start={SYNC.celebrar + 12} />
							</Big>
						</AbsoluteFill>
					</PhotoCard>
					{f >= SYNC.celebrar + 16 && (
						<div
							style={{
								position: 'absolute',
								left: 1180,
								top: 700,
								transform: `scale(${2.6 - 1.6 * Math.min(1, acP)}) rotate(${-8 + 4 * acP}deg)`,
								opacity: Math.min(1, acP * 2),
								filter: `drop-shadow(0 0 30px rgba(0,192,99,0.6))`,
							}}
						>
							<Verdict kind="AC" size={74} />
						</div>
					)}
					{/* green pixel burst */}
					{f >= SYNC.celebrar + 16 &&
						Array.from({length: 26}, (_, i) => {
							const t = (f - SYNC.celebrar - 16) / 30;
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
