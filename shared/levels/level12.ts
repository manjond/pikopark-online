import { LevelData } from '../level';
import {
  fullHeightDoor,
  goalOnPlatform,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 12 — "The Tower"  (Pack: Squad, 4 players)
// Requires a 3-player stack — tower platform lies in the 3-stack-only band
// [STACK3_FEET_PEAK, STACK2_FEET_PEAK) = [357, 389).
// Player D (top of 3-stack) presses the high button → door opens.
// Player A (4th) waits near the door, all pass and reach goal.

const MAP_W = 1280;

const TOWER_PLAT = platformRect(288, 370, 160); // 3-stack-only
const GOAL_PLAT  = platformRect(960, 460, 192); // solo-reachable

export const LEVEL_12: LevelData = {
  id: 12,
  name: 'The Tower',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), TOWER_PLAT, GOAL_PLAT],

  spawnPoints: standardSpawns(),

  objects: [
    platformButton('btn12', TOWER_PLAT, 'door12', { latching: true }),
    fullHeightDoor('door12', 576),
    goalOnPlatform('goal12', GOAL_PLAT),
  ],
};
