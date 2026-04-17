import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 6 — "Lift Off"  (Pack: Duo, 2 players)
// One player is the step-stool; the other stacks and jumps to the button
// platform (stacking-only zone). Door opens → both players reach the goal.
//
// Physics (1280×720):
//   Solo feet peak y   = 421  → solo CANNOT reach platform at y=395
//   Stacked feet peak  = 389  → stacked CAN reach platform at y=395 ✓

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const MAP_W = 1280;

const BTN_PLATFORM_X = 224;
const BTN_PLATFORM_W = 192;
const BTN_PLATFORM_Y = 395; // stacking-only

const GOAL_PLATFORM_X = 960;
const GOAL_PLATFORM_W = 192;
const GOAL_PLATFORM_Y = 460; // solo-reachable (460 > 421 ✓)

export const LEVEL_6: LevelData = {
  id: 6,
  name: 'Lift Off',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    { x: BTN_PLATFORM_X, y: BTN_PLATFORM_Y, width: BTN_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
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
      id: 'btn6',
      type: 'button',
      x: BTN_PLATFORM_X + BTN_PLATFORM_W / 2,  // 320 — centre of platform
      y: BTN_PLATFORM_Y - TILE_SIZE / 2,         // 379 — on top of platform
      width: BTN_PLATFORM_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door6',
    },
    {
      id: 'door6',
      type: 'door',
      x: 640,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn6',
    },
    {
      id: 'goal6',
      type: 'goal',
      x: GOAL_PLATFORM_X + GOAL_PLATFORM_W / 2,   // 1056
      y: GOAL_PLATFORM_Y - TILE_SIZE / 2,           // 444
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
