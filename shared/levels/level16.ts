import { LevelData } from '../level';
import {
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnPlatform,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 16 — "First Pact"  (Pack: Duo Allies, 2 players)
// Even the easiest duo level demands real teamwork. Three interlocking
// pieces:
//   1. Player A holds the pressure pad → the lava strip blocking B's path
//      goes cold. B sprints across.
//   2. B reaches a high platform that solo can't touch (y=400, stack-only)
//      — A leaves the pad (lava re-arms behind A) and joins B; B steps off
//      so A can stack and reach the latching button.
//   3. Latching unlocks the goal door. Both players cross safely now that
//      the latched switch keeps the path open.

const MAP_W = 1280;
const STEP     = platformRect(384, 540, 160);
const STACK_PT = platformRect(704, 400, 160); // stack-only (STACK2_FEET_PEAK = 389)
const GOAL_PAD = platformRect(1056, 480, 160);

export const LEVEL_16: LevelData = {
  id: 16,
  name: 'First Pact',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), STEP, STACK_PT, GOAL_PAD],
  spawnPoints: standardSpawns(),

  objects: [
    // A's pressure pad on the spawn rim — must be held while B crosses.
    floorButton('btn16a', 128, 'trap16'),
    // Lava bar wide enough that solo can't jump it without the pad-clear.
    floorTrap('trap16', 480, 224),
    // B (or A, after stacking) lands on STACK_PT and presses the latch.
    platformButton('btn16b', STACK_PT, 'door16', { latching: true }),
    fullHeightDoor('door16', 928),
    goalOnPlatform('goal16', GOAL_PAD),
  ],
};
