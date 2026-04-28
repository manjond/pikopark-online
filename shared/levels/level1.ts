import { LevelData } from '../level';
import {
  fireBar,
  floorTrap,
  goalOnFloor,
  groundRect,
  standardSpawns,
} from './_helpers';

// Level 1 — "Spark Run"  (Pack: Solo Cadet, 1 player)
// Easy intro to lava + firebars. Two short lava strips you can clear with
// a running jump, plus a slow 2-segment firebar at the end whose lower
// sweep dips toward the floor — wait for it to be vertical, then run past.

export const LEVEL_1: LevelData = {
  id: 1,
  name: 'Spark Run',
  minPlayers: 1,

  solidRects: [groundRect()],
  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap1a', 360, 96),
    floorTrap('trap1b', 640, 128),
    // 2-segment firebar at y=608 — radius 64, dips to y=672 (just above floor).
    // Slow rotation (1 rad/s ≈ one full turn every 6 s) gives plenty of timing.
    fireBar('fb1', 960, 608, 2, 1.0, 0),
    goalOnFloor('goal1', 1200),
  ],
};
