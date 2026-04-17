import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 5 — "Chain"
// btn5a: pressure-sensitive — Player A holds it the whole time.
// btn5b: latching — once stepped on, stays permanently activated.
// Player A holds btn5a → door5a opens → Player B crosses → steps btn5b
// (latches) → door5b opens forever → both can reach the goal.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

export const LEVEL_5: LevelData = {
  id: 5,
  name: 'Chain',

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    // Mid platform — adds verticality, solo-reachable
    { x: 640, y: 533, width: 213, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    {
      id: 'btn5a',
      type: 'button',
      x: 213,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door5a',
    },
    {
      id: 'door5a',
      type: 'door',
      x: 512,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn5a',
    },
    {
      id: 'btn5b',
      type: 'button',
      x: 896,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door5b',
      latching: true,
    },
    {
      id: 'door5b',
      type: 'door',
      x: 1067,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn5b',
    },
    {
      id: 'goal5',
      type: 'goal',
      x: 1195,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
