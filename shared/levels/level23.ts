import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap, fireBar,
} from './_helpers';

// Level 23 — "Tag Team"  (Duo Synergy)
// A fire bar blocks a corridor — one player presses a pressure button to
// pause the firebar (deactivates it when button held). The other sprints
// through. Then the second player presses the exit-side button (latching)
// to free the first.

export const LEVEL_23: LevelData = {
  id: 23,
  name: 'Tag Team',
  minPlayers: 2,
  mapWidth: 1920,
  solidRects: [
    groundSegment(0, 1920),
    platformRect(400, FLOOR_TOP - 96, 96),   // pressure button platform
  ],
  spawnPoints: standardSpawns(),
  objects: [
    // Pressure button that "deactivates" the trap (lava) beside the fire bar
    // When held, lava turns grey and fire bar can be passed more safely
    floorButton('btn23pause', 430, 'trap23', { latching: false, requiredPlayers: 1 }),
    floorTrap('trap23', 820, 128),           // lava linked to button (deactivates)
    fireBar('fb23', 900, FLOOR_TOP - 48, 2, 1.1, 0),
    floorTrap('trap23b', 1120, 64),
    // Latching button far side — releases first player
    floorButton('btn23latch', 1250, 'door23', { latching: true }),
    fullHeightDoor('door23', 1450),
    floorButton('btn23ex', 1560, 'door23', { latching: true }),
    goalOnFloor('goal23', 1880),
  ],
};
