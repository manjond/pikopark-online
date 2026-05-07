import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, pushBox } from './_helpers';

// L33 — "Box Corp" (Squad Crew)
// Four boxes, four PRESSURE buttons. ALL four boxes must be in their slots
// simultaneously to open the door — coordination required across the whole squad.
export const LEVEL_33: LevelData = {
  id: 33, name: 'Box Corp', minPlayers: 4, mapWidth: 2400,
  solidRects: [ groundSegment(0, 2400) ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box33a', 200, FLOOR_TOP - 32),
    pushBox('box33b', 380, FLOOR_TOP - 32),
    pushBox('box33c', 560, FLOOR_TOP - 32),
    pushBox('box33d', 740, FLOOR_TOP - 32),
    floorButton('btn33a', 600,  'door33', { latching: false }),
    floorButton('btn33b', 850,  'door33', { latching: false }),
    floorButton('btn33c', 1100, 'door33', { latching: false }),
    floorButton('btn33d', 1350, 'door33', { latching: false }),
    fullHeightDoor('door33', 1700),
    goalOnFloor('goal33', 2340),
  ],
};
