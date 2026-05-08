import { LevelData } from '../level';
import {
  FLOOR_TOP,
  crumblePlatform,
  fireBar,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  standardSpawns,
} from './_helpers';

export const LEVEL_4: LevelData = {
  id: 4,
  name: 'Crumble Arcade',
  minPlayers: 1,
  mapWidth: 2200,
  solidRects: [
    groundSegment(0, 360),
    groundSegment(1080, 1120),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    crumblePlatform('l4_c1', 420, FLOOR_TOP - 96, 96),
    crumblePlatform('l4_c2', 560, FLOOR_TOP - 96, 96),
    crumblePlatform('l4_c3', 700, FLOOR_TOP - 96, 96),
    crumblePlatform('l4_c4', 840, FLOOR_TOP - 96, 96),
    floorButton('l4_latch', 1180, 'l4_door', { latching: true }),
    fireBar('l4_spinner', 1370, FLOOR_TOP - 48, 2, -1.3, 90),
    fullHeightDoor('l4_door', 1550),
    goalOnFloor('l4_goal', 2110),
  ],
};
