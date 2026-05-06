import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, pushBox, floorTrap,
} from './_helpers';

// Level 33 — "Box Corp"  (Squad Crew)
// Four crates, four latching buttons. Each of the 4 players pushes one box
// into its slot. Once all four buttons latch, the door opens.

export const LEVEL_33: LevelData = {
  id: 33,
  name: 'Box Corp',
  minPlayers: 4,
  mapWidth: 2400,
  solidRects: [
    groundSegment(0, 2400),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('box33a', 200, FLOOR_TOP - 32),
    pushBox('box33b', 450, FLOOR_TOP - 32),
    pushBox('box33c', 700, FLOOR_TOP - 32),
    pushBox('box33d', 950, FLOOR_TOP - 32),
    floorTrap('trap33a', 490, 16),
    floorTrap('trap33b', 740, 16),
    floorTrap('trap33c', 990, 16),
    floorTrap('trap33d', 1240, 16),
    floorButton('btn33a', 500,  'door33', { latching: true }),
    floorButton('btn33b', 750,  'door33', { latching: true }),
    floorButton('btn33c', 1000, 'door33', { latching: true }),
    floorButton('btn33d', 1250, 'door33', { latching: true }),
    fullHeightDoor('door33', 1700),
    goalOnFloor('goal33', 2340),
  ],
};
