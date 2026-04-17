import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 7 — "Wide Relay"  (Pack: Duo, 2 players)
// Scrolling 1920px map. Player A holds pressure btn7a → door7a opens.
// Player B crosses and steps on btn7b (latching) → door7b opens forever.
// Player A releases btn7a and runs through. Both reach the goal.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const MAP_W = 1920;

// Stepping-stone platforms help navigate the wide gaps
const STEP_A_X = 512;
const STEP_A_Y = 560; // solo-reachable

const STEP_B_X = 1152;
const STEP_B_Y = 520;

export const LEVEL_7: LevelData = {
  id: 7,
  name: 'Wide Relay',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    { x: STEP_A_X, y: STEP_A_Y, width: 213, height: TILE_SIZE, tileType: 'platform' },
    { x: STEP_B_X, y: STEP_B_Y, width: 213, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 112, y: PLAYER_ON_FLOOR },
    { x: 176, y: PLAYER_ON_FLOOR },
    { x: 240, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    {
      id: 'btn7a',
      type: 'button',
      x: 256,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door7a',
    },
    {
      id: 'door7a',
      type: 'door',
      x: 640,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn7a',
    },
    {
      id: 'btn7b',
      type: 'button',
      x: 1024,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door7b',
      latching: true,
    },
    {
      id: 'door7b',
      type: 'door',
      x: 1280,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn7b',
    },
    {
      id: 'goal7',
      type: 'goal',
      x: 1760,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
