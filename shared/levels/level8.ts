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

const boostKey = platformRect(640, FLOOR_TOP - 292, 160);

export const LEVEL_8: LevelData = {
  id: 8,
  name: 'Crate Boost',
  minPlayers: 2,
  mapWidth: 2200,
  solidRects: [
    groundRect(2200),
    boostKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    platformButton('l8_stack_key', boostKey, 'l8_door', { latching: true }),
    pushBox('l8_box', 1120, FLOOR_TOP - 32),
    floorButton('l8_box_lock', 1450, 'l8_door', { width: 64 }),
    fireBar('l8_box_sweeper', 1580, FLOOR_TOP - 64, 2, 1.1, 0),
    fullHeightDoor('l8_door', 1720),
    goalOnFloor('l8_goal', 2140),
  ],
};
