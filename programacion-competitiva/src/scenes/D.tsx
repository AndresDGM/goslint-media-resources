import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {inCubic, outExpo, pop, rnd, tween} from '../lib';
import {M, SC, V} from '../timeline';
import {BlurBg, ChapterTitle, Chip, CutFlash, EventTag, GlitchBurst, GridBg, Label, LogoMark, Photo, Polaroid, RiseWords, Shockwave, Spot, Typer, Wordmark, WipeBar} from '../components';
import {Actor} from '../kit';
import {Emote, POSES} from '../mascot';
import {PixelBurst} from '../pixel';
import {Fact} from './parts';

/* ================================================================== 07 · en la UCEVA */

export const Uceva: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.uceva;
	const k = (m: string) => M('s08', m);
	const empezar = k('empezar');
	const lejos = k('lejos');
	const goslint = k('goslint');
	const aprender = k('aprender');
	const maratones = k('maratones');
	const d2024 = k('d2024');
	const d2026 = k('d2026');
	const icpc = k('icpc');
	const camp = k('camp');
	const nosolo = k('nosolo');
	// bloques de la escena (cada uno con su propio fondo)
	const B1 = [a, aprender - 8]; // ¿cómo empezar? → GOSLINT en la UCEVA
	const B2 = [aprender - 8, maratones - 8]; // aprendemos, entrenamos, participamos
	const B3 = [maratones - 8, d2024 - 8]; // maratones internas
	const B4 = [d2024 - 8, icpc - 8]; // XI y XII
	const B5 = [icpc - 8, camp - 8]; // ICPC
	const B6 = [camp - 8, nosolo - 8]; // Training Camp
	const B7 = [nosolo - 8, b]; // más allá de competir
	const inB = (r: number[]) => f >= r[0] && f < r[1];
	const logoP = tween(f, goslint - 4, goslint + 36, 0, 1, outExpo);
	const verbs = [
		{at: aprender, t: 'aprendemos', src: 'entrenamiento-sala-1.jpg', pos: '50% 40%'},
		{at: k('entrenar'), t: 'entrenamos', src: 'entrenamiento-sala-2.jpg', pos: '50% 50%'},
		{at: k('participar'), t: 'participamos', src: '2026-maraton-interna-sala.jpg', pos: '50% 60%'},
	];
	const verb = verbs.filter((v) => f >= v.at - 4).length - 1;
	const pillars = [
		{at: k('proyectos'), t: 'Proyectos de investigación', g: '∑'},
		{at: k('herramientas'), t: 'Herramientas de entrenamiento', g: '</>'},
		{at: k('tesis'), t: 'Trabajos de grado', g: '◆'},
	];
	return (
		<AbsoluteFill>
			{/* B1 · no tienes que irte lejos */}
			{inB(B1) && (
				<AbsoluteFill>
					<GridBg opacity={0.45} size={90} />
					<ChapterTitle at={a + 6} n="07" label="en la uceva" title="¿Cómo puedo empezar?" highlight={['empezar?']} out={lejos + 6} />
					{f >= lejos && (
						<div style={{position: 'absolute', left: 110, top: 180, opacity: pop(f, lejos, 16, 200, 0.6) * (1 - tween(f, goslint - 10, goslint - 2))}}>
							<div style={{fontFamily: SANS, fontWeight: 840, fontSize: 96, letterSpacing: '-0.045em', color: C.white}}>
								<RiseWords text="¡Muy cerca!" start={lejos} highlight={['cerca!']} />
							</div>
							<div style={{display: 'flex', alignItems: 'center', gap: 28, marginTop: 30, opacity: tween(f, lejos + 10, lejos + 20)}}>
								<Img src={staticFile('brand/uceva.png')} style={{height: 120}} />
								<Chip size={26} border={C.green}>
									<span style={{color: C.green}}>●</span> Tuluá · Valle del Cauca
								</Chip>
							</div>
						</div>
					)}
					{f >= goslint - 4 && (
						<div style={{position: 'absolute', left: 110, top: 300, display: 'flex', alignItems: 'center', gap: 50}}>
							<Shockwave at={goslint} x={180} y={170} size={1200} />
							<LogoMark height={330} p={logoP} glow={f > goslint + 36 ? 14 + Math.sin(f / 6) * 5 : 0} />
							<div style={{opacity: tween(f, goslint + 14, goslint + 26)}}>
								<Wordmark height={86} />
								<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 36, color: C.text, marginTop: 26, letterSpacing: '-0.01em'}}>Semillero de investigación</div>
								<div style={{fontFamily: MONO, fontSize: 24, color: C.dim, marginTop: 8}}>Ingeniería de Sistemas · UCEVA</div>
							</div>
						</div>
					)}
					<Actor x={1600} y={880} scale={10} enter={a + 4} facing={-1} keys={[{at: a + 4, pose: POSES.think}, {at: lejos, pose: POSES.cheer}, {at: goslint, pose: {...POSES.point, look: -1}}]} hops={[lejos + 2]} />
					<Emote x={1600} y={540} text="?" f={f} at={empezar} dur={30} scale={6} color={C.green} />
				</AbsoluteFill>
			)}
			{/* B2 · aprendemos, entrenamos, participamos */}
			{inB(B2) && verb >= 0 && (
				<AbsoluteFill>
					<Photo key={verb} src={verbs[verb].src} from={verbs[verb].at - 4} dur={90} pos={verbs[verb].pos} grade={0.3} />
					<div style={{position: 'absolute', left: 96, top: 780}}>
						{verbs.map((v, i) =>
							f >= v.at - 4 ? (
								<span key={i} style={{fontFamily: SANS, fontWeight: 840, fontSize: 86, letterSpacing: '-0.045em', color: i === verb ? C.green : 'rgba(255,255,255,0.55)', marginRight: 34, textShadow: '0 4px 30px rgba(0,0,0,0.8)', display: 'inline-block', transform: `translateY(${(1 - pop(f, v.at - 4, 16, 220, 0.6)) * 40}px)`}}>
									{v.t}
								</span>
							) : null,
						)}
					</div>
					<EventTag start={B2[0] + 6} title={verb < 2 ? 'Entrenamientos GOSLINT' : 'Maratón interna UCEVA 2026'} sub={verb < 2 ? 'salas de sistemas · UCEVA' : undefined} x={96} y={110} cps={300} />
				</AbsoluteFill>
			)}
			{/* B3 · maratones internas */}
			{inB(B3) && (
				<AbsoluteFill>
					<BlurBg src="2026-maraton-interna-participantes-2.jpg" from={B3[0]} dur={B3[1] - B3[0]} />
					<div style={{position: 'absolute', left: 96, top: 120, width: 760}}>
						<Label size={22} color={C.green}>{'// actividades'}</Label>
						<div style={{fontFamily: SANS, fontWeight: 830, fontSize: 70, letterSpacing: '-0.04em', color: C.white, lineHeight: 1.04, marginTop: 10}}>
							<RiseWords text="Maratones de Programación UCEVA" start={maratones} highlight={['UCEVA']} />
						</div>
					</div>
					<Fact at={k('familiar')} x={96} y={430}>Familiarizarte con los problemas</Fact>
					<Fact at={k('practicar')} x={96} y={520}>Practicar</Fact>
					<Fact at={k('vivir')} x={96} y={610}>Vivir la dinámica de una competencia</Fact>
					<Polaroid src="2026-maraton-interna-participantes-1.jpg" at={maratones + 6} x={980} y={150} w={520} h={390} tilt={-3} pos="50% 50%" />
					<Polaroid src="2024-maraton-interna-globos.jpg" at={k('familiar') + 4} x={1300} y={300} w={500} h={375} tilt={3} pos="50% 50%" />
					<Polaroid src="2026-maraton-interna-participantes-3.jpg" at={k('vivir') + 2} x={1060} y={560} w={480} h={330} tilt={-1.5} pos="50% 50%" />
				</AbsoluteFill>
			)}
			{/* B4 · XI (2024) y XII (2026) */}
			{inB(B4) && (
				<AbsoluteFill>
					<GridBg opacity={0.4} size={90} />
					{[
						{at: d2024, src: '2024-maraton-interna-poster.jpg', n: 'XI', y: '2024', date: 'viernes 22 de marzo de 2024', place: 'Sala de Sistemas A', photo: '2024-maraton-interna-sala-1.jpg', x: 110},
						{at: d2026, src: '2026-maraton-interna-poster.jpg', n: 'XII', y: '2026', date: 'viernes 27 de marzo de 2026', place: 'Salas de Sistemas A y E', photo: '2026-maraton-interna-participantes-4.jpg', x: 990},
					].map((e, i) => {
						if (f < e.at - 4) return null;
						const p = pop(f, e.at, 16, 180, 0.7);
						return (
							<div key={i} style={{position: 'absolute', left: e.x, top: 150 + (1 - p) * 60, width: 820, opacity: Math.min(1, p * 1.5)}}>
								<div style={{display: 'flex', gap: 26}}>
									<div style={{width: 330, height: i === 0 ? 330 : 412, flex: '0 0 auto', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.85)', overflow: 'hidden'}}>
										<Img src={staticFile(`photos/${e.src}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
									</div>
									<div>
										<div style={{fontFamily: SANS, fontWeight: 880, fontSize: 150, letterSpacing: '-0.05em', color: C.green, lineHeight: 0.9}}>{e.n}</div>
										<div style={{fontFamily: SANS, fontWeight: 760, fontSize: 40, color: C.white, letterSpacing: '-0.02em', marginTop: 10}}>{`Maratón ${e.y}`}</div>
										<div style={{fontFamily: MONO, fontSize: 21, color: C.dim, marginTop: 14, lineHeight: 1.5}}>
											{e.date}
											<br />
											{e.place}
										</div>
									</div>
								</div>
								<div style={{marginTop: 26, width: 760, height: 250, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.85)', opacity: tween(f, e.at + 14, e.at + 24)}}>
									<Img src={staticFile(`photos/${e.photo}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 45%'}} />
								</div>
							</div>
						);
					})}
				</AbsoluteFill>
			)}
			{/* B5 · competencias ICPC */}
			{inB(B5) && (
				<AbsoluteFill>
					<BlurBg src="2025-regional-icpc-poli.jpg" from={B5[0]} dur={B5[1] - B5[0]} />
					<Polaroid src="2026-nacional-icpc-equipo.jpg" at={icpc} x={180} y={180} w={560} h={640} tilt={-2.5} pos="50% 40%" caption="Nacional ACIS-REDIS 2026" />
					<Polaroid src="2025-regional-icpc-poli.jpg" at={icpc + 26} x={820} y={140} w={620} h={470} tilt={2} pos="50% 55%" caption="Regional ICPC 2025 · Bogotá" />
					<Polaroid src="2025-regional-icpc-banner.jpg" at={icpc + 48} x={1180} y={470} w={560} h={390} tilt={-1.5} pos="50% 45%" caption="Regional ICPC 2025" />
					<EventTag start={icpc + 4} title="Equipos GOSLINT en la ICPC" sub="fase nacional y fase regional" x={96} y={110} />
				</AbsoluteFill>
			)}
			{/* B6 · Training Camp de Medellín */}
			{inB(B6) && (
				<AbsoluteFill>
					<Photo src="2026-training-camp-medellin-1.jpg" from={B6[0]} dur={B6[1] - B6[0]} pos="50% 60%" grade={0.2} />
					<Polaroid src="2026-training-camp-medellin-3.jpg" at={camp + 20} x={1240} y={430} w={560} h={400} tilt={2.5} pos="50% 55%" />
					<EventTag start={camp} title="Training Camp · Medellín 2026" sub="entrenamiento presencial · EAFIT" x={96} y={110} />
				</AbsoluteFill>
			)}
			{/* B7 · más allá de competir */}
			{inB(B7) && (
				<AbsoluteFill>
					<GridBg opacity={0.45} size={90} />
					<div style={{position: 'absolute', left: 110, top: 150}}>
						<Label size={22} color={C.green} style={{opacity: tween(f, nosolo, nosolo + 8)}}>
							{'// goslint no se limita a competir'}
						</Label>
						<div style={{fontFamily: SANS, fontWeight: 830, fontSize: 78, letterSpacing: '-0.04em', color: C.white, marginTop: 12}}>
							<RiseWords text="También investigamos" start={nosolo + 4} highlight={['investigamos']} />
						</div>
					</div>
					{pillars.map((pl, i) => {
						if (f < pl.at - 2) return null;
						const p = pop(f, pl.at, 15, 210, 0.6);
						return (
							<div key={i} style={{position: 'absolute', left: 110 + i * 420, top: 430 + (1 - p) * 40, width: 380, height: 300, opacity: Math.min(1, p * 1.5), background: C.panel, border: `2px solid ${i === 2 ? C.green : C.line2}`, padding: '32px 30px'}}>
								<div style={{fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.green}}>{pl.g}</div>
								<div style={{fontFamily: SANS, fontWeight: 780, fontSize: 40, color: C.white, letterSpacing: '-0.02em', marginTop: 34, lineHeight: 1.1}}>{pl.t}</div>
							</div>
						);
					})}
					<Actor x={1640} y={900} scale={9} enter={B7[0] + 6} facing={-1} keys={[{at: B7[0] + 6, pose: POSES.idle}, {at: k('proyectos'), pose: {...POSES.point, look: -1}}, {at: k('tesis'), pose: POSES.cheer}]} />
				</AbsoluteFill>
			)}
			{[B2[0], B3[0], B4[0], B5[0], B6[0], B7[0]].map((t, i) => (
				<CutFlash key={i} at={t} len={4} max={0.6} />
			))}
			<GlitchBurst at={B7[0]} len={6} />
			<WipeBar at={b - 8} dur={12} />
		</AbsoluteFill>
	);
};

/* ================================================================== 08 · ¿por qué intentarlo? */

export const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.cierre;
	const k = (m: string) => M('s09', m);
	const mas = k('mas');
	const logica = k('logica');
	const empiezas = k('empiezas');
	const siempre = k('siempre');
	const retos = k('retos');
	const animate = k('animate');
	const kw = [
		{at: logica, t: 'lógica'},
		{at: k('algoritmos'), t: 'algoritmos'},
		{at: k('creatividad'), t: 'creatividad'},
		{at: k('equipo'), t: 'trabajo en equipo'},
	];
	const kwOut = tween(f, empiezas - 10, empiezas, 0, 1, inCubic);
	const lvOut = tween(f, siempre - 10, siempre, 0, 1, inCubic);
	const probOut = tween(f, retos - 10, retos, 0, 1, inCubic);
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	return (
		<AbsoluteFill>
			<GridBg opacity={0.45} size={90} />
			<ChapterTitle at={a + 6} n="08" label="¿por qué intentarlo?" title="Mucho más que el reloj" highlight={['más']} out={empiezas - 4} />
			{f < empiezas && (
				<AbsoluteFill style={{opacity: 1 - kwOut}}>
					{f >= mas && <div style={{position: 'absolute', left: 116, top: 300, fontFamily: MONO, fontSize: 30, color: C.dim, opacity: tween(f, mas, mas + 10)}}>{'resolver problemas contra el reloj  +'}</div>}
					{kw.map((w, i) => {
						if (f < w.at - 2) return null;
						const p = pop(f, w.at, 14, 220, 0.6);
						return (
							<div key={i} style={{position: 'absolute', left: 110 + (i % 2) * 640, top: 380 + Math.floor(i / 2) * 200 + (1 - p) * 30, opacity: Math.min(1, p * 1.5), fontFamily: SANS, fontWeight: 840, fontSize: 92, letterSpacing: '-0.045em', color: i === 3 ? C.green : C.white}}>
								{w.t}
							</div>
						);
					})}
				</AbsoluteFill>
			)}
			{f >= empiezas - 4 && f < siempre && (
				<AbsoluteFill style={{opacity: 1 - lvOut}}>
					<div style={{position: 'absolute', left: 110, top: 300, width: 1200}}>
						<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.white, letterSpacing: '-0.03em'}}>
							<span style={{opacity: pop(f, empiezas, 16, 200, 0.6)}}>apenas empiezas</span>
							<span style={{opacity: pop(f, k('experiencia'), 16, 200, 0.6), color: C.green}}>ya tienes experiencia</span>
						</div>
						<div style={{height: 14, background: 'rgba(255,255,255,0.12)', marginTop: 30, position: 'relative'}}>
							<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${tween(f, empiezas, k('experiencia') + 20) * 100}%`, background: `linear-gradient(90deg, ${C.white}, ${C.green})`}} />
						</div>
						<div style={{fontFamily: MONO, fontSize: 26, color: C.dim, marginTop: 24, opacity: tween(f, k('experiencia') + 10, k('experiencia') + 20)}}>{'// no importa: hay sitio para los dos'}</div>
					</div>
				</AbsoluteFill>
			)}
			{f >= siempre - 4 && f < retos && (
				<AbsoluteFill style={{opacity: 1 - probOut}}>
					<div style={{position: 'absolute', left: 110, top: 220}}>
						<Label size={22} color={C.green}>{'// siempre habrá un problema nuevo'}</Label>
					</div>
					{letters.map((L, i) => {
						const at = siempre + i * 5;
						if (f < at) return null;
						const p = pop(f, at, 14, 230, 0.5);
						const solved = f >= at + 40 && i < 10;
						const col = i % 9;
						const row = Math.floor(i / 9);
						return (
							<div key={i} style={{position: 'absolute', left: 110 + col * 150, top: 300 + row * 150 + (1 - p) * 20, width: 124, height: 124, opacity: Math.min(1, p * 1.5), background: solved ? C.green : C.panel, border: `2px solid ${solved ? C.green : C.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 56, color: solved ? '#001a0c' : C.white}}>
								{L}
							</div>
						);
					})}
				</AbsoluteFill>
			)}
			{f >= retos - 4 && (
				<AbsoluteFill>
					<div style={{position: 'absolute', left: 110, top: 220, fontFamily: MONO, fontSize: 40, color: C.white, lineHeight: 1.7}}>
						{[
							{at: retos - 40, t: 'te gusta programar'},
							{at: retos, t: 'disfrutas los retos'},
							{at: k('diferente'), t: 'quieres aprender algo diferente'},
						].map((l, i) =>
							f >= l.at ? (
								<div key={i}>
									<span style={{color: C.green}}>{'if '}</span>
									<span style={{color: C.dim}}>(</span>
									<Typer text={l.t} start={l.at} cps={70} cursor={false} />
									<span style={{color: C.dim}}>{')'}</span>
								</div>
							) : null,
						)}
					</div>
					{f >= animate - 2 && (
						<div style={{position: 'absolute', left: 110, top: 600, fontFamily: SANS, fontWeight: 860, fontSize: 120, letterSpacing: '-0.05em', color: C.green, transform: `scale(${0.9 + 0.1 * pop(f, animate, 12, 220, 0.6)})`, transformOrigin: 'left center'}}>
							¡anímate!
						</div>
					)}
				</AbsoluteFill>
			)}
			{f >= animate && <PixelBurst f={f} at={animate + 2} x={1600} y={560} count={30} power={22} />}
			<Spot x={1620} y={760} r={280} amt={0.15} />
			<Actor
				x={1620}
				y={880}
				scale={10}
				enter={a + 4}
				facing={-1}
				keys={[
					{at: a + 4, pose: POSES.idle},
					{at: logica, pose: POSES.think},
					{at: k('equipo'), pose: POSES.cheer},
					{at: empiezas, pose: POSES.shrug},
					{at: siempre, pose: {...POSES.point, look: -1}},
					{at: retos, pose: POSES.wave},
					{at: animate, pose: POSES.cheer},
				]}
				hops={[k('equipo') + 2, animate + 2]}
			/>
			<GlitchBurst at={a} len={5} />
		</AbsoluteFill>
	);
};

/* ================================================================== cierre: únete a GOSLINT */

export const Final: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = SC.final;
	const k = (m: string) => M('s10', m);
	const gusta = k('gusta');
	const unete = k('unete');
	const nos = k('nos');
	const logoAt = gusta - 30;
	const p = tween(f, logoAt, logoAt + 40, 0, 1, outExpo);
	const fadeOut = tween(f, b - 40, b - 4, 0, 1);
	const promptAt = V.s10.end + 70;
	return (
		<AbsoluteFill>
			<GridBg opacity={0.5} size={90} />
			<Shockwave at={logoAt + 4} x={560} y={430} size={2000} />
			<div style={{position: 'absolute', left: 260, top: 230, opacity: 1 - tween(f, promptAt - 10, promptAt)}}>
				<LogoMark height={400} p={p} glow={f > logoAt + 40 ? 16 + Math.sin(f / 6) * 6 : 0} />
			</div>
			<div style={{position: 'absolute', left: 760, top: 290, opacity: 1 - tween(f, promptAt - 10, promptAt)}}>
				{f >= gusta - 2 && (
					<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.text, letterSpacing: '-0.03em', opacity: pop(f, gusta, 16, 200, 0.6)}}>¿Te gusta programar?</div>
				)}
				{f >= unete - 2 && (
					<div style={{fontFamily: SANS, fontWeight: 870, fontSize: 118, color: C.white, letterSpacing: '-0.05em', marginTop: 10, lineHeight: 1}}>
						<RiseWords text="Únete a" start={unete} />
						<div style={{marginTop: 16, clipPath: `inset(0 ${(1 - tween(f, unete + 8, unete + 22, 0, 1, outExpo)) * 100}% 0 0)`}}>
							<Wordmark height={104} />
						</div>
					</div>
				)}
				{f >= nos - 2 && (
					<div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 40, opacity: tween(f, nos, nos + 10)}}>
						<Img src={staticFile('brand/uceva.png')} style={{height: 90}} />
						<span style={{fontFamily: MONO, fontSize: 22, color: C.dim, letterSpacing: '0.04em', lineHeight: 1.5}}>Semillero de Investigación<br />Ingeniería de Sistemas</span>
					</div>
				)}
			</div>
			{f >= nos && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 36, color: C.text, opacity: tween(f, nos, nos + 10) * (1 - tween(f, promptAt - 10, promptAt))}}>
					Nos vemos en el <span style={{color: C.green}}>próximo problema</span>.
				</div>
			)}
			<Actor x={1740} y={900} scale={8} enter={gusta - 10} facing={-1} keys={[{at: gusta, pose: POSES.cheer}, {at: nos, pose: POSES.wave}]} override={f >= nos && f < promptAt ? {...POSES.wave, armF: Math.floor(f / 5) % 2 ? 124 : 96} : null} leave={promptAt} />
			{f >= promptAt && (
				<div style={{position: 'absolute', left: 130, top: 500, fontFamily: MONO, fontSize: 44, color: C.white}}>
					<span style={{color: C.green}}>goslint@uceva</span>
					<span style={{color: C.dim}}>:~$ </span>
					<Typer text="./siguiente_problema" start={promptAt + 6} cps={22} />
				</div>
			)}
			<GlitchBurst at={promptAt - 4} len={6} />
			<CutFlash at={logoAt + 4} len={5} />
			<div style={{position: 'absolute', inset: 0, background: '#000', opacity: fadeOut}} />
		</AbsoluteFill>
	);
};
