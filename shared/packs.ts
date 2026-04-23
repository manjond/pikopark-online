import { LevelPack } from './level';
import { LEVEL_1 }  from './levels/level1';
import { LEVEL_2 }  from './levels/level2';
import { LEVEL_3 }  from './levels/level3';
import { LEVEL_4 }  from './levels/level4';
import { LEVEL_5 }  from './levels/level5';
import { LEVEL_6 }  from './levels/level6';
import { LEVEL_7 }  from './levels/level7';
import { LEVEL_8 }  from './levels/level8';
import { LEVEL_9 }  from './levels/level9';
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

export const PACK_BASICS: LevelPack = {
  id: 'basics',
  name: 'Basics',
  minPlayers: 2,
  levels: [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5],
};

export const PACK_DUO: LevelPack = {
  id: 'duo',
  name: 'Duo',
  minPlayers: 2,
  levels: [LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10],
};

export const PACK_HAZARDS: LevelPack = {
  id: 'hazards',
  name: 'Hazards',
  minPlayers: 2,
  levels: [LEVEL_16, LEVEL_17, LEVEL_18, LEVEL_19, LEVEL_20],
};

export const PACK_EXTREME: LevelPack = {
  id: 'extreme',
  name: 'Extreme',
  minPlayers: 2,
  levels: [LEVEL_21, LEVEL_22, LEVEL_23, LEVEL_24, LEVEL_25],
};

export const PACK_SQUAD: LevelPack = {
  id: 'squad',
  name: 'Squad',
  minPlayers: 4,
  levels: [LEVEL_11, LEVEL_12, LEVEL_13, LEVEL_14, LEVEL_15],
};

export const PACK_BOUNCE: LevelPack = {
  id: 'bounce',
  name: 'Bounce',
  minPlayers: 2,
  levels: [LEVEL_26, LEVEL_27, LEVEL_28],
};

export const PACK_ACROBATICS: LevelPack = {
  id: 'acrobatics',
  name: 'Acrobatics',
  minPlayers: 2,
  levels: [LEVEL_29, LEVEL_30, LEVEL_31],
};

export const ALL_PACKS: LevelPack[] = [
  PACK_BASICS,
  PACK_DUO,
  PACK_HAZARDS,
  PACK_EXTREME,
  PACK_SQUAD,
  PACK_BOUNCE,
  PACK_ACROBATICS,
];
