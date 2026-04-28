import { LevelData } from '../level';
import {
  fireBar,
  floorTrap,
  goalOnPlatform,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 11 — "Storm"  (Pack: Solo Master, 1 player)
// Wide map (1920) packed with five firebars at varying heights and pivots.
// Three lava strips below punish missteps. Two static platforms break the
// run — the first lets you read the early bars, the second is a checkpoint
// before the goal mesa.

const MAP_W = 1920;
const REST_A   = platformRect(384,  540, 160);
const REST_B   = platformRect(1120, 540, 160);
const GOAL_PAD = platformRect(1696, 460, 192);

export const LEVEL_11: LevelData = {
  id: 11,
  name: 'Storm',
  minPlayers: 1,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), REST_A, REST_B, GOAL_PAD],
  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap11a', 336,  128),
    floorTrap('trap11b', 768,  192),
    floorTrap('trap11c', 1408, 160),
    // Five firebars: short ones in the floor band, long ones up high.
    fireBar('fb11a', 240,  580, 2, 1.4,  0),
    fireBar('fb11b', 576,  440, 3, -1.2, 60),
    fireBar('fb11c', 864,  580, 2, 1.6,  120),
    fireBar('fb11d', 1280, 440, 3, -1.5, 180),
    fireBar('fb11e', 1568, 540, 2, 2.0,  240),
    goalOnPlatform('goal11', GOAL_PAD),
  ],
};
