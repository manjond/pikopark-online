import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 4 — "Chain"  (Pack: Basics, 1 player)
// Sequential button chain. Press button A (latching) → door A opens.
// Inside find button B (latching) → door B opens. Goal on elevated platform.
//
// Physics (1280×720):
//   Goal platform top = 460 > 421 ✓ (solo-reachable)

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const GOAL_PLATFORM_TOP = 460;  // solo-reachable
const GOAL_PLATFORM_X   = 960;
const GOAL_PLATFORM_W   = 224;

export const LEVEL_4: LevelData = {
  id: 4,
  name: 'Chain',
  minPlayers: 1,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    { x: GOAL_PLATFORM_X, y: GOAL_PLATFORM_TOP, width: GOAL_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Button A — first gate
    {
      id: 'btn4a',
      type: 'button',
      x: 299,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door4a',
      latching: true,
    },
    {
      id: 'door4a',
      type: 'door',
      x: 512,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn4a',
    },
    // Button B — second gate, accessible only after door A opens
    {
      id: 'btn4b',
      type: 'button',
      x: 726,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door4b',
      latching: true,
    },
    {
      id: 'door4b',
      type: 'door',
      x: 896,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn4b',
    },
    {
      id: 'goal4',
      type: 'goal',
      x: GOAL_PLATFORM_X + GOAL_PLATFORM_W / 2,  // 1072
      y: GOAL_PLATFORM_TOP - TILE_SIZE / 2,        // 444
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
