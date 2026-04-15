import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 4 — "Together"
// Mechanic: weight platform — one button that requires TWO players simultaneously.
//
// Puzzle (2 players):
//   Both players must stand on the wide button at the same time.
//   This opens the door. One player stays, the other can't go through (both needed).
//   Solution: both stand on button → door opens → both sprint off simultaneously
//   toward the goal before the door closes (door is 1 tile past the button area,
//   so both can reach it in one motion).
//
//   Tip: position both players side-by-side on the button, then both run right.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

// Goal platform — elevated, accessible through the door
const GOAL_PLATFORM_X   = 352;
const GOAL_PLATFORM_W   = 96;
const GOAL_PLATFORM_TOP = 190;

export const LEVEL_4: LevelData = {
  id: 4,
  name: 'Together',

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    // Stepping-stone so players can reach the elevated goal platform after the door opens
    { x: GOAL_PLATFORM_X, y: GOAL_PLATFORM_TOP, width: GOAL_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 24,  y: PLAYER_ON_FLOOR },
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 72,  y: PLAYER_ON_FLOOR },
    { x: 96,  y: PLAYER_ON_FLOOR },
  ],

  objects: [
    {
      // Wide button — needs 2 players at the same time
      id: 'btn4',
      type: 'button',
      x: 128,     // centre at x=128, spans x=96..160
      y: PLAYER_ON_FLOOR,
      width: 64,  // 4 tiles wide — room for two players side-by-side
      height: 4,
      requiredPlayers: 2,
      linkedId: 'door4',
    },
    {
      id: 'door4',
      type: 'door',
      x: 240,
      y: Math.round(GAME_HEIGHT / 2),
      width: 8,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn4',
    },
    {
      id: 'goal4',
      type: 'goal',
      x: GOAL_PLATFORM_X + GOAL_PLATFORM_W / 2,  // 400
      y: GOAL_PLATFORM_TOP - TILE_SIZE / 2,        // 182 — on elevated platform
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
