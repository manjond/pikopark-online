import { LevelData } from '../level';
import {
  floorButton,
  fullHeightDoor,
  goalOnPlatform,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 14 — "Chain Gang"  (Pack: Squad, 4 players)
// Wide 2560px map. Three pressure buttons must be held simultaneously — the
// fourth player walks past the open door to a latching button that locks
// it open permanently. The three holders can then release and follow.

const MAP_W = 2560;

const GOAL_PLAT = platformRect(2304, 480, 192);

export const LEVEL_14: LevelData = {
  id: 14,
  name: 'Chain Gang',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    // Elevated platform — stepping route past the first door
    platformRect(1152, 540, 256),
    // Safety platform past the safety latch
    platformRect(1664, 510, 192),
    GOAL_PLAT,
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Three simultaneous pressure buttons (AND logic — all linked to door14)
    // The 4th player runs past the open door to latch btn14safe.
    floorButton('btn14a', 384, 'door14'),
    floorButton('btn14b', 544, 'door14'),
    floorButton('btn14c', 704, 'door14'),
    fullHeightDoor('door14', 1024),
    // Safety latching button — locks door open once pressed by any player who crossed
    floorButton('btn14safe', 1280, 'door14lock', { latching: true, width: 128 }),
    // Second gate further right — opens with the safety latch
    fullHeightDoor('door14lock', 1920),
    goalOnPlatform('goal14', GOAL_PLAT),
  ],
};
