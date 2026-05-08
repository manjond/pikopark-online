import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  spikeTrap,
  standardSpawns,
} from './_helpers';

const stackKey = platformRect(720, FLOOR_TOP - 276, 160);

export const LEVEL_26: LevelData = {
  id: 26,
  name: 'Duo Spike Key',
  minPlayers: 2,
  mapWidth: 2200,
  solidRects: [
    groundRect(2200),
    stackKey,
    platformRect(1020, FLOOR_TOP - 128, 128),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l26_pair_lock', 360, 'l26_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    platformButton('l26_stack_key', stackKey, 'l26_door', { latching: true }),
    spikeTrap('l26_spikes', 1180, FLOOR_TOP - 16, 112),
    fireBar('l26_fire', 1380, FLOOR_TOP - 72, 2, 1.2, 45),
    fullHeightDoor('l26_door', 1660),
    goalOnFloor('l26_goal', 2120),
  ],
};
