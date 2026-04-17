import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 23 — "Three Dangers"  (Pack: Extreme, 2 players)
// Three latching buttons scattered across a wide spiked map.
// All three must be pressed to open the final door.
// Spike zones threaten every section — careful platforming needed.
//
// Physics: All button platforms ≥ 421 ✓ (solo-reachable)

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const MAP_W = 2560;

export const LEVEL_23: LevelData = {
  id: 23,
  name: 'Three Dangers',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    // Platforms to navigate spikes
    { x: 320,  y: 533, width: 192, height: TILE_SIZE, tileType: 'platform' },  // near btn A
    { x: 800,  y: 507, width: 192, height: TILE_SIZE, tileType: 'platform' },  // mid jump
    { x: 1152, y: 533, width: 192, height: TILE_SIZE, tileType: 'platform' },  // near btn B
    { x: 1664, y: 480, width: 192, height: TILE_SIZE, tileType: 'platform' },  // near btn C
    { x: 2080, y: 507, width: 192, height: TILE_SIZE, tileType: 'platform' },  // final approach
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Button A — left section
    {
      id: 'btn23a',
      type: 'button',
      x: 416,
      y: 533 - TILE_SIZE / 2,  // 517 — on platform
      width: 192,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door23',
      latching: true,
    },
    { id: 'trap23a', type: 'trap', x: 576, y: PLAYER_ON_FLOOR, width: 96, height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    // Button B — middle section
    {
      id: 'btn23b',
      type: 'button',
      x: 1248,
      y: 533 - TILE_SIZE / 2,  // 517 — on platform
      width: 192,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door23',
      latching: true,
    },
    { id: 'trap23b', type: 'trap', x: 960,  y: PLAYER_ON_FLOOR, width: 96, height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    { id: 'trap23c', type: 'trap', x: 1440, y: PLAYER_ON_FLOOR, width: 96, height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    // Button C — right section
    {
      id: 'btn23c',
      type: 'button',
      x: 1760,
      y: 480 - TILE_SIZE / 2,  // 464 — on platform
      width: 192,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door23',
      latching: true,
    },
    { id: 'trap23d', type: 'trap', x: 1920, y: PLAYER_ON_FLOOR, width: 128, height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    { id: 'trap23e', type: 'trap', x: 2176, y: PLAYER_ON_FLOOR, width: 96,  height: TILE_SIZE, requiredPlayers: 0, linkedId: '' },
    {
      id: 'door23',
      type: 'door',
      x: 2368,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'goal23',
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
