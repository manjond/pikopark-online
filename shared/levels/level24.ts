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

// Level 24 — "Mid-Air Switch"  (Pack: Duo Synergy, 2 players)
// A vertical lift carries one player up to a stack-only ledge. The other
// rides the same lift, hops off at the lower stop, and lands on a fixed
// pressure pad that gates the goal door. Meanwhile the high rider walks
// the upper catwalk to the latching button — both must coexist for the
// door to stay open. Once latched, the holder can leave the pad — the
// latch keeps the door open for the climber's descent.

const MAP_W = 1664;
const LIFT_DOCK_TOP = 580;
const LIFT_TOP_TOP  = 300;
const HI_LANDING = platformRect(384, 320, 192);
const HI_BTN_PT  = platformRect(736, 320, 192);
const PRESSURE_PAD = platformRect(736, 540, 160); // dock for the holder

export const LEVEL_24: LevelData = {
  id: 24,
  name: 'Mid-Air Switch',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    HI_LANDING,
    HI_BTN_PT,
    PRESSURE_PAD,
  ],
  spawnPoints: standardSpawns(),

  objects: [
    // Vertical lift — carries riders from the floor up to HI_LANDING.
    movingPlatform('mp24', 96, LIFT_DOCK_TOP, 128, {
      axis: 'y',
      from: LIFT_DOCK_TOP + 16,
      to:   LIFT_TOP_TOP  + 16,
      speed: 110,
    }),
    // Pressure pad on the elevated dock — holder stands here.
    platformButton('btn24hold', PRESSURE_PAD, 'door24', { width: 160 }),
    // Latching button on the upper catwalk — once tapped, door stays open.
    platformButton('btn24latch', HI_BTN_PT, 'door24latch', { latching: true }),
    fullHeightDoor('door24', 1280),
    fullHeightDoor('door24latch', 1408),
    goalOnFloor('goal24', 1568),
  ],
};
