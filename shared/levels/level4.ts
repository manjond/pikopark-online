import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 4 — "Together"
// Wide button requires 2 simultaneous players. Once door opens, players
// sprint right together. Goal sits on an elevated platform — solo-reachable
// (peak y=421 > platform top y=507, meaning 421 is lower, so reachable).

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const GOAL_PLATFORM_X   = 939;
const GOAL_PLATFORM_W   = 256;
const GOAL_PLATFORM_TOP = 507; // solo-reachable (507 > 421 in y-down means it's lower than peak)

export const LEVEL_4: LevelData = {
  id: 4,
  name: 'Together',

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    { x: GOAL_PLATFORM_X, y: GOAL_PLATFORM_TOP, width: GOAL_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    {
      id: 'btn4',
      type: 'button',
      x: 341,
      y: PLAYER_ON_FLOOR,
      width: 171,   // ~5 tiles — room for two side-by-side players
      height: 8,
      requiredPlayers: 2,
      linkedId: 'door4',
    },
    {
      id: 'door4',
      type: 'door',
      x: 640,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn4',
    },
    {
      id: 'goal4',
      type: 'goal',
      x: GOAL_PLATFORM_X + GOAL_PLATFORM_W / 2,   // 1067
      y: GOAL_PLATFORM_TOP - TILE_SIZE / 2,         // 491
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
