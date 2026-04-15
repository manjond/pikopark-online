import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// ── Physics reference values ─────────────────────────────────────────────────
// JUMP_VELOCITY = -400, GRAVITY = 800
//   Max jump height  = v²/(2g) = 400²/1600 = 100 px
//
// Reach of a player's bottom (= center + 8) above start position:
//   Solo from ground  (center 246): bottom peak = 246+8 - 100 = 154
//   Stacked on a mate (center 230): bottom peak = 230+8 - 100 = 138
//
// A platform with top_y BELOW 154 and AT/ABOVE 138 is only reachable by stacking.
// We place the goal platform at top_y = 148 — safely in that zone.
// ─────────────────────────────────────────────────────────────────────────────

const FLOOR_TOP = GAME_HEIGHT - TILE_SIZE;           // 254
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 246

const HIGH_PLATFORM_TOP  = 148; // only reachable via player stacking
const HIGH_PLATFORM_X    = 320;
const HIGH_PLATFORM_W    = 96; // 6 tiles

export const LEVEL_2: LevelData = {
  id: 2,
  name: 'Shoulders',

  // ─── Solid geometry ──────────────────────────────────────────────────────────
  solidRects: [
    // Ground (full width)
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },

    // A low stepping-stone platform on the left — reachable solo, guides players right
    { x: 64, y: 210, width: 80, height: TILE_SIZE, tileType: 'platform' },

    // The high platform — reachable ONLY by stacking
    { x: HIGH_PLATFORM_X, y: HIGH_PLATFORM_TOP, width: HIGH_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
  ],

  // ─── Spawn points ────────────────────────────────────────────────────────────
  spawnPoints: [
    { x: 24,  y: PLAYER_ON_FLOOR },
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 72,  y: PLAYER_ON_FLOOR },
    { x: 96,  y: PLAYER_ON_FLOOR },
  ],

  // ─── Interactive objects ─────────────────────────────────────────────────────
  //
  // Puzzle (2 players needed):
  //   Player A stands still on the ground below the high platform.
  //   Player B jumps on Player A's head (center y = 230).
  //   From that stacked height Player B can jump and land on the
  //   high platform (top_y = 148 < stacked-bottom-peak = 138 → reachable).
  //   Player B touches the goal star to complete the level.
  //
  objects: [
    {
      id: 'goal2',
      type: 'goal',
      x: HIGH_PLATFORM_X + HIGH_PLATFORM_W / 2 - TILE_SIZE / 2, // 352 — left side of platform
      y: HIGH_PLATFORM_TOP - TILE_SIZE / 2,  // 140 — player center when standing on platform
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
