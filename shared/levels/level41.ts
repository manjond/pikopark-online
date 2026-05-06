import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, pushBox, floorTrap,
} from './_helpers';

// Level 41 — "Box Tower"  (Squad Legion)
// Four boxes, four latching buttons on elevated platforms.
// Push each box up the ramp to its button slot.

const btnPlat1 = platformRect(700,  FLOOR_TOP - 48, 96);
const btnPlat2 = platformRect(1000, FLOOR_TOP - 48, 96);
const btnPlat3 = platformRect(1300, FLOOR_TOP - 48, 96);
const btnPlat4 = platformRect(1600, FLOOR_TOP - 48, 96);

export const LEVEL_41: LevelData = {
  id: 41,
  name: 'Box Tower',
  minPlayers: 4,
  mapWidth: 2400,
  solidRects: [
    groundSegment(0, 2400),
    btnPlat1, btnPlat2, btnPlat3, btnPlat4,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box41a', 200, FLOOR_TOP - 32),
    pushBox('box41b', 400, FLOOR_TOP - 32),
    pushBox('box41c', 600, FLOOR_TOP - 32),
    pushBox('box41d', 800, FLOOR_TOP - 32),
    floorTrap('trap41a', 670, 24),
    floorTrap('trap41b', 970, 24),
    floorTrap('trap41c', 1270, 24),
    floorTrap('trap41d', 1570, 24),
    floorButton('btn41a', btnPlat1.x + 48, 'door41', { latching: true }),
    floorButton('btn41b', btnPlat2.x + 48, 'door41', { latching: true }),
    floorButton('btn41c', btnPlat3.x + 48, 'door41', { latching: true }),
    floorButton('btn41d', btnPlat4.x + 48, 'door41', { latching: true }),
    fullHeightDoor('door41', 1900),
    goalOnFloor('goal41', 2340),
  ],
};
