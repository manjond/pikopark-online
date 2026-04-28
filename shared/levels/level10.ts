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
// A wide lava lake leaves no walkable floor between spawn and the goal
// column. A vertical lift carries you up to a chain of three stepping
// ledges, each placed within a single jump of the next. Two firebars
// mid-air force you to time each crossing.

const MAP_W = 1280;
const STEP_A   = platformRect(320,  320, 192); // first catwalk, beside lift apex
const STEP_B   = platformRect(640,  320, 192); // second catwalk
const GOAL_PAD = platformRect(992,  300, 192); // goal mesa, slightly higher

export const LEVEL_10: LevelData = {
  id: 10,
  name: 'Vertical Trial',
  minPlayers: 1,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), STEP_A, STEP_B, GOAL_PAD],
  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap10', 720, 896),
    // Vertical lift — center x=192, rides between top-y=580 and top-y=300.
    movingPlatform('mp10', 128, 580, 128, {
      axis: 'y',
      from: 580 + 16,
      to:   300 + 16,
      speed: 100,
    }),
    fireBar('fb10a', 544, 380, 3,  1.4, 0),
    fireBar('fb10b', 864, 380, 3, -1.6, 90),
    goalOnPlatform('goal10', GOAL_PAD),
  ],
};
