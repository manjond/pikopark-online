import { LevelData } from '../level';
import {
  floorButton,
  floorTrap,
  goalOnFloor,
  groundRect,
  standardSpawns,
} from './_helpers';

// Level 17 — "Hot Seat"  (Pack: Hazards, 2 players)
// Player A stands on the pressure button, deactivating the spike strip.
// Player B runs through the safe path to the latching button.
// Latching button permanently disables the second spike strip.
// Both players reach the goal.
//
// Trap linked to btn17a: while btn17a is pressed, trap17a is deactivated.
// Trap 17b is permanently deactivated by latching btn17b.

export const LEVEL_17: LevelData = {
  id: 17,
  name: 'Hot Seat',
  minPlayers: 2,

  solidRects: [groundRect()],

  spawnPoints: standardSpawns(),

  objects: [
    // Pressure button — deactivates the first spike strip while held
    floorButton('btn17a', 192, 'trap17a'),
    // First spike strip — controlled by btn17a (safe only while held)
    floorTrap('trap17a', 512, 96),
    // Second spike strip — permanently disabled by latching btn17b
    floorTrap('trap17b', 896, 96),
    // Latching button — permanently deactivates trap17b
    floorButton('btn17b', 726, 'trap17b', { latching: true }),
    goalOnFloor('goal17', 1195),
  ],
};
