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

// Level 14 — "Solo Apex"  (Pack: Solo Master, 1 player)
// A 2240-wide arena that throws every hazard at you in sequence:
//   1. Spring launch over a long lava lake onto an ice runway.
//   2. Ice slide that ends on crumble platforms — keep moving.
//   3. Horizontal ferry threaded between two firebars.
//   4. Final firebar guarding the goal landing.
// One mistake anywhere → restart from spawn.

const MAP_W = 2240;
const ICE_RUN = icePlatform(384, 460, 320);
const REST    = platformRect(1152, 540, 160);

export const LEVEL_14: LevelData = {
  id: 14,
  name: 'Solo Apex',
  minPlayers: 1,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), ICE_RUN, REST],
  spawnPoints: standardSpawns(),

  objects: [
    // Stage 1 — spring over lava onto ice plate.
    floorTrap('trap14a', 400, 256),
    floorSpring('spring14', 128),

    // Stage 2 — ice slide drops into crumble field over more lava.
    floorTrap('trap14b', 880, 384),
    crumblePlatform('cr14a', 736,  565, 96),
    crumblePlatform('cr14b', 896,  565, 96),
    crumblePlatform('cr14c', 1056, 565, 96),

    // Stage 3 — ferry between firebars.
    floorTrap('trap14c', 1568, 416),
    movingPlatform('mp14', 1296, 460, 128, {
      axis: 'x',
      from: 1296 + 64,
      to:   1664 + 64,
      speed: 220,
    }),
    fireBar('fb14a', 1392, 360, 2, 1.6,  0),
    fireBar('fb14b', 1664, 360, 2, -1.6, 90),

    // Stage 4 — final firebar over the goal.
    fireBar('fb14c', 2016, 580, 3, 1.4, 45),
    goalOnFloor('goal14', 2176),
  ],
};
