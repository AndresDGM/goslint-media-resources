import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Lint, POSES, BASE, Pose, alive} from './mascot';
import {Backdrop, Cruz, Globito, Globo, Header, LineaWhile, Marcador, Mark, Terminals, TitleBlock, VeredictosFila} from './parts';
import {C, MONO} from './theme';

const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, ...extra});

const wave: Pose = alive({...BASE, ...(POSES.wave as Partial<Pose>)}, 0);

/* ------------------------------------------------------------------ v1: reconstrucción del banner original */

export const BannerV1: React.FC = () => (
	<AbsoluteFill style={{background: C.bg}}>
		<Backdrop cx={853} cy={562} />
		<Header />
		<Terminals />

		{/* globos y destellos */}
		<Globo x={120} yTop={430} w={17} h={21} color="#E5384F" shade="#B02438" string={170} />
		<Globo x={237} yTop={485} w={17} h={20} color="#E89B2D" shade="#B8701A" string={175} />
		<Globo x={338} yTop={413} w={14} h={18} color="#3A74D6" shade="#2750A0" string={160} />
		<Cruz x={195} y={429} color={C.white} />
		<Cruz x={449} y={593} color={C.green} />
		<Cruz x={71} y={663} color={C.green} />
		<Cruz x={329} y={655} color={C.green} />

		{/* Lint saluda */}
		<Globito x={479} y={415} w={245} text="¡Hola, mundo!" tail={70} />
		<Lint x={578} y={692} scale={7} pose={wave} light={{dx: 1, dy: 0, color: C.green, amt: 0.35}} />

		{/* marca */}
		<Mark x={745} y={436} h={252} />
		<TitleBlock x={1017} y={427} wordH={70} />

		<Marcador x={1680} y={430} />
		<LineaWhile cy={818} />
		<VeredictosFila cy={1031} />
	</AbsoluteFill>
);

/* ------------------------------------------------------------------ v2: con todas las mascotas */

type M = {id: string; w: number; h: number; nombre: string; tag: string};

/** Orden del roadmap: Lint, Fase 1, 2, 3, 4, 5, 6, 7 y el resto. w×h = tamaño del sprite 1× (px). */
const MASCOTAS: M[] = [
	{id: 'lint', w: 21, h: 33, nombre: 'Lint', tag: 'MASCOTA'},
	{id: 'vee', w: 17, h: 31, nombre: 'Vee', tag: 'FASE 1'},
	{id: 'polo', w: 29, h: 33, nombre: 'Polo', tag: 'FASE 2'},
	{id: 'parserint', w: 18, h: 36, nombre: 'ParserInt', tag: 'FASE 2'},
	{id: 'velasco', w: 14, h: 31, nombre: 'Velasco', tag: 'FASE 3'},
	{id: 'ringo', w: 43, h: 31, nombre: 'Ringo', tag: 'FASE 4'},
	{id: 'marco', w: 26, h: 45, nombre: 'Marco', tag: 'FASE 4'},
	{id: 'byte', w: 29, h: 34, nombre: 'Byte', tag: 'FASE 5'},
	{id: 'pypo', w: 22, h: 32, nombre: 'Pypo', tag: 'FASE 5'},
	{id: 'mocca', w: 24, h: 34, nombre: 'Mocca', tag: 'FASE 6'},
	{id: 'diego', w: 21, h: 31, nombre: 'Diego', tag: 'FASE 7'},
	{id: 'globin', w: 14, h: 30, nombre: 'Globín', tag: 'MARATONES'},
	{id: 'daru', w: 21, h: 32, nombre: 'DaRu', tag: 'HACKER'},
];

const FilaMascotas: React.FC<{baseline: number; scale: number; x0: number; x1: number}> = ({baseline, scale, x0, x1}) => {
	const total = MASCOTAS.reduce((a, m) => a + m.w * scale, 0);
	const gap = (x1 - x0 - total) / (MASCOTAS.length - 1);
	let x = x0;
	return (
		<>
			<div style={abs(x0, baseline, {width: x1 - x0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(0,192,99,0.55) 12%, rgba(0,192,99,0.55) 88%, transparent)'})} />
			<div style={abs(x0, baseline, {width: x1 - x0, height: 60, background: 'linear-gradient(rgba(0,192,99,0.10), transparent)'})} />
			{MASCOTAS.map((m) => {
				const left = x;
				x += m.w * scale + gap;
				const cx = left + (m.w * scale) / 2;
				return (
					<React.Fragment key={m.id}>
						<Img src={staticFile(`mascotas/${m.id}.png`)} style={abs(left, baseline - m.h * scale, {width: m.w * scale, height: m.h * scale, imageRendering: 'pixelated'})} />
						<div style={abs(cx - 90, baseline + 14, {width: 180, textAlign: 'center', fontFamily: MONO, fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', color: C.white})}>{m.nombre}</div>
						<div style={abs(cx - 90, baseline + 38, {width: 180, textAlign: 'center', fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.12em', color: C.green})}>{m.tag}</div>
					</React.Fragment>
				);
			})}
		</>
	);
};

export const BannerV2: React.FC = () => {
	const markH = 250;
	const markW = markH * (1553 / 1796);
	const blockW = markW + 56 + 490;
	const left = (2000 - blockW) / 2;
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<Backdrop cx={left + markW / 2} cy={460} r={190} />
			<Header />
			<Terminals />

			{/* globos de fiesta a la izquierda */}
			<Globo x={150} yTop={330} w={17} h={21} color="#E5384F" shade="#B02438" string={150} />
			<Globo x={267} yTop={385} w={17} h={20} color="#E89B2D" shade="#B8701A" string={150} />
			<Globo x={368} yTop={313} w={14} h={18} color="#3A74D6" shade="#2750A0" string={140} />
			<Cruz x={215} y={352} color={C.white} />
			<Cruz x={478} y={500} color={C.green} />
			<Cruz x={101} y={560} color={C.green} />

			<Mark x={left} y={335} h={markH} />
			<TitleBlock x={left + markW + 56} y={330} wordH={70} />
			<Marcador x={1680} y={330} />

			<LineaWhile cy={668} />

			<Globito x={97} y={762} w={245} text="¡Hola, mundo!" tail={40} />
			<FilaMascotas baseline={990} scale={5} x0={94} x1={1906} />
			<VeredictosFila cy={1092} size={22} />
		</AbsoluteFill>
	);
};
