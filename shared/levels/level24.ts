import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 24 — "Spike Pinnacle"  (Pack: Extreme, 2 players)
// Stacking to a high platform (2-player stack zone) with spikes below.
// Wide map. Spike bridge section + stacking mechanic combined.
//
// Physics:
//   Platform top = 395 (stacking-only zone = [389, 421))
//   Solo feet peak 421 > 395 → unreachable solo ✓
//   2-stack feet peak 389 ≤ 395 → reachable via stacking ✓

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const MAP_W = 1920;

const BTN_PLAT_X = 256;
const BTN_PLAT_W = 192;
const BTN_PLAT_Y = 395;  // 2-stack only

const GOAL_PLAT_X = 1536;
const GOAL_PLAT_W = 256;
const GOAL_PLAT_Y = 420;  // barely reachable solo

export const LEVEL_24: LevelData = {
  id: 24,
  name: 'Spike Pinnacle',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    { x: BTN_PLAT_X, y: BTN_PLAT_Y, width: BTN_PLAT_W, height: TILE_SIZE, tileType: 'platform' },
    // Mid platforms for bridge section
    { x: 640,  y: 507, width: 192, height: TILE_SIZE, tileType: 'platform' },
    { x: 1024, y: 480, width: 192, height: TILE_SIZE, tileType: 'platform' },
    { x: GOAL_PLAT_X, y: GOAL_PLAT_Y, width: GOAL_PLAT_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // High button — 2-player stack needed
    {
      id: 'btn24',
      type: 'button',
      x: BTN_PLAT_X + BTN_PLAT_W / 2,  // 352
      y: BTN_PLAT_Y - TILE_SIZE / 2,    // 379
      width: BTN_PLAT_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door24',
    },
    {
      id: 'door24',
      type: 'door',
      x: 512,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn24',
    },
    // Spike zones in the bridge section
    { id: 'trap24a', type: 'trap', x: 736,  y: PLAYER_ON_FLOOR, width: 96,  height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    { id: 'trap24b', type: 'trap', x: 1120, y: PLAYER_ON_FLOOR, width: 96,  height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    { id: 'trap24c', type: 'trap', x: 1344, y: PLAYER_ON_FLOOR, width: 128, height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    {
      id: 'goal24',
      type: 'goal',
      x: GOAL_PLAT_X + GOAL_PLAT_W / 2,  // 1664
      y: GOAL_PLAT_Y - TILE_SIZE / 2,      // 404
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
