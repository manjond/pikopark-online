import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, lavaWall } from './_helpers';

const bypass = platformRect(800, FLOOR_TOP - 96, 128);

// L5 — "Sprint!" (Solo Cadet)
// First lava wall (90 px/s). ONE latching button to unlock exit. Run fast!
export const LEVEL_5: LevelData = {
  id: 5, name: 'Sprint!', minPlayers: 1, mapWidth: 2400,
  solidRects: [ groundSegment(0, 2400), bypass ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall5', -64, 90),
    floorButton('btn5', 1550, 'door5', { latching: true }),
    fullHeightDoor('door5', 1750),
    goalOnFloor('goal5', 2300),
  ],
};
