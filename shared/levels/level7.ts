import { LevelData } from '../level';
import {
  crumblePlatform,
  fireBar,
  floorTrap,
  goalOnFloor,
  groundRect,
  standardSpawns,
} from './_helpers';

// Level 7 — "Crumble Cascade"  (Pack: Solo Adept, 1 player)
// A long lava lake with five crumble platforms zig-zagging across at two
// heights. A firebar pivots at the centre, sweeping through the lower lane.
// The natural rhythm wants you on the high lane while the bar passes, then
// dropping back to the low lane to land on the far floor.

export const LEVEL_7: LevelData = {
  id: 7,
  name: 'Crumble Cascade',
  minPlayers: 1,

  solidRects: [groundRect()],
  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap7', 672, 800),
    crumblePlatform('cr7a', 384, 565, 96),
    crumblePlatform('cr7b', 528, 460, 96),
    crumblePlatform('cr7c', 672, 365, 96),
    crumblePlatform('cr7d', 816, 460, 96),
    crumblePlatform('cr7e', 960, 565, 96),
    fireBar('fb7', 672, 540, 3, 1.6, 0),
    goalOnFloor('goal7', 1180),
  ],
};
