import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {clamp, inCubic, outExpo, pop, tween, typed} from '../../lib';
import {GridBg, LogoMark, RiseWords, Wordmark} from '../../components';
import {SYNC} from '../../timeline';
import {Flash} from '../ui';
import {T} from '../timeline';

/* ============================================================ 1 · requisitos (16:9 clock of line l11, see <Shift>) */

const START = 1684;
const ROW = 86;
const CODE_PX = 44;
const CH = CODE_PX * 0.6; // JetBrains Mono advance

const Line: React.FC<{at: number; k: string; v: string; vColor: string; struck?: number}> = ({at, k, v, vColor, struck = 0}) => {
	const f = useCurrentFrame();
	if (f < at) return <div style={{height: ROW}} />;
	const n = typed(f, at, 60, k.length);
	const vp = pop(f, at + 10, 12, 260, 0.5);
	return (
		<div style={{height: ROW, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: CODE_PX, position: 'relative', opacity: 1 - struck * 0.55}}>
			<span style={{color: C.text, whiteSpace: 'pre'}}>{'  ' + k.slice(0, n)}</span>
			{n >= k.length && (
				<>
					<span style={{color: C.dim}}>: </span>
					<span style={{color: vColor, fontWeight: 800, display: 'inline-block', transform: `scale(${0.6 + 0.4 * Math.min(1, vp)})`}}>{v}</span>
					<span style={{color: C.dim}}>,</span>
				</>
			)}
			{struck > 0 && <div style={{position: 'absolute', left: 2 * CH, top: ROW / 2, height: 6, width: struck * (k.length + 2 + v.length) * CH, background: C.red}} />}
		</div>
	);
};

export const RequisitosV: React.FC = () => {
	const f = useCurrentFrame();
	const enter = pop(f, START, 16, 180, 0.7);
	const out = tween(f, 1820, 1833, 0, 1, inCubic);
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
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.35} />
			<AbsoluteFill style={{padding: '0 60px', opacity: 1 - out, transform: `translateY(${-out * 50}px)`}}>
				<div style={{position: 'absolute', left: 64, right: 64, top: 390, height: 300, display: 'flex', alignItems: 'flex-end'}}>
					<div style={{fontFamily: SANS, fontWeight: 850, fontSize: 100, lineHeight: 1.02, letterSpacing: '-0.04em', color: C.white}}>{headline}</div>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 60,
						right: 60,
						top: 750,
						background: '#050605',
						border: `1.5px solid ${C.line2}`,
						borderRadius: 16,
						padding: '36px 40px',
						transform: `translateY(${(1 - enter) * 160}px)`,
						opacity: Math.min(1, enter * 1.5),
					}}
				>
					<div style={{fontFamily: MONO, fontSize: CODE_PX, color: C.text, height: ROW, display: 'flex', alignItems: 'center'}}>
						<span style={{color: C.green}}>const</span>&nbsp;requisitos = {'{'}
					</div>
					<Line at={SYNC.experiencia + 4} k="experienciaPrevia" v="false" vColor={C.red} struck={struck} />
					<Line at={SYNC.curiosidad} k="curiosidad" v="true" vColor={C.green} />
					<Line at={SYNC.ganas} k="ganasDePracticar" v="true" vColor={C.green} />
					<div style={{fontFamily: MONO, fontSize: CODE_PX, color: C.text, height: ROW, display: 'flex', alignItems: 'center'}}>{'};'}</div>
				</div>
			</AbsoluteFill>
			<Flash at={START - 1} strength={0.7} len={4} color={C.green} />
		</AbsoluteFill>
	);
};

/* ============================================================ 2 · final lockup (Reel frames) */

const F0 = 1230;
const MARK_TOP = 290;
const MARK_H = 330;

/** Timing of the lockup (frames): start, question, «Únete a Goslint.», footer, fade to black. Defaults: the 45 s Reel. */
export type FinalTiming = {f0: number; q: number; join: number; foot: number; fade: number};
const FINAL_45: FinalTiming = {f0: F0, q: F0 + 18, join: T.unete + 16, foot: F0 + 38, fade: 1332};

export const FinalV: React.FC<{t?: FinalTiming}> = ({t = FINAL_45}) => {
	const f = useCurrentFrame();
	const F0 = t.f0;
	const mark = tween(f, F0, F0 + 28, 0, 1, outExpo);
	const word = tween(f, F0 + 12, F0 + 26, 0, 1, outExpo);
	const q = pop(f, t.q, 16, 180, 0.7);
	const joinAt = t.join;
	const join = pop(f, joinAt, 12, 220, 0.6);
	const foot = tween(f, t.foot, t.foot + 16);
	const ring = tween(f, F0, F0 + 44, 0, 1, outExpo);
	const d = 200 + ring * 2000;
	const fadeOut = interpolate(f, [t.fade, t.fade + 17], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.45} size={90} />
			<AbsoluteFill style={{alignItems: 'center'}}>
				<div style={{position: 'absolute', top: MARK_TOP + MARK_H / 2 - d / 2, width: d, height: d, borderRadius: '50%', border: `${Math.max(1, 26 * (1 - ring))}px solid ${C.green}`, opacity: 1 - ring}} />
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center'}}>
				<div style={{marginTop: MARK_TOP, transform: `scale(${0.85 + 0.15 * mark})`}}>
					<LogoMark height={MARK_H} p={mark} glow={mark >= 1 ? 16 + Math.sin(f / 7) * 6 : 0} />
				</div>
				<div style={{marginTop: 46, clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`}}>
					<Wordmark height={100} />
				</div>
				<div style={{marginTop: 50, textAlign: 'center', opacity: Math.min(1, q * 1.5), transform: `translateY(${(1 - q) * 20}px)`}}>
					<div style={{fontFamily: SANS, fontWeight: 850, fontSize: 80, letterSpacing: '-0.035em', color: C.white, lineHeight: 1.05}}>
						¿Te gusta resolver
						<br />
						problemas?
					</div>
				</div>
				<div
					style={{
						marginTop: 30,
						background: C.green,
						color: '#001a0c',
						fontFamily: SANS,
						fontWeight: 850,
						fontSize: 96,
						letterSpacing: '-0.035em',
						lineHeight: 1.1,
						padding: '6px 34px 16px',
						transform: `scaleX(${f >= joinAt ? Math.min(1, join) : 0})`,
					}}
				>
					Únete a Goslint.
				</div>
				<div style={{marginTop: 62, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: foot, transform: `translateY(${(1 - foot) * 16}px)`}}>
					<div style={{background: '#fff', borderRadius: 10, padding: '12px 22px'}}>
						<Img src={staticFile('brand/uceva.png')} style={{height: 62, display: 'block'}} />
					</div>
					<div style={{fontFamily: MONO, fontSize: 26, color: C.dim, lineHeight: 1.55, letterSpacing: '0.03em', textAlign: 'center', marginTop: 22}}>
						<div style={{color: C.white}}>Semillero de Investigación · Ingeniería de Sistemas</div>
						<div>Unidad Central del Valle del Cauca · Tuluá · Colombia</div>
					</div>
					<div style={{display: 'flex', gap: 14, marginTop: 26}}>
						{['C / C++', 'Python', 'Java'].map((c) => (
							<div key={c} style={{border: `1px solid ${C.line2}`, padding: '9px 18px', fontFamily: MONO, fontSize: 26, color: C.white, display: 'flex', alignItems: 'center', gap: 10}}>
								<span style={{width: 12, height: 12, borderRadius: 6, background: C.green, display: 'inline-block'}} />
								{c}
							</div>
						))}
					</div>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: C.white, opacity: interpolate(f, [F0, F0 + 4], [0.8, 0], clamp)}} />
			<AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
		</AbsoluteFill>
	);
};
