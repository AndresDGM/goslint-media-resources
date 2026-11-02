import {VReelDef} from './frame';
import {QueEsReel} from './QueEs';
import {JuecesReel} from './Jueces';
import {ColombiaReel} from './Colombia';
import {UcevaReel} from './Uceva';
import {IcpcReel} from './Icpc';

/** Reels verticales registrados (Root.tsx crea una composición por cada uno). */
export const VREELS: VReelDef[] = [QueEsReel, JuecesReel, IcpcReel, ColombiaReel, UcevaReel];
