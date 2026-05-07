import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, pushBox } from './_helpers';

// L33 — "Box Corp" (Squad Crew)
// Four boxes push onto four latching buttons. NO lava markers (removed — buttons
// need clear floor to land on). Players learn to aim boxes at button slots.
export const LEVEL_33: LevelData = {
  id: 33, name: 'Box Corp', minPlayers: 4, mapWidth: 2400,
  solidRects: [ groundSegment(0, 2400) ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box33a', 200, FLOOR_TOP - 32),
    pushBox('box33b', 380, FLOOR_TOP - 32),
    pushBox('box33c', 560, FLOOR_TOP - 32),
    pushBox('box33d', 740, FLOOR_TOP - 32),
    floorButton('btn33a', 550,  'door33', { latching: true }),
    floorButton('btn33b', 800,  'door33', { latching: true }),
    floorButton('btn33c', 1050, 'door33', { latching: true }),
    floorButton('btn33d', 1300, 'door33', { latching: true }),
    fullHeightDoor('door33', 1700),
    goalOnFloor('goal33', 2340),
  ],
};
