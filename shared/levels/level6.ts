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
// Wide lava lake on the floor — only the spawn rim and the goal column
// are bare ground. A vertical lift carries you from the spawn-rim dock
// up to a stepping ledge at apex height. From there a chain of three
// catwalks lets you island-hop past two firebars to the goal mesa.
// Each gap between catwalks is < 400 px so a running jump clears it,
// but the firebars sweep through the airspace — time each leap.

const MAP_W = 1280;
const STEP_A   = platformRect(320, 320, 192); // first catwalk, beside lift apex
const STEP_B   = platformRect(640, 320, 192); // second catwalk
const GOAL_PAD = platformRect(992, 320, 224); // goal mesa

export const LEVEL_6: LevelData = {
  id: 6,
  name: 'Climb of Embers',
  minPlayers: 1,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), STEP_A, STEP_B, GOAL_PAD],
  spawnPoints: standardSpawns(),

  objects: [
    // Lava covers the floor between the spawn strip and the goal column.
    floorTrap('trap6', 624, 640),
    // Vertical lift — docks at top-y=580 (jumpable from the spawn rim) and
    // rises to top-y=300 (just above the catwalk row). Lift center x = 192.
    movingPlatform('mp6', 128, 580, 128, {
      axis: 'y',
      from: 580 + 16,
      to:   300 + 16,
      speed: 110,
    }),
    // Two firebars sweep across the gaps between the three catwalks.
    fireBar('fb6a', 544, 380, 2,  1.4, 0),
    fireBar('fb6b', 864, 380, 2, -1.4, 90),
    goalOnPlatform('goal6', GOAL_PAD),
  ],
};
