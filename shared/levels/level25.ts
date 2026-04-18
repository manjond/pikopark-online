import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 25 — "The Final Trial"  (Pack: Extreme, 2 players)
// Everything combined: stacking, pressure buttons, latching buttons, spike
// traps, and a wide map. The ultimate test of teamwork.
//
// Sequence:
//   1. Stack to press btn25a (stacking-only, latching) → door 1 opens forever
//   2. Both players pass; one holds pressure btn25b → deactivates spike zone 1
//   3. The other passes through, presses latching btn25c → zone 2 safe + door 2 opens
//   4. They navigate the final spike section to the goal
// btn25a is latching so the stacker can jump down and keep going — otherwise
// the 2-player session couldn't complete the level.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const MAP_W = 2560;

const BTN_PLAT_X = 192;
const BTN_PLAT_W = 192;
const BTN_PLAT_Y = 395;  // stacking-only

export const LEVEL_25: LevelData = {
  id: 25,
  name: 'The Final Trial',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    { x: BTN_PLAT_X, y: BTN_PLAT_Y, width: BTN_PLAT_W, height: TILE_SIZE, tileType: 'platform' },
    // Mid-section platforms
    { x: 1024, y: 533, width: 192, height: TILE_SIZE, tileType: 'platform' },
    { x: 1600, y: 507, width: 192, height: TILE_SIZE, tileType: 'platform' },
    { x: 2176, y: 480, width: 192, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Step 1: Stacking-only latching button
    {
      id: 'btn25a',
      type: 'button',
      x: BTN_PLAT_X + BTN_PLAT_W / 2,  // 288
      y: BTN_PLAT_Y - TILE_SIZE / 2,    // 379
      width: BTN_PLAT_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door25a',
      latching: true,
    },
    {
      id: 'door25a',
      type: 'door',
      x: 512,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn25a',
    },
    // Step 2: Pressure button (Player A holds) — clears spike zone 1
    {
      id: 'btn25b',
      type: 'button',
      x: 704,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'trap25a',
    },
    {
      id: 'trap25a',
      type: 'trap',
      x: 896,
      y: PLAYER_ON_FLOOR,
      width: 96,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: 'btn25b',
    },
    // Step 3: Latching button (Player B presses) — clears spike zone 2
    {
      id: 'btn25c',
      type: 'button',
      x: 1152,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'trap25b',
      latching: true,
    },
    {
      id: 'trap25b',
      type: 'trap',
      x: 1344,
      y: PLAYER_ON_FLOOR,
      width: 96,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: 'btn25c',
    },
    // Step 4: Second door — opens after btn25c (latching) pressed
    {
      id: 'door25b',
      type: 'door',
      x: 1536,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn25c',
    },
    // Final spike gauntlet — no shortcuts
    { id: 'trap25c', type: 'trap', x: 1696, y: PLAYER_ON_FLOOR, width: 96,  height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    { id: 'trap25d', type: 'trap', x: 1920, y: PLAYER_ON_FLOOR, width: 128, height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    { id: 'trap25e', type: 'trap', x: 2272, y: PLAYER_ON_FLOOR, width: 96,  height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    {
      id: 'goal25',
      type: 'goal',
      x: 2496,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
