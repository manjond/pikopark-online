import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, pushBox, floorTrap,
} from './_helpers';

// Level 14 — "Box Puzzle"  (Solo Master)
// Two crates must be pushed onto two latching buttons to open two doors.
// Once a box lands on its button, the door opens permanently — so the player
// just needs to push each box into position, then walk through.

const btnSlot1 = platformRect(600, FLOOR_TOP - 32, 96);
const btnSlot2 = platformRect(900, FLOOR_TOP - 32, 96);

export const LEVEL_14: LevelData = {
  id: 14,
  name: 'Box Puzzle',
  minPlayers: 1,
  mapWidth: 1600,
  solidRects: [
    groundSegment(0, 1600),
    btnSlot1, btnSlot2,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box14a', 350, FLOOR_TOP - 32),
    pushBox('box14b', 700, FLOOR_TOP - 32),
    floorTrap('trap14a', 480, 16),
    floorTrap('trap14b', 880, 16),
    // Latching: box lands → button stays active → door stays open
    floorButton('btn14a', btnSlot1.x + 48, 'door14a', { latching: true }),
    floorButton('btn14b', btnSlot2.x + 48, 'door14b', { latching: true }),
    fullHeightDoor('door14a', 1100),
    fullHeightDoor('door14b', 1250),
    goalOnFloor('goal14', 1520),
  ],
};
