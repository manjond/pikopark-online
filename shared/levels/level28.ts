import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, pushBox, floorTrap } from './_helpers';

// L28 — "Box Buddy" (Duo Trust)
// Two PRESSURE buttons (no platform slots). Each player pushes their crate to a
// button slot; both must hold simultaneously for the AND-door to open.
export const LEVEL_28: LevelData = {
  id: 28, name: 'Box Buddy', minPlayers: 2, mapWidth: 1920,
  solidRects: [ groundSegment(0, 1920) ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box28a', 300, FLOOR_TOP - 32),
    pushBox('box28b', 600, FLOOR_TOP - 32),
    floorTrap('trap28a', 490, 48),
    floorTrap('trap28b', 800, 48),
    floorButton('btn28a', 650,  'door28', { latching: false }),
    floorButton('btn28b', 1000, 'door28', { latching: false }),
    fullHeightDoor('door28', 1300),
    goalOnFloor('goal28', 1860),
  ],
};
