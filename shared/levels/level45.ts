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

// Level 45 — "Final Trial"  (Pack: Squad Legion, 4 players — apex)
// Five stages, every mechanic mandatory, no shortcuts:
//   Stage 1 — Pressure pad clears spring zone; one player holds while
//             another bounces onto the high catwalk.
//   Stage 2 — Stack-3 latch on the catwalk → opens stage-3 gate.
//   Stage 3 — Two parallel crumble bridges, both must be crossed (the
//             held pads down at stage 1 are no longer needed; pad-holders
//             can finally rejoin).
//   Stage 4 — Vertical lift between three firebars.
//   Stage 5 — Ice run into the goal, with one final stack-only latching
//             button gating the goal door.

const MAP_W = 3200;
const PED_S1   = platformRect(96,    540, 96);
const HI_CAT   = platformRect(384,   300, 320); // spring landing
const HI_LATCH = platformRect(640,   300, 192); // stack-3 reachable from HI_CAT (top y = 220 < 357 ⇒ throw needed; we'll model it as stack-3 from HI_CAT base)
const STACK_FINAL = platformRect(2752, 400, 192);
const ICE_RUN   = icePlatform(2304, 460, 320);

export const LEVEL_45: LevelData = {
  id: 45,
  name: 'Final Trial',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    PED_S1, HI_CAT, HI_LATCH, STACK_FINAL, ICE_RUN,
  ],
  spawnPoints: standardSpawns(),

  objects: [
    // Stage 1 — pressure pad opens the spring zone.
    platformButton('b45hold', PED_S1, 't45spring', { width: 96 }),
    floorTrap('t45spring', 352, 192),
    floorSpring('s45', 352),

    // Stage 2 — stack-only latching button on HI_LATCH.
    platformButton('b45hi', HI_LATCH, 'door45A', { latching: true }),
    fullHeightDoor('door45A', 960),

    // Stage 3 — twin crumble bridges over a wide lake.
    floorTrap('t45lake', 1408, 832),
    crumblePlatform('cr45h1', 1056, 540, 96),
    crumblePlatform('cr45h2', 1216, 510, 96),
    crumblePlatform('cr45h3', 1376, 480, 96),
    crumblePlatform('cr45h4', 1536, 510, 96),
    crumblePlatform('cr45h5', 1696, 540, 96),
    crumblePlatform('cr45l1', 1056, 600, 96),
    crumblePlatform('cr45l2', 1216, 600, 96),
    crumblePlatform('cr45l3', 1376, 600, 96),
    crumblePlatform('cr45l4', 1536, 600, 96),
    crumblePlatform('cr45l5', 1696, 600, 96),

    // Stage 4 — vertical lift between three firebars.
    movingPlatform('mp45', 1936, 540, 128, {
      axis: 'y',
      from: 540 + 16,
      to:   320 + 16,
      speed: 110,
    }),
    fireBar('fb45a', 2080, 460, 3, 1.6,  0),
    fireBar('fb45b', 2208, 380, 3, -1.6, 90),
    fireBar('fb45c', 2336, 540, 2, 1.4,  180),

    // Stage 5 — ice run, then final stack latch, then goal.
    floorTrap('t45rim', 2624, 96),
    floorButton('b45warm', 2400, 'door45B'),
    fullHeightDoor('door45B', 2624),
    platformButton('b45final', STACK_FINAL, 'door45goal', { latching: true }),
    fullHeightDoor('door45goal', 3008),
    goalOnFloor('goal45', 3136),
  ],
};
