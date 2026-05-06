import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap } from './_helpers';

// L19 — "Two Gates" (Duo Allies)
// Two separate doors, each with its own latching button. Both must be pressed.
// Players split up, press their button, meet at exit.
export const LEVEL_19: LevelData = {
  id: 19, name: 'Two Gates', minPlayers: 2, mapWidth: 2000,
  solidRects: [ groundSegment(0, 2000), platformRect(700, FLOOR_TOP - 80, 96) ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap19a', 480, 80),
    floorButton('btn19a', 360,  'door19a', { latching: true }),
    fullHeightDoor('door19a', 600),
    floorTrap('trap19b', 1100, 80),
    floorButton('btn19b', 950,  'door19b', { latching: true }),
    fullHeightDoor('door19b', 1300),
    goalOnFloor('goal19', 1940),
  ],
};
