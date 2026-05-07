import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundRect, floorButton, fullHeightDoor, standardSpawns, pushBox } from './_helpers';

// L9 — "Box Job" (Solo Adept): push box to pressure button, box holds door open.
// No lava — box is the challenge, not a hazard crossing.
export const LEVEL_9: LevelData = {
  id: 9, name: 'Box Job', minPlayers: 1, mapWidth: 1440,
  solidRects: [ groundRect(1440) ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box9', 300, FLOOR_TOP - 32),
    floorButton('btn9', 820, 'door9', { latching: false }),
    fullHeightDoor('door9', 1050),
    goalOnFloor('goal9', 1380),
  ],
};
