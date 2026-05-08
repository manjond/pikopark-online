import { LevelData } from '../level';
import {
  FLOOR_TOP,
  crumblePlatform,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  pushBox,
  spikeTrap,
  standardSpawns,
} from './_helpers';

export const LEVEL_22: LevelData = {
  id: 22,
  name: 'Crumble Cargo',
  minPlayers: 1,
  mapWidth: 2800,
  solidRects: [
    groundSegment(0, 520),
    groundSegment(900, 1900),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    crumblePlatform('l22_c1', 570, FLOOR_TOP - 96, 96),
    crumblePlatform('l22_c2', 700, FLOOR_TOP - 96, 96),
    pushBox('l22_box', 980, FLOOR_TOP - 32),
    floorButton('l22_box_lock', 1320, 'l22_door', { width: 64 }),
    spikeTrap('l22_spikes', 1520, FLOOR_TOP - 16, 96),
    floorButton('l22_latch', 1710, 'l22_door', { latching: true }),
    fullHeightDoor('l22_door', 1940),
    goalOnFloor('l22_goal', 2720),
  ],
};
