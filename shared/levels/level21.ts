import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 21 — "Spike Rush"  (Pack: Extreme, 2 players)
// Three spike strips with narrow safe platforms above each one.
// A 2-player wide button opens the final door. Tight platforming required.
//
// Physics: All platforms ≥ 421 ✓ (solo-reachable from floor)

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

export const LEVEL_21: LevelData = {
  id: 21,
  name: 'Spike Rush',
  minPlayers: 2,
  mapWidth: GAME_WIDTH,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    // Narrow platforms above each spike strip
    { x: 288,  y: 533, width: 128, height: TILE_SIZE, tileType: 'platform' },
    { x: 576,  y: 507, width: 128, height: TILE_SIZE, tileType: 'platform' },
    { x: 864,  y: 480, width: 128, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    { id: 'trap21a', type: 'trap', x: 352,  y: PLAYER_ON_FLOOR, width: 96, height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    { id: 'trap21b', type: 'trap', x: 640,  y: PLAYER_ON_FLOOR, width: 96, height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    { id: 'trap21c', type: 'trap', x: 928,  y: PLAYER_ON_FLOOR, width: 96, height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    {
      id: 'btn21',
      type: 'button',
      x: 1088,
      y: PLAYER_ON_FLOOR,
      width: 160,
      height: 8,
      requiredPlayers: 2,
      linkedId: 'door21',
    },
    {
      id: 'door21',
      type: 'door',
      x: 1152,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn21',
    },
    {
      id: 'goal21',
      type: 'goal',
      x: 1220,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
