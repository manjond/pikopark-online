import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, pushBox, fireBar } from './_helpers';

const upperPlatA = platformRect(600,  FLOOR_TOP - 160, 128);
const upperPlatB = platformRect(1100, FLOOR_TOP - 160, 128);

// L39 — "Complex Grid" (Squad Brigade)
// Boxes → door1, platform buttons → door2. All buttons left of their doors.
export const LEVEL_39: LevelData = {
  id: 39, name: 'Complex Grid', minPlayers: 4, mapWidth: 2800,
  solidRects: [ groundSegment(0, 2800), upperPlatA, upperPlatB ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box39a', 300, FLOOR_TOP - 32),
    pushBox('box39b', 500, FLOOR_TOP - 32),
    floorButton('btn39box1', 700, 'door39a', { latching: true }),
    floorButton('btn39box2', 900, 'door39a', { latching: true }),
    fullHeightDoor('door39a', 1100),
    fireBar('fb39a', 1250, FLOOR_TOP - 48, 2, 1.2, 0),
    floorButton('btn39up1', upperPlatA.x + 64, 'door39b', { latching: true }),
    floorButton('btn39up2', upperPlatB.x + 64, 'door39b', { latching: true }),
    fireBar('fb39b', 1700, FLOOR_TOP - 48, 2, -1.0, 90),
    fullHeightDoor('door39b', 2000),
    goalOnFloor('goal39', 2720),
  ],
};
