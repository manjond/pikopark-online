import { LevelData } from '../level';
import {
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  movingPlatform,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 31 — "Lift & Toss"  (Pack: Acrobatics, 2 players)
// Combines both new mechanics into a single forced-solution puzzle.
//
//   • BTN_PAD sits at top-y=260 — below THROW_FEET_PEAK (≈303), so a floor
//     carrier CANNOT throw a rider onto it. Stacking also falls short
//     (STACK3=357 > 260). The only way up is to throw from the lift's top.
//   • The lift oscillates vertically at x=520, docking at y=520 (bottom,
//     solo-reachable from floor) and y=380 (top). Carrier picks up rider
//     at the bottom, rides up, throws at the peak — the ~140 px extra
//     height pushes the horizontal throw reach from ~396 px to ~558 px,
//     enough to clear the gap to BTN_PAD at center x≈1090.
//
// Solo-bypass check: a solo jump from lift-top lands ~x=868 horizontally
// (348 px reach), short of BTN_PAD's left edge at x=1000. So only the
// carry-then-throw path hits the button ledge.

const MAP_W = 1280;

const BTN_PAD = platformRect(1000, 260, 180);
const LIFT_X  = 520;   // lift center x

export const LEVEL_31: LevelData = {
  id: 31,
  name: 'Lift & Toss',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), BTN_PAD],

  spawnPoints: standardSpawns(),

  objects: [
    // Vertical lift — `startX` top-left = LIFT_X - 64, center aligns with LIFT_X.
    movingPlatform('lift31', LIFT_X - 64, 520, 128, {
      axis: 'y',
      from: 520 + 16, // platform center y at bottom dock
      to:   380 + 16, // platform center y at top dock
      speed: 90,
    }),

    // Throw-only latching button — gates the door.
    platformButton('btn31', BTN_PAD, 'door31', {
      latching: true, width: 96,
    }),
    fullHeightDoor('door31', 1220),
    goalOnFloor('goal31', 1260),
  ],
};
