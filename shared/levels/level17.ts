import { LevelData } from '../level';
import { FLOOR_TOP, STACK2_FEET_PEAK, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap } from './_helpers';

const stackPlat = platformRect(700, STACK2_FEET_PEAK, 96);

// L17 — "Stacker" (Duo Allies)
// Stack jump required to reach high platform with the button.
export const LEVEL_17: LevelData = {
  id: 17, name: 'Stacker', minPlayers: 2, mapWidth: 1600,
  solidRects: [ groundSegment(0, 1600), stackPlat, platformRect(900, FLOOR_TOP - 96, 96) ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap17', 480, 80),
    floorButton('btn17', stackPlat.x + 48, 'door17', { latching: true }),
    fullHeightDoor('door17', 1200),
    goalOnFloor('goal17', 1530),
  ],
};
