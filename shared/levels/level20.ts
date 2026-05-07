import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, pushBox } from './_helpers';

// L20 — "Box Buddies" (Duo Allies)
// Two crates, two PRESSURE buttons. Each player pushes their box into the slot;
// both boxes must be in position simultaneously for the door to open.
// Latching: false — the door closes if either box moves away.
export const LEVEL_20: LevelData = {
  id: 20, name: 'Box Buddies', minPlayers: 2, mapWidth: 1920,
  solidRects: [ groundSegment(0, 1920) ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box20a', 300, FLOOR_TOP - 32),
    pushBox('box20b', 600, FLOOR_TOP - 32),
    floorButton('btn20a', 700, 'door20', { latching: false }),
    floorButton('btn20b', 900, 'door20', { latching: false }),
    fullHeightDoor('door20', 1200),
    goalOnFloor('goal20', 1840),
  ],
};
