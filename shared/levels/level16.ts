import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 16 — "First Spikes"  (Pack: Hazards, 2 players)
// Introduces traps. Spike strips on the floor — step on them and the level
// restarts. Jump over them! Two players must also stand on the wide button
// to open the door to the goal.
//
// Trap geometry: centered at y = PLAYER_ON_FLOOR (672), height = TILE_SIZE.
// Players at floor level will die if they walk into the trap x-range.
// Jump over them to survive!

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

export const LEVEL_16: LevelData = {
  id: 16,
  name: 'First Spikes',
  minPlayers: 2,
  mapWidth: GAME_WIDTH,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
    // Platform over the first spike strip to make it passable
    { x: 320, y: 533, width: 192, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Spike strip 1 — must jump over (use the platform above)
    {
      id: 'trap16a',
      type: 'trap',
      x: 416,
      y: PLAYER_ON_FLOOR,
      width: 96,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
    // Spike strip 2 — must jump over near the button
    {
      id: 'trap16b',
      type: 'trap',
      x: 704,
      y: PLAYER_ON_FLOOR,
      width: 64,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
    // Wide button — 2 players must step on it to latch it (then stays open)
    {
      id: 'btn16',
      type: 'button',
      x: 896,
      y: PLAYER_ON_FLOOR,
      width: 160,
      height: 8,
      requiredPlayers: 2,
      linkedId: 'door16',
      latching: true,
    },
    {
      id: 'door16',
      type: 'door',
      x: 1088,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn16',
    },
    {
      id: 'goal16',
      type: 'goal',
      x: 1220,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
