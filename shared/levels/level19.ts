import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  movingPlatform,
  spikeTrap,
  standardSpawns,
} from './_helpers';

export const LEVEL_19: LevelData = {
  id: 19,
  name: 'Ferry Needles',
  minPlayers: 1,
  mapWidth: 2600,
  solidRects: [
    groundSegment(0, 460),
    groundSegment(840, 1760),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    movingPlatform('l19_ferry', 486, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 550,
      to: 760,
      speed: 120,
    }),
    floorButton('l19_key', 960, 'l19_door', { latching: true }),
    spikeTrap('l19_spikes', 1170, FLOOR_TOP - 16, 128),
    fireBar('l19_fire', 1440, FLOOR_TOP - 72, 2, 1.25, 45),
    fullHeightDoor('l19_door', 1740),
    goalOnFloor('l19_goal', 2520),
  ],
};
