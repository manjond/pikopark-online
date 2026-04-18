import { LevelData } from '../level';
import {
  floorButton,
  fullHeightDoor,
  goalOnPlatform,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 10 — "Pinnacle"  (Pack: Duo, 2 players — hardest)
// 1920px wide. Combines all duo mechanics in one continuous puzzle:
//   • Stacking-only button A (latching) unlocks door A
//   • Floor button B (latching) unlocks door B
//   • Beyond door B: stacking-only platform with latching button C
//   • All three doors open → goal reachable
// All buttons latching so the 2-player session can always complete — if any
// were pressure-only the holder would get stuck before the next puzzle.

const MAP_W = 1920;

const PLAT_A    = platformRect(192,  405, 160); // stacking-only
const PLAT_C    = platformRect(1344, 395, 160); // stacking-only
const GOAL_PLAT = platformRect(1664, 480, 192);

export const LEVEL_10: LevelData = {
  id: 10,
  name: 'Pinnacle',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    PLAT_A,
    platformRect(640, 550, 160),   // stepping stone between door A and B
    PLAT_C,
    GOAL_PLAT,
  ],

  spawnPoints: standardSpawns(),

  objects: [
    platformButton('btn10a', PLAT_A, 'door10a', { latching: true }),
    fullHeightDoor('door10a', 448),
    floorButton('btn10b', 832, 'door10b', { latching: true }),
    fullHeightDoor('door10b', 1024),
    platformButton('btn10c', PLAT_C, 'door10c', { latching: true }),
    fullHeightDoor('door10c', 1600),
    goalOnPlatform('goal10', GOAL_PLAT),
  ],
};
