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
  spikeTrap,
  standardSpawns,
  vine,
} from './_helpers';

const stackKey = platformRect(720, FLOOR_TOP - 276, 160);

export const LEVEL_30: LevelData = {
  id: 30,
  name: 'Duo Hazard Yard',
  minPlayers: 2,
  mapWidth: 3300,
  solidRects: [
    groundSegment(0, 620),
    groundSegment(980, 2320),
    stackKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l30_pair_lock', 320, 'l30_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    platformButton('l30_stack_key', stackKey, 'l30_door', { latching: true }),
    vine('l30_vine', 800, FLOOR_TOP - 150, 190, 560),
    movingPlatform('l30_ferry', 1816, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 1880,
      to: 2080,
      speed: 120,
    }),
    pushBox('l30_box', 1160, FLOOR_TOP - 32),
    floorButton('l30_box_lock', 1460, 'l30_door', { width: 64 }),
    spikeTrap('l30_spikes', 2240, FLOOR_TOP - 16, 112),
    fireBar('l30_fire', 2460, FLOOR_TOP - 72, 2, 1.4, 0),
    fullHeightDoor('l30_door', 2700),
    goalOnFloor('l30_goal', 3220),
  ],
};
