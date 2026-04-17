import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 5 — "Grand Tour"  (Pack: Basics, 1 player)
// Wide map (1920px). Three latching buttons scattered across three sections.
// All three must be pressed to open the final door. Find them all!
//
// Physics (1280×720):
//   All button platforms top ≥ 421 → solo-reachable ✓

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const MAP_W = 1920;

// Platform for button A — left section
const PLAT_A_TOP = 507;
const PLAT_A_X   = 256;
const PLAT_A_W   = 192;

// Platform for button B — middle section (two-step jump)
const PLAT_B1_TOP = 560;  // stepping stone to reach B
const PLAT_B1_X   = 768;
const PLAT_B1_W   = 192;

const PLAT_B_TOP = 460;
const PLAT_B_X   = 864;
const PLAT_B_W   = 192;

// Platform for button C — right section
const PLAT_C_TOP = 507;
const PLAT_C_X   = 1408;
const PLAT_C_W   = 192;

export const LEVEL_5: LevelData = {
  id: 5,
  name: 'Grand Tour',
  minPlayers: 1,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    { x: PLAT_A_X,  y: PLAT_A_TOP,  width: PLAT_A_W,  height: TILE_SIZE, tileType: 'platform' },
    { x: PLAT_B1_X, y: PLAT_B1_TOP, width: PLAT_B1_W, height: TILE_SIZE, tileType: 'platform' },
    { x: PLAT_B_X,  y: PLAT_B_TOP,  width: PLAT_B_W,  height: TILE_SIZE, tileType: 'platform' },
    { x: PLAT_C_X,  y: PLAT_C_TOP,  width: PLAT_C_W,  height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Button A — left section (all three linked to the same door via AND logic)
    {
      id: 'btn5a',
      type: 'button',
      x: PLAT_A_X + PLAT_A_W / 2,   // 352
      y: PLAT_A_TOP - TILE_SIZE / 2,  // 491
      width: PLAT_A_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door5',
      latching: true,
    },
    // Button B — middle section
    {
      id: 'btn5b',
      type: 'button',
      x: PLAT_B_X + PLAT_B_W / 2,   // 960
      y: PLAT_B_TOP - TILE_SIZE / 2,  // 444
      width: PLAT_B_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door5',
      latching: true,
    },
    // Button C — right section
    {
      id: 'btn5c',
      type: 'button',
      x: PLAT_C_X + PLAT_C_W / 2,   // 1504
      y: PLAT_C_TOP - TILE_SIZE / 2,  // 491
      width: PLAT_C_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door5',
      latching: true,
    },
    {
      id: 'door5',
      type: 'door',
      x: 1728,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'goal5',
      type: 'goal',
      x: 1888,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
