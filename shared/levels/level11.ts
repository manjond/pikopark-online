import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 11 — "Four Keys"  (Pack: Squad, 4 players)
// 4 pressure buttons arranged across the map — ALL must be pressed
// simultaneously to open the one door. Requires all 4 players to cooperate.
//
// All buttons are on the floor (no stacking needed) — pure coordination puzzle.
// The door is wide (covers most of the screen height) blocking all routes.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const MAP_W = 1280;

export const LEVEL_11: LevelData = {
  id: 11,
  name: 'Four Keys',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
  ],

  spawnPoints: [
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 112, y: PLAYER_ON_FLOOR },
    { x: 176, y: PLAYER_ON_FLOOR },
    { x: 240, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    { id: 'btn11a', type: 'button', x: 128,  y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door11' },
    { id: 'btn11b', type: 'button', x: 256,  y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door11' },
    { id: 'btn11c', type: 'button', x: 384,  y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door11' },
    { id: 'btn11d', type: 'button', x: 512,  y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door11' },
    {
      id: 'door11',
      type: 'door',
      x: 704,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'goal11',
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
