import { LevelData } from '../level';
import {
  fireBar,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 27 — "Twin Towers"  (Pack: Duo Trust, 2 players)
// Two stack-only towers separated by a guarded lava strip. Each tower
// top latches one half of the central goal door. Players have to:
//   1. Stack tower L → partner latches btn27L. Drop down.
//   2. Cross the lava strip together — it's a 224-px gap, jumpable in
//      one running leap. Two firebars at floor level over the lava
//      mean each crossing has to be timed.
//   3. Stack tower R → partner latches btn27R. Drop down.
//   4. The central goal door opens and one of them runs to the goal.

const MAP_W = 1920;
const TOWER_L_TOP = platformRect(192,  400, 192);
const TOWER_R_TOP = platformRect(1216, 400, 192);

export const LEVEL_27: LevelData = {
  id: 27,
  name: 'Twin Towers',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), TOWER_L_TOP, TOWER_R_TOP],
  spawnPoints: standardSpawns(),

  objects: [
    // Tower-L latch (stack-only).
    platformButton('btn27L', TOWER_L_TOP, 'door27', { latching: true }),
    // Lava strip between towers — a single running jump clears 400px easily,
    // but the firebars over it bite anyone who hesitates.
    floorTrap('trap27', 832, 224),
    fireBar('fb27a', 736, 580, 2,  1.5, 0),
    fireBar('fb27b', 928, 580, 2, -1.5, 90),
    // Tower-R latch (stack-only).
    platformButton('btn27R', TOWER_R_TOP, 'door27', { latching: true }),
    // Goal door past both towers.
    fullHeightDoor('door27', 1568),
    goalOnFloor('goal27', 1856),
  ],
};
