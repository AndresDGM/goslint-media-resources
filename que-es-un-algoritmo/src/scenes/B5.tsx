import React from 'react';
import {useCurrentFrame} from 'remotion';
import {at} from '../timeline';
import {B5a, sfxB5a} from './B5a';
import {B5b, sfxB5b} from './B5b';

/** Bloque 5 en dos mitades: B5a hasta que Vee dice «Pero retrocedamos» (V43) y B5b desde ahí. */
export const B5_CUT = at('V43') - 6;
export const B5: React.FC = () => (useCurrentFrame() < B5_CUT ? <B5a /> : <B5b />);
export const sfxB5 = [...sfxB5a, ...sfxB5b];
