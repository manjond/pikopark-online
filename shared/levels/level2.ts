import { LevelData } from '../level';
import {
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 2 — "Latch"  (Pack: Basics, 1 player)
// Introduces the latching button concept. Press the button once and it stays
// active permanently — the door never closes again. Use this to your advantage!

const BTN_PLAT = platformRect(448, 507, 256);

export const LEVEL_2: LevelData = {
  id: 2,
  name: 'Latch',
  minPlayers: 1,

  solidRects: [groundRect(), BTN_PLAT],

  spawnPoints: standardSpawns(4, 64, 64),

  objects: [
    platformButton('btn2', BTN_PLAT, 'door2', { latching: true }),
    fullHeightDoor('door2', 896, 'btn2'),
    goalOnFloor('goal2', 1195),
  ],
};
