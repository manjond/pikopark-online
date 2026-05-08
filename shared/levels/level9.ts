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

const throwWindow = platformRect(760, FLOOR_TOP - 276, 200);

export const LEVEL_9: LevelData = {
  id: 9,
  name: 'Stack Window',
  minPlayers: 2,
  mapWidth: 2000,
  solidRects: [
    groundRect(2000),
    throwWindow,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    platformButton('l9_throw_latch', throwWindow, 'l9_door', { latching: true }),
    fullHeightDoor('l9_door', 1460),
    goalOnFloor('l9_goal', 1930),
  ],
};
