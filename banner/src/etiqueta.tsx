import React from 'react';
import {Buf, G, PixelSprite} from './pixel';

/**
 * Texto en la fuente de píxeles 5×7 de Goslint (la misma de los videos) con tracking libre y tildes.
 * `u` = píxeles de pantalla por píxel lógico; `tracking` = espacio extra entre letras en píxeles lógicos.
 */

const EXTRA: Record<string, string> = {
	'·': '.....|.....|.....|..#..|.....|.....|.....',
	'’': '..#..|..#..|.#...|.....|.....|.....|.....',
};

const ACENTOS: Record<string, [string, 'agudo' | 'tilde']> = {
	Á: ['A', 'agudo'], É: ['E', 'agudo'], Í: ['I', 'agudo'], Ó: ['O', 'agudo'], Ú: ['U', 'agudo'], Ñ: ['N', 'tilde'],
};

const glifo = (ch: string, bold: boolean): Buf => {
	const base = ACENTOS[ch]?.[0] ?? ch;
	const rows = (G[base] ?? EXTRA[base] ?? G['?']).split('|');
	const w = bold ? 6 : 5;
	const b = new Buf(w, 9);
	for (let j = 0; j < 7; j++)
		for (let i = 0; i < 5; i++)
			if (rows[j][i] === '#') {
				b.set(i, j + 2, '#FFFFFF');
				if (bold) b.set(i + 1, j + 2, '#FFFFFF');
			}
	const a = ACENTOS[ch]?.[1];
	if (a === 'agudo') {
		b.set(3, 0, '#FFFFFF');
		b.set(2, 1, '#FFFFFF');
		if (bold) {
			b.set(4, 0, '#FFFFFF');
			b.set(3, 1, '#FFFFFF');
		}
	}
	if (a === 'tilde') {
		[[1, 1], [2, 0], [3, 1]].forEach(([x, y]) => b.set(x, y, '#FFFFFF'));
	}
	return b;
};

export const Etiqueta: React.FC<{
	text: string;
	u: number;
	color?: string;
	bold?: boolean;
	tracking?: number;
	style?: React.CSSProperties;
}> = ({text, u, color = '#FFFFFF', bold = false, tracking = 1, style}) => {
	const chars = [...text.toUpperCase()];
	return (
		<div style={{display: 'flex', alignItems: 'flex-start', gap: tracking * u, height: 9 * u, ...style}}>
			{chars.map((ch, i) => {
				const b = glifo(ch, bold);
				b.d = b.d.map((c) => (c ? color : c));
				return ch === ' ' ? <div key={i} style={{width: (bold ? 6 : 5) * u}} /> : <PixelSprite key={i} buf={b} scale={u} />;
			})}
		</div>
	);
};

/** Varios renglones apilados (alto de renglón = `pitch` px de pantalla). */
export const Etiquetas: React.FC<{lines: React.ReactNode[]; pitch: number; style?: React.CSSProperties}> = ({lines, pitch, style}) => (
	<div style={{display: 'flex', flexDirection: 'column', gap: 0, ...style}}>
		{lines.map((l, i) => (
			<div key={i} style={{height: pitch}}>
				{l}
			</div>
		))}
	</div>
);
