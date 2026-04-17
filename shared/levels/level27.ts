import { LevelData } from '../level';
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../constants';

// Level 27 — "Trampoline Gate"  (Pack: Bounce, 2 players)
// A door blocks the path to the goal. The latching button that opens it
// sits on a platform too high for a normal jump — only the spring pad
// reaches it. One player bounces up, presses the button (latching), the
// door stays open, and both players walk through to the goal.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const SPRING_H = 16;
const SPRING_X = 256;
const SPRING_Y = FLOOR_TOP - SPRING_H / 2;

// Button platform — top y unreachable by plain jump, landable from spring peak
const BTN_PLAT_TOP = 232;
const BTN_PLAT_X   = 128;
const BTN_PLAT_W   = 256;

// Vertical door barrier blocking the right half of the map
const DOOR_X = 704;

export const LEVEL_27: LevelData = {
  id: 27,
  name: 'Trampoline Gate',
  minPlayers: 2,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    { x: BTN_PLAT_X, y: BTN_PLAT_TOP, width: BTN_PLAT_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 112, y: PLAYER_ON_FLOOR },
    { x: 176, y: PLAYER_ON_FLOOR },
    { x: 240, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    {
      id: 'spring27',
      type: 'spring',
      x: SPRING_X,
      y: SPRING_Y,
      width: 48,
      height: SPRING_H,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'btn27',
      type: 'button',
      x: BTN_PLAT_X + BTN_PLAT_W / 2,
      y: BTN_PLAT_TOP - 4,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door27',
      latching: true,
    },
    {
      id: 'door27',
      type: 'door',
      x: DOOR_X,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn27',
    },
    {
      id: 'goal27',
      type: 'goal',
      x: 1120,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
