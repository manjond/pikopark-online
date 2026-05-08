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

// New catalog: one pack per category, five levels each.
// The curve is intentionally compact and authored from scratch:
// 1+ teaches solo platforming/tools, 2+ adds cooperative locks, and 4+
// focuses on crew timing, stacking, and box logistics.

export const PACK_ONE_PLUS: LevelPack = {
  id: 'one_plus_trials',
  name: '1+ Wobble Trials',
  minPlayers: 1,
  levels: [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5],
};

export const PACK_TWO_PLUS: LevelPack = {
  id: 'two_plus_teamwork',
  name: '2+ Teamwork',
  minPlayers: 2,
  levels: [LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10],
};

export const PACK_FOUR_PLUS: LevelPack = {
  id: 'four_plus_crew',
  name: '4+ Crew Trials',
  minPlayers: 4,
  levels: [LEVEL_11, LEVEL_12, LEVEL_13, LEVEL_14, LEVEL_15],
};

// Compatibility aliases for older imports.
export const PACK_SOLO_CADET = PACK_ONE_PLUS;
export const PACK_DUO_ALLIES = PACK_TWO_PLUS;
export const PACK_SQUAD_CREW = PACK_FOUR_PLUS;

export const ALL_PACKS: LevelPack[] = [
  PACK_ONE_PLUS,
  PACK_TWO_PLUS,
  PACK_FOUR_PLUS,
];

export const PACK_ORDER: string[] = [
  PACK_ONE_PLUS.id,
  PACK_TWO_PLUS.id,
  PACK_FOUR_PLUS.id,
];

export function getRecommendedNextPackId(currentId: string): string | null {
  const idx = PACK_ORDER.indexOf(currentId);
  if (idx === -1 || idx === PACK_ORDER.length - 1) return null;
  return PACK_ORDER[idx + 1];
}
