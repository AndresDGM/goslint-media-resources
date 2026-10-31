import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {clamp, inCubic, outExpo, pop, tween, typed} from '../lib';
import {GridBg, Label, LogoMark, RiseWords, Verdict, Wordmark} from '../components';
import {SYNC} from '../timeline';

/* ============================================================ 1 · requisitos */

const Line: React.FC<{at: number; k: string; v: string; vColor: string; struck?: number}> = ({at, k, v, vColor, struck = 0}) => {
	const f = useCurrentFrame();
	if (f < at) return <div style={{height: 76}} />;
	const n = typed(f, at, 60, k.length);
	const vp = pop(f, at + 10, 12, 260, 0.5);
	return (
		<div style={{height: 76, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: 50, position: 'relative', opacity: 1 - struck * 0.55}}>
			<span style={{color: C.text, whiteSpace: 'pre'}}>{'  ' + k.slice(0, n)}</span>
			{n >= k.length && (
				<>
					<span style={{color: C.dim}}>: </span>
					<span style={{color: vColor, fontWeight: 800, display: 'inline-block', transform: `scale(${0.6 + 0.4 * Math.min(1, vp)})`}}>{v}</span>
					<span style={{color: C.dim}}>,</span>
				</>
			)}
			{struck > 0 && <div style={{position: 'absolute', left: 60, top: 38, height: 6, width: `${struck * 640}px`, background: C.red}} />}
		</div>
	);
};

export const Requisitos: React.FC = () => {
	const f = useCurrentFrame();
	const enter = pop(f, 1680, 16, 180, 0.7);
	const out = tween(f, 1822, 1836, 0, 1, inCubic);
	const struck = tween(f, SYNC.experiencia + 34, SYNC.experiencia + 46);
	const headline =
		f < SYNC.curiosidad ? (
			<RiseWords key="a" text="No necesitas experiencia previa." start={SYNC.experiencia} stagger={3} />
		) : f < SYNC.ganas ? (
			<RiseWords key="b" text="Solo curiosidad…" start={SYNC.curiosidad} stagger={4} highlight={['curiosidad…']} />
		) : (
			<RiseWords key="c" text="…y ganas de practicar." start={SYNC.ganas} stagger={4} highlight={['practicar']} />
		);
	return (
		<AbsoluteFill style={{padding: '0 150px', justifyContent: 'center', opacity: 1 - out, transform: `translateY(${-out * 50}px)`}}>
			<div style={{fontFamily: SANS, fontWeight: 850, fontSize: 104, letterSpacing: '-0.04em', color: C.white, height: 130}}>{headline}</div>
			<div
				style={{
					marginTop: 56,
					background: '#050605',
					border: `1.5px solid ${C.line2}`,
					borderRadius: 14,
					padding: '40px 50px',
					width: 1100,
					transform: `translateY(${(1 - enter) * 120}px)`,
					opacity: Math.min(1, enter * 1.5),
				}}
			>
				<div style={{fontFamily: MONO, fontSize: 50, color: C.text, height: 76, display: 'flex', alignItems: 'center'}}>
					<span style={{color: C.green}}>const</span>&nbsp;requisitos = {'{'}
				</div>
				<Line at={SYNC.experiencia + 4} k="experienciaPrevia" v="false" vColor={C.red} struck={struck} />
				<Line at={SYNC.curiosidad} k="curiosidad" v="true" vColor={C.green} />
				<Line at={SYNC.ganas} k="ganasDePracticar" v="true" vColor={C.green} />
				<div style={{fontFamily: MONO, fontSize: 50, color: C.text, height: 76, display: 'flex', alignItems: 'center'}}>{'};'}</div>
			</div>
		</AbsoluteFill>
	);
};

/* ============================================================ 2 · the poster's example (input → output) */

const Example: React.FC = () => {
	const f = useCurrentFrame();
	const at = 1834;
	const enter = pop(f, at, 18, 170, 0.8);
	const outP = tween(f, 1856, 1874, 0, 1, outExpo);
	const ac = pop(f, 1880, 10, 220, 0.5);
	const exit = tween(f, 1908, 1920, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - exit}}>
			<div
				style={{
					width: 1480,
					background: C.panel,
					border: `1.5px solid ${C.line2}`,
					borderRadius: 14,
					overflow: 'hidden',
					transform: `translateY(${(1 - enter) * 140}px) scale(${1 + exit * 0.1})`,
					opacity: Math.min(1, enter * 1.5),
				}}
			>
				<div style={{padding: '30px 48px', background: '#000', borderBottom: `1px solid ${C.line2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
					<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, letterSpacing: '-0.02em', color: C.white}}>
						<span style={{color: C.green}}>Problema A</span> · Únete a Goslint
					</div>
					<Label size={22}>Ejemplo</Label>
				</div>
				<div style={{display: 'flex', padding: '46px 48px 30px', gap: 40, alignItems: 'stretch'}}>
					<div style={{flex: 1}}>
						<Label color={C.faint}>Entrada</Label>
						<div style={{fontFamily: MONO, fontSize: 52, lineHeight: 1.45, color: C.white, marginTop: 16}}>
							1 estudiante
							<br />0 maratones
						</div>
					</div>
					<div style={{display: 'flex', alignItems: 'center'}}>
						<svg width={160} height={60} viewBox="0 0 160 60">
							<line x1={0} y1={30} x2={140 * outP} y2={30} stroke={C.green} strokeWidth={6} />
							{outP > 0.95 && <polygon points="130,12 158,30 130,48" fill={C.green} />}
						</svg>
					</div>
					<div style={{flex: 1.15, opacity: outP}}>
						<Label color={C.faint}>Salida</Label>
						<div style={{fontFamily: MONO, fontSize: 52, lineHeight: 1.45, color: C.white, marginTop: 16}}>
							1 programador
							<br />
							competitivo
						</div>
					</div>
				</div>
				<div style={{padding: '18px 48px 40px', display: 'flex', alignItems: 'center', gap: 24}}>
					<span style={{transform: `scale(${f >= 1880 ? 0.5 + 0.5 * Math.min(1, ac) : 0})`, display: 'inline-flex'}}>
						<Verdict kind="AC" size={40} />
					</span>
					<span style={{fontFamily: MONO, fontSize: 30, color: C.dim, opacity: tween(f, 1884, 1892)}}>Veredicto esperado</span>
					<div style={{flex: 1}} />
					<span style={{fontFamily: SANS, fontSize: 28, color: C.dim, maxWidth: 640, textAlign: 'right', opacity: tween(f, 1886, 1896)}}>
						La solución no es única: cada quien llega a ella a su ritmo.
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

/* ============================================================ 3 · final lockup */

const Final: React.FC = () => {
	const f = useCurrentFrame();
	const mark = tween(f, 1920, 1950, 0, 1, outExpo);
	const word = tween(f, 1936, 1950, 0, 1, outExpo);
	const q = pop(f, 1944, 16, 180, 0.7);
	const join = pop(f, SYNC.unete + 16, 12, 220, 0.6);
	const foot = tween(f, 1975, 1992);
	const ring = tween(f, 1920, 1965, 0, 1, outExpo);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.45} size={90} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{position: 'absolute', width: 200 + ring * 1800, height: 200 + ring * 1800, borderRadius: '50%', border: `${Math.max(1, 26 * (1 - ring))}px solid ${C.green}`, opacity: 1 - ring, top: 370 - (200 + ring * 1800) / 2}} />
			</AbsoluteFill>
			<AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 70, marginTop: -150}}>
				<div style={{transform: `scale(${0.85 + 0.15 * mark})`}}>
					<LogoMark height={330} p={mark} glow={mark >= 1 ? 16 + Math.sin(f / 7) * 6 : 0} />
				</div>
				<div>
					<div style={{clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`}}>
						<Wordmark height={104} />
					</div>
					<div style={{marginTop: 34, opacity: Math.min(1, q * 1.5), transform: `translateY(${(1 - q) * 20}px)`}}>
						<div style={{fontFamily: SANS, fontWeight: 850, fontSize: 68, letterSpacing: '-0.035em', color: C.white, lineHeight: 1.05}}>¿Te gusta resolver problemas?</div>
						<div
							style={{
								display: 'inline-block',
								marginTop: 16,
								background: C.green,
								color: '#001a0c',
								fontFamily: SANS,
								fontWeight: 850,
								fontSize: 68,
								letterSpacing: '-0.035em',
								padding: '4px 22px 10px',
								transform: `scaleX(${f >= SYNC.unete + 16 ? Math.min(1, join) : 0})`,
								transformOrigin: 'left',
							}}
						>
							Únete a Goslint.
						</div>
					</div>
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 44, opacity: foot}}>
				<div style={{background: '#fff', borderRadius: 10, padding: '12px 22px'}}>
					<Img src={staticFile('brand/uceva.png')} style={{height: 64, display: 'block'}} />
				</div>
				<div style={{fontFamily: MONO, fontSize: 24, color: C.dim, lineHeight: 1.6, letterSpacing: '0.04em'}}>
					<div style={{color: C.white}}>Semillero de Investigación · Ingeniería de Sistemas</div>
					<div>Unidad Central del Valle del Cauca · Tuluá · Colombia</div>
				</div>
				<div style={{display: 'flex', gap: 12}}>
					{['C / C++', 'Python', 'Java'].map((c) => (
						<div key={c} style={{border: `1px solid ${C.line2}`, padding: '8px 16px', fontFamily: MONO, fontSize: 22, color: C.white, display: 'flex', alignItems: 'center', gap: 10}}>
							<span style={{width: 10, height: 10, borderRadius: 5, background: C.green, display: 'inline-block'}} />
							{c}
						</div>
					))}
				</div>
			</div>
			<AbsoluteFill style={{background: C.white, opacity: interpolate(f, [1920, 1924], [0.8, 0], clamp)}} />
		</AbsoluteFill>
	);
};

export const Cta: React.FC = () => {
	const f = useCurrentFrame();
	const fadeOut = interpolate(f, [2068, 2098], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{f < 1920 && <GridBg opacity={0.35} />}
			{f < 1836 && <Requisitos />}
			{f >= 1832 && f < 1920 && <Example />}
			{f >= 1920 && <Final />}
			<AbsoluteFill style={{background: C.green, opacity: interpolate(f, [1680, 1683], [0.7, 0], clamp)}} />
			<AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
		</AbsoluteFill>
	);
};
