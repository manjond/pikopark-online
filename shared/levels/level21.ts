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

// Level 21 — "Trapdoor"  (Pack: Duo Synergy, 2 players)
// Three-stage trust puzzle. Door A is held open ONLY while A presses the
// pad — so B has a brief window to dash through. On the far side B finds
// a stack-only platform — but B is alone there. B has to wait for A to
// commit: A leaves the pad (door A slams shut behind A as A passes) and
// joins B for a stack. The stacking latches a permanent button that
// opens the goal door — the timing of A's leave is the whole puzzle.
//
// Solvability: door19a is held open by btn19hold (pressure, sum=1 < min=2,
// validator OK). door21goal opens via the latching stack button.

const MAP_W = 1664;
const STACK_PT = platformRect(960, 400, 192);

export const LEVEL_21: LevelData = {
  id: 21,
  name: 'Trapdoor',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), STACK_PT],
  spawnPoints: standardSpawns(),

  objects: [
    // A's pressure pad (must hold to open door A so B can pass).
    floorButton('btn21hold', 96, 'door21a'),
    fullHeightDoor('door21a', 384),
    // Lava strip just past door A — B must clear it by jumping while
    // door A is open. The strip width = 96 px, easily jumpable mid-run.
    floorTrap('trap21a', 480, 96),
    // The stack-only platform with the goal-opener latching button.
    platformButton('btn21stack', STACK_PT, 'door21goal', { latching: true }),
    // Goal door is past the stack platform — opens permanently after stack.
    fullHeightDoor('door21goal', 1280),
    goalOnFloor('goal21', 1600),
  ],
};
