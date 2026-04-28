import { LevelData } from '../level';
import {
  fireBar,
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 28 — "Throw of Faith"  (Pack: Duo Trust, 2 players)
// Two throw moments separated by a pressure-and-firebar gauntlet:
//   1. Carrier throws partner over the first lava chasm onto the perch.
//      Partner drops down and walks to a pressure pad.
//   2. With the pad held, the carrier sprints across the now-cold first
//      chasm AND threads two firebars on the bridge to reach the second
//      chasm. The carrier picks up partner again (partner steps off pad —
//      lava re-arms behind, but no return is needed).
//   3. Carrier throws partner over the second chasm onto the goal landing.

const MAP_W = 2240;
const PERCH_A = platformRect(640,  320, 192); // first throw target
const PAD     = platformRect(896,  540, 128); // pressure pad after perch A
const PERCH_B = platformRect(1856, 320, 192); // second throw target / goal landing

export const LEVEL_28: LevelData = {
  id: 28,
  name: 'Throw of Faith',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PERCH_A, PAD, PERCH_B],
  spawnPoints: standardSpawns(),

  objects: [
    // First chasm — too wide for any normal jump.
    floorTrap('trap28a', 528, 480),
    // Pressure pad — held by the partner who lands on PERCH_A.
    platformButton('btn28hold', PAD, 'trap28b', { width: 128 }),
    // Second hazard strip — only cold while pad is held.
    floorTrap('trap28b', 1232, 320),
    fireBar('fb28a', 1152, 460, 2, 1.6,  0),
    fireBar('fb28b', 1408, 460, 2, -1.6, 90),
    // Latching button on the spawn rim — flips the goal door open after
    // the second throw lands the partner near the door. Reachable by
    // the carrier *before* the first throw, so the carrier presses it
    // pre-emptively.
    floorButton('btn28latch', 96, 'door28', { latching: true }),
    fullHeightDoor('door28', 2080),
    goalOnFloor('goal28', 2176),
  ],
};
