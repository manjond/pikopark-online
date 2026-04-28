import { LevelData } from '../level';
import {
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

// Level 31 — "Four Pillars"  (Pack: Squad Crew, 4 players)
// Easiest squad level — but still real teamwork. Four stack-only pillars,
// each topped by a latching button. All four required to open the goal
// door. A lava bridge between pillar 2 and pillar 3 only goes cold while
// one player holds the pressure pad on pillar 1's lower step. So the
// natural divide-and-conquer plan needs a fifth role: a "holder" who
// stays back. With four players, that's tight: pair up to stack pillars
// 1 and 2 (one of those four becomes the holder), then the remaining
// three handle pillars 3 and 4 in pairs (someone has to commit to being
// alone temporarily). The latches all stick, so the order can be tuned.

const MAP_W = 2560;
const P1 = platformRect(192,  400, 192);
const P2 = platformRect(704,  400, 192);
const P3 = platformRect(1664, 400, 192);
const P4 = platformRect(2176, 400, 192);
const PED = platformRect(384, 540, 96);

export const LEVEL_31: LevelData = {
  id: 31,
  name: 'Four Pillars',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), P1, P2, P3, P4, PED],
  spawnPoints: standardSpawns(),

  objects: [
    // Four stack-only latches.
    platformButton('btn31a', P1, 'door31', { latching: true }),
    platformButton('btn31b', P2, 'door31', { latching: true }),
    platformButton('btn31c', P3, 'door31', { latching: true }),
    platformButton('btn31d', P4, 'door31', { latching: true }),
    // Pressure pad on the side step — clears the lava bridge.
    platformButton('btn31hold', PED, 'trap31', { width: 96 }),
    floorTrap('trap31', 1216, 768),
    fireBar('fb31', 1216, 580, 3, 1.4, 90),
    // Goal door + goal.
    fullHeightDoor('door31', 2400),
    goalOnFloor('goal31', 2496),
  ],
};
