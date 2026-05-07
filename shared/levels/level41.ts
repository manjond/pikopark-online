import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, pushBox, floorTrap } from './_helpers';

// L41 — "Box Tower" (Squad Legion)
// Four PRESSURE buttons — boxes must stay on them. Traps between box start
// positions and button slots, forcing careful pushing.
export const LEVEL_41: LevelData = {
  id: 41, name: 'Box Tower', minPlayers: 4, mapWidth: 2400,
  solidRects: [ groundSegment(0, 2400) ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box41a', 200, FLOOR_TOP - 32),
    pushBox('box41b', 380, FLOOR_TOP - 32),
    pushBox('box41c', 560, FLOOR_TOP - 32),
    pushBox('box41d', 740, FLOOR_TOP - 32),
    // Lava between box start positions — encourages using correct pushBoxes
    floorTrap('trap41a', 490, 24),    // between box41a(200) and btn41a(650)
    floorTrap('trap41b', 750, 24),    // between box41b(380) and btn41b(900)
    floorTrap('trap41c', 1010, 24),   // between box41c(560) and btn41c(1150)
    floorTrap('trap41d', 1270, 24),   // between box41d(740) and btn41d(1400)
    floorButton('btn41a', 650,  'door41', { latching: false }),
    floorButton('btn41b', 900,  'door41', { latching: false }),
    floorButton('btn41c', 1150, 'door41', { latching: false }),
    floorButton('btn41d', 1400, 'door41', { latching: false }),
    fullHeightDoor('door41', 1700),
    goalOnFloor('goal41', 2340),
  ],
};
