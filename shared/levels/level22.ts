import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 22 — "Hot Relay"  (Pack: Extreme, 2 players)
// Wide map. Player A must hold a pressure button to disable the first spike
// zone while player B passes through. Player B presses a latching button
// permanently clearing the second zone. Then both sprint to the goal.
//
// Higher difficulty: the buttons are farther apart and more spikes present.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const MAP_W = 1920;

export const LEVEL_22: LevelData = {
  id: 22,
  name: 'Hot Relay',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    // Platforms for navigating spike zones
    { x: 576,  y: 507, width: 192, height: TILE_SIZE, tileType: 'platform' },
    { x: 1280, y: 480, width: 192, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Pressure button (A holds it)
    {
      id: 'btn22a',
      type: 'button',
      x: 384,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'trap22a',
    },
    // Spike zone 1 — cleared by btn22a
    {
      id: 'trap22a',
      type: 'trap',
      x: 672,
      y: PLAYER_ON_FLOOR,
      width: 128,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: 'btn22a',
    },
    // Static spike zone 2a — always dangerous, jump over with platform
    {
      id: 'trap22b',
      type: 'trap',
      x: 864,
      y: PLAYER_ON_FLOOR,
      width: 96,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
    // Latching button (B presses this)
    {
      id: 'btn22b',
      type: 'button',
      x: 1088,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'trap22c',
      latching: true,
    },
    // Spike zone 3 — permanently cleared by btn22b
    {
      id: 'trap22c',
      type: 'trap',
      x: 1376,
      y: PLAYER_ON_FLOOR,
      width: 128,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: 'btn22b',
    },
    {
      id: 'goal22',
      type: 'goal',
      x: 1856,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
