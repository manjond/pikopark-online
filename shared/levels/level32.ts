import { LevelData } from '../level';
import {
  FLOOR_TOP,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  movingPlatform,
  platformButton,
  platformRect,
  spikeTrap,
  standardSpawns,
  vine,
} from './_helpers';

const stackKey = platformRect(1220, FLOOR_TOP - 276, 160);

export const LEVEL_32: LevelData = {
  id: 32,
  name: 'Twin Canopy',
  minPlayers: 2,
  mapWidth: 3000,
  solidRects: [
    groundSegment(0, 560),
    groundSegment(860, 760),
    groundSegment(1960, 1040),
    stackKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l32_pair_lock', 330, 'l32_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    vine('l32_vine_a', 700, FLOOR_TOP - 150, 190, 560),
    platformButton('l32_stack_key', stackKey, 'l32_door', { latching: true }),
    movingPlatform('l32_ferry', 1616, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 1680,
      to: 1900,
      speed: 115,
    }),
    spikeTrap('l32_spikes', 2180, FLOOR_TOP - 16, 96),
    fullHeightDoor('l32_door', 2440),
    goalOnFloor('l32_goal', 2920),
  ],
};
