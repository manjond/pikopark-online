import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 12 — "The Tower"  (Pack: Squad, 4 players)
// Requires a 3-player stack (3-stack-only zone: platform.top_y in [357, 389)).
// Player D (top of 3-stack) presses the high button → door opens.
// Player A (4th) waits near the door, all pass and reach goal.
//
// Physics (1280×720):
//   3-stack top-player center  = 672 − 2×32 = 608
//   3-stack feet peak          = 608 − 267 + 16 = 357
//   3-stack-only zone          = [357, 389)
//   Platform top at y=370      → 3-stack reachable (370 ≥ 357), solo/2-stack not ✓

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const MAP_W = 1280;

const TOWER_PLATFORM_Y = 370; // 3-stack-only
const TOWER_PLATFORM_X = 288;
const TOWER_PLATFORM_W = 160;

const GOAL_PLATFORM_Y = 460; // solo-reachable
const GOAL_PLATFORM_X = 960;
const GOAL_PLATFORM_W = 192;

export const LEVEL_12: LevelData = {
  id: 12,
  name: 'The Tower',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    { x: TOWER_PLATFORM_X, y: TOWER_PLATFORM_Y, width: TOWER_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
    { x: GOAL_PLATFORM_X, y: GOAL_PLATFORM_Y, width: GOAL_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 112, y: PLAYER_ON_FLOOR },
    { x: 176, y: PLAYER_ON_FLOOR },
    { x: 240, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    {
      id: 'btn12',
      type: 'button',
      x: TOWER_PLATFORM_X + TOWER_PLATFORM_W / 2,
      y: TOWER_PLATFORM_Y - TILE_SIZE / 2,
      width: TOWER_PLATFORM_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door12',
      latching: true,
    },
    {
      id: 'door12',
      type: 'door',
      x: 576,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn12',
    },
    {
      id: 'goal12',
      type: 'goal',
      x: GOAL_PLATFORM_X + GOAL_PLATFORM_W / 2,
      y: GOAL_PLATFORM_Y - TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
