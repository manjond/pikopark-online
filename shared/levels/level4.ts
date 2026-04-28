import { LevelData } from '../level';
import {
  floorTrap,
  goalOnFloor,
  groundRect,
  icePlatform,
  standardSpawns,
} from './_helpers';

// Level 4 — "Slip Spike"  (Pack: Solo Cadet, 1 player)
// Two ice runways hang above two lava lakes. The spawn rim is bare floor;
// you have to commit to each ice runway and brake at the gap of bare
// floor between them — overshoot and the second lava strip ends you.

export const LEVEL_4: LevelData = {
  id: 4,
  name: 'Slip Spike',
  minPlayers: 1,

  solidRects: [
    groundRect(),
    icePlatform(288, 565, 384),  // ice over the first lava
    icePlatform(800, 565, 384),  // ice over the second lava
  ],

  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap4a', 480, 384),
    floorTrap('trap4b', 992, 384),
    goalOnFloor('goal4', 1200),
  ],
};
