import { LevelData } from '../level';
import {
  crumblePlatform,
  fireBar,
  floorButton,
  floorSpring,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  icePlatform,
  movingPlatform,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 30 — "Apex Duo"  (Pack: Duo Trust, 2 players — boss)
// Five-stage duo gauntlet on a wide map. Every cooperative mechanic is
// load-bearing here:
//   1. Pressure-pad-and-spring: A holds pad → spring re-arms → B bounces
//      onto the high catwalk. (Without the pad, the spring's launch is
//      too short — modelled by hiding the spring inside a lava strip
//      that's only cold while the pad is held.)
//   2. Crumble bridge over lava — both players run together.
//   3. Stack-only latching button on the upper catwalk.
//   4. Vertical lift threading two firebars — one rider at a time.
//   5. Ice slide finale into the goal.
// Final door opens after both latch buttons are flipped.

const MAP_W = 2560;
const PAD     = platformRect(96,   540, 96);
const HI_CAT  = platformRect(384,  300, 256); // throw + spring landing
const HI_BTN  = platformRect(704,  300, 192); // stack-only on top of catwalk
const LIFT_DOCK_TOP = 540;
const LIFT_TOP_TOP  = 320;
const ICE     = icePlatform(2080, 460, 320);
const GOAL_LIP = platformRect(2400, 460, 128);

export const LEVEL_30: LevelData = {
  id: 30,
  name: 'Apex Duo',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PAD, HI_CAT, HI_BTN, ICE, GOAL_LIP],
  spawnPoints: standardSpawns(),

  objects: [
    // Stage 1 — pad enables the launch zone.
    platformButton('btn30hold', PAD, 'trap30launch', { width: 96 }),
    floorTrap('trap30launch', 352, 192),
    floorSpring('spring30', 352),

    // Stage 2 — crumble bridge over a long lake.
    floorTrap('trap30bridge', 928, 768),
    crumblePlatform('cr30a',  672, 565, 96),
    crumblePlatform('cr30b',  832, 565, 96),
    crumblePlatform('cr30c',  992, 565, 96),
    crumblePlatform('cr30d', 1152, 565, 96),
    crumblePlatform('cr30e', 1312, 565, 96),

    // Stage 3 — upper-catwalk stack-only latching button.
    platformButton('btn30high', HI_BTN, 'door30hi', { latching: true }),
    fullHeightDoor('door30hi', 1568),

    // Stage 4 — vertical lift between two firebars.
    movingPlatform('mp30', 1632, LIFT_DOCK_TOP, 128, {
      axis: 'y',
      from: LIFT_DOCK_TOP + 16,
      to:   LIFT_TOP_TOP  + 16,
      speed: 100,
    }),
    fireBar('fb30a', 1808, 460, 3, 1.6,  0),
    fireBar('fb30b', 1984, 460, 3, -1.4, 90),

    // Stage 5 — final ice runway then the goal lip.
    floorButton('btn30finlatch', 1888, 'door30goal', { latching: true }),
    fullHeightDoor('door30goal', 2336),
    goalOnFloor('goal30', 2496),
  ],
};
