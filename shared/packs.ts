import { LevelPack } from './level';
import { LEVEL_1 } from './levels/level1';
import { LEVEL_2 } from './levels/level2';
import { LEVEL_3 } from './levels/level3';
import { LEVEL_4 } from './levels/level4';
import { LEVEL_5 } from './levels/level5';
import { LEVEL_6 } from './levels/level6';
import { LEVEL_7 } from './levels/level7';
import { LEVEL_8 } from './levels/level8';
import { LEVEL_9 } from './levels/level9';
import { LEVEL_10 } from './levels/level10';
import { LEVEL_11 } from './levels/level11';
import { LEVEL_12 } from './levels/level12';
import { LEVEL_13 } from './levels/level13';
import { LEVEL_14 } from './levels/level14';
import { LEVEL_15 } from './levels/level15';
import { LEVEL_16 } from './levels/level16';
import { LEVEL_17 } from './levels/level17';
import { LEVEL_18 } from './levels/level18';
import { LEVEL_19 } from './levels/level19';
import { LEVEL_20 } from './levels/level20';
import { LEVEL_21 } from './levels/level21';
import { LEVEL_22 } from './levels/level22';
import { LEVEL_23 } from './levels/level23';
import { LEVEL_24 } from './levels/level24';
import { LEVEL_25 } from './levels/level25';
import { LEVEL_26 } from './levels/level26';
import { LEVEL_27 } from './levels/level27';
import { LEVEL_28 } from './levels/level28';
import { LEVEL_29 } from './levels/level29';
import { LEVEL_30 } from './levels/level30';
import { LEVEL_31 } from './levels/level31';
import { LEVEL_32 } from './levels/level32';
import { LEVEL_33 } from './levels/level33';
import { LEVEL_34 } from './levels/level34';
import { LEVEL_35 } from './levels/level35';
import { LEVEL_36 } from './levels/level36';
import { LEVEL_37 } from './levels/level37';
import { LEVEL_38 } from './levels/level38';
import { LEVEL_39 } from './levels/level39';
import { LEVEL_40 } from './levels/level40';
import { LEVEL_41 } from './levels/level41';
import { LEVEL_42 } from './levels/level42';
import { LEVEL_43 } from './levels/level43';
import { LEVEL_44 } from './levels/level44';
import { LEVEL_45 } from './levels/level45';

export const PACK_ONE_PLUS: LevelPack = {
  id: 'one_plus_trials',
  name: '1+ Wobble Trials',
  minPlayers: 1,
  levels: [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5],
};

export const PACK_ONE_PLUS_GADGETS: LevelPack = {
  id: 'one_plus_gadgets',
  name: '1+ Gadget Grove',
  minPlayers: 1,
  levels: [LEVEL_16, LEVEL_17, LEVEL_18, LEVEL_19, LEVEL_20],
};

export const PACK_ONE_PLUS_MASTER: LevelPack = {
  id: 'one_plus_master',
  name: '1+ Solo Mastery',
  minPlayers: 1,
  levels: [LEVEL_21, LEVEL_22, LEVEL_23, LEVEL_24, LEVEL_25],
};

export const PACK_TWO_PLUS: LevelPack = {
  id: 'two_plus_teamwork',
  name: '2+ Teamwork',
  minPlayers: 2,
  levels: [LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10],
};

export const PACK_TWO_PLUS_HAZARDS: LevelPack = {
  id: 'two_plus_hazards',
  name: '2+ Hazard Duet',
  minPlayers: 2,
  levels: [LEVEL_26, LEVEL_27, LEVEL_28, LEVEL_29, LEVEL_30],
};

export const PACK_TWO_PLUS_MASTER: LevelPack = {
  id: 'two_plus_master',
  name: '2+ Duo Mastery',
  minPlayers: 2,
  levels: [LEVEL_31, LEVEL_32, LEVEL_33, LEVEL_34, LEVEL_35],
};

export const PACK_FOUR_PLUS: LevelPack = {
  id: 'four_plus_crew',
  name: '4+ Crew Trials',
  minPlayers: 4,
  levels: [LEVEL_11, LEVEL_12, LEVEL_13, LEVEL_14, LEVEL_15],
};

export const PACK_FOUR_PLUS_BRIGADE: LevelPack = {
  id: 'four_plus_brigade',
  name: '4+ Brigade',
  minPlayers: 4,
  levels: [LEVEL_36, LEVEL_37, LEVEL_38, LEVEL_39, LEVEL_40],
};

export const PACK_FOUR_PLUS_CITADEL: LevelPack = {
  id: 'four_plus_citadel',
  name: '4+ Citadel',
  minPlayers: 4,
  levels: [LEVEL_41, LEVEL_42, LEVEL_43, LEVEL_44, LEVEL_45],
};

// Compatibility aliases for older imports.
export const PACK_SOLO_CADET = PACK_ONE_PLUS;
export const PACK_DUO_ALLIES = PACK_TWO_PLUS;
export const PACK_SQUAD_CREW = PACK_FOUR_PLUS;

export const ALL_PACKS: LevelPack[] = [
  PACK_ONE_PLUS,
  PACK_ONE_PLUS_GADGETS,
  PACK_ONE_PLUS_MASTER,
  PACK_TWO_PLUS,
  PACK_TWO_PLUS_HAZARDS,
  PACK_TWO_PLUS_MASTER,
  PACK_FOUR_PLUS,
  PACK_FOUR_PLUS_BRIGADE,
  PACK_FOUR_PLUS_CITADEL,
];

export const PACK_ORDER: string[] = ALL_PACKS.map((pack) => pack.id);

export function getRecommendedNextPackId(currentId: string): string | null {
  const idx = PACK_ORDER.indexOf(currentId);
  if (idx === -1 || idx === PACK_ORDER.length - 1) return null;
  return PACK_ORDER[idx + 1];
}
