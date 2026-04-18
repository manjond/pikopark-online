import { LevelData } from '../level';
import { TILE_SIZE } from '../constants';
import {
  floorSpring,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 28 — "Bounce Relay"  (Pack: Bounce, 2 players)
// Wide scrolling map. Two springs sit at opposite ends of the map, each
// with a latching button on a high platform above it. Both buttons share
// the same linkedId ('doorRelay28') — server AND-logic means the door
// opens only when *both* buttons are activated. Two players must split
// up, bounce simultaneously (or sequentially — buttons latch), then
// regroup at the goal past the door.

const MAP_W = 1920;

const PLAT_A = platformRect(128,  232, 256); // left station
const PLAT_B = platformRect(1152, 232, 256); // right station

export const LEVEL_28: LevelData = {
  id: 28,
  name: 'Bounce Relay',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PLAT_A, PLAT_B],

  spawnPoints: standardSpawns(),

  objects: [
    // Left station
    floorSpring('spring28a', 256),
    platformButton('btn28a', PLAT_A, 'doorRelay28', {
      latching: true, width: TILE_SIZE, yOffset: 4,
    }),
    // Right station
    floorSpring('spring28b', 1280),
    platformButton('btn28b', PLAT_B, 'doorRelay28', {
      latching: true, width: TILE_SIZE, yOffset: 4,
    }),
    fullHeightDoor('doorRelay28', 1600),
    goalOnFloor('goal28', 1800),
  ],
};
