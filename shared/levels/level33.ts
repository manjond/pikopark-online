import { LevelData } from '../level';
import {
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 33 — "Pyramid"  (Pack: Squad Crew, 4 players)
// 3-stack-only platform: only a 3-player tower reaches the high latching
// button (top y=370 → STACK3 band). One player has to stay on the
// pressure pad below to keep the lava bridge between spawn and the
// pyramid's base cool. Once the latch flips, the door opens and any
// player walks through to the goal.

const MAP_W = 1920;
const PYRAMID_TOP = platformRect(704, 370, 192); // 3-stack only
const PED         = platformRect(96,  540, 96);

export const LEVEL_33: LevelData = {
  id: 33,
  name: 'Pyramid',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PYRAMID_TOP, PED],
  spawnPoints: standardSpawns(),

  objects: [
    // Holder pad on side step.
    platformButton('btn33hold', PED, 'trap33', { width: 96 }),
    floorTrap('trap33', 544, 480),
    // 3-stack latching button.
    platformButton('btn33top', PYRAMID_TOP, 'door33', { latching: true }),
    fullHeightDoor('door33', 1408),
    // Final twist — short lava strip past the door, jumpable but tight.
    floorTrap('trap33spit', 1568, 96),
    goalOnFloor('goal33', 1856),
  ],
};
