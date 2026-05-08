import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

const shoulderKey = platformRect(620, FLOOR_TOP - 292, 144);

export const LEVEL_6: LevelData = {
  id: 6,
  name: 'Shoulder Key',
  minPlayers: 2,
  mapWidth: 1700,
  solidRects: [
    groundRect(1700),
    shoulderKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    platformButton('l6_stack_latch', shoulderKey, 'l6_door', { latching: true }),
    fullHeightDoor('l6_door', 1100),
    goalOnFloor('l6_goal', 1620),
  ],
};
