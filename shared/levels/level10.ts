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
  standardSpawns,
} from './_helpers';

const stackKey = platformRect(520, FLOOR_TOP - 276, 160);

export const LEVEL_10: LevelData = {
  id: 10,
  name: 'Duo Lockworks',
  minPlayers: 2,
  mapWidth: 2600,
  solidRects: [
    groundSegment(0, 700),
    groundSegment(1120, 1480),
    stackKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l10_pair_lock', 310, 'l10_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    platformButton('l10_stack_key', stackKey, 'l10_door', { latching: true }),
    movingPlatform('l10_bridge', 696, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 760,
      to: 1050,
      speed: 105,
    }),
    fireBar('l10_mid_sweeper', 1550, FLOOR_TOP - 64, 2, -1.2, 90),
    fullHeightDoor('l10_door', 1900),
    goalOnFloor('l10_goal', 2520),
  ],
};
