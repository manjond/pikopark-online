import { LevelData } from '../level';
import {
  crumblePlatform,
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

// Level 26 — "Cliff Run"  (Pack: Duo Trust, 2 players)
// Hard intro to the trust pack. A four-stage relay where every stage
// punishes a misstep:
//   1. A holds pressure pad — clears lava trap zone for B.
//   2. B sprints across the cleared trap, threads two firebars at floor
//      level on the bridge.
//   3. B finds the latching button on a stack-only ledge — but B is
//      alone. So A leaves the pad (trap re-arms — A has no path back),
//      runs the firebars too, joins B for the stack.
//   4. Stack-latch opens the goal door. The carrier walks (alone, since
//      only one needs to touch goal) past one final crumble plate to
//      the goal.
// A's trap re-arming is meaningful: A has to commit to the run.

const MAP_W = 1920;
const STACK_PT = platformRect(960, 400, 192);

export const LEVEL_26: LevelData = {
  id: 26,
  name: 'Cliff Run',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), STACK_PT],
  spawnPoints: standardSpawns(),

  objects: [
    // A's pressure pad on spawn rim.
    floorButton('btn26hold', 96, 'trap26'),
    // The lava bridge.
    floorTrap('trap26', 480, 384),
    // Two firebars at floor level — the bridge crossing risk.
    fireBar('fb26a', 432, 580, 2, 1.6,  0),
    fireBar('fb26b', 720, 580, 2, -1.4, 90),
    // Stack-only latch button.
    platformButton('btn26latch', STACK_PT, 'door26', { latching: true }),
    fullHeightDoor('door26', 1280),
    // One last crumble plate over a tiny lava strip — the goal-side spit.
    floorTrap('trap26spit', 1440, 96),
    crumblePlatform('cr26', 1408, 565, 96),
    goalOnFloor('goal26', 1856),
  ],
};
