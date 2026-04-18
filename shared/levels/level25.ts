import { LevelData } from '../level';
import {
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 25 — "The Final Trial"  (Pack: Extreme, 2 players)
// Everything combined: stacking, pressure buttons, latching buttons, spike
// traps, and a wide map. The ultimate test of teamwork.
//
// Sequence:
//   1. Stack to press btn25a (stacking-only, latching) → door 1 opens forever
//   2. Both players pass; one holds pressure btn25b → deactivates spike zone 1
//   3. The other passes through, presses latching btn25c → zone 2 safe forever
//   4. They navigate the final spike gauntlet (trap25c/d/e) to the goal
// btn25a is latching so the stacker can jump down and keep going — otherwise
// the 2-player session couldn't complete the level.
//
// NOTE (2026-04-18): the original file also declared a `door25b` barrier at
// x=1536 whose only `linkedId` reference was decorative (`door.linkedId ==
// 'btn25c'`, never read by the server). Since no button actually pointed to
// door25b, the engine kept it permanently closed and the level was unwinnable
// as shipped. Removing the orphan door restores the intended flow; the final
// gauntlet (trap25c/d/e) already provides the "no shortcuts" climax.

const MAP_W = 2560;

const BTN_PLAT = platformRect(192, 395, 192); // stacking-only

export const LEVEL_25: LevelData = {
  id: 25,
  name: 'The Final Trial',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    BTN_PLAT,
    // Mid-section platforms
    platformRect(1024, 533, 192),
    platformRect(1600, 507, 192),
    platformRect(2176, 480, 192),
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Step 1: Stacking-only latching button → door25a opens forever
    platformButton('btn25a', BTN_PLAT, 'door25a', { latching: true }),
    fullHeightDoor('door25a', 512),
    // Step 2: Pressure button (Player A holds) — clears spike zone 1
    floorButton('btn25b', 704, 'trap25a'),
    floorTrap('trap25a', 896, 96),
    // Step 3: Latching button (Player B presses) — clears spike zone 2 forever
    floorButton('btn25c', 1152, 'trap25b', { latching: true }),
    floorTrap('trap25b', 1344, 96),
    // Step 4: Final spike gauntlet — no shortcuts
    floorTrap('trap25c', 1696, 96),
    floorTrap('trap25d', 1920, 128),
    floorTrap('trap25e', 2272, 96),
    goalOnFloor('goal25', 2496),
  ],
};
