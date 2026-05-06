import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap } from './_helpers';

const plat1 = platformRect(400, FLOOR_TOP - 96,  128);
const plat2 = platformRect(608, FLOOR_TOP - 192, 128);
const plat3 = platformRect(816, FLOOR_TOP - 256, 128);

// L2 — "Step Up" (Solo Cadet)
// Climb platforms, press latching button at top to open door. Lava at x=400+
export const LEVEL_2: LevelData = {
  id: 2, name: 'Step Up', minPlayers: 1, mapWidth: 1440,
  solidRects: [ groundSegment(0, 1440), plat1, plat2, plat3 ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap2a', 380, 80),
    floorButton('btn2', plat3.x + 64, 'door2', { latching: true }),
    fullHeightDoor('door2', 1100),
    goalOnFloor('goal2', 1360),
  ],
};
