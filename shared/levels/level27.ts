import { LevelData } from '../level';
import {
  FLOOR_TOP,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  platformButton,
  platformRect,
  standardSpawns,
  vine,
} from './_helpers';

const stackKey = platformRect(1120, FLOOR_TOP - 276, 160);

export const LEVEL_27: LevelData = {
  id: 27,
  name: 'Paired Swing',
  minPlayers: 2,
  mapWidth: 2400,
  solidRects: [
    groundSegment(0, 560),
    groundSegment(840, 1560),
    stackKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l27_pair_lock', 300, 'l27_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    vine('l27_vine', 700, FLOOR_TOP - 150, 190, 560),
    platformButton('l27_stack_key', stackKey, 'l27_door', { latching: true }),
    fullHeightDoor('l27_door', 1660),
    goalOnFloor('l27_goal', 2320),
  ],
};
