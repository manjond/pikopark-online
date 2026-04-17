import { LevelPack } from './level';
import { LEVEL_1 } from './levels/level1';
import { LEVEL_2 } from './levels/level2';
import { LEVEL_3 } from './levels/level3';
import { LEVEL_4 } from './levels/level4';
import { LEVEL_5 } from './levels/level5';
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


export const PACK_BASICS: LevelPack = {
  id: 'basics',
  name: 'Basics',
  minPlayers: 1,
  levels: [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5],
};

export const PACK_DUO: LevelPack = {
  id: 'duo',
  name: 'Duo',
  minPlayers: 2,
  levels: [LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10],
};

export const PACK_SQUAD: LevelPack = {
  id: 'squad',
  name: 'Squad',
  minPlayers: 4,
  levels: [LEVEL_11, LEVEL_12, LEVEL_13, LEVEL_14, LEVEL_15],
};

export const ALL_PACKS: LevelPack[] = [PACK_BASICS, PACK_DUO, PACK_SQUAD];
