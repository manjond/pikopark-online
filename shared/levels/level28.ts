import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundRect, floorButton, fullHeightDoor, standardSpawns, pushBox } from './_helpers';

// L28 — "Box Buddy" (Duo Trust): two pressure buttons, no lava blocking box paths.
export const LEVEL_28: LevelData = {
  id: 28, name: 'Box Buddy', minPlayers: 2, mapWidth: 1920,
  solidRects: [ groundRect(1920) ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box28a', 300, FLOOR_TOP - 32),
    pushBox('box28b', 600, FLOOR_TOP - 32),
    floorButton('btn28a', 650,  'door28', { latching: false }),
    floorButton('btn28b', 1000, 'door28', { latching: false }),
    fullHeightDoor('door28', 1300),
    goalOnFloor('goal28', 1860),
  ],
};
