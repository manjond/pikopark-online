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

// Level 23 — "Trust Throw"  (Pack: Duo Synergy, 2 players)
// A wide lava chasm splits the map. No platforms cross it; no jump clears
// it. The carrier picks up the partner with E and throws (E again) over
// the chasm — the rider's throw arc tops out around y=303, so the throw-
// target perch at y=320 catches them perfectly. The rider drops down on
// the far side, crosses a short trap that only goes cold when the carrier
// (still on the spawn rim) holds the pressure pad, and finally hits the
// latching switch that opens the goal door.

const MAP_W = 1920;
const FAR_PERCH = platformRect(640, 320, 192); // throw-target (THROW_FEET_PEAK = 303)

export const LEVEL_23: LevelData = {
  id: 23,
  name: 'Trust Throw',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), FAR_PERCH],
  spawnPoints: standardSpawns(),

  objects: [
    // The chasm — too wide for any solo or stacked jump.
    floorTrap('trap23chasm', 528, 480),
    // Pressure pad on spawn rim — carrier holds it after the throw.
    floorButton('btn23hold', 96, 'trap23warm'),
    // Lava strip past the perch — only cold while pad is held.
    floorTrap('trap23warm', 1024, 192),
    // Latching switch — opens the goal door for good.
    floorButton('btn23latch', 1280, 'door23', { latching: true }),
    // One last spit of lava after the latch, just to keep the rider honest.
    floorTrap('trap23spit', 1472, 96),
    fullHeightDoor('door23', 1664),
    goalOnFloor('goal23', 1856),
  ],
};
