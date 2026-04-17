import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 28 — "Bounce Relay"  (Pack: Bounce, 2 players)
// Wide scrolling map. Two springs sit at opposite ends of the map, each
// with a latching button on a high platform above it. Both buttons share
// the same linkedId ('doorRelay') — server AND-logic means the door
// opens only when *both* buttons are activated. Two players must split
// up, bounce simultaneously (or sequentially — buttons latch), then
// regroup at the goal past the door.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const MAP_W = 1920;

const SPRING_H = 16;

// Left station
const SPRING_A_X   = 256;
const PLAT_A_TOP   = 232;
const PLAT_A_X     = 128;
const PLAT_A_W     = 256;

// Right station
const SPRING_B_X   = 1280;
const PLAT_B_TOP   = 232;
const PLAT_B_X     = 1152;
const PLAT_B_W     = 256;

// Door sits between the stations and the goal
const DOOR_X = 1600;

export const LEVEL_28: LevelData = {
  id: 28,
  name: 'Bounce Relay',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    { x: PLAT_A_X, y: PLAT_A_TOP, width: PLAT_A_W, height: TILE_SIZE, tileType: 'platform' },
    { x: PLAT_B_X, y: PLAT_B_TOP, width: PLAT_B_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 112, y: PLAYER_ON_FLOOR },
    { x: 176, y: PLAYER_ON_FLOOR },
    { x: 240, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // ── Left station ──────────────────────────────────────────────────────
    {
      id: 'spring28a',
      type: 'spring',
      x: SPRING_A_X,
      y: FLOOR_TOP - SPRING_H / 2,
      width: 48,
      height: SPRING_H,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'btn28a',
      type: 'button',
      x: PLAT_A_X + PLAT_A_W / 2,
      y: PLAT_A_TOP - 4,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'doorRelay28',
      latching: true,
    },

    // ── Right station ─────────────────────────────────────────────────────
    {
      id: 'spring28b',
      type: 'spring',
      x: SPRING_B_X,
      y: FLOOR_TOP - SPRING_H / 2,
      width: 48,
      height: SPRING_H,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'btn28b',
      type: 'button',
      x: PLAT_B_X + PLAT_B_W / 2,
      y: PLAT_B_TOP - 4,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'doorRelay28',
      latching: true,
    },

    // ── Door + goal ───────────────────────────────────────────────────────
    {
      id: 'doorRelay28',
      type: 'door',
      x: DOOR_X,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'goal28',
      type: 'goal',
      x: 1800,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
