import { LevelData } from '../level';
import {
  FLOOR_TOP,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  pushBox,
  standardSpawns,
  vine,
} from './_helpers';

export const LEVEL_18: LevelData = {
  id: 18,
  name: 'Swing Crate',
  minPlayers: 1,
  mapWidth: 2400,
  solidRects: [
    groundSegment(0, 620),
    groundSegment(860, 1540),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    vine('l18_vine', 720, FLOOR_TOP - 140, 180, 560),
    pushBox('l18_box', 940, FLOOR_TOP - 32),
    floorButton('l18_box_lock', 1210, 'l18_door', { width: 64 }),
    fullHeightDoor('l18_door', 1380),
    goalOnFloor('l18_goal', 2320),
  ],
};
