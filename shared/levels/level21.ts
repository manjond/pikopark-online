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

// Level 21 — "Spike Rush"  (Pack: Extreme, 2 players)
// Three spike strips with narrow safe platforms above each one.
// A 2-player wide button opens the final door. Tight platforming required.
//
// Physics: All platforms ≥ SOLO_FEET_PEAK (solo-reachable from floor).

export const LEVEL_21: LevelData = {
  id: 21,
  name: 'Spike Rush',
  minPlayers: 2,

  solidRects: [
    groundRect(),
    // Narrow platforms above each spike strip
    platformRect(288, 533, 128),
    platformRect(576, 507, 128),
    platformRect(864, 480, 128),
  ],

  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap21a', 352, 96),
    floorTrap('trap21b', 640, 96),
    floorTrap('trap21c', 928, 96),
    floorButton('btn21', 1088, 'door21', { latching: true, requiredPlayers: 2, width: 160 }),
    fullHeightDoor('door21', 1152),
    goalOnFloor('goal21', 1220),
  ],
};
