import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, lavaWall } from './_helpers';

const bypass1 = platformRect(900,  FLOOR_TOP - 128, 128);
const bypass2 = platformRect(1800, FLOOR_TOP - 128, 128);

// L36 — "Lava Rush" (Squad Brigade)
// Wall 100 px/s + 4 latching buttons all LEFT of door. Run and press!
export const LEVEL_36: LevelData = {
  id: 36, name: 'Lava Rush', minPlayers: 4, mapWidth: 3200,
  solidRects: [ groundSegment(0, 3200), bypass1, bypass2 ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall36', -64, 100),
    floorTrap('trap36a', 600, 80),
    floorTrap('trap36b', 1300, 80),
    floorButton('btn36a', 500,  'door36', { latching: true }),
    floorButton('btn36b', 1100, 'door36', { latching: true }),
    floorButton('btn36c', 1700, 'door36', { latching: true }),
    floorButton('btn36d', 2100, 'door36', { latching: true }),
    fullHeightDoor('door36', 2400),
    floorTrap('trap36c', 2700, 80),
    goalOnFloor('goal36', 3100),
  ],
};
