import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorSpring } from './_helpers';

const highPlat = platformRect(640, 160, 128);

// L12 — "Spring High" (Solo Master)
// Spring launches to unreachable height. Button up there opens the door.
export const LEVEL_12: LevelData = {
  id: 12, name: 'Spring High', minPlayers: 1, mapWidth: 1440,
  solidRects: [ groundSegment(0, 1440), highPlat, platformRect(900, FLOOR_TOP - 96, 96) ],
  spawnPoints: standardSpawns(),
  objects: [
    floorSpring('spr12', 640, 48),
    floorButton('btn12', 704, 'door12', { latching: true }),
    fullHeightDoor('door12', 1050),
    goalOnFloor('goal12', 1380),
  ],
};
