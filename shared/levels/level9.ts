import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 9 — "Gauntlet"  (Pack: Duo, 2 players)
// Wide 2560px map divided into 3 sections:
//   Section 1 (0–768):   pressure relay  — A holds, B crosses
//   Section 2 (768–1792): stacking puzzle — stack to reach latching button
//   Section 3 (1792–2560): simultaneous 2-player button → final door + goal

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const MAP_W = 2560;

const STACK_PLATFORM_X = 960;
const STACK_PLATFORM_Y = 395; // stacking-only
const STACK_PLATFORM_W = 192;

export const LEVEL_9: LevelData = {
  id: 9,
  name: 'Gauntlet',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    // Stepping stone crossing the relay gap
    { x: 512, y: 560, width: 128, height: TILE_SIZE, tileType: 'platform' },
    // Stacking platform (section 2)
    { x: STACK_PLATFORM_X, y: STACK_PLATFORM_Y, width: STACK_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
    // Stepping stone near final button
    { x: 2048, y: 540, width: 192, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 112, y: PLAYER_ON_FLOOR },
    { x: 176, y: PLAYER_ON_FLOOR },
    { x: 240, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Section 1 — relay
    {
      id: 'btn9a',
      type: 'button',
      x: 192,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door9a',
    },
    {
      id: 'door9a',
      type: 'door',
      x: 640,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn9a',
    },
    // Section 2 — latching stack button
    {
      id: 'btn9b',
      type: 'button',
      x: STACK_PLATFORM_X + STACK_PLATFORM_W / 2,
      y: STACK_PLATFORM_Y - TILE_SIZE / 2,
      width: STACK_PLATFORM_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door9b',
      latching: true,
    },
    {
      id: 'door9b',
      type: 'door',
      x: 1280,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn9b',
    },
    // Section 3 — 2-player simultaneous button
    {
      id: 'btn9c',
      type: 'button',
      x: 2176,
      y: PLAYER_ON_FLOOR,
      width: 128,
      height: 8,
      requiredPlayers: 2,
      linkedId: 'door9c',
    },
    {
      id: 'door9c',
      type: 'door',
      x: 2368,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn9c',
    },
    {
      id: 'goal9',
      type: 'goal',
      x: 2464,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
