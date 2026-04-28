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

// Level 10 — "Vertical Trial"  (Pack: Solo Adept, 1 player)
// A wide lava lake leaves no floor to walk on. A vertical lift carries you
// upward through the airspace of two firebars. Step off onto the goal mesa
// at the lift's apex. The lift returns to the dock automatically — patient
// timing beats fast reflexes here.

const DOCK     = platformRect(64, 580, 96);   // safe boarding pad over the lava
const GOAL_PAD = platformRect(1056, 300, 192);

export const LEVEL_10: LevelData = {
  id: 10,
  name: 'Vertical Trial',
  minPlayers: 1,

  solidRects: [groundRect(), DOCK, GOAL_PAD],
  spawnPoints: standardSpawns(),

  objects: [
    // Lava covers everything except the spawn rim and the dock.
    floorTrap('trap10', 720, 896),
    // Lift rises from the dock height (yTop≈580) to just above the goal pad
    // top (320). Slow speed = a deliberate ride.
    movingPlatform('mp10', 192, 580, 128, {
      axis: 'y',
      from: 580 + 16,
      to:   320 + 16,
      speed: 90,
    }),
    fireBar('fb10a', 480, 460, 3, 1.4, 0),
    fireBar('fb10b', 800, 360, 3, -1.6, 90),
    goalOnPlatform('goal10', GOAL_PAD),
  ],
};
