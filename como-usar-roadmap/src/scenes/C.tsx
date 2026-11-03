import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {inOutCubic, outExpo, pop, tween} from '@commons/lib';
import {CutFlash, GridBg, Label, LogoMark, Shockwave, Verdict, Wordmark} from '@commons/components';
import {POSES} from '@commons/mascot';
import {Big, Hit, In, Kicker, Panel} from '@commons/vertical';
import {Actor} from '../kit';
import {M, SC} from '../timeline';
import {FASES, hitoDe} from '../fases';
import {PhaseStrip, VideoTile} from '../parts';

/* ================================================================== 03 · los hitos (s04) */

export const Hitos: React.FC = () => {
	const f = useCurrentFrame();
	const k = (m: string) => M('s04', m);
	const a = SC.hitos[0];
	const hitos = FASES.map((fa) => ({fa, h: hitoDe(fa)})).filter((x) => x.h);
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} size={90} />
			<In at={a + 8} out={k('hito') - 2} x={460} y={330} w={1300} from="zoom" exit="up">
				<Big size={110}>
					¿Ya puedo pasar a la <span style={{color: C.green}}>siguiente fase</span>?
				</Big>
			</In>
			<PhaseStrip at={a + 12} y={190} x0={260} x1={1720} stars={k('hito')} />
			{/* los siete hitos reales del temario */}
			{hitos.map(({fa, h}, i) => (
				<In key={fa.n} at={k('hito') + 8 + i * 6} out={k('sale') - 4} x={460 + (i % 2) * 650} y={330 + Math.floor(i / 2) * 116} w={620} from={i % 2 ? 'right' : 'left'} exit="down" impact={i === 0}>
					<VideoTile n={h!.n} t={h!.t} hito w={620} size={0.9} />
				</In>
			))}
			<In at={k('reto')} out={k('sale') - 4} x={1110} y={800} w={620} from="right" exit="down">
				<Panel accent={C.amber} pad={20}>
					<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.white}}>
						★ = un <span style={{color: C.amber}}>reto</span> o un <span style={{color: C.amber}}>repaso</span>
					</div>
				</Panel>
			</In>
			<In at={k('sale')} out={SC.hitos[1]} x={500} y={400} w={560} from="left" exit="left">
				<Panel accent={C.green} pad={26}>
					<Verdict kind="AC" size={34} />
					<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 52, color: C.white, marginTop: 14, lineHeight: 1.1}}>
						¿Te sale? <span style={{color: C.green}}>Sigue a la próxima fase →</span>
					</div>
				</Panel>
			</In>
			<Hit at={k('sale') + 2} x={780} y={500} />
			<In at={k('repasa')} out={SC.hitos[1]} x={1150} y={400} w={560} from="right" exit="right">
				<Panel accent={C.amber} pad={26}>
					<Verdict kind="WA" size={34} />
					<div style={{fontFamily: SANS, fontWeight: 820, fontSize: 52, color: C.white, marginTop: 14, lineHeight: 1.1}}>
						¿No? <span style={{color: C.amber}}>↺ repasa la fase</span> y vuelve a intentarlo
					</div>
				</Panel>
			</In>
			<Actor
				x={250}
				y={930}
				scale={8}
				keys={[
					{at: a, pose: POSES.think},
					{at: k('hito'), pose: POSES.pointUp},
					{at: k('reto'), pose: POSES.point},
					{at: k('sale'), pose: POSES.cheer},
					{at: k('repasa'), pose: POSES.shrug},
				]}
			/>
		</AbsoluteFill>
	);
};

/* ================================================================== 04 · ¿por dónde entro? (s05) */

const Node: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = C.line2, size = 40}) => (
	<div style={{background: 'rgba(8,11,9,0.95)', border: `4px solid ${color}`, padding: '18px 26px', fontFamily: SANS, fontWeight: 800, fontSize: size, color: C.white, lineHeight: 1.12, boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>{children}</div>
);

const Arrow: React.FC<{at: number; out?: number; x: number; y: number; w: number; color?: string}> = ({at, out, x, y, w, color = C.green}) => {
	const f = useCurrentFrame();
	if (f < at || (out !== undefined && f >= out - 6)) return null;
	const p = tween(f, at, at + 12, 0, 1, outExpo);
	return (
		<div style={{position: 'absolute', left: x, top: y - 4, width: w * p, height: 8, background: color, boxShadow: `0 0 14px ${color}`}}>
			<div style={{position: 'absolute', right: -14, top: -11, width: 0, height: 0, borderTop: '15px solid transparent', borderBottom: '15px solid transparent', borderLeft: `22px solid ${color}`, opacity: p > 0.9 ? 1 : 0}} />
		</div>
	);
};

export const Entrada: React.FC = () => {
	const f = useCurrentFrame();
	const k = (m: string) => M('s05', m);
	const a = SC.entrada[0];
	const fa38 = FASES[2].videos.find((v) => v.n === '038')!;
	const rowA = 330;
	const rowB = 640;
	const mismo = k('mismo');
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} size={90} />
			<In at={k('entras')} out={k('mismo') - 4} x={460} y={150} w={1300} from="up" exit="up" impact={false}>
				<Kicker>{'// ¿por dónde entras tú?'}</Kicker>
			</In>
			{/* camino A: nunca has programado */}
			<In at={k('cero')} out={mismo - 4} x={460} y={rowA - 50} w={430} from="left" exit="left">
				<Node>Nunca has programado</Node>
			</In>
			<Arrow at={k('fase0') - 6} out={mismo} x={910} y={rowA} w={130} />
			<In at={k('fase0')} out={mismo - 4} x={1070} y={rowA - 50} w={680} from="right" exit="right">
				<Node color={C.green}>
					Fase 0 <span style={{color: C.green}}>→ en orden</span>
				</Node>
			</In>
			{/* camino B: ya programas */}
			<In at={k('programas')} out={mismo - 4} x={460} y={rowB - 50} w={430} from="left" exit="left">
				<Node>Ya programas</Node>
			</In>
			<In at={k('saltar')} out={k('checkpoint') - 2} x={1070} y={rowB - 40} w={680} from="right" exit="up" impact={false}>
				<Label size={34} color={C.amber}>puedes saltarte fases…</Label>
			</In>
			<Arrow at={k('checkpoint') - 6} out={mismo} x={910} y={rowB} w={130} color={C.amber} />
			<In at={k('checkpoint')} out={mismo - 4} x={1070} y={rowB - 70} w={680} from="right" exit="right">
				<VideoTile n={fa38.n} t={fa38.t} hito w={680} size={1.1} />
			</In>
			<Hit at={k('checkpoint') + 2} x={1400} y={rowB} />
			<In at={k('cinco')} out={mismo - 4} x={1070} y={rowB + 50} w={680} from="down" exit="right" impact={false}>
				<div style={{display: 'flex', gap: 12, marginTop: 10}}>
					{[0, 1, 2, 3, 4].map((i) => (
						<div key={i} style={{width: 120, height: 70, border: `3px solid ${f >= k('salen') + i * 4 ? C.green : C.line2}`, background: f >= k('salen') + i * 4 ? 'rgba(0,192,99,0.2)' : C.panel, fontFamily: MONO, fontWeight: 800, fontSize: 28, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							{f >= k('salen') + i * 4 ? 'AC' : String.fromCharCode(65 + i)}
						</div>
					))}
				</div>
			</In>
			<In at={k('pasar')} out={mismo - 4} x={1070} y={rowB + 170} w={680} from="down" exit="right">
				<Node color={C.green} size={36}>
					→ Fase 3 · <span style={{color: C.green}}>Estructuras y algoritmos</span>
				</Node>
			</In>
			<Hit at={k('pasar') + 2} x={1400} y={rowB + 210} big />
			{/* «haz lo mismo con el hito de cada fase hasta encontrar la tuya» */}
			<PhaseStrip at={mismo} y={420} x0={460} x1={1720} stars={mismo + 6} active={f >= k('tuya') ? 3 : null} />
			<In at={k('tuya')} x={460} y={640} w={1260} from="down">
				<Big size={88}>
					Encuentra <span style={{color: C.green}}>tu fase</span>
				</Big>
			</In>
			<Actor
				x={250}
				y={930}
				scale={8}
				keys={[
					{at: a, pose: POSES.idle},
					{at: k('entras'), pose: POSES.wave},
					{at: k('cero'), pose: POSES.point},
					{at: k('programas'), pose: POSES.pointDown},
					{at: k('checkpoint'), pose: POSES.point},
					{at: k('salen'), pose: POSES.cheer},
					{at: k('mismo'), pose: POSES.pointUp},
					{at: k('tuya'), pose: POSES.cheer},
				]}
			/>
		</AbsoluteFill>
	);
};

/* ================================================================== 05 · un mapa vivo (s06) */

export const Cambios: React.FC = () => {
	const f = useCurrentFrame();
	const k = (m: string) => M('s06', m);
	const a = SC.cambios[0];
	// una muestra real del temario (fase 1): se reordenan para mostrar que el mapa puede cambiar
	const vids = FASES[1].videos.slice(0, 6);
	const move = tween(f, k('ajustar'), k('ajustar') + 24, 0, 1, inOutCubic);
	const order = [0, 1, 2, 3, 4, 5];
	const swapped = [0, 2, 1, 3, 5, 4];
	const xy = (slot: number) => ({x: 460 + (slot % 2) * 650, y: 300 + Math.floor(slot / 2) * 120});
	const pos = (i: number) => {
		const A = xy(order.indexOf(i));
		const B = xy(swapped.indexOf(i));
		return {x: A.x + (B.x - A.x) * move, y: A.y + (B.y - A.y) * move};
	};
	const stamp = pop(f, k('definitivo') + 4, 10, 260, 0.5);
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} size={90} />
			<In at={a + 8} out={k('definitivo') + 2} x={460} y={180} w={1300} from="up" exit="up" impact={false}>
				<Kicker>{'// roadmap_goslint · versión actual'}</Kicker>
			</In>
			{f >= a + 10 &&
				vids.map((v, i) => {
					const p = pop(f, a + 10 + i * 4, 12, 230, 0.6);
					const q = pos(i);
					return (
						<div key={v.n} style={{position: 'absolute', left: q.x, top: q.y, opacity: Math.min(1, p * 2), transform: `scale(${0.7 + 0.3 * p})`}}>
							<VideoTile n={v.n} t={v.t} w={620} size={0.9} color={move > 0 && move < 1 ? C.amber : undefined} />
						</div>
					);
				})}
			{f >= k('ajustar') + 6 && (
				<div style={{position: 'absolute', left: 460, top: 300 + 3 * 120, opacity: tween(f, k('ajustar') + 6, k('ajustar') + 16), transform: `scale(${pop(f, k('ajustar') + 6, 12, 230, 0.6)})`, transformOrigin: 'left center'}}>
					<div style={{width: 620, border: `3px dashed ${C.green}`, padding: '14px 18px', fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.green}}>+ nuevo video</div>
				</div>
			)}
			{f >= k('definitivo') + 4 && (
				<div style={{position: 'absolute', left: 1180, top: 120, transform: `rotate(-8deg) scale(${2.2 - 1.2 * stamp})`, opacity: Math.min(1, stamp * 1.5)}}>
					<div style={{border: `6px solid ${C.amber}`, padding: '10px 24px', fontFamily: MONO, fontWeight: 800, fontSize: 46, color: C.amber, letterSpacing: '0.06em'}}>NO ES DEFINITIVO</div>
				</div>
			)}
			<Hit at={k('definitivo') + 6} x={1420} y={170} />
			<In at={k('cambios')} out={SC.cambios[1]} x={460} y={200} w={1300} from="up" exit="up" impact={false}>
				<Label size={34} color={C.white}>agregar · mover · ajustar</Label>
			</In>
			<In at={k('mejor')} x={460} y={790} w={1300} from="down">
				<Big size={64}>
					→ según lo que <span style={{color: C.green}}>funcione mejor para aprender</span>
				</Big>
			</In>
			<Actor
				x={250}
				y={930}
				scale={8}
				keys={[
					{at: a, pose: POSES.idle},
					{at: k('definitivo'), pose: POSES.pointUp},
					{at: k('ajustar'), pose: POSES.point},
					{at: k('mejor'), pose: POSES.cheer},
				]}
			/>
		</AbsoluteFill>
	);
};

/* ================================================================== cierre (s07) */

export const Final: React.FC = () => {
	const f = useCurrentFrame();
	const k = (m: string) => M('s07', m);
	const a = SC.final[0];
	const gusta = k('gusta');
	const unete = k('unete');
	const logoAt = gusta - 30;
	const p = tween(f, logoAt, logoAt + 40, 0, 1, outExpo);
	const end = SC.final[1];
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} size={90} />
			{f < logoAt && (
				<>
					<PhaseStrip at={a + 6} y={330} x0={460} x1={1720} active={f >= k('elige') ? 1 : null} out={logoAt} />
					<In at={k('mapa')} out={logoAt} x={460} y={520} w={1260} from="down" exit="down">
						<Big size={86}>
							Guarda el mapa, <span style={{color: C.green}}>elige tu fase</span>
						</Big>
					</In>
					<In at={k('nos')} out={logoAt} x={460} y={680} w={1260} from="down" exit="down" impact={false}>
						<Label size={36} color={C.dim}>y nos vemos en el primer video</Label>
					</In>
					<Actor x={250} y={930} scale={8} keys={[{at: a, pose: POSES.wave}, {at: k('mapa'), pose: POSES.pointUp}, {at: k('nos'), pose: POSES.wave}]} />
				</>
			)}
			{f >= logoAt && (
				<>
					<Shockwave at={logoAt + 4} x={960} y={330} />
					<div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center'}}>
						<LogoMark height={300} p={p} glow={f > logoAt + 40 ? 16 + Math.sin(f / 6) * 6 : 0} />
					</div>
					<In at={gusta} x={0} y={500} w={1920} from="up" impact={false}>
						<div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 760, fontSize: 64, color: C.text, letterSpacing: '-0.03em'}}>¿Te gusta programar?</div>
					</In>
					<In at={unete} x={0} y={600} w={1920} from="zoom" impact={false}>
						<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
							<Big size={110}>¡Únete a</Big>
							<Wordmark height={96} />
						</div>
					</In>
					<Hit at={unete + 2} x={960} y={660} big />
					{f >= unete + 30 && (
						<div style={{position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', justifyContent: 'center', opacity: tween(f, unete + 30, unete + 42)}}>
							<Img src={staticFile('brand/uceva.png')} style={{height: 80}} />
						</div>
					)}
					<Actor x={250} y={930} scale={8} keys={[{at: logoAt, pose: POSES.cheer}, {at: unete + 40, pose: POSES.wave}]} />
					<CutFlash at={logoAt + 4} len={5} />
				</>
			)}
			<AbsoluteFill style={{background: '#000', opacity: tween(f, end - 40, end - 4)}} />
		</AbsoluteFill>
	);
};
