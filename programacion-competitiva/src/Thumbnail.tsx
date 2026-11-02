import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {GridBg, Grain, LogoMark, Verdict, Vignette} from '@commons/components';
import {BASE, Lint, POSES, Pose} from '@commons/mascot';

/** Miniatura del video (1920×1080; se exporta a 1280×720 con scripts/thumbnail.sh). */
export const Thumbnail: React.FC = () => {
	const pose: Pose = {...BASE, ...POSES.cheer};
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{opacity: 0.35}}>
				<Img src={staticFile('photos/blur/2025-regional-icpc-equipo-computador.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			<GridBg opacity={0.5} size={90} />
			<div style={{position: 'absolute', right: 120, top: 330, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,192,99,0.45), rgba(0,192,99,0))'}} />
			<Lint x={1440} y={1000} scale={22} pose={pose} facing={-1} />
			<div style={{position: 'absolute', left: 1080, top: 150, transform: 'rotate(-8deg)'}}><Verdict kind="WA" size={58} /></div>
			<div style={{position: 'absolute', left: 1620, top: 210, transform: 'rotate(7deg)'}}><Verdict kind="TLE" size={58} /></div>
			<div style={{position: 'absolute', left: 1700, top: 520, transform: 'rotate(-5deg)'}}><Verdict kind="AC" size={80} /></div>
			<div style={{position: 'absolute', left: 90, top: 80, display: 'flex', alignItems: 'center', gap: 22}}>
				<LogoMark height={96} />
				<span style={{fontFamily: MONO, fontSize: 34, letterSpacing: '0.14em', color: C.green, textTransform: 'uppercase'}}>Bienvenida · 02</span>
			</div>
			<div style={{position: 'absolute', left: 90, top: 260, width: 1050, fontFamily: SANS, fontWeight: 880, fontSize: 150, lineHeight: 0.95, letterSpacing: '-0.05em', color: C.white, textShadow: '0 8px 40px rgba(0,0,0,0.8)'}}>
				¿Qué es la programación <span style={{color: C.green}}>competitiva?</span>
			</div>
			<div style={{position: 'absolute', left: 96, top: 860, fontFamily: MONO, fontWeight: 700, fontSize: 46, color: C.white, background: 'rgba(5,7,6,0.85)', border: `2px solid ${C.green}`, padding: '12px 26px'}}>
				<span style={{color: C.red}}>● </span>05:00:00 · 3 personas · 1 computador
			</div>
			<Vignette strength={0.5} />
			<Grain opacity={0.06} />
		</AbsoluteFill>
	);
};
