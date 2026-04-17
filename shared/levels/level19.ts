import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 19 — "Spike Bridge"  (Pack: Hazards, 2 players)
// A long narrow platform over a spike-filled floor. One player stacks as a
// step-stool to reach the elevated button platform. Once the door opens,
// both players must navigate the spike bridge to reach the goal.
// Falling off the bridge into the spikes restarts the level!
//
// Physics: BTN_PLATFORM_TOP = 395 (stacking-only zone)

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;           // 688
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 672

const MAP_W = 1920;

export const LEVEL_19: LevelData = {
  id: 19,
  name: 'Spike Bridge',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    // Left safe zone
    { x: 0, y: FLOOR_TOP, width: 320, height: TILE_SIZE, tileType: 'ground' },
    // Button platform (stacking-only)
    { x: 160, y: 395, width: 192, height: TILE_SIZE, tileType: 'platform' },
    // The spike bridge — players walk across it
    { x: 640, y: 533, width: 896, height: TILE_SIZE, tileType: 'platform' },
    // Right safe landing zone
    { x: 1536, y: FLOOR_TOP, width: 384, height: TILE_SIZE, tileType: 'ground' },
  ],

  spawnPoints: [
    { x: 64,  y: PLAYER_ON_FLOOR },
    { x: 128, y: PLAYER_ON_FLOOR },
    { x: 192, y: PLAYER_ON_FLOOR },
    { x: 256, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Spike field under the bridge — fall off and you die!
    {
      id: 'trap19a',
      type: 'trap',
      x: 960,
      y: PLAYER_ON_FLOOR,
      width: 640,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
    // Stacking-only button — opens the gate to the bridge
    {
      id: 'btn19',
      type: 'button',
      x: 256,
      y: 395 - TILE_SIZE / 2,  // 379
      width: 192,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door19',
    },
    {
      id: 'door19',
      type: 'door',
      x: 512,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn19',
    },
    {
      id: 'goal19',
      type: 'goal',
      x: 1856,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
