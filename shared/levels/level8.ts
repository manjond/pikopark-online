import { LevelData } from '../level';
import {
  fireBar,
  goalOnFloor,
  groundRect,
  standardSpawns,
} from './_helpers';

// Level 8 — "Pendulum Hall"  (Pack: Solo Adept, 1 player)
// A corridor of four firebars at floor level, each rotating in opposite
// directions. There are no platforms — you walk on the floor, but every
// few tiles a blade arcs into the path. Read each rotation, dash through
// the gap, then read the next.

export const LEVEL_8: LevelData = {
  id: 8,
  name: 'Pendulum Hall',
  minPlayers: 1,

  solidRects: [groundRect()],
  spawnPoints: standardSpawns(),

  objects: [
    // 4 firebars spread across the corridor — alternating directions plus
    // a phase offset on every other pivot, so safe windows never line up.
    fireBar('fb8a', 304, 580, 2, 1.5, 0),
    fireBar('fb8b', 528, 580, 2, -1.5, 60),
    fireBar('fb8c', 752, 580, 2, 1.8, 120),
    fireBar('fb8d', 976, 580, 2, -1.8, 180),
    goalOnFloor('goal8', 1200),
  ],
};
