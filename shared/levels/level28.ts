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

export const LEVEL_28: LevelData = {
  id: 28,
  name: 'Two Crates One Gate',
  minPlayers: 2,
  mapWidth: 2500,
  solidRects: [groundRect(2500)],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l28_pair_lock', 420, 'l28_door', {
      latching: true,
      requiredPlayers: 2,
      width: 112,
    }),
    pushBox('l28_box_a', 760, FLOOR_TOP - 32),
    pushBox('l28_box_b', 900, FLOOR_TOP - 32),
    floorButton('l28_box_lock_a', 1220, 'l28_door', { width: 64 }),
    floorButton('l28_box_lock_b', 1360, 'l28_door', { width: 64 }),
    spikeTrap('l28_spikes', 1540, FLOOR_TOP - 16, 96),
    fullHeightDoor('l28_door', 1740),
    goalOnFloor('l28_goal', 2420),
  ],
};
