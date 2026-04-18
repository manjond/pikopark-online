import { LevelData } from '../level';
import {
  floorTrap,
  fullHeightDoor,
  goalOnPlatform,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 18 — "Stacked Danger"  (Pack: Hazards, 2 players)
// Stacking-only button on a high platform. Spike strips guard the approach.
// Navigate the spikes carefully before stacking.
//
// Physics: BTN_PLAT top = 395 (stacking-only zone: STACK2_FEET_PEAK ≤ 395 < SOLO_FEET_PEAK)

const BTN_PLAT  = platformRect(512, 395, 192); // stacking-only
const GOAL_PLAT = platformRect(896, 472, 224); // solo-reachable

export const LEVEL_18: LevelData = {
  id: 18,
  name: 'Stacked Danger',
  minPlayers: 2,

  solidRects: [groundRect(), BTN_PLAT, GOAL_PLAT],

  spawnPoints: standardSpawns(),

  objects: [
    // Spikes guarding the stack zone — must jump over to position
    floorTrap('trap18a', 384, 64),
    // Stacking-only button
    platformButton('btn18', BTN_PLAT, 'door18'),
    fullHeightDoor('door18', 768),
    // Spikes on the path to the goal platform — jump onto the platform
    floorTrap('trap18b', 992, 64),
    goalOnPlatform('goal18', GOAL_PLAT),
  ],
};
