import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../../theme';
import {inCubic, outExpo, pop, tween} from '../../lib';
import {GridBg, Label, RiseWords, Verdict} from '../../components';
import {Big} from '../../reel/ui';
import {EXAMPLE_AC_AT, EXAMPLE_OUT_AT, R2, T} from '../timeline';

const [A, B] = R2.example;

/**
 * «Tu primer problema ya te está esperando.» The example of «Problema A» from the poster
 * (the same card as in the 16:9 video), stacked for a phone: input, arrow, output, verdict.
 */
export const ExampleV: React.FC = () => {
	const f = useCurrentFrame();
	const fadeIn = tween(f, A, A + 8);
	const enter = pop(f, A + 2, 18, 170, 0.8);
	const outP = tween(f, EXAMPLE_OUT_AT, EXAMPLE_OUT_AT + 16, 0, 1, outExpo);
	const ac = pop(f, EXAMPLE_AC_AT, 10, 220, 0.5);
	const exit = tween(f, B - 10, B, 0, 1, inCubic);
	return (
		<AbsoluteFill style={{background: C.bg, opacity: fadeIn}}>
			<GridBg opacity={0.35} />
			<AbsoluteFill style={{opacity: 1 - exit, transform: `scale(${1 + exit * 0.08})`}}>
				<div style={{position: 'absolute', left: 64, top: 276, width: 960}}>
					<Big size={84}>
						<RiseWords text="Tu primer problema" start={T.tu - 2} stagger={5} />
					</Big>
					<Big size={84} style={{color: C.green}}>
						<RiseWords text="ya te está esperando." start={T.yaTe - 2} stagger={3} />
					</Big>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 60,
						top: 540,
						width: 960,
						background: C.panel,
						border: `1.5px solid ${C.line2}`,
						borderRadius: 16,
						overflow: 'hidden',
						transform: `translateY(${(1 - enter) * 160}px)`,
						opacity: Math.min(1, enter * 1.5),
						boxShadow: '0 50px 140px rgba(0,0,0,0.7)',
					}}
				>
					<div style={{padding: '28px 40px', background: '#000', borderBottom: `1px solid ${C.line2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: '-0.02em', color: C.white}}>
							<span style={{color: C.green}}>Problema A</span> · Únete a Goslint
						</div>
						<Label size={24}>Ejemplo</Label>
					</div>
					<div style={{padding: '34px 40px 10px'}}>
						<Label color={C.faint} size={24}>
							Entrada
						</Label>
						<div style={{fontFamily: MONO, fontSize: 50, lineHeight: 1.4, color: C.white, marginTop: 10}}>
							1 estudiante
							<br />0 maratones
						</div>
						<svg width={60} height={84} viewBox="0 0 60 84" style={{display: 'block', margin: '18px 0 14px 8px'}}>
							<line x1={30} y1={0} x2={30} y2={66 * outP} stroke={C.green} strokeWidth={6} />
							{outP > 0.95 && <polygon points="12,58 30,84 48,58" fill={C.green} />}
						</svg>
						<div style={{opacity: outP}}>
							<Label color={C.faint} size={24}>
								Salida
							</Label>
							<div style={{fontFamily: MONO, fontSize: 50, lineHeight: 1.4, color: C.white, marginTop: 10}}>
								1 programador
								<br />
								competitivo
							</div>
						</div>
					</div>
					<div style={{padding: '22px 40px 36px', display: 'flex', alignItems: 'center', gap: 22, height: 72}}>
						<span style={{transform: `scale(${f >= EXAMPLE_AC_AT ? 0.5 + 0.5 * Math.min(1, ac) : 0})`, display: 'inline-flex'}}>
							<Verdict kind="AC" size={40} />
						</span>
						<span style={{fontFamily: MONO, fontSize: 30, color: C.dim, opacity: tween(f, EXAMPLE_AC_AT + 4, EXAMPLE_AC_AT + 12)}}>Veredicto esperado</span>
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
