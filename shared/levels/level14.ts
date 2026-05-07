import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundRect, floorButton, fullHeightDoor, standardSpawns, pushBox } from './_helpers';

// L14 — "Box Puzzle" (Solo Master): two boxes, two pressure buttons, two doors.
// No lava between boxes and buttons.
export const LEVEL_14: LevelData = {
  id: 14, name: 'Box Puzzle', minPlayers: 1, mapWidth: 1600,
  solidRects: [ groundRect(1600) ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box14a', 300, FLOOR_TOP - 32),
    pushBox('box14b', 550, FLOOR_TOP - 32),
    floorButton('btn14a', 640,  'door14a', { latching: false }),
    floorButton('btn14b', 960,  'door14b', { latching: false }),
    fullHeightDoor('door14a', 1050),
    fullHeightDoor('door14b', 1200),
    goalOnFloor('goal14', 1530),
  ],
};
