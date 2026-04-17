import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 3 — "Up and Over"
// Button sits on a stacking-only platform (top_y=395, stacking zone [389,421)).
// Player A is step-stool. Player B stacks, reaches button platform, steps on it.
// Door opens. Player A walks through to reach the ground-level goal.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const BTN_PLATFORM_X   = 256;
const BTN_PLATFORM_W   = 213;
const BTN_PLATFORM_TOP = 395; // stacking-only

export const LEVEL_3: LevelData = {
  id: 3,
  name: 'Up and Over',
  minPlayers: 2,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    { x: BTN_PLATFORM_X, y: BTN_PLATFORM_TOP, width: BTN_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    {
      id: 'btn3',
      type: 'button',
      x: BTN_PLATFORM_X + BTN_PLATFORM_W / 2,  // 362 — centre of platform
      y: BTN_PLATFORM_TOP - TILE_SIZE / 2,       // 379 — sits on top of platform
      width: BTN_PLATFORM_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door3',
    },
    {
      id: 'door3',
      type: 'door',
      x: 683,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn3',
    },
    {
      id: 'goal3',
      type: 'goal',
      x: 1152,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
