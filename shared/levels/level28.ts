import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, pushBox, platformRect, floorTrap,
} from './_helpers';

// Level 28 — "Box Buddy"  (Duo Trust)
// Two latching buttons on elevated slots — each player pushes their crate up
// and into position. Once both latch, the door opens permanently.

const slot1 = platformRect(600,  FLOOR_TOP - 32, 96);
const slot2 = platformRect(1000, FLOOR_TOP - 32, 96);

export const LEVEL_28: LevelData = {
  id: 28,
  name: 'Box Buddy',
  minPlayers: 2,
  mapWidth: 1920,
  solidRects: [
    groundSegment(0, 1920),
    slot1, slot2,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box28a', 350, FLOOR_TOP - 32),
    pushBox('box28b', 750, FLOOR_TOP - 32),
    floorTrap('trap28a', 520, 24),
    floorTrap('trap28b', 920, 24),
    floorButton('btn28a', slot1.x + 48, 'door28', { latching: true }),
    floorButton('btn28b', slot2.x + 48, 'door28', { latching: true }),
    fullHeightDoor('door28', 1300),
    goalOnFloor('goal28', 1860),
  ],
};
