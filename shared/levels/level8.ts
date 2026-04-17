import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 8 — "Double Stack"  (Pack: Duo, 2 players)
// Two stacking-only platforms in sequence, each with a latching button.
// Both must be activated (via stacking) before the final door opens.
// Because buttons are latching, only ONE player needs to reach each — but
// stacking IS required to get there.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const MAP_W = 1280;

// Both platforms are in stacking-only zone (y in [389, 421))
const PLAT_A_X = 224;
const PLAT_A_Y = 410;
const PLAT_A_W = 160;

const PLAT_B_X = 672;
const PLAT_B_Y = 395;  // slightly higher = harder stack
const PLAT_B_W = 160;

const GOAL_PLATFORM_X = 992;
const GOAL_PLATFORM_Y = 470; // solo-reachable
const GOAL_PLATFORM_W = 192;

export const LEVEL_8: LevelData = {
  id: 8,
  name: 'Double Stack',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    { x: PLAT_A_X, y: PLAT_A_Y, width: PLAT_A_W, height: TILE_SIZE, tileType: 'platform' },
    { x: PLAT_B_X, y: PLAT_B_Y, width: PLAT_B_W, height: TILE_SIZE, tileType: 'platform' },
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
      id: 'btn8a',
      type: 'button',
      x: PLAT_A_X + PLAT_A_W / 2,
      y: PLAT_A_Y - TILE_SIZE / 2,
      width: PLAT_A_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door8',
      latching: true,
    },
    {
      id: 'btn8b',
      type: 'button',
      x: PLAT_B_X + PLAT_B_W / 2,
      y: PLAT_B_Y - TILE_SIZE / 2,
      width: PLAT_B_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door8',
      latching: true,
    },
    {
      id: 'door8',
      type: 'door',
      x: 853,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: '',   // propagated from both buttons manually via server logic
    },
    {
      id: 'goal8',
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
