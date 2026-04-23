import { LevelData } from '../level';
import {
  goalOnPlatform,
  groundRect,
  movingPlatform,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 29 — "Ferry"  (Pack: Acrobatics, 1+ player)
// Introduction to moving platforms. A single horizontal ferry slides between
// two stations. Jump onto the ferry while it's on the left side, ride it
// across the gap, then jump from the ferry onto the goal platform.
// Both platform tops are solo-reachable in isolation — the challenge is
// *timing* the jumps so you don't fall in the middle.

const GOAL_PAD = platformRect(1040, 336, 192);

export const LEVEL_29: LevelData = {
  id: 29,
  name: 'Ferry',
  minPlayers: 1,

  // Ferry lives in the interactive-objects list (type='platform').
  // Static rects are: ground + goal pad only.
  solidRects: [groundRect(), GOAL_PAD],

  spawnPoints: standardSpawns(),

  objects: [
    // Ferry oscillates horizontally at y=440 (top-y; SOLO_FEET_PEAK=421 — top
    // must be ≥421 to be solo-reachable, so 440 is reachable by one player).
    // Motion from x=200 (docked left) to x=880 (docked right, near goal pad).
    // 240 px/s → ~2.8 s per crossing.
    movingPlatform('ferry29', 140, 440, 128, {
      axis: 'x',
      from: 140 + 64,  // center while docked left
      to:   880 + 64,  // center while docked right
      speed: 240,
    }),
    goalOnPlatform('goal29', GOAL_PAD),
  ],
};
