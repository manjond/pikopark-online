import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 18 — "Stacked Danger"  (Pack: Hazards, 2 players)
// Stacking-only button on a high platform. Spike strips guard the approach.
// Navigate the spikes carefully before stacking.
//
// Physics: BTN_PLATFORM_TOP = 395 (stacking-only: 389 ≤ 395 < 421)

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const BTN_PLATFORM_X = 512;
const BTN_PLATFORM_W = 192;
const BTN_PLATFORM_Y = 395;  // stacking-only

const GOAL_PLATFORM_X = 896;
const GOAL_PLATFORM_W = 224;
const GOAL_PLATFORM_Y = 472;  // solo-reachable

export const LEVEL_18: LevelData = {
  id: 18,
  name: 'Stacked Danger',
  minPlayers: 2,
  mapWidth: GAME_WIDTH,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    { x: BTN_PLATFORM_X, y: BTN_PLATFORM_Y, width: BTN_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
    { x: GOAL_PLATFORM_X, y: GOAL_PLATFORM_Y, width: GOAL_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Spikes guarding the stack zone — must jump over to position
    {
      id: 'trap18a',
      type: 'trap',
      x: 384,
      y: PLAYER_ON_FLOOR,
      width: 64,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
    // Stacking-only button
    {
      id: 'btn18',
      type: 'button',
      x: BTN_PLATFORM_X + BTN_PLATFORM_W / 2,  // 608
      y: BTN_PLATFORM_Y - TILE_SIZE / 2,         // 379
      width: BTN_PLATFORM_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door18',
    },
    {
      id: 'door18',
      type: 'door',
      x: 768,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn18',
    },
    // Spikes on the path to the goal platform — jump onto the platform
    {
      id: 'trap18b',
      type: 'trap',
      x: 992,
      y: PLAYER_ON_FLOOR,
      width: 64,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'goal18',
      type: 'goal',
      x: GOAL_PLATFORM_X + GOAL_PLATFORM_W / 2,  // 1008
      y: GOAL_PLATFORM_Y - TILE_SIZE / 2,          // 456
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
