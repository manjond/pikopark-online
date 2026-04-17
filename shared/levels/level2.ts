import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Physics reference (1280×720):
//   Max jump height  = 1067²/(2×2133) ≈ 267 px
//   Solo feet peak   = 688 − 267 = 421  (y decreases upward)
//   Stacked feet peak = (672−32)+16 − 267 = 389
//   Stacking-only zone: platform top_y < 421 AND top_y >= 389
//   High platform top = 395 → in that zone ✓

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const HIGH_PLATFORM_TOP = 395; // stacking-only: unreachable solo (395 < 421), reachable stacked (395 ≥ 389)
const HIGH_PLATFORM_X   = 853;
const HIGH_PLATFORM_W   = 256;

export const LEVEL_2: LevelData = {
  id: 2,
  name: 'Shoulders',

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    // Low stepping-stone on the left — reachable solo, guides players right
    { x: 171, y: 560, width: 213, height: TILE_SIZE, tileType: 'platform' },
    // High platform — ONLY reachable by stacking
    { x: HIGH_PLATFORM_X, y: HIGH_PLATFORM_TOP, width: HIGH_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    {
      id: 'goal2',
      type: 'goal',
      x: HIGH_PLATFORM_X + HIGH_PLATFORM_W / 2 - TILE_SIZE / 2,  // 965
      y: HIGH_PLATFORM_TOP - TILE_SIZE / 2,                        // 379
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
