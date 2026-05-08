import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  pushBox,
  standardSpawns,
} from './_helpers';

export const LEVEL_13: LevelData = {
  id: 13,
  name: 'Cargo Council',
  minPlayers: 4,
  mapWidth: 2600,
  solidRects: [
    groundRect(2600),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l13_crew_lock', 900, 'l13_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    pushBox('l13_box_a', 320, FLOOR_TOP - 32),
    pushBox('l13_box_b', 450, FLOOR_TOP - 32),
    pushBox('l13_box_c', 580, FLOOR_TOP - 32),
    floorButton('l13_box_lock_a', 1200, 'l13_door', { width: 56 }),
    floorButton('l13_box_lock_b', 1320, 'l13_door', { width: 56 }),
    floorButton('l13_box_lock_c', 1440, 'l13_door', { width: 56 }),
    fireBar('l13_cargo_sweeper', 1640, FLOOR_TOP - 64, 2, -1.1, 90),
    fullHeightDoor('l13_door', 1820),
    goalOnFloor('l13_goal', 2520),
  ],
};
