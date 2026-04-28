import { LevelData } from '../level';
import {
  crumblePlatform,
  fireBar,
  floorSpring,
  floorTrap,
  goalOnFloor,
  groundRect,
  icePlatform,
  movingPlatform,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 15 — "Mirror Run"  (Pack: Solo Master, 1 player — finale)
// Two parallel hazard lanes converge at the goal. The lower lane is mostly
// crumbles + lava with a vertical lift; the upper lane is ice + ferry +
// firebars. You only need to clear ONE lane, but both look terrifying —
// the lower is faster, the upper is more forgiving once you commit.

const MAP_W = 2240;
const UPPER_DOCK = platformRect(64,   460, 192);
const UPPER_LIP  = platformRect(2016, 380, 192);
const LOWER_LIP  = platformRect(1856, 565, 160);

export const LEVEL_15: LevelData = {
  id: 15,
  name: 'Mirror Run',
  minPlayers: 1,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    UPPER_DOCK,
    UPPER_LIP,
    LOWER_LIP,
    icePlatform(800, 380, 320),
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Lower lane — long lava + crumble bridge + vertical lift.
    floorTrap('trap15low', 1124, 1700),
    crumblePlatform('cr15a',  448, 565, 96),
    crumblePlatform('cr15b',  672, 565, 96),
    crumblePlatform('cr15c',  896, 565, 96),
    crumblePlatform('cr15d', 1408, 565, 96),
    crumblePlatform('cr15e', 1632, 565, 96),
    movingPlatform('mp15low', 1120, 460, 96, {
      axis: 'y',
      from: 460 + 16,
      to:   300 + 16,
      speed: 130,
    }),

    // Upper lane — spring up from dock, ride ferry, ice plate, leap onto
    // the high lip near the goal.
    floorSpring('spring15', 96),
    movingPlatform('mp15hi', 320, 360, 128, {
      axis: 'x',
      from: 320 + 64,
      to:   640 + 64,
      speed: 200,
    }),
    fireBar('fb15a', 480, 280, 3, 1.6,  0),
    fireBar('fb15b', 960, 280, 3, -1.4, 90),
    fireBar('fb15c', 1472, 360, 2, 1.8, 45),

    // Both lanes deposit you near the right wall — sprint to the goal.
    goalOnFloor('goal15', 2176),
  ],
};
