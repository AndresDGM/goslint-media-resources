import React from 'react';
import {Img, staticFile} from 'remotion';
import {BASE, Lint, POSES, Pose, alive} from './mascot';
import {C, H, MONO, W} from './theme';
import {Etiqueta} from './etiqueta';
import {FASES, LAMINAS, META, SERIES, TOTAL_FASES, TOTAL_VIDEOS, Lamina, PoseSpec, Video} from './data';

const PAD = 70;
const NODE_X = 100; // eje de la línea de tiempo
const CARD_X = 157;
const CARD_W = W - PAD - CARD_X;

const pad3 = (n: number) => String(n).padStart(3, '0');
const pad2 = (n: number) => String(n).padStart(2, '0');

const poseOf = (s: PoseSpec): Pose => alive({...BASE, ...((POSES as Record<string, Partial<Pose>>)[s.base] ?? {}), ...(s.extra as Partial<Pose>)}, 0);

/* ------------------------------------------------------------------ piezas */

const Header: React.FC<{n: number; total: number}> = ({n, total}) => (
	<>
		<Img src={staticFile('brand/word_white.png')} style={{position: 'absolute', left: PAD, top: 60, height: 36}} />
		<div style={{position: 'absolute', right: PAD, top: 66, fontFamily: MONO, fontSize: 21, letterSpacing: 4, color: C.dim, whiteSpace: 'nowrap'}}>
			ROADMAP DEL CANAL · <span style={{color: C.green, fontWeight: 700}}>{pad2(n)}</span>/{pad2(total)}
		</div>
		<div style={{position: 'absolute', left: PAD, right: PAD, top: 124, height: 2, background: C.line}} />
	</>
);

const Footer: React.FC = () => (
	<div style={{position: 'absolute', left: PAD, right: PAD, top: 1272, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 20, color: C.dim}}>
		<span>
			<span style={{color: C.green}}>GOSLINT</span> · Semillero de Investigación · UCEVA
		</span>
		<span>
			{TOTAL_VIDEOS} videos · {TOTAL_FASES} fases
		</span>
	</div>
);

const Sigue: React.FC<{text: string; top: number}> = ({text, top}) => {
	const flecha = text.match(/[→↓]$/)?.[0];
	const t = text.replace(/\s*[→↓]$/, '');
	return (
		<div style={{position: 'absolute', left: 124, top, background: C.green, height: 43, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 14}}>
			<Etiqueta text={t} u={2} bold tracking={1.4} color="#041208" />
			{flecha && <span style={{fontFamily: MONO, fontSize: 22, fontWeight: 500, color: '#041208'}}>{flecha}</span>}
		</div>
	);
};

/** Línea de tiempo vertical con un nodo por tarjeta. */
const Timeline: React.FC<{top: number; pitch: number; h: number; count: number; lastFilled: boolean; extTop?: number; extBottom?: number}> = ({top, pitch, h, count, lastFilled, extTop = 15, extBottom = 0}) => {
	const first = top + h / 2;
	const last = top + (count - 1) * pitch + h / 2;
	return (
		<>
			<div style={{position: 'absolute', left: NODE_X - 7, top: first - extTop, width: 14, height: last - first + extTop + extBottom, background: C.track}} />
			<div style={{position: 'absolute', left: NODE_X - 1.5, top: first - extTop, width: 3, height: last - first + extTop + extBottom, background: C.green}} />
			{Array.from({length: count}, (_, i) => {
				const cy = top + i * pitch + h / 2;
				const filled = lastFilled && i === count - 1;
				return (
					<React.Fragment key={i}>
						<div style={{position: 'absolute', left: NODE_X, top: cy - 1.5, width: CARD_X - NODE_X, height: 3, background: C.green}} />
						<div style={{position: 'absolute', left: NODE_X - 11, top: cy - 11, width: 22, height: 22, boxSizing: 'border-box', border: `3px solid ${C.green}`, background: filled ? C.green : C.bg}} />
					</React.Fragment>
				);
			})}
		</>
	);
};

const Card: React.FC<{video: Video; top: number; h: number}> = ({video, top, h}) => {
	const border = video.hito ? `2px solid ${C.green}` : video.listo ? `2px dashed ${C.faint}` : `1.5px solid ${C.line2}`;
	return (
		<div style={{position: 'absolute', left: CARD_X, top, width: CARD_W, height: h, boxSizing: 'border-box', background: video.hito ? C.hito : C.panel, border, display: 'flex', alignItems: 'center', padding: '0 26px'}}>
			<span style={{fontFamily: MONO, fontWeight: 700, fontSize: 25, color: C.green, width: 100}}>#{pad3(video.n)}</span>
			<span style={{fontFamily: MONO, fontWeight: 700, fontSize: h < 85 ? 30 : 32, color: C.white, whiteSpace: 'nowrap', flex: 1}}>{video.t}</span>
			{video.hito && (
				<span style={{display: 'flex', alignItems: 'center', gap: 14}}>
					<span style={{fontFamily: MONO, fontSize: 22, color: C.white}}>★</span>
					<Etiqueta text="HITO" u={2} bold tracking={1.6} />
				</span>
			)}
			{video.listo && (
				<span style={{display: 'flex', alignItems: 'center', gap: 14}}>
					<span style={{fontFamily: MONO, fontSize: 20, color: C.dim}}>✓</span>
					<Etiqueta text="LISTO" u={2} tracking={2} color={C.dim} />
				</span>
			)}
		</div>
	);
};

const Tags: React.FC<{tags: {t: string; verde?: boolean}[]; top: number}> = ({tags, top}) => (
	<div style={{position: 'absolute', left: PAD, top, display: 'flex', gap: 14}}>
		{tags.map((g) => (
			<div key={g.t} style={{border: `2px solid ${g.verde ? C.green : C.white}`, color: g.verde ? C.green : C.white, fontFamily: MONO, fontWeight: 500, fontSize: 23, padding: '4px 14px', whiteSpace: 'nowrap'}}>
				{g.t}
			</div>
		))}
	</div>
);

/* ------------------------------------------------------------------ láminas */

const Portada: React.FC<{n: number; total: number; l: Extract<Lamina, {tipo: 'portada'}>}> = ({n, total, l}) => {
	const top = 535;
	const pitch = 86;
	const h = 78;
	return (
		<>
			<Header n={n} total={total} />
			<Etiqueta text="ROADMAP" u={8.5} bold tracking={4.2} style={{position: 'absolute', left: PAD, top: 194 - 17}} />
			<div style={{position: 'absolute', left: PAD, top: 288 - 17, display: 'flex', gap: 8.5 * 9}}>
				<Etiqueta text="DEL" u={8.5} bold tracking={4.2} />
				<Etiqueta text="CANAL" u={8.5} bold tracking={4.2} color={C.green} />
			</div>
			<div style={{position: 'absolute', left: PAD, top: 392, fontFamily: MONO, fontSize: 28, lineHeight: 1.45, color: C.text, width: 420}}>De la lógica desde cero hasta la maratón</div>
			{/* globo de Lint */}
			<div style={{position: 'absolute', left: 560, top: 404, background: C.white, padding: '16px 22px 14px', width: 220, boxSizing: 'border-box'}}>
				<Etiqueta text="¡Arranca por" u={2} tracking={2.9} color="#0A0F0C" style={{height: 26}} />
				<Etiqueta text="la fase 0!" u={2} tracking={2.9} color="#0A0F0C" style={{height: 26}} />
				<div style={{position: 'absolute', right: -16, top: 18, width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: `16px solid ${C.white}`}} />
			</div>
			<Lint x={923} y={500} scale={7.5} pose={poseOf(l.pose)} />
			<Timeline top={top} pitch={pitch} h={h} count={FASES.length} lastFilled={false} extTop={50} extBottom={50} />
			{FASES.map((f, i) => (
				<div key={f.id} style={{position: 'absolute', left: CARD_X, top: top + i * pitch, width: CARD_W, height: h, boxSizing: 'border-box', background: C.panel, border: `1.5px solid ${C.line2}`, display: 'flex', alignItems: 'center', padding: '0 26px'}}>
					<div style={{width: 76, marginTop: -4}}>
						<Etiqueta text={`F${f.id}`} u={2} bold tracking={1} color={C.green} />
					</div>
					<div style={{flex: 1, marginTop: -6}}>
						<Etiqueta text={f.nombre} u={f.nombre.length > 20 ? 2.6 : 3} bold tracking={2.1} />
					</div>
					<span style={{fontFamily: MONO, fontSize: 21, color: C.dim, whiteSpace: 'nowrap'}}>
						<span style={{color: C.white, fontWeight: 500}}>{f.videos.length}</span> videos · #{pad3(f.videos[0].n)}
					</span>
				</div>
			))}
			<Footer />
		</>
	);
};

const FaseLamina: React.FC<{n: number; total: number; l: Extract<Lamina, {tipo: 'fase'}>}> = ({n, total, l}) => {
	const fase = FASES[l.fase];
	const items = fase.videos.filter((x) => x.n >= l.desde && x.n <= l.hasta);
	const dosRenglones = fase.titulo.length > 1;
	const listTop = dosRenglones ? 475 : 452;
	const pitch = l.pitch ?? Math.min(110, Math.floor(735 / items.length));
	const h = pitch - 16;
	const listEnd = listTop + (items.length - 1) * pitch + h;
	const maxCh = Math.max(...fase.titulo.map((t) => t.length));
	const u = Math.min(5.5, 660 / (9.3 * maxCh));
	const kicker = `FASE ${fase.id}${l.parte ? ` · PARTE ${l.parte[0]} DE ${l.parte[1]}` : ''}`;
	return (
		<>
			<Header n={n} total={total} />
			<Etiqueta text={kicker} u={2.5} tracking={3.9} color={C.green} style={{position: 'absolute', left: PAD, top: 174.5}} />
			<div style={{position: 'absolute', left: PAD, top: 219.5}}>
				{fase.titulo.map((t, i) => (
					<Etiqueta key={i} text={t} u={u} bold tracking={3.3} style={{marginBottom: i < fase.titulo.length - 1 ? 63 - 9 * u : 0}} />
				))}
			</div>
			<div style={{position: 'absolute', left: PAD, top: dosRenglones ? 353 : 280, fontFamily: MONO, fontSize: 25, color: C.dim}}>{fase.sub}</div>
			{fase.tags.length > 0 && <Tags tags={fase.tags} top={dosRenglones ? 396 : 323} />}
			<Lint x={923} y={439} scale={7.5} pose={poseOf(l.pose)} />
			<Timeline top={listTop} pitch={pitch} h={h} count={items.length} lastFilled={!!items[items.length - 1].hito} extBottom={l.sigue ? listEnd + 28 - (listTop + (items.length - 1) * pitch + h / 2) : 0} />
			{items.map((x, i) => (
				<Card key={x.n} video={x} top={listTop + i * pitch} h={h} />
			))}
			{l.sigue && <Sigue text={l.sigue} top={listEnd + 28} />}
			{l.meta && (
				<div style={{position: 'absolute', left: PAD, right: PAD, top: 832, height: 330, boxSizing: 'border-box', border: `2px solid ${C.green}`, background: '#0A120D'}}>
					<Etiqueta text={META.etiqueta} u={2.5} tracking={3.9} color={C.green} style={{position: 'absolute', left: 56, top: 40}} />
					<Etiqueta text={META.titulo} u={5.5} bold tracking={2.2} style={{position: 'absolute', left: 56, top: 80}} />
					<div style={{position: 'absolute', left: 56, top: 170, width: 520, fontFamily: MONO, fontSize: 24, lineHeight: 1.45, color: C.dim}}>{META.texto}</div>
					<Lint x={822} y={300} scale={7.8} pose={poseOf({base: 'cheer'})} />
				</div>
			)}
			<Footer />
		</>
	);
};

const Series: React.FC<{n: number; total: number; l: Extract<Lamina, {tipo: 'series'}>}> = ({n, total, l}) => (
	<>
		<Header n={n} total={total} />
		<Etiqueta text="EN PARALELO" u={2.5} tracking={3.9} color={C.green} style={{position: 'absolute', left: PAD, top: 174.5}} />
		<Etiqueta text="SERIES CORTAS" u={5.5} bold tracking={2} style={{position: 'absolute', left: PAD, top: 219.5}} />
		<div style={{position: 'absolute', left: PAD, top: 300, fontFamily: MONO, fontSize: 25, color: C.dim}}>Salen entre los videos principales, sin orden fijo</div>
		<Lint x={923} y={410} scale={7.5} pose={poseOf(l.pose)} />
		{SERIES.map((s, i) => (
			<div key={s.t} style={{position: 'absolute', left: PAD, right: PAD, top: 452 + i * 172, height: 148, boxSizing: 'border-box', border: `2px dashed ${C.faint}`, padding: '28px 34px'}}>
				<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.white}}>
					<span style={{color: C.green, marginRight: 18}}>&gt;_</span>
					{s.t}
				</div>
				<div style={{marginTop: 10, fontFamily: MONO, fontSize: 23, lineHeight: 1.35, color: C.dim}}>{s.d}</div>
			</div>
		))}
		<Footer />
	</>
);

/** Una lámina del carrusel (índice 0-based dentro de LAMINAS). */
export const Slide: React.FC<{index: number}> = ({index}) => {
	const l = LAMINAS[index];
	const n = index + 1;
	const total = LAMINAS.length;
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				width: W,
				height: H,
				background: C.bg,
				backgroundImage: 'radial-gradient(rgba(255,255,255,0.075) 1.3px, transparent 1.7px)',
				backgroundSize: '27px 27px',
				backgroundPosition: '13px 13px',
				overflow: 'hidden',
			}}
		>
			{l.tipo === 'portada' && <Portada n={n} total={total} l={l} />}
			{l.tipo === 'fase' && <FaseLamina n={n} total={total} l={l} />}
			{l.tipo === 'series' && <Series n={n} total={total} l={l} />}
		</div>
	);
};
