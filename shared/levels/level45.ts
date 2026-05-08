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

const crewStack = platformRect(880, FLOOR_TOP - 344, 176);
const highBell = platformRect(1380, FLOOR_TOP - 344, 190);

export const LEVEL_45: LevelData = {
  id: 45,
  name: 'Wobble Citadel II',
  minPlayers: 4,
  mapWidth: 4600,
  solidRects: [
    groundSegment(0, 680),
    groundSegment(1040, 940),
    groundSegment(2420, 2180),
    crewStack,
    highBell,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l45_crew_lock', 380, 'l45_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    floorSpring('l45_spring', 500, 56),
    platformButton('l45_stack_key', crewStack, 'l45_door', { latching: true }),
    platformButton('l45_high_bell', highBell, 'l45_door', { latching: true }),
    vine('l45_vine', 2180, FLOOR_TOP - 150, 190, 560),
    movingPlatform('l45_ferry', 1986, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 2050,
      to: 2360,
      speed: 125,
    }),
    pushBox('l45_box_a', 2540, FLOOR_TOP - 32),
    pushBox('l45_box_b', 2680, FLOOR_TOP - 32),
    pushBox('l45_box_c', 2820, FLOOR_TOP - 32),
    floorButton('l45_box_lock_a', 3120, 'l45_door', { width: 64 }),
    floorButton('l45_box_lock_b', 3260, 'l45_door', { width: 64 }),
    floorButton('l45_box_lock_c', 3400, 'l45_door', { width: 64 }),
    crumblePlatform('l45_c1', 3560, FLOOR_TOP - 96, 96),
    crumblePlatform('l45_c2', 3700, FLOOR_TOP - 96, 96),
    spikeTrap('l45_spikes', 3880, FLOOR_TOP - 16, 96),
    fireBar('l45_fire', 4080, FLOOR_TOP - 72, 2, 1.55, 0),
    fullHeightDoor('l45_door', 4260),
    goalOnFloor('l45_goal', 4520),
  ],
};
