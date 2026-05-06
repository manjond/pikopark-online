import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap,
} from './_helpers';

// Level 2 — "Step Up"
// Solo. Multiple platforms going up; latching button at the top unlocks door.
// Pits are each ≤ 300 px wide and platforms are at safe heights (≤ SOLO_FEET_PEAK).

const plat1 = platformRect(400, FLOOR_TOP - 96,  128);   // y=592
const plat2 = platformRect(608, FLOOR_TOP - 192, 128);   // y=496
const plat3 = platformRect(816, FLOOR_TOP - 256, 128);   // y=432

export const LEVEL_2: LevelData = {
  id: 2,
  name: 'Step Up',
  minPlayers: 1,
  mapWidth: 1440,

  solidRects: [
    groundSegment(0, 1440),
    plat1, plat2, plat3,
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Small lava strip to push player onto the platforms
    floorTrap('trap2a', 310, 80),
    // Latching button on highest platform — press to open the door below
    floorButton('btn2', plat3.x + 64, 'door2', { latching: true }),
    // Door blocks direct path to goal
    fullHeightDoor('door2', 1100),
    // Second latching button right of door (no trapping)
    floorButton('btn2b', 1200, 'door2', { latching: true }),
    goalOnFloor('goal2', 1360),
  ],
};
