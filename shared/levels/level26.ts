import { LevelData } from '../level';
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../constants';

// Level 26 — "Boing"  (Pack: Bounce, 2+ players)
// Introduction to the spring pad. The goal sits on a high platform that
// is *unreachable* with a normal jump (solo peak ≈ y=405), so players
// must step on the green spring to launch up and across.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;                 // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

// Spring pad sits flush on the floor
const SPRING_H = 16;
const SPRING_X = 512;
const SPRING_Y = FLOOR_TOP - SPRING_H / 2;                       // 680

// Goal platform high up — reachable only via spring launch
const GOAL_PLAT_TOP = 184;
const GOAL_PLAT_X   = 832;
const GOAL_PLAT_W   = 416;

export const LEVEL_26: LevelData = {
  id: 26,
  name: 'Boing',
  minPlayers: 1,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    { x: GOAL_PLAT_X, y: GOAL_PLAT_TOP, width: GOAL_PLAT_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 112, y: PLAYER_ON_FLOOR },
    { x: 176, y: PLAYER_ON_FLOOR },
    { x: 240, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    {
      id: 'spring26',
      type: 'spring',
      x: SPRING_X,
      y: SPRING_Y,
      width: 48,
      height: SPRING_H,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'goal26',
      type: 'goal',
      x: GOAL_PLAT_X + GOAL_PLAT_W / 2,
      y: GOAL_PLAT_TOP - TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
