import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, floorTrap, lavaWall, platformRect,
} from './_helpers';

// Level 36 — "Lava Rush"  (Squad Brigade)
// Lava wall at 100 px/s + complex routing. 4 players must all press
// their keys before the wall catches them. Map 3200 px.

const bypass1 = platformRect(900,  FLOOR_TOP - 128, 128);
const bypass2 = platformRect(1800, FLOOR_TOP - 128, 128);

export const LEVEL_36: LevelData = {
  id: 36,
  name: 'Lava Rush',
  minPlayers: 4,
  mapWidth: 3200,
  solidRects: [
    groundSegment(0, 3200),
    bypass1, bypass2,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall36', -64, 100),
    floorTrap('trap36a', 600, 80),
    floorTrap('trap36b', 1300, 80),
    floorButton('btn36a', 500,  'door36a', { latching: true }),
    floorButton('btn36b', 1100, 'door36a', { latching: true }),
    floorButton('btn36c', 1700, 'door36a', { latching: true }),
    floorButton('btn36d', 2100, 'door36a', { latching: true }),
    fullHeightDoor('door36a', 2400),
    floorButton('btn36ex', 2500, 'door36a', { latching: true }),
    floorTrap('trap36c', 2700, 80),
    goalOnFloor('goal36', 3100),
  ],
};
