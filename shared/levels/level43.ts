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

// Level 43 — "Synchronized"  (Pack: Squad Legion, 4 players)
// Four moving ferries cross four parallel lava lanes simultaneously. Each
// ferry deposits its rider on a stack-only ledge with a latching button.
// All four buttons must be flipped to open the goal door. The catch:
// the ferries don't depart at the same phase — players must read the
// timing and ride together so the stacks happen at the right moment.

const MAP_W = 2240;
const L1 = platformRect(1664, 540, 96);
const L2 = platformRect(1664, 460, 96);
const L3 = platformRect(1664, 380, 96);
const L4 = platformRect(1664, 300, 96);

export const LEVEL_43: LevelData = {
  id: 43,
  name: 'Synchronized',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), L1, L2, L3, L4],
  spawnPoints: standardSpawns(),

  objects: [
    // Lava under all the ferries.
    floorTrap('t43', 1024, 1280),
    // Four ferries at four heights with offset phases (different start positions).
    movingPlatform('mp43a', 320, 540, 128, { axis: 'x', from: 384,  to: 1600, speed: 240 }),
    movingPlatform('mp43b', 480, 460, 128, { axis: 'x', from: 544,  to: 1600, speed: 220 }),
    movingPlatform('mp43c', 320, 380, 128, { axis: 'x', from: 384,  to: 1600, speed: 200 }),
    movingPlatform('mp43d', 480, 300, 128, { axis: 'x', from: 544,  to: 1600, speed: 180 }),
    // Firebars in the airspace between lanes.
    fireBar('fb43a', 960,  500, 3, 1.4,  0),
    fireBar('fb43b', 1280, 380, 3, -1.4, 90),
    // Latching buttons on the four ledges.
    platformButton('b43a', L1, 'door43', { latching: true }),
    platformButton('b43b', L2, 'door43', { latching: true }),
    platformButton('b43c', L3, 'door43', { latching: true }),
    platformButton('b43d', L4, 'door43', { latching: true }),
    fullHeightDoor('door43', 1920),
    goalOnFloor('goal43', 2176),
  ],
};
