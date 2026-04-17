import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 10 — "Pinnacle"  (Pack: Duo, 2 players — hardest)
// 1920px wide. Combines all duo mechanics in one continuous puzzle:
//   • Stacking-only button A (latching) unlocks door A
//   • Pressure button B holds door B (player must STAY on it)
//   • Beyond door B: double-stack-only platform with latching button C
//   • All three doors open → goal reachable
//
// Flow: Stack → btn10a latches. A holds btn10b, B crosses door B.
//       Stack again for btn10c (latches). door10c opens. Both reach goal.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const MAP_W = 1920;

export const LEVEL_10: LevelData = {
  id: 10,
  name: 'Pinnacle',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    // Stacking platform A — latching btn unlocks first door
    { x: 192, y: 405, width: 160, height: TILE_SIZE, tileType: 'platform' },
    // Stepping stone between door A and B
    { x: 640, y: 550, width: 160, height: TILE_SIZE, tileType: 'platform' },
    // Stacking platform C — final latching btn
    { x: 1344, y: 395, width: 160, height: TILE_SIZE, tileType: 'platform' },
    // Goal platform
    { x: 1664, y: 480, width: 192, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 112, y: PLAYER_ON_FLOOR },
    { x: 176, y: PLAYER_ON_FLOOR },
    { x: 240, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Stacking button A (latching) — both players stack to reach it
    {
      id: 'btn10a',
      type: 'button',
      x: 272,
      y: 405 - TILE_SIZE / 2,
      width: 160,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door10a',
      latching: true,
    },
    {
      id: 'door10a',
      type: 'door',
      x: 448,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn10a',
    },
    // Pressure button B (floor-level, must be held)
    {
      id: 'btn10b',
      type: 'button',
      x: 832,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door10b',
    },
    {
      id: 'door10b',
      type: 'door',
      x: 1024,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn10b',
    },
    // Stacking button C (latching) — second stack puzzle
    {
      id: 'btn10c',
      type: 'button',
      x: 1424,
      y: 395 - TILE_SIZE / 2,
      width: 160,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door10c',
      latching: true,
    },
    {
      id: 'door10c',
      type: 'door',
      x: 1600,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn10c',
    },
    {
      id: 'goal10',
      type: 'goal',
      x: 1760,
      y: 480 - TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
