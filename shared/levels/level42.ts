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

// Level 42 — "Maze Squad"  (Pack: Squad Legion, 4 players)
// Wide map split into four cells by full-height doors. Each cell has its
// own latching button — but each button can only be pressed AFTER the
// previous cell's pressure pad opens its door. Four pressure pads + four
// latches + four doors. Every player has a job in every cell, and the
// natural play is: rotate roles cell-by-cell so nobody is locked out.

const MAP_W = 2880;

export const LEVEL_42: LevelData = {
  id: 42,
  name: 'Maze Squad',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W)],
  spawnPoints: standardSpawns(),

  objects: [
    // Cell 1 → Cell 2.
    floorButton('b42holdA', 96,  'door42A'),
    fullHeightDoor('door42A', 384),
    floorButton('b42latchA', 192, 'door42goal', { latching: true }),
    floorTrap('t42a', 544, 96),
    fireBar('fb42a', 544, 580, 2, 1.4, 0),

    // Cell 2 → Cell 3.
    floorButton('b42holdB', 736, 'door42B'),
    fullHeightDoor('door42B', 992),
    floorButton('b42latchB', 832, 'door42goal', { latching: true }),
    floorTrap('t42b', 1152, 96),
    crumblePlatform('cr42', 1184, 565, 96),

    // Cell 3 → Cell 4.
    floorButton('b42holdC', 1344, 'door42C'),
    fullHeightDoor('door42C', 1600),
    floorButton('b42latchC', 1440, 'door42goal', { latching: true }),
    floorTrap('t42c', 1760, 96),
    fireBar('fb42c', 1760, 580, 2, -1.6, 90),

    // Cell 4 → Goal.
    floorButton('b42holdD', 1952, 'door42D'),
    fullHeightDoor('door42D', 2208),
    floorButton('b42latchD', 2048, 'door42goal', { latching: true }),

    // The goal door requires ALL FOUR latches.
    fullHeightDoor('door42goal', 2528),
    goalOnFloor('goal42', 2816),
  ],
};
