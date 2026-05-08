import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  movingPlatform,
  platformButton,
  platformRect,
  pushBox,
  standardSpawns,
} from './_helpers';

const highKey = platformRect(820, FLOOR_TOP - 256, 160);

export const LEVEL_5: LevelData = {
  id: 5,
  name: 'Clockwork Yard',
  minPlayers: 1,
  mapWidth: 2600,
  solidRects: [
    groundSegment(0, 520),
    groundSegment(1180, 1420),
    highKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    movingPlatform('l5_ferry', 586, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 650,
      to: 1040,
      speed: 110,
    }),
    platformButton('l5_high_latch', highKey, 'l5_door', { latching: true }),
    pushBox('l5_box', 1240, FLOOR_TOP - 32),
    floorButton('l5_box_lock', 1510, 'l5_door', { width: 64 }),
    fullHeightDoor('l5_door', 1660),
    fireBar('l5_exit_sweeper', 1880, FLOOR_TOP - 48, 2, 1.4, 0),
    goalOnFloor('l5_goal', 2510),
  ],
};
