import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap, lavaWall,
} from './_helpers';

// Level 24 — "Lava Dash Duo"  (Duo Synergy)
// Lava wall 110 px/s. Two players must each press a latching button
// on their separate paths before both can reach the exit door.
// Map 2800 px wide.

const topPath = platformRect(800, FLOOR_TOP - 160, 480);

export const LEVEL_24: LevelData = {
  id: 24,
  name: 'Lava Dash Duo',
  minPlayers: 2,
  mapWidth: 2800,
  solidRects: [
    groundSegment(0, 2800),
    topPath,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall24', -64, 110),
    floorTrap('trap24a', 500, 80),
    // Upper path button (one player climbs up)
    floorButton('btn24up', topPath.x + topPath.width / 2, 'door24', { latching: true }),
    // Lower path button
    floorButton('btn24dn', 1400, 'door24', { latching: true }),
    floorTrap('trap24b', 1600, 96),
    fullHeightDoor('door24', 2100),
    floorButton('btn24ex', 2200, 'door24', { latching: true }),
    goalOnFloor('goal24', 2720),
  ],
};
