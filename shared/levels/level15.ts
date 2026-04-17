import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 15 — "Summit"  (Pack: Squad, 4 players — grand finale)
// Wide 3200px map. Combines ALL mechanics:
//   • 4-player simultaneous button (section 1)
//   • 3-player stacking puzzle (section 2, 3-stack-only zone at y=370)
//   • 2-player relay across a wide gap (section 3)
//   • Final 4-player simultaneous button to open the last door (section 4)
//
// Physics:
//   3-stack feet peak y = 357 → 3-stack-only zone = [357, 389)
//   Platform at y=370 requires 3-stack ✓

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const MAP_W = 3200;

export const LEVEL_15: LevelData = {
  id: 15,
  name: 'Summit',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0,    y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    // Section 2 — 3-stack-only platform
    { x: 1152, y: 370, width: 192, height: TILE_SIZE, tileType: 'platform' },
    // Section 2 — stepping stone approach
    { x: 960,  y: 540, width: 160, height: TILE_SIZE, tileType: 'platform' },
    // Section 3 — relay stepping stones
    { x: 1792, y: 560, width: 160, height: TILE_SIZE, tileType: 'platform' },
    { x: 2048, y: 520, width: 160, height: TILE_SIZE, tileType: 'platform' },
    // Final platform before goal
    { x: 2880, y: 480, width: 256, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 112, y: PLAYER_ON_FLOOR },
    { x: 176, y: PLAYER_ON_FLOOR },
    { x: 240, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Section 1 — four simultaneous floor buttons
    { id: 'btn15a', type: 'button', x: 192, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door15a' },
    { id: 'btn15b', type: 'button', x: 320, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door15a' },
    { id: 'btn15c', type: 'button', x: 448, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door15a' },
    { id: 'btn15d', type: 'button', x: 576, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door15a' },
    {
      id: 'door15a',
      type: 'door',
      x: 768,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: '',
    },
    // Section 2 — 3-stack latching button
    {
      id: 'btn15e',
      type: 'button',
      x: 1248,
      y: 370 - TILE_SIZE / 2,
      width: 192,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door15b',
      latching: true,
    },
    {
      id: 'door15b',
      type: 'door',
      x: 1472,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn15e',
    },
    // Section 3 — relay
    {
      id: 'btn15f',
      type: 'button',
      x: 1664,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door15c',
    },
    {
      id: 'btn15g',
      type: 'button',
      x: 2240,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door15c',
      latching: true,
    },
    {
      id: 'door15c',
      type: 'door',
      x: 2432,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: '',
    },
    // Section 4 — final 4-player simultaneous button
    { id: 'btn15h', type: 'button', x: 2624, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door15d' },
    { id: 'btn15i', type: 'button', x: 2688, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door15d' },
    { id: 'btn15j', type: 'button', x: 2752, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door15d' },
    { id: 'btn15k', type: 'button', x: 2816, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door15d' },
    {
      id: 'door15d',
      type: 'door',
      x: 3008,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'goal15',
      type: 'goal',
      x: 3008,
      y: 480 - TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
