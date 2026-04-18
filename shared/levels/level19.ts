import { LevelData } from '../level';
import {
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';
import { FLOOR_TOP } from './_helpers';
import { TILE_SIZE } from '../constants';

// Level 19 — "Spike Bridge"  (Pack: Hazards, 2 players)
// A long narrow platform over a spike-filled floor. One player stacks as a
// step-stool to reach the elevated button platform. Once the door opens,
// both players must navigate the spike bridge to reach the goal.
// Falling off the bridge into the spikes restarts the level!
//
// Physics: BTN_PLAT top = 395 (stacking-only zone)
// Ground is split into left + right safe zones with the spike pit between
// them, so groundRect() (full-width) isn't used here.

const MAP_W = 1920;

const BTN_PLAT = platformRect(160, 395, 192); // stacking-only

export const LEVEL_19: LevelData = {
  id: 19,
  name: 'Spike Bridge',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    // Left safe zone
    { x: 0, y: FLOOR_TOP, width: 320, height: TILE_SIZE, tileType: 'ground' },
    BTN_PLAT,
    // The spike bridge — players walk across it
    platformRect(640, 533, 896),
    // Right safe landing zone
    { x: 1536, y: FLOOR_TOP, width: 384, height: TILE_SIZE, tileType: 'ground' },
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Spike field under the bridge — fall off and you die!
    floorTrap('trap19a', 960, 640),
    // Stacking-only button — opens the gate to the bridge
    platformButton('btn19', BTN_PLAT, 'door19'),
    fullHeightDoor('door19', 512),
    goalOnFloor('goal19', 1856),
  ],
};
