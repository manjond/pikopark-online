import { LevelData } from '../level';
import {
  FLOOR_TOP,
  crumblePlatform,
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

const citadelStack = platformRect(1320, FLOOR_TOP - 344, 176);

export const LEVEL_15: LevelData = {
  id: 15,
  name: 'Wobble Citadel',
  minPlayers: 4,
  mapWidth: 3600,
  solidRects: [
    groundSegment(0, 780),
    groundSegment(1180, 620),
    groundSegment(2100, 1500),
    citadelStack,
    platformRect(2380, FLOOR_TOP - 128, 128),
    platformRect(2580, FLOOR_TOP - 192, 128),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l15_crew_lock', 360, 'l15_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    movingPlatform('l15_entry_ferry', 796, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 860,
      to: 1100,
      speed: 105,
    }),
    platformButton('l15_stack_latch', citadelStack, 'l15_door', { latching: true }),
    pushBox('l15_box_a', 2160, FLOOR_TOP - 32),
    pushBox('l15_box_b', 2280, FLOOR_TOP - 32),
    floorButton('l15_box_lock_a', 2520, 'l15_door', { width: 64 }),
    floorButton('l15_box_lock_b', 2640, 'l15_door', { width: 64 }),
    crumblePlatform('l15_c1', 1900, FLOOR_TOP - 96, 96),
    crumblePlatform('l15_c2', 2020, FLOOR_TOP - 96, 96),
    fireBar('l15_inner_fire', 2780, FLOOR_TOP - 72, 2, -1.3, 90),
    fullHeightDoor('l15_door', 2920),
    fireBar('l15_exit_fire', 3240, FLOOR_TOP - 64, 2, 1.5, 0),
    goalOnFloor('l15_goal', 3520),
  ],
};
