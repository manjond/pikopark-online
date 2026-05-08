import { LevelData } from '../level';
import {
  FLOOR_TOP,
  crumblePlatform,
  fireBar,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

const stackKey = platformRect(500, FLOOR_TOP - 276, 160);

export const LEVEL_29: LevelData = {
  id: 29,
  name: 'Crumble Relay',
  minPlayers: 2,
  mapWidth: 2600,
  solidRects: [
    groundSegment(0, 700),
    groundSegment(1260, 1340),
    stackKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    platformButton('l29_stack_key', stackKey, 'l29_door', { latching: true }),
    floorButton('l29_pair_lock', 320, 'l29_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    crumblePlatform('l29_c1', 760, FLOOR_TOP - 96, 96),
    crumblePlatform('l29_c2', 900, FLOOR_TOP - 96, 96),
    crumblePlatform('l29_c3', 1040, FLOOR_TOP - 96, 96),
    fireBar('l29_fire', 1480, FLOOR_TOP - 72, 2, -1.2, 90),
    fullHeightDoor('l29_door', 1800),
    goalOnFloor('l29_goal', 2520),
  ],
};
