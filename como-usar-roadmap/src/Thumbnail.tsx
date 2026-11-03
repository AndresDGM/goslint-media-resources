import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {GridBg, Grain, LogoMark, Vignette} from '@commons/components';
import {BASE, Lint, POSES, Pose} from '@commons/mascot';
import {MASCOTAS, Mascota, MascotaId} from '@commons/mascotas';
import {FASES, GUIAS, rango} from './fases';

/** Miniatura del video (1920×1080; se exporta a 1280×720 con scripts/thumbnail.sh). */
export const Thumbnail: React.FC = () => {
	const pose: Pose = {...BASE, ...POSES.pointUp};
	const fila: MascotaId[] = ['vee', 'parserint', 'mocca', 'pypo', 'byte', 'polo', 'marco', 'ringo', 'velasco', 'daru', 'diego', 'globin'];
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.5} size={90} />
			<div style={{position: 'absolute', left: 90, top: 80, display: 'flex', alignItems: 'center', gap: 22}}>
				<LogoMark height={96} />
				<span style={{fontFamily: MONO, fontSize: 34, letterSpacing: '0.14em', color: C.green, textTransform: 'uppercase'}}>Bienvenida · 03</span>
			</div>
			<div style={{position: 'absolute', left: 90, top: 230, width: 1150, fontFamily: SANS, fontWeight: 880, fontSize: 150, lineHeight: 0.95, letterSpacing: '-0.05em', color: C.white, textShadow: '0 8px 40px rgba(0,0,0,0.8)'}}>
				¿Por dónde <span style={{color: C.green}}>empiezo?</span>
			</div>
			<div style={{position: 'absolute', left: 96, top: 560, fontFamily: MONO, fontWeight: 700, fontSize: 46, color: C.white, background: 'rgba(5,7,6,0.85)', border: `2px solid ${C.green}`, padding: '12px 26px'}}>
				99 videos · 8 fases · 1 roadmap
			</div>
			{/* camino de 8 fases */}
			<div style={{position: 'absolute', left: 120, top: 1004, width: 1100, height: 8, background: C.green, boxShadow: `0 0 20px ${C.green}`}} />
			{FASES.map((fa, i) => (
				<div key={fa.n} style={{position: 'absolute', left: 120 + i * (1100 / 7) - 34, top: 974, width: 68, height: 68, borderRadius: '50%', background: i === 0 ? C.green : C.panel, border: `5px solid ${C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 34, color: i === 0 ? C.bg : C.white}}>
					{i}
				</div>
			))}
			{/* las guías sobre el camino */}
			{fila.map((id, i) => (
				<Mascota key={id} id={id} pose="wave" x={170 + i * 94} y={930} scale={4.4} />
			))}
			<div style={{position: 'absolute', right: 80, top: 330, width: 760, height: 760, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,192,99,0.45), rgba(0,192,99,0))'}} />
			<Lint x={1530} y={1040} scale={22} pose={pose} facing={-1} />
			<Vignette strength={0.5} />
			<Grain opacity={0.06} />
		</AbsoluteFill>
	);
};

/** Portada vertical (1080×1920) del reel de cada fase. */
export const PORTADAS = [1, 2, 3, 4, 5, 6, 7].map((n) => ({id: `PortadaFase${n}`, n}));

export const Portada: React.FC<{n: number}> = ({n}) => {
	const fa = FASES[n];
	const guias = GUIAS[n].filter((g) => g !== 'lint') as MascotaId[];
	const sc = guias.length >= 4 ? 9 : guias.length >= 2 ? 12 : 15;
	const gap = 960 / guias.length;
	const pose: Pose = {...BASE, ...POSES.cheer};
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<GridBg opacity={0.5} size={80} />
			<div style={{position: 'absolute', left: 60, top: 260, display: 'flex', alignItems: 'center', gap: 20}}>
				<LogoMark height={84} />
				<span style={{fontFamily: MONO, fontSize: 32, letterSpacing: '0.14em', color: C.green, textTransform: 'uppercase'}}>{`goslint · roadmap · fase ${n}`}</span>
			</div>
			<div style={{position: 'absolute', left: 60, right: 60, top: 400, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 34}}>
				<div style={{fontFamily: SANS, fontWeight: 880, fontSize: 120, lineHeight: 0.98, letterSpacing: '-0.05em', color: C.white, textShadow: '0 8px 40px rgba(0,0,0,0.8)'}}>
					<span style={{color: C.green}}>{`Fase ${n}`}</span>
					<br />
					{fa.name}
				</div>
				<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 38, color: C.white, background: 'rgba(5,7,6,0.85)', border: `2px solid ${C.green}`, padding: '10px 22px'}}>{`${rango(fa)} · ${fa.videos.length} videos`}</div>
			</div>
			<div style={{position: 'absolute', left: 140, top: 1180, width: 800, height: 300, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,192,99,0.4), rgba(0,192,99,0))'}} />
			{guias.map((id, i) => (
				<React.Fragment key={id}>
					<Mascota id={id} pose="wave" x={60 + gap * (i + 0.5)} y={1380} scale={sc} />
					<div style={{position: 'absolute', left: 60 + gap * (i + 0.5) - 150, width: 300, top: 1400, textAlign: 'center', fontFamily: SANS, fontWeight: 860, fontSize: guias.length >= 4 ? 40 : 54, color: MASCOTAS[id].color}}>{MASCOTAS[id].name}</div>
				</React.Fragment>
			))}
			{GUIAS[n].includes('lint') && <Lint x={540} y={1700} scale={8} pose={pose} />}
			<Vignette strength={0.45} />
			<Grain opacity={0.06} />
		</AbsoluteFill>
	);
};
