import { LevelData } from '../level';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 17 — "Hot Seat"  (Pack: Hazards, 2 players)
// Player A stands on the pressure button, deactivating the spike strip.
// Player B runs through the safe path to the latching button.
// Latching button permanently disables the second spike strip.
// Both players reach the goal.
//
// Trap linked to btn17a: while btn17a is pressed, trap17a is deactivated.
// Trap 17b is permanently deactivated by latching btn17b.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

export const LEVEL_17: LevelData = {
  id: 17,
  name: 'Hot Seat',
  minPlayers: 2,
  mapWidth: GAME_WIDTH,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Pressure button — deactivates the first spike strip while held
    {
      id: 'btn17a',
      type: 'button',
      x: 192,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'trap17a',
    },
    // First spike strip — linked to btn17a (safe only while btn17a is pressed)
    {
      id: 'trap17a',
      type: 'trap',
      x: 512,
      y: PLAYER_ON_FLOOR,
      width: 96,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: 'btn17a',
    },
    // Second spike strip — permanently disabled by latching btn17b
    {
      id: 'trap17b',
      type: 'trap',
      x: 896,
      y: PLAYER_ON_FLOOR,
      width: 96,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: 'btn17b',
    },
    // Latching button — permanently deactivates trap17b
    {
      id: 'btn17b',
      type: 'button',
      x: 726,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'trap17b',
      latching: true,
    },
    {
      id: 'goal17',
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
