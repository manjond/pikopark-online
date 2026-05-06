import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, fireBar } from './_helpers';

const upperRoute = platformRect(500, FLOOR_TOP - 192, 640);

// L34 — "Division" (Squad Crew)
// Upper (2 players) + lower (2 players) route. All 4 buttons before the door.
export const LEVEL_34: LevelData = {
  id: 34, name: 'Division', minPlayers: 4, mapWidth: 2400,
  solidRects: [ groundSegment(0, 2400), upperRoute ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap34low', 480, 96),
    floorButton('btn34u1', upperRoute.x + 160, 'door34', { latching: true }),
    floorButton('btn34u2', upperRoute.x + 480, 'door34', { latching: true }),
    floorButton('btn34l1', 650,  'door34', { latching: true }),
    floorButton('btn34l2', 950,  'door34', { latching: true }),
    fireBar('fb34', 1200, FLOOR_TOP - 48, 2, 1.1, 0),
    fullHeightDoor('door34', 1500),
    goalOnFloor('goal34', 2340),
  ],
};
