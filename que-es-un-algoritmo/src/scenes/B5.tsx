import React from 'react';
import {useCurrentFrame} from 'remotion';
import {t} from '../timeline';
import {B5a, sfxB5a} from './B5a';
import {B5b, sfxB5b} from './B5b';

/** Bloque 5: 3:35–4:41 (B5a: escenas 5.1–5.4) y 4:41–5:45 (B5b: escenas 5.5–5.7). */
export const B5: React.FC = () => (useCurrentFrame() < t('4:41') ? <B5a /> : <B5b />);
export const sfxB5 = [...sfxB5a, ...sfxB5b];
