import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, floorTrap } from './_helpers';

// L16 — "Gate Keepers" (Duo Allies)
// Two separate latching buttons, both LEFT of the door. Each player presses one.
export const LEVEL_16: LevelData = {
  id: 16, name: 'Gate Keepers', minPlayers: 2, mapWidth: 1920,
  solidRects: [ groundSegment(0, 1920) ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap16a', 480, 64),
    floorTrap('trap16b', 960, 64),
    floorButton('btn16a', 320,  'door16', { latching: true }),
    floorButton('btn16b', 1120, 'door16', { latching: true }),
    fullHeightDoor('door16', 1450),
    goalOnFloor('goal16', 1860),
  ],
};
