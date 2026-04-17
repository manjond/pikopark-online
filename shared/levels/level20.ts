import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 20 — "The Gauntlet"  (Pack: Hazards, 2 players)
// Wide map. Three spike zones, two buttons, and a stacking section.
// Player A holds the pressure button (opens door to mid section).
// Player B navigates through spikes to press the latching button.
// Both then navigate the spiked final section to reach the goal.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const MAP_W = 2560;

const GOAL_PLAT_X = 2368;
const GOAL_PLAT_W = 160;
const GOAL_PLAT_Y = 460;  // solo-reachable

export const LEVEL_20: LevelData = {
  id: 20,
  name: 'The Gauntlet',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    // Platforms to jump over spike zones
    { x: 640,  y: 533, width: 192, height: TILE_SIZE, tileType: 'platform' },
    { x: 1408, y: 507, width: 192, height: TILE_SIZE, tileType: 'platform' },
    { x: 2048, y: 533, width: 192, height: TILE_SIZE, tileType: 'platform' },
    { x: GOAL_PLAT_X, y: GOAL_PLAT_Y, width: GOAL_PLAT_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Spike zone 1
    {
      id: 'trap20a',
      type: 'trap',
      x: 736,
      y: PLAYER_ON_FLOOR,
      width: 96,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
    // Pressure button — Player A holds it to open door to mid-section
    {
      id: 'btn20a',
      type: 'button',
      x: 384,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door20a',
    },
    {
      id: 'door20a',
      type: 'door',
      x: 960,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn20a',
    },
    // Spike zone 2
    {
      id: 'trap20b',
      type: 'trap',
      x: 1504,
      y: PLAYER_ON_FLOOR,
      width: 96,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
    // Latching button — Player B presses this permanently opening door 2
    {
      id: 'btn20b',
      type: 'button',
      x: 1280,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door20b',
      latching: true,
    },
    {
      id: 'door20b',
      type: 'door',
      x: 1792,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn20b',
    },
    // Spike zone 3 — final challenge
    {
      id: 'trap20c',
      type: 'trap',
      x: 2144,
      y: PLAYER_ON_FLOOR,
      width: 128,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
    {
      id: 'goal20',
      type: 'goal',
      x: GOAL_PLAT_X + GOAL_PLAT_W / 2,  // 2448
      y: GOAL_PLAT_Y - TILE_SIZE / 2,      // 444
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
