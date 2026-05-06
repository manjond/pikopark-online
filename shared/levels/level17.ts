import { LevelData } from '../level';
import {
  FLOOR_TOP, STACK2_FEET_PEAK,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap,
} from './_helpers';

// Level 17 — "Stacker"  (Duo Allies)
// A button sits on a platform only reachable via 2-player stack jump.
// Platform top at y=STACK2_FEET_PEAK=389, so jumping from floor to it
// requires one player to stand on the other's head (stack jump).

const stackPlat = platformRect(700, STACK2_FEET_PEAK, 96);   // y=389

export const LEVEL_17: LevelData = {
  id: 17,
  name: 'Stacker',
  minPlayers: 2,
  mapWidth: 1600,
  solidRects: [
    groundSegment(0, 1600),
    stackPlat,
    platformRect(900, FLOOR_TOP - 96, 96),   // step-down
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap17', 480, 80),
    floorButton('btn17', stackPlat.x + 48, 'door17', { latching: true }),
    fullHeightDoor('door17', 1200),
    floorButton('btn17b', 1320, 'door17', { latching: true }),
    goalOnFloor('goal17', 1530),
  ],
};
