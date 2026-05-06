import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap,
} from './_helpers';

// Level 22 — "Cross Guard"  (Duo Synergy)
// Two simultaneous pressure buttons (requiredPlayers: 1 each) linked to
// two separate doors. Both players must press their button at the same time
// to open both doors. Coordinated timing required.

export const LEVEL_22: LevelData = {
  id: 22,
  name: 'Cross Guard',
  minPlayers: 2,
  mapWidth: 2000,
  solidRects: [
    groundSegment(0, 2000),
    platformRect(500, FLOOR_TOP - 128, 96),
    platformRect(1000, FLOOR_TOP - 128, 96),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap22a', 600, 64),
    floorTrap('trap22b', 1100, 64),
    // Two pressure buttons: player A presses left, player B presses right
    // Both must be held simultaneously to have both doors open
    floorButton('btn22a', 400, 'door22a', { latching: false, requiredPlayers: 1 }),
    floorButton('btn22b', 850, 'door22b', { latching: false, requiredPlayers: 1 }),
    fullHeightDoor('door22a', 700),
    fullHeightDoor('door22b', 1200),
    // Latching buttons past each door so players can release pressure buttons
    floorButton('btn22al', 760, 'door22a', { latching: true }),
    floorButton('btn22bl', 1260, 'door22b', { latching: true }),
    goalOnFloor('goal22', 1900),
  ],
};
