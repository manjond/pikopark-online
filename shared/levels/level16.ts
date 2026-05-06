import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, floorTrap,
} from './_helpers';

// Level 16 — "Gate Keepers"  (Duo Allies)
// Two latching buttons in separate areas — both must be pressed before the
// door opens. Players split up, each presses one, then reunite at the exit.
// No pressure buttons used, so neither player can get trapped.

export const LEVEL_16: LevelData = {
  id: 16,
  name: 'Gate Keepers',
  minPlayers: 2,
  mapWidth: 1920,
  solidRects: [
    groundSegment(0, 1920),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    // Upper path: left branch
    floorTrap('trap16a', 480, 64),
    floorButton('btn16a', 320, 'door16', { latching: true }),
    // Lower path: right branch
    floorTrap('trap16b', 960, 64),
    floorButton('btn16b', 1120, 'door16', { latching: true }),
    // Both buttons trigger same door
    fullHeightDoor('door16', 1450),
    floorButton('btn16c', 1560, 'door16', { latching: true }),  // exit-side safety
    goalOnFloor('goal16', 1860),
  ],
};
