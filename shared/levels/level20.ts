import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  floorSpring,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  platformButton,
  platformRect,
  pushBox,
  spikeTrap,
  standardSpawns,
} from './_helpers';

const highKey = platformRect(650, FLOOR_TOP - 368, 176);

export const LEVEL_20: LevelData = {
  id: 20,
  name: 'Gadget Yard',
  minPlayers: 1,
  mapWidth: 3000,
  solidRects: [
    groundSegment(0, 560),
    groundSegment(940, 2060),
    highKey,
    platformRect(1160, FLOOR_TOP - 128, 128),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorSpring('l20_spring', 430, 56),
    platformButton('l20_high_key', highKey, 'l20_door', { latching: true }),
    pushBox('l20_box', 1280, FLOOR_TOP - 32),
    floorButton('l20_box_lock', 1550, 'l20_door', { width: 64 }),
    spikeTrap('l20_spikes', 1780, FLOOR_TOP - 16, 96),
    fireBar('l20_sweeper', 1980, FLOOR_TOP - 72, 2, -1.35, 90),
    fullHeightDoor('l20_door', 2200),
    goalOnFloor('l20_goal', 2920),
  ],
};
