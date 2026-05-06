import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap,
} from './_helpers';

// Level 18 — "Split Path"  (Duo Allies)
// Two players each take a different route (upper/lower floor split by wall).
// Each player presses their own latching button on their path.
// Both buttons must be active to open the final door.

const topPlat  = platformRect(400, FLOOR_TOP - 192, 512);   // upper route
const midWall1 = platformRect(360, FLOOR_TOP - 192, 16);    // divider pillar
const midWall2 = platformRect(912, FLOOR_TOP - 192, 16);    // divider pillar

export const LEVEL_18: LevelData = {
  id: 18,
  name: 'Split Path',
  minPlayers: 2,
  mapWidth: 1920,
  solidRects: [
    groundSegment(0, 1920),
    topPlat, midWall1, midWall2,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    // Upper route button (on top platform)
    floorButton('btn18up',   topPlat.x + topPlat.width / 2, 'door18', { latching: true }),
    // Lower route button (on floor)
    floorButton('btn18dn',   650, 'door18', { latching: true }),
    // Lava strip below the upper route entry so player commits to their choice
    floorTrap('trap18', 480, 64),
    // Final door
    fullHeightDoor('door18', 1450),
    floorButton('btn18ex', 1560, 'door18', { latching: true }),
    goalOnFloor('goal18', 1860),
  ],
};
