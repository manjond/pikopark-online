import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Layout at 1280×720 (scaled from 480×270 by ×8/3)
const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

export const LEVEL_1: LevelData = {
  id: 1,
  name: 'Level 1',

  solidRects: [
    { x: 0,   y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    // Low platform — reachable from ground (solo peak y=421, platform top y=565)
    { x: 128,  y: 565, width: 299, height: TILE_SIZE, tileType: 'platform' },
    // Mid platform — reachable from low platform
    { x: 597,  y: 472, width: 299, height: TILE_SIZE, tileType: 'platform' },
    // Goal platform — reachable from mid platform only (top y=365 < solo-peak y=421 → unreachable from ground)
    { x: 981,  y: 365, width: 213, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 21,  y: PLAYER_ON_FLOOR },
    { x: 85,  y: PLAYER_ON_FLOOR },
    { x: 149, y: PLAYER_ON_FLOOR },
    { x: 213, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    {
      id: 'btn1',
      type: 'button',
      x: 299,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door1',
    },
    {
      id: 'door1',
      type: 'door',
      x: 512,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn1',
    },
    {
      id: 'goal1',
      type: 'goal',
      x: 1088,
      y: 365 - TILE_SIZE / 2,  // 349 — player center when standing on goal platform
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
