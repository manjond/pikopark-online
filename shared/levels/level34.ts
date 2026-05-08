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
  spikeTrap,
  standardSpawns,
  vine,
} from './_helpers';

const throwKey = platformRect(1030, FLOOR_TOP - 276, 190);

export const LEVEL_34: LevelData = {
  id: 34,
  name: 'Stack and Swing',
  minPlayers: 2,
  mapWidth: 3400,
  solidRects: [
    groundSegment(0, 620),
    groundSegment(920, 760),
    groundSegment(2140, 1260),
    throwKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l34_pair_lock', 320, 'l34_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    vine('l34_vine', 760, FLOOR_TOP - 150, 190, 560),
    platformButton('l34_throw_key', throwKey, 'l34_door', { latching: true }),
    crumblePlatform('l34_c1', 1740, FLOOR_TOP - 96, 96),
    crumblePlatform('l34_c2', 1880, FLOOR_TOP - 96, 96),
    spikeTrap('l34_spikes', 2320, FLOOR_TOP - 16, 96),
    fireBar('l34_fire', 2520, FLOOR_TOP - 72, 2, -1.35, 90),
    fullHeightDoor('l34_door', 2760),
    goalOnFloor('l34_goal', 3320),
  ],
};
