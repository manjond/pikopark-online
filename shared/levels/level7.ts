import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

export const LEVEL_7: LevelData = {
  id: 7,
  name: 'Double Press Foundry',
  minPlayers: 2,
  mapWidth: 1900,
  solidRects: [
    groundRect(1900),
    platformRect(850, FLOOR_TOP - 128, 128),
    platformRect(1030, FLOOR_TOP - 192, 128),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l7_pair_lock', 620, 'l7_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    floorTrap('l7_lava_skip', 1020, 96),
    fireBar('l7_overhead', 1220, FLOOR_TOP - 96, 2, -1.0, 20),
    fullHeightDoor('l7_door', 1400),
    goalOnFloor('l7_goal', 1830),
  ],
};
