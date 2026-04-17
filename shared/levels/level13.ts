import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 13 — "Split Decision"  (Pack: Squad, 4 players)
// Wide 2560px map. Two parallel corridors separated by a wall in the middle.
// Top corridor requires stacking; bottom corridor has a 2-player simultaneous button.
// Both corridors must be cleared (two latching buttons) to open the final door.
//
// Layout:
//   Bottom corridor: floor level — btn13a (2-player wide, latching) → unlocks corridor gate
//   Top corridor: elevated platform route — btn13b (1-player, latching via 2-stack) → unlatches gate
//   Both btn13a + btn13b → door13 (AND logic) → goal at far right

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const MAP_W = 2560;

export const LEVEL_13: LevelData = {
  id: 13,
  name: 'Split Decision',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    // Upper route — stepping platforms
    { x: 320,  y: 530, width: 192, height: TILE_SIZE, tileType: 'platform' },
    { x: 640,  y: 460, width: 192, height: TILE_SIZE, tileType: 'platform' },
    // Stacking-only platform for btn13b
    { x: 960, y: 400, width: 192, height: TILE_SIZE, tileType: 'platform' },
    // Lower route — stepping stones
    { x: 1280, y: 560, width: 192, height: TILE_SIZE, tileType: 'platform' },
    { x: 1600, y: 530, width: 192, height: TILE_SIZE, tileType: 'platform' },
    // Final section landing platform
    { x: 2176, y: 500, width: 256, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 112, y: PLAYER_ON_FLOOR },
    { x: 176, y: PLAYER_ON_FLOOR },
    { x: 240, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Bottom-route 2-player latching button
    {
      id: 'btn13a',
      type: 'button',
      x: 1920,
      y: PLAYER_ON_FLOOR,
      width: 128,
      height: 8,
      requiredPlayers: 2,
      linkedId: 'door13',
      latching: true,
    },
    // Top-route stacking-only latching button
    {
      id: 'btn13b',
      type: 'button',
      x: 1056,
      y: 400 - TILE_SIZE / 2,
      width: 192,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door13',
      latching: true,
    },
    {
      id: 'door13',
      type: 'door',
      x: 2112,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'goal13',
      type: 'goal',
      x: 2400,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
