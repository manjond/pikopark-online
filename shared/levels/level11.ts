import { LevelData } from '../level';
import {
  FLOOR_TOP,
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

export const LEVEL_11: LevelData = {
  id: 11,
  name: 'Crew Checkpoint',
  minPlayers: 4,
  mapWidth: 1900,
  solidRects: [
    groundRect(1900),
    platformRect(880, FLOOR_TOP - 128, 128),
    platformRect(1080, FLOOR_TOP - 128, 128),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l11_crew_lock', 450, 'l11_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    floorTrap('l11_lava_skip', 1000, 96),
    fullHeightDoor('l11_door', 1450),
    goalOnFloor('l11_goal', 1840),
  ],
};
