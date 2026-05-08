import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  floorSpring,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  pushBox,
  spikeTrap,
  standardSpawns,
} from './_helpers';

const springKey = platformRect(740, FLOOR_TOP - 368, 176);

export const LEVEL_24: LevelData = {
  id: 24,
  name: 'Needle Workshop',
  minPlayers: 1,
  mapWidth: 3200,
  solidRects: [
    groundRect(3200),
    springKey,
    platformRect(1040, FLOOR_TOP - 160, 128),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorSpring('l24_spring', 480, 56),
    platformButton('l24_spring_key', springKey, 'l24_door', { latching: true }),
    pushBox('l24_box', 1360, FLOOR_TOP - 32),
    floorButton('l24_box_lock', 1660, 'l24_door', { width: 64 }),
    spikeTrap('l24_spikes_a', 1890, FLOOR_TOP - 16, 96),
    fireBar('l24_fire_a', 2080, FLOOR_TOP - 72, 2, 1.25, 0),
    spikeTrap('l24_spikes_b', 2320, FLOOR_TOP - 16, 96),
    fullHeightDoor('l24_door', 2540),
    goalOnFloor('l24_goal', 3120),
  ],
};
