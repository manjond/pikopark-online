import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 3 — "Both Keys"  (Pack: Basics, 1 player)
// Two latching buttons, both required to open the door (AND logic).
// Press button A, press button B — the door only opens when BOTH are active.
//
// Physics (1280×720):
//   Platform A top = 533 > 421 ✓ (solo-reachable)
//   Platform B top = 480 > 421 ✓ (solo-reachable)

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const PLAT_A_TOP = 533;  // left platform — solo-reachable
const PLAT_A_X   = 192;
const PLAT_A_W   = 192;

const PLAT_B_TOP = 480;  // right platform — solo-reachable
const PLAT_B_X   = 576;
const PLAT_B_W   = 192;

export const LEVEL_3: LevelData = {
  id: 3,
  name: 'Both Keys',
  minPlayers: 1,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    { x: PLAT_A_X, y: PLAT_A_TOP, width: PLAT_A_W, height: TILE_SIZE, tileType: 'platform' },
    { x: PLAT_B_X, y: PLAT_B_TOP, width: PLAT_B_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Button A — linked to door3, latching
    {
      id: 'btn3a',
      type: 'button',
      x: PLAT_A_X + PLAT_A_W / 2,    // 288 — centre of platform A
      y: PLAT_A_TOP - TILE_SIZE / 2,   // 517 — on top of platform A
      width: PLAT_A_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door3',
      latching: true,
    },
    // Button B — also linked to door3, latching (AND logic: both must be active)
    {
      id: 'btn3b',
      type: 'button',
      x: PLAT_B_X + PLAT_B_W / 2,    // 672 — centre of platform B
      y: PLAT_B_TOP - TILE_SIZE / 2,   // 464 — on top of platform B
      width: PLAT_B_W,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door3',
      latching: true,
    },
    {
      id: 'door3',
      type: 'door',
      x: 896,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'goal3',
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
