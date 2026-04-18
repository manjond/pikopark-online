import { LevelData } from '../level';
import {
  floorSpring,
  goalOnPlatform,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 26 — "Boing"  (Pack: Bounce, 1+ players)
// Introduction to the spring pad. The goal sits on a high platform that
// is *unreachable* with a normal jump (solo peak ≈ y=405), so players
// must step on the green spring to launch up and across.

const GOAL_PLAT = platformRect(832, 184, 416);

export const LEVEL_26: LevelData = {
  id: 26,
  name: 'Boing',
  minPlayers: 1,

  solidRects: [groundRect(), GOAL_PLAT],

  spawnPoints: standardSpawns(),

  objects: [
    floorSpring('spring26', 512),
    goalOnPlatform('goal26', GOAL_PLAT),
  ],
};
