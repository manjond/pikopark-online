import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, lavaWall,
} from './_helpers';

// Level 5 — "Sprint!"
// Solo. A lava wall advances from the left at 90 px/s. Player must run right,
// press a latching button, and enter the exit before the wall catches up.
// Map is 2400 px wide — at 90 px/s the wall takes ~26 s to cross the map,
// giving the player plenty of time but requiring steady movement.

const plat1 = platformRect(800,  FLOOR_TOP - 96, 128);   // hop over lava strip
const plat2 = platformRect(1280, FLOOR_TOP - 96, 128);   // second hop

export const LEVEL_5: LevelData = {
  id: 5,
  name: 'Sprint!',
  minPlayers: 1,
  mapWidth: 2400,
  solidRects: [
    groundSegment(0, 2400),
    plat1, plat2,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    // Lava wall starts off-screen left, moves right at 90 px/s
    lavaWall('wall5', -64, 90),
    // A few lava strips to add routing variety
    floorButton('btn5', 1550, 'door5', { latching: true }),
    fullHeightDoor('door5', 1750),
    floorButton('btn5b', 1880, 'door5', { latching: true }),
    goalOnFloor('goal5', 2300),
  ],
};
