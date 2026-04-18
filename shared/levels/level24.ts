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

// Level 24 — "Spike Pinnacle"  (Pack: Extreme, 2 players)
// Stacking to a high platform (2-player stack zone) with spikes below.
// Wide map. Spike bridge section + stacking mechanic combined.
//
// Physics: BTN_PLAT top = 395 (stacking-only zone = [STACK2_FEET_PEAK, SOLO_FEET_PEAK))

const MAP_W = 1920;

const BTN_PLAT  = platformRect(256,  395, 192); // 2-stack only
const GOAL_PLAT = platformRect(1536, 420, 256); // barely reachable solo

export const LEVEL_24: LevelData = {
  id: 24,
  name: 'Spike Pinnacle',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    BTN_PLAT,
    // Mid platforms for bridge section
    platformRect(640,  507, 192),
    platformRect(1024, 480, 192),
    GOAL_PLAT,
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // High button — 2-player stack needed
    platformButton('btn24', BTN_PLAT, 'door24'),
    fullHeightDoor('door24', 512),
    // Spike zones in the bridge section
    floorTrap('trap24a', 736,  96),
    floorTrap('trap24b', 1120, 96),
    floorTrap('trap24c', 1344, 128),
    goalOnPlatform('goal24', GOAL_PLAT),
  ],
};
