import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, fireBar } from './_helpers';

const bypass1 = platformRect(460, FLOOR_TOP - 128, 96);
const bypass2 = platformRect(780, FLOOR_TOP - 128, 96);

// L7 — "Fire Alley" (Solo Adept)
// Time your dash past three rotating fire bars. Latching button opens exit.
export const LEVEL_7: LevelData = {
  id: 7, name: 'Fire Alley', minPlayers: 1, mapWidth: 1600,
  solidRects: [ groundSegment(0, 1600), bypass1, bypass2 ],
  spawnPoints: standardSpawns(),
  objects: [
    fireBar('fb7a', 400,  FLOOR_TOP - 32, 2,  1.2,   0),
    fireBar('fb7b', 700,  FLOOR_TOP - 32, 2, -1.0,  90),
    fireBar('fb7c', 1020, FLOOR_TOP - 32, 2,  1.5, 180),
    floorButton('btn7', 1180, 'door7', { latching: true }),
    fullHeightDoor('door7', 1340),
    goalOnFloor('goal7', 1540),
  ],
};
