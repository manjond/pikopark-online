import { LevelData } from '../level';
import { GAME_HEIGHT, TILE_SIZE } from '../constants';

// Level 14 — "Chain Gang"  (Pack: Squad, 4 players)
// Wide 2560px map. Three pressure buttons must be held simultaneously — the
// fourth player walks past the open door to a latching button that locks
// it open permanently. The three holders can then release and follow.

const FLOOR_TOP       = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;

const MAP_W = 2560;

export const LEVEL_14: LevelData = {
  id: 14,
  name: 'Chain Gang',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [
    { x: 0, y: FLOOR_TOP, width: MAP_W, height: TILE_SIZE, tileType: 'ground' },
    // Elevated platform — 2-player wide simultaneous button + stepping route to safety button
    { x: 1152, y: 540, width: 256, height: TILE_SIZE, tileType: 'platform' },
    // Safety platform past the door
    { x: 1664, y: 510, width: 192, height: TILE_SIZE, tileType: 'platform' },
    // Goal platform at the end
    { x: 2304, y: 480, width: 192, height: TILE_SIZE, tileType: 'platform' },
  ],

  spawnPoints: [
    { x: 48,  y: PLAYER_ON_FLOOR },
    { x: 112, y: PLAYER_ON_FLOOR },
    { x: 176, y: PLAYER_ON_FLOOR },
    { x: 240, y: PLAYER_ON_FLOOR },
  ],

  objects: [
    // Three simultaneous pressure buttons (AND logic — all linked to door14)
    // The 4th player runs past the open door to latch btn14safe.
    { id: 'btn14a', type: 'button', x: 384, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door14' },
    { id: 'btn14b', type: 'button', x: 544, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door14' },
    { id: 'btn14c', type: 'button', x: 704, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: 'door14' },
    {
      id: 'door14',
      type: 'door',
      x: 1024,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: '',
    },
    // Safety latching button — locks door open once pressed by any player who crossed
    {
      id: 'btn14safe',
      type: 'button',
      x: 1280,
      y: PLAYER_ON_FLOOR,
      width: 128,
      height: 8,
      requiredPlayers: 1,
      linkedId: 'door14lock',
      latching: true,
    },
    // This door is a second gate further right — opens with the safety latch
    {
      id: 'door14lock',
      type: 'door',
      x: 1920,
      y: Math.round(GAME_HEIGHT / 2),
      width: 16,
      height: GAME_HEIGHT,
      requiredPlayers: 0,
      linkedId: 'btn14safe',
    },
    {
      id: 'goal14',
      type: 'goal',
      x: 2400,
      y: 480 - TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
