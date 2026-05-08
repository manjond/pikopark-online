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
  standardSpawns,
} from './_helpers';

const throwKey = platformRect(820, FLOOR_TOP - 276, 190);

export const LEVEL_31: LevelData = {
  id: 31,
  name: 'Stack Bell II',
  minPlayers: 2,
  mapWidth: 2300,
  solidRects: [groundRect(2300), throwKey],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l31_pair_lock', 420, 'l31_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    platformButton('l31_throw_key', throwKey, 'l31_door', { latching: true }),
    fireBar('l31_fire', 1220, FLOOR_TOP - 72, 2, -1.2, 90),
    fullHeightDoor('l31_door', 1580),
    goalOnFloor('l31_goal', 2220),
  ],
};
