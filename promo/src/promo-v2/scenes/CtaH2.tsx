import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {clamp, inCubic, outExpo, pop, tween} from '../../lib';
import {GridBg, Label, LogoMark, Verdict, Wordmark} from '../../components';
import {Requisitos} from '../../scenes/Cta';
import {Flash, Shift} from '../../reel/ui';
import {EXAMPLE_AC_AT, EXAMPLE_OUT_AT, FINAL, OFF_CTA, R2} from '../../reel-v2/timeline';

/**
 * «No necesitas experiencia previa, solo curiosidad y ganas de practicar.»
 * The 16:9 requirements scene, on the clock of its own line (OFF_CTA, same shift as the Reel).
 */
export const RequisitosH2: React.FC = () => (
	<AbsoluteFill style={{background: C.bg}}>
		<GridBg opacity={0.35} />
		<Shift by={OFF_CTA}>
			<Requisitos />
		</Shift>
		<Flash at={R2.cta[0] - 1} strength={0.7} len={4} color={C.green} />
	</AbsoluteFill>
);

/** «Tu primer problema ya te está esperando.» The example of «Problema A» from the poster. */
export const ExampleH2: React.FC = () => {
	const f = useCurrentFrame();
	const [A, B] = R2.example;
	const fadeIn = tween(f, A, A + 8);
	const enter = pop(f, A + 2, 18, 170, 0.8);
	const outP = tween(f, EXAMPLE_OUT_AT, EXAMPLE_OUT_AT + 16, 0, 1, outExpo);
	const ac = pop(f, EXAMPLE_AC_AT, 10, 220, 0.5);
	const exit = tween(f, B - 10, B, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{background: C.bg, opacity: fadeIn}}>
			<GridBg opacity={0.35} />
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
						<span style={{transform: `scale(${f >= EXAMPLE_AC_AT ? 0.5 + 0.5 * Math.min(1, ac) : 0})`, display: 'inline-flex'}}>
							<Verdict kind="AC" size={40} />
						</span>
						<span style={{fontFamily: MONO, fontSize: 30, color: C.dim, opacity: tween(f, EXAMPLE_AC_AT + 4, EXAMPLE_AC_AT + 12)}}>Veredicto esperado</span>
						<div style={{flex: 1}} />
						<span style={{fontFamily: SANS, fontSize: 28, color: C.dim, maxWidth: 640, textAlign: 'right', opacity: tween(f, EXAMPLE_AC_AT + 6, EXAMPLE_AC_AT + 16)}}>
							La solución no es única: cada quien llega a ella a su ritmo.
						</span>
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** «Ven, únete a Goslint.» Final lockup: the question on «Ven», the call on «únete», then fade to black. */
export const FinalH2: React.FC = () => {
	const f = useCurrentFrame();
	const F0 = FINAL.f0;
	const mark = tween(f, F0, F0 + 28, 0, 1, outExpo);
	const word = tween(f, F0 + 12, F0 + 26, 0, 1, outExpo);
	const q = pop(f, FINAL.q, 16, 180, 0.7);
	const join = pop(f, FINAL.join, 12, 220, 0.6);
	const foot = tween(f, FINAL.foot, FINAL.foot + 16);
	const ring = tween(f, F0, F0 + 45, 0, 1, outExpo);
	const fadeOut = interpolate(f, [FINAL.fade, FINAL.fade + 17], [0, 1], clamp);
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
								transform: `scaleX(${f >= FINAL.join ? Math.min(1, join) : 0})`,
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
			<AbsoluteFill style={{background: C.white, opacity: interpolate(f, [F0, F0 + 4], [0.8, 0], clamp)}} />
			<AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
		</AbsoluteFill>
	);
};
