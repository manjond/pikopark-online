import { LevelData } from '../level';
import {
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 16 — "First Spikes"  (Pack: Hazards, 2 players)
// Introduces traps. Spike strips on the floor — step on them and the level
// restarts. Jump over them! Two players must also stand on the wide button
// to open the door to the goal.

export const LEVEL_16: LevelData = {
  id: 16,
  name: 'First Spikes',
  minPlayers: 2,

  solidRects: [
    groundRect(),
    // Platform over the first spike strip to make it passable
    platformRect(320, 533, 192),
  ],

  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap16a', 416, 96),
    floorTrap('trap16b', 704, 64),
    // Wide button — 2 players must step on it to latch it (then stays open)
    floorButton('btn16', 896, 'door16', { latching: true, requiredPlayers: 2, width: 160 }),
    fullHeightDoor('door16', 1088),
    goalOnFloor('goal16', 1220),
  ],
};
