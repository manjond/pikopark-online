import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap,
} from './_helpers';

// Level 3 — "Lava Dodge"
// Solo. Lava strips block path; platforms above bypass them.
// Two latching buttons on each side of door — no trapping possible.

const plat1 = platformRect(320, FLOOR_TOP - 112, 128);
const plat2 = platformRect(640, FLOOR_TOP - 112, 128);

export const LEVEL_3: LevelData = {
  id: 3,
  name: 'Lava Dodge',
  minPlayers: 1,
  mapWidth: 1600,
  solidRects: [
    groundSegment(0, 1600),
    plat1, plat2,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap3a', 400, 128),
    floorTrap('trap3b', 720, 112),
    floorButton('btn3a', 1050, 'door3', { latching: true }),
    fullHeightDoor('door3', 1200),
    floorButton('btn3b', 1340, 'door3', { latching: true }),
    goalOnFloor('goal3', 1520),
  ],
};
