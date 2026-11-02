import {VReelDef} from './frame';
import {QueEsReel} from './QueEs';
import {JuecesReel} from './Jueces';
import {ColombiaReel} from './Colombia';

/** Reels verticales registrados (Root.tsx crea una composición por cada uno). */
export const VREELS: VReelDef[] = [QueEsReel, JuecesReel, ColombiaReel];
