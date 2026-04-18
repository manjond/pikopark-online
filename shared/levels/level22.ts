import { LevelData } from '../level';
import {
  floorButton,
  floorTrap,
  goalOnFloor,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 22 — "Hot Relay"  (Pack: Extreme, 2 players)
// Wide map. Player A must hold a pressure button to disable the first spike
// zone while player B passes through. Player B presses a latching button
// permanently clearing the second zone. Then both sprint to the goal.

const MAP_W = 1920;

export const LEVEL_22: LevelData = {
  id: 22,
  name: 'Hot Relay',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    // Platforms for navigating spike zones
    platformRect(576,  507, 192),
    platformRect(1280, 480, 192),
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Pressure button (A holds it) — clears spike zone 1 while held
    floorButton('btn22a', 384, 'trap22a'),
    floorTrap('trap22a', 672, 128),
    // Static spike zone 2 — always dangerous, jump over with platform
    floorTrap('trap22b', 864, 96),
    // Latching button (B presses this) — permanently clears spike zone 3
    floorButton('btn22b', 1088, 'trap22c', { latching: true }),
    floorTrap('trap22c', 1376, 128),
    goalOnFloor('goal22', 1856),
  ],
};
