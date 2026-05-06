import { LevelData } from '../level';
import {
  FLOOR_TOP, SOLO_FEET_PEAK,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect,
} from './_helpers';

// Level 1 — "Welcome Gate"
// Solo. Introduce: jump a pit, then press a latching button to open the door,
// walk through. Both sides of the door have a button so you never get trapped.
// Pit: x 320-480 (160 px gap, well within 400 px solo reach at floor level).

const plat1 = platformRect(560, FLOOR_TOP - 80, 160);    // y=608, reachable

export const LEVEL_1: LevelData = {
  id: 1,
  name: 'Welcome Gate',
  minPlayers: 1,
  mapWidth: 1600,

  solidRects: [
    groundSegment(0, 320),           // left floor
    groundSegment(480, 1120),        // right floor (gap 320-480, 160px)
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Latching button left of door — press to open, stays open forever
    floorButton('btn1', 700, 'door1', { latching: true }),
    // Door between the two sections
    fullHeightDoor('door1', 840),
    // Latching button right of door so nobody gets trapped
    floorButton('btn2', 980, 'door1', { latching: true }),
    // Exit door at the far right
    goalOnFloor('goal1', 1480),
  ],
};
