import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO} from './theme';
import {BASE, Lint, POSES, Pose, chop, walk} from './mascot';
import {PixelText} from './pixel';

/** Hoja de modelo de Lint: todas las poses con la misma silueta, paleta y proporciones (QA de consistencia). */
export const Sheet: React.FC = () => {
	const f = useCurrentFrame();
	const named = Object.entries(POSES) as [string, Partial<Pose>][];
	const chops = [-30, -24, -18, -10, -3, -2, -1, 0, 4, 14];
	const cell = (i: number, n: number) => 110 + i * ((1920 - 220) / (n - 1));
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{named.map(([name, p], i) => (
				<React.Fragment key={name}>
					<Lint x={cell(i, named.length)} y={300} scale={5} pose={{...BASE, ...p}} facing={i % 4 === 3 ? -1 : 1} />
					<div style={{position: 'absolute', left: cell(i, named.length) - 60, width: 120, top: 312, textAlign: 'center', fontFamily: MONO, fontSize: 18, color: C.dim}}>{name}</div>
				</React.Fragment>
			))}
			{chops.map((t, i) => (
				<React.Fragment key={t}>
					<Lint x={cell(i, chops.length)} y={640} scale={6} pose={{...BASE, ...(chop(100 + t, 100) ?? {})}} light={t >= 0 && t < 5 ? {dx: 1, dy: 1, color: '#FFFFFF', amt: 0.9} : {dx: 1, dy: -1, color: C.green, amt: 0.5}} />
					<div style={{position: 'absolute', left: cell(i, chops.length) - 60, width: 120, top: 700, textAlign: 'center', fontFamily: MONO, fontSize: 18, color: C.dim}}>chop {t}</div>
				</React.Fragment>
			))}
			{[0, 1, 2, 3].map((k) => (
				<Lint key={k} x={140 + k * 200} y={980} scale={6} pose={{...BASE, ...walk(k * 4, k > 1)}} facing={k > 1 ? -1 : 1} />
			))}
			<Lint x={1300} y={1040} scale={8} pose={{...BASE, ...POSES.wave}} light={{dx: -1, dy: -1, color: C.green, amt: 0.7}} />
			<Lint x={1640} y={1040} scale={8} pose={{...BASE, ...chop(f, 0)!}} />
			<div style={{position: 'absolute', left: 840, top: 860}}>
				<PixelText text="¡ZAS! 0123456789" scale={3} bold shadow="#00864A" />
				<div style={{height: 12}} />
				<PixelText text="LINT - GOSLINT" scale={3} color={C.green} />
			</div>
			<div style={{position: 'absolute', left: 96, top: 60, fontFamily: MONO, fontSize: 24, letterSpacing: '0.14em', color: C.green}}>{'// LINT · HOJA DE MODELO · poses, machetazo y ciclo de caminar'}</div>
		</AbsoluteFill>
	);
};
