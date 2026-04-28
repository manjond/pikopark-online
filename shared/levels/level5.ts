import { LevelData } from '../level';
import {
  fireBar,
  floorSpring,
  floorTrap,
  goalOnPlatform,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 5 — "Hop High"  (Pack: Solo Cadet, 1 player)
// A spring pad launches you high over a wide lava pit, but a tall fire bar
// rotates through the airspace. Bounce, dodge, and land on the goal mesa
// on the far side. The intermediate landing pad gives you a checkpoint to
// reassess; missing it means a second spring attempt.

const MID_PLAT  = platformRect(512, 365, 192);
const GOAL_PLAT = platformRect(1024, 395, 224);

export const LEVEL_5: LevelData = {
  id: 5,
  name: 'Hop High',
  minPlayers: 1,

  solidRects: [groundRect(), MID_PLAT, GOAL_PLAT],
  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap5a', 560, 400),
    // Spring at x=160 gives ~600 px of rise — easily clears the 365 mid-plat.
    floorSpring('spring5', 160),
    // 3-segment firebar pivoting between the mid plat and the goal mesa.
    // Radius 96 sweeps between y=269 and y=461, so you must time both your
    // launch and the leap from the mid-plat to the goal.
    fireBar('fb5', 768, 365, 3, 1.2, 0),
    goalOnPlatform('goal5', GOAL_PLAT),
  ],
};
