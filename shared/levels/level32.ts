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

// Level 32 — "Two Crews"  (Pack: Squad Crew, 4 players)
// The map is split into two halves by a tall central wall. Each half
// houses a stack-only latching button. Each side also has a pressure
// pad that clears the OTHER side's lava strip — so each crew of two
// must dispatch one stacker and one holder, and the two crews mirror
// each other's solution. Both latches → goal door opens in the centre.

const MAP_W = 2240;
const STACK_L = platformRect(256,  400, 192);
const STACK_R = platformRect(1792, 400, 192);
const PED_L   = platformRect(96,   540, 96);
const PED_R   = platformRect(2048, 540, 96);

export const LEVEL_32: LevelData = {
  id: 32,
  name: 'Two Crews',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), STACK_L, STACK_R, PED_L, PED_R],
  spawnPoints: standardSpawns(),

  objects: [
    // L crew's pressure pad clears R crew's lava strip.
    platformButton('btn32holdL', PED_L, 'trap32R', { width: 96 }),
    floorTrap('trap32R', 1408, 480),
    // R crew's pressure pad clears L crew's lava strip.
    platformButton('btn32holdR', PED_R, 'trap32L', { width: 96 }),
    floorTrap('trap32L', 832, 480),
    // Stack-only latching buttons.
    platformButton('btn32L', STACK_L, 'door32', { latching: true }),
    platformButton('btn32R', STACK_R, 'door32', { latching: true }),
    // Mid-level latching helper — once the two main latches fire, the
    // goal door opens. A fourth-player can press btn32release to confirm.
    floorButton('btn32release', 1024, 'door32', { latching: true }),
    fullHeightDoor('door32', 1056),
    goalOnFloor('goal32', 1120),
  ],
};
