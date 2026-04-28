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

// Level 22 — "Throw and Hold"  (Pack: Duo Synergy, 2 players)
// Carry-throw onto a high perch where the carried player holds a pressure
// pad. While held, the lava strip below is cold — the carrier can sprint
// across to a latching button that opens the goal door. Reverse roles
// don't work: the carried partner can't drop down on their own (the
// carrier has to throw, but throwing dismounts them on the perch — see
// below). So the partner who's lifted up *stays* on the pad while the
// other finishes the run.
//
// Throw mechanic note: the rider lands on the perch as soon as they enter
// the platform's airspace. Once on the perch, they can walk freely. The
// pad is positioned so the rider naturally lands on it.

const MAP_W = 1664;
const PERCH      = platformRect(384,  320, 192); // throw-only (THROW_FEET_PEAK = 303)
const LATCH_PLAT = platformRect(1216, 540, 160);

export const LEVEL_22: LevelData = {
  id: 22,
  name: 'Throw and Hold',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PERCH, LATCH_PLAT],
  spawnPoints: standardSpawns(),

  objects: [
    // Pressure pad on the perch — held by the thrown player.
    platformButton('btn22hold', PERCH, 'trap22', { width: 192 }),
    // Lava lake below — wide enough that no jump clears it; carrier must
    // wait for partner to land on the pad and hold it down.
    floorTrap('trap22', 832, 640),
    // Past the cold lake, a stepping-stone latch opens the goal door.
    platformButton('btn22latch', LATCH_PLAT, 'door22', { latching: true }),
    fullHeightDoor('door22', 1408),
    goalOnFloor('goal22', 1600),
  ],
};
