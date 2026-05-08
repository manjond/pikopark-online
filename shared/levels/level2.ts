import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformRect,
  pushBox,
  standardSpawns,
} from './_helpers';

export const LEVEL_2: LevelData = {
  id: 2,
  name: 'Crate Switchyard',
  minPlayers: 1,
  mapWidth: 1900,
  solidRects: [
    groundRect(1900),
    platformRect(650, FLOOR_TOP - 128, 128),
    platformRect(900, FLOOR_TOP - 176, 128),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    pushBox('l2_box', 240, FLOOR_TOP - 32),
    floorButton('l2_crate_lock', 1080, 'l2_door', { width: 64 }),
    fireBar('l2_sweeper', 1260, FLOOR_TOP - 48, 2, 1.2, 10),
    fullHeightDoor('l2_door', 1420),
    goalOnFloor('l2_goal', 1820),
  ],
};
