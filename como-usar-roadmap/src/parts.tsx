import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS} from '@commons/theme';
import {pop, tween} from '@commons/lib';
import {FASES, Fase, hitoDe, rango} from './fases';

/* Piezas propias de este video: el camino de 8 fases, la tarjeta de fase y la tarjeta de video. */

/**
 * Camino del roadmap: 8 nodos (fase 0 a 7) unidos por una línea que se dibuja en `at`.
 * `active` resalta una fase; `lit` las enciende en verde; `stars` muestra el hito (★) de cada fase.
 */
export const PhaseStrip: React.FC<{
	at: number;
	y: number;
	x0?: number;
	x1?: number;
	active?: number | null;
	lit?: number[];
	stars?: number;
	/** fotograma desde el que cada fase muestra su estrella (una cada 6 f) */
	short?: boolean;
	r?: number;
	out?: number;
}> = ({at, y, x0 = 170, x1 = 1750, active = null, lit = [], stars, short = false, r = 34, out}) => {
	const f = useCurrentFrame();
	if (f < at - 1) return null;
	if (out !== undefined && f >= out) return null;
	const o = out !== undefined ? 1 - tween(f, out - 10, out) : 1;
	const step = (x1 - x0) / 7;
	const draw = tween(f, at, at + 26);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: o}}>
			<div style={{position: 'absolute', left: x0, top: y - 3, width: (x1 - x0) * draw, height: 6, background: C.line2}} />
			{active !== null && active > 0 && <div style={{position: 'absolute', left: x0, top: y - 3, width: step * active * draw, height: 6, background: C.green, boxShadow: `0 0 18px ${C.green}`}} />}
			{FASES.map((fa, i) => {
				const p = pop(f, at + i * 3, 12, 230, 0.6);
				const on = active === i;
				const isLit = lit.includes(i) || (active !== null && i < active);
				const cx = x0 + i * step;
				const s = on ? 1.28 : 1;
				const hito = hitoDe(fa);
				const sp = stars !== undefined && hito ? pop(f, stars + i * 6, 10, 260, 0.5) : 0;
				return (
					<React.Fragment key={i}>
						<div
							style={{
								position: 'absolute', left: cx - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%',
								background: on ? C.green : isLit ? 'rgba(0,192,99,0.22)' : C.panel,
								border: `4px solid ${on || isLit ? C.green : C.line2}`,
								display: 'flex', alignItems: 'center', justifyContent: 'center',
								fontFamily: MONO, fontWeight: 800, fontSize: r * 0.9, color: on ? '#04140B' : C.white,
								transform: `scale(${p * s})`, opacity: Math.min(1, p * 2),
								boxShadow: on ? `0 0 34px ${C.green}` : 'none',
							}}
						>
							{i}
						</div>
						{!short && (
							<div style={{position: 'absolute', left: cx - (step - 14) / 2, width: step - 14, top: y + r + 14, textAlign: 'center', fontFamily: SANS, fontWeight: on ? 800 : 600, fontSize: on ? 22 : 19, lineHeight: 1.1, color: on ? C.white : C.dim, opacity: Math.min(1, p * 2)}}>
								{fa.name}
							</div>
						)}
						{sp > 0 && (
							<div style={{position: 'absolute', left: cx - 20, top: y - r - 58, width: 40, textAlign: 'center', fontSize: 40, color: C.amber, transform: `scale(${sp})`, textShadow: `0 0 16px ${C.amber}`}}>★</div>
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
};

/** Tarjeta de fase: número grande, nombre, subtítulo, rango de videos y lenguajes. */
export const PhaseCard: React.FC<{fa: Fase; w?: number; size?: number}> = ({fa, w = 760, size = 1}) => (
	<div style={{width: w, background: 'rgba(8,11,9,0.95)', borderLeft: `10px solid ${C.green}`, padding: `${26 * size}px ${32 * size}px`, boxShadow: '0 30px 90px rgba(0,0,0,0.55)'}}>
		<div style={{fontFamily: MONO, fontSize: 24 * size, letterSpacing: '0.14em', color: C.green, textTransform: 'uppercase'}}>{`// fase ${fa.n} · ${rango(fa)} · ${fa.videos.length} videos`}</div>
		<div style={{fontFamily: SANS, fontWeight: 860, fontSize: 72 * size, letterSpacing: '-0.045em', color: C.white, lineHeight: 1.02, marginTop: 10 * size}}>{fa.name}</div>
		<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 32 * size, color: C.dim, marginTop: 8 * size}}>{fa.sub}</div>
		{fa.langs && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26 * size, color: C.amber, marginTop: 14 * size}}>{fa.langs}</div>}
	</div>
);

/** Tarjeta de un video del temario (#NNN · título), con estrella si es hito. */
export const VideoTile: React.FC<{n: string; t: string; hito?: boolean; w?: number; size?: number; color?: string}> = ({n, t, hito, w = 520, size = 1, color}) => (
	<div style={{width: w, display: 'flex', alignItems: 'center', gap: 16 * size, background: C.panel, border: `3px solid ${hito ? C.amber : color ?? C.line2}`, padding: `${12 * size}px ${18 * size}px`}}>
		<span style={{fontFamily: MONO, fontWeight: 800, fontSize: 24 * size, color: hito ? C.amber : C.green}}>{`#${n}`}</span>
		<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 26 * size, color: C.white, lineHeight: 1.15, flex: 1}}>{t}</span>
		{hito && <span style={{fontSize: 30 * size, color: C.amber}}>★</span>}
	</div>
);
