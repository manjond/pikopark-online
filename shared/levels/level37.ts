import { LevelData } from '../level';
import {
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 37 — "Throw Chain"  (Pack: Squad Brigade, 4 players)
// Chain of throws. The right-most ledge is too high (throw-only), the
// next is solo-reachable but separated by lava. Players form a launch
// queue: P1 throws P2 onto LEDGE_A, then P3 throws P4 onto LEDGE_B
// (which is throw-only), P4 walks to the latching button. Final door
// opens. P1 and P3 stay behind on the spawn floor.

const MAP_W = 1920;
const LEDGE_A = platformRect(640,  395, 192); // stack-or-throw reachable
const LEDGE_B = platformRect(1216, 320, 192); // throw-only

export const LEVEL_37: LevelData = {
  id: 37,
  name: 'Throw Chain',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), LEDGE_A, LEDGE_B],
  spawnPoints: standardSpawns(),

  objects: [
    // Wide chasm between spawn and the goal column.
    floorTrap('t37chasm', 528, 480),
    // Mid pressure pad on LEDGE_A — held by the player thrown there.
    platformButton('b37hold', LEDGE_A, 'trap37', { width: 192 }),
    // Lava strip past LEDGE_B's drop-zone — only cold while pad held.
    floorTrap('trap37', 1408, 192),
    // Throw-only latch on LEDGE_B — opens the goal door.
    platformButton('b37latch', LEDGE_B, 'door37', { latching: true }),
    fullHeightDoor('door37', 1664),
    goalOnFloor('goal37', 1856),
  ],
};
