import { LevelData } from '../level';
import {
  fireBar,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  movingPlatform,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 39 — "Lift Brigade"  (Pack: Squad Brigade, 4 players)
// A wide vertical lift carries the squad up past two firebars to a high
// landing. Three latching buttons sit on three separate top-perches at
// throw-only height — each must be reached by stepping off the lift at
// the right moment, or by being thrown off the lift's top by a partner.
// All three latched → final door opens.

const MAP_W = 1920;
const LIFT_X = 320;
const PERCH_A = platformRect(640,  300, 160); // throw-or-lift reachable
const PERCH_B = platformRect(960,  300, 160);
const PERCH_C = platformRect(1280, 300, 160);

export const LEVEL_39: LevelData = {
  id: 39,
  name: 'Lift Brigade',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PERCH_A, PERCH_B, PERCH_C],
  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('t39', 1152, 1408),
    // Wide vertical lift — fits 2-3 players at once.
    movingPlatform('lift39', LIFT_X - 80, 540, 160, {
      axis: 'y',
      from: 540 + 16,
      to:   316 + 16,
      speed: 110,
    }),
    fireBar('fb39a', 480, 460, 3, 1.5,  0),
    fireBar('fb39b', 800, 380, 3, -1.6, 90),
    // Three latching buttons on the perches.
    platformButton('b39A', PERCH_A, 'door39', { latching: true }),
    platformButton('b39B', PERCH_B, 'door39', { latching: true }),
    platformButton('b39C', PERCH_C, 'door39', { latching: true }),
    fullHeightDoor('door39', 1568),
    goalOnFloor('goal39', 1856),
  ],
};
