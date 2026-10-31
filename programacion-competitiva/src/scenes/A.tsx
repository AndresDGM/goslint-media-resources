import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {inCubic, inOutCubic, outExpo, pop, rnd, tween} from '../lib';
import {M, SC, V} from '../timeline';
import {ChapterTitle, Chip, CutFlash, GlitchBurst, GridBg, Label, LogoMark, RiseWords, Shockwave, Spot, Typer, Verdict, WipeBar, Wordmark} from '../components';
import {Actor} from '../kit';
import {Emote, POSES} from '../mascot';
import {PixelBurst} from '../pixel';
import {Card, ContestClock, Globe, PixelComputer, Seats} from './parts';

/* ================================================================== 00 · apertura */

export const LOGO_AT = 120;

export const Intro: React.FC = () => {
	const f = useCurrentFrame();
	const logoAt = LOGO_AT;
	const p = tween(f, logoAt + 2, logoAt + 46, 0, 1, outExpo);
	const wordP = tween(f, logoAt + 42, logoAt + 58, 0, 1, outExpo);
	const glitch = f >= logoAt + 42 && f < logoAt + 50 ? (rnd(f) - 0.5) * 40 : 0;
	const tag = pop(f, logoAt + 62, 16, 180, 0.7);
	const side = tween(f, 208, 234, 0, 1, inOutCubic); // el logo cede espacio a Lint
	const cinco = M('s01', 'cinco');
	const uno = M('s01', 'uno');
	const mundo = M('s01', 'mundo');
	const eso = M('s01', 'eso');
	const que = M('s01', 'que');
	const como = M('s01', 'como');
	const uceva = M('s01', 'uceva');
	const vamos = M('s01', 'vamos');
	const logoOut = tween(f, cinco - 14, cinco - 2, 0, 1, inCubic);
	const cardsOut = tween(f, eso - 10, eso, 0, 1, inCubic);
	const titleUp = tween(f, que - 16, que + 4, 0, 1, inOutCubic);
	const glow = 16 + Math.sin(f / 6) * 6;
	const cmd = './maraton --duracion=5h --equipo=3 --computadores=1';
	const end = SC.intro[1];
	return (
		<AbsoluteFill>
			<GridBg opacity={f < logoAt ? 0.35 : 0.5} size={90} />
			{f < logoAt && (
				<div style={{position: 'absolute', left: 130, top: 440, fontFamily: MONO, fontSize: 40, color: C.white}}>
					<span style={{color: C.green}}>goslint@uceva</span>
					<span style={{color: C.dim}}>:~$ </span>
					<Typer text={cmd} start={8} cps={34} />
					{f >= 72 && <div style={{marginTop: 22, fontSize: 28, color: C.dim}}>{`> cargando problemas${'.'.repeat(Math.floor((f - 72) / 6) % 4)}`}</div>}
					{f >= 92 && <div style={{marginTop: 8, fontSize: 28, color: C.amber}}>{'> reloj: 05:00:00 · ¡comienza!'}</div>}
				</div>
			)}
			{f >= logoAt && f < cinco && (
				<AbsoluteFill style={{opacity: 1 - logoOut, transform: `translateX(${-side * 400}px) scale(${1 - side * 0.2})`, transformOrigin: '50% 40%'}}>
					<Shockwave at={logoAt} x={960} y={330} />
					<div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						<div style={{transform: `scale(${0.8 + 0.2 * p})`}}>
							<LogoMark height={360} p={p} glow={f > logoAt + 46 ? glow : 0} />
						</div>
						<div style={{marginTop: 48, clipPath: `inset(0 ${(1 - wordP) * 100}% 0 0)`, transform: `translateX(${glitch}px)`, filter: glitch ? `drop-shadow(${glitch / 3}px 0 0 ${C.green})` : undefined}}>
							<Wordmark height={88} />
						</div>
						<div style={{marginTop: 38, textAlign: 'center', opacity: tag, transform: `translateY(${(1 - tag) * 24}px)`}}>
							<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.white, letterSpacing: '-0.02em'}}>Programación competitiva </span>
							<span style={{fontFamily: SANS, fontWeight: 400, fontSize: 40, color: C.dim, letterSpacing: '-0.02em'}}>e investigación académica.</span>
						</div>
						<Label size={20} color={C.faint} style={{marginTop: 20, opacity: tween(f, logoAt + 76, logoAt + 88)}}>
							Semillero de Investigación · Ingeniería de Sistemas · UCEVA
						</Label>
					</div>
				</AbsoluteFill>
			)}
			{/* tres golpes: 5 horas · 3 personas y 1 computador · todo el mundo */}
			{f >= cinco - 4 && f < eso + 2 && (
				<AbsoluteFill style={{opacity: 1 - cardsOut, transform: `scale(${1 - cardsOut * 0.06})`}}>
					<Card at={cinco} x={90} y={250} w={400} h={460} label="// tiempo">
						<ContestClock at={cinco} x={200} y={150} size={58} speed={420} />
						<div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: SANS, fontWeight: 820, fontSize: 64, color: C.white, letterSpacing: '-0.04em'}}>5 horas</div>
						<div style={{position: 'absolute', left: 0, right: 0, top: 344, textAlign: 'center', fontFamily: MONO, fontSize: 22, color: C.dim}}>muchos problemas</div>
					</Card>
					<Card at={uno} x={530} y={250} w={400} h={460} label="// equipo">
						<Seats at={uno} x={200} y={200} />
						<PixelComputer x={200} y={196} scale={6} at={uno + 14} />
						<div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: SANS, fontWeight: 820, fontSize: 64, color: C.white, letterSpacing: '-0.04em'}}>
							3 <span style={{color: C.dim}}>·</span> <span style={{color: C.green}}>1</span>
						</div>
						<div style={{position: 'absolute', left: 0, right: 0, top: 344, textAlign: 'center', fontFamily: MONO, fontSize: 22, color: C.dim}}>personas · computador</div>
					</Card>
					<Card at={mundo} x={970} y={250} w={400} h={460} label="// rivales">
						<Globe at={mundo} x={200} y={150} r={92} />
						<div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: SANS, fontWeight: 820, fontSize: 56, color: C.white, letterSpacing: '-0.04em'}}>todo el mundo</div>
						<div style={{position: 'absolute', left: 0, right: 0, top: 344, textAlign: 'center', fontFamily: MONO, fontSize: 22, color: C.dim}}>universidades</div>
					</Card>
				</AbsoluteFill>
			)}
			{/* el nombre del tema */}
			{f >= eso - 2 && (
				<div style={{position: 'absolute', left: 110, top: 380 - titleUp * 230}}>
					<Label size={24} color={C.green} style={{opacity: tween(f, eso, eso + 8)}}>
						{'// hoy en goslint'}
					</Label>
					<div style={{fontFamily: SANS, fontWeight: 840, fontSize: 112 - titleUp * 28, letterSpacing: '-0.045em', color: C.white, lineHeight: 1.0, marginTop: 12}}>
						<RiseWords text="Programación" start={eso} />
						<br />
						<RiseWords text="competitiva" start={eso + 6} highlight={['competitiva']} />
					</div>
				</div>
			)}
			{f >= que - 4 &&
				[
					{at: que, t: '¿qué es exactamente?'},
					{at: como, t: '¿cómo funcionan las competencias?'},
					{at: uceva, t: '¿cómo participar desde la UCEVA?'},
				].map((q, i) =>
					f >= q.at - 2 ? (
						<div key={i} style={{position: 'absolute', left: 116, top: 470 + i * 92, fontFamily: MONO, fontSize: 38, color: C.white, opacity: pop(f, q.at, 18, 200, 0.6)}}>
							<span style={{color: C.green}}>{`0${i + 1} `}</span>
							<Typer text={q.t} start={q.at} cps={60} cursor={i === 2 && f < vamos} />
						</div>
					) : null,
				)}
			{f >= vamos && <PixelBurst x={1500} y={560} at={vamos + 4} f={f} count={26} power={20} />}
			{/* Lint */}
			<Actor
				x={1500}
				y={880}
				scale={11}
				enter={216}
				keys={[
					{at: 216, pose: POSES.wow},
					{at: 236, pose: POSES.wave, in: 5},
					{at: cinco - 6, pose: {...POSES.point, look: -1}},
					{at: eso, pose: POSES.cheer},
					{at: que - 4, pose: POSES.think},
					{at: uceva, pose: {...POSES.point, look: -1}},
					{at: vamos, pose: POSES.cheer},
				]}
				facing={f >= cinco - 6 ? -1 : 1}
				hops={[eso + 2, vamos + 2]}
				override={f >= 236 && f < V.s01.start + 10 ? {...POSES.wave, armF: Math.floor(f / 5) % 2 ? 124 : 96} : null}
				light={{dx: -1, dy: -1, color: '#9FB3A8', amt: 0.25}}
			/>
			{f >= 244 && f < mundo - 8 && (
				<div style={{position: 'absolute', left: 1500 - 200, width: 400, top: 420, textAlign: 'center', opacity: tween(f, 244, 256) * (1 - tween(f, mundo - 20, mundo - 8))}}>
					<Chip size={24} border={C.green}>
						<span style={{color: C.green}}>LINT</span>
						<span style={{color: C.dim, fontWeight: 500}}>mascota de Goslint</span>
					</Chip>
				</div>
			)}
			<Emote x={1500} y={520} text="?" f={f} at={que} dur={44} scale={7} color={C.green} />
			<GlitchBurst at={logoAt - 10} len={10} intensity={1.1} />
			<CutFlash at={logoAt} len={5} />
			<GlitchBurst at={eso - 3} len={6} />
			<WipeBar at={end - 8} dur={12} />
		</AbsoluteFill>
	);
};

/* ================================================================== 01 · ¿qué es? */

export const Que: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.que;
	const k = (m: string) => M('s02', m);
	const resolver = k('resolver');
	const algoritmos = k('algoritmos');
	const funcione = k('funcione');
	const logica = k('logica');
	const nombre = k('nombre');
	const software = k('software');
	// tres «actos» en la misma escena
	const act1Out = tween(f, logica - 14, logica - 2, 0, 1, inCubic);
	const act2Out = tween(f, nombre - 12, nombre, 0, 1, inCubic);
	const pipeUp = tween(f, funcione - 14, funcione + 6, 0, 1, inOutCubic);
	const steps = [
		{at: resolver, t: 'problema', sub: 'una situación'},
		{at: algoritmos, t: 'algoritmo', sub: 'la idea'},
		{at: algoritmos + 18, t: 'código', sub: 'C++ · Java · Python'},
	];
	const reqs = [
		{at: k('correcta'), t: 'correcta', node: <Verdict kind="AC" size={26} />, bar: null as null | {v: number; label: string}},
		{at: k('eficiente'), t: 'eficiente', node: null, bar: {v: 0.12, label: 'tiempo 0,12 s / 1 s'}},
		{at: k('recursos'), t: 'recursos', node: null, bar: {v: 0.06, label: 'memoria 14 MB / 256 MB'}},
	];
	const skills = [
		{at: logica, t: 'lógica', g: 'si ⇒ entonces'},
		{at: k('creatividad'), t: 'creatividad', g: '¿y si…?'},
		{at: k('conoc'), t: 'algoritmos', g: 'O(n log n)'},
		{at: k('practica'), t: 'práctica', g: 'problema tras problema'},
	];
	const uses = [
		{at: software, t: 'Desarrollar software', g: '</>'},
		{at: k('entrevistas'), t: 'Entrevistas técnicas', g: '?!'},
		{at: k('estructurada'), t: 'Resolver con estructura', g: '1·2·3'},
	];
	return (
		<AbsoluteFill>
			<GridBg opacity={0.45} size={90} />
			<ChapterTitle at={a + 6} n="01" label="¿qué es?" title="Resolver problemas con algoritmos" highlight={['algoritmos']} out={logica - 4} />
			{/* acto 1: problema → algoritmo → código, y los tres requisitos */}
			{f < logica && (
				<AbsoluteFill style={{opacity: 1 - act1Out}}>
					{steps.map((s, i) => {
						const p = pop(f, s.at, 16, 190, 0.7);
						const x = 110 + i * 390;
						const y = 420 - pipeUp * 120;
						return f >= s.at - 2 ? (
							<React.Fragment key={i}>
								<div style={{position: 'absolute', left: x, top: y + (1 - p) * 30, width: 320, height: 150, opacity: Math.min(1, p * 1.5), background: C.panel, border: `2px solid ${i === 2 ? C.green : C.line2}`, padding: '22px 26px'}}>
									<Label size={18} color={C.green}>{`0${i + 1}`}</Label>
									<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.white, letterSpacing: '-0.03em', marginTop: 4}}>{s.t}</div>
									<div style={{fontFamily: MONO, fontSize: 19, color: C.dim, marginTop: 4}}>{s.sub}</div>
								</div>
								{i > 0 && <div style={{position: 'absolute', left: x - 62, top: y + 50, fontFamily: MONO, fontSize: 44, color: C.green, opacity: p}}>→</div>}
							</React.Fragment>
						) : null;
					})}
					{f >= funcione - 2 && (
						<div style={{position: 'absolute', left: 110, top: 520, fontFamily: MONO, fontSize: 30, color: C.white, opacity: pop(f, funcione, 16, 200, 0.6)}}>
							<span style={{color: C.green}}>$ </span>./solucion <span style={{color: C.dim}}>{'→ funciona…'}</span>
							<span style={{color: C.amber, marginLeft: 18, opacity: tween(f, funcione + 24, funcione + 30)}}>pero no basta</span>
						</div>
					)}
					{reqs.map((r, i) => {
						if (f < r.at - 2) return null;
						const p = pop(f, r.at, 16, 200, 0.6);
						return (
							<div key={i} style={{position: 'absolute', left: 110 + i * 390, top: 610 + (1 - p) * 30, width: 320, opacity: Math.min(1, p * 1.5), background: 'rgba(8,11,9,0.94)', borderLeft: `6px solid ${C.green}`, padding: '18px 22px'}}>
								<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.white, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 16}}>
									{r.t} {r.node}
								</div>
								{r.bar && (
									<div style={{marginTop: 12}}>
										<div style={{height: 10, background: 'rgba(255,255,255,0.12)'}}>
											<div style={{height: 10, width: `${tween(f, r.at + 4, r.at + 24, 0, r.bar.v) * 100}%`, background: C.green}} />
										</div>
										<div style={{fontFamily: MONO, fontSize: 18, color: C.dim, marginTop: 8}}>{r.bar.label}</div>
									</div>
								)}
							</div>
						);
					})}
				</AbsoluteFill>
			)}
			{/* acto 2: lo que se necesita */}
			{f >= logica - 6 && f < nombre && (
				<AbsoluteFill style={{opacity: 1 - act2Out}}>
					<div style={{position: 'absolute', left: 110, top: 150}}>
						<Label size={22} color={C.green}>{'// para lograrlo necesitas'}</Label>
					</div>
					{skills.map((s, i) => {
						if (f < s.at - 2) return null;
						const p = pop(f, s.at, 15, 210, 0.6);
						const last = i === 3;
						return (
							<div key={i} style={{position: 'absolute', left: 110 + (i % 2) * 560, top: 230 + Math.floor(i / 2) * 290 + (1 - p) * 40, width: 520, height: 250, opacity: Math.min(1, p * 1.5), background: last ? 'rgba(0,192,99,0.14)' : C.panel, border: `2px solid ${last ? C.green : C.line2}`, padding: '30px 34px'}}>
								<Label size={18} color={C.faint}>{`skill_0${i + 1}`}</Label>
								<div style={{fontFamily: SANS, fontWeight: 830, fontSize: 64, color: last ? C.green : C.white, letterSpacing: '-0.04em', marginTop: 10}}>{s.t}</div>
								<div style={{fontFamily: MONO, fontSize: 24, color: C.dim, marginTop: 10}}>{s.g}</div>
							</div>
						);
					})}
				</AbsoluteFill>
			)}
			{/* acto 3: no hace falta competir */}
			{f >= nombre - 2 && (
				<AbsoluteFill>
					<div style={{position: 'absolute', left: 110, top: 170}}>
						<div style={{fontFamily: SANS, fontWeight: 840, fontSize: 110, letterSpacing: '-0.045em', color: C.white, position: 'relative', display: 'inline-block'}}>
							<RiseWords text="competitiva" start={nombre} />
							<div style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 10, background: C.amber, transformOrigin: 'left', transform: `scaleX(${tween(f, nombre + 34, nombre + 46)})`}} />
						</div>
						<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.text, marginTop: 10, opacity: tween(f, nombre + 40, nombre + 52)}}>
							…no necesitas competir para <span style={{color: C.green}}>beneficiarte</span>.
						</div>
					</div>
					{uses.map((u, i) => {
						if (f < u.at - 2) return null;
						const p = pop(f, u.at, 15, 210, 0.6);
						return (
							<div key={i} style={{position: 'absolute', left: 110 + i * 380, top: 560 + (1 - p) * 40, width: 340, height: 230, opacity: Math.min(1, p * 1.5), background: C.panel, border: `2px solid ${C.line2}`, padding: '26px 28px'}}>
								<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.green}}>{u.g}</div>
								<div style={{fontFamily: SANS, fontWeight: 760, fontSize: 36, color: C.white, letterSpacing: '-0.02em', marginTop: 22, lineHeight: 1.12}}>{u.t}</div>
							</div>
						);
					})}
				</AbsoluteFill>
			)}
			<Spot x={1560} y={760} r={300} amt={0.16} />
			<Actor
				x={1580}
				y={880}
				scale={11}
				enter={a + 4}
				facing={-1}
				keys={[
					{at: a + 4, pose: POSES.idle},
					{at: resolver, pose: {...POSES.point, look: -1}},
					{at: funcione + 16, pose: POSES.shrug},
					{at: k('correcta'), pose: {...POSES.point, look: -1}},
					{at: logica, pose: POSES.think},
					{at: k('practica'), pose: POSES.cheer},
					{at: nombre, pose: {...POSES.oops}},
					{at: nombre + 40, pose: {...POSES.wave}},
					{at: software, pose: {...POSES.pointDown, look: -1}},
				]}
				hops={[k('practica')]}
			/>
			<Emote x={1580} y={520} text="!" f={f} at={nombre + 2} dur={36} scale={7} color={C.amber} />
			<GlitchBurst at={a} len={5} />
			<WipeBar at={b - 8} dur={12} />
		</AbsoluteFill>
	);
};
