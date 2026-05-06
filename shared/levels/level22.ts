import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap } from './_helpers';

const platA = platformRect(480, FLOOR_TOP - 128, 96);
const platB = platformRect(1000, FLOOR_TOP - 128, 96);

// L22 — "High Five" (Duo Synergy)
// Two separate latching buttons on elevated platforms. Both before their doors.
export const LEVEL_22: LevelData = {
  id: 22, name: 'High Five', minPlayers: 2, mapWidth: 2000,
  solidRects: [ groundSegment(0, 2000), platA, platB ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap22a', 560, 64),
    floorTrap('trap22b', 1080, 64),
    floorButton('btn22a', platA.x + 48, 'door22a', { latching: true }),
    floorButton('btn22b', platB.x + 48, 'door22b', { latching: true }),
    fullHeightDoor('door22a', 700),
    fullHeightDoor('door22b', 1200),
    goalOnFloor('goal22', 1900),
  ],
};
