import { LevelData } from '../level';
import {
  fireBar,
  floorTrap,
  goalOnPlatform,
  groundRect,
  movingPlatform,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 6 — "Climb of Embers"  (Pack: Solo Adept, 1 player)
// Wall-to-wall lava on the floor. The only way up is a vertical lift that
// rises through the airspace of two firebars, then steps over to the goal
// mesa. Mistime any phase and you fall into the lake.

const GOAL_PLAT = platformRect(992, 365, 224);

export const LEVEL_6: LevelData = {
  id: 6,
  name: 'Climb of Embers',
  minPlayers: 1,

  solidRects: [groundRect(), GOAL_PLAT],
  spawnPoints: standardSpawns(),

  objects: [
    // Lava covers the floor between the spawn strip and the goal mesa column.
    floorTrap('trap6', 624, 640),
    // Vertical lift: top oscillates between yTop=580 (boardable from the
    // spawn rim) and yTop=300 (high enough to step onto the goal column).
    movingPlatform('mp6', 128, 580, 128, {
      axis: 'y',
      from: 580 + 16,
      to:   300 + 16,
      speed: 110,
    }),
    // Two firebars rotate at the lift's apex band. Radius 96 each — you
    // need to ride past while both blades are out of the column.
    fireBar('fb6a', 384, 460, 3, 1.4, 0),
    fireBar('fb6b', 704, 380, 3, -1.0, 90),
    goalOnPlatform('goal6', GOAL_PLAT),
  ],
};
