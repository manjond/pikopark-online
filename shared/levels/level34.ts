import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap, fireBar,
} from './_helpers';

// Level 34 — "Division"  (Squad Crew)
// Players split into two pairs. Pair A presses buttons on the upper route,
// Pair B on the lower. Both routes must be cleared for the final door.

const upperRoute = platformRect(500, FLOOR_TOP - 192, 640);

export const LEVEL_34: LevelData = {
  id: 34,
  name: 'Division',
  minPlayers: 4,
  mapWidth: 2400,
  solidRects: [
    groundSegment(0, 2400),
    upperRoute,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap34low', 480, 96),
    // Upper route: two players press these
    floorButton('btn34u1', upperRoute.x + 160, 'door34', { latching: true }),
    floorButton('btn34u2', upperRoute.x + 480, 'door34', { latching: true }),
    // Lower route: two players press these
    floorButton('btn34l1', 650,  'door34', { latching: true }),
    floorButton('btn34l2', 950,  'door34', { latching: true }),
    fireBar('fb34', 1200, FLOOR_TOP - 48, 2, 1.1, 0),
    // All four buttons share door34 — all must be pressed
    fullHeightDoor('door34', 1500),
    floorButton('btn34ex', 1610, 'door34', { latching: true }),
    goalOnFloor('goal34', 2340),
  ],
};
