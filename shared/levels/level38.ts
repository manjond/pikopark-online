import { LevelData } from '../level';
import {
  FLOOR_TOP,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  pushBox,
  spikeTrap,
  standardSpawns,
} from './_helpers';

export const LEVEL_38: LevelData = {
  id: 38,
  name: 'Box Brigade',
  minPlayers: 4,
  mapWidth: 3000,
  solidRects: [groundRect(3000)],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l38_crew_lock', 430, 'l38_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    pushBox('l38_box_a', 760, FLOOR_TOP - 32),
    pushBox('l38_box_b', 900, FLOOR_TOP - 32),
    pushBox('l38_box_c', 1040, FLOOR_TOP - 32),
    floorButton('l38_box_lock_a', 1360, 'l38_door', { width: 64 }),
    floorButton('l38_box_lock_b', 1500, 'l38_door', { width: 64 }),
    floorButton('l38_box_lock_c', 1640, 'l38_door', { width: 64 }),
    spikeTrap('l38_spikes', 1840, FLOOR_TOP - 16, 96),
    fullHeightDoor('l38_door', 2100),
    goalOnFloor('l38_goal', 2920),
  ],
};
