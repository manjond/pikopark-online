import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, pushBox,
} from './_helpers';

// Level 20 — "Box Buddies"  (Duo Allies)
// Two crates, two latching buttons. Each player guides their crate into
// the correct slot. Both buttons must latch to open the door.

export const LEVEL_20: LevelData = {
  id: 20,
  name: 'Box Buddies',
  minPlayers: 2,
  mapWidth: 1920,
  solidRects: [
    groundSegment(0, 1920),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box20a', 300, FLOOR_TOP - 32),
    pushBox('box20b', 600, FLOOR_TOP - 32),
    floorButton('btn20a', 700, 'door20', { latching: true }),
    floorButton('btn20b', 900, 'door20', { latching: true }),
    fullHeightDoor('door20', 1200),
    goalOnFloor('goal20', 1840),
  ],
};
