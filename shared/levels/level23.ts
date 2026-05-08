import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
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

const highKey = platformRect(1320, FLOOR_TOP - 256, 160);

export const LEVEL_23: LevelData = {
  id: 23,
  name: 'Vine Ferry',
  minPlayers: 1,
  mapWidth: 3100,
  solidRects: [
    groundSegment(0, 500),
    groundSegment(820, 900),
    groundSegment(2040, 1060),
    highKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    vine('l23_vine_a', 650, FLOOR_TOP - 150, 190, 560),
    movingPlatform('l23_ferry', 1716, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 1780,
      to: 1980,
      speed: 115,
    }),
    platformButton('l23_high_key', highKey, 'l23_door', { latching: true }),
    spikeTrap('l23_spikes', 2220, FLOOR_TOP - 16, 96),
    fireBar('l23_fire', 2400, FLOOR_TOP - 72, 2, -1.4, 90),
    fullHeightDoor('l23_door', 2600),
    goalOnFloor('l23_goal', 3020),
  ],
};
