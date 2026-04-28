import { LevelData } from '../level';
import {
  fireBar,
  floorTrap,
  goalOnFloor,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 3 — "Fire Walk"  (Pack: Solo Cadet, 1 player)
// Three lava strips on the floor and three rotating fire bars overhead.
// The platforms above each lava strip act as bridges — but the firebars
// sweep across them, so each step must be timed. Counter-rotation on the
// middle bar means you have to re-read the timing for the second crossing.

const BRIDGE_A = platformRect(304, 565, 96);
const BRIDGE_B = platformRect(624, 565, 96);
const BRIDGE_C = platformRect(944, 565, 96);

export const LEVEL_3: LevelData = {
  id: 3,
  name: 'Fire Walk',
  minPlayers: 1,

  solidRects: [groundRect(), BRIDGE_A, BRIDGE_B, BRIDGE_C],
  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap3a', 352, 96),
    floorTrap('trap3b', 672, 96),
    floorTrap('trap3c', 992, 96),
    // Pivots sit just above each bridge — segs=1 keeps the sweep tight, so
    // you can read each rotation cleanly. Alternating directions keep you
    // honest as you cross.
    fireBar('fb3a', 352, 480, 1, 1.5, 0),
    fireBar('fb3b', 672, 480, 1, -1.5, 90),
    fireBar('fb3c', 992, 480, 1, 2.0, 180),
    goalOnFloor('goal3', 1200),
  ],
};
