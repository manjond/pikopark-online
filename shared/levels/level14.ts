import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, pushBox, floorTrap } from './_helpers';

// L14 — "Box Puzzle" (Solo Master)
// Two boxes, two pressure buttons, two doors. Push each box to its slot;
// both doors only stay open while each box is in place.
export const LEVEL_14: LevelData = {
  id: 14, name: 'Box Puzzle', minPlayers: 1, mapWidth: 1600,
  solidRects: [ groundSegment(0, 1600) ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box14a', 300, FLOOR_TOP - 32),
    pushBox('box14b', 550, FLOOR_TOP - 32),
    floorTrap('trap14a', 440, 48),
    floorTrap('trap14b', 740, 48),
    // Pressure: box must stay on button to keep door open
    floorButton('btn14a', 640,  'door14a', { latching: false }),
    floorButton('btn14b', 960,  'door14b', { latching: false }),
    fullHeightDoor('door14a', 1050),
    fullHeightDoor('door14b', 1200),
    goalOnFloor('goal14', 1530),
  ],
};
