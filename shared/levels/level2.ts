import { LevelData } from '../level';
import {
  crumblePlatform,
  floorTrap,
  goalOnFloor,
  groundRect,
  standardSpawns,
} from './_helpers';

// Level 2 — "Crumble Steps"  (Pack: Solo Cadet, 1 player)
// A wide lava lake covers the floor mid-section. Three crumble platforms
// span it — each starts shaking 400 ms after you land, then falls. You
// must commit and keep moving; pausing on any one drops you into the lava.

const LAVA_LEFT  = 280;
const LAVA_RIGHT = 920;

export const LEVEL_2: LevelData = {
  id: 2,
  name: 'Crumble Steps',
  minPlayers: 1,

  solidRects: [groundRect()],
  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap2a', (LAVA_LEFT + LAVA_RIGHT) / 2, LAVA_RIGHT - LAVA_LEFT),
    crumblePlatform('cr2a', 320, 565, 96),
    crumblePlatform('cr2b', 528, 565, 96),
    crumblePlatform('cr2c', 736, 565, 96),
    goalOnFloor('goal2', 1180),
  ],
};
