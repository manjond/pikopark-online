import { LevelData } from '../level';
import { FLOOR_TOP, STACK3_FEET_PEAK, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap } from './_helpers';

const stackPlat = platformRect(700, STACK3_FEET_PEAK, 128);

// L32 — "Triple Stack" (Squad Crew)
// 3-player stack to reach high platform button. ONE button, left of door.
export const LEVEL_32: LevelData = {
  id: 32, name: 'Triple Stack', minPlayers: 4, mapWidth: 1920,
  solidRects: [ groundSegment(0, 1920), stackPlat, platformRect(950, FLOOR_TOP - 80, 96) ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap32', 560, 80),
    floorButton('btn32', stackPlat.x + 64, 'door32', { latching: true }),
    fullHeightDoor('door32', 1350),
    goalOnFloor('goal32', 1870),
  ],
};
