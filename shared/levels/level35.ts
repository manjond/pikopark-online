import { LevelData } from '../level';
import {
  FLOOR_TOP,
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

const throwKey = platformRect(760, FLOOR_TOP - 276, 190);
const stackKey = platformRect(1340, FLOOR_TOP - 276, 160);

export const LEVEL_35: LevelData = {
  id: 35,
  name: 'Duo Clocktower',
  minPlayers: 2,
  mapWidth: 4000,
  solidRects: [
    groundSegment(0, 620),
    groundSegment(980, 900),
    groundSegment(2240, 1760),
    throwKey,
    stackKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l35_pair_lock', 320, 'l35_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    floorSpring('l35_spring', 450, 56),
    platformButton('l35_throw_key', throwKey, 'l35_door', { latching: true }),
    platformButton('l35_stack_key', stackKey, 'l35_door', { latching: true }),
    vine('l35_vine', 2060, FLOOR_TOP - 150, 190, 560),
    movingPlatform('l35_ferry', 1886, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 1950,
      to: 2180,
      speed: 120,
    }),
    pushBox('l35_box', 2360, FLOOR_TOP - 32),
    floorButton('l35_box_lock', 2660, 'l35_door', { width: 64 }),
    spikeTrap('l35_spikes', 2860, FLOOR_TOP - 16, 96),
    fireBar('l35_fire', 3100, FLOOR_TOP - 72, 2, 1.5, 0),
    fullHeightDoor('l35_door', 3380),
    goalOnFloor('l35_goal', 3920),
  ],
};
