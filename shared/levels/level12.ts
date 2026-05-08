import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

const stackBell = platformRect(700, FLOOR_TOP - 344, 160);

export const LEVEL_12: LevelData = {
  id: 12,
  name: 'Stack Bell',
  minPlayers: 4,
  mapWidth: 2000,
  solidRects: [
    groundRect(2000),
    stackBell,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    platformButton('l12_stack_bell', stackBell, 'l12_door', { latching: true }),
    fireBar('l12_guard', 1080, FLOOR_TOP - 64, 2, 1.0, 0),
    fullHeightDoor('l12_door', 1340),
    goalOnFloor('l12_goal', 1930),
  ],
};
