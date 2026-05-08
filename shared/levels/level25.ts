import { LevelData } from '../level';
import {
  FLOOR_TOP,
  crumblePlatform,
  fireBar,
  floorButton,
  floorSpring,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  movingPlatform,
  platformButton,
  platformRect,
  pushBox,
  spikeTrap,
  standardSpawns,
  vine,
} from './_helpers';

const highKey = platformRect(760, FLOOR_TOP - 368, 176);

export const LEVEL_25: LevelData = {
  id: 25,
  name: 'Solo Clocktower',
  minPlayers: 1,
  mapWidth: 3800,
  solidRects: [
    groundSegment(0, 560),
    groundSegment(940, 760),
    groundSegment(2100, 1700),
    highKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorSpring('l25_spring', 430, 56),
    platformButton('l25_high_key', highKey, 'l25_door', { latching: true }),
    vine('l25_vine', 1840, FLOOR_TOP - 150, 190, 560),
    movingPlatform('l25_ferry', 1706, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 1770,
      to: 2020,
      speed: 120,
    }),
    pushBox('l25_box', 2200, FLOOR_TOP - 32),
    floorButton('l25_box_lock', 2480, 'l25_door', { width: 64 }),
    crumblePlatform('l25_c1', 2640, FLOOR_TOP - 96, 96),
    crumblePlatform('l25_c2', 2760, FLOOR_TOP - 96, 96),
    spikeTrap('l25_spikes', 2940, FLOOR_TOP - 16, 96),
    fireBar('l25_fire', 3140, FLOOR_TOP - 72, 2, -1.45, 90),
    fullHeightDoor('l25_door', 3320),
    goalOnFloor('l25_goal', 3720),
  ],
};
