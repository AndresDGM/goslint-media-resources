import {VReelDef} from './frame';
import {Fase1Reel} from './Fase1';
import {Fase2Reel} from './Fase2';
import {Fase3Reel} from './Fase3';
import {Fase4Reel} from './Fase4';
import {Fase5Reel} from './Fase5';
import {Fase6Reel} from './Fase6';
import {Fase7Reel} from './Fase7';

/** Reels verticales (uno por fase). Root.tsx crea una composición por cada uno. */
export const VREELS: VReelDef[] = [Fase1Reel, Fase2Reel, Fase3Reel, Fase4Reel, Fase5Reel, Fase6Reel, Fase7Reel];
