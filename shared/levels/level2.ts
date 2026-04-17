import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 2 — "Latch"  (Pack: Basics, 1 player)
// Introduces the latching button concept. Press the button once and it stays
// active permanently — the door never closes again. Use this to your advantage!
//
// Physics (1280×720):
//   Solo feet peak from floor = 421 → platform top must be ≥ 421 to be reachable
//   Button platform top = 507 > 421 ✓  (solo-reachable)

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const BTN_PLATFORM_TOP = 507;  // solo-reachable
const BTN_PLATFORM_X   = 448;
const BTN_PLATFORM_W   = 256;

export const LEVEL_2: LevelData = {
  id: 2,
  name: 'Latch',
  minPlayers: 1,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    { x: BTN_PLATFORM_X, y: BTN_PLATFORM_TOP, width: BTN_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    {
      id: 'btn2',
      type: 'button',
      x: BTN_PLATFORM_X + BTN_PLATFORM_W / 2,  // 576 — centre of platform
      y: BTN_PLATFORM_TOP - TILE_SIZE / 2,       // 491 — on top of platform
      width: BTN_PLATFORM_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door2',
      latching: true,
    },
    {
      id: 'door2',
      type: 'door',
      x: 896,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn2',
    },
    {
      id: 'goal2',
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
