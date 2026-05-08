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

const crewStack = platformRect(840, FLOOR_TOP - 344, 176);

export const LEVEL_40: LevelData = {
  id: 40,
  name: 'Brigade Foundry',
  minPlayers: 4,
  mapWidth: 3800,
  solidRects: [
    groundSegment(0, 620),
    groundSegment(960, 940),
    groundSegment(2260, 1540),
    crewStack,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l40_crew_lock', 360, 'l40_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    platformButton('l40_stack_key', crewStack, 'l40_door', { latching: true }),
    vine('l40_vine', 760, FLOOR_TOP - 150, 190, 560),
    movingPlatform('l40_ferry', 1906, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 1970,
      to: 2200,
      speed: 120,
    }),
    pushBox('l40_box_a', 2380, FLOOR_TOP - 32),
    pushBox('l40_box_b', 2520, FLOOR_TOP - 32),
    floorButton('l40_box_lock_a', 2780, 'l40_door', { width: 64 }),
    floorButton('l40_box_lock_b', 2920, 'l40_door', { width: 64 }),
    spikeTrap('l40_spikes', 3120, FLOOR_TOP - 16, 96),
    fireBar('l40_fire', 3300, FLOOR_TOP - 72, 2, 1.5, 0),
    fullHeightDoor('l40_door', 3460),
    goalOnFloor('l40_goal', 3720),
  ],
};
