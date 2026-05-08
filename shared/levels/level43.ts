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
  pushBox,
  spikeTrap,
  standardSpawns,
} from './_helpers';

const crewStack = platformRect(720, FLOOR_TOP - 344, 176);

export const LEVEL_43: LevelData = {
  id: 43,
  name: 'Four Box Treasury',
  minPlayers: 4,
  mapWidth: 3600,
  solidRects: [groundRect(3600), crewStack],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l43_crew_lock', 400, 'l43_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    platformButton('l43_stack_key', crewStack, 'l43_door', { latching: true }),
    pushBox('l43_box_a', 1080, FLOOR_TOP - 32),
    pushBox('l43_box_b', 1220, FLOOR_TOP - 32),
    pushBox('l43_box_c', 1360, FLOOR_TOP - 32),
    pushBox('l43_box_d', 1500, FLOOR_TOP - 32),
    floorButton('l43_box_lock_a', 1860, 'l43_door', { width: 64 }),
    floorButton('l43_box_lock_b', 2000, 'l43_door', { width: 64 }),
    floorButton('l43_box_lock_c', 2140, 'l43_door', { width: 64 }),
    floorButton('l43_box_lock_d', 2280, 'l43_door', { width: 64 }),
    spikeTrap('l43_spikes', 2480, FLOOR_TOP - 16, 96),
    fireBar('l43_fire', 2700, FLOOR_TOP - 72, 2, 1.4, 0),
    fullHeightDoor('l43_door', 2960),
    goalOnFloor('l43_goal', 3520),
  ],
};
