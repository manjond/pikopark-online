import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundRect, floorButton, fullHeightDoor, standardSpawns, pushBox } from './_helpers';

// L41 — "Box Tower" (Squad Legion): four pressure buttons. No lava — box routing IS the puzzle.
export const LEVEL_41: LevelData = {
  id: 41, name: 'Box Tower', minPlayers: 4, mapWidth: 2400,
  solidRects: [ groundRect(2400) ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box41a', 200, FLOOR_TOP - 32),
    pushBox('box41b', 380, FLOOR_TOP - 32),
    pushBox('box41c', 560, FLOOR_TOP - 32),
    pushBox('box41d', 740, FLOOR_TOP - 32),
    floorButton('btn41a', 950,  'door41', { latching: false }),
    floorButton('btn41b', 1150, 'door41', { latching: false }),
    floorButton('btn41c', 1350, 'door41', { latching: false }),
    floorButton('btn41d', 1550, 'door41', { latching: false }),
    fullHeightDoor('door41', 1800),
    goalOnFloor('goal41', 2340),
  ],
};
