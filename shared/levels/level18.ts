import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap } from './_helpers';

const topPlat = platformRect(400, FLOOR_TOP - 192, 512);

// L18 — "Split Path" (Duo Allies)
// Upper route button + lower route button. Both before the door (no deadlock).
export const LEVEL_18: LevelData = {
  id: 18, name: 'Split Path', minPlayers: 2, mapWidth: 1920,
  solidRects: [ groundSegment(0, 1920), topPlat ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap18', 480, 64),
    floorButton('btn18up', topPlat.x + topPlat.width / 2, 'door18', { latching: true }),
    floorButton('btn18dn', 650, 'door18', { latching: true }),
    fullHeightDoor('door18', 1450),
    goalOnFloor('goal18', 1860),
  ],
};
