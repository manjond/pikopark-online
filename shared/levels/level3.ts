import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap } from './_helpers';

const plat1 = platformRect(370, FLOOR_TOP - 112, 128);
const plat2 = platformRect(670, FLOOR_TOP - 112, 128);

// L3 — "Lava Dodge" (Solo Cadet)
// Lava strips force platform route. ONE latching button opens the door.
export const LEVEL_3: LevelData = {
  id: 3, name: 'Lava Dodge', minPlayers: 1, mapWidth: 1600,
  solidRects: [ groundSegment(0, 1600), plat1, plat2 ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap3a', 440, 128),
    floorTrap('trap3b', 760, 112),
    floorButton('btn3', 1050, 'door3', { latching: true }),
    fullHeightDoor('door3', 1200),
    goalOnFloor('goal3', 1520),
  ],
};
