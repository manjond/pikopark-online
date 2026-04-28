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

// Level 19 — "Split Path"  (Pack: Duo Allies, 2 players)
// Wide map. The level demands BOTH a stacking move and a pressure-hold,
// so neither player is idle. Sequence:
//   1. A stacks B onto the high perch → B walks across to the latching
//      high button. B drops back to the floor on the right side.
//   2. A jumps to the pressure pad on the spawn rim → that pad clears the
//      lava lake B has to cross. B sprints across to the latching low
//      button. Door opens (both latches active).
//   3. B walks to the goal. (A's role ends after holding the pad.)

const MAP_W = 1920;
const HI_LAUNCH = platformRect(384, 400, 160);  // 2-stack reachable
const HI_REST   = platformRect(640, 395, 192);
const HI_BTN    = platformRect(960, 395, 192);
const PEDESTAL  = platformRect(96,  540, 96);   // A's pressure perch

export const LEVEL_19: LevelData = {
  id: 19,
  name: 'Split Path',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    HI_LAUNCH,
    HI_REST,
    HI_BTN,
    PEDESTAL,
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Upper route — stacking-only entry.
    platformButton('btn19hi', HI_BTN, 'door19', { latching: true }),
    // A's pressure pad clears the lava lake.
    floorButton('btn19hold', 144, 'trap19', { width: 96 }),
    floorTrap('trap19', 1280, 320),
    // Lower latching button — past the lake, latched to open the goal door.
    floorButton('btn19lo', 1568, 'door19', { latching: true }),
    fullHeightDoor('door19', 1728),
    goalOnFloor('goal19', 1856),
  ],
};
