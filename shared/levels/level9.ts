import { LevelData } from '../level';
import {
  crumblePlatform,
  floorTrap,
  goalOnFloor,
  groundRect,
  icePlatform,
  standardSpawns,
} from './_helpers';

// Level 9 — "Ice Race"  (Pack: Solo Adept, 1 player)
// Two long ice runways flank a short crumble bridge. The lava lake
// underneath punishes any pause. Run, brake on the gap of ground between
// the ice and the crumbles, sprint across the crumbles before they fall,
// then nail the brake on the second ice plate before its drop-off.

export const LEVEL_9: LevelData = {
  id: 9,
  name: 'Ice Race',
  minPlayers: 1,

  solidRects: [
    groundRect(),
    icePlatform(288, 565, 256),   // first ice run
    icePlatform(800, 565, 256),   // second ice run
  ],

  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap9', 672, 640),
    crumblePlatform('cr9a', 560, 565, 96),
    crumblePlatform('cr9b', 672, 565, 96),
    crumblePlatform('cr9c', 784, 565, 96),
    goalOnFloor('goal9', 1200),
  ],
};
