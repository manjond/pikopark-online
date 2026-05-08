import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  pushBox,
  standardSpawns,
} from './_helpers';

const stackKey = platformRect(680, FLOOR_TOP - 276, 160);

export const LEVEL_33: LevelData = {
  id: 33,
  name: 'Box Stack Accord',
  minPlayers: 2,
  mapWidth: 3000,
  solidRects: [groundRect(3000), stackKey],
  spawnPoints: standardSpawns(),
  objects: [
    platformButton('l33_stack_key', stackKey, 'l33_door', { latching: true }),
    pushBox('l33_box_a', 1080, FLOOR_TOP - 32),
    pushBox('l33_box_b', 1220, FLOOR_TOP - 32),
    floorButton('l33_box_lock_a', 1520, 'l33_door', { width: 64 }),
    floorButton('l33_box_lock_b', 1660, 'l33_door', { width: 64 }),
    floorButton('l33_pair_lock', 1900, 'l33_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    fireBar('l33_fire', 2140, FLOOR_TOP - 72, 2, 1.35, 0),
    fullHeightDoor('l33_door', 2380),
    goalOnFloor('l33_goal', 2920),
  ],
};
