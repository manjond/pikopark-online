import { LevelData } from '../level';
import {
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  icePlatform,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 40 — "Quad Ice"  (Pack: Squad Brigade, 4 players)
// One long ice runway over a permanent lava lake, four small stack-only
// ledges spaced along it. Each ledge has a latching button at stack-only
// height — pairs of players brake on the ice, stack, latch, and slide on
// to the next ledge. All four latched → goal door opens.

const MAP_W = 2240;
const ICE_RUN = icePlatform(192, 540, 1408);
const L1 = platformRect(384,  400, 96);
const L2 = platformRect(768,  400, 96);
const L3 = platformRect(1152, 400, 96);
const L4 = platformRect(1536, 400, 96);

export const LEVEL_40: LevelData = {
  id: 40,
  name: 'Quad Ice',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), ICE_RUN, L1, L2, L3, L4],
  spawnPoints: standardSpawns(),

  objects: [
    // Lake under the ice — fall off and you cook.
    floorTrap('t40', 928, 1280),
    // Four stack-only latching buttons.
    platformButton('b40a', L1, 'door40', { latching: true }),
    platformButton('b40b', L2, 'door40', { latching: true }),
    platformButton('b40c', L3, 'door40', { latching: true }),
    platformButton('b40d', L4, 'door40', { latching: true }),
    fullHeightDoor('door40', 1856),
    goalOnFloor('goal40', 2176),
  ],
};
