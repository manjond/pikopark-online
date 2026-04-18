import { LevelData } from '../level';
import {
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 3 — "Both Keys"  (Pack: Basics, 1 player)
// Two latching buttons, both required to open the door (AND logic).
// Press button A, press button B — the door only opens when BOTH are active.

const PLAT_A = platformRect(192, 533, 192);
const PLAT_B = platformRect(576, 480, 192);

export const LEVEL_3: LevelData = {
  id: 3,
  name: 'Both Keys',
  minPlayers: 1,

  solidRects: [groundRect(), PLAT_A, PLAT_B],

  spawnPoints: standardSpawns(),

  objects: [
    platformButton('btn3a', PLAT_A, 'door3', { latching: true }),
    platformButton('btn3b', PLAT_B, 'door3', { latching: true }),
    fullHeightDoor('door3', 896),
    goalOnFloor('goal3', 1195),
  ],
};
