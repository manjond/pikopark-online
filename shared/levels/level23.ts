import { LevelData } from '../level';
import {
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 23 — "Three Dangers"  (Pack: Extreme, 2 players)
// Three latching buttons scattered across a wide spiked map.
// All three must be pressed to open the final door.
// Spike zones threaten every section — careful platforming needed.

const MAP_W = 2560;

const PLAT_A = platformRect(320,  533, 192);
const PLAT_B = platformRect(1152, 533, 192);
const PLAT_C = platformRect(1664, 480, 192);

export const LEVEL_23: LevelData = {
  id: 23,
  name: 'Three Dangers',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    PLAT_A,
    // Mid jump stepping stone
    platformRect(800,  507, 192),
    PLAT_B,
    PLAT_C,
    // Final approach
    platformRect(2080, 507, 192),
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Button A — left section
    platformButton('btn23a', PLAT_A, 'door23', { latching: true }),
    floorTrap('trap23a', 576, 96),
    // Button B — middle section
    platformButton('btn23b', PLAT_B, 'door23', { latching: true }),
    floorTrap('trap23b', 960,  96),
    floorTrap('trap23c', 1440, 96),
    // Button C — right section
    platformButton('btn23c', PLAT_C, 'door23', { latching: true }),
    floorTrap('trap23d', 1920, 128),
    floorTrap('trap23e', 2176, 96),
    fullHeightDoor('door23', 2368),
    goalOnFloor('goal23', 2496),
  ],
};
